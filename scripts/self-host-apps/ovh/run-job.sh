#!/bin/bash
# Job name = dashboard identity and log name. Install as ubuntu; never run as root.
set -euo pipefail
export HOME=/home/ubuntu PATH=/usr/local/bin:/usr/bin:/bin
export GIT_TERMINAL_PROMPT=0 GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=15'
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DBUS_SESSION_BUS_ADDRESS="unix:path=$XDG_RUNTIME_DIR/bus"
export NODE_OPTIONS=--max-old-space-size=1536
umask 077
root=/srv/stack127-data/self-host-apps
checkout=/srv/stack127-self-host
job_env=/srv/stack127-data/self-host-apps.env
logs=/srv/stack127-data/logs

# Keep the start and the end of the output, so a late failure reason survives the
# cap. Drain everything so writers never get EPIPE and pipefail keeps the exit code.
# An optional second argument saves the full output to a report file.
# Together with setup/install caps, a run stays well below the dashboard's 250 KB tail.
bounded_output() {
  node -e '
    const fs = require("node:fs");
    const limit = Number(process.argv[1]), full = process.argv[2];
    const tailLimit = Math.min(16384, Math.floor(limit / 2));
    let headLeft = limit - tailLimit, tail = Buffer.alloc(0), dropped = 0, done = false;
    const fullFd = full ? fs.openSync(full, "a", 0o600) : null;
    process.stdin.on("data", chunk => {
      if (fullFd !== null) fs.writeSync(fullFd, chunk);
      if (headLeft > 0) {
        const part = chunk.subarray(0, headLeft);
        fs.writeSync(1, part);
        headLeft -= part.length;
        chunk = chunk.subarray(part.length);
      }
      if (!chunk.length) return;
      tail = Buffer.concat([tail, chunk]);
      if (tail.length > tailLimit) { dropped += tail.length - tailLimit; tail = tail.subarray(tail.length - tailLimit); }
    });
    const finish = () => {
      if (done) return;
      done = true;
      if (dropped) fs.writeSync(1, "\n[console output capped: " + dropped + " bytes omitted" + (full ? "; full output in " + full : "") + "]\n");
      fs.writeSync(1, tail);
    };
    process.stdin.on("end", finish);
    for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(signal, () => { finish(); process.exit(143); });
  ' "$1" "${2:-}"
}

steps() {
  cd "$checkout"
  # Every normal step stops the job on failure. Explicit rc collection preserves if: always().
  local rc=0
  case "$job" in
    self-host-discovery-github)
      for topic in self-hosted homelab local-ai home-automation ai-agent; do
        npm run self-host-apps:discover-github-topic -- --topic "$topic" --limit 100 --write
      done
      npm run self-host-apps:dedupe-candidates -- --limit 10000 ;;
    self-host-discovery-lists)
      npm run self-host-apps:discover-awesome-selfhosted -- --limit 5000 --write
      npm run self-host-apps:discover-selfhst -- --limit 5000 --write
      npm run self-host-apps:dedupe-candidates -- --limit 10000 ;;
    self-host-discovery-catalogs)
      npm run self-host-apps:discover-app-catalogs -- --catalog all --limit 5000 --docker-limit 500 --docker-page-size 100 --out "$report_dir/$run_id-catalog-discovery.json" --write || rc=$?
      npm run self-host-apps:dedupe-candidates -- --limit 30000 || rc=$? ;;
    self-host-discovery-directories)
      npm run self-host-apps:discover-selfhostedworld -- --limit 5000 --write
      npm run self-host-apps:discover-openalternative -- --limit 5000 --write
      npm run self-host-apps:dedupe-candidates -- --limit 20000 ;;
    self-host-refresh-github)
      npm run self-host-apps:refresh-github -- --published-only --batch-size 40 --limit 500 --max-age-hours 12 ;;
    self-host-refresh-source-hosts)
      npm run self-host-apps:refresh-gitlab -- --published-only --limit 500 --max-age-hours 24 || rc=$?
      npm run self-host-apps:refresh-codeberg -- --published-only --limit 500 --max-age-hours 24 || rc=$? ;;
    self-host-refresh-technical)
      npm run self-host-apps:refresh-primary-technical-facts -- --refresh-all --concurrency 16 --max-failure-percent 5 --out "$report_dir/$run_id-technical-refresh.json" || rc=$?
      # Deliberately dry-run (default); never add --apply here.
      npm run self-host-apps:refresh-install-options -- --limit 5000 --out "$report_dir/$run_id-install-options.json" || rc=$?
      npm run self-host-apps:qa-gate -- --limit 5000 --out "$report_dir/$run_id-technical-qa-gate.json" || rc=$? ;;
  esac
  return "$rc"
}

# This checkout belongs only to this automation. A journal permits repair only of
# an interrupted update; ordinary dirty files and unpublished commits still fail.
update_checkout() {
  local journal="$root/update-in-progress" base target lock lock_count=0 git_rc=0
  local git_dir
  git_dir=$(git rev-parse --absolute-git-dir)
  local locks=()
  while IFS= read -r -d '' lock; do locks+=("$lock"); lock_count=$((lock_count + 1)); done < <(find "$git_dir" -type f -name '*.lock' -print0)
  if [[ -f "$journal" || "$lock_count" -gt 0 ]]; then
    # All our Git children inherit the checkout flock. Also refuse recovery while
    # any Git owned by this user is alive, including a manual Git command.
    pgrep -u "$(id -u)" -x git >/dev/null || git_rc=$?
    if [[ "$git_rc" != 1 ]]; then
      echo 'ERROR: Git is still running or its process list is unavailable; refusing checkout recovery'
      return 1
    fi
    target=$(git rev-parse HEAD)
    if [[ -f "$journal" ]]; then
      read -r base target < "$journal"
      # Older supervisors recorded only the base. New journals record both the
      # base and target before merge can create paths absent from the base.
      target=${target:-$base}
      [[ "$base" =~ ^[0-9a-f]{40,64}$ && "$target" =~ ^[0-9a-f]{40,64}$ ]] &&
        git cat-file -e "$target^{commit}" && git merge-base --is-ancestor "$base" "$target" || {
        echo 'ERROR: invalid checkout recovery journal'; return 1;
      }
    fi
    echo "RECOVERY: interrupted checkout update; completing tracked files at $target"
    if [[ "$lock_count" -gt 0 ]]; then
      for lock in "${locks[@]}"; do
        echo "RECOVERY: removing stale Git lock ${lock#"$git_dir/"}"
        rm -- "$lock"
      done
    fi
    # Log names/status only, never file contents or credentials. Like any hard
    # reset, this may overwrite untracked files in the way of tracked paths.
    git status --short --untracked-files=normal
    git reset --hard "$target"
    [[ -z "$(git status --porcelain --untracked-files=normal)" ]] || {
      echo 'ERROR: checkout recovery left local files; journal retained for operator review'; return 1;
    }
    rm -f "$journal"
  fi
  [[ -z "$(git status --porcelain --untracked-files=normal)" ]] || {
    echo 'ERROR: self-host checkout is dirty without an interrupted update; refusing to reset local edits'; return 1;
  }
  base=$(git rev-parse HEAD)
  printf '%s %s\n' "$base" "$base" > "$journal.tmp"
  mv "$journal.tmp" "$journal"
  git -c http.lowSpeedLimit=1024 -c http.lowSpeedTime=30 fetch --no-tags origin main
  # Refuse unpublished history instead of discarding it during recovery.
  if ! git merge-base --is-ancestor HEAD origin/main; then
    rm -f "$journal"
    echo 'ERROR: self-host checkout is ahead of or diverged from main'
    return 1
  fi
  target=$(git rev-parse origin/main)
  printf '%s %s\n' "$base" "$target" > "$journal.tmp"
  mv "$journal.tmp" "$journal"
  git merge --ff-only "$target"
  [[ "$(git rev-parse HEAD)" = "$target" && -z "$(git status --porcelain --untracked-files=normal)" ]] || {
    echo 'ERROR: self-host checkout did not reach main'; return 1;
  }
  rm -f "$journal"
  echo "revision $(git rev-parse HEAD)"
}

check_due() {
  # Only updated code decides what is due. A broken module is repaired by the
  # next fetch, before it can stop the next due check.
  node --input-type=module - "$job" "$root/state/$job.success" "$checkout/scripts/self-host-apps/ovh/due.mjs" <<'JS'
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [job, state, modulePath] = process.argv.slice(2);
const { scheduledAt } = await import(pathToFileURL(modulePath));
let last = 0;
try { last = Number(readFileSync(state, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
process.exit(last >= scheduledAt(job) ? 3 : 0);
JS
}

# Buffer checkout/due-check output until actual work begins. A no-op discards
# it; failures flush it with failure markers. Job output streams live after this.
begin_job_log() {
  : > "$pending_log.started"
  echo "== $(date -u +%FT%TZ) start $job" >> "$log_file"
  bounded_output 32768 < "$pending_log" >> "$log_file"
  printf '\n' >> "$log_file"
  exec >> "$log_file" 2>&1
}

finish_run() {
  local rc=$1
  trap - EXIT
  set +e
  exec >> "$log_file" 2>&1
  if [[ -n "$pending_log" && -f "$pending_log.started" ]]; then
    printf '\n== %s end %s exit %s\n' "$(date -u +%FT%TZ)" "$job" "$rc"
  elif [[ "$rc" != 0 && "$rc" != 76 ]]; then
    echo "== $outer_started start $job"
    [[ -z "$pending_log" ]] || bounded_output 32768 < "$pending_log"
    echo "ERROR: $job failed before job steps (exit $rc); see preceding error"
    printf '\n== %s end %s exit %s\n' "$(date -u +%FT%TZ)" "$job" "$rc"
  fi
  if [[ -n "$pending_log" ]]; then rm -f "$pending_log" "$pending_log.started" "$pending_log.locked" "$pending_log.waiting"; fi
  exit "$rc"
}

catch_up() {
  # Fetch/repair first, then check the stable supervisor. Drift must never stop
  # normal data jobs or prevent a later fetch from bringing a repair.
  if ! cmp -s "$self" "$checkout/scripts/self-host-apps/ovh/run-job.sh"; then
    echo 'ERROR: installed self-host supervisor differs from the checkout; perform the reviewed atomic reinstall in scripts/self-host-apps/ovh/README.md'
    return 1
  fi
  # Child wrappers take their own shared lock. Do not inherit ours and deadlock.
  exec 8>&-
  local next next_rc rc=0
  for next in self-host-discovery-github self-host-refresh-github self-host-discovery-lists self-host-discovery-catalogs self-host-discovery-directories self-host-refresh-source-hosts self-host-refresh-technical; do
    local args=("$next" --due --catch-up)
    [[ "$validation" = 0 ]] || args+=(--validation "$checkout")
    next_rc=0
    /bin/bash "$self" "${args[@]}" || next_rc=$?
    if [[ "$next_rc" = 76 ]]; then
      echo "Skipped $next: job or checkout lock busy; retry next hour"
      [[ "$rc" != 0 ]] || rc=76
    elif [[ "$next_rc" != 0 ]]; then
      echo "ERROR: catch-up $next failed (exit $next_rc); see $logs/$next.log"
      rc=1
    fi
  done
  return "$rc"
}

execute() {
  # One shared lock covers update AND execution, so another job cannot change imported code
  # or node_modules mid-run. The outer timeout bounds the lock wait as well.
  exec 8>"$root/checkout.lock"
  if [[ -n "${pending_log:-}" ]]; then : > "$pending_log.waiting"; fi
  if [[ "$job" = self-host-catch-up || "$catchup_child" = 1 ]]; then
    flock -w 30 -E 76 8 || { echo 'Checkout lock busy; retry next hour'; return 76; }
  else
    # Leave time for the skip to reach the outer supervisor before its deadline.
    flock -w "$((minutes * 60 - 10))" -E 76 8 || {
      begin_job_log
      echo "Skipped: checkout lock busy; no job steps started; retry next schedule"
      return 76
    }
  fi
  if [[ -n "${pending_log:-}" ]]; then : > "$pending_log.locked"; fi
  cd "$checkout"
  if [[ "$validation" = 0 ]]; then
    # Capped like other output, so a verbose merge or recovery cannot push this
    # run's start marker out of the dashboard's log tail (catch-up logs live).
    update_checkout 2>&1 | bounded_output 32768
  else
    echo "VALIDATION: working-tree code in $checkout; main update disabled for this manual run"
  fi
  if [[ "$job" = self-host-catch-up ]]; then catch_up; return; fi
  if [[ "$due" = 1 ]]; then
    local due_rc=0
    check_due || due_rc=$?
    if [[ "$due_rc" = 3 ]]; then return 0; fi
    [[ "$due_rc" = 0 ]] || { echo 'ERROR: due check failed'; exit "$due_rc"; }
  fi
  begin_job_log
  if [[ "$validation" = 0 ]]; then
    local fingerprint
    fingerprint=$(sha256sum package-lock.json | cut -d' ' -f1)
    if [[ ! -d node_modules || ! -f "$root/dependencies.sha256" || "$(cat "$root/dependencies.sha256")" != "$fingerprint" ]]; then
      rm -f "$root/dependencies.sha256"
      npm ci --no-audit --no-fund 2>&1 | bounded_output 32768
      printf '%s\n' "$fingerprint" > "$root/dependencies.sha256.tmp"
      mv "$root/dependencies.sha256.tmp" "$root/dependencies.sha256"
    fi
  fi
  [[ -f "$job_env" && ! -L "$job_env" && "$(stat -c '%a' "$job_env")" = 600 && "$(stat -c '%u' "$job_env")" = "$(id -u)" ]] || {
    echo 'ERROR: self-host env must exist, belong to the job user, and have mode 600'; exit 1;
  }
  # Use Node's dotenv parser; never evaluate secret values as shell code.
  export GITHUB_STEP_SUMMARY="$report_dir/$run_id-summary.md"
  unset DATABASE_URL GITHUB_TOKEN GITLAB_TOKEN CODEBERG_TOKEN
  local started
  started=$(date +%s%3N)
  # Run the updated step definitions. Syntax/launcher failures reach the stable
  # supervisor's log and EXIT trap; they cannot prevent the next checkout update.
  node --env-file="$job_env" scripts/self-host-apps/ovh/validate-env.mjs "$job" "$checkout/scripts/self-host-apps/ovh/run-job.sh" "$checkout" "$run_id" 2>&1 | bounded_output 131072 "$report_dir/$run_id-console.log"
  printf '%s\n' "$started" > "$root/state/$job.success.tmp"
  mv "$root/state/$job.success.tmp" "$root/state/$job.success"
}

main() {
  local phase=outer due=0 validation=0 catchup_child=0 pending_log= outer_started
  if [[ "${1:-}" = --execute || "${1:-}" = --steps ]]; then phase=${1#--}; shift; fi
  job=${1:-}; shift || true
  local minutes
  case "$job" in
    self-host-discovery-github|self-host-discovery-lists|self-host-refresh-github) minutes=20 ;;
    self-host-discovery-catalogs) minutes=45 ;;
    self-host-discovery-directories|self-host-refresh-source-hosts) minutes=30 ;;
    self-host-refresh-technical) minutes=60 ;;
    # Sum of the seven data-job limits is 225 minutes, plus bounded lock waits.
    self-host-catch-up) minutes=240 ;;
    *) echo 'Usage: run-job.sh self-host-{discovery-{github,lists,catalogs,directories},refresh-{github,source-hosts,technical},catch-up} [--due | --validation CHECKOUT]' >&2; exit 2 ;;
  esac
  log_file="$logs/$job.log"
  if [[ "$phase" = outer ]]; then
    # Cron also redirects stderr here, covering a damaged installed script before
    # Bash can reach this trap. Install this supervisor outside the Git checkout.
    mkdir -p "$logs"
    exec >>"$log_file" 2>&1
    outer_started=$(date -u +%FT%TZ)
    trap 'finish_run "$?"' EXIT
    trap 'exit 143' TERM
    trap 'exit 130' INT
    # Serialize argument/setup failures too; hold until finish_run's final marker.
    mkdir -p "$root"
    exec 9>"$root/$job.lock"
    flock -n -E 76 9 || exit 76
  fi
  self=$(realpath "$0")
  if [[ "$phase" = steps ]]; then
    checkout=$1; run_id=$2
  else
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --due) due=1; shift ;;
        --catch-up) catchup_child=1; shift ;;
        --pending-log) pending_log=$2; shift 2 ;;
        --validation) checkout=$(realpath "$2"); validation=1; shift 2 ;;
        --run-id) run_id=$2; shift 2 ;;
        *) echo "Unknown argument: $1" >&2; exit 2 ;;
      esac
    done
  fi
  report_dir="$root/reports/$job"
  if [[ "$phase" = steps ]]; then steps; return; fi
  mkdir -p "$report_dir" "$root/state" "$logs"
  run_id=${run_id:-$(date -u +%Y-%m-%dT%H-%M-%SZ)-$$}
  if [[ "$phase" = execute ]]; then execute; return; fi
  pending_log=$(mktemp "$report_dir/.pending-log-XXXXXX")
  exec >> "$pending_log" 2>&1
  if [[ "$job" = self-host-catch-up ]]; then begin_job_log; fi
  # 16 GB virtual address space (V8 reserves about 10 GB); real V8 heap capped at 1.5 GB.
  # A transient resource scope caps the whole process tree at 2 GB and one CPU.
  # Cron owns the schedule; no systemd timer or persistent service is installed.
  ulimit -v 16777216
  ulimit -c 0
  local args=(--execute "$job" --run-id "$run_id" --pending-log "$pending_log") rc=0
  [[ "$due" = 0 ]] || args+=(--due)
  [[ "$catchup_child" = 0 ]] || args+=(--catch-up)
  [[ "$validation" = 0 ]] || args+=(--validation "$checkout")
  nice -n 10 timeout --signal=TERM --kill-after=30s "${minutes}m" systemd-run --user --scope --quiet -p MemoryMax=2G -p MemorySwapMax=0 -p CPUQuota=100% -p RuntimeMaxSec="${minutes}min" /bin/bash "$self" "${args[@]}" || rc=$?
  if [[ "$rc" = 124 && -f "$pending_log.waiting" && ! -f "$pending_log.locked" ]]; then
    rc=76
    [[ -f "$pending_log.started" ]] || begin_job_log
    echo 'Skipped: checkout lock wait reached the run deadline; no job steps started'
  fi
  if [[ -f "$pending_log.started" ]]; then exec >> "$log_file" 2>&1; fi
  if [[ "$rc" = 76 ]]; then
    echo 'Job or checkout lock busy; retry next schedule'
  elif [[ "$rc" != 0 ]]; then
    echo "ERROR: $job failed (exit $rc); see preceding step or update error"
  fi
  find "$report_dir" -type f -mtime +60 -delete
  exit "$rc"
}
if [[ "${BASH_SOURCE[0]}" = "$0" ]]; then main "$@"; fi

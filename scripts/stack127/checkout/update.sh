#!/bin/bash
# Install outside Git as /srv/stack127-data/checkout/run-job.sh
set -euo pipefail

skip() { echo "SKIPPED: $*; retry next hour"; return 76; }

# A 10-minute timeout plus 30 seconds to kill children must finish before :40.
# Even a start at :28:59 leaves 30 seconds of margin. Override in scratch tests.
utc_minute() { date -u +%M; }
check_window() {
  local minute
  minute=$(utc_minute)
  [[ "$minute" =~ ^[0-5][0-9]$ ]] || { echo 'ERROR: cannot read UTC minute'; return 1; }
  (( 10#$minute >= 15 && 10#$minute <= 28 )) || {
    skip "outside safe start window (UTC minutes 15–28; now :$minute)"; return 76;
  }
}

check_idle() {
  [[ ! -e "$hold" ]] || { skip "checkout hold exists: $hold"; return 76; }
  local marker pid cwd entry
  for marker in "$lock_tmp"/adn-pending-*; do
    [[ -f "$marker" ]] || continue
    IFS= read -r pid < "$marker" || continue
    [[ "$pid" =~ ^[1-9][0-9]*$ ]] || continue
    if kill -0 "$pid" 2>/dev/null; then skip "ad-network retry wrapper $pid is alive"; return 76; fi
  done
  # Reading /proc does not require sudo for ubuntu-owned jobs. Ignore processes
  # that disappear mid-scan and other users' unreadable cwd links.
  [[ -d "$proc_root/self" ]] || { echo 'ERROR: /proc is unavailable'; return 1; }
  for entry in "$proc_root"/[0-9]*/cwd; do
    cwd=$(readlink "$entry" 2>/dev/null) || continue
    case "$cwd" in "$checkout"|"$checkout"/*)
      skip "process ${entry%/cwd} has its cwd in the checkout"; return 76 ;;
    esac
  done
}

lock_jobs() {
  local lock fd=100 name
  local locks=("$data/launch-directory-metrics.lock" "$data/cache-worker.lock")
  # Include future existing ad-network locks as well as every current job, even
  # on a new install before its first run has created the lock file.
  for name in verification snapshot platform domain-age ads-txt-summary discovery publisher-names traffic backup; do
    locks+=("$lock_tmp/adn-$name.lock")
  done
  for lock in "$lock_tmp"/adn-*.lock; do [[ ! -e "$lock" ]] || locks+=("$lock"); done
  while IFS= read -r lock; do
    eval "exec $fd>\"\$lock\""
    flock -n -E 76 "$fd" || { skip "job lock busy: $lock"; return 76; }
    fd=$((fd + 1))
  done < <(printf '%s\n' "${locks[@]}" | sort -u)
  # Locks stay open across Git AND npm. New cron jobs cannot start data steps;
  # the worker's existing persistent lock works even with systemd PrivateTmp.
}

# os.rename fails across filesystems instead of silently copying a live tree.
rename_tree() {
  [[ ! -e "$2" && ! -L "$2" ]] || { echo "ERROR: rename destination exists: $2"; return 1; }
  python3 -c 'import os,sys; os.rename(sys.argv[1], sys.argv[2])' "$1" "$2"
}

prepare_dependencies() {
  local target=$1 force=${2:-} hash installed=''
  rm -rf -- "$root/staging"
  mkdir -p "$root/staging/new"
  git show "$target:package.json" > "$root/staging/new/package.json"
  git show "$target:package-lock.json" > "$root/staging/new/package-lock.json"
  hash=$(sha256sum "$root/staging/new/package-lock.json"); hash=${hash%% *}
  if [[ -f "$root/dependencies.sha256" ]]; then
    read -r installed < "$root/dependencies.sha256"
    cp "$root/dependencies.sha256" "$root/staging/base-dependencies.sha256"
  fi
  [[ -d "$checkout/node_modules" ]] || : > "$root/staging/no-base-node-modules"
  if [[ "$hash" != "$installed" || ! -d "$checkout/node_modules" || "$force" = force ]]; then
    # Nothing in the live checkout (including its success marker) changes here.
    (cd "$root/staging/new" && npm ci --omit=dev --ignore-scripts --no-audit --no-fund)
    # npm's .bin links are relative. Reject local/link dependencies and any link
    # escaping node_modules: those cannot safely move with the installed tree.
    python3 - "$root/staging/new/node_modules" "$checkout" <<'PYTHON'
import os, sys
from pathlib import Path
modules = Path(sys.argv[1])
if not modules.is_dir() or modules.is_symlink():
    sys.exit("ERROR: staging did not create a real node_modules directory")
if modules.stat().st_dev != os.stat(sys.argv[2]).st_dev:
    sys.exit("ERROR: staging and checkout must share a filesystem for atomic renames")
for directory, dirs, files in os.walk(modules):
    for name in dirs + files:
        entry = Path(directory) / name
        if entry.lstat().st_uid != os.getuid():
            sys.exit("ERROR: staged dependencies must belong to the job user")
        if entry.is_symlink():
            target = os.readlink(entry)
            if os.path.isabs(target) or not entry.resolve().is_relative_to(modules.resolve()):
                sys.exit("ERROR: staged dependency link cannot be relocated: " + str(entry))
PYTHON
    printf '%s\n' "$hash" > "$root/staging/target-dependencies.sha256"
  fi
}

swap_dependencies() {
  [[ -f "$root/staging/target-dependencies.sha256" ]] || return 0
  if [[ -e "$checkout/node_modules" || -L "$checkout/node_modules" ]]; then
    rename_tree "$checkout/node_modules" "$root/staging/old-node_modules"
  fi
  rename_tree "$root/staging/new/node_modules" "$checkout/node_modules"
  # Commit the dependency marker only after the new directory is in place.
  cp "$root/staging/target-dependencies.sha256" "$root/dependencies.sha256.tmp"
  mv "$root/dependencies.sha256.tmp" "$root/dependencies.sha256"
}

restore_dependencies() {
  [[ -f "$root/staging/target-dependencies.sha256" ]] || return 0
  # Move the new tree back before restoring the old one. Repeating recovery
  # after another hard kill is safe at every rename boundary.
  if [[ -d "$root/staging/old-node_modules" || -L "$root/staging/old-node_modules" ]]; then
    if [[ -e "$checkout/node_modules" || -L "$checkout/node_modules" ]]; then
      rename_tree "$checkout/node_modules" "$root/staging/new/node_modules"
    fi
    rename_tree "$root/staging/old-node_modules" "$checkout/node_modules"
  elif [[ -f "$root/staging/no-base-node-modules" && ! -d "$root/staging/new/node_modules" ]]; then
    rename_tree "$checkout/node_modules" "$root/staging/new/node_modules"
  fi
  if [[ -f "$root/staging/base-dependencies.sha256" ]]; then
    cp "$root/staging/base-dependencies.sha256" "$root/dependencies.sha256.tmp"
    mv "$root/dependencies.sha256.tmp" "$root/dependencies.sha256"
  else
    rm -f "$root/dependencies.sha256"
  fi
}

recover_update() {
  local journal="$root/update-in-progress" phase base target current git_dir lock relative git_rc=0
  local owned_locks=()
  [[ -f "$journal" ]] || return 0
  # Children inherit the OS locks. Refuse recovery while manual Git runs.
  if [[ "${1:-}" != owned ]]; then
    pgrep -u "$(id -u)" -x git >/dev/null || git_rc=$?
    [[ "$git_rc" = 1 ]] || { echo 'ERROR: Git still running or process list unavailable; refusing recovery'; return 1; }
  fi
  read -r phase base target < "$journal"
  # Accept journals from the original merge-only supervisor too.
  if [[ "$phase" =~ ^[0-9a-f]{40,64}$ ]]; then target=$base; base=$phase; phase=merge; fi
  [[ "$base" =~ ^[0-9a-f]{40,64}$ && "$target" =~ ^[0-9a-f]{40,64}$ ]] &&
    git cat-file -e "$base^{commit}" && git cat-file -e "$target^{commit}" &&
    git merge-base --is-ancestor "$base" "$target" || { echo 'ERROR: invalid update journal'; return 1; }
  current=$(git rev-parse HEAD)
  git_dir=$(git rev-parse --absolute-git-dir)
  case "$phase" in
    fetch)
      [[ "$base" = "$target" && "$current" = "$base" ]] || { echo 'ERROR: HEAD changed outside interrupted fetch; refusing recovery'; return 1; }
      owned_locks=(refs/remotes/origin/main.lock)
      ;;
    apply|merge)
      [[ "$current" = "$base" || "$current" = "$target" ]] || { echo 'ERROR: HEAD changed outside interrupted update; refusing recovery'; return 1; }
      owned_locks=(index.lock HEAD.lock ORIG_HEAD.lock refs/heads/main.lock)
      ;;
    *) echo 'ERROR: invalid update journal phase'; return 1 ;;
  esac
  # Check every lock before deleting any. Never remove unrelated Git locks.
  while IFS= read -r -d '' lock; do
    relative=${lock#"$git_dir/"}
    case " ${owned_locks[*]} " in
      *" $relative "*) ;;
      *) echo "ERROR: Git lock outside journaled $phase phase: $relative; inspect manually"; return 1 ;;
    esac
  done < <(find "$git_dir" -type f -name '*.lock' -print0)
  for relative in "${owned_locks[@]}"; do
    lock="$git_dir/$relative"
    if [[ -f "$lock" ]]; then
      echo "RECOVERY: removing stale Git lock $relative"
      rm -- "$lock"
    fi
  done
  case "$phase" in
    apply)
      [[ -d "$root/staging/new" ]] || { echo 'ERROR: update staging missing; journal retained for review'; return 1; }
      echo "RECOVERY: rolling back interrupted update to $base"
      # An interrupted checkout may have created target paths before moving
      # HEAD. Put those paths in the index first so resetting base removes them.
      git reset --mixed "$target"
      git reset --hard "$base"
      restore_dependencies
      ;;
    merge)
      # Old supervisors could leave the target with incomplete dependencies.
      # Rebuild in staging before completing their legacy merge journal.
      echo "RECOVERY: completing interrupted fast-forward to $target"
      prepare_dependencies "$target" force
      git reset --hard "$target"
      swap_dependencies
      ;;
    fetch) echo 'RECOVERY: interrupted fetch; working tree preserved' ;;
  esac
  if [[ "$phase" != fetch ]]; then
    [[ -z "$(git status --porcelain --untracked-files=normal)" ]] || { echo 'ERROR: recovery left local files; journal retained for review'; return 1; }
  fi
  rm "$journal"
}

update_checkout() {
  cd "$checkout"
  [[ "$(git symbolic-ref -q HEAD)" = refs/heads/main ]] || { echo 'ERROR: checkout must be on main'; return 1; }
  local journal="$root/update-in-progress" base target git_dir
  recover_update
  [[ -z "$(git status --porcelain --untracked-files=normal)" ]] || { echo 'ERROR: checkout is dirty; refusing to change local files'; return 1; }
  git_dir=$(git rev-parse --absolute-git-dir)
  # Unjournaled Git locks could belong to an operator. Never remove them.
  [[ -z "$(find "$git_dir" -type f -name '*.lock' -print -quit)" ]] || { echo 'ERROR: unjournaled Git lock; inspect manually'; return 1; }
  base=$(git rev-parse HEAD)
  printf 'fetch %s %s\n' "$base" "$base" > "$journal.tmp"
  transaction_active=true
  mv "$journal.tmp" "$journal"
  git -c http.lowSpeedLimit=1024 -c http.lowSpeedTime=30 fetch --no-tags --no-prune --no-write-fetch-head --no-auto-maintenance origin refs/heads/main:refs/remotes/origin/main
  rm "$journal"
  git merge-base --is-ancestor HEAD origin/main || { echo 'ERROR: checkout has local commits or cannot fast-forward; nothing merged'; return 1; }
  target=$(git rev-parse origin/main)
  prepare_dependencies "$target"
  printf 'apply %s %s\n' "$base" "$target" > "$journal.tmp"
  mv "$journal.tmp" "$journal"
  if [[ "$base" != "$target" ]]; then git merge --ff-only "$target"; fi
  [[ "$(git rev-parse HEAD)" = "$target" && -z "$(git status --porcelain --untracked-files=normal)" ]] || { echo 'ERROR: checkout did not reach main'; return 1; }
  swap_dependencies
  # Removing the journal commits the code + dependency pair. Keep backups until
  # this point; even failure writing the marker rolls back in this same run.
  rm "$journal"
  rm -rf -- "$root/staging"
  echo "revision $target"
}

finish_update() {
  local rc=$1 recovery_rc
  trap - EXIT
  trap '' TERM INT
  if [[ "$transaction_active" = true && -f "$root/update-in-progress" ]]; then
    echo "ERROR: update failed (exit $rc); recovering before releasing job locks"
    set +e
    # Use a fresh errexit context: testing a shell function with `if` or `||`
    # disables errexit inside it and could otherwise hide a failed rollback.
    # Our synchronous Git child has exited; unrelated Git processes cannot
    # block same-run rollback. Startup recovery still checks for live Git.
    (set -e; recover_update owned)
    recovery_rc=$?
    if [[ "$recovery_rc" != 0 ]]; then
      echo 'ERROR: recovery failed; journal retained and job guards will refuse work'
      rc=1
    fi
  fi
  exit "$rc"
}

execute() (
  # The exit trap runs before this subshell releases any inherited job locks.
  # TERM/INT and ordinary command failures recover here; SIGKILL keeps a journal.
  transaction_active=false
  trap 'finish_update $?' EXIT
  trap 'exit 143' TERM
  trap 'exit 130' INT
  cd / # The updater must not count its own cwd as an active checkout user.
  check_window
  check_idle
  lock_jobs
  check_idle
  check_window
  update_checkout
  # Fetching still works on drift, so the next reviewed main can bring a repair.
  cmp -s "$self" "$checkout/scripts/stack127/checkout/update.sh" || {
    echo 'ERROR: installed checkout updater differs from main; perform reviewed atomic reinstall in scripts/stack127/checkout/README.md'; return 1;
  }
)

bounded_output() {
  # Do not use Node while npm ci can replace its dependencies. Keep head + tail,
  # drain the pipe, and leave the producer exit code to pipefail.
  python3 -c '
import sys
head_left = 49152
tail = b""
dropped = 0
while True:
    chunk = sys.stdin.buffer.read(8192)
    if not chunk: break
    part, chunk = chunk[:head_left], chunk[head_left:]
    sys.stdout.buffer.write(part)
    sys.stdout.buffer.flush()
    head_left -= len(part)
    tail += chunk
    if len(tail) > 16384:
        dropped += len(tail) - 16384
        tail = tail[-16384:]
if dropped: sys.stdout.buffer.write(("\n[output capped: %s bytes omitted]\n" % dropped).encode())
sys.stdout.buffer.write(tail)
'
}

main() {
  export HOME=/home/ubuntu PATH=/usr/local/bin:/usr/bin:/bin
  export GIT_TERMINAL_PROMPT=0 GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=15'
  export NODE_OPTIONS=--max-old-space-size=1024
  umask 077
  checkout=/srv/stack127
  data=/srv/stack127-data
  root="$data/checkout"
  hold="$data/state/checkout-hold"
  lock_tmp=/tmp
  proc_root=/proc
  self=$(realpath "$0")
  cd / # Keep the supervisor and timeout out of the checkout cwd scan too.
  [[ "${1:-}" != --execute ]] || { execute; return; }
  local job=stack127-checkout-update rc=0
  mkdir -p "$root" "$data/logs"
  exec >>"$data/logs/$job.log" 2>&1
  exec 9>"$root/updater.lock"
  # Overlap stays silent so it cannot interleave another run's markers.
  flock -n -E 76 9 || return 76
  echo "== $(date -u +%FT%TZ) start $job"
  trap 'rc=$?; trap - EXIT; echo "== $(date -u +%FT%TZ) end stack127-checkout-update exit $rc"; exit "$rc"' EXIT
  trap 'exit 143' TERM
  trap 'exit 130' INT
  [[ $# = 1 && "$1" = "$job" ]] || { echo "Usage: run-job.sh $job"; return 2; }
  # Whole process group is bounded, including Git, npm and inherited job locks.
  # Low CPU priority and a V8 heap cap keep this small job below data collectors.
  ulimit -c 0
  timeout --kill-after=30s 10m nice -n 15 /bin/bash "$self" --execute 2>&1 | bounded_output || rc=$?
  return "$rc"
}

# Source functions in scratch-repository tests without invoking production paths.
if [[ "${BASH_SOURCE[0]}" = "$0" ]]; then main "$@"; fi

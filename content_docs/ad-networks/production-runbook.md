# Ad-network production cutover

Coordinator commands only, after Sol review and release authorization. OVH activation uses GitHub Actions and the authenticated Dokploy API. The seed and status use private Supabase Storage. No OVH shell, SSH identity, Tailscale connection, dashboard edits, or manual sync is needed. All ad-network pages remain unpublished. No history backfill runs.

## 1. Add the one missing GitHub secret

The owner adds **`GITHUB_ALERT_TOKEN`** to the repository's protected **production** environment, using the existing issue-alert token from homelab `.env.deploy`. Do not paste it into chat or commit it.

Read-only name checks on October 18 found the other credentials already present: repository secret `DATABASE_POOLER_URL`; production secrets `DOKPLOY_API_KEY`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, `GHCR_DOKPLOY_TOKEN`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`; production variable `GHCR_DOKPLOY_USERNAME`. The runtime selects session port 5432 when the existing production URL uses the Supabase shared transaction pooler on 6543. Host, user, password and project stay the same; no credential change is needed. Neither an SSH key nor a new API key is required.

## 2. Merge and complete the existing site release

From the coordinator checkout, push only the reviewed commits, then follow the [release instructions](../../skills/stack127/stack127-release-e2e/SKILL.md):

```bash
git push origin chore/check-handoff-file
gh pr checks 53 --repo stack127labs/stack127 --watch
gh pr merge 53 --repo stack127labs/stack127 --merge
RELEASE_SHA="$(gh api repos/stack127labs/stack127/commits/main --jq .sha)"
gh run list --repo stack127labs/stack127 --workflow stack127-release-e2e.yml --commit "$RELEASE_SHA" --limit 1
# Use that release run's ID:
gh run watch RELEASE_RUN_ID --repo stack127labs/stack127 --exit-status
```

Require the merge/main/backend/live health SHAs to agree. In Cloudflare mode, `/frontend-release.json` must agree too. The release workflow applies the ten migrations. Do not dispatch page publication.

## 3. Prepare homelab and upload the consistent seed

Fast-forward the existing homelab checkout only if it has no tracked changes. This leaves the SQLite store and the already-running RDAP/gather processes in place. The old installed homelab backup service/timer must remain until both original processes finish: their loaded code still invokes it.

```bash
ssh homelab 'cd /srv/data/projects/stack127 && git diff --quiet && git diff --cached --quiet && git fetch origin main && git merge --ff-only origin/main'
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/check-activation.mjs --environment production'
# Expect migrations_applied:10, networks:44, published_pages:0.
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/handoff.mjs --kind seed --environment production --confirm stack127-production --apply'
```

The uploader uses the existing homelab `.env.database` Storage URL/server key. It creates the private bucket `stack127-ad-networks-jobs` if absent, takes an online `snapshot-local.mjs` snapshot, runs `quick_check`, compresses it and uploads immutable 4 MiB chunks with SHA-256 checksums. It publishes `handoff/seed.json` last. It never copies an open SQLite main file alone, stops RDAP, or changes the live source. Keep the source and its existing backups.

If the homelab checkout cannot fast-forward, preserve its changes and resolve them before continuing. No new checkout or machine is needed.

## 4. Activate every OVH schedule in one dispatch

```bash
JOBS='snapshot,platform,domain-age,ads-txt-summary,discovery,publisher-names,traffic,backup,verification,rdap-import'
gh workflow run ad-networks-runtime.yml --repo stack127labs/stack127 --ref main \
  -f confirm=stack127-production -f release_sha="$RELEASE_SHA" -f enabled_jobs="$JOBS"
gh run list --repo stack127labs/stack127 --workflow ad-networks-runtime.yml --limit 1
# Use that activation run's ID:
gh run watch ACTIVATION_RUN_ID --repo stack127labs/stack127 --exit-status
```

The protected workflow first checks the exact released SHA, the private seed, all ten migrations, the reviewed catalog, and zero published ad-network pages. Through Dokploy's read APIs it measures host CPU count, available RAM, free disk and one-minute load. It requires at least **2 CPUs, 2 GiB available RAM, free disk ≥ max(15 GiB, ten seed sizes + 3 GiB), and load < CPU count − 0.5**. Measurements must be fresh. Capacity numbers appear in the Actions log. They have not been measured in this implementation round because the authenticated credentials are available only inside GitHub Actions.

A missing API endpoint, permission, measurement, or failed gate stops activation before any service mutation. The installed Dokploy must expose `docker.getServerHealth`, `docker.getContainers`, and `docker.readContainerFile`; load and available RAM are read from `/proc` through the existing website container. No file is written there. See the [official API definitions](https://github.com/Dokploy/dokploy/blob/canary/apps/dokploy/server/api/routers/docker.ts). The separate emergency pause job bypasses these checks and can stop an existing service while they are failing. Initial activation always requires admission.

After preflight, GitHub builds/loads the jobs image, smoke-tests curl/flock and `scheduler --check` inside it without network or credentials, pushes the tested image, and repeats preflight. The workflow creates or updates only `ad-networks-jobs` in the website's production environment, configures a dedicated GHCR pull registry from existing credentials, sets private runtime variables, and deploys. Dokploy's generated Compose app name is discovered and reused. The named volume `stack127-ad-networks-data` is created automatically and preserved on every rerun. Limits are 0.5 CPU, 1 GiB RAM, four fetch workers and a 640 MiB heap; the volume initializer temporarily allows another 128 MiB/0.1 CPU.

On the first start, the container pins the seed manifest, downloads and verifies every chunk plus compressed/raw checksums, checks SQLite/catalog, and installs only into an absent working store. It automatically runs catalog, full seed sync/revalidation, fill-only niche seed, revalidation, snapshot, one-site platform and verification checks, and a checked backup. Only non-null source niches fill still-null target labels; existing labels are preserved. The replacing/clearing `--niches-only` correction command is never automatic. Persisted markers resume unfinished steps after a crash; completed bootstrap never reseeds. Effects are idempotent if a crash occurs between a database commit and its marker. Schedules start only afterward. Keep homelab niche sorting stopped until this finishes.

The workflow waits up to 45 minutes for Docker health and a fresh private status reporting the exact release, deployment ID, enabled list and completed bootstrap. A stale previous container cannot satisfy the check. Failed startup or bootstrap opens the existing issue alert, including initial Storage failures; a persistent issue marker deduplicates restarts. A timeout does not delete the service or volume; read status and pause before investigating.

## 5. Read status and start the homelab niche timer

```bash
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/handoff.mjs --status --environment production'
```

Require `runtime_stale:false`, `phase:ready`, completed bootstrap, successful platform/verification/snapshot/backup results, and `synced:true,revalidated:true` on collector results. Status includes counts, last start/finish times, failure/retry state, enabled jobs, bootstrap progress and the latest RDAP import. It is private; the command uses existing credentials and prints no keys. Runtime status is refreshed every 30 seconds. Public ad-network URLs must still return 404. The existing cache worker retains its verification/edge/static refresh queue.

Only after those checks:

```bash
ssh homelab 'bash -s' <<'SH'
set -eu
cd /srv/data/projects/stack127
# Retire only the named old automation; preserve the backup units/RDAP pass.
for name in sync platform domain-age ads-txt-summary publisher-names traffic niche-export discovery; do
  unit="stack127-ad-network-$name.timer"
  if systemctl --user cat "$unit" >/dev/null 2>&1; then systemctl --user disable --now "$unit"; fi
done
for unit in stack127-ad-network-discovery.service stack127-ad-network-verification.service; do
  if systemctl --user cat "$unit" >/dev/null 2>&1; then systemctl --user disable --now "$unit"; fi
done
/home/teja/.local/bin/claude auth status
node --env-file=.env.deploy --experimental-strip-types scripts/ad-networks/niche-sort.mjs --environment production --confirm stack127-production --apply --limit 2 --claude /home/teja/.local/bin/claude
mkdir -p "$HOME/.config/systemd/user"
install -m 644 scripts/ad-networks/systemd/stack127-ad-network-niche.service scripts/ad-networks/systemd/stack127-ad-network-niche.timer "$HOME/.config/systemd/user/"
systemd-analyze --user verify "$HOME/.config/systemd/user/stack127-ad-network-niche.service" "$HOME/.config/systemd/user/stack127-ad-network-niche.timer"
systemctl --user daemon-reload
systemctl --user enable --now stack127-ad-network-niche.timer
systemctl --user list-timers stack127-ad-network-niche.timer
SH
```

The timer runs Sunday 06:00 UTC. It reads unsorted production publishers, classifies using the logged-in subscription CLI, validates the exact domain set/labels/confidence, imports only accepted still-unsorted niches and revalidates. The next OVH sync preserves these labels. Its last result is `status/niche-sort.json` in the same bucket and appears in `handoff --status`.

The commands retire only named old jobs. Keep `stack127-ad-network-backup.service` and `.timer` until the original RDAP and gather processes finish and OVH's first backup succeeds.

## 6. Deliver the finished RDAP pass later

Once the original pass has finished:

```bash
ssh homelab 'cd /srv/data/projects/stack127 && node --experimental-strip-types scripts/ad-networks/handoff.mjs --kind rdap --environment production --confirm stack127-production --apply'
```

With `rdap-import` enabled, the container polls the immutable handoff once per minute between heavy jobs. It verifies/downloads the snapshot, merges only newer RDAP checkpoints and domain dates, then syncs and revalidates. Imported IDs are recorded once; retries are safe. Newer OVH facts, relationships, niches and other enrichment remain intact. Read `handoff --status` to see the imported ID. Only after both original processes have finished may the coordinator disable the old homelab backup timer.

## Pause, resume and rollback

To pause OVH work, dispatch the workflow with `-f enabled_jobs=`. This selects a separate confirmed stop job. It verifies only the known production service identity, stops that Compose service, confirms no containers remain running, and clears its enabled list. It needs no release SHA, working website, seed, Storage/database access, capacity inspection, image build or registry credentials. A missing service fails without creating anything. Storage status will become stale while stopped; the pause workflow's `paused:true,containers_stopped:true` result confirms the stop.

To resume selected jobs, use the normal activation command with their names and the current released SHA. The working store, activation timestamp, bootstrap markers and completion slots persist. A running batch drains or is interrupted safely during stop. Committed data stays intact; completed seed steps never repeat.

```bash
gh workflow run ad-networks-runtime.yml --repo stack127labs/stack127 --ref main \
  -f confirm=stack127-production -f enabled_jobs=
ssh homelab 'systemctl --user disable --now stack127-ad-network-niche.timer; systemctl --user stop stack127-ad-network-niche.service'
```

Retain the volume, seed manifests/chunks, backups, niche checkpoints and additive migrations. Do not delete/recreate the Compose service or restore an entire database over unrelated work. Runtime rollback is pause, then a reviewed fix/revert through PR and the normal release, followed by this workflow against the newly released SHA. A failed first bootstrap resumes its missing steps; it never silently adopts a different seed. A data restoration needs a separately reviewed scoped correction. No page publication or DNS switch is part of recovery.

## Verification in this implementation round

No push, deployment, OVH modification, production write or production bucket creation occurred. Development used an isolated private Storage bucket and removed it after testing. TypeScript and 80 core tests passed; the focused suite passed 169 tests with two optional database fixtures skipped. The new niche-seed SQL fixture also passed separately against a transaction-local development table, proving preserved existing labels, no null clearing, repeat safety and explicit correction behavior. The earlier real development run exercised upload, checksum-verified install, all bootstrap steps, no-op restart, RDAP handoff/import/retry, private status and anonymous-access rejection. The fixture was 143,360 bytes (10,645 compressed); platform and verification each processed one site and returned `synced:true,revalidated:true,paths:70`. All eight bootstrap steps completed, restart reran zero steps, and the second RDAP consumption reported `already_imported`. That RDAP fixture had no newer dates; newer-date merge behavior is covered by focused tests. Private status read back `phase:ready`; anonymous download returned HTTP 400; all seven test objects and their bucket were removed. A separate public-object URL check also returned HTTP 400. A real development lock test using session-port selection rejected the competing runner and admitted it after release.

The previous read-only migration comparison found production at `20261010064142`, with all ten PR migrations pending. Shared cache functions matched their pre-PR baselines; the new objects and publisher columns had no name collisions. This follow-up adds no migration. The image smoke test is wired before push in GitHub Actions; the local Docker daemon is unavailable. Authenticated Dokploy create/update/deploy/stop remains mocked until the coordinator runs the authorized production workflow.

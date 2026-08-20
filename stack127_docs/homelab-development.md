# stack127 homelab development handoff

Last updated: 19 August 2026

## Current operating model

The primary stack127 development workspace is now the homelab checkout:

```text
/home/teja/projects/stack127
```

The private source-of-truth repository is `stack127labs/stack127`, using the `main` branch. Normal work should start on the homelab, pull from GitHub before editing, and push reviewed commits back to GitHub. The old Mac checkout can remain as an inactive fallback, but it should not receive new edits because that would create two working copies that can diverge.

External repositories are independent checkouts beside the private workspace. The BaseBuddy website checkout is at:

```text
/home/teja/projects/basebuddy-website
```

It tracks `stack127labs/basebuddy-website` on branch `self-host-dev`. Its files and Git history are separate from the private stack127 repository. BaseBuddy app, DNS Tools, and Stack127 datasets are also separate checkouts when needed. See `stack127_docs/public-repositories.md` for the complete registry and clone workflow.

## Git and homelab setup

- The complete private repository was pushed to GitHub and cloned on the homelab.
- The homelab checkout tracks `origin/main` and had no tracked changes after synchronization.
- GitHub CLI was already authenticated on the homelab. `gh auth setup-git` connected that existing authentication to Git operations, so non-interactive pulls work.
- Cleanup commit `199ed8b` added the reproducible managed-development seed and the database-function security migration.
- External repositories are not nested under the private checkout and do not appear in its Git status. Clone them separately under `/home/teja/projects/<repo-name>` only when working on them.

## Environment files

The required ignored environment files are present on the homelab with owner-only permissions. Secrets are not committed.

```text
.env.local       managed development Supabase
.env.database    production Supabase
.env.deploy      OVH, Cloudflare, and Dokploy deployment values
.env.analytics   analytics values
.env.homelab     homelab-specific values
.env.repos       public-repository automation values
```

Rules:

- Use `.env.local` for development.
- Use `.env.database` only for explicit production checks or approved production database work.
- Do not replace production values with development values.
- Do not start a local Supabase Docker stack on the homelab.
- Never commit any environment file or secret.

## Managed Supabase

Both environments use managed Supabase:

```text
Development project ref: phhrfvmncpqqmmgruktx
Production project ref:  tulgfrqamtcshdtmhvpx
```

Development setup completed:

- Database authentication was verified against PostgreSQL 17.6.
- All committed migrations were applied.
- The normal development seed was applied.
- All 16 `/self-hosting-for-beginners` registry rows are now part of the ordered development seed in `supabase/seeds/20260817_self_hosting_for_beginners_pages.sql`.
- `supabase/config.toml` loads that course seed after the existing open-project seed.
- The seed is idempotent and is checked against `scripts/self-hosting-for-beginners/pages.json` by a page-family regression test.
- Development has 52 published page rows, including all 16 course routes.
- All public tables have RLS enabled.

Database security cleanup completed:

- Migration `20260817170257_secure_set_updated_at_search_path.sql` fixes `public.set_updated_at()` to use `search_path=pg_catalog`.
- The migration was applied to development and production.
- Production migration history was aligned for the three previously pending publication migrations before the security migration.
- Production remained at 52 published pages.
- The pinned Supabase database advisor reports no issues in either environment.

## Dependencies and verification

stack127 dependencies were installed with `npm ci`. The project-required Playwright Chromium revision was installed on the homelab. The complete quality gate passed during the move:

- TypeScript check passed.
- 368 unit tests passed after the cleanup tests were added.
- Static policy passed for all 52 route files.
- The live production SEO registry check passed with 52 published slugs.
- Playwright completed 214 checks with 124 repository-configured skips and no failures.
- The production Next.js build passed.

The BaseBuddy website checkout was previously installed with pnpm 10.32.1. Each BaseBuddy repository owns its own dependencies, environment examples, tests, and quality gate; the private stack127 checkout does not depend on or contain those files.

No local Supabase containers are required or running.

## Codex Remote Control

The homelab runs Linux Mint and has the ChatGPT/Codex desktop application and Codex CLI installed. The host-side Remote Control service is provided by Codex CLI's app-server daemon:

```bash
codex remote-control start --json
```

Verified host state:

- Server name: `teja-homelab`
- Codex CLI/app-server version: `0.147.0`
- Daemon status: connected and already running
- Remote Control: enabled
- Daemon auto-update: enabled

The short-lived manual pairing code was generated with:

```bash
codex remote-control pair
```

The code was entered in the Codex App on the Mac. Pairing codes must never be saved in this repository.

Remote Control and SSH-host projects are different features. In this setup, Remote Control is the intended path:

```text
Codex App on Mac or another paired device
  -> OpenAI Remote Control relay
  -> Codex app-server daemon on teja-homelab
  -> /home/teja/projects/stack127
```

Commands, files, dependencies, credentials, plugins, browser state, screenshots, and background work come from the homelab when a task is running on `teja-homelab`.

An SSH alias named `stack127-homelab` also exists on the Mac and uses the existing Bitwarden-backed SSH access. It is useful for administration but is not the Remote Control transport.

## Final Remote Control verification

The server side is complete. One client-side check remains because the current Mac task was started before pairing and continued to report only the local host:

1. Fully quit and reopen the Codex App on the Mac.
2. Confirm `teja-homelab` appears as an available host under Remote or Connections.
3. Select or add `/home/teja/projects/stack127` on that host.
4. Start a small task and confirm its working directory is `/home/teja/projects/stack127`.
5. Confirm `git rev-parse --short HEAD` matches `origin/main`.

After this check passes, the Mac repository is no longer needed for day-to-day work. It may be kept as an inactive fallback or removed later after verifying there are no uncommitted or ignored files that exist only on the Mac.

## Daily workflow

1. Choose `teja-homelab` in the Codex App.
2. Open `/home/teja/projects/stack127`.
3. Run `git pull --ff-only origin main` before new work.
4. Use `.env.local` for development and managed-dev database checks.
5. Run the relevant tests, then `npm run quality` before a release.
6. Commit and push only intended files. Never commit environment files.
7. Run `npm run stack127:deploy:preflight` before any production deployment.

If Remote Control needs to be restarted:

```bash
codex remote-control stop
codex remote-control start --json
```

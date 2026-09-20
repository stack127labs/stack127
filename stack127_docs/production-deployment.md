# Stack127 Production Deployment

This is the active production runbook. The OVH migration document is historical context, not a deployment target selector.

## Canonical Target

The machine-readable source of truth is `scripts/stack127/deployment/targets.json`.

- Provider: OVH
- Dokploy: `https://dokploy.stack127.com`
- Repository: `stack127labs/stack127`
- Branch: `main`
- Build: repository `Dockerfile`
- Public hosts: `stack127.com` and `www.stack127.com`

The Stack127 application and project were removed from the shared Hostinger
Dokploy on 31 July 2026. The shared server and
`https://dokploy.ravitejaknts.com` remain in use by unrelated products, but they
are not a rollback or deployment target for Stack127.

## Required Preflight

Run:

```bash
npm run stack127:deploy:preflight
```

The command fails closed when:

- an ambiguous legacy VPS or Dokploy key is present in `.env.deploy`;
- the declared host, provider, application, repository, or branch differs from the production manifest;
- `HEAD` differs from `origin/main`;
- Cloudflare's apex A or AAAA record differs from the OVH target.

Do not work around a failed preflight. Correct the source-of-truth mismatch first.

## Release Flow

The normal path uses two committed GitHub Actions workflows. `Stack127 CI` runs
fast and change-aware checks for a production-relevant push to `main`.
`Stack127 Release E2E` starts only after that CI run succeeds for the same SHA,
or from `workflow_dispatch` with the exact current `origin/main` SHA:

1. CI runs type checking, deterministic tests, static policy, the production
   registry check, and browser tests selected from the changed routes. Shared
   or unmapped runtime changes expand to the complete release browser gate.
2. The release applies pending Supabase migrations and runs the production
   target and Cloudflare DNS preflight.
3. Build one immutable GHCR image tagged with the release SHA and load it on the
   runner without pushing it.
4. Start that exact image and run health, homepage, robots, and sitemap smoke
   tests against it.
5. Push the same tested SHA and production tags to GHCR without rebuilding.
6. Call Dokploy's API to point the application at the SHA-tagged image and
   trigger deployment.
7. Poll Dokploy, then verify `/api/health?scope=deploy` reports the exact SHA and
   a configured runtime. Repeat the public smoke checks against production.

Documentation-only pushes do not start CI or deploy. The nightly `Stack127 Full
Regression` workflow runs the complete desktop and mobile Playwright matrix.
Use `npm run quality:full` locally for shared routing, SEO, shell, registry,
tool UI, package, or test-infrastructure changes.

Page browser specs whose ownership manifest is not `published` stay out of the
normal release gate because production must return 404 for those preview-only
routes. Their unit and policy tests still run. Set
`STACK127_INCLUDE_NONPUBLISHED_BROWSER_TESTS=1` only after adding any required
temporary rows to the managed development registry for an explicit preview
test.

Only the newest `main` CI and release should finish. A newer push cancels older
work in the CI and production concurrency groups.

The workflow is the source of truth for releases. Keep Dokploy's broad
push-to-deploy webhook disabled, otherwise a Git push can start an unverified
deployment before the quality gate finishes. The dashboard remains a read-only
fallback for incident diagnosis; do not use Claude access codes, email/password
automation, or direct SSH deployment.

After the workflow succeeds, confirm all four revisions match:

```text
local HEAD
  = origin/main
  = OVH Dokploy image/release SHA
  = live production revision
```

## GitHub production environment

Create a protected GitHub Environment named `production` and add these values
there. Secrets are never committed to this repository.

Required secrets:

- `DOKPLOY_API_KEY`: a Dokploy API key, not a dashboard password.
- `GHCR_DOKPLOY_TOKEN`: a read-only GitHub token for Dokploy to pull the private image from GHCR.
- `DATABASE_POOLER_URL` (or `DATABASE_URL`): the production database URL used by the quality gate.
- `CLOUDFLARE_API_TOKEN`: a token scoped to read Stack127 DNS records.
- `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`: the Cloudflare Access service token for Dokploy API paths when the dashboard hostname is protected by Access. Set both or neither.

The database URLs are repository secrets; the other five named deployment
credentials are attached to the protected `production` environment. This split
is intentional and is recorded in `stack127_docs/environment-inventory.md`.

Required variables (the application ID and URL intentionally mirror
`targets.json`):

- `STACK127_DOKPLOY_API_URL`: `https://dokploy.stack127.com`
- `STACK127_DOKPLOY_APPLICATION_ID`: `_oKhy4YdVBc513i_qjVHC`
- `STACK127_SITE_URL`: `https://stack127.com`
- `CLOUDFLARE_ZONE_ID`

Optional variable:

- `GHCR_DOKPLOY_USERNAME`: the GitHub owner that owns the package; it defaults to the repository owner.

The Cloudflare Access policy should use service authentication for only the
Dokploy API paths required by the workflow (`/api/application.saveDockerProvider`,
`/api/application.deploy`, and `/api/deployment.all`). Keep the dashboard and
all other administrative paths behind normal user authentication. A 3xx
response from the workflow is treated as a missing or misconfigured service
token and fails the release.

For a manual release, use the Actions **Stack127 Release E2E** workflow and
enter a full SHA that is already the current `origin/main` tip. The workflow
refuses stale or non-main commits. Manual release is the path for a deliberate
deployment after a documentation-only push.

Never trigger Stack127 through the legacy Hostinger Dokploy webhook or application.

## Environment Rules

`.env.deploy` is edited surgically. Do not replace it wholesale.

- Keep current OVH Dokploy and Cloudflare credentials.
- Keep the Hostinger API token only for registrar work; it is not a deployment credential.
- Do not add generic `VPS_*` or `DOKPLOY_PUBLIC_URL` variables.
- Use the explicit `STACK127_PRODUCTION_*` names from `.env.deploy.example`.
- Keep all secret env files mode `0600`.
- Store recovery credentials and private SSH keys in the password manager, not the repository.
- Keep `stack127_docs/environment-inventory.md` aligned with local files,
  GitHub Actions scopes, and Dokploy runtime variables.

## Failure Rule

If live content does not match the expected commit, do not change DNS first. Determine:

1. which Dokploy received the deployment;
2. which commit the OVH application is running;
3. which origin Cloudflare is serving;
4. whether the public response is dynamic or cached.

Only change DNS during an explicitly approved infrastructure migration.

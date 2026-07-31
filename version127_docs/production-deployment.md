# Version127 Production Deployment

This is the active production runbook. The OVH migration document is historical context, not a deployment target selector.

## Canonical Target

The machine-readable source of truth is `scripts/version127/deployment/targets.json`.

- Provider: OVH
- Dokploy: `https://dokploy.version127.com`
- Repository: `RaviTejaKNTS/version127`
- Branch: `main`
- Build: repository `Dockerfile`
- Public hosts: `version127.com` and `www.version127.com`

The Version127 application and project were removed from the shared Hostinger
Dokploy on 31 July 2026. The shared server and
`https://dokploy.ravitejaknts.com` remain in use by unrelated products, but they
are not a rollback or deployment target for Version127.

## Required Preflight

Run:

```bash
npm run version127:deploy:preflight
```

The command fails closed when:

- an ambiguous legacy VPS or Dokploy key is present in `.env.deploy`;
- the declared host, provider, application, repository, or branch differs from the production manifest;
- `HEAD` differs from `origin/main`;
- Cloudflare's apex A or AAAA record differs from the OVH target.

Do not work around a failed preflight. Correct the source-of-truth mismatch first.

## Release Flow

1. Run the full quality gate for the change being released.
2. Commit the intended scope without including unrelated workspace changes or secrets.
3. Push the release commit to the feature branch and fast-forward `main` to that exact commit.
4. Run the production preflight.
5. Open only `https://dokploy.version127.com` through Cloudflare Access.
6. Confirm the OVH application name, repository, branch, and target commit before clicking deploy.
7. Wait for the deployment to finish and confirm one healthy replica.
8. Verify the public site, the changed route, `/robots.txt`, and `/sitemap.xml`.
9. Confirm all four revisions match:

```text
local HEAD
  = origin/main
  = OVH Dokploy deployment commit
  = live production revision
```

Never trigger Version127 through the legacy Hostinger Dokploy webhook or application.

## Environment Rules

`.env.deploy` is edited surgically. Do not replace it wholesale.

- Keep current OVH Dokploy and Cloudflare credentials.
- Keep the Hostinger API token only for registrar work; it is not a deployment credential.
- Do not add generic `VPS_*` or `DOKPLOY_PUBLIC_URL` variables.
- Use the explicit `VERSION127_PRODUCTION_*` names from `.env.deploy.example`.
- Keep all secret env files mode `0600`.
- Store recovery credentials and private SSH keys in the password manager, not the repository.

## Failure Rule

If live content does not match the expected commit, do not change DNS first. Determine:

1. which Dokploy received the deployment;
2. which commit the OVH application is running;
3. which origin Cloudflare is serving;
4. whether the public response is dynamic or cached.

Only change DNS during an explicitly approved infrastructure migration.

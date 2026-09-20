---
name: stack127-release-e2e
description: Release stack127 from a successful change-aware main-branch CI run through one tested immutable GHCR image, Dokploy, and exact live revision checks.
---

# Stack127 release end to end

Use this skill for release, deployment, publication verification, or release diagnosis. Read `AGENTS.md`, `stack127_docs/production-deployment.md`, and `scripts/stack127/deployment/targets.json` first.

The only production target is the OVH Dokploy application in the target manifest. Never use the removed Hostinger target.

## Release sequence

1. Run `npm run quality` locally. Use `npm run quality:full` when shared routing, SEO, shell, registry, tool UI, package, or test infrastructure changed.
2. Run `npm run stack127:deploy:preflight` before pushing when local production credentials are available.
3. Keep the intended change on `main` and confirm `HEAD` equals `origin/main` after push.
4. Wait for `Stack127 CI`. It runs fast checks and change-aware browser coverage. A successful production-relevant push starts the release workflow for that exact SHA.
5. The release applies migrations and target preflight, builds one immutable image, starts that image, runs release smoke tests against it, then pushes the same image tags.
6. The workflow deploys the SHA-tagged image through Dokploy.
7. Treat `/api/health?scope=deploy` as release authority. It must report HTTP 200, `ok: true`, a production runtime, and the exact release SHA.
8. Confirm `/`, `/robots.txt`, and `/sitemap.xml`.
9. Record `local HEAD = origin/main = tested image SHA = live health SHA`.

Documentation-only pushes do not start CI or deployment. Use manual `workflow_dispatch` with the exact current `origin/main` SHA when a deliberate release is required without a production-relevant push.

## Safety

- Never put Dokploy, GHCR, database, or Cloudflare secrets in logs, files, or commits.
- Never bypass failed CI, preflight, image smoke tests, or live revision checks.
- Never automate the Dokploy dashboard with user credentials.
- A Cloudflare Access redirect is a hard failure.
- Never change DNS merely because a deployment failed or landed on an unexpected revision.
- Do not call a release complete until the live SHA and public smoke checks pass.

If access is missing, report the exact secret, variable, or service-auth policy. Do not substitute another target or token.

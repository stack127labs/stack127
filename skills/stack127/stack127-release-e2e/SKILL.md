---
name: stack127-release-e2e
description: Release Stack127 from verified main through GitHub Actions, an immutable GHCR image, Dokploy API, and live revision checks.
---

# Stack127 Release E2E

Use this skill for any request to release, deploy, publish, push to production,
verify a production deployment, or diagnose a Stack127 release. The
canonical workflow is `.github/workflows/stack127-release-e2e.yml`.

## Read first

1. Read `AGENTS.md`.
2. Read `stack127_docs/production-deployment.md`.
3. Read `scripts/stack127/deployment/targets.json`.

The only production target is the OVH Dokploy application in that manifest.
Never deploy to the removed Hostinger Dokploy target, a generic VPS variable,
or a nested checkout of an external repository.

## Release sequence

1. Keep the intended change on `main` and ensure the release SHA is the current
   `origin/main` tip.
2. Run `npm run quality` and `npm run stack127:deploy:preflight`.
3. Let the GitHub Actions workflow build and push
   `ghcr.io/<owner>/stack127-web:<sha>`.
4. Let the workflow call Dokploy's API with `x-api-key` and, when required,
   Cloudflare Access service-token headers. It updates the application to the
   immutable image, triggers `application.deploy`, and polls `deployment.all`.
5. Treat `/api/health?scope=deploy` as the release authority. It must return
   HTTP 200, `ok: true`, a configured production runtime, and the exact release SHA.
6. Confirm `/`, `/robots.txt`, and `/sitemap.xml` return expected public output.
7. Record the final invariant:

   `local HEAD = origin/main = Dokploy image SHA = live health SHA`

## Safety rules

- Never put Dokploy API keys, GHCR tokens, database URLs, or Cloudflare Access
  secrets in workflow files, docs, logs, or commits.
- Never automate Dokploy with email/password credentials or Claude access codes.
- Do not bypass a failed quality gate or preflight. Fix the mismatch first.
- Do not use the Dokploy dashboard to deploy during a normal release; it is an
  incident-diagnosis fallback.
- A Cloudflare Access redirect (3xx) is a hard failure, not a reason to follow
  a login flow from CI. Configure a narrowly scoped service-auth policy instead.
- Do not claim a release is complete until the live health SHA and public smoke
  checks pass.

## Missing access or secrets

If the workflow cannot run, report the exact missing GitHub Environment secret,
variable, or Cloudflare Access policy. Do not invent a token, use a local
password, or fall back to the legacy target. Once access is configured, rerun
the same SHA through `workflow_dispatch`.

## Local verification

The reusable Dokploy client is
`scripts/stack127/deployment/dokploy-release.mjs`. It supports `release`,
`configure-image`, `trigger`, `wait`, and `health` commands. Use the complete
`release` command only with the production Environment secrets and the exact
SHA that passed preflight; otherwise use pure unit tests and read-only checks.

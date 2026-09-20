---
name: stack127-release-e2e
description: Release stack127 to the OVH Dokploy production target and verify the exact live revision.
---

# stack127 release

Read `AGENTS.md`, `stack127_docs/production-deployment.md`, and `scripts/stack127/deployment/targets.json`.

## Before release

- Confirm the user authorized publication, commit, push, and deployment.
- Confirm the intended changes are on `main` and preserve unrelated work.
- Reuse passing core-test and production-build results for the same commit. If either is missing, run `npm run test:core` and `npm run build` once. Run `npm run stack127:deploy:preflight`.
- Stop on a real build, target, DNS, credential, or live-site failure.

## Release

Push the intended main commit. The production workflow runs the minimum release gate, applies changed migrations, builds one image, deploys it through Dokploy, and checks the live revision, homepage, robots file, and sitemap.

Do not repeat TypeScript, start a separate full test suite, or rebuild an image that the workflow already built. Documentation, skill, record, and test-only changes need a manual release only when the user deliberately wants one.

## Complete

Report the commit, workflow result, live SHA, public smoke result, and elapsed time. Do not call the release complete unless `HEAD`, `origin/main`, the deployed image, and live health SHA match.

Never deploy to the removed Hostinger target, expose secrets, bypass Cloudflare Access, automate dashboard credentials, or change DNS to hide a failed deployment.

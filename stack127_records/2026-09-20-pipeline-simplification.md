# Test and release pipeline simplification

This checklist covers test selection, CI, and production deployment. The existing tool-creation workflow remains unchanged and will be reviewed separately, one step at a time.

## Scope

- [x] Restore and validate the original tool-creation instructions, skills, templates, and acceptance validator.
- [x] Keep the tool implementations, publication data, and production database unchanged.

## Tests and CI

- [x] Add fast, changed, smoke, full, and nightly test commands.
- [x] Add a change classifier that selects route-owned browser tests and expands coverage for shared-risk changes.
- [x] Build once and test the production artifact for shared-risk changes.
- [x] Add one CI browser retry with trace capture.
- [x] Separate change-aware CI from production deployment.
- [x] Keep the full desktop and mobile matrix in the nightly workflow.
- [x] Prevent documentation-only pushes from starting CI or deployment.

## Release

- [x] Build one immutable production image.
- [x] Run release smoke tests against that exact image.
- [x] Push and deploy the tested image without rebuilding it.
- [x] Keep migrations, target preflight, immutable SHA checks, live health, homepage, robots, and sitemap verification.

## Completion

- [x] Run focused tests and validate the restored skills.
- [x] Run the corrected change-aware gate against the production artifact.
- [x] Commit and push the verified scope to `main`.
- [x] Confirm GitHub CI passes.
- [x] Confirm the exact-image smoke test and production release pass.
- [x] Record `HEAD = origin/main = tested image SHA = live SHA`.

## Result

The original tool-creation workflow is restored. Local verification passed for the restored skills, focused validators, change classifier, workflow policy, production build, 902 desktop browser checks, and 8 focused mobile checks. GitHub CI and the exact-image release passed. Production health and database checks passed, and the homepage, robots file, sitemap, and the four named tool routes returned successfully. The final documentation commit was released separately so `HEAD`, `origin/main`, the tested image, Dokploy, and live production report the same revision.

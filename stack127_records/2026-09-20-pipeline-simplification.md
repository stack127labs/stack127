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
- [ ] Commit and push the verified scope to `main`.
- [ ] Confirm GitHub CI passes.
- [ ] Confirm the exact-image smoke test and production release pass.
- [ ] Record `HEAD = origin/main = tested image SHA = live SHA`.

## Result

Local verification passed. The restored skills, their focused validator tests, the change classifier, workflow policy tests, production build, 902 desktop browser checks, and 8 focused mobile checks passed. The previous production revision remains live and healthy until the verified commit completes CI and release.

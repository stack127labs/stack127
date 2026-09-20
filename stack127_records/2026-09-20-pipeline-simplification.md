# Pipeline simplification

This checklist tracks the move from the original all-tools, all-checks workflow to a risk-based tool workflow and a change-aware release process. Checkmarks require implementation and verification, not a documentation-only change.

## Tool creation

- [x] Define simple, standard, and high-risk tool work.
- [x] Replace the fixed 13-stage workflow with risk-based stages.
- [x] Replace the required collection of planning documents with one concise `tool-spec.md` for new work.
- [x] Replace hand-authored acceptance evidence with a generated verification receipt.
- [x] Stop tying current acceptance to shared-file hashes and fixed model or session records.
- [x] Reduce route-specific visual checks to one desktop and one mobile run while retaining shared theme and layout coverage.
- [x] Reduce routine agent updates to start, blocker, and completion messages.

## Tests and CI

- [x] Add fast, changed, smoke, full, and nightly test commands.
- [x] Add a change classifier that selects route-owned browser tests and expands to the full suite for shared-risk changes.
- [x] Add one CI browser retry with trace capture so a transient failure does not require a complete manual rerun.
- [x] Separate change-aware CI from production deployment.
- [x] Keep full browser coverage for nightly runs and shared-risk changes.

## Release

- [x] Stop production deployment for documentation-only pushes.
- [x] Build the immutable production image once.
- [x] Run release smoke tests against that exact image.
- [x] Push and deploy the tested image without rebuilding it.
- [x] Retain migrations, target preflight, immutable SHA checks, live health, homepage, robots, and sitemap verification.

## Project alignment

- [x] Update `AGENTS.md`, current operating docs, relevant skills, package scripts, Playwright configuration, and GitHub workflows.
- [x] Add automated tests for the change classifier and generated receipt.
- [x] Validate changed skills with the skill validator.
- [ ] Run focused tests, the change-aware gate, a production image smoke test, and the full quality gate when justified by the shared workflow changes.
- [ ] Commit and push the verified changes to `main`.
- [ ] Verify the production release and record `HEAD = origin/main = live SHA`.

## Result

Implementation is complete. Local verification passed 1,153 deterministic tests, static policy across 303 route files, the production registry check, the production build, the full desktop and mobile browser matrix, focused reruns for corrected responsive assertions, workflow parsing, and validation of all changed skills. The production image smoke test, push, deployment, and final live SHA check remain pending.

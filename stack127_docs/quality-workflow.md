# Stack127 quality workflow

Quality checks are proportional to the change. Route work runs focused browser coverage. Shared runtime work runs the complete release browser gate. The full desktop and mobile matrix runs nightly and on demand.

## Sources of truth

- `public.stack127_pages` controls public SEO publication.
- Production registry checks use `.env.database`.
- Route files do not own metadata, canonicals, robots, sitemap inclusion, or JSON-LD.
- Every route has one ownership manifest under `tests/pages/`.
- The change classifier at `scripts/stack127/quality/change-plan.mjs` maps changed route files to tests from those manifests.

## While editing

Run the smallest relevant unit or browser test. Use the fast repository gate when a change crosses several files:

```bash
npm run test:fast
```

This runs type checking, all deterministic Node tests, and static policy. These checks are fast enough to remain global.

## Before handoff

Run:

```bash
npm run quality
```

`quality` runs the fast gate, production registry check, change-aware browser tests, and one production build for runtime changes. `test:changed` selects route-owned browser specifications and the release smoke test. Focused changes run those tests on the development server and build once afterward. Shared changes build first, then run the broad browser gate against that production artifact so hundreds of routes are not compiled on demand.

Run the complete local matrix when the change is shared or when diagnosing broad regressions:

```bash
npm run quality:full
```

## Commands

- `npm run test:fast`: type checking, unit tests, and static policy.
- `npm run test:changed`: route-owned browser tests selected from Git changes, plus one production build for runtime changes.
- `npm run test:smoke`: health, homepage, robots, and sitemap.
- `npm run quality:ci`: fast checks, registry, and changed browser coverage without a duplicate host build.
- `npm run quality`: change-aware handoff gate plus production build.
- `npm run quality:full`: one production build followed by the complete desktop and mobile browser matrix against that artifact.
- `npm run quality:nightly`: scheduled alias for the full matrix.

Playwright uses two workers and retries one failed test in CI. The retry captures a trace. A second failure remains a hard failure.

## CI and release

`Stack127 CI` runs for pull requests and production-relevant pushes to `main`. Documentation-only changes do not start CI or a deployment. The change-aware gate owns the single production build, so pull requests do not repeat it. A successful `main` CI run starts `Stack127 Release E2E` for the same SHA.

The release workflow builds one immutable Docker image, starts that exact image locally, runs smoke tests against it, pushes the same tags, deploys through Dokploy, and verifies the live SHA. It does not rerun every route's browser suite.

`Stack127 Full Regression` runs the complete desktop and mobile matrix every night and on demand. Shared-risk changes also run the complete release browser gate in CI before deployment.

## Failure behavior

- Fix failures at their source. Do not weaken expectations to obtain a pass.
- A focused test failure blocks the change.
- A retry that passes remains visible in the CI log and trace history.
- An unknown runtime path selects the full browser gate rather than silently skipping coverage.
- Publication, deployment, and implementation readiness remain separate outcomes.

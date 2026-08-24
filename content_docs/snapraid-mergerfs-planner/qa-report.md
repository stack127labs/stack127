# QA report: SnapRAID and mergerfs Config Planner

Status: blocked by local preview and production registry environments
Route: `/snapraid-mergerfs-planner`
Checked: 2026-08-23

## Completed checks

- Pipeline test and content stages pass.
- The route engine and static page tests pass. The full repository `npm run test` passes: 67 tests, typecheck, and static policy.
- Playwright preflight passes with Chromium 1.60.0 installed. The route spec lists 20 tests across Chromium and mobile projects.
- The production build passes after the route fixes.
- The route remains unpublished, and the final worktree audit shows no storage hub, sidebar, count, registry, migration, or unrelated tool changes.

## Route fixes in this pass

- The browser spec now asserts the approved guide headings from the writing plan.
- Invalid content-count submission focuses the first content input instead of the non-focusable group error paragraph.
- Data, parity, and content remove controls preserve the contract minimums of two, one, and two rows.

## Remaining blockers

The worktree has no `.env.local` or `.env.database`, so the guarded local preview cannot expose the unpublished route and the production registry check cannot query `public.stack127_pages`. The configured Playwright server also needs the approved execution boundary to bind its local port. No parent checkout credentials were borrowed, and no database or publication state was changed.

The route Playwright assertions therefore remain unexecuted against a live page. No screenshot, responsive measurement, theme check, clipboard interaction, or unpublished HTTP response is claimed.

The standalone `--tool-only` validator is a pre-content build check. It reports the intentionally integrated page introduction and server-rendered guide; the route's test and content-stage validators pass. The guide remains because it is part of the approved content handoff and is covered by the route tests.

## Required next step

With an approved development `.env.local`, run the guarded preview helper, add the local-only preview row, execute the 20-test route spec at 320, 375, 760, and 1280 CSS pixels in both themes, remove the preview row with `--remove`, and recheck the clean unpublished route. With production `.env.database`, rerun `npm run quality` so registry, SEO, and the already-passing build run in one complete pipeline.

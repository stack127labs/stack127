# KDP five-tool re-audit

Date: 2026-09-16
Commit reviewed: `827bdad494216dea94415f494e6cf7161b4b705b`, with the current uncommitted KDP implementation
Environment: managed development Supabase and local Next.js on port 3333
Original findings: `stack127_records/2026-09-16-kdp-five-tools-tool-audit.md`

## Verdict

All five tools are ready for development review within the audited scope. The confirmed calculation, parser, validation, interface, and test gaps from the first audit are fixed. The routes remain unpublished in their ownership manifests and no production publication or deployment was made.

| Tool | Verdict | Evidence |
| --- | --- | --- |
| KDP Book Setup Calculator | Ready for development review | Correct spine coefficients and page limits; revised number input is used on the next calculation; result and recovery focus verified. |
| KDP Metadata Checker | Ready for development review | Bare domains and emoji are detected; malformed input has an explicit input-error state; checked snapshots remain visible and are marked stale after edits. |
| KDP Royalty Calculator | Ready for development review | eBook delivery cost is deducted before the 70% rate; paperback 110-page pricing and target states are corrected; cost receipt and source selection are covered. |
| KDP PDF Preflight Checker | Ready for development review | PDF.js and pdf-lib handle object streams, inherited boxes, font embedding, page order, image placement DPI, file-size limits, page parity, and parser failures. |
| KDP Page Count Estimator | Ready for development review | The result exposes the estimated range, raw totals, midpoint, additions, typography model, text block, KDP gutter bands, warnings, and model versions. |

## Verified behavior

- Focused engine and route tests: 10 passed.
- Repository test suite: 1,103 passed, 0 failed.
- Browser matrix: 20 passed, 0 failed across desktop Chromium and Pixel 7 mobile emulation.
- Static policy: passed across 303 route page files.
- TypeScript: passed.
- Isolated production build: passed with `STACK127_TEST_DIST_DIR=.next-build npm run build`.
- Real PDF probes: a 19-page object-stream specification and a 93-page manual both parsed in page order with embedded fonts and no false findings.
- Local integration: all five routes returned HTTP 200 from the user's port 3333 server.
- Development registry: all five guarded preview rows are enabled at tool version `1.1.0`.
- Working tree check: `git diff --check` passed.

The full test suite initially showed one failure because the restricted sandbox blocked an existing self-host-apps test from spawning child Node processes. The same test passed 4/4 with the required permission, and the complete permitted suite then passed 1,103/1,103.

## Interface and writing assessment

Each page now has one lead answer, one primary action, field-associated recovery, result focus, reset behavior, copy recovery, and concise limits. Metadata distinguishes stale results from current input. PDF preflight labels paperback cover scope accurately and offers a deterministic text download. Narrow layout checks passed, and the routes use the shared tool controls and page shell.

## Publication state and remaining work

There are no confirmed tool defects or required verification gaps in this review. The development registry rows are intentionally enabled so the local links resolve. Production remains untouched, and the route manifests still mark these pages unpublished. Publication, production data changes, deployment, and release approval are separate decisions.

Dependency installation reports six existing npm audit findings: two moderate, three high, and one critical. They were not changed because an indiscriminate dependency upgrade is outside this five-tool fix and needs its own compatibility review.

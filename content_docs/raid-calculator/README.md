# RAID Capacity and Level Explorer

Route: `/raid-calculator`

Publication state: unpublished until this page passes its own launch checks and receives explicit publication approval. No production `public.stack127_pages` row or migration belongs to this tool yet.

The page uses the shared engine in `lib/storage/` and the version 1 formula contract in `formula.md`. It calculates theoretical array capacity only. It does not predict filesystem-usable capacity, IOPS, throughput, rebuild time, or data-loss probability.

## Page-owned files

- Route and client UI: `app/(site)/(tools)/raid-calculator/`
- Calculation adapter: `lib/storage/raid.ts`
- Formula and page tests: `tests/pages/raid-calculator/`
- Ownership manifest: `tests/pages/raid-calculator/page.json`

## Completion requirements

- All nine supported layouts pass equal-size, mixed-size, minimum-count, invalid-count, and group-boundary fixtures.
- Every valid result reconciles raw capacity with usable, redundancy, and mismatch values.
- Nested layouts display their exact groups and conditional failure tolerance.
- URL state is pinned to calculation and input version 1.
- A clean visit keeps the clean route. Versioned URL state is added only after an input changes, and Reset returns to the clean route.
- The page works with keyboard and screen-reader controls, both themes, and narrow screens.
- The route remains 404 under the production registry and absent from the production sitemap.

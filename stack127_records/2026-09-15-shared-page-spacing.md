# Shared page spacing

## Decision

Use the self-host apps directory gutters across stack127. Text-led pages use a 760px reading width. Directories, tool workbenches, primary data tables, and card grids may fill the available main column. Explanatory tables follow the 760px reading width. Both widths start at the same left edge.

Desktop gutters use `clamp(24px, 2.5vw, 36px)`, with 30px top and 44px bottom padding. At viewport widths of 900px or less, gutters are 22px, with 24px top and 36px bottom padding.

## Implementation

- `PageCanvas` owns outer geometry. Its `reading` prop applies the 760px text width. Its optional `flow` prop keeps a family's internal layout, and `as` preserves article, main, or section semantics.
- `EntryHero` uses the same canvas and reserves drawing space centrally.
- Legal pages, courses, directory results, catalogs, references, tools, the homepage, and the error page use the shared canvas.
- Legal articles and course lessons use the reading width. Tool supporting prose and explanatory tables use the reading width inside the wide tool canvas. Primary result tables, code, internal controls, and cards stay page-owned.
- Footer and mobile menu-bar padding follow the gutter token.
- The static policy rejects direct native wrappers under `AppShell`, nested canvases, old width variants, and custom canvas geometry. Regression tests measure representative page families at seven widths in both themes.
- Current layout rules live in `stack127_docs/design-system.md`, `stack127_docs/css-architecture.md`, and `stack127_docs/page-families.md`.

## Verification

The new alignment test failed against the previous preview before implementation. Type checking, all 999 unit tests, static checks for 294 routes, and production registry verification passed after the change.

The full `npm run quality` browser run encountered pre-existing tests that expect the unpublished backup calculator to render. It correctly returned 404 under the production publication registry. The development browser run was stopped, and verification continued against an isolated compiled preview.

The first wide-layout pass passed its build and alignment checks, but visual review showed that text-only content was too wide. The revised implementation passed all 1,000 unit tests, static checks for 294 routes, the production registry check, and an isolated production build. All 22 width tests passed at seven viewport widths in both themes. Another 83 desktop and mobile checks passed for catalogs, navigation, prose rhythm, tool workbenches, and shell behavior, with one expected mobile screenshot test skipped. Desktop and mobile screenshots of About, a course lesson, the self-host apps directory, and the ZFS calculator were inspected.

A later visual review found that explanatory tables still filled the wide canvas. The table correction passed all 1,000 unit tests, static checks for 294 routes, another isolated production build, and all 22 multi-width layout checks. Browser measurements confirmed that DNS supporting text, DNS supporting tables, and Matter evidence tables each stop at 760px on a 1,600px viewport. The corrected DNS and Matter table renders were visually inspected. Primary interface tables remain wide.

## Scope

No deployment or publication changes. URLs, query pagination, tool engines, public content records, and business-model integrations remain outside this layout change.

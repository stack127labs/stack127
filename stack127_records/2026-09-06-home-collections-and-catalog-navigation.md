# Homepage collections and catalog navigation

## Requested changes

- Remove the Amazon Associate sentence from the shared footer on every page.
- Show top-level directories, tool catalogs, and references on the homepage instead of individual tools, with a useful metric on every card.
- Let visitors switch tool catalogs from the catalog sidebar. Keep individual tool navigation on tool pages.

## Implementation

The homepage includes all eight software and hardware directories, three tool catalogs, and four top-level references. The existing course and Labs collection remain, making 17 cards. Individual tools and individual shortcut sheets are excluded. A route-coverage test checks the home list against the actual directory, catalog, reference, and tool route folders.

Counts use destination data. Software directories use their published app records, hardware directories use their displayed record collections, and reference pages use their reference datasets. The domain catalog shows 10 tools and 2 references separately. Course and Labs counts follow their actual lesson and project lists. Hardware counts do not trigger Amazon enrichment. No counts are invented when data is missing.

DNS, domain, and storage catalog pages share a published-catalog sidebar with the current catalog marked. Tool page sidebars are unchanged. The homepage's existing art and card layout remain, with semantic icons for hardware collections that have no marker spot.

## Verification

Standalone Playwright was used because no in-app browser was connected. Homepage cards, metrics, footer removal, all three catalog grids, theme switching, and the shared mobile sidebar passed the first 10 browser checks. Homepage screenshots were reviewed in dark and light themes at desktop and mobile widths. The mobile capture waits for the closed sidebar before taking the screenshot.

Focused unit checks passed. Type checking passed. Static policy passed for 290 route files. The full quality command stopped at the same 14 existing CLI icon, hardware image, and Amazon review failures, with 847 of 861 unit tests passing. The remaining stages of that combined gate did not run. No production publication, database update, or deployment was performed.

The final click-through check passed from DNS to storage on mobile, then from storage to domain tools on desktop, and into the domain age tool. Its first run exceeded a five-second URL assertion during the first tool-page compilation. It passed with a 30-second development-loading allowance. The destination retained its individual-tool sidebar.

## Disclosure follow-up

The requested footer sentence is removed and affiliate links are unchanged. A replacement disclosure location is not implemented. Amazon still requires conspicuous Associate identification and disclosure with affiliate links. This remains unresolved before release. See [the current disclosure notes](../stack127_docs/amazon-associates.md) and [Amazon's requirements](https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE).

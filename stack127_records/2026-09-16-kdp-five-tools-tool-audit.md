# Five KDP tools audit

Date: 2026-09-16
Commit inspected: `827bdad494216dea94415f494e6cf7161b4b705b`
Scope: `/kdp-book-setup-calculator`, `/kdp-metadata-checker`, `/kdp-royalty-calculator`, `/kdp-pdf-preflight-checker`, and `/kdp-page-count-estimator`
Verdict: Not ready to publish

The worktree was already dirty. The five KDP implementations and their supporting files were untracked, and unrelated modified and untracked work was present. This audit preserved that work.

## Summary

All five route shells, engines, manifests, and planning documents exist. Focused tests, TypeScript, static policy, pipeline-document validation, and the production build pass. Those checks do not prove the tools are complete or correct. Independent probes found wrong production values in the book setup and royalty engines, and the PDF checker does not implement the parser behavior promised by its contract.

The five ownership manifests are deliberately `unpublished`. The running local server returned `404` for every clean route and query-string variant, and none of the routes appeared in `/sitemap.xml`. No development preview rows were added during this read-only audit. The in-app browser was unavailable, so rendered desktop, mobile, keyboard, theme, and clipboard checks remain unverified.

| Tool | Verdict | Highest severity | Main blocker |
| --- | --- | --- | --- |
| KDP book setup calculator | Not ready | P0 | Wrong standard-color and groundwood spine coefficients |
| KDP metadata checker | Not ready | P1 | Contracted checks and submitted-snapshot behavior are incomplete |
| KDP royalty calculator | Not ready | P0 | Wrong ebook royalty equation and wrong black-ink short-book boundary |
| KDP PDF preflight checker | Not ready | P0 | Page order, font embedding, image resolution, size handling, and PDF structure support are unreliable |
| KDP page count estimator | Not ready | P1 | The required result model and KDP guidance are absent |

## Findings

### P0 — Book setup returns wrong spine widths for two supported paperback configurations

Impact: A user can build a cover from a plausible but wrong spine and full-cover width.

Evidence:

- `lib/kdp/specs.ts:183-186` returns `0.0025` for groundwood and `0.002252` for standard color.
- The current KDP paperback specification gives `0.00235 in/page` for groundwood and `0.002347 in/page` for color paper. See [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950) and [Create a Paperback Cover](https://kdp.amazon.com/en_US/help/topic/G201953020).
- An independent 300-page probe returned `0.7500 in` for groundwood instead of `0.7050 in`, and `0.6756 in` for standard color instead of `0.7041 in`.
- `content_docs/kdp-book-setup-calculator/implementation-report.md:95` and its downstream test contract encode the same obsolete assumptions, so this is a research, contract, engine, and fixture defect.

Recommendation: Correct the source contract first, use the current KDP coefficients in the shared specification, recalculate cover fixtures, and add exact coefficient tests for every interior and paper branch.

### P0 — Ebook royalty deducts delivery cost outside the 70% multiplier

Impact: The calculator understates a 70% ebook royalty. At `$9.99` and `5 MB`, it returns `$6.24`; the current KDP equation returns `$6.47` after cent rounding.

Evidence:

- `lib/kdp/royalty.ts:142-150` calculates `round(price × 70%) - delivery`.
- KDP defines the equation as `70% × (list price - VAT - delivery cost)`. For the calculator's fixed Amazon.com, zero-VAT scope, the independent oracle is `round(($9.99 - $0.75) × 70%) = $6.47`. See [Digital Book Pricing Page](https://kdp.amazon.com/en_US/help/topic/G200634500).
- `tests/pages/kdp-royalty-calculator/kdp-royalty-calculator.test.mjs:50-61` expects the wrong `$6.24`, so the focused suite passes while protecting the defect.

Recommendation: Update the product contract and engine equation together, confirm cent-rounding order against KDP examples, and replace every ebook royalty fixture before release.

### P0 — Paperback black-ink books at 109 and 110 effective pages use the wrong printing-cost branch

Impact: Printing cost, minimum price, royalty, margin, ad headroom, target copies, and comparison rows are wrong at a real KDP boundary.

Evidence:

- `lib/kdp/royalty.ts:97-105` uses the fixed-cost branch only through 108 pages.
- KDP's Amazon.com black-ink paperback table applies the fixed `$2.30` regular-trim cost through 110 pages. See [Paperback Printing Cost](https://kdp.amazon.com/en_US/help/topic/G201834340).
- Independent probes returned `$2.32` for raw 109 and 110 pages. Both should return `$2.30`; raw 111 normalizes to 112 and returns `$2.34`.
- The detailed test contract names this exact boundary, but the implemented test file does not exercise it.

Recommendation: Change the paperback black-ink threshold to 110 effective pages and add exact 108, 109, 110, and 111 raw-page fixtures for regular and large trims.

### P0 — The PDF checker does not implement a dependable PDF document model

Impact: A valid PDF can receive wrong page numbers, false font warnings, no useful image-resolution result, or an invalid result because of ordinary PDF structure. The tool can also parse a file larger than the stated 650 MB limit on the main thread.

Evidence:

- `lib/kdp/pdf-preflight.ts:76-83` discovers objects with one regular expression. It does not resolve cross-reference streams or object streams.
- A real PDF 1.5 file at `/usr/share/doc/shared-mime-info/shared-mime-info-spec.pdf` has 19 pages according to `pdfinfo` and seven embedded fonts according to `pdffonts`. The checker returned `invalid`, zero pages, zero fonts, and `no-pages`.
- A real PDF 1.4 file at `/usr/share/doc/printer-driver-foo2zjs/manual.pdf` has 93 pages and four embedded Type 1C fonts according to Poppler. The checker found all 93 pages but reported all four fonts as unembedded.
- `lib/kdp/pdf-preflight.ts:223-245` numbers pages in object declaration order instead of traversing the page tree's `/Kids` order. An independent two-page fixture declared object 3 before object 4 but set `/Kids [4 0 R 3 0 R]`; the checker reported widths in `6, 8.5` order instead of `8.5, 6`.
- `lib/kdp/pdf-preflight.ts:256-260` looks for `/FontFile` directly in the font dictionary. Normal embedded fonts commonly reference a separate `/FontDescriptor`, which owns `/FontFile`, `/FontFile2`, or `/FontFile3`. An independent fixture with that standard indirection was reported as unembedded.
- `lib/kdp/pdf-preflight.ts:258-261` treats an image as measurable only when its object contains a nonstandard DPI or resolution key. It does not derive effective DPI from image pixels and the content-stream placement transform, even though the implementation contract requires that calculation.
- `lib/kdp/pdf-preflight.ts:220-224` adds a warning for files over 650 MB and continues parsing. The contract makes the limit blocking and requires enforcement before parsing.
- `app/(site)/(tools)/kdp-pdf-preflight-checker/kdp-pdf-preflight-checker.tsx:76-85` offers a hardcover-cover check based on estimated geometry. The product contract explicitly excludes hardcover-cover formulas.
- The implemented PDF tests use simplified objects that place `/FontFile` directly on the font and do not cover page-tree order, descriptors, object streams, xref streams, effective image DPI, or the blocking size boundary.

Recommendation: Replace the regular-expression parser with a bounded PDF parser that supports the contracted structures, or reduce the product contract and interface to facts the current parser can prove. Do not publish an image-DPI or embedded-font verdict until realistic fixtures pass.

### P1 — The metadata checker omits contracted review patterns and discards the checked snapshot on edit

Impact: The checker can show `No issues found` for text that contains a Unicode emoji or a bare domain, and users cannot compare an edited field with the prior checked snapshot as planned.

Evidence:

- The current KDP description rules prohibit Unicode emojis and website URLs. See [Metadata Guidelines for Books](https://kdp.amazon.com/en_US/help/topic/G201097560) and [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630).
- `lib/kdp/metadata.ts:130-158` has no emoji matcher and detects URLs only when they start with a scheme or `www.`. An independent description containing `🙂` and `example.com` produced no finding.
- `content_docs/kdp-metadata-checker/implementation-report.md:88` requires domain-like URL and emoji warnings, and `edge-cases-and-tests.md:86` names both fixtures.
- `app/(site)/(tools)/kdp-metadata-checker/kdp-metadata-checker.tsx:75-79` clears the prior result on every edit. The interface contract requires the previous submitted result to remain visible and clearly marked stale until `Check again`.
- The engine pads or truncates malformed keyword arrays while also returning calculated values. The contract requires wrong keyword shape to produce input error with no result payload.

Recommendation: Complete the bounded matcher set, separate input-shape failure from calculated metadata values, and implement an immutable submitted snapshot with a visible stale state.

### P1 — The royalty result has additional boundary and state defects

Impact: Some valid results show impossible comparison prices or lose the meaning of an explicit zero target.

Evidence:

- `lib/kdp/royalty.ts:157-160` maps a target of zero to `null`; the contract requires zero copies for a zero target and reserves `null` for a blank target or an impossible positive target.
- The client default at `app/(site)/(tools)/kdp-royalty-calculator/kdp-royalty-calculator.tsx:28-30` sets the optional target to zero, then displays `Add a target` because the engine returns `null`.
- `lib/kdp/royalty.ts:188-189` and `:237-238` add `selected price + $1` without applying the active maximum. A valid `$250` paperback result includes an invalid `$251` comparison row; a valid `$200` ebook result can include `$201`.
- `lib/kdp/royalty.ts:260` links hardcover results to the paperback printing-cost source instead of the hardcover printing-cost source.

Recommendation: Model blank, zero, positive, and impossible targets separately; bound and deduplicate every comparison candidate; and return the format-specific source set.

### P1 — The page-count engine and interface omit required planning evidence

Impact: The range is not auditable from the rendered result, and the tool omits the KDP guidance that tells a user when the estimate crosses a margin band or falls below the paperback floor.

Evidence:

- `lib/kdp/page-count.ts:27-39` and `:122-132` return only trim, words-per-page range, text pages, total pages, additions, and one model sentence.
- The contract also requires raw totals, text-block dimensions, range midpoint, calculation and input versions, local model constants, the 24-page floor warning, every touched inside-margin band, and above-table guidance.
- `app/(site)/(tools)/kdp-page-count-estimator/kdp-page-count-estimator.tsx:83-104` renders none of those required fields or official source details.
- The same range is repeated in `ToolResultLead` and `ToolPrimaryResult`, which `interface-contract.md:286` explicitly says to remove.
- The current unit tests check only parity, broad range shape, one zero-word case, and two invalid fields. They do not assert the default oracle, midpoint, guidance bands, floor warnings, model version, or source receipt.

Recommendation: Finish the typed result contract before changing the interface. Add exact formula fixtures and render one range-first result with the required model and KDP evidence.

### P1 — Contracted browser acceptance coverage is absent for all five tools

Impact: Invalid focus, raw-input preservation, reset focus, clipboard failure, stale-result behavior, responsive overflow, actual light and dark themes, reduced motion, URL cleanliness, and result hierarchy can regress without a failing test.

Evidence:

- Every `edge-cases-and-tests.md` calls for a route-owned `*.spec.ts` suite.
- Each KDP ownership manifest lists only the engine test and the static route test. No KDP browser spec exists.
- The five client components focus a valid result section, but none implements the contracted first-invalid-field focus or reset focus path.
- Shared `ToolCopyAction` reports `Copy failed` briefly after clipboard and fallback failure; it does not expose the contracted selectable manual-copy recovery.
- The focused tests pass because they cover a small subset of the ready test contracts. The critical coefficient, ebook equation, PDF structure, metadata pattern, and page-count evidence defects above are untested or encoded as wrong expectations.

Recommendation: Add the promised browser suites and expand pure fixtures before publication. Use realistic PDF fixtures and independent source-backed royalty and setup oracles rather than deriving expected values from the same implementation assumptions.

### P2 — Result hierarchy repeats the primary answer on three pages

Impact: The answer competes with itself and makes the result longer without adding information.

Evidence:

- Book setup renders the full cover dimension in both `ToolResultLead` and `ToolPrimaryResult` at `kdp-book-setup-calculator.tsx:143-150`.
- Royalty renders royalty per sale in both regions at `kdp-royalty-calculator.tsx:125-130`.
- Page count renders the same range in both regions at `kdp-page-count-estimator.tsx:83-87`.
- The route interface contracts require one dominant answer and explicitly reject these duplicate lead patterns.

Recommendation: Give each result one primary answer owner and use the next region for a different question.

## Verification record

| Check | Result |
| --- | --- |
| Five focused engine tests plus five route tests | Pass, 10 of 10 files |
| Five `validate-pipeline.mjs --stage=test` checks | Pass |
| TypeScript | Pass |
| Static policy | Pass, 303 route files checked |
| Production build | Pass after running with host network-interface access |
| Full `npm run test` | Fail, 183 of 184 unit subtests pass; the failure is the unrelated `tests/pages/self-host-apps/technical-refresh-review.test.mjs` |
| Real PDF probes | Fail: one 19-page PDF 1.5 file returns zero pages; one 93-page PDF 1.4 file reports four embedded fonts as unembedded |
| Clean local KDP routes | All return 404, as expected for unpublished rows without development preview data |
| Query-string route variants | All return 404 |
| Sitemap | No KDP routes present |
| Rendered browser QA | Not run: no preview rows, and the in-app browser runtime reported `No browser is available` |

The focused pass does not change the verdict. It proves that the current implementation matches its small implemented test set, including at least one wrong ebook expected value.

## Publication and data state

- All five ownership manifests remain `unpublished` with an explicit review reason.
- The running app used the managed development database host from `.env.local`; the production database host in `.env.database` was inspected only to confirm it was different. No secret values were printed.
- No registry row, tool-page content row, migration, sitemap entry, metadata, or publication state was changed.
- `scripts/kdp-tools/preview-local-pages.mjs` is a guarded development helper, but it writes temporary publication-like rows. It was inspected and not run during this read-only audit.

## Required work before publication

1. Correct the setup and royalty source contracts and engines, then replace the wrong fixtures.
2. Redesign or narrow the PDF parser so every displayed verdict is supported by realistic PDF fixtures.
3. Complete metadata pattern and stale-snapshot behavior.
4. Complete the page-count result type, KDP guidance, version receipt, and result hierarchy.
5. Add the five browser suites and run the documented desktop, tablet, narrow, 375 px, and 320 px matrix in both actual site themes.
6. Create guarded development preview rows only for the verification run, inspect every required state, then remove those rows.
7. Re-run focused tests, full static policy, the production build, and a clean repository-wide test run.

No product code, public copy, database data, metadata, or publication state was changed by this audit. This report is the only audit artifact added.

# Kindle Unlimited KENP Earnings Calculator

Route: `/kindle-unlimited-kenp-earnings-calculator`

## Research

### User job

An author enrolled in KDP Select wants to turn Kindle Unlimited page reads into an estimated royalty amount for a particular month. If planning ahead, they may also model a month from estimated borrows, their book's KENPC, and an assumed read-through rate. KDP does not publish an individual book's future borrow or read-through volume.

No existing KENP calculator route or engine was found in the repository. The related `/kdp-royalty-calculator` covers Kindle eBook sales and print royalties; its brief and interface contract explicitly exclude KENP and Kindle Unlimited earnings. The two jobs use different inputs and payout rules.

### Competitor patterns

Direct tools inspected on 2026-09-28:

- [Kindlepreneur KENP Calculator](https://kindlepreneur.com/kenp-calculator/) asks for a book's KENP count and marketplace, then shows what a complete read is worth and recent per-page rates. Its page showed a February 2026 rate of $0.00458 during this review. After changing the page-count input from 200 to 300, the displayed $0.9160 result did not refresh in the inspected browser session, so live recalculation could not be confirmed.
- [ScribeCount KENP Earnings Estimator](https://scribecount.com/tools/kenp-earnings-estimator) asks for monthly KENP reads and a per-page rate; it also shows annualized earnings at the same rate, earnings per 1,000 pages, a sale comparison, and a break-even read count. Its default is $0.00452, labeled a mid-2025 average. I changed the inputs to 60,000 reads and $0.005; the page updated to $300 monthly, $3,600 annual, and $5 per 1,000 pages. The annual value repeats the supplied rate rather than forecasting future rate changes.
- [SmartKDP KENP Calculator](https://smartkdp.com/tools/kenp-royalty-calculator) leaves the rate blank until a user enters one from their KDP report. It supports reported KENP reads or an estimate based on borrows, KENPC, and a user-selected read-through; it also estimates a KENPC range from word count and content type. Its loaded state labels the rate unavailable when it has no verified rate on file.

The recurring calculation is page reads times a per-page rate. Some tools use a hard-coded or dated rate; others require the user to supply one. Borrow-based estimates add user assumptions about reads per borrower. Stale default rates and annual repeats can make arithmetic look like a current quote or forecast. KENP rates vary by month and marketplace, so each rate needs a fund month, marketplace, and matching currency. A borrow-based estimate must also be distinguished from reported pages read.

### Technical facts and sources

- **Eligibility and paid activity:** KENP royalties apply to eligible Kindle eBooks enrolled in KDP Select. KU pays for pages an individual customer reads for the first time; rereading those pages does not earn again. KDP allocates the monthly Select Global Fund according to each title's share of total pages read. See [Royalties in Kindle Unlimited](https://kdp.amazon.com/en_US/help/topic/G201541130). The separate, discretionary [KDP Select bonus](https://kdp.amazon.com/en_US/help/topic/G201623400) is not calculable from KENP reads and should not be folded into a KENP estimate.
- **KENP units and cap:** Amazon uses its normalized KENPC v3.0 count rather than a reader's display settings or the book's print-page count. The count is based on the uploaded eBook and is shown on the KDP Bookshelf's Promote and Advertise page. Amazon credits no more than 3,000 KENP per title per customer. See [Royalties in Kindle Unlimited](https://kdp.amazon.com/en_US/help/topic/G201541130).
- **Rate and formula:** KDP defines the KENP Rate as the amount paid per page read. The KDP Royalties Estimator can use the rate from the latest announced Global Fund or a user-entered increase or decrease scenario. The rate changes monthly; KDP defines a marketplace's rate as that marketplace's Global Fund divided by its total KENP read for the month. For a stated month and marketplace, `KENP Read × KENP Rate = estimated KENP royalties`. Use the read count and rate for the same marketplace and currency. See [Royalties Estimator](https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8).
- **Source of actuals and timing:** KDP Reports show KENP Read by marketplace and title. Monthly KENP totals can change and are finalized near the 15th of the following month. The Prior Months' Royalties report contains the royalty earned; the Royalties Estimator shows an estimate rather than the final amount paid. See [KDP Reports](https://kdp.amazon.com/en_US/help/topic/GVTTXHKHVPAPBEDQ) and [Royalties in Kindle Unlimited](https://kdp.amazon.com/en_US/help/topic/G201541130).
- **Estimate limits:** When a user models pages from borrows, `borrows × KENPC × assumed read-through` is scenario arithmetic, not an Amazon forecast; cap each modeled borrow at 3,000 eligible pages per customer. KDP's official help does not define a conversion from manuscript word count to a reliable KENPC count. Its estimator help says actual royalties can differ because exchange rates change by payment time. Rounding behavior for a third-party estimate is not specified in the reviewed KDP help.
- **Source precedence:** For a past month, the author's KDP Prior Months' Royalties report is the account-specific record. For an estimate, use the KENP Rate surfaced by the author's KDP Royalties Estimator or an explicitly user-entered rate tied to a month and marketplace. A fixed third-party average or undated rate is only an assumption, not an official current rate.

### Opportunity and blockers

An estimate can work without a live data feed if the user supplies KENP reads and a rate, or supplies clearly marked assumptions for a planning scenario. This keeps the arithmetic useful while leaving changing rates and read-through assumptions visible. Do not imply a user-entered rate is current unless its month and marketplace are stated.

No paid API, account connection, or background job is needed for that user-input model. An automatically current rate would require a maintained, month- and marketplace-specific dataset. No official public machine-readable rate feed was verified in the reviewed KDP help; whether one exists is unknown. If rate history is added later, its source, marketplace, currency, fund month, and update date need to be maintained and exposed. There is no blocker for an estimate based on user-entered assumptions.

## Product

### Promise and scope

An independent author with a KDP Select Kindle eBook wants to estimate what one month's Kindle Unlimited reads could earn. Enter the KENP Read total for one title, month, and marketplace, then enter a per-KENP rate in that marketplace's currency. Show the multiplication and a clearly labeled estimated royalty. The author can use a rate copied from their KDP Royalties Estimator or a rate chosen for planning; the tool cannot verify either value. This fills the KU gap in `/kdp-royalty-calculator`, which handles sales royalties.

Launch with one aggregate KENP Read total and one rate. Do not ship a default, recent, average, or automatically fetched rate. The user supplies the month, marketplace, currency, and whether the entered rate is from KDP or a planning assumption. A rate copied from a different month must be marked as a planning assumption for the selected month. The result is scenario arithmetic, not a final KDP royalty, current rate quote, payment prediction, or net author profit. For actual past royalties, direct the author to KDP Prior Months' Royalties.

Exclude borrow-count and read-through projections, KENPC or word-count conversion, multi-title and multi-marketplace totals, rate history, currency conversion, taxes, bonuses, rereads, account connection, report imports, and annualized earnings. A future borrowing model would need KENPC, an assumed read-through rate, and per-customer cap handling; those inputs do not belong in this aggregate-read task.

### Technical contract

| Input | Contract |
| --- | --- |
| Earnings month | Required `YYYY-MM`, with a four-digit year from `0001` through `9999` and month `01` through `12`. It identifies the KDP fund month being estimated, including a future planning month. No automatic current-month default. |
| Marketplace | Required user-entered KDP marketplace label, such as `Amazon.com`; trim surrounding whitespace, require 2 to 80 printable characters, and display it as plain text. The tool does not verify a marketplace or derive its currency. |
| Currency | Required ISO 4217 code supported by the local currency formatter, entered as three ASCII letters and normalized to uppercase. The user must match the rate and KENP total to the same marketplace and currency; there is no exchange-rate conversion or automatic mapping. |
| KENP Read | Required aggregate credited KENP pages for one title, month, and marketplace, preferably from KDP Reports. Accept a whole number from `0` through `1,000,000,000` inclusive. Zero is a valid no-reads scenario. This is not the book's KENPC, print-page count, or a per-customer count. The maximum is a calculator bound, not a KDP rule. |
| KENP rate | Required amount in the selected currency **per one KENP**. Accept a decimal greater than `0` and no more than `1,000`, with up to eight digits after the decimal point. This generous ceiling is a calculator bound, not a claimed payout range. Start blank. |
| Rate basis | Required choice: `Rate I entered from KDP for this month` or `My planning assumption`. Default to the latter. The first choice is still user-reported; the tool does not authenticate it. If the user reuses a past rate for another month, they must choose the assumption basis. |

Trim surrounding whitespace on text inputs. Accept plain ASCII digits and one optional decimal point for the rate; accept only plain ASCII digits for KENP Read. Reject grouping commas, signs, exponent notation, percent signs, currency symbols, fractions, extra decimals, negative values, malformed months, unsupported currency codes, and out-of-range values. Do not coerce invalid text or silently round an input. Show field-level errors and retain the entered text. The engine must validate independently of browser controls.

For valid input, calculate `estimated royalty = aggregate KENP Read × entered rate`. Use fixed-point decimal arithmetic with the rate stored in units of `10^-8` currency, so large counts and half-unit cases do not pick up binary floating-point error. Round the final product once, half up, to the selected ISO currency's usual minor unit (for example, cents for USD and whole units for JPY). Do not round the rate first or round per page. If a positive result is smaller than one display unit, show `Less than 0.01 USD` or the corresponding currency unit instead of a misleading zero. Exact zero reads shows `0` in the selected currency. Show the entered pages, rate with its full entered precision, currency, month, marketplace, and rate basis alongside the estimate. Do not add an inferred uncertainty band: the user can change the rate to compare scenarios.

KDP's 3,000 KENP limit is **per title per customer**. Do not cap this aggregate KENP Read input at 3,000 or apply `min(pages, 3,000)` to the result; a month's credited total may include many customers. The KDP report's KENP Read is the appropriate credited aggregate. The calculator has no per-customer information with which to reapply KDP's eligibility rule. Rereads and other ineligible activity are outside this arithmetic.

The rate is monthly and marketplace-specific. If the selected month has no known final rate or the author cannot find a matching KDP rate, the page must say the payout rate is unknown until the user enters an assumption; do not show a numeric royalty. A rate copied from KDP takes precedence over third-party averages as an input source, but the author's Prior Months' Royalties report remains the source for the final amount. The page must never relabel this calculation as a confirmed payment. Invalid or missing inputs produce no partial money result. An unexpected local calculation failure clears any stale result, preserves inputs, and gives a retry path through the same action.

The primary action is `Estimate KENP earnings`. Initial state has blank month, marketplace, currency, pages, and rate, with the planning basis visible and no result. A valid submission shows the estimate and its assumptions. Editing an input clears the old estimate until the next submission. Reset restores the initial state. Calculation runs locally in the browser, with no rate fetch, account access, upload, storage, or submission of entered values to a server. Keep user-entered marketplace text escaped in the UI; do not interpret it as HTML or a URL. No query-string state or share link is needed for launch.

### Known examples

Use `Amazon.com`, `USD`, and a valid month for these arithmetic checks; the rates are hypothetical inputs, not asserted official rates.

| Entered KENP Read and rate | Expected result |
| --- | --- |
| `60,000` pages and `0.00458 USD/KENP` | `60,000 × 0.00458 = 274.80000`, displayed as `274.80 USD`. The comma here is explanatory formatting; the input field receives `60000`. |
| `125` pages and `0.00452 USD/KENP` | Exact product `0.56500 USD`, rounded once half up to `0.57 USD`. |
| `1` page and `0.00458 USD/KENP` | Exact product `0.00458 USD`, displayed as `Less than 0.01 USD`. |
| `3,001` aggregate pages and `0.00452 USD/KENP` | Exact product `13.56452 USD`, displayed as `13.56 USD`; do not cap the aggregate to 3,000. |
| `0` pages and `0.00458 USD/KENP` | `0.00 USD`, a valid zero-read result. |
| `60000` pages and `0.004521234 USD/KENP` | Rate has nine fractional digits, so show a rate error and no estimate. A blank rate or `60,000` in the pages field is likewise invalid. |

### Ownership

The flat route is `app/(site)/(tools)/kindle-unlimited-kenp-earnings-calculator/page.tsx`; it uses the shared shell, `PageCanvas`, and tool-page renderer. Put the pure validation and arithmetic engine in `lib/kdp/kenp.ts`, the client form and result in the route's `kindle-unlimited-kenp-earnings-calculator.tsx`, and route-only layout in its `.module.css` if shared tool styles do not cover it. Put focused arithmetic and validation tests in `tests/pages/kindle-unlimited-kenp-earnings-calculator/kenp.test.mjs`. No new page-specific script or external data table is needed.

The page's publication and SEO record belongs to `public.stack127_pages`; title, introduction, usage, supporting copy, card fields, and version belong to `public.stack127_tool_pages`; catalog links belong to `public.stack127_tool_catalog_memberships`. Use the existing `scripts/stack127/tool-pages/update-content.mjs` and `update-catalogs.mjs` workflow for development content and placement. The calculation constants are the user's inputs, not a maintained payout table.

### Catalog placement

Primary catalog: `/kdp-tools` (`catalog_rank = 1`). An independent author looking for KDP pricing and earnings tools can find the KU estimate beside the existing KDP sales royalty calculator. No secondary catalog fits this specific publishing task; no new catalog is needed.

Catalog `toolSpot` art key: `kindle-unlimited-kenp-earnings-calculator`. Draw an open eBook with a short stack of page edges leading toward one simple coin shape. The single takeaway is that pages read feed an earnings estimate. Keep the tone measured and provisional, with no payout amount, currency sign, brand logo, or visible words. The book remains the focal subject; the coin is the only supporting object. Use the catalog card's small format and check legibility in both themes.

## Interface

### Flow

The reader's question is: `What could this month's KENP reads earn at the rate I enter?` Use one `single` control mode. All six Product inputs remain visible because month, marketplace, currency, reads, rate, and rate basis define the estimate; none belongs in an advanced disclosure. The primary action is `Estimate KENP earnings`. The lead answer is one neutral `Estimated Kindle Unlimited royalty` amount in the entered currency. An explicit submit separates edited assumptions from the last calculated scenario.

Use the shared full-width tool workbench band, with a measured inner form and the result below one divider. In DOM and reading order, group `Earnings month` (`YYYY-MM`), `Marketplace`, and `KENP Read` as the reported-read context. Follow with `Currency code`, `Rate per KENP`, and the two visible `Rate basis` choices. The currency field sits directly beside the rate on desktop and immediately before it on mobile; the rate label includes the validated code when available, such as `Rate per KENP (USD)`. The rate-basis choices are `Rate I entered from KDP for this month` and `My planning assumption`, with the Product default selected. Keep a short visible hint by KENP Read that this is the month's aggregate credited pages from KDP Reports, and one by the rate that KDP rates change by month and marketplace. Do not supply a sample value as an active rate. Place the primary action first and a quiet `Reset` second.

On success, present these regions in order:

1. One `UiPrimaryResult` with the estimated amount and neutral tone. Its short detail says that the calculation uses the entered rate, not a confirmed payout. Show the Product's `Less than` form for a positive result below one currency minor unit; exact zero reads show the currency's zero amount.
2. One compact calculation receipt, using `UiKeyValueList`: `Calculation` shows the page count multiplied by the full entered rate, for example `60,000 KENP × 0.00458 USD/KENP`; the remaining rows give `Earnings month`, `Marketplace`, and `Rate basis`. Do not repeat the displayed rounded royalty in another row or add an equal-size second result card.
3. One visible verification sentence: this is an estimate from user-entered values; the KDP Prior Months' Royalties report gives the final past amount. Link to the official report help from Research. When aggregate pages exceed 3,000, add one short note that 3,000 is per title per customer and is not a cap on a monthly aggregate. Do not turn it into a warning verdict.
4. A quiet `How this estimate works` disclosure for the one multiplication, rounding rule, KDP rate and report sources, and the rule about first-time credited pages. This is evidence only; the live assumptions and result stay outside it.

No chart, table, progress bar, sale comparison, annual projection, or rate history helps answer this single multiplication. The catalog `toolSpot` art is for the card, not the workbench.

### Components and states

The `/components-ui` gallery and `/kdp-royalty-calculator` were inspected in the running development site at 1280px and 390px on 2026-09-28. The gallery shows the shared text field, choice group, action row, primary result, key-value rows, and status treatment; the KDP sibling uses the same workbench and form-result split. Reuse these shared primitives and their existing tokens, focus ring, labels, error placement, and dark/light styles. The field grouping, formula receipt, conditional 3,000-page note, and local state are route-owned composition. No new shared component is needed.

| Need | Component decision |
| --- | --- |
| Month, marketplace, currency, KENP Read, rate | Reuse `UiTextField` with persistent labels, visible and programmatic required state, descriptions, and inline error slots. Keep raw strings for Product's strict validation. Month uses text mode so `YYYY-MM` remains editable; pages use numeric input mode; rate uses decimal input mode; currency uses text mode with capitalization off. Preserve the raw code while editing, then let the engine uppercase it before ISO validation. Disable autocomplete and spellcheck. Use a realistic example placeholder only for month and marketplace, never a prefilled payout rate. `UiNumberField` would coerce malformed or overprecise input, so it is unsuitable here. |
| Rate basis | Reuse `UiChoiceGroup` with real radio semantics and two choices visible together. Arrow keys change the choice; the selected state is readable without color. Default to `My planning assumption`, and show a field error for any unsupported value at the engine boundary. |
| Actions | Reuse `UiActionRow` with a primary submit `UiButton` and a ghost `Reset` button of type `button`. Both remain usable while fields are incomplete so submission can explain what is missing. No copy, share, upload, or alternate calculation action. |
| Result and status | Reuse neutral `UiPrimaryResult` as the sole dominant answer, `UiKeyValueList` for the compact receipt, `UiDisclosure` for method and sources, and danger `UiStatus` only for an unexpected local failure. Use plain supporting text for the unknown-rate initial prompt and final-report verification. No result table or new display primitive is needed. |

| State | Visible behavior and recovery |
| --- | --- |
| Initial or unknown rate | Show blank Product text fields, the selected planning basis, the enabled action, and a short prompt: `Enter your KENP reads and a rate to estimate earnings.` No numeric result or implied current rate. If a rate is unavailable, the author may enter a planning assumption; the tool cannot fill it automatically. |
| Editing | Preserve the raw text and focus. Clear any prior estimate, receipt, and failure when a result-driving input changes. Clear that field's old error; do not calculate on each keystroke or let the old amount appear to describe new inputs. |
| Invalid or incomplete | Keep all inputs. Show one specific error beside each affected field, including missing rate, malformed month, unsupported currency code, grouped page count, rate precision, and out-of-range values. Focus the first invalid field in DOM order on submit. Show no amount, receipt, or duplicate error banner. A missing rate is unknown payout, not zero payout. |
| Valid positive, subunit, or zero | Focus the neutral lead result and show the receipt, verification, and optional cap clarification. `Less than 0.01 USD` remains visibly positive; `0.00 USD` occurs only when KENP Read is zero in that example. Do not color a positive estimate as approval or success. |
| Loading, empty, partial, disabled | Calculation is synchronous and local, so there is no loading state, network-empty result, partial money result, or disabled submit. A valid zero-read case is a complete result. |
| Unexpected failure and retry | Remove the stale amount and receipt, retain all inputs, and announce one danger `UiStatus`: `The estimate could not be calculated. Try again.` The primary submit action is the retry; do not add a competing retry button. |
| Reset and restored | Reset clears fields, errors, failure, and result, restores the planning basis, announces `Calculator reset`, and focuses the month field. Opening or reloading the clean route starts in this state. Do not write defaults or edits to the URL, session storage, or local storage. Browser back/forward cache may retain the entire form and matching result; the next edit clears that result. |
| Long values | Let an 80-character marketplace, a billion-page value, a rate with eight decimals, and inline errors wrap or stay contained in their controls and receipt rows. Show full values without truncating them or creating page-level horizontal scroll. |

### Responsive and accessible behavior

At desktop width, keep a measured form within the wide workbench. Month and marketplace may share one row; KENP Read takes the next row; currency code and rate share a row, with currency first; rate basis spans the form width; actions follow. The result begins below the form divider and uses the same left edge. Avoid a side-by-side form and result because the result should follow the committed scenario in reading order. At 600px and below, stack every field in the same DOM order and make the primary and Reset actions full width, primary first. Let radio labels wrap as one group. At 390px and 320px, the lead, receipt, note, and source disclosure stay inside the page; no table or internal horizontal viewport is required. Inspect both themes when built.

Use a real form. Enter submits from a text field; Reset never submits. The shared controls provide labeled inputs, visible required marks, associated descriptions and errors, and focus styling. Give every control a stable focus key. On invalid submit, focus the first invalid input so its linked error is announced. On valid submit, move focus to `UiPrimaryResult`; its label and amount announce the outcome once, without a second success live region. On failure, `UiStatus` announces the problem while input stays available. When an edit removes a prior result, keep focus in the edited control and announce `Inputs changed. Estimate again.` only once for that transition, not on every keystroke. Reset announces once and focuses month. Keep all qualifications readable without relying on tone or color.

Observable build checks:

- `UI-01`: The clean URL stays unchanged, and all six inputs remain visible in one mode.
- `UI-02`: A valid nonzero scenario has one lead amount and one receipt; changing pages or rate updates the next estimate. Missing rate never produces zero money.
- `UI-03`: 3,001 aggregate pages are not capped, and a positive subunit amount is not displayed as zero.
- `UI-04`: Invalid text focuses its field, shows one local error, and removes stale money. Reset and a later valid submission recover without lost input.
- `UI-05`: At 1280px, 390px, and 320px, long values, errors, source links, and actions remain readable in both themes with no page-level horizontal overflow.

There is no unresolved interface blocker.

## Content

Follow `stack127_docs/writing-style.md` for writing, visual choices, and SEO wording.

Use the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md` to prepare the writing directions below.

### Search intent and metadata direction

Target an author searching for a Kindle Unlimited KENP earnings calculator, KENP royalty estimate, or how to calculate earnings from KENP Read. They may have a KDP Reports page total and a rate for one fund month, or they may be testing a rate assumption. Their immediate question is what those entered values multiply to, not what Amazon's current rate is.

Use the writing skill's `Tool name: question or outcome` title pattern. The page title should name Kindle Unlimited or KENP and the estimated earnings question in natural words. The SEO title should identify the calculator and its entered-rate purpose. The SEO description should say that the reader can enter a month's KENP Read and a per-page rate to estimate a royalty, while making clear that the rate is supplied by the reader. Do not advertise live rates, a final payout, or a rate lookup. Avoid repeating “KENP” unnaturally or padding metadata to a character target.

### Page promise

The reader can turn a KDP Select title's aggregate credited pages for one month and marketplace into a transparent royalty estimate at a rate they choose, see the exact inputs behind the result, and know where to check the final past-month amount. They should leave knowing why a missing rate is an unknown amount and why a planning rate remains an assumption.

### Content completeness map

| Reader question | UI already answers | Writing direction |
| --- | --- | --- |
| How are KU page-read royalties estimated? | The result receipt shows `KENP × entered rate` and the amount. | Give the one-multiplication formula with units in the introduction; the tool applies it and rounds the final product for display. |
| Which page count should I enter? | The KENP Read hint says aggregate credited pages from KDP Reports, not KENPC or print pages. | Briefly distinguish reported KENP Read from the book's normalized KENPC length and explain the one-title, one-month, one-marketplace match. |
| What rate and currency should I use? | Rate starts blank; month, marketplace, currency, and rate basis are visible; the result repeats the assumptions. | Explain that KDP rates vary by month and marketplace. A KDP-sourced rate is still user-reported here; a reused or invented rate is a planning assumption. Match currency to that rate, with no conversion. |
| Is this the amount KDP will pay? | The lead says estimated royalty and the verification sentence links the Prior Months' Royalties report. | Clarify that the result is arithmetic on entered values. KDP's past-month report gives account-specific actuals; this tool does not predict future reads or final payment. |
| Why can 3,001 or more pages be entered? | The result adds a conditional cap note above 3,000 aggregate pages. | Explain that KDP's 3,000-page limit applies per title per customer, not to a monthly title total. Do not reapply eligibility rules to a reported aggregate. |
| Why is there no amount, a zero amount, or `Less than 0.01 USD`? | Blank/invalid inputs have no result; zero reads produce a zero amount; positive sub-cent amounts use `Less than`. | Explain unknown rate versus zero reads and final-product rounding. Keep any small-number illustration distinct from a current rate quote. |

### Recommended outline and formats

1. **Title and introduction:** Address the author who has KENP Read for a month and wants a money estimate. Define the rate as money per credited page. Include the complete simple formula `KENP Read × entered KENP rate = estimated royalty` in the introduction, with the requirement that pages and rate refer to the same month and marketplace and use the rate's currency. Point to the calculator for applying it; keep the introduction useful even before the form. The formula is simple enough to appear here rather than being deferred to supporting content.
2. **How to use the estimate:** Explain where the reader gets aggregate KENP Read and an appropriate rate, why month/marketplace/currency/rate basis matter, and how to read the lead amount and calculation receipt. A short numbered sequence is suitable because source selection precedes interpretation; avoid instructions that merely narrate button clicks.
3. **How the calculation works:** Use one `[!EXAMPLE]` block for a clearly hypothetical USD scenario, such as `60,000 KENP × 0.00458 USD/KENP = 274.80 USD`. Say the example rate is entered for illustration and is not a current or verified KDP rate. Explain that the final product is rounded to the currency's display unit, and mention the positive subunit display only if it aids interpretation. The introduction already has the formula, so a second `[!FORMULA]` block is unnecessary.
4. **What KENP Read and the rate mean:** Brief prose about credited aggregate reads, KENPC as a different book-length measure, first-time eligible pages, the per-customer 3,000 cap, and month/marketplace-specific rates. Use a compact `[!NOTE]` only if it makes the cap distinction easier to find; keep the main explanation in prose. Do not add a rate-history table or a chart because the page has no maintained time series.
5. **Estimate versus final royalties:** Explain where a past month's final royalty appears and why a planning assumption cannot establish the final amount. End with the useful report link and, if the author wants to estimate ordinary book-sale royalties, the related stack127 tool. No FAQ, comparison table, or extra marker art is needed for this narrow calculation; the approved `toolSpot` art belongs on the `/kdp-tools` card.

### Concepts and result interpretation

- **KENP Read versus KENPC:** For a single reported month, `60,000 KENP Read` is the aggregate credited activity to enter; a book's `300 KENPC` would be its normalized length, not this field's value. KDP's [KU royalties help](https://kdp.amazon.com/en_US/help/topic/G201541130) controls the units and first-time-page eligibility. The illustrative values do not imply 200 complete reads or a known borrower count.
- **Rate and basis:** `0.00458 USD/KENP` in a worked example is a hypothetical entered rate. The selected fund month and marketplace give it context; choosing `Rate I entered from KDP for this month` records the author's claim but does not verify it. KDP's [Royalties Estimator help](https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8) controls the changing-rate and formula claims. A rate from another month should appear as a planning assumption for the selected month. No current rate or exchange rate is supplied by this page.
- **Estimated Kindle Unlimited royalty:** The observed development result for `2026-08`, `Amazon.com`, `60,000` pages, `USD`, and assumed rate `0.00458` showed `274.80 USD`, with a receipt of `60,000 KENP × 0.00458 USD/KENP` and `My planning assumption`. This confirms the page's result wording, not a KDP payment. The [KDP Reports help](https://kdp.amazon.com/en_US/help/topic/GVTTXHKHVPAPBEDQ) controls where the final past-month amount is found.
- **Zero, unknown, and small positive amounts:** `0` credited pages with a valid rate produces a true zero scenario. A blank or invalid rate produces no numeric estimate because the rate is unknown. One page at the hypothetical `0.00458 USD/KENP` displays `Less than 0.01 USD`; it is positive before display rounding. These are tool behavior examples, not claims about a real month's rate. A currency such as JPY may display whole units instead of cents.
- **3,000-page limit:** An aggregate `3,001` KENP Read can be valid because KDP's limit is per title per customer. The tool does not know the individual customers behind a report total and must not cap it. Use [KU royalties help](https://kdp.amazon.com/en_US/help/topic/G201541130) for the rule; do not present the calculator's one-billion-page validation ceiling as a KDP limit.

### Usage, limits, and next step

Plan around one task: an author opens KDP Reports for one title and a past fund month, reads its marketplace-specific KENP Read, and enters a matching per-page rate and currency. If the author lacks that month's rate or is planning a future month, they choose `My planning assumption` and understand that the amount is conditional on it. The result's receipt lets them check which month, marketplace, rate, and basis they just used. They can change a value and submit a new scenario; the old result disappears while editing.

Address recovery only where it matters: grouped digits such as `60,000` in the input, a malformed `YYYY-MM`, an unsupported currency, a missing rate, or a rate beyond eight decimal places yields a field error and no partial amount. Enter plain digits such as `60000` and a valid rate to continue. A missing rate is not a zero-earnings result. For a past month, the next useful step is to compare with KDP's Prior Months' Royalties report; KDP Reports' KENP totals can be revised until they finalize near the 15th of the next month. Link `/kdp-royalty-calculator` only for eBook sale or print royalty estimates, which answer a separate question.

Avoid claims that the page retrieves, confirms, or predicts a KENP rate; that its example rate is current; that aggregate reads forecast borrows or read-through; that the estimate includes exchange conversion, taxes, bonuses, rereads, sales royalties, or annual earnings; or that the rounded display equals the final payout. Keep the limitation next to any example or recommendation it qualifies.

### Source roles and links

- [KDP Royalties in Kindle Unlimited](https://kdp.amazon.com/en_US/help/topic/G201541130) controls KDP Select eligibility, KENPC/KENP distinctions, first-time credited reads, the per-title-per-customer 3,000 limit, and fund allocation. Link near those claims.
- [KDP Royalties Estimator](https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8) controls the per-page rate definition, month/marketplace variation, and estimate formula. It can help a reader find a rate, but the stack127 tool does not import one.
- [KDP Reports](https://kdp.amazon.com/en_US/help/topic/GVTTXHKHVPAPBEDQ) controls where to find KENP Read, the timing of finalized monthly pages, and where the Prior Months' Royalties report gives the final past-month amount. Link this as the main next action.
- [KDP Select bonus](https://kdp.amazon.com/en_US/help/topic/G201623400) supports a brief exclusion only if bonuses are mentioned. Do not make it a feature of the estimate.
- Internal: `/kdp-royalty-calculator` for sale/print royalties and `/kdp-tools` for the catalog. These are navigation links, not evidence for KU rules.

Research reviewed the KDP help on 2026-09-28. Rates change by month and marketplace, so the writing must not turn any dated example or competitor figure into a current-rate claim. Recheck official help if the published copy adds a changing policy detail.

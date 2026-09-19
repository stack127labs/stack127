# Competitive report: KDP PDF preflight checker

Status: ready
Tool: KDP PDF preflight checker
Route: `/kdp-pdf-preflight-checker`
Researched: 2026-09-16
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

- [Observed] The target route, `content_docs/kdp-pdf-preflight-checker/` docs, and a route ownership manifest were absent before this report was created.
- [Observed] The worktree already contained unrelated tool, test, library, script, and record changes. They were preserved.
- [Observed] An untracked `lib/kdp/specs.ts` and five untracked KDP page test files were present. The target preflight test references `lib/kdp/pdf-preflight.ts`, which was not present in the source inventory at research time. These are existing worktree artifacts, not work performed for this report.
- [Inferred] The intended job is a browser-local PDF inspection tool for KDP paperback and hardcover interiors, with an optional cover path. It should report possible issues and measurable facts, not promise KDP acceptance.

### Method and coverage

- [Observed] Research covered the exact tool phrase, the underlying bleed and trim job, technical PDF checks, mixed-page-size failures, font and image checks, and cover spine calculations.
- [Observed] Eight direct or near-direct products were opened with standalone Playwright because the in-app Browser had no connected browser instance. The inspected viewport was `1280x900` on desktop and `390x844` on mobile. Access date was 2026-09-16, Asia/Kolkata.
- [Observed] The standalone Playwright run used the local Chromium executable after the normal launch hit an operating-system sandbox restriction. The approved read-only execution boundary was used for the live page probes.
- [Observed] Only synthetic probes were used. A deliberately invalid text file named `synthetic-invalid.pdf` was selected on KDPage to observe recovery. No account, payment flow, private document, or real upload was used. Other file controls were inspected without selecting a real PDF.
- [Observed] `STACK127_SEARXNG_URL` and `SEARXNG_URL` were unset. Discovery used the configured web connector. The connector did not expose individual search-engine attribution, so the report records the backend as `web connector` and the engine as `not individually available`.
- [Observed] The in-app visual backend was attempted and returned `No browser is available`. Standalone Playwright supplied the available live interface and mobile observations. No screenshot-based visual claim is made where the page exposed only a static landing-page mockup.
- [Inferred] The first useful product boundary is a local, page-by-page analyzer that accepts a user-selected PDF, asks for the intended KDP configuration when it cannot infer it, and makes every uncertain check explicit.

Search queries tried included:

- `KDP PDF preflight checker`
- `check KDP PDF dimensions bleed fonts`
- `print ready PDF checker book cover`
- `KDP PDF upload validator`
- `KDP print PDF checker upload interior cover tool`
- `site:*.com KDP preflight PDF checker fonts bleed`
- `KDP interior PDF validator checker free browser`
- `self publishing PDF preflight checker KDP IngramSpark Lulu`
- `"PDF checker" "KDP" upload`
- `"KDP PDF" "preflight" checker tool`
- `"KDP" "preflight" "PDF" free tool`
- `"book interior" PDF checker KDP upload`
- `site:reddit.com/r/KDP PDF bleed rejected interior dimensions`
- `site:reddit.com/r/KDP font embedding PDF rejected`
- `site:reddit.com/r/selfpublish KDP PDF trim size bleed error`
- `site:kdpcommunity.amazon.com PDF bleed trim mismatch`
- `site:opensource.adobe.com pdf reference MediaBox CropBox page box PDF`
- `PDF specification page boxes MediaBox CropBox TrimBox BleedBox official Adobe`
- `KDP PDF MediaBox CropBox TrimBox bleed box`

### Search saturation evidence

- `Queries tried:` exact checker phrases, interior and cover variants, technical checks for bleed, dimensions, DPI, fonts, page boxes, and community failure searches. The full query set is recorded above.
- `Repeated domains:` `kdp.amazon.com`, `reddit.com/r/KDP`, `reddit.com/r/selfpublish`, and several specialist checker domains appeared repeatedly. Repetition was treated as a discovery signal, not as proof of market share.
- `Exclusions:` official KDP pages were treated as technical authorities, not competitors. ShipMyBook was adjacent because it checks cover images rather than PDFs. Book Interior Kit, KDPPrintCover, and KDPForge were excluded as generators. PDFDocPreflight was not counted because DNS resolution failed during the live probe. BookReady was not counted because Cloudflare returned 403. KNPLIV exposed only a shell in the captured page. These exclusions are included so the eight reviewed pages are not presented as a larger market census.
- [Observed] The reviewed set covers local interior validators, a PDF preflight landing page, a coloring-page exporter, a manuscript workspace, a browser checker, a cover calculator, and a commercial prepress checker. The narrow market is fragmented and several results are adjacent rather than fully functional competitors.
- [Inferred] Eight live pages are enough for this research stage without claiming exhaustive market coverage. The main gap is not another generic calculator. It is a transparent, source-backed analyzer that shows the exact page and property behind a possible issue.

## Search intent

| Query shape | What the user is trying to learn | Required answer or interaction | Evidence |
|---|---|---|---|
| `KDP PDF preflight checker` | Whether a finished PDF is safe to inspect before upload | Choose a PDF, select or confirm the book configuration, and receive a page-level report | [Observed] KDPage, SmartKDP, and Univers Studio all expose this core intent in their page titles or controls |
| `check KDP PDF dimensions bleed fonts` | Which technical property is causing a warning | Show actual dimensions, expected dimensions, font embedding, and image checks separately | [Documented] KDP submission and formatting guidance lists dimensions, bleed, fonts, and image resolution as separate concerns: https://kdp.amazon.com/en_US/help/topic/G201857950 |
| `KDP PDF mixed page sizes` | Which page differs from the rest of the manuscript | Scan every page, identify outliers, and show actual versus expected width and height | [Observed] SmartKDP describes an all-page measurement; [Observed] community reports mention sample-page or mixed-dimension confusion: https://www.reddit.com/r/KDP/comments/1vyknyx/ |
| `KDP PDF embedded fonts DPI` | Whether the PDF contains print-risk assets | Show embedded-font status and effective DPI only when the PDF exposes enough data, with an unknown state otherwise | [Documented] KDP requires embedded fonts and at least 300 DPI images: https://kdp.amazon.com/en_US/help/topic/G201834260 |
| `KDP cover PDF spine mismatch` | Whether a full cover wrap matches trim, paper, and page count | Calculate the expected cover dimensions, compare the uploaded one-page PDF, and explain the spine coefficient used | [Documented] KDP defines the cover width and height formulas and paper-specific spine coefficients: https://kdp.amazon.com/en_US/help/topic/G201953020 |
| `KDP PDF upload rejected blank page` | Whether an apparently empty or extra page will be flagged | Distinguish a genuinely empty PDF page from a page with hidden or invisible structure, and show the limit that applies | [Documented] KDP describes blank-page and hidden-content failure cases: https://kdp.amazon.com/en_US/help/topic/G201834260 |

## User pain evidence

The community sources below are pain evidence, not technical authority. They are anecdotes that show where generic KDP feedback is hard to act on. They do not establish prevalence.

| Pain signal | What the source shows | Product implication | Direct evidence |
|---|---|---|---|
| Bleed warnings remain hard to diagnose after a user changes dimensions | [Observed] A self-publishing discussion describes a file with the expected 6x9 bleed dimensions and margins that still produced confusion about what KDP wanted. A separate cover discussion describes a repeated bleed warning even after resizing and a later review failure. | Report the page number, actual page box, expected size, and the object or property that can be measured. Do not reduce the answer to `bleed failed`. | https://www.reddit.com/r/selfpublish/comments/1hh8isd/kdp_publishing_trim_size_issues/ ; https://www.reddit.com/r/selfpublish/comments/16gpa2g/amazon-kdp-cover-file-bleed-error-despite/ |
| KDP sample-page messages do not always reveal a mixed-size or content-specific cause | [Observed] A KDP discussion describes generic insufficient-bleed emails that list sample pages; comments discuss mixed page sizes and pages with images. Another discussion mentions mixed dimensions and full-bleed expectations. | Inspect every page, preserve the sample page list when available, and rank outliers instead of showing one global pass state. | https://www.reddit.com/r/KDP/comments/1vyknyx/ ; https://www.reddit.com/r/KDP/comments/1hc9tqi/ |
| Cover work changes when page count changes | [Observed] A self-publishing upload discussion describes a cover that was correct for one page count but wrong after the manuscript grew. | Couple page count, paper, trim, spine coefficient, and cover dimensions in one visible calculation. | https://www.reddit.com/r/selfpublish/comments/ndwqmo/ |
| Margins, gutters, and spine warnings are often explained as a chain of related settings | [Observed] A self-publishing discussion groups trim, bleed, gutter, and spine problems together rather than treating them as one input. | Show the dependency chain and the chosen source rule. Avoid a large warning panel that leaves the user to infer which setting to change. | https://www.reddit.com/r/selfpublish/comments/1ubzeab/ |

## Technical truth to verify

| Claim or formula | Source of truth | Status and implementation note |
|---|---|---|
| KDP paperback interiors with bleed are uploaded as PDF. KDP says to embed fonts and images, flatten transparency, remove crop or trim marks, bookmarks, comments, annotations, invisible objects, and metadata, and keep the file at or below 650 MB. | Paperback Submission Guidelines, https://kdp.amazon.com/en_US/help/topic/G201857950 | [Documented] File-level checks can report these properties when the PDF parser exposes them. A clean parse is not an acceptance guarantee. |
| An interior with no bleed uses the trim size. An interior with bleed uses trim width plus 0.125 inch and trim height plus 0.25 inch. KDP says the whole file should use bleed when one page needs it. | Set Trim Size, Bleed, and Margins, https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 ; Paperback Submission Guidelines, https://kdp.amazon.com/en_US/help/topic/G201857950 | [Documented] This asymmetric formula is the default technical rule. The report should display the width and height additions separately. |
| A paperback cover is one PDF containing back cover, spine, and front cover. Width is bleed plus back width plus spine width plus front width plus bleed. Height is bleed plus trim height plus bleed. | Create a Paperback Cover, https://kdp.amazon.com/en_US/help/topic/G201953020 | [Documented] A cover check needs binding, trim, paper, ink, page count, and reading direction inputs or a clear unknown state. |
| KDP paperback page counts have a minimum of 24 pages, are rounded up to an even number, and have maxima that vary by trim size, ink, and paper. | Paperback Submission Guidelines, https://kdp.amazon.com/en_US/help/topic/G201857950 | [Documented] A parser can count PDF pages. It cannot know the intended KDP ink and paper configuration without user input. |
| KDP requires fully embedded fonts. A font can still fail for licensing reasons even when an embedding flag is present. | Fix Paperback and Hardcover Formatting Issues, https://kdp.amazon.com/en_US/help/topic/G201834260 | [Documented] Report embedded, subset-embedded, not embedded, and unreadable states separately. [Unknown] A local parser cannot prove the user's commercial font license. |
| KDP requires at least 300 DPI for images and recommends no more than 600 DPI to control file size. | Paperback Submission Guidelines, https://kdp.amazon.com/en_US/help/topic/G201857950 | [Documented] Effective DPI is measurable only when image pixel dimensions and placement transforms are available. A page-level image check must be able to say unknown. |
| KDP warns about missing or excessive blank pages, and its formatting guidance gives limits of no more than four consecutive blank pages at the beginning or middle and ten at the end. | Fix Paperback and Hardcover Formatting Issues, https://kdp.amazon.com/en_US/help/topic/G201834260 | [Documented] A PDF page with no visible marks may still contain hidden structure. [Inferred] The first version should distinguish empty page objects from visually blank pages it cannot fully interpret. |
| PDF page boxes have different meanings. MediaBox is required and defines the physical medium; CropBox defaults to MediaBox; TrimBox and BleedBox are optional and default to CropBox when absent. | Adobe PDF 1.7 reference, https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf | [Documented] Missing TrimBox or BleedBox should be reported as `not declared`, not as an automatic KDP failure, because the KDP help pages reviewed do not require those boxes explicitly. |
| KDP checks are not limited to file parsing. KDP describes automated Print Previewer checks followed by manual review. | Fix Paperback and Hardcover Formatting Issues, https://kdp.amazon.com/en_US/help/topic/G201834260 ; Hardcover Interior Formatting, https://kdp.amazon.com/en_US/help/topic/GYB32MZNQSNZM2CP | [Documented] Product copy must say `possible issue` or equivalent. It must not say that a file will be accepted. |
| Paperback spine text is allowed only for books with more than 79 pages, and KDP gives a 0.0625 inch safe space on each side of the spine text. | Create a Paperback Cover, https://kdp.amazon.com/en_US/help/topic/G201953020 | [Documented] The page-count threshold is a cover warning. [Unknown] A PDF-only parser may not reliably locate all text and ink bounds or prove that spine text is inside the safe space. |
| Hardcover cover guidance documents wrap and safe-area offsets but does not provide a closed total-width and spine formula in the page reviewed. | Create a Hardcover Cover, https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6 | [Documented] Do not invent a hardcover formula. Use a maintained official calculator or label the expected value as unavailable until the user supplies it. |
| KDP does not publish one universal machine tolerance in the pages reviewed. | KDP pages above | [Unknown] The product should show exact differences and document any tolerance it chooses. It should not silently turn a small difference into a KDP guarantee. |

## Competitor reviews

### Competitor 1: KDPage

- URL: https://www.kdpage.com/tools/kdp-file-validator
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The title and H1 present a free Amazon KDP PDF file validator and preflight checker for interior files.
- Inputs and defaults: [Observed] The live page exposes one interior PDF file input. It does not ask for trim size, bleed choice, paper, ink, page count, or binding before the check.
- Action and state behavior: [Observed] File selection starts the check automatically. Selecting a synthetic text file named `synthetic-invalid.pdf` produced a recovery message that the PDF could not be read and offered a way to check another file.
- Results and visuals: [Documented] The page says it checks dimensions, page count, consistency, and encryption, and says it cannot verify font embedding or image DPI. [Observed] The page places a cover creator, royalty calculator, and description tools below the checker.
- Formula or data source: [Unknown] The page did not expose a visible source ledger, formula detail, or rule version in the captured DOM.
- Errors and edge behavior: [Observed] The invalid-file state was clear and recoverable. [Unknown] Valid PDF results, mixed pages, and malformed pages were not uploaded in this research.
- Mobile and accessibility: [Observed] The page fit a 390 pixel viewport with no horizontal overflow, but the file input had no explicit ARIA label in the captured DOM. [Unknown] Keyboard-only behavior was not tested.
- Privacy and performance: [Documented] The page states that the file is processed locally. [Observed] The page returned a usable DOM during the bounded load. [Unknown] No independent performance benchmark was run.
- What works: [Inferred] The automatic file-first flow is low friction, and the invalid-file recovery state is useful.
- What fails: [Inferred] Users cannot state the intended trim or bleed configuration, so the checker cannot explain a mismatch against a specific book setup. The page explicitly stops short of font and DPI verification.
- Do not copy: [Inferred] Do not copy the cross-sell density or the limitation that leaves two common KDP checks outside the product when those checks are the reason a user came.

```text
[Free KDP File Validator]
          |
  [Choose interior PDF]
          |
 [Auto-check on selection]
          |
 [Valid report or read error]
          |
 [Cover and royalty cross-sells]
```

### Competitor 2: SmartKDP PDF checker

- URL: https://smartkdp.com/tools/kdp-pdf-checker
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The page asks users to drop an interior PDF and promises findings with page numbers and measurements before upload.
- Inputs and defaults: [Observed] It exposes a PDF input, interior type defaulting to `Not sure (assume black and white)`, common trim presets, and optional metadata or ebook context.
- Action and state behavior: [Observed] The page describes a file-selection workflow and has no visible primary submit button in the captured control set. [Unknown] A second synthetic file probe timed out before a post-selection result could be captured.
- Results and visuals: [Documented] The page says it measures every page, uses a half-point tolerance, finds mixed page sizes, checks page count against KDP limits, estimates effective DPI, and checks embedded fonts.
- Formula or data source: [Documented] The page shows the effective DPI relationship as image pixel width divided by placed width in points divided by 72. It describes the KDP interior bleed as plus 0.125 inch in width and plus 0.25 inch in height. [Unknown] A complete source ledger and rule version were not visible in the captured page.
- Errors and edge behavior: [Documented] The page says it does not check safe margins or gutter, PDF/X-1a or output intent, cover geometry, or font licensing. That boundary is more credible than claiming checks the page cannot perform.
- Mobile and accessibility: [Observed] The form stacks at 390 pixels with no horizontal overflow. A cookie banner exposes Decline, Accept all, and Analytics only. [Observed] Select controls had native IDs; the file input had no explicit ARIA label in the capture. [Unknown] Keyboard behavior was not tested.
- Privacy and performance: [Documented] The page says the file is processed in the browser and is not uploaded. [Observed] The cookie banner mentions optional Google Analytics and Ads cookies. The initial bounded load returned a DOM, while a later navigation timed out, so no benchmark is claimed.
- What works: [Inferred] It has the clearest measured interior scope in this set and explicitly names checks it will not attempt.
- What fails: [Inferred] The explanation is long before the user sees a result, and the lack of an observed completed result leaves the actual issue hierarchy unverified.
- Do not copy: [Inferred] Do not lead with a long technical essay or imply that margin, cover, and licensing checks are available when the tool itself says they are outside scope.

```text
[Drop interior PDF]
        |
[Type: unsure | B&W | color]
[Trim: infer | preset]
        |
 [Findings by page]
        |
[DPI] [fonts] [size] [page count]
        |
 [Known limits and FAQ]
```

### Competitor 3: KDPPreflight

- URL: https://kdppreflight.com/
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The H1 frames the product as a way to fix bleed, trim, spine, and margin issues before KDP rejects an upload.
- Inputs and defaults: [Observed] The homepage is a product landing page. It exposes theme and feedback controls, but no live PDF input or configuration form in the captured DOM. The page links to scan, calculate, and preview flows.
- Action and state behavior: [Observed] The workstation illustration shows `cover.pdf` and `manuscript.pdf` moving through a scan, but the displayed interaction is a static demo. [Unknown] The linked scan flow was not successfully operated because a later navigation timed out.
- Results and visuals: [Observed] The static example shows `Bleed issue found`, `Spine width warning`, `Trim size OK`, a page 2 bleed issue, actual versus expected 8.5x11 and 8.625x11.25 values, and a `Fix preview` action.
- Formula or data source: [Documented] The landing page says it checks bleed, trim, spine, safe area, margins, and resolution, and says files stay local. [Unknown] The captured homepage did not expose formulas, source links, parser limits, or an actual result object.
- Errors and edge behavior: [Unknown] No invalid-file or empty-form state was available on the homepage. [Inferred] The static `accepted` or rejection framing should be treated as marketing language until a measured report and official rule source are visible.
- Mobile and accessibility: [Observed] The page fit the 390 pixel viewport without horizontal overflow. Static issue chips and the workstation mockup take much of the first screen. [Unknown] Keyboard and control labeling were not tested because no checker form was present.
- Privacy and performance: [Documented] The page states local processing, no storage, and no AI training. [Observed] The initial page loaded in the bounded probe; a later navigation timed out. No performance benchmark is claimed.
- What works: [Inferred] The static example communicates a useful result shape: actual value, expected value, page number, and a possible fix.
- What fails: [Inferred] The homepage is not proof that the advertised scanner works, and the acceptance-oriented copy risks overpromising.
- Do not copy: [Inferred] Do not ship a dashboard-like mock result without a real file state, and do not use acceptance language for a local preflight report.

```text
[Landing page]
  [cover.pdf]   [manuscript.pdf]
          |
     [Scan files]
          |
 [Bleed] [Spine] [Trim]
          |
 [Fix preview] [Calculate specs]
```

### Competitor 4: Prepressly

- URL: https://prepressly.com/
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The page targets coloring-book creators and promises to turn image pages into a print-ready KDP interior PDF.
- Inputs and defaults: [Observed] It accepts PNG and JPG pages, defaults to an 8.5x11 trim option, and exposes line boldness, no-bleed versus full-bleed, maximum quality versus smaller file, and advanced threshold controls.
- Action and state behavior: [Observed] The main action is `Make all pages print-ready`, with a per-page check, before and after preview, and a PDF export. The page says Google sign-in is required to start rendering.
- Results and visuals: [Observed] Result counters include Pages, Gutter, Low-res, and Faint. The interface includes a before and after preview and one exported PDF.
- Formula or data source: [Documented] The page states 300 DPI, automatic gutter sizing from page count, and bleed dimensions of trim plus 0.125 inch in width and plus 0.25 inch in height. [Unknown] A full source ledger and versioned KDP rule table were not visible.
- Errors and edge behavior: [Unknown] No invalid image or PDF state was tested. [Inferred] Its raster transformation workflow is not evidence that arbitrary text-heavy PDF structure, embedded fonts, or PDF page boxes can be checked.
- Mobile and accessibility: [Observed] Controls stack at 390 pixels with no horizontal overflow. The introduction is long before the workbench. [Unknown] Keyboard behavior was not tested.
- Privacy and performance: [Documented] The page says processing is local and no upload is needed, but the Google sign-in gate is a separate access dependency. [Observed] The page loaded in the bounded probe. No benchmark was run.
- What works: [Inferred] The before and after view and concrete image controls suit a narrow coloring-page workflow.
- What fails: [Inferred] It is an image cleanup and exporter, not a general PDF preflight checker. Its H1 uses `KDP-accepted`, which overstates what a local product can guarantee.
- Do not copy: [Inferred] Do not generalize a category-specific image fixer to all KDP PDFs, and do not promise acceptance after raster processing.

```text
[Upload PNG/JPG pages]
          |
[Trim] [line] [bleed] [quality]
          |
[Check] [Gutter] [Low-res] [Faint]
          |
     [Before / after]
          |
     [Export PDF]
```

### Competitor 5: PreviewBound Interior Workspace

- URL: https://previewbound.com/interior
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The page presents a manuscript workspace that analyzes margins, fonts, image resolution, and structure, then adds 3D and flip-through previews.
- Inputs and defaults: [Observed] It accepts PDF or DOCX. Controls include paperback or hardcover, trim presets or custom dimensions, units, white or cream paper, standard or premium color, language, and required bleed or no-bleed selection. A separate cover section accepts a cover file or page count.
- Action and state behavior: [Observed] The primary actions are `Analyze interior`, `New/Refresh`, and `Analyze cover`. The empty state says to choose a manuscript and press Analyze, and asks for bleed selection before upload.
- Results and visuals: [Observed] The post-analysis tabs include 3D mockup, page spread, flip-through, author proof, cover preview, and full analysis. [Unknown] No manuscript was uploaded, so result hierarchy and error recovery were not verified.
- Formula or data source: [Unknown] The initial page did not expose the formulas, official KDP source links, tolerances, or freshness of the rules.
- Errors and edge behavior: [Observed] The empty state is explicit and gives a next action. [Unknown] Invalid files, mixed dimensions, page-box warnings, and licensing failures were not tested.
- Mobile and accessibility: [Observed] The form stacks at 390 pixels with no horizontal overflow. Native inputs and buttons have IDs. [Unknown] Keyboard-only behavior and screen-reader order were not tested.
- Privacy and performance: [Unknown] No clear local-processing or retention statement appeared in the captured initial view. [Observed] The initial page returned a usable DOM in the bounded probe.
- What works: [Inferred] It covers the manuscript-to-proof journey and asks for meaningful book configuration before analysis.
- What fails: [Inferred] Many preview tabs can compete with the preflight answer, and the visible entry page does not establish which checks are measured versus visualized.
- Do not copy: [Inferred] Do not put 3D and flip-through controls ahead of a short, source-backed issue list. Keep proof views secondary to the technical result.

```text
[Interior Workspace]
 [Binding] [Trim] [Units] [Paper] [Language]
 [Bleed / no bleed]
          |
 [PDF or DOCX] -> [Analyze interior]
          |
 [3D] [Spread] [Flip] [Proof] [Full analysis]
          |
       [Cover analysis]
```

### Competitor 6: Univers Studio KDP Preflight Checker

- URL: https://www.univers.studio/kdp-preflight/
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The page promises an instant, free, client-side KDP PDF specification check with no login.
- Inputs and defaults: [Observed] It exposes a PDF file input, trim presets, black-and-white or color content type, no bleed or `Yes (.125 in)`, and an explicit `Run Preflight Check` button.
- Action and state behavior: [Observed] The form requires the user to choose file and specifications before the explicit run action. [Unknown] A completed result and empty-form response were not captured in the bounded follow-up probe.
- Results and visuals: [Documented] The page claims pass, warn, and fail outcomes for page count, dimensions, bleed, spine, parity, margins, and file size, and identifies `pdf-lib` in its browser-side description. [Unknown] The actual result layout and issue evidence were not observable without a completed run.
- Formula or data source: [Documented] The FAQ says enabling bleed makes the file 0.25 inch wider and 0.25 inch taller while also saying 0.125 inch on each side. [Documented] Current KDP interior guidance says plus 0.125 inch width and plus 0.25 inch height. This conflict is recorded in the formula section.
- Errors and edge behavior: [Unknown] No invalid PDF state was tested. [Inferred] The broad phrase `complete KDP checks` needs a visible rule ledger before it can support that scope.
- Mobile and accessibility: [Observed] The form stacks at 390 pixels with no horizontal overflow. Native file, select, and button controls were present. [Unknown] Keyboard behavior was not tested.
- Privacy and performance: [Documented] The page states client-side processing and no login. [Observed] The initial page loaded in the bounded probe. No independent benchmark was run.
- What works: [Inferred] The form makes expected trim, color, and bleed choices visible and gives the user an explicit run action.
- What fails: [Inferred] The published interior bleed explanation is materially ambiguous and conflicts with official KDP guidance.
- Do not copy: [Inferred] Do not repeat the formula error or claim complete coverage without showing which properties were actually measured.

```text
[PDF file]
 [Trim size]
 [Content type]
 [Bleed: no | +.125]
          |
 [Run Preflight Check]
          |
    [Pass] [Warn] [Fail]
```

### Competitor 7: KDP Cover Checker

- URL: https://kdpcoverchecker.com/
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] The page targets low-content KDP publishers and asks whether a cover will be accepted, with a focus on exact size, spine, and bleed.
- Inputs and defaults: [Observed] It exposes 16 trim presets, page count defaulting to 120, black-and-white or color ink, white, cream, or groundwood paper, and an optional PNG, JPG, or PDF cover file. It also exposes optional email and referral fields.
- Action and state behavior: [Observed] Changing trim, page count, or material settings recalculates the result immediately. A boundary probe at 6x9, 828 pages, premium color, and white paper returned a 14.193x9.25 inch cover, 4258x2775 pixels at 300 DPI, and a 1.943 inch spine. A 23-page probe returned `NEEDS A FIX` and identified the 24-page minimum.
- Results and visuals: [Observed] The hierarchy is verdict, full cover size, pixel dimensions and spine, a back/front/spine diagram, issue bullets, and an email template. It explains that spine text is allowed at 79 or more pages in its own wording.
- Formula or data source: [Documented] The page states cover width as two trim widths plus spine plus 0.25 inch and cover height as trim height plus 0.25 inch. The boundary result matches the official paperback cover geometry for the selected setup. [Unknown] The page did not expose a full official source ledger in the captured controls.
- Errors and edge behavior: [Observed] The 23-page case clearly surfaces both the page minimum and the short-spine warning. [Inferred] The page-count input allows 1 even though the visible KDP result explains a 24-page minimum, which could create an avoidable invalid state.
- Mobile and accessibility: [Observed] The form stacks, but the page measured 396 pixels of scroll width against a 390 pixel viewport, creating a small horizontal overflow. Native controls were present; only the referral control had an explicit ARIA label in the capture. [Unknown] Keyboard behavior was not tested.
- Privacy and performance: [Unknown] The page has no clear file-privacy statement in the captured view. [Observed] The initial page loaded in the bounded probe. No benchmark was run.
- What works: [Inferred] The immediate recalculation and boundary feedback make the cover dependency chain easy to understand.
- What fails: [Inferred] It is cover-only, its acceptance framing is too strong, and optional email and referral fields compete with the technical task.
- Do not copy: [Inferred] Do not use acceptance language, make a user enter a page count below the known minimum, or place lead-capture fields beside the primary result.

```text
[Trim] [Pages] [Ink] [Paper]
          |
     [Cover size]
     [Spine width]
          |
 [Back] [Spine] [Front]
          |
     [Fix or pass]
```

### Competitor 8: Digital City Printing Print-Ready PDF Checker

- URL: https://www.digitalcityprinting.com/tools/print-ready-pdf-checker/
- Accessed: 2026-09-16 with standalone Playwright at desktop and mobile widths.
- Audience and promise: [Observed] This is a commercial prepress page with a `Print-Ready PDF Checker` and `Print-Ready PDF Inspector`, not a KDP-specific product.
- Inputs and defaults: [Observed] It exposes a commercial product selector, PDF file input, free-form trim-size text, and `Run Full Preflight Diagnostics`. A report download button is present for the result state.
- Action and state behavior: [Observed] The page describes file type, page count, trim and bleed signals, color-space references, and font-embedding indicators. [Unknown] No file was selected, so no successful or invalid result was observed.
- Results and visuals: [Observed] The page promises a preflight diagnostic report and a visual proof or page-one geometry overlay, including actual PDF dimensions and page-box coordinates. [Unknown] Report content and issue severity were not available in the empty state.
- Formula or data source: [Unknown] The page did not expose KDP-specific rules, formula sources, tolerances, or freshness. Its commercial prepress benchmarks cannot stand in for KDP documentation.
- Errors and edge behavior: [Unknown] No empty-form, invalid-PDF, or mixed-page behavior was captured.
- Mobile and accessibility: [Observed] The form fit a 390 pixel viewport without horizontal overflow, but a long navigation, phone, and email area consumes substantial space around the tool. [Unknown] Keyboard behavior was not tested.
- Privacy and performance: [Unknown] A clear privacy or local-processing statement was not visible in the captured tool view. [Observed] The initial page returned a usable DOM in the bounded probe. No benchmark was run.
- What works: [Inferred] The proposed report download and page-box overlay point toward an inspectable technical artifact rather than a single opaque verdict.
- What fails: [Inferred] The KDP user must translate generic commercial prepress output into KDP rules, and the surrounding service lead flow adds noise.
- Do not copy: [Inferred] Do not use a generic product selector or commercial benchmark as a substitute for current KDP sources. Keep the report narrow and explain every rule.

```text
[Product type] [PDF]
[Trim size text]
          |
[Run Full Preflight Diagnostics]
          |
[Report] [Page box overlay]
          |
 [Download report]
```

## Comparison matrix

The matrix records what was visible in the captured page, not what a marketing paragraph may imply. `Claimed` means the page stated the capability but a completed live result was not observed.

| Capability | KDPage | SmartKDP | KDPPreflight | Prepressly | PreviewBound | Univers | KDP Cover Checker | Digital City Printing |
|---|---|---|---|---|---|---|---|---|
| Local or no-upload statement | Yes [Documented] | Yes [Documented] | Yes [Documented] | Yes [Documented] | Unknown | Yes [Documented] | Unknown | Unknown |
| Interior PDF input | Yes [Observed] | Yes [Observed] | No visible form [Observed] | No, images [Observed] | Yes, PDF or DOCX [Observed] | Yes [Observed] | No visible interior input [Observed] | Yes [Observed] |
| Cover PDF input | No [Observed] | No [Observed] | Static cover example [Observed] | No [Observed] | Yes, separate section [Observed] | No visible cover input [Observed] | Yes [Observed] | Generic PDF input [Observed] |
| User-entered trim or expected spec | No [Observed] | Yes [Observed] | Calculator link [Observed] | Trim preset [Observed] | Yes [Observed] | Yes [Observed] | Yes [Observed] | Free-form trim text [Observed] |
| Page-by-page or mixed-size reporting | Claimed | Claimed | Static page 2 example | Image counters | Unknown | Claimed | No [Observed] | Claimed |
| Font embedding | Explicitly not checked [Documented] | Claimed | Claimed | No [Observed] | Claimed | Claimed | No [Observed] | Claimed |
| Effective image DPI | Explicitly not checked [Documented] | Claimed with formula | Claimed | Low-res counter for images | Claimed | Claimed | No [Observed] | Claimed |
| Cover spine and page-count coupling | No [Observed] | No [Observed] | Static example | No [Observed] | Cover section | Claimed | Yes [Observed] | Unknown |
| Visual proof or repair | No [Observed] | No [Observed] | Static fix preview | Before and after | 3D and flip-through | No visible result | Cover diagram | Page-box overlay claimed |
| Visible source and rule freshness | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Partial claim | Unknown |
| Clear acceptance boundary | Partial | Partial | No, rejection framing | No, `KDP-accepted` wording | Unknown | No, `complete checks` wording | No, acceptance wording | Unknown |
| Mobile overflow in capture | None | None | None | None | None | None | 6 px | None |

## Formula and data disagreements

| Topic | Conflicting claims | Decision for stack127 |
|---|---|---|
| Interior bleed dimensions | [Documented] Univers Studio's FAQ says the interior file becomes 0.25 inch wider and 0.25 inch taller while also saying 0.125 inch on each side. [Documented] SmartKDP shows plus 0.125 inch width and plus 0.25 inch height. [Documented] Current KDP guidance uses the asymmetric formula. | Use KDP: `expected width = trim width + 0.125 in`; `expected height = trim height + 0.25 in`. Show the two additions separately and link the source. |
| Cover total dimensions versus interior dimensions | [Documented] KDP's paperback cover formula adds 0.25 inch to total cover width and height because it includes two side bleeds in width and two vertical bleeds in height. [Observed] KDP Cover Checker uses `2 x trim + spine + 0.25` for cover width. | Keep cover geometry and interior geometry as different formulas. Never reuse the cover total-width addition for an interior page. |
| Spine coefficient | [Documented] KDP lists different coefficients for white, cream, groundwood, premium color, and standard color paper. [Observed] KDP Cover Checker returned a 1.943 inch spine for 828 pages in its selected premium-color setup, which matches the current premium-color coefficient. | Store the coefficient with paper and ink context, show the selected coefficient and source date, and do not use a generic paperback constant. |
| Page-count limits | [Documented] KDP's maximum varies by trim size, ink, and paper. [Observed] KDP Cover Checker allows a page-count input of 1 but reports that 23 pages is below the 24-page minimum. | Validate 24 pages as the paperback minimum where applicable, use the official configuration table for maxima, and keep the input state impossible or clearly invalid instead of silently calculating a cover. |
| Margins and safe areas | [Documented] KDP publishes minimum margins and cover safe-area guidance. [Documented] SmartKDP explicitly declines to check safe margins and gutter. [Unknown] A generic PDF parser cannot reliably infer every live text or image boundary. | Report page geometry and measurable boxes. Treat ink, gutter, and safe-area checks as unknown unless the implementation can prove them from the PDF structure. |
| PDF page boxes | [Documented] Adobe defines MediaBox, CropBox, TrimBox, BleedBox, and ArtBox with defaults and inheritance. [Documented] KDP help pages reviewed do not say an explicit TrimBox or BleedBox is required. | Show each declared box and its inherited value. Label a missing optional box as `not declared`, not as an automatic KDP failure. |
| Fonts and licensing | [Documented] KDP requires fully embedded fonts. [Documented] KDP also notes that a commercial font license can prevent embedding. | Check the PDF embedding flag and subset status. Do not claim that the PDF proves a license. |
| Image DPI | [Documented] KDP requires at least 300 DPI and recommends no more than 600 DPI for file-size control. [Inferred] Effective DPI depends on pixel dimensions and placement transforms. | Give an exact effective-DPI value only when the parser has the needed image and transform data. Otherwise show unknown with the reason. |
| Tolerance | [Unknown] The KDP pages reviewed do not publish one universal machine tolerance for all page dimensions. [Observed] SmartKDP advertises a half-point tolerance. | Treat a competitor's tolerance as a product choice, not KDP truth. Document any tolerance and show the raw difference. |
| Preflight versus acceptance | [Documented] KDP describes automated Print Previewer checks followed by manual review. [Observed] Several competitors use `accepted`, `will accept`, or `complete checks` language. | Use `possible issue`, `measured`, `not measured`, and `unknown`. Keep the KDP review boundary visible in the result. |
| Hardcover geometry | [Documented] KDP's hardcover cover page gives wrap and safe-area offsets but not a closed total cover formula in the reviewed guidance. | Do not infer a universal hardcover formula. Use an official calculator or ask the user for an expected cover size until the source is verified. |

## Evidence-backed opportunities

1. Lead with actual versus expected values on the affected page. The official KDP guidance gives concrete geometry, while community reports show that a generic bleed message leaves users unsure what to change. A useful result should say `page 12 is 0.125 inch narrower than the selected expectation`, then link to the relevant KDP rule.

2. Make interior and cover configuration share one source of truth. Cover width depends on trim, page count, paper, and spine coefficient, while interior geometry depends on trim and bleed. Most reviewed pages split those jobs or handle only one. A single setup can reduce the page-count and spine mismatch described in community reports.

3. Make uncertainty a first-class result. Embedded-font flags, effective DPI, page boxes, hidden objects, font licensing, and live ink safe areas do not have the same measurability. A result that says `measured`, `not declared`, `not measured`, or `unknown` is more useful than a broad pass label.

4. Treat mixed page sizes and page structure as primary checks. KDP documentation mentions hidden objects, empty pages, and structure-related formatting issues, while community reports mention sample pages and mixed dimensions. Scanning all pages and preserving the outlier list is a strong differentiator over a single global verdict.

5. Keep processing local and explain the boundary in the interface. Several competitors make a local-processing claim, but privacy clarity is inconsistent and some adjacent products add sign-in or service flows. A short file-handling statement beside the picker can build trust without hiding the technical task.

6. Put rule sources beside calculations. The KDP pages contain changing tables, material-specific coefficients, and separate interior and cover formulas. A visible source URL, access date, and rule label will make disagreements easier to resolve and keep stale competitor formulas from becoming stack127 behavior.

## Table stakes

- A file picker for PDF, with a clear invalid-file recovery state.
- A clear choice between interior and cover, or a single flow that makes both scopes explicit.
- Expected trim, bleed, binding, paper, ink, page count, and units where the tool cannot infer them.
- Page count, page dimensions, mixed-size outliers, and actual versus expected measurements.
- KDP interior bleed geometry using the asymmetric width and height additions.
- MediaBox, CropBox, TrimBox, and BleedBox visibility with inheritance explained.
- Embedded-font and effective-DPI checks only where the PDF exposes enough data.
- A possible-issue boundary, official KDP links, and a report that can be copied or downloaded.
- Mobile layout without horizontal overflow, native controls with accessible labels, and a result that remains readable at 390 pixels.

## Ideas to reject

- A claim that the PDF is KDP accepted or guaranteed to pass review.
- Automatic repair or rasterization of arbitrary PDFs in the first version.
- A margin or safe-area verdict based only on the page rectangle.
- PDF/X, color-space, CMYK, barcode, OCR, or licensing pass/fail claims without a reliable parser and source contract.
- A universal hardcover spine formula inferred from paperback rules.
- Server upload or AI analysis for a job that can be inspected locally.
- A generic KDP tool hub, email capture, or cross-sell block around the primary result.

## Open questions and blockers

- Should the first release support both interior and cover files, or ship an interior checker with cover specifications as a second phase?
- Which browser-safe PDF parser can expose page boxes, fonts, image transforms, and malformed-object errors without adding an unreviewed dependency? The current research did not select a library.
- How should the product detect a genuinely empty page without treating a page containing invisible or hidden structure as safe?
- Which page-box differences are warnings, and which are only informational, given that KDP does not require explicit TrimBox or BleedBox declarations in the reviewed help pages?
- What tolerance, if any, should stack127 use? It must be documented as a product rule rather than presented as an official KDP tolerance.
- How should the UI handle a cover file when the official hardcover expected dimensions are not available from the current source page?
- [Observed] The target route and production publication state do not exist in the current source inventory. Route, manifest, test, engine, and publication work belong to a later build stage and were not changed here.
- [Inferred] There is no blocker to research readiness. The main implementation blocker is choosing and validating the browser PDF inspection boundary.

## Sources

### Official technical sources

- Amazon KDP, Paperback Submission Guidelines: https://kdp.amazon.com/en_US/help/topic/G201857950. Used for file limits, page sizes, bleed, margins, page counts, fonts, images, blank pages, and supported configurations. Accessed 2026-09-16.
- Amazon KDP, Create a Paperback Cover: https://kdp.amazon.com/en_US/help/topic/G201953020. Used for one-file cover structure, cover formulas, spine coefficients, spine text, and cover requirements. Accessed 2026-09-16.
- Amazon KDP, Fix Paperback and Hardcover Formatting Issues: https://kdp.amazon.com/en_US/help/topic/G201834260. Used for Print Previewer and manual review, hidden structure, fonts, image resolution, blank pages, pagination, and cover warnings. Accessed 2026-09-16.
- Amazon KDP, Set Trim Size, Bleed, and Margins: https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6. Used for interior trim and bleed geometry and margin rules. Accessed 2026-09-16.
- Amazon KDP, Create a Hardcover Cover: https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6. Used for hardcover wrap offsets, safe areas, barcode placement, and the absence of a closed formula in the reviewed guidance. Accessed 2026-09-16.
- Amazon KDP, Hardcover Interior Formatting: https://kdp.amazon.com/en_US/help/topic/GYB32MZNQSNZM2CP. Used for the automated and manual review boundary. Accessed 2026-09-16.
- Amazon KDP, Cover Templates and Calculator: https://kdp.amazon.com/cover-templates. Used to confirm the official calculator inputs and its role as a source for cover specifications. Accessed 2026-09-16.

### PDF standard

- Adobe, PDF Reference 1.7: https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf. Used for MediaBox, CropBox, TrimBox, BleedBox, ArtBox, defaults, and inheritance. Accessed 2026-09-16.

### Live competitor pages

- KDPage PDF validator: https://www.kdpage.com/tools/kdp-file-validator. Accessed 2026-09-16.
- SmartKDP PDF checker: https://smartkdp.com/tools/kdp-pdf-checker. Accessed 2026-09-16.
- KDPPreflight: https://kdppreflight.com/. Accessed 2026-09-16.
- Prepressly: https://prepressly.com/. Accessed 2026-09-16.
- PreviewBound interior workspace: https://previewbound.com/interior. Accessed 2026-09-16.
- Univers Studio KDP preflight checker: https://www.univers.studio/kdp-preflight/. Accessed 2026-09-16.
- KDP Cover Checker: https://kdpcoverchecker.com/. Accessed 2026-09-16.
- Digital City Printing print-ready PDF checker: https://www.digitalcityprinting.com/tools/print-ready-pdf-checker/. Accessed 2026-09-16.

### User pain sources

- Reddit, KDP publishing trim-size and bleed discussion: https://www.reddit.com/r/selfpublish/comments/1hh8isd/kdp_publishing_trim_size_issues/. Community pain evidence. Accessed 2026-09-16.
- Reddit, KDP bleed issue discussion: https://www.reddit.com/r/KDP/comments/1vyknyx/. Community pain evidence about generic bleed emails and mixed pages. Accessed 2026-09-16.
- Reddit, Amazon KDP cover bleed error discussion: https://www.reddit.com/r/selfpublish/comments/16gpa2g/amazon-kdp-cover-file-bleed-error-despite/. Community pain evidence about repeated cover warnings. Accessed 2026-09-16.
- Reddit, KDP mixed-dimensions discussion: https://www.reddit.com/r/KDP/comments/1hc9tqi/. Community pain evidence about mixed page dimensions and bleed. Accessed 2026-09-16.
- Reddit, upload frustration and page-count cover changes: https://www.reddit.com/r/selfpublish/comments/ndwqmo/. Community pain evidence about page-count-dependent cover work. Accessed 2026-09-16.
- Reddit, trim, bleed, gutter, and spine discussion: https://www.reddit.com/r/selfpublish/comments/1ubzeab/. Community pain evidence about linked setup problems. Accessed 2026-09-16.

# Competitive report: KDP page count estimator

Status: ready
Tool: KDP page count estimator
Route: `/kdp-page-count-estimator`
Researched: 2026-09-16
Direct competitors reviewed: 10
Saturation exception: no

## Research scope

### Current stack127 state

[Observed] The repository has no route, engine, test, script, ownership manifest, or existing content document for `/kdp-page-count-estimator`. The supplied planning attachment names this tool as the fifth KDP build and asks for a range rather than one exact page count.

[Inferred] This is a standalone formula tool for authors and formatters who have a manuscript word count but do not yet have a final typeset PDF. It fits stack127's calculator surface because the job has explicit inputs and a bounded result. It does not require a curated app dataset, an Amazon account, scraping, or a judgment such as "ready to publish."

[Documented] KDP's own page count is based on the submitted manuscript file, not a word-count formula. KDP rounds the result up to an even number, applies format and trim-specific limits, and uses the final page count for production decisions. The estimator must therefore describe an estimate and keep the final PDF as the authority.

### Method and coverage

I used the web search connector for discovery and official-source verification. SearXNG and its `bing,duckduckgo` engines were not configured, so this report does not claim coverage from those engines. I used standalone Playwright CLI with headless Chromium for live competitor operation because the Codex in-app Browser reported `No browser is available`.

- Search backend: web search connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI with Chromium 1.60.0
- Accessed: 2026-09-16, Asia/Kolkata
- Main viewport: 1280 x 900
- Mobile viewport: 375 x 812
- Probes: default state, 50,000-word input, zero, negative input where the control accepted it, trim and typography controls, result hierarchy, and document width
- Limitations: no account creation, email submission, payment, file upload, or external side effect. Full keyboard, screen-reader, network waterfall, and source-code audits were not performed. A first browser launch in the default sandbox hit the documented Chromium OS permission error; the approved read-only Playwright run completed.

### Search saturation evidence

- Queries tried: `KDP page count estimator calculator`; `convert word count to KDP paperback pages`; `KDP words per page trim size font calculator`; `KDP page count changes formatting trim size font`; `"KDP page count calculator" -amazon`; `"word count to page count calculator" KDP`; `"book page count calculator" trim size font`; `"KDP page count estimator" words per page`; `site:reddit.com/r/KDP page count trim size word count font margins`; `site:reddit.com/r/selfpublish KDP page count word count trim size`; `site:kdpcommunity.com page count changes font trim size margins`; `site:reddit.com KDP page count differs Word previewer`
- Repeated domains: KDP's official help pages, Reddit's `r/KDP` and `r/selfpublish`, and several independent calculator sites. The independent results repeat the same narrow cluster of inputs: word count, trim size, font size, and spacing. They differ in whether they expose margins, chapter count, matter, images, or a range.
- Exclusions: generic essay word-to-page converters, book-formatting services without a live estimator, spine-only tools, royalty-only tools, and KDP's cover calculator were not counted as direct competitors. Librum's tools landing page was inspected as adjacent context but not counted because its visible page-count control is part of a spine-width workflow rather than a standalone word-to-page estimator.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Convert words to pages | `KDP page count estimator` | A plausible print-page range from a manuscript word count | Single-number calculators dominate, with a few range-based tools |
| Compare trim sizes | `50,000 words KDP pages 5x8 vs 6x9` | The page and cost effect of changing the physical book size | Reference tables, trim dropdowns, or comparison rows |
| Test typography choices | `KDP words per page font size line spacing` | Which formatting choices increase or reduce pages | Typography calculators with varying levels of formula detail |
| Plan print production | `KDP page count for spine width` | A page estimate that can feed cover, spine, and price planning | Cross-links to spine, cover, or print-cost tools |
| Stay inside KDP limits | `200k words KDP page limit` | Whether a likely layout may exceed a trim or paper limit | Forum answers and format guidance, with little range handling |
| Explain a mismatch | `KDP page count differs from Word` | Why the estimate, Word document, and final PDF disagree | FAQ pages and community threads rather than diagnostic tools |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Authors do not know whether a small page-count change forces a cover change | [Observed] A `r/selfpublish` thread asks whether moving from 321 to 320 pages changes the cover dimensions and receives conflicting practical answers. https://www.reddit.com/r/selfpublish/comments/1sz66zc/kdp_page_count_question/ | Repeated question pattern in a recent thread | Show the even-rounded estimate, the uncertainty range, and the point at which a spine or cover input must be revisited. |
| Authors ask for margin values without realizing the gutter depends on page count | [Observed] A `r/KDP` question gives a 57.5k-word manuscript and asks for the correct margins. Replies point to KDP's chart and explain that the inside margin follows page count. https://www.reddit.com/r/KDP/comments/1taw7sq/margin_measurements/ | Repeated in KDP formatting discussions | Keep the page-count band and KDP gutter visible beside the estimate. Do not hide the circular dependency. |
| Long manuscripts hit format limits late in the process | [Observed] A recent `r/selfpublish` thread describes a 190k-word manuscript exceeding print limits and collects advice about trim size, font, spacing, margins, and splitting volumes. https://www.reddit.com/r/selfpublish/comments/1s9iwd8/my_200k-word-manuscript-wont-fit-amazon-s-print/ | Repeated high-consequence edge case | Warn when the high end of the range crosses a KDP maximum and show which inputs affect the result. |
| Word count alone gives misleading estimates | [Observed] Community answers repeatedly name trim size, font, line spacing, margins, dialogue, and chapter layout as causes of different page counts. https://www.reddit.com/r/selfpublish/comments/1qel4om/how-screwed-am-i-in-print-self-publish-if-my-book-is-200k-words/ | Repeated across multiple threads | Ask for the variables that materially change text capacity and label the rest as unknown layout detail. |
| Authors want an estimate before they have a typeset file | [Observed] The KDP question and the long-manuscript thread both describe cover and production decisions being made before final pagination. https://www.reddit.com/r/selfpublish/comments/1ov66iv/trim-size/ | Common planning-stage job | Make the output useful before final layout, but state that only the submitted manuscript file establishes the KDP page count. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| KDP calculates print page count from the manuscript file and rounds up to an even number; paperback minimum is 24 pages | [Documented] https://kdp.amazon.com/en_US/help/topic/G201857950 | Documented | This is the production rule. An estimator may model it as `2 × ceil(estimated pages / 2)`, but the formula is an interpretation of the rule, not a KDP-published words-to-pages equation. |
| Paperback page limits vary by trim, ink, and paper; common 6 x 9 paperback ranges include 24 to 828 for black ink white paper, 24 to 776 for cream, 24 to 812 for groundwood, 72 to 600 for standard color, and 24 to 828 for premium color | [Documented] https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 | Documented | The tool must not use one universal maximum. Large and square trims have different limits. |
| Hardcover supported trims use 75 to 550 pages and exclude groundwood and standard color | [Documented] https://kdp.amazon.com/en_US/help/topic/G201834180 | Documented | Decide whether the estimator has a binding input or clearly scopes its first version to paperback. |
| KDP inside margins depend on page-count bands: 0.375 inches for 24 to 150, 0.5 for 151 to 300, 0.625 for 301 to 500, 0.75 for 501 to 700, and 0.875 for 701 to 828 pages | [Documented] https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 | Documented | The estimate can cross a gutter band, so a single hidden margin assumption is unsafe. |
| A full-bleed paperback interior adds 0.125 inches to width and 0.25 inches to height | [Documented] https://kdp.amazon.com/en_US/help/topic/G201857950 | Documented | Bleed affects the page file and image placement. It should not be treated as extra text area without an explicit layout model. |
| Words per page can be derived from text-block dimensions, leading, average glyph width, average word length, and line-fill assumptions | [Inferred] SmartKDP, ByteTools, and AIHustleSurfer expose variants of this calculation: https://smartkdp.com/tools/word-count-to-page-count-calculator, https://bytetools.bytevancer.com/book-page-count-calculator, https://aihustlesurfer.com/kdp/page-count-estimator/ | Inferred | KDP does not publish a words-per-page constant or this formula. Every coefficient must be labelled as a tool assumption. |
| Final page count depends on chapter starts, images, headings, blank pages, dialogue, and other layout choices | [Documented] KDP describes final file pagination and margin checks; [Observed] competitors and community discussions name these layout variables | Documented / Inferred | User-provided image pages, front matter, back matter, and chapter count are safer than pretending the estimator can place them. |

## Competitor reviews

### Competitor 1: KDPEasy

- URL: https://www.kdpeasy.com/tools/word-count-to-page-calculator
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It promises a fast KDP-oriented conversion and leads with a 6 x 9, 11pt, 1.15-spacing setup.
- Inputs and defaults: [Observed] One word-count number field; trim size, font size, line spacing, margins, and font family are button-style selectors. The visible defaults are 6 x 9, 11pt, 1.15 spacing, normal margins, and Times New Roman.
- Action and state behavior: [Observed] Filling 50,000 updates the result immediately. There is no separate calculate button. [Observed] The zero and negative probes leave the numeric field accepted and remove the result instead of showing a precise inline recovery message.
- Results and visuals: [Observed] The result leads with `182` estimated pages at 50,000 words, about 275 words per page, reading time, a white-paper spine width, and a table comparing every listed trim size. [Observed] Supporting sections explain chapter breaks, front matter, back matter, blank pages, and image inserts.
- Formula or data source: [Documented] The page says its defaults use 11pt, 1.15 spacing, normal margins and says its spine width uses KDP's white-paper multiplier. [Unknown] The words-per-page coefficient and uncertainty model are not shown in the first-screen result.
- Errors and edge behavior: [Observed] Zero and negative values do not produce a clear minimum-word-count message in the bounded probe. [Unknown] KDP limit warnings for the current result were not exposed in the first-screen state.
- Mobile and accessibility: [Observed] The page fit a 375px document width and kept the selector row in the mobile flow. [Unknown] Full keyboard and screen-reader semantics for the button selectors.
- Privacy: [Unknown] No clear local-processing statement was captured in the bounded probe.
- Performance: [Observed] The result settled immediately after the local input change.
- Search-content structure: [Observed] H1, calculator, genre word-count guide, trim comparison, formula explanation, and related tools target several adjacent searches.
- What works: It connects page count to spine width and trim comparison without asking for an account.
- What fails: The single number looks more certain than its hidden assumptions, and invalid values can remain in the field without a visible recovery path.
- Do not copy: Do not call a hidden words-per-page constant "accurate" or let a negative input look like a valid state.

```text
[H1 word count calculator]
[Word count]
[Trim] [Font size] [Line spacing] [Margins] [Font family]
[Estimated pages] [Reading time] [Spine width]
[All-trim comparison table]
[Genre guide] [Formula and layout caveats] [Related tools]
```

### Competitor 2: SmartKDP

- URL: https://smartkdp.com/tools/word-count-to-page-count-calculator
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It promises a page range with the working shown, aimed at authors choosing trim and type settings before layout.
- Inputs and defaults: [Observed] Word count defaults to 80,000. The form exposes trim size, genre, typeface, font size, and leading. The default is 6 x 9, fiction, Times New Roman, 11pt, and 1.3 leading.
- Action and state behavior: [Observed] Results update as the word count changes. [Observed] A zero value clears the result and tells the user to enter a word count. A negative value is rejected by the browser control and restores the prior value in the bounded probe.
- Results and visuals: [Observed] The page shows a range, a middle estimate, body pages, front and back matter, words per page, and a worked table. At the default 80,000-word state it shows a 196 to 294 range with 234 pages in the middle. [Observed] It links the middle estimate to spine and printing-cost tools.
- Formula or data source: [Documented] The page says Amazon does not publish a words-per-page figure and labels its type-block math as an estimate. [Inferred] The range runs the same model at compact and airy settings rather than simulating a real typesetting engine.
- Errors and edge behavior: [Observed] Empty and zero input produce a dedicated empty result. [Unknown] Image-page and unusual-matter behavior is not a first-screen input.
- Mobile and accessibility: [Observed] The 375px probe fit the document width and stacked the select controls. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Documented] A cookie notice explains optional analytics and advertising cookies. [Unknown] The bounded probe did not establish whether calculation is fully local.
- Performance: [Observed] The result changed quickly after the input probe.
- Search-content structure: [Observed] It has useful headings for derivation, uncertainty, KDP rounding, front matter, common word counts, and FAQs.
- What works: This is the clearest competitor on uncertainty and formula disclosure.
- What fails: Genre presets can hide typography assumptions, and the cookie and launch-email surfaces compete with the calculator.
- Do not copy: Do not use a genre label as a substitute for actual font, leading, margin, and image inputs.

```text
[H1 range-based page count]
[Word count]
[Trim] [Genre] [Typeface] [Font size] [Leading]
[Low] [Middle] [High] [Words/page] [Matter]
[Worked formula table]
[Spine link] [Print-cost link]
[Limits] [FAQ] [Common word counts]
```

### Competitor 3: ByteTools

- URL: https://bytetools.bytevancer.com/book-page-count-calculator
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It presents itself as a book page-count calculator for a typesetting estimate, not only a KDP shortcut.
- Inputs and defaults: [Observed] It exposes manuscript word count, trim size with custom trim support, inner gutter, outer, top and bottom margins, font size, line spacing, typeface-width band, average word length, front matter pages, and back matter pages. The default sample uses 80,000 words, 6 x 9, 0.75-inch inner, 0.5-inch outer, 0.75-inch top and bottom, 11pt, 1.35 spacing, and 10 plus 4 matter pages.
- Action and state behavior: [Observed] It recalculates locally and exposes a `Copy breakdown` action. [Observed] A negative word-count probe produced `Enter a manuscript word count above zero`; zero was accepted by the field but the result did not visibly recover in the bounded probe.
- Results and visuals: [Observed] The default result shows printed pages, words per page, lines per page, characters per line, text-block dimensions, body pages, and matter pages. [Documented] The page says the estimate is calculated locally in the browser and is not a typesetting run.
- Formula or data source: [Documented] It describes characters-per-line, lines-per-page, average word length, and typeface width as the working. [Unknown] The coefficient translating the average glyph and word values into real line fill is a local assumption.
- Errors and edge behavior: [Observed] Negative input has a direct recovery message. [Observed] Custom trim and all four margin fields make unusual layouts representable, but there is no visible KDP page-limit decision in the first screen.
- Mobile and accessibility: [Observed] The 375px document width matched the viewport, but the long form requires substantial vertical scrolling. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Documented] The page says everything is calculated locally in the browser.
- Performance: [Observed] The form and result rendered without a visible loading step.
- Search-content structure: [Observed] It has dedicated margins, typography, breakdown, how-to, FAQ, and related-tool sections.
- What works: It exposes the intermediate measurements a technical user can audit.
- What fails: The form is more detailed than the KDP-specific competitors and can overwhelm a user who only needs a range.
- Do not copy: Do not expose every coefficient without a clear default path and a short explanation of which values matter most.

```text
[H1 book page count]
[Word count] [Trim]
[Inner] [Outer] [Top] [Bottom]
[Font size] [Line spacing] [Typeface width] [Average word length]
[Front matter] [Back matter]
[Printed pages] [Words/page] [Lines/page] [Characters/line]
[Breakdown] [Copy] [Method] [FAQ]
```

### Competitor 4: Adducent book page count calculator

- URL: https://adducentcreative.com/adducent-book-page-count-calculator/
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It asks how many pages a book will have and frames the result as a production estimate.
- Inputs and defaults: [Observed] The visible form includes manuscript word count, book type, trim width and height, inner, outer, top and bottom margins, and an advanced typography area with body font size, leading, and layout-density control.
- Action and state behavior: [Observed] The page has an explicit calculation form and a result section. [Unknown] The bounded probe did not confirm whether every advanced-field change recalculates before submission.
- Results and visuals: [Observed] It separates estimated finished-book pages, body-text pages, words per page, trim size, live text area, typography, and a calculation basis. [Documented] It warns that images, charts, tables, and other visual material are not included.
- Formula or data source: [Documented] The page names trim, margins, book type, and typography as inputs. [Unknown] Its exact page-capacity equation and uncertainty range are not disclosed in the first-screen tool.
- Errors and edge behavior: [Unknown] The bounded probe did not establish a distinct zero, negative, or minimum-page recovery state.
- Mobile and accessibility: [Observed] The 375px page fit the viewport and keeps the advanced controls below the main estimate. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Unknown] No clear local-processing statement was captured in the bounded probe.
- Performance: [Observed] The public page and calculator loaded without a visible blocking state.
- Search-content structure: [Observed] The headings target book page count, typography, and the reason a finished book is a range.
- What works: It makes visual content a named exclusion instead of silently folding it into a word-count guess.
- What fails: The book-type and density controls can still make the result look more exact than the disclosed model supports.
- Do not copy: Do not let an advanced-density percentage become a false substitute for real chapter, image, and page-break information.

```text
[H1 book page count]
[Word count] [Book type] [Trim width] [Trim height]
[Margins]
[Advanced typography: font size, leading, density]
[Estimated finished book] [Body pages] [Words/page]
[Text area] [Calculation basis]
[Visual-content caveat] [Supporting explanation]
```

### Competitor 5: BestPrintingCalculators

- URL: https://bestprintingcalculators.com/book-page-count-calculator/
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It offers a quick early estimate for authors, editors, self-publishers, and designers.
- Inputs and defaults: [Observed] The visible controls are word count, trim size, font size, line spacing, and image or table pages, followed by a `Calculate` button.
- Action and state behavior: [Observed] It uses explicit submission rather than a dense live breakdown. [Unknown] The bounded probe did not verify whether zero and negative values show separate recovery messages.
- Results and visuals: [Observed] The first screen leads with `Estimated Pages` and explains that image and table pages add to the estimate. [Documented] Its supporting copy says page count varies by design choices and that the output is a starting point.
- Formula or data source: [Unknown] The exact words-per-page model, margins, front matter treatment, and rounding behavior are not disclosed in the live result.
- Errors and edge behavior: [Unknown] Minimum and maximum input behavior was not exposed in the bounded probe.
- Mobile and accessibility: [Observed] The page fit the 375px document width and kept the compact input form readable. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Unknown] No clear local-processing statement was captured in the bounded probe.
- Performance: [Observed] The page loaded and exposed the calculation controls without a visible loading step.
- Search-content structure: [Observed] The page uses generic book page-count headings and explanatory copy about publishing planning, print costs, ISBN, and distribution.
- What works: It includes a direct image/table-page allowance, which many word-count-only competitors omit.
- What fails: It gives little evidence for how the number was produced, so the result is hard to audit.
- Do not copy: Do not ship an unexplained single number when the output can affect spine, price, or a KDP limit.

```text
[H1 book page count]
[Word count] [Trim] [Font size] [Line spacing] [Image/table pages]
[Calculate]
[Estimated pages]
[What affects page count]
[Planning and publishing explanation]
```

### Competitor 6: KDP Builder

- URL: https://kdpbuilder.com/free-tools/page-count-calculator
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It positions the tool as a KDP planning calculator that also shows spine width and print cost.
- Inputs and defaults: [Observed] The live form exposes word count, trim size, font size, line spacing, and margin presets. [Documented] Its copy says the defaults assume standard book fonts such as Garamond and Georgia.
- Action and state behavior: [Observed] The result updates around the visible form without a separate account requirement. [Unknown] The bounded probe did not expose a distinct error state for invalid word counts.
- Results and visuals: [Observed] It shows estimated pages, approximate words per page, spine width, US paperback print cost, and a genre-fit note. The search result and live page show 171 pages, 294 words per page, 0.427-inch spine width, and $2.90 print cost for a representative default state.
- Formula or data source: [Documented] The page says 11pt to 12pt and line-spacing changes alter pages by approximate percentages. [Inferred] Its page estimate is driven by fixed density presets rather than a full text-block calculation.
- Errors and edge behavior: [Unknown] Image pages, chapter openings, front matter, and back matter are not exposed as main inputs.
- Mobile and accessibility: [Observed] The 375px page fit the viewport and kept the result visible below the compact controls. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Unknown] No clear local-processing statement was captured in the bounded probe.
- Performance: [Observed] The public result rendered without a visible loading state.
- Search-content structure: [Observed] It has supporting sections for trim size, font and spacing effects, genre fit, spine width, and print cost.
- What works: It connects page estimate to the next production decisions without requiring the user to copy numbers between tools.
- What fails: The print-cost and genre claims increase the risk that a rough page estimate is treated as a production quote.
- Do not copy: Do not add downstream price outputs until the page estimate's uncertainty and eligibility band are visible.

```text
[H1 words to pages]
[Word count] [Trim] [Font size] [Line spacing] [Margins]
[Estimated pages] [Words/page]
[Spine width] [Print cost] [Genre fit]
[What affects page count]
[Related KDP tools]
```

### Competitor 7: BookFoundry

- URL: https://bookfoundry.ai/kdp-page-count-calculator/
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It frames page count as part of a KDP print and pricing decision and says no signup is required.
- Inputs and defaults: [Observed] The visible form uses word count, trim size, font size, and list price. [Observed] The list-price input is unusual for a page-count tool because the result also includes royalty.
- Action and state behavior: [Observed] The page exposes a page-count result and a word-count reference table across common trim sizes. [Unknown] The bounded probe did not establish a distinct invalid-input message.
- Results and visuals: [Observed] It combines estimated page count, KDP print cost, and paperback royalty, then shows a table for 20,000 to 80,000 words at 5 x 8 and 6 x 9. [Documented] Its copy says the page count is an estimate and that the export workflow continues into a print-ready PDF.
- Formula or data source: [Unknown] The page does not show a full words-per-page derivation in the first screen. [Inferred] It uses a fixed page-capacity model per trim and typography preset before calculating print cost and royalty.
- Errors and edge behavior: [Unknown] Images, chapter count, matter pages, and binding-specific limits were not visible as inputs.
- Mobile and accessibility: [Observed] The 375px page fit the viewport. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Documented] The page says no signup is required; [Unknown] its calculation locality was not established in the bounded probe.
- Performance: [Observed] The calculator and reference table rendered without a visible blocking state.
- Search-content structure: [Observed] H1, calculator, reference table, and production workflow copy target page-count, print-cost, and royalty searches together.
- What works: It makes the page-count consequence concrete by showing the print-cost effect.
- What fails: Combining price and royalty with an uncertain page estimate can create false confidence and adds controls outside the user's immediate job.
- Do not copy: Do not make list price a required input for a typography estimate.

```text
[H1 KDP book page count]
[Word count] [Trim size] [Font size] [List price]
[Pages] [Print cost] [Royalty]
[Word-count and trim reference table]
[Export / production call to action]
```

### Competitor 8: BookWriter

- URL: https://www.bookwriter.vip/tools/book-page-count-calculator
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It focuses on the print total needed for a trim, spine, or quote rather than an abstract word-count conversion.
- Inputs and defaults: [Observed] The form exposes manuscript word count, print trim size, chapter count, a front and back matter allowance preset, and an interior type-density preset. The default word count is 80,000, trim is 6 x 9, chapters are 24, and density is standard.
- Action and state behavior: [Observed] It uses an explicit `Calculate print page count` action. [Unknown] The bounded probe did not establish the exact invalid-state message for zero or negative values.
- Results and visuals: [Observed] The page separates body pages, matter, chapter blanks, words per page, and a total estimate. It also links to a separate words-per-page calculator and explains how the estimate supports a spine width or print quote.
- Formula or data source: [Unknown] The exact equations and chapter-opening allowance are not disclosed in the first-screen tool. [Inferred] Matter and density presets hide a heuristic range rather than a true layout run.
- Errors and edge behavior: [Observed] The word-count field has a 1,000 to 500,000 range and chapter count has a 1 to 200 range. [Unknown] Image pages are not a separate visible input.
- Mobile and accessibility: [Observed] The 375px page fit the viewport and kept the controls stacked. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Unknown] No clear local-processing statement was captured in the bounded probe.
- Performance: [Observed] The form loaded without a visible blocking step.
- Search-content structure: [Observed] It has a dense publishing workflow around the tool, including chapter, trim, and quote-related headings.
- What works: Chapter count and matter allowances match real reasons an estimate grows beyond a word-count division.
- What fails: Density presets are convenient but make it hard to know which typographic assumptions are active.
- Do not copy: Do not make a hidden preset responsible for a production-critical page count without showing its assumptions.

```text
[H1 print trim page count]
[Word count] [Trim size] [Chapter count]
[Front + back matter] [Interior density]
[Calculate print page count]
[Body pages] [Matter] [Chapter blanks] [Total pages]
[Words/page] [Spine and quote guidance]
```

### Competitor 9: KDP Calculator Tool

- URL: https://kdpcalculatortool.com/tools/page-count-estimator
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It promises a fast KDP page estimate before trim, spine, or pricing decisions.
- Inputs and defaults: [Observed] The main controls are word count, a trim-size button, and body font size. The word-count control has a minimum of 1,000 and the font-size control allows 8 to 16pt. Line spacing, margins, chapter count, and image pages are not visible inputs.
- Action and state behavior: [Observed] The estimate updates live. A 50,000-word probe shows 167 pages at 6 x 9 and 11pt. Zero and negative values are accepted into the field and display zero pages rather than a useful minimum or empty state.
- Results and visuals: [Observed] The result leads with estimated pages and approximately 300 words per page. [Documented] Supporting copy says actual pages depend on margins, leading, font choice, paragraph spacing, and chapter breaks, and calls the estimate typically within 10 percent.
- Formula or data source: [Documented] The page exposes its approximate words-per-page claim and uncertainty language. [Unknown] The source of the 300-word coefficient and the reason for the 10 percent band are not shown.
- Errors and edge behavior: [Observed] The HTML minimum is 1,000, but the script still rendered zero pages after a zero or negative probe. This is a trust defect because the control contract and visible result disagree.
- Mobile and accessibility: [Observed] The 375px page fit the viewport with a compact stacked form. [Unknown] The trim-size button's keyboard semantics and full screen-reader behavior.
- Privacy: [Documented] The page labels the tool as running in the browser. [Unknown] No further storage or analytics detail was captured.
- Performance: [Observed] The result changed immediately after input.
- Search-content structure: [Observed] It has a short tool, FAQ, and links to royalty, advertising, and page-read tools.
- What works: The fast path is clear and the output is easy to scan.
- What fails: It hides too many variables for a page count that may drive a cover or price, and its invalid state undermines the stated minimum.
- Do not copy: Do not show a numeric result for an input outside the declared domain.

```text
[H1 KDP page count estimator]
[Word count] [Trim button] [Body font size]
[Estimated pages] [Approximate words/page]
[Why estimate] [FAQ]
[Royalty] [Ads] [Page reads]
```

### Competitor 10: AIHustleSurfer

- URL: https://aihustlesurfer.com/kdp/page-count-estimator/
- Accessed: 2026-09-16, 1280 x 900 and 375 x 812; HTTP 200.
- Audience and promise: [Observed] It presents a KDP-specific words-to-pages estimator and explains that the result can feed a cover calculator.
- Inputs and defaults: [Observed] It exposes word count, trim size, body font, font size, line spacing, front matter pages, and chapter count. Defaults include 80,000 words, 6 x 9, Times New Roman, 11pt, 1.3 leading, 6 front-matter pages, and 20 chapters.
- Action and state behavior: [Observed] Results update live. A 50,000-word probe produced 158 pages, 151 body pages including chapter openings, and 355 words per page. Zero and negative values render zero pages rather than a separate invalid state.
- Results and visuals: [Observed] The result separates estimated page count, words per page, body pages, and gutter margin used. It shows a words-per-page table by trim and font size and an explicit formula section.
- Formula or data source: [Documented] The page prints a model using text width, text height, lines per page, words per line, and a 0.85 line-fill factor. [Inferred] The half-page chapter-opening allowance and front matter values are heuristics rather than KDP rules.
- Errors and edge behavior: [Observed] Font size is bounded to 8 to 14pt, line spacing to 1 to 2, front matter to 0 to 40 pages, and chapters to 0 to 200. [Observed] The result does not block zero words.
- Mobile and accessibility: [Observed] The 375px page fit the viewport and retained all main controls in a vertical flow. [Unknown] Full keyboard and screen-reader semantics.
- Privacy: [Unknown] No clear local-processing statement was captured in the bounded probe.
- Performance: [Observed] The live result settled quickly after input.
- Search-content structure: [Observed] It has a concise formula explanation, words-per-page table, FAQ, and a related-tool path.
- What works: This is the best live example of a transparent, adjustable typography model with KDP gutter context.
- What fails: A fixed 0.85 line-fill factor and chapter overhead can look authoritative even though the page labels the output as an estimate.
- Do not copy: Do not turn a visible equation into a guarantee. Show which parts are KDP rules and which parts are local assumptions.

```text
[H1 KDP page count estimator]
[Word count] [Trim] [Body font]
[Font size] [Line spacing] [Front matter] [Chapters]
[Estimated pages] [Words/page] [Body pages] [Gutter]
[Formula] [Words/page table] [FAQ] [Cover link]
```

## Comparison matrix

| Capability | KDPEasy | SmartKDP | ByteTools | Adducent | BestPrinting | KDP Builder | BookFoundry | BookWriter | KDP Calculator Tool | AIHustleSurfer | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Word-count input | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Yes | High |
| KDP trim presets | [Observed] Yes | [Observed] Many | [Observed] Several plus custom | [Observed] Trim plus custom dimensions | [Observed] Yes | [Observed] Yes | [Observed] Yes | [Observed] Five print trims | [Observed] Button selector | [Observed] Many | High |
| Font and spacing controls | [Observed] Font, size, spacing | [Observed] Typeface, size, leading | [Observed] Size, leading, width band | [Observed] Size, leading, density | [Observed] Size and spacing | [Observed] Size and spacing | [Observed] Size | [Observed] Density preset | [Observed] Size only | [Observed] Font, size, leading | High |
| Explicit margins | [Observed] Preset | [Documented] Worked margin assumption | [Observed] Four numeric margins | [Observed] Four numeric margins | [Unknown] Not visible | [Observed] Preset | [Unknown] Not visible | [Unknown] Hidden in density | [Unknown] Not visible | [Documented] Gutter model | High |
| Range or uncertainty | [Observed] Single result | [Observed] Low, middle, high | [Documented] Close estimate caveat | [Observed] Production estimate | [Documented] Starting estimate | [Documented] Approximate assumptions | [Documented] Estimate | [Observed] Density-driven total | [Documented] About 10 percent | [Documented] Estimate | High |
| Chapter and matter controls | [Documented] Caveat only | [Observed] Fixed matter assumption | [Observed] Front and back matter | [Unknown] Not visible | [Observed] Image/table pages only | [Documented] Caveat only | [Unknown] Not visible | [Observed] Chapters and matter presets | [Documented] Caveat only | [Observed] Chapters and front matter | High |
| Image or visual-page allowance | [Documented] Caveat only | [Unknown] Not a main input | [Documented] Caveat only | [Documented] Excluded from estimate | [Observed] Image/table pages | [Unknown] Not visible | [Unknown] Not visible | [Unknown] Not visible | [Documented] Caveat only | [Documented] Caveat only | High |
| KDP limit and gutter context | [Documented] Trim max in copy | [Documented] Gutter and even-count notes | [Unknown] Not first-screen | [Unknown] Not first-screen | [Unknown] Generic | [Documented] KDP framing | [Unknown] Not first-screen | [Unknown] Not first-screen | [Unknown] Not first-screen | [Documented] Gutter bands | High |
| Formula visibility | [Unknown] Coefficient hidden | [Observed] Working table | [Observed] Full intermediate breakdown | [Observed] Calculation basis label | [Unknown] Hidden | [Unknown] Preset model | [Unknown] Hidden | [Unknown] Hidden | [Unknown] Hidden | [Documented] Equation shown | High |
| Local or no-account path | [Unknown] Privacy not clear | [Documented] Cookie notice; calculation locality unknown | [Documented] Browser-local | [Unknown] Not captured | [Unknown] Not captured | [Unknown] Not captured | [Documented] No signup | [Unknown] Not captured | [Documented] Runs in browser | [Unknown] Not captured | Medium |
| Downstream production links | [Observed] Spine, cover, royalty | [Observed] Spine and print cost | [Observed] Spine and royalty tools | [Unknown] Supporting service | [Unknown] Generic publishing copy | [Observed] Spine and print cost | [Observed] Print-ready PDF path | [Observed] Spine and quote path | [Observed] Cover and pricing links | [Observed] Cover link | Medium |
| Mobile width in live probe | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | [Observed] 375px fit | High |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| What is a word-per-page constant? | Live outputs range from roughly 275 at KDPEasy's default to about 300 at KDP Calculator Tool, 345 at SmartKDP, 355 at AIHustleSurfer, and 418 in ByteTools' representative default breakdown. | [Documented] KDP says it calculates the final page count from the manuscript file and does not publish a words-per-page constant: https://kdp.amazon.com/en_US/help/topic/G201857950 | Use no universal constant. Derive capacity from trim, margins, font-size, leading, and a labelled glyph/line-fill assumption. |
| Should the result be exact or a range? | KDPEasy, KDP Calculator Tool, and many generic tools lead with one number. SmartKDP exposes low, middle, and high values. Adducent and several pages call the result a production estimate. | [Observed] SmartKDP's first screen shows a 196 to 294 range for its default 80,000-word case and explains the working. | Use a range as the primary answer, with a middle estimate only as a planning anchor. Do not promise a typeset match. |
| How should the KDP gutter be selected? | Some tools hide margins in a preset. AIHustleSurfer and SmartKDP apply a gutter band based on an estimated page count. ByteTools lets the user override all margins. | [Documented] KDP's inside margin changes at 150, 300, 500, 700, and 828 pages: https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 | Make the gutter band visible. If the range crosses a band, show both bands or run a documented two-pass estimate. |
| Are chapter openings a fixed cost? | AIHustleSurfer treats each chapter start as roughly half a page. BookWriter exposes chapter count. Nueel uses a chapter-opening assumption in its reference table. Other tools omit it. | [Inferred] These are layout heuristics, not KDP rules. KDP only establishes the final submitted-file count. | Accept chapter count as an optional estimate input and label the overhead as an assumption. Never call it an official KDP allowance. |
| How should images and tables affect the answer? | BestPrintingCalculators exposes image/table pages. Adducent and ByteTools warn that visual content is outside the word model. Most KDP-focused tools omit a numeric allowance. | [Documented] KDP describes page count from the manuscript file, while competitors explicitly say visual material changes pagination. | Ask for image or visual pages as a direct count. Do not infer image placement from word count. |
| When should the estimate be rounded? | Some tools round to even pages; others show an unrounded or single estimate. Community answers mix page-fold explanations with KDP behavior. | [Documented] KDP says it rounds up to an even number: https://kdp.amazon.com/en_US/help/topic/G201857950 | Keep an unrounded internal estimate for the breakdown, then show the KDP-style even planning value and its range. |
| Which maximum applies? | Competitors often mention 828 as a general paperback maximum, while KDP varies the maximum by trim, paper, ink, and binding. | [Documented] KDP's trim table lists different limits and hardcover uses 75 to 550 pages: https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 | Require a binding and interior selection, or scope the first version to one format. Never show a universal 828-page warning. |

## Evidence-backed opportunities

1. **Make uncertainty the answer, not a footnote.** [Observed] Most competitors lead with one page number, while SmartKDP is the clearest range-based exception. [Observed] Community questions show that font, trim, margins, chapter layout, and dialogue change the result. A low, middle, and high estimate with the active assumptions would give the user a more honest planning value.

2. **Separate KDP rules from typography assumptions.** [Documented] KDP provides trim limits, even-page rounding, gutter bands, and bleed dimensions. [Inferred] Words-per-page, glyph width, line fill, chapter overhead, and visual-page handling belong to the estimator's model. Show those two layers separately so a user can audit what came from KDP and what came from stack127.

3. **Warn before the range crosses a production limit.** [Observed] Long-manuscript community threads discover page limits late. [Documented] KDP limits vary by trim, paper, ink, and binding. The result should say when the likely range crosses a KDP minimum, maximum, or gutter band, and point to the input that moves it.

4. **Use direct layout inputs instead of a genre shortcut.** [Observed] SmartKDP's genre presets are convenient, but they hide typography choices. [Observed] ByteTools shows that margin, line spacing, typeface width, and average word length can be exposed directly. A compact default plus an advanced typography disclosure would serve both first-time authors and technical formatters.

5. **Count non-body pages explicitly.** [Observed] BestPrintingCalculators exposes image or table pages; ByteTools exposes front and back matter; BookWriter exposes chapter and matter presets. A direct count for front matter, back matter, chapter starts, and image pages would avoid silently inventing layout detail.

6. **Keep the fast path usable on a phone.** [Observed] All 10 live competitors fit the 375px document width, but the detailed forms become long on mobile. The first screen should ask for word count and trim, then place typography and page-break assumptions behind one compact advanced section. The range and KDP warning should remain visible after the form.

7. **Connect the estimate to the next production decision without mixing jobs.** [Observed] KDPEasy, SmartKDP, BookWriter, and KDP Calculator Tool link to spine, cover, price, or print-cost tools. The page can offer a clearly labelled handoff using the middle estimate, while keeping royalty and cover calculations out of the page-count answer itself.

## Table stakes

- Word count with a clear unit and a positive-value error state.
- KDP trim-size presets, with the chosen dimensions visible in the result.
- Font family or width band, font size, line spacing, and margin assumptions.
- Optional chapter count, front matter, back matter, and visual-page allowances.
- A visible range plus a middle planning value, not a lone exact-looking number.
- Words per page, text area, lines per page, and the main assumptions in a compact breakdown.
- Even-page planning output and format-specific KDP eligibility warnings.
- A warning that final pagination comes from the submitted manuscript file and can change after typesetting.
- Clear separation between KDP-documented values and stack127 estimates.
- A no-account, browser-local calculation path with no manuscript upload.
- A stacked mobile layout that fits the 375px viewport and keeps the result easy to scan.
- Source links for KDP limits, margins, bleed, and rounding.

## Ideas to reject

- **A single "accurate page count" promise:** KDP does not publish a words-per-page constant, and final pagination depends on layout details the estimator cannot see.
- **A genre-only model:** Genre can suggest a preset, but it cannot replace trim, font, leading, margins, chapter starts, or visual pages.
- **A universal 828-page warning:** KDP's maximum changes by trim, ink, paper, and binding.
- **An AI formatter or manuscript uploader in this tool:** That changes the task, adds privacy and maintenance risk, and makes the page-count result depend on a hidden renderer.
- **A royalty and cover dashboard:** Spine and price links are useful handoffs, but they would bury the page-count answer under unrelated controls.
- **A promise to match KDP Previewer:** The submitted interior PDF remains the source of the actual page count and KDP can perform checks the calculator cannot reproduce.

## Open questions and blockers

- Decide whether the first version supports paperback only or asks for binding, ink, and paper so it can show hardcover and format-specific limits.
- Choose the default typography model: explicit font-width bands, named font presets, or a small set of density presets. The report supports an auditable model, but KDP does not define its coefficients.
- Decide whether chapter openings use a configurable pages-per-chapter assumption or only a user-supplied page allowance. A hidden half-page rule should not ship.
- Define the meaning of image pages. The safest input is a count of pages occupied by full-page or layout-breaking visual material, with a note that inline images may reflow differently.
- Decide how to display a range that crosses a gutter or KDP maximum. The result should not collapse a mixed eligibility state into one green answer.
- Confirm whether the first release should hand the middle estimate to `/kdp-book-setup-calculator` once that separate tool exists. No route or implementation decision is made in this research report.

## Sources

- KDP, `Print Options`: https://kdp.amazon.com/en_US/help/topic/G201834180, accessed 2026-09-16. Documented supported paperback and hardcover trim, ink, paper, and page-count ranges.
- KDP, `Set Trim Size, Bleed, and Margins`: https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6, accessed 2026-09-16. Documented trim, page-limit, bleed, gutter, margin, and reading-direction rules.
- KDP, `Paperback Submission Guidelines`: https://kdp.amazon.com/en_US/help/topic/G201857950, accessed 2026-09-16. Documented even-page rounding, minimum page count, interior bleed, spine multipliers, and file specifications.
- KDP, `Fix Paperback and Hardcover Formatting Issues`: https://kdp.amazon.com/en_US/help/topic/G201834260, accessed 2026-09-16. Documented that KDP calculates page count from the manuscript and rounds up to an even number.
- KDPEasy, `Word Count to Page Calculator`: https://www.kdpeasy.com/tools/word-count-to-page-calculator, accessed 2026-09-16. Live controls, trim comparison, spine handoff, and single-number behavior.
- SmartKDP, `Word Count to Page Count Calculator`: https://smartkdp.com/tools/word-count-to-page-count-calculator, accessed 2026-09-16. Live range output, worked assumptions, genre/type controls, and KDP rounding discussion.
- ByteTools, `Book Page Count Calculator`: https://bytetools.bytevancer.com/book-page-count-calculator, accessed 2026-09-16. Live typography inputs, intermediate breakdown, custom trim, and browser-local calculation claim.
- Adducent Creative, `Book Page Count Calculator`: https://adducentcreative.com/adducent-book-page-count-calculator/, accessed 2026-09-16. Live production-estimate inputs and visual-content exclusion.
- BestPrintingCalculators, `Book Page Count Calculator`: https://bestprintingcalculators.com/book-page-count-calculator/, accessed 2026-09-16. Live word, trim, typography, and image/table-page inputs.
- KDP Builder, `Words to Pages Calculator`: https://kdpbuilder.com/free-tools/page-count-calculator, accessed 2026-09-16. KDP-oriented estimate, preset typography, spine width, and print-cost handoff.
- BookFoundry, `KDP Book Page Count Calculator`: https://bookfoundry.ai/kdp-page-count-calculator/, accessed 2026-09-16. Live page-count, print-cost, royalty, and word-count reference-table workflow.
- BookWriter, `Book Page Count Calculator for Print Trim Sizes`: https://www.bookwriter.vip/tools/book-page-count-calculator, accessed 2026-09-16. Live chapter, matter, density, and trim controls.
- KDP Calculator Tool, `KDP Page Count Estimator`: https://kdpcalculatortool.com/tools/page-count-estimator, accessed 2026-09-16. Live fast-path estimator, approximate words-per-page claim, and invalid-state probe.
- AIHustleSurfer, `KDP Page Count Estimator`: https://aihustlesurfer.com/kdp/page-count-estimator/, accessed 2026-09-16. Live transparent typography equation, chapter and matter inputs, gutter display, and even rounding.
- Reddit, `KDP page count question`: https://www.reddit.com/r/selfpublish/comments/1sz66zc/kdp_page_count_question/, accessed 2026-09-16. Community evidence about small page changes, even pages, and cover measurements.
- Reddit, `Margin measurements?`: https://www.reddit.com/r/KDP/comments/1taw7sq/margin_measurements/, accessed 2026-09-16. Community evidence about page-count-dependent gutter questions.
- Reddit, `My 200k word manuscript won't fit Amazon's print specs`: https://www.reddit.com/r/selfpublish/comments/1s9iwd8/my_200k_word_manuscript_wont_fit_amazon_s_print/, accessed 2026-09-16. Community evidence about long-manuscript limits and typography tradeoffs.
- Reddit, `How screwed am I in (print) self-publish if my book is 200k words`: https://www.reddit.com/r/selfpublish/comments/1qel4om/how-screwed-am-i-in-print-self-publish-if-my-book-is-200k-words/, accessed 2026-09-16. Community evidence about trim, font, spacing, margins, and uncertainty.

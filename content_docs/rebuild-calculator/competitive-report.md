# Competitive report: Rebuild Window and Read-Error Exposure Calculator

Status: ready
Tool: Rebuild Window and Read-Error Exposure Calculator
Route: /rebuild-calculator
Researched: 2026-08-23
Direct competitors reviewed: 10
Saturation exception: no

## Research scope

### Current stack127 state

The flat route /rebuild-calculator does not exist in the worktree. There is no route-owned document, engine, test, script, manifest, or publication row for this tool. The closest existing surfaces are the published RAID, ZFS capacity, ZFS padding, and RAIDZ expansion tools, but none calculates a rebuild window together with read-error exposure. The new page can own a pure route-local engine and interface without changing shared storage code, a hub, a sidebar, a count, a migration, or the publication registry.

The route is intended for a homelab or NAS builder comparing a fresh array or investigating a degraded array. The useful answer is an assumption-bound rebuild duration, the full-drive-equivalent bytes read during that rebuild, and the modeled probability of at least one read error under a selected URE specification. It is not an MTTDL model or a data-loss guarantee.

### Method and coverage

Four query shapes were searched through the web connector. SearXNG was not configured in the worktree, so Bing and DuckDuckGo were not individually available and are not claimed below. Direct pages were operated with the repository standalone Playwright CLI and Chromium in a read-only run. The first five direct pages were inspected at 1280x900 and 390x844; the second and third batches used the same viewports. Images, media, and fonts were blocked to keep the run bounded. Screenshots were written to /tmp/rebuild-research-*.png and are temporary evidence, not repository artifacts.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI with Chromium 1.60.0
- Accessed: 2026-08-23, Asia/Kolkata
- Browser limitations: ThisCalc triggered a navigation before the DOM snapshot completed; pcserverandparts returned a Cloudflare 403. Both remain direct competitors based on search evidence, but their live interactions are marked unavailable.

### Search saturation evidence

- Queries tried: "rebuild window" "read error" RAID calculator; RAID rebuild time unrecoverable read error calculator; RAID URE probability rebuild exposure calculator; RAID rebuild risk read error drive failure comparison; RAID rebuild calculator URE probability; RAID failure probability calculator rebuild time URE; RAID 5 rebuild calculator read error probability; RAID calculator rebuild time MTTDL URE.
- Repeated domains: raidsize.com, thiscalc.com, and broad RAID calculator sites appeared repeatedly. The result set also included older one-purpose tools, vendor calculators, MTTDL calculators, and articles.
- Exclusions: articles, forum threads, papers, generic RAID capacity calculators without rebuild or URE output, and vendor product pages were not counted as direct competitors. Ten direct tool pages were reviewed or attempted, so no saturation exception is needed.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Rebuild duration | RAID rebuild time calculator | A time estimate from drive size, array layout, and effective rebuild rate. | Calculator mixed with capacity and performance outputs. |
| Read-error exposure | RAID rebuild URE probability | The amount of media read and the chance of meeting at least one specified read error. | Small URE calculator or risk paragraph; often no time window. |
| Layout comparison | RAID 5 vs RAID 6 rebuild risk | A like-for-like comparison of source-read work and error tolerance. | Broad RAID calculator, table, or advice article. |
| Failure investigation | what is the risk during RAID rebuild | A plain explanation of the degraded window and what the estimate does not prove. | Blog, forum, or recovery-provider explanation. |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| A rebuild is a degraded interval, not just a capacity operation. | https://superuser.com/questions/516949/formula-to-calculate-probability-of-unrecoverable-read-error-during-raid and repeated DataHoarder questions in search results. | Repeated across technical Q&A and forums. | Put the window and the read exposure beside each other, not in separate tools. |
| People confuse a vendor URE specification with a guaranteed failure probability. | https://www.raid-failure.com/raid5-failure.aspx explicitly says the approach attracts reasonable criticism; https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100818527d.pdf labels the value a maximum specification. | Repeated in comments, articles, and calculator disclaimers. | Call the output a model and expose the URE input and formula. Do not label it actual data-loss risk. |
| RAID 6, RAIDZ2, mirrors, and parity arrays do not read the same amount of source media. | https://raidsize.com/tools/rebuild/en and https://www.toolfoundry.app/technology/raid-capacity-calculator expose conflicting RAID 6 read assumptions. | A material formula disagreement across current tools. | Lock one documented launch model and show the source-drive count in the result. |
| Broad MTTDL tools ask for many hard-to-justify reliability inputs before answering the immediate question. | https://www.servethehome.com/RAID/simpleMTTDL.php, https://www.variedtools.com/calculate-mttdl, and https://www.simplified.tools/calculate_raid_reliability_mttdl. | Common pattern in operated tools. | Keep launch scope to rebuild window and read-error exposure; defer AFR, fleet correlation, MTTDL, and annualized loss. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| Drive datasheets express a nonrecoverable read-error specification as errors per bits read. | Seagate IronWolf product manual, Seagate desktop HDD specifications, and WD Red Plus data sheet. | Documented | The values are maximum or specified rates, not a per-array guarantee. |
| Rebuild duration is read work divided by effective rebuild throughput, plus any replacement delay. | Intel RSTe degraded-array rebuild guidance; the division is a direct dimensional derivation. | Documented plus inferred | Throughput is user input because controller, workload, drive, and implementation change it. |
| A parity rebuild reads surviving source media and a mirror rebuild can read the surviving partner. | Intel RAID Software User Guide and Fujitsu RAID protection white paper. | Documented | Exact implementation read scheduling varies, so launch exposes an explicit idealized source-read model. |
| At-least-one-read-error probability can be modeled from independent per-bit exposure as 1 - (1 - p)^bits, or its numerically stable Poisson approximation 1 - exp(-bits / ratedBits). | Hand derivation from independent Bernoulli trials; the same model is shown by raidsize.com and pcserverandparts.com. | Inferred model, documented by competitors | The page must name this as a simple exposure model and avoid calling it observed failure probability. |
| A second-error tolerance is not the same as a guarantee that a controller will continue every rebuild. | Intel RAID Software User Guide documents RAID 6 two-drive protection; vendor behavior and sector handling differ. | Documented boundary | Show modeled error tolerance separately from P(at least one URE). |
| Rebuild speed and replacement delay are operational inputs, not fixed properties of a RAID level. | Intel degraded RAID rebuild guidance and the operated competitor controls. | Documented plus observed | Do not use competitor default speeds as universal facts. |

## Competitor reviews

### Competitor 1: RaidSize Rebuild Time and URE Risk Calculator

- URL: https://raidsize.com/tools/rebuild/en
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] A homelab or NAS user comparing rebuild duration and URE risk for parity, mirror, ZFS, SHR, and Unraid layouts.
- Inputs and defaults: [Observed] RAID level; drive class with 10^-14, 10^-15, and 10^-16 style presets; drive size; drive count; optional mixed drive sizes; rebuild speed; ZFS-only array fill; optional per-drive pool sizes. Defaults showed RAID 6, 6 drives, 8 TB, 70 MB/s, 80% fill, and a 10^-15 URE rate.
- Action and state behavior: [Observed] Controls update the result live. Quick count buttons, an Add drive button, a language menu, and an advanced/configuration surface are present. No explicit calculate action was visible in the initial state.
- Results and visuals: [Observed] Rebuild time, bits read, P(URE during rebuild), P(rebuild succeeds), a verdict sentence, and a How this is calculated disclosure lead the result. The result showed 31.7 hours, 32 TB read, 22.6% URE probability, and a tolerates 1 URE statement for the default RAID 6.
- Formula or data source: [Documented] The page states rebuild time = drive size x fill / rebuild speed, RAID 5 reads (N-1) x drive size, RAID 6 reads (N-2) x drive size, and the probability approximation 1 - exp(-r x B). It names manufacturer datasheets and Backblaze as sources.
- Errors and edge behavior: [Observed] The live default was usable, but a complete invalid matrix was not exercised. [Unknown] Error recovery and stale-result clearing were not verifiable from the initial state.
- Mobile and accessibility: [Observed] The main content had zero document and body overflow at 390px. Labels and range controls exposed useful accessible names, but the custom RAID selector and compact navigation needed more manual keyboard review.
- Privacy: [Unknown] No privacy statement was visible in the captured first screen.
- Performance: [Observed] DOM content and calculated default result became available during the bounded run; no benchmark was attempted.
- Search-content structure: [Observed] One descriptive h1, one long explanatory h2, and an FAQ section. The page puts tool output before long prose.
- What works: It is the clearest direct competitor for joining time, bytes read, URE probability, and tolerance in one result.
- What fails: It mixes many vendor layouts and ZFS-specific fill behavior into one control surface, and its RAID 6 source-read assumption differs from other tools.
- Do not copy: The large multi-layout picker and advice that names a preferred RAID level without a full system context.

    H1 Rebuild Time & URE Risk Calculator
      Intro
      [RAID selector] [drive class] [drive size] [drive count]
      [rebuild speed] [fill] [optional mixed drives]
      RESULTS: time | bits read | P(URE) | P(success)
      Verdict sentence and formula disclosure
      Long explanation and FAQ

```text
H1 Rebuild Time & URE Risk Calculator
  [array layout] [drive class] [size] [count]
  [speed] [fill]
  Rebuild time | bits read | URE probability | tolerance
```

### Competitor 2: ThisCalc RAID Rebuild Risk Calculator

- URL: https://thiscalc.com/calculators/raid-rebuild
- Accessed: 2026-08-23 through search and a Playwright navigation attempt. The DOM snapshot was interrupted by a page navigation, so live operation was incomplete.
- Audience and promise: [Documented] Calculates RAID rebuild time, URE probability, and data-loss risk.
- Inputs and defaults: [Documented] RAID level, drive count, drive capacity, URE exponent, MTBF, rebuild throughput, array utilization, hot-spare availability, and replacement delay.
- Action and state behavior: [Unknown] Search text exposed a form and Reset action; the bounded navigation did not complete a safe interaction.
- Results and visuals: [Documented] Usable capacity, efficiency, rebuild time, URE probability, second-drive failure probability, overall data-loss probability, and risk assessment, plus comparison charts and CSV/print actions.
- Formula or data source: [Documented] The search result describes URE and second-failure calculations but the formula and exact source precedence were not independently verified.
- Errors and edge behavior: [Unknown] Not accessible in the bounded live run.
- Mobile and accessibility: [Unknown] Not accessible in the bounded live run.
- Privacy: [Unknown] Not verified.
- Performance: [Unknown] Not verified.
- Search-content structure: [Observed from search result] Descriptive title, calculator-first structure, and a disclaimer.
- What works: It recognizes replacement delay and hot-spare response as part of the danger window.
- What fails: It bundles MTTDL-style failure modeling with the immediate rebuild question before establishing a narrow, auditable formula.
- Do not copy: A single composite overall data-loss probability that hides which assumption drove it.

    H1 RAID Rebuild Survival & URE Risk Calculator
      Array configuration
      Drive reliability
      Results: capacity, time, URE, second failure, overall risk
      Comparison charts / export / print

```text
H1 RAID Rebuild Survival & URE Risk Calculator
  Array configuration
  Drive reliability
  Results and comparison charts
```

### Competitor 3: magJ RAID rebuild failure chance calculator

- URL: https://magj.github.io/raid-failure/
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] A small single-purpose calculator for the chance that a RAID rebuild fails due to an unrecoverable read error.
- Inputs and defaults: [Observed] RAID 5 or RAID 6, drive size from 500 GB through 12 TB, number of drives from 3 through 20, and URE rate from 10^9 through 10^17 bits. The captured default output said Errorless rebuild success chance: 20%.
- Action and state behavior: [Observed] Four native selects and a result that changes with input. There was no visible reset, copy, chart, or explicit action.
- Results and visuals: [Observed] One success percentage and a short assumption note. No rebuild duration or read-byte count.
- Formula or data source: [Documented] The page states that other drive errors and failures are not considered. [Unknown] The exact source-read branch and formula were not exposed in the initial DOM.
- Errors and edge behavior: [Unknown] Native select bounds exist; invalid and stale states were not observable.
- Mobile and accessibility: [Observed] No document or body overflow at 390px. Native controls are keyboard-compatible, but labels are plain and the answer hierarchy is very sparse.
- Privacy: [Unknown] No statement visible.
- Performance: [Observed] Instant local result.
- Search-content structure: [Observed] One h1 and a short intro; no supporting headings.
- What works: Narrow scope and explicit exclusion of other drive failures.
- What fails: A percentage without the number of bits read or a rebuild window is hard to audit or operationalize.
- Do not copy: A result that asks the user to trust hidden assumptions.

    H1 RAID rebuild failure chance calculator
      Assumption note
      [RAID type] [drive size] [drive count] [URE rate]
      Errorless rebuild success chance: 20%
      Project link

```text
H1 RAID rebuild failure chance calculator
  [RAID type] [drive size] [drive count] [URE rate]
  Errorless rebuild success chance
```

### Competitor 4: ServeTheHome Advanced RAID Calculator

- URL: https://www.servethehome.com/RAID/simpleMTTDL.php
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] Advanced reliability comparison using MTTDL rather than a simple rebuild answer.
- Inputs and defaults: [Observed] MTBF preset, nonrecoverable error rate, drive capacity and unit, sector size and unit, disk quantity, volumes, and rebuild speed. The page displayed RAID 0, 1, 10, 5, 6, Z3, and RAID 50 tables.
- Action and state behavior: [Observed] A native form with a Submit button and static tables after the default load. No share or reset action was captured.
- Results and visuals: [Observed] Formatted capacity, MTTDF, bit-error MTTDL, MTTDL hours and years, and year-by-year failure percentages. The 390px run produced 326px document overflow and 366px body overflow from wide tables.
- Formula or data source: [Documented] Inputs and MTTDL labels are visible; the full derivation was not exposed in the captured first screen.
- Errors and edge behavior: [Unknown] Not exercised.
- Mobile and accessibility: [Observed] Desktop table was readable; narrow output overflowed substantially and had no responsive reflow in the bounded run.
- Privacy: [Unknown] No local handling statement visible.
- Performance: [Observed] Default tables loaded quickly; no benchmark.
- Search-content structure: [Observed] No meaningful h1 or explanatory first-screen hierarchy; the interface is a legacy form and table.
- What works: It surfaces the distinction between bit-error MTTDL and other MTTDL values.
- What fails: It answers a broader reliability question with many opaque assumptions and fails narrow layout.
- Do not copy: Huge exact-looking MTTDL numbers or the dense table as the first answer.

    Legacy form: MTBF / NER / capacity / sector / disk count / volumes / rebuild speed
    Submit
    Wide tables for capacity and several MTTDL variants

```text
Legacy form
  MTBF | NER | capacity | sector | disk count | volumes | speed
  Submit
  Wide MTTDL tables
```

### Competitor 5: VariedTools MTTDL calculator

- URL: https://www.variedtools.com/calculate-mttdl
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] MTTDL and failure probability for RAID systems, with an explicit browser-only privacy statement.
- Inputs and defaults: [Observed] RAID level, number of drives, MTBF, rebuild time, BER/URE exponent, drive capacity, and years for failure probability. The default form showed blank numeric values while the explanatory page loaded.
- Action and state behavior: [Observed] Multiple Copy buttons next to outputs, with no obvious primary calculate action in the captured controls. A large site navigation surrounds the tool.
- Results and visuals: [Observed] MTTDL hours, MTTDL years, and failure probability, with extensive explanatory sections and copy actions.
- Formula or data source: [Documented] The page identifies MTTDL, BER, URE, rebuild time, and an analysis period; detailed formula review was outside the first-screen capture.
- Errors and edge behavior: [Unknown] Not exercised.
- Mobile and accessibility: [Observed] Zero document and body overflow at 390px in the captured state, but the surrounding navigation is noisy and the blank-default state does not prove a long result is safe.
- Privacy: [Documented] It says calculations run in the browser and no data is sent to a server.
- Performance: [Observed] Static page and form loaded within the bounded run.
- Search-content structure: [Observed] Many h2 sections including how-to, technical notes, glossary, and FAQ.
- What works: It states privacy and names the reliability terms users need.
- What fails: It makes the immediate rebuild exposure question compete with MTTDL and a long article-like page.
- Do not copy: A site-wide navigation wall or an output collection that makes the user choose which reliability metric matters before seeing read exposure.

    H1 MTTDL calculator
      Intro with privacy statement
      Form: RAID, drives, MTBF, rebuild hours, BER, capacity, horizon
      MTTDL hours / years / failure probability with copy actions
      Long technical notes, glossary, FAQ

```text
H1 MTTDL calculator
  RAID | drives | MTBF | rebuild hours | BER | capacity | horizon
  MTTDL hours | MTTDL years | failure probability
```

### Competitor 6: Servnet UK RAID calculator

- URL: https://www.servnetuk.com/raid-calculator
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] Commercial RAID planning covering capacity, IOPS, throughput, fault tolerance, rebuild time, and URE risk across many RAID variants.
- Inputs and defaults: [Observed] A large RAID-level button matrix including RAID 0/1/5/6/10/50/60, RAIDZ1/2/3, RAID-DP, RAID-TEC, drive count, drive capacity presets, drive class, and performance-related choices.
- Action and state behavior: [Observed] Level buttons and steppers update the interface; the configuration form is broad. The page is designed as a guided tool plus lead-generation surface.
- Results and visuals: [Observed] Capacity and resilience are primary, with rebuild time and URE risk among many output categories. The first screen contains multiple level comparison paths and explanatory sections.
- Formula or data source: [Documented] Search results state that it calculates rebuild time and URE probability for a single-drive rebuild, but exact read-count rules were not independently verified.
- Errors and edge behavior: [Unknown] Not exercised in the bounded run.
- Mobile and accessibility: [Observed] The captured 390px page loaded without page overflow, but the many RAID buttons and commercial navigation create density risk.
- Privacy: [Unknown] Not verified.
- Performance: [Observed] Loaded within the bounded run; no benchmark.
- Search-content structure: [Observed] Many section headings for each RAID level, trade-offs, guides, and FAQs.
- What works: The level comparison matrix gives broad coverage and useful entry points.
- What fails: The immediate rebuild answer is buried inside a capacity and performance suite.
- Do not copy: A large option matrix when the user's job is only to quantify the rebuild window.

    H1 RAID calculator
      Choose a RAID level: large button matrix
      Configure drives and capacity
      Drive class / performance options
      Capacity + IOPS + tolerance + rebuild + URE outputs
      Level-specific guides and FAQs

```text
H1 RAID calculator
  RAID level matrix
  Drives and capacity
  Drive class and performance
  Capacity | IOPS | rebuild | URE
```

### Competitor 7: Simplified.tools RAID Reliability and MTTDL Calculator

- URL: https://www.simplified.tools/calculate_raid_reliability_mttdl
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] A high-detail reliability model from AFR, rebuild duration, URE rate, spares, correlation, and fleet size.
- Inputs and defaults: [Observed] Environment preset, RAID level, drives per group, group count, drive AFR, drive capacity, URE mode or custom exponent, rebuild duration, analysis horizon, and advanced settings.
- Action and state behavior: [Observed] Tab-like buttons expose Reliability Breakdown, Mitigation Ladder, Exposure Budget, Loss Horizon Runway, Tradeoff Matrix, and other panels. The page offers JSON and copy/download/export actions.
- Results and visuals: [Observed] The page describes loss probabilities and mitigation checks, with many advanced report panels. It loads a substantial explanatory document.
- Formula or data source: [Documented] The page names MTTDL, AFR, URE, group count, correlation, and fleet size. [Unknown] Exact model equations were not independently verified.
- Errors and edge behavior: [Unknown] Not exercised.
- Mobile and accessibility: [Observed] No page overflow in the captured state, but the number of tabs and reports is a mobile density risk.
- Privacy: [Observed] A share control can include current inputs; the exact default privacy behavior needs review.
- Performance: [Observed] Loaded within the bounded run; no benchmark.
- Search-content structure: [Observed] The page includes many technical headings, limitations, worked examples, FAQ, glossary, and references.
- What works: It treats rebuild duration as one part of degraded exposure and offers explicit mitigation concepts.
- What fails: It is far beyond the smallest trustworthy answer and invites overinterpretation of modeled reliability.
- Do not copy: A fleet-wide reliability score or mitigation recommendation at launch.

    H1 RAID Reliability and MTTDL Calculator
      Detailed reliability form
      Breakdown / mitigation / exposure / runway / matrix panels
      Reports / JSON / exports
      Long formula, limitation, example, FAQ, glossary, references

```text
H1 RAID Reliability and MTTDL Calculator
  Detailed reliability form
  Breakdown | mitigation | exposure | runway | matrix
  Reports and exports
```

### Competitor 8: ToolFoundry RAID Capacity Calculator

- URL: https://www.toolfoundry.app/technology/raid-capacity-calculator
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] Usable capacity, fault tolerance, and rebuild time for RAID 0, 1, 5, 6, and 10, with an explanation that long parity rebuilds are risky.
- Inputs and defaults: [Observed] RAID level, number of drives, capacity per drive, free-space target, and rebuild throughput. Default was four 4 TB drives in RAID 5, 20% free space, and 150 MB/s.
- Action and state behavior: [Observed] Live recalculation, Reset, Copy link, Copy results, Print/Save PDF, and a small feedback question. No separate Calculate button was visible.
- Results and visuals: [Observed] Usable capacity, fault tolerance, efficiency, rebuild time, a verdict paragraph, an exact table, and a worked explanation. It exposes Data read to rebuild as (drives - 1) x drive size for parity and one drive for mirrors.
- Formula or data source: [Documented] The page states its formulas and its assumption that parity reads every surviving drive. It does not calculate URE probability.
- Errors and edge behavior: [Unknown] Not exercised.
- Mobile and accessibility: [Observed] Zero document and body overflow at 390px; the table remains long but the visible content starts with the answer.
- Privacy: [Unknown] Not verified.
- Performance: [Observed] Live result loaded quickly.
- Search-content structure: [Observed] Descriptive h1, a short intro, calculator first, exact table, next-step links, FAQs later.
- What works: Excellent answer hierarchy and transparent rebuild read calculation.
- What fails: No URE rate or read-error probability, and the full table plus prose can become long.
- Do not copy: Capacity-first framing when this tool's primary answer is risk exposure.

    H1 RAID Capacity Calculator
      Intro and small badges
      Calculator: level / drives / size / free space / rebuild rate
      Usable capacity | tolerance | efficiency | rebuild time
      Verdict sentence and exact accounting table
      Explanation, next links, FAQs

```text
H1 RAID Capacity Calculator
  [level] [drives] [capacity] [free space] [rebuild rate]
  Usable capacity | tolerance | efficiency | rebuild time
  Exact accounting table
```

### Competitor 9: Kalcufy RAID Calculator

- URL: https://www.kalcufy.com/en/raid-calculator
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] Broad RAID capacity, performance, rebuild time, and URE-risk comparison.
- Inputs and defaults: [Observed] RAID 5 default, four drives, 4 TB capacity, HDD type, rebuild speed 100 MB/s, and URE rate of 10^14. Quick-start presets covered Home NAS, Basic Server, Advanced, High Performance, and Enterprise.
- Action and state behavior: [Observed] The result is precomputed on load and includes Copy Results, Share Results, and paid PDF/Excel exports. The mobile navigation collapses into a menu.
- Results and visuals: [Observed] Usable capacity, overhead, efficiency, fault tolerance, IOPS, throughput, write penalty, rebuild time, and categorical URE risk. The page repeats the verdict in a summary and a capacity breakdown.
- Formula or data source: [Documented] The page describes RAID-level rules and URE risk in the FAQ. [Unknown] Exact probability formula and read-byte basis were not visible in the captured result.
- Errors and edge behavior: [Unknown] Not exercised.
- Mobile and accessibility: [Observed] No page overflow at 390px, but the summary repeats many metrics and the mobile output is long.
- Privacy: [Observed] Share Results explicitly includes current values; this is a clear state-leakage consideration.
- Performance: [Observed] Default result loaded quickly.
- Search-content structure: [Observed] H1, result summary, broad explanatory sections, and six FAQ buttons.
- What works: It makes URE risk visible in the same place as rebuild time.
- What fails: Categorical risk hides the underlying bits-read calculation and the output repeats the same answer several times.
- Do not copy: Unexplained risk labels or monetized export/share controls in the core flow.

    H1 RAID Calculator
      Quick-start presets
      Inputs: level / drives / capacity / drive type / cost / speed / URE
      Capacity + performance + rebuild + URE risk
      Repeated verdict, copy/share/export
      Long considerations and FAQ

```text
H1 RAID Calculator
  Quick-start presets
  [level] [drives] [capacity] [drive type] [speed] [URE]
  Capacity | performance | rebuild | URE risk
```

### Competitor 10: ReclaiMe RAID 5 and Uncorrectable Read Errors

- URL: https://www.raid-failure.com/raid5-failure.aspx
- Accessed: 2026-08-23, 1280x900 and 390x844, standalone Playwright CLI.
- Audience and promise: [Observed] A focused RAID 5 URE explanation and calculator from a data-recovery training site.
- Inputs and defaults: [Observed] Number of disks, disk size in GB, and a select with one error per 10^14, 10^15, 10^16, or 10^17 bits. The initial result asks the user to enter data and click Calculate.
- Action and state behavior: [Observed] Traditional server form with Calculate and a postback-style page. No reset or copy action.
- Results and visuals: [Observed] It prints the formula P=(1-10^-14)^(8*10^9*N*S) and explains that N is disk count and S is disk size in GB. It does not show a rebuild duration.
- Formula or data source: [Documented] Formula and its criticism are visible on the page. The formula uses all N disks rather than an explicit surviving-source count, which is a material modeling choice.
- Errors and edge behavior: [Unknown] Not exercised.
- Mobile and accessibility: [Observed] The page had 568px document overflow and 576px body overflow at 390px due to fixed-width legacy content.
- Privacy: [Unknown] No local handling statement.
- Performance: [Observed] Basic HTML loaded quickly.
- Search-content structure: [Observed] Three headings: title, Enter parameters, Result, plus a long explanatory paragraph.
- What works: Formula transparency and an honest note that the approach is debatable.
- What fails: It is old, RAID 5-only, excludes time, and breaks on narrow screens.
- Do not copy: Fixed-width layout or a formula that is not reconciled with the modeled source reads.

    H2 RAID 5 and Uncorrectable Read Errors
      Explanation and displayed probability formula
      Enter parameters: disks / disk size / URE rate
      Calculate
      Result

```text
H2 RAID 5 and Uncorrectable Read Errors
  Formula and assumptions
  [disks] [disk size] [URE rate]
  Calculate
  Result
```

### Partial-access direct competitors

The following direct pages were found but not counted in the ten operated reviews above because the live batch could not safely reach their tool DOM: ThisCalc at https://thiscalc.com/calculators/raid-rebuild returned a navigation during the bounded snapshot, and PC Server and Parts at https://pcserverandparts.com/raid-calculator/ returned a Cloudflare verification page with HTTP 403. Search evidence shows both expose rebuild time, URE probability, or related risk inputs, so they confirm category saturation but not a live UX conclusion.

## Comparison matrix

| Capability | RaidSize | ToolFoundry | Kalcufy | ServeTheHome | magJ | User value |
| --- | --- | --- | --- | --- | --- | --- |
| Rebuild duration | Yes, live | Yes | Yes | Indirect via MTTDL inputs | No | High |
| Bytes read | Yes, prominent | Yes, exact table | Hidden behind risk | Not prominent | No | High |
| URE input | Rate presets | No | Rate input | NER input | Rate select | High |
| URE probability | Exact percentage | No | Category only | Bit-error MTTDL | Success percentage | High |
| Error tolerance | Text and count | Drive tolerance | Drive tolerance | RAID-level reliability | RAID 5/6 mode | High |
| Replacement delay | No visible default in capture | No | No | No | No | Medium |
| Used or filled portion | ZFS-only fill | Free-space target, not read scope | No visible fill input | No | No | Medium |
| MTTDL or AFR | No | No | No | Yes | No | Low for immediate job |
| Explicit calculate | No, live | No, live | Precomputed/live | Submit | Live | Medium |
| Result trace | Formula disclosure | Exact table | Repeated summary | Dense tables | Minimal | High |
| Mobile overflow | None observed | None observed | None observed | Fails on wide tables | None observed | High |
| Privacy statement | Not visible | Not verified | Share includes values | Not visible | Not visible | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| How much does RAID 6 read for one failed drive? | RaidSize documents (N-2) x drive size; ToolFoundry documents every remaining drive, (N-1) x drive size; broad tools do not state it. | Intel RAID documentation proves double parity can recreate missing information; exact read scheduling is implementation-specific. | Resolved for product planning: use a named minimum reconstruction-read model with N-2 full-drive equivalents for RAID 6 and expose the source count. State that an implementation may read more. |
| Does a URE probability mean array data loss? | Some competitors show data-loss or risk labels; focused tools show errorless rebuild probability only. | Vendor RAID 6 docs support tolerance of two drive failures, not a universal controller response to every media error. | Resolved: output modeled read-error event probability and modeled error tolerance separately. Never label it data-loss probability. |
| Should fill percentage reduce read exposure? | RaidSize applies fill to ZFS-only resilvers; ToolFoundry uses free space as a planning output but reads parity members fully. | Rebuild behavior differs by implementation; Intel documents controller-specific rebuilds. | Resolved: launch supports a read scope choice of full member or selected filled portion, defaults to full member, and states it is a modeling assumption. It does not infer ZFS behavior. |
| Should second-drive AFR or MTTDL be included? | ThisCalc and reliability suites include MTBF/AFR, delay, and fleet risk; narrow tools do not. | No single primary source can make a general AFR or correlation estimate honest for a user's disks. | Resolved: defer AFR, MTTDL, fleet count, correlated failures, and data-loss probability. |

## Evidence-backed opportunities

1. **Answer the two-part question directly**: show rebuild window and read bytes before any broader reliability metric. RaidSize proves demand for the pairing; ToolFoundry proves that an exact read-byte line makes a time estimate auditable.
2. **Expose the reconstruction model**: show source-drive count, read scope, capacity unit, and URE denominator in the result. This resolves the formula disagreement visible across current tools.
3. **Keep the probability honest**: show P(at least one modeled read error) and modeled errors tolerated as separate values, with a compact assumption disclosure. This avoids the opaque overall data-loss risk of broad competitors.
4. **Treat replacement delay as part of the window**: ThisCalc is the only observed/search-visible competitor that clearly includes replacement delay and hot-spare response. A simple delay input makes the window operational without adding MTTDL.
5. **Build the narrow page around one exact visualization**: a proportional read-exposure bar can show rebuild work against the selected URE denominator, with a labeled percentage and no color-only meaning. A small comparison table can carry RAID-level source-read rules.

## Table stakes

- RAID 1, RAID 5, RAID 6, and RAID 10 choices with honest minimum and parity rules.
- Drive count, drive capacity, capacity unit, effective rebuild throughput, read scope or fill, URE denominator, and replacement delay.
- Explicit valid result with rebuild time, degraded window, source-drive count, bytes read, modeled URE probability, and modeled tolerance.
- Invalid inputs clear any old numeric result and show field-level recovery.
- A visible reset action, keyboard submit, accessible labels, and no request, storage, or analytics payload containing inputs.
- Responsive output at 320px, 375px, 760px, and desktop widths, including long values and the exact result visualization.
- A concise sources and assumptions disclosure after the answer, not a methodology article.

## Ideas to reject

- **MTTDL, AFR, fleet-size, and correlated-failure modeling at launch**: it answers a different reliability question and creates false precision without the user's drive history.
- **Drive-vendor recommendation labels**: a URE specification is an input from a datasheet, not enough evidence to recommend a product.
- **Full RAID/RAIDZ/SHR/Unraid coverage in one picker**: each layout has different rebuild and read-scope semantics; a small standard-RAID contract is auditable.
- **A single data-loss verdict**: a read-error event, a failed rebuild, and array-level data loss are not interchangeable.
- **Charts with exact probabilities but no numeric table**: the bar or chart must be redundant with exact labels and readable without hue.
- **Remote APIs, drive lookups, or browser storage**: they add privacy and freshness problems without improving the universal calculation.
- **FAQ and long methodology sections**: the tool and a compact guide answer the query; competitor article length is not a product requirement.

## Open questions and blockers

- None for the launch contract. The RAID 6 source-read disagreement is recorded and assigned an explicit minimum-read model with a visible caveat in product planning.

## Sources

- Seagate IronWolf 12TB Product Manual: https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100818527d.pdf, accessed 2026-08-23. Documented maximum nonrecoverable read-error specification.
- WD Red Plus data sheet: https://documents.westerndigital.com/content/dam/doc-library/th_th/assets/public/western-digital/product/internal-drives/wd-red-plus-hdd/data-sheet-western-digital-wd-red-plus-hdd.pdf, accessed 2026-08-23. Documented nonrecoverable read-error specification.
- Intel RAID Software User Guide: https://cdrdv2-public.intel.com/840787/SWUG_full_featured_entry_RAID.pdf, accessed 2026-08-23. Documented RAID 6 double-parity and rebuild behavior.
- Intel RSTe degraded-array rebuild guidance: https://www.intel.com/content/www/us/en/support/articles/000024286/server-products/server-boards.html, accessed 2026-08-23. Documented degraded state and replacement-triggered rebuild.
- Fujitsu RAID Protection and Drive Failure Fast Recovery: https://www.fujitsu.com/us/imagesgig5/Storage-RAID-Fast-Recovery-whitepaper.pdf, accessed 2026-08-23. Documented parity-group reads and mirror rebuild contrast.
- RaidSize Rebuild Time and URE Risk Calculator: https://raidsize.com/tools/rebuild/en, accessed 2026-08-23. Observed formulas, controls, result hierarchy, and source list.
- ToolFoundry RAID Capacity Calculator: https://www.toolfoundry.app/technology/raid-capacity-calculator, accessed 2026-08-23. Observed exact data-read and rebuild-time presentation.
- ReclaiMe RAID 5 and URE calculator: https://www.raid-failure.com/raid5-failure.aspx, accessed 2026-08-23. Observed formula and explicit criticism of its assumptions.
- ServeTheHome Advanced RAID Calculator: https://www.servethehome.com/RAID/simpleMTTDL.php, accessed 2026-08-23. Observed MTTDL inputs, outputs, and narrow overflow.
- VariedTools MTTDL calculator: https://www.variedtools.com/calculate-mttdl, accessed 2026-08-23. Observed MTTDL scope and browser-only privacy statement.
- Simplified.tools RAID reliability calculator: https://www.simplified.tools/calculate_raid_reliability_mttdl, accessed 2026-08-23. Observed reliability-suite scope and export/report surface.
- Kalcufy RAID Calculator: https://www.kalcufy.com/en/raid-calculator, accessed 2026-08-23. Observed broad output and categorical URE risk.
- magJ RAID rebuild failure calculator: https://magj.github.io/raid-failure/, accessed 2026-08-23. Observed focused URE form and success percentage.
- Super User URE probability question: https://superuser.com/questions/516949/formula-to-calculate-probability-of-unrecoverable-read-error-during-raid-rebuild, accessed 2026-08-23. Community pain and formula discussion only, not technical authority.

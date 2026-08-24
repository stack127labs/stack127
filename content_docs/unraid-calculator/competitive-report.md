# Competitive report: Unraid Main Array Calculator

Status: ready
Tool: Unraid Main Array Calculator
Route: `/unraid-calculator`
Researched: 2026-08-23
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

### Current stack127 state

- [Observed] The requested flat route `/unraid-calculator` does not exist in `app/`, and `content_docs/unraid-calculator/` did not exist before this report.
- [Observed] The nearest route-family surface is the published `/raid-calculator`, whose ownership manifest is `tests/pages/raid-calculator/page.json`. It uses the shared `lib/storage/` engine and covers nine conventional layouts: RAID 0, 1, 5, 6, 10, 50, 60, Linear, and JBOD.
- [Observed] The existing RAID calculator is a theoretical array-capacity model. Its local brief and formula contract explicitly separate raw capacity, theoretical usable capacity, redundancy, and mixed-size mismatch; they do not model Unraid's dedicated parity/data roles.
- [Observed] `content_docs/storage-tools/calculation-engine.md` requires versioned adapters, exact-byte arithmetic, structured invalid results, evidence classifications, sources, uncertainty, and URL-state versioning. Those are repository constraints for a later implementation stage, not decisions made by this research report.
- [Observed] No Unraid-specific route, page manifest, formula contract, brief, engine adapter, test fixture, script, or publication change was present.
- [Inferred] The surface passes stack127's surface decision rule in principle: the answer is a genuine calculation over a user's own drive inventory, does not require curated coverage, and serves the site's homelab/storage audience. A thin sum-minus-parity wrapper would not be enough to establish a credible page.
- [Documented] Official Unraid documentation separates the main array from cache pools, describes one or two parity disks plus data disks, and states that parity disks must meet the largest-data-disk rule. The calculator must not silently mix cache-pool capacity into a Main Array answer.

### Method and coverage

- Search discovery used the web search connector because no SearXNG endpoint was configured in the environment. The required SearXNG helper was also tested against its documented local default and failed before returning results: `SearXNG request failed for http://127.0.0.1:8080/search: fetch failed`.
- Search backend: web connector
- Search engines: not individually available; Bing and DuckDuckGo attribution was not claimed
- Browser backend: standalone Playwright CLI, Chromium 1.60.0, because the Codex in-app Browser was unavailable (`iab`). The CLI preflight passed with the repository-installed runner and executable `/home/teja/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`.
- Live competitor operation: all five direct competitors were opened at `1280×900` and `390×844` on 2026-08-23. Safe valid, invalid, boundary, and mixed-drive probes were used where the page exposed those controls. Screenshots and measurements were saved under `/tmp/stack127-*-desktop*.png` and `/tmp/stack127-*-narrow*.png` during the pass.
- Visual evidence: the report separates `[Observed]` live DOM, action, result, and overflow facts from `[Documented]` page copy and `[Unknown]` behavior that the page still did not expose. No account, payment, purchase, share side effect, or destructive action was triggered.
- Accessed: 2026-08-23, Asia/Kolkata
- Evidence convention: `[Documented]` means the page or primary source stated the fact in the static material retrieved; `[Unknown]` means the unavailable visual stage prevented verification; `[Inferred]` means a deduction that is kept separate from documentation; `[Observed]` is used only for local repository inspection in this report.
- The report is ready for product planning. The category is narrow enough for the documented five-competitor saturation exception, and the live pass supplies the required operated desktop and narrow evidence.

### Search saturation evidence

- Queries tried: `"Unraid array calculator"`; `how much usable storage Unraid parity calculator mixed drive sizes`; `Unraid main array capacity parity biggest data disk calculator`; `Unraid array disk replacement larger drive parity size edge case`; `Unraid capacity calculator usable storage parity drive size`; `UnRAID storage calculator mixed drives dual parity`; `Unraid array capacity tool calculator disk list`; `Unraid calculator usable TB data disks parity overhead`; `"Unraid" "calculator" "usable capacity" -reddit -docs.unraid.net`; `"Unraid calculator" "parity drives"`; `"UnRAID" "storage calculator" -unraidcalculator.com -raidsize.com`; `"Unraid" "capacity calculator" site:*.com`; plus official documentation, community, parity-swap, and TB/TiB source queries.
- Repeated domains: `unraidcalculator.com`, `raidsize.com`, `needtoknowit.com.au`, `thehomeserverblog.com`, and `dalil-tech.com` recurred as tool or tool-adjacent results. `reddit.com/r/unRAID` and `forums.unraid.net` recurred for pain evidence. `docs.unraid.net` and `github.com/unraid` recurred as primary technical sources.
- Exclusions: official documentation and the Unraid language/help repository are sources of truth, not competitors; Reddit/forum pages establish pain, not formulas; generic RAID/ZFS calculators were excluded when their retrieved controls did not expose an Unraid mode; duplicate pages and same-domain variants were not counted as additional distinct direct competitors; buying guides without a calculator were excluded. The category is narrow: five distinct direct calculator pages or calculator surfaces remained after these exclusions, so the saturation exception is `yes`.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Quick array capacity | `Unraid array calculator` | Enter a real drive set and see data capacity after zero, one, or two parity roles | Dedicated calculator, usually with a compact summary |
| Mixed-drive planning | `how much usable storage Unraid parity calculator mixed drive sizes` | Know whether a mismatched collection can be used without smallest-drive striping waste | Drive-list calculator or an explainer with a simple parity formula |
| Parity-count comparison | `Unraid calculator usable TB data disks parity overhead` | Compare the capacity and failure coverage trade-off between no, single, and dual parity | Broad RAID calculator with an Unraid selector or a dedicated tool |
| Upgrade and parity ceiling | `Unraid array disk replacement larger drive parity size edge case` | Understand whether a new disk can be added and whether parity must be upgraded first | Official docs, forum threads, and parity-swap guides; rarely part of the calculator result |
| Label versus OS capacity | `Unraid usable capacity TB to TiB` | Reconcile manufacturer TB, displayed TiB, filesystem deductions, and planning headroom | Explanatory prose, tables, or calculators that mix several deduction layers |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Users have a heterogeneous pile of drives and do not understand how parity makes the mix usable. | [r/unRAID: Mixing drives](https://www.reddit.com/r/unRAID/comments/1qd4a9t/mixing_drives/); the question lists 28 TB, 18 TB, 10 TB, 8 TB, and 4 TB drives and asks how Unraid handles them. | Repeated mixed-drive planning pattern in search and community results | A result needs a per-drive inventory and a visible distinction between parity drives and data drives; one “number of equal drives” field is insufficient for the core use case. |
| A larger replacement or future data drive creates confusion about the smallest parity ceiling and the correct parity-swap sequence. | [r/unRAID: Adding a new larger drive to the array](https://www.reddit.com/r/unRAID/comments/1ap05ez/adding_a_new_larger_drive_to_the_array/); [Unraid Docs: Replacing disks in array](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/) | Repeated across forum questions, official parity-swap documentation, and search results | A calculator can flag a parity-size constraint and link to the official upgrade procedure, but it must not pretend to perform or certify a storage migration. |
| Users confuse raw advertised capacity, TB/TiB conversion, parity, filesystem overhead, and free headroom. | [Unraid forum planning guide](https://forums.unraid.net/topic/197536-guide-planning-an-unraid-build-real-usable-capacity-tb%E2%86%92tib-parity-transfer-bottlenecks-and-running-cost/) | Repeated in the guide's opening questions and in calculator result pages | Keep raw, parity-excluded data capacity, unit conversion, and optional planning reserve as separate layers. Do not label a guessed filesystem percentage as exact Unraid capacity. |
| Users and calculator authors disagree about whether Unraid should be treated like striped RAID for write or rebuild calculations. | [Unraid forum planning discussion](https://forums.unraid.net/topic/197536-guide-planning-an-unraid-build-real-usable-capacity-tb%E2%86%92tib-parity-transfer-bottlenecks-and-running-cost/); [official array write modes](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/#array-write-modes) | Repeated when broad calculators add IOPS, speed, or rebuild claims | Keep the calculator's primary answer to capacity and role constraints. Any performance or risk statement needs a separate evidence contract and should not be smuggled in as a capacity result. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| An Unraid main array consists of one or two parity disks and data disks; the data disks store user data and parity provides redundancy. | [Unraid language/help repository, array-device help](https://github.com/unraid/lang-en_US/blob/master/helptext.txt); [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/) | Documented | The official help text also distinguishes the main array from pools. Do not count cache-pool devices as Main Array data or parity. |
| A parity disk must be at least as large as every data disk; with two parity disks, both must meet the largest-data requirement, and no data disk can be larger than the smaller parity disk. | [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/); [Unraid adding disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/) | Documented | This is the central validity boundary. A tool should expose the failing role and disk, not merely return a smaller capacity. |
| For a valid role assignment, the first capacity model is the sum of the data-disk capacities; parity disks contribute protection, not user-data capacity. | [Unraid array-device help](https://github.com/unraid/lang-en_US/blob/master/helptext.txt); [RaidSize Unraid explanation](https://raidsize.com/tools/unraid-calculator/en) | Inferred | Official sources document roles and non-striping, while calculator pages state the arithmetic explicitly. Exact filesystem-visible capacity is a separate question and must not be asserted from this inference alone. |
| Unraid stores files on individual drives rather than using traditional striping; each data disk has its own filesystem. | [Unraid language/help repository](https://github.com/unraid/lang-en_US/blob/master/helptext.txt); [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/) | Documented | This explains why mixed-size data disks can contribute their individual capacities and why the tool is not a conventional RAID5/6 smallest-member formula. |
| Single parity protects against one drive failure and dual parity enables recovery from two simultaneous disk failures, subject to the array's remaining health and rebuild conditions. | [Unraid adding disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/); [Unraid help text](https://github.com/unraid/lang-en_US/blob/master/helptext.txt) | Documented | The output should describe parity coverage without converting it into a probability of data loss. |
| Decimal TB is based on SI `10^12` bytes and binary TiB is `2^40` bytes. | [BIPM SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes); [NIST binary prefixes](https://physics.nist.gov/cuu/Units/binary.html) | Documented | This is a display-unit conversion, not a filesystem-overhead estimate. |
| Unraid supports different filesystem choices on array drives, including XFS by default and optional ZFS or BTRFS according to the current docs. | [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/) | Documented | No universal filesystem deduction percentage was established from the primary docs. A fixed XFS/BTRFS/ZFS percentage would be an unsupported product claim. |
| Read/modify/write and reconstruct-write parity modes have different I/O and drive-spin-up behavior. | [Unraid array write modes](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/#array-write-modes) | Documented | This is relevant context, but it is not a capacity formula and should not be included in a single headline capacity number. |

## Competitor reviews

The following five pages were reviewed through web-connector discovery and operated with standalone Playwright CLI on 2026-08-23. The wireframes combine live control order with static content structure. Width claims below are limited to the recorded `1280×900` and `390×844` runs.

### Live operation evidence

| Competitor | Operated states | Observed result or limitation | Viewport evidence |
| --- | --- | --- | --- |
| Unraid Storage Calculator | Default six-data/one-parity state; Apply to All; changed parity/data counts and drive fields | Default result showed usable, raw, and parity totals in TiB. The calculator recalculated without a separate Calculate button. A malformed count probe produced an oversized drive list without a clear error, so the probe is recorded as a limitation, not a product conclusion. | `1280×900` and `390×844`; document and body scroll widths matched the viewport in both runs. |
| RaidSize Unraid Storage Calculator | Direct page load at both widths; widget controls and fallback state | The page rendered the “Widget not loading?” fallback at both widths, so no calculator controls, submit, invalid, or mixed-drive state could be operated. Its documented formula and worked example remained visible. | `1280×900` and `390×844`; no page overflow. |
| Dalil Tech RAID calculator | Default same-size mode; switched to Mixed drives; inspected one/two-parity selectors, add/clear, copy-link, and theme controls | Live result exposed usable capacity, raw capacity, drive-loss tolerance, efficiency, and comparison rows. Mixed mode exposed add-a-drive and preset controls. The page also exposed rebuild-risk and probability claims outside the capacity answer. | `1280×900` and `390×844`; no page overflow in the recorded states. |
| The Home Server Blog RAID Capacity Calculator | Unraid single-parity selection; four 12 TB drives; parity 8 TB invalid probe; parity 12 TB valid probe; Calculate button | The invalid probe kept the prior result visible while adding “Parity drive is smaller than a data drive; increase parity size before trusting this layout.” The valid probe restored the result. The page calculates only after an explicit action and includes reserve, filesystem, growth, and rebuild inputs. | `1280×900` and `390×844`; no page overflow in the recorded states. |
| Cloudzat IronWolf Unraid planner | Default zero-parity form; data count/capacity; single parity; parity-size selector; Calculate button | The live form exposed zero, single, and dual parity and a uniform data-drive capacity. A valid 4×8 TB plus one 8 TB parity plan showed 40 TB raw and one-drive tolerance. The accessible parity options did not include a smaller-than-data choice in the tested selector, so invalid parity behavior is Unknown. | `1280×900` and `390×844`; no page overflow in the recorded states. |

### Competitor 1: Unraid Storage Calculator

- URL: https://unraidcalculator.com/
- Accessed: 2026-08-23; operated at `1280×900` and `390×844` with standalone Playwright CLI
- Audience and promise: [Documented] “Estimate your total usable storage in Unraid” with parity and drive-size inputs.
- Inputs and defaults: [Documented] The static page exposes parity-drive count, data-drive count, an optional set-all-drive-size control with unit select, an Apply to All action, and individual parity/data drive fields in the extracted page text. The extracted default result is zero-valued; individual dynamic field limits are Unknown.
- Action and state behavior: [Observed] The calculator exposes Apply to All but no separate calculate button. Changing the default fields recalculated the summary in place. Reset, share, and persistence were not exposed in the operated surface.
- Results and visuals: [Observed] The live result hierarchy names usable capacity, total raw capacity, and used for parity, with a TB/TiB display-unit choice. No allocation chart or clear parity-ceiling message appeared in the tested state.
- Formula or data source: [Unknown] The page does not expose a formula or primary technical source in the retrieved text. Do not infer its implementation from the displayed labels.
- Errors and edge behavior: [Observed] A safe field-edit probe did not surface a clear validation message; the malformed count probe produced an oversized drive list rather than a clear error. Empty, parity-too-small, and maximum-drive behavior remain Unknown.
- Mobile and accessibility: [Observed] The same input order remained visible at `390×844` with no document overflow. A full keyboard or screen-reader audit was not performed.
- Privacy: [Documented] The page states that it is independently developed and not affiliated with Lime Technology or Unraid; no calculator-specific local-processing promise was found in the retrieved text.
- Performance: [Observed] The page reached a settled result within the bounded post-load wait; no timing benchmark was inferred.
- Search-content structure: [Documented] The visible text is organized around the calculator promise, Number of Drives, Set Drive Sizes, Storage Summary, Recommended Unraid Drives, and setup guides.
- What works: [Observed] The explicit parity/data split, individual drive fields, unit selectors, and in-place summary align with the mixed-drive job.
- What fails: [Documented] The page combines the calculator with recommended-drive affiliate content, and the retrieved text does not expose formula provenance or a role-constraint explanation.
- Do not copy: [Inferred] Do not copy a shopping/affiliate rail into the calculation path or present a raw/usable number without an auditable role and unit explanation.

```text
[Unraid Storage Calculator]
[short promise]
[Number of Drives]
  parity drives [ ]   data drives [ ]
[Set Drive Sizes]
  size [ ] unit [ ] [Apply to All]
  parity drive 1 [ ]
  data drive 1 [ ] ... data drive 6 [ ]
[Storage Summary]
  usable capacity | total raw capacity | used for parity
[recommended drives + guides]
```

### Competitor 2: RaidSize Unraid Storage Calculator

- URL: https://raidsize.com/tools/unraid-calculator/en
- Accessed: 2026-08-23; operated at `1280×900` and `390×844` with standalone Playwright CLI
- Audience and promise: [Documented] The page promises usable storage for any mix of drive sizes, with single/dual parity, parity overhead, and the number of drives that can be lost.
- Inputs and defaults: [Observed] At both viewports the page rendered the “Widget not loading? Open the full calculator” fallback and exposed no calculator inputs or action controls. The actual widget controls, defaults, limits, and field semantics were not available.
- Action and state behavior: [Observed] No input, submit, reset, live-update, copy, or persistence state was accessible because the widget fallback remained visible.
- Results and visuals: [Documented] The surrounding page names usable capacity, parity overhead, and drive-loss tolerance as intended outputs, then provides a worked example using 18 TB, 12 TB, 8 TB, and 8 TB drives.
- Formula or data source: [Documented] The page states single parity as sum of drives minus the largest drive and dual parity as sum minus the two largest drives; it also states that parity must be at least as large as the biggest data drive. It does not cite Unraid's official documentation in the retrieved section.
- Errors and edge behavior: [Unknown] No parity-too-small, empty, duplicate-size, or maximum-drive behavior was visible.
- Mobile and accessibility: [Observed] The fallback page had no document overflow at `390×844`; calculator control semantics remained Unknown because the widget did not load.
- Privacy: [Unknown] No calculator-specific local-only statement was found in the retrieved page text.
- Performance: [Observed] The page settled to the fallback within the bounded wait. The full calculator's update performance remains Unknown.
- Search-content structure: [Documented] The static page has the title/h1 Unraid Storage Calculator, a formula explainer, a worked example, an Unraid-versus-traditional-RAID section, and FAQs.
- What works: [Documented] The formula explanation directly addresses why mixed sizes are useful in Unraid and distinguishes Unraid from striped RAID.
- What fails: [Inferred] The Unraid-specific page's widget handoff makes the first-screen interaction impossible to audit in this environment, and the phrase “exactly” is stronger than the page's documented filesystem/OS boundary.
- Do not copy: [Inferred] Do not claim exact filesystem-visible capacity from a parity-only equation, and do not hide the interactive controls behind a widget fallback without a readable static contract.

```text
[RaidSize nav]
[Unraid Storage Calculator]
[promise: mixed drives + single/dual parity]
[widget: not loading?] [open full calculator]
[How usable capacity is calculated]
  single parity formula
  dual parity formula
[worked example]
[Unraid vs traditional RAID]
[FAQ]
```

### Competitor 3: Dalil Tech unRAID, RAID, ZFS & SHR Storage Calculator

- URL: https://dalil-tech.com/raid-calculator
- Accessed: 2026-08-23; operated at `1280×900` and `390×844` with standalone Playwright CLI
- Audience and promise: [Documented] A broad homelab calculator that compares unRAID, conventional RAID, ZFS RAIDZ, and Synology SHR in one tool.
- Inputs and defaults: [Documented] The static page exposes Same-size drives and Mixed drives modes; array level choices include unRAID with one or two parity, number of drives, drive size, optional price per drive, Add a drive, preset buttons, and Clear. The retrieved text does not expose the default selected array level or maximum inventory.
- Action and state behavior: [Observed] The page exposes Add a drive, Clear, Copy link to this result, preset actions, and a light/dark theme. Switching to Mixed drives changed the URL and exposed the add-drive controls. A full copy or reset side-effect test was not performed.
- Results and visuals: [Documented] The page promises usable capacity, drive-loss tolerance, storage efficiency, and cost per usable terabyte in TB and TiB. It also provides comparison prose and a broad reference table.
- Formula or data source: [Documented] The page states that unRAID does not stripe, that parity disks add protection rather than capacity, and that usable space is the sum of data disks; it does not cite official Unraid documentation for that formula in the retrieved text.
- Errors and edge behavior: [Unknown] The static extraction does not reveal parity-size validation, invalid count behavior, mixed-drive boundary behavior, or stale-result suppression.
- Mobile and accessibility: [Observed] The same primary controls were present at `390×844` with no document overflow. A full keyboard or screen-reader audit was not performed.
- Privacy: [Unknown] No local-only calculation statement was found in the extracted text; the page includes affiliate disclosures and an embeddable tool.
- Performance: [Observed] The default result and Mixed drives state settled within the bounded post-load wait; no benchmark was inferred.
- Search-content structure: [Documented] The page has the tool title, drive-mode controls, calculator controls, comparison section, long RAID/ZFS explanations, FAQ, embed instructions, related guides, and affiliate content.
- What works: [Inferred] A dedicated mixed-drive inventory and copy-link action cover two real planning needs better than equal-size-only calculators, if the result is auditable.
- What fails: [Documented] The same surface mixes Unraid, RAID, ZFS, and SHR; the retrieved copy also makes broad “best option” and rebuild-risk recommendations outside the capacity arithmetic.
- Do not copy: [Inferred] Do not let a multi-technology selector flatten distinct validity rules or turn a capacity result into a storage-system recommendation.

```text
[Dalil Tech / Homelab / Tool]
[unRAID, RAID, ZFS & SHR Storage Calculator]
[Same-size drives | Mixed drives]
[array level][drive count][drive size][price]
[Add a drive] [preset chips] [Clear] [Copy link]
[usable | can fail | efficiency | cost/TB]
[compare all array levels]
[long explanations + FAQ + embed/affiliate content]
```

### Competitor 4: The Home Server Blog RAID Capacity Calculator

- URL: https://thehomeserverblog.com/raid-capacity-calculator/
- Accessed: 2026-08-23; operated at `1280×900` and `390×844` with standalone Playwright CLI
- Audience and promise: [Documented] A home-server calculator promising usable storage, parity reserve, hot-spare impact, fault tolerance, free-space headroom, and growth runway.
- Inputs and defaults: [Documented] The static page exposes TB/TiB and GB/GiB display buttons, a RAID/parity scheme selector, total installed drives, raw size per data drive, an Unraid parity-drive-size field, hot spares, free-space reserve, filesystem/snapshot profile, workload type, existing data, annual growth, and estimated rebuild throughput.
- Action and state behavior: [Observed] The page exposes Home Lab Presets, Calculate RAID Capacity, and Print Results. The tested Unraid selection changed the result after the explicit Calculate action; changing fields alone was not used as evidence of live updates.
- Results and visuals: [Documented] The extracted hierarchy includes usable capacity after parity/reserve, fault tolerance, raw array size, growth headroom, capacity breakdown, an equipment grid, a RAID capacity reference, and planning prose.
- Formula or data source: [Documented] The reference table states Unraid parity as data disks only with one or two drives based on parity count, while the input copy says parity size is used for validation. The retrieved page does not expose a complete mixed-drive formula or primary Unraid source.
- Errors and edge behavior: [Observed] With four 12 TB drives and an 8 TB parity input, the page kept the previous result visible and added “Parity drive is smaller than a data drive; increase parity size before trusting this layout.” Replacing parity with 12 TB restored the valid result. Mixed-drive and non-integer behavior remained Unknown.
- Mobile and accessibility: [Observed] The tested result remained within the `390×844` document width. A full responsive, keyboard, focus, or semantic-control audit was not performed.
- Privacy: [Unknown] No calculator-specific local-processing statement was visible in the extracted text.
- Performance: [Observed] The page settled after the explicit calculate action within the bounded wait; no timing benchmark was inferred.
- Search-content structure: [Documented] The page uses a tool title, presets, input groups, four headline results, breakdown and reference tables, parity/rebuild prose, and a long instructional section.
- What works: [Inferred] Separating parity, reserve, and growth answers a planning question that simple parity calculators leave to prose, provided the Unraid path distinguishes optional advice from computed facts.
- What fails: [Documented] The tool asks for a single raw size per data drive and adds broad hot-spare, filesystem, snapshot, workload, growth, and rebuild inputs to a category where the Unraid core job is a role-aware mixed inventory.
- Do not copy: [Inferred] Do not let broad planning fields obscure the primary capacity answer or present generic reserve/growth assumptions as Unraid facts.

```text
[RAID Capacity Calculator for Home Servers]
[home-lab preset chips, including Unraid Dual Parity]
[TB/TiB | GB/GiB]
[layout][drive count][data-drive size][Unraid parity size]
[spares][reserve][filesystem/snapshots][workload]
[existing data][growth][rebuild throughput]
[Calculate] [Print]
[usable | tolerance | raw | growth headroom]
[breakdown + reference table + long guide]
```

### Competitor 5: Cloudzat Plan an IronWolf Unraid Array

- URL: https://cloudzat.com/seagate-ironwolf-unraid/
- Accessed: 2026-08-23; operated at `1280×900` and `390×844` with standalone Playwright CLI
- Audience and promise: [Documented] A drive-buying guide with an interactive decision tool that checks the parity-size rule and estimates protected storage for an Unraid plan.
- Inputs and defaults: [Documented] The static page exposes number of data drives, capacity of each data drive in TB, parity-drive count, parity-drive capacity in TB, and a Calculate Unraid array action. It does not expose mixed data-drive sizes in the retrieved controls.
- Action and state behavior: [Observed] The page exposes Calculate Unraid array and a model/catalog search. The tested valid 4×8 TB plus one 8 TB parity case showed a 40 TB raw result and one-drive tolerance after the explicit action. Reset and persistence were not exposed in the calculator.
- Results and visuals: [Observed] The live result exposes parity count, total installed raw capacity, and a plain-language drive-failure statement. It does not expose a separate data-capacity line in the tested result.
- Formula or data source: [Documented] The page states that parity must be at least as large as the largest data disk and that with dual parity both parity drives must meet the rule; it does not publish the arithmetic or a primary Unraid source in the calculator section.
- Errors and edge behavior: [Observed] The accessible parity selector did not offer a smaller-than-data option in the tested page, so the parity-too-small message and mixed-size behavior remained Unknown. Zero-parity defaults were visible.
- Mobile and accessibility: [Observed] The calculator remained within the `390×844` document width. A full keyboard or screen-reader audit was not performed.
- Privacy: [Unknown] No calculator-specific privacy or local-processing statement was found in the extracted text.
- Performance: [Observed] The page settled after the explicit calculate action within the bounded wait; no timing benchmark was inferred.
- Search-content structure: [Documented] The page is organized as a drive guide, compatibility/current-prices material, an interactive decision tool, parity-rule prose, mixed-capacity guidance, single/dual-parity guidance, and buying advice.
- What works: [Inferred] The parity-capacity validation focus maps to a real Unraid failure mode and connects a purchase decision to a future expansion ceiling.
- What fails: [Documented] It is drive-family-specific, presents a uniform data-drive size rather than an actual mixed inventory, and places the calculator inside an affiliate buying guide.
- Do not copy: [Inferred] Do not make a vendor catalog the source of truth for a general Unraid calculator, and do not call a uniform-size estimate a mixed-drive array result.

```text
[Unraid drive guide]
[compatibility + current offers]
[Plan an IronWolf Unraid array]
  data drives [ ]  capacity each [ ]
  parity drives [ ]  parity capacity [ ]
  [Calculate Unraid array]
[parity-size rule]
[mixed capacities + parity guidance]
[buying advice / affiliate catalog]
```

## Comparison matrix

Comparison combines documented behavior with the standalone Playwright observations above. A fully exhaustive accessibility audit remains outside this research pass.

| Capability | UnraidCalculator.com | RaidSize | Dalil Tech | Home Server Blog | Cloudzat | User value |
| --- | --- | --- | --- | --- | --- | --- |
| Dedicated Unraid capacity surface | Yes | Yes, within a broader RAID suite | Yes, within a broader RAID/SHR/ZFS suite | Unraid preset in broader calculator | Yes, within a drive guide | High |
| Individual mixed-size data inventory | Documented fields, exact behavior unknown | Promised, widget controls unavailable | Mixed mode + Add a drive documented | No; one raw size per data drive documented | No; one capacity per data drive documented | High |
| Explicit parity count | Parity-drive count | Single/dual parity promise | One/two parity choices | Parity scheme + Unraid parity-size field | Parity-drive count | High |
| Explicit parity size validation | Unknown | Biggest-data rule documented in prose | Not documented in extracted controls | Parity size used for validation | Rule documented, behavior unknown | High |
| Raw/data/parity result breakdown | Raw, usable, used for parity | Usable, parity overhead, loss tolerance promised | Usable, raw, efficiency, loss, cost promised | Raw, usable, reserve, headroom | Protected storage promised; breakdown unknown | High |
| Decimal and binary units | TB/TiB selector | Unit behavior not exposed in Unraid page | TB and TiB documented | TB/TiB and GB/GiB documented | TB inputs; output units unknown | High |
| Formula provenance | Not found | Formula stated; no primary link in retrieved section | Formula stated; no primary link in retrieved section | Reference table; complete Unraid formula not exposed | Rule stated; arithmetic not exposed | High |
| Optional reserve/filesystem layers | Filesystem overhead caveat only | Not exposed | Not exposed in Unraid copy | Reserve/filesystem/snapshot/workload layers | Not exposed in calculator controls | Medium |
| Share/copy result | Unknown | Unknown in Unraid page | Copy link documented | Print Results documented | Unknown | Medium |
| Shopping/affiliate content in flow | Yes | Yes | Yes | Yes | Yes | Low; keep separate from answer |
| Performance/rebuild/risk claims | Not exposed in retrieved text | General speed/cost pages exist | Broad recommendation copy | Rebuild-throughput and growth fields | Drive-guide claims | Low for a capacity-first tool |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| How should a user provide parity roles? | RaidSize and several pages can phrase the answer as total minus the largest one or two drives; Cloudzat asks for parity count and parity capacity; official Unraid docs define assigned parity/data roles and a smallest-parity ceiling. | [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/); [Unraid adding disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/); [RaidSize](https://raidsize.com/tools/unraid-calculator/en) | Yes. The implementation stage must choose between explicit role assignment, automatic largest-drive assignment, or both; research does not choose. |
| Is `sum(all drives) - largest` always the same as summing data roles? | It is equivalent only when the input represents a valid array and the largest drive is assigned as the single parity role. Dual parity with explicit unequal parity drives and future-upgrade planning makes role visibility more trustworthy than a hidden sort. | [Unraid help text](https://github.com/unraid/lang-en_US/blob/master/helptext.txt); [r/unRAID parity-upgrade discussion](https://www.reddit.com/r/unRAID/comments/1ap05ez/adding_a_new_larger_drive_to_the_array/) | Yes. Use a controlled fixture against official behavior before treating the shortcut as the canonical formula. |
| Should “usable” subtract filesystem/system overhead? | Dedicated tools often report parity-only capacity; Need to Know IT and The Home Server Blog add estimates/reserves; official docs list filesystem choices but do not supply one universal deduction percentage. | [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/); [Need to Know IT calculator](https://needtoknowit.com.au/tools/raid-calculator/); [Home Server Blog calculator](https://thehomeserverblog.com/raid-capacity-calculator/) | Yes. Keep array-level capacity separate from filesystem-visible and user-selected planning layers until primary evidence supports each layer. |
| How should no-parity arrays be shown? | Official docs say parity is optional; competitors focus on one or two parity and rarely explain no parity in the Unraid-specific path. | [Unraid adding disks](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/) | Yes. The later product contract must state whether no parity is in scope and how its lack of redundancy is presented. |
| What is the correct minimum/count boundary? | Competitor copy gives two total drives for one parity and three for dual parity; official docs state one or two parity disks plus data disks and the license constrains array slots. | [Unraid help text](https://github.com/unraid/lang-en_US/blob/master/helptext.txt); [RaidSize](https://raidsize.com/en/) | Yes. Validate the exact input boundary, license/slot scope, and whether a parity-only or data-only empty role is allowed before implementation. |
| Should performance, rebuild duration, or probability be computed? | Broad competitors expose rebuild, IOPS, write, or risk fields; official docs show write-mode differences but do not turn them into a universal capacity result. | [Unraid write modes](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/#array-write-modes); [Unraid forum planning discussion](https://forums.unraid.net/topic/197536-guide-planning-an-unraid-build-real-usable-capacity-tb%E2%86%92tib-parity-transfer-bottlenecks-and-running-cost/) | Yes, and research supports excluding them from the first capacity contract unless separate primary evidence and a separate model are prepared. |

## Evidence-backed opportunities

1. **Make the parity/data role boundary visible.** The repeated pain is not just arithmetic; it is uncertainty about which drives are parity, which remain data, and what the smallest parity drive prevents. A role-aware inventory with a constraint explanation could answer the actual Unraid planning question more honestly than a hidden “subtract the largest drive” shortcut. This is an opportunity, not an implementation decision; the formula contract must resolve explicit versus automatic assignment first.

2. **Separate four accounting layers in the answer.** Competitors repeatedly combine raw label capacity, parity-excluded capacity, filesystem deductions, and free-space headroom. Official sources support the role/parity rules but do not support a universal filesystem percentage. A useful opening is an auditable separation of raw inventory, parity allocation, data capacity, and optional planning assumptions, with unknown or variable deductions kept explicit.

3. **Treat mixed drive sizes as the primary input, not an exception.** Unraid's documented non-striping, per-drive filesystem model and community questions both support a per-drive inventory. The strongest direct competitors expose at least some mixed-drive path, while uniform-size tools leave the central Unraid advantage implicit.

4. **Explain the upgrade ceiling beside the result.** Official docs document adding disks, parity upgrades, and parity swaps; community threads show that users ask about this exact transition. A restrained constraint message plus a link to the official parity-swap procedure would add value without automating a risky migration.

5. **Use exact units and restrained claims.** BIPM and NIST support decimal TB and binary TiB definitions. A two-unit result with a labeled conversion can resolve a frequent “why is my number smaller?” question. It should not be presented as filesystem-visible free space or as a guarantee of future capacity.

6. **Build trust through provenance and invalid states.** The extracted competitors rarely link their Unraid arithmetic to official documentation, and their invalid behavior could not be verified. A later implementation should make the source, formula boundary, and invalid parity-size states inspectable; this is a trust opportunity only if tests and primary-source verification follow.

## Table stakes

- A flat, dedicated Unraid Main Array surface rather than a generic RAID selector that silently changes technologies.
- A clear choice or explicit representation of zero, single, and dual parity if those states are in scope.
- Individual drive capacities for mixed-drive planning, or a clearly documented alternative that cannot misrepresent mixed arrays.
- Validation that every parity disk satisfies the largest data-disk rule, with the affected role and drive named.
- A result that separates raw inventory, parity capacity, data capacity, and display units; optional reserve or filesystem adjustments must be labeled separately.
- A direct statement that main-array parity is redundancy, not a backup, and that cache pools are outside this calculator's scope.
- Clear invalid/empty states that do not leave a stale valid number on screen.
- A source/formula disclosure that distinguishes official documentation from an implementation assumption.
- Reset and a shareable calculation state are common competitor behaviors worth evaluating later, but they are not formula decisions made here.

## Ideas to reject

- **A generic RAID calculator with an Unraid label:** It would flatten dedicated parity roles and mixed-drive rules into a copied `(N - parity) × smallest` model that the official Unraid documentation does not describe.
- **A fixed filesystem-overhead percentage:** The primary docs support multiple filesystem choices but do not establish one universal percentage. Fake precision would be worse than an explicit unknown.
- **Automatic advice that a user “should” choose single or dual parity:** The tool can show documented failure coverage and capacity trade-offs, but safety judgment depends on workload, backup, drive health, and rebuild context.
- **Rebuild time, IOPS, URE probability, or throughput in the first result:** The broad competitors expose these claims with inconsistent assumptions; they require separate evidence and models.
- **A drive-shopping carousel or vendor-specific recommendation:** It distracts from the technical calculation and makes the source of truth expire with prices and product availability.
- **A cache-pool or filesystem calculator hidden inside the Main Array result:** Cache pools and the main array have different roles and failure/formatting semantics.
- **An opaque “auto-sort largest drives into parity” result with no role trace:** Automatic convenience is acceptable only if the resulting roles and constraints remain visible and auditable.

## Open decisions for product planning

- **Live evidence complete:** All five direct competitor pages were opened at `1280×900` and `390×844` with standalone Playwright CLI. RaidSize's calculator widget remained unavailable, which is recorded as an observed competitor limitation.
- Confirm whether Unraid's current supported main-array input should allow zero parity, one parity, and two parity as separate modes, and what minimum data-drive count the page should display for each.
- Confirm whether the input should use explicit data/parity roles, automatic role assignment, or a dual mode that shows both; do not assume the largest-drive shortcut is sufficient for all valid arrays.
- Verify exact capacity semantics against primary Unraid behavior for unequal parity drives and mixed data drives, including the smallest-parity ceiling and any capacity rounding that is visible to the operating system.
- Decide whether the first tool reports array-level theoretical data capacity only or also exposes filesystem-visible values. The research evidence does not support a universal filesystem deduction.
- Verify current Unraid version/license slot limits if a UI limit is needed; no current product limit is asserted here.
- Treat competitor claims about live updates, stale-result suppression, privacy, and accessibility as Unknown unless the operated evidence above explicitly covers them; product planning should not inherit untested assumptions.

## Sources

- [Unraid array overview](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/overview/), accessed 2026-08-23. Official array roles, parity-size rules, filesystem choices, cache separation, and write/read behavior.
- [Unraid adding disks to array](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/), accessed 2026-08-23. Official parity requirements, optional parity, disk additions, parity calculation, and dual-parity behavior.
- [Unraid replacing disks in array](https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/), accessed 2026-08-23. Official replacement-size rule and parity-swap procedure.
- [Unraid `lang-en_US` help text](https://github.com/unraid/lang-en_US/blob/master/helptext.txt), accessed 2026-08-23. Official/help-repository description of non-striped data disks, parity roles, and assignment requirements.
- [BIPM SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes), accessed 2026-08-23. Decimal tera prefix and `10^12` factor.
- [NIST binary prefixes](https://physics.nist.gov/cuu/Units/binary.html), accessed 2026-08-23. IEC binary-prefix definitions including TiB as `2^40` bytes.
- [Unraid forum planning guide](https://forums.unraid.net/topic/197536-guide-planning-an-unraid-build-real-usable-capacity-tb%E2%86%92tib-parity-transfer-bottlenecks-and-running-cost/), accessed 2026-08-23. Community pain around TB/TiB, parity planning, headroom, and the limits of performance models.
- [r/unRAID: Mixing drives](https://www.reddit.com/r/unRAID/comments/1qd4a9t/mixing_drives/), accessed 2026-08-23. Community question about a heterogeneous drive inventory and parity sizing.
- [r/unRAID: Adding a new larger drive to the array](https://www.reddit.com/r/unRAID/comments/1ap05ez/adding_a_new_larger_drive_to_the_array/), accessed 2026-08-23. Community confusion around larger-drive upgrades, parity slots, and parity swap.
- [Unraid Storage Calculator](https://unraidcalculator.com/), accessed 2026-08-23. Static competitor page for parity/data counts, per-drive inputs, units, and result labels.
- [RaidSize Unraid calculator](https://raidsize.com/tools/unraid-calculator/en), accessed 2026-08-23. Static competitor page for mixed-drive promise, single/dual parity formulas, and FAQs.
- [RaidSize full RAID calculator](https://raidsize.com/en/), accessed 2026-08-23. Static broader competitor page listing Unraid alongside RAID, SHR, and ZFS modes.
- [Dalil Tech RAID calculator](https://dalil-tech.com/raid-calculator), accessed 2026-08-23. Static broader competitor page with Unraid parity modes, mixed-drive controls, result claims, and copy-link action.
- [The Home Server Blog RAID capacity calculator](https://thehomeserverblog.com/raid-capacity-calculator/), accessed 2026-08-23. Static broader competitor page with an Unraid preset, parity-size input, reserve layers, and growth fields.
- [Cloudzat Unraid array guide and calculator](https://cloudzat.com/seagate-ironwolf-unraid/), accessed 2026-08-23. Static Unraid-specific purchase/decision calculator with data-drive and parity-size inputs.
- [Need to Know IT RAID calculator](https://needtoknowit.com.au/tools/raid-calculator/), accessed 2026-08-23. Adjacent calculator page with layered system/filesystem/snapshot/headroom accounting; not counted as a distinct direct Unraid competitor because the retrieved page is a broader NAS calculator.
- [Need to Know IT UnRAID explainer](https://needtoknowit.com.au/tools/raid-calculator/unraid/), accessed 2026-08-23. Adjacent Unraid page stating data/parity roles and linking into the broader calculator; used for competitor/saturation context, not as primary formula authority.
- Search discovery was performed with the web connector on 2026-08-23; SearXNG was not configured and the documented local helper request failed against `http://127.0.0.1:8080/search`. No Bing/DuckDuckGo engine attribution is claimed.

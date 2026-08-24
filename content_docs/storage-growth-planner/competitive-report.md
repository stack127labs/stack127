# Competitive report: Storage Growth and TCO Planner

Status: ready
Tool: Storage Growth and TCO Planner
Route: `/storage-growth-planner`
Researched: 2026-08-23
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

- [Observed] `/storage-growth-planner` did not exist in `app/`, `content_docs/`, `tests/`, or `scripts/` at intake. The flat route is not a duplicate of an existing route.
- [Observed] The storage surface already has `/raid-calculator`, `/zfs-capacity-calculator`, `/zfs-padding-calculator`, and `/raidz-expansion-planner`. None projects a user-supplied growth curve into future capacity and cost.
- [Documented] `lib/storage/index.ts` exposes exact `bigint` byte arithmetic, versioned adapters, structured invalid results, assumptions, sources, uncertainty, and URL-state helpers. The shared storage engine is not changed by this research.
- [Documented] `content_docs/storage-tools/calculation-engine.md` requires new calculators to keep formula logic outside React, use exact bytes, version the calculator and input shape, preserve unknown values, and keep publication state separate from page code.
- [Inferred] The useful opening is a transparent decision timeline for a homelab owner, not another RAID arithmetic widget or a live hardware-price comparison. The planner can work from values the user knows and remain useful without curated product coverage.

### Method and coverage

The research used four required query shapes, web search for discovery, primary documentation for technical claims, community pages for repeated pain, and a standalone Playwright CLI inspection of every direct competitor below. Search snippets were not treated as operated-page evidence.

- Search backend: Web connector
- Search engines: not individually available
- Search queries: `storage growth calculator TCO NAS local cloud`; `how much storage do I need 5 years NAS growth calculator`; `NAS storage capacity planning calculator power cost TCO`; `storage TCO calculator cloud backup electricity drive replacement`
- Follow-up queries: `ZFS RAIDZ capacity calculator ashift recordsize`; `NAS vs cloud storage cost calculator 5 years`; `storage TCO calculator cloud retrieval egress`; `homelab storage growth backup cost calculator`
- Browser backend: standalone Playwright CLI using the pinned Playwright 1.60.0 and Chromium 1223 already present in `/home/teja/projects/stack127/node_modules`; the in-app Browser was unavailable because no runtime instance was connected.
- Browser viewport: 1280 x 720 and 390 x 844. All eight URLs were opened at both widths on 2026-08-23, Asia/Kolkata.
- Playwright evidence: `/tmp/stack127-storage-research-results.json`; screenshots were saved under `/tmp/stack127-storage-*.png` during inspection. The final route QA must use the route's guarded local preview and record its own evidence.
- Access limitations: Seagate exposed a vendor landing page with the calculator result but no reliably labelled form controls in the inspected DOM. 45Drives exposed the calculator description while its interactive frame was not available through the top-level page. JRO timed out while capturing the desktop screenshot after rendering its controls; its DOM and narrow-width measurements were still collected. These are recorded as unknown where appropriate.
- Safety boundary: no account creation, sign-in, payment, upload, email submission, or external mutation was attempted.

### Search saturation evidence

- Queries tried: the four primary queries and the follow-up capacity, power, backup, cloud, TCO, and ZFS queries above.
- Repeated domains: `needtoknowit.com.au`, `datacenterdisk.com`, `jro.io`, `45drives.com`, `tco.ltoshow.com`, `toolsforfilm.com`, `seagate.com`, `raidz-calculator.com`, `trueNAS.com`, `backblaze.com`, and `aws.amazon.com`.
- Exclusions: generic RAID calculators without a growth or cost model; provider pricing pages that are inputs rather than planners; articles and forum answers without an operable calculator; translated or duplicate ZFS calculators; appliance configurators locked to one vendor; and pages requiring a private account.
- Saturation conclusion: the integrated niche is fragmented, not empty. Capacity calculators, power calculators, cloud comparisons, backup planners, and enterprise TCO tools exist separately. No reviewed tool combines a small-lab growth timeline, explicit usable capacity, hardware/power/replacement cost, and a clearly bounded TCO result in one calm flow.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Buy enough storage for a future horizon | `how much storage do I need in 5 years NAS` | Turn current data and growth into a future capacity target and purchase point | Advice threads, spreadsheets, and capacity calculators |
| Compare ownership models | `NAS vs cloud storage cost calculator 5 years` | Compare up-front hardware, power, replacements, and recurring storage cost | Local versus cloud calculators and provider pages |
| Model real array capacity | `ZFS RAIDZ capacity calculator ashift recordsize` | Separate raw capacity, redundancy, allocation overhead, and planning reserve | Detailed ZFS calculators and official docs |
| Include backup and growth | `storage growth backup cost calculator` | Avoid pricing one primary copy as if it were a backup | Backup planners and community discussions |
| Explain the crossover point | `when is a NAS cheaper than cloud storage` | See the year and assumptions where one scenario overtakes another | A few regional comparison tools |
| Compare a hybrid setup | `local NAS plus cloud backup TCO calculator` | Price a local primary with an independent copy | Vendor docs and partial calculators |

The surface decision rule passes: this is a calculation over user-known inputs, not a curated directory. It fails if it promises the best storage choice, depends on live hardware scraping, or hides backup and cloud assumptions behind a single score.

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Owners do not know whether to buy for one, three, or five years of growth. | [Server Fault: planning drive capacity for a NAS](https://serverfault.com/questions/912819/how-to-plan-for-buying-drive-capacity-for-a-nas) | Long-running planning question with follow-up discussion | Show a year-by-year demand line and the first year a plan misses its operating reserve. |
| Electricity cost matters for always-on homelabs, but simple watts multiplied by a tariff hides idle and load behavior. | [r/homelab: electricity cost](https://www.reddit.com/r/homelab/comments/1sqjm38/how_do_you_manage_the_electricity_cost_of_your/) and [Need to Know IT power calculator](https://needtoknowit.com.au/tools/power-calculator/) | Repeated recent discussion and a dedicated tool category | Ask for measured system watts and tariff. Keep energy separate from hardware and capacity. |
| Cloud comparisons omit or simplify retrieval and egress. | [AWS S3 pricing](https://aws.amazon.com/s3/pricing/?loc=ft) and [r/DataHoarder cloud calculator discussion](https://www.reddit.com/r/DataHoarder/comments/ocaglt/) | Repeated comparison effort; official pricing has many charge classes | Make cloud retrieval and transfer explicit inputs or state that the model is storage-only. |
| Precise ZFS calculators are hard for beginners to translate into a decision. | [r/truenas: difficulty with jro.io](https://www.reddit.com/r/truenas/comments/xql093/) | Direct novice pain report with similar questions elsewhere | Put the timeline and TCO answer first; keep topology and allocation detail as an audit view. |
| A NAS is often treated as both primary storage and backup. | [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) and [r/DataHoarder NAS versus cloud discussion](https://www.reddit.com/r/DataHoarder/comments/1oqzpzc/) | Repeated failure-domain confusion | Model copy count and off-site copy cost. Never call RAID redundancy a backup. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| A future data curve can be calculated from starting data and a fixed annual or monthly growth assumption. | Product choice over user inputs; formula must be versioned in the implementation report. | Inferred | Use either compounding or linear growth, not an unlabeled mixture. Let the product plan choose one. |
| RAIDZ allocation depends on sector size, vdev width, parity, and the actual block or record. | [OpenZFS RAIDZ space efficiency](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | Documented | Simple parity subtraction is only an upper-level estimate. Reuse the existing ZFS capacity route for deep OpenZFS allocation questions. |
| ZFS compression changes physical allocation only when actual written blocks compress, and the result is workload-dependent. | [OpenZFS compression](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html) | Documented | A generic planner should not promise compression. A user-entered scenario is acceptable only if clearly conditional. |
| RAIDZ expansion keeps existing blocks at their old allocation ratio. | [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html) | Documented | This route should model a fresh purchase plan. Existing expanded pools belong to `/raidz-expansion-planner`. |
| ZFS slop is a shift-based, version-sensitive reserve, not an unlimited percentage. | [OpenZFS module parameters](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html) | Documented | Do not reproduce a ZFS formula casually. Use the existing ZFS calculator as a related tool. |
| A complete TCO model can include hardware, energy, failure or replacement cost, cooling, labor, migration, and retrieval. | [SNIA storage TCO model](https://www.snia.org/sites/default/files/SSSI/SNIA_TCO_Whitepaper_03-2021.pdf) and [DNA Data Storage Alliance TCO discussion](https://dnastoragealliance.org/wp-content/uploads/2021/06/DNA-Data-Storage-Alliance-An-Introduction-to-DNA-Data-Storage.pdf) | Documented | Home users should supply or omit labor, cooling, and migration rather than inherit enterprise defaults. |
| Electricity cost is watts times hours times tariff, with optional idle/load or uptime assumptions. | [Need to Know IT power calculator](https://needtoknowit.com.au/tools/power-calculator/) and [RunWatts NAS calculator](https://www.runwatts.com/appliances/nas) | Documented | This is auditable and local. Do not fetch a region rate without telling the user its date and source. |
| Cloud storage TCO can include storage, requests, retrieval, transfer, replication, and minimum-duration charges. | [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/?loc=ft) and [Backblaze B2 pricing](https://www.backblaze.com/cloud-storage/pricing) | Documented | A first version should use explicit user-supplied monthly cloud cost and retrieval/egress exclusions or inputs. |
| A 3-2-1 plan has three copies, two media types, and one off-site copy. | [CISA backup guidance](https://www.cisa.gov/stopransomware/back-up-business-data) and [Tools for Film planner](https://www.toolsforfilm.com/tools/backup-strategy) | Documented | The planner may show copy count and off-site cost, but must not certify recoverability from arithmetic alone. |

## Competitor reviews

### Competitor 1: DatacenterDisk Enterprise Storage TCO

- URL: https://datacenterdisk.com/tools/tco-calculator
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] Enterprise storage buyers comparing HDD, NVMe, and LTO over five years. The page also includes a homelab example.
- Inputs and defaults: [Observed] Capacity target, drive capacity, price per TB, drive type, watts per drive, electricity rate, PUE, annual failure rate, replacement cost, and 3/5/7-year horizon. Default result showed `$2,295`, `$4.59` per TB/year, five drives, and `$55` annual power.
- Action and state behavior: [Observed] Default result is present on load. Reset, Copy Results, and Compare Storage Types are visible. The automated click probe matched a navigation-level Compare control before the calculator control, so compare behavior is recorded as unknown.
- Results and visuals: [Observed] TCO headline, cost per TB/year, drive count, annual power, and a component table for capital, power, and replacement. Long explanatory sections and benchmark tables follow.
- Formula or data source: [Documented] The page says it accounts for RAID overhead and live market prices updated every two hours. [Unknown] The RAID model, rounding, price feed, and replacement calculation were not exposed as a primary formula.
- Errors and edge behavior: [Unknown] No invalid or boundary result was safely observed. The default path is populated.
- Mobile and accessibility: [Observed] No document overflow at 390 px. Labels and native inputs were present, but a full keyboard and screen-reader audit was not performed.
- Privacy: [Documented] The page says free and no signup. [Unknown] Calculator inputs, copy actions, and live pricing request handling were not verified.
- Performance: [Observed] The page loaded and exposed the result in a small controlled interaction. No benchmark claim is made.
- Search-content structure: [Observed] H1 is “Enterprise Storage TCO Calculator, 5-Year Total Cost of Ownership” followed by configuration, power, operational, guide, examples, benchmarks, and FAQ headings.
- What works: It names the major TCO categories and keeps a compact cost table near the result.
- What fails: It targets enterprise scale, uses live market data, carries a long article below the tool, and says it accounts for RAID without exposing the topology input.
- Do not copy: Live price freshness as a hidden dependency, enterprise PUE defaults, or the article-first result hierarchy.

```text
[TCO title and promise]
[capacity] [drive size] [price/TB] [type]
[watts] [kWh] [PUE] [failure rate] [replacement] [years]
[Reset] [Copy] [Compare]
[TCO] [$/TB/year] [drives] [annual power]
[cost component table]
[long guide, examples, benchmarks, FAQ]
```

### Competitor 2: Need to Know IT NAS Power Cost Calculator

- URL: https://needtoknowit.com.au/tools/power-calculator/
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] NAS owners who want monthly and yearly electricity cost.
- Inputs and defaults: [Observed] Region and tariff, currency, average watts, hours per day, plus advanced idle watts, load watts, percentage at load, sleep hours, network gear, solar offset, and regional defaults.
- Action and state behavior: [Observed] Simple, Advanced, and Compare modes; six hardware presets; the default result is rendered on load. Copy for forum, permalink, and PDF actions are visible. Email capture is present but was not used.
- Results and visuals: [Observed] Monthly, yearly, daily, five-year cost, kWh, average draw, emissions, and “biggest cost levers.”
- Formula or data source: [Documented] The page says its advanced mode uses idle/load mix and sleep hours rather than watts multiplied by a single rate; rate sources are named as AER, EIA, Ofgem, and MBIE. [Unknown] The exact rate refresh implementation was not checked.
- Errors and edge behavior: [Unknown] No invalid probe was submitted.
- Mobile and accessibility: [Observed] No document overflow at 390 px. Native controls and labels were present. Full focus order remains unverified.
- Privacy: [Unknown] Copy and permalink behavior were not inspected deeply. Email capture is optional and outside this review.
- Performance: [Observed] Result appeared without a visible network wait after the page load.
- Search-content structure: [Observed] H1, running cost estimate, setup comparison, calculation method, related tools, and FAQ.
- What works: It makes energy assumptions visible and offers a useful simple-to-advanced progression.
- What fails: It answers only power cost, not capacity runway, storage replacement, redundancy, or backup TCO.
- Do not copy: Region defaults that look precise without an explicit date beside the result, or email capture inside the core calculation path.

```text
[NAS power title]
[Simple | Advanced | Compare]
[presets] [region] [tariff] [watts] [hours]
[optional idle/load/sleep/network/solar]
[monthly] [yearly] [5-year] [kWh] [emissions]
[cost levers] [cloud comparison] [email prompt]
```

### Competitor 3: Need to Know IT Cloud vs NAS Cost Calculator

- URL: https://needtoknowit.com.au/tools/cloud-vs-nas-calculator/
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] Australian users comparing five-year cloud subscription cost with a self-hosted NAS and a crossover point.
- Inputs and defaults: [Observed] Provider/plan, monthly price, plan size, data stored, monthly downloads, current storage, annual growth, NAS unit, NAS cost, watts, drive bays, drive size, drive cost, RAID level, electricity rate, uptime, drive replacement years, and UPS cost.
- Action and state behavior: [Observed] A Calculate button is visible. The page also offers a method disclosure and FAQ buttons. The default page exposes both scenario forms and a cumulative 60-month view.
- Results and visuals: [Observed] Cloud and NAS sections, cumulative cost over 60 months, NAS cost breakdown, recommendation language, and a comparison curve.
- Formula or data source: [Documented] It states that Australian plan prices, rates, hardware costs, growth, uptime, drive replacement, and UPS are modeled. [Unknown] The exact RAID capacity formula and cloud tier transition rules were not separately documented.
- Errors and edge behavior: [Unknown] No invalid probe was submitted.
- Mobile and accessibility: [Observed] No document overflow at 390 px. Native labeled controls were present. Full chart label visibility was not audited.
- Privacy: [Unknown] A question form and email fields exist below the tool; the core calculation privacy behavior was not verified.
- Performance: [Observed] The tool exposed a full result on initial load and did not require an account.
- Search-content structure: [Observed] H1, Cloud Storage, Self-Hosted NAS, cumulative cost, breakdown, tips, recommendation, and FAQ.
- What works: It connects growth to the cloud tier and includes NAS power, drive replacement, and UPS.
- What fails: It is region-specific, vendor-model-specific, and recommendation-heavy. A bundled “recommended” outcome can hide the user’s copy and recovery assumptions.
- Do not copy: A single regional price catalog, provider-specific NAS presets as the main path, or a recommendation that implies a universal winner.

```text
[Cloud vs NAS title]
[cloud provider, price, size, downloads, growth]
[NAS model, bays, drive size/cost, RAID, power, tariff, uptime, replacement, UPS]
[Calculate]
[cloud result] [NAS result] [60-month cumulative chart]
[breakdown] [recommendation] [FAQ]
```

### Competitor 4: Tools for Film Backup Strategy Planner

- URL: https://www.toolsforfilm.com/tools/backup-strategy
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] Film and media teams planning a 3-2-1 backup strategy over a retention period.
- Inputs and defaults: [Observed] Total data, monthly growth, three copy selections, and retention period. Defaults were 10 TB, 0.5 TB/month, external SSD, NAS, Backblaze B2, and 36 months.
- Action and state behavior: [Observed] Copy, Share, Print, Reset, and Show Formula controls. The default calculation appears on load and can be reset.
- Results and visuals: [Observed] Three-copy compliance checks, per-copy cost, monthly cloud cost, total retention cost, growth projection, and a media reference table.
- Formula or data source: [Documented] The page explains the 3-2-1 model and growth projection. [Unknown] Media price tables and the precise cloud growth charge rules were not sourced beside each result.
- Errors and edge behavior: [Unknown] No invalid or boundary probe was submitted.
- Mobile and accessibility: [Observed] At 390 px the document scroll width measured 430 px, so the page had horizontal overflow. The page uses native inputs and buttons, but small-screen table behavior needs correction.
- Privacy: [Unknown] Share and embed controls were visible; serialization and data handling were not inspected.
- Performance: [Observed] The page loaded with a populated result and no account wall.
- Search-content structure: [Observed] H1, introduction, formula, examples, media reference, tips, mistakes, FAQ, and related tools. The supporting article is much longer than the calculator.
- What works: It treats backup copies and off-site placement as first-class decisions and connects them to growth.
- What fails: It mixes media price assumptions with confident claims, uses film-specific language, and overflows on the tested narrow width.
- Do not copy: Fear-based loss prose, fixed media prices without freshness or sources, or a compliance check that implies restore success.

```text
[Backup Strategy Planner]
[data] [monthly growth] [copy 1] [copy 2] [copy 3] [retention]
[3-2-1 checks]
[per-copy cost] [total] [growth projection]
[media price table]
[long formula, examples, tips, FAQ]
```

### Competitor 5: The LTO Show Storage TCO Calculator

- URL: https://tco.ltoshow.com/
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] Enterprise or media-storage buyers comparing on-prem tape, disk, and cloud over five years.
- Inputs and defaults: [Observed] Beginning capacity, annual growth, energy price, retention, LTO generation and media price, expansion frames, tape drives, storage system, reference disk, RAID level, cloud provider, recall SLA, monthly retrieval, object size, overrun, and restore staging days.
- Action and state behavior: [Observed] A single Update Results button and Download PDF Report. The page separates general, tape, disk, and cloud assumptions and exposes advanced sliders.
- Results and visuals: [Observed] Lowest-TCO headline, three option totals and ratios, comparison bars, peak capacity, per-medium breakdown, and retrieval sensitivity.
- Formula or data source: [Documented] The page states that cloud charges, storage growth, retrieval, overrun, staging, energy, and staffing assumptions are modeled. [Unknown] The implementation of each price source was not independently verified.
- Errors and edge behavior: [Unknown] No invalid probe was submitted.
- Mobile and accessibility: [Observed] No document overflow at 390 px. The long labelled slider form and chart need focused keyboard and screen-reader review.
- Privacy: [Unknown] PDF generation and result serialization were not inspected.
- Performance: [Observed] A populated five-year result appeared after the update action.
- Search-content structure: [Observed] H1, General, five-year comparison, medium breakdown, and retrieval sensitivity. The page is concise but enterprise-oriented.
- What works: It exposes retrieval as a cost lever and makes growth visible in the result instead of pricing only the starting capacity.
- What fails: It has too many advanced inputs for a first screen, uses enterprise assumptions such as FTE and facility cost, and compares media classes that are outside a typical homelab.
- Do not copy: A 17-control first screen, enterprise labor defaults, or a ranked winner when the user’s recovery and access needs are not modeled.

```text
[Storage TCO Calculator]
[capacity] [growth] [energy] [retention]
[tape assumptions]
[disk system] [drive] [RAID]
[cloud provider] [recall] [retrieval] [object] [staging]
[Update Results] [Download PDF]
[winner] [three cost cards] [bar chart] [medium breakdown]
```

### Competitor 6: Seagate Private Cloud TCO Calculator

- URL: https://www.seagate.com/solutions/cloud/private-cloud/tco-calculator/
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Documented] Enterprise buyers comparing public cloud with a Seagate private cloud, with capacity from 200 TB to 500 PB and an explicit sales lead.
- Inputs and defaults: [Documented] Capacity, years, access class, monthly download percentage, private-cloud discount, and public-cloud discount. [Observed] The page rendered a six-step result flow and a public/private/open-source comparison; accessible form controls were not reliably exposed in the inspected DOM.
- Action and state behavior: [Documented] A Proceed to Result action is part of the page flow. [Observed] The inspected page showed the result and a Talk to an Expert path without a usable form probe.
- Results and visuals: [Observed] Cost bars and category rows for storage, software/data-center costs, transfer, and support; product recommendation follows.
- Formula or data source: [Documented] The page defines the cost categories and vendor comparison. [Unknown] Published cloud rates, private-cloud hardware assumptions, and discount math were not exposed as a versioned formula.
- Errors and edge behavior: [Unknown] Not safely observable without a stable form control.
- Mobile and accessibility: [Observed] No document overflow at 390 px in the top-level page. Cookie and regional overlays add substantial control noise.
- Privacy: [Observed] Country selection, login, cookie controls, and Talk to an Expert lead capture are present. [Unknown] Core input handling.
- Performance: [Observed] The vendor page loaded, but it includes substantial navigation and cookie UI.
- Search-content structure: [Observed] Private Cloud TCO Calculator, six-step estimate, compare options, recommendation, and lead CTA.
- What works: It names storage, software/data-center, transfer, and support as separate cost layers.
- What fails: It is not a homelab tool, requires enterprise-scale capacity, and is designed to sell a private-cloud solution.
- Do not copy: Vendor-led “savings” framing, enterprise-only bounds, or lead capture as the next step for a personal planning calculation.

```text
[vendor navigation and regional controls]
[Private Cloud TCO]
[capacity] [years] [access class] [downloads]
[private discount] [public discount] [Proceed]
[public vs private vs open-source cost bars]
[vendor recommendation] [Talk to an Expert]
```

### Competitor 7: 45Drives ZFS / RAIDZ Capacity Calculator

- URL: https://www.45drives.com/zfs/zfs-calculator/
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] A ZFS user planning raw and usable pool capacity with RAIDZ parity, sector size, and slop.
- Inputs and defaults: [Documented] RAIDZ level, drive count, drive capacity, and sector size. The calculator page also explains raw versus usable space and planning-only limits. [Observed] The top-level page’s interactive controls were inside a frame that was not available to the inspected top-level DOM.
- Action and state behavior: [Unknown] The interactive frame’s live action and reset behavior were not independently operated.
- Results and visuals: [Documented] Raw and usable TB/TiB, RAIDZ overhead, slop, and recommended fill level are the intended outputs.
- Formula or data source: [Documented] The page states the formula scope and cautions that compression, metadata, workload, and tuning can change actual usable capacity. [Unknown] Exact formula version.
- Errors and edge behavior: [Unknown] Frame unavailable for probes.
- Mobile and accessibility: [Observed] No top-level document overflow at 390 px. The frame’s responsive behavior is unknown.
- Privacy: [Unknown] No calculator-specific statement was verified.
- Performance: [Observed] The page shell loaded; the interactive frame was not measured.
- Search-content structure: [Observed] One h1, a concise promise, education and training links, and site navigation.
- What works: The page keeps its stated result bounded and uses the right ZFS vocabulary.
- What fails: It does not cover growth, purchase timing, power, replacement, or backup TCO.
- Do not copy: A frame dependency that prevents independent QA, or a single usable-capacity answer when the user is deciding on a multi-year plan.

```text
[45Drives navigation]
[ZFS / RAIDZ Capacity Calculator]
[calculator frame: RAIDZ, drives, capacity, sector]
[raw capacity] [usable capacity] [slop/fill guidance]
[education and vendor CTA]
```

### Competitor 8: JRO OpenZFS Capacity Calculator

- URL: https://jro.io/capacity/
- Accessed: 2026-08-23, standalone Playwright, 1280 x 720 and 390 x 844
- Audience and promise: [Observed] Technical OpenZFS users comparing many pool and vdev layouts.
- Inputs and defaults: [Observed] Total disks, add-disk size, minimum spares, new vdev type and width, OpenZFS slop mode, recordsize, ashift, disk swap size, table output, decimal places, deflate ratio, pool AFR, reservation, effective capacity, capacity unit, and filters for mirror/RAIDZ/dRAID.
- Action and state behavior: [Observed] Add Disk and Add Vdev Layout controls update a large layout table. Most options appear live. No explicit compact Calculate action was required for the initial table.
- Results and visuals: [Observed] Common-layout tables, raw/stripe/mirror rows, RAIDZ1/2/3 matrices, dRAID capacity, shelf-count planning, efficiency, overhead, AFR, and reservation views.
- Formula or data source: [Documented] The UI identifies OpenZFS 2.0.7 slop, ashift, recordsize, and layout-specific tables. [Inferred] It combines documented OpenZFS heuristics with its own table-generation rules. Exact formula provenance is not shown beside every result.
- Errors and edge behavior: [Unknown] No invalid probe was submitted.
- Mobile and accessibility: [Observed] The document scroll width measured 1200 px at a 390 px viewport. This is a blocking narrow-layout failure for a general-purpose tool. A desktop screenshot timed out while waiting for fonts, so desktop visual evidence is limited to DOM measurements.
- Privacy: [Unknown] No calculator-specific privacy statement was observed.
- Performance: [Observed] The page renders a very large table; screenshot capture timed out after DOM collection.
- Search-content structure: [Observed] H1, dRAID capacity calculation, and closing thoughts, with a dense control surface and extensive matrices.
- What works: It exposes many real OpenZFS planning dimensions and makes layout comparisons exact.
- What fails: It is difficult to scan, has no clear primary job for a new visitor, and its narrow layout does not reflow.
- Do not copy: A full matrix as the first answer, 1200 px tables on mobile, or hidden formula provenance behind many toggle controls.

```text
[Total disks] [add disk] [spares] [new vdev type/width]
[slop] [recordsize] [ashift] [swap]
[table data] [decimal] [efficiency] [AFR] [reservation] [effective]
[large common-layout matrix]
[raw/mirror/RAIDZ/dRAID matrices]
[shelf count and closing text]
```

## Comparison matrix

| Capability | DatacenterDisk | Need to Know Power | Need to Know Cloud vs NAS | Tools for Film | LTO Show | Seagate | 45Drives | JRO | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Growth projection | No visible growth input | No | Annual growth | Monthly growth | Annual growth | Years and capacity, not clear curve | No | No | High |
| Local usable capacity | Abstract target | No | NAS bays, drive size, RAID | Media presets | Disk and RAID presets | Enterprise private cloud | RAIDZ result | Many ZFS layouts | High |
| Hardware CapEx | Yes | No | NAS unit and drives | Media presets | Tape and disk | Vendor infrastructure | No | No | High |
| Power cost | Per-drive watts, PUE | Primary job | NAS watts and tariff | Not clearly separate | Energy input | Data-center category | No | No | High |
| Replacement or failure reserve | Annual failure and replacement | No | Replacement years | No | Maintenance inputs | Support category | No | AFR option | Medium |
| Cloud cost | No | Small comparison | Yes | B2 preset | Retrieval and transfer | Public cloud | No | No | Medium |
| Backup and copy count | No | No | No explicit copy model | 3-2-1 check | No | No | No | No | High |
| Explicit purchase timing | No | No | Crossover curve | Retention horizon | Peak capacity | Multi-year comparison | No | No | High |
| Exact chart or timeline | Cost table | Cost facts | Cumulative curve | Growth projection | Comparison bars | Cost bars | No | Huge tables | High |
| Simple first screen | Medium | Strong | Medium | Medium | Weak | Weak | Strong | Weak | High |
| Browser/local privacy | Unknown | Unknown | Unknown | Unknown | Unknown | Vendor page | Unknown | Unknown | Medium |
| Narrow layout observed | Pass | Pass | Pass | Fail, 430 px scroll width | Pass | Pass at shell level | Unknown frame | Fail, 1200 px scroll width | High |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Is growth linear or compounded? | Tools for Film uses monthly growth, Need to Know uses annual growth, LTO Show uses annual percentage, and provider plans jump tiers. | [Tools for Film](https://www.toolsforfilm.com/tools/backup-strategy), [Need to Know Cloud vs NAS](https://needtoknowit.com.au/tools/cloud-vs-nas-calculator/), [LTO Show](https://tco.ltoshow.com/) | Product planning must choose one primary model and state it beside the result. A small linear/compound toggle is justified only if it does not blur the answer. |
| What does “capacity” mean? | ZFS tools distinguish raw, usable, slop, and fill reserve. TCO tools often accept a target usable number and hide array overhead. | [OpenZFS zpool properties](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html) and [45Drives](https://www.45drives.com/zfs/zfs-calculator/) | Make raw, modeled usable, and operating reserve separate fields. Do not call dataset free space exact. |
| How should redundancy be priced? | Some tools accept a usable target and infer drive count. Others expose RAID or drive bays. ZFS layout depends on vdev geometry. | [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) | Product planning must select a small finite layout contract, probably user-entered usable capacity plus a route-local redundant drive model, and exclude arbitrary vendor layouts. |
| What belongs in TCO? | Enterprise models add PUE, labor, cooling, support, and migration. Homelab tools mainly add power and drive replacement. | [SNIA TCO model](https://www.snia.org/sites/default/files/SSSI/SNIA_TCO_Whitepaper_03-2021.pdf), [Need to Know Power](https://needtoknowit.com.au/tools/power-calculator/) | Keep hardware, power, and replacement in launch scope. Make labor, cooling, migration, and cloud retrieval optional or explicit exclusions. |
| What cloud charges matter? | Storage-only models are simple; serious models add retrieval, transfer, request, and minimum-duration charges. | [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/?loc=ft), [Backblaze B2 pricing](https://www.backblaze.com/cloud-storage/pricing) | Do not embed a volatile provider catalog in v1. Let the user enter an effective monthly rate and separately label retrieval/egress as excluded or added. |
| Can a result recommend a winner? | Several pages say “recommended,” “lowest TCO,” or “best value” from their assumptions. | [LTO Show](https://tco.ltoshow.com/), [Need to Know Cloud vs NAS](https://needtoknowit.com.au/tools/cloud-vs-nas-calculator/) | Show the selected assumptions and crossover, not an unqualified universal recommendation. |

## Evidence-backed opportunities

1. **A growth runway first screen**: start with current used data, growth, planning years, and required operating reserve. Show the first year the selected plan crosses its reserve, because existing pages show capacity or cost but rarely connect both to a purchase date.
2. **A user-owned local plan**: model drive count, usable capacity factor, purchase cost, watts, electricity rate, and replacement reserve from explicit inputs. This avoids live-price maintenance and makes the result reproducible.
3. **A compact TCO timeline**: show hardware purchases as discrete events, power as a recurring line, replacement reserve separately, and cumulative cost by year. This is clearer for a homelab than enterprise PUE and labor defaults.
4. **An honest copy boundary**: include an optional independent-copy or off-site-copy cost line and state that RAID is not backup. The tool can price a plan without claiming that it can verify restores.
5. **A formula receipt**: keep raw demand, effective capacity, reserve, and TCO rows exact and inspectable. The result should name the growth mode, currency, horizon, and calculation version.
6. **An adjacent-tool handoff**: when the user needs exact ZFS allocation, link to `/zfs-capacity-calculator`; when they need conventional RAID, link to `/raid-calculator`; do not recreate those formulas in this page.

## Table stakes

- Current data and growth inputs with explicit units.
- A planning horizon and visible year-by-year demand.
- A local storage configuration with capacity, redundancy or usable-capacity factor, drive price, and power.
- Electricity tariff and uptime or annual hours.
- Hardware CapEx, power OpEx, replacement reserve, cumulative TCO, and cost per modeled usable TB.
- An explicit primary action, reset, invalid-state recovery, and no stale result after edits.
- A clean route by default, explicit share state only when requested, and local-browser privacy scoped to the calculation.
- A narrow layout that keeps every answer label, value, and percentage visible without page-level horizontal scrolling.
- A result that says “modeled” or “estimated” where the input assumptions are user supplied.

## Ideas to reject

- Live scraping of drive prices or cloud plans: volatile, difficult to reproduce, and outside the route’s core job.
- A “best storage” score: it promises judgment the inputs cannot prove.
- A full ZFS allocation simulator: it duplicates the existing route and requires version-sensitive OpenZFS details.
- A 3-2-1 compliance badge: arithmetic can count copies but cannot verify restoreability, media independence, or off-site access.
- Enterprise PUE, rack, staff, and cooling defaults on the first screen: they create fake precision for homelab users.
- An unbounded hardware catalog or provider picker: it creates maintenance debt and breaks usefulness when a product is missing.
- A single “usable capacity” number that mixes raw space, redundancy, operating reserve, and dataset free space.
- A large comparison matrix as the first answer: JRO proves that exact tables can still be unreadable on mobile.
- Automatic result updates for every edit: the primary action should remain explicit so an inventory or assumption edit cannot be confused with final calculation.

## Open questions and blockers

- None for research readiness. Product planning must choose the exact launch layout model, growth convention, currency/units, replacement treatment, and whether an independent-copy line is required. These are product decisions, not unresolved technical sources.

## Sources

- [DatacenterDisk Enterprise Storage TCO Calculator](https://datacenterdisk.com/tools/tco-calculator), accessed 2026-08-23. Operated with standalone Playwright; inputs and result hierarchy observed.
- [Need to Know IT NAS Power Calculator](https://needtoknowit.com.au/tools/power-calculator/), accessed 2026-08-23. Operated with standalone Playwright; power inputs, presets, and result fields observed.
- [Need to Know IT Cloud vs NAS Calculator](https://needtoknowit.com.au/tools/cloud-vs-nas-calculator/), accessed 2026-08-23. Operated with standalone Playwright; local/cloud inputs and cumulative result observed.
- [Tools for Film Backup Strategy Planner](https://www.toolsforfilm.com/tools/backup-strategy), accessed 2026-08-23. Operated with standalone Playwright; copy model, growth, and narrow overflow observed.
- [The LTO Show Storage TCO Calculator](https://tco.ltoshow.com/), accessed 2026-08-23. Operated with standalone Playwright; retrieval and growth controls plus comparison observed.
- [Seagate Private Cloud TCO Calculator](https://www.seagate.com/solutions/cloud/private-cloud/tco-calculator/), accessed 2026-08-23. Operated with standalone Playwright and official page extraction; enterprise scope and result categories documented.
- [45Drives ZFS / RAIDZ Capacity Calculator](https://www.45drives.com/zfs/zfs-calculator/), accessed 2026-08-23. Operated with standalone Playwright at the top-level page; calculator frame limitation recorded.
- [JRO OpenZFS Capacity Calculator](https://jro.io/capacity/), accessed 2026-08-23. Operated with standalone Playwright; controls and 1200 px narrow overflow observed.
- [OpenZFS RAIDZ documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html), checked 2026-08-23. Primary technical source for RAIDZ allocation boundaries.
- [OpenZFS VDEVs documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html), checked 2026-08-23. Primary source for vdev roles and failure boundaries.
- [OpenZFS compression documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html), checked 2026-08-23. Primary source for conditional compression behavior.
- [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html), checked 2026-08-23. Primary source for expansion boundary.
- [OpenZFS module parameters](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html), checked 2026-08-23. Primary source for slop behavior.
- [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/?loc=ft), checked 2026-08-23. Primary source for storage, transfer, retrieval, and request charge classes.
- [Backblaze B2 pricing](https://www.backblaze.com/cloud-storage/pricing), checked 2026-08-23. Primary source for effective storage and egress pricing boundaries.
- [SNIA Total Cost of Ownership Model for Storage](https://www.snia.org/sites/default/files/SSSI/SNIA_TCO_Whitepaper_03-2021.pdf), checked 2026-08-23. Primary industry model for TCO categories; enterprise assumptions are not imported by default.
- [CISA backup guidance](https://www.cisa.gov/stopransomware/back-up-business-data), checked 2026-08-23. Primary guidance for separating backup copies from array redundancy.

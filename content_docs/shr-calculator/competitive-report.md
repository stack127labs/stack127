# Competitive report: Synology SHR Capacity Calculator

Status: ready
Tool: Synology SHR Capacity Calculator
Route: `/shr-calculator`
Researched: 2026-08-23
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

The flat route `/shr-calculator` does not exist in `app/`, `content_docs/`, or `tests/pages/`. The route namespace contains related storage tools such as `/raid-calculator`, `/zfs-capacity-calculator`, and `/zfs-padding-calculator`, but no duplicate SHR calculator. The shared storage documentation defines exact byte arithmetic, pure calculation contracts, structured invalid results, and versioned input state. The existing storage hub and publication registry are outside this route's scope and must not be changed during this build.

The route is intentionally unpublished. A later implementation must add a route-owned ownership manifest and keep the route out of the publication registry. The existing sibling storage calculators establish the shell, dark-first visual language, server-rendered page boundary, and colocated CSS pattern.

### Method and coverage

Search discovery used the available web-search connector because no local SearXNG endpoint was configured. Search engines were not individually available through that connector, so the report does not claim Bing or DuckDuckGo coverage. Each direct page below was opened and operated with standalone Playwright CLI in a headless Chromium process. The in-app Browser had no connected runtime in this worktree. The Chromium process required the documented approved execution boundary because the default sandbox rejected `sandbox_host_linux.cc`.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI
- Accessed: 2026-08-23, Asia/Kolkata
- Browser viewport: 1440 x 900 CSS pixels, dark color scheme
- Browser coverage: clean state, visible controls, and a valid mixed-drive calculation where the competitor allowed it; no account, payment, saved account data, or external side effect was used
- Access limits: Synology presented a cookie and regional prompt. The valid probe dismissed the cookie prompt and entered 2 x 4 TB plus 2 x 8 TB. Some competitor pages had long ad or recommendation sections, so the probe recorded the calculator viewport and result text rather than treating full-page density as tool evidence.

### Search saturation evidence

- Queries tried: `Synology SHR capacity calculator`; `Synology RAID calculator SHR capacity mixed drives`; `Synology Hybrid RAID capacity formula mixed disk sizes`; `SHR capacity calculator mixed drive sizes RAID calculator`; `SHR calculator Synology capacity`; `Synology Hybrid RAID capacity calculator`; `SHR-2 calculator mixed drives`; `site:github.com SHR calculator capacity`.
- Repeated domains: Synology official pages appeared across calculator and Knowledge Center queries. The remaining direct results were independent calculators or multi-RAID tools with an explicit SHR mode.
- Exclusions: general RAID calculators without an SHR mode, articles without an operated calculator, forum threads, videos, and vendor documentation were used for pain or technical verification but not counted as direct competitors.
- Minimum met: eight direct or near-direct calculators were opened and operated. The category is established enough that a saturation exception is not needed.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Primary planning | `Synology SHR capacity calculator` | Enter the drives in a new or planned NAS and see usable capacity plus fault tolerance. | Vendor calculator, single-number calculators, and mixed-RAID tools |
| Mixed-drive planning | `Synology RAID calculator SHR capacity mixed drives` | Understand how larger drives contribute instead of being silently limited to the smallest drive. | Vendor calculator and calculators with per-drive or mixed modes |
| Technical explanation | `Synology Hybrid RAID capacity formula mixed disk sizes` | See why the answer changes by size tier and where protection and unused space go. | Documentation, community explanations, and a few diagrams |
| Upgrade pain | `SHR-2 calculator mixed drives` | Compare two-drive protection while planning replacements or an expansion. | Vendor calculator, comparison pages, and generic RAID tools |
| Boundary checking | `SHR capacity after drive swap` | Know whether a new disk changes capacity and whether a fresh-pool estimate applies to an existing pool. | Forum questions and Synology expansion documentation |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Mixed sizes make ordinary RAID math misleading | [Synology Knowledge Center, choose a RAID type](https://kb.synology.com/en-ca/DSM/tutorial/What_RAID_type_is_best_for_my_storage) and the [Synology community SHR calculator thread](https://community.synology.com/enu/forum/17/post/30423) | Repeated across official guidance, forums, and every mixed-drive calculator | Accept individual drive capacities and show the tier calculation, not only `(n - parity) x smallest drive`. |
| Users confuse pool capacity with data capacity | [Synology RAID Calculator](https://www.synology.com/en-uk/support/RAID_calculator) explicitly separates reserved system capacity, available capacity, protection, and unused space | Repeated in official notes and competitor result tables | Keep system reservation, protection, unused space, and volume-level metadata separate. |
| The official tool's drive-size ceiling and preset model do not fit every build | [Reddit discussion about the official calculator's 20 TB ceiling](https://www.reddit.com/r/synology/comments/1fsnsw3/i_made_a_calculator_for_synology_shr_capacity/) and [SHRCalculator.com update notes](https://shrcalculator.com/) | Repeated in recent search results and update notes | Support typed decimal capacities rather than a short preset list, while avoiding device compatibility claims. |
| SHR-2 capacity can look surprising when only the largest drives have extra space | [Reddit discussion of 4 x 16 TB plus 20 TB drives](https://www.reddit.com/r/synology/comments/1f6jmj6/ds1821_max_shr2_storage_for_a_mix_of_18tb_20tb_24tb_drives/) | Repeated mixed SHR-2 questions | Show an explicit unused tier when a slice cannot form a data-bearing group. |
| A fresh-pool result is mistaken for an expansion result | [Synology add-drive guidance](https://kb.synology.com/en-my/DSM/help/DSM/StorageManager/storage_pool_expand_add_disk?version=6) and [Synology search result for expansion calculation](https://kb.synology.com/en-id/search?query=raid+calculator%2F1000) | Repeated in community questions and official expansion wording | State the fresh-pool boundary beside the result and do not pretend to model an established pool's history. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| SHR is intended to optimize capacity when drive sizes differ | [Synology Knowledge Center, choose a RAID type](https://kb.synology.com/en-ca/DSM/tutorial/What_RAID_type_is_best_for_my_storage) | Documented | Official source describes SHR as an automated RAID system that optimizes storage capacity with different drive sizes. |
| Synology's calculator separates system reserve, available capacity, protection, and unused space | [Synology RAID Calculator](https://www.synology.com/en-uk/support/RAID_calculator) | Documented | The live calculator labels these result categories and says each drive reserves approximately 10 GB for system and swap partitions. |
| Btrfs and ext4 volume metadata further reduce data space | [Synology RAID Calculator](https://www.synology.com/en-uk/support/RAID_calculator) | Documented | The calculator notes approximately 4% for Btrfs and 2% for ext4 at volume creation. This is not part of the pool-capacity formula. |
| A fresh SHR-1 pool can be represented as capacity tiers with one protection slice per data-bearing tier | [Synology live calculator output](https://www.synology.com/en-uk/support/RAID_calculator) plus [StashRaid's slicing explanation](https://stashraid.io/shr-calculator) | Inferred | The live valid probe used 2 x 4 TB and 2 x 8 TB and showed approximately 14.5 TB available, 7.3 TB protection, and 37.3 GB system reserve. The tier model reproduces this shape. Synology does not publish a formal equation, so the implementation must label the result as an estimate and preserve the evidence boundary. |
| A fresh SHR-2 pool uses two protection slices in every data-bearing tier and can leave a highest tier unused when too few disks reach it | [Synology live calculator output](https://www.synology.com/en-uk/support/RAID_calculator) plus [Synology mixed-drive community examples](https://www.reddit.com/r/synology/comments/1f6jmj6/ds1821_max_shr2_storage_for_a_mix_of_18tb_20tb_24tb_drives/) | Inferred | The implementation should show the unused tier instead of folding it into a generic overhead number. |
| Expansion eligibility depends on the existing pool and replacement drive | [Synology add-drive guidance](https://kb.synology.com/en-my/DSM/help/DSM/StorageManager/storage_pool_expand_add_disk?version=6) | Documented | The launch tool should not accept a single `existing pool` flag unless it can model the history and compatibility rules accurately. |
| Capacity display must distinguish decimal TB from binary TiB | [Synology RAID Calculator](https://www.synology.com/en-uk/support/RAID_calculator) and the repository's [storage calculation engine contract](../../content_docs/storage-tools/calculation-engine.md) | Documented | Inputs and outputs should name units explicitly. Source bytes remain exact; display rounding must not change the calculation. |

## Competitor reviews

### Competitor 1: Synology RAID Calculator

- URL: [synology.com/en-uk/support/RAID_calculator](https://www.synology.com/en-uk/support/RAID_calculator)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] Official Synology users planning a RAID or SHR layout before configuring a NAS.
- Inputs and defaults: [Observed] Preset number inputs for 24, 20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, and 1 TB, with HDD or SSD choice. Initial counts are zero. The official page does not present free-form per-drive editing in the observed first state.
- Action and state behavior: [Observed] Editing counts updates the usage estimate. A valid probe entered 2 x 4 TB and 2 x 8 TB without a separate calculate button. Reset is visible. Cookie and location prompts can sit above the calculator.
- Results and visuals: [Observed] Separate SHR and SHR-2 result rows show system reserve, available capacity, protection, and unused space. The valid mixed probe showed approximately 14.5 TB available, 7.3 TB protection, and 37.3 GB system reserve for SHR-1, and approximately 7.2 TB available, 7.3 TB protection, and 7.3 TB unused for SHR-2.
- Formula or data source: [Documented] The page says calculations use binary storage and reserves approximately 10 GB per drive for system and swap partitions. [Unknown] It does not expose the mixed-drive equation in the visible UI.
- Errors and edge behavior: [Observed] Zero drives starts with empty result space. [Unknown] The full boundary behavior for invalid counts and unsupported combinations was not exposed in the visible first state.
- Mobile and accessibility: [Observed] The tool uses native number inputs and a grid of preset capacities. [Unknown] The full narrow result layout was not verified because the regional prompt needed more interaction than the research pass allowed.
- Privacy: [Documented] The page presents cookie and privacy controls. [Unknown] The calculator's state handling was not presented as a privacy promise.
- Performance: [Observed] The valid calculation appeared after local input changes once the page loaded.
- Search-content structure: [Observed] H1 `RAID Calculator`, a short usage-estimate heading, and long vendor notes below the tool.
- What works: Official source, explicit system/protection/unused categories, and model recommendations.
- What fails: Preset-first interaction hides the actual tier construction and has a regional or cookie prompt before the answer.
- Do not copy: Vendor model recommendations, prompt-heavy first load, and a result that users must decode without a visible per-tier breakdown.

```text
[RAID Calculator]
  Step 1 Select drives     [HDD] [SSD]
  [24 TB 0] [20 TB 0] ... [1 TB 0]
  Total number of drives: 0   [Reset]
  Step 2 Usage estimate
  [SHR result: reserve | available | protection | unused]
  [SHR-2 result: reserve | available | protection | unused]
  Vendor notes and compatibility links
```

### Competitor 2: StashRaid SHR Calculator

- URL: [stashraid.io/shr-calculator](https://stashraid.io/shr-calculator)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] People comparing storage layouts, especially users with mixed drives who want a visual explanation of SHR.
- Inputs and defaults: [Observed] Four-bay default, uniform versus per-drive mode, drive type choices, preset drive sizes from 500 GB through 22 TB, and many RAID modes including SHR and SHR2.
- Action and state behavior: [Observed] The default result is live and shows 4 x 4 TB SHR as 12 TB usable. Switching to per-drive exposes individual bay selects. Selecting SHR changes the architecture result without a separate primary calculate action.
- Results and visuals: [Observed] Usable capacity, total raw, fault tolerance, efficiency, disk roles, and a performance report. [Documented] The page includes a slicing explanation and a 4 x 2 TB plus 2 x 6 TB example.
- Formula or data source: [Inferred] The page describes SHR as mdadm and LVM slices, but the full equation is not a primary Synology specification.
- Errors and edge behavior: [Observed] Empty per-drive bays are represented explicitly. [Unknown] Boundary messages for impossible SHR-2 combinations were not exhaustively tested.
- Mobile and accessibility: [Observed] Native selects and buttons are present. [Unknown] Full 320 px result and role layout was not verified in this pass.
- Privacy: [Unknown] No narrow calculator-specific privacy statement was found in the operated first viewport.
- Performance: [Observed] Live state changes were immediate after switching input mode.
- Search-content structure: [Observed] H1 `SHR Calculator`, followed by a long explanatory guide with headings for slicing, parity, comparisons, and backup boundaries.
- What works: It makes mixed-drive slicing visible and supports per-drive state.
- What fails: The page mixes SHR with a broad RAID catalog, performance reports, product recommendations, and affiliate-style content.
- Do not copy: Multi-purpose dashboard density, product recommendation sections, or unexplained performance claims.

```text
[STASHRAID Calculator] [Share config]
  Storage parameters: bays | capacity mode | drive type | RAID level
  Array resilience: architecture | fault tolerance
  [usable capacity] [raw] [efficiency]
  Disk 01 DATA ... Disk 04 PARITY
  Performance report | product recommendations
  Long slicing and RAID explanation
```

### Competitor 3: Dalil Tech RAID and SHR Storage Calculator

- URL: [dalil-tech.com/raid-calculator](https://dalil-tech.com/raid-calculator)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] Homelab builders comparing RAID, ZFS, unRAID, and Synology SHR in one tool.
- Inputs and defaults: [Observed] Same-size versus mixed-drive mode, array-level select, drive count, drive size, optional price, and mixed-drive presets. The array-level select exposed `Synology SHR (1 disk)` and `Synology SHR-2 (2 disk)` after interaction.
- Action and state behavior: [Observed] The default is same-size RAID 5 with 4 x 4 TB. The mixed-drive button reveals add-a-drive controls. Results update live and a comparison table covers all array levels.
- Results and visuals: [Observed] Usable capacity, raw capacity, drives that can fail, efficiency, read/write notes, rebuild estimate, copy, share-link, and comparison table. [Documented] The page gives a 4,4,8,8,12,12 TB example of 20 TB for RAID 5 versus 36 TB for SHR.
- Formula or data source: [Inferred] The mixed SHR result appears to use a tier or sum-of-smallest-drives model. The page does not cite a formal Synology equation beside the result.
- Errors and edge behavior: [Observed] Mixed mode permits individual additions. [Unknown] The first probe did not cover malformed numeric text or unsupported minimum counts.
- Mobile and accessibility: [Observed] Native inputs, buttons, and a visible copy action. [Unknown] Narrow dense comparison behavior was not verified.
- Privacy: [Observed] The page says the calculator is client-side in its visible metadata and offers copy/share controls. [Documented] The site also displays affiliate disclosure text.
- Performance: [Observed] Live result changed after mode and drive actions.
- Search-content structure: [Observed] H1 combines all technologies, then separate explanatory H2 sections and an FAQ.
- What works: Fast mixed-drive entry, comparison, and an explicit SHR intent section.
- What fails: The single page has too many array families, rebuild-risk claims, and monetization content for a user who only needs SHR capacity.
- Do not copy: Broad comparison as the primary surface, probabilistic rebuild-risk claim, or affiliate copy around the answer.

```text
[unRAID, RAID, ZFS & SHR Storage Calculator]
  [Same-size] [Mixed drives]
  Array level | drive count | drive size | price
  [usable] [raw] [failures] [efficiency]
  Copy | share | comparison table
  Long RAIDZ, unRAID, and SHR sections
```

### Competitor 4: SHRCalculator.com

- URL: [shrcalculator.com](https://shrcalculator.com/)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] Synology NAS users who need more drive sizes and custom configurations than the official calculator.
- Inputs and defaults: [Observed] Preset selectors from 1 TB through 36 TB, optional SSD sizes, a custom-drive mode, and quantity for each drive capacity.
- Action and state behavior: [Observed] The clean state shows drive selectors and blank allocation rows. Reset and Save Configuration are visible. Selecting drive quantities fills the result cards without a prominent separate calculate button.
- Results and visuals: [Documented and observed] It shows available capacity, protection, unused space, all RAID types at once, and allocation bars. The page advertises custom size support and saved configuration links.
- Formula or data source: [Unknown] The page says it extends the official calculator but does not make the SHR equation visible in the first result view.
- Errors and edge behavior: [Observed] Zero quantities have an explicit empty allocation state. [Unknown] Unsupported or impossible minimum configurations were not fully probed.
- Mobile and accessibility: [Observed] Many small selector cards create a dense desktop grid. [Unknown] Narrow overflow and selector keyboard behavior were not fully verified.
- Privacy: [Documented] The page says there is no tracking beyond basic analytics. Save configuration creates a unique URL, so state privacy still matters.
- Performance: [Observed] Preset selectors and result cards were available without a submit step.
- Search-content structure: [Observed] No visible H1 in the inspected DOM, with H2 sections for Select Drives, RAID Results, allocation, operation, and updates.
- What works: Custom capacities, explicit unused space, all-level comparison, and a focused SHR audience.
- What fails: Selector wall, weak heading semantics, and a save-link feature whose state contract is not explained beside the action.
- Do not copy: Many preset boxes before the answer, ambiguous save-state privacy, or incomplete semantic heading structure.

```text
[logo] [support link]
  Select Drives: 5 x 36 TB ... 5 x 1 TB selector cards
  [Show SSD] [Show custom] [Reset] [Save Configuration]
  RAID Results
  [SHR allocation bar] [SHR-2 allocation bar] [RAID 0 ...]
  Long how-it-works and update notes
```

### Competitor 5: IT Experts RAID and SHR Calculator

- URL: [itxperts.com.mx/herramientas/calculadora-raid-shr](https://www.itxperts.com.mx/herramientas/calculadora-raid-shr)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] Spanish-speaking NAS users comparing useful capacity, fault tolerance, and wasted space between traditional RAID and SHR.
- Inputs and defaults: [Observed] Four editable 4 TB rows, TB unit selectors, Add disk, RAID-level select, and an informational SSD cache field. The page explicitly invites mixed sizes.
- Action and state behavior: [Observed] Adding a disk creates another row and the result updates. There is no visible copy or share action in the first result state.
- Results and visuals: [Observed] Useful capacity is the top result, followed by raw installed capacity, efficiency, redundancy space, and fault tolerance. A mixed-size warning compares the selected result with same-disk traditional RAID.
- Formula or data source: [Inferred] The page exposes a short formula section but not an authoritative source in the operated viewport.
- Errors and edge behavior: [Observed] Row-level delete controls exist. [Unknown] The research pass did not exhaust invalid text, minimums, or non-integer capacity cases.
- Mobile and accessibility: [Observed] Controls are native and the visual result is split into cards. [Unknown] Narrow layout was not verified.
- Privacy: [Observed] Visible metadata says 100% client-side.
- Performance: [Observed] Adding a row and editing values were responsive.
- Search-content structure: [Observed] Spanish H1, short description, update and client-side metadata, then a two-column calculator and formula section.
- What works: Direct focus on mixed sizes, simple row editor, and an explicit comparison against ordinary RAID.
- What fails: The most important result labels are uppercase fragments, and the current page is language-specific for a global searcher.
- Do not copy: Fragment-heavy labels, accidental cache features that do not affect capacity, or uncited formula confidence.

```text
[Spanish H1 and short promise]
  Discos del arreglo                 Resultado
  [4 TB] [unit] [remove]             [capacidad útil]
  [4 TB] [unit] [remove]             [raw] [efficiency]
  [Agregar disco]                    [redundancy] [fault tolerance]
  [RAID level] [cache note]
  Mixed-size comparison | formula note
```

### Competitor 6: TerabyteWise Synology RAID Calculator

- URL: [terabytewise.com/synology-raid-calculator](https://terabytewise.com/synology-raid-calculator)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] DiskStation planners choosing SHR, SHR-2, or classic RAID with mixed-size support and cost context.
- Inputs and defaults: [Observed] RAID level, number of drives, per-drive size, a mixed-drive toggle, binary or decimal display context, and visible drive-price context. The page also exposes a calculator result before its long guide.
- Action and state behavior: [Observed] Input controls are compact and the result changes in place. The page offers quick estimate and planning context rather than a large topology editor.
- Results and visuals: [Observed] The result includes usable capacity, raw total, fault tolerance, and live cost to fill. [Documented] Search-visible copy says it supports mixed-size SHR and shows both marketed TB and OS-reported TiB.
- Formula or data source: [Unknown] The page describes SHR and RAID relationships but does not expose a formal tier table in the first result view.
- Errors and edge behavior: [Unknown] Full invalid behavior was not probed.
- Mobile and accessibility: [Observed] Native select and number controls. [Unknown] Narrow result density was not fully checked.
- Privacy: [Unknown] Product pricing and affiliate context are visible, but calculator input privacy was not clearly scoped in the first viewport.
- Performance: [Observed] Result was available on initial load and updated from controls.
- Search-content structure: [Observed] H1 carries the result promise, followed by Quick answer, calculator, and long supporting headings.
- What works: It acknowledges the TB versus TiB distinction and answers a real purchase-planning question.
- What fails: Price and product recommendation context competes with the capacity answer and can imply a drive recommendation the formula cannot prove.
- Do not copy: Affiliate-driven product selection or a price result that makes the capacity tool feel like a shopping funnel.

```text
[Synology SHR and RAID capacity calculator]
  Quick answer
  RAID level | drive count | drive size | mixed sizes
  [usable] [raw] [fault tolerance] [cost]
  Long drive and expansion guide
```

### Competitor 7: Need to Know IT RAID and Synology SHR Calculator

- URL: [needtoknowit.com.au/tools/raid-calculator](https://needtoknowit.com.au/tools/raid-calculator/)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] Users who want a real-world data-capacity estimate after redundancy, system partitions, filesystem metadata, and snapshot reserve.
- Inputs and defaults: [Observed] NAS ecosystem, RAID type including SHR and SHR-2, drive count, uniform or per-drive selectors, Btrfs and ext4 style choices, filesystem metadata override, snapshot reserve, headroom, and custom deductions.
- Action and state behavior: [Observed] Quick Estimate and Exact Mode are separate actions. Per-drive selectors and plus or minus controls support a detailed state. Copy permalink, copy forum text, and cite result actions are visible.
- Results and visuals: [Observed] A stacked deduction path separates advertised total, real capacity, SHR, system partitions, filesystem metadata, snapshot reserve, estimated usable, and headroom. The result ends at usable for data.
- Formula or data source: [Documented] The page cites or describes system, filesystem, and snapshot assumptions. [Unknown] The SHR tier equation is not independently authoritative.
- Errors and edge behavior: [Unknown] Full invalid behavior was not probed.
- Mobile and accessibility: [Observed] Detailed controls and plus/minus controls exist. [Unknown] Narrow stacked result and table behavior need explicit QA.
- Privacy: [Unknown] Permalink and forum-copy actions require a route-local privacy contract.
- Performance: [Observed] The detailed page loaded with a populated default result.
- Search-content structure: [Observed] H1 includes the real-capacity promise, then a collapsible SHR explanation, calculator, comparison content, and guide material.
- What works: It distinguishes pool capacity from data capacity and makes deductions legible.
- What fails: The volume of assumptions, headroom, snapshot, and custom deductions can make an estimated result look more exact than the technical evidence supports.
- Do not copy: Large assumption stacks, advice disguised as capacity, or a final `usable for your data` number without a crisp boundary.

```text
[RAID & Synology SHR Calculator: Real Usable Capacity]
  Intro and collapsed SHR explanation
  Ecosystem | RAID | count | filesystem | snapshot | headroom
  [estimated usable for data]
  Deduction chain table
  Quick/Exact modes | permalink | citations
```

### Competitor 8: PCCaseLab Free RAID Capacity Calculator

- URL: [pccaselab.com/free-raid-capacity-calculator](https://pccaselab.com/free-raid-capacity-calculator)
- Accessed: 2026-08-23, 1440 x 900, dark color scheme, standalone Playwright CLI
- Audience and promise: [Observed] NAS, server, and data-center builders comparing all RAID families, costs, filesystem gaps, rebuild risk, and drive models.
- Inputs and defaults: [Observed] Platform tabs for Standard RAID, Synology SHR, UnRAID, and ZFS or TrueNAS; drive model selector, custom size, drive count stepper, filesystem selector, and TB or TiB output.
- Action and state behavior: [Observed] The default state is 4 x 4 TB with a large result and a comparison table. Platform and unit buttons change the result. It is a live update surface.
- Results and visuals: [Observed] Usable storage is prominent, then raw capacity, OS report, efficiency, cost, fault tolerance, drive layout, and all-level comparison. SHR is one platform tab among many.
- Formula or data source: [Unknown] Formula labels and drive model data are visible, but the SHR mixed-drive implementation is not independently documented in the first result.
- Errors and edge behavior: [Unknown] Full invalid behavior was not probed.
- Mobile and accessibility: [Observed] Native controls and repeated result rows. [Unknown] The dense comparison table needs narrow verification.
- Privacy: [Unknown] Product links and cost data are visible; input handling is not clearly scoped in the result view.
- Performance: [Observed] Result appears immediately and updates with controls.
- Search-content structure: [Observed] H1 and tool appear before long RAID-level guides, recommendations, and related links.
- What works: Strong result hierarchy, unit toggle, and comparison for a broad storage audience.
- What fails: The tool is a generic RAID dashboard, and its product, price, rebuild, and filesystem content dilutes the SHR job.
- Do not copy: Generic platform breadth, product model cards, or risky rebuild guidance in the primary calculator.

```text
[Free RAID Capacity Calculator]
  [Standard RAID] [Synology SHR] [UnRAID] [ZFS]
  Drive model | custom size | count | filesystem | units
  [usable storage] [raw] [efficiency] [cost]
  Drive layout | all levels compared | product recommendations
```

## Comparison matrix

| Capability | Synology | StashRaid | Dalil Tech | SHRCalculator.com | IT Experts | TerabyteWise | Need to Know IT | PCCaseLab | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Per-drive mixed capacities | Preset counts only | Yes | Yes | Custom and preset counts | Yes | Mixed mode | Per-drive mode | Mostly model and custom size | High |
| SHR-1 and SHR-2 | Yes | Yes | Yes | Yes | Selectable | Yes | Yes | SHR platform | High |
| Explicit protection and unused split | Yes | Partial role view | Partial | Yes | Partial | Partial | Deduction chain | Partial | High |
| Tier or slicing explanation | Not visible in first result | Yes | Sentence and example | Short guide | Formula section | Guide | Collapsible explanation | Long RAID guide | High |
| System partition treatment | Approximately 10 GB per drive | Not prominent | Not prominent | Not prominent | Not prominent | Present in context | Explicit | Filesystem selector | Medium |
| Filesystem metadata | Note only, 4% Btrfs and 2% ext4 | No | No | No | No | Context | User controls | User controls | Medium |
| Decimal and binary units | Official binary wording | TB labels | TB and TiB | Capacity allocation | TB | TB and TiB | TB and TiB | TB and TiB | High |
| Primary action clarity | Live input | Live input | Live input | Live input | Live input | Live input | Quick or Exact | Live input | High |
| Share or save state | Not visible in first state | Share config | Copy and share link | Save configuration | Not visible | Not central | Permalink and copy | Not central | Medium |
| Focused SHR page | Yes, official | Yes | No, broad RAID tool | Yes | Yes, Spanish | No, broad NAS tool | No, broad RAID tool | No, broad RAID tool | High |
| Privacy boundary | Cookie prompt and vendor page | Unknown | Client-side claim | Basic analytics claim | Client-side claim | Unknown | Share actions | Unknown | High |
| Content density | High vendor notes | High | High | High | Medium | High | Very high | Very high | Low density is better |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| What does SHR-1 do with mixed drives? | Generic RAID tools use the smallest drive, while SHR tools use capacity tiers. | Synology live result plus official recommendation to use SHR for different capacities. | No. Launch the tier model and label the equation as inferred from official allocation output. |
| What does SHR-2 do with extra space on only one or two large drives? | Some tools fold all non-data capacity into protection; the official result exposes unused space separately. | Synology live 2 x 4 TB plus 2 x 8 TB result: approximately 7.2 TB available, 7.3 TB protection, 7.3 TB unused. | No. Keep protection and unused as separate exact accounting categories. |
| Should the result be raw pool capacity or data capacity after volume metadata? | Synology stops at available capacity and notes Btrfs/ext4 metadata; Need to Know IT adds filesystem, snapshots, and headroom. | Synology RAID Calculator notes and the page's documented 10 GB system reserve. | Yes, product must choose pool capacity as primary and keep filesystem metadata outside launch scope. |
| Are input labels decimal TB or binary TiB? | Competitors label both as TB, while some show both marketed TB and OS-reported TiB. | Repository storage engine contract and Synology's binary-calculation note. | No. Accept explicit TB and TiB units and show both output units. |
| Does a fresh-pool estimate describe a drive swap or expansion? | Competitors often present one generic result while community questions distinguish expansion history. | Synology add-drive documentation. | No. Launch supports fresh pool inventory only and says so beside the answer. |
| Should the tool recommend Synology models? | Official and shopping tools recommend compatible NAS models. | Synology calculator caveat that model support varies. | No. Compatibility and model recommendations are non-goals. |

## Evidence-backed opportunities

1. **Show the SHR tier accounting, not just the answer.** Mixed-drive users need to understand why the result is not ordinary RAID math. A compact exact table can show each capacity band, drives reaching it, data capacity, protection capacity, and unused capacity. This is more useful than a long article and avoids fake precision in a decorative chart.
2. **Separate pool capacity from volume reality.** Use a result hierarchy of raw capacity, estimated pool capacity, system reservation, protection, and unused space. Keep Synology's Btrfs and ext4 metadata note in the supporting guide, not in the formula output.
3. **Let users enter the drives they actually own.** A short repeatable drive-row editor with add, remove, unit, and capacity controls handles custom sizes and future high-capacity disks without a vendor preset ceiling.
4. **Make SHR-1 versus SHR-2 comparison immediate.** A two-tab or two-column result can show usable capacity and fault tolerance for the same inventory, with the mixed-drive accounting table updating for the selected level.
5. **Set a truthful fresh-pool boundary.** The page can earn trust by saying exactly what it estimates and what it cannot infer about an existing pool's expansion history, volume metadata, model limits, or real free space.
6. **Keep the page as one focused storage tool.** The market is crowded by generic RAID dashboards. A clean SHR-specific interface with a strong answer, exact accounting, and calm supporting content fits stack127's technical audience and the portfolio rule for useful technical calculators.

## Table stakes

- SHR-1 and SHR-2 modes with clear one-drive and two-drive fault-tolerance labels.
- Individual drive capacity input, mixed sizes, add and remove actions, and a useful default example without requiring a preset catalog.
- Raw capacity, estimated available pool capacity, protection, unused space, and explicit units.
- Invalid minimum configurations that cannot leave a stale result visible.
- A reset action and keyboard-complete interaction.
- A responsive result that keeps every label and value visible at 320 px and 375 px.
- Server-rendered h1, short purpose text, tool labels, and a concise limits section.
- Local calculation with no network request, account, or database requirement.
- An explicit statement that RAID redundancy is not a backup and that the estimate is for a fresh pool.

## Ideas to reject

- NAS model or drive recommendations: compatibility varies by model and is not part of the SHR capacity calculation.
- Filesystem, snapshot, compression, or headroom sliders: they create a second estimate with assumptions that the core tool cannot verify.
- Rebuild-time or second-failure probability claims: they require workload, hardware, and environmental assumptions beyond this tool's evidence.
- A generic RAID, ZFS, unRAID, or storage shopping dashboard: it dilutes the SHR job and is already common in the competitor set.
- A free-form existing-pool expansion simulator: expansion history and DSM rules need a separate authoritative contract.
- An always-on share URL or local storage: user drive inventory should stay in the browser unless the user explicitly asks to share it.
- A single percentage score or recommendation: capacity efficiency is not a complete safety or suitability judgment.
- Marker art for exact capacity: the result needs exact bars and tables, not a vague illustration.

## Open questions and blockers

- None for research readiness. The product stage must lock the versioned tier equation, the exact system-reserve convention, and whether the primary output defaults to decimal TB, binary TiB, or both. The evidence supports a fresh-pool estimate with separate protection and unused categories.

## Sources

- [Synology RAID Calculator](https://www.synology.com/en-uk/support/RAID_calculator), accessed 2026-08-23. Official live inputs, result categories, binary calculation note, system reserve, and volume metadata caveats.
- [Synology Knowledge Center: What RAID type is best for my storage?](https://kb.synology.com/en-ca/DSM/tutorial/What_RAID_type_is_best_for_my_storage), accessed 2026-08-23. Official SHR purpose and mixed-drive guidance.
- [Synology Knowledge Center: Add drives to expand the storage pool capacity](https://kb.synology.com/en-my/DSM/help/DSM/StorageManager/storage_pool_expand_add_disk?version=6), accessed 2026-08-23. Official expansion boundary and drive compatibility rules.
- [Synology Knowledge Center search for RAID calculator expansion](https://kb.synology.com/en-id/search?query=raid+calculator%2F1000), accessed 2026-08-23. Official expansion-calculation search result.
- [StashRaid SHR Calculator](https://stashraid.io/shr-calculator), accessed 2026-08-23. Operated per-drive interface and slicing explanation.
- [Dalil Tech RAID Calculator](https://dalil-tech.com/raid-calculator), accessed 2026-08-23. Operated mixed-drive mode, SHR choices, and comparison copy.
- [SHRCalculator.com](https://shrcalculator.com/), accessed 2026-08-23. Operated preset, custom, save, and allocation interface.
- [IT Experts RAID and SHR Calculator](https://www.itxperts.com.mx/herramientas/calculadora-raid-shr), accessed 2026-08-23. Operated Spanish mixed-drive calculator and client-side claim.
- [TerabyteWise Synology RAID Calculator](https://terabytewise.com/synology-raid-calculator), accessed 2026-08-23. Operated mixed SHR and TB/TiB planning interface.
- [Need to Know IT RAID and Synology SHR Calculator](https://needtoknowit.com.au/tools/raid-calculator/), accessed 2026-08-23. Operated detailed real-capacity deduction interface.
- [PCCaseLab RAID Capacity Calculator](https://pccaselab.com/free-raid-capacity-calculator), accessed 2026-08-23. Operated generic RAID platform tabs and result comparison.
- [Synology community: SHR Raid Calculator](https://community.synology.com/enu/forum/17/post/30423), accessed 2026-08-23. Repeated user demand and mixed-drive formula confusion.
- [Reddit: official calculator drive-size ceiling](https://www.reddit.com/r/synology/comments/1fsnsw3/i_made_a_calculator_for_synology_shr_capacity/), accessed 2026-08-23. User pain about newer drive sizes.
- [Reddit: mixed SHR-2 capacity](https://www.reddit.com/r/synology/comments/1f6jmj6/ds1821_max_shr2_storage_for_a_mix_of_18tb_20tb_24tb_drives/), accessed 2026-08-23. User pain about unused higher tiers.
- [Shared storage calculation engine contract](../../content_docs/storage-tools/calculation-engine.md), accessed 2026-08-23. Repository byte, unit, validation, and versioning constraints.

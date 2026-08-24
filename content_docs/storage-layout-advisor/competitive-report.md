# Competitive report: Storage Layout Advisor

Status: ready
Tool: Storage Layout Advisor
Route: `/storage-layout-advisor`
Researched: 2026-08-23
Direct competitors reviewed: 10
Saturation exception: no

## Research scope

### Current stack127 state

`/storage-layout-advisor` has no route, document folder, engine, or ownership manifest yet. The flat route is unused. The storage collection already has separate RAID capacity, ZFS capacity, RAIDZ padding, and RAIDZ expansion tools, so this page must own a different job: choosing and comparing a layout from a stated workload and risk goal, not duplicating one calculator. The shared `lib/storage` foundation already provides exact byte arithmetic, versioned calculator adapters, drive inventories, structured issues, source metadata, and URL-state codecs. The parent task owns any storage hub, sidebar, count, registry, and migration integration.

### Method and coverage

Four search shapes were used, then direct pages were opened and operated with the selected visual backend. The research worker's in-app Browser preflight found no connected instance. A default Chromium launch was blocked by the host sandbox, so the direct review used an escalated, read-only standalone Playwright CLI run against public pages. Safe probes used a 1280 by 900 viewport, a representative positive numeric value where the page exposed one, the first visible calculate or update action, and a negative value for browser validation where possible. No account, purchase, upload, or external side effect was triggered.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI with repository-local Playwright 1.60.0, escalated read-only Chromium launch
- Accessed: 2026-08-23, Asia/Kolkata

### Search saturation evidence

- Queries tried: `storage layout advisor calculator RAID ZFS choose array layout capacity fault tolerance`; `home NAS storage layout planner RAID calculator mixed drive sizes expansion`; `ZFS RAIDZ layout calculator vdev capacity mixed drives`; `storage array calculator common mistakes RAID layout advice`
- Repeated domains: vendor calculators and independent calculators were distinct. The repeated intent was capacity plus fault tolerance, with ZFS-specific pages adding vdev geometry and expansion.
- Exclusions: general RAID explainers, product reviews, recovery services, and forum discussions were used for technical context or user pain, not counted as direct competitors.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Choose a layout for a new NAS | `which RAID for 4 drives home NAS` | A capacity, protection, and workload tradeoff for a real drive count | Vendor guides, RAID calculators, forum advice |
| Compare ZFS pool topologies | `ZFS mirror vs RAIDZ2 capacity calculator` | A vdev-level comparison with the cost of parity and the failure boundary | ZFS calculators and TrueNAS documentation |
| Plan mixed-drive or future expansion | `RAID calculator mixed drive sizes future expansion` | What capacity is usable now, what is stranded, and whether later growth changes the topology | Synology, QNAP, and community calculators |
| Check the result before creating storage | `RAID layout calculator fault tolerance rebuild risk` | A result that does not confuse redundancy with backup or performance | Simple calculators, vendor caveats, forums |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Vendor calculators stop at a fixed drive-size list, especially for newer large disks. | [Synology calculator feedback thread](https://www.reddit.com/r/synology/comments/1fsnsw3/i_got_tired_of_the_synology_raid_calculator_not/) | Repeated in the post and replies | Accept arbitrary decimal and binary drive sizes instead of a vendor catalog. |
| ZFS capacity answers are hard to make exact because block geometry, metadata, compression, and workload change the result. | [ZFS capacity calculator discussion](https://www.reddit.com/r/zfs/comments/t3lgxl/zfs_capacity_calculator_tool_to_accurately/) | Repeated technical discussion and follow-up requests | Label estimates and show which assumptions drive them. Do not present one capacity number as live pool truth. |
| Users ask how vdev width, parity, mixed sizes, and expansion interact, not only how much raw capacity exists. | [ZFS layout discussion](https://www.reddit.com/r/zfs/comments/ihq4bi/zfs_with_an_unequally_sized_disk_mix_vdevs_raidz_and_other_potentially_horrible_ideas_to_increase_flexibility/) | Repeated across ZFS threads and calculators | Show topology and future-growth consequences beside the capacity result. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| RAID 0, 1, 5, 6, 10, 50, and 60 have different grouping and failure boundaries. | [Linux MD documentation](https://docs.kernel.org/admin-guide/md.html), [mdadm manual](https://man7.org/linux/man-pages/man8/mdadm.8.html) | Documented | Nested RAID tolerance is conditional on which subgroup fails, not one unconditional maximum. |
| RAIDZ parity level is the number of parity columns in a vdev, and the vdev is the failure boundary. | [OpenZFS RAIDZ documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html), [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) | Documented | A pool stripes across top-level vdevs, so a pool-level answer needs its vdev composition. |
| Smallest-member clipping and allocation geometry can reduce a theoretical answer. | [OpenZFS RAIDZ documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html), [OpenZFS source](https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c) | Documented / Inferred | Exact real capacity depends on block size, ashift, metadata, slop, compression, snapshots, and allocation history. Version 1 should separate a deterministic layout model from live-pool reporting. |
| A future expansion path is a layout property, not a promise from a capacity result. | [OpenZFS pool layout guide](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html), [zpool attach manual](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) | Documented | The advisor should state what it models and ask users to verify platform support. |
| Decimal TB and binary TiB are different byte quantities. | [OpenZFS Bits or Bytes](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Bits%20or%20Bytes.html) | Documented | Preserve exact bytes and offer both display units. |

## Competitor reviews

### Competitor 1: TrueNAS ZFS Capacity Calculator

- URL: https://www.truenas.com/docs/references/zfscapacitycalculator/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Plans TrueNAS storage before pool creation and compares usable capacity after redundancy and ZFS overhead.
- Inputs and defaults: [Observed] Total disks, repeated disk-size rows, minimum spares, slop, new vdev type, recordsize, vdev width, ashift, swap, decimal places, reservation, AFR, resilver assumptions, and display toggles. [Observed] Layout choices include mirror, RAIDZ1, RAIDZ2, RAIDZ3, and dRAID.
- Action and state behavior: [Observed] Uses an explicit Update action, Reset, help icons, tabs, and table-cell freeze behavior. [Observed] A valid numeric probe changed a value and Update refreshed the page; the empty state exposes configuration controls before results.
- Results and visuals: [Observed] Results are a matrix of configurations with usable capacity, efficiency, overhead, reservation, AFR, and resilver-related values. [Inferred] The table is exact enough for comparison but requires reading several columns to decide.
- Formula or data source: [Documented] The page says it accounts for redundancy and ZFS overhead and links to ZFS primer material. [Unknown] The public page does not make every calculation step or source version visible in the first result.
- Errors and edge behavior: [Observed] Fields are broad and form-driven; the generic probe did not expose a compact result-level error before the page refreshed.
- Mobile and accessibility: [Observed] The page is documentation-shell content with a dense calculator surface. [Unknown] Narrow result matrix behavior and complete keyboard path were not fully verified in this pass.
- Privacy: [Unknown] No clear local-only or network-handling statement was visible in the calculator result.
- Performance: [Observed] The page and calculator loaded in one navigation and computed locally after Update; no benchmark claim is made.
- Search-content structure: [Observed] Strong explanatory headings, quick configuration guide, related content, and linked documentation.
- What works: It exposes ZFS-specific inputs and expansion-oriented context.
- What fails: It is dense, vendor-specific, and asks for many settings before a newcomer can compare one simple answer.
- Do not copy: [Inferred] Do not copy the wide settings matrix, hidden help dependency, or vendor hardware branches for a universal advisor.

```text
TrueNAS documentation shell
  title and quick configuration guide
  [total disks] [new disk rows] [spares] [slop]
  [vdev type] [recordsize] [width] [ashift] ... [Update] [Reset]
  tabs and dense comparison table
  calculation values and related docs
```

### Competitor 2: Synology RAID Calculator

- URL: https://www.synology.com/en-global/support/RAID_calculator
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Helps Synology users choose drive counts and see RAID capacity, with model recommendations.
- Inputs and defaults: [Observed] HDD or SSD, a fixed list from 1 TB through 24 TB, per-slot drive counts, and reset. [Documented] The page warns about system partitions, filesystem metadata, drive compatibility, and expansion units.
- Action and state behavior: [Observed] Selecting drive rows updates the total count and result; the clean state starts at zero drives and has Reset. [Inferred] It behaves as a live selection tool rather than a single submit form.
- Results and visuals: [Observed] The result separates reserved system space and available capacity and shows RAID choices. [Unknown] The exact SHR allocation derivation is not exposed on the first screen.
- Formula or data source: [Documented] Synology states that available capacity is lower after system space and filesystem metadata. [Unknown] The page does not expose a versioned formula for every mixed-drive branch.
- Errors and edge behavior: [Observed] A numeric probe on a slot selection stayed browser-valid at zero, leaving the user to select a drive rather than showing a technical error.
- Mobile and accessibility: [Observed] The calculator is accessible in the page, but cookie and region prompts compete with the first interaction. [Unknown] Full narrow-width table and screen-reader behavior were not independently verified.
- Privacy: [Documented] The page exposes cookie and analytics consent UI. [Unknown] It does not clearly say whether calculations are local.
- Performance: [Observed] The calculator loaded and updated without a visible navigation.
- Search-content structure: [Observed] Short H1, one step heading, and notes below the tool.
- What works: It communicates the difference between raw, available, and system-reserved capacity for a specific platform.
- What fails: Fixed drive sizes and product recommendations make it unsuitable for arbitrary homelab planning.
- Do not copy: [Inferred] Do not copy the vendor catalog or model recommendation as a universal answer.

```text
Synology shell and cookie/region prompt
  RAID Calculator
  Step 1: select drives
  [HDD/SSD] [1 TB ... 24 TB] repeated drive rows
  total drives and Reset
  available capacity and model recommendations
  long notes on system space and metadata
```

### Competitor 3: QNAP RAID Calculator

- URL: https://www.qnap.com/en-us/selector/raid-selector?bay=6&hdd=none&raid=none
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Selects a QNAP NAS configuration by bay count, drive type, capacity, RAID level, and hardware filters.
- Inputs and defaults: [Observed] Six bays from the URL, HDD, capacity buttons from 1 TB to 24 TB, RAID selection, and many product filters. [Documented] QNAP notes model limits, maximum drives per RAID group, compatibility, and reference-only results.
- Action and state behavior: [Observed] The surface is a multi-step selector with live product result cards and filters. [Observed] A numeric probe on a drive control remained active without a dedicated Calculate action.
- Results and visuals: [Observed] Results prioritize recommended hardware models and filters rather than a clear capacity accounting answer.
- Formula or data source: [Documented] QNAP says it estimates storage utilization and that actual space can differ by system space and manufacturer.
- Errors and edge behavior: [Observed] The clean state returns six product matches and does not require a valid layout before showing recommendations.
- Mobile and accessibility: [Unknown] The dense product/filter surface was not fully checked at narrow width; the page exposes labelled search and menu controls.
- Privacy: [Documented] The page links privacy and terms but does not present a local calculation statement.
- Performance: [Observed] Product cards and filters loaded in the initial page.
- Search-content structure: [Observed] Three numbered input headings, then product recommendations and extensive support notes.
- What works: It connects storage choices to an actual appliance purchase.
- What fails: It answers “which QNAP should I buy?” more than “which layout fits my data and recovery plan?”.
- Do not copy: [Inferred] Do not couple the advisor to hardware catalog results or hide capacity under product cards.

```text
QNAP product selector shell
  1 - Drives: [bay count]
  2 - Select drive capacity: [HDD/SSD] [capacity]
  3 - Select RAID level
  preferred recommendation
  filter rail and product cards
  model and compatibility notes
```

### Competitor 4: Seagate RAID Capacity Calculator

- URL: https://www.seagate.com/products/nas-drives/raid-calculator/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Configures a storage setup and calculates capacity and redundancy.
- Inputs and defaults: [Observed] RAID type, HDD or SSD, and drive-size buttons from 1 TB through 16 TB. Layouts include JBOD, RAID 0, 1, 5, 6, 10, 50, and 60.
- Action and state behavior: [Observed] The page updates from drive selection; the clean result says to add drives. [Inferred] The primary action is implicit selection rather than an explicit submit.
- Results and visuals: [Observed] The result is a three-part visual area labelled Capacity, Protection, and Unused. [Documented] Explanatory text correctly calls out minimum drives, failure tolerance, and nested subgroup conditions.
- Formula or data source: [Documented] Seagate documents the layout semantics in the page copy and states that decimal capacity differs from operating-system reporting.
- Errors and edge behavior: [Observed] Clean state shows a missing-drive prompt. [Unknown] Mixed-size behavior beyond JBOD was not exposed in the first-screen controls.
- Mobile and accessibility: [Unknown] The vendor shell and selector were not fully inspected at 390px; buttons and headings were visible at desktop.
- Privacy: [Unknown] No local-only calculation statement was visible.
- Performance: [Observed] Initial page loaded and form content was interactive without an account.
- Search-content structure: [Observed] Strong H1, one description, layout-specific explanations, and a short result surface.
- What works: Its capacity, protection, and unused split is easy to scan.
- What fails: Preset sizes and vendor branding limit the planning model, and the visual does not explain topology.
- Do not copy: [Inferred] Do not copy the fixed drive-size palette or make “protection” a vague single number.

```text
Seagate product shell
  RAID Capacity Calculator
  [RAID type selector and explanation]
  [HDD] [SSD]
  [1 TB +] [2 TB +] ... [16 TB +]
  Results: Capacity | Protection | Unused
  decimal-capacity and product notes
```

### Competitor 5: RAID-CALC

- URL: https://raid-calculator.com/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Computes array characteristics from disk count, disk size, and RAID type.
- Inputs and defaults: [Observed] Number of disks, single disk size in TB, and a select containing RAID 0, 1, 1E, 5, 50, 5E, 5EE, 10, 6, and 60.
- Action and state behavior: [Observed] Uses an explicit Calculate submit button. [Observed] Submitting empty or negative-like input produced an error message and left the result as N/A.
- Results and visuals: [Observed] Capacity, speed gain, and fault tolerance are shown as simple result fields. [Unknown] “Speed gain” is not explained as a measured or modelled quantity on the first screen.
- Formula or data source: [Unknown] The page states supported RAID levels but does not cite a primary implementation source beside the calculator.
- Errors and edge behavior: [Observed] The invalid submit said disk size must be positive and at least two disks are required. [Observed] No plausible capacity remained after the error.
- Mobile and accessibility: [Unknown] The older form shell and result layout were not fully checked at narrow width; labels are present but compact.
- Privacy: [Unknown] No local-only statement was visible.
- Performance: [Observed] Submit returned a result or validation message in one page interaction.
- Search-content structure: [Observed] Short H1 and a few explanatory links, with little supporting guidance.
- What works: The explicit submit and invalid-state clearing are clear.
- What fails: Single-size input cannot represent a mixed inventory or topology, and “speed gain” invites false precision.
- Do not copy: [Inferred] Do not show performance scores without a precise model and source.

```text
RAID Calculator
  short explanation
  [number of disks] [single disk size, TB] [RAID type]
  [Calculate]
  Results: Capacity | Speed gain | Fault tolerance
  recovery and promotional links
```

### Competitor 6: jro.io OpenZFS Capacity Calculator

- URL: https://jro.io/capacity/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Plans OpenZFS pool capacity, including multiple vdev layouts and dRAID.
- Inputs and defaults: [Observed] Total disks defaulting to 24, add-disk size, minimum spares, vdev type, vdev width, recordsize, ashift, swap, reservation, disk AFR, compression/reduction toggles, units, and filters. Common layouts are precomputed for 4 TB through larger drive sizes.
- Action and state behavior: [Observed] Add Disk and Add Vdev Layout change the configuration; checkboxes and radios change the comparison table. [Observed] A positive probe and action control changed the live calculation surface.
- Results and visuals: [Observed] A large exact comparison table shows capacity, efficiency, overhead, reservation, and AFR. [Inferred] The table serves advanced users well but does not lead with a single goal-specific recommendation.
- Formula or data source: [Documented] The page identifies itself as an OpenZFS capacity calculator and explains assumptions in a long article. [Inferred] The many exposed settings imply a detailed model; exact implementation provenance is not visible beside every result.
- Errors and edge behavior: [Unknown] The page has many text fields and does not expose a compact invalid summary in the first screen.
- Mobile and accessibility: [Unknown] The table and controls were not fully checked at 320px; the page is likely table-width sensitive.
- Privacy: [Unknown] No local-only statement was visible in the observed first-screen text.
- Performance: [Observed] The page loaded a broad matrix with many precomputed rows; no benchmark claim was made.
- Search-content structure: [Observed] Clear tool title, dRAID section, closing thoughts, and common-layout table.
- What works: It models topology, vdev width, and several ZFS overhead choices rather than one parity formula.
- What fails: Too many knobs arrive before the reader has stated workload or risk tolerance.
- Do not copy: [Inferred] Do not expose AFR, compression, reservation, and resilver branches in the first version unless they change the user decision.

```text
OpenZFS capacity page
  [disks] [add disk] [spares] [vdev type] [width]
  [recordsize] [ashift] [swap] [reservation] [AFR] ...
  common layouts and many toggles
  wide comparison table by drive size
  closing notes
```

### Competitor 7: RAIDZ Calculator by ReclaiMe

- URL: https://www.raidz-calculator.com/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Computes ZFS RAIDZ pool characteristics from group count, disks per group, disk size, and group and combining array types.
- Inputs and defaults: [Observed] Number of disk groups, combining type, disks per group, single disk size in GB, and RAIDZ type including stripe, mirror, RAIDZ1, RAIDZ2, and RAIDZ3.
- Action and state behavior: [Observed] Uses an explicit Calculate submit. [Observed] Empty submit returned a clear error and retained N/A results.
- Results and visuals: [Observed] Results expose capacity, speed gain, and fault tolerance. [Unknown] The result does not show parity, padding, or per-vdev capacity accounting.
- Formula or data source: [Unknown] The page describes its input model but does not expose a versioned technical formula or primary OpenZFS source beside the result.
- Errors and edge behavior: [Observed] Empty or invalid input returned “at least one disk group and two disks are required” and withheld a result.
- Mobile and accessibility: [Unknown] The legacy form was not fully tested at narrow widths.
- Privacy: [Unknown] No local-only statement was visible.
- Performance: [Observed] A server-style form returned validation in one submit.
- Search-content structure: [Observed] H1, short “What is RAIDZ?” link, calculator, recovery copy, and credits.
- What works: It makes multi-vdev group count explicit, which many simple calculators omit.
- What fails: Its speed field is underspecified and its result does not distinguish the vdev failure boundary from pool striping.
- Do not copy: [Inferred] Do not blend capacity, speed, and fault tolerance into three unexplained numbers.

```text
RAIDZ Calculator
  short explanation
  [groups] [group combine type]
  [disks per group] [disk size, GB] [RAIDZ type]
  [Calculate]
  Results: Capacity | Speed gain | Fault tolerance
```

### Competitor 8: RAID and ZFS Capacity Calculator App

- URL: https://raidcalculator.app/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Models RAID and ZFS layouts, filesystem overhead, parity placement, and a visual result.
- Inputs and defaults: [Observed] Drive count, capacity per drive, unit, hot spares, layout, filesystem, and display units. It supports JBOD, RAID 0, 1, 5, 6, 10, 50, 60, ZFS stripe, mirror, striped mirrors, RAIDZ1, RAIDZ2, and RAIDZ3.
- Action and state behavior: [Observed] Results are live; Reset is a separate action. [Observed] A negative drive-count probe triggered native browser validation with a clear minimum message.
- Results and visuals: [Observed] It leads with usable capacity after redundancy and filesystem overhead, followed by an array visualizer and extensive explanatory sections.
- Formula or data source: [Documented] The page explains decimal versus binary units and filesystem choices. [Unknown] It does not make a primary implementation source or version visible in the result.
- Errors and edge behavior: [Observed] Native constraints block invalid counts before a result. [Inferred] Live recalculation reduces submit friction but can make intermediate states look authoritative.
- Mobile and accessibility: [Unknown] The result visual and long text were not fully checked at narrow width; labelled native controls are present.
- Privacy: [Unknown] No clear local-only statement was visible in the observed first-screen text.
- Performance: [Observed] Live results appeared in the initial page without a request or account.
- Search-content structure: [Observed] Numbered configure, capacity, and visualizer headings, followed by RAID and ZFS explanatory sections.
- What works: It is the closest direct competitor to an answer-first, cross-technology surface and uses a real visual relationship.
- What fails: It supports a large feature set but does not ask what the user values before presenting the answer.
- Do not copy: [Inferred] Do not copy filesystem-specific overhead presets or an unqualified effective-capacity estimate into an advisor decision.

```text
Array Capacity Calculator
  01 Configure Array
  [drives] [capacity] [unit] [spares] [layout] [filesystem] [display unit]
  02 Usable Capacity
  large capacity result and breakdown
  03 Array Visualizer
  long technical guide
```

### Competitor 9: SHR Calculator

- URL: https://shrcalculator.com/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Plans Synology RAID and SHR storage with larger and custom drive sizes.
- Inputs and defaults: [Observed] Per-slot selects from 0 through 36 TB, custom drive size and unit, custom drive count, and optional configuration save/share actions.
- Action and state behavior: [Observed] Slot selections update the result live. Save Configuration and Copy share link are visible secondary actions, while Reset restores drive selections.
- Results and visuals: [Observed] The page exposes RAID results and a storage allocation section. [Unknown] The exact SHR allocation steps are not visible in the first screen.
- Formula or data source: [Inferred] The page is designed to extend the official Synology calculator and support larger sizes; the community thread records that motivation and reports algorithm feedback.
- Errors and edge behavior: [Unknown] No compact invalid state was exposed by the generic probe; many zero-valued select controls make the clean state verbose.
- Mobile and accessibility: [Unknown] The long list of slot selects and result allocation were not fully checked at narrow width.
- Privacy: [Unknown] Save and share controls make state handling important, but no clear storage policy was visible in the first-screen text.
- Performance: [Observed] Live updates did not require a visible navigation.
- Search-content structure: [Observed] Clear headings for Select Drives, Add Custom Drive Size, RAID Results, and RAID Storage Allocation.
- What works: It answers the large-drive and custom-size gap documented in the community thread.
- What fails: The slot-by-slot form is long, and SHR is Synology-specific rather than a universal storage decision model.
- Do not copy: [Inferred] Do not copy share or save semantics without a deliberate privacy contract and versioned state.

```text
Select Drives
  many [drive-size selects]
  Add Custom Drive Size
  [size] [unit] [count] [Add Custom Drive]
  [Reset] [Save Configuration] [Copy]
  RAID Results and Storage Allocation
```

### Competitor 10: Simple Tools Hub ZFS RAIDZ Calculator

- URL: https://simpletoolshub.com/zfs-raidz-capacity-calculator/
- Accessed: 2026-08-23, viewport 1280x900, status 200.
- Audience and promise: [Observed] Models one or more identical-vdev ZFS pools and shows capacity before and after a slop reservation, with an optional compression estimate.
- Inputs and defaults: [Observed] vdev type default RAIDZ2, disks per vdev default 6, identical vdevs default 1, drive size default 4 TB, unit, and expected compression ratios from 1.0x to 10x.
- Action and state behavior: [Observed] Results update live. FAQ questions are accordion buttons. [Observed] Changing a numeric field from 6 to 4 updated the result and a negative value triggered native validation.
- Results and visuals: [Observed] It leads with total disks, data disks, parity disks, raw capacity, usable capacity, post-reservation capacity, effective compression capacity, efficiency, and failures tolerated per vdev.
- Formula or data source: [Documented] The page labels the result as an estimate and explains slop, padding, compression, and TB versus TiB. [Unknown] It does not provide a versioned primary source for every estimate.
- Errors and edge behavior: [Observed] Native min constraints block negative or zero values; [Observed] the result remains a readable structured estimate for valid values.
- Mobile and accessibility: [Unknown] The accordion and result layout were not fully checked at 390px; native controls and headings are present.
- Privacy: [Observed] The page explicitly says the calculation runs locally and nothing is uploaded.
- Performance: [Observed] Live calculation appeared immediately on input changes.
- Search-content structure: [Observed] H1, calculator, pool-capacity result, planning guide, and a large FAQ section.
- What works: It connects a simple result to relevant ZFS caveats and clearly labels estimated effective capacity.
- What fails: Compression presets can look like a capacity promise, and identical-vdev scope excludes many real mixed pools.
- Do not copy: [Inferred] Do not multiply a modelled compression ratio into the main recommendation; keep it optional and visibly conditional.

```text
ZFS RAIDZ Pool Capacity Calculator
  intro and local-browser statement
  [vdev type] [disks/vdev] [vdev count]
  [drive size] [unit] [compression ratio]
  Pool capacity: raw | usable | reserve | effective | efficiency
  planning guide and FAQ accordions
```

## Comparison matrix

| Capability | TrueNAS | Synology | QNAP | Seagate | RAID-CALC | jro.io | RAIDZ Calc | App | SHR | Simple Tools | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Arbitrary drive sizes | Partial | No, preset list | Partial | No, preset list | One size | Custom rows | One size | One size | Custom size | One size | High |
| Mixed-drive inventory | Rows | Slot list | Product selector | Limited | No | Rows | No | No | Slot list | Identical vdevs | High |
| Cross-technology comparison | ZFS only | Synology RAID/SHR | QNAP RAID | RAID | RAID | ZFS | RAIDZ | RAID and ZFS | SHR/RAID | ZFS RAIDZ | High |
| Workload or goal input | Indirect settings | No | Hardware filters | No | No | No | No | Filesystem proxy | No | Compression proxy | High |
| Topology visible | Table columns | Limited | Product context | No | No | Vdev layouts | Group count | Visualizer | Allocation | Vdev summary | High |
| Failure boundary | RAIDZ and AFR settings | Notes | Notes | Protection area | Fault tolerance field | AFR option | Fault tolerance field | Layout labels | Allocation context | Per-vdev failures | High |
| Expansion path | Shelf and new vdev | Expansion notes | Expansion devices | No | No | Add vdevs | Group model | No | No | FAQ caveat | High |
| Exact assumptions | Many, spread across help | Vendor notes | Reference-only notes | Vendor notes | Sparse | Many settings | Sparse | Filesystem presets | Sparse | Strong caveats | High |
| Explicit invalid state | Unknown | Selection state | Selection state | Missing-drive prompt | Yes | Unknown | Yes | Native constraints | Unknown | Native constraints | High |
| Local privacy statement | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Yes | Medium |
| Primary answer scanability | Low to medium | Medium | Low | Medium | Medium | Low | Medium | High | Medium | High | High |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Is capacity a single number or a range of modelled values? | Vendor pages show available capacity after vendor overhead. ZFS pages expose slop, padding, reservation, and sometimes compression. | [TrueNAS calculator](https://www.truenas.com/docs/references/zfscapacitycalculator/), [OpenZFS RAIDZ docs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | Yes, product planning must separate deterministic layout math from estimates. |
| What does mixed drive size mean? | Synology and SHR expose per-slot sizes. RAID calculators usually use one size. ZFS discussions warn that vdev composition and smallest-member effects matter. | [Synology notes](https://www.synology.com/en-global/support/RAID_calculator), [ZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) | Yes, choose a bounded inventory model and expose stranded capacity. |
| Can a tool recommend one layout? | Vendor copy uses audience-specific recommendations. Community discussions ask for “best” layouts but also show workload and failure placement differences. | [TrueNAS quick guide](https://www.truenas.com/docs/references/zfscapacitycalculator/), [ZFS layout discussion](https://www.reddit.com/r/zfs/comments/1fsnsw3/curious_about_thoughts_on_vdev_layouts/) | Yes, the advisor should rank explicit tradeoffs, not claim universal best. |
| What does fault tolerance mean for nested layouts? | RAID 10, 50, 60 and ZFS pools can survive different failures depending on subgroup or vdev placement. | [Seagate RAID explanations](https://www.seagate.com/products/nas-drives/raid-calculator/), [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) | Yes, result must show guaranteed tolerance and topology-dependent cases separately. |
| Does expansion mean adding a disk to the existing geometry? | OpenZFS expansion and vendor expansion units are platform-specific. | [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html) | Yes, limit version 1 to planning future layout choices and state that live expansion support must be verified. |

## Evidence-backed opportunities

1. **Lead with a decision table, not a capacity headline**: Every competitor can produce capacity. Few connect explicit workload, minimum protection, drive inventory, and future growth to comparable layout rows. The tool can earn preference by showing the tradeoff and the reason without pretending to know a universal best layout.
2. **Accept the drives users actually own**: Preset drive lists are a repeated limitation. A compact inventory with arbitrary decimal or binary sizes can expose mixed-size clipping and make the answer useful before purchase or during an upgrade.
3. **Make the failure boundary visible**: The useful answer is not “two drives” alone. Show whether the protection is per array, per mirror pair, per parity group, or per ZFS vdev, and keep backup outside the redundancy verdict.
4. **Separate deterministic math from conditional estimates**: Exact byte accounting belongs in the result. Filesystem overhead, compression, AFR, rebuild time, and live-pool free space need either an explicit model or an `Unknown` boundary.
5. **Treat future growth as a first-class choice**: A small initial mirror layout, a wider parity vdev, separate vdevs, and a platform-specific expansion path have different consequences. A short future-growth comparison can resolve a real decision that the existing calculators leave to prose.

## Table stakes

- Accept a drive count or a compact mixed-drive inventory with exact units.
- Compare common layouts across RAID and ZFS without a vendor product catalog.
- Show raw, usable, redundancy, mismatch or stranded capacity, and guaranteed failure tolerance.
- Show topology or grouping whenever failure placement changes the answer.
- Use one explicit primary action if the calculation is not safely live.
- Clear stale results after an invalid edit and give a recovery path.
- Preserve exact bytes, show TB and TiB, and state assumptions beside the result.
- Keep the calculation local and state whether an explicit share link exposes inputs.
- Offer a clean base URL and versioned state only for deliberate sharing.

## Ideas to reject

- **Universal “best layout” score**: It promises judgment the inputs cannot safely establish. Workload, backup, platform, and failure domain remain user decisions.
- **Performance or AFR prediction in the main result**: The inspected tools expose speed or AFR with uneven model transparency. Include no score until the sources and uncertainty are explicit.
- **Vendor model recommendations**: They turn a layout advisor into a product selector and do not serve a universal homelab audience.
- **Exact live filesystem capacity**: A user-side calculator cannot know allocation history, metadata, snapshots, compression, or platform reservation without a live system query.
- **Large catalog of drive presets**: It creates maintenance cost and excludes new drive sizes. Use arbitrary input and sensible examples.
- **FAQ-first page**: The live comparison and topology should answer the primary job. Supporting content can handle only the confusing boundaries left by the UI.

## Open questions and blockers

- Research backend limitation: SearXNG was not configured, so Bing and DuckDuckGo were not separately queried.
- In-app Browser was unavailable. The ten competitor pages were operated with standalone Playwright CLI and the exact backend, viewport, and access date are recorded above.
- Product planning must decide the initial layout set and the bounded recommendation rubric. The evidence supports a comparison advisor, but not a universal best-layout verdict.

## Sources

- [OpenZFS RAIDZ documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html), accessed 2026-08-23. RAIDZ parity and geometry.
- [OpenZFS VDEVs documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html), accessed 2026-08-23. Pool and vdev failure boundaries.
- [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html), accessed 2026-08-23. Expansion and layout changes.
- [OpenZFS zpool attach manual](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html), accessed 2026-08-23. Attach and expansion behavior.
- [Linux MD RAID documentation](https://docs.kernel.org/admin-guide/md.html), accessed 2026-08-23. Linux RAID personalities and array behavior.
- [mdadm manual](https://man7.org/linux/man-pages/man8/mdadm.8.html), accessed 2026-08-23. RAID levels, grouping, and layout details.
- [TrueNAS ZFS Capacity Calculator](https://www.truenas.com/docs/references/zfscapacitycalculator/), accessed 2026-08-23. Operated competitor and documented settings.
- [Synology RAID Calculator](https://www.synology.com/en-global/support/RAID_calculator), accessed 2026-08-23. Operated competitor and vendor caveats.
- [QNAP RAID Calculator](https://www.qnap.com/en-us/selector/raid-selector?bay=6&hdd=none&raid=none), accessed 2026-08-23. Operated competitor and reference-only limits.
- [Seagate RAID Capacity Calculator](https://www.seagate.com/products/nas-drives/raid-calculator/), accessed 2026-08-23. Operated competitor and layout explanations.
- [RAID-CALC](https://raid-calculator.com/), accessed 2026-08-23. Operated competitor and invalid-state probe.
- [OpenZFS Capacity Calculator by jro.io](https://jro.io/capacity/), accessed 2026-08-23. Operated competitor and vdev comparison surface.
- [RAIDZ Calculator](https://www.raidz-calculator.com/), accessed 2026-08-23. Operated competitor and multi-group input model.
- [RAID and ZFS Capacity Calculator App](https://raidcalculator.app/), accessed 2026-08-23. Operated competitor and live validation probe.
- [SHR Calculator](https://shrcalculator.com/), accessed 2026-08-23. Operated competitor and large-drive gap.
- [Simple Tools Hub ZFS RAIDZ Calculator](https://simpletoolshub.com/zfs-raidz-capacity-calculator/), accessed 2026-08-23. Operated competitor and local-privacy statement.

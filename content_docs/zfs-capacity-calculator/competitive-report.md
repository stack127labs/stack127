# Competitive report: ZFS Pool Capacity Calculator

Status: ready
Tool: ZFS Pool Capacity Calculator
Route: `/zfs-capacity-calculator`
Researched: 2026-08-03
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

- [Observed, updated 2026-08-04] The tool now exists at the stable route `/zfs-capacity-calculator` with a page manifest, page-owned tests, a pure `bigint` engine, guarded local preview, versioned share state, and a page-specific OpenZFS receipt checker.
- [Observed, updated 2026-08-04] The editor supports a fast equal-drive setup and keeps every drive individually editable for mixed capacities. Results separate top-level vdevs, writable capacity, planning target, auxiliary inventory, allocation losses, formula metadata, and a placeholder-only dry-run command.
- [Documented] The roadmap scope includes multiple top-level mirror and RAIDZ1/2/3 vdevs; distinct data, hot-spare, SLOG, L2ARC, and special roles; `ashift`, `recordsize`, optional `volblocksize`, and a user planning reserve; separate physical and compression scenarios; per-vdev results before the pool total; and conservative command placeholders.
- [Documented] The roadmap expressly forbids exact promises for `zpool`, `zfs`, quota, or application-visible capacity. It requires OpenZFS 2.3 and 2.4 sparse-pool fixtures before completion because RAIDZ expansion and capacity heuristics changed across those releases.
- [Observed] The `/storage-tools` collection exists, but it and its tools are independently unpublished pending their own readiness checks and explicit approval. Research does not change publication state.
- [Inferred] This is a good stack127 surface because it performs a real technical calculation over user-supplied pool topology. Its defensible value is not another `(drives - parity) × size` widget; it is an auditable planning model that separates physical inventory, allocation estimates, operational reserve, and logical compression scenarios.

### Post-build benchmark and decisions

The completed local UI was rechecked on 2026-08-04 against current TrueNAS, HexOS, 45Drives, Simple Tools Hub, and Professional Calculators behavior. A controlled fixture used two six-drive RAIDZ2 vdevs with twelve 18 TB drives, `ashift=12`, and a 128 KiB block model.

| Tool | Observed capacity result | Important interpretation |
| --- | --- | --- |
| stack127 | 196.45 TiB entered, 130.84 TiB estimated writable, 104.67 TiB planning target | Separates parity, capped slop, and user headroom. |
| TrueNAS | About 130.71 TiB equivalent | Very close to stack127 for the controlled fresh-pool fixture. |
| HexOS | 130.84 TiB usable, 104.57 TiB recommended maximum | Closest displayed match and the best competing common-case input flow. |
| Simple Tools Hub | 126.78 TiB | Lower result from an uncapped percentage deduction. |
| 45Drives | 128.24 TiB | Lower result from a larger modeled slop deduction. |
| Professional Calculators | 135 TB after a fixed 6.25% deduction | Coarser formula and different unit/accounting presentation. |

The benchmark supports the current engine direction. The remaining improvements were applied to presentation and workflow rather than changing the formula: semantic allocation colors, one-action equal-drive setup, individually editable mixed-drive rows, a first-class planning target, zero-loss disclosure, and a compact five-section guide with primary OpenZFS links. Nearby-width recommendations remain deferred because they would add a second decision model and require their own product and fixture contract.

The route remains unpublished. Real OpenZFS 2.3 and 2.4 sparse-pool receipts are still required before production; no receipt is inferred from competitor agreement.

### Method and coverage

- [Observed] Search coverage used four required query shapes: exact phrase (`"ZFS pool capacity calculator"`), user job (`how much usable space ZFS pool RAIDZ calculator`), specialist variation (`RAIDZ capacity calculator ashift recordsize`), and pain/edge case (`ZFS calculator mixed drive sizes overhead slop space`). Follow-up searches covered `zpool list` versus `zfs list`, small blocks, mixed disks, special vdev sizing, and RAIDZ expansion.
- [Observed] Eight direct calculators were opened and operated in the in-app Browser on 2026-08-03. Desktop inspection used a 1280 × 720 viewport. Responsive checks used 390 × 844. Each accessible calculator received a valid non-default scenario and an invalid or boundary probe; unit or small-block paths were also exercised where exposed.
- [Observed] The common comparison fixture was a RAIDZ2 design with 18 TB disks, varied to match each tool's input model. Additional probes covered multiple identical vdevs, mixed top-level vdev types, RAIDZ3 below minimum width, GB/TB switching, 4 KiB records, compression, spares, SLOG, and L2ARC.
- [Observed] Technical claims were checked against current OpenZFS documentation and man pages. Community discussions were used only to establish recurring user pain, not as formula authority.
- [Observed] The Virtualization Howto calculator accepted edited values, but its Calculate control was difficult to activate through semantic automation and a direct visual click produced no exposed result state. Its inputs and interaction friction are documented; its result formula remains unknown.
- [Observed] The Virtualization Howto and Simple Tools Hub URLs returned `about:blank` when revisited under the temporary 390 px viewport, after both had worked at desktop width. Their mobile behavior is therefore recorded as unknown rather than inferred from desktop markup.

### Search saturation evidence

- Queries tried: `"ZFS pool capacity calculator"`; `how much usable space ZFS pool RAIDZ calculator`; `RAIDZ capacity calculator ashift recordsize`; `ZFS calculator mixed drive sizes overhead slop space`; OpenZFS-specific source queries for RAIDZ allocation, slop, special vdevs, commands, space accounting, and expansion; community queries for `zpool list`/`zfs list` discrepancies and calculator disagreements.
- Repeated domains: `jro.io`, `45drives.com`, `zfs-calculator.com`, `raidz-calculator.com`, `professionalcalculators.com`, `virtualizationhowto.com`, `servnetuk.com`, and `simpletoolshub.com` repeatedly appeared as direct tools. `reddit.com/r/zfs`, TrueNAS forums, Server Fault, and OpenZFS GitHub repeatedly appeared for confusion and edge cases.
- Exclusions: Generic RAID calculators that merely rename RAID6 as RAIDZ2; translated clones of RAIDZ Calculator; articles without an operable calculator; NAS/vendor capacity tools that do not model ZFS; and duplicate route variants on the same calculator were excluded as non-direct or duplicate competitors.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Quick usable-capacity estimate | `ZFS pool capacity calculator` | Enter disks, width, and parity; see a realistic usable range | Simple live calculator or vendor lead-generation tool |
| Explain a surprising installed result | `why is zpool list bigger than zfs list` | Reconcile raw, parity-adjusted, slop-adjusted, and dataset-visible values | Forums, man pages, long explanatory articles |
| Compare vdev layouts before buying drives | `6 wide vs 10 wide RAIDZ2 capacity` | See capacity, efficiency, and failure boundary per vdev | Large comparison tables or advanced calculators |
| Model block-size overhead | `RAIDZ ashift recordsize capacity calculator` | Understand why small records/zvol blocks consume more space | jro.io, 45Drives, Servnet, technical write-ups |
| Plan a mixed or expanded pool | `ZFS mixed vdev capacity calculator` | Add different top-level vdev layouts and capacities without flattening them | Rare advanced tools; most competitors only repeat identical groups |
| Size auxiliary devices correctly | `does SLOG L2ARC special vdev add ZFS capacity` | Separate inventory cost from general writable capacity and understand permanence | Documentation and forum answers; almost no capacity calculator models the roles correctly |
| Budget safe headroom | `how full should a ZFS pool be` | See physical estimate separately from an explicit user-selected operating reserve | Some tools hard-code 20%; others expose a percentage; many conflate reserve with filesystem overhead |
| Estimate logical compression scenario | `ZFS compression capacity calculator` | Compare physical writable bytes with a clearly conditional logical-data scenario | A few calculators multiply capacity by a selected ratio; source and uncertainty are often weak |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| `zpool list` and `zfs list` show very different numbers | [r/zfs: Zpool List Not Showing Proper Pool Size](https://www.reddit.com/r/zfs/comments/bp0fcn/), [r/zfs: Wrong(?) pool capacity](https://www.reddit.com/r/zfs/comments/1iiywrp/), [TrueNAS forum: pool size](https://forums.truenas.com/t/truenas-not-reporting-correct-zfs-pool-size/48552) | Repeated across years and tools | Results must name the accounting layer and never present one unlabeled “usable” number. |
| Parity subtraction still overstates available capacity | [r/zfs: Zpool smaller than anticipated](https://www.reddit.com/r/zfs/comments/18uczf9/), [r/zfs: Space discrepancy](https://www.reddit.com/r/zfs/comments/10xk0zs/) | Repeated | Show parity/mirror allocation, RAIDZ padding estimate, and slop separately. |
| Small `recordsize`/`volblocksize` and `ashift` change RAIDZ efficiency dramatically | [r/zfs: Confused about ashift and free space](https://www.reddit.com/r/zfs/comments/kkbqm8/), [OpenZFS issue #967](https://github.com/openzfs/zfs/issues/967), [TrueNAS overhead discussion](https://forums.truenas.com/t/zfs-overhead-query-for-1mb-record-sizes-48x-4tb-layout-recommendation/44067) | Repeated specialist pain | Advanced inputs must affect the calculation and the UI must explain why; decorative settings are worse than omitting them. |
| Mixed drive sizes are misunderstood | [r/zfs: different-size disks](https://www.reddit.com/r/zfs/comments/dm4up6/) | Repeated | Model every drive or clearly apply the smallest-member limit per vdev, then expose stranded capacity. |
| Users want to compare widths and “best per disk” efficiency | [r/truenas calculator discussion](https://www.reddit.com/r/truenas/comments/t3lqoq/) | Repeated in planning discussions | Preserve the entered topology as the primary result, then offer a small comparison of nearby valid widths rather than a giant generic table. |
| Existing precise calculators are hard for beginners to read | [r/truenas: beginner cannot make heads or tails of jro.io](https://www.reddit.com/r/truenas/comments/xql093/) | Occasional but direct | Progressive disclosure is required: a scannable pool result first, with audit detail and formulas behind it. |
| Compression is treated as guaranteed extra physical capacity | [OpenZFS compression documentation](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html), [r/zfs: actual free space](https://www.reddit.com/r/zfs/comments/16ewhs6/) | Repeated conceptual confusion | Keep physical writable capacity unchanged; show compression only as a labeled logical-data scenario with user-owned assumptions. |
| Special-vdev sizing and permanence are underestimated | [OpenZFS discussion #15255](https://github.com/openzfs/zfs/discussions/15255), [OpenZFS special vdev docs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Special%20vdev.html) | Repeated specialist risk | Treat special capacity as a separate allocation class, require redundancy guidance, and warn that it may be permanent on RAIDZ pools. |
| RAIDZ expansion produces old/new accounting surprises | [OpenZFS discussion #15232](https://github.com/openzfs/zfs/discussions/15232), [r/zfs: expanded pool AVAIL](https://www.reddit.com/r/zfs/comments/1tpg0t4/raidz2_expansion_pool_has_expanded_but_space/) | Emerging but material | Do not imply a single steady-state ratio for expanded pools; fixtures must distinguish pre-expansion and newly written blocks. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| RAIDZ physical allocation depends on vdev width, parity count, sector size (`2^ashift`), and the block being allocated | [OpenZFS RAIDZ space efficiency](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | Documented | A 4 KiB record on ashift 12 can have mirror-like efficiency; simple `(N-P)/N` math is only an upper-level parity view. |
| A RAIDZ group needs at least one more child than its parity count | [OpenZFS zpoolconcepts](https://openzfs.github.io/openzfs-docs/man/v2.0/8/zpoolconcepts.8.html) | Documented | Minimum widths: Z1 2, Z2 3, Z3 4. The UI may recommend wider layouts but must not invent a stricter validity rule. |
| A pool may contain multiple top-level vdevs; failure tolerance remains a per-vdev boundary | [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) | Documented | Pool totals must follow per-vdev results. “Up to six drives” is misleading without “only if failures are spread across vdevs.” |
| The normal slop reserve defaults to 1/32, with 128 MiB minimum and 128 GiB maximum | [OpenZFS module parameters](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html), [zfs.4](https://openzfs.github.io/openzfs-docs/man/v2.4/4/zfs.4.html) | Documented | It is a pool/module accounting reserve, not a universal uncapped 3.125% deduction. It can be tuned and should be labeled as an estimate/configuration. |
| `zpool` physical-space properties and dataset-available space are different accounting layers | [OpenZFS zpool properties](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html), [zfs-list](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-list.8.html) | Documented | The current `usable` pool property is itself a fixed-128 KiB heuristic and explicitly not exact. |
| Hot spares, cache/L2ARC, and log/SLOG devices are not ordinary data capacity | [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html), [Caching and Auxiliary Devices](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Caching.html) | Documented | Show their physical inventory/cost separately. SLOG only serves synchronous intent-log traffic; L2ARC is a second copy. |
| A special vdev permanently stores selected block classes and must be redundant | [OpenZFS special vdev](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Special%20vdev.html) | Documented | Losing it loses the pool. On a pool with RAIDZ top-level vdevs, removal is not available under the documented constraints. |
| Compression changes physical allocation only when actual blocks compress enough after sector/threshold rounding | [OpenZFS compression](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html) | Documented | A user-entered ratio can support a scenario, never a guaranteed physical-capacity result. |
| `recordsize` applies to filesystems while `volblocksize` applies to zvols | [OpenZFS workload tuning](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html) | Documented | The input should change with workload mode; exposing both simultaneously without context adds ambiguity. |
| A conservative `zpool create` command can be generated from explicit vdev roles | [OpenZFS zpool-create](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-create.8.html) | Documented | Use placeholders and a non-executing preview. Do not infer device paths, erase flags, or platform-specific partitions. |
| RAIDZ expansion leaves old blocks at their original data-to-parity ratio; new blocks use the wider ratio | [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html), [zpool-attach](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) | Documented | An expanded-pool estimator needs versioned fixtures and cannot reconstruct exact historical allocation from topology alone. |
| Partition, label, swap, and metaslab deductions can be identical across platforms | Platform-specific implementation | Unknown | These deductions depend on OS/distribution and disk preparation. The calculator should either expose a clearly labeled per-drive reservation or omit fake universal precision. |

## Competitor reviews

### Competitor 1: RAIDZ Calculator by ReclaiMe

- URL: https://www.raidz-calculator.com/
- Accessed: 2026-08-03
- Audience and promise: [Observed] A minimal planner promising capacity, speed gain, and fault tolerance for stripe, mirror, and RAIDZ1/2/3 groups.
- Inputs and defaults: [Observed] Blank number of disk groups, group-combining type defaulting to stripe, blank disks per group, blank single-disk size in GB, and RAIDZ type defaulting to stripe.
- Action and state behavior: [Observed] Explicit Calculate postback. A valid fixture of 2 groups × 6 disks × 4,000 GB RAIDZ2 returned 32,000 GB, “up to 8x” reads, and two-drive tolerance per set. Inputs persisted after submission.
- Results and visuals: [Observed] Three plain table rows: capacity, speed gain, and fault tolerance. No TB/TiB conversion, raw/parity breakdown, slop, padding, per-vdev panel, or visual capacity allocation.
- Formula or data source: [Inferred] The capacity result is repeated-group parity subtraction: `groups × (drives - parity) × disk GB`. No formula, source, version, rounding rule, or ZFS-overhead documentation is published on the tool.
- Errors and edge behavior: [Observed] Blank initial fields show N/A. The valid case worked. Field markup exposes no semantic labels or documented bounds; invalid-width behavior is not explained in the UI.
- Mobile and accessibility: [Observed] At 390 × 844 there was no horizontal document overflow, but the legacy two-column table kept 163 px inputs at x=199. Headings are repeatedly marked as h1, controls lack accessible names in the snapshot, and the result table has no modern responsive hierarchy.
- Privacy: [Unknown] No calculator-specific local-processing or privacy statement was present. The page promotes the vendor's recovery product.
- Performance: [Observed] The small legacy page loaded and posted a result without visible heavy application state; calculation caused a full navigation/postback.
- Search-content structure: [Observed] Title: “Free RAIDZ Calculator - Caclulate ZFS RAIDZ Array Capacity and Fault Tolerance.” H1s include RAIDZ Calculator, Input, Results, RAIDZ Recovery, and Credits. The misspelling “Caclulate” is in the title.
- What works: Very low input burden and a clear explicit action.
- What fails: It is RAID arithmetic wearing ZFS terminology; capacity and performance claims are too coarse for planning a real pool.
- Do not copy: The nested table layout, recovery-product funnel, unlabeled controls, multiple h1s, or unqualified speed multiplier.

```text
[RAIDZ Calculator | nav links]
[one-sentence promise]
[Input table]
  groups         [   ]
  combine        [stripe v]
  disks/group    [   ]
  disk size GB   [   ]
  RAIDZ type     [     v]
  [Calculate]
[Results table: capacity | speed | tolerance]
[recovery sales content]
```

### Competitor 2: 45Drives ZFS / RAIDZ Capacity Calculator

- URL: https://www.45drives.com/zfs/zfs-calculator/ (calculator iframe: https://zfs-calc.45d.io/)
- Accessed: 2026-08-03
- Audience and promise: [Observed] A vendor planner promising TB/TiB capacity, RAIDZ parity, sector overhead, slop, and recommended free-space planning.
- Inputs and defaults: [Observed] RAID type RAIDZ1; 0.5 TB drive; 4 KiB sector; 5 drives/group; 1 group; fixed disabled 128 KiB record size; slop enabled; optional 20% free-space limit disabled.
- Action and state behavior: [Observed] Explicit Calculate. Semantic clicks intermittently timed out, but the visible DOM action worked. A 2 × 10-wide RAIDZ2 pool of 18 TB drives returned 360 TB raw, 288 TB parity-adjusted, 7.2 TB slop, and 280.8 TB practical capacity.
- Results and visuals: [Observed] A compact three-column table in TiB, TB, and percent. It separates raw, zpool usable, slop, ZFS usable, minimum free space, and practical usable; explanatory lists define each output.
- Formula or data source: [Documented] Page copy says parity/padding, disk conversion, and slop are modeled and defines slop as 1/32. [Observed] The tested result instead deducted 7.2 TB (2.5% of the 288 TB parity-adjusted capacity), not 1/32, while its percent column also showed 2.50. No implementation source was linked.
- Errors and edge behavior: [Observed] Setting RAIDZ2 to 2 drives produced no live error and left the previous result visible. The number inputs exposed no `min`/`max` attributes. Calculate was still shown.
- Mobile and accessibility: [Observed] The iframe itself fit 390 px without overflow; inputs were 272 px wide and stacked. Labels produced accessible names. The host page's generic title and iframe-without-title reduce search and iframe accessibility quality.
- Privacy: [Unknown] The calculator page has no calculator-specific privacy statement. It is embedded in a marketing page with sales, chat, and analytics surfaces.
- Performance: [Observed] The direct calculator loaded as a small interactive app; the host page carried substantially more navigation, chat, and marketing UI.
- Search-content structure: [Observed] Host h2: “ZFS / RAIDZ Capacity Calculator”; no host h1 was observed. The direct app title is “ZFS Capacity Calculator” and its visible headings begin at h2 (“Inputs”, “Outputs”).
- What works: Clear accounting layers, decimal/binary units, repeated-vdev support, and concise output definitions.
- What fails: Slop copy and observed arithmetic disagree; invalid widths are not blocked; record size is presented but disabled.
- Do not copy: The iframe architecture, inconsistent slop percentage, stale result under invalid input, or vendor-host-page metadata.

```text
[host sales page]
  [h2 + promise + webinar links]
  [embedded calculator]
    [RAID type] [drive TB] [sector]
    [drives/group] [groups] [recordsize disabled]
    [x slop] [ ] free-space %
    [Calculate]
    [TiB | TB | % result table]
    [Inputs explained]
    [Outputs explained]
```

### Competitor 3: zfs-calculator.com

- URL: https://zfs-calculator.com/
- Accessed: 2026-08-03
- Audience and promise: [Observed] A beginner-facing live calculator for one homogeneous pool layout, emphasizing effective capacity after a generic ZFS overhead estimate.
- Inputs and defaults: [Observed] 4 disks, 4 TB, TB/GB toggle, and mirror pairs. Redundancy options are stripe, RAIDZ1/2/3, and mirror pairs.
- Action and state behavior: [Observed] Results update immediately without a submit button. Six 18 TB disks in RAIDZ2 produced 72.00 TB before overhead, 69.40 TB effective, and a fixed 3.61% overhead.
- Results and visuals: [Observed] Five card-like outputs for pre-overhead capacity, effective capacity, overhead percentage, mirror pairs, and fault tolerance. There is no raw-capacity row, per-vdev view, padding breakdown, reserve control, or TiB display.
- Formula or data source: [Inferred] Parity/mirror math is followed by a fixed 3.61% reduction; the value remained 3.61% across the operated fixture. The page describes metadata, checksums, ZIL, slop, and alignment in aggregate but links no source or version.
- Errors and edge behavior: [Observed] Two disks with RAIDZ3 triggered an accessible alert, “RAIDZ3 requires at least 4 disks,” and suppressed numeric results. GB mode correctly changed the disk-size accessible description from terabytes to gigabytes.
- Mobile and accessibility: [Observed] At 390 × 844 all controls fit without horizontal overflow. Number inputs and redundancy select had descriptive accessible names; the unit buttons had explicit names. The title/h1/result hierarchy was easy to scan.
- Privacy: [Unknown] No visible calculator-specific privacy statement or source link was present.
- Performance: [Observed] Inputs updated results within the same page without visible waiting or navigation.
- Search-content structure: [Observed] Title: “ZFS Storage Calculator | Calculate RAID Storage Capacity”; h1: “ZFS Storage Calculator”; h2: Results; h3s explain redundancy and effective capacity.
- What works: Excellent low-friction live state, good invalid-width feedback, and strong mobile control sizing.
- What fails: The unexplained fixed overhead creates false precision and the single-layout model cannot represent real mixed top-level vdevs or auxiliary roles.
- Do not copy: The universal 3.61% deduction, “Actual” label, or assertion that a generic overhead estimate is effective capacity.

```text
[ZFS Storage Calculator]
[disk count]
[disk size][TB|GB]
[redundancy level]
[Results]
  [pre-overhead]
  [effective “actual”]
  [overhead %]
  [mirror pairs]
  [fault tolerance]
[redundancy explanations]
```

### Competitor 4: Professional Calculators ZFS Capacity Calculator

- URL: https://professionalcalculators.com/zfs-calculator/
- Accessed: 2026-08-03
- Audience and promise: [Observed] A two-mode calculator promising a quick repeated-vdev estimate and an advanced “design-grade” planner with mixed vdevs, spares, recordsize, ashift, AFR, and resilver time.
- Inputs and defaults: [Observed] Lightweight: 1 group, mirror, 3 disks/group, blank disk size, TB, and “Include ZFS slop (6.25%)” enabled. Advanced: blank base size, 0 spares, 6.25% slop, 128 KiB recordsize, ashift 12, 5% AFR, 48-hour resilver, and an add-vdev composer.
- Action and state behavior: [Observed] Explicit Add vdev and Calculate actions. A mixed design of one 6-wide RAIDZ2 vdev plus one 2-way mirror, 18 TB disks, one spare, and 3.125% slop returned 144 TB raw, 76.29 TB usable, and 53.0% efficiency.
- Results and visuals: [Observed] Compact definition-list results for raw, usable, efficiency, fault tolerance, spare reservation, recordsize, ashift, AFR, and resilver time. It does not show a per-vdev capacity breakdown despite accepting mixed vdev types.
- Formula or data source: [Inferred] Results use top-level parity/mirror subtraction, subtract a user-entered slop percent and spare share, and echo the other advanced inputs. The page claims “true ZFS math,” padding, and local processing but publishes no source or primary references. The operated result did not demonstrate that recordsize or ashift affected capacity.
- Errors and edge behavior: [Observed] The tool accepted a 2-wide RAIDZ3 vdev, added it to the pool, and calculated 180 TB raw, 78.47 TB usable, plus “3 disks per vdev” fault tolerance. This is an impossible topology and a launch-blocking trust failure for that competitor.
- Mobile and accessibility: [Observed] At 390 × 844 the lightweight form stacked at 298 px with no overflow. Named labels were exposed for many controls, but the advanced vdev type and width lacked useful accessible names. Results are text only.
- Privacy: [Documented] The page states calculation runs in the browser and nothing is uploaded. No source repository or implementation proof was linked.
- Performance: [Observed] The long SEO page loaded and the calculator responded without a full navigation; the page contains extensive repeated prose and tables below the tool.
- Search-content structure: [Observed] Title: “Free ZFS Calculator”; h1: “ZFS Capacity Calculator”; many h2–h4 headings repeat definitions, benefits, and step instructions.
- What works: The quick/advanced split and mixed-vdev composer address real jobs absent from most competitors.
- What fails: Invalid topology acceptance, a historically suspicious 6.25% default slop, non-functional-looking advanced factors, and an undifferentiated mixed-vdev result undermine the “design-grade” promise.
- Do not copy: The “true ZFS math” claim, decorative advanced settings, default 6.25% slop, impossible-vdev acceptance, or SEO repetition.

```text
[ZFS Capacity Calculator]
[Lightweight | Advanced]
Advanced:
  [base size][spares][slop %]
  [recordsize][ashift][AFR][resilver]
  [vdev type][width][Add vdev]
  [chips: RAIDZ2×6, MIRROR×2]
  [Calculate][Reset]
  [raw | usable | efficiency | tolerance | echoed settings]
[very long how-to/benefit content]
```

### Competitor 5: Virtualization Howto RAIDZ Calculator

- URL: https://www.virtualizationhowto.com/2024/09/raidz-calculator-to-find-zfs-capacity-and-cost/
- Accessed: 2026-08-03
- Audience and promise: [Observed] A homelab article with an embedded calculator combining capacity, disk cost, generic filesystem overhead, compression, deduplication, SLOG, L2ARC, and repeated vdev count.
- Inputs and defaults: [Observed] 6 data disks, 4 TB, RAIDZ2, $150/disk, 0 SLOG, 0 L2ARC, 0 additional vdevs, 10% filesystem overhead, 1.0 compression ratio, and 1.0 deduplication ratio.
- Action and state behavior: [Observed] Explicit Calculate. The test entered 8 × 18 TB RAIDZ2, $250/disk, 2 SLOG, 1 L2ARC, 2 additional vdevs, 5% overhead, 1.5 compression, and 1.2 dedup. The semantic button repeatedly timed out; a visual click produced no result state exposed to the inspected DOM.
- Results and visuals: [Unknown] The page promises usable capacity and cost, but no result block became observable in the operated session. The surrounding article is much larger than the calculator and is interrupted by ads.
- Formula or data source: [Unknown] The article documents user-set overhead, compression, and dedup ratios but provides no formula source, rounding rule, ZFS version, or code link. SLOG and L2ARC are correctly described in prose as not adding capacity.
- Errors and edge behavior: [Observed] No inline error state appeared while editing. The primary action was hard to reach because the page remained visually at the top during semantic input operations and large/sticky content plus ads interfered with navigation.
- Mobile and accessibility: [Unknown] The page returned `about:blank` when revisited at 390 px in this Browser session. At desktop width, labels were semantically exposed, but the calculator column was visually oversized and clipped in the viewport.
- Privacy: [Unknown] No local-only calculator statement was found; the article includes multiple third-party advertising frames.
- Performance: [Observed] The long ad-supported article produced multiple cross-origin ad errors and substantial interaction friction. This is a bounded observation, not a network benchmark.
- Search-content structure: [Observed] Title/h1: “RAIDZ Calculator to find ZFS Capacity and Cost”; h1 inside the article also says “Calculate your ZFS RAID”; numerous h2/h3 sections explain every input and general ZFS concepts.
- What works: It recognizes budget and auxiliary-device inventory as part of a purchase plan and keeps SLOG/L2ARC out of data capacity in its prose.
- What fails: Too many speculative ratios are mixed into one answer, and the calculator is buried in a slow, ad-heavy article with unreliable action discoverability.
- Do not copy: Cost, compression, dedup, AFR, and generic overhead in one undifferentiated result; ad interruptions; or a results promise that cannot be readily verified.

```text
[site header + large article title]
[intro + disclaimer + ads]
[Calculate your ZFS RAID]
  [disks][size][RAID][cost]
  [SLOG][L2ARC][additional vdevs]
  [overhead][compression][dedup]
  [Calculate]
[long field-by-field article + ads]
```

### Competitor 6: Servnet UK ZFS / RAIDZ Calculator

- URL: https://www.servnetuk.com/zfs-raidz-calculator
- Accessed: 2026-08-03
- Audience and promise: [Observed] A polished vendor tool promising parity, slop, `(parity+1)` padding, multi-vdev pools, 80% fill guidance, IOPS, throughput, rebuild time, and URE context.
- Inputs and defaults: [Observed] RAIDZ2; 1 vdev; 6 drives/vdev; 8 TB; nearline 7.2K HDD. Advanced controls expose URE rate, ashift 9/12/13, recordsize/volblocksize presets, and workload mix.
- Action and state behavior: [Observed] Immediate live updates. Two 10-wide RAIDZ3 vdevs using 18 TB drives returned 360 TB raw, 240 TB headline usable, 66.67% efficiency, 186 TB at the 80% planning fill, and 3-drive tolerance per vdev (up to 6 only if spread).
- Results and visuals: [Observed] Highly scannable headline capacity, fault tolerance, IOPS, throughput, rebuild, URE, and planning fill; capacity distribution, vdev parity, IOPS, and risk diagrams; TB/TiB toggle; copy-link and PDF actions.
- Formula or data source: [Documented] On-page copy states parity per vdev, 1/32 slop, `(parity+1)` sector padding, and 80% fill. [Inferred] The 186 TB planning figure equals parity-adjusted capacity after 3.125% slop and then 80% fill. Performance and URE outputs are explicitly labeled indicative, but no source code or primary references were exposed.
- Errors and edge behavior: [Observed] Entering 3 drives for RAIDZ3 was clamped to the valid minimum of 4. Live output then reflected two 4-wide RAIDZ3 vdevs. Preset buttons and direct number entry stayed synchronized.
- Mobile and accessibility: [Observed] At 390 × 844 the page fit within 384 px with a mobile menu and wrapped RAID buttons. Main numeric controls and buttons had descriptive accessible names. The large number of RAID levels creates a long first step before the ZFS options.
- Privacy: [Unknown] No local-only calculation statement was observed. Copy-link, PDF, quote, and pricing actions are present; the quote action would leave the calculator flow.
- Performance: [Observed] Despite a long marketing page and multiple diagrams, the calculator updated immediately in the inspected session without navigation.
- Search-content structure: [Observed] Title: “ZFS / RAIDZ Calculator — Usable Space | Servnet UK”; h1 matches the ZFS calculator; ordered h2 sections guide level, drives, and drive class; detailed explanatory headings follow.
- What works: Best-in-class result scanability, strong validation, explicit planning headroom, and visual explanation of capacity versus parity.
- What fails: It mixes generic RAID and ZFS in the same selector, uses identical-vdev multiplication only, and presents performance/risk estimates that exceed the core capacity job.
- Do not copy: The broad RAID selector, quote funnel, or pseudo-precision for IOPS, throughput, rebuild, and URE in a capacity calculator.

```text
[h1 + precise promise + visual]
[1 Choose RAID level: many grouped buttons]
[2 Configure: vdevs | drives/vdev | capacity]
[3 Drive class + advanced tuning]
[live result strip]
  usable | tolerance | IOPS | throughput | rebuild | URE | 80%
[capacity chart][vdev diagram][IOPS chart][URE chart]
[copy link][PDF][pricing CTA]
[formula explanations]
```

### Competitor 7: Simple Tools Hub ZFS RAIDZ Pool Capacity Calculator

- URL: https://simpletoolshub.com/zfs-raidz-capacity-calculator/
- Accessed: 2026-08-03
- Audience and promise: [Observed] A simple, privacy-forward live calculator for one repeated vdev type, with raw, parity, slop, decimal/binary units, compression scenario, efficiency, and per-vdev tolerance.
- Inputs and defaults: [Observed] RAIDZ2, 6 disks/vdev, 1 identical vdev, 4 TB, TB/GB unit select, and 1.0× compression preset. Presets range from already-compressed media through 10× repetitive logs.
- Action and state behavior: [Observed] Immediate updates. Three 5-wide RAIDZ1 vdevs with 12 TB drives and 1.45× compression produced 180 TB raw, 144 TB parity-adjusted, 139.39 TB after the reservation, and a 202.12 TB logical compression scenario.
- Results and visuals: [Observed] A two-column table clearly separates total/data/parity disks, raw, parity-adjusted, post-reservation, logical compression, efficiency, and failure tolerance. The note distinguishes physical and logical capacity.
- Formula or data source: [Documented] The page states a roughly 3.2% reservation and warns that block padding is omitted and worsens with small record/volblock sizes. [Inferred] The operated result uses direct parity subtraction followed by a fixed 3.2% reduction and optional ratio multiplication. No source code or primary formula link is present.
- Errors and edge behavior: [Observed] One disk/vdev with RAIDZ2 produced an accessible alert and replaced every result with an em dash. It did not silently clamp or retain a stale valid result.
- Mobile and accessibility: [Unknown] A 390 px revisit returned `about:blank` in the Browser session. At desktop width, inputs had clear labels, the invalid message used an alert role, and the output used proper table headers.
- Privacy: [Documented] The page states “Pure browser calculation — nothing is uploaded.”
- Performance: [Observed] The desktop calculator updated immediately without an explicit action or navigation.
- Search-content structure: [Observed] Title/h1: “ZFS RAIDZ Pool Capacity Calculator – Usable Space & TiB”; h2s cover Pool capacity, planning, and FAQ; the page includes updated date and privacy claim.
- What works: The clean accounting table, correct invalid-state blanking, logical-versus-physical compression wording, and privacy statement.
- What fails: Identical vdevs only; fixed uncapped slop; no block-size model; compression presets cite no evidence and include an eye-catching 10× option.
- Do not copy: The fixed 3.2% as a universal deduction, workload compression presets without provenance, or compression multiplied into the main physical result.

```text
[h1 + short promise]
[privacy note]
[vdev type]
[disks/vdev][identical vdevs]
[drive size][TB|GB]
[compression scenario]
[Pool capacity table]
  raw
  parity-adjusted
  after reservation
  logical with compression
  efficiency + tolerance
[caveat][planning article][FAQ]
```

### Competitor 8: jro.io OpenZFS Capacity Calculator

- URL: https://jro.io/capacity/
- Accessed: 2026-08-03
- Audience and promise: [Observed] A specialist calculator and technical write-up intended to predict OpenZFS capacity closely and compare many pool layouts, disk sizes, record sizes, ashift values, reserves, AFR, and dRAID.
- Inputs and defaults: [Observed] 24 total disks; 0 minimum spares; OpenZFS 2.0.7 slop enabled; 128 KiB recordsize; ashift 12; 0 GiB swap; 3 decimal places; optional deflate ratio, AFR, effective capacity, 20% reservation, TiB/TB, layout filter; custom disk-size and vdev-layout composers.
- Action and state behavior: [Observed] Tables update immediately as global settings change; Add Disk and Add Vdev Layout extend presets. With 8 disks, attempting to add an already-present 6-wide RAIDZ2 layout returned “6-wide Z2 already added.” A 2-wide RAIDZ3 attempt returned “2-wide Z3 invalid.”
- Results and visuals: [Observed] Very large comparison tables show many widths across many disk sizes, plus raw/stripe/mirror, RAIDZ1/2/3, and dRAID sections. Changing recordsize from 128 KiB to 4 KiB materially reduced displayed capacity; for 8 total disks, 18 TB, 6-wide RAIDZ2 fell to 32.487 TiB in the common-layout table.
- Formula or data source: [Documented] The same page contains a byte-level derivation covering decimal drive size, swap/partition space, vdev alignment, metaslab allocation, RAIDZ parity/padding, slop, and validation against `zfs list -p`. It references OpenZFS code and exposes decimal-place control. This is the strongest documented competitor.
- Errors and edge behavior: [Observed] Invalid and duplicate custom layouts are rejected inline. Layouts wider than the available disk count show zero vdevs and zero capacity rather than disappearing. Mixed top-level vdev types cannot be assembled into one named pool result; “custom” adds another comparison column.
- Mobile and accessibility: [Observed] At 390 × 844 the document remained 1,200 px wide. Controls and tables overflowed far to the right; the h2 was 1,200 px wide. Some controls have labels, while custom vdev fields and table radio controls are inconsistently named.
- Privacy: [Unknown] No calculator-specific privacy statement was observed. The calculator appears client-rendered, but that was not documented as a promise.
- Performance: [Observed] Desktop input changes and large-table recomputation were immediate in the inspected session. The enormous page creates reading and horizontal-navigation cost rather than a calculation delay.
- Search-content structure: [Observed] Title/h2: “OpenZFS Capacity Calculator”; no h1 was observed. The page combines the form, dense tables, and a long derivation in one document.
- What works: The most credible formula depth, real recordsize/ashift sensitivity, explicit rounding, byte validation, dRAID coverage, and strong invalid-layout handling.
- What fails: It overwhelms beginners, is unusable at a narrow viewport, compares generic layouts instead of explaining one entered pool, and does not model a true mixed-vdev pool composition.
- Do not copy: The 1,200 px fixed layout, giant result matrix as the primary answer, punctuation-heavy help labels, or specialist terminology without a first-pass summary.

```text
[OpenZFS Capacity Calculator]
[dense settings table: disks | spares | slop | recordsize | ashift | swap]
[more toggles: overhead | reservation | AFR | units | filter]
[shelf-count mini-table]
[Common Layouts: widths × many disk sizes]
[Raw/Mirror table]
[RAIDZ1 table]
[RAIDZ2 table]
[RAIDZ3 table]
[dRAID tables]
[long byte-level derivation and command outputs]
```

## Comparison matrix

| Capability | ReclaiMe | 45Drives | zfs-calculator.com | Professional | Virtualization Howto | Servnet UK | Simple Tools Hub | jro.io | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Multiple identical vdevs | Yes | Yes | No | Yes | Yes | Yes | Yes | Table-derived | High |
| Truly mixed top-level vdevs | No | No | No | Yes, but one flat result | No | No | No | No | High |
| Mixed drive sizes per vdev | No | No | No | No | No | No | No | Custom disk table only | High |
| RAIDZ1/2/3 and mirrors | Yes | Yes | Yes | Yes | Yes | RAIDZ plus many generic RAID levels | Yes | Yes, plus dRAID | High |
| `ashift` input affects output | No | Sector size exposed | No | Input exposed; effect not demonstrated | No | Advanced input | No | Yes | High |
| `recordsize`/`volblocksize` affects output | No | Fixed 128 KiB | No | Input exposed; effect not demonstrated | No | Advanced presets | Caveat only | Yes | High |
| Slop handling | None | Copy says 1/32; observed 2.5% | Fixed 3.61% aggregate | Default 6.25%, editable | Generic editable overhead | 1/32 inside planning result | Fixed ~3.2% | Old/new switch with detailed model | High |
| Slop cap/min modeled | No | No visible cap | No | No | No | Unknown | No | Documented model | Medium |
| User operating reserve | No | Optional 20% | No | Slop only | Generic overhead only | Fixed 80% planning view | No | Optional 20% | High |
| SLOG/L2ARC roles | No | No | No | No | Inventory counts | No | No | No | Medium |
| Special vdev role | No | No | No | No | No | No | No | No | High |
| Hot-spare inventory | No | No | No | Count only | No | No | No | Minimum spares | Medium |
| Physical vs logical compression | No | No | No | No | Ratios mixed into calculator | No | Clearly separated | Optional effective capacity | High |
| Per-vdev capacity result | No | No | No | No | No | Visual fault domains, not capacity rows | No | Layout columns, not one pool | High |
| Invalid topology validation | Weak/unknown | Missing for probed Z2 | Good | Broken: accepts 2-wide Z3 | No observed feedback | Good/clamped | Good/blanked | Good/inline | High |
| TB and TiB | GB only | Both | TB or GB input, TB result | TB/GB input, result TB | TB | Toggle | Both | TB/TiB/PiB | High |
| URL/share state | No | No observed | No observed | No observed | No observed | Copy link | No observed | No observed | Medium |
| Scannable result | Low | Medium | High | Medium | Unknown | High | High | Low | High |
| Mobile usability | Legacy but fits | Good in iframe | Good | Good form | Unknown | Good | Unknown | Broken horizontal overflow | High |
| Formula transparency | None | Medium, contradictory | Low | Low despite strong claims | Low | Medium | Medium caveats | Very high | High |
| Privacy statement | Unknown | Unknown | Unknown | Local-only claim | Unknown/ad-heavy | Unknown | Local-only claim | Unknown | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| What does “usable” mean? | Competitors use parity-adjusted bytes, post-slop bytes, post-reserve bytes, and compression-inflated logical bytes under the same label. | [OpenZFS zpoolprops](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html) says its own `usable` is a fixed-128 KiB heuristic, while `zfs list` reports dataset available space. | No. stack127 must use explicit result names and an accounting waterfall. |
| Is slop 6.25%, 3.2%, 2.5%, or capped? | Professional defaults to 6.25%; Simple uses ~3.2%; 45Drives observed 2.5%; Servnet uses 1/32 before planning fill. | [OpenZFS module parameters](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html): default 1/32, minimum 128 MiB, maximum 128 GiB, tunable. | No. Implement the documented default/caps and expose override as an advanced assumption. |
| Can RAIDZ capacity be parity subtraction only? | Five tools effectively use drive-count parity math; Servnet adds coarse padding; jro.io models block allocation. | [OpenZFS RAIDZ](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html). | No. Show parity/mirror allocation as one stage and a separate block-allocation estimate driven by ashift and record/volblock size. |
| Should compression increase the main capacity result? | Virtualization Howto mixes it into the calculator; Simple and jro.io expose an effective/logical scenario; most omit it. | [OpenZFS compression](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html). | No. Keep it as a separate conditional logical-data scenario. |
| How should multiple vdevs be represented? | Most multiply identical groups; Professional accepts mixed types but flattens the result; jro.io compares layouts rather than composing one pool. | [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html). | No. Use a topology-first editor and per-vdev result rows before the pool total. |
| Do SLOG, L2ARC, spare, and special devices add data capacity? | Almost all tools omit them; Virtualization Howto counts inventory; no reviewed tool correctly integrates special allocation capacity. | [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) and [special vdev](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Special%20vdev.html). | No. Report physical inventory for every role, but exclude SLOG/L2ARC/spare from general writable data and isolate special-class capacity. |
| Should a planning reserve default to 20%? | 45Drives offers optional 20%; Servnet shows a fixed 80% fill view; jro.io exposes 20%; others omit it. | OpenZFS documents slop but not a universal 80% application policy; community guidance varies by workload and version. | Yes. Product planning must choose the default UX. Research recommends a clearly optional 20% user reserve, not a claim that OpenZFS requires it. |
| How exact can an expanded RAIDZ result be? | Reviewed calculators generally assume a steady width; jro.io targets pre-expansion layouts. | [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html) says old blocks retain their original ratio. | Yes. First release should calculate a fresh planned topology and explain that an already-expanded pool needs historical allocation data unavailable from topology alone. |

## Evidence-backed opportunities

1. **Topology-first mixed-vdev planning**: No reviewed calculator gives a clean, beginner-readable composition of different top-level vdev types and drive capacities with a per-vdev result before the pool total. stack127 can make each vdev an explicit failure and capacity boundary.
2. **An accounting waterfall instead of one “usable” number**: Repeated community confusion and competitor label disagreement justify a scan-first chain: physical inventory → role-excluded capacity → per-vdev smallest-member limit → parity/mirror allocation → RAIDZ block/padding estimate → slop → optional user reserve → estimated writable physical capacity.
3. **Advanced settings that visibly earn their place**: `ashift`, `recordsize`, and `volblocksize` should change a named allocation estimate and show the delta. Competitors that merely echo these inputs damage trust.
4. **Correct role modeling**: Let users add hot spares, SLOG, L2ARC, and mirrored special vdevs as inventory without pretending they are general data capacity. No reviewed tool covers this complete role set.
5. **Physical capacity separated from logical compression**: A small optional scenario can show “logical data at your assumed ratio” without moving the physical result. Simple Tools Hub demonstrates the wording direction, but stack127 should avoid unreferenced workload presets.
6. **Validity and safety at input time**: Enforce Z1/Z2/Z3 minimums, mirror minimums, special redundancy guidance, and vdev-local smallest-drive limits before results. The Professional calculator's accepted 2-wide RAIDZ3 shows why this is non-negotiable.
7. **Reproducible but conservative command preview**: Generate a placeholder `zpool create` shape from the topology, make device paths visibly fake, and never include destructive flags. This connects planning to execution without becoming an unsafe configurator.
8. **Version-aware fixture evidence**: Validate the model against sparse-file pools on OpenZFS 2.3 and 2.4, including small records and expansion-sensitive cases. This is a stronger trust signal than claiming “true ZFS math.”
9. **Responsive precision**: Present one entered pool well on mobile, with expandable vdev audit rows. This directly improves on jro.io's 1,200 px overflow and avoids Servnet's long generic RAID selector.
10. **Shareable clean state**: Keep the canonical route clean and serialize a user-created configuration only after interaction or through an explicit Share action. The current storage-suite state envelope can support this without sacrificing SEO.

## Table stakes

- Accept mirrors and RAIDZ1, RAIDZ2, and RAIDZ3 as distinct top-level data vdevs.
- Add, remove, duplicate, and reorder vdevs without losing the pool overview.
- Accept decimal drive sizes with TB/GB and show exact-byte-derived TB and TiB outputs.
- Reject impossible widths before calculation and never leave a stale valid result under invalid input.
- Apply the smallest member's capacity within each vdev and expose stranded bytes from larger members.
- Show raw physical inventory, parity/mirror allocation, estimated RAIDZ allocation/padding, slop, user reserve, and estimated writable physical capacity as separate rows.
- Expose `ashift` and filesystem `recordsize`; switch to `volblocksize` when the user selects a zvol workload.
- Model default slop using current OpenZFS behavior and caps, while allowing an advanced override with a clear warning.
- Treat hot spare, SLOG, and L2ARC as non-data capacity; treat special vdev as a separate permanent allocation class requiring redundancy.
- Show failure tolerance per vdev and explain that losing any top-level data or special vdev beyond its redundancy loses the pool.
- Label every result as theoretical, estimated, planning reserve, or conditional logical scenario.
- Provide source links and a compact formula/audit drawer.
- Work at narrow mobile widths without horizontal page overflow or table-only comprehension.
- Keep calculations local, deterministic, and instantaneous for practical drive counts.
- Preserve a clean canonical URL until the user explicitly creates/share state.

## Ideas to reject

- One headline called “actual usable capacity”: OpenZFS accounting is workload- and layer-dependent; the label promises knowledge the inputs cannot provide.
- A universal fixed filesystem-overhead percentage: it hides the effects of block size, ashift, slop caps, metadata, and workload.
- Compression or deduplication added to physical capacity: these are data-dependent logical scenarios and dedup introduces operational risks outside this tool's core job.
- Generic IOPS, throughput, URE, resilver, or AFR forecasts in the capacity result: they require many additional assumptions and distract from a trustworthy capacity model.
- A selector containing every hardware RAID level: this route is specifically for ZFS pool topology.
- dRAID in the first implementation: it has a distinct distributed-spare and allocation model. It deserves either a later deliberate extension with fixtures or a separate tool, not a superficial parity option.
- Historical RAIDZ-expansion reconstruction from topology alone: old and new blocks can have different ratios, so an exact answer requires unavailable allocation history.
- Automatic device-path or destructive command generation: only placeholders and a non-executing command shape are safe.
- Compression presets such as “VMs = 1.2×” or “logs = 10×” without user evidence: they create false confidence.
- A giant all-width/all-disk matrix as the primary result: it is powerful for specialists but obscures the user's actual pool and fails on mobile.
- Making users choose between “simple” and “advanced” before they understand the topology: start with the pool, then progressively reveal allocation assumptions.
- Treating special vdevs as removable cache or ordinary capacity: it is a permanent allocation class with pool-loss implications.

## Open questions and blockers

- [Inferred] No research blocker prevents product planning. The route, audience, minimum scope, competitor gap, and primary technical boundaries are clear.
- [Documented] Implementation must still establish exact fixture tolerances against OpenZFS 2.3 and 2.4 sparse pools before any formula is accepted. This is a verification task, not a reason to invent precision during planning.
- [Unknown] The exact cross-platform per-drive reservation model (GPT labels, swap, boot partitions, distribution behavior) is not universal. Product planning must decide between a clearly user-entered reservation and omission from the default estimate.
- [Unknown] The first-release handling of an already-expanded RAIDZ vdev needs a product decision. Recommended scope is “fresh planned topology” with an expansion-history caveat; do not ask users for unknowable old/new block proportions.
- [Unknown] The default user reserve needs a UX decision. Research supports exposing 20% as an editable planning assumption, off or clearly separable from the OpenZFS slop reserve.
- [Unknown] Special-vdev sizing cannot be exact from pool topology alone because metadata and `special_small_blocks` placement are workload-dependent. The first release should show inventory, redundancy, and a separately labeled capacity envelope rather than a guaranteed fill ratio.

## Sources

- OpenZFS RAIDZ documentation: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html, accessed 2026-08-03. Documented allocation inputs, space-efficiency examples, performance boundary, and expansion behavior.
- OpenZFS VDEVs documentation: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html, accessed 2026-08-03. Documented top-level and auxiliary vdev roles and redundancy consequences.
- OpenZFS Special vdev documentation: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Special%20vdev.html, accessed 2026-08-03. Documented permanent allocation role, redundancy, and removal constraints.
- OpenZFS Caching and Auxiliary Devices: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Caching.html, accessed 2026-08-03. Documented SLOG, L2ARC, and special behavior.
- OpenZFS module parameters: https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html, accessed 2026-08-03. Documented default, minimum, maximum, and tuning of slop space.
- OpenZFS zpool properties: https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html, accessed 2026-08-03. Documented physical-space accounting and the heuristic nature of `usable`.
- OpenZFS zfs-list: https://openzfs.github.io/openzfs-docs/man/master/8/zfs-list.8.html, accessed 2026-08-03. Documented dataset `USED` and `AVAIL` output.
- OpenZFS zpool-create: https://openzfs.github.io/openzfs-docs/man/master/8/zpool-create.8.html, accessed 2026-08-03. Documented vdev command structure and examples.
- OpenZFS Compression: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html, accessed 2026-08-03. Documented compression thresholds, rounding, and observed-ratio commands.
- OpenZFS Workload Tuning: https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html, accessed 2026-08-03. Documented recordsize/volblocksize tradeoffs.
- OpenZFS Changing Pool Layout: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html, accessed 2026-08-03. Documented RAIDZ expansion accounting limits.
- RAIDZ Calculator by ReclaiMe: https://www.raidz-calculator.com/, accessed and operated 2026-08-03. Observed simple repeated-group parity calculator.
- 45Drives ZFS / RAIDZ calculator: https://www.45drives.com/zfs/zfs-calculator/ and https://zfs-calc.45d.io/, accessed and operated 2026-08-03. Observed layered output and slop inconsistency.
- zfs-calculator.com: https://zfs-calculator.com/, accessed and operated 2026-08-03. Observed live simple calculator, fixed overhead, and strong invalid state.
- Professional Calculators ZFS tool: https://professionalcalculators.com/zfs-calculator/, accessed and operated 2026-08-03. Observed quick/advanced modes, mixed vdevs, and invalid RAIDZ3 acceptance.
- Virtualization Howto RAIDZ calculator: https://www.virtualizationhowto.com/2024/09/raidz-calculator-to-find-zfs-capacity-and-cost/, accessed and operated 2026-08-03. Observed cost/ratio inputs and interaction friction.
- Servnet UK ZFS / RAIDZ calculator: https://www.servnetuk.com/zfs-raidz-calculator, accessed and operated 2026-08-03. Observed scan-first result, padding/slop/headroom model, and validation.
- Simple Tools Hub ZFS calculator: https://simpletoolshub.com/zfs-raidz-capacity-calculator/, accessed and operated 2026-08-03. Observed clear accounting table, compression scenario, and invalid state.
- jro.io OpenZFS Capacity Calculator: https://jro.io/capacity/, accessed and operated 2026-08-03. Observed detailed byte model, recordsize/ashift response, comparison tables, and mobile overflow.
- TrueNAS community resource for jro.io: https://www.truenas.com/community/resources/openzfs-capacity-calculator.185/, accessed 2026-08-03. Documented adoption signal and novice value.
- r/zfs capacity discussions: https://www.reddit.com/r/zfs/comments/bp0fcn/, https://www.reddit.com/r/zfs/comments/18uczf9/, https://www.reddit.com/r/zfs/comments/16ewhs6/, and https://www.reddit.com/r/zfs/comments/10xk0zs/, accessed 2026-08-03. Observed repeated confusion about raw, usable, padding, slop, and workload dependence.

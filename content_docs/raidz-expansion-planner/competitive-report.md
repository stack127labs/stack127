# Competitive report: RAIDZ Expansion Planner

Status: ready
Tool: RAIDZ Expansion Planner
Route: `/raidz-expansion-planner`
Researched: 2026-08-13
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

### Current version127 state

This is a new, unpublished tool at a locked flat route. version127 already has a ZFS capacity calculator and a ZFS block-size and padding calculator. Neither models the transition from an existing RAIDZ width to a wider one, the capacity available after old blocks are reflowed without being rewritten, or a sequence of one-disk expansions. No conflicting route, engine, test, or ownership manifest exists for `/raidz-expansion-planner`.

The idea passes the surface decision rule. It is a deterministic calculation over the user's current vdev geometry, fill level, disk size, and intended final width. It does not require curated coverage or promise a universal safety judgment. It fits version127's storage-planning audience and is not a thin wrapper if it exposes the old-versus-new block-generation consequence that ordinary pool calculators omit.

### Method and coverage

Research used four query shapes: the exact phrase, the underlying add-a-disk job, specialist capacity language, and reported-space or old-block edge cases. Direct Browser operation covered two exact transition calculators and three adjacent ZFS capacity planners. Representative probes included 4-to-8-wide RAIDZ2 at 80% fill, 6-to-8-wide RAIDZ2 at 80% fill, an invalid final width below the initial width, a below-minimum RAIDZ3 width, and before/after width comparisons. TrueNAS and raidsize were also inspected at a 390 x 844 narrow viewport; jro.io and Servnet were measured for narrow-screen overflow.

The narrow direct category is saturated at five operated tools: only TrueNAS and raidsize calculate the mixed-generation expansion effect. jro.io, HexOS, and Servnet are the strongest adjacent tools a user can operate twice to compare old and final widths. Remaining results repeated these domains or were articles, generic RAID calculators, migration guides, spreadsheets, forums, or calculators that model a newly created final layout rather than an expanded vdev.

### Search saturation evidence

- Queries tried: `RAIDZ Expansion Planner`, `RAIDZ expansion calculator`, `ZFS add disk RAIDZ expansion capacity calculator`, `OpenZFS RAIDZ expansion planner capacity before after`, `RAIDZ expansion mixed old new blocks capacity fragmentation`, and `why reported space is lower after RAIDZ expansion`.
- Repeated domains: truenas.com, raidsize.com, jro.io, hexoscalculator.com, servnetuk.com, OpenZFS documentation, OpenZFS GitHub, and community threads repeated across the query shapes.
- Exclusions: Generic RAID calculators without RAIDZ block geometry; ZFS calculators that do not accept an initial and final width; articles and command tutorials without an interactive result; community spreadsheets duplicated by the TrueNAS calculator; migration planners for replacing drives; and mirrors, dRAID, SHR, Unraid, or new-vdev planners that do not model RAIDZ expansion.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Plan one expansion | `RAIDZ expansion calculator` | Estimate capacity before, immediately after, and at native final-width efficiency. | Two direct calculators. |
| Plan a sequence | `expand RAIDZ2 from 6 to 8 drives` | Compare one-at-a-time steps and see how existing data affects each step. | Direct calculators and a community spreadsheet. |
| Diagnose a discrepancy | `why less space after RAIDZ expansion` | Understand why reported or immediately useful capacity is below naive final-width math. | Official docs, forums, and two direct tools. |
| Choose the right operation | `add disk to RAIDZ or add vdev` | Distinguish widening a RAIDZ vdev from adding a top-level vdev or replacing every disk. | Official docs and guides. |
| Check prerequisites | `OpenZFS RAIDZ expansion requirements` | Confirm supported release, feature flag, health, disk-size, and parity constraints before touching the pool. | Man pages and product docs. |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Users expect the new disk's simple parity-adjusted capacity, then see much less usable or reported space. | [TrueNAS forum: RAIDZ2 expansion unexplained 10 TB space loss](https://forums.truenas.com/t/raidz2-expansion-unexplained-10tb-space-loss-2x-overhead/53600) | Repeated | Put immediate, native-equivalent, and accounting caveats beside one another; never call the difference unexplained loss. |
| Users confuse widening one RAIDZ vdev with adding another top-level vdev, replacing disks, or changing parity. | [OpenZFS discussion #15232](https://github.com/openzfs/zfs/discussions/15232) | Repeated | State the operation and unchanged parity before any capacity result, and reject mirror or parity-conversion scenarios. |
| Users ask whether old blocks are rewritten, rebalanced, or permanently stuck at the old ratio. | [OpenZFS discussion #15232](https://github.com/openzfs/zfs/discussions/15232) | Repeated | Visualize old-generation and new-generation allocation separately and distinguish reflow from logical rewrite. |
| Multi-step expansion raises questions about how much capacity is recovered at each step and how long repeated expansion may take. | [TrueNAS community: RAIDZ expansion discussion](https://www.truenas.com/community/threads/raidz-expansion-its-happening-someday.58575/) | Repeated | Show a step-by-step width timeline, but do not estimate duration without measured throughput and allocated bytes. |
| Reported capacity can remain pessimistic even after data is rewritten, confusing monitoring and `df` users. | [OpenZFS discussion #15232](https://github.com/openzfs/zfs/discussions/15232) | Repeated | Separate actual modeled allocation from what accounting commands may report and identify the uncertainty explicitly. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| RAIDZ expansion is an OpenZFS 2.3.0 feature that attaches a device to an existing RAIDZ vdev without downtime. | [OpenZFS 2.3.0 release](https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0) | Documented | The release identifies RAIDZ Expansion as a key 2.3.0 feature. Platform distributions can expose it on different schedules, so the UI should ask users to verify their installed build. |
| `zpool attach pool raidz2-0 new_device` widens one RAIDZ group; the new device must be at least as large as the smallest existing member. | [OpenZFS `zpool-attach(8)`](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) | Documented | It requires the `raidz_expansion` pool feature. This is not `zpool add`, disk replacement, mirror attachment, dRAID expansion, or parity conversion. |
| The vdev must be healthy to start; redundancy is maintained; a disk failure pauses expansion; restart/import resumes it. | [OpenZFS `vdev_raidz.c` theory statement](https://raw.githubusercontent.com/openzfs/zfs/master/module/zfs/vdev_raidz.c) | Documented | Reads, writes, snapshots, and `zpool add` can continue. Checkpoint, trim, and initialize are prohibited during expansion in the current source. |
| Expansion reflows allocated data over the wider physical set without changing old blocks or their parity-to-data ratio. | [OpenZFS `vdev_raidz.c`](https://raw.githubusercontent.com/openzfs/zfs/master/module/zfs/vdev_raidz.c) and [RAIDZ docs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | Documented | Old blocks keep their logical stripe geometry; new blocks written after expansion use the wider ratio. The implementation tracks time-dependent geometry by block birth time and expansion completion txg. |
| Expansion does not change fault tolerance and can be repeated. | [Changing Pool Layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html) | Documented | RAIDZ2 stays RAIDZ2. A wider vdev improves the new-write data-to-parity ratio but does not add another parity level. |
| The simplest geometry estimate for a native N-wide vdev with parity P and common drive size S is `(N - P) * S`; actual capacity also depends on RAIDZ sector and record geometry. | [OpenZFS RAIDZ docs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | Documented | Capacity results must distinguish a geometry explanation from byte-exact ZFS allocation. Existing version127 ZFS allocation code can provide the more exact native-width basis if product planning chooses it. |
| A mixed-generation planner can model old logical data at the old efficiency and remaining raw space at the new efficiency, but reported free-space accounting may remain pessimistic. | [OpenZFS `zpool-attach(8)`](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) | Inferred | This is the transparent planning model used by raidsize. It must be labeled as a planning estimate and not promise equality with `zfs list`, `df`, metadata, padding, slop, snapshots, compression, or fragmentation. |
| An automatic scrub starts when expansion completes in the current implementation. | [OpenZFS `vdev_raidz.c`](https://raw.githubusercontent.com/openzfs/zfs/master/module/zfs/vdev_raidz.c) | Documented | The source says it verifies checksums of copied blocks and is enabled by default. Do not turn this into a duration estimate. |

## Competitor reviews

### Competitor 1: TrueNAS RAIDZ Extension Calculator

- URL: https://www.truenas.com/docs/references/extensioncalculator/
- Accessed: 2026-08-13
- Audience and promise: [Observed] TrueNAS users estimating storage-capacity efficiency after incrementally extending a RAIDZ vdev.
- Inputs and defaults: [Observed] Drive size 8 TB, parity count 2, data expansion threshold 80%, initial width 4, and final width 8.
- Action and state behavior: [Observed] Explicit `Calculate` action; results appear as two comparison tables. No reset, copy, share, export, or URL persistence was visible.
- Results and visuals: [Observed] One table compares extending to the final width all at once; another compares extending one drive at a time. The default returned 6.40 TB versus 8.12 TB recoverable, plus drive equivalents and percentage of total capacity.
- Formula or data source: [Documented] The page credits a linked community spreadsheet and explains that old blocks retain old data-to-parity ratio while new blocks use the new ratio.
- Errors and edge behavior: [Observed] Setting initial width 4 and final width 3 still calculated `-4.27 TB`, `-0.53` drives, and `-17.78%` recovered in the all-at-once table instead of rejecting a non-expansion. HTML inputs did not prevent this semantic error.
- Mobile and accessibility: [Observed] At 390 x 844, the document fit within 390 CSS pixels without horizontal overflow. Inputs had associated accessible names. The long documentation sidebar precedes the calculator in reading order, and the result tables lack a visual before/after timeline.
- Privacy: [Unknown] No calculator-specific local-only statement was observed.
- Performance: [Observed] The documentation page loaded slowly enough to exceed a 20-second navigation wait once, but became interactive and calculated promptly after load. This is a bounded observation, not a benchmark.
- Search-content structure: [Observed] Title and h1 are “RAIDZ Extension Calculator”; short explanatory paragraphs precede the tool, two collapsed how-to sections accompany it, and related documentation follows.
- What works: It models the important distinction between final-width-at-once and one-drive-at-a-time expansion and cites its derivation.
- What fails: The result answers “capacity that could be recovered” without first showing current capacity, immediate post-step capacity, native final capacity, or the width sequence. Invalid shrink input produces plausible-looking negative numbers.
- Do not copy: The documentation-shell overhead, ambiguous “data expansion threshold” label, or any invalid state that still calculates.

```text
[TrueNAS documentation header + deep sidebar]
[RAIDZ Extension Calculator]
[short explanation + accounting caveat]
[collapsed how-to] [collapsed interpretation]
[drive size] [parity] [fill threshold]
[initial drives] [final drives] [Calculate]
[all at once: recoverable capacity table]
[one at a time: recoverable capacity table]
[sources + related documentation]
```

### Competitor 2: raidsize RAIDZ Expansion Calculator

- URL: https://raidsize.com/tools/raidz-expansion/en
- Accessed: 2026-08-13
- Audience and promise: [Observed] NAS and homelab users who want the “honest” immediate capacity after OpenZFS 2.3 RAIDZ expansion.
- Inputs and defaults: [Observed] RAIDZ1, four drives before expansion, 8 TB per drive, one drive to add, and 70% fill. Every numeric input is paired with a slider.
- Action and state behavior: [Observed] Results update live. No primary calculate button is needed; changing any control immediately updates the summary. No share or export action was observed on this page.
- Results and visuals: [Observed] Four scannable metrics show usable before, usable immediately after, a native pool of the same final width, and temporary gap; a sentence verdict restates the expansion and unchanged parity.
- Formula or data source: [Documented] The expandable trace states that old blocks retain ratio `N/(N-P)`, new writes use `(N+k)/(N+k-P)`, and “usable right after” combines old data with remaining raw capacity at the new ratio. It links the OpenZFS attach man page and 2.3 release notes.
- Errors and edge behavior: [Observed] RAIDZ3 with four starting drives returns a clear “Not enough drives for this RAIDZ level” state instead of a result. Numeric inputs expose broad maxima of 9999; feasibility limits such as the implementation's practical maximum width are not explained.
- Mobile and accessibility: [Observed] At 390 x 844, the page reflowed without horizontal overflow. Native select and range controls had names, but the numeric spinbuttons did not expose explicit accessible labels in the Browser snapshot.
- Privacy: [Documented] Site footer says no signup and links a privacy page; calculator-specific execution locality was not stated.
- Performance: [Observed] Inputs and result cards updated immediately during direct operation.
- Search-content structure: [Observed] Exact-match title/h1, concise answer-first introduction, calculator, formula disclosure, next-step links, a long explanatory section, and an FAQ.
- What works: The four-number hierarchy gives the fastest path to the real planning answer; invalid parity-width combinations do not fabricate results; the formula is inspectable.
- What fails: Its formula is a broad geometry model rather than version127's established exact RAIDZ allocation model, and the long article/FAQ repeats much of the tool. It says the missing capacity “unlocks as old data is rewritten” without equally emphasizing that reported accounting can remain pessimistic.
- Do not copy: Paired sliders and number inputs for every field, an oversized article/FAQ, universal claims about duration or safety, or unqualified “temporary gap” language.

```text
[RAIDZ Expansion Calculator]
[short OpenZFS 2.3 explanation]
[RAIDZ] [drives before] [drive size]
[drives to add] [fill before]
[usable before] [usable right after]
[native same width] [temporary gap]
[plain-language verdict]
[expandable calculation trace]
[next tool + articles]
[long explanation + FAQ]
```

### Competitor 3: jro.io OpenZFS Capacity Calculator

- URL: https://jro.io/capacity/
- Accessed: 2026-08-13
- Audience and promise: [Observed] Advanced ZFS planners comparing many possible pool layouts and exact capacity adjustments.
- Inputs and defaults: [Observed] Total disks, spare count, disk inventory, new-vdev type and width, recordsize, `ashift`, swap, slop behavior, reservation, units, precision, and optional AFR/effective-capacity settings.
- Action and state behavior: [Observed] Large matrices update from form changes; users can add disk sizes and custom vdev layouts. A planner can compare old and final RAIDZ widths, but there is no expansion transition state.
- Results and visuals: [Observed] Wide matrices show common layouts, RAIDZ1/2/3 widths, capacity, efficiency, overhead, and detailed calculation values.
- Formula or data source: [Documented] The page exposes a detailed calculation audit and ZFS-specific recordsize/ashift controls; it does not document RAIDZ expansion's time-dependent geometry as a tool input.
- Errors and edge behavior: [Observed] Form controls constrain selectable layout types, but the interface exposes many simultaneous settings without a guided invalid-state explanation.
- Mobile and accessibility: [Observed] At a 390-pixel viewport, document scroll width remained 1200 pixels. The matrix requires horizontal navigation. Major form inputs had labels, while the dense table is difficult to traverse.
- Privacy: [Unknown] No local-calculation or data-retention statement was observed.
- Performance: [Observed] Updates occurred quickly, but the page renders a very large set of tables even when the user's question concerns two widths.
- Search-content structure: [Observed] “OpenZFS Capacity Calculator” is the visible heading; form and matrices dominate, followed by technical notes rather than an article hierarchy.
- What works: It is the strongest exact-capacity audit and can establish trustworthy native before/after endpoints.
- What fails: It makes the user manually compare two static layouts and cannot represent old and new block generations in one expanded vdev.
- Do not copy: The spreadsheet density, 1200-pixel narrow layout, or controls unrelated to the one expansion decision.

```text
[OpenZFS Capacity Calculator]
[global disk/pool controls] [custom layout controls]
[recordsize/ashift/slop/reservation/units]
[common-layout matrix --------------------->]
[raw + mirrors matrix --------------------->]
[RAIDZ1 matrix ---------------------------->]
[RAIDZ2 matrix ---------------------------->]
[RAIDZ3 matrix ---------------------------->]
[calculation audit tables]
```

### Competitor 4: HexOS / TrueNAS Pool Planner

- URL: https://hexoscalculator.com/
- Accessed: 2026-08-13
- Audience and promise: [Observed] HexOS and TrueNAS users estimating a complete ZFS pool before building or expanding it.
- Inputs and defaults: [Observed] Pool layout, units, vdev count, drives per vdev, per-drive sizes, bulk size entry, plus advanced recordsize, `ashift`, swap, mixed-vdev, and exact-accounting controls.
- Action and state behavior: [Observed] Topology changes rebuild the visible inventory and summary; “Apply to Pool” applies a bulk disk size. There is no initial-width/final-width or existing-data input.
- Results and visuals: [Observed] Summary cards show estimated pool capacity, 20% headroom, raw capacity, redundancy, mixed-size loss, total drives, fault tolerance, formula, expansion note, and exact adjustments.
- Formula or data source: [Documented] The base explanation uses `smallest disk * (width - parity)`; advanced mode adds recordsize, `ashift`, padding, swap, and slop. The expansion note says current TrueNAS RAIDZ can widen same-parity vdevs but does not model mixed generations.
- Errors and edge behavior: [Observed] Selecting RAIDZ3 and entering three drives automatically clamped the width to five and rebuilt the inventory, avoiding a nonsensical result but not explicitly explaining the correction.
- Mobile and accessibility: [Observed] Controls have accessible labels and the card layout is responsive, but a full pool with individual drive controls creates a long input surface before the answer.
- Privacy: [Documented] A visible privacy-policy link and affiliate disclosure are present. Calculator-specific local processing is not stated on the tool surface.
- Performance: [Observed] Inventory and results updated promptly during direct operation.
- Search-content structure: [Observed] The h1 promises usable capacity before build or expansion; a “Pool Builder,” summary, drive recommendations, storage terms, and dRAID estimator follow.
- What works: Clear modern summary, mixed-drive modeling, honest geometry-versus-byte-exact caveat, and useful headroom distinction.
- What fails: “Before you build or expand” is broader than the actual calculation; it only represents the final static pool and provides no immediate post-expansion answer.
- Do not copy: Affiliate drive recommendations inside the decision flow, silent clamping, or a full multi-vdev inventory when one vdev transition is the job.

```text
[promise + supported layouts]
[affiliate drive recommendation]
[Pool Builder]
[layout] [vdev count] [width] [advanced]
[bulk size + per-drive inventory]
[sticky Pool Summary]
  [estimated] [80% target] [raw]
  [redundancy] [mixed-size loss]
  [fault tolerance + formula + expansion note]
[drive recommendations]
[storage terms]
[advanced dRAID estimator]
```

### Competitor 5: Servnet ZFS / RAIDZ Capacity Calculator

- URL: https://www.servnetuk.com/zfs-raidz-calculator
- Accessed: 2026-08-13
- Audience and promise: [Observed] Infrastructure buyers and ZFS planners comparing capacity, resilience, performance, and rebuild implications for a static layout.
- Inputs and defaults: [Observed] RAID level, vdev count, drives per vdev, drive size/class, units, and advanced read/write mix, URE rate, `ashift`, and recordsize. Default was one six-wide RAIDZ2 vdev with 8 TB nearline HDDs.
- Action and state behavior: [Observed] Results update live. A comparison mode, copy link, and PDF export are available. There is no expansion state or used-capacity input.
- Results and visuals: [Observed] Headline usable/raw/efficiency, fault tolerance, IOPS, throughput, rebuild hours, URE encounter probability, 80% fill target, and several accessible charts.
- Formula or data source: [Documented] Supporting content describes parity, OpenZFS slop, `(parity+1)` padding, recordsize/ashift, and an 80% planning target. It models a native static layout, not old-generation blocks.
- Errors and edge behavior: [Observed] Entering two drives for RAIDZ2 was coerced to three, matching the control minimum, without an inline error explaining the rejected value.
- Mobile and accessibility: [Observed] At 390 x 844, the page fit within the viewport without horizontal overflow. Controls and charts expose descriptive accessible names, though the quantity of metrics makes the primary capacity result compete with performance estimates.
- Privacy: [Documented] Site-wide privacy policy is linked in the footer; no calculator-specific local-only claim was visible.
- Performance: [Observed] Static-layout changes and chart updates were prompt in direct operation.
- Search-content structure: [Observed] Exact ZFS/RAIDZ title and h1, a three-stage configurator, result graphics, detailed explanations, exploration links, and common questions.
- What works: Excellent result scanability, explicit capacity distribution, clean responsive behavior, and a copyable URL.
- What fails: A user must record two configurations manually; rebuild and URE estimates may distract from expansion capacity and are not estimates of RAIDZ reflow duration.
- Do not copy: Silent coercion, lead-generation calls beside results, or unrelated risk/performance estimates in the expansion answer.

```text
[vendor header]
[ZFS / RAIDZ capacity calculator + visual]
[1 RAID level]
[2 vdev count + width + disk size]
[3 drive class + advanced]
[headline capacity + resilience metrics]
[capacity distribution chart]
[fault/IOPS/URE charts]
[copy link] [PDF] [pricing]
[long explanation + common questions]
```

## Comparison matrix

| Capability | TrueNAS extension | raidsize expansion | jro.io | HexOS planner | Servnet | User value |
| --- | --- | --- | --- | --- | --- | --- |
| Models old and final width together | Yes | Yes | No | No | No | High |
| Uses pre-expansion fill/data | Threshold % | Fill % | No | No | Headroom only | High |
| Shows usable capacity before | No | Yes | Manual | Static only | Static only | High |
| Shows immediate post-expansion capacity | Indirect “recoverable” | Yes | No | No | No | High |
| Shows native final-width comparator | Indirect recovery | Yes | Manual | Static only | Static only | High |
| Multi-step expansion | All-at-once vs one-at-time totals | Add count, final aggregate | Manual | No | Manual | High |
| Exact ZFS padding/ashift/record math | No | No | Yes | Advanced | Yes | Medium |
| Explicit invalid state | No for final < initial | Yes for parity-width | Constraints | Silent clamp | Silent clamp | High |
| Accounting caveat | Strong | Partial | General ZFS accounting | General estimate | General estimate | High |
| Fault tolerance unchanged | In prose | In verdict | Static tolerance | Static tolerance | Static tolerance | High |
| Expansion requirements/checklist | Linked docs | Version and command sources | No | Note only | No | High |
| Shareable state | No | No | No observed | No observed | Copy link | Medium |
| Narrow-screen behavior | No overflow; docs-heavy | No overflow | 1200 px overflow | Responsive | Responsive | High |
| Privacy/local-processing statement | Unknown | General no-signup | Unknown | Policy link | Policy link | Medium |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| What should “capacity after expansion” mean? | TrueNAS reports potentially recoverable capacity; raidsize reports immediate modeled usable; static calculators report a fresh final layout. | [`zpool-attach(8)`](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) distinguishes old and new block ratios and warns reporting may stay pessimistic. | Yes. Product planning should name three different answers: current, immediately allocatable estimate, and fresh/native final-width comparison. |
| How exact should the model be? | Direct tools use parity-ratio geometry; jro.io, HexOS, and Servnet include sector, padding, slop, and recordsize adjustments. | [OpenZFS RAIDZ space efficiency](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) and version127's existing allocation engine. | Yes. Prefer reuse of exact native-width allocation, with an explicit expansion-generation layer, rather than pretending simple drive-equivalent math is byte-exact. |
| Does old data “unlock” to native capacity after rewrite? | Direct tools describe convergence; OpenZFS says old blocks can adopt new ratios when rewritten but reported space can remain pessimistic. | [`zpool-attach(8)`](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html). | Yes. Show modeled physical convergence separately from reported accounting and avoid promising an exact command-visible total. |
| Should multi-drive expansion be modeled as one event or successive events? | TrueNAS distinguishes all-at-once versus one-at-a-time; OpenZFS attaches one new device and allows repeated expansions. | [`zpool-attach(8)`](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html) and [`vdev_raidz.c`](https://raw.githubusercontent.com/openzfs/zfs/master/module/zfs/vdev_raidz.c). | Yes. A planner should show successive one-disk steps and can offer a final-width summary, but must not imply one command adds all disks concurrently. |
| What fill input is valid? | Direct tools accept a percentage of theoretical pre-expansion capacity; exact used bytes may be more faithful to a real pool. | OpenZFS documents allocation and reporting caveats, not a canonical calculator input. | Yes. Consider accepting current used logical/allocated bytes or a fill percentage with an explicit basis and conversion. |
| Can expansion time be calculated? | Competitors mostly omit it; general tools show rebuild time, which is a different operation. | `vdev_raidz.c` says only allocated metaslab ranges are copied and progress is observable; actual rate depends on hardware and workload. | No for launch. Without user-measured copy throughput, an ETA would be fake precision. |

## Evidence-backed opportunities

1. **Make the transition, not the final layout, the visual object:** show one vdev widening step by step, with old-generation blocks, new-write efficiency, unchanged parity, and a clearly labeled accounting caveat. This directly answers the repeated confusion that static calculators cannot.
2. **Use version127's exact RAIDZ allocation basis for both endpoint widths:** jro.io, HexOS, and Servnet prove users value recordsize/ashift/padding accuracy, while the direct tools rely on simplified parity ratios. Reuse is feasible because version127 already owns a tested RAIDZ allocation core.
3. **Give three answers without conflating them:** current usable basis, estimated capacity immediately after each expansion, and a fresh/native vdev at the final width. A compact capacity bar and width timeline can communicate this faster than recovery-only tables.
4. **Treat invalid and unsupported plans as first-class states:** reject final width at or below initial width, below-minimum parity layouts, non-RAIDZ layouts, too-small new disks, nonfinite values, and unsupported width limits. Never silently clamp or calculate negative recovery.
5. **Provide an operational preflight, not a safety verdict:** state OpenZFS 2.3+, feature availability, healthy vdev, matching-or-larger new disk, backup, unchanged parity, and the command distinction. Do not tell users an expansion is universally safe or recommend parity from capacity math alone.
6. **Expose the calculation trace and sources:** show each step's old/new data ratio, data basis, raw space, immediate increment, native comparator, and rounding. Link directly to OpenZFS rather than relying on unexplained “honest number” branding.
7. **Make clean state sharing useful:** a stable clean route for SEO, optional explicit share state, reset, and copy summary can outperform both direct tools without cluttering the main input flow.

## Table stakes

- RAIDZ1, RAIDZ2, and RAIDZ3 with validated starting widths.
- Common drive size with explicit TB/TiB semantics and a rule that the added device cannot be smaller than the smallest existing member.
- Initial width, number of one-disk additions or final width, and a clearly defined pre-expansion used/fill input.
- Explicit Calculate action or equally clear live-update semantics; inventory and edit actions must not replace the primary result action.
- Current, immediate-after, native-final, incremental-gain, and gap results with units and percentages.
- Unchanged parity/fault-tolerance statement in the result, not buried in prose.
- Step timeline for multiple expansions.
- Invalid, empty, partial, and recovery states with no stale result.
- Calculation trace, OpenZFS version/source links, and honest accounting limitations.
- Responsive desktop and narrow layouts, keyboard-operable controls, accessible result names, clean base URL, reset, and local-processing disclosure when true.

## Ideas to reject

- **Expansion-duration or drive-failure-risk prediction by default:** actual reflow rate, allocated bytes, workload, hardware, errors, and pause/resume state are not captured reliably by a few capacity inputs.
- **A universal “safe to expand” verdict:** health, backup quality, platform integration, device identity, SMART state, enclosures, and operational risk require live evidence and human judgment.
- **Changing RAIDZ parity during expansion:** OpenZFS expansion widens the vdev and preserves RAIDZ1/2/3. Parity conversion is a different rebuild/migration decision.
- **Mirrors, dRAID, SHR, Unraid, new-vdev addition, or larger-disk replacement in the same calculator:** these have different operations and capacity semantics and would dilute the one decisive job.
- **Silent input coercion:** TrueNAS accepts a shrink plan and two static calculators clamp invalid widths; both damage trust.
- **Cost, affiliate drive recommendations, IOPS, throughput, URE, compression ratio, dedup, and workload recommendations in the core result:** useful elsewhere, but they obscure the capacity transition and invite fake precision.
- **A long tutorial or FAQ before the answer:** source-backed prerequisites and limitations belong in a compact guide after a working result.
- **Calling the modeled difference “lost” or guaranteeing it is “temporary”:** old block geometry, rewrite behavior, snapshots, and reported accounting require more precise wording.

## Open questions and blockers

- Product planning must choose the exact input basis for pre-expansion occupancy: percentage of modeled native capacity, current allocated bytes, or both with a documented conversion.
- Product planning must decide whether the result estimates actual block allocation only or also provides a separate pessimistic reported-capacity view. OpenZFS explicitly warns those can diverge.
- Product planning must specify the supported maximum RAIDZ width and whether one scenario may contain multiple completed historical expansions. The technical source supports repeated expansions, but a simple launch model may intentionally represent one current width and a future sequence.
- No research blocker remains. The category is narrow but the saturation exception is evidenced: two exact transition calculators and three operated static planners cover the meaningful live competitive surface found by the query set.

## Sources

- OpenZFS 2.3.0 release: https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0, accessed 2026-08-13. [Documented] Introduction of RAIDZ Expansion in 2.3.0.
- OpenZFS `zpool-attach(8)`: https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html, accessed 2026-08-13. [Documented] Command, disk-size requirement, progress, fault behavior, unchanged parity, repeated expansion, old/new ratios, scrub, and accounting caveat.
- OpenZFS Changing Pool Layout: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html, accessed 2026-08-13. [Documented] Distinction from `zpool add` and disk replacement, one-way topology cautions, and expansion summary.
- OpenZFS RAIDZ: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html, accessed 2026-08-13. [Documented] Approximate native geometry, exact sector/record effects, parity levels, performance context, and expansion behavior.
- OpenZFS `zpool-features(7)`: https://openzfs.github.io/openzfs-docs/man/master/7/zpool-features.7.html, accessed 2026-08-13. [Documented] `org.openzfs:raidz_expansion` feature definition and read-only incompatibility.
- OpenZFS `vdev_raidz.c`: https://raw.githubusercontent.com/openzfs/zfs/master/module/zfs/vdev_raidz.c, accessed 2026-08-13. [Documented] Expansion design, reflow, health and pause rules, resumability, time-dependent geometry, on-disk state, copied-data behavior, and post-expansion scrub.
- TrueNAS RAIDZ Extension Calculator: https://www.truenas.com/docs/references/extensioncalculator/, accessed 2026-08-13. [Observed] Exact competitor inputs, results, invalid shrink behavior, content, and responsive layout.
- raidsize RAIDZ Expansion Calculator: https://raidsize.com/tools/raidz-expansion/en, accessed 2026-08-13. [Observed] Exact competitor live calculation, invalid state, formula disclosure, hierarchy, and responsive layout.
- jro.io OpenZFS Capacity Calculator: https://jro.io/capacity/, accessed 2026-08-13. [Observed] Exact static-layout comparison and narrow-screen overflow.
- HexOS / TrueNAS Pool Planner: https://hexoscalculator.com/, accessed 2026-08-13. [Observed] Static pool planner, advanced exact settings, expansion note, silent width clamp, and result hierarchy.
- Servnet ZFS / RAIDZ Calculator: https://www.servnetuk.com/zfs-raidz-calculator, accessed 2026-08-13. [Observed] Static pool planner, exact adjustments, responsive result graphics, copy/export actions, and silent width clamp.
- TrueNAS forum RAIDZ2 expansion report: https://forums.truenas.com/t/raidz2-expansion-unexplained-10tb-space-loss-2x-overhead/53600, accessed 2026-08-13. [Observed] User confusion about post-expansion space.
- OpenZFS RAIDZ Expansion discussion #15232: https://github.com/openzfs/zfs/discussions/15232, accessed 2026-08-13. [Observed] Repeated questions about eligibility, parity, rewrite, reporting, time, and operational behavior.
- TrueNAS community RAIDZ expansion thread: https://www.truenas.com/community/threads/raidz-expansion-its-happening-someday.58575/, accessed 2026-08-13. [Observed] Long-running demand and multi-step expansion concerns.

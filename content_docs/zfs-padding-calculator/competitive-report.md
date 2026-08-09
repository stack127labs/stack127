# Competitive report: ZFS Block Size and Padding Calculator

Status: ready
Tool: ZFS Block Size and Padding Calculator
Route: `/zfs-padding-calculator`
Researched: 2026-08-05
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

### Current version127 state

This is a new, unpublished tool. version127 already has a mixed-drive RAID calculator and a ZFS pool capacity calculator, but neither is a focused interactive explanation of how one logical ZFS block becomes data, parity, and padding on a RAIDZ vdev.

### Method and coverage

The review combined:

- direct operation of five relevant calculators;
- desktop and narrow-screen inspection where the competitor allowed it;
- primary-source verification against OpenZFS documentation and `vdev_raidz.c`;
- community evidence for recurring questions about `ashift`, `recordsize`, `volblocksize`, parity, and padding;
- searches for adjacent terms until new queries returned the same tools or non-comparable results.

### Search saturation evidence

Queries included `ZFS block size padding calculator`, `RAIDZ ashift recordsize calculator`, `how much physical space does a ZFS record use on RAIDZ`, and `RAIDZ small volblocksize padding waste calculator`. The same five direct or partial competitors recurred. Exclusions were generic RAID calculators without block-level behavior, articles and forum answers without an interactive tool, vendor capacity tools that do not expose padding, and duplicate or translated pages.

- Queries tried: `ZFS block size padding calculator`, `RAIDZ ashift recordsize calculator`, `how much physical space does a ZFS record use on RAIDZ`, and `RAIDZ small volblocksize padding waste calculator`.
- Repeated domains: jro.io, servnetuk.com, wintelguy.com, professionalcalculators.com, and 45drives.com.
- Exclusions: Generic RAID calculators without block-level behavior, articles and forum answers without an interactive tool, vendor capacity tools that do not expose padding, and duplicate or translated pages.

The market is small but the problem is real: existing tools either bury block allocation inside a whole-pool calculator, fix important values, silently coerce invalid layouts, or show a capacity number without making the stripe mechanics understandable.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Learn | `why does a small ZFS block waste space on RAIDZ` | A visual data/parity/padding split for one block. | Forum answers and broad calculators. |
| Configure | `best recordsize or volblocksize for RAIDZ` | Compare the selected size with nearby valid sizes without declaring a universal optimum. | Articles and workload guidance. |
| Diagnose | `why is my zvol using more physical space` | Show per-block allocation and the effect of repeated blocks. | Forum troubleshooting. |
| Verify | `does ashift 12 change RAIDZ allocation` | Recalculate with the selected sector size and expose every rounding step. | Broad pool calculators. |
| Explore | `RAIDZ padding calculator` | Immediate, deterministic comparison across parity and width. | A small set of pool calculators. |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Users do not understand why an 8 KiB RAIDZ2 block can consume data, parity, and padding sectors. | [Reddit: Question on ashift and recordsize](https://www.reddit.com/r/zfs/comments/1bpweyl) | Repeated | Show the actual sector count and label padding separately. |
| Users confuse pool free-space behavior with `ashift` and partial-stripe allocation. | [Reddit: Confused about ashift and free space](https://www.reddit.com/r/zfs/comments/kkbqm8) | Repeated | Keep the tool explicitly block-level and explain what it does not forecast. |
| Small zvol blocks can create unexpectedly large parity and padding overhead. | [Proxmox: zfs used size vs volsize](https://forum.proxmox.com/threads/zfs-used-size-vs-volsize.95193/post-413294) | Repeated | Support `volblocksize` language and a repeated-block estimate. |
| RAIDZ3 zvol usage can look surprising beside mirrors. | [Proxmox: Unexpected pool usage of ZVOL](https://forum.proxmox.com/threads/unexpected-pool-usage-of-zvol-created-on-raidz3-pool-vs-mirrored-pool.65018/) | Occasional | Include RAIDZ1, RAIDZ2, and RAIDZ3 and make parity count visible. |
| Logical and physical zvol usage are commonly mistaken for equivalent values. | [Server Fault: strange ZFS disk space usage report for a ZVOL](https://serverfault.com/questions/512018/strange-zfs-disk-space-usage-report-for-a-zvol) | Repeated | Use precise labels and avoid promising exact observed pool usage. |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| RAIDZ stores variable-width stripes and adds parity for each allocation. | [OpenZFS RAIDZ structure](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | Documented | This tool models one supported RAIDZ allocation, not an entire pool. |
| `recordsize` is the maximum logical block size for files, while `volblocksize` is the block size for zvols. | [OpenZFS workload tuning](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html) | Documented | UI terminology must distinguish datasets from zvols. |
| RAIDZ parity sectors depend on data sectors, data-column count, and whether a partial row remains. | [OpenZFS `vdev_raidz.c`](https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c) | Documented | Match current source behavior within explicitly supported exclusions. |
| Allocation rounds to a multiple of `P + 1` sectors, creating padding sectors when needed. | [OpenZFS `vdev_raidz.c`](https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c) | Documented | Padding must be shown independently from parity. |

Primary sources: [OpenZFS RAIDZ structure](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html), [OpenZFS workload tuning](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html), and [OpenZFS `vdev_raidz.c`](https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c).

For a logical block rounded to `s` sectors, vdev width `N`, parity level `P`, and sector size `S = 2^ashift`:

1. `data columns = N - P`
2. `q = floor(s / data columns)` and `r = s mod data columns`
3. `parity sectors = P × (q + (r != 0 ? 1 : 0))`
4. `raw sectors = s + parity sectors`
5. `allocated sectors = roundup(raw sectors, P + 1)`
6. `padding sectors = allocated sectors - raw sectors`
7. `allocated bytes = allocated sectors × S`

This models the RAIDZ allocation represented by the current OpenZFS code path for the supported scope. It must not be presented as exact whole-pool forecasting: metaslabs, metadata, slop space, copies, compression outcomes, gang blocks, fragmentation, special vdevs, dRAID, and implementation changes can affect observed usage. Compression is not knowable from an input ratio alone, so an optional compressed logical-size scenario must be labeled as an estimate.

## Competitor reviews

### Competitor 1: OpenZFS Capacity Calculator by jro.io

- **URL:** https://jro.io/capacity/
- **Accessed:** 2026-08-05
- **Audience:** Advanced ZFS planners comparing complete pool layouts.
- **Inputs:** Disk inventory, spares, vdev type and width, recordsize, `ashift`, slop, and allocation assumptions.
- **Primary action:** Edit a large configuration table; results update into multiple layout matrices.
- **Results:** Whole-pool capacity matrices plus a detailed calculation-value audit.
- **Formula transparency:** High. It exposes intermediate values and record-size effects.
- **Invalid states:** Layout availability is constrained, but the interface is dense and guidance competes with the matrices.
- **Mobile/responsive:** Desktop inspected at 1280 × 720. The many wide matrices require horizontal navigation at narrow widths.
- **Privacy:** Unknown from the calculator surface.
- **Performance:** Functional, but the result volume and matrix breadth make the page cognitively heavy.
- **Search/content:** Strong technical explanation and terminology around OpenZFS capacity.
- **Works well:** Deep auditability, many configurations, recordsize and `ashift` controls.
- **Fails:** Padding is not the primary story; a user must interpret a pool-sized model to answer a block-sized question.
- **Do not copy:** The wide spreadsheet-like interface, exhaustive defaults, or result-first information overload.

```text
OpenZFS Capacity Calculator
[ disk and vdev input table                         ]
[ common layouts matrix                            ]
[ RAIDZ1 matrix                                    ]
[ RAIDZ2 matrix                                    ]
[ RAIDZ3 matrix                                    ]
[ long formula walkthrough                         ]
[ calculation values audit table                   ]
```

- [Observed] Recordsize choices span 4 KiB through 16 MiB.
- [Observed] `ashift` choices include 9, 12, 13, and 14.
- [Observed] Separate matrices exist for RAIDZ1, RAIDZ2, and RAIDZ3.
- [Observed] The page provides a detailed calculation-value table.
- [Observed] The result can change sharply with recordsize; one operated six-wide RAIDZ2 example fell from about 65.29 TiB at 128 KiB to about 32.49 TiB at 4 KiB.
- [Inferred] The page is better suited to expert pool planning than to teaching one allocation event.

### Competitor 2: Servnet ZFS RAIDZ Calculator

- **URL:** https://www.servnetuk.com/zfs-raidz-calculator
- **Accessed:** 2026-08-05
- **Audience:** Users estimating a RAIDZ pool with adjustable block geometry.
- **Inputs:** Drive count and size, RAIDZ level, `ashift`, and record size.
- **Primary action:** Change configuration controls and inspect updated totals.
- **Results:** Usable, parity, and ZFS-padding capacity.
- **Formula transparency:** Moderate. It names padding but does not teach each sector allocation.
- **Invalid states:** A below-minimum RAIDZ2 width was silently clamped to three drives.
- **Mobile/responsive:** Operated on desktop and narrow layout; controls remain usable, but the page is a pool calculator rather than a block explorer.
- **Privacy:** Unknown from the calculator surface.
- **Performance:** Lightweight and responsive during direct use.
- **Search/content:** The title and explanatory text directly target ZFS RAIDZ capacity.
- **Works well:** Padding is a first-class result instead of being hidden inside usable capacity.
- **Fails:** Silent input correction can leave users believing they tested an impossible topology.
- **Do not copy:** Automatic clamping without an inline explanation or a visible invalid state.

```text
ZFS RAIDZ Calculator
[ drive count ] [ drive size ] [ RAIDZ level ]
[ ashift      ] [ record size                  ]
[ usable ] [ parity ] [ ZFS padding            ]
[ short explanation                            ]
```

- [Observed] Padding is separated from parity and usable capacity.
- [Observed] RAIDZ2, `ashift`, and recordsize were independently adjustable.
- [Observed] Six 8 TB drives at RAIDZ2 and 8 KiB recordsize displayed 16 TB each for usable, parity, and padding.
- [Observed] A two-wide RAIDZ2 entry became three drives.
- [Observed] Results updated without a difficult multi-step workflow.
- [Inferred] Clearer error handling would materially improve trust.

### Competitor 3: WintelGuy ZFS Capacity Calculator

- **URL:** https://wintelguy.com/zfs-calc.pl
- **Accessed:** 2026-08-05
- **Audience:** Administrators who want a traditional form-based pool estimate.
- **Inputs:** RAIDZ level, sector size, drive capacity, number of groups, and drives per group.
- **Primary action:** Submit the form with Calculate.
- **Results:** Pool totals including a combined reservation for parity and padding.
- **Formula transparency:** Low to moderate. The output names the combined reservation, but padding is not isolated.
- **Invalid states:** A below-minimum RAIDZ2 width was clamped to three.
- **Mobile/responsive:** Form is compact, but table-oriented presentation is dated and less scannable on narrow screens.
- **Privacy:** Unknown from the calculator surface.
- **Performance:** Fast server-style calculation.
- **Search/content:** Directly targets ZFS storage-capacity searches and provides explanatory labels.
- **Works well:** Compact input set and explicit calculate action.
- **Fails:** Recordsize is fixed at 128 KiB, preventing the most useful padding exploration.
- **Do not copy:** Combining parity and padding into one loss number or silently coercing invalid topology.

```text
ZFS Capacity Calculator
[ RAIDZ ] [ sector size ] [ drive size ]
[ groups ] [ drives per group          ]
[ Calculate ]
[ capacity summary table               ]
[ parity and padding reservation       ]
```

- [Observed] Sector size is selectable.
- [Observed] Recordsize is displayed as a fixed 128 KiB value.
- [Observed] Results combine parity and padding.
- [Observed] A two-wide RAIDZ2 input became a three-wide layout.
- [Observed] The form requires a clear Calculate action.
- [Inferred] Its constrained model reduces ambiguity but cannot answer block-size questions.

### Competitor 4: Professional Calculators ZFS Calculator

- **URL:** https://professionalcalculators.com/zfs-calculator/
- **Accessed:** 2026-08-05
- **Audience:** General users seeking a polished ZFS sizing calculator.
- **Inputs:** Drive layout plus advanced recordsize and `ashift` settings.
- **Primary action:** Configure the form and select Calculate.
- **Results:** Usable-capacity cards and supporting breakdowns.
- **Formula transparency:** Low. Advanced settings are echoed but their effect is not auditable.
- **Invalid states:** Basic form constraints exist; deeper topology behavior was not clearly explained.
- **Mobile/responsive:** Modern card layout adapts more cleanly than matrix competitors.
- **Privacy:** Unknown from the calculator surface.
- **Performance:** Responsive during direct use.
- **Search/content:** Strong keyword coverage with explanatory and FAQ sections.
- **Works well:** Approachable form styling, plain labels, and a recognizable result hierarchy.
- **Fails:** In an operated example, changing recordsize from 128 KiB to 8 KiB and `ashift` from 12 to 9 left usable capacity unchanged at 3.75 TB, even though the selected values were shown.
- **Do not copy:** Controls that appear meaningful but do not visibly or verifiably affect calculation output.

```text
ZFS Calculator
[ primary configuration form          ]
[ advanced: recordsize | ashift        ]
[ Calculate                            ]
[ usable-capacity result cards         ]
[ breakdown and explanation            ]
[ FAQ                                  ]
```

- [Observed] Recordsize and `ashift` appear in advanced settings.
- [Observed] The selected advanced values were repeated in the result.
- [Observed] The operated result remained 3.75 TB after materially changing both values.
- [Observed] The page uses a modern card hierarchy.
- [Observed] Explanatory and FAQ copy follows the calculator.
- [Inferred] The advanced settings may be cosmetic, incomplete, or applied outside the visible capacity total.

### Competitor 5: 45Drives ZFS Capacity Calculator

- **URL:** https://www.45drives.com/zfs/zfs-calculator/
- **Accessed:** 2026-08-05
- **Audience:** Storage buyers and ZFS users comparing server layouts.
- **Inputs:** RAIDZ level, sector size, drive capacity, group count, and width through an embedded calculator.
- **Primary action:** Configure and calculate within the embedded frame.
- **Results:** Capacity totals with parity/padding described together.
- **Formula transparency:** Low. Recordsize is fixed and padding is folded into the broader allocation.
- **Invalid states:** A below-minimum RAIDZ2 width was clamped to three.
- **Mobile/responsive:** The surrounding page adapts, but the embedded table constrains narrow-screen polish.
- **Privacy:** Unknown from the calculator surface.
- **Performance:** Usable, with additional page and iframe weight.
- **Search/content:** Strong commercial landing-page framing and educational supporting copy.
- **Works well:** Familiar inputs and an immediately recognizable capacity result.
- **Fails:** Fixed 128 KiB recordsize and combined parity/padding prevent focused diagnosis.
- **Do not copy:** The iframe boundary, fixed block-size assumption, or combined loss category.

```text
ZFS Capacity Calculator
[ explanatory introduction             ]
[ embedded calculator frame            ]
| [ RAIDZ | sector | disks | groups ] |
| [ Calculate ] [ capacity results ]  |
[ supporting explanation and links     ]
```

- [Observed] The calculator is embedded in an iframe.
- [Observed] RAIDZ2 and sector size are configurable.
- [Observed] Recordsize is fixed at 128 KiB.
- [Observed] Parity and padding are not separate result categories.
- [Observed] A two-wide RAIDZ2 input became a three-wide layout.
- [Inferred] The commercial page is useful for lead generation but weak as a transparent diagnostic tool.

## Comparison matrix

| Capability | jro.io | Servnet | WintelGuy | Professional | 45Drives | version127 opportunity |
| --- | --- | --- | --- | --- | --- | --- |
| Per-block focus | No | No | No | No | No | Make one allocation the central object. |
| Adjustable block size | Yes | Yes | Fixed | Shown, questionable effect | Fixed | Support recordsize/volblocksize presets and exact bytes. |
| Adjustable `ashift` | Yes | Yes | Sector size | Shown, questionable effect | Sector size | Show sector bytes and resulting sectors. |
| Separate padding | Audit only | Yes | No | Unclear | No | Always show data, parity, and padding separately. |
| Nearby-size comparison | Matrix indirectly | No | No | No | No | Add a compact comparison around the selected size. |
| Transparent intermediate math | Strong | Limited | Limited | Weak | Weak | Provide an expandable calculation trace. |
| Invalid topology explanation | Constrained | Silent clamp | Silent clamp | Limited | Silent clamp | Preserve input and explain why it is invalid. |
| Narrow-screen clarity | Weak matrices | Acceptable | Dated table | Good cards | Iframe-limited | Design mobile-first with no horizontal result table. |
| Whole-pool estimate | Yes | Yes | Yes | Yes | Yes | Explicitly link to, not duplicate, the ZFS pool calculator. |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Should parity and padding be combined? | Servnet separates them; WintelGuy and 45Drives combine them. | OpenZFS allocation code exposes the rounding behavior separately from parity. | No. Display them independently. |
| What should happen to an impossible width? | Three competitors silently clamp the value. | RAIDZ parity level implies a minimum of `P + 1` members. | No. Preserve the input and show a blocking message. |
| Do recordsize and `ashift` have to affect output? | jro.io and Servnet visibly respond; one competitor appeared not to. | OpenZFS allocation math uses logical sectors and physical sector size. | No. Every visible control must be testably wired. |
| Is this a whole-pool estimate? | Competitors add slop and other reservations to pool models. | OpenZFS docs distinguish block allocation from pool-level reservations. | No. Keep the result block-level. |
| Can the tool identify the best block size? | Some calculators imply configuration optimization. | Workload requirements extend beyond capacity efficiency. | No. Compare efficiency without a universal recommendation. |

## Evidence-backed opportunities

1. **Allocation bar:** Distinct data, parity, and padding colors answer the repeated confusion visible in community questions.
2. **Sector strip:** Individual sectors make OpenZFS roundup behavior inspectable rather than magical.
3. **Nearby-size comparison:** A compact chart reveals abrupt efficiency changes that broad pool calculators bury.
4. **Calculation trace:** Logical bytes → rounded data sectors → parity sectors → padding sectors → physical bytes makes the primary-source formula auditable.
5. **Copyable summary:** Inputs, formula version, and limitations help users discuss results without treating them as exact pool forecasts.

## Table stakes

- RAIDZ1, RAIDZ2, and RAIDZ3.
- Width validation against parity level.
- `ashift` presets with the actual sector size visible.
- Recordsize and volblocksize presets plus a custom power-of-two value.
- Data, parity, padding, total physical allocation, overhead percentage, and efficiency.
- Immediate recalculation or an unmistakable primary Calculate action.
- Clear empty, invalid, and valid states.
- Desktop and mobile layouts without clipped values.
- Deterministic URL sharing only on explicit user action; the clean route must remain the default SEO URL.
- A nearby-block-size comparison and an auditable math view.

## Ideas to reject

- A full pool-capacity calculator duplicated under another name.
- Silent coercion of invalid widths or block sizes.
- Controls that do not affect the calculation.
- A single “waste” number that merges parity with padding.
- Exact compression predictions or whole-pool promises.
- dRAID, gang-block, metadata, special-vdev, or fragmentation simulation in version 1.
- A universal “optimal recordsize” recommendation.
- Wide result tables as the primary visualization.

## Open questions and blockers

None for product planning. The product report must lock whether the optional compression scenario belongs in version 1, define exact supported block-size bounds, and specify how the existing `lib/storage/zfs.ts` primitive is reused or extended without changing the finished pool calculator.

## Sources

- https://jro.io/capacity/
- https://www.servnetuk.com/zfs-raidz-calculator
- https://wintelguy.com/zfs-calc.pl
- https://professionalcalculators.com/zfs-calculator/
- https://www.45drives.com/zfs/zfs-calculator/
- https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html
- https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html
- https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c
- https://www.reddit.com/r/zfs/comments/1bpweyl
- https://www.reddit.com/r/zfs/comments/kkbqm8
- https://forum.proxmox.com/threads/zfs-used-size-vs-volsize.95193/post-413294
- https://forum.proxmox.com/threads/unexpected-pool-usage-of-zvol-created-on-raidz3-pool-vs-mirrored-pool.65018/
- https://serverfault.com/questions/512018/strange-zfs-disk-space-usage-report-for-a-zvol

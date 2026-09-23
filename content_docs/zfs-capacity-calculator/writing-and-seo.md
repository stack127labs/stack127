# ZFS Pool Capacity Calculator writing and SEO plan

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready

Tool: ZFS Pool Capacity Calculator

Route: `/zfs-capacity-calculator`

Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`

SERP checked: 2026-08-04

Primary medium: Tool UI


## Search intent

### Intent map

| Priority | Query family | User job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | ZFS pool capacity calculator | Build a planned pool and see the estimated writable physical capacity | Interactive calculator with an immediate, answer-first breakdown | Put the topology composer first, support mixed top-level vdevs, and show the per-vdev result before the pool total |
| Secondary | RAIDZ capacity calculator ashift recordsize | Understand how sector size, block size, parity, and padding affect RAIDZ capacity | Calculator controls plus a compact technical explanation | Keep `ashift` and `recordsize` or `volblocksize` visible, then expose the allocation equation and one worked example |
| Secondary | ZFS mixed vdev capacity calculator | Model unequal drives and multiple top-level vdev layouts in one pool | Topology-first builder with per-vdev results | Treat every top-level vdev as its own capacity and failure boundary, then sum the vdev contributions |
| Supporting | ZFS usable capacity calculator | Reconcile a theoretical estimate with what OpenZFS tools may report | Capacity estimate with careful scope language | Label the headline as estimated writable physical data and explain why installed `zpool` and `zfs` values can differ |

The page targets one primary query family: people looking for a ZFS pool capacity calculator. The specialist and mixed-vdev queries refine the inputs and result explanation, but do not turn the page into separate articles.

### SERP verification

Google web results were checked on 2026-08-04. This is a time-bound search snapshot, not a permanent ranking claim.

| Query checked | Visible result shape | Decision for this page |
| --- | --- | --- |
| `ZFS pool capacity calculator` | The result set was dominated by direct calculators from 45Drives, WintelGuy, RAIDZ Calculator, TrueNAS, zfs-calculator.com, and jro.io | Lead with working inputs and results. Do not place an article before the tool |
| `RAIDZ capacity calculator ashift recordsize` | Direct calculators remained prominent, while the result page also surfaced an explanation of `ashift`, block size, parity, and padding | Keep advanced controls discoverable and provide a short sourced formula interpretation below the result |
| `ZFS mixed vdev capacity calculator` | Direct results were weaker for the word `mixed`; several results omitted that term, while one calculator and community discussions addressed mixed layouts | Make mixed top-level vdevs and per-vdev accounting the distinguishing promise, not a buried advanced mode |

### Intent not targeted

- RAIDZ performance, IOPS, latency, resilver time, or unrecoverable read error probability.
- Hardware buying advice or appliance-specific TrueNAS, Proxmox, or vendor configuration guidance.
- Capacity reconstruction for an already expanded pool with old and new RAIDZ allocation ratios.
- Dataset quotas, snapshots, fragmentation, metadata growth, and app-visible free-space prediction.
- Detailed per-block padding comparison across many record sizes. That belongs in the planned ZFS padding calculator.
- Conventional RAID capacity without OpenZFS allocation behavior. That belongs in the existing RAID calculator.

## Page promise

Build a fresh mixed-vdev OpenZFS topology and get a sourced estimate of writable physical capacity, per-vdev failure boundaries, and the major modeled allocation losses without pretending to predict installed dataset free space.

## Heading and media outline

The input and answer stay above the explanatory material. The result should remain understandable without reading the static prose.

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: ZFS pool capacity calculator for mixed vdevs | Is this the calculator for the pool I am planning? | It models fresh OpenZFS pools with mixed top-level vdevs | Tool UI | Product contract and primary query family | Keep the title and differentiator visible before explanation | N/A |
| 2 | Opening lede below H1 | What will this calculator tell me, and where does its estimate stop? | The result is a sourced planning estimate, not installed free space | Sentences | Competitive and implementation reports | Do not explain formulas or auxiliary roles. | COPY-01 |
| 3 | Tool region: no extra heading | How do I represent my planned topology? | Build each top-level vdev and enter the assumptions that affect allocation | Tool UI | Implementation report sections 3 and 4 | Keep all construction actions visible from the empty state | N/A |
| 4 | Result region: estimated writable physical data | What is the answer, and what is the safer planning target? | Physical capacity is primary and the selected planning target is separate | Tool UI | Calculation and interaction contracts | Do not merge reserves or hide the explicit Calculate action | N/A |
| 5 | H2: Each top-level vdev is its own capacity and failure boundary | Which part of the pool contributes capacity, and where can failure occur? | Every vdev keeps its own member limit and redundancy boundary | Topology/diagram | OpenZFS VDEVs and RAIDZ documentation | Preserve pool, vdev, and drive hierarchy without numerical decoration | N/A |
| 6 | H2: Where the entered capacity goes | How much capacity is data, parity, padding, slop, headroom, auxiliary, or unusable drive tail? | Every modeled byte has a named result category | Exact result visualization | Deterministic engine output | Keep exact values in the adjacent table; do not fabricate minimum bar widths | N/A |
| 7 | Allocation legend | What are the exact values behind the visual? | Pool totals must reconcile with the per-vdev rows | Exact labelled values | Deterministic engine output | Keep each category once and do not add a second accounting table | N/A |
| 8 | H2: Auxiliary devices do not all count as pool data | Do spares, SLOG, L2ARC, and special vdevs increase general data capacity? | Only the separate special envelope has capacity, and it is not general data | Table | OpenZFS VDEVs and special-vdev documentation | Keep role, capacity status, redundancy, and consequence in repeated columns | N/A |
| 9 | H2: What this capacity estimate can promise | Is this the same as the free space I will see after installation? | The calculator models a controlled fresh-pool scenario and names what it excludes | Sentences | Implementation and edge-case reports | Do not repeat topology instructions or the installed-report explanation. | COPY-02 |
| 10 | H2: Why ashift and block size change RAIDZ capacity | Why does changing a block setting alter the answer with the same drives? | Sector count, parity, and allocation rounding change the physical cost of a logical block | Sentences | OpenZFS RAIDZ documentation and source code | Use only the assigned worked example. | COPY-03 |
| 11 | In-section table: RAIDZ allocation steps | How does the calculator derive physical allocation? | Each symbol, rounding operation, and result field is inspectable | Table | OpenZFS `vdev_raidz.c` and implementation report | Do not duplicate the full equations in COPY-03 | N/A |
| 12 | H2: Slop and planning headroom are different reserves | Why are two reserves subtracted, and can I change them? | Slop models OpenZFS behavior while headroom is the user's planning policy | Sentences | OpenZFS module parameters and implementation report | Never present 20 percent as mandatory. | COPY-04 |
| 13 | H2: Why installed free space can be lower | Why might `zpool list` or `zfs list` disagree with this estimate? | Reporting layers, workload state, and historical expansion change installed values | Sentences | OpenZFS `zpoolprops`, `zfs-list`, workload tuning, and changing-layout documentation | Do not repeat COPY-02's exclusion list. | COPY-05 |
| 14 | H2: Review the topology before creating the pool | Can I verify the planned command without changing a system? | A placeholder-based dry-run command mirrors the modeled topology | Tool UI | OpenZFS `zpool-create` manual | Never execute a command or insert real device paths | N/A |
| 15 | H2: The estimate stays auditable | Which assumptions, engine version, and sources produced this answer? | The result carries its calculation version, assumptions, units, and sources | Table | State envelope and source ledger | Keep audit fields machine-readable and out of narrative prose | N/A |

No FAQ section is planned. The material questions are answered by the input controls, result artifacts, and four focused explanation sections. A standalone FAQ would repeat those answers and expand the prose footprint.

## Formula explanation

### Required formula table

| Step | Displayed relationship | What the page should explain | Units and rounding | Placement | Source |
| --- | --- | --- | --- | --- | --- |
| Normalize each drive | Convert the entered decimal or binary capacity to exact bytes | All internal calculations use integer bytes. Display-unit choices do not change the stored value | Bytes, exact integer conversion | Advanced result details | Implementation report |
| Find active vdev width | `C = min(member capacities)` and `R_vdev = C * N` | A top-level vdev can only use the common member capacity for its active geometry. Larger member tails remain visible as unusable tail capacity | Bytes, no hidden decimal conversion | Per-vdev result table | OpenZFS VDEVs documentation |
| Align the selected block | `S = 2^ashift` and `L = ceil(B / S)` | `B` is `recordsize` for filesystems or `volblocksize` for zvols. `ashift` sets the allocation-sector size | Sector bytes; ceiling to whole sectors | RAIDZ formula details | OpenZFS RAIDZ documentation |
| Add RAIDZ parity sectors | `Y = P * ceil(L / (N - P))` | `N` is column count and `P` is parity count. RAIDZ1, RAIDZ2, and RAIDZ3 use one, two, and three parity columns | Sectors; ceiling per parity column | RAIDZ formula details | OpenZFS RAIDZ documentation and `vdev_raidz.c` |
| Apply RAIDZ allocation rounding | `A = roundUp(L + Y, P + 1)` | The physical allocation is rounded to a valid RAIDZ allocation multiple, which exposes padding instead of hiding it inside an efficiency percentage | Sectors; round upward | RAIDZ formula details | OpenZFS `vdev_raidz.c` |
| Derive the vdev physical data contribution | Scale the active vdev bytes by the selected block's logical-to-physical allocation ratio | Mirrors use the smallest member once. RAIDZ uses the selected block model consistently across the fresh vdev | Bytes; integer arithmetic with named floor or ceiling operations | Per-vdev table | Implementation report |
| Subtract OpenZFS slop | `slop = max(min(D_pool >> shift, 128 GiB), min(D_pool >> 1, 128 MiB))` | Use the OpenZFS default shift unless advanced mode overrides it. Show slop independently from all planning policy | Bytes; integer shifts and exact caps | Pool breakdown and assumptions | OpenZFS module parameters and `spa_misc.c` |
| Apply planning headroom | `planningTarget = E - floor(E * reserveBasisPoints / 10000)` | Headroom is a user-selected planning policy, defaulting to 20 percent. It is not another OpenZFS on-disk allocation rule | Bytes; basis points; floor the reserve | Headline result companion | Product and calculation contracts |
| Show compression scenario | `logicalScenario = E * ratio` | Compression is an optional conditional logical-capacity scenario. It must never replace or enlarge the physical-capacity headline | Bytes; clearly label approximation and entered ratio | Secondary result | OpenZFS compression documentation |

### Worked example assignment

COPY-03 may use one exact example only: a three-disk RAIDZ1 vdev with `ashift=12` and a 128 KiB logical block. The formula gives 32 logical sectors, 16 parity sectors, and 48 allocated sectors, so the 128 KiB logical block consumes 192 KiB physically before later pool-level reserves. The writer must explain why this is a block-allocation example, not a promise that every workload will use that ratio.

### Caveat placement

| Caveat | Placement | Presentation rule |
| --- | --- | --- |
| Fresh planned pools only | Opening lede and result assumptions | State once near the tool and repeat compactly in the auditable assumptions table |
| Uniform selected-block model | COPY-02 and formula details | Explain that real workloads contain multiple block sizes without turning the page into a workload simulator |
| Installed `zpool` and `zfs` values can differ | COPY-05 | Keep the reconciliation beside the detailed result, not as a global warning banner |
| Special vdev permanence | Inline with special-device input and auxiliary result row | Require explicit acknowledgement. Never hide it in footer prose |
| SLOG, L2ARC, and spares do not add general data capacity | Auxiliary role table | Show zero general-data contribution rather than relying on a paragraph |
| Compression is conditional | Beside the ratio input and logical scenario output | Use conditional language and keep physical capacity visually primary |
| No local persistence without consent | Beside Share | State that the default route stays clean and sharing creates an explicit URL state |
| Dry-run command is not executed | Command preview | Keep placeholders visible and tell the user to review the command on the target system |

### Units, rounding, and provenance

- Accept decimal and binary input units, normalize to exact integer bytes, and display the chosen unit system consistently.
- Keep intermediate arithmetic as integers. Name every floor, ceiling, cap, and round-up operation in the formula table.
- Do not describe rounded display values as exact. Exact byte values remain available in the detailed table.
- Show the calculation version and input version with the result so shared states can be reproduced after engine changes.
- Keep official OpenZFS documentation and source links next to the relevant formula details rather than collecting unexplained links in a footer.
- State that calculation runs in the browser, the initial URL is clean, and encoded state appears only after the user chooses Share.

## Metadata proposal

Registry proposal only. Do not add route-local metadata, JSON-LD, sitemap logic, or publication changes from this document.

- Registry label: `zfs capacity calculator`
- Meta title: `ZFS pool capacity calculator for mixed vdevs`
- Meta description: `Calculate estimated writable capacity for mixed OpenZFS mirror and RAIDZ vdevs, including block allocation and slop. Fresh planned pools only.`
- Page type: `WebPage`
- Publication recommendation: Keep unpublished until this tool passes its own launch gate and the user explicitly approves publication.

The registry label is compact. The title contains the primary tool name and strongest product differentiator without repeating the site name. The description names the actual output, important inputs, and fresh-pool boundary without promising installed usable space. `WebPage` is already supported by the central registry and matches an interactive utility.

The title and description should be handed to the registry workflow when publication is approved. The route itself must not declare metadata or structured data.

## Internal links

### Links into this page

| Source | Anchor direction | Placement | Status and condition |
| --- | --- | --- | --- |
| `/storage-tools` | `ZFS pool capacity calculator` or `plan a ZFS pool` | Storage tool list or decision guide | Add when this route is included in the suite launch |
| `/raid-calculator` | `model OpenZFS RAIDZ allocation` | Related-tool link near the conventional RAID result explanation | Existing source route, but do not expose the destination before suite publication is approved |
| `/zfs-padding-calculator` | `plan the full mixed-vdev pool` | Result follow-up after a per-block comparison | Planned route. Add only when that route exists or the two routes publish together |
| `/raidz-expansion-planner` | `calculate a fresh pool topology` | Boundary link for users who have not expanded the pool yet | Planned route. Add only when that route exists or the two routes publish together |

### Links out from this page

| Destination | Anchor direction | Placement | User need served |
| --- | --- | --- | --- |
| `/raid-calculator` | `calculate conventional RAID capacity` | Related tools after the result | The user needs md/RAID capacity without OpenZFS RAIDZ allocation behavior |
| `/zfs-padding-calculator` | `compare RAIDZ padding by block size` | COPY-03 or formula details | The user wants a deeper block-by-block comparison instead of one chosen model |
| `/raidz-expansion-planner` | `estimate an expanded RAIDZ vdev` | COPY-05 installed-space boundary | The user needs historical old-width and new-width allocation ratios |
| `/storage-tools` | `browse storage planning tools` | End of the result details | The user wants a neighboring calculator or reference without returning through global navigation |

Do not render links to planned routes until their route files and ownership manifests exist. Internal anchors must describe the destination task and should not use `click here`, raw URLs, or vague `learn more` wording.

## Writer handoff

An external writer may draft only the sentence sections listed below. They may recommend a small rewrite to a heading for clarity, but they may not change the page order, formulas, product behavior, scope boundaries, or metadata direction.

### Static sentence assignments

| Writer section ID | Section and purpose | Required facts | Required citation basis | Planned format | Repetition guard |
| --- | --- | --- | --- | ---: | --- |
| COPY-01 | Opening lede that identifies the task and the result | The user can model mirror and RAIDZ1/2/3 top-level vdevs with individual drive sizes; mixed vdevs are supported; the output is an estimate for a fresh planned pool; the initial state is empty | Competitive report, implementation report, and brief | Prose. | Do not explain formulas, auxiliary roles, or list exclusions that belong below the result |
| COPY-02 | Define what the physical estimate can and cannot promise | The model applies one selected block size across a fresh topology; entered capacity is treated as available to ZFS; it excludes partition overhead, real metadata growth, fragmentation, snapshots, quotas, existing allocations, and workload mixtures; avoid `actual`, `guaranteed`, and `exact installed free space` | Implementation report assumptions and edge-case boundaries | Prose. | Do not repeat the topology instructions, slop formula, or the `zpool` versus `zfs` explanation |
| COPY-03 | Interpret `ashift`, block size, parity, and padding | `ashift` defines allocation-sector size; use `recordsize` for filesystem mode and `volblocksize` for zvol mode; RAIDZ allocation depends on logical sectors, parity sectors, and rounding; include the assigned three-disk RAIDZ1 example; identify it as one block model | OpenZFS RAIDZ documentation, workload tuning, and `vdev_raidz.c` | Prose. | Do not restate every equation from the adjacent table or turn this into a general performance guide |
| COPY-04 | Separate OpenZFS slop from user-selected planning headroom | Slop is a modeled OpenZFS reserve with floor and cap behavior; the default shift is 5 unless advanced mode changes it; embedded-log reserve stays out of v1; planning headroom defaults to 20 percent but is user policy, not a universal OpenZFS rule | OpenZFS module parameters, `spa_misc.c`, and implementation report | Prose. | Do not call either value lost capacity, repeat capacity-category definitions, or present the 20 percent default as mandatory |
| COPY-05 | Reconcile the estimate with installed reports and historical pools | Pool-level usable reporting may rely on a fixed 128 KiB heuristic; dataset `AVAIL` reflects another layer; workload, metadata, snapshots, quotas, and fragmentation can lower visible free space; compression remains conditional; expanded RAIDZ vdevs require a historical model outside this tool | OpenZFS `zpoolprops`, `zfs-list`, workload tuning, changing-layout documentation, and edge-case report | Prose. | Do not repeat the full exclusion list from COPY-02 or explain expansion mathematics on this page |

### Dynamic UI language assignments

The writer may propose these variable-aware templates. Engineering owns the conditions, values, state transitions, and validation behavior.

| ID | UI state | Writer may propose | Fixed technical facts |
| --- | --- | --- | --- |
| DYN-01 | Successful calculation | Headline and one-sentence interpretation | Physical capacity is primary; planning target is separate; values and units come from the engine |
| DYN-02 | Invalid calculation attempt | Summary that directs the user to the first invalid field | Calculation does not run; all implicated vdevs remain marked; focus behavior follows the test contract |
| DYN-03 | Special vdev added | Inline permanence acknowledgement | Special is a separate mirrored capacity envelope, not general capacity, and its loss can make the pool unavailable |
| DYN-04 | Share action | Privacy and URL-state disclosure | The default route is clean; encoded state appears only after explicit Share; the state is not secret |

### Page constraints

- Prefer `estimated writable physical data` to `usable capacity` when naming the primary result.
- Use `drive`, `top-level vdev`, `pool`, `physical capacity`, and `planning target` consistently. Do not alternate with appliance-specific vocabulary.
- Do not claim that this tool predicts performance or installed free space.
- Keep caveats beside the relevant control or result. Do not create a large warning panel or a colored left-border callout.

### Writer return contract

The external writer must return:

1. One proposed draft for each of COPY-01 through COPY-05, labeled exactly with its ID.
2. Optional proposals for DYN-01 through DYN-04, each keeping placeholders explicit.
3. A short fact-check note listing which source supported each technical assertion.
4. A confirmation that all word limits and repetition guards were followed.

The writer must not return a full page rewrite, new SEO sections, an FAQ, metadata implementation, or changes to the calculation scope.

## Source ledger

| Source | Used for | Authority and constraint |
| --- | --- | --- |
| [OpenZFS RAIDZ](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html) | RAIDZ geometry, parity, allocation behavior, and formula explanation | Primary OpenZFS documentation. Use for conceptual claims and verify implementation-sensitive math against source |
| [OpenZFS VDEVs](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html) | Top-level vdev capacity contribution, redundancy boundaries, spares, cache, and log roles | Primary OpenZFS documentation |
| [OpenZFS special vdev](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Special%20vdev.html) | Special-vdev role, redundancy, and permanence warning | Primary OpenZFS documentation. Do not generalize special capacity into the pool data headline |
| [OpenZFS module parameters](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html) | `spa_slop_shift`, default reserve behavior, floor, and cap | Primary OpenZFS documentation. Keep version-sensitive details named and sourced |
| [OpenZFS workload tuning](https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Workload%20Tuning.html) | `recordsize`, `volblocksize`, workload differences, and installed-result caveats | Primary OpenZFS documentation. Do not expand into performance advice |
| [OpenZFS compression](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Data%20Storage/Compression.html) | Conditional logical-capacity scenario | Primary OpenZFS documentation. No universal compression preset or promise |
| [OpenZFS changing pool layout](https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html) | Boundary between fresh topology and historical RAIDZ expansion | Primary OpenZFS documentation. Use to route existing expanded pools to the planned expansion tool |
| [OpenZFS zpool-create manual](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-create.8.html) | Safe placeholder-based `zpool create -n` preview | Primary manual. The site generates text only and never executes the command |
| [OpenZFS zpoolprops manual](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolprops.7.html) | Pool capacity reporting and the fixed-block heuristic | Primary manual. Keep the comparison qualified by OpenZFS version and reporting layer |
| [OpenZFS zfs-list manual](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-list.8.html) | Dataset `AVAIL` interpretation | Primary manual. Do not equate dataset availability with raw or modeled pool capacity |
| [OpenZFS vdev_raidz.c](https://github.com/openzfs/zfs/blob/master/module/zfs/vdev_raidz.c) | Allocation rounding and implementation-sensitive RAIDZ math | Primary source code. Pin behavior through engine versioning and tests |
| [OpenZFS spa_misc.c](https://github.com/openzfs/zfs/blob/master/module/zfs/spa_misc.c) | Slop reserve implementation | Primary source code. Validate constants and shift behavior in the calculation engine |

The prerequisite competitive, implementation, edge-case, and brief files remain the source of truth for product scope, competitor evidence, test boundaries, and visual hierarchy. This ledger governs technical citations for the eventual public copy.

## Open questions and blockers

No blocker remains for content planning.

The following implementation decisions are intentionally deferred and must not be invented by the writer:

- Final visual design of the exact capacity bar and topology diagram within the shared storage-tool shell.
- Exact accessible labels for drag reordering after the chosen composer interaction is implemented.
- Whether the future ZFS padding calculator and RAIDZ expansion planner are ready in time for reciprocal links at suite launch.
- The calculation engine version and source-code revision recorded in the shipped result provenance.
- The final registry change and publication date, which require suite completion and explicit user approval.

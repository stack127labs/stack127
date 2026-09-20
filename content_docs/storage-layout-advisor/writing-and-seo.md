# Writing and SEO plan: Storage Layout Advisor

Status: ready
Tool: Storage Layout Advisor
Route: `/storage-layout-advisor`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
SERP backend: web connector; direct result pages and competitor surfaces rechecked with repository-local Playwright CLI because no in-app Browser instance or individually selectable search engine was available.
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 4 sections, 620 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `storage layout calculator mixed drives RAID ZFS` | Compare a real inventory against a protected-failure goal and workload preference before creating an array or pool. | Local form followed by a ranked comparison, exact accounting, and topology. | The advisor accepts arbitrary decimal or binary drive sizes, filters layouts by platform and target, and explains the model boundary after the answer. |
| Secondary | `RAID layout calculator fault tolerance capacity` | Check whether a candidate meets a stated failure target without confusing redundancy with backup or performance. | Result table with usable, redundancy, mismatch, efficiency, and guaranteed tolerance. | The result visualization and concise guide define each term and identify the platform verification step. |

### Intent not targeted

- `zpool list` or live filesystem free-space checks: the page is a static layout model and does not inspect a running host.
- Hardware or NAS product selection: vendor compatibility and purchase decisions belong to platform-specific documentation and selectors.
- Rebuild time, IOPS, AFR, compression, or data-loss probability: the current contract deliberately leaves these unknown rather than inventing estimates.

## Page promise

Compare the layouts that can be formed from the drives you have, filter them by a minimum protected-failure target, and see exact theoretical capacity accounting with the grouping and platform checks still left to verify.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Intro below the h1 and the live form | Sentences plus Tool UI | `brief.md`, `implementation-report.md` product decision | State the homelab planning job once; do not restate the h1 in the guide. |
| Which inputs, modes, units, sources, or scope choices matter? | Drive editor and the meaningful-inputs section | Tool UI plus Sentences | `implementation-report.md` formula and data contract | Explain why representative sizes, platform, workload, and target matter; do not narrate ordinary clicks. |
| How should someone choose meaningful inputs and use it for the real task? | Meaningful-inputs section | Sentences plus Table | `brief.md`, `edge-cases-and-tests.md` EC-005 to EC-008 | Mention entered order and exact units once; leave selected values to the tool. |
| How should the result and its important terms or uncertainty be interpreted? | Best-fit block, comparison table, accounting bar, and bounded-model section | Exact result visualization plus Table plus Sentences | `implementation-report.md` equations and assumptions | Define usable, redundancy, mismatch, tolerance, and fit rubric without copying displayed numbers. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Meaningful-inputs and bounded-model sections | Sentences plus Topology/diagram | `edge-cases-and-tests.md` EC-003, EC-005, EC-010 | Explain mixed-size clipping and group boundaries; do not add a generic RAID glossary. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Bounded-model section and nearby result note | Sentences plus Tool UI | `implementation-report.md` non-goals and assumptions | Keep exclusions next to the model claim; do not use a warning panel. |
| How are user inputs handled? | Bounded-model section | Sentences | `implementation-report.md` invalid, privacy, and sharing contract | State local calculation and explicit URL sharing only; do not claim general site privacy. |
| What should the reader verify or do next? | Final platform-verification section and links | Sentences plus internal links | `implementation-report.md` primary sources and expansion boundary | End with running-system checks and link out instead of adding a FAQ. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Storage layout advisor | What job does this page serve? | A homelab builder can compare a stated inventory and protection goal before creating storage. | Tool UI | `brief.md`, product decision | Keep the h1 short; the intro carries the result promise. | n/a |
| 2 | Intro below h1: purpose and boundary | What will the advisor return? | It compares eligible layout families and shows theoretical accounting; it is not live filesystem capacity. | Sentences | `implementation-report.md` scope and assumptions | One short paragraph before the tool. | COPY-01 |
| 3 | H2: Choose the inventory and protection goal | Which controls define the comparison? | The drive rows, platform, workload, and minimum protected failures establish the candidate set and fit rubric. | Tool UI | `implementation-report.md` formula and data contract | Let labels and controls carry exact options; no prose checklist. | n/a |
| 4 | H2: Best fit and exact capacity accounting | What does the answer say? | The selected fit is a transparent workload/target tradeoff, while raw, usable, redundancy, and mismatch remain separate exact terms. | Exact result visualization | `implementation-report.md` equations; `edge-cases-and-tests.md` FF-002 to FF-006 | Do not call the fit universally best or repeat values in prose. | n/a |
| 5 | H3: Layout comparison | Which eligible alternatives deserve a direct look? | Rows expose the same accounting and tolerance fields so the reader can compare without translating paragraphs. | Table | Product thesis; `brief.md` show vs say | The table owns repeated exact comparisons; guide only defines terms. | n/a |
| 6 | H3: Failure boundary | What condition makes tolerance meaningful? | The topology shows mirrors or parity groups and states when the nominal tolerance depends on placement. | Topology/diagram | `implementation-report.md` topology contract; OpenZFS VDEVs source | No marker art or exact-number diagram; do not claim nested layouts have unconditional tolerance. | n/a |
| 7 | H2: Choose inputs that represent the array | Which inputs prevent a misleading comparison? | Use the actual drive inventory, preserve entered order for grouped layouts, keep TB and TiB distinct, and choose a target and workload that match the planning decision. | Sentences | `implementation-report.md` inputs and normalization; `edge-cases-and-tests.md` EC-004 to EC-008 | Practical guidance only; do not narrate button mechanics or restate control labels. | COPY-02 |
| 8 | H2: Read the answer as a bounded layout model | What do the terms and fit label prove? | The accounting reconciles raw bytes, but excludes filesystem and runtime effects; the fit rubric is not a performance, safety, backup, or health guarantee. | Sentences | `implementation-report.md` equations, assumptions, and non-goals | Define the boundary once beside the result; do not duplicate the accounting table. | COPY-03 |
| 9 | H2: Verify the platform before building | What should happen after this comparison? | Check the running platform's supported layout, width, expansion path, and recovery behavior; inputs stay local unless the user explicitly shares a URL. | Sentences | `implementation-report.md` primary sources and privacy contract | One final next step with two relevant links; no generic FAQ or publication claim. | COPY-04 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Exact byte normalization | Decimal TB and binary TiB are different byte quantities, and fractional bytes are rejected. | Short definition in COPY-02 beside the unit choice. | `implementation-report.md` inputs; https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Bits%20or%20Bytes.html | Say display rounding does not change source bytes. |
| Capacity accounting | Every candidate reconciles `raw = usable + redundancy + mismatch`; parity and mirror formulas use the smallest member where the layout contract requires it. | Exact result visualization plus one sentence in COPY-03. | `implementation-report.md` equations; FF-002 and FF-003 | Keep filesystem metadata, reservations, and allocation effects out of this theoretical identity. |
| Protection and grouping | The target filters guaranteed tolerance, while topology shows the group or vdev boundary that can make tolerance conditional. | Result table plus Topology/diagram. | https://docs.kernel.org/admin-guide/md.html; https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html | State that tolerance is not backup and nested layout placement matters. |
| Fit rubric | Workload changes the transparent ranking reason only; it is not a throughput, IOPS, AFR, or safety forecast. | Best-fit result note plus COPY-03. | `implementation-report.md` scoring contract; FF-005 | Keep the word “fit” tied to the selected inputs and target. |

## Metadata proposal

- Registry label: `storage layout advisor`
- Meta title: `Storage Layout Advisor: Compare RAID and ZFS Capacity`
- Meta description: `Compare storage layouts from your real drive inventory, protection target, and workload. See theoretical capacity and failure boundaries before building.`
- Page type: `WebApplication`
- Publication recommendation: `Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/zfs-capacity-calculator` | Move from a cross-platform layout choice to a more detailed ZFS capacity model when ZFS-specific geometry matters. | `ZFS capacity calculator` | Final platform-verification section. |
| Out | `/raidz-expansion-planner` | Check a separate expansion path after the static comparison when the chosen platform is OpenZFS. | `RAIDZ expansion planner` | Final platform-verification section. |
| Out | `/storage-tools` | Continue to adjacent storage utilities when the reader needs a different calculator or reference. | `storage tools` | Short closing sentence after the guide. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Purpose and boundary | Tell a homelab builder who the advisor serves, what it compares, and why the result is theoretical. | Real drive inventory, platform/workload/protection inputs, ranked layouts, exact accounting, and the model boundary from `implementation-report.md`. | 55 words maximum; one paragraph below the h1. | Do not promise a universal best layout, live capacity, or platform detection. |
| COPY-02 | Choose inputs that represent the array | Explain meaningful inventory selection, exact units, entered order, and protection/workload choices for the real planning decision. | `implementation-report.md` normalization; FF-001 and FF-003; OpenZFS Bits or Bytes source. | 135 words maximum; two short paragraphs. | Do not narrate button clicks, repeat all control labels, or imply automatic drive reordering. |
| COPY-03 | Read the answer as a bounded layout model | Define the accounting terms, fit rubric, topology condition, and major exclusions without duplicating the live table. | `implementation-report.md` equations, scoring, assumptions, non-goals; Linux MD and OpenZFS RAIDZ/VDEVs sources. | 220 words maximum; two or three short paragraphs. | Do not call the fit safest, fastest, optimal, or a backup; do not invent filesystem or performance numbers. |
| COPY-04 | Verify the platform before building | Give the next real-system checks, local input-handling boundary, and the two most useful adjacent tools. | OpenZFS changing-layout source, Linux MD source, explicit-share contract, and internal links in this plan. | 160 words maximum; two short paragraphs plus the planned links. | Do not claim a live probe, expansion support, privacy beyond this tool, or publication. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, chart, wireframe, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- Linux MD RAID documentation: https://docs.kernel.org/admin-guide/md.html, checked 2026-08-23. Supports common RAID grouping, parity, and failure-boundary facts.
- OpenZFS RAIDZ documentation: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html, checked 2026-08-23. Supports RAIDZ parity and geometry boundaries.
- OpenZFS VDEVs documentation: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html, checked 2026-08-23. Supports vdev failure-boundary and grouping language.
- OpenZFS changing pool layout: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html, checked 2026-08-23. Supports the need to verify expansion behavior on the running platform.
- OpenZFS Bits or Bytes: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Bits%20or%20Bytes.html, checked 2026-08-23. Supports decimal versus binary unit explanation.

## Open questions and blockers

- None for the content handoff. Collection and registry integration are complete for the eight-tool batch; the committed migration remains unapplied until release, so the route is not live yet.

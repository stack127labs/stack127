# Writing and SEO plan: Synology SHR Capacity Calculator

Status: ready
Tool: Synology SHR Capacity Calculator
Route: `/shr-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
Search backend: web connector; SearXNG was not configured and engines were not individually available
Primary visual backend: standalone Playwright CLI; no in-app Browser runtime was available
SERP viewport: 1440 x 900, dark color scheme for the recent competitor snapshot
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 5 sections, 520 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `Synology SHR capacity calculator` | Estimate pool capacity from a planned set of mixed-size drives and choose SHR-1 or SHR-2 protection | Focused calculator with a clear capacity answer and exact allocation breakdown | Put the empty inventory and the result above the supporting guide. |
| Secondary | `Synology RAID calculator mixed drive sizes SHR` | Understand why SHR differs from conventional smallest-drive RAID math | Mixed-drive inputs plus capacity-band result table | Make each threshold, protection slice, and unused slice inspectable. |
| Secondary | `SHR-2 calculator unused space mixed drives` | Compare two-drive protection and see whether a high tier cannot form a data-bearing group | SHR-1/SHR-2 mode switch with separate unused result | Keep the unused category visible instead of folding it into overhead. |
| Supporting | `Synology Hybrid RAID capacity formula` | Trust the result enough to use it for a fresh-pool planning decision | Short explanation of tier arithmetic, reserve, units, and limitations | Explain the model beside the result, without presenting it as an official published equation. |

The current search snapshot remains calculator-led. Official Synology results, focused SHR calculators, and broad RAID tools all place a working result near the top. The page should satisfy the immediate calculation job before its explanation.

### Intent not targeted

- Drive compatibility, NAS model recommendations, pricing, or shopping: these require current device and market data outside this calculator.
- Existing-pool expansion, drive replacement eligibility, and SHR-1 to SHR-2 migration: these depend on pool history and model rules; link to a future expansion tool when one exists.
- Filesystem metadata, snapshots, quotas, fragmentation, rebuild time, or application-visible free space: these are later volume or operations questions, not fresh pool allocation.
- Generic RAID, ZFS, or unRAID planning: use the existing storage-tool routes instead of adding comparison prose here.

## Page promise

Enter the exact drives for a planned fresh Synology pool and get an estimated SHR-1 or SHR-2 capacity with system reserve, protection, unused high tiers, explicit TB/TiB units, and the limits of the model kept visible.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Opening sentence below the h1 | Sentences | Brief, competitive report, Synology Knowledge Center | Do not restate the whole promise below the result. |
| Which inputs, modes, units, and scope choices matter? | Protection controls and drive inventory; short opening note | Tool UI + Sentences | Implementation R1-R4, test EC-001 to EC-012 | Do not write button-by-button instructions. |
| How should someone choose inputs for the real task? | Drive inventory labels and a compact guide sentence | Tool UI + Sentences | Implementation input contract | Say to use marketed drive capacities and the intended fresh-pool inventory; do not recommend models. |
| How should the result be interpreted? | Three result metrics, allocation bar, capacity-band table, and one guide section | Exact result visualization + Table + Sentences | Implementation R5-R8, fixtures FF-003 and FF-004 | Do not repeat exact values in prose. |
| Which concepts surprise users? | Capacity-band table and SHR-2 unused-tier section | Table + Sentences | Competitive formula disagreement, FF-004 | Explain why a tier is unused without inventing a second formula. |
| What does the tool not calculate or guarantee? | Fresh-pool result note and limits section | Sentences | Implementation non-goals, EC-033, EC-036 | Keep expansion, filesystem, snapshot, and rebuild boundaries together once. |
| How are inputs handled? | Share action note and guide | Sentences | Implementation state/privacy contract, EC-037 to EC-041 | State that calculations stay in the browser and explicit Share puts input state in the URL; do not claim secrecy. |
| What should the reader verify next? | Final guide section with storage-tools and RAID-calculator links | Sentences + Internal links | Brief and route family | Name the next real verification step, not a generic browse CTA. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Synology SHR capacity calculator for mixed drives | Is this the tool for my planned NAS? | Enter individual drive sizes and compare SHR-1 or SHR-2 capacity. | Tool UI | Brief and implementation contract | The h1 is already implemented; do not add a second promise heading. | N/A |
| 2 | Opening lede below h1 | What answer will this produce, and where does it stop? | It estimates a fresh-pool result from the entered drives and keeps protection, reserve, and unused space separate. | Sentences | COPY-01 facts | 55 words maximum; no formula or exclusion list. | COPY-01 |
| 3 | Tool region: build the drive inventory | What should I enter? | Select protection mode, add every intended drive, and name decimal or binary units explicitly. | Tool UI | Implementation R1-R4 | The UI owns ordinary use instructions; prose should not narrate clicks. | N/A |
| 4 | Result region: estimated pool capacity | What is the number I should plan around? | Estimated pool capacity is primary; protection, unused high tiers, system reserve, and unit choice remain visible. | Exact result visualization | Implementation R5-R8 | Never repeat the rendered numbers in static copy. | N/A |
| 5 | Result region: capacity allocation and capacity bands | Why does mixed SHR capacity change by drive size? | Each threshold shows how many drives reach it and whether the band becomes data, protection, or unused space. | Table | Implementation formula, FF-003, FF-004 | Keep exact comparisons in the table and bar. | N/A |
| 6 | H2: Read the capacity bands | How do I interpret the result? | The data-bearing tiers add to the pre-reserve pool estimate, protection is the modeled parity share, unused is high-tier space that cannot form a valid protected group, and reserve is separate. | Sentences | COPY-02 and engine contract | 105 words maximum; do not repeat table values or formula code. | COPY-02 |
| 7 | Result table: the unused high tier | Why is extra space not always data? | The exact table shows a high band with too few drives for the selected parity width as unused, rather than available pool data. | Table | FF-004, official result categories | Keep the explanation in the table labels and the single interpretation section; no second worked example. | N/A |
| 8 | H2: Treat this as a fresh-pool estimate | Why may the installed result be lower? | The engine does not model filesystem overhead, snapshots, quotas, fragmentation, expansion history, rebuild state, or application-visible free space. | Sentences | COPY-04, implementation non-goals | 120 words maximum; one paragraph, no warning essay. | COPY-04 |
| 9 | H2: Verify the layout before you build | What should I check next? | Compare the result with the target NAS and DSM guidance, then use the conventional RAID calculator when the question is not SHR. Inputs stay local until explicit Share creates a URL state. | Sentences | COPY-05, Synology expansion guidance, privacy tests | 105 words maximum; do not recommend a model or imply an external verification has happened. | COPY-05 |

No FAQ, screenshot, marker art, or generic RAID comparison is planned. The live result already supplies the precise diagram and table needed to explain the surprising cases.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Exact input normalization | Decimal TB/GB and binary TiB/GiB are converted to integer bytes before sorting or allocation. | One sentence near the input/result unit note | Implementation input contract | State that display rounding does not change the calculation. |
| Capacity thresholds | Each distinct entered capacity creates a band. Drives at or above that threshold participate in the band. | Existing exact capacity-band table | Implementation formula and FF-003 | Use `modeled` language because Synology publishes categories and behavior, not this complete public equation. |
| Parity allocation | SHR-1 reserves one protection slice in each data-bearing band; SHR-2 reserves two. | Result metrics and table columns | Official Synology categories plus inferred tier model | Keep protection separate from system reserve. |
| Unused high tiers | A band with no room for data after the selected parity width is unused, not available pool data. | Table row and `Unused high tiers` metric | FF-004 and official SHR-2 result shape | Explain only the threshold condition; do not promise later expansion capacity. |
| System reserve | The estimate models 10,000,000,000 bytes per drive for Synology's approximate system and swap reservation. | Result note/guide sentence | Official Synology RAID calculator | Call it a modeled reserve and exclude filesystem metadata from this result. |
| TB versus TiB | TB uses decimal bytes; TiB uses binary bytes. Both are display choices over the same exact byte result. | Visible result unit toggle | Implementation R2 and research source ledger | Never call the two numbers interchangeable. |

The page should not present a pseudo-official SHR equation or a recommendation. It can describe the engine's capacity-band model, its source basis, and its fresh-pool boundary honestly.

## Metadata proposal

Registry proposal only. Do not add route-local metadata, canonical, robots, sitemap, or JSON-LD code.

- Registry label: `SHR capacity calculator`
- Meta title: `Synology SHR capacity calculator for mixed drives`
- Meta description: `Calculate estimated SHR-1 or SHR-2 pool capacity from mixed Synology drive sizes, with protection and unused tiers shown. Fresh-pool estimate.`
- Page type: `WebApplication`
- Publication recommendation: Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/storage-tools` | Browse the storage planning family after the result | `browse storage tools` | Final guide section. |
| Out | `/raid-calculator` | Compare conventional RAID capacity when the user is not planning SHR | `compare conventional RAID capacity` | Final guide section, only as a boundary link. |
| Out | `/zfs-capacity-calculator` | Continue to a fresh OpenZFS pool estimate for a different storage platform | `calculate ZFS pool capacity` | Final guide section if the existing route remains the appropriate destination. |
| In, parent integration | `/storage-tools` | Let storage-tool visitors discover the route after explicit parent approval | `SHR capacity calculator` | Parent task owns this shared change; do not edit here. |

No links to planned expansion or filesystem routes should be rendered until those routes exist and their ownership manifests are ready.

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Opening lede below h1 | Identify the user, inputs, result, and fresh-pool boundary | Individual drive capacities, SHR-1/SHR-2, mixed sizes, estimated result, browser-local calculation. Use the brief, implementation report, and [Synology's SHR guidance](https://kb.synology.com/en-uk/DSM/tutorial/What_RAID_type_is_best_for_my_storage). | 55 words maximum, one short paragraph | No formula, FAQ, model recommendation, or long exclusion list. |
| COPY-02 | Read the capacity bands | Help a reader interpret estimated, protection, unused, and reserve fields | Use the rendered result vocabulary and implementation formula. Explain that exact values belong to the table, not prose. | 105 words maximum, one paragraph | Do not repeat rendered numbers or call estimated pool capacity installed free space. |
| COPY-04 | Treat this as a fresh-pool estimate | Set the honest technical limit | Fresh pool only; no expansion history, filesystem metadata, snapshots, quotas, fragmentation, rebuild state, or application-visible free space. Use implementation non-goals and the official calculator's reserve distinction. | 120 words maximum, one paragraph | Do not say exact, guaranteed, real usable, or predict installed free space. |
| COPY-05 | Verify the layout before you build | Give the reader a practical next check and privacy boundary | Verify the proposed drive set and mode against the target NAS and current Synology guidance. Link to `/storage-tools`, `/raid-calculator`, and optionally `/zfs-capacity-calculator`. State that no share state is created until Share is chosen and the URL contains configuration, not a secret. | 105 words maximum, one or two short paragraphs | No compatibility recommendation, no claim that Stack127 validated the NAS, no generic browse CTA, and no promise that a URL is private. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md`, `stack127_docs/visual-first.md`, and the visual-first rule that the tool and exact result come before prose.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Prefer `estimated pool capacity` and `fresh-pool estimate` to `usable capacity` when the scope matters.
- Treat the tier equation as a route-local model inferred from official result categories and the research evidence, not as an official Synology-published formula.
- Do not invent precision for filesystem, snapshot, expansion, rebuild, compatibility, pricing, or model recommendations.
- Do not repeat the result table, allocation bar, or controls in prose.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The route writer may add them only after the technical tool and independent QA are stable.

## Source ledger

- Synology RAID Calculator: https://www.synology.com/en-uk/support/RAID_calculator, checked 2026-08-23. Supports separate available, protection, unused, and approximate per-drive system-reserve categories.
- Synology Knowledge Center, choose a RAID type: https://kb.synology.com/en-uk/DSM/tutorial/What_RAID_type_is_best_for_my_storage, checked 2026-08-23. Supports SHR's mixed-drive purpose and SHR-1/SHR-2 minimum and fault-tolerance boundaries.
- Synology Knowledge Center, add a drive to expand a storage pool: https://kb.synology.com/en-my/DSM/help/DSM/StorageManager/storage_pool_expand_add_disk?version=6, checked 2026-08-23. Supports the boundary between a fresh-pool estimate and expansion eligibility.
- Stack127 competitive report: `content_docs/shr-calculator/competitive-report.md`, researched 2026-08-23. Supports operated competitor behavior, formula disagreement, and user pain.
- Stack127 implementation report: `content_docs/shr-calculator/implementation-report.md`, reviewed 2026-08-23. Supports route behavior, exact formula contract, units, reserve, state, privacy, and non-goals.

## Open questions and blockers

- None for the writing plan. Publication metadata and collection integration are complete for the eight-tool batch; the committed migration remains unapplied until release.

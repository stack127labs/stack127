# Writing and SEO plan: RAIDZ Expansion Planner

Status: ready
Tool: RAIDZ Expansion Planner
Route: `/raidz-expansion-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-13
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 5 sections, 600 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `RAIDZ expansion planner`, `RAIDZ expansion calculator` | Estimate what one or more one-disk RAIDZ expansions make writable now and compare that with a fresh vdev at the final width. | Exact calculators led the visible results, especially raidsize and TrueNAS. One result also offered a duration estimate, while many others were static RAIDZ calculators. | H1, short promise, planner, final-width composition, per-width timeline, and calculation trace. |
| Close variation | `expand RAIDZ2 from 6 to 8 drives` | See each legal width step, capacity gained, unchanged parity, and the remaining geometry gap. | Calculators, product documentation, command guides, community discussions, and videos. | Tool inputs, one-disk sequence table, unchanged RAIDZ result, and preflight table. |
| Diagnostic variation | `why less space after RAIDZ expansion` | Understand why immediate or reported capacity can be lower than fresh-width math. | Community reports and OpenZFS issues dominated, with explanations about old block ratios and pessimistic reporting. | Composition visualization, vocabulary table, accounting caveat, and model limits beside the affected claims. |

The three visible result shapes still belong to one query family: planning and interpreting the capacity effect of widening an existing RAIDZ vdev. The current page should not expand into a general ZFS tutorial merely to cover the informational variation.

### Intent not targeted

- General RAID or new-pool capacity planning: send this to `/raid-calculator` or `/zfs-capacity-calculator` because those tools model a new layout, not an existing RAIDZ generation.
- Expansion time, failure probability, IOPS, throughput, or a universal safety verdict: the planner lacks measured hardware, workload, health, and copy-rate evidence.
- RAIDZ parity conversion, mirrors, dRAID, SHR, Unraid, replacement with larger disks, or adding a top-level vdev: these are different operations and data contracts.
- A command tutorial with real device identifiers: the page can name the operation and its prerequisites but must not become an executable runbook.

## Page promise

Plan each one-disk widening of one previously unexpanded RAIDZ vdev and compare modeled current, immediate, and fresh-width logical capacity, while keeping live command-reported capacity explicitly unknown.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Intro immediately below H1 | Sentences | `brief.md`; implementation `Product decision` | Do not repeat the promise below the tool. |
| Which inputs, modes, units, sources, or scope choices matter? | Tool form and input-source guide | Tool UI plus Table | Implementation `Inputs and normalization`; OpenZFS `zpool-list(8)` | Do not narrate ordinary controls. Explain only where a value comes from and why it changes the answer. |
| How should someone choose meaningful inputs and use it for the real task? | Input-source guide before the result vocabulary | Table | Post-build content gap; implementation assumptions | Give one route from the running pool to representative inputs. Do not add a step-by-step button tutorial. |
| How should the result and its important terms or uncertainty be interpreted? | Capacity plan, composition, timeline, and vocabulary section | Exact result visualization plus Table plus Sentences | Engine result contract; OpenZFS `zpool-attach(8)` | Do not recite result numbers in prose. Keep each caveat beside its term. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Timeline and vocabulary section | Table | Competitive pain evidence; OpenZFS RAIDZ and attach docs | Explain old generations, reflow, rewrite, one-disk ordering, and accounting once. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Limits section after preflight | Sentences | Implementation non-goals and assumptions | Group exclusions by decision boundary instead of producing a long warning list. |
| How are user inputs handled? | Short privacy paragraph in limits section and share action | Sentences plus Tool UI | R21 and implementation privacy contract | Say local only because it is tested. State that Share deliberately puts the normalized configuration in the URL. |
| What should the reader verify or do next? | Preflight table and closing links | Table plus Sentences | OpenZFS 2.3 release, feature docs, attach docs; adjacent stack127 tools | Do not imply that passing the checklist makes expansion safe. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: RAIDZ expansion planner | What answer is available here? | This page plans the capacity transition of an existing RAIDZ vdev, not a fresh pool layout. | Tool UI | `brief.md`; implementation report | H1 names the tool only once. | n/a |
| 2 | Intro below H1, no separate heading | What does the planner predict and what is the main boundary? | It compares current, immediate, and fresh-width modeled capacity across one-disk steps; reported live capacity remains unknown. | Sentences | Implementation product decision and R10 | Maximum two short paragraphs before the tool. No history lesson. | COPY-01 |
| 3 | Tool and H2: Capacity plan | What changes after each disk is added? | Inputs lead directly to exact current, immediate, fresh, gap, unchanged parity, and reported-unknown results. | Tool UI | Finished tool verified 2026-08-13 | Do not duplicate these values in supporting prose. | n/a |
| 4 | H3: Final-width composition | Where does the fresh-width envelope go? | Old logical payload plus newly writable data plus geometry gap reconciles exactly to the native comparator. | Exact result visualization | R8 to R10; FF-001 to FF-005 | Text labels remain authoritative for zero and tiny segments. | n/a |
| 5 | H3: Expansion steps | What happens at every one-disk width? | Current and future widths show gain now, immediate envelope, fresh comparator, and gap. | Table | R11; sequential engine steps | Preserve one row per width. Do not describe table rows in prose. | n/a |
| 6 | H2: Get the inputs from the vdev you are widening | Where do current allocation, recordsize or volblocksize, and ashift come from? | Use exact per-vdev allocation, the representative workload block property, the existing pool sector shift, and the smallest member limit. | Table | OpenZFS `zpool-list(8)`; RAIDZ docs; implementation input contract | Include the exact `zpool list -vp -o name,alloc` command shape only as non-executable reference. Do not imply one record size represents every real block. | n/a |
| 7 | H2: Why immediate capacity can be lower than a fresh vdev | What do current, immediate, fresh, gap, reflow, rewrite, and reported capacity mean? | Old blocks retain their original data-to-parity geometry; new writes use the wider geometry; command accounting can still differ. | Sentences | OpenZFS `zpool-attach(8)`, RAIDZ docs, `vdev_raidz.c` | No numeric example because the live result already supplies one. | COPY-02 |
| 8 | Concept vocabulary under the same H2 | How are the result terms different? | A compact term, meaning, and decision-use table defines each term once. | Table | Engine contract and primary sources | Do not turn definitions into an FAQ or repeat the prose above. | n/a |
| 9 | H2: Check the pool before you widen the vdev | What must be true before the real operation? | Verify OpenZFS 2.3 or supported platform release, feature availability, healthy vdev, current backup, adequate disk size, unchanged parity, and one-disk-at-a-time execution. | Sentences | OpenZFS release, feature, attach, and layout docs | A checklist is not a safety verdict. Do not give device-specific commands. | COPY-03 |
| 10 | Preflight under the same H2 | Which prerequisite does each check protect? | A check, reason, and source table makes the operational boundary scannable. | Table | OpenZFS primary sources | Keep backup as prudent editorial guidance, not an OpenZFS guarantee. | n/a |
| 11 | H2: What this model does not know | Where can the estimate differ from a live pool? | Earlier expansion generations, intervening writes or rewrites, mixed block sizes, metadata, slop, fragmentation, compression, snapshots, and live reporting are outside version 1. | Sentences | Implementation assumptions, exclusions, and R19 | No oversized warning panel and no exhaustive methodology. | COPY-04 |
| 12 | Closing under the limits section, no new heading | Are inputs sent anywhere, and what should I use next? | Calculation stays in the browser; Share deliberately copies normalized inputs into the URL; link whole-pool capacity and block-padding questions elsewhere. | Sentences | R15, R21; implementation internal-link plan | Do not claim anonymity or zero server logs. Do not repeat tool results. | COPY-05 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Current generation | Current physical allocation is divided into whole representative old-width RAIDZ blocks; any remainder stays visibly occupied but has no invented logical payload. | One sentence in COPY-02 plus exact calculation disclosure | Implementation equations 2 to 4; OpenZFS RAIDZ docs | Place the representative-block assumption in the same section. |
| Immediate after width N | Keep old logical payload fixed, then convert the remaining modeled raw space at width N using the shared exact RAIDZ allocation result. | Vocabulary table plus live timeline | Implementation equations 5 to 8 | State that version 1 assumes no writes, deletes, or rewrites between planned steps. |
| Fresh comparator and geometry gap | Fresh capacity is the same raw envelope modeled entirely at width N; gap is `fresh - immediate`, never a reported command value. | Exact composition and vocabulary table | Implementation equations 9 to 12 | Put reported-capacity uncertainty beside the definition of gap. |
| recordsize or volblocksize and ashift | The representative logical block and sector size change padding and sectors consumed, so they can change every width result. | Input-source table | OpenZFS RAIDZ docs; shared allocation engine | Real pools contain a distribution of blocks and metadata, so one representative size is a planning assumption. |
| One-disk sequence | Each future width is calculated independently from current width plus one through final width, with unchanged RAIDZ parity. | Expansion steps table | `zpool-attach(8)`; Changing Pool Layout | Do not imply one command attaches several disks concurrently. |

## Metadata proposal

- Registry label: `RAIDZ expansion`
- Meta title: `RAIDZ Expansion Planner: compare capacity at every width`
- Meta description: `Plan one-disk RAIDZ expansion steps and compare current, immediate, and fresh-width capacity. Uses exact block geometry but not live ZFS-reported space.`
- Page type: `WebPage`
- Publication recommendation: Keep unpublished until the manual content pass, final Browser review, registry review, and explicit publication approval are complete.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/zfs-capacity-calculator` | Model a fresh whole-pool topology instead of an existing vdev transition. | `plan a complete ZFS pool` | COPY-05 closing sentence. |
| Out | `/zfs-padding-calculator` | Inspect how recordsize or volblocksize, ashift, parity, and width affect one RAIDZ allocation. | `check RAIDZ padding and block geometry` | COPY-05 closing sentence. |
| Out | `/storage-tools` | Return to the storage calculator collection when the operation is not RAIDZ expansion. | `browse storage tools` | Existing sidebar and optional final link only. |
| In | `/storage-tools` | Help storage planners discover the transition-specific calculator beside the RAID and ZFS tools. | `RAIDZ expansion planner` | Existing collection card and sidebar. |
| In | `/zfs-capacity-calculator` | Continue from fresh pool sizing to the special case of widening an existing RAIDZ vdev. | `plan an existing RAIDZ expansion` | Related-tools area on the capacity page when separately approved. |
| In | `/zfs-padding-calculator` | Continue from block geometry to a multi-width expansion plan using the same allocation basis. | `compare RAIDZ widths during expansion` | Related-tools area on the padding page when separately approved. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Intro below H1 | State the answer and boundary before the tool. | One previously unexpanded RAIDZ vdev; sequential one-disk steps; current, immediate, fresh, and gap; reported capacity unknown. Sources: implementation product decision and OpenZFS attach docs. | 80 words maximum, one or two short paragraphs. | No generic importance claim, OpenZFS history, input tutorial, or result restatement. |
| COPY-02 | Why immediate capacity can be lower than a fresh vdev | Connect old block geometry to the visible result and its terminology. | Reflow does not logically rewrite old blocks; old blocks retain old ratio; future writes use wider ratio; rewrite can change physical geometry; reporting may remain pessimistic. Sources: `zpool-attach(8)`, RAIDZ docs, `vdev_raidz.c`. | 150 words maximum, two or three paragraphs around the table. | Do not call the gap lost or guaranteed temporary. No numeric worked example or repeated table definitions. |
| COPY-03 | Check the pool before you widen the vdev | Frame the preflight table without granting a safety verdict. | OpenZFS 2.3 or supported platform release; feature enabled; healthy vdev; current backup; new disk at least smallest member; parity unchanged; one disk per attach. Sources: release, feature, attach, layout docs. | 110 words maximum, one opening paragraph and one sentence after the table. | No safe-to-expand verdict, device IDs, force flag, duration promise, or command walkthrough. |
| COPY-04 | What this model does not know | Keep the estimate from being mistaken for live pool truth. | Unexpanded-current-vdev assumption; no allocation changes between steps; representative block size; excludes prior generations, metadata, slop, fragmentation, compression, snapshots, live reporting, performance, duration, and failure risk. Sources: implementation assumptions and R19. | 150 words maximum, two compact paragraphs. | Do not repeat every trace assumption or create an oversized caveat panel. |
| COPY-05 | Privacy and next tools | Explain local handling and direct adjacent jobs to the right tool. | Local synchronous calculation; no tool network requests or storage; Share puts normalized configuration in the URL and copies it; links to ZFS capacity and padding calculators. Sources: R15, R21, implementation privacy contract. | 90 words maximum, one compact paragraph. | Do not promise anonymity, zero infrastructure logs, encrypted URLs, or repeat calculation results. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Keep the terms RAIDZ, vdev, recordsize, volblocksize, ashift, reflow, and rewrite where they are technically necessary.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, chart, wireframe, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The later manual writing pass owns them.

## Source ledger

- OpenZFS 2.3.0 release: https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0, checked 2026-08-13. Supports the release boundary for RAIDZ Expansion.
- OpenZFS `zpool-attach(8)`: https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html, checked 2026-08-13. Supports one-disk attachment, minimum device size, repeated expansion, unchanged redundancy, old and new block ratios, and reported-space uncertainty.
- OpenZFS `zpool-list(8)`: https://openzfs.github.io/openzfs-docs/man/master/8/zpool-list.8.html, checked 2026-08-13. Supports `-v` per-vdev usage statistics and `-p` exact parsable values for identifying current physical vdev allocation.
- OpenZFS Changing Pool Layout: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html, checked 2026-08-13. Supports the distinction between widening a RAIDZ vdev, adding a top-level vdev, and replacing members.
- OpenZFS RAIDZ: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html, checked 2026-08-13. Supports parity levels, block-size and sector effects, and old-block behavior after expansion.
- OpenZFS `zpool-features(7)`: https://openzfs.github.io/openzfs-docs/man/master/7/zpool-features.7.html, checked 2026-08-13. Supports the `org.openzfs:raidz_expansion` feature boundary.
- OpenZFS `vdev_raidz.c`: https://raw.githubusercontent.com/openzfs/zfs/master/module/zfs/vdev_raidz.c, checked 2026-08-13. Supports reflow without logical rewrite, time-dependent geometry, pause and resume behavior, and the post-expansion scrub.
- Google result pages for the exact and close queries listed in Search intent, checked in the in-app Browser on 2026-08-13. Supports the observed split between direct calculators, static pool calculators, documentation, and discrepancy discussions. Search ordering is volatile and is not a product claim.

## Open questions and blockers

- None. The writing pass has a closed technical contract, primary sources, a fixed prose ceiling, and an explicit boundary against duration and safety claims.

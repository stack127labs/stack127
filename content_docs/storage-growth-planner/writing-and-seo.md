# Writing and SEO plan: Storage Growth and TCO Planner

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Tool: Storage Growth and TCO Planner
Route: `/storage-growth-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
Search verification: Web connector for query discovery; engines were not individually exposed. Standalone Playwright with pinned Chromium 1223 verified the current competitor result shapes at 1280 x 720 and 390 x 844. The in-app Browser and SearXNG were unavailable.
Primary medium: Tool UI

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `storage growth calculator` | Project current data into a future capacity target and cost. | Inputs, exact runway chart, year rows, and TCO breakdown. | The first screen is the calculator; the result answers capacity and cost together. |
| Close | `storage capacity planning calculator` | Decide how much redundant local storage to buy for a horizon. | Capacity after reserve and first shortfall year. | The result sentence, chart, and year plan make the boundary visible. |
| Close | `NAS TCO calculator` | Estimate hardware, power, replacement, and backup budget. | Cost table with user-owned assumptions. | The cost section separates each category and labels the model. |
| Close | `storage TCO calculator` | Compare a local plan without a live vendor catalog. | Reproducible, assumption-driven total cost. | The guide explains what is included and excluded from this local model. |

### Intent not targeted

- `cloud storage pricing calculator`: provider tiers, retrieval, egress, requests, and minimum-duration pricing need a separate cloud model with current source data.
- `ZFS capacity calculator`: exact RAIDZ allocation, ashift, recordsize, compression, and expansion history belong to the existing ZFS tools.
- `best NAS` or drive-buying queries: this page accepts user prices and does not rank products or publish a catalog.

## Page promise

Plan a local storage purchase against your growth horizon and cost assumptions, while keeping the equal-drive capacity model and its limits visible.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1, short introduction, first form section | Tool UI plus Sentences | `brief.md`, implementation product decision | Do not restate the full input list below the tool. |
| Which inputs, modes, units, sources, or scope choices matter? | Form labels, Formula receipt, COPY-01 | Tool UI plus Sentences | implementation input contract | Explain only measured watts, growth, reserve, layout, and user costs; do not narrate button clicks. |
| How should someone choose meaningful inputs and use it for the real task? | COPY-01 after the tool | Sentences | implementation assumptions and primary sources | Give input-selection judgment, not a step-by-step UI manual. |
| How should the result and its important terms or uncertainty be interpreted? | Verdict, chart, year table, cost table, COPY-01 | Exact result visualization plus Table plus Sentences | implementation equations and test fixtures | Do not repeat values already visible in the result. |
| Which concepts or edge cases surprise users? | Formula receipt and COPY-01 | Tool UI plus Sentences | implementation layout rules, FF-002, FF-003, OpenZFS source | Explain strict shortfall and operating reserve once. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | COPY-02 and Formula receipt | Sentences plus Tool UI | implementation non-goals and exclusions | Do not add a large warning panel or repeat every field caveat. |
| How are user inputs handled? | Privacy note and COPY-02 | Tool UI plus Sentences | implementation privacy contract, EC-020 | State local calculation only; do not claim site-wide privacy. |
| What should the reader verify next? | COPY-03 and internal ZFS links | Sentences plus links | implementation adjacent routes, OpenZFS VDEVs | End with a real pool or backup verification step, not a generic related-links list. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Storage Growth and TCO Planner | What can I plan here? | Enter current data, growth, reserve, local layout, and cost assumptions. | Tool UI | `brief.md`, implementation wireframe | The tool and answer start immediately. | n/a |
| 2 | H2: Choose inputs that match your homelab | Which assumptions make the result useful? | Use measured system draw, a defensible growth rate, a real reserve, and prices you can revise. | Sentences | COPY-01, implementation assumptions | Do not describe ordinary controls or repeat labels. | COPY-01 |
| 3 | H2: Read the runway and cost result | What does the answer mean? | The chart compares projected demand with capacity after reserve; the table shows the first over-reserve year and the cost categories. | Exact result visualization | Implementation page composition, FF-001 | Let the live result carry exact values. | n/a |
| 3a | H3: Cost categories | Which costs make up the total? | Hardware, power, replacement reserve, backup budget, and total stay aligned in one compact table. | Table | Implementation cost contract, FF-004 | Do not turn the table into a prose comparison. | n/a |
| 3b | H3: Formula receipt | Can I reproduce the model? | Layout, reserve, growth convention, cost lines, and version stay visible as a compact receipt. | Table | Implementation formula contract, FF-006 | Do not write a methodology essay. | n/a |
| 4 | H2: Know what this model leaves out | Can I treat this as installed free space or a backup test? | No. It is equal-drive planning arithmetic and user-supplied TCO, not filesystem free space, reliability, restore proof, or product advice. | Sentences | COPY-02, implementation non-goals | Keep the caveat beside the claims it limits. | COPY-02 |
| 5 | H2: Verify the plan before buying | What should I check next? | Compare technology-specific geometry in the existing ZFS tools and verify a real backup and restore path. | Sentences | COPY-03, OpenZFS and CISA sources | Use two focused internal links; do not add an FAQ. | COPY-03 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Growth curve | Demand compounds once per year from current data and annual growth. | Formula receipt plus exact chart | FF-001 and FF-003 | COPY-01 should say seasonal or changing growth is outside this model. |
| Planning capacity | Raw drive bytes become modeled usable bytes, then the chosen operating reserve is removed. | Verdict, metric, and year table | FF-002 and implementation equations | COPY-02 should distinguish planning reserve from ZFS slop or filesystem free space. |
| TCO | Hardware is one-time; power, replacement reserve, and backup budget accumulate over the horizon. | Cost table | FF-004 and SNIA TCO source | COPY-02 should name excluded labor, cooling, tax, migration, and cloud charges. |
| Shortfall | The first year with demand strictly above planning capacity is reported; equality is still at capacity. | Verdict and state column | FF-007 | Keep the equality boundary beside the result interpretation. |

## Metadata proposal

- Registry label: `storage growth planner`
- Meta title: `Storage Growth and TCO Planner | stack127`
- Meta description: `Plan local storage capacity runway and modeled hardware, power, replacement, and backup cost from your assumptions. Not installed filesystem free space.`
- Page type: `WebApplication`
- Publication recommendation: `Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/zfs-capacity-calculator` | Check exact OpenZFS vdev, allocation, and planning headroom after this generic estimate. | `ZFS capacity calculator` | COPY-03 after the result. |
| Out | `/zfs-padding-calculator` | Investigate block-size and RAIDZ allocation padding when the generic layout is not enough. | `ZFS padding calculator` | COPY-03 beside the ZFS link. |
| Out | `/raid-calculator` | Compare generic RAID capacity and redundancy arithmetic for a non-ZFS plan. | `RAID calculator` | COPY-03 only if the user chose a conventional RAID layout. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Planned format | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Choose inputs that match your homelab | Help a new visitor choose representative growth, reserve, power, and cost assumptions. | Use measured whole-system watts; growth compounds once yearly; reserve is user policy; equal-drive layouts are generic. Source: implementation report and SNIA TCO model. | Prose. | Do not repeat field labels, chart values, or call the inputs recommendations. |
| COPY-02 | Know what this model leaves out | Set the trust boundary around capacity, cost, backup, and technology-specific behavior. | Not installed free space; not reliability, rebuild, performance, restore proof, financial advice, or a live price catalog. RAID redundancy is not a backup. Sources: implementation report, OpenZFS VDEVs, CISA backup guidance. | Prose with a compact list if needed. | Do not claim exact real-world capacity, best layout, guaranteed savings, or site-wide privacy. |
| COPY-03 | Verify the plan before buying | Give one practical next action and two relevant Stack127 continuations. | Compare exact ZFS geometry in the linked tools; verify a real backup copy and restore; user prices and rates remain assumptions. Sources: OpenZFS VDEVs, CISA backup guidance. | Prose and two links. | Do not add generic related reading, purchase links, or a second calculator. |

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- SNIA Total Cost of Ownership Model for Storage: https://www.snia.org/sites/default/files/SSSI/SNIA_TCO_Whitepaper_03-2021.pdf, checked 2026-08-23. Supports separating hardware and operating cost categories and keeping enterprise assumptions explicit.
- OpenZFS VDEVs: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html, checked 2026-08-23. Supports the boundary between generic capacity arithmetic and technology-specific failure domains.
- CISA backup guidance: https://www.cisa.gov/stopransomware/back-up-business-data, checked 2026-08-23. Supports treating independent backup and restore verification separately from array redundancy.
- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/?loc=ft, checked 2026-08-23. Supports excluding cloud retrieval, transfer, requests, and minimum-duration charges from this local-only model.
- OpenZFS RAIDZ allocation: https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html, checked 2026-08-23. Supports linking exact allocation questions to the existing ZFS routes.

## Open questions and blockers

- No product or content decision blocks the outline. Search engines were not individually available through the Web connector, SearXNG was not configured, and no in-app Browser runtime was connected. The primary query and close variants reuse the 2026-08-23 competitor research and its standalone Playwright evidence; refresh SERP evidence before publication. The route is ready for the eight-tool batch, but its committed migration is not applied yet.

# Writing and SEO plan: Drive Reliability Explorer

Status: ready
Tool: Drive Reliability Explorer
Route: `/drive-reliability`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-08-23
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: 4 sections, 600 words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `Backblaze drive reliability by model`, `Backblaze AFR model lookup` | Find a period-correct observed AFR and the exposure behind it for one hard-drive model. | Searchable period-scoped explorer with exact result and evidence fields | The explorer keeps period, model, drive days, failures, drive count, age, AFR, range, and source together. |
| Close | `compare Backblaze hard drive failure rates` | Compare a short list without treating the smallest point estimate as a recommendation. | Up to three selected model rows and an exact range visualization | The comparison table and chart use the same selected source rows. |
| Close | `what does Backblaze AFR mean` | Understand drive days, failures, scope, and uncertainty. | Result plus concise interpretation and source boundary | The guide explains the formula, approximate interval, thin cohorts, and data-center population. |

### Intent not targeted

- `best hard drive`, personal failure probability, MTTDL, price, or a full NAS specification catalog: these require workload, array, availability, or vendor facts that this source does not prove and belong in separate planning surfaces.

## Page promise

Choose a Backblaze source period and model to see the observed AFR, exposure, failures, drive count, age when reported, and an approximate evidence range, while keeping a data-center cohort separate from a home-NAS prediction.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1 introduction and tool heading | Sentences and Tool UI | `brief.md`; post-build review | Name the model-lookup job once; do not repeat it in the guide. |
| Which inputs, modes, units, sources, or scope choices matter? | Period controls, filters, cohort table, and source row | Tool UI and Table | implementation input contract; Backblaze Q1 2026 report | The guide explains why period and exposure matter, not the control mechanics. |
| How should someone choose meaningful inputs and use it for the real task? | Period/model guide section and comparison UI | Sentences and Table | `brief.md`; R1, R4, R8 | Recommend a matching period and short list, not a universal ranking. |
| How should the result and its uncertainty be interpreted? | Selected result, exact range visualization, and AFR guide section | Exact result visualization and Sentences | implementation interval contract; RF-001 to RF-005 | Do not restate values already visible in the result. |
| Which concepts or edge cases commonly surprise users? | AFR guide section and limited-evidence warning | Sentences and Exact result visualization | Backblaze inclusion rules; EC-008, EC-009, EC-012 | Explain drive days and zero failures once. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Boundary and next-step guide section | Sentences | competitive report non-goals; official Backblaze dataset page | State the home-NAS boundary beside the result interpretation. |
| How are user inputs handled? | Local-first note in the boundary section and no-request interaction | Sentences and Tool UI | implementation R13; EC-030, EC-031 | Scope privacy to filtering, selection, and share state. |
| What should the reader verify or do next? | Final guide section and source link | Sentences and Tool UI | Backblaze source page/report; storage-tool links | Point to SMART, firmware/workload context, warranty, backups, and adjacent planning. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Drive reliability explorer | What will this answer? | Identify model-level Backblaze cohort evidence and the home-NAS boundary in two short sentences. | Sentences | `brief.md`; implementation non-goals | No formula or syntax lesson before the tool. | COPY-01 |
| 2 | Interactive explorer | Which period and model should I inspect? | Keep quarterly, annual, and lifetime controls, filters, selection, source label, and reset in the primary visual. | Tool UI | implementation R1, R3, R4, R8 | Do not duplicate controls in prose. | n/a |
| 3 | Selected result and evidence range | What does the observed number represent? | Show AFR with the approximate range, drive days, failures, count, age, period, and source beside it. | Exact result visualization | implementation R5, R6, R9 | The guide interprets the fields but does not repeat result values. | n/a |
| 4 | Cohort list and comparison | Which short list is worth comparing? | Keep repeated model facts in the responsive table and cap the comparison at three rows. | Table | implementation R8, R9; EC-019 to EC-022 | No prose ranking or “best drive” language. | n/a |
| 5 | H2: Choose a period that matches the question | How do I avoid mixing unlike source scopes? | Explain that quarterly, annual, and lifetime are separate source periods and that a useful comparison keeps one period and a small model list. | Sentences | Backblaze Q1 2026 report; R3, R4, R8 | Do not narrate radio buttons or sorting. | COPY-02 |
| 6 | H2: AFR uses drive days, not drive count | Why is the rate not failures divided by drive count? | Explain `failures / (drive days / 365) × 100`, the approximate evidence range, and why zero observed failures is not zero risk. | Sentences | Backblaze Q1 2026 report; RF-001, RF-005 | One formula and one caveat; no worked number already shown by the UI. | COPY-03 |
| 7 | Source metadata | Where did this cohort come from? | Keep source name, checked date, snapshot version, inclusion label, and source link close to the result. | Tool UI | implementation R2, R5, R15 | Metadata is provenance, not a second methodology section. | n/a |
| 8 | Small-cohort warning and opt-in state | How should a thin row change my confidence? | Keep source qualification visible, hide below-threshold rows by default, and mark the reversible opt-in state. | Exact result visualization | Backblaze Q1 2026 report; EC-008, EC-012 | Do not turn a warning into a ranking or a recommendation. | n/a |
| 9 | H2: Treat fleet evidence as one input, then verify your own drive | What can this result not prove, and what comes next? | State the data-center population boundary, local handling, and practical checks for the real NAS decision. | Sentences | official Backblaze dataset page; competitive non-goals | No personal probability, warranty recommendation, or backup substitute claim. | COPY-04 |

No marker art, clean chart, or screenshot is justified. The live result visualization, responsive exact tables, and source metadata are more useful than a decorative explanation.

## Formula explanation

| Concept | What the reader needs | Presentation | Example or source | Caveat placement |
| --- | --- | --- | --- | --- |
| AFR exposure | The denominator is drive days converted to years, so drive count alone is not enough. | One equation in COPY-03 beside the result vocabulary. | Backblaze Q1 2026 report; SNIA formula presentation. | Say that AFR is an observed cohort rate, not an individual prediction. |
| Approximate evidence range | The interval is a transparent `poisson-normal-v1` approximation based on failures and exposure. | Result label plus one sentence in COPY-03. | implementation-report interval contract; RF-005. | Use “approximate 95% evidence range”; do not call it a guarantee or universal confidence claim. |
| Inclusion thresholds | Source period rules qualify normal rows, while small cohorts are hidden unless explicitly shown and marked. | Cohort evidence label, toggle, and COPY-02 caveat. | Backblaze Q1 2026 report; EC-008 and EC-012. | Put thin-cohort caution beside the interpretation, not in a detached warning essay. |
| Population boundary | Backblaze reports operational data-center cohorts with a particular workload and period. | COPY-04 and source link. | Backblaze Drive Stats dataset page. | Say what the result cannot prove before the next-step advice. |

## Metadata proposal

- Registry label: `drive reliability explorer`
- Meta title: `Drive Reliability Explorer: compare Backblaze model evidence`
- Meta description: `Compare Backblaze drive cohorts by period, model, AFR, failures, drive days, and approximate evidence range. Fleet data is not a home-NAS prediction.`
- Page type: `WebApplication`
- Publication recommendation: `Ready to publish with the eight-tool storage batch. The migration is committed but not applied, so the route is not live yet.`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/storage-tools` | The reader wants adjacent storage calculators and reference tools after inspecting reliability evidence. | `storage tools` | COPY-04 closing sentence. |
| Out | `/zfs-capacity-calculator` | The reader is moving from drive evidence to pool-capacity planning and should see the separate topology calculation. | `ZFS pool capacity calculator` | COPY-04 closing sentence. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | H1 introduction | Define the model lookup, answer fields, and main boundary before the tool. | `brief.md`; implementation R5, R13, and non-goals. | 65 words maximum, one short paragraph. | No formula, ranking, or “best drive” claim. |
| COPY-02 | `Choose a period that matches the question` | Explain period-safe comparison, representative model selection, and source qualification. | Backblaze Q1 2026 report; implementation R3, R4, R8; EC-008 and EC-012. | 135 words maximum, two short paragraphs. | No button instructions, no repeated cohort table, no universal recommendation. |
| COPY-03 | `AFR uses drive days, not drive count` | Explain the equation, approximate interval, exposure, and zero-failure boundary. | Backblaze Q1 2026 report; SNIA formula presentation; implementation interval contract; RF-001 and RF-005. | 170 words maximum, two short paragraphs plus one inline equation. | No personal probability, no guarantee, no repeated raw result values. |
| COPY-04 | `Treat fleet evidence as one input, then verify your own drive` | State data-center scope, local handling, exclusions, next checks, and adjacent planning links. | Backblaze Drive Stats dataset page/report; implementation R13; competitive non-goals. | 180 words maximum, two short paragraphs and one closing link sentence. | No claim that the tool predicts a home drive, inspects SMART, replaces backups, or supplies vendor/warranty facts. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, chart, source label, heading, or prior section.
- Keep the tool primary and do not add an FAQ or a methodology essay.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The later `$stack127-tool-writing` stage owns the content integration.

## Source ledger

- Backblaze Drive Stats data page: https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data, checked 2026-08-23. Supports dataset population, source use, and daily operational-drive context.
- Backblaze Drive Stats for Q1 2026: https://www.backblaze.com/blog/backblaze-drive-stats-for-q1-2026/, checked 2026-08-23. Supports AFR formula, period thresholds, source rows, and small-cohort caveats.
- SNIA AFR formula presentation: https://sniadeveloper.org/sites/default/files/SDC/2023/presentations/SNIA-SDC23-Klein-What-10-Years-Drive-Stats.pdf, checked 2026-08-23. Supports the drive-days AFR derivation.
- Tony LaTorre Backblaze Q3 2025 analysis: https://www.tlatorre.com/backblaze-q3-2025.html, checked 2026-08-23. Supports the decision to expose evidence strength and an interval rather than only a point rate.

## Open questions and blockers

- None. The route is ready for the eight-tool publication batch. Any later change to the four input artifacts invalidates these fingerprints and requires this plan to be reviewed again.

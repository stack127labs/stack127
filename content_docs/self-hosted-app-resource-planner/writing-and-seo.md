# Writing and SEO plan: self-hosted app resource planner

Follow `stack127_docs/writing-style.md` for all writing, visual choices, and SEO wording.

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: Self-hosted app resource planner
Route: `/self-hosted-app-resource-planner`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-10
Primary medium: Tool UI
Content depth: Give a self-hosting reader enough context to choose a useful app mix, understand reviewed ranges and unknowns, interpret the RAM and storage envelope, and verify a real host. Stop before hardware shopping, runtime monitoring, security review, or a universal compatibility claim.

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `self hosted app resource calculator` | Add planned services and compare their resource envelope with a host budget. | App editor, host inputs, answer-first RAM and storage result. | The live planner accepts reviewed apps, quantities, custom rows, RAM, storage, and headroom, then shows ranges, fit, evidence, and unknowns. |
| Secondary | `how much RAM for self hosted apps` | Get a starting estimate without treating it as a guarantee. | App-level estimates with assumptions and a total. | Reviewed ranges, per-app contributions, headroom, and a runtime verification section. |
| Secondary | `can my server run these Docker containers` | Compare a known host with a selected app mix. | Host budget comparison with a limiting resource. | Explicit available budget and binding-resource result, with a link to Docker and runtime verification guidance. |

### Intent not targeted
- `Docker Compose resource limits`: this planner estimates application demand and does not author or validate Compose enforcement fields; link to `/docker-compose-checker` instead.
- `self-hosted server hardware recommendation`: the page does not choose a vendor, CPU, GPU, NAS, VPS, or hardware tier.
- `Docker container monitoring`: observed usage belongs to Docker's runtime tools and the next verification step, not this static planner.

## Page promise

Plan the RAM and storage envelope for a selected self-hosted app mix while keeping evidence, headroom, unknown requirements, and runtime limits visible.

Reading flow: the intro names the planning job, the tool produces the first answer, the guide explains what each estimate means and how the envelope is formed, then it separates planning arithmetic from runtime verification and adjacent Compose work.

Search and visual evidence: the search backend was the web connector, with search engines not individually available; SearXNG was not configured. Direct pages were operated with standalone Playwright CLI and headless Chromium at 1280 x 900 and 375 x 812 on 2026-09-10. The Codex in-app Browser had no connected runtime. The observed result shapes included app-stack calculators, broad hardware sizing forms, static app requirement tables, and container capacity calculators.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | Intro and first tool section | Sentences, then Tool UI | `brief.md`; competitive report search intent | Do not repeat the lead result or list every control in the intro. |
| Which inputs, modes, units, sources, or scope choices matter? | Tool UI and `What the planner uses` | Tool UI and Sentences | `implementation-report.md`; `interface-contract.md` | Explain why RAM, storage, quantity, and headroom matter; let the UI show current values. |
| How should someone choose meaningful inputs and use it for the real task? | `Build a planning envelope from the workload` | Sentences and Table | `implementation-report.md`; self-host app data workflow | Explain representative quantity and host budget choices without narrating button clicks. |
| How should the result and its important terms or uncertainty be interpreted? | `Read the result as a planning envelope` | Exact result visualization | `interface-contract.md`; `edge-cases-and-tests.md` | Define within, tight, over, unknown, binding resource, and evidence without restating displayed totals. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | `Why unknown is a valid result` and runtime section | Sentences | `implementation-report.md`; self-host app schema and data workflow | Explain missing dimensions, ranges, quantities, and headroom; do not invent app requirements. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | `What this planner cannot tell you` | Sentences | `competitive-report.md`; Docker resource constraints | State that CPU, runtime spikes, acceleration, configuration, compatibility, security, and hardware choice are out of scope. |
| How are user inputs handled? | `What this planner cannot tell you` | Sentences | `implementation-report.md`; client behavior and test contract | State that the calculation runs in the browser after the catalogue is loaded; do not claim server-side privacy beyond the verified behavior. |
| What should the reader verify or do next? | `Verify the host after planning` | Sentences and internal links | Docker `stats` documentation; competitive report | Give the next measurement step and link to Compose checking and app directory context without repeating the result. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: Self-hosted app resource planner | What can I estimate here? | The tool plans a RAM and storage envelope for a selected app mix, with evidence and unknowns visible. | Tool UI | `brief.md`; `interface-contract.md` | The UI is the primary answer. Do not add a hero card or repeat the result below. | n/a |
| 2 | H2: What the planner uses | Which parts of a host plan affect the answer? | Reviewed app ranges, app quantity, host RAM, app storage budget, and explicit headroom are the complete first version. | Sentences | `implementation-report.md`; `interface-contract.md` | Do not promise CPU totals, provider matching, Docker limits, or automatic workload detection. | COPY-01 |
| 3 | H2: Build a planning envelope from the workload | How do I choose inputs that mean something? | Use the services intended for the same host, count materially separate instances, enter the budget available to apps, and set headroom for the host's own work and growth. | Sentences | `implementation-report.md`; competitive report user pain evidence | Do not prescribe a universal headroom percentage or turn a starting estimate into a hardware recommendation. | COPY-02 |
| 4 | H2: How evidence changes the result | What do reviewed, user-supplied, and unknown mean? | Reviewed ranges carry basis, confidence, source URLs, and a check date; custom rows are user supplied; missing dimensions stay unknown instead of becoming zero. | Sentences | `lib/self-hosted-app-resource-planner/data.ts`; self-host app schema and data workflow | The live per-app table owns current row values. The guide explains evidence classes, not a second catalogue. | COPY-03 |
| 5 | H2: Read the result as a planning envelope | What do within, tight, over, and unknown mean? | The result compares the known maximum with the budget left after headroom, identifies the closest complete budget, and keeps an incomplete dimension uncertain. | Sentences | `engine.ts`; `interface-contract.md`; `edge-cases-and-tests.md` | Do not repeat exact totals or claim that within means the app will run under every workload. | COPY-04 |
| 6 | H2: Why a resource plan is not a runtime guarantee | Why can arithmetic and runtime behavior disagree? | Application spikes, media acceleration, databases, configuration, storage growth, and Docker enforcement settings are different from a planning range. | Sentences | Docker resource constraints; competitive report technical truth ledger | Do not turn this into a Compose tutorial; link to `/docker-compose-checker` for static configuration checks. | COPY-05 |
| 7 | H2: Verify the host after planning | What should I measure next? | Compare the plan with observed container usage, app documentation, and the actual host before deployment or expansion. | Sentences | Docker container stats; self-host app directory | Link to `/self-host-apps` and Docker's stats documentation. Do not claim the planner monitors a host. | COPY-06 |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-07 |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| App contribution | A reviewed or custom range is multiplied by quantity before it is added to the selected mix. | Sentences beside a small equation | `implementation-report.md`; `engine.ts` | State that a range expresses an estimate with evidence, not a publisher requirement. |
| Available budget | `available = host budget × (1 - headroom / 100)` for RAM and storage. | Equation in Sentences | `implementation-report.md`; `engine.ts` | Explain that headroom is the reader's planning choice, not a universal constant. |
| Fit state | Within means the known maximum fits; tight means the known range crosses the available budget; over means the known minimum is already above it; unknown means a selected row lacks a dimension. | Exact result visualization plus Sentences | `engine.ts`; `edge-cases-and-tests.md` | Keep unknown distinct from zero and keep within distinct from a runtime guarantee. |
| Binding resource | Among complete dimensions, the largest known maximum-to-available ratio is the closest budget. | Result summary | `implementation-report.md`; `interface-contract.md` | If a dimension is incomplete, do not label it binding. |
| Display and rounding | RAM is shown in GiB and storage in GB; each displayed value below 10 uses one decimal place, while values at or above 10 use no decimal places. Calculation values retain more precision. | Table/result labels | `engine.ts`; `interface-contract.md` | Do not imply binary storage units or measurement precision not present in the contract. |

## Metadata proposal

- Registry label: `self-hosted app resource planner`
- Meta title: `Self-hosted app resource planner: estimate RAM and storage`
- Meta description: `Plan RAM and storage for a self-hosted app mix with reviewed ranges, headroom, custom rows, and explicit unknowns. No runtime guarantee.`
- Page type: `WebApplication`
- Publication recommendation: Keep unpublished until the registry decision, content review, and final browser QA are complete.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/self-host-apps` | Inspect the directory entry and source context for a selected app. | `self-hosted app directory` | COPY-03 |
| Out | `/docker-compose-checker` | Check YAML, Compose structure, and static configuration clues after planning. | `Docker Compose checker` | COPY-05 |
| Out | `/storage-growth-planner` | Extend a starting storage budget into a growth horizon when the workload is data-heavy. | `storage growth planner` | COPY-02 |
| Out | `https://docs.docker.com/reference/cli/docker/container/stats/` | Compare the envelope with observed CPU, memory, network, and block I/O for running containers. | `Docker stats` | COPY-06 |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | What the planner uses | Orient a reader to the narrow RAM and storage contract. | Selected app rows, quantity, RAM, app storage, headroom; `implementation-report.md`; `interface-contract.md`. | One connected explanation that makes the scope legible, then stop before describing every control. | No CPU total, provider tier, hardware recommendation, or repeated lead answer. |
| COPY-02 | Build a planning envelope from the workload | Explain how to choose app rows and host budgets for a useful starting calculation. | Quantity multiplication, available budget after headroom, custom rows; `implementation-report.md`; `engine.ts`. | Include one short practical scenario only if it clarifies host budget versus total installed storage. Link to `/storage-growth-planner` for time-based growth. | No universal headroom rule, exact hardware fit, or hidden workload multiplier. |
| COPY-03 | How evidence changes the result | Explain why a curated estimate can be used as a starting point and why a custom or missing row remains visible. | Range, kind, confidence, basis, source URLs, checked date, null handling; `content_docs/self-host-apps/schema.md`; `content_docs/self-host-apps/data-workflow.md`; `data.ts`. | Define reviewed, user-supplied, and unknown once. Stop before copying the live per-app table. | No invented numbers, zero requirement for missing data, or claim that reviewed means official. |
| COPY-04 | Read the result as a planning envelope | Make the status vocabulary actionable without duplicating the live answer. | Fit boundaries, known subtotal, binding ratio, one-decimal display; `engine.ts`; `interface-contract.md`; `edge-cases-and-tests.md`. | Explain the difference between tight and over, and why unknown changes confidence. Stop before restating result values. | No `will run`, `safe`, `optimal`, or guaranteed compatibility claim. |
| COPY-05 | Why a resource plan is not a runtime guarantee | Separate arithmetic planning from Docker enforcement and application behavior. | Docker hard and soft memory behavior, CPU shares, OOM risk, resource constraints; `https://docs.docker.com/engine/containers/resource_constraints/`; competitive report. | Explain the distinction in enough detail to prevent a misleading Compose configuration, then link to `/docker-compose-checker`. | No Compose syntax tutorial, security audit, runtime monitor claim, or universal Docker conclusion. |
| COPY-06 | Verify the host after planning | Give the reader a concrete next step after the estimate. | `docker stats` fields and limits; `https://docs.docker.com/reference/cli/docker/container/stats/`; app documentation and `/self-host-apps`. | Tell the reader what to compare during a representative workload and when to revisit the plan. Stop before building a monitoring guide. | No claim that the planner collects telemetry or sees private host state. |
| COPY-07 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Tool-build exclusion
`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- Docker resource constraints: https://docs.docker.com/engine/containers/resource_constraints/, checked 2026-09-10. Supports hard and soft memory behavior, CPU limits and shares, and OOM risk.
- Docker container stats: https://docs.docker.com/reference/cli/docker/container/stats/, checked 2026-09-10. Supports the observed-usage verification handoff.
- Stack127 self-host app schema: `content_docs/self-host-apps/schema.md`, inspected 2026-09-10. Supports reviewed range, confidence, basis, source URL, and null semantics.
- Stack127 self-host app data workflow: `content_docs/self-host-apps/data-workflow.md`, inspected 2026-09-10. Supports evidence review and estimate boundaries.
- SelfHostPicks calculator: https://selfhostpicks.com/tools/homelab-resource-calculator/, accessed 2026-09-10. Observed app selection, answer-first RAM output, source table, and workload caveats.
- The Home Server Blog calculator: https://thehomeserverblog.com/server-sizing-calculator/, accessed 2026-09-10. Observed workload, storage growth, backup, and headroom inputs.
- FindMeTool Docker calculator: https://findmetool.com/tools/docker-resource-calculator/, accessed 2026-09-10. Observed host budget, limits, reservations, local processing, and runtime handoff.
- GlobalCalc container calculator: https://globalcalc.net/c/us/container-resources-calculator/, accessed 2026-09-10. Observed binding-resource and spare-capacity result language.
- Stack127 implementation contract: `content_docs/self-hosted-app-resource-planner/implementation-report.md`, fingerprinted above. Supports the closed formula and exclusions.

## Open questions and blockers

- None for the content plan. The page remains unpublished until the separate registry decision and final QA.

## Usage Markdown handoff

Disposition: Closed and feasible for the retained Astra writing session after main acceptance.

### Assignment and reading order

COPY-07 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Choose catalog workloads with their displayed evidence or add a custom workload using plausible minimum/maximum RAM and storage estimates. Quantity multiplies both ends of each range. RAM is GiB and storage is decimal GB. Enter host budgets and a single headroom percentage applied once to both budgets. Missing estimates stay unknown; known subtotals remain useful but cannot settle the whole dimension. Within means maximum demand fits; tight means only the minimum fits; over means even the minimum exceeds budget. Equality fits.

### State interpretation and recovery

Separate no workloads, invalid custom ranges, complete fit, tight, over, and unknown dimensions. Unknown is not zero and must not receive a confident fit verdict. A binding dimension requires complete estimates. Present CPU notes as qualitative, never an invented summed CPU requirement.

### Limitations and next action

Planning ranges are not benchmarks, hardware recommendations, concurrency predictions, or guarantees. Actual database, media, indexing, cache, and user activity can dominate requirements. Measure the deployed workload and retain the evidence dates.

### Input handling boundary

Catalog evidence is loaded by the site; workload calculations after that use local form state. Do not turn that into a promise that catalog loading or the whole site makes no requests. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /self-host-apps; /storage-growth-planner. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation can support this plan without new controls, engines, media, data sources, or implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.

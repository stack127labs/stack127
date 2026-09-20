# Writing and SEO plan: 3-2-1 backup calculator

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: 3-2-1 backup calculator
Route: `/backup-321-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-10
Primary medium: Tool UI
Content depth: The tool answers the capacity decision first. Supporting content explains the two storage models, the recovery terms, the modelled estimate, browser-local handling, and what must be checked in the real backup system. It stops before product-specific retention, pricing, compliance certification, or restore instructions owned by related guidance.

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `3-2-1 backup calculator` | Size one local target and one off-site target from protected data and retention assumptions. | A calculator with one per-target capacity answer, a second target, and a combined total. | The workbench leads the page. The result labels the source as copy 1 and the planned targets as copies 2 and 3 without calling the plan verified compliance. |
| Secondary | `how much backup storage do I need retention versions NAS` | Translate growth, retained points, changed data, and headroom into storage. | Retention calculators and vendor guidance with different model assumptions. | The inputs name each assumption. The result receipt exposes the selected model, derivation, exact bytes, classifications, and rounding. |
| Secondary | `3-2-1 backup capacity calculation retention deduplication compression` | Find a formula that makes product-dependent assumptions visible. | Technical articles, vendor formulas, and calculators with opaque multipliers. | Explain the product-neutral full-only and full-plus-incremental models, then list compression, deduplication, snapshots, and vendor chain behavior as exclusions. |
| Secondary | `backup capacity calculator offsite version retention problem` | Check whether backup cadence and restore time fit recovery goals. | Planners with RPO, RTO, transfer, or off-site controls. | The optional recovery check shows RPO and local or off-site full-restore estimates as separate statuses. It does not turn them into a safety score. |

### Search verification record

- Search backend: web connector. Search engines: not individually available.
- Browser backend: standalone Playwright CLI. The required browser check ran at `1440 x 900` on 2026-09-10. The Bing result pages loaded, but the returned links were not reliably relevant for these four queries. The current intent decision therefore uses the web connector results plus the ready competitive report's operated competitor pages from 2026-09-10.
- The web connector returned calculator pages for the primary query, retention and vendor-formula pages for the storage query, and recovery or off-site planning pages for the recovery query. No new intent family displaced the primary capacity job.

### Intent not targeted

- `3-2-1 backup cost calculator`: Pricing depends on changing vendors, media, egress, request, and hardware assumptions. Link to a future cost page only if one exists; do not imply a purchase recommendation here.
- Product-specific GFS, synthetic-full, compression, deduplication, immutable-retention, snapshot, or provider sizing: The calculator has no product adapter for these behaviors. Explain the boundary briefly and send the reader to the product documentation.
- Verified `3-2-1 compliant backup`: Arithmetic cannot inspect placement, media independence, isolation, encryption, or restore success. The page may describe the planned copy relationship, never certify it.

## Page promise

Use the calculator to estimate the capacity for one local backup target and one off-site target from protected data, compounded growth, retained points, backup model, changed data, and headroom, with an optional recovery check. The result is a transparent planning estimate, not proof that a backup is isolated, encrypted, restorable, or 3-2-1 compliant.

Reading flow: the workbench asks for the assumptions that change capacity; the result leads with one target, then shows the second target and combined total; the exact anatomy and receipt explain where the number came from; short supporting sections explain model choice, recovery terms, and limits; the final links point to restore testing and adjacent storage planning.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | H1, intro, and first workbench view | Tool UI | `brief.md`; implementation report product decision | Do not add a generic backup introduction before the workbench. |
| Which inputs, modes, units, sources, or scope choices matter? | Input groups and model detail in the result | Tool UI | `interface-contract.md` input contract; implementation report input table | Do not restate every field in supporting prose. Explain only the model boundary and representative input choices. |
| How should someone choose meaningful inputs and use it for the real task? | Workbench labels, result receipt, and COPY-01 | Tool UI plus Sentences | Implementation report assumptions and exclusions; interface contract | Do not narrate ordinary button use or duplicate visible labels. |
| How should the result and its important terms or uncertainty be interpreted? | Lead result, capacity anatomy, recovery rows, receipt, and COPY-02 | Exact result visualization plus Sentences | Interface result contract; NIST SP 800-34 Rev. 1; implementation report rounding and uncertainty | Do not copy exact result values into paragraphs. Explain what estimated, modelled, RPO, and RTO mean. |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | Formula receipt and COPY-01 | Exact result visualization plus Sentences | Implementation equations; FF-001 through FF-008 | Do not create a second formula table in Markdown. The receipt owns expressions and rounding rules. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | Copy relationship result, receipt, and COPY-03 | Tool UI plus Sentences | Implementation non-goals and exclusions; EC-010; CISA ransomware guide | Repeat the boundary once beside the result and once in the prose handoff only if the prose adds interpretation. No compliance badge. |
| How are user inputs handled? | Privacy note near supporting content and COPY-04 | Sentences | Implementation accessibility, privacy, security, and performance section; EC-027 | State browser-local calculation and the explicit Share behavior once. Do not promise anonymity beyond the tested behavior. |
| What should the reader verify or do next? | COPY-04 and internal links | Sentences | CISA ransomware guide; backups-before-serious-apps lesson; implementation link decision | Send the reader to restore and isolation guidance. Do not turn this page into a restore procedure. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: 3-2-1 backup calculator: size local and off-site targets | How much capacity should each target have? | The page sizes two backup targets from one protected-data and retention policy. | Tool UI | `brief.md`; interface user task | Put the form first. No marketing preamble or compliance claim. | n/a |
| 2 | H2: Set the data, growth, retention, and backup model | Which assumptions drive the estimate? | Source size and unit, annual growth, horizon, full-only or full-plus-incremental model, retained points, changed data, and headroom are explicit inputs. | Tool UI | Interface input contract | Do not add controls for GFS, compression, deduplication, cost, or isolation because they are outside the contract. | n/a |
| 3 | H2: Read the capacity for each target | What does the answer say? | One target is the lead value. The local target, off-site target, combined capacity, projected source, repository, and headroom remain separately labelled. | Exact result visualization | Interface result contract; FF-001 | Exact values belong to the result rows and allocation bar. Do not restate them in prose or add a chart. | n/a |
| 4 | H2: Full-only and full-plus-incremental are different estimates | Why does the selected backup model change capacity? | Full-only stores one projected full for every retained point. Full-plus-incremental stores one projected full and one changed-data allowance for each additional point. | Sentences | Implementation equations and assumptions; FF-002 and FF-003 | Explain the conceptual difference and the product-neutral boundary. The receipt owns the selected expression. | COPY-01 |
| 5 | H2: Growth, rounding, and headroom stay visible | Why can a small input change the target size? | Growth compounds to the horizon, rounds half up after each year, changed-data and headroom allowances round up, and headroom is added after repository sizing for each target. | Exact result visualization | Implementation rounding contract; FF-001, FF-004, and FF-005 | The receipt exposes the real derivation and rounding rules. Do not add a year-by-year chart or a second worked result. | n/a |
| 6 | H2: What the recovery check says about RPO and RTO | What do the optional recovery statuses mean? | RPO compares backup interval with the target interval. RTO compares estimated transfer time for the projected full source with the target restore time. | Sentences | NIST SP 800-34 Rev. 1; implementation recovery equation; FF-007 | Explain equality and failure as decision signals. Keep durations labelled estimated and do not call them measured restore times. | COPY-02 |
| 7 | H2: What this calculator cannot prove | Does the result establish a real 3-2-1 backup? | It maps source, local, and off-site positions as planned copies, but it cannot verify physical placement, two media types, isolation, encryption, or restore success. | Sentences | Implementation non-goals; EC-010; CISA ransomware guide | State no verified compliance. Do not repeat a generic warning after every result row. | COPY-03 |
| 8 | H2: Verify the backup outside the calculator | What should happen after sizing? | Confirm the actual target placement and isolation, run a restore test, and check the real product's retention and overhead behavior. | Sentences | CISA ransomware guide; backups-before-serious-apps lesson; implementation link decision | Link to operational guidance. Do not write a restore runbook or claim the calculator performed the checks. | COPY-04 |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-05 |

No marker art, screenshot, clean chart, or decorative numeric illustration is planned. The tool UI, exact capacity anatomy, labelled recovery rows, and formula receipt already show the useful relationships. A marker drawing would not improve the numerical answer, and the 3-2-1 relationship is simple enough for the existing labelled result sentence.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Projected source and compounded growth | The source is projected year by year through the planning horizon. Each annual step uses whole-byte half-up rounding, so the calculator does not use a floating-point shortcut hidden from the reader. | Exact result visualization and formula receipt | For the default 2 TB, 20% growth, and 3-year horizon, the exact projected source is 3,456,000,000,000 bytes and displays as 3.46 TB. Implementation report equation 2; FF-001 and FF-005. | Beside the growth explanation, state that every retained point is sized from the horizon source, which is conservative for older points. |
| Full-only repository | `fullOnlyRepositoryBytes = projectedSourceBytes * retainedPoints`. Every retained point is treated as a projected full. | Formula receipt, with a short conceptual note in COPY-01 | Implementation report equation 5; FF-002. | State that this is a planning model, not a vendor-specific chain or pruning rule. |
| Full-plus-incremental repository | `fullPlusIncrementalRepositoryBytes = projectedSourceBytes + changedPerPointBytes * (retainedPoints - 1)`. The first point is one full; each additional point gets a ceil-rounded average changed-data allowance. | Formula receipt, with a short conceptual note in COPY-01 | Implementation report equations 4 and 6; FF-003 and FF-005. | State that changed data is an average allowance, not guaranteed daily change, compression, or deduplication. |
| Headroom and two targets | `headroomBytes = ceil(repositoryBytes * headroomBasisPoints / 10,000)`, then `targetBytes = repositoryBytes + headroomBytes`. Local and off-site targets use the same policy in version 1, and the combined total is their exact sum. | Exact capacity anatomy and labelled result rows | Implementation report equations 8 and 11; FF-004. | Keep headroom distinct from filesystem free-space policy and restore guarantees. |
| Recovery objectives | `rpoPasses` is true when backup interval is less than or equal to target RPO. Restore seconds use `ceil(projectedSourceBytes * 8 * 10,000 / (restoreBitsPerSecond * transferEfficiencyBasisPoints))`, then compare with target RTO in seconds. | Recovery status rows and receipt | NIST SP 800-34 Rev. 1 for RPO/RTO terms; implementation report equation 10; FF-007. | Say the transfer value is a modelled estimate for the projected full source. It excludes application restore work, contention, throttling, verification, and other downtime. |

The receipt should remain the source of truth for calculator version 1, input version 1, normalized inputs, ordered derivation, dated sources, value classifications, and the `modelled` uncertainty kind. Supporting content should explain how to read those fields, not copy the receipt into another table.

## Metadata proposal

- Registry label: `3-2-1 backup calculator`
- Meta title: `3-2-1 backup calculator: size local and off-site targets`
- Meta description: `Estimate local and off-site backup capacity from data size, growth, retention, backup model, and headroom. Optional RPO and RTO checks stay estimates.`
- Page type: `WebPage`
- Publication recommendation: `Keep unpublished until the central `stack127_pages` registry is separately approved. This plan does not add publication state, route metadata, a sitemap entry, or JSON-LD.`

The title names the tool and its result without stacking variants such as "backup storage calculator", "NAS calculator", and "3-2-1 planner" into one field. The description names the inputs that matter and the recovery boundary. Do not say "compliant", "safe", "best", "accurate", or "guaranteed" in metadata.

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Out | `/self-hosting-for-beginners/backups-before-serious-apps` | Continue from capacity planning to the 3-2-1 idea, external copies, isolation, and a real restore test. | `backup restore and 3-2-1 guidance` | COPY-04 after the limitation and next-step explanation. |
| Out | `/storage-growth-planner` | Model a broader storage horizon when the reader needs more than the backup repository estimate. | `storage growth planner` | After the growth and horizon explanation, only when the reader is planning primary storage too. |
| Out | `/drive-reliability` | Continue to a separate drive reliability question after sizing target capacity. | `drive reliability calculator` | Near the final next-step links, not inside the lead result. |
| Out | `/rebuild-calculator` | Continue to rebuild-time planning when a storage failure changes the recovery decision. | `rebuild calculator` | Near the recovery interpretation section as an optional adjacent task. |

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Full-only and full-plus-incremental are different estimates | Help the reader choose and interpret the two implemented capacity models. | Full-only is projected source times retained points. Full-plus-incremental is one projected full plus a ceil-rounded changed-data allowance for each additional point. Both targets use one shared policy. Use the implementation report, FF-002, and FF-003. | One connected explanation of the model choice, the first-versus-additional-point distinction, and the product-neutral boundary. Stop before repeating the receipt or teaching vendor-specific retention. | Do not call changed data daily, guaranteed, compressed, deduplicated, or vendor behavior. Do not repeat exact capacity values or input labels. |
| COPY-02 | What the recovery check says about RPO and RTO | Make the optional recovery result useful without overstating it. | RPO is the allowed data-age target compared with backup interval. RTO is the allowed recovery-time target compared with modelled local and off-site full-restore seconds. Equality passes. The estimate uses the projected full source and nominal throughput plus efficiency. Use NIST SP 800-34 Rev. 1, implementation equation 10, and FF-007. | Define both terms, explain pass or miss as a prompt for the next decision, and name the excluded downtime factors. Stop before writing a restore procedure. | Do not call transfer seconds measured, guaranteed, or a complete recovery duration. Do not repeat the status rows or invent a score. |
| COPY-03 | What this calculator cannot prove | Put the trust boundary beside the 3-2-1 copy relationship. | The source is copy 1, the local target is copy 2, and the off-site target is copy 3 as planned positions. The tool does not inspect whether targets are off-site, isolated, disconnected, encrypted, on different media, or successfully restored. Use implementation non-goals, EC-010, CISA backup options, and CISA ransomware guidance. | One concise paragraph that distinguishes a capacity map from operational verification. Stop after naming the concrete checks the tool cannot perform. | Never claim verified 3-2-1 compliance, protection, isolation, encryption, media independence, or restore success. Do not repeat a generic disclaimer after each result region. |
| COPY-04 | Verify the backup outside the calculator | Tell the reader where the estimate ends and the real work begins, including browser-local privacy. | The calculation runs in the browser with no input-bearing request, analytics event, cookie, local storage, or session storage. Explicit Share creates a versioned URL containing normalized inputs only. The reader still must verify placement, isolation, product retention behavior, and a real restore. Link the backup course lesson and CISA ransomware guidance. | Two short connected paragraphs or one compact section. State the local handling, then give the operational next step and links. Stop before a product runbook or privacy policy. | Do not say data never leaves the device if the user explicitly shares a URL. Do not imply that local calculation proves privacy for external services, or that the page checked a restore. |
| COPY-05 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for public wording. This plan owns search intent and useful coverage, not a separate voice.
- Apply `skills/stack127/unslop/SKILL.md` to every later public sentence.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Use exact terms such as RPO, RTO, full-only, full-plus-incremental, estimated, and modelled where they carry technical meaning.
- Do not invent facts, numbers, benefits, privacy claims, source behavior, or implementation behavior.
- Do not repeat a result, table, chart, receipt, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass. This task does not implement copy in the route or database.

## Limitations, trust, privacy, and result interpretation plan

- Trust boundary: call the output an estimated, modelled capacity result. Exact byte arithmetic and exact rounding make the calculation reproducible, but they do not make product behavior or operational recovery certain.
- Model boundary: version 1 uses either full-only or one-full-plus-additional-point allowances. It excludes GFS schedules, synthetic fulls, merge behavior, snapshots, filesystem metadata, parity, compression, deduplication, costs, and provider-specific fees.
- Scope boundary: one retention policy sizes both the local and off-site targets. The source is copy 1 and the two planned targets are copies 2 and 3. That relationship does not prove two media types, physical separation, off-site placement, isolation, encryption, or restore success.
- Recovery interpretation: RPO is a cadence comparison. RTO is a modelled full-source transfer estimate. A pass means the supplied assumptions fit the stated comparison, not that a real recovery will meet the goal.
- Privacy statement assignment: COPY-04 must state that calculation is browser-local and that the tool does not send inputs through requests, analytics, cookies, local storage, or session storage. It must also explain that explicit Share creates a URL with normalized inputs only, so sharing that URL is a user-initiated disclosure.
- Result reading order: read per-target capacity first, then local and off-site labels, combined total, repository and headroom anatomy, model and projected source, optional recovery rows, copy relationship, and receipt. The page must not turn this sequence into a dashboard score.
- Operational next step: send the reader to restore-test and isolation guidance. The page should ask them to verify the real target arrangement and run a restore test, without claiming that the calculator performed either check.

## Source ledger

- CISA, `Data backup options`: https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf, checked 2026-09-10. Supports the three-copy, two-storage-type, one-off-site framing. It does not support this calculator's capacity formula or a compliance score.
- CISA, `Ransomware guide`: https://www.cisa.gov/stopransomware/ransomware-guide, checked 2026-09-10. Supports offline or isolated backups and regular testing of availability and integrity. Use it for the operational limitation and next-step link, not as evidence that the calculator verifies those conditions.
- NIST SP 800-34 Rev. 1: https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf, checked 2026-09-10. Supports the meanings of recovery point objective and recovery time objective. It does not supply Stack127's transfer-time equation.
- Synology Knowledge Center, `How do I calculate the optimal storage size for the Active Backup suite?`: https://kb.synology.com/en-au/DSM/tutorial/How_do_I_calculate_storage_size_for_backups, checked 2026-09-10. Supports the fact that source data, changed data, retention, and product behavior affect backup capacity. Treat its formula as vendor-specific context, not a universal rule.
- Stack127 source repository: https://github.com/stack127labs/stack127, checked 2026-09-10. Supports the repository-owned exact-byte, versioned storage-calculation conventions referenced by the implementation report. The local checked-out implementation report and engine remain the source of truth for this tool's formula.

## Open questions and blockers

- None for the content plan. The route remains unpublished until a separate central registry decision. Later copy review must preserve the browser-local privacy wording, the full-only versus full-plus-incremental boundary, compounded growth and exact rounding, the RPO/RTO interpretation, and the no-verified-compliance limitation.


## Usage Markdown handoff

Disposition: Closed and feasible for the retained Astra writing session after main acceptance.

### Assignment and reading order

COPY-05 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Start with current protected logical data, not purchased disk capacity. GB/TB are decimal and GiB/TiB binary. Annual growth compounds through the horizon. Full-only allocates one projected full per retained point; full-plus-incremental allocates one projected full plus a changed-data allowance for each additional point. Headroom is added after repository sizing, independently to each of the two equal-policy targets. Recovery is optional and off by default; when enabled, use backup interval, target RPO/RTO, realistic sustained transfer rates, and efficiency. Restore timing uses the projected source, not the whole retained repository.

### State interpretation and recovery

Input edits clear the old calculation. Display-unit changes only reformat it. Disabled recovery must have no hidden recovery output. Invalid numbers need field recovery rather than a partial numeric answer. A failed recovery objective is a planning finding, not a failed backup test.

### Limitations and next action

No compression, deduplication, vendor retention chains, prices, physical placement, media independence, isolation, encryption, or restore-success verification.

### Input handling boundary

Calculations run locally. Explicit Share encodes normalized inputs in a versioned URL; anyone receiving that link can read them. Do not describe sharing as private or make a sitewide cookie/analytics claim. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /storage-growth-planner; /self-hosting-for-beginners/backups-before-serious-apps. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation can support this plan without new controls, engines, media, data sources, or implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.

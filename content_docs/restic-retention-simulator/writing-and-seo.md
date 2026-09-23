Status: ready
Feasibility: feasible. The accepted local engine and shared Markdown renderer support this closed guide without a new service, dataset, or runtime change. This accepts planning only; integration, rendered review, audit, and publication remain separate.
SERP checked: 2026-09-19
Tool: Restic retention simulator
Route: /restic-retention-simulator
Primary medium: Tool UI

## Search intent

Target the task query “restic forget simulator” and supporting searches about keep-daily, keep-weekly, and snapshot retention previews. The page should earn the click by showing a safe local answer quickly.

## Page promise

Paste snapshot JSON, choose rules, and see which snapshots remain with a reason for every decision. The page states its timezone and simulator limits beside the result.

## Heading and media outline

| Section | Heading | Search job | Claim | Medium | Order | Source | Copy ID |
|---|---|---|---|---|---|---|---|
| H1 | Restic retention simulator | restic forget simulator | Preview retention locally | tool ui | 1 | engine | none |
| H2 | Snapshot decisions | which snapshots kept | Every row gets a rule reason | exact result visualization | 2 | engine | none |
| H2 | Choose snapshot groups and retention periods | meaningful input choices | Paste a JSON array of 1 to 1000 snapshot records, not a wrapper object. Each needs a unique trimmed id and ISO time; hostname is the native host field, with host accepted for older inputs. Paths and tags are optional string arrays. Choose one grouping field, host, paths, or tags, and an explicit IANA timezone. Each keep-last, daily, weekly, monthly, and yearly count is an integer from 0 to 365; at least one must be positive. | Sentences | 3 | accepted implementation and interface contracts | COPY-01 |
| H2 | Calendar counts versus elapsed windows | result interpretation | Required Table in supporting content: columns Policy concept, What it counts, Boundary. Rows keep-last counts snapshots; daily/weekly/monthly/yearly count occupied calendar buckets; keep-within is elapsed-window behavior outside this tool. Use the official forget documentation and label unsupported behavior explicitly. | Table | 4 | accepted resolution contract and primary sources | n/a |
| H2 | Verify the result in the real system | model limits | The profile omits hourly, keep-within, tag selectors, combined grouping keys, repository access, and byte-reclamation estimates. Host-only grouping is a tool choice, not a claim about restic's command defaults. Compare a real restic forget --dry-run using the intended grouping and installed version before acting. | Sentences | 5 | primary documentation and accepted exclusions | COPY-02 |

## Formula explanation

| Concept | Plain explanation | Stop point |
|---|---|---|
| Calendar bucket | Daily, weekly, monthly, and yearly rules choose the newest snapshot in each local bucket. | Stop after a concrete row example |
| Grouping | Host, path, or tag grouping gives each group its own retention choices. | Stop before discussing every restic flag |

## Metadata proposal

Registry label: restic retention simulator

Meta title: Restic retention simulator | stack127

Meta description: Preview which restic snapshots retention rules keep, with bucket and grouping reasons.

Page type: WebPage

Publication recommendation: keep unpublished pending separate central registry approval.

## Internal links

| Reader need | Link | Placement |
|---|---|---|
| Compare backup planning | /storage-tools | supporting paragraph |
| Understand backup layout | /backup-321-calculator | related tool link |

## Manual prose handoff

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Choose snapshot groups and retention periods | Choose meaningful inputs and interpret a representative run in usage_markdown. | Paste a JSON array of 1 to 1000 snapshot records, not a wrapper object. Each needs a unique trimmed id and ISO time; hostname is the native host field, with host accepted for older inputs. Paths and tags are optional string arrays. Choose one grouping field, host, paths, or tags, and an explicit IANA timezone. Each keep-last, daily, weekly, monthly, and yearly count is an integer from 0 to 365; at least one must be positive. Rules are evaluated separately in each selected group and their kept sets are combined. Calendar rules select the newest snapshot in each occupied period. Empty periods do not consume a count. If there are fewer periods than requested, the model also retains the oldest snapshot in that group. Weekly buckets begin Monday. A pruned row means no implemented rule selected it; it does not mean data was deleted. Use the current implementation and interface contracts, engine, and source ledger. | Explain the consequential input choices, then the governing decision rule. Use an ordered list only for the actual preparation sequence. Stop before repeating the live result rows. | No invented input mode, full-system validation, or result-value narration. |
| COPY-02 | Verify the result in the real system | Explain the boundary and next step in content_markdown. | The profile omits hourly, keep-within, tag selectors, combined grouping keys, repository access, and byte-reclamation estimates. Host-only grouping is a tool choice, not a claim about restic's command defaults. Compare a real restic forget --dry-run using the intended grouping and installed version before acting. Use the accepted exclusions and primary sources below. | Connect the model's boundary to the specific external verification needed. Stop before a system administration runbook. | No guarantee, compatibility certification, automatic fix, or claim of actions the tool did not perform. |

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is this and who needs it? | Existing page promise, H1, short introduction | Tool UI | brief.md and product decision | No second introduction. |
| Which inputs, scope, and units matter? | Visible inputs and COPY-01 | Sentences | Accepted input contract and engine | Explain decisions, not each ordinary button. |
| How are representative inputs chosen? | COPY-01 in usage_markdown | Sentences | Closed facts below | Use actual source syntax and scope. |
| What does the result mean? | Exact result table and planned interpretation table | Table | Resolution contract | Never transcribe the current rows into prose. |
| Which ordering or boundary surprises matter? | COPY-01 and interpretation table | Sentences | Accepted boundary fixtures | Explain cause once. |
| What cannot be proved? | COPY-02 | Sentences | Product exclusions | Place caveats with the claim they limit. |
| How are inputs handled? | One usage note | Sentences | Client state, pure engine, accepted privacy checks | Scope the claim to calculation inputs, not all site traffic. |
| What happens next? | COPY-02 and internal links | Sentences | Primary operational docs | Link out before adding a runbook. |

## Usage Markdown handoff

This is a closed planning contract, not final public copy. Astra writes COPY-01 into usage_markdown and COPY-02 plus the required interpretation table into content_markdown after main acceptance. Luna integrates those approved fields.

### Technical facts and representative use

Paste a JSON array of 1 to 1000 snapshot records, not a wrapper object. Each needs a unique trimmed id and ISO time; hostname is the native host field, with host accepted for older inputs. Paths and tags are optional string arrays. Choose one grouping field, host, paths, or tags, and an explicit IANA timezone. Each keep-last, daily, weekly, monthly, and yearly count is an integer from 0 to 365; at least one must be positive.

Rules are evaluated separately in each selected group and their kept sets are combined. Calendar rules select the newest snapshot in each occupied period. Empty periods do not consume a count. If there are fewer periods than requested, the model also retains the oldest snapshot in that group. Weekly buckets begin Monday. A pruned row means no implemented rule selected it; it does not mean data was deleted.

### State explanations

Malformed JSON, duplicate IDs, empty snapshots, invalid dates, and all-zero rules prevent results. An unrecognized nonempty timezone produces an explicit UTC fallback warning. Editing clears the previous trace; rerun Preview retention. Assumptions disclosure changes no policy. Copy trace reports clipboard success or preserves a selectable report on failure.

The guide follows the whole workbench and its results. Do not insert instructions between controls and results. No basic/advanced switch exists. Evidence disclosures, where present, change neither normalized inputs nor the answer.

### Required lists and media

- One ordered list may express preparing the source input, choosing the result-driving scope, and checking again after a correction. Keep connected reasoning in sentences.
- Required Table in supporting content: columns Policy concept, What it counts, Boundary. Rows keep-last counts snapshots; daily/weekly/monthly/yearly count occupied calendar buckets; keep-within is elapsed-window behavior outside this tool. Use the official forget documentation and label unsupported behavior explicitly.
- Preserve the existing exact interactive output. Do not add marker art, screenshots, a chart, or a second live-result table.
- Integration must trace the ordered list if used and the required Markdown table to rendered DOM in both themes at desktop and narrow widths. Verify headers, wrapping, and no page overflow.

### Privacy boundary

The route keeps entered values in React memory and calls its local pure engine. The tool does not send these inputs to a server, host, broker, or repository and does not save them in a URL or browser storage. Copy is an explicit clipboard action. This claim concerns the tool inputs only; it does not assert that the entire website makes no requests or uses no analytics. Evidence is the accepted route client and engine plus the page-owned privacy tests. Do not broaden it to a sitewide promise.

### Sources, links, and writing constraints

Use the primary technical URLs in the source ledger for behavior, and the accepted local implementation for the tool's narrower profile. Community and competitor sources explain user needs only. Reuse the internal-link plan with a publication check before integration; unpublished sibling tools are conditional and must not become public dead links.

Follow `stack127_docs/writing-style.md`. The source ledger and implemented profile define which behavior the page can claim.

### Reconciliation with older artifacts

The interface input-table shorthand says object with snapshots, but the implemented textarea and example accept the snapshot array directly. Writing must use the actual array contract. The brief's timeline is fulfilled by the exact snapshot decision table; no new timeline is authorized.

### Search verification record

Checked 2026-09-19. Queries: `restic forget simulator`, `restic retention calculator`, `restic keep daily weekly`. Search backend: web connector for discovery, engines not individually available. Browser backend: standalone Playwright CLI at 1440 x 900 after the in-app Browser returned no available instance. Bing result pages loaded but returned broad or unrelated results, so they cannot establish exact-query rankings or saturation. The web connector returned documentation and troubleshooting discussions consistent with the task in the accepted research. Preserve that limitation; no new competitor superiority claim follows from this check.

### Tool-build exclusion

The build stage does not draft or integrate this guide. Astra owns wording; the separate Luna integration stage owns applying and verifying approved content.

## Source ledger

- https://restic.readthedocs.io/en/stable/060_forget.html
- https://github.com/restic/restic/blob/master/doc/075_scripting.rst
- https://forum.restic.net/t/confusion-about-keep-daily-option/7888

## Open questions and blockers

None for this scoped content plan. Current-search visibility is limited as recorded above. Integration must verify rendered content and link publication; this document does not certify either or authorize publication.

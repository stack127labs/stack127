Status: ready
Feasibility: feasible. The accepted local engine and shared Markdown renderer support this closed guide without a new service, dataset, or runtime change. This accepts planning only; integration, rendered review, audit, and publication remain separate.
SERP checked: 2026-09-19
Pipeline acceptance: `content_docs/lxc-idmap-checker/pipeline-acceptance.json`
Tool: LXC ID mapping checker
Route: /lxc-idmap-checker
Primary medium: Tool UI
Input fingerprint: `competitive-report.md sha256:628bf1012858bc8e6d9d5db9232506398e54b2eff96c51209295bbc30b9a06d4`
Input fingerprint: `implementation-report.md sha256:287cb38dd27dee071aef8268b3ee9359035b95cd332fca3ac1fbfced0e6daf0c`
Input fingerprint: `interface-contract.md sha256:84fcd154466599ef26286bdbef4e2b514c8403c79865801704a0355e35a986dd`
Input fingerprint: `edge-cases-and-tests.md sha256:80bd69cd6221a97ab7afaf6fdcc26a594cc803b6eb2ccc560847b987efdf2dfc`
Input fingerprint: `brief.md sha256:6ae42360e0aa61bd06251d32c520c9e731fb6a139e29d3379c6b1bce89756737`

## Search intent

Target “LXC idmap checker” and supporting searches about Proxmox UID mapping, subuid grants, and unprivileged container permission errors. Lead with diagnosis of supplied lines.

## Page promise

Paste UID and GID maps, optionally add grants, and see the host ID for a query. The result distinguishes arithmetic from runtime permission uncertainty.

## Heading and media outline

| Section | Heading | Search job | Claim | Medium | Order | Source | Copy ID |
|---|---|---|---|---|---|---|---|
| H1 | LXC ID mapping checker | LXC idmap checker | Check an existing map locally | tool ui | 1 | engine | none |
| H2 | Query result | proxmox map uid 1000 | Host ID and range are shown exactly | exact result visualization | 2 | engine | none |
| H2 | Check the map and its matching grant file | meaningful input choices | Enter UID map lines and GID map lines separately, preserving u or g, container start, host start, and length. Select a UID or GID query and a container ID. Optional grant rows use owner:start:length and stay separate for /etc/subuid and /etc/subgid. When grants are supplied, enter their exact owner. IDs end at 4294967294; lengths must be positive and endpoints must fit. | Sentences | 3 | accepted implementation and interface contracts | COPY-01 |
| H2 | Mapping and grant results are separate | result interpretation | Required Table in supporting content: columns Result, What was checked, What remains unknown. Cover mapped host ID, unmapped query, grant covered, grant missing, and grant unknown. Keep UID and GID source distinctions explicit and avoid repeating the exact range rows. | Table | 4 | accepted resolution contract and primary sources | n/a |
| H2 | Verify the result in the real system | model limits | Missing grants leave coverage unknown. Supplied grants without full selected-owner coverage produce missing coverage. UID grants never satisfy GID queries. This static check does not inspect live files, default namespace mappings, kernel state, file ownership, ACLs, or whether the container starts or can access a mount. Verify those on the actual host. | Sentences | 5 | primary documentation and accepted exclusions | COPY-02 |

## Formula explanation

| Concept | Plain explanation | Stop point |
|---|---|---|
| Offset | A container ID maps to host start plus its offset inside the range. | Stop after one UID example |
| Grant coverage | A mapped host range still needs a matching subordinate grant when grants are supplied. | Stop before ACL and kernel detail |

## Metadata proposal

Registry label: lxc id mapping checker

Meta title: LXC ID mapping checker | stack127

Meta description: Check Proxmox LXC UID and GID mappings, overlaps, gaps, and subordinate grants.

Page type: WebPage

Publication recommendation: keep unpublished pending separate central registry approval.

## Internal links

| Reader need | Link | Placement |
|---|---|---|
| Browse self-hosted software | /self-host-apps | supporting link |
| Learn self-hosting basics | /self-hosting-for-beginners | related guide |

## Manual prose handoff

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Check the map and its matching grant file | Choose meaningful inputs and interpret a representative run in usage_markdown. | Enter UID map lines and GID map lines separately, preserving u or g, container start, host start, and length. Select a UID or GID query and a container ID. Optional grant rows use owner:start:length and stay separate for /etc/subuid and /etc/subgid. When grants are supplied, enter their exact owner. IDs end at 4294967294; lengths must be positive and endpoints must fit. For a query inside a range, host ID equals host start plus container ID minus container start. The internal interval includes its start and excludes start plus length; displayed endpoints are inclusive. A query outside the supplied ranges is unmapped, not a parse failure. Grant covered means one exact-owner grant of the matching ID type covers the entire matched host range. A grant covering only the queried ID is insufficient under this checker. Use the current implementation and interface contracts, engine, and source ledger. | Explain the consequential input choices, then the governing decision rule. Use an ordered list only for the actual preparation sequence. Stop before repeating the live result rows. | No invented input mode, full-system validation, or result-value narration. |
| COPY-02 | Verify the result in the real system | Explain the boundary and next step in content_markdown. | Missing grants leave coverage unknown. Supplied grants without full selected-owner coverage produce missing coverage. UID grants never satisfy GID queries. This static check does not inspect live files, default namespace mappings, kernel state, file ownership, ACLs, or whether the container starts or can access a mount. Verify those on the actual host. Use the accepted exclusions and primary sources below. | Connect the model's boundary to the specific external verification needed. Stop before a system administration runbook. | No guarantee, compatibility certification, automatic fix, or claim of actions the tool did not perform. |

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

Enter UID map lines and GID map lines separately, preserving u or g, container start, host start, and length. Select a UID or GID query and a container ID. Optional grant rows use owner:start:length and stay separate for /etc/subuid and /etc/subgid. When grants are supplied, enter their exact owner. IDs end at 4294967294; lengths must be positive and endpoints must fit.

For a query inside a range, host ID equals host start plus container ID minus container start. The internal interval includes its start and excludes start plus length; displayed endpoints are inclusive. A query outside the supplied ranges is unmapped, not a parse failure. Grant covered means one exact-owner grant of the matching ID type covers the entire matched host range. A grant covering only the queried ID is insufficient under this checker.

### State explanations

Malformed ranges, zero lengths, endpoint overflow, or overlaps on either container or host side prevent results and retain inputs. Gaps are findings; an unmapped query is a completed answer. Editing clears the previous diagnosis. Clipboard failure leaves selectable data. No host probing, loading, or runtime-permission success state is available.

The guide follows the whole workbench and its results. Do not insert instructions between controls and results. No basic/advanced switch exists. Evidence disclosures, where present, change neither normalized inputs nor the answer.

### Required lists and media

- One ordered list may express preparing the source input, choosing the result-driving scope, and checking again after a correction. Keep connected reasoning in sentences.
- Required Table in supporting content: columns Result, What was checked, What remains unknown. Cover mapped host ID, unmapped query, grant covered, grant missing, and grant unknown. Keep UID and GID source distinctions explicit and avoid repeating the exact range rows.
- Preserve the existing exact interactive output. Do not add marker art, screenshots, a chart, or a second live-result table.
- Integration must trace the ordered list if used and the required Markdown table to rendered DOM in both themes at desktop and narrow widths. Verify headers, wrapping, and no page overflow.

### Privacy boundary

The route keeps entered values in React memory and calls its local pure engine. The tool does not send these inputs to a server, host, broker, or repository and does not save them in a URL or browser storage. Copy is an explicit clipboard action. This claim concerns the tool inputs only; it does not assert that the entire website makes no requests or uses no analytics. Evidence is the accepted route client and engine plus the page-owned privacy tests. Do not broaden it to a sitewide promise.

### Sources, links, and writing constraints

Use the primary technical URLs in the source ledger for behavior, and the accepted local implementation for the tool's narrower profile. Community and competitor sources explain user needs only. Reuse the internal-link plan with a publication check before integration; unpublished sibling tools are conditional and must not become public dead links.

Apply the shared writing-voice and unslop skills. Keep necessary technical terms. Do not invent facts, numbers, privacy promises, guaranteed compatibility, or live checks. Do not narrate values already visible in the result. No generic FAQ or fixed word quota is required.

### Reconciliation with older artifacts

The brief calls queries optional, but the accepted interface requires query type and ID. Writing follows the implemented required query. Contiguous coverage is not a universal requirement: gaps are diagnosed and an out-of-range query is unmapped; do not claim every gap invalidates the input.

### Search verification record

Checked 2026-09-19. Queries: `LXC idmap checker`, `Proxmox uid mapping checker`, `subuid mapping validator`. Search backend: web connector for discovery, engines not individually available. Browser backend: standalone Playwright CLI at 1440 x 900 after the in-app Browser returned no available instance. Bing result pages loaded but returned broad or unrelated results, so they cannot establish exact-query rankings or saturation. The web connector returned documentation and troubleshooting discussions consistent with the task in the accepted research. Preserve that limitation; no new competitor superiority claim follows from this check.

### Tool-build exclusion

The build stage does not draft or integrate this guide. Astra owns wording; the separate Luna integration stage owns applying and verifying approved content.

## Source ledger

- https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html
- https://man7.org/linux/man-pages/man5/subuid.5.html
- https://forum.proxmox.com/threads/lxc-id-mapping-tool.143186/

## Open questions and blockers

None for this scoped content plan. Current-search visibility is limited as recorded above. Integration must verify rendered content and link publication; this document does not certify either or authorize publication.

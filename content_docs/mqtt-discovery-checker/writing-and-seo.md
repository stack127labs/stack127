Status: ready
Feasibility: feasible. The accepted local engine and shared Markdown renderer support this closed guide without a new service, dataset, or runtime change. This accepts planning only; integration, rendered review, audit, and publication remain separate.
SERP checked: 2026-09-19
Tool: Home Assistant MQTT discovery checker
Route: /mqtt-discovery-checker
Primary medium: Tool UI

## Search intent

Target “Home Assistant MQTT discovery checker” and supporting searches about config topics, discovery JSON, device metadata, and testing before publish. Lead with a broker-free diagnostic.

## Page promise

Paste a discovery topic and JSON payload, then get a validity status with exact field findings. The checker separates structural errors from profile warnings.

## Heading and media outline

| Section | Heading | Search job | Claim | Medium | Order | Source | Copy ID |
|---|---|---|---|---|---|---|---|
| H1 | MQTT discovery checker | MQTT discovery JSON validator | Check topic and payload locally | tool ui | 1 | engine | none |
| H2 | Findings | homeassistant config topic wrong | Each finding names severity and path | exact result visualization | 2 | engine | none |
| H2 | Check a discovery topic with its payload | meaningful input choices | Supply the discovery topic, one-segment prefix, and a JSON object payload. Default prefix is homeassistant; the topic ends in config and includes a supported component plus object ID, with an optional node ID. Topic IDs use letters, digits, underscores, or hyphens. Common documented abbreviations such as uniq_id, stat_t, and dev are recognized. Sensor and binary_sensor profiles require a state topic; button requires a command topic. | Sentences | 3 | accepted implementation and interface contracts | COPY-01 |
| H2 | What the discovery status establishes | result interpretation | Required Table in supporting content: columns Status, Meaning, Next check. Rows valid means this profile found no blocking issue; partial means review warning paths and component-specific docs; invalid means correct the indicated field before a fresh check. Do not repeat individual live finding messages. | Table | 4 | accepted resolution contract and primary sources | n/a |
| H2 | Verify the result in the real system | model limits | The checker does not publish, subscribe, contact a broker, inspect retained messages or ACLs, render templates, or prove that Home Assistant creates an entity. It does not implement every component schema or every Home Assistant release. Confirm the exact component documentation and installed Home Assistant behavior. | Sentences | 5 | primary documentation and accepted exclusions | COPY-02 |

## Formula explanation

| Concept | Plain explanation | Stop point |
|---|---|---|
| Topic shape | The prefix and component identify a discovery family, and the topic ends with `config`. | Stop after one topic correction |
| Severity | Structural errors block the shape; warnings flag incomplete or version-sensitive fields. | Stop before component-specific catalogs |

## Metadata proposal

Registry label: home assistant mqtt discovery checker

Meta title: Home Assistant MQTT discovery checker | stack127

Meta description: Check Home Assistant MQTT discovery topics and JSON payloads with field-level findings.

Page type: WebPage

Publication recommendation: keep unpublished pending separate central registry approval.

## Internal links

| Reader need | Link | Placement |
|---|---|---|
| Browse self-hosted software | /self-host-apps | supporting link |
| Understand privacy boundaries | /privacy | limitation link |

## Manual prose handoff

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | Check a discovery topic with its payload | Choose meaningful inputs and interpret a representative run in usage_markdown. | Supply the discovery topic, one-segment prefix, and a JSON object payload. Default prefix is homeassistant; the topic ends in config and includes a supported component plus object ID, with an optional node ID. Topic IDs use letters, digits, underscores, or hyphens. Common documented abbreviations such as uniq_id, stat_t, and dev are recognized. Sensor and binary_sensor profiles require a state topic; button requires a command topic. A valid result means no errors were found within this profile. Partial means common-field checks or warnings leave work to review, including recognized components outside sensor, binary_sensor, and button. Findings carry severity, code, and JSON path. Normalized JSON is formatting evidence, not an automatically repaired or published payload. Use the current implementation and interface contracts, engine, and source ledger. | Explain the consequential input choices, then the governing decision rule. Use an ordered list only for the actual preparation sequence. Stop before repeating the live result rows. | No invented input mode, full-system validation, or result-value narration. |
| COPY-02 | Verify the result in the real system | Explain the boundary and next step in content_markdown. | The checker does not publish, subscribe, contact a broker, inspect retained messages or ACLs, render templates, or prove that Home Assistant creates an entity. It does not implement every component schema or every Home Assistant release. Confirm the exact component documentation and installed Home Assistant behavior. Use the accepted exclusions and primary sources below. | Connect the model's boundary to the specific external verification needed. Stop before a system administration runbook. | No guarantee, compatibility certification, automatic fix, or claim of actions the tool did not perform. |

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

Supply the discovery topic, one-segment prefix, and a JSON object payload. Default prefix is homeassistant; the topic ends in config and includes a supported component plus object ID, with an optional node ID. Topic IDs use letters, digits, underscores, or hyphens. Common documented abbreviations such as uniq_id, stat_t, and dev are recognized. Sensor and binary_sensor profiles require a state topic; button requires a command topic.

A valid result means no errors were found within this profile. Partial means common-field checks or warnings leave work to review, including recognized components outside sensor, binary_sensor, and button. Findings carry severity, code, and JSON path. Normalized JSON is formatting evidence, not an automatically repaired or published payload.

### State explanations

Malformed JSON, unsafe integer tokens, invalid topic structure, unknown components, invalid QoS, or missing required profile topics prevent a successful result and preserve field text for recovery. Partial results keep warnings visible. Edits clear prior findings. JSON disclosure never changes the payload. A copied preview is not sent to MQTT.

The guide follows the whole workbench and its results. Do not insert instructions between controls and results. No basic/advanced switch exists. Evidence disclosures, where present, change neither normalized inputs nor the answer.

### Required lists and media

- One ordered list may express preparing the source input, choosing the result-driving scope, and checking again after a correction. Keep connected reasoning in sentences.
- Required Table in supporting content: columns Status, Meaning, Next check. Rows valid means this profile found no blocking issue; partial means review warning paths and component-specific docs; invalid means correct the indicated field before a fresh check. Do not repeat individual live finding messages.
- Preserve the existing exact interactive output. Do not add marker art, screenshots, a chart, or a second live-result table.
- Integration must trace the ordered list if used and the required Markdown table to rendered DOM in both themes at desktop and narrow widths. Verify headers, wrapping, and no page overflow.

### Privacy boundary

The route keeps entered values in React memory and calls its local pure engine. The tool does not send these inputs to a server, host, broker, or repository and does not save them in a URL or browser storage. Copy is an explicit clipboard action. This claim concerns the tool inputs only; it does not assert that the entire website makes no requests or uses no analytics. Evidence is the accepted route client and engine plus the page-owned privacy tests. Do not broaden it to a sitewide promise.

### Sources, links, and writing constraints

Use the primary technical URLs in the source ledger for behavior, and the accepted local implementation for the tool's narrower profile. Community and competitor sources explain user needs only. Reuse the internal-link plan with a publication check before integration; unpublished sibling tools are conditional and must not become public dead links.

Follow `stack127_docs/writing-style.md`. The source ledger and implemented profile define which behavior the page can claim.

### Reconciliation with older artifacts

Older research suggests component-specific omissions are only warnings. The accepted implementation makes missing sensor/binary_sensor state topics and button command topics blocking errors. Writing follows the accepted profile, not the older broad wording. The initial live form is empty; its example is loaded explicitly.

### Search verification record

Checked 2026-09-19. Queries: `Home Assistant MQTT discovery checker`, `MQTT discovery JSON validator`, `homeassistant config topic checker`. Search backend: web connector for discovery, engines not individually available. Browser backend: standalone Playwright CLI at 1440 x 900 after the in-app Browser returned no available instance. Bing result pages loaded but returned broad or unrelated results, so they cannot establish exact-query rankings or saturation. The web connector returned documentation and troubleshooting discussions consistent with the task in the accepted research. Preserve that limitation; no new competitor superiority claim follows from this check.

### Tool-build exclusion

The build stage does not draft or integrate this guide. Astra owns wording; the separate Luna integration stage owns applying and verifying approved content.

## Source ledger

- https://www.home-assistant.io/integrations/mqtt
- https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt/discovery.py
- https://community.home-assistant.io/t/mqtt-discovery-does-not-seem-to-run/336276

## Open questions and blockers

None for this scoped content plan. Current-search visibility is limited as recorded above. Integration must verify rendered content and link publication; this document does not certify either or authorize publication.

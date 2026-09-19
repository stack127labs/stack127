# Writing and SEO template

Copy this structure to `content_docs/<route-without-leading-slash>/writing-and-seo.md`.

```markdown
# Writing and SEO plan: [[tool name]]

Status: draft
Feasibility: [[feasible or blocked, with evidence and promise boundary]]
Tool: [[tool name]]
Route: `/[[route]]`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `implementation-report.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `interface-contract.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `edge-cases-and-tests.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `brief.md sha256:[[64 lowercase hex characters]]`
SERP checked: [[YYYY-MM-DD]]
Primary medium: Tool UI
Content depth: [[what readers need to understand and where this page stops]]
Pipeline acceptance: `content_docs/<route-without-leading-slash>/pipeline-acceptance.json`

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `[[query]]` | [[job]] | [[tool/result]] | [[where answered]] |

### Intent not targeted
- [[query or audience]]: [[why it belongs elsewhere]]

## Page promise

[[One sentence describing what the user can get and the important boundary.]]

Reading flow: [[how each part develops the explanation and leads to the next reader question]]

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | [[intro/tool]] | [[medium]] | [[source/report]] | [[what not to repeat]] |
| Which inputs, modes, units, sources, or scope choices matter? | [[location]] | [[medium]] | [[source/report]] | [[guard]] |
| How should someone choose meaningful inputs and use it for the real task? | [[location]] | [[medium]] | [[source/report]] | [[guard]] |
| How should the result and its important terms or uncertainty be interpreted? | [[location]] | [[medium]] | [[source/report]] | [[guard]] |
| Which concepts, syntax, ordering, or edge cases commonly surprise users? | [[location]] | [[medium]] | [[source/report]] | [[guard]] |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | [[location]] | [[medium]] | [[source/report]] | [[guard]] |
| How are user inputs handled? | [[location or irrelevant reason]] | [[medium]] | [[source/report]] | [[guard]] |
| What should the reader verify or do next? | [[location]] | [[medium]] | [[source/report]] | [[guard]] |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: [[name plus point]] | [[question]] | [[answer]] | Tool UI | [[source/report]] | [[do not repeat]] | n/a |

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |

## Metadata proposal

- Registry label: `[[compact label]]`
- Meta title: `[[natural title with name and promise]]`
- Meta description: `[[truthful result and boundary]]`
- Page type: `[[supported central-registry type]]`
- Publication recommendation: `[[unpublished until approval, or approved state]]`

## Internal links

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |

## Usage Markdown handoff

This section is the closed planning input for the Astra writing stage. It contains the technical usage facts, approved state explanations, list and media requirements, and source links. Astra returns the actual public `usage_markdown`; Luna integrates it and records the rendered trace in the pipeline acceptance artifact.

### Sections to generate in the writing stage

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | [[approved heading]] | [[one user need]] | [[closed-world facts and sources]] | [[what needs explanation and what belongs elsewhere]] | [[claims and visual facts not to repeat]] |

### Voice and accuracy constraints
- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for public wording. This plan owns search intent and useful coverage, not a separate voice.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, chart, wireframe, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion
`$stack127-tool-build` must not draft or integrate these sections. Astra owns public wording; Luna owns integration through this handoff.

## Source ledger

- [[source name]]: [[URL]], checked [[date]]. Supports [[claim]].

## Open questions and blockers

- [[None, or the upstream fact that blocks ready status.]]
```

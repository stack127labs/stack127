# Writing and SEO template

Copy this structure to `content_docs/<route-without-leading-slash>/writing-and-seo.md`.

```markdown
# Writing and SEO plan: [[tool name]]

Status: draft
Tool: [[tool name]]
Route: `/[[route]]`
Depends on: `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `implementation-report.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `edge-cases-and-tests.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `brief.md sha256:[[64 lowercase hex characters]]`
SERP checked: [[YYYY-MM-DD]]
Primary medium: Tool UI
Prose is the minority: yes
Static prose budget: [[1 to 5]] sections, [[1 to 700]] words maximum

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `[[query]]` | [[job]] | [[tool/result]] | [[where answered]] |

### Intent not targeted
- [[query or audience]]: [[why it belongs elsewhere]]

## Page promise

[[One sentence describing what the user can get and the important boundary.]]

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

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Word limit and shape | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | [[approved heading]] | [[one user need]] | [[closed-world facts and sources]] | [[maximum words and paragraph shape]] | [[claims and visual facts not to repeat]] |

### Voice and accuracy constraints
- Follow `version127_docs/writing-style.md` and `version127_docs/visual-first.md`.
- Write `version127`, lowercase.
- Use no em dash or en dash.
- Do not invent facts, numbers, benefits, privacy claims, or implementation behavior.
- Do not repeat a result, table, chart, wireframe, heading, or prior section.
- Leave unresolved facts as explicit review notes, not plausible copy.

### Tool-build exclusion
`$version127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- [[source name]]: [[URL]], checked [[date]]. Supports [[claim]].

## Open questions and blockers

- [[None, or the upstream fact that blocks ready status.]]
```

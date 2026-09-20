# Competitive report template

Copy this structure to `content_docs/<route-without-leading-slash>/competitive-report.md`. Replace every brace placeholder. Delete instructions that do not belong in the finished report.

```markdown
# Competitive report: [[tool name]]

Status: draft
Feasibility: [[feasible or blocked, with evidence and the supported promise boundary]]
Tool: [[tool name]]
Route: `/[[route]]`
Researched: [[YYYY-MM-DD]]
Direct competitors reviewed: [[number]]
Saturation exception: no
Pipeline acceptance: `content_docs/<route-without-leading-slash>/pipeline-acceptance.json` (created and validated after the complete pipeline)

## Research scope

### Current stack127 state
[[Existing requirements, docs, routes, engines, tests, and constraints.]]

### Method and coverage
[[Queries, search backend and engines, visual backend and viewport coverage, number of direct competitors, exclusions, and access limits.]]

- Search backend: [[SearXNG, web connector, or another named backend]]
- Search engines: [[for example `bing, duckduckgo`, or `not individually available`]]
- Visual backend: [[Codex in-app Browser, standalone Playwright CLI, or blocked]]
- Accessed: [[date and timezone]]

### Search saturation evidence

- Queries tried: [[query list, or `Not applicable; eight or more direct competitors were reviewed`]]
- Repeated domains: [[what repeated, or `Not applicable`]]
- Exclusions: [[why remaining results were not direct competitors, or `Not applicable`]]

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| [[intent]] | `[[query]]` | [[job]] | [[calculator, article, vendor tool, forum, etc.]] |

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| [[pain]] | [[community, issue, or question URL]] | [[repeated, occasional, or unclear]] | [[what the tool must resolve]] |

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| [[claim]] | [[primary URL]] | Documented / Inferred / Unknown | [[limits or disagreement]] |

## Competitor reviews

### Competitor 1: [[name]]

- URL: [[direct tool URL]]
- Accessed: [[date]]
- Audience and promise: [Observed] [[summary]]
- Inputs and defaults: [Observed] [[complete list]]
- Action and state behavior: [Observed] [[summary]]
- Results and visuals: [Observed] [[summary]]
- Formula or data source: [[EVIDENCE LABEL: choose Documented, Inferred, or Unknown]] [[summary with source or probe]]
- Errors and edge behavior: [[EVIDENCE LABEL: choose Observed or Unknown]] [[summary]]
- Mobile and accessibility: [[EVIDENCE LABEL: choose Observed or Unknown]] [[summary]]
- Privacy: [[EVIDENCE LABEL: choose Documented or Unknown]] [[summary and URL]]
- Performance: [Observed] [[bounded observation, not a benchmark claim]]
- Search-content structure: [Observed] [[title, h1, useful headings]]
- What works: [[user benefit]]
- What fails: [[friction or trust issue]]
- Do not copy: [[branding, layout, wording, or weak behavior]]

```text
[[ASCII wireframe of the actual hierarchy at the inspected viewport]]
```

[[Repeat one subsection for every direct competitor.]]

## Comparison matrix

| Capability | Competitor 1 | Competitor 2 | ... | User value |
| --- | --- | --- | --- | --- |
| [[repeated field]] | [[observed behavior]] | [[observed behavior]] | ... | High / Medium / Low |

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| [[question]] | [[what differs]] | [[primary source]] | [[yes/no and why]] |

## Evidence-backed opportunities

1. **[[opportunity]]**: [[user problem, evidence, and why stack127 can solve it credibly]].

## Table stakes

- [[Behavior users reasonably expect.]]

## Ideas to reject

- [[Feature or pattern]]: [[why it is clutter, unsafe, unmaintainable, or irrelevant]].

## Open questions and blockers

- [[Unknown that the implementation stage must resolve, or `None`.]]

### Decision options for a blocked tool

[[Delete this subsection when feasibility is feasible. For a blocked tool, provide two to four rows.]]

| Option | Complete behavior delivered | Cost or maintenance | Approval needed |
| --- | --- | --- | --- |
| [[Approve, redirect, narrow, or keep blocked]] | [[honest finished outcome]] | [[ongoing work, account, service, or none]] | [[specific user decision]] |

## Sources

- [[descriptive source name]]: [[URL]], accessed [[date]]. [[Observed or documented contribution.]]
```

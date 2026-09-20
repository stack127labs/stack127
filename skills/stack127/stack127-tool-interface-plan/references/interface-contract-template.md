# Interface contract template

Copy this structure to `content_docs/<route-without-leading-slash>/interface-contract.md`.

```markdown
# Interface contract: [[tool name]]

Status: draft
Feasibility: [[feasible or blocked, with evidence and unsupported promise boundary]]
Tool: [[tool name]]
Route: `/[[route]]`
Mode: [[pipeline or retrofit]]
Depends on: `brief.md`[[, `implementation-report.md` in pipeline mode]]
Input fingerprint: `brief.md sha256:[[64 lowercase hex characters]]`
[[Pipeline mode only: Input fingerprint: `implementation-report.md sha256:[[64 lowercase hex characters]]`]]
Pipeline acceptance: `content_docs/<route-without-leading-slash>/pipeline-acceptance.json`

## User task

- Primary user: [[one person in one situation]]
- Question: [[the one question the interface answers]]
- Lead answer: [[the first result they need]]
- Next decision: [[what they can decide or do after seeing it]]

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| [[fact, input, status, or record]] | [[question it answers]] | [[engine, source, or derived]] | [[input, lead, supporting, evidence, or omit]] | [[why it earns this treatment]] | [[what must not repeat it]] |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [[input]] | [[required, defaulted, derived, optional, primary action, or secondary action]] | [[yes, no, or not applicable]] | [[user supplied, source of default, derived from another input, or no default]] | [[visible, disclosure, conditional, omitted, or result]] | [[component or native element]] | [[decision it enables]] | [[placement at narrow width]] |

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | [[lead result]] | [[one question]] | [[source fields or calculation]] | [[component and hierarchy]] | [[what stays out]] |

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| [[timeline, chart, table, bar, diagram, or none]] | [[relationship]] | [[yes, no, or not applicable, with reason]] | [[use, replace, or omit]] |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | [[state]] | [[state]] | [[state]] | [[state]] | [[state]] |

## Optional mode and state visibility

- Control mode: [[single, disclosure, or basic-advanced]]
- Shared engine and normalized input mapping: [[one engine and how visible controls map to it]]
- Basic assumptions and sources: [[the active assumptions shown in Basic, or not applicable with reason]]
- Custom-value visibility in Basic: [[how customized Advanced values remain visible, or not applicable with reason]]
- Switch retention and reset: [[what switching keeps, and the explicit action that replaces custom values with defaults]]
- Hidden invalid-value recovery: [[how an invalid hidden control is revealed, focused, and announced]]
- Labels and mode explanation: [[plain labels and the concise explanation beside the switch]]
- URL, reload, and history restoration: [[mode and values restored from shared state, including back and forward]]
- Equivalent-input parity evidence: [[fixture or test proving both modes give the same result for equivalent normalized input]]

## Component contract

- Generic or native-looking fallback allowed: no

| Need | Existing component inspected | Disposition | Chosen component | States, accessibility, responsive behavior, and tokens | Why it fits; rejected alternative |
| --- | --- | --- | --- | --- | --- |
| [[interaction or result need]] | [[component and path, or none found after inspection]] | [[reuse shared, new shared, or route-specific]] | [[component name and owner]] | [[complete behavior contract]] | [[semantic reason and rejected fallback]] |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop | [[layout]] | [[value]] | [[none or named inner region]] |

## Interface wireframes

### Desktop result

```text
[[wireframe with real labels and representative values]]
```

### Narrow mobile result

```text
[[wireframe with the same task order]]
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

[[Add compact wireframes or state references for every applicable state.]]

## Removed or rejected

- [[Existing or proposed input, result, sentence, visual, or container to remove or avoid, with reason.]]

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | [[observable lead-answer hierarchy]] | [[Browser, test, or inspection]] |
| UI-002 | deduplication | [[observable duplicate-fact guard]] | [[Browser, test, or inspection]] |
| UI-003 | visual-truth | [[observable geometry or visual-format decision]] | [[Browser, test, or inspection]] |
| UI-004 | component-consistency | [[every nontrivial control uses its approved shared or route-specific stack127 component]] | [[Browser inspection and source check]] |
| UI-005 | responsive | [[observable narrow-layout and overflow behavior]] | [[Browser measurement or test]] |
| UI-006 | url | [[opening the clean canonical route leaves its URL unchanged through hydration]] | [[Browser history and URL assertion]] |

## Open questions and blockers

- [[None, or the decision that prevents ready status.]]
```

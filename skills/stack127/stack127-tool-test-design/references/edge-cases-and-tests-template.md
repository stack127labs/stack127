# Edge cases and tests template

Copy this structure to `content_docs/<route-without-leading-slash>/edge-cases-and-tests.md`.

```markdown
# Edge cases and tests: [[tool name]]

Status: draft
Feasibility: [[feasible or blocked, with evidence]]
Tool: [[tool name]]
Route: `/[[route]]`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `brief.md`
Input fingerprint: `competitive-report.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `implementation-report.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `interface-contract.md sha256:[[64 lowercase hex characters]]`
Input fingerprint: `brief.md sha256:[[64 lowercase hex characters]]`
Pipeline acceptance: `content_docs/<route-without-leading-slash>/pipeline-acceptance.json`

## Risk model

| Priority | Meaning for this tool |
| --- | --- |
| P0 | [[wrong answer, security/privacy, or inaccessible primary job]] |
| P1 | [[common flow or recovery failure]] |
| P2 | [[uncommon resilience or polish issue]] |

## Requirement traceability

| Requirement ID | Implementation requirement | Covered by cases |
| --- | --- | --- |
| R1 | [[observable requirement]] | EC-001, FT-001 |
| UI-001 | [[observable interface requirement]] | EC-002, manual comprehension check |

## Coverage checklist

Every row must point to one or more `EC-` cases or say `Not applicable:` followed by a tool-specific reason.

| Family | Case IDs or specific non-applicability reason |
| --- | --- |
| Input grammar | [[EC IDs or reason]] |
| Numeric boundaries | [[EC IDs or reason]] |
| Configuration dependencies | [[EC IDs or reason]] |
| Technical truth | [[EC IDs or reason]] |
| Submission and concurrency | [[EC IDs or reason]] |
| Network and upstream | [[EC IDs or reason]] |
| Persistence and sharing | [[EC IDs or reason]] |
| Control mode, switching, parity, and hidden-state recovery | [[EC IDs or reason]] |
| Accessibility | [[EC IDs or reason]] |
| Responsive and themes | [[EC IDs or reason]] |
| Security and privacy | [[EC IDs or reason]] |
| SSR and SEO | [[EC IDs or reason]] |
| Performance | [[EC IDs or reason]] |

## Edge-case matrix

| ID | Priority | Category | Setup/input | Expected system outcome | Expected user experience | Side effects allowed | Test level/file | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EC-001 | P0 | Input | [[exact input]] | [[exact outcome]] | [[visibility, recovery, focus, announcement]] | [[request, URL, storage, analytics]] | [[unit/API/E2E/manual and path]] | R1, UI-001 |

## Formula or resolution fixtures

| ID | Inputs or source responses | Expected exact output or classification | Oracle/source | Branches and invariants |
| --- | --- | --- | --- | --- |
| FF-001 | [[inputs]] | [[output]] | [[hand derivation or primary URL]] | [[branches]] |

[[Use `FF-` IDs for a formula contract. Use `RF-` IDs for a resolution contract.]]

## Test plan

### Pure engine and unit tests
- [[file]]: [[cases and why unit level is sufficient]]

### API or route tests
- [[file]]: [[trust-boundary cases]]

### Browser tests
- [[file]]: [[rendered interaction and accessibility cases]]

### Static and SEO tests
- [[file]]: [[ownership, publication, canonical, noindex, server-rendered content]]

## Manual verification

| View/state | Viewport/theme | Exact check | Pass condition |
| --- | --- | --- | --- |
| Successful result without internal reports | Desktop and narrow, both themes | State the lead answer, the unique question answered by each region, any repeated formatted fact, and anything removable | One clear answer; every region is distinct; no needless repetition or removable UI |

## Test data and mocks

[[Deterministic fixtures, clocks, request mocks, large values, malicious strings, and provenance.]]

## Plan completion criteria

- [ ] Every P0 and P1 case has an expected outcome, requirement ID, test level, file owner, and deterministic fixture or manual rationale.
- [ ] Every formula branch and invariant has an oracle fixture specification.
- [ ] Every `UI-` requirement covers hierarchy, distinct result purpose, truthful geometry, removal guards, and responsive behavior where applicable.
- [ ] The build stage has an ordered focused-test plan and a full-quality-gate plan.

## Open questions and blockers

- [[None, or the upstream decision that blocks ready status.]]
```

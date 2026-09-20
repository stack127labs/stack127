Status: ready
Tool: Rsync filter tester
Route: /rsync-filter-tester

## Risk model

P0 risks are reversing an include or exclude decision and hiding an unvisited child. P1 risks are incorrect slash-aware glob behavior and stale reports. P2 risks are unsupported rsync flags and visual density. The model must state its subset and never execute a command.

## Requirement traceability

| Requirement | Risk addressed | Test family |
|---|---|---|
| R1 | First-match drift | RF-001, EC-001 |
| R2 | Glob scope errors | RF-002, EC-003 |
| R3 | Silent invalid rules | EC-002, EC-004 |
| R4 | Route ownership | EC-009, EC-010 |
| R5 | Trace copy mismatch | EC-008 |
| UI-003 | Unvisited truth | EC-005 |
| UI-004 | Mobile readability | EC-010 |

## Coverage checklist

| Family | Coverage |
|---|---|
| Input grammar | EC-002, EC-004 |
| Numeric boundaries | EC-003 |
| Configuration dependencies | EC-005 |
| Technical truth | EC-001, EC-003, EC-005 |
| Submission and concurrency | EC-008 |
| Network and upstream | Not applicable: no command or network is executed |
| Persistence and sharing | Not applicable: text stays in memory |
| Accessibility | EC-009 |
| Responsive and themes | EC-010 |
| Security and privacy | EC-007 |
| SSR and SEO | EC-009 |
| Performance | EC-011 |
| Control mode, switching, parity, and hidden-state recovery | EC-015. Single mode keeps ordered rules, representative paths, and unmatched default visible; no mode switch or hidden custom value exists, and repeated evaluation of the same normalized fixture provides parity. |

## Edge-case matrix

| ID | Priority | Scenario | Input | Expected | Failure risk | Recovery | Automation | Requirements |
|---|---|---|---|---|---|---|---|---|
| EC-001 | P0 | First matching include | `- *.log` then `+ keep.log` | keep.log is excluded by first match | reversed order | show line one | unit | R1 UI-001 UI-002 UI-005 |
| EC-002 | P0 | Missing rule prefix | `logs/**` | invalid line finding | silent default | name line and fix | unit/browser | R3 |
| EC-003 | P1 | Basename glob scope | `+ *.conf` and `etc/app.conf` | basename pattern matches at any depth | missed include | show winning rule | unit | R2 |
| EC-004 | P0 | Duplicate path | same path twice | invalid duplicate finding | duplicate rows | identify path | unit | R3 |
| EC-005 | P0 | Excluded parent | `- cache/` and `cache/a.log` | child is unvisited | claim excluded instead | show ancestor note | unit/browser | R1 UI-003 |
| EC-006 | P1 | Reset rule | `- *.tmp`, `!`, `+ keep.tmp` | only post-reset rule applies | reset ignored | number normalized rules | unit | R1 |
| EC-007 | P1 | Hostile pattern text | HTML-like path | rendered as text | markup injection | React escaping | browser | R3 |
| EC-008 | P1 | Copy after edit | test, edit rule, copy | stale copy blocked or marked | wrong report | require retest | browser | R5 |
| EC-009 | P1 | Keyboard trace | submit valid filters | lead counts receive focus | answer missed | focus result | browser | R4 UI-001 UI-002 UI-005 |
| EC-010 | P1 | Narrow table | 390px with long pattern | page fits; cells stack with labels | clipped rule | responsive row layout | browser | R4 UI-004 UI-005 |
| EC-011 | P2 | Large tree | 1000 paths and rules | deterministic under one second | lockup | bounded input | unit | R1 |
| EC-012 | P0 | Conflicting parent rules | include before exclude for one directory | first matching include wins | false unvisited child | show winning parent rule | unit | R1 R3 |
| EC-013 | P0 | Unmatched parent default | included child below default-excluded parent | child is unvisited | impossible traversal | name excluded parent | unit | R3 |
| EC-014 | P0 | Unsupported syntax | rule modifier or character class | invalid with explicit unsupported message | silent wrong match | correct rule | unit | R4 |
| EC-015 | P1 | Control mode and hidden-state recovery | Evaluate a valid rule/path fixture twice after Reset, then edit the rules or paths to an invalid line and submit. | This is single mode with no Basic/Advanced switch. Equivalent normalized rules and paths produce the same trace and counts. Every result-driving editor stays visible; an invalid rule cannot be hidden by an evidence disclosure and no stale trace remains. | The edited textarea retains caret focus, the old trace clears, and the first invalid rule receives associated recovery text. | No URL, storage, request, command execution, or analytics side effect. | Unit determinism plus Browser state/accessibility test in `tests/pages/rsync-filter-tester/rsync-filter-tester.test.mjs` and `rsync-filter-tester.spec.ts` | R1, R3, UI-006 |

## Formula or resolution fixtures

| ID | Fixture | Expected resolution | Requirements |
|---|---|---|---|
| RF-001 | exclude then include same file | first exclude wins | R1 |
| RF-002 | `+ **/*.conf` with nested path | nested config included | R2 |
| RF-003 | excluded directory with child | child is unvisited | R1 UI-003 |

## Test plan

### Pure engine and unit tests

Run Node tests for rule parsing, slash-aware glob compilation, first-match evaluation, parent traversal, reset handling, duplicate paths, and deterministic report text. Cover RF-001 through RF-003 and EC-001 through EC-007 plus EC-011.

### Browser tests

Use Playwright for valid and invalid submissions, stale state, copy feedback, keyboard focus, and the narrow trace table. Cover EC-008 through EC-010.

### Static and SEO tests

Run TypeScript, static policy, route manifest checks, pipeline validation, and shared SEO tests. The tool remains unpublished until registry review.

## Manual verification

| Check | Steps | Pass condition |
|---|---|---|
| First match | Paste two conflicting rules | first line explains result |
| Parent traversal | Exclude a directory and add child | child says unvisited |
| Invalid input | Remove a prefix | line error appears without rows |
| Keyboard path | Tab and test | counts are announced and focused |
| Narrow layout | Open at 390px | long patterns remain reachable |

## Plan completion criteria

All RF fixtures and P0/P1 cases pass, path states agree with rule traces, route files pass static policy, and docs and tests are listed in the unpublished manifest. Execution of rsync remains outside scope.

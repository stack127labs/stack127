Status: ready
Tool: Restic retention simulator
Route: /restic-retention-simulator
Input fingerprint: `competitive-report.md sha256:3300635f26fc4ecc46abe7eac69205fc6d40c90b6d968aac4491d0470177cdf3`
Input fingerprint: `implementation-report.md sha256:1c39fdadf7be794f034be1d6e4c6888e7928353184ae5e313b64523f2dec124b`
Input fingerprint: `interface-contract.md sha256:5d41c1b3940268ddbaf56313a06eb78a8b76444989956452ce37f85b74727d1d`
Input fingerprint: `brief.md sha256:4870f3a1afd249cfcdfb24f2fcec6a20123344c92b2487ff15d8a6d2ed0e31ac`

## Risk model

P0 risks are wrong keep or prune decisions and misleading invalid states. P1 risks are unclear grouping, timezone, and copy output. P2 risks are layout polish and future rule coverage. The engine must remain deterministic and offline.

## Requirement traceability

| Requirement | Risk addressed | Test family |
|---|---|---|
| R1 | Snapshot selection drift | RF-001, EC-001 |
| R2 | Hidden grouping or timezone | RF-002, EC-003 |
| R3 | Unsafe invalid output | EC-002, EC-004 |
| R4 | Route and content ownership | EC-009, EC-010 |
| R5 | Copy mismatch | EC-008 |
| UI-001 | Lead buried below rows | EC-009 |
| UI-003 | Visual reason mismatch | EC-001, EC-006 |

## Coverage checklist

| Family | Coverage |
|---|---|
| Input grammar | EC-002, EC-004 |
| Numeric boundaries | EC-003 |
| Configuration dependencies | EC-003, EC-006 |
| Technical truth | EC-001, EC-005 |
| Submission and concurrency | EC-008 |
| Network and upstream | Not applicable: the engine makes no network requests |
| Persistence and sharing | Not applicable: input stays in memory |
| Accessibility | EC-009 |
| Responsive and themes | EC-010 |
| Security and privacy | EC-007 |
| SSR and SEO | EC-009 |
| Performance | EC-011 |
| Control mode, switching, parity, and hidden-state recovery | EC-015. Disclosure mode exposes assumptions as evidence only; opening or closing them preserves policy and result parity, while grouping/timezone validation remains visible and cannot be hidden behind the disclosure. |

## Edge-case matrix

| ID | Priority | Scenario | Input | Expected | Failure risk | Recovery | Automation | Requirements |
|---|---|---|---|---|---|---|---|---|
| EC-001 | P0 | One daily snapshot | two same-day snapshots and keep-daily 1 | newest day row kept with reason | wrong bucket | show bucket label | unit | R1 UI-003 |
| EC-002 | P0 | Malformed JSON | truncated snapshot object | invalid with parse message | unsafe recommendation | retain text and focus field | unit/browser | R3 |
| EC-003 | P1 | Zero and maximum rules | keep-last 0 and keep-daily 365 | zero rule is allowed; max is bounded | runaway output | field error for over max | unit | R2 |
| EC-004 | P0 | Duplicate snapshot ID | two rows with same ID | invalid duplicate finding | ambiguous trace | identify duplicate rows | unit | R3 |
| EC-005 | P1 | Year boundary | Dec 31 and Jan 1 snapshots | separate local years | wrong yearly bucket | show timezone in result | unit | R1 R2 |
| EC-006 | P1 | Missing grouping fields | snapshots without host | empty host group is explicit | hidden merge | display group key | unit | R2 UI-003 |
| EC-007 | P1 | Hostile text | HTML-like ID and tag | rendered as text, no markup | injection | escape through React | browser | R3 |
| EC-008 | P1 | Copy after edit | result then changed policy | copy disabled or stale | copied wrong policy | require fresh preview | browser | R5 |
| EC-009 | P1 | Keyboard result focus | submit valid form | lead result receives focus | screen reader misses answer | focus lead | browser | R4 UI-001 UI-002 UI-005 |
| EC-010 | P1 | Narrow viewport | 390px result table | no page overflow; cells stack with labels | clipped reasons | responsive row layout | browser | R4 UI-004 UI-005 |
| EC-011 | P2 | Large valid input | 1000 snapshots | completes under one second | UI lockup | bounded input message | unit | R1 |
| EC-012 | P0 | Native hostname groups | snapshots use `hostname` | each hostname stays separate | merged retention groups | show exact group | unit | R1 R2 |
| EC-013 | P0 | Too few calendar periods | two snapshots in one day, keep-daily 2 | newest and oldest are kept | restic behavior drift | name oldest fallback | unit | R1 |
| EC-014 | P0 | Ambiguous path labels | one comma-bearing path versus two paths | distinct groups | collision changes retention | collision-safe group key | unit | R1 R2 |
| EC-015 | P1 | Control mode and hidden-state recovery | Simulate a valid retention result, open and close the Assumptions disclosure, then edit the grouping or timezone value to an invalid value and submit. Repeat the valid fixture with the disclosure open and closed. | This is disclosure mode, not basic/advanced mode. The same normalized snapshots and policy produce equivalent retained/pruned rows in either evidence state. Invalid result-driving fields remain in the visible form and block a new result; the disclosure never owns a hidden setting or masks its recovery. | The disclosure trigger retains focus. Editing clears stale rows, focuses the first invalid control, and leaves the JSON available for correction. | No URL, storage, request, or analytics side effect. | Unit parity plus Browser disclosure/recovery test in `tests/pages/restic-retention-simulator/restic-retention-simulator.test.mjs` and `restic-retention-simulator.spec.ts` | R2, R3, UI-006 |

## Formula or resolution fixtures

| ID | Fixture | Expected resolution | Requirements |
|---|---|---|---|
| RF-001 | three snapshots, keep-last 1 | newest ID kept; older IDs pruned | R1 |
| RF-002 | two hosts, keep-daily 1 | newest row retained per host | R2 |
| RF-003 | same timestamp in two groups | both group winners retained | R1 R2 |

## Test plan

### Pure engine and unit tests

Run Node tests against the resolver, parser, policy bounds, grouping, timezone bucket, and deterministic serialization. Cover RF-001 through RF-003 and EC-001 through EC-007 plus EC-011.

### Browser tests

Use Playwright to submit valid and invalid examples, verify lead focus, stale results, copy status, keyboard labels, and the 390px layout. Cover EC-008 through EC-010.

### Static and SEO tests

Run TypeScript, static policy, route ownership, pipeline validation, and the shared SEO registry checks once the route is intentionally published. The unpublished manifest must remain explicit.

## Manual verification

| Check | Steps | Pass condition |
|---|---|---|
| Lead result | Paste sample and preview | kept count is first answer |
| Rule trace | Inspect kept and pruned rows | every state has a reason |
| Error recovery | Remove a closing brace and preview | clear error, inputs retained |
| Keyboard path | Tab through fields and submit | focus reaches lead result |
| Narrow layout | Open at 390px | no clipped controls or page overflow |

## Plan completion criteria

All RF fixtures pass, every P0 and P1 case has automated coverage, route files pass static policy, and the unpublished manifest points to the complete docs and tests. Publication remains a separate registry decision.

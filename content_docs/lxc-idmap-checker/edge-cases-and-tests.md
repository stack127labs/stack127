Status: ready
Tool: LXC ID mapping checker
Route: /lxc-idmap-checker

## Risk model

P0 risks are wrong host IDs and accepting overlapping maps. P1 risks are confusing gaps with grant failures and losing UID/GID separation. P2 risks are runtime assumptions and dense range presentation. Arithmetic must remain integer exact and offline.

## Requirement traceability

| Requirement | Risk addressed | Test family |
|---|---|---|
| R1 | Mapping arithmetic drift | RF-001, EC-001 |
| R2 | Overlap and gap misses | RF-002, EC-003 |
| R3 | Grant status confusion | RF-003, EC-005 |
| R4 | Unmapped boundary | EC-006 |
| R5 | Route and privacy | EC-009, EC-010 |
| UI-001 | Lead query buried | EC-009 |
| UI-003 | Mapped state truth | EC-001, EC-006 |

## Coverage checklist

| Family | Coverage |
|---|---|
| Input grammar | EC-002, EC-004 |
| Numeric boundaries | EC-001, EC-006 |
| Configuration dependencies | EC-005 |
| Technical truth | EC-001, EC-003, EC-005 |
| Submission and concurrency | EC-008 |
| Network and upstream | Not applicable: no host or network is queried |
| Persistence and sharing | Not applicable: maps stay in memory |
| Accessibility | EC-009 |
| Responsive and themes | EC-010 |
| Security and privacy | EC-007 |
| SSR and SEO | EC-009 |
| Performance | EC-011 |
| Control mode, switching, parity, and hidden-state recovery | EC-016. Single mode keeps both maps, owner, matching grant sources, and query fields visible; no mode switch or hidden custom value exists, and identical normalized maps provide parity. |

## Edge-case matrix

| ID | Priority | Scenario | Input | Expected | Failure risk | Recovery | Automation | Requirements |
|---|---|---|---|---|---|---|---|---|
| EC-001 | P0 | Basic UID mapping | `u 0 100000 65536`, query 1000 | host 101000 | offset error | show arithmetic | unit | R1 UI-002 UI-003 UI-005 |
| EC-002 | P0 | Malformed map line | missing length | invalid line finding | unsafe mapping | retain text | unit/browser | R2 |
| EC-003 | P0 | Overlapping ranges | ranges share container IDs | invalid overlap finding | identify lines | remove overlap | unit | R2 |
| EC-004 | P1 | Zero length | length 0 | invalid length finding | empty range accepted | correct length | unit | R2 |
| EC-005 | P1 | Grant gap | host range outside supplied grant | coverage failure | call it mapped only | add grant or note | unit | R3 |
| EC-006 | P1 | Query boundary | ID equals range end | unmapped result | off-by-one host ID | show half-open rule | unit | R1 R4 |
| EC-007 | P1 | Hostile owner text | HTML-like grant owner | rendered text only | injection | React escaping | browser | R5 |
| EC-008 | P1 | Edit after check | change map then copy | stale result marked | copied old map | require recheck | browser | R5 |
| EC-009 | P1 | Keyboard query | submit valid map | host ID lead is focused | answer missed | focus lead | browser | R5 UI-001 UI-002 UI-005 |
| EC-010 | P1 | Narrow range table | long integer ranges at 390px | cells stack with visible labels | clipped IDs | responsive row layout | browser | R5 UI-004 UI-005 |
| EC-011 | P2 | Maximum ranges | 1000 valid lines | deterministic under one second | lockup | bound input | unit | R1 |
| EC-012 | P0 | Host overlap | distinct container ranges share host IDs | invalid host-overlap finding | namespace collision accepted | identify lines | unit | R2 |
| EC-013 | P0 | Reserved or overflowing ID | reserved endpoint or range past it | invalid bound finding | invalid kernel map accepted | correct range | unit | R2 |
| EC-014 | P0 | Partial grant | queried ID lies in grant but full map does not | missing coverage | false authorization claim | expand exact-owner grant | unit | R3 UI-006 |
| EC-015 | P0 | Wrong grant type or owner | GID query with UID-only or other-owner grant | missing coverage | false authorization claim | use matching source and owner | unit/browser | R3 UI-006 |
| EC-016 | P1 | Control mode and hidden-state recovery | Check a valid UID map twice after Reset, then edit a map line or query to an invalid value and submit. | This is single mode with no Basic/Advanced switch. Identical normalized maps, grants, owner, and query produce the same mapping and grant status. All result-driving values remain visible; an invalid map cannot be hidden by evidence and no stale authorization result remains. | The edited control retains focus, the first invalid line or query receives associated recovery, and the user can correct it without a mode reset. | No host probing, URL, storage, request, command, or analytics side effect. | Unit determinism plus Browser state/accessibility test in `tests/pages/lxc-idmap-checker/lxc-idmap-checker.test.mjs` and `lxc-idmap-checker.spec.ts` | R1, R2, R3, UI-007 |

## Formula or resolution fixtures

| ID | Fixture | Expected resolution | Requirements |
|---|---|---|---|
| RF-001 | `u 0 100000 65536`, query 1000 | host 101000 | R1 |
| RF-002 | adjacent ranges with shared endpoint | no overlap; boundary maps next range | R2 |
| RF-003 | mapped range with covered grant | coverage is covered | R3 |

## Test plan

### Pure engine and unit tests

Run Node tests for map parsing, integer arithmetic, range sorting, overlap and gap diagnostics, grant coverage, query boundaries, and stable serialization. Cover RF-001 through RF-003 and EC-001 through EC-007 plus EC-011.

### Browser tests

Use Playwright for valid, invalid, grant, stale, copy, keyboard, and narrow states. Cover EC-008 through EC-010.

### Static and SEO tests

Run TypeScript, static policy, route manifest checks, pipeline validation, and shared SEO tests. Do not add host probing or route-local metadata.

## Manual verification

| Check | Steps | Pass condition |
|---|---|---|
| Query mapping | Paste sample and check | host ID is the lead answer |
| Overlap | Add an overlapping line | error names the range |
| Grant coverage | Add a short grant | coverage result is separate |
| Boundary | Query the first ID after range | result is unmapped |
| Narrow layout | Open at 390px | IDs and buttons remain readable |

## Plan completion criteria

All RF fixtures and P0/P1 cases pass, arithmetic and labels agree, route files pass static policy, and the unpublished manifest lists complete docs and tests. Runtime namespace inspection remains explicitly outside scope.

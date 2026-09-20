Status: ready
Tool: Home Assistant MQTT discovery checker
Route: /mqtt-discovery-checker

## Risk model

P0 risks are calling an invalid payload valid and losing a field path. P1 risks are confusing warnings with errors, topic parsing mistakes, and stale JSON previews. P2 risks are profile expansion and visual density. The checker must stay offline and version its profile.

## Requirement traceability

| Requirement | Risk addressed | Test family |
|---|---|---|
| R1 | False valid lead | RF-001, EC-001 |
| R2 | Missing topic or JSON errors | RF-002, EC-002 |
| R3 | Severity confusion | RF-003, EC-005 |
| R4 | Preview mismatch | EC-008 |
| R5 | Network leakage | EC-007, EC-009 |
| UI-001 | Lead visibility | EC-009 |
| UI-003 | Count and severity truth | EC-005 |

## Coverage checklist

| Family | Coverage |
|---|---|
| Input grammar | EC-002, EC-003 |
| Numeric boundaries | Not applicable: no numeric calculation drives the lead |
| Configuration dependencies | EC-004, EC-006 |
| Technical truth | EC-001, EC-004 |
| Submission and concurrency | EC-008 |
| Network and upstream | EC-007 |
| Persistence and sharing | Not applicable: payload is not stored |
| Accessibility | EC-009 |
| Responsive and themes | EC-010 |
| Security and privacy | EC-007 |
| SSR and SEO | EC-009 |
| Performance | EC-011 |
| Control mode, switching, parity, and hidden-state recovery | EC-016. Disclosure mode keeps topic, prefix, and payload as one visible input model; normalized-JSON evidence open/close has equivalent output, with no alternate mode and no hidden result-driving value. |

## Edge-case matrix

| ID | Priority | Scenario | Input | Expected | Failure risk | Recovery | Automation | Requirements |
|---|---|---|---|---|---|---|---|---|
| EC-001 | P0 | Valid sensor payload | sensor config topic and object | valid or warning-only lead | false invalid | show profile version | unit | R1 |
| EC-002 | P0 | Malformed JSON | missing closing brace | invalid parse finding at root | unsafe valid result | retain payload | unit/browser | R2 |
| EC-003 | P0 | Empty topic | blank topic and valid JSON | invalid topic finding | misleading payload pass | focus topic | unit | R2 |
| EC-004 | P1 | Missing config suffix | `homeassistant/sensor/demo` | invalid suffix finding | silent no discovery | name expected suffix | unit | R2 |
| EC-005 | P1 | Warning versus error | valid topic with partial device | warning count separate | severity collapse | show counts and paths | unit/browser | R3 UI-002 UI-003 |
| EC-006 | P1 | Unsupported component | `homeassistant/custom/demo/config` | invalid component finding | wrong schema checks | list recognized component | unit | R2 |
| EC-007 | P0 | Network boundary | hostile payload text | no fetch or publish occurs | privacy breach | keep local | browser/static | R5 |
| EC-008 | P1 | Edit after check | valid result then payload edit | result marked stale | copied old data | require recheck | browser | R4 |
| EC-009 | P1 | Keyboard result | submit invalid payload | alert and focus are announced | missed error | focus lead | browser | R5 UI-001 UI-004 UI-005 |
| EC-010 | P1 | Narrow findings | long path and message at 390px | text wraps without overflow | clipped diagnosis | stack layout | browser | R5 UI-004 UI-005 |
| EC-011 | P2 | Large payload | 1000 shallow keys | deterministic under one second | lockup | size finding if bounded | unit | R1 |
| EC-012 | P0 | Missing sensor state topic | sensor payload without `state_topic` or `stat_t` | blocking field finding | false valid result | add state topic | unit/browser | R1 R2 |
| EC-013 | P0 | Unsafe JSON integer | integer above JavaScript exact range | invalid before normalization | changed payload value | encode safely | unit | R2 R4 |
| EC-014 | P1 | Unchecked component | recognized component outside covered profiles | partial warning | false full-validation claim | review component docs | unit/browser | R3 |
| EC-015 | P1 | Abbreviated fields | `uniq_id`, `stat_t`, scalar device identifier | accepted common fields | false warning | none | unit | R1 |
| EC-016 | P1 | Control mode and hidden-state recovery | Check a valid sensor payload, open and close normalized JSON evidence, then edit the topic or payload to malformed input and submit. Repeat the valid fixture with evidence open and closed. | This is disclosure mode, not Basic/Advanced mode. The same normalized payload and profile produce equivalent findings and lead status in either evidence state. Malformed visible inputs block the result and remain recoverable; no collapsed JSON region hides a blocking issue or custom setting. | Disclosure focus returns to its trigger. Editing clears stale findings, focuses the first invalid field, and retains the payload text for correction. | No broker request, URL, storage, or analytics side effect. | Unit parity plus Browser disclosure/recovery test in `tests/pages/mqtt-discovery-checker/mqtt-discovery-checker.test.mjs` and `mqtt-discovery-checker.spec.ts` | R1, R2, UI-006 |

## Formula or resolution fixtures

| ID | Fixture | Expected resolution | Requirements |
|---|---|---|---|
| RF-001 | standard sensor topic and JSON | valid lead with normalized preview | R1 |
| RF-002 | malformed JSON | one payload error, no result region, and focus on the payload | R2 |
| RF-003 | valid topic with incomplete device | partial or warning lead, no error inflation | R3 |

## Test plan

### Pure engine and unit tests

Run Node tests for JSON parsing, topic segments, component allowlist, common identity checks, severity counts, and stable serialization. Cover RF-001 through RF-003 and EC-001 through EC-007 plus EC-011.

### Browser tests

Use Playwright for valid, invalid, warning, stale, copy, keyboard, and narrow states. Cover EC-008 through EC-010.

### Static and SEO tests

Run TypeScript, static policy, route manifest checks, pipeline validation, and shared SEO tests. Keep payload text out of server metadata and registry files.

## Manual verification

| Check | Steps | Pass condition |
|---|---|---|
| Valid example | Paste sensor example and check | validity lead is clear |
| Topic error | Remove config suffix | exact suffix finding appears |
| Severity | Remove device name | warning and error counts differ |
| Privacy | Inspect network during check | no request is made |
| Narrow layout | Open long finding at 390px | message wraps and stays readable |

## Plan completion criteria

All RF fixtures and P0/P1 cases pass, severity counts match findings, no network API appears in the route, and the unpublished manifest lists complete docs and tests. Profile expansion remains a later source-reviewed change.

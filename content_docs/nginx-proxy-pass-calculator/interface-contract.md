# Interface contract: NGINX `proxy_pass` URI Calculator

Status: ready
Tool: NGINX `proxy_pass` URI Calculator
Route: `/nginx-proxy-pass-calculator`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:4c4ec377863d3627db8c4dc7aa78088a9bf569f21833c85d70656599c6603be3`

## User task

- Primary user: A developer or homelab operator debugging one NGINX reverse-proxy location.
- Question: What exact upstream URL does this matched location and static `proxy_pass` construct for the request target?
- Lead answer: The final upstream URL, or no URL when the case needs live NGINX state.
- Next decision: Fix a slash or path mismatch, keep the intended mapping, or verify an unknown case with the running configuration and upstream logs.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Location type | What kind of already-matched location am I modeling? | User choice | input | Prefix and exact locations can be calculated; regex and named locations need live NGINX. | Keep all four choices visible and do not add a second supported-types legend. |
| Matched location | Which location string did NGINX select? | User text | input | Prefix replacement depends on its literal length and exact match relationship. | Show the value once in the form and once as trace evidence. |
| Request target | Which path and raw arguments reached this location? | User text | input | It supplies the retained path and unmodified arguments. | Split path and arguments only in the trace; do not repeat the whole target in a result subtitle. |
| `proxy_pass` URL | Which authority and optional URI should NGINX use? | User text | input | URI absence and a `/` URI have different behavior. | Keep the current value visible in the form; the comparison names only the toggled alternative. |
| Rewrite state | Did a rewrite alter URI processing before `proxy_pass`? | User choice | input | Any non-None choice makes the static result unknown in formula v1. | Do not add rewrite details to a successful trace because success always means None. |
| Slash comparison | Should the exact toggled result be shown? | User choice | input | It answers the common trailing-slash question without changing the primary calculation. | Integrate the current URL into the comparison band. Do not repeat it in a second Current row. |
| Final upstream URL | Where will this supported request be sent? | Calculated `finalUrl` | lead | This is the answer users otherwise construct in their heads. | Show it once. The copy action and trace may refer to it but must not print it again. |
| Toggled slash alternative | What exact URL would the opposite final-slash form produce? | Comparison proxy URL and final URL | supporting | It makes the slash consequence visible without calling either form correct. | Show only when selected and only as the alternative beside the lead. |
| Transformation trace | What did NGINX retain or replace? | Structured request path, location, URI presence, suffix, final path, and arguments | evidence | Named fields expose the replacement chain behind the URL. | Do not turn trace rows into another URL summary. Hide unused retained-suffix evidence when the proxy URI is absent. |
| Unknown reason | Why can this tool not calculate a trustworthy URL? | Unknown reason and field | supporting | Valid NGINX cases can depend on runtime variables, location processing, rewrites, or normalization. | Replace the URL result entirely. Never show a best guess beside the reason. |
| Verification step | How do I resolve an unknown result on the real system? | Fixed `nginx -T` and upstream-log guidance | supporting | The browser cannot inspect the active configuration or backend request log. | Show once in the unknown state and keep longer verification prose in the supporting guide. |
| Formula identity | Which calculation and fixture baseline produced the result? | Formula version and NGINX fixture version | evidence | The result is bounded to a tested rule set. | Show once after the successful trace and comparison. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Location type | defaulted input | yes | Prefix, from the current calculator | visible | `ToolChoiceGroup` | It decides whether a literal replacement can be calculated. | Full-width group with four wrapping choices. |
| 2 | Matched location | defaulted input | yes | `/api/`, from the current calculator | visible | `ToolTextField` with spellcheck off | Literal prefix length or exact equality drives the rewrite. | Full-width first text field. |
| 3 | Request target | defaulted input | yes | `/api/users?id=42`, from the current calculator | visible | `ToolTextField` with spellcheck off | It supplies path and raw arguments for the final URL. | Full-width second text field. |
| 4 | `proxy_pass` URL | defaulted input | yes | `http://backend/`, from the current calculator | visible | `ToolTextField` with spellcheck off | The authority and optional URI decide retention versus replacement. | Full-width third text field. |
| 5 | Rewrite before `proxy_pass` | defaulted input | yes | None, from the current calculator | visible | `ToolChoiceGroup` | Non-None values honestly move the answer to an unknown state. | Full-width group after the text fields. |
| 6 | Compare the final slash | defaulted optional input | no, it changes only supporting comparison | On, from the current calculator | visible | `ToolCheckbox` | Users often need the exact alternate result while keeping the primary URL stable. | Full-width before actions. |
| 7 | Reset | secondary action | yes, because it restores defaults and clears results | Current calculator defaults | visible in final action row | `ToolButton` secondary with reset icon | It returns from unsupported or heavily edited cases without reload. | Full-width before the primary action. |
| 8 | Calculate upstream URL | primary action | not applicable | No default | visible at the end of the form | `ToolButton` primary inside `ToolActionRow` | Explicit submit prevents stale or transient URLs while exact strings change. | Full-width final action. |
| 9 | Copy URL | conditional secondary action | no | Current successful `finalUrl` | result beside the lead | `ToolCopyAction` secondary | It copies only the authoritative current result. | Full-width directly after the lead URL. |

`Calculate upstream URL` is the only accent-filled action. Enter submits once from a text field. Any location, request, proxy, type, or rewrite edit clears the full result immediately. Changing only Compare the final slash keeps the successful lead and recomputes or removes the alternate result without moving focus.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Current upstream URL | What exact URL does the current configuration construct? | `finalUrl` | One focusable lead output with a small `Final upstream URL` label, a prominent wrapping monospace URL, and Copy URL | Print the URL once. Do not add a Current row containing the same value below it. |
| 2 | Slash alternative | What would toggling only the final slash change? | Comparison `proxyPass` and `finalUrl` | Quieter adjacent result labelled `With proxy_pass <toggled value>`; stack after the lead on narrow screens | Show no recommendation, delta badge, or copied alternative. Omit when comparison is off. |
| 3 | Transformation trace | Which URI parts were retained, replaced, or appended? | Structured trace | `ToolKeyValueList` in evaluation order with monospace values | For authority-only `proxy_pass`, show `Proxy URI: Absent` and `Path operation: Original request path retained`; omit unused suffix and replacement rows. |
| 4 | Provenance | Which formula and real-NGINX baseline support this result? | Formula and fixture versions | One subdued monospace metadata line after evidence | Do not promote it above the final URL or repeat it in the slash alternative. |
| 5 | Unknown boundary | Why is no static URL available, and what should I do next? | Unknown reason, field, and verification instruction | One focusable `ToolStatus` region headed `Needs live NGINX`, with exact reason and one next step | It replaces every success region. No URL, trace, comparison, copy, or provenance appears. |

When slash comparison is on, one result band contains the current lead on the left and the alternate on the right. The current side is wider and visually dominant. When comparison is off, the lead uses the full width. A neutral divider separates result from inputs; there is no floating result card.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Current and toggled result band | The final slash alone changes the alternate upstream URL | Yes. Adjacent regions tie both outputs to one request while unequal width preserves one lead. | Use when comparison is selected; show the current URL only in the lead and the toggled URL only in the alternate region. |
| Transformation key/value list | Ordered named parts of one rewrite | Yes. Top-to-bottom order follows request path, location, proxy URI, operation, final path, then arguments. | Use a definition list rather than a table because there is one transformation record, not repeated records. |
| Path-flow diagram | How one string becomes another | No. A drawn connector cannot carry exact retained, absent, and raw argument values more clearly than the trace. | Omit the diagram and keep exact monospace rows. |
| Difference chart | Magnitude of the slash change | No. Paths are strings and their lengths have no decision value. | Omit charts, diff bars, scores, and percentage visuals. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | All current example defaults visible; comparison on; Reset and Calculate available | Absent until explicit submit | Absent | No placeholder or error summary | Natural document focus and no announcement. Clean canonical URL stays unchanged through hydration. |
| Success with comparison | Inputs remain visible | Exact current final URL | Toggled alternative, conditional trace, and provenance | Edit, copy, change comparison, or reset | Focus the result section and announce the current URL once. |
| Success without comparison | Inputs remain visible and comparison is off | Exact current final URL, unchanged | Trace and provenance only | Turn comparison on without clearing or refocusing the lead | One polite update may announce that comparison appeared; do not repeat the current URL. |
| Authority-only `proxy_pass` | Inputs remain visible | Exact URL retaining the request path and arguments | Trace says Proxy URI Absent and Original request path retained; slash alternative shows the `/` form if enabled | Edit or reset | Same focus and lead announcement as success. |
| Unknown | Inputs remain visible; selected valid but unsupported value remains | `Needs live NGINX` with no URL | Exact reason and `Verify with nginx -T and upstream logs.` | Change the named input or reset | Focus the unknown region and announce its reason once. |
| Normalization-sensitive unknown | Percent, backslash, repeated slash, or dot segment remains visible | `Needs live NGINX` with no URL | Reason names NGINX normalization and the same live verification step | Use a normalization-safe probe only if it represents the real request | Focus the unknown region, not the input, because the value may be valid NGINX. |
| Invalid or empty fields | All drafts remain; every stale result is absent | Absent | Absent | Show all associated field errors and one concise summary inside the form; no generic result panel | Focus the first invalid field and announce the error summary assertively once. |
| Loading | Inputs remain unchanged | Not applicable | Not applicable | The local formula is synchronous; no spinner, skeleton, wait label, or disabled calculation state | No loading announcement. |
| Partial | Inputs remain unchanged | Not applicable | Not applicable | The formula returns one complete URL or no URL | No partial-result announcement or placeholder. |
| Runtime failure | Inputs remain and stale output is absent | Absent | One concise failure status and Try again action | `The calculator could not finish. Your inputs are still here.` | Focus failure region and announce once. |
| Copy success or failure | Successful result remains unchanged | Unchanged | Copy action reads `URL copied` or `Copy failed` temporarily | Retry the same action without recalculation | Focus stays on Copy URL; shared copy feedback supplies the announcement. |
| Reset | Defaults return and all result, error, and copy states clear | Absent | Absent | No error remains | Focus Matched location and announce `Calculator reset` once. |
| Reload or history navigation | Calculator returns to example defaults | Absent | Absent | No state restoration exists | Browser default focus; no input is read from URL or storage. |

There is no disclosure or expanded state. Trace and provenance are necessary evidence for every successful calculation, so they stay in the main result reading order.

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Location and rewrite choices | `ToolChoiceGroup` | Both are small closed sets whose unsupported branches should remain visible. | Selects hide the boundary between calculable and live-only cases. |
| Exact location, request, and proxy strings | `ToolTextField` | It preserves literal slashes, case, query arguments, and invalid syntax for the engine. | A URL-only browser input can apply validation that does not match NGINX syntax; a code editor is unnecessary. |
| Slash comparison choice | `ToolCheckbox` | It controls one optional result region and is not system state. | A switch implies live calculation mode; radio buttons add weight to a binary presentation choice. |
| Form actions | `ToolActionRow` and `ToolButton` | They enforce one primary action, shared target size, and narrow wrapping. | Page-owned buttons repeat shared state and focus styling. |
| Final URL lead | Focusable page-owned comparison band with a small label and one prominent monospace output | Long URLs need controlled wrapping and a clear relationship to the optional alternate result. | `ToolPrimaryResult` is sized for short numeric values and becomes oversized for a 2,048-character URL. |
| Transformation trace | `ToolKeyValueList` with conditional rows | It gives one record a label/value reading order and shared long-value wrapping. | A table implies repeated records; prose makes slash and absence states hard to scan. |
| Unknown and runtime states | `ToolStatus` inside a focusable result region | It gives reasons and recovery semantic status without imitating a successful URL panel. | A validation badge collapses the necessary reason; a large alert card overstates a local boundary. |
| URL copy | `ToolCopyAction` | It supplies clipboard fallback and concise accessible feedback without separate state logic. | The current custom action tells users to select the URL after failure even though no selectable output control exists. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, above 760px | Location type, three-column text inputs, rewrite group, comparison checkbox, Reset then primary action, current and alternate band, trace, provenance | A 2,048-character proxy URL and 4,096-character request target | Text inputs scroll internally. Lead, alternate, and trace values wrap. No page overflow. |
| Tablet, 391px to 760px | Text inputs stack; choice groups wrap; result band stacks current first and alternate second; trace remains label/value rows | Bracketed IPv6 authority with port, long upstream prefix, repeated raw arguments | Inputs own text overflow; result strings wrap inside their regions. |
| Narrow mobile, 320px to 390px | Each choice and action uses full width; result order stays current URL, Copy URL, toggled alternative, trace, provenance | `https://[2001:db8::1]:65535/a-long-upstream-prefix/...` | Input controls scroll internally. No result or document-level horizontal overflow. |
| 200% zoom or long translated labels | Controls and key/value rows stack vertically; current result always precedes alternate | Unknown normalization explanation and 512-character location | Workbench height grows. Nothing clips or overlaps. |

## Interface wireframes

### Desktop result

```text
NGINX proxy_pass URI Calculator

Location type
[Prefix] [Exact =] [Regex] [Named]

Matched location          Request target                 proxy_pass URL
[/api/________________]   [/api/users?id=42_________]   [http://backend/________]

Rewrite before proxy_pass
[None] [break] [last] [Other]
[x] Compare the final slash
                                              [Reset] [Calculate upstream URL]
--------------------------------------------------------------------------------
Final upstream URL                             With proxy_pass http://backend
http://backend/users?id=42                     http://backend/api/users?id=42
[Copy URL]

Request path          /api/users
Matched location      /api/
Proxy URI             Present: /
Path operation        Replace the matched location prefix
Retained suffix       users
Final path            /users
Arguments             id=42

nginx-proxy-pass-uri-v1 | NGINX fixture 1.30.4
```

### Narrow mobile result

```text
NGINX proxy_pass URI Calculator

Location type
[Prefix                     ]
[Exact =                    ]
[Regex                      ]
[Named                      ]

Matched location
[/api/                      ]
Request target
[/api/users?id=42           ]
proxy_pass URL
[http://backend/            ]

Rewrite before proxy_pass
[None                       ]
[break                      ]
[last                       ]
[Other                      ]
[x] Compare the final slash
[Reset                      ]
[Calculate upstream URL     ]
------------------------------
Final upstream URL
http://backend/users?id=42
[Copy URL                   ]
------------------------------
With proxy_pass http://backend
http://backend/api/users?id=42
------------------------------
Request path
/api/users
Matched location
/api/
Proxy URI
Present: /
Path operation
Replace the matched location prefix
Retained suffix
users
Final path
/users
Arguments
id=42
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

Initial uses the complete example inputs and has no result placeholder. Empty or malformed fields stay in the form with no result region:

```text
Matched location
[                            ]
Enter the matched location.

Request target
[relative/path               ]
Start the request target with /.

proxy_pass URL
[backend:3000                ]
Use a static http:// or https:// URL without credentials.
[Reset] [Calculate upstream URL]
```

An authority-only result makes retention explicit and does not show unused suffix evidence:

```text
Final upstream URL
http://backend/api/users?id=42

Proxy URI        Absent
Path operation   Original request path retained
Final path       /api/users
Arguments        id=42
```

Unknown replaces the entire successful result:

```text
Needs live NGINX
Regex locations do not define a literal prefix that proxy_pass can replace.
Verify with nginx -T and upstream logs.
```

Loading, partial, and expanded states do not apply. An unexpected runtime failure says `The calculator could not finish. Your inputs are still here.` and offers Try again. It contains no prior URL, trace, comparison, copy action, or provenance.

## Removed or rejected

- Remove the duplicate Current URL row from Slash comparison. The current URL is already the lead; place the toggled alternative beside it.
- Replace the generic invalid result panel with associated field errors and one form-level error summary. Invalid input has no result.
- Replace custom radio, checkbox, text-field, button, and clipboard behavior with shared tool controls.
- Do not show retained suffix as if it affected authority-only `proxy_pass`. State that the original request path was retained.
- Do not show a plausible URL, trace, slash alternative, copy action, or formula metadata for regex, named, variable, rewrite, proxy-query, or normalization-sensitive cases.
- Do not label either slash form recommended, corrected, safer, or best.
- Do not add a location-selection engine, full config paste, rewrite parser, variable editor, URL sharing, export, diff chart, path diagram, marker art, screenshot, result cards, or colored left borders.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A supported submit focuses one current final URL as the first result, and that exact URL appears only once in the result. | Browser focus and text-count assertion. |
| UI-002 | deduplication | With comparison on, the lead shows the current URL and the adjacent region shows only the toggled proxy value and alternate URL; no Current row repeats the lead. | DOM text-count and comparison assertions. |
| UI-003 | visual-truth | The trace uses ordered label/value rows, slash outputs are exact strings, and no chart, score, path-length visual, or recommendation appears. | DOM inspection and engine fixture comparison. |
| UI-004 | responsive | At 320px, 375px, 760px, desktop, and 200% zoom, controls preserve order, the result band stacks current before alternate, and no page-level overflow occurs. | Browser measurements and screenshots in both themes. |
| UI-005 | url | Opening `/nginx-proxy-pass-calculator` leaves the clean canonical URL unchanged through hydration; inputs, results, and defaults never enter URL or browser storage. | Browser URL, history, and storage assertions. |
| UI-006 | inputs | Location type, matched location, request target, proxy URL, rewrite state, and defaulted comparison stay visible and use their current example defaults. | Accessible control and default-value assertions. |
| UI-007 | action | `Calculate upstream URL` is the only accent action; Enter submits once; Reset, Copy URL, and Try again remain secondary. | Keyboard and computed-style Browser tests. |
| UI-008 | stale-state | Editing any result-driving input removes URL, alternative, trace, copy, and provenance before another submit; comparison changes preserve only a valid primary result. | Browser edit and toggle regressions. |
| UI-009 | trace | URI-bearing results show request path, location, URI presence and value, operation, retained suffix, final path, and arguments in formula order. | DOM rows compared with engine trace. |
| UI-010 | authority-only | Omitted proxy URI shows Absent and Original request path retained, with no retained-suffix row presented as an applied step. | Authority-only engine fixture and Browser assertion. |
| UI-011 | unknown | Every unknown reason focuses one live-NGINX result with exact reason and verification, and exposes no URL, comparison, trace, copy, or provenance. | Browser matrix across all unknown reasons. |
| UI-012 | invalid | All simultaneous field errors remain associated, stale output is absent, the first invalid field receives focus, and no invalid-result panel appears. | Accessibility tree and Browser focus assertions. |
| UI-013 | copy | Copy URL copies only the current final URL, keeps the calculation visible on success or failure, and reports its outcome through the action label. | Clipboard success and rejection tests. |
| UI-014 | accessibility | Group labels, field errors, result focus, live announcements, monospace values, 44px targets, and focus rings work by keyboard without relying on color. | Accessibility tree, keyboard test, and manual screen-reader check. |
| UI-015 | components | Choices, fields, checkbox, actions, copy, trace, and statuses use the shared tool-control components without changing exact engine inputs. | Source inspection, component tests, and fixture parity. |
| UI-016 | failure | An unexpected exception preserves inputs, clears stale result data, focuses one failure region, and offers Try again without a loading state. | Injected-failure Browser test. |

## Open questions and blockers

- None. The existing engine, pinned NGINX receipt, and tests define every calculable, invalid, unknown, comparison, and long-value state needed for this retrofit. The contract changes hierarchy and presentation only; it does not change URI construction or public content.

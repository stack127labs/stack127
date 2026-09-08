# Interface contract: CAA Policy Checker

Status: ready
Tool: CAA Policy Checker
Route: `/caa-checker`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:801624e7c5b18d3378ea0f5911eafb51b2548aca2b7abea73abc540999dabdf3`

## User task

- Primary user: A domain owner or certificate operator checking one hostname before requesting or renewing a normal or wildcard certificate.
- Question: Which certificate authorities may issue normal and wildcard certificates for this hostname, and where does that effective CAA policy come from?
- Lead answer: One effective policy result that names the allowed authorities for normal and wildcard certificates separately, or states that issuance is unrestricted, denied, or undetermined.
- Next decision: The person can choose an allowed authority, correct the policy or its inheritance, or investigate a failed lookup before requesting a certificate.

## Retrofit evidence

- Browser backend: Standalone Playwright CLI 1.60.0 against the already-running local preview.
- Access: Observed on 5 September 2026 at `http://127.0.0.1:3333/caa-checker`. No authentication or access limit applied.
- Theme and viewports: Dark theme at 1280 by 900 and 320 by 900.
- Desktop bounds: Input 820 by 49 pixels, action 820 by 47 pixels, and current result 892 pixels wide. The document client and scroll widths were both 1280 pixels.
- Narrow bounds: Input and action 228 pixels wide, current result 272 pixels wide. The document client and scroll widths were both 320 pixels. The current records viewport was 228 pixels wide with 600 pixels of contained scroll width.

| Input or state | Expected state | Observed current state | Contract response |
| --- | --- | --- | --- |
| Clean route | Empty input, no result, unchanged URL | Observed. The URL remained `/caa-checker`. | Preserve. |
| Blank submission | One field error and focus on the input | Observed one `Enter a domain or hostname.` error, but focus stayed on the submit button. | Require input focus and shared field semantics. |
| Restricted policy | Separate normal and wildcard issuer answers, records, path, metadata, report, and raw evidence | Observed all data, split between a result header and two equal finding cards. | Merge the policy into one lead region and keep evidence below it. |
| Later loading | Busy action with no stale result | Observed a disabled `Finding CAA policy...` button while the previous policy stayed visible. | Clear the previous result when a new submission starts. |
| No policy | One unrestricted conclusion with path evidence | Observed the unrestricted meaning three times in the header and two finding cards. | State it once in the lead. |
| Qualified policy | Lead plus critical-tag and malformed-record warnings | Observed the records and both warnings. Long record data stayed inside page width. | Group qualifications without dropping source records. |
| Undetermined | One unknown conclusion, cause, failed path level, report, and raw evidence | Observed the conclusion and evidence. | Preserve the evidence but remove the separate result-header hierarchy. |
| Request failure after a result | One error, preserved input, no stale policy | Observed one request error, but the previous undetermined result remained visible. | Clear stale results on submission and failure. |
| Expanded raw response | Contained, keyboard-reachable raw evidence | Observed an open raw viewport whose client and scroll widths both remained 788 pixels. | Consolidate every level into one contained raw-output disclosure. |

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain or hostname | Which certificate name should I check? | User input normalized by `normalizeDiagnosticName` | input | One name starts the CAA search and fixes the parent tree used for inheritance. | Do not add certificate authority, resolver, or wildcard controls. |
| Check action | When should the checker query DNS? | User submission | input | The remote lookup needs one deliberate action and one retry point. | No automatic lookup while typing and no second primary action. |
| Effective normal and wildcard policy | Who may issue each kind of certificate? | `normal`, `wildcard`, `status`, and `query.inputName` | lead | This is the answer the person came for. Normal and wildcard issuance must stay in one result region because they are two parts of the same effective policy. | Do not repeat the same issuer lists in a status pill, summary card, metrics, or the policy-location sentence. |
| Effective policy owner | At which DNS name was the applied record set found? | `effectiveName` | supporting | It tells the person whether the policy is direct or inherited and where to edit it. | Show it once below the lead. Do not repeat the owner name in every policy-record row. |
| Wildcard fallback to `issue` | Why does the wildcard result match the normal result? | `usesIssueForWildcard` | supporting | It explains the RFC rule when no `issuewild` record exists. | Render one short note only when true. Do not repeat the issuer list in that note. |
| Unknown critical tags | Could an authority have to reject issuance for a tag this checker does not understand? | `unknownCriticalTags` | supporting | The critical flag changes whether the apparent issuer list is safe to act on. | Name each affected tag once in a warning. The table may still show the record as evidence. |
| Malformed records | Could broken record syntax make the intended policy unreliable? | `malformedRecords` and record `valid` values | supporting | Malformed policy needs a visible qualification near the lead answer. | Show one count and consequence. Do not make one warning card per record. |
| Invalid `iodef` syntax | Is an incident-reporting destination syntactically usable? | `iodef.validUrl` | supporting | An invalid `iodef` destination deserves a qualification, although it does not change the issuer list. | Report only invalid destination count and the accepted schemes. The records table owns exact values. |
| Effective policy records | Which records produce this answer? | `records` with flags, critical state, tag, value, TTL, and validity | evidence | A repeated-field table preserves every effective CAA record and exposes additive issuers, empty values, unknown tags, and TTLs. | Do not repeat owner name when every row has the same effective owner. Do not split tags into separate cards. |
| Lookup path | Which requested, alias, and parent names were checked, in what order, and what happened at each step? | Ordered `levels` with `searchReason`, `name`, `aliasTarget`, `responseCode`, record count, and error | evidence | The ordered path proves direct lookup, alias following, and inheritance without hiding a failed level. | Do not restate the same path in prose or draw it as a time-based timeline. |
| Raw response for every level | What did the resolver return at each lookup step? | `levels[].rawResponse` or `levels[].error` | evidence | Complete raw evidence lets an operator verify the interpreted path and policy. | Keep all levels inside one collapsed raw-output disclosure and in the report. Do not render raw JSON open by default. |
| No-policy result | Does the absence of CAA records restrict issuance? | `status === "no_policy"` after a complete parent search | supporting | This state selects the unrestricted variant of the one effective-policy lead. | Do not describe this as a lookup failure or claim that an authority will issue. |
| Undetermined result | Did a failed level prevent a safe answer? | `status === "undetermined"`, `error`, and completed `levels` | supporting | This state selects the unknown variant of the one effective-policy lead and prevents an unsafe issuer conclusion. | Show one undetermined lead and one cause. Do not also show normal or wildcard issuer conclusions. |
| Submitted hostname favicon | Which site does this result describe? | `websiteFaviconUrl(query.inputName)` and image load state | omit | A website icon is not CAA evidence and adds an unrelated third-party request to a technical result. | Keep the submitted name visible in the input and name it in the lead only when the sentence needs it. Do not reserve an icon slot. |
| Checked time and duration | When was the policy checked, and how long did the lookup take? | `checkedAt` and `durationMs` | evidence | CAA and TTL data can change, so the check time matters. Duration is useful only as quiet diagnostic metadata. | Keep both in one metadata line after interpreted evidence. Do not put timing beside the lead. |
| Downloadable JSON report | How can I keep the policy, path, warnings, and raw responses? | `diagnosticReportJson` over the complete result | evidence | The report preserves the full result for later review. | One secondary download action only. Do not add a second export format or primary styling. |
| Response code at each level | Did the resolver answer normally at this step? | `levels[].responseCode` | evidence | It supports the path outcome and exposes non-NOERROR results. | Keep it inside each path row, not a separate metrics group. |
| Record owner name | Which name owns each effective record? | `records[].ownerName` | omit | Every effective record comes from the same first non-empty set already named by `effectiveName`. | Preserve it in raw evidence and the report, but do not add a duplicate table column. |
| Resolver identity | Which recursive resolver was used? | Hardcoded Cloudflare argument inside the engine | omit | The result type does not return provider identity, so the interface should not hardcode a fact that can drift from the engine. | Do not add a provider badge or source row until the API returns it. |
| Search depth and seen-name set | How did the engine protect itself from loops? | Internal loop state | omit | The limit and set are implementation details unless they produce an error. | Surface only the returned loop or depth error, never the internal counters. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain or hostname | required | yes | No default on the clean route. An explicit `name` query value may prefill it. | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the certificate name and parent tree to check. The persistent label is `Domain or hostname *` and the example is `www.github.com`. | Full width above the button. The error remains directly below the field. |
| 2 | Check CAA policy | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote lookup and names the answer it produces. | Full width below the field with the same comfortable hit height. |
| 3 | Download report | secondary action | no | Available after any structured result, including undetermined | result | `ToolDownloadAction` | It saves the complete policy and evidence after the answer. | Full width or natural width after metadata and before raw evidence. |
| 4 | Expand raw CAA responses | optional evidence action | no | Closed by default | disclosure | `ToolRawOutput` | It exposes every level response without competing with the interpreted policy. | One full-width row. The contained viewport owns overflow. |

Validation and keyboard behavior:

- Blank or whitespace-only submission shows `Enter a domain or hostname.` once below the field and focuses the field.
- Invalid names, IP addresses, labels longer than 63 characters, names longer than 253 characters, and URLs with credentials show the engine's precise message at the field. Preserve the submitted value.
- Editing the field clears its field error. Enter submits. Tab order is field, primary action, download action, then the raw-response disclosure.
- The primary action keeps its width, changes to `Checking CAA policy...`, sets busy state, and blocks duplicate submission while loading.
- Do not disable the primary action before submission. A failed request keeps the field and the same button as the retry path.
- Reading an explicit `?name=` value is allowed. The interface does not update the URL after edits or submission because sharing state is not part of this task.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Effective CAA policy | Which authorities may issue normal and wildcard certificates for this hostname? | `query.inputName`, `status`, `normal`, and `wildcard` | One page-owned lead section announced politely. State normal and wildcard conclusions as two clearly labeled sentences. Use semantic status text only when the policy is denied or undetermined. | This is the only lead region. It must handle restricted, unrestricted, denied, no-policy, and undetermined outcomes without a favicon, second summary, state pill, or result header. |
| 2 | Policy location and interpretation | Where was the applied policy found, and does normal policy also govern wildcard issuance? | `effectiveName` and `usesIssueForWildcard` | One or two plain sentences below the lead. State direct or inherited location, then add the conditional `issuewild` fallback note. | Do not repeat issuer names. Omit the fallback note when `issuewild` exists or no issue policy exists. |
| 3 | Policy qualifications | What makes this interpreted result unsafe or incomplete? | `unknownCriticalTags`, `malformedRecords`, invalid `iodef` count, and the undetermined `error` | One `ToolStatus` region containing only applicable short messages. For undetermined results, the returned error sits with the lead and is not repeated here. | Omit the region when there are no qualifications. Do not create separate cards or repeat exact record values. |
| 4 | Effective records | Which exact CAA records create the policy? | `records` fields for flags, critical state, tag, value, TTL, and validity | `ToolDataTable` with `Flag`, `Tag`, `Value`, and `Resolver TTL`. Show `128, critical` when applicable, `Malformed` for an empty tag, preserve empty values, and show `Not reported` for null TTL. | Render only for a non-empty effective set. Unknown and malformed records remain visible. The table owns horizontal overflow. |
| 5 | Lookup path | Which names did the checker visit, in what order, and with what result? | Ordered `levels` | Page-owned semantic `ol` with neutral structural connectors. Each step names its role, DNS name, response code, outcome, optional alias target, and error. | Order encodes lookup sequence, not elapsed time. Do not use dates, equal-duration language, cards for each fact, or a tree that invents branches absent from `levels`. |
| 6 | Check metadata | When did this lookup run? | `checkedAt` and `durationMs` | One quiet page-owned metadata line in small mono text. | Do not show provider identity or repeat the hostname. |
| 7 | Report action | How can I save this check? | Complete result serialized as report version 1 | One secondary `Download report` action. | Keep it after the answer and evidence. No share, copy, print, or extra format. |
| 8 | Raw lookup evidence | What did the resolver return at every requested, alias, and parent step? | A structured array derived from every `level`, including `name`, `searchReason`, `responseCode`, `aliasTarget`, `rawResponse`, and `error` | One collapsed `ToolRawOutput` labeled `Raw CAA responses`. | Include every level even when its response is null. The raw viewport owns horizontal and vertical overflow and never opens automatically. |

Read without internal reports, the result says: `github.com allows DigiCert, GlobalSign, Let's Encrypt, and Sectigo for normal certificates. It allows DigiCert, Let's Encrypt, and Sectigo for wildcard certificates.` The policy-location sentence identifies where to edit, the records table proves the rule set, the lookup path explains direct or inherited discovery, and the final metadata and raw output preserve verification evidence.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Grouped lead answer | One effective policy with distinct normal and wildcard conclusions | Not applicable. Type hierarchy and labels, not geometry, make the result dominant. | Use one page-owned lead section with two labeled conclusions. |
| Ordered lookup path | Actual query order across requested name, alias targets, and parents | Yes. Ordered rows encode the engine's real `levels` sequence, and neutral connectors encode continuation only. | Use a semantic ordered list. Label each step's reason so the connector cannot imply time or an invented DNS branch. |
| Effective-record table | Repeated records with the same flag, tag, value, and TTL fields | Yes. Rows and aligned columns support exact comparison. | Use `ToolDataTable` and let its inner viewport own narrow overflow. |
| Lookup timeline | Search steps as if they occurred on a meaningful time axis | No. Step spacing has no relationship to lookup duration. | Omit. Do not use `ToolTimeline`. |
| Issuer chart or allocation bar | Relative weight or share among allowed authorities | No. CAA records grant permission but provide no magnitude, priority, or share. | Omit. Do not use a chart, progress bar, or allocation bar. |
| Status cards for normal and wildcard policy | Equal boxes for two parts of one answer | No. Cards would separate one policy and make unrestricted, denied, and issuer-list states harder to read as sentences. | Omit nested cards. Keep both conclusions in the lead section. |
| Alias and parent tree | A branching hierarchy of names | No. The returned `levels` array records one linear search path and does not expose a branching tree. | Replace the literal tree with an ordered path whose reason labels preserve alias and parent relationships. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial, clean route | Empty field and enabled `Check CAA policy` button | Absent | All result regions absent | No helper paragraph or error | Normal document focus order. Nothing announces on load, and `/caa-checker` stays unchanged through hydration. |
| Initial, explicit query | Field is prefilled from `?name=www.example.com`; the button stays enabled | Absent until submission | Absent | The query value is editable and is not automatically submitted | Nothing announces on load. The opened query string remains unchanged. |
| Invalid | Preserve the entered value and keep submit enabled | Absent | Absent | Show one precise field error for blank, invalid, too-long, credentialed URL, or IP input | Focus the field and announce its error through field semantics. |
| Loading, first check | Preserve input, prevent duplicate submission, and change the fixed-width button label to `Checking CAA policy...` | Absent | Absent | The same button becomes the retry path if the request fails | Announce loading politely and expose busy state. Do not move focus. |
| Loading, later check | Preserve edited input and prevent duplicate submission | Hide the previous policy because it belongs to another submitted name | Hide previous records, path, metadata, report, and raw output | Do not leave a stale policy visible beside a changed hostname | Announce loading politely. Keep focus on the initiating control. |
| Policy found, restricted | Preserve the submitted normalized name and re-enable submit | State normal and wildcard issuer lists separately, including different lists when `issuewild` overrides `issue` | Show policy location, conditional qualifications, record table, lookup path, metadata, report, and raw output | The same field and action support another check | Announce the complete lead region once. Do not move focus into results. |
| Policy found, denied | Preserve input and re-enable submit | State `No certificate authority is allowed` for each denied certificate kind; the other kind may still be unrestricted or restricted | Keep the same evidence order and use warning text on denied sentences | Do not translate an empty issuer value into missing data | Announce the lead once. Color is supplemental to the explicit sentence. |
| No policy | Preserve input and re-enable submit | State that CAA does not restrict normal or wildcard issuance for this hostname | Omit records and policy location. Show the complete lookup path, metadata, report, and raw output | State that this is not a promise that an authority will issue | Announce the unrestricted lead once. |
| Partial policy | Preserve input and re-enable submit | Show the effective issuer conclusions, qualified by unknown critical tags, malformed records, or invalid `iodef` syntax | Keep records, path, metadata, report, and raw output so the qualification can be checked | One grouped qualification region names the consequence and recovery target | Announce the lead, then the qualification as a polite status or alert according to severity. |
| Undetermined | Preserve input and re-enable submit | State that the effective CAA policy could not be determined and include the returned cause once | Omit normal and wildcard issuer conclusions and the effective-record table. Show all completed and failed path steps, metadata, report, and raw output | `Check CAA policy` remains the retry action. Do not climb past or hide the failed level | Announce the lead as an alert. Do not move focus away from the retry flow. |
| Request failure | Preserve valid input, re-enable submit, and clear any stale result | Absent | All previous result regions are cleared | Show the API error once below the field or form and keep the primary action as retry | Announce the error once. Focus stays in the form. |
| Expanded raw evidence | Inputs and lead stay unchanged | Remains visible above | Open the one `Raw CAA responses` viewport with every level | The trigger closes it. Null responses keep their level error instead of disappearing | Disclosure semantics announce expansion. Keyboard focus stays on the trigger unless the person tabs into the raw viewport. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One certificate name input | `ToolTextField` | It preserves a visible required label, native text entry, field error, and focus control. | `ToolSearchField`, because the person is looking up one name rather than filtering a collection. |
| One remote check action | `ToolButton` primary submit | It gives the request one clear start and retry point with disabled and busy states. | Auto-submit and a reset button, because they create extra behavior without improving the policy answer. |
| Normal and wildcard policy | Page-owned semantic lead section, using one live region and plain labeled sentences | The answer is one policy with two required certificate contexts, not one scalar value. | `ToolPrimaryResult`, because a large `Restricted` value would hide the actual authorities; two separate result cards would split one answer. |
| Result status and qualifications | `ToolStatus` | It announces lookup and warning text with semantic tone and no decorative container. | Status pills and tinted warning cards, because they would repeat the lead or overstate supporting caveats. |
| Effective records | `ToolDataTable` | Every policy record has the same flag, tag, value, and TTL fields. | Record cards or prose, because repeated facts compare better in rows. |
| Lookup sequence | Page-owned semantic `ol` | It can label requested, alias, and parent relationships while preserving the exact engine order. | `ToolTimeline`, because there is no time axis, and a branching tree, because the result contains one path. |
| Saved report | `ToolDownloadAction` inside `ToolActionRow` | It keeps the existing JSON report as a secondary action. | Primary styling, copy, or several export formats, because none helps interpret the policy. |
| Raw evidence | `ToolRawOutput` | It contains long JSON, preserves keyboard access, and keeps every response behind one explicit disclosure. | One disclosure per path step or always-open JSON, because repeated triggers and open code would dominate the evidence section. |
| Submitted-site identity | Omit | The input already identifies the queried name, and a website icon does not verify a CAA policy. | `DiagnosticFavicon`, a logo, or another identity row, because each adds unrelated hierarchy and a third-party request. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real DNS sidebar | Full-width workbench band. The labeled field uses the flexible column and the primary button aligns with the control. Results stack as lead, location, qualifications, table, path, metadata, report, and raw evidence. | A 253-character ASCII hostname; issuer value `letsencrypt.org; validationmethods=dns-01,accounturi=https://acme.example/account/1234567890`; 24 lookup levels. | No page overflow. `ToolDataTable` and `ToolRawOutput` own their inner overflow. |
| Narrow mobile, 320px to 640px | Field, error, and full-width button stack in task order. Normal and wildcard conclusions stack. Each path step puts role and outcome before wrapped names and alias details. Result order does not change. | A 63-character label inside a 253-character hostname, a long unknown critical tag, and an unbroken raw response value. | Labels, issuer lists, names, and errors wrap. Only the records table and raw viewport may scroll horizontally. |
| Expanded raw evidence at any width | The disclosure stays in normal result flow after report action. Its viewport caps height and scrolls without widening the workbench. | A 24-level response array with nested DNS messages and long quoted record data. | The raw viewport owns horizontal and vertical overflow. The page never does. |
| Increased text size or long translations | Put the field above the action when the shared row no longer fits. Buttons grow vertically without clipping, and path status moves below its label when needed. | `The effective CAA policy could not be determined` and `Moved to the next parent of the certificate name` at 200 percent text size. | Text wraps inside controls and path rows. No sibling covers a table column or action. |

## Interface wireframes

### Desktop result

```text
Domain or hostname *                                 [Check CAA policy]
[github.com                                                           ]

------------------------------------------------------------------------

[icon] github.com

Effective CAA policy
Normal certificates
DigiCert, GlobalSign, Let's Encrypt, and Sectigo may issue.

Wildcard certificates
DigiCert, Let's Encrypt, and Sectigo may issue.

Policy found at github.com.

The records that create this policy
+----------+-----------+-------------------+--------------+
| Flag     | Tag       | Value             | Resolver TTL |
+----------+-----------+-------------------+--------------+
| 0        | issue     | digicert.com      | 3,600s       |
| 0        | issue     | globalsign.com    | 3,600s       |
| 0        | issuewild | letsencrypt.org   | 3,600s       |
+----------+-----------+-------------------+--------------+

Where the policy came from
1  Requested name  github.com  NOERROR  Policy found, 7 records

Checked 5 September 2026 at 4:04 pm in 176 ms.

                                               [Download report]
> Raw CAA responses
```

For inherited policy, replace the single path row with the real sequence and add `Policy inherited from example.com.` above it:

```text
1  Requested name  www.example.com       NOERROR  No CAA here
|  CNAME to customer.hosting.test
2  Alias target    customer.hosting.test  NOERROR  No CAA here
|
3  Parent name     example.com            NOERROR  Policy found, 1 record
```

### Narrow mobile result

```text
Domain or hostname *
[github.com                         ]
[         Check CAA policy         ]

------------------------------------

[icon] github.com

Effective CAA policy
Normal certificates
DigiCert, GlobalSign, Let's Encrypt,
and Sectigo may issue.

Wildcard certificates
DigiCert, Let's Encrypt, and Sectigo
may issue.

Policy found at github.com.

The records that create this policy
+--------+-----------+-------------+-----+
| Flag   | Tag       | Value       | TTL | -> inner table scroll
+--------+-----------+-------------+-----+

Where the policy came from
1  Requested name
   github.com
   NOERROR, Policy found, 7 records

Checked 5 September 2026
at 4:04 pm in 176 ms.

[        Download report           ]
> Raw CAA responses
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain or hostname *
[www.github.com                     ]
[         Check CAA policy         ]

INVALID
Domain or hostname *
[                                   ]  <- focus
Enter a domain or hostname.
[         Check CAA policy         ]

LOADING
Domain or hostname *
[github.com                         ]
[       Checking CAA policy...     ]  disabled, busy
Checking CAA policy...                  polite status

NO POLICY
Effective CAA policy
CAA does not restrict normal or wildcard issuance for example.test.
This does not promise that a certificate authority will issue.
[complete lookup path]

PARTIAL POLICY
Effective CAA policy
Normal certificates
Let's Encrypt may issue.
Wildcard certificates
Let's Encrypt may issue.
Warning: 1 CAA record is malformed, so this policy may not work as intended.
[records] [lookup path] > Raw CAA responses

UNDETERMINED
Effective CAA policy
The effective CAA policy could not be determined.
The nameserver did not answer before the timeout.
1  Requested name  www.example.com  Lookup failed
[        Check CAA policy          ]  retry

REQUEST FAILURE
Domain or hostname *
[github.com                         ]
The CAA check took too long and was stopped safely.
[         Check CAA policy         ]  retry

EXPANDED RAW EVIDENCE
v Raw CAA responses
+----------------------------------+
| [                                |
|   {                              |
|     "name": "github.com",     |
|     "rawResponse": { ... }    | -> contained scroll
|   }                              |
| ]                                |
+----------------------------------+
```

## Removed or rejected

- Remove the existing result header and favicon. The input already identifies the submitted hostname, the effective-policy lead owns the result, and timing moves to quiet metadata.
- Replace the two equal finding cards for normal and wildcard certificates with one lead section. They are two required parts of one answer.
- Remove the tinted card treatment from policy conclusions and warnings. Use sentence hierarchy, neutral structure, and semantic text color.
- Do not repeat the normal issuer list in the wildcard fallback note. State only that `issue` applies because `issuewild` is absent.
- Do not show normal or wildcard conclusions when status is undetermined. The engine has not established a safe policy.
- Do not leave a previous hostname's result visible during a later lookup or request failure.
- Do not expose resolver selection, certificate type selection, authority selection, CAA record editing, reset, share, copy, or print controls. The current engine does not need them.
- Do not draw issuer counts as bars or charts. CAA records do not assign weight or priority.
- Do not use a timeline for lookup levels. They are ordered DNS steps, not time intervals.
- Do not draw a branching tree from a linear `levels` result. Use requested, alias, and parent labels to show the real relationships.
- Do not repeat `ownerName` in every effective-record row when `effectiveName` already names the one source record set.
- Do not create one raw-response disclosure for every lookup step. One labeled array keeps all responses complete and easier to scan or save.
- Do not hardcode `Cloudflare` into result metadata until the API returns resolver identity.
- Do not wrap the form, lead, records, path, or raw output in nested cards. The workbench band, one divider, spacing, and table border provide enough structure.
- Do not show an invalid `iodef` value twice. The records table keeps the exact value, while the qualification states only the syntax problem.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every structured result displays exactly one effective-policy lead region. Restricted results name normal and wildcard issuers separately, no-policy results state both are unrestricted, and undetermined results show no issuer conclusion. | Browser role inspection and screenshots for restricted, mixed denied, no-policy, and undetermined fixtures. |
| UI-002 | deduplication | Issuer lists appear only in the lead, effective owner appears only in the location sentence, and the result has no duplicate status pill, summary card, or result header. | Browser text counts and DOM inspection. |
| UI-003 | visual-truth | Lookup evidence uses an ordered path with requested, alias, and parent labels. The workbench contains no lookup timeline, branching tree, issuer chart, progress bar, or allocation bar. | DOM inspection and static source test. |
| UI-004 | interaction | Blank submission focuses the field and announces `Enter a domain or hostname.` once. Invalid server input preserves its value, and request failure leaves one visible retry action. | Keyboard-only Playwright test with blank, IP, invalid URL, and failed-request fixtures. |
| UI-005 | state | First and later loading states announce progress, block duplicate submission, and clear the previous hostname's result before a new answer or error. | Delayed-response Playwright fixture using two different hostnames. |
| UI-006 | policy | Normal and wildcard conclusions follow `unrestricted`, `denied`, and issuer arrays exactly. The wildcard fallback note appears only when `usesIssueForWildcard` is true. | Playwright fixtures for `issue`, `issuewild`, empty issuer, and issuewild-only policies. |
| UI-007 | qualifications | Unknown critical tags, malformed records, and invalid `iodef` syntax produce one grouped qualification region without removing their source records from evidence. | Playwright fixtures covering each qualification alone and together. |
| UI-008 | evidence | The records table preserves flags, critical state, tag, empty or long value, malformed state, and null or numeric TTL. The path preserves every level, including alias target, response code, empty result, and failure. | Table and ordered-list role assertions against complete and partial fixtures. |
| UI-009 | responsive | At 320px wide, the task and result order stays unchanged, the page has no horizontal overflow, and records or raw JSON overflow stays inside its own viewport. | Browser width measurement using a 253-character hostname, long record value, 24 levels, and unbroken raw data. |
| UI-010 | evidence | The downloaded report keeps the effective policy, every level, warnings, and raw responses, and an undetermined structured result still offers the download. | Playwright download inspection for complete and undetermined fixtures. |
| UI-011 | accessibility | Field, action, result announcement, table, ordered path, download, raw disclosure, and retry flow work by keyboard with visible focus in dark and light themes. | Keyboard pass and theme screenshots at desktop and mobile widths. |
| UI-012 | url | Opening `/caa-checker` without a query string leaves the URL unchanged through render and hydration. Opening an explicit `?name=` value preloads the field without further URL mutation. | Browser URL and history assertions for clean and query-filled routes. |

## Open questions and blockers

- None. The brief, current engine, API shape, route, operated states, and existing test fixtures settle the information model.

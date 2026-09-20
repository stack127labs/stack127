# Interface contract: DNS Trace Explorer

Status: ready
Tool: DNS Trace Explorer
Route: `/dns-trace`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A domain operator tracing one DNS question to find the handoff or server that returned the answer or stopped the lookup.
- Question: Where did this DNS question stop or change direction between the root, TLD, and authoritative nameservers?
- Lead answer: One outcome sentence that names the authoritative answer, alias destination, negative answer, missing record, or exact stage and reason where the trace stopped.
- Next decision: The operator can inspect the step evidence, correct the broken delegation or record, or open the nameserver checker when the trace cannot finish.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain or hostname | What exact name should the trace follow? | User input normalized by `normalizeDnsInput` | input | One name or URL supplies the hostname for the iterative query. | Do not add a separate URL, service-name, or zone field. |
| Record type | Which DNS question should every step ask? | User choice from `TRACE_RECORD_TYPES` | input | The selected type changes the question and final answer. | Keep all supported types in one visible choice group. Do not add `All`, `ANY`, or `PTR`. |
| Trace action | When should the server start the bounded iterative query? | User submission | input | Direct nameserver queries need one deliberate start and retry point. | Do not auto-run while typing or add another primary action. |
| Trace outcome sentence | Did the trace finish, change names, return a negative answer, or stop? | `outcome`, `finalName`, the last visible step, and `warnings` | lead | This directly answers the operator's question before the interface presents evidence. | Render one lead sentence. Do not repeat it in a completion paragraph, state pill, or result heading. |
| Normalized query name | Which normalized name does the result describe? | `query.normalizedName` | supporting | It prevents confusion when the person enters a URL or differently cased name. | Include it in the lead or path. Do not add a separate domain heading. |
| Final name after aliases | Where did the question point after a CNAME? | `finalName` and alias steps | supporting | A changed name is part of the path and may explain why the answer comes from another zone. | State the change once in the lead when material, then show each alias transition only in its step. |
| Ordered trace steps | How did the query move from the root to the outcome? | `steps` ordered by `sequence` | supporting | The ordered path exposes every visible referral, alias, answer, and stopping point. | Keep one path. Do not repeat it as a summary diagram or second timeline. |
| Step stage and zone | Which part of DNS answered at this point? | `stage`, `zone`, and `sequence` | supporting | Root, TLD, and authoritative labels make the path scannable. | Use one numbered step heading. Do not repeat the stage in a separate badge. |
| Step message | What happened at this step? | Engine-authored `message` | supporting | The sentence interprets the referral, alias, answer, negative response, or error. | Place it once under the step heading. Structured evidence below must not restate the sentence. |
| Server hostname and address | Which nameserver did stack127 ask? | `server.hostname` and `server.address` | evidence | The endpoint verifies where the response came from. | Show one `Server` row per step. Do not repeat it in prose. |
| Actual question | What name and type did stack127 send at this step? | `questionName` and `requestedType` | evidence | Alias restarts can change the name, so the sent question must remain explicit. | Show one `Question` row. Do not relabel referral questions as NS lookups. |
| Response facts | What response code, authority flag, and response time came back? | `responseCode`, `authoritative`, and `durationMs` | evidence | These facts help verify whether a step answered, referred, or stopped. | Keep them in one response row. Do not add status pills or metric cards. |
| Delegated zone and nameservers | Where did a referral point next? | `delegatedZone` and `nameservers` | supporting | The handoff explains the next step and exposes a missing or wrong delegation. | The step message names the zone. The expandable nameserver list owns the server names. |
| Glue records | Which referral addresses qualify as glue? | `glueRecords` | evidence | The distinction explains how an in-domain or sibling nameserver became reachable. | Keep glue separate from other Additional-section addresses and raw JSON. |
| Other included nameserver addresses | Which referral addresses were included but are not glue? | `additionalAddressRecords` | evidence | Separate labeling prevents the interface from calling every included address glue. | Never merge these rows into the glue table. |
| Answer records and TTLs | What record data did this step return? | `answerRecords` | supporting | Values and TTLs verify an answer, CNAME transition, or records attached to another response. | Show records once inside their source step. Omit a separate final-record summary. |
| Earlier server attempts | Which server attempts failed before this response or stop? | `attempts` | evidence | Failed attempts explain delay and prove that the trace tried alternate nameservers. | Keep them inside the affected step. Do not turn them into warnings above the path. |
| Raw response | What complete DNS response supports this step? | `rawResponse`, falling back to `attempts` when no response exists | evidence | Per-step raw evidence supports diagnosis without crowding the default reading path. | One collapsed disclosure per step. Do not add a second page-level raw response. |
| Warnings | Why did an otherwise usable prefix path stop? | `warnings` | supporting | A warning may contain the only precise reason a referral could not continue. | Fold the decisive warning into the lead and show any remaining unique warning once after the affected step. |
| Total duration and checked time | When did stack127 run the trace, and how long did the whole walk take? | `durationMs` and `checkedAt` | evidence | Quiet timing metadata helps distinguish a fresh trace from copied evidence. | Show once after the path. Step times remain inside their steps. |
| Copy trace action | How can the operator keep or share the readable evidence? | Existing `traceAsText` representation | evidence | One compact copy action preserves the interpreted trace without opening raw JSON. | Keep one action beside or just below the lead. No per-value copy buttons. |
| Nameserver checker link | What focused check should follow a stopped delegation? | `outcome === "error"` and normalized query name | supporting | The linked checker compares the parent handoff, glue, and server answers. | Show only for stopped traces. Do not repeat the link in every failed step. |
| `finalRecords` | What records completed the trace? | Response aggregate | omit | The same records already appear in the step that returned them. | Do not render a duplicate final-answer table. |
| Original input | What unnormalized string did the person type? | `query.originalInput` | omit | The input remains visible and the normalized name is the useful result identity. | Do not add an input-versus-normalized comparison. |
| Root inventory, query counters, limits, and nested NS lookups | How did the engine bound and support the trace? | Engine internals | omit | These details protect execution but do not change the operator's immediate diagnosis. | Keep them out of the visible result and raw step hierarchy unless the API returns relevant failure text. |
| Resolver, DNSSEC flags, `All`, and `ANY` | Which recursive resolver or bundled options should the trace use? | Unsupported API fields | omit | A trace starts at the root and follows one question. These options would misstate the engine. | Do not add resolver, DO, CD, `All`, or `ANY` controls. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain or hostname | required | yes | No default on the clean route. An explicitly opened `name` query parameter may prefill it. | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It supplies the one name to trace. The persistent label is `Domain or hostname *` and the example is `www.example.com`. | Full width first. Its error remains directly below the field. |
| 2 | Record type | defaulted | yes | `A` on the clean route. A supported explicit `type` query parameter may preselect another value. | visible | `ToolChoiceGroup` with A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, SRV, DS, and DNSKEY | The selected type changes every query and the answer, so the active default must stay visible. | Full-width wrapped choices below the name. Preserve radio order and comfortable hit areas. |
| 3 | Trace DNS | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote trace and names the answer it produces. | Full width below the choices. Keep its width when the label changes to `Tracing DNS...`. |
| 4 | Reveal remaining referral values | optional evidence action | no | Lists show up to four items, then stay collapsed | result | Page-owned text button with `aria-expanded` and an explicit count | It exposes long referrals without forcing raw JSON or making common results tall. | Keep it after the visible values. Let the label wrap without shrinking the hit target. |
| 5 | Copy trace | secondary action | no | Available after any returned trace result | result | `ToolCopyAction` with `Copy trace`, `Trace copied`, and `Copy failed` labels | It copies the readable result and verifies success before reporting it. | Full width below the lead when it no longer fits beside the sentence. |
| 6 | Expand a raw step response | optional evidence action | no | Closed by default | disclosure | `ToolRawOutput` titled `Raw response from this step` | It exposes complete evidence for one step without interrupting the trace path. | One full-width disclosure inside its step. The contained viewport owns overflow. |

Validation, keyboard, and URL behavior:

- Blank or whitespace-only submission shows `Enter a domain or hostname.` once below the field, focuses the field, and keeps the button enabled.
- Server validation errors, including an IP address or invalid DNS name, appear once below the form because they apply to the submitted request. They preserve the entered value and leave `Trace DNS` as the retry action.
- Editing either result-driving input after an error clears that error. Enter in the name field submits. Arrow keys move through the record-type radio group.
- During a request, the primary button keeps its width, changes to `Tracing DNS...`, exposes busy state, and blocks duplicate submission.
- Opening `/dns-trace` leaves the address unchanged through server render and hydration. Explicit `name` and supported `type` parameters may prefill the form, but edits and submissions do not rewrite the URL. There is no Share action.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Trace outcome | Where did this DNS question finish, stop, or change direction? | `outcome`, normalized name, final name, last step, and decisive warning | One `ToolResultLead` sentence as the only dominant result. A found alias result names both the original and final name. A stopped result names the last reached stage and reason. | Do not add a domain result heading, completion paragraph, status badge, or summary cards. |
| 2 | Ordered DNS path | How did the trace get to that outcome, and what supports each handoff? | Ordered `steps`, with each step's message, server, question, response facts, referral data, records, attempts, and raw response | One page-owned semantic `ol`. Each step has a numbered heading, one message, compact key/value evidence, conditional data tables or value lists, and one raw disclosure. A neutral connector may show order. | It is an ordered dependency path, not elapsed-time geometry. Do not add a second journey diagram or equal-sized cards for step facts. |
| 3 | Follow-up check | What should the operator inspect next when the path cannot finish? | Error outcome and normalized query name | One plain link to `/nameserver-checker?name=...` after the affected path | Render only for `error`. Do not imply that NXDOMAIN or a valid no-answer result is broken delegation. |
| 4 | Trace evidence action | How can the operator copy the readable trace? | Text serialization of the visible trace | One secondary `ToolCopyAction` associated with the lead | Report success only after copying succeeds. Keep all source text selectable if copying fails. |
| 5 | Run metadata | When did stack127 run the trace, and how long did it take? | `checkedAt` and total `durationMs` | Quiet page-owned `dl` in small mono text after the path | Show each value once. Do not repeat the total duration in the lead or as a metric card. |

Read without the internal reports, a successful result says: `The trace reached an authoritative A answer for www.example.com at ns1.example.com.` The ordered path shows each root, TLD, alias, and authoritative transition. Its structured rows verify the server, exact question, response, referral, records, failed attempts, and raw reply. A stopped result replaces the success sentence with the exact last stage and reason, then offers the nameserver check when it can help.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large outcome sentence | The one current conclusion about where the trace finished or stopped | Not applicable. Reading order and type hierarchy, not geometry, make it dominant. | Use one `ToolResultLead`. |
| Numbered vertical path with a neutral connector | Query order and dependency between the root, TLD, alias restart, and authoritative steps | Yes. Sequence numbers and document order encode the real query order. Connector length makes no duration claim. | Use a page-owned semantic ordered list. Do not use `ToolTimeline`, which is for dated events. |
| Step key/value rows | Server, question, response, authority state, and timing for one step | Yes. Labels align distinct facts without claiming a quantitative relationship. | Use `ToolKeyValueList` or equivalent semantic `dl` inside the step. |
| Record and attempt tables | Repeated records or attempts that share the same fields | Yes. Rows consistently map each item to its name, type, value, TTL, server, duration, or error. | Use `ToolDataTable` only when a group has rows. Its viewport owns horizontal overflow. |
| Time-axis timeline | Duration between DNS steps | No. Per-step request durations do not define the spacing or elapsed gaps between displayed blocks. | Omit. Do not use a time axis or imply that visual distance measures latency. |
| Progress bar | Progress toward a DNS answer | No. The trace does not know the number of referrals or aliases before it finishes. | Omit. Do not show a completion percentage or estimated remaining steps. |
| Separate cards for each fact or step | Relative importance of server, status, response, and records | No. Equal boxes would make evidence compete with the outcome and fragment each transition. | Omit nested cards. Use one workbench band, spacing, rows, and the ordered path. |
| Root-to-answer summary diagram | A simplified path already present in the actual result | No. It would repeat the ordered trace without adding evidence. | Omit from the workbench. Preserve existing supporting Markdown outside the tool without copying it into results. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty name, visible A default, and enabled `Trace DNS` | Absent | All result regions absent | No error or instructional panel | Normal document focus order. Nothing announces on load. The URL stays `/dns-trace`. |
| Initial explicit query state | Prefilled name and supported record type from the opened URL | Absent | All result regions absent | Unsupported type falls back visibly to A. The tool does not submit automatically. | Normal focus order. Do not announce prefilled values. Keep the opened query string unchanged. |
| Invalid client input | Preserve the blank or whitespace value and the selected type | Absent | Absent | Show `Enter a domain or hostname.` once below the field | Focus the name field and expose the message through field error semantics. |
| Loading, first trace | Preserve both inputs, disable duplicate submission, and change the button label to `Tracing DNS...` | Absent | Absent | The same primary action becomes the retry point if the request fails | Announce `Tracing DNS...` politely and expose busy state. Do not move focus. |
| Loading, later trace | Preserve the edited inputs and disable duplicate submission | Hide the prior lead because it belongs to another submitted question | Hide the prior path, follow-up, and metadata | Never present stale steps beside changed input | Announce loading politely. Keep focus on the initiating control. |
| Found answer | Preserve inputs and re-enable submit | State that the trace reached an authoritative or otherwise final answer, naming the record type and final name | Show the full ordered path, answer records, evidence, copy action, and run metadata | The form remains available for another trace | Announce the lead and result region politely. Do not force focus into the result. |
| Found answer after alias | Preserve inputs and re-enable submit | State that the original name changed to `finalName` and that the trace reached the selected answer | Show the alias step followed by the restarted root-to-answer path | Alias loop or depth failure uses the partial stopped state instead | Announce the one outcome sentence. Each alias step remains readable in order. |
| No record | Preserve inputs and re-enable submit | State that the reached server returned no record of the selected type for the final name | Show the path and any response records or raw evidence that exist | Do not label the whole domain broken. Another record type can be selected and retried. | Announce the no-answer lead politely. |
| NXDOMAIN | Preserve inputs and re-enable submit | State which reached nameserver says the exact final name does not exist | Show the path, negative response code, and raw evidence | Do not offer the nameserver checker unless the trace itself also stopped with an error | Announce the negative answer. Semantic danger text may color words but never a panel. |
| Partial or stopped trace | Preserve inputs and re-enable submit | Name the last reached stage and the decisive warning or failed-attempt reason | Show every completed step and the stopped step when present, then one nameserver-checker link | Keep retry available. Do not discard the successful prefix path or duplicate warnings above it. | Announce the stopped lead as a warning or error. Leave focus in the retry flow. |
| Request or network failure | Preserve both inputs and re-enable the primary action | Absent | Clear any previous result so it cannot be mistaken for this request | Show the server message once below the form. `Trace DNS` remains the retry path. | Announce the error through `ToolStatus` or the form error region. Do not move focus away from the input and retry controls. |
| Expanded referral values | Inputs and lead remain unchanged | Remains visible | Reveal all values in only the chosen nameserver, glue, or included-address list | The same text button collapses the list | Preserve focus on the toggle and update `aria-expanded`. |
| Expanded raw response | Inputs, lead, and path remain unchanged | Remains visible above | Open only the selected step's contained raw viewport | Its trigger closes it. Long JSON scrolls inside the viewport. | Disclosure semantics announce expansion. Keyboard focus stays on the trigger until the person tabs into the raw output. |
| Copy success or failure | Inputs and result remain unchanged | Remains visible | Copy action changes briefly to `Trace copied` or `Copy failed` | Failure leaves the trace text and result selectable | The action's accessible label announces the verified state. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One query name | `ToolTextField` | It keeps the required label, native text entry, field error, and input focus together. | `ToolSearchField`, because the person submits one DNS question rather than filtering a collection. |
| Visible record type | `ToolChoiceGroup` | Radio semantics expose every supported result-driving choice and make the A default explicit. | `ToolSelect`, because hiding the active assumption and supported types would slow comparison and selection. |
| One trace action | `ToolButton` primary submit | It provides one deliberate remote action with stable loading and disabled states. | Auto-run, resolver buttons, and a second primary action, because none matches the bounded trace task. |
| One result conclusion | `ToolResultLead` | A full sentence can name success, alias change, negative answer, no record, or stopping reason without forcing the answer into a label/value card. | `ToolPrimaryResult`, metric cards, a status pill, and a domain heading, because each would split or repeat the conclusion. |
| Ordered DNS journey | Page-owned semantic `ol` with numbered steps and a neutral connector | DNS steps form a dependency chain with variable content and no time axis. | `ToolTimeline`, because its dated-event contract does not fit query hops. |
| Compact step facts | `ToolKeyValueList` or an equivalent page-owned `dl` | Server, question, response code, authority, and duration are distinct labeled evidence. | Prose such as `We asked...`, because it is harder to scan and repeats the labels. |
| Repeated record and attempt evidence | `ToolDataTable` | Records and attempts have consistent fields and benefit from aligned comparison. | Equal record cards, because they consume more space and obscure repeated fields. |
| Long referral lists | Page-owned expandable value list with a text button | It can show the first four values, preserve the total count, and expand in place. | A generic disclosure that hides every value, because the common first values should remain visible. |
| Per-step raw evidence | `ToolRawOutput` | It keeps complete JSON collapsed and contains long unbroken values in its own viewport. | Always-open `pre`, a modal, or one page-level dump, because each separates evidence from its source step or widens the page. |
| Readable trace copy | `ToolCopyAction` | It verifies clipboard success, has a fallback, and exposes success or failure in the action. | The custom unchecked clipboard button and per-field copy actions, because they can claim success incorrectly or create action clutter. |
| Request status | `ToolStatus` near the form | It announces loading or request failure without turning status into a competing result card. | Repeating the same error under the field, button, and result region. |
| Stopped-trace next check | Plain `Link` after the path | Navigation is the correct native action and remains secondary to retry. | A primary button or action panel, because the trace answer and retry remain the main flow. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. Inside it, the name field comes first, the record choices wrap below it, and the primary action follows. Results stack as lead, copy action, ordered path, conditional follow-up, then metadata. | A 253-character DNS name, `2606:4700:58::a29f:c2d2`, and a TXT value near the DNS response limit | No page overflow. Record tables and raw response viewports own horizontal overflow. |
| Narrow mobile, 320px to 640px | Keep the same task order. Field, wrapped choices, and full-width button stack. Put the copy action below the lead. Each step keeps its number beside the heading while facts stack below. | `_very-long-service-label._tcp.a-deliberately-long-subdomain.example`, `Show all 13 nameservers`, and a long failed-attempt message | Names, messages, and code values wrap anywhere when safe. Tables and raw viewports alone may scroll horizontally. |
| Expanded referral list at any width | The list grows inside its step and pushes later evidence down without changing column widths or covering controls. | Thirteen root or TLD nameserver hostnames with IPv4 and IPv6 addresses | The list wraps within the step. It does not create a horizontal scroller. |
| Expanded raw evidence at any width | The disclosure stays in its source step. Its viewport caps height and scrolls without widening the ordered path. | A complete DNS response containing long TXT strings, DNSKEY material, and nested arrays | The raw viewport owns horizontal and vertical overflow. The page never does. |
| Increased text size or long translations | Keep controls and step evidence in document order. Let buttons and status rows grow vertically. Move the step number above the body if the remaining column becomes too narrow. | `Nameserver addresses included with this referral` and `The nameserver did not answer before the timeout.` at 200 percent text size | Text wraps inside its region. No action, record column, or raw value may be covered by a sibling. |

## Interface wireframes

### Desktop result

```text
Domain or hostname *
[www.example.com                                                       ]

Record type
( A ) (AAAA) (CNAME) (MX) (NS) (TXT) (CAA) (SOA) (SRV) (DS) (DNSKEY)

[Trace DNS]

------------------------------------------------------------------------

The trace reached an authoritative A answer for www.example.com
at ns1.example.com.                                      [Copy trace]

1  Root nameserver
   The root nameserver pointed us to the nameservers responsible for .com.

   Server       a.root-servers.net  198.41.0.4
   Question     www.example.com  A
   Response     NOERROR  Not authoritative  14 ms

   Nameservers in the referral
   a.gtld-servers.net  b.gtld-servers.net  c.gtld-servers.net
   d.gtld-servers.net  [Show all 13 nameservers]

   Glue from this referral
   Name                    Type  Address        TTL
   a.gtld-servers.net      A     192.5.6.30     172,800 seconds

   > Raw response from this step
   |
2  .com nameserver
   The .com nameserver pointed us to the nameservers for example.com.
   Server       a.gtld-servers.net  192.5.6.30
   Question     www.example.com  A
   Response     NOERROR  Not authoritative  20 ms
   > Raw response from this step
   |
3  Nameserver for example.com
   The authoritative nameserver returned the A record for www.example.com.
   Server       ns1.example.com  9.9.9.9
   Question     www.example.com  A
   Response     NOERROR  Authoritative  50 ms

   Answer records
   Type  Name               Value           TTL
   A     www.example.com    93.184.216.34   300 seconds

   > Raw response from this step

Checked 5 September 2026 at 15:30 IST     Total duration 84 ms
```

For an alias, the lead names the changed destination and the path inserts the alias step before restarting at a root nameserver. For a stopped trace, the lead names the stopping stage and reason, then the path ends with one nameserver-checker link.

### Narrow mobile result

```text
Domain or hostname *
[www.example.com                  ]

Record type
( A ) (AAAA) (CNAME) (MX) (NS)
(TXT) (CAA)  (SOA)  (SRV) (DS)
(DNSKEY)

[          Trace DNS             ]

----------------------------------

The trace reached an authoritative
A answer for www.example.com at
ns1.example.com.

[          Copy trace            ]

1  Root nameserver
   The root nameserver pointed us
   to the nameservers for .com.

   Server
   a.root-servers.net
   198.41.0.4

   Question
   www.example.com  A

   Response
   NOERROR
   Not authoritative, 14 ms

   Nameservers in the referral
   a.gtld-servers.net
   b.gtld-servers.net
   c.gtld-servers.net
   d.gtld-servers.net
   [Show all 13 nameservers]

   > Raw response from this step
   |
2  .com nameserver
   ...
   |
3  Nameserver for example.com
   ...

   Answer records                 -> contained table scroll
   Type | Name | Value | TTL

   > Raw response from this step

Checked
5 September 2026 at 15:30 IST
Total duration
84 ms
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain or hostname *
[www.example.com                  ]
Record type  ( A ) (AAAA) ...
[          Trace DNS             ]

INVALID
Domain or hostname *
[                                  ]  <- focus
Enter a domain or hostname.
Record type  ( A ) (AAAA) ...
[          Trace DNS             ]

LOADING
Domain or hostname *
[www.example.com                  ]
Record type  ( A ) (AAAA) ...
[         Tracing DNS...         ]  disabled, busy
Tracing DNS...                         polite status

EMPTY OR NO RECORD
The trace reached ns1.example.com,
but it returned no MX record for example.com.
1 Root -> 2 .com -> 3 example.com

NXDOMAIN
The authoritative nameserver for example.com says
missing.example.com does not exist.
1 Root -> 2 .com -> 3 example.com, NXDOMAIN

PARTIAL OR STOPPED
The trace stopped after the .com referral because no
nameserver for example.com returned a usable response.
1 Root, NOERROR
2 .com, NOERROR
Earlier attempts
ns1.example.com  9.9.9.9  timeout
[Check the nameserver delegation]

REQUEST FAILURE
Domain or hostname *
[www.example.com                  ]
Record type  ( A ) (AAAA) ...
[          Trace DNS             ]
The DNS trace took too long and was stopped safely.

EXPANDED REFERRAL
Nameservers in the referral
a.gtld-servers.net  b.gtld-servers.net
c.gtld-servers.net  d.gtld-servers.net
e.gtld-servers.net  f.gtld-servers.net
[Show fewer nameservers]

EXPANDED RAW EVIDENCE
v Raw response from this step
+----------------------------------+
| {                                |
|   "Answer": [ ... ],             |
|   "data": "long DNSKEY..."      | -> contained scroll
| }                                |
+----------------------------------+
```

## Removed or rejected

- Remove the duplicate domain result heading, completion sentence, and outcome pill. The one lead sentence owns the conclusion, while the path supplies evidence.
- Move total step count, total duration, and checked time out of the lead. They are metadata and must not compete with where the trace finished or stopped.
- Replace prose such as `We asked server at address for type on name` with labeled step facts. The step message already provides the natural-language interpretation.
- Do not keep a previous trace visible while another submitted name or type is loading. Stale DNS steps can be mistaken for the current query.
- Do not call the numbered DNS path a timeline or use `ToolTimeline`. The connector shows dependency and order, not elapsed time.
- Do not add a progress bar or estimated remaining hop count. Referral and alias depth is unknown until the trace completes.
- Do not add a second root-to-answer diagram inside the workbench. The returned path already shows the real sequence. Existing supporting Markdown remains outside the interface and is not rewritten by this retrofit.
- Do not wrap the form, lead, each step, or evidence groups in separate cards. Use the one full-width workbench band, a single form-to-result divider, and the structural step path.
- Do not merge glue with other Additional-section nameserver addresses. Their labels describe different DNS evidence.
- Do not repeat `finalRecords` after the final step. The source step's answer table owns those records and TTLs.
- Do not show every referral value at first. Keep the first four visible and provide one inline reveal action for the complete list.
- Do not leave raw responses open by default or combine all raw responses into one detached dump. Each response belongs to its source step.
- Do not claim that clipboard copy succeeded until it does. Keep the visible trace selectable after a copy failure.
- Do not expose resolver choice, DNSSEC flags, `All`, `ANY`, internal query limits, or supporting nameserver-address lookups as controls or result regions.
- Do not change the route's public header, introduction, supporting Markdown, engine behavior, API shape, or query-parameter contract during this interface retrofit.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every returned trace shows exactly one dominant outcome sentence that names the authoritative answer, alias destination, negative answer, missing record, or precise stopping stage and reason. | Browser role inspection and screenshots for found, alias, no-answer, NXDOMAIN, and stopped fixtures. |
| UI-002 | deduplication | The normalized domain, completion outcome, and final answer records do not appear in a second result heading, completion paragraph, pill, or duplicate final-record table. | Browser text counts and DOM inspection across success and stopped fixtures. |
| UI-003 | visual-truth | Trace steps render as one semantic ordered path with sequence numbers. No time-axis timeline, progress bar, estimated remaining hops, or second root-to-answer diagram appears in the workbench. | DOM inspection and static source assertion. |
| UI-004 | interaction | Blank submission focuses the name field and announces `Enter a domain or hostname.` once. A request failure preserves both inputs and exposes one retry action. | Keyboard-only Browser pass and accessible role assertions. |
| UI-005 | input | A and every other supported record type remain visible as one radio group. A is selected on the clean route, and changing the type changes the submitted request. | Browser radio-group inspection and intercepted request assertions for A, MX, TXT, and DNSKEY. |
| UI-006 | state | First and later loading states announce progress, block duplicate submission, and hide any prior trace until the current request returns. | Delayed-response Browser fixture with two names and two record types. |
| UI-007 | evidence | Each step shows its actual question, server when available, response facts, and conditional referrals, records, attempts, and raw response without calling unrelated included addresses glue. | Browser assertions over complete, glue-free, alternate-attempt, alias, and stopped fixtures. |
| UI-008 | expansion | Referral lists show at most four values initially, reveal the complete list through one counted `aria-expanded` action, and collapse without moving focus. | Keyboard Browser test with a 13-nameserver fixture. |
| UI-009 | copy | One `Copy trace` action appears after a result, reports success only after a verified clipboard or fallback copy, and reports failure without clearing the selectable result. | Browser clipboard success and denied-permission fixtures. |
| UI-010 | responsive | At 320px wide, controls and results keep the contracted order, the page has no horizontal overflow, and record tables and raw JSON contain their own overflow. | Browser measurement with a 253-character name, IPv6, TXT, DNSKEY, and long error fixtures. |
| UI-011 | accessibility | The name field, radio group, primary action, referral toggles, copy action, raw disclosures, and stopped-trace link work by keyboard with visible focus in dark and light themes. | Keyboard pass and theme screenshots at desktop and mobile widths. |
| UI-012 | url | Opening `/dns-trace` leaves the clean URL unchanged through hydration. Explicit `name` and supported `type` parameters prefill without automatic submission, and later edits do not serialize defaults or derived state. | Browser URL and history assertions for clean and explicit query-string routes. |
| UI-013 | recovery | An `error` trace keeps every returned prefix step, states the decisive stop reason once, and offers one prefilled nameserver-checker link. Valid no-answer and NXDOMAIN results do not show that link. | Browser fixtures for delegation stop, root failure, no-answer, and NXDOMAIN. |

## Open questions and blockers

- None. The brief, existing engine, API types, route behavior, and fixtures settle the inputs, one lead outcome, path evidence, recovery action, URL behavior, and omissions needed for implementation.

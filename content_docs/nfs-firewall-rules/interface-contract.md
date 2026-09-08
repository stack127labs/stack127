# Interface contract: NFS Firewall Rules Planner

Status: ready
Tool: NFS Firewall Rules Planner
Route: `/nfs-firewall-rules`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:fb8dbc3675becd4405a6dbf09948e5ca8051320639f87764a93c6ceb7726e7bb`

## User task

- Primary user: A Linux administrator planning inbound host-firewall rules for one NFS server or client.
- Question: Which listener rules belong on this protected host, and is the plan complete enough to translate into the selected firewall syntax?
- Lead answer: A ready, incomplete, or no-additional-rule sentence for the protected host.
- Next decision: Verify missing local ports, review and apply a complete translation, or test the no-additional-rule branch on the real hosts.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| NFS version | Which protocol branch applies? | User choice | input | NFSv3, NFSv4.0, and NFSv4.1 or later have different listener dependencies. | Keep the three choices visible and do not restate protocol history inside the workbench. |
| Protected host | Which machine's inbound firewall am I changing? | User choice | input | Server and client plans have different listeners and peer meanings. | Use the selected host in the lead and table; do not add a separate result badge. |
| Firewall family | Which syntax should translate a complete neutral plan? | User choice | input | firewalld, UFW, and nftables require different bounded output. | Show one translation only. Do not place three syntax tabs in results. |
| Address family and peer CIDR | Which remote source may initiate the modeled connection? | User choice and validated CIDR | input | Every generated rule is scoped to this IPv4 or IPv6 network. | Explain the peer once beside the input; table rows repeat it only because each row must stand alone. |
| Branch-specific ports | Which local dynamic listeners have been verified? | User-entered ports | input | NFSv3 helpers and NFSv4.0 callbacks cannot use guessed defaults. | Never prefill these ports or repeat their input hints in the result. |
| Firewalld zone | Is there enough deployment context to write firewalld commands? | User-entered identifier | input | The neutral listener plan can be ready while firewalld translation remains unavailable. | Show the missing-zone recovery once where translation would appear; never assume `public`. |
| Plan answer | Is a complete listener plan available for this host? | Result status and answer | lead | The administrator needs ready, incomplete, or no-new-listener status before syntax. | Render only the engine answer. Remove `Listener plan`, `Incomplete plan`, and `NFSv4.1+ client` labels above it. |
| Source warning | Does this CIDR permit every address in its family? | Prefix-zero warning | supporting | A `/0` is valid but materially broadens the rule. | Show one warning below the lead and do not repeat it in every table row or command note. |
| Protocol boundary | What related traffic is outside this host branch? | Result boundaries | supporting | NFSv4.0 server planning must point out that client callbacks are separate. | Show each boundary once as plain text before listener evidence. |
| Missing facts | Which verified ports still block completion? | Incomplete result fields | supporting | This is the recovery list for an incomplete plan. | Do not emit placeholder listener rows, commands, or Copy plan. |
| Listener rows | What exact inbound listeners make up the neutral plan? | Sorted result rows | evidence | Endpoint, direction, peer, protocol, port, source, and reason need row-level review. | Use one row per listener. Do not duplicate rows in a separate port list. |
| Firewall translation | How does the complete listener plan map to the selected firewall? | Translation label, commands, and note | supporting | Syntax is useful only after neutral facts are complete and required context exists. | Show one code block after the table. Do not copy commands into the verification list. |
| Verification | How should I check listeners, firewall state, mount behavior, and negotiated version? | Ordered result steps | evidence | The output must not imply that generated text proves reachability. | Show one ordered list and include it once in copied output. |
| Formula identity | Which planning contract generated this output? | Formula version and source date | evidence | The service branches and syntax are version-bounded. | Show one quiet metadata line after verification. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | NFS version | defaulted input | yes | NFSv4.1+, from the current planner | visible | `ToolChoiceGroup` | It selects v3 helper, v4.0 callback, or v4.1 backchannel behavior. | Full-width group with three wrapping options. |
| 2 | Protected host | defaulted input | yes | NFS server, from the current planner | visible | `ToolChoiceGroup` | It changes listener ownership and the meaning of peer CIDR. | Full-width two-option group. |
| 3 | Firewall | defaulted input | no, it changes translation and verification only | firewalld, from the current planner | visible | `ToolChoiceGroup` | Administrators need output for the firewall they will review. | Full-width group with three wrapping options. |
| 4 | Address family | defaulted input | yes | IPv4, from the current planner | visible | `ToolChoiceGroup` | It changes CIDR validation, command selectors, and warnings. | Full-width two-option group. |
| 5 | Allowed client or server CIDR | defaulted input | yes | `192.0.2.0/24`; switch to `2001:db8::/64` only when the old value is still untouched | visible | `ToolTextField` with spellcheck off | The peer source scopes every proposed inbound rule. | Full-width field after the four choice groups. |
| 6 | Active firewalld zone | conditional optional context | no, it determines whether translation is ready | Empty; no zone is assumed | conditional when firewalld is selected | `ToolTextField` with spellcheck off | A zone is required for commands but not for the neutral listener plan. | Full-width below peer CIDR. |
| 7 | NFSv3 transport | conditional defaulted input | yes | TCP only, from the current planner | conditional when NFSv3 is selected | `ToolChoiceGroup` | Explicit legacy UDP adds protocol-specific rows and a separate lockd UDP port. | Full-width two-option group before verified ports. |
| 8 | mountd port | conditional required input | yes | User verified; empty | conditional for NFSv3 server | `ToolTextField` with numeric input mode | The port is locally assigned and cannot be guessed. | Full-width within the verified-port group. |
| 9 | statd port | conditional required input | yes | User verified; empty | conditional for every NFSv3 branch | `ToolTextField` with numeric input mode | The protected host listens on a local statd port. | Full-width within the verified-port group. |
| 10 | lockd TCP port | conditional required input | yes | User verified; empty | conditional for every NFSv3 branch | `ToolTextField` with numeric input mode | Every NFSv3 plan needs the verified TCP listener. | Full-width within the verified-port group. |
| 11 | lockd UDP port | conditional required input | yes | User verified; empty | conditional for NFSv3 with legacy UDP | `ToolTextField` with numeric input mode | UDP lockd may use a different local port. | Full-width directly after lockd TCP. |
| 12 | Include remote quota listener | conditional optional input | yes when selected | Off, from the current planner | conditional for NFSv3 server | `ToolCheckbox` | rquotad belongs only in a plan where the administrator knows it is needed. | Full-width after required helper ports. |
| 13 | rquotad port | conditional required input | yes | User verified; empty | conditional when remote quota is selected | `ToolTextField` with numeric input mode | The planner must not infer this local port. | Full-width directly below the checkbox. |
| 14 | NFSv4.0 callback TCP port | conditional required input | yes | User verified; empty | conditional for NFSv4.0 client | `ToolTextField` with numeric input mode | This branch needs the configured client callback listener. | Full-width in the verified-port group. |
| 15 | Reset | secondary action | yes, because it restores defaults and clears conditional values | Current planner defaults | visible in final action row | `ToolButton` secondary with reset icon | It gives a complete recovery path after branch changes. | Full-width before the primary action. |
| 16 | Plan firewall rules | primary action | not applicable | No default | visible at the end of the form | `ToolButton` primary in `ToolActionRow` | Explicit submission avoids plausible output while verified facts are still being typed. | Full-width final action. |
| 17 | Copy plan | conditional secondary action | no | Complete ready result with ready translation | result beside the lead on wide screens | `ToolCopyAction` secondary | It exports the answer, neutral table, translation, verification, and formula metadata only when complete. | Full-width after the lead. |

`Plan firewall rules` is the only accent-filled action. Enter submits once from text fields. Every branch change clears obsolete hidden ports, just as the current planner does. Every edit clears the entire previous result and copy status before another submission.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Plan answer | Is this listener plan ready, incomplete, or unnecessary for the selected client branch? | Exact engine answer | One focusable `ToolResultLead` sentence at the top of results | Remove status eyebrows and any second sentence that paraphrases the same state. |
| 2 | Scope warning and boundary | What broad source or branch limit changes how I should interpret the answer? | `/0` warnings and protocol boundaries | `ToolStatus` for warnings; plain sentence list for boundaries directly below the lead | Do not put neutral boundaries in bordered callouts or repeat them after the table. |
| 3 | Missing facts | Which local ports still block a complete plan? | Ordered missing field list | Compact recovery list in incomplete state, with labels that match the visible inputs | Do not show translation, Copy plan, verification, or placeholder rows while required ports are absent. |
| 4 | Listener plan | Which exact inbound listeners belong on the protected host? | Sorted service rows | One responsive semantic table with service reason below service name | Omit for no-additional-rule; show only protocol-fixed known rows in incomplete state. |
| 5 | Firewall translation | What syntax represents the complete neutral plan for this firewall? | Translation label, commands, and note | `ToolCodeOutput` followed by one plain boundary note; when firewalld zone is missing, replace code with a focused recovery status | Never show partial commands. nftables output stays expression-only. |
| 6 | Verification | What should I test on the real hosts, and in what order? | Ordered verification steps | One visible numbered list after translation, or directly after the lead for no-additional-rule | Do not use a timeline because the steps have order but no time scale. |
| 7 | Provenance | Which formula and source date produced this result? | Formula version and source date | One subdued monospace metadata line at the end | Do not repeat it in the lead, table, and translation header. |

The neutral listener table always comes before firewall syntax. This keeps protocol facts reviewable even when firewalld lacks a zone. Results remain part of the same workbench and use a single neutral divider rather than a floating card.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Listener table | Repeated service, endpoint, direction, peer, protocol, port, port source, and reason | Yes. Rows represent listeners and columns align the same facts across services. | Use with sorted engine order; reflow each row into a labelled record on narrow screens. |
| Firewall code block | Exact ordered command or expression lines | Not applicable. The value is literal text and spacing aids review rather than encoding a quantity. | Use `ToolCodeOutput` with an internal viewport and no syntax decoration beyond monospace. |
| Verification ordered list | A safe review sequence after planning | Yes. List position communicates action order, but not duration. | Use a numbered list. Reject a timeline because there is no time axis. |
| Port allocation chart | Relative size or distribution of port numbers | No. Port numbers are identifiers, not magnitudes to compare. | Omit charts, bars, and port-position diagrams. |
| Completion meter | Progress toward a deployable firewall | No. Missing context and real-host checks have no honest numeric denominator. | Omit scores, percentages, and progress bars. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | NFSv4.1+, server, firewalld, IPv4, example CIDR, empty zone; only relevant fields visible | Absent | Absent | No result placeholder | Natural document focus and no announcement. Clean canonical URL stays unchanged. |
| Ready with translation | Inputs remain visible | `Allow n listener rule(s) on the NFS <host>.` | Warnings, boundaries, full table, code output, verification, provenance, Copy plan | Edit and recalculate or reset | Focus result section and announce the lead once. |
| Ready without firewalld zone | Complete neutral inputs and table remain valid | Ready listener answer | Full table; translation region says the active zone is required; verification still appears; no Copy plan | Enter a zone and recalculate | Focus Active firewalld zone and politely announce that the neutral plan is ready but commands are unavailable. |
| Incomplete NFSv3 or v4.0 client | Missing port inputs remain visible | Exact incomplete answer | Valid warnings, fixed known rows when any exist, and missing-facts list | No translation, verification, provenance copy, or Copy plan | Focus the first missing port and announce the incomplete answer once. |
| No additional rule | Inputs remain visible | Exact no-new-listener answer | Valid warnings, verification, and provenance; no table, translation, or copy action | Edit branch or reset | Focus result section and announce the answer once. |
| Invalid CIDR or zone | Inputs remain; stale result is absent | Absent | Absent | Exact errors stay beside each invalid field; no generic result panel | Focus the first invalid field and announce one error summary assertively. |
| Invalid port or collision | All branch fields remain; stale result is absent | Absent | Absent | Each involved port gets the exact range or collision error | Focus the first invalid port. Collision announcement names both services, protocol, and port. |
| `/0` warning | Valid input remains | Normal branch answer | One warning says every IPv4 or IPv6 source is allowed | User may narrow CIDR and recalculate; warning does not block translation | Result focus stays on the lead; warning has status semantics but no second live announcement. |
| Loading | Inputs remain unchanged | Not applicable | Not applicable | The local engine is synchronous; no spinner, skeleton, disabled wait state, or progress message | No loading announcement. |
| Runtime failure | Inputs remain and stale output is removed | Absent | One failure status and Try again action | `The planner could not finish. Your inputs are still here.` | Focus failure region and announce once. |
| Copy success or failure | Ready result remains unchanged | Unchanged | Copy action reads `Plan copied` or `Copy failed` temporarily | Retry without recalculation | Focus stays on the copy button; `ToolCopyAction` announces its changed label. |
| Reset | All defaults return and conditional ports clear | Absent | Absent | No error remains | Focus the first NFS version choice and announce `Planner reset` once. |
| Reload or history navigation | Form returns to clean defaults | Absent | Absent | No restoration or serialization exists | Browser default focus; no state is read from URL or storage. |

There is no expanded result state. Translation and verification are part of the review task and remain visible whenever applicable. Hiding either behind a disclosure would make a ready answer look more complete than it is.

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Version, host, firewall, family, and transport choices | `ToolChoiceGroup` | Each is a small mutually exclusive set whose options should remain visible. | Selects hide the branch model and make dependent fields harder to predict. |
| CIDR, zone, and verified ports | `ToolTextField` with field-specific input mode and spellcheck | Exact strings must reach the parser so invalid syntax and leading zeroes can be diagnosed. | `ToolNumberField` turns port text into a number too early and cannot exercise rejected decimal forms. |
| Optional remote quota | `ToolCheckbox` | It is one independent boolean that reveals one required port. | A switch implies immediate system state; another radio group adds needless weight. |
| Submit and reset | `ToolActionRow` and `ToolButton` | They preserve one primary action, shared target size, and narrow wrapping. | Page-owned buttons duplicate shared states and focus styling. |
| Plan answer and result notices | Focusable result section with `ToolResultLead` and `ToolStatus` | The lead stays first while warnings and missing-context recovery remain subordinate. | Decorative eyebrow labels repeat states already present in the answer. |
| Listener evidence | Page-owned responsive semantic table using shared tokens | Seven repeated fields need comparison and narrow rows must stack instead of retaining a desktop minimum width. | `ToolDataTable` currently owns horizontal scrolling and cannot add the service reason treatment cleanly. |
| Firewall syntax | `ToolCodeOutput` | It gives exact monospace output an accessible label and an internal overflow owner. | A textarea suggests the tool will edit or apply commands; a general result card hides code semantics. |
| Complete-plan copy | `ToolCopyAction` | It provides clipboard fallback and visible success or failure without separate local state. | A custom clipboard button repeats shared behavior and tells users to select only commands even though the copied plan includes more. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, above 760px | Four choice groups in a two-column grid, peer and zone fields, conditional branch fields, Reset then primary action, lead, table, translation, verification, provenance | A 12-row NFSv3 TCP plus UDP plan and a full firewalld rich-rule command | Listener table wrapper and code viewport may scroll internally. The page never owns horizontal overflow. |
| Tablet, 391px to 760px | Choice groups, fields, and verified ports use one column; result order stays unchanged; listener rows become labelled records | An IPv6 CIDR and six-port nftables set | Code viewport owns command overflow; listener values wrap without horizontal table scroll. |
| Narrow mobile, 320px to 390px | Each choice and action is full width; conditional inputs appear directly after the choice that reveals them; each listener record reads Service, Protected host, Direction, Peer source, Protocol, Port, Port source | `nfs4_callback`, `2001:db8::192.0.2.1/128`, and a 256-character rejected field value | Text inputs and code viewport own internal overflow. Result records wrap inside the viewport. |
| 200% zoom or long translated labels | Controls and result sections grow vertically while DOM order remains fixed | Firewalld missing-context note and access-denied verification step | Workbench height grows. No clipping or document-level horizontal scroll. |

## Interface wireframes

### Desktop result

```text
NFS Firewall Rules Planner

NFS version                 Protected host
[NFSv3] [NFSv4.0] [NFSv4.1+]   [NFS server] [NFS client]
Firewall                    Address family
[firewalld] [UFW] [nftables]   [IPv4] [IPv6]

Allowed client CIDR                  Active firewalld zone
[192.0.2.0/24____________________]   [home__________________________]
                                                   [Reset] [Plan firewall rules]
--------------------------------------------------------------------------------
Allow 1 listener rule on the NFS server.                       [Copy plan]

Service  Protected host  Direction  Peer source       Protocol  Port  Port source
nfs      NFS server      inbound    192.0.2.0/24     TCP       2049  Protocol fixed
         NFSv4.1 and later use the registered NFS listener.

firewalld review commands
+------------------------------------------------------------------------------+
| firewall-cmd --permanent --zone=home --add-rich-rule='rule family="ipv4" ... |
+------------------------------------------------------------------------------+
Review the zone binding and existing rules before applying these permanent rules.

Verify on the real hosts
1. Confirm the modeled listeners with ss -lntup.
2. Inspect the active firewall with firewall-cmd --zone=home --list-all.
3. Test a version-pinned mount.
4. Confirm the negotiated options with findmnt.
5. Treat access denied as an export or permission problem.

nfs-firewall-plan-v1 | sources checked 2026-08-09
```

### Narrow mobile result

```text
NFS Firewall Rules Planner

NFS version
[NFSv3                     ]
[NFSv4.0                   ]
[NFSv4.1+                  ]
Protected host
[NFS server                ]
[NFS client                ]
Firewall
[firewalld                 ]
[UFW                       ]
[nftables                  ]
Address family
[IPv4                      ]
[IPv6                      ]
Allowed client CIDR
[192.0.2.0/24              ]
Active firewalld zone
[home                      ]
[Reset                     ]
[Plan firewall rules       ]
------------------------------
Allow 1 listener rule on the
NFS server.
[Copy plan                 ]

Service
nfs
Protected host
NFS server
Direction
inbound
Peer source
192.0.2.0/24
Protocol
TCP
Port
2049
Port source
Protocol fixed

firewalld review commands
[internally scrolling code]

Verify on the real hosts
1. ss -lntup
2. inspect firewall
3. test mount
4. findmnt
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

Initial state uses the NFSv4.1+ server defaults and renders no result placeholder. Invalid input leaves no result region:

```text
Allowed client CIDR
[192.0.2.999/24            ]
Enter a valid IPv4 CIDR.

Active firewalld zone
[home;id                   ]
Use 1 to 32 ASCII letters, digits, underscores, or hyphens.
[Reset] [Plan firewall rules]
```

An incomplete branch shows known facts and recovery, not placeholder commands:

```text
The NFSv3 plan is incomplete until mountd, statd, lockd TCP ports are verified.

Service   Protocol   Port   Port source
rpcbind   TCP        111    Protocol fixed
nfs       TCP        2049   Protocol fixed

Missing facts
- mountd port
- statd port
- lockd TCP port

No firewall translation or Copy plan action.
```

A ready neutral plan with missing firewalld context is the partial state:

```text
Allow 1 listener rule on the NFS server.
[complete listener table]

firewalld review commands
Enter the active firewalld zone to create review commands.

[verification steps]
No Copy plan action.
```

The empty-row branch is a real no-additional-rule answer:

```text
No new inbound callback listener is needed on this NFS client for v4.1 or later.
NFSv4.1 callbacks use the client-established session connection on a stateful host firewall.

Verify on the real client
1. Confirm there is no unexpected listener with ss -lntup.
2. Inspect the active firewall.
3. Test a v4.1 mount.
4. Confirm the mount with findmnt.
```

Loading and expanded result states do not apply. A runtime failure says `The planner could not finish. Your inputs are still here.` and offers Try again. It shows no listener rows, command text, or verification from an older plan.

## Removed or rejected

- Remove the `Listener plan`, `Incomplete plan`, and `NFSv4.1+ client` labels above result answers. The answer sentence already names the state and host.
- Remove the generic invalid result panel. Associated field errors and one error summary provide recovery without creating a fake result.
- Replace bordered boundary callouts with plain sentences beneath the lead.
- Replace the custom clipboard implementation with `ToolCopyAction`. A failed copy should invite retry, not tell the user to select only commands when the exported value is the whole plan.
- Do not show commands, verification, provenance copy, or Copy plan in incomplete states. Known fixed rows and missing facts are enough.
- Do not invent missing port rows, assume a firewalld zone, emit a complete nftables ruleset, or label a generated fragment applied or secure.
- Do not add a port chart, completeness score, progress bar, topology diagram, marker art, screenshot, saved plans, share URL, live scan, or automatic apply action.
- Do not hide the translation or verification behind disclosures. A ready plan needs both in its main reading path.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every non-invalid submission puts exactly one focusable engine answer first, with no status label that restates ready, incomplete, or client branch state. | Browser focus and duplicate-text assertions. |
| UI-002 | deduplication | Each listener appears once, each boundary or warning appears once, and incomplete states contain no command, verification, provenance copy, or placeholder listener row. | DOM counts against engine fixtures. |
| UI-003 | visual-truth | The listener table preserves engine order and exact fields; verification uses an ordered list; no port chart, score, timeline, or progress visual appears. | DOM inspection and fixture comparison. |
| UI-004 | responsive | At 320px, 375px, 760px, desktop, and 200% zoom, inputs retain their order, listener rows reflow into labelled records, and the page has no horizontal overflow. | Browser measurements and screenshots in both themes. |
| UI-005 | url | Opening `/nfs-firewall-rules` leaves the clean canonical URL unchanged through hydration; defaults, derived rows, and results never enter the URL or browser storage. | Browser URL, history, and storage assertions. |
| UI-006 | inputs | Required and defaulted version, host, firewall, family, peer, transport, and branch-port controls remain visible whenever applicable; switching branch clears obsolete hidden ports. | Accessible control assertions across every branch. |
| UI-007 | action | `Plan firewall rules` is the only accent action; Enter submits once; Reset, Copy plan, and Try again remain secondary. | Keyboard and computed-style Browser tests. |
| UI-008 | incomplete | Missing NFSv3 or NFSv4.0 client ports focus the first missing field, preserve known fixed rows, list every missing fact, and expose no translation or copy action. | Browser focus and absence assertions. |
| UI-009 | partial | A complete neutral firewalld plan without a zone keeps its lead and listener table, focuses the zone, replaces code with one recovery status, and withholds Copy plan. | Engine fixture and Browser result assertions. |
| UI-010 | no-rule | The NFSv4.1+ client branch shows its no-new-listener lead and verification with no empty table, translation, or success badge. | Browser branch assertion. |
| UI-011 | warning | A valid `/0` source produces one visible every-address warning without blocking the correct plan or translation. | IPv4 and IPv6 Browser fixtures. |
| UI-012 | invalid | CIDR, zone, port, and collision errors clear stale output, associate with all affected controls, and focus the first invalid field. | Browser accessibility and stale-state regression. |
| UI-013 | commands | firewalld, UFW, and nftables code matches the engine exactly, stays plain text in an internally scrolling code viewport, and includes the selected source scope. | Unit fixture and Browser code text assertion. |
| UI-014 | copy | Copy plan appears only with a complete ready translation and preserves the result on success or failure while its accessible label reports the outcome. | Clipboard success and rejection Browser tests. |
| UI-015 | verification | Every ready and no-additional-rule result shows the complete engine-provided order; no step is presented as proof that a rule was applied or worked. | DOM ordered-list comparison. |
| UI-016 | accessibility | Groups, labels, errors, lead focus, live announcements, table headers, 44px targets, and visible focus work by keyboard and do not rely on color. | Accessibility tree, keyboard test, and manual screen-reader check. |
| UI-017 | components | Choice, field, checkbox, action, lead, status, code, and copy behavior use the shared tool controls without changing parser inputs. | Source inspection, shared component tests, and engine parity tests. |
| UI-018 | failure | An unexpected exception preserves inputs, clears stale plan data, focuses a concise failure region, and offers one retry without a loading state. | Injected-failure Browser test. |

## Open questions and blockers

- None. The current engine and tests define every protocol branch, conditional input, result state, command boundary, and copy condition needed for this retrofit. The interface changes presentation only; it does not change planning logic or public content.

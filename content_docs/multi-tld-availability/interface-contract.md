# Interface contract: Multi-TLD Availability

Status: ready
Tool: Multi-TLD Availability
Route: `/multi-tld-availability`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:de115245c5a1a2f1e16cb915a82a2204c618d276ba3fc7163ba2ea402970ffb3`

## User task

- Primary user: Someone who has chosen one name and wants to compare it across a small, reviewed set of domain endings without prices or sales links.
- Question: Which selected endings have no current registry record for this name, which are registered, and which remain unanswered?
- Lead answer: The number of selected domains with no registry record, out of the number checked, followed by counts for registered, cannot check, and check failed outcomes.
- Next decision: The person can choose an ending to price elsewhere, inspect a registered domain, remove an ending with no RDAP coverage, or retry one failed check.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Name without an ending | Which label should stack127 combine with the selected endings? | User input normalized by `normalizeBareName` | input | One bare label produces every checked domain. | Do not add a full-domain input or repeat the entered name above the result table. |
| TLD selection | Which reviewed endings should stack127 check? | `DEFAULT_TLDS`, the reviewed optional set, and user choices | input | Every selection creates one registry check and changes the answer. | Keep one checkbox per ending. Do not add free text, `Check all`, or a second picker. |
| Selection cap and count | How many endings may I check, and have I reached the cap? | `MAX_TLDS` and selected count | input | The twelve-ending cap changes which choices can be submitted and explains disabled unchecked choices at the limit. | Show the count beside the fieldset legend. Do not repeat the cap below the button or in results. |
| Known RDAP coverage gap | Can stack127 check this ending before I spend a request on it? | `rdapServiceForTld` for each reviewed choice | input | `.co` and `.me` are deliberately selectable, but their no-service state must be visible before submission. | Mark the affected choices once. Do not add a coverage badge to every checkable ending. |
| Check action | When should stack127 start the bounded registry work? | User submission | input | The remote checks need one deliberate start and one batch loading state. | Do not auto-run while typing or add another primary action. |
| Set summary | How many selected domains have no registry record, and how many results are conclusive? | Counts derived from settled `rows` by state | lead | The person needs one scan-level answer before reading individual rows. | Render one final summary. Do not repeat the same counts in cards, a chart, or table footer. |
| Unicode domain | Which readable domain did stack127 check? | `unicode` plus each row TLD | supporting | People should recognize an internationalized name in the table. | Show it once in the domain cell. |
| ASCII domain | What exact DNS form did stack127 query for an internationalized name? | `row.domain` | evidence | Punycode verifies normalization when it differs from the Unicode form. | Show it beneath the Unicode domain only when the visible strings differ. |
| Per-row state | What happened for this exact ending? | `row.state` | supporting | The four states drive the next decision and must remain independent. | Show one state label per row. Never repeat it in a pill plus a sentence. |
| Per-row detail | Why could this ending not be checked, or why did its request fail? | `row.detail` mapped to concise interface copy | supporting | Coverage gaps and transient failures need different explanations and recovery. | Render detail only for `cannot_check` and `check_failed`. Do not repeat `Already registered` or `No registration in this registry`. |
| Registrar | Who sponsors this registered domain? | `row.registrar` | supporting | It helps identify the current registration and supports the lookup next step. | Show only in the registered row when present. Do not create a registrar column with mostly empty cells. |
| Registry expiry | When does the current registry term end? | `row.expiryDate` | supporting | It is useful context for a registered result without predicting release or availability. | Show only in the registered row when present. Do not add a timeline or repeat it in another section. |
| Registration lookup link | Where can I inspect a registered result in full? | Registered `row.domain` | supporting | The broad registration lookup is the right next tool for a taken name. | One ordinary link inside each registered result cell. No registrar sales link. |
| Row retry | How can I rerun only the failed ending? | `check_failed` row and the submitted bare name | input | A transient registry failure should not rerun settled endings or spend their rate-limit budget again. | One secondary action only on failed rows. Do not show retry on registered, no-registration, or no-service rows. |
| Registry source | Which RDAP service supplied or attempted this row? | Host derived from `rdapServiceForTld(row.tld)` at request time | evidence | The brief requires every checked row to identify its source, and the host is enough for verification. | Show the host once in the source cell. Do not expose the full bootstrap URL or operator metadata. |
| Row fetch time | How fresh is this row? | `row.fetchedAt` | evidence | Different rows may come from different cache entries and settle at different times. | Show one timestamp per answered row. Do not substitute or repeat global `checkedAt`. |
| Cache state | Did stack127 reuse a prior registry response? | `row.fromCache` | evidence | It changes how the reader should judge a no-registration result. | Append `from cache` to the row fetch time. Do not add a separate cache column or badge. |
| Progressive settled count | How much of this batch has returned? | Number of settled rows over selected rows | supporting | Rows must appear and settle without waiting for the slowest registry. | Announce one text status. Do not duplicate it with a progress bar or percentage. |
| Purchase caveat | Does no registry record guarantee that I can buy the name? | Product rule from the brief | supporting | Reserved names, blocklists, and premium pricing are invisible and directly affect the next decision. | Show one sentence after the summary when at least one row has no registration record. Do not repeat it inside every row. |
| `checkedCount` and `maxTlds` result fields | Did the server process every selection, and what is the cap? | `MultiTldResult` | omit | Row count and the visible input cap already answer both questions. | Assert row completeness in tests. Do not render a second count sentence below the table. |
| Global completion time | When did the combined request finish? | `checkedAt` | omit | Per-row fetch times are more accurate because cache age and registry response times differ. | Do not add global metadata that looks like every row was fetched at once. |
| Full JSON report | Can I download the current result object? | Existing `reportJson` output | omit | The compact table already contains the useful result and source evidence. A download adds a second result path without a stated user need. | Remove the download action. Do not replace it with copy buttons. |
| Prices, purchase links, suggestions, scores, and social handles | Where should I buy this name, and what alternatives exist? | Not returned by the engine | omit | The tool is a neutral registry check, not a registrar or name generator. | Do not add affiliate links, price cells, `Buy` actions, alternate names, or an availability score. |
| Raw RDAP bodies and internal throttle state | What exact payload and limiter state produced the row? | Registry client and server internals, not returned by this API | omit | The user needs source, freshness, outcome, and recovery, not diagnostics for the shared service. | Do not add raw disclosures or rate-limit counters. Keep precise failure copy in the row. |

The current reviewed set remains the choice inventory. `.co` and `.me` stay selectable because the current tool deliberately exposes coverage gaps, but each must say `No RDAP service` before submission. The default ten endings remain selected and visible. This contract does not expand the set or permit arbitrary TLD input.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Name without an ending | required | yes | Empty on the clean route; no query-string prefill | visible | `ToolTextField` with text input, URL input mode, no capitalization, no autocomplete, and no spellcheck | It supplies the one label checked across every selected ending. The persistent label is `Name without an ending *`, and the example is `stack127`. | Full width first. Its error stays directly below the field. |
| 2 | Endings | required and defaulted | yes | The ten values in `DEFAULT_TLDS` | visible | Page-owned semantic `fieldset` and legend containing shared `ToolCheckbox` controls | Every checked ending changes the set answer. The legend reads `Endings *` and includes `10 selected, 12 maximum`. | A wrapping grid follows the name. It falls to two columns and then one before labels or coverage notes clip. |
| 3 | Check selected endings | primary action | not applicable | No default; the user submits the form | visible | Primary `ToolButton` submit | It starts the bounded registry work and provides the whole-set retry path after a request-level failure. | Full width below the choices. Keep its width stable while loading. |
| 4 | Retry failed ending | secondary action | yes, for one failed row | Available only from a settled `check_failed` row | result | Secondary `ToolButton` labeled `Retry .tld` | It reruns only the inconclusive row without spending requests on completed rows. | Stays inside the result cell beneath the failure reason. It never creates a separate action column. |
| 5 | Open registration lookup | secondary navigation | no | Available only from a registered row | result | Ordinary text link to `/domain-lookup?name=<ascii domain>` | It continues the task for a taken name without competing with the check. | Wraps beneath registrar and expiry facts in the result cell. |
| 6 | Open TLD directory | secondary navigation | no | Available only from a `cannot_check` row | result | Ordinary text link to `/tld-directory` | It explains the coverage gap without suggesting that another DNS query can prove availability. | Wraps beneath the no-service explanation. |

At twelve selected endings, unchecked choices are disabled and the count changes to `12 selected, 12 maximum. Remove one to choose another.` Removing one re-enables the remaining choices. The tool never silently ignores a thirteenth choice. Submitting with no ending selected shows `Choose at least one ending.` at the fieldset, focuses its first checkbox, and preserves the name.

Enter in the name field submits. Empty, dotted, spaced, or invalid labels use the precise server validation message at the name field. If both fields are invalid, the name error comes first. Editing either result-driving input clears its own error and removes the prior result so a stale answer never sits beside a different name or selection.

Opening `/multi-tld-availability` leaves the address unchanged through server render and hydration. Selection changes, name edits, submissions, partial rows, and final results do not write state into the URL. There is no Share action because registry state changes and the compact result has no durable report requirement.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Set summary | How many selected domains returned no registry record, and did any remain unanswered? | Final counts for all four `row.state` values | One neutral `ToolPrimaryResult` labeled `Set result`. Its value is `6 of 10`, its unit is `without a registry record`, and its detail names only the nonzero registered, cannot-check, and failed counts. | Render only after every row settles. Do not use success-green styling, the words `available` or `free`, a second count row, or a summary chart. |
| 2 | Purchase caveat | What does a no-registration result not prove? | Presence of at least one `not_registered` row | One plain `ToolResultLead` sentence: `No registration record does not rule out a reserved, blocked, or premium-priced name.` | Omit when the set has no no-registration rows. Keep the longer explanation in supporting page content. Never repeat the caveat per row. |
| 3 | Domain results | What happened for each selected ending, what useful facts came back, and what can I do next? | Selected order joined to progressive row state, Unicode and ASCII domain, state, detail, registrar, expiry, and conditional row action | One `ToolDataTable` with columns `Domain`, `Registry result`, and `Source and freshness`. Insert all selected rows in selection order before requests start, label unfinished rows `Checking...`, and update each row in place as it settles. | The table is the only per-domain result. No cards, separate failure list, result pills, or duplicate final table. A no-registration row never says `Available`. |
| 4 | Batch status | How many selected rows have settled while the check is running? | Settled row count and total selected count | One `ToolStatus` above the table, such as `Checked 4 of 10 endings...` | Render only while work remains. Replace it with the set summary after all rows settle. Do not add a progress bar or percentage. |
| 5 | Request-level failure | Why did no usable batch work start, and how do I recover? | Same-origin, validation, rate-limit, network, or server error before any row settles | One danger `ToolStatus` below the primary action. Preserve the inputs and reuse `Check selected endings` as the retry action. | Do not create blank result rows, repeat the error in the table, or show the previous result. Row-specific registry failures belong in their own rows instead. |

Inside the table, the `Domain` cell shows the Unicode domain first and the ASCII form beneath it only when they differ. The `Registry result` cell uses exactly one of `No registration found`, `Registered`, `Cannot check`, `Check failed`, or `Checking...`. Registered rows append present registrar and expiry values plus `Open registration lookup`. Cannot-check rows state `No known RDAP service for .tld` and link to the TLD directory. Failed rows keep the specific timeout, refusal, throttle, or registry-error reason and append `Retry .tld`. No-registration rows contain no duplicate explanation because the state label and one shared caveat already carry the meaning.

The `Source and freshness` cell shows the RDAP host and `Fetched <date and time>` for answered rows, with `from cache` appended when true. A failed row keeps the attempted host but does not invent a fetch time. A no-service row says `No RDAP service` and has no timestamp. The result API must expose the reviewed source host or equivalent source identifier for every checkable row. This is existing bootstrap evidence, not a new data-source choice.

Read without this document, a complete result says: `6 of 10 selected domains have no registry record. Two are registered, one cannot be checked, and one check failed.` The caveat explains why those six are not guaranteed purchases. The table then identifies each domain, keeps unanswered states separate, shows source and freshness, and puts recovery in the affected row.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large set summary | Count of no-registration rows out of a fixed selected total | Yes. The numerator and denominator are exact after all rows settle. | Use one neutral `ToolPrimaryResult`. Its detail surfaces nonzero inconclusive counts without a second visual. |
| Per-domain table | Repeated selected domains with the same result and source fields | Yes. Rows preserve selected order and columns align the same facts for each domain. | Use one `ToolDataTable`. Its viewport owns horizontal overflow. |
| Progress bar | Number of completed registry checks | Yes, the selected total is a real denominator, but geometry would repeat the visible row states and settled count without helping the next decision. | Omit. Use one text status while rows settle. |
| Allocation or donut chart | Proportions of the four final states | Yes, the categories sum to the selected total, but a chart hides the domain names and duplicates the summary and table. | Omit. Keep exact counts in the lead and exact domains in the table. |
| Timeline | Order or duration of registry replies | No. Row order follows the user's selection, and equal spacing would imply timing that the result does not record. | Omit. Update table rows in place instead. |
| Status pills or result cards | Difference among the four row outcomes | No. Boxes and pills add equal visual weight without encoding a quantity or relationship. | Omit. Use explicit state text and semantic warning or danger color only where meaning requires it. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty name, ten visible default selections, enabled primary action | Absent | Result table and batch status absent | No instructional or empty-state panel | Normal document focus. Nothing announces on load. The URL stays `/multi-tld-availability`. |
| Invalid empty name | Preserve selection and blank or whitespace value | Absent | Absent | Show `Enter a name to check.` once below the name field | Focus the name field and associate the error programmatically. |
| Invalid dotted, spaced, or unsupported name | Preserve the exact submitted value and selection | Absent | Clear any prior result | Show the precise normalization message once below the name field | Focus the name field. Do not add a second request error. |
| Invalid empty selection | Preserve the valid name and empty selection | Absent | Absent | Show `Choose at least one ending.` once at the fieldset | Focus the first ending checkbox and announce the group error once. |
| Selection at cap | Keep all twelve selected choices enabled so they can be removed. Disable every unchecked choice. | Absent or cleared if the selection changed | Absent | The count says `Remove one to choose another.` | Do not announce on every toggle. Disabled state and visible count explain the limit. |
| Loading first batch | Keep name and selected endings visible but disabled. Disable duplicate submission and label it `Checking 0 of 10...`. | Absent until every row settles | Insert ten rows in selected order, all labeled `Checking...` | The same primary action becomes whole-set retry if no row starts | Announce the batch start politely. Keep focus on the initiating button. |
| Progressive partial batch | Keep result-driving inputs disabled until the batch completes | Absent while any row remains pending | Update settled rows in place and keep remaining rows `Checking...`. Status says `Checked 4 of 10 endings...` | A settled failed row shows its reason. Its row retry remains disabled until the active batch ends. | Announce settled-count changes politely without moving focus or reordering rows. Do not announce every table cell separately. |
| Complete mixed result | Re-enable inputs and primary action | Show the exact no-registration numerator and selected denominator, with nonzero remaining counts in the detail | Show every row, source, freshness, and conditional next action | Failed rows offer their own retry. Cannot-check rows link to coverage information. | Announce the final set summary once. Supporting rows remain readable without assertive repeated announcements. |
| Complete no-registration-only result | Re-enable inputs and primary action | Show `10 of 10 without a registry record` in neutral styling | Show all ten no-registration rows and the one shared purchase caveat | No sales or price action appears | Announce the final summary once. Never use `All available`, a green fill, or a celebratory state. |
| Complete registered-only result | Re-enable inputs and primary action | Show `0 of 10 without a registry record` and `10 registered` | Each row shows present registrar and expiry facts plus its lookup link | Missing registrar or expiry values are omitted, not labeled with guesses | Announce the final summary once. |
| Cannot-check row | Keep the completed batch usable | Included in the cannot-check count | The row says `Cannot check`, names the no-service reason, and omits fetch time | Link to the TLD directory. No retry appears because the gap is not transient. | The row text is reachable in table order. Final summary announces the count once. |
| Check-failed row | Keep every other settled row unchanged | Included in the failed count | The row says `Check failed`, keeps the specific failure reason and attempted source, and omits missing fetch time | Enable `Retry .tld` after the batch completes | Retry sets only that row back to `Checking...`, announces it politely, and never clears successful sibling rows. |
| Retried row success | Keep name, selection, summary region, and sibling rows in place | Recompute the final summary after the retried row settles | Replace only the retried row state, facts, source, and freshness | Remove the retry action when the row becomes conclusive | Announce the updated set summary once. Focus remains on the retry button or follows the shared button contract. |
| Request-level rate limit, network failure, or server failure | Preserve name and selection and re-enable the primary action | Absent | Clear the prior result and do not insert misleading no-registration rows | Show one specific error below the action. Reuse the primary action for retry. | Announce the error once with alert semantics. Keep focus in the form flow. |
| Empty or malformed response | Preserve inputs and re-enable the primary action | Absent | Do not render an empty success table. Treat missing selected rows as a request failure. | State that the check returned an incomplete response and offer whole-set retry | Announce one failure. Never infer no registration from an absent row. |
| Edited input after a result | Clear the final summary, caveat, table, and row actions as soon as the name or selection changes | Absent | Absent until the next submission | Keep the new input and any local field error only | No announcement is needed for result removal. The next submit follows normal loading behavior. |
| Long Unicode, punycode, registrar, source, or error value | Inputs remain operable and the primary action keeps its place | Summary wraps without clipping | Long table values wrap where safe. The table viewport may scroll horizontally. | Row links and retry actions remain reachable | Focus rings remain visible. No sibling content covers a table column or action. |
| Expanded state | Not applicable. This interface has no disclosures or expandable result regions. | Unchanged | All evidence needed for this task remains visible in the table | No hidden recovery or source evidence exists | No expansion announcement or focus behavior is needed. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One bare name | `ToolTextField` | It keeps the visible required label, native text entry, precise field error, and focus target together. | `ToolSearchField`, because the person submits one label rather than filtering a collection. |
| Fixed multi-select ending set | Page-owned `fieldset` and legend with `ToolCheckbox` controls | Native checkbox semantics permit several choices, while the fieldset gives one label and error scope to the set. | `ToolSelect`, `ToolComboBox`, free-text tags, and a disclosure, because they hide the reviewed choices or permit unsupported values. |
| One batch action | Primary `ToolButton` submit | It starts the bounded remote work, retains busy state, and remains the whole-set retry path. | Auto-run, `Check all`, reset, and another primary button, because each creates waste or competing actions. |
| Batch progress and request errors | `ToolStatus` | It announces one changing batch count or one request-level failure without competing with row results. | A progress bar, spinner-only status, and duplicate alerts in every row. |
| Final set answer | Neutral `ToolPrimaryResult` | It makes the exact numerator and denominator easy to scan without implying that no registration guarantees purchase. | Green availability banner, metric cards, allocation chart, and result pill, because they overstate or duplicate the answer. |
| Purchase limit | `ToolResultLead` | One sentence beside the final summary prevents a costly interpretation error. | Repeating the caveat in every no-registration row or hiding it in supporting prose. |
| Repeated domain results | `ToolDataTable` | Each domain repeats one stable result and source schema, and selected order matters. | Per-domain cards, because they slow comparison and turn four states into a dashboard. |
| Row retry | Secondary `ToolButton` | It is a local recovery action and should not compete with the batch submit. | Primary styling, icon-only retry, and whole-set retry for one row failure. |
| Registered and no-service next steps | Ordinary text links | They continue to a broader lookup or coverage reference without becoming actions inside this check. | Registrar sales links, accent buttons, and a dedicated action column. |
| Source and freshness | Structured text inside the table cell | Each source belongs to one result row, so colocating it prevents false global freshness. | A global metadata strip or separate source table, because both detach evidence from its row. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. The name field comes first, then the ending fieldset, primary action, divider, final summary and caveat or active batch status, and the result table. Checkbox choices wrap in a calm grid. | `this-name-is-deliberately-near-the-sixty-three-character-label-limit.online`, `RESERVED-Internet Assigned Numbers Authority`, and `rdap.identitydigital.services` | No page overflow. The result table viewport owns horizontal overflow only when its three columns cannot fit. |
| Narrow mobile, 320px to 640px | Keep name, ending choices, full-width primary action, summary or status, caveat, then table. Ending choices fall to two columns and then one. The table keeps its columns and scrolls inside its own viewport. | `xn--this-is-a-long-internationalized-label-example-9we.dev`, a long registry error, and `12 selected, 12 maximum. Remove one to choose another.` | The table viewport alone may scroll horizontally. Labels, counts, errors, and controls wrap without widening the page. |
| Active partial batch at any width | Summary space contains one settled-count status. The table remains directly below it, with pending and settled rows in fixed selected order. | Twelve rows mixing `Checking...`, registrar names, failure reasons, and retry placeholders | The table owns any horizontal overflow. Live status text wraps in normal flow. |
| Increased text size or long localization | Put every choice on its own row before its label or no-service note clips. Keep the primary action below the fieldset. Table actions stay within result cells beneath their text. | `We are being rate limited by this registry right now.` at 200 percent text size | Text wraps within its owner. The table viewport scrolls when needed. No focus ring, link, or retry action is covered. |

## Interface wireframes

### Desktop result

```text
Name without an ending *
[stack127                                                               ]

Endings *                                      10 selected, 12 maximum
[x] .com   [x] .net   [x] .org   [x] .dev   [x] .app   [x] .ai
[x] .io    [x] .xyz   [x] .info  [x] .biz   [ ] .co    No RDAP service
[ ] .me    No RDAP service        [ ] .us    [ ] .de    [ ] .uk
[ ] .site  [ ] .online            [ ] .tech

[Check 10 endings]

------------------------------------------------------------------------

Set result
6 of 10  without a registry record
2 registered. 1 cannot be checked. 1 check failed.

No registration record does not rule out a reserved, blocked, or
premium-priced name.

Domain                 Registry result                         Source and freshness
stack127.com            Registered                              rdap.verisign.com
                        Registrar: Example Registrar            Fetched 5 Sep 2026, 19:31 IST
                        Expires: 5 Sep 2027
                        Open registration lookup

stack127.dev            No registration found                   pubapi.registry.google
                                                                 Fetched 5 Sep 2026, 18:50 IST
                                                                 from cache

stack127.co             Cannot check                            No RDAP service
                        No known RDAP service for .co
                        Open TLD directory

stack127.ai             Check failed                            rdap.identitydigital.services
                        This registry did not answer in time.
                        [Retry .ai]
```

During the first check, the final summary and caveat are absent. The same table appears immediately with every selected domain and `Checking...` in each result cell. One status above it changes from `Checked 0 of 10 endings...` as rows settle.

### Narrow mobile result

```text
Name without an ending *
[stack127                         ]

Endings *
10 selected, 12 maximum
[x] .com       [x] .net
[x] .org       [x] .dev
[x] .app       [x] .ai
[x] .io        [x] .xyz
[x] .info      [x] .biz
[ ] .co        No RDAP service
[ ] .me        No RDAP service
[ ] .us        [ ] .de
[ ] .uk        [ ] .site
[ ] .online    [ ] .tech

[       Check 10 endings         ]

----------------------------------

Set result
6 of 10
without a registry record
2 registered. 1 cannot be checked.
1 check failed.

No registration record does not
rule out a reserved, blocked, or
premium-priced name.

Domain results                    -> contained table scroll
Domain | Registry result | Source and freshness
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Name without an ending *
[stack127                         ]  example placeholder
Endings *
10 selected, 12 maximum
[x] .com  [x] .net  ...
[       Check 10 endings         ]

INVALID NAME
Name without an ending *           <- focus
[example.com                      ]
Enter the name only, without an ending. Pick the endings below.

INVALID SELECTION
Endings *                           <- first checkbox receives focus
0 selected, 12 maximum
Choose at least one ending.

AT CAP
Endings *
12 selected, 12 maximum. Remove one to choose another.
Selected choices remain enabled. Unchecked choices are disabled.

LOADING AND PROGRESSIVE PARTIAL
[       Checking 4 of 10...       ]  disabled, busy
Checked 4 of 10 endings...
Domain          Registry result     Source and freshness
stack127.com    Registered          rdap.verisign.com, fetched 19:31
stack127.net    Checking...         Checking...
stack127.org    No registration     rdap.publicinterestregistry.org
stack127.dev    Check failed        pubapi.registry.google
                Timed out. Retry disabled until the batch ends.

COMPLETE MIXED RESULT
6 of 10 without a registry record
2 registered. 1 cannot be checked. 1 check failed.
Every selected ending remains in its original row.

ROW RETRY
stack127.ai     Checking...         rdap.identitydigital.services
Sibling rows and their source times remain unchanged.

REQUEST FAILURE BEFORE ROWS START
That is a lot of checking in a short time. Try again in a few minutes.
[       Check 10 endings          ]  enabled retry
No prior summary or table remains visible.

EMPTY OR MALFORMED RESPONSE
The check returned an incomplete response. Try the selected endings again.
No empty success table and no inferred no-registration result.

EXPANDED
Not applicable. No result or recovery is hidden in a disclosure.
```

## Removed or rejected

- Remove the existing result pill, prose answer block, `Results` heading, and checked-count sentence. The final summary and one table carry those facts once.
- Remove the existing `Download report` action. The brief does not call for a durable report, and the table contains the result evidence needed for this decision.
- Remove `Taken`, `free`, and `available` from result copy. Use `Registered` and `No registration found` so a registry 404 does not promise purchase.
- Remove the repeated `Already registered` and `No registration in this registry` detail sentences. They restate the row state.
- Do not place registrar, expiry, cache state, or retry in separate columns. Keeping them inside the result or source cell avoids a wide table full of blanks.
- Do not show a global checked time. Each row owns its registry host, fetch time, and cache state.
- Do not wait for the slowest registry before showing results. Insert rows in selected order and settle each in place.
- Do not reorder rows by result, completion time, or apparent desirability. Stable selected order lets the person compare the endings they chose.
- Do not add a progress bar, state chart, score, green availability banner, result cards, or one pill per state. They duplicate exact text or overstate the result.
- Do not add `Check all`, a free-text TLD list, bulk names, prices, registrar links, affiliate actions, name suggestions, social-handle checks, or trademark advice.
- Do not hide default selections, the cap, coverage warnings, row failures, retry, or source evidence in a disclosure.
- Do not leave a prior result visible after the name or ending selection changes.
- Do not serialize defaults, selections, input, partial progress, or results into the clean route during hydration or interaction.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | After every selected row settles, exactly one neutral `ToolPrimaryResult` shows the no-registration count over the selected total and names every nonzero registered, cannot-check, and failed count. | Browser tests with all four states and text-count assertions |
| UI-002 | deduplication | Each domain state, registrar, expiry, source host, fetch time, and cache label appears once. There is no result pill, separate answer paragraph, result card, table footer count, or global checked time. | Browser text-count and DOM assertions |
| UI-003 | visual-truth | The result uses one three-column repeated-record table and contains no progress bar, timeline, allocation chart, donut, gauge, score, or per-row card grid. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px and 200 percent text size, the order remains name, endings, primary action, summary or status, caveat, then table. The document has no horizontal overflow, and the table viewport owns any column overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/multi-tld-availability` leaves the URL unchanged through hydration. Edits, selection changes, submissions, partial rows, retries, and final results never rewrite it. | Browser URL, history, and request-count assertions |
| UI-006 | input | Empty, dotted, spaced, invalid Unicode, and overlong names show one precise field error, focus the name field, preserve the selection, and never start a registry request. | Browser keyboard tests and intercepted request counts |
| UI-007 | selection | The ten defaults remain visible and selected. Every reviewed optional ending stays visible, `.co` and `.me` say `No RDAP service`, zero selections receives one fieldset error, and the twelfth selection disables only unchecked choices with a visible recovery sentence. | Browser checkbox semantics, focus, and copy assertions |
| UI-008 | loading | Submission inserts one pending row per selected ending in selected order, disables result-driving inputs and duplicate submission, keeps the button width stable, and announces the settled count. | Browser route interception with staggered responses and live-region assertions |
| UI-009 | progressive results | Each row updates as its own response returns without waiting for the slowest response, moving position, clearing settled sibling rows, or showing the final summary early. | Browser staggered-response test with row-state timestamps |
| UI-010 | row states | Every completed row shows exactly one of `No registration found`, `Registered`, `Cannot check`, or `Check failed`. Neither inconclusive state uses no-registration copy or success styling. | Browser fixtures for all RDAP fetch states |
| UI-011 | registered | A registered row shows each present registrar and expiry value once, omits missing facts, and links its ASCII domain to Domain Registration Lookup without predicting release. | Browser complete and partial registered fixtures |
| UI-012 | no registration | A no-registration row never says `Available`, `Free`, or `Buy`. When at least one such row exists, one shared sentence names reserved, blocked, and premium-priced limits. | Browser no-registration fixtures and forbidden-text assertions |
| UI-013 | recovery | A failed row keeps its specific reason and attempted source and offers one `Retry .tld` action after the batch. Retrying changes only that row and recomputes the final summary when it settles. | Browser timeout, throttle, refusal, error, and row-retry fixtures |
| UI-014 | coverage | A no-service row has no retry or invented fetch time, says `No known RDAP service`, and links to the TLD directory. | Browser no-service fixture and link assertion |
| UI-015 | evidence | Every answered row shows its reviewed RDAP host, fetch time, and cache state when true. Failed rows show the attempted host without a fake time, and no-service rows say `No RDAP service`. | Browser source and freshness fixtures plus API shape test |
| UI-016 | completeness | The final table has exactly one row per submitted ending in submitted order. A missing or duplicate row fails closed as an incomplete response and never becomes no registration. | Browser malformed-response fixtures and row-count assertions |
| UI-017 | request failure | Same-origin, rate-limit, network, and server failures before any row settles clear stale results, preserve inputs, show one specific alert, and leave the same primary action available for retry. | Browser request-failure fixtures and alert-count assertions |
| UI-018 | internationalization | A Unicode domain appears first in each domain cell, and its ASCII form appears once beneath it only when the two visible forms differ. Both wrap without widening the page. | Browser IDN fixtures at desktop and mobile widths |
| UI-019 | accessibility | The name and ending group expose visible required labels, group errors focus the right control, loading and final summaries are announced without one alert per row, every checkbox and retry works by keyboard, and focus rings remain visible in both themes. | Browser keyboard, accessibility-tree, live-region, and theme checks |

## Open questions and blockers

- None. The brief already requires independent row settlement and per-row source and freshness. The current RDAP bootstrap resolves the source host, so exposing it is data plumbing rather than a new source decision. The existing reviewed choice set resolves the earlier `.co` and `.me` question by keeping them selectable with a visible no-service warning.

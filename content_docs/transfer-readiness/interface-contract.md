# Interface contract: Domain Transfer Readiness

Status: ready
Tool: Domain Transfer Readiness
Route: `/transfer-readiness`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: A gTLD owner preparing to move a registered domain to another registrar and checking what public data can reveal before opening the registrar account.
- Question: Does public registry data show a transfer blocker or operational risk, and what must I verify privately before I start?
- Lead answer: One sentence that says the domain is publicly blocked, or that no public blocker was found while account checks remain unresolved.
- Next decision: The owner can clear a self-service lock, wait for a policy lock, contact the registrar about a registry blocker, prepare DNS and DNSSEC, or complete the unseen account checklist.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which registration should stack127 assess? | User input normalized by `lookupDomain` | input | One domain supplies every public status, event, date, DNSSEC, and nameserver fact. | Do not add separate registrar, TLD, policy, or account fields. |
| Check action | When should stack127 query RDAP and apply the current policy? | User submission | input | The remote lookup and dated policy evaluation need one deliberate start. | Do not auto-run while typing or add another primary action. |
| Normalized registrable domain | Which domain did stack127 assess after removing a hostname or URL wrapper? | `registration.query.input`, `domain`, `unicode`, and `reduced` | supporting | A transfer applies to the registrable domain, not a subdomain. | Show one conditional checked-name sentence. Do not repeat the domain as a result header and lead prefix. |
| Registration lookup status | Is there a registered domain and usable RDAP evidence to assess? | `registration.status` | supporting | Not registered, no service, and failed lookup states cannot produce a readiness conclusion. | Use one lead sentence for the applicable state. Never render the findings list for an unusable lookup. |
| TLD policy scope | Does the ICANN Transfer Policy apply to this ending? | `registration.query.tldType` and TLD identity | supporting | ccTLDs use their own transfer rules, so applying the gTLD lock arithmetic would mislead the owner. | Show one scope result. Do not render gTLD policy findings for a country-code or unknown-policy ending. |
| Public readiness conclusion | Does public data show a blocker, and who can act on it? | Registered in-scope result plus ordered `findings` | lead | The owner needs a direct answer before reading evidence. | Render one sentence. Do not add a status pill, score, duplicate domain heading, or second summary. |
| Visible blocker count and ownership | How many public blockers exist, how many can I clear, and how many need waiting or registrar help? | `blocked` findings and their action owner | supporting | Ownership determines the next step and prevents a self-service registrar lock from looking like a registry dispute. | Fold counts into the lead only when blockers exist. Do not add metric cards. |
| Registrar transfer lock | Did the registrar publish `client transfer prohibited`? | Normalized RDAP statuses | supporting | This is the common blocker the owner can usually remove in the registrar account. | One ordered finding with the EPP value as evidence. Do not repeat it in a status-code list. |
| Registry transfer lock | Did the registry publish `server transfer prohibited`? | Normalized RDAP statuses | supporting | This blocker is not self-service and needs registrar explanation. | One ordered finding with explicit registrar recovery. |
| Pending transfer | Is another inter-registrar transfer already running? | `pending transfer` status | supporting | An existing transfer blocks a second one and may require urgent action if unexpected. | Keep it separate from ordinary transfer locks. Do not merge both statuses into one vague lock finding. |
| Redemption or pending delete | Is the domain in a lifecycle state where transfer cannot proceed? | `redemption period` or `pending delete` status | supporting | The owner must restore the domain first, or cannot restore it once pending delete begins. | One lifecycle finding. Do not predict an exact release date. |
| Registration timing | Is the domain inside the policy lock after creation? | `registrationDate`, evaluation time, and active `afterRegistrationDays` | supporting | The public creation date and active rule can establish a blocker. | Show date, elapsed days, rule, and remaining days once. Never print a projected unlock date. |
| Previous transfer timing | Is the domain inside the policy lock after a registrar transfer? | Optional `transferDate`, evaluation time, and active `afterTransferDays` | supporting | A published transfer event can establish a blocker, while absence remains unknown. | Never turn a missing event into zero prior transfers or a clear result. |
| Change-of-registrant lock | Did a recent registrant change create another policy lock? | Not public in RDAP | supporting | The active policy can block a transfer even when every visible finding is clear. | Keep it in the account checklist and policy scope. Do not infer it from `last changed`. |
| Expiry proximity | Is there enough time to finish a transfer before registry expiry? | `registryExpiryDate` and days until expiry | supporting | A near expiry is a planning risk, not a policy blocker. | Show exact date and days once. Do not add a countdown, timeline, or readiness block based only on proximity. |
| DNSSEC state | Could a stale DS record break resolution after the move? | `dnssecSigned` and `dsRecordCount` | supporting | DNSSEC coordination is a real transfer risk and needs a direct next step. | Always show `Risk`, `Clear`, or `Unknown`. Do not omit false or null states. |
| Nameserver state | Which nameservers remain responsible after the registrar changes? | `registration.nameservers` | supporting | A registrar transfer does not move DNS hosting or email. | Show nameserver evidence once in its finding. Do not duplicate the full list elsewhere. |
| Finding state | Is this check blocked, risk, clear, or unknown? | `TransferFinding.state` | supporting | The four explicit states keep unknown evidence separate from a pass. | Use one text state per finding. No colored pills or one card per finding. |
| Finding detail | What does this check mean and what should I do? | `TransferFinding.detail` refined by finding ID and action owner | supporting | A state without recovery does not help the owner prepare. | Keep one action sentence per finding. Do not restate the title or state. |
| Finding evidence | Which public value supports this state? | `TransferFinding.evidence` plus normalized registration facts | evidence | Dates, EPP values, DS count, and nameservers make each conclusion auditable. | Keep evidence attached to its finding. Do not repeat it in global facts or prose. |
| Self-service ownership | Can I remove this blocker myself? | `selfServiceable` plus finding kind | supporting | A registrar lock, policy wait, registry lock, and lifecycle state require different action. | Name the action, not only `yes` or `no`. Do not tell a reader to ask the registrar when the only remedy is waiting. |
| Active policy version | Which rule did stack127 apply to registration and transfer timing? | `result.policy` | supporting | The defaulted active policy changes the lead answer and must stay visible. | Show label, effective date, durations, source, and verification date once. Do not hide the active rule in a disclosure. |
| Adopted policy change | What shorter rule has ICANN adopted but not made effective? | `result.pendingPolicyChange` | evidence | The pending 720-hour rule explains why other sources may describe different limits. | State `Not effective` and no effective date once. Never use pending durations in findings. |
| Registrar account access | Can I sign in and use the current registrar's transfer controls? | Private account state | supporting | The public result cannot be acted on without account access. | One account-checklist item. Do not render it as an unknown public finding. |
| Authorization code | Can I obtain the auth code? | Private registrar account state | supporting | The transfer cannot start without it, and RDAP cannot expose it. | One account-checklist item. Never request or store the code. |
| Registrant approval email | Can the current registrant receive and approve transfer mail? | Private account state and redacted registration data | supporting | A stale or inaccessible address often stalls approval. | One account-checklist item. Do not display a redacted or guessed address. |
| Balance, contact verification, and account locks | Does the registrar account have private holds? | Private registrar state | supporting | These may stop a transfer despite clear public data. | Keep one concise checklist item. Do not infer a clear state from absence in RDAP. |
| Registrar-specific transfer-out steps | Does the current registrar require another private action? | Registrar account and policy | supporting | Extra approval or transfer-out controls are outside public data. | One checklist item. Do not add registrar-specific instructions without a source. |
| Public registry source | Which service supplied the statuses, dates, DNSSEC, and nameservers? | `registration.registryFetch.url` | evidence | The source host verifies the public evidence. | Show once in run metadata. Raw evidence keeps its own source label. |
| Fetch and cache time | How fresh is the public record? | `registryFetch.fetchedAt`, `fromCache`, and optional `registryDatabaseUpdated` | evidence | Transfer state can change quickly after an unlock or approval. | Show each distinct timestamp once. Do not substitute internal row or page dates. |
| Request completion and duration | When did stack127 run the composed check, and how long did it take? | `registration.checkedAt` and `durationMs` | omit | Registry fetch time is the evidence that matters. Request latency does not change readiness. | Do not add timing cards or repeat the fetch date. |
| Raw registry and registrar responses | What exact RDAP records support the interpreted findings? | `registryFetch` and `registrarFetch` body or error | evidence | Raw records help a technical reader verify statuses and dates. | Keep one closed disclosure per existing source. Do not show JSON open by default. |
| Complete JSON download | Can I save the result object? | Existing `reportJson` output | omit | The result is a current checklist, and a downloaded public snapshot cannot complete the private checks. | Remove the download action. Raw disclosures preserve source evidence. |
| Registrar favicon and identity header | What website icon belongs to the domain? | Third-party favicon request | omit | It has no bearing on transfer eligibility and can fail independently. | Remove the favicon and duplicate hostname header. |
| Exact lock-lift date | On which date will the registrar allow transfer? | Not reliable from public data | omit | Registrars use different reference points and the policy is changing. | Show elapsed time, rule, and remaining days only. Never print a calendar prediction. |
| Readiness score or percentage | How ready is the domain overall? | No valid shared denominator | omit | One blocker is enough to stop a transfer, and unknown account state cannot be scored. | Do not add a score, progress bar, gauge, or passed-check percentage. |

The core public list is complete and stable: registrar lock, registry lock, pending transfer, lifecycle, registration timing, previous transfer timing, expiry proximity, DNSSEC, and nameservers. Each check renders even when its evidence is absent. Missing evidence becomes `Unknown`, not omission or `Clear`. Findings keep this fixed subject order inside severity groups, with `Blocked` first, then `Risk`, `Unknown`, and `Clear`.

The active policy applies only to an eligible gTLD registration. A country-code TLD or an ending with unknown policy scope gets a scope conclusion instead of ICANN lock arithmetic. Public EPP and RDAP facts may remain available in raw evidence, but the interface must not call that domain ready, blocked under ICANN policy, or subject to a 60-day rule.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | Empty on the clean route; an explicitly opened `name` query parameter may prefill it | visible | `ToolTextField` with text input, URL input mode, no capitalization, no autocomplete, and no spellcheck | It identifies the one registrable domain to assess. The persistent label is `Domain name *`, and the example is `example.com`. | Full width above the action. Its error stays directly below it. |
| 2 | Check transfer readiness | primary action | not applicable | No default; the user submits the form | visible | Primary `ToolButton` submit | It starts the registry lookup and dated policy evaluation, then remains the retry path. | Full width below the field. Keep its width stable while loading. |
| 3 | Open DNSSEC checker | secondary navigation | no | Present for a DNSSEC risk | result | Ordinary text link to `/dnssec-checker?name=<ASCII domain>` | It checks the chain that must stay valid through the move. | Wraps beneath the DNSSEC finding evidence. |
| 4 | Open nameserver checker | secondary navigation | no | Present when nameserver evidence exists or is unknown | result | Ordinary text link to `/nameserver-checker?name=<ASCII domain>` | It verifies the delegation that remains after the registration moves. | Wraps beneath the nameserver finding evidence. |
| 5 | Open EPP status explanation | secondary navigation | no | Present when a transfer-related EPP status supports a finding | result | Ordinary text link to `/epp-status-codes` | It explains the public status without crowding the finding. | Wraps beside the status evidence. |
| 6 | Open raw RDAP response | optional evidence action | no | Closed by default after a usable or partial lookup | disclosure | `ToolDisclosure` containing `ToolRawOutput` | It exposes source proof after the interpreted checklist. | One full-width disclosure per source. The raw viewport owns overflow. |

Enter submits. Empty or whitespace input shows `Enter a domain name.` below the field and focuses it. Invalid suffix, IP, malformed name, and other normalization errors use the precise server message at the same field scope. An explicit `?name=` value preloads the field but never submits automatically.

Editing the field clears its error and removes every prior result so a stale readiness conclusion cannot sit beside a different domain. During lookup, the field stays visible and duplicate submission is disabled. A request failure preserves the value and re-enables the same primary action.

Opening `/transfer-readiness` leaves the address unchanged through server render and hydration. An explicitly opened `?name=` query remains unchanged. Editing, submission, results, raw disclosure state, and related navigation do not rewrite the current URL. There is no Share action because the public record and effective policy can change.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Public readiness conclusion | Does public data block this gTLD transfer, or is the public side clear but incomplete? | Registered in-scope status and ordered blocked findings | One `ToolResultLead` sentence. Blocked results state blocker count and action ownership. Unblocked results say `No public blocker was found` and immediately preserve account uncertainty. | Never say `Ready to transfer`, `All clear`, or `Can transfer now`. Do not add a pill, score, hostname header, or second summary. |
| 2 | Checked-domain notice | Did stack127 reduce the entered hostname or URL to a registrable domain? | `query.input`, `query.unicode`, and `query.reduced` | One conditional plain sentence directly below the lead | Omit when the entered and assessed names match. Do not duplicate the normalized domain elsewhere. |
| 3 | Public checks | Which public checks are blocked, risky, unknown, or clear, what supports each one, and what should I do? | Complete fixed finding set, state, detail, action owner, and evidence | One page-owned semantic ordered list with neutral row rules. Order by state severity, then the fixed subject order. Each row shows title, text state, concise detail, evidence, and one next action when useful. | Do not use cards, state pills, a findings table full of prose, or separate passed and failed dashboards. Keep every unknown and clear check visible. |
| 4 | Policy used | Which policy version produced the timing findings, and what adopted change is still pending? | Active `policy` and optional `pendingPolicyChange` | One visible `ToolKeyValueList` with active label, effective date, registration and transfer lock durations, source and verification date, plus one pending-change row labeled `Not effective` | Render only for registered in-scope gTLD results. Do not hide the active rule, hardcode a future effective date, or apply pending durations. |
| 5 | Registrar account checklist | What private facts must I verify before starting? | Complete `cannotCheck` list from product rules | One plain unordered list titled `Check in your registrar account` | Always show after public checks for a registered in-scope result. Do not use disabled checkboxes, because the tool does not save completion. Do not repeat public findings. |
| 6 | Source and freshness | Which public source was used, and when was it fetched? | Registry host, `registryFetch.fetchedAt`, `fromCache`, and optional distinct `registryDatabaseUpdated` | Quiet page-owned metadata `dl` after the interpreted result | Show each value once. Never use global request duration or duplicate identical formatted dates. |
| 7 | Raw evidence | What did the registry and registrar RDAP services return? | Existing registry and registrar fetch bodies or errors | One closed `ToolDisclosure` and `ToolRawOutput` per existing source | Keep last and closed by default. Each raw viewport owns overflow. Do not expose a download action. |
| 8 | Not-registered result | Is there a registered domain to transfer? | `registration.status === "not_registered"` and normalized domain | One `ToolResultLead`: `<domain> has no registry record, so there is no registered domain to transfer.` | Omit policy, findings, account checklist, and readiness language. Keep source and raw evidence when present. |
| 9 | Coverage or policy-scope result | Can stack127 apply a transfer rule to this ending? | No-service status or registered country-code or unknown-scope TLD | One `ToolResultLead` naming either the missing RDAP service or the fact that ICANN gTLD policy does not govern the ending | Link to the TLD directory. Do not calculate or show gTLD lock findings. Keep source evidence when it exists. |
| 10 | Lookup failure | Why is no readiness result available, and how do I recover? | Rate limit, blocked registry, timeout, registry error, network error, or malformed response | One danger or warning `ToolStatus` below the primary action | Preserve the input and use the same primary action for retry. Do not render findings or no-public-blocker copy from empty data. |

For a blocked registered gTLD, the lead follows this form: `example.com cannot be transferred now. Two public blockers are visible: one you can clear in your account, and one requires waiting or registrar help.` For no visible public blockers, it says: `No public blocker was found for example.com. Auth code, account state, approval email, and registrar-specific steps can still stop the transfer.` Unknown public checks remain in the list and do not change that sentence into a positive guarantee.

The public checks use these explicit states and recovery rules:

- `Blocked` means a public status or dated policy rule prevents transfer now.
- `Risk` means the transfer may proceed, but expiry, DNSSEC, or DNS hosting needs a plan.
- `Unknown` means required public evidence is absent. It never counts as clear.
- `Clear` means that one public check found no issue. It does not clear private account state.

A self-service registrar lock says `Unlock this in your registrar account.` A registration or prior-transfer timing lock says `Wait until the policy period has elapsed, then confirm with your registrar.` A registry lock says `Ask your registrar why the registry set this status.` Pending transfer says `Confirm or reject the existing transfer with your registrar.` Redemption says `Restore the domain through the current registrar before trying to transfer.` Pending delete says transfer and restoration are no longer available, without predicting release.

The account checklist contains account access, authorization code availability, approval email access, private balance or verification holds, a recent change-of-registrant lock, and registrar-specific transfer-out steps. The interface never requests the auth code, email address, password, or account data.

Read without this document, the result says: `example.com cannot be transferred now because two public blockers exist.` The ordered list shows which one the owner can clear, which one requires waiting or registrar help, and the evidence for both. Policy rows name the rule used. The account list prevents a clear public record from becoming a promise, and source metadata plus raw responses make the public findings auditable.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Conclusion sentence | One public readiness conclusion with action ownership | Not applicable. Reading order and type hierarchy make the sentence dominant. | Use one `ToolResultLead`. |
| Ordered findings list | Priority across blocked, risk, unknown, and clear checks while preserving each check's evidence and action | Yes. Document order encodes action priority, and numbered rows keep every check distinct. | Use one semantic `ol` with neutral row rules. Do not use equal cards. |
| Transfer-step sequence | Unlock, obtain auth code, start at the new registrar, approve, and wait | Yes. The steps form a real operational order, but they belong in supporting page content after the workbench rather than the personalized result. | Keep the existing supporting-content sequence. Do not duplicate it inside results. |
| Policy key/value rows | Active rule and adopted pending change | Not applicable. These are unlike policy facts, not repeated records or a process. | Use `ToolKeyValueList`, with the active assumption visible. |
| Timeline or countdown | Registration, transfer, expiry, and predicted unlock | No. The dates describe different events, registrar reference points vary, and no reliable unlock date exists. | Omit. Show dates and elapsed arithmetic inside their findings. |
| Progress bar or passed-check percentage | Overall transfer readiness | No. One blocker stops transfer, unknown account facts have no denominator, and risks are not partial completion. | Omit. Never collapse findings into a score. |
| Findings table | Long detail, evidence, action owner, and next step for each check | No. The fields repeat, but long prose and conditional recovery would make a wide, hard-to-scan table. | Replace with an ordered list whose rows keep one check in reading order. |
| State pills or finding cards | Difference among blocked, risk, unknown, and clear | No. Equal boxes and badge fills add decoration without a measured relationship. | Omit. Use explicit state words and semantic text color only where useful. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean route | Empty field and enabled `Check transfer readiness` | Absent | All result regions absent | No instructional or empty-state panel | Normal document focus. Nothing announces on load. The URL stays `/transfer-readiness`. |
| Initial explicit query | Prefilled domain from the opened `name` query parameter | Absent | All result regions absent | Do not submit automatically | Normal focus order. Do not announce the prefill or rewrite the URL. |
| Invalid input | Preserve the entered value | Absent | Clear stale findings, policy, checklist, metadata, and raw evidence | Show one precise field error below the input | Focus the field and associate the error programmatically. Do not add a second request alert. |
| Loading first check | Keep input visible, disable duplicate submission, and label the stable-width button `Checking transfer readiness...` | Absent | Absent | The same primary action becomes retry after failure | Announce loading politely. Keep focus on the initiating button. |
| Loading later check | Preserve the edited input and clear every prior result before the request starts | Absent | Absent | Never leave a previous domain's conclusion beside the new name | Announce loading politely without moving focus. |
| Registered gTLD with public blockers | Re-enable input and submit | State that transfer is blocked, count public blockers, and divide owner-clearable from wait or registrar action | Show complete ordered checks, policy, account checklist, source metadata, and raw evidence | Each blocked finding has one precise next action | Announce the lead once as an alert or assertive status. Supporting state words do not each announce. |
| Registered gTLD with no public blocker | Re-enable input and submit | Say `No public blocker was found`, followed by the private-account limit | Show risk, unknown, and clear checks, active policy, account checklist, source metadata, and raw evidence | The account checklist is the next action. Do not say `Ready` or `Can transfer`. | Announce the lead once politely. |
| Partial public evidence | Re-enable input and submit | Base the lead only on known blockers. If none are visible, keep the no-public-blocker wording and account limit. | Show every missing date, DNSSEC state, nameserver set, or transfer event as `Unknown` in its fixed check row | Raw evidence remains available. Unknown never becomes clear. | Announce the lead once. Unknown rows remain ordinary readable content. |
| Self-service registrar lock | Re-enable input and submit | Include the blocker in the owner-clearable count | Registrar-lock row shows `client transfer prohibited` and tells the owner to unlock it in the account | Link to the EPP status explainer | Lead announces blocked state. The row does not create another alert. |
| Registry or lifecycle blocker | Re-enable input and submit | Include it in the wait or registrar-help count | Row preserves exact public status and explains registrar contact, restoration, or inability to restore | Never tell the owner they can clear a server lock themselves | Lead announces blocked state. Semantic danger text supports the row state. |
| Registration or previous-transfer policy lock | Re-enable input and submit | Include it in the wait or registrar-help count | Row shows event date, elapsed days, active duration, and approximate days remaining | Do not print an unlock date. Tell the owner to wait and confirm with the registrar. | Lead announces blocked state. Date evidence stays in the row. |
| Near or past expiry | Re-enable input and submit | Does not create a blocker by itself | Expiry row is `Risk`, shows exact expiry and days, and recommends renewing first when time is short | Keep transfer duration wording as a risk, not a guarantee | Final lead announces once. The risk row stays non-assertive. |
| DNSSEC risk | Re-enable input and submit | Does not create a transfer blocker | DNSSEC row shows signed state, DS count when known, the coordination risk, and a DNSSEC checker link | Never say the transfer moves or repairs DS records | Final lead announces once. Link follows normal focus order. |
| Nameserver risk | Re-enable input and submit | Does not create a transfer blocker | Nameserver row lists published servers, says DNS and email hosting do not move, and links to the nameserver checker | Missing nameserver evidence becomes `Unknown`, not clear | Final lead announces once. Long names wrap within the row. |
| Not registered | Re-enable input and submit | Say there is no registered domain to transfer | Omit checks, policy, and account checklist. Keep source metadata and raw registry evidence. | Offer Domain Registration Lookup only in supporting page content, not as transfer recovery | Announce the lead once. Never say the domain is transferable. |
| Registered ccTLD or unknown policy scope | Re-enable input and submit | Say stack127 cannot assess this ending under the ICANN gTLD Transfer Policy | Omit gTLD findings, policy arithmetic, and account checklist. Keep the normalized domain, TLD directory link, source metadata, and raw evidence. | Tell the owner to use the registry or registrar's TLD-specific transfer rules | Announce the scope limit once. Never apply 60-day or pending 720-hour rules. |
| No RDAP service | Re-enable input and submit | Say stack127 cannot check the ending because no RDAP service is known | Omit findings and policy. Show a TLD directory link. | The same primary action can retry another domain, but retrying this ending does not fix coverage | Announce the coverage result once without success styling. |
| Registry rate limit, refusal, timeout, or error | Preserve input and re-enable submit | Absent | Clear stale results | Show one specific `ToolStatus` and tell the owner when retry is useful | Announce one error. Do not infer readiness from missing data. |
| Empty or malformed response | Preserve input and re-enable submit | Absent | Do not render a no-public-blocker result or empty checklist | Show `The registry response was incomplete. Try again.` | Announce one error and keep focus in the form flow. |
| Expanded raw evidence | Input, lead, findings, policy, checklist, and metadata remain visible | Unchanged | Reveal only the selected registry or registrar response in a contained viewport | Disclosure can close without losing the interpreted result | Native disclosure semantics announce expansion. Focus stays on the trigger until the reader tabs inside. |
| Long domain, evidence, or increased text | Input remains operable and the primary action keeps its place | Lead wraps without clipping | Finding states, long registrar names, EPP evidence, nameservers, policy notes, checklist items, and raw payloads remain reachable | Raw output alone may scroll horizontally and vertically | Focus rings remain visible. No row, action, or source is covered. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It keeps the visible required label, native text entry, precise error, and focus target together. | `ToolSearchField`, registrar selection, and account fields, because the task starts from one public domain name. |
| One remote check | Primary `ToolButton` submit | It gives one deliberate action with stable loading and retry states. | Auto-run, reset, download, and a second primary action. |
| Loading and request failure | `ToolStatus` | It announces a form-level remote state without fabricating a readiness result. | Repeated alerts above the form and inside the result. |
| One public conclusion | `ToolResultLead` | A sentence can state blocker count, ownership, and the private-account limit without implying a score. | `ToolPrimaryResult`, status pill, health score, hostname header, and favicon. |
| Complete public checks | Page-owned semantic `ol` | Long detail, exact evidence, action ownership, and conditional links read cleanly in priority order. | `ToolDataTable`, finding cards, accordions, and grouped dashboards, because they make the list wider, hide unknowns, or flatten priority. |
| Active and pending policy facts | `ToolKeyValueList` | The facts differ in meaning, the active assumption stays visible, and pending status can sit beside its own source. | Timeline, policy cards, and a collapsed disclosure. |
| Private checks | Plain semantic `ul` | The list states work the owner must perform without implying saved completion. | Disabled checkboxes, editable fields, and an account-readiness score. |
| DNSSEC, nameserver, and EPP next steps | Ordinary text links | Each opens a separate technical task without competing with the primary action. | Accent buttons, automatic child checks, and registrar sales links. |
| Source and freshness | Page-owned semantic `dl` | A few quiet provenance facts need distinct labels after the checklist. | Source cards, metrics, and repeated prose notes. |
| Raw source proof | `ToolDisclosure` with `ToolRawOutput` | It keeps large registry and registrar records available without crowding the public findings. | Always-open JSON, modal, complete download, and one merged raw payload. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | The workbench band spans the main column. The labeled field and primary action come first. Results stack as conclusion, checked-name notice, public checks, policy used, account checklist, source metadata, and raw evidence. Finding state, title, detail, evidence, and action align within one readable row. | `this-is-a-deliberately-long-registered-domain-name.example`, `server transfer prohibited`, a six-host nameserver list, and a long registrar organization name | No page overflow. Finding content wraps. Each raw output viewport owns horizontal and vertical overflow. |
| Narrow mobile, 320px to 640px | Field and full-width action stack. Conclusion, checked-name notice, and every result section keep desktop order. Each finding stacks state and title above detail, evidence, and link. Policy key/value rows stack when needed. | A 253-character ASCII domain, `RESERVED-Internet Assigned Numbers Authority`, and `Adopted, waiting to be implemented` | Domain, evidence, and policy source text wrap anywhere when safe. Raw output alone may scroll. The document never scrolls horizontally. |
| Expanded raw evidence at any width | Registry disclosure comes before registrar disclosure. Each keeps its host in the trigger and its body in a capped viewport. | A complete RDAP response with nested notices, entities, and an unbroken 250-character URL | `ToolRawOutput` owns both horizontal and vertical overflow. The disclosure and page do not widen. |
| Increased text size or long localization | Move actions beneath evidence before a row becomes cramped. Keep state before title and title before detail. | `No public blocker was found. Account and approval checks can still stop the transfer.` at 200 percent text size | Text wraps inside its owner. No finding, link, action, disclosure, or focus ring is covered. |

## Interface wireframes

### Desktop result

```text
Domain name *
[example.com                                                         ]

[Check transfer readiness]

------------------------------------------------------------------------

example.com cannot be transferred now. Two public blockers are visible:
one you can clear in your account, and one requires waiting.

Public checks

1  BLOCKED   Registrar transfer lock
             Unlock this in your registrar account.
             Evidence: client transfer prohibited   Explain this status

2  BLOCKED   Time since registration
             Registered 20 August 2026, 16 days ago. The active policy
             locks new registrations for 60 days. About 44 days remain.
             Wait until the policy period has elapsed, then confirm.

3  RISK      DNSSEC
             Signed, 2 DS records. Coordinate DS handling at both ends.
             Check the DNSSEC chain

4  RISK      DNS hosting
             ns1.example.net, ns2.example.net
             Registration moves. DNS and email hosting do not.
             Check nameserver delegation

5  UNKNOWN   Time since previous transfer
             The registry does not publish a transfer event.
             Confirm transfer history in the registrar account.

6  CLEAR     Expiry proximity
             Expires 20 August 2027, 349 days away.

Policy used
Active rule        Transfer Policy in force today
Effective          1 December 2016
Timing locks       60 days after registration and registrar transfer
Source             ICANN Transfer Policy
Verified           28 July 2026
Adopted change     720 hours, not effective, no effective date published

Check in your registrar account
- Can you sign in and reach transfer controls?
- Can you obtain the authorization code?
- Can the registrant receive the approval email?
- Are there private balance, verification, or account locks?
- Did the registrant change recently?
- Does the registrar require another transfer-out step?

Registry source    rdap.verisign.com
Fetched            5 September 2026, from cache
Registry data      5 September 2026

> Registry response from rdap.verisign.com
> Registrar response from registrar.example
```

When no blocker is visible, the lead becomes: `No public blocker was found for example.com. Auth code, account state, approval email, and registrar-specific steps can still stop the transfer.` The same complete check list follows, including every risk, unknown, and clear row.

### Narrow mobile result

```text
Domain name *
[example.com                     ]

[  Check transfer readiness     ]

----------------------------------

example.com cannot be transferred
now. Two public blockers are
visible: one you can clear, and one
requires waiting.

Public checks

1  BLOCKED
Registrar transfer lock
Unlock this in your registrar account.
client transfer prohibited
Explain this status
----------------------------------
2  BLOCKED
Time since registration
Registered 20 August 2026.
16 days elapsed. 60-day rule.
About 44 days remain.
----------------------------------
3  RISK
DNSSEC
Signed, 2 DS records.
Check the DNSSEC chain

Policy used
Active rule
Transfer Policy in force today
Timing locks
60 days after registration and transfer
Adopted change
720 hours, not effective

Check in your registrar account
- Account access
- Authorization code
- Approval email
- Private account holds
- Recent registrant change
- Registrar-specific steps

Registry source
rdap.verisign.com
Fetched
5 September 2026, from cache

> Registry response
> Registrar response
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL CLEAN ROUTE
Domain name *
[example.com                     ]  example placeholder
[  Check transfer readiness     ]

INITIAL EXPLICIT QUERY
Domain name *
[example.com                     ]  prefilled, no automatic request
[  Check transfer readiness     ]

INVALID
Domain name *                      <- focus
[not a domain                    ]
That domain name is not valid.

LOADING LATER CHECK
Domain name *
[new-example.com                 ]
[ Checking transfer readiness... ]  disabled, busy
Checking public transfer data...
No prior conclusion or findings remain visible.

NO PUBLIC BLOCKER
No public blocker was found for example.com. Account and approval
checks can still stop the transfer.
Public checks include Risk, Unknown, and Clear rows.

PARTIAL PUBLIC EVIDENCE
No public blocker was found for example.com. Account and approval
checks can still stop the transfer.
Registration date          Unknown
Previous transfer          Unknown
Expiry                     Unknown
DNSSEC                     Unknown
Nameservers                Unknown
Unknown does not count as clear.

NOT REGISTERED
unregistered-example.com has no registry record, so there is no
registered domain to transfer.
No transfer findings or policy arithmetic appear.

COUNTRY-CODE TLD
stack127 cannot assess transfer readiness for example.uk under the
ICANN gTLD Transfer Policy. Use the registry or registrar's .uk rules.
No 60-day or 720-hour calculation appears.

NO RDAP SERVICE
stack127 cannot check example.invalid because no RDAP service is known.
Open the TLD directory.

REQUEST FAILURE
The registry did not return a usable answer. Try again shortly.
[  Check transfer readiness     ]  enabled retry

EMPTY OR MALFORMED RESPONSE
The registry response was incomplete. Try again.
No no-public-blocker sentence appears.

EXPANDED RAW EVIDENCE
v Registry response from rdap.example
+------------------------------------+
| {                                  |
|   "status": [                     |
|     "client transfer prohibited" |
|   ]                                | -> contained scroll
| }                                  |
+------------------------------------+
```

## Removed or rejected

- Remove the existing favicon, domain result header, and download action. None helps decide or clear a transfer blocker.
- Remove the existing readiness status pill. The conclusion sentence owns the answer and must preserve unseen account state.
- Replace boxed finding cards and state pills with one ordered list. Priority, evidence, ownership, and recovery matter more than containers.
- Do not omit clear or unknown core checks when their source fields are false, null, or absent. A complete list prevents missing data from looking clear.
- Do not treat a country-code or unknown-scope TLD as subject to ICANN gTLD lock periods.
- Do not show `Nothing visible is blocking it` without naming account limits in the same lead sentence.
- Do not say `Ready to transfer`, `Can transfer now`, `All clear`, or another promise based only on public records.
- Do not infer a clear previous-transfer check from a missing RDAP transfer event. Absence is unknown.
- Do not infer a clear DNSSEC or nameserver check by omitting a null or empty source value.
- Do not use `last changed` as a change-of-registrant or registrar-transfer date.
- Do not print an exact date when a policy lock lifts. Show event date, elapsed time, active duration, and approximate days remaining.
- Do not apply the adopted 720-hour rule before its effective date. Do not hardcode a future effective date.
- Do not put the active policy assumption behind a disclosure. It changes the readiness conclusion.
- Do not add a readiness score, passed-check count, progress bar, gauge, timeline, blocker cards, or dashboard metrics.
- Do not render private account items as disabled checkboxes. The tool cannot know or save whether the owner completed them.
- Do not request the authorization code, registrar password, registrant email, balance, or any private account value.
- Do not leave a prior result visible after the domain changes or a new request starts.
- Do not serialize the clean route, prefilled value, normalized domain, or result into the URL during hydration or submission.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed state renders exactly one conclusion sentence. A registered in-scope result says either transfer is publicly blocked or no public blocker was found with the private-account limit attached. | Browser fixtures for blocked, unblocked, partial, not-registered, no-service, and ccTLD states |
| UI-002 | deduplication | The normalized domain, conclusion, each finding state, evidence value, policy duration, source timestamp, and account item appear once. There is no favicon, result pill, duplicate header, score, or downloaded report action. | Browser text-count and DOM assertions |
| UI-003 | visual-truth | Results use one ordered findings list and policy key/value rows. They contain no timeline, progress bar, gauge, readiness percentage, metric cards, finding cards, or findings data table. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px and 200 percent text size, order remains field, action, conclusion, checked-name notice, findings, policy, account list, metadata, and raw evidence. The document has no horizontal overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/transfer-readiness` leaves the URL unchanged through hydration. An explicit `?name=` prefills without auto-submit, and later edits, results, or disclosure changes do not rewrite it. | Browser URL, history, and request-count assertions |
| UI-006 | input | Empty, suffix-only, IP, malformed, and unsupported values show one precise field error, focus the field, preserve the entered text, and make no lookup for locally rejected input. | Browser keyboard and validation tests |
| UI-007 | loading | A new check clears stale results, keeps the input visible, prevents duplicate requests, retains button width, and announces `Checking public transfer data...`. | Browser delayed-response and live-region assertions |
| UI-008 | blocker ownership | The lead counts all public blockers and distinguishes owner-clearable blockers from waiting or registrar help. Each blocked row gives the correct action for client lock, server lock, pending transfer, registration timing, prior-transfer timing, redemption, and pending delete. | Browser fixture for each blocked finding ID |
| UI-009 | no guarantee | A result with no blocked findings uses `No public blocker was found` and names private account limits in the same sentence. It never displays `Ready to transfer`, `Can transfer now`, or `All clear`. | Browser clear and unknown fixtures plus forbidden-text assertions |
| UI-010 | complete checks | Every registered in-scope result renders registrar lock, registry lock, pending transfer, lifecycle, registration timing, previous transfer timing, expiry, DNSSEC, and nameserver rows as `Blocked`, `Risk`, `Unknown`, or `Clear`. | Browser complete and sparse registration fixtures |
| UI-011 | unknown | Missing registration date, transfer event, expiry, DNSSEC state, or nameservers renders `Unknown`. Unknown checks do not count as clear, disappear, or produce a readiness promise. | Browser null-field fixtures and state-count assertions |
| UI-012 | policy | Registered in-scope results show the active policy label, effective date, registration and transfer durations, source, and verification date. A pending version says `Not effective`, shows no invented date, and never changes finding arithmetic. | Browser policy fixtures and transfer-policy unit tests |
| UI-013 | policy timing | Registration and prior-transfer findings show source date, elapsed days, active duration, and approximate remaining days without printing a projected unlock date. | Browser boundary fixtures before, on, and after each active lock duration |
| UI-014 | TLD scope | Country-code and unknown-policy endings render one scope limit, omit all ICANN timing findings and private-account readiness checklist, and never display 60-day or pending 720-hour conclusions. | Browser `.uk`, `.de`, `.nl`, and unknown-type fixtures |
| UI-015 | DNS risk | DNSSEC true renders a risk with DS count when known and a DNSSEC checker link. False renders clear. Null renders unknown. Published nameservers render a DNS-hosting risk and link, while missing nameservers render unknown. | Browser DNSSEC and nameserver fixture matrix |
| UI-016 | account checklist | Every registered in-scope result lists account access, authorization code, approval email, private holds, recent registrant change, and registrar-specific transfer-out steps without requesting any value. | Browser list-content and form-control assertions |
| UI-017 | unavailable | Not-registered, no-service, rate-limited, blocked-registry, timeout, registry-error, and malformed-response states never render a no-public-blocker lead or public findings from empty data. | Browser fixture per lookup status and malformed payload |
| UI-018 | evidence | Each finding keeps its exact date, EPP status, DS count, or nameservers nearby. Source metadata shows the registry host, fetch time, cache state, and distinct registry data date once. | Browser complete and partial evidence fixtures |
| UI-019 | raw evidence | Registry and registrar responses remain separate, closed by default, keyboard operable, and contained at 320px with long JSON and URLs. | Browser disclosure, keyboard, and overflow tests |
| UI-020 | accessibility | The required field and error are associated, invalid submit focuses the field, loading and the final conclusion announce once, ordered checks retain semantic order, links have distinct names, and focus stays visible in both themes. | Browser accessibility-tree, keyboard, live-region, and theme checks |

## Open questions and blockers

- None. The current ICANN Transfer Policy still states the 60-day limits, while the 7 June 2026 Board resolution requires implementation work for the adopted replacement and gives no effective date. The versioned policy data remains the source for displayed durations, sources, verification dates, and pending status. The brief already excludes ccTLDs from ICANN policy arithmetic and defines private account state as unknown.

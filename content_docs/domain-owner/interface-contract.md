# Interface contract: Domain Registrant Lookup

Status: ready
Tool: Domain Registrant Lookup
Route: `/domain-owner`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:25e345512c88cd73ebfd8b7222e1f045b5a996106808ff060aa0bfd4b2a50c20`

## User task

- Primary user: A person who needs to know what public registrant data exists for one domain and how to make legitimate contact when identity is not public.
- Question: What registrant information is public for this domain, what did each provider declare withheld, and which contact route can I use?
- Lead answer: One evidence-aware registrant verdict that says `Published`, `Not published`, `No registrant`, or `Cannot determine` for the checked domain.
- Next decision: The person can use a published contact method, send an abuse report to the registrar, request nonpublic gTLD data through ICANN, or stop expecting public RDAP to reveal an identity it does not contain.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Domain name | Which domain should I check? | User input normalized by `normalizeDomainInput` | input | One domain is the only value needed to request current registration entities. | Do not add a TLD, contact role, registry, registrar, or data-source input. |
| Lookup action | When should stack127 request registry and registrar data? | User submission | input | The remote lookup needs one deliberate start and retry point. | No automatic request while typing and no second primary action. |
| Public registrant verdict | Is a registrant identity public for this domain? | `status`, every registrant entity, redaction declarations, registrar-hop state, and normalized domain | lead | This is the honest answer the person came for. It must distinguish unpublished data from a failed lookup. | Render one lead result. Do not repeat it in a favicon header, pill, count badge, or second answer paragraph. |
| Normalized query and reduction | What exact domain did stack127 query? | `query.input`, `domain`, `unicode`, `reduced`, `isIdn`, and `guessedSuffix` | supporting | URLs, hostnames, and IDNs can produce a different registry query than the entered text. | Keep the Unicode domain in the lead. Add a note only when reduction, A-label conversion, or suffix guessing occurred. |
| Distinct published registrant identities | Which names or organizations are public? | All entities whose roles include `registrant`, with source | supporting | One provider may publish an identity, both may agree, or they may disagree. The interface must not choose silently. | Merge identical formatted identity values and combine source labels. Keep conflicting values as separate sourced rows. Do not claim the named party operates the site. |
| Provider boundary | Did contact data come from the registry or registrar response? | Registry and registrar hosts, entities, redactions, and fetch status | supporting | Thin registries and registrar hops create different records. The source relationship explains why one response may have no contacts. | Show one source map based on returned data. Do not infer a thin or thick registry label from missing data alone. |
| Actionable registrant contact route | How can I contact the registrant without exposing private data? | Registrant `contactUri`, published registrant or role email, and source | supporting | A contact form or relay address is often the only practical public path. | Show each distinct actionable value once in contact routes. Exclude it from the general published-fields table. |
| Registrar abuse contact | Where should I report phishing, malware, spam, or abuse? | Abuse-role entities and `registrar.abuseEmail` or `abusePhone` with source | supporting | Abuse contacts have a narrow purpose and should not be presented as general owner contact. | Show once under contact routes with the abuse-only limitation. Do not repeat it in published fields. |
| ICANN Registration Data Request Service | Where can I request nonpublic gTLD data for a documented legitimate interest? | Official ICANN link `https://www.icann.org/rdrs-en` plus the TLD type in the committed TLD directory | supporting | The brief requires a legitimate request path when an eligible gTLD result leaves the identity nonpublic or contact data insufficient. | Show it only for an eligible gTLD with a `Not published` result. Do not show it for published identities, unregistered domains, lookup failures, ineligible TLDs, or as a generic contact link. |
| Published entity fields | What contact and registrar facts survived in the public response? | Non-empty entity fields plus derived country or state values, with role and source | supporting | The complete public record includes useful partial fields such as organization, country, and state. | Exclude exact values already assigned to contact routes. Merge identical role, field, and value rows across sources; keep conflicting values separate. |
| Declared redactions | Which fields did a provider say it removed, emptied, replaced, or partly hid? | Per-response `redacted` parsing through `parseRedactions` | supporting | RFC 9537 declarations identify withheld fields and their treatment. | Parse each response separately so the source survives. Do not infer the source from merged array order or repeat raw JSONPath. |
| Redaction declaration without rows | Did the provider declare redaction without naming fields? | `redactionDeclared` and per-response conformance | supporting | A declaration is still evidence even when no field list is available. | Show one sentence only when the relevant parsed table is empty. Do not fabricate redacted field names. |
| No published contact and no declaration | Is missing data known to be redacted? | Absence of public registrant fields and redaction declarations in all available responses | supporting | Missing data can mean omission, not declared withholding. The result must preserve that uncertainty. | Say `No public registrant identity was returned, and the responses did not declare why.` Never relabel this state as `Withheld`. |
| Registrar identity | Which registrar controls the customer relationship? | Registrar-role entities and normalized `registrar` fields | supporting | The registrar operates contact forms, abuse reporting, and most disclosure requests. | Name it once in the lead detail or contact routes. Do not add a separate registrar summary when it would repeat that value. |
| Registrar-hop failure | Could contact data be missing because stack127 could not retrieve it? | `registrarFetch.status`, `registrarFetch.error`, and lookup notes | supporting | For a thin registry, a failed second hop can hide the only contact response. This must not look like confirmed absence. | Promote the uncertainty into the lead verdict or detail. Do not bury it only in notes. |
| Source fetch time and cache state | When did stack127 retrieve each provider response? | `registryFetch.fetchedAt`, `registrarFetch.fetchedAt`, and `fromCache` | evidence | Registration contacts can change, so each response needs separate freshness evidence. | Show one metadata row per existing source. Do not repeat `checkedAt` or duration. |
| Lookup notes | What non-duplicate qualification did the engine return? | Deduplicated `notes` | evidence | Normalization and partial-fetch notes can change how the result is trusted. | Omit notes already expressed in the checked-name notice, lead, or provider map. Omit the disclosure when none remain. |
| Downloadable report | How can I save the full normalized record and source evidence? | `reportJson` over `DomainRegistration` | evidence | The JSON record supports later verification without making raw data the main interface. | Keep one secondary download action. Do not add copy, CSV, or another report format. |
| Raw registry and registrar responses | What did each provider return without interpretation? | Separate fetch bodies or errors | evidence | Raw evidence proves the public fields, redaction declaration, and source boundary. | One closed disclosure per existing source. Never merge the payloads or open them initially. |
| Registration dates, statuses, nameservers, and DNSSEC | What is the wider registration and delegation state? | Dates, statuses, nameservers, and `secureDNS` fields | omit | These facts belong to Domain Registration Lookup and do not answer the registrant question. | Keep them in the report and raw evidence. Link once to the broader lookup instead of copying its result groups. |
| Coverage routing details | How did the engine find the endpoint? | `coverage` | omit | Routing data does not change a successful contact result. | For `no_service`, name the TLD and link to coverage. Do not add a successful-result coverage card. |
| Application completion time and latency | When did the app finish and how long did it take? | `checkedAt` and `durationMs` | omit | Provider fetch time is the useful freshness fact. Latency does not answer who is public. | Do not add performance metadata or a second checked time. |
| Favicon and site identity | What icon or site operator is associated with the domain? | External favicon service or website content | omit | A website icon and operator are not registrant evidence. | Remove the favicon. Do not imply that the registrant operates the site. |

Registrant and source rules:

- Inspect every registrant entity, not only the first. A public name or organization in either response makes the record `Published`.
- If two sources publish the same visible role, field, and value, render one row with `Registry and registrar` as its source. If their visible values differ, render both and say in the lead detail that the responses disagree.
- Treat a published privacy or proxy service as the public registrant value. Do not claim it is the underlying person or organization.
- Derive redaction rows by parsing registry and registrar bodies separately. The normalized merged `redactions` array does not preserve source.
- `contactUri`, a registrant relay email, and registrar abuse details move into contact routes and do not repeat in the published-fields table.

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain name | required | yes | No default on the clean route. An explicit `?name=` may prefill from the opened URL. | visible | `ToolTextField` with `type="text"`, `inputMode="url"`, no capitalization, no autocomplete, and no spellcheck | It identifies the one registrant record to request. The persistent label is `Domain name *` and the example is `example.com`. | Full width above the action. Its error stays directly below the field. |
| 2 | Look up the registrant | primary action | not applicable | No default | visible | `ToolButton` with `type="submit"` and `variant="primary"` | It starts the remote lookup and names the answer it returns. | Full width below the field with the same comfortable hit height. |
| 3 | Follow a returned contact route | secondary action | no | Available only when the result supplies the route | result | Ordinary external link with a clear label, visible destination, and `rel="nofollow noreferrer"` when opening a new tab | It lets the person contact the registrant or send an abuse report without making disclosure promises. | Each long URL wraps. Links stay in one vertical list rather than a crowded action row. |
| 4 | Open ICANN RDRS | secondary action | no | Official ICANN destination, conditional on a `Not published` result and an eligible generic TLD in `lib/domain/data/tld-directory.json` | conditional | Ordinary external link labelled `Request nonpublic gTLD data through ICANN` | It provides the documented-interest path only when the current result and TLD fall within that service's scope. | Full-width text link with its gTLD scope in the same row. |
| 5 | Download report | secondary action | no | Available after any structured result with report data | result | `ToolDownloadAction` | It saves the normalized record and both provider payloads. | Full width after source metadata and before raw evidence. |
| 6 | Expand notes or raw response | optional evidence action | no | Closed by default | disclosure | `ToolDisclosure` or `ToolRawOutput` trigger | It exposes qualifications and raw provider evidence without competing with the answer. | One full-width disclosure row. Expanded content stays inside it. |

Validation and keyboard behavior:

- Blank, no-TLD, suffix-only, IP, malformed, overlong, and invalid IDN input shows the API's precise message once below the field.
- A submitted input error sets the field invalid, associates the message programmatically, focuses the field, and preserves the entered value. Editing clears that error.
- Enter submits. Tab order is field, primary action, returned contact links, report action, and disclosure triggers.
- The primary action retains its width, changes to `Looking up the registrant...`, exposes busy state, and blocks duplicate submission while loading.
- Do not disable submission before the person tries it. The inline error explains what needs correction.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Public registrant verdict | Is a registrant identity public for this domain? | Normalized domain, lookup status, every registrant entity, per-source redaction state, and registrar-hop state | One `ToolPrimaryResult` labelled `Public registrant information`. Its value is `Published`, `Not published`, `No registrant`, or `Cannot determine`. The detail names the domain and the evidence that supports that wording. | This is the only dominant answer. No favicon header, pill, duplicate domain heading, field-count badge, or second answer paragraph. `Not published` describes the returned responses, not the existence of an owner. |
| 2 | Checked-name notice | Why did stack127 query a different name from the entered text? | Input, Unicode form, A-label form, reduction, and guessed-suffix state | One concise page-owned note immediately after the lead, only when normalization changed or qualified the query | Normal inputs get no note. Repeat the name only to show the transformation. |
| 3 | Registry and registrar source map | Which response supplied the public entities and redaction evidence? | Existing provider hosts plus counts and roles of visible contributed fields and redactions | A page-owned semantic figure with one registry node, one optional registrar node, and one public-record destination. Each provider node lists the contact roles or redaction evidence it actually supplied. | Show `No contact entities returned` inside a responding node when true. Omit a registrar node when no hop exists, and show a failed registrar hop as recovery rather than an empty contribution. |
| 4 | Contact routes | How can I contact the registrant or report abuse? | Distinct registrant contact forms, relay email addresses, registrar abuse contacts, registrar name, and a conditional official ICANN RDRS link | Page-owned ordered key/value rows. Put returned registrant routes first and abuse contacts second with an abuse-only note. Show the ICANN request link last only when the lead is `Not published` and the committed TLD directory marks the ending as an eligible generic TLD. | Each returned value appears here or in published fields, never both. RDRS is a request path for nonpublic gTLD data, not a guarantee of access. Do not show it for a published identity, lookup failure, unregistered domain, or ineligible TLD. Omit the whole region when it has no applicable route. |
| 5 | Published fields | What contact information did the available responses publish? | Every non-empty entity role and field not already assigned to a contact route, including derived country and state values | `ToolDataTable` with `Role`, `Field`, `Published value`, and `Source`. Merge identical formatted rows across sources and keep conflicting rows separate. | Omit empty values and exact contact-route duplicates. Render an explicit no-fields sentence instead of an empty table. Do not make one card per entity. |
| 6 | Declared redactions | What did each provider say it withheld, and how? | Per-source redacted field name, raw method, translated explanation, and source | `ToolDataTable` with `Field`, `Method`, `What it means`, and `Source`. Keep method codes such as `emptyValue` visible in monospace. | Omit raw JSONPath. If a response declares redaction but lists no fields, show one plain sentence. If no response declares redaction, do not call missing data redacted. |
| 7 | Source freshness | When did stack127 retrieve the registry and registrar evidence? | Provider role, host, fetch date, and cache state | Quiet page-owned metadata `dl`, one row per existing response | Do not repeat application `checkedAt`, duration, or the same host in another metadata block. The raw disclosure label may repeat the host to preserve evidence boundaries. |
| 8 | Lookup qualifications | Did normalization or a partial provider response limit this result? | Notes left after checked-name, provider-hop, and disagreement deduplication | `ToolDisclosure` titled `Lookup notes`, omitted when empty | The lead owns registrar-fetch uncertainty. Do not repeat it here. |
| 9 | Report action | How can I save the normalized contact record and its evidence? | Report version 1 with complete `DomainRegistration` | One secondary `Download report` action | No copy action or second report format. It never receives primary accent styling. |
| 10 | Raw provider evidence | What did each provider return without interpretation? | Each existing source body or fetch error | One closed `ToolRawOutput` per source, labelled with provider role and host, after all interpreted results | Keep registry and registrar separate. Each raw viewport owns its overflow and never opens automatically. |

Read without internal reports, the result says: `The registrant of stack127.com is not published. The registrar declared that registrant fields were removed, emptied, or replaced, and it supplies a contact form.` The source map shows that the registry response contained no contact entities while the registrar supplied the public route and redaction declarations. The following rows show each published fact and each declared redaction once. Source metadata and raw responses prove where the result came from.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Large registrant answer | One categorical conclusion about public data | Not applicable. Hierarchy and wording, not geometry, make it the lead. | Use one `ToolPrimaryResult`. |
| Registry and registrar source map | Separate provider responses contribute different public fields and redaction evidence to one displayed record | Yes. Directed connectors encode contribution, and node labels carry the actual hosts and facts. Distance does not encode authority or time. | Use a page-owned semantic figure and stack it in reading order on narrow screens. |
| Published-fields table | Repeated role, field, value, and source records | Yes. Each row has the same schema, and aligned columns make source disagreements visible. | Use `ToolDataTable`. Merge identical rows and retain conflicting sourced rows. |
| Redaction table | Repeated field, method, meaning, and source declarations | Yes. Each row applies the same schema to one declared redaction. | Use `ToolDataTable`. Keep raw JSONPath only in evidence. |
| Entity cards and count pills | Relative importance and completeness of contact roles | No. Separate boxes and badge counts make partial fields look like competing findings and repeat table facts. | Omit the current entity cards and pills. Use one table and plain missing-data wording. |
| Identity confidence score | Likelihood that a public registrant is the real operator | No. RDAP cannot verify the identity, proxy relationship, or site operator. | Omit. State the limitation in public supporting content. |
| Registration timeline or history | Ownership changes over time | No. RDAP returns a current record, not historical registrants. | Omit. Link to the broad lookup only for current registration facts. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Empty required field, enabled `Look up the registrant` action, and no automatic request. An explicit `?name=` may prefill the field. | Absent | All result regions absent | No helper paragraph or error before submission | Normal document focus. Nothing announces on load. |
| Incomplete or invalid | Preserve the entered value and keep the action enabled | Absent. Clear an older result after an attempted invalid submission. | Absent | Show one precise field error below the input | Focus the field, associate its error, and announce the error once. |
| Loading, first lookup | Preserve the submitted input, prevent duplicate submission, and retain action width | Absent | Absent | The same form remains the retry point | Announce `Looking up the registrant...` through `ToolStatus`. Keep focus stable. |
| Loading, later lookup | Preserve the new input and clear the previous registrant result as soon as lookup begins | Absent so stale identity data cannot be read as the new answer | Clear old source maps, contacts, tables, metadata, report, and raw evidence | Keep the form and busy status visible | Announce loading politely. Do not move focus from the action. |
| Published identity | Preserve input and re-enable the action | Show `Published`. Name one distinct public identity, or say the responses disagree when they publish different identities. | Show checked-name notice when needed, source map, returned contact routes, partitioned public fields, conditional redactions, metadata, report, and raw evidence. Do not show RDRS. | State in the detail that public data does not prove the registrant operates the site | Announce the completed lead once. Keep focus in the normal flow. |
| Registered, identity not published with declared redaction | Preserve input and re-enable the action | Show `Not published`. Name the source that declared withholding without promising that every absent field was covered. | Show source map, returned contact routes, remaining public fields, redaction table or declaration note, metadata, report, and raw evidence. Show RDRS only when the TLD is an eligible gTLD. | Put an available contact route first. Keep RDRS visibly scoped to a documented request for nonpublic gTLD data. | Announce the completed lead once. |
| Registered, identity absent without redaction declaration | Preserve input and re-enable the action | Show `Not published` and say that available responses did not publish an identity or declare why | Show other public fields, returned contact routes, provider map, source metadata, report, and raw evidence. Show RDRS only when the TLD is an eligible gTLD. | Do not use `Withheld`, GDPR, or policy as an explanation without provider evidence | Announce the lead once. |
| Partial registrar hop | Preserve input and re-enable the action | Show `Cannot determine` when a failed registrar fetch could hide the only registrant response. Keep `Published` if another source already supplied a public identity. | Show registry fields and evidence that remain valid. Do not render an empty registrar node or table. | State that registrar-only contacts may be missing and offer retry through the same form | Announce the lead or qualification. Do not treat the empty hop as proof of privacy. |
| Not registered | Preserve input and re-enable the action | Show `No registrant` and state that the registry has no current registration record | Omit contact routes, entity fields, and redactions. Keep registry freshness, report, and raw evidence. | Do not call the domain available to buy | Announce the lead once without success-green styling. |
| No RDAP service | Preserve input and re-enable the action | Show `Cannot determine` and name the TLD with no known service | Omit contact sections. Keep any structured report or raw fetch evidence. | Link to the TLD directory and keep the same form available | Announce the warning result once. |
| Provider limited, blocked, timed out, or failed | Preserve input and re-enable the same action | Show `Cannot determine` with the safest specific reason available | Omit contact sections. Preserve source evidence only when a structured response exists. | Give one retry instruction. Do not leak upstream implementation details. | Announce one warning or danger result. Keep focus in the retry flow. |
| Client or network request failure | Preserve valid input and re-enable the primary action | Show `Cannot determine` for the submitted domain | Clear the previous record and do not show stale contact evidence | Show one request error and use the same action for retry | `ToolStatus` announces the failure once. Focus the input only for an input problem. |
| Expanded notes or raw evidence | Input and lead remain above the disclosure | Remains visible | Open only the chosen disclosure. Long JSON stays contained. | The trigger closes it without losing the result | Native disclosure semantics announce expansion. Focus stays on the trigger unless the person tabs into content. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| One domain input | `ToolTextField` | It preserves the visible required label, field error, input ref, and native text-entry behavior. | `ToolSearchField`, because the person enters one value instead of filtering a collection. |
| One remote lookup | `ToolButton` primary submit | It names the answer and supports a fixed busy state without adding another interaction. | Auto-submit, reset, or a second primary button, because they weaken the single deliberate request. |
| One public-data verdict | `ToolPrimaryResult` | It supports one accessible label, one dominant categorical value, and evidence-aware detail. | The current favicon header, multiple state pills, and repeated prose block, because they compete with and duplicate the answer. |
| Provider contribution relationship | Page-owned semantic source map | No shared component represents two evidence providers contributing separate contact and redaction facts to one record. | `ToolTimeline`, cards, or a paragraph, because time geometry is false, cards imply independent answers, and prose hides the source relationship. |
| Contact routes and small source facts | Page-owned semantic key/value rows | The values have different purposes and need inline limits and link behavior. | A button group, because these are not equal actions and the abuse route must not look like general contact. |
| Published fields and redactions | `ToolDataTable` | Both regions contain repeated records with stable schemas and source columns. | One card per entity or redaction, because that repeats labels and wastes narrow-screen space. |
| Loading and recoverable errors | `ToolStatus` | It provides a polite live region and danger alert at the narrowest useful scope. | Repeating the same message below the field and above the result. |
| Optional notes and raw proof | `ToolDisclosure` and `ToolRawOutput` | They keep diagnostics reachable, closed by default, and contained. | Always-open JSON, a modal, or one merged response, because each obscures the source boundary or breaks the reading order. |
| Downloaded evidence | `ToolDownloadAction` | It provides the shared secondary download behavior and label. | The current custom download button or a copy action, because neither adds another needed job. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop main column beside the real sidebar | Full-width workbench band. The field uses the flexible column and the action aligns with the control. Results stack in contract order. The source map may use two provider nodes flowing into one public-record node. | `stack127-interface-contract-20260905-example.com`, a long organization name, and an ICANN or registrar contact URL | No page overflow. Each `ToolDataTable` and `ToolRawOutput` owns its internal overflow. |
| Narrow mobile, 320px to 640px | Field, error, and full-width action stack first. Lead, checked-name notice, source map, contact routes, published fields, redactions, metadata, report, and evidence keep the same order. Source nodes stack registry, registrar, then public record. | A 253-character ASCII domain, a long Unicode name, an unbroken relay address, and a 250-character contact URL | Domain, email, and metadata text wrap anywhere. Tables and raw output alone may scroll horizontally. The page never does. |
| Expanded table or raw evidence at any width | Tables and disclosures remain in normal flow. Raw JSON caps its height and remains keyboard-scrollable. | Many entity roles, a long address value, many redactions, and nested RDAP notices | `ToolDataTable` owns table overflow. `ToolRawOutput` owns horizontal and vertical raw overflow. |
| Increased text size or long translations | Move the primary action below the field when the row no longer fits. Source nodes, route notes, and links grow vertically without clipping. | `Request nonpublic gTLD data through ICANN` at 200 percent text size | Text wraps inside its owner. No sibling covers a link, table column, or disclosure trigger. |

## Interface wireframes

### Desktop result

```text
Domain name *                                   [Look up the registrant]
[stack127.com                                                               ]

----------------------------------------------------------------------------

Public registrant information
Not published
The registrant of stack127.com is not public in the returned record. The
registrar declared withheld fields and provides a contact form.

Where this evidence came from
+ Registry: rdap.verisign.com +        + Registrar: rdap.hostinger.com +
| no contact entities          |        | contact form and redactions  |
+---------------+--------------+        +---------------+--------------+
                +-----------------------+
                            v
                 Public registrant record

How to make contact
Registrant contact form     https://www.hostinger.com/whois?...     Registrar
Registrar abuse email       abuse@hostinger.com                     Abuse only
Nonpublic gTLD request      Request through ICANN RDRS

What is published
Role             Field          Published value                     Source
Registrant       Country        LT                                  Registrar

What was withheld
Field                    Method             What it means                 Source
Registrant Name          emptyValue         Present but blank             Registrar
Registrant Phone         removal            Removed from the record       Registrar
Registrant Email         replacementValue   Replaced by a contact route   Registrar

Registry response        rdap.verisign.com, fetched 5 September 2026, cached
Registrar response       rdap.hostinger.com, fetched 5 September 2026, cached

[Download report]
> Lookup notes
> Registry response from rdap.verisign.com
> Registrar response from rdap.hostinger.com
```

### Narrow mobile result

```text
Domain name *
[stack127.com                       ]
[      Look up the registrant      ]

------------------------------------

Public registrant information
Not published
The registrant of stack127.com is not
public in the returned record. The
registrar declared withheld fields and
provides a contact form.

Where this evidence came from
[Registry: rdap.verisign.com]
 no contact entities
              |
[Registrar: rdap.hostinger.com]
 contact form and redactions
              |
[Public registrant record]

How to make contact
Registrant contact form
https://www.hostinger.com/whois?...

Registrar abuse email
abuse@hostinger.com
For abuse reports only.

Request nonpublic gTLD data through ICANN

What is published              -> table owns horizontal scroll
What was withheld              -> table owns horizontal scroll

Registry response
rdap.verisign.com
Fetched 5 September 2026, cached

[       Download report             ]
> Registry response
> Registrar response
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

```text
INITIAL
Domain name *
[example.com                         ]
[        Look up the registrant     ]

INVALID
Domain name *
[192.0.2.1                          ]  <- focus
That is an IP address. This tool looks up domain names.
[        Look up the registrant     ]

LOADING AFTER AN OLDER RESULT
Domain name *
[example.org                         ]
[      Looking up the registrant... ]  disabled, busy
Looking up the registrant...             polite status
The older identity result is gone.

PUBLISHED IDENTITY
Public registrant information
Published
example.org publishes Example Foundation as the registrant. This public
record does not prove that it operates the site.

NO DECLARED REDACTION
Public registrant information
Not published
No available response published a registrant identity or declared why.

PARTIAL REGISTRAR FAILURE
Public registrant information
Cannot determine
The registry returned no contact identity, and the registrar response could
not be retrieved. Retry before treating the data as unpublished.

NOT REGISTERED
Public registrant information
No registrant
example.com has no current registry record, so it has no current registrant.

NO SERVICE OR FAILURE
Public registrant information
Cannot determine
stack127 has no known RDAP service for .co. See the TLD directory.

EXPANDED EVIDENCE
v Registrar response from rdap.example
+------------------------------------+
| {                                  |
|   "redacted": [ ... ],             |
|   "contact-uri": "https://..."    | -> contained horizontal scroll
| }                                  |
+------------------------------------+
```

## Removed or rejected

- Remove the favicon and result header. The lead already names the normalized domain, and a site icon is not registrant evidence.
- Remove the current `Registrant published`, `Registrant withheld`, field-count, and entity-count pills. One evidence-aware lead owns the conclusion, and tables show the complete facts.
- Replace one card per entity with one partitioned published-fields table. Cards repeat role labels, make empty entities look important, and consume narrow-screen space.
- Remove the blanket sentence that an empty result is normal for a thin registry such as `.com`. A missing registrar response or undeclared omission must not be presented as confirmed redaction.
- Inspect all registrant entities instead of only the first. Merge identical values from both sources and preserve conflicts without choosing a winner.
- Partition contact forms, relay emails, and abuse contacts into the contact-routes region. Do not repeat those exact values in the published-fields table.
- Attribute redactions by parsing each response separately. Do not infer their source from the merged normalized array, and do not expose JSONPath in the interpreted result.
- Do not keep the previous registrant result visible while a new request is loading or after an invalid submitted value.
- Do not render a submitted field error as an unassociated form alert. Associate it with the field, focus the field, and announce it once.
- Do not let long domains, entity values, contact URLs, tables, or raw responses cause page-level overflow at 320px or increased text size.
- Do not add a confidence score, owner-verification claim, site-operator claim, registration history, privacy-service unmasking claim, paid-data offer, or sales link.
- Do not copy registration dates, status, nameservers, or DNSSEC into this result. Link to Domain Registration Lookup for the wider current record.
- Do not wrap the form, lead, each contact role, or each redaction in separate cards. Keep one workbench band with one divider between input and result.
- Do not serialize defaults, normalized names, or results into a clean URL during server render, hydration, or submission.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | Every completed lookup renders exactly one `ToolPrimaryResult` with `Published`, `Not published`, `No registrant`, or `Cannot determine`, followed by one evidence-aware detail for the submitted domain. | Browser tests with public identity, redacted, undeclared omission, partial registrar, 404, no-service, blocked, and timeout fixtures |
| UI-002 | deduplication | The interpreted result has no favicon header, state pill, count badge, entity cards, duplicate contact value, duplicate field row, or repeated source timestamp. Identical cross-source values merge with both sources named. | Browser text-count, row-count, and source-label assertions |
| UI-003 | visual-truth | The result contains one source map whose nodes and contributions match the returned responses. It contains no identity score, history timeline, registration-term bar, or contact-completeness chart. | DOM role assertions and Browser inspection |
| UI-004 | responsive | At 320px width and 200 percent text size, the order remains field, primary action, lead, checked-name notice, source map, contact routes, public fields, redactions, metadata, report, and evidence. The document has no horizontal overflow. | Browser measurements in dark and light themes |
| UI-005 | url | Opening `/domain-owner` leaves the URL unchanged through hydration. Opening an explicit `?name=` preloads without automatic submission, and later edits or results do not rewrite the URL. | Browser URL, history, and request-count assertions |
| UI-006 | input | Submitting blank, no-TLD, suffix-only, IPv4, IPv6, malformed, overlong, and invalid IDN values shows one precise associated field error, focuses the field, and preserves the entered text. | Browser keyboard and validation tests |
| UI-007 | loading | A later lookup clears the previous result at request start, retains button width, blocks duplicate requests, preserves the new input, and announces `Looking up the registrant...`. | Browser route interception and live-region assertion |
| UI-008 | normalization | URL, hostname, mixed-case, trailing-dot, user-info, port, and IDN input resolves to the intended registrable domain. A visible note shows reduction or A-label conversion only when it occurred. | Browser tests backed by shared normalization fixtures |
| UI-009 | published | The interface inspects all registrant entities. One public identity renders `Published`; identical values merge, conflicting provider values remain separate, and a proxy-service value is not described as an underlying owner. | Browser fixtures for registry-only, registrar-only, matching, conflicting, and proxy registrants |
| UI-010 | unpublished | Declared redaction renders `Not published` with every per-source field, method, and explanation once. No declaration renders different wording and never claims GDPR, policy, or withholding as the cause. | Browser fixtures with RFC 9537 rows, declaration-only, and no declaration |
| UI-011 | contact | Returned contact forms, relay emails, and registrar abuse contacts render once with source and purpose. The official ICANN RDRS link appears only for a `Not published` result on an eligible gTLD, states its nonpublic-gTLD scope, and does not promise disclosure. | Browser link, destination, eligibility, state, and duplicate-value assertions |
| UI-012 | partial | A failed registrar hop renders `Cannot determine` when it could hide the only contact response, preserves valid registry facts, gives retry, and never treats the failure as evidence of redaction. | Browser fixtures for registrar timeout, block, error, and no advertised hop |
| UI-013 | no-record | Registry 404 renders `No registrant`, omits contact and redaction regions, keeps registry evidence, and never calls the domain available. | Browser tests with empty-body and RDAP-error 404 fixtures |
| UI-014 | failure | No-service, rate-limited, blocked, timeout, registry-error, and network-failure paths render `Cannot determine`, preserve the input, give one useful recovery action, and never reuse unpublished or no-registrant wording. | Browser test with one fixture per failure state |
| UI-015 | evidence | Each provider shows its host, fetch time, and cache state once. Raw responses stay closed, separate, and contained. The downloaded report includes the normalized result and both raw responses. | Browser disclosure, download, and overflow tests |
| UI-016 | accessibility | The required label is visible and programmatic, input errors are associated and announced once, loading and results are announced, the source map has a text equivalent, table headers are scoped, and every action works with keyboard and visible focus. | Browser accessibility and keyboard checks |

## Open questions and blockers

- None. The brief, current engine, normalized entity and redaction types, live registration response, official ICANN RDRS destination, and prior rendered-state review define the input, lead states, source boundary, contact paths, evidence, failure behavior, and removals needed for implementation.

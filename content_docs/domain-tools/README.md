# Domain Tools

Status: collection and twelve flat tool/reference pages published. `ip-asn-lookup` remains planned.

The `/domain-tools` surface answers a different question from `/dns-tools`. DNS tools ask what the domain is doing right now. Domain tools ask who registered the name, when, with whom, and what the registry will allow next. Different data source, different failure modes, different reader.

Shared engine, endpoint discovery, caching, and privacy rules live in `stack127_docs/rdap.md`. Read that first.

## Why a separate collection

Folding these into `/dns-tools` would put two unrelated data sources behind one sidebar and force every DNS page to explain registration concepts it does not use. A sibling collection keeps both coherent and lets each sidebar stay a short list. It does not own the tools' canonical URLs.

The two hubs link to each other where a reader actually crosses over:

- Domain Registration Report shows `delegationSigned` from RDAP and sends the reader to DNSSEC Chain Checker for the cryptographic verdict.
- Nameserver Delegation Checker explains a registrar setting; the registrar name comes from Domain Registration Lookup.
- Domain Availability shows a name with no registration; DNS Lookup explains why it may still resolve.

Do not duplicate a route or implementation. Link the same flat canonical tool from both collections when it genuinely serves both audiences.

## Collection routes

| route | tool | page docs |
| --- | --- | --- |
| `/domain-tools` | collection | `content_docs/domain-tools/` |
| `/domain-lookup` | Domain Registration Lookup | `content_docs/domain-lookup/` |
| `/domain-age` | Domain Age Checker | `content_docs/domain-age/` |
| `/domain-expiry` | Domain Expiry Checker | `content_docs/domain-expiry/` |
| `/domain-availability` | Domain Availability Checker | `content_docs/domain-availability/` |
| `/domain-owner` | Domain Registrant Lookup | `content_docs/domain-owner/` |
| `/domain-registrar` | Registrar Lookup | `content_docs/domain-registrar/` |
| `/epp-status-codes` | EPP Status Code Explainer | `content_docs/epp-status-codes/` |
| `/transfer-readiness` | Domain Transfer Readiness | `content_docs/transfer-readiness/` |
| `/domain-report` | Domain Registration Report | `content_docs/domain-report/` |
| `/ip-asn-lookup` | IP and ASN Registration Lookup, planned | `content_docs/ip-asn-lookup/` |
| `/punycode-converter` | Punycode and IDN Converter | `content_docs/punycode-converter/` |
| `/tld-directory` | TLD Directory | `content_docs/tld-directory/` |
| `/multi-tld-availability` | Multi-TLD Availability | `content_docs/multi-tld-availability/` |

## The Thin Page Problem

`content_docs/dns-tools/README.md` says not to create thin pages that only change the record type. Four of the tools above read the same single RDAP response and show one field of it: age, expiry, registrar, and registrant. On the reference site these are separate pages of the same lookup, plus a fifth for the last update date.

We are building four of them, because the search intent behind "how old is this domain" is genuinely different from "who is the registrar". But each one has to earn its route:

- The tool result is scoped to that question. The age page leads with an age, not a table of every RDAP field.
- The explanation is specific to that question and is not shared boilerplate. The age page explains what a registration date does and does not prove about a site. The expiry page explains the grace and redemption periods.
- Each page links to Domain Registration Lookup once, for readers who want everything.
- No page repeats another page's explanation with the nouns swapped.

If a page cannot pass that test when it is written, cut it and let Domain Registration Lookup carry the job.

A Last Update Checker was planned and then cut for exactly this reason. It read one field, and the only thing that would have made it more than a field view, separating the three timestamps that all get called "last updated", serves readers better on Domain Registration Lookup where the full record is in front of them. That explanation now lives there. Do not recreate the route without a reason that is not "the reference site has one".

## Rules

- The useful input and result sit above the explanatory content.
- Use the shared Stack127 shell and a `DomainToolsSidebar` following the `DnsToolsSidebar` pattern: a clean list of routes that exist now, with no planned entries, disabled links, or coming-soon labels.
- Public explanation is server-rendered. User-requested results are client-rendered and out of search indexing.
- Findings and information boxes never use a colored left-edge line.
- Never replace technical findings with a health score, a grade, or a single badge for a domain.
- Registry evidence and registrar evidence stay visibly separate. Never present a merged object that hides which server answered.
- Unknown stays unknown. A TLD without RDAP produces "we cannot check this", never a guess and never a blank that reads as absence.
- Keep the raw RDAP response available on every result, in a collapsed disclosure, the way DNS tools keep raw provider responses.
- Every result that came from cache shows when it was fetched.
- The registry expiry date and the registrar expiry date are two separately registered RDAP fields. Never merge them.
- Treat every RDAP event as optional, including `transfer` and `reregistration`. Absence is unknown, never a default.
- Do not claim to be the only, first, or best tool of its kind. Similar tools exist and the claim is not defensible. See the positioning section of `stack127_docs/rdap.md`.
- Do not use em dashes or en dashes anywhere in page copy.

## What Every Tool Page Must Tell The Reader

Each page states these in its own words, in natural sentences, near the claim they limit rather than in one large caveat panel:

1. **Where the data came from.** The registry RDAP server, the registrar RDAP server, or both, named.
2. **Coverage.** Not every TLD publishes RDAP. When the entered TLD has no service, say so on the result instead of returning nothing. Read the counts from `coverageSummary()` in `lib/domain/bootstrap.ts`, which derives them from the committed bootstrap plus our reviewed overrides. Never hardcode a number in page copy or in a doc, because overrides change it and a stale figure contradicts a tool that just answered.
3. **Freshness.** Registries publish their own database update time. We may also be serving a cached copy. Show both.
4. **Redaction.** Contact data is mostly removed for gTLDs. This is policy, not a failure of the tool.
5. **Privacy.** The queried name is sent to the registry and registrar operating that TLD, and registration facts are cached on our server keyed by domain. Requester identifiers are processed transiently for rate limiting and are never persistently associated with a cached lookup. Use that wording, not "we do not store who asked", which the in-memory limiter makes inaccurate. See the privacy section of `stack127_docs/rdap.md`.
6. **Scope.** What the tool does not answer, linked to the tool that does.

## Before Any Tool Is Built

Three shared-engine decisions block everything and must be settled first, because getting them wrong makes every tool confidently wrong in the same way:

1. **Registrable-domain reduction.** Requires the Public Suffix List, a pinned dataset, a review process, and the ICANN-versus-private section decision. Specified in `stack127_docs/rdap.md`.
2. **Coverage as a derived value.** One `coverageSummary()`, no hardcoded counts anywhere.
3. **The global per-registry limiter and circuit breaker.** Per-visitor limiting alone is not enough.

Test fixtures come before implementation, not after. The current specification leans heavily on one domain at one registrar, which is enough to prove a shape exists and not enough to build against. The required fixture set is listed in `stack127_docs/rdap.md`.

## Publication

The hub and every complete tool slug are published only through `public.stack127_pages`, one exact row each, following the `20260712000000_publish_dns_tools.sql` and `20260713121730_publish_dns_diagnostic_tools.sql` pattern. Page files carry no metadata, canonical, robots, sitemap, or JSON-LD exports.

Each flat route also needs `tests/pages/<slug>/page.json` with at least one test file, or `npm run test:static` fails. Shared RDAP engine tests remain under `tests/pages/domain-tools/shared/` because the collection owns that technical contract.

## Build Order

1. `stack127_docs/rdap.md` engine, then Domain Registration Lookup. Everything else is a view on it.
2. EPP Status Code Explainer and Punycode Converter. Neither needs the cache to be finished and both are self-contained reference value.
3. Age, expiry, availability, registrar, last update, registrant. Cheap once the engine exists, and this is where the search traffic is.
4. Transfer Readiness and Domain Registration Report. These compose earlier work and are where the cross-engine value is.
5. TLD Directory. Needs its own data pipeline and is closer to `/self-host-apps` in shape than to a tool.
6. Multi-TLD Availability last, and deferred until the global per-registry limiter and circuit breaker in `lib/domain/throttle.ts` are built and proven. Per-visitor limiting does not protect our single outbound IP from many visitors each making one legitimate request. This tool is the one that turns that gap into an outage for every other domain tool.

## Open Decisions

- **stack127 repo.** `stack127labs/dns-tools` is an independent repository tracked in `stack127_docs/stack127-repos.md`. The private site has no local copy or runtime dependency on it. Decide whether `domain-tools` should become its own independent stack127 repo before building, because that changes how `lib/domain/` is structured.
- **IP and ASN collection placement.** Its canonical route is already planned as `/ip-asn-lookup`; decide which collections should link to it before publication.
- **TLD Directory collection placement.** Its canonical route is `/tld-directory`; it may appear in both domain and reference collections without moving.
- **Port 43 fallback.** Whether to build it at all. It closes part of the coverage gap and is the single largest piece of extra work in this plan. Decide once, in `stack127_docs/rdap.md`, not per tool.

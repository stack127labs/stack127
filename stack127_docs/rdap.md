# RDAP and registration data

This is the shared engine contract for every stack127 tool that reads domain, IP, or ASN registration data. Page-specific behavior lives in `content_docs/<tool-slug>/README.md`. This file owns the parts every tool depends on.

Status: built. RDAP is the first choice. Reviewed port-43 WHOIS services cover some of the remaining TLDs.

Protocol references were checked on 28 July 2026. Service verification dates live with each committed dataset and reviewed entry. Re-verify values that can drift.

## RDAP first, WHOIS fallback

ICANN ended the port 43 WHOIS requirement for gTLD registries and registrars on 28 January 2025. RDAP replaces it: structured JSON over HTTPS.

RDAP is defined by RFC 7480 through RFC 7484, RFC 9082, and RFC 9083. RFC 9537 covers redaction signals.

Port 43 hasn't gone away. Verisign committed to running `.com` WHOIS alongside RDAP under the November 2024 registry agreement. Many ccTLDs still offer only port 43.

So WHOIS is a documented fallback, not the main path. Never quote WHOIS when RDAP answered.

## Endpoint discovery

Find the endpoint in four layers, in order:

1. IANA bootstrap. `https://data.iana.org/rdap/dns.json` maps a TLD to RDAP base URLs. The committed file records its publication and fetch dates. The root-zone list supplies the denominator.
2. Reviewed RDAP overrides in `lib/domain/data/rdap-overrides.json`. New entries require a real domain returning HTTP 200 with a domain object and a made-up name returning 404. Record both names and the verification date. Remove overrides when IANA adds their TLD.
3. Reviewed WHOIS services in `lib/domain/data/whois-reviewed.json`. Discovery in `whois-servers.json` comes from the root TLD's `whois:` field at `whois.iana.org`. Discovery alone never enables coverage. Each reviewed entry records a real domain, a made-up name, its observed not-found pattern, its parser family and any query quirks.
4. Nothing. If no verified service is known, return `no_service`. Never guess an endpoint or use a third-party aggregator.

`registrationServiceForTld()` resolves these layers. `rdapServiceForTld()` remains an alias for existing callers. RDAP responses and failures never trigger a WHOIS hop; fallback is only for TLDs without an RDAP service. WHOIS never follows a referral or a registrar's RDAP link.

Run `npm run domain-tools:refresh-datasets` to refresh the HTTP datasets and serial WHOIS discovery, with a 700 ms pause between IANA queries. Failed discovery queries fail the command and are recorded separately. Resume with `-- --whois-only --whois-retry-failed`. An empty `whois:` line means no server; parsing must not consume the next line. IDN records use `domain-ace` or their Unicode domain name for identity checks.

Run `npm run domain-tools:refresh-tld-directory` after changing coverage. Rows expose `lookupSource` and `lookupHost`; the old `rdap` field remains a coverage-source alias and can now contain `whois`. Counts distinguish `rdapCovered`, `whoisCovered`, `lookupCovered`, and `uncovered`.

Don't route lookups through `rdap.org` or any other public redirector, for three reasons:

- It adds a dependency we don't control.
- It sees every domain our visitors type.
- Its coverage isn't better than ours. It returned 404 for both `github.io` and `example.de` when tested.

Resolving the bootstrap ourselves matches the fixed, reviewed endpoint rule already used in `lib/dns/resolvers.ts`.

Refresh the bootstrap and TLD list with a script under `scripts/domain-tools/` and commit the result. Never fetch either file during a page request.

### Coverage is computed, never a constant

Bootstrap coverage and real coverage are different numbers. The gap grows each time we add an override.

`.io` has no bootstrap entry and is checkable through a reviewed override. A page must count all verified service sources before saying how many TLDs it cannot check.

So exactly one function, `coverageSummary()` in `lib/domain/bootstrap.ts`, returns `bootstrapCovered`, `overrideCovered`, `whoisCovered`, `covered`, `uncovered`, and the check date. It computes them from the root zone and the three committed service sources.

Every page reads that function. No page hardcodes a number, and no page-owned doc should be quoted as the source of one.

For each TLD, the engine returns one of four sources. Write page copy against these states, not against a count:

| State | Meaning |
| --- | --- |
| `bootstrap` | Covered by the IANA file. |
| `override` | Covered by our reviewed override, with the operator named. |
| `whois` | Covered by a reviewed official WHOIS service. |
| `none` | No verified registration service. |

Lookup results add `coverage.host` and `registryFetch.protocol` (`rdap` or `whois`). WHOIS uses a `whois://` source URL and has no HTTP status. Existing result status values and registry/registrar source roles remain unchanged. Multi-TLD rows add `coverageSource`.

## Event actions

RDAP event actions come from the IANA RDAP JSON Values registry, not a free-text field. The full registered set, fetched from `https://www.iana.org/assignments/rdap-json-values/rdap-json-values.xml` on 28 July 2026, has twelve values:

```
registration        reregistration      last changed        expiration
deletion            reinstantiation     transfer            locked
unlocked            last update of RDAP database
registrar expiration                    enum validation expiration
```

Three of these change how the tools should be built. We used to assume all three were absent.

| Event | What it means for the tools |
| --- | --- |
| `transfer` | Some registries publish it. When present, it's the date the domain last moved between registrars. That's directly useful to Transfer Readiness and Registrar Lookup. It's optional, so absence means unknown, never "no transfer has happened". |
| `reregistration` | When present, it separates a name that was dropped and registered again from one held the whole time. That's the main caveat on Domain Age Checker. Absence still means unknown. |
| `locked` and `unlocked` | They can date a registry lock. |

Treat every action as optional. Never default a missing event to a value, and never infer one event from another.

## Registry expiry and registrar expiry are two different fields

`expiration` and `registrar expiration` are registered separately in the IANA registry above. They aren't the same fact under two names.

ICANN's RDAP Response Profile maps `expiration` to the Registry Expiry Date. It maps `registrar expiration` to the Registrar Registration Expiration Date.

The two can differ for real reasons. Most often, a renewal has been processed at one party and hasn't reached the other yet.

Keep them as two separately sourced fields, all the way through the engine and into the UI:

- Never merge them into one value.
- When only one is available, label which one it is.
- When both are available and differ, show both. Say which one the registry will act on, because that one governs deletion.

Measured against `stack127.com` on 28 July 2026:

| | registry (Verisign) | registrar (Hostinger) |
| --- | --- | --- |
| `registration` | `2026-07-03T08:37:56Z` | `2026-07-03T08:37:56+00:00` |
| `expiration` | `2027-07-03T08:37:56Z` | absent |
| `registrar expiration` | absent | `2027-07-03T08:37:56+00:00` |
| `last changed` | `2026-07-11T09:56:56Z` | absent |
| registrant entity | absent | present, redacted |
| `redacted` block | absent | present |

That's one domain at one registrar. Don't treat it as the shape of RDAP. See the fixtures section.

## Registry and registrar are two different answers

A gTLD RDAP response from the registry has a `links` entry with `rel: "related"`. It points at the registrar's own RDAP service. These rules follow:

- The registry is authoritative for the registry expiry date, status codes, nameservers, and DNSSEC delegation. Quote it for those.
- Contact structure, RFC 9537 redaction metadata, and the registrar expiry date appear only at the registrar hop. That hop is optional, slower, and less reliable than the registry. It must never block or change the registry answer.
- Thin and thick registries really are different. It's not a bug. `.com` is thin and holds no contact data at all.
- Never merge the two into one flat object that hides which server said what.

## Name normalization and the Public Suffix List

Reducing an input to the name we query is a shared engine problem, not a per-tool detail. Getting it wrong gives confidently wrong answers.

`www.example.co.uk` reduces to `example.co.uk`, not `co.uk`. No algorithm can work this out. It needs the Public Suffix List.

Settle all of these decisions before the first tool ships.

### Dataset

Use `https://publicsuffix.org/list/public_suffix_list.dat`, checked 28 July 2026 at 332 KB and 14,346 lines. Pin a committed copy with its fetch date. Never fetch it at request time.

### Update process

A script under `scripts/domain-tools/` refreshes the list. Review the diff instead of merging it blind.

A committed list that drifts silently is worse than one that's knowingly six months old. Registrable domain behavior changes under every tool at once.

### ICANN section only

The list has an `===BEGIN PRIVATE DOMAINS===` section, at line 11,277 of the current file. It covers names like `github.io` and `s3.amazonaws.com`. Use only the ICANN section.

The private section would make `github.io` a suffix. Then `myproject.github.io` would reduce to itself, and we'd query a registry for a name that has no registration. That's exactly the wrong answer.

Record this choice in a code comment. Anyone who doesn't know why will think it's a bug.

### Unknown suffixes

A TLD missing from the list isn't automatically invalid. Fall back to treating the last label as the suffix, and flag the result as a lower-confidence reduction instead of failing.

### IDN

Convert to A-label form before matching, because the list stores both forms inconsistently. Use the same RFC 3492 and UTS-46 path as the Punycode Converter. That keeps one implementation and one Unicode version across the site.

### Show the reduction

When we reduce an input, say so on the result. A reader who typed a hostname and gets registration data for a different name must be able to see why.

## Availability signals

The HTTP status is the signal. Response bodies aren't consistent:

| Server | 404 response |
| --- | --- |
| `rdap.verisign.com` | Completely empty body. |
| `rdap.publicinterestregistry.org` | Full RDAP error object. |
| `rdap.centralnic.com` | `objectClassName: "error"`. |

So read the status first. Treat a missing or unparseable body on a 404 as normal. Never require an error object to decide the name isn't registered.

Map statuses explicitly:

| Status | Meaning |
| --- | --- |
| 200 with a valid RDAP object | Registered |
| 404 | Not in this registry |
| 429 | Rate limited |
| 403 | Blocked |
| 5xx | Registry problem |
| Timeout | Unknown |

Rate limited and blocked aren't availability answers. They must never render as available.

### WHOIS answers

Only the reviewed server's anchored not-found pattern produces `not_registered`. A domain echo alone is insufficient for `registered`; require registration fields such as nameservers, registrar or a date. NIC Chile's reviewed profile permits an omitted domain echo only when registrar and nameserver fields establish a record. Quota text, access refusal, conflicting signals, reservations, empty responses and connection failures are non-answers.

The parser supports key-value, bracket and block families. It returns RDAP-shaped facts for shared normalization, labelled with the WHOIS protocol. Dates without a timezone keep calendar-day precision; ambiguous numeric dates remain null unless the server's date order was reviewed. Registry and registrar expiry stay distinct. Only exact EPP tokens map to EPP statuses. Other status text stays in `registryFetch.body.whois.rawStatuses` and does not imply a lock code.

The port-43 client sends a CRLF-terminated query, has a 4-second connect timeout and 12-second total timeout, and stops responses over 1 MB. It decodes UTF-8 first and falls back to Latin-1. Raw WHOIS text is neither cached nor returned; parsed registration facts use the existing cache.

Transfer readiness leaves lock checks unknown when WHOIS publishes no exact EPP statuses. For country-code and infrastructure endings, `policyApplies` is false and ICANN waiting-period checks remain unknown. Registry-specific rules still need to be checked with the registrar.

## Caching

The DNS tools cache nothing on purpose and send `cache-control: no-store`. RDAP has to be different. Registry servers throttle by source IP, and the whole site leaves the OVH VPS through one address.

Store responses in Postgres through `lib/db.ts`:

- Key on the normalized lowercase domain, object type, and which server answered.
- Store the RDAP response or parsed WHOIS facts, the HTTP status (null for WHOIS), and the fetch time.
- Freshness: 24 hours for a registered domain, 1 hour for a not-registered answer. Errors are not cached.
- Never cache throttles or blocks as results. The in-process breaker handles backoff.
- When the answer came from cache, show the reader the fetch time.

## Global throttling

Per-visitor rate limiting isn't enough.

The limiter in `lib/dns/rate-limit.ts` stops one visitor from hammering us. It does nothing about a hundred visitors each making one fair request to Verisign in the same minute. The shared resource is our single outbound IP address, so the limiter that matters is global and per registry.

Before any tool that fans out across registries goes live, it needs:

- A global budget per registry endpoint, shared across all visitors and tools, not keyed by client.
- A circuit breaker per endpoint. On repeated 429 or 403, open the circuit, serve cache only, and return "check failed" for uncached rows until a cooldown ends.
- Backoff per endpoint, so a throttled Verisign never blocks a `.dev` query.
- Visibility, so we know a registry has cut us off before users report it.

Both limiters run. The per-visitor one stops abuse. The global one stops us from becoming the abuser.

The shared limiter allows 60 outbound requests per host per minute, with a 20-request share per TLD. Registrar hops use the same TLD share. Three consecutive rejections open the host breaker for 60 seconds; a valid HTTP `Retry-After` pauses the host immediately, bounded to one hour. WHOIS quota and block messages feed the same breaker. This state is for one application instance; scaling requires shared state.

Before release, verify outbound TCP port 43 from the OVH application container. A successful check from a developer machine does not establish production connectivity. A failed connection returns `registry_error` or `timeout` and is never treated as availability.

## Privacy, stated accurately

The DNS pages say stack127 doesn't store lookup history. Don't copy that sentence here. Don't replace it with an equally absolute claim the other way either.

Here's what's true, and what pages should say:

- The queried name goes to the registry and registrar that run the TLD. That can't be avoided, so say it plainly.
- Registration facts are cached on our server, keyed by domain name. So the domain names people look up are stored for a limited time, with no requester attached.
- Requester identifiers are used briefly for abuse prevention. `dnsClientKey` derives a client key from the forwarded IP headers. `lib/dns/rate-limit.ts` keeps it in an in-memory map with a five-minute window. It's never written to the cache, never joined to a lookup, and never persisted.
- We don't build lookup history, don't link lookups to visitors, and don't sell or share registration data.

The accurate promise: requester identifiers are used briefly for rate limiting and are never stored alongside cached lookups. Write that, not "we do not store who asked".

When the first tool ships, update `/privacy`, not only the tool pages.

## Request discipline

- Use `readDnsJsonBody` for the bounded request body, or a `lib/domain/` equivalent with the same 4096-byte cap.
- Use `isSameOriginDnsRequest` and `dnsClientKey` for origin and client identity.
- Run both limiters described above.
- Send `Accept: application/rdap+json` and a stack127 user agent with a contact URL.
- Limit response size, timeout, and redirect depth. Never follow a redirect to a host outside the reviewed set.
- Reject non-public and malformed hostnames before any outbound call.
- Never return upstream stack traces, socket details, or filesystem paths.

## IP and ASN

The same bootstrap mechanism covers network objects: `ipv4.json`, `ipv6.json`, `asn.json`, and `object-tags.json` under `https://data.iana.org/rdap/`. All four returned 200 when checked.

A query for `1.1.1.1` returns handle `1.1.1.0 - 1.1.1.255`, name `APNIC-LABS`, country `AU`, type `ASSIGNED PORTABLE`.

This is registration and allocation data, not geolocation. The country field is the registered country of whoever holds the allocation.

The existing Team Cymru ASN enrichment in `lib/dns/network-enrichment.ts` answers a different question: BGP origin. Keep the two separate.

## Test fixtures

The spec above leans hard on one domain at one registrar. That proves the shape exists, but it's nowhere near enough to build against.

Before implementation, capture a committed fixture set under `tests/pages/domain-tools/shared/fixtures/`. Record each response exactly, with its fetch date.

Required coverage:

| fixture | why |
| --- | --- |
| thin gTLD registry, `.com` | no contact data at registry, `expiration` present |
| thick gTLD registry | contact data at the registry, different entity shape |
| registrar hop | `registrar expiration`, RFC 9537 `redacted`, jCard |
| ccTLD via bootstrap, `.nl`, `.fr`, `.au` | non-ICANN profiles, different fields |
| ccTLD via override, `.io` | override path exercised |
| TLD with no RDAP, `.de` | the `none` coverage state |
| IDN domain | A-label and U-label round trip |
| domain with a `transfer` event | the newly discovered path |
| domain with a `reregistration` event | age caveat handling |
| conflicting registry and registrar expiry | the two-field rule |
| missing `last changed` | unknown, not "never" |
| expired domain in `redemptionPeriod` | lifecycle statuses |
| 404 with empty body, Verisign | availability parsing |
| 404 with RDAP error object, PIR | availability parsing |
| 429 and 403 responses | never render as available |
| one allocation per RIR, all five | IP lookup field variation |
| ASN response | ASN path |

Tests run against fixtures, not the live network. Add one separate, clearly marked contract test that hits real endpoints on demand. That catches drift without making the suite depend on five registries being up.

## Positioning, stated honestly

stack127 isn't first here, and page copy must not suggest it is. Tools with overlapping goals already exist (checked 28 July 2026):

- `query.domains/tools` publishes a similar set split by intent.
- `rdap.com` offers direct registry lookups.
- ICANN publishes a good EPP status code explainer.
- `deployment.rdap.org` tracks RDAP deployment across TLDs, which overlaps the TLD Directory.

Don't write "nobody else", "every other tool", "the only tool that", or "no one maintains". Those claims can't be defended, and they age badly. `stack127_docs/writing-style.md` already forbids claims stronger than the source proves.

Here's what we can say, because it's true and checkable:

- We separate registry evidence from registrar evidence.
- We report unknown as unknown.
- We combine registration data with our own DNS engine.
- We explain the result instead of printing fields.

Let the pages show that instead of claiming it.

## Files this engine will own

```
lib/domain/bootstrap.ts        parsed IANA bootstrap, overrides, coverageSummary()
lib/domain/public-suffix.ts    pinned PSL, ICANN section, registrable-domain reduction
lib/domain/rdap.ts             fetch, status mapping, size and time bounds
lib/domain/normalize.ts        events, status codes, entities, nameservers
lib/domain/redaction.ts        RFC 9537 redacted array to readable statements
lib/domain/vcard.ts            jCard array to named fields
lib/domain/cache.ts            Postgres read through cache
lib/domain/throttle.ts         global per-registry budget and circuit breaker
lib/domain/transfer-policy.ts  versioned ICANN transfer rules, see transfer-readiness
lib/domain/types.ts            normalized result types
lib/domain/whois.ts            port 43 fallback, only if we decide to build it
app/api/domain/*/route.ts      one route per tool, same shape as app/api/dns
scripts/domain-tools/          bootstrap, TLD list, PSL, and Unicode data refresh
```

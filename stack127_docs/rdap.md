# RDAP And Registration Data

This is the shared engine contract for every stack127 tool that reads domain, IP, or ASN registration data. Page-specific behavior lives in `content_docs/<tool-slug>/README.md`. This file owns the parts they all depend on.

Status: plan. Update this file to describe the implemented engine once `lib/domain/` exists.

Every fact below was verified against a primary source on 28 July 2026. Where a value can drift, the source and check date are recorded so the next person can re-verify rather than trust.

## Why RDAP And Not WHOIS

ICANN sunset the port 43 WHOIS requirement for gTLD registries and registrars on 28 January 2025. RDAP is the successor: structured JSON over HTTPS, defined by RFC 7480 through RFC 7484, RFC 9082, and RFC 9083, with redaction signalling in RFC 9537.

Port 43 has not disappeared. Verisign committed to running `.com` WHOIS alongside RDAP under the November 2024 registry agreement, and many ccTLDs still only offer port 43. So WHOIS is a documented fallback, not the primary path, and never the source we quote when RDAP answered.

## Endpoint Discovery

Three layers, in order:

1. **IANA bootstrap.** `https://data.iana.org/rdap/dns.json` maps a TLD to one or more RDAP base URLs. Checked 28 July 2026: publication `2026-07-23`, 590 service entries, 1,200 distinct TLDs.
2. **Reviewed overrides.** The root zone had 1,438 TLDs on 27 July 2026 (`https://data.iana.org/TLD/tlds-alpha-by-domain.txt`, version `2026072601`), so 238 have no bootstrap entry. Some of those still run RDAP. `.io` is the important one: no bootstrap entry, but `https://rdap.identitydigital.services/rdap/domain/github.io` returned 200. Overrides are a hand reviewed file in the repo, not something discovered at request time.
3. **Nothing.** If neither layer knows the TLD, the answer is unknown. Do not guess a URL from the registry name and do not fall back to a third-party aggregator to make the page look complete.

Do not route lookups through `rdap.org` or any other public redirector. It adds a dependency we do not control, it sees every domain our visitors type, and its coverage is not better than ours: it returned 404 for both `github.io` and `example.de` when tested. Resolving the bootstrap ourselves matches the fixed reviewed endpoint rule already used in `lib/dns/resolvers.ts`.

Refresh the bootstrap and TLD list with a script under `scripts/domain-tools/`, commit the result, and never fetch either file during a page request.

### Coverage is derived, never a constant

Bootstrap coverage and real coverage are different numbers, and the difference grows every time we add an override. `.io` is in the 238 without a bootstrap entry and is also checkable. Both statements are true, and a page that prints "we cannot check 238 TLDs" while successfully checking `.io` is contradicting itself.

So there is exactly one function, `coverageSummary()` in `lib/domain/bootstrap.ts`, that returns the covered count, the uncovered count, and the check date, computed from the committed bootstrap plus the committed overrides. Every page reads it. No page hardcodes a number, and no page-owned doc should be quoted as the source of one.

Per TLD, the engine returns one of three states, and page copy is written against these rather than against a count:

- `bootstrap`, covered by the IANA file
- `override`, covered by our reviewed override with the operator named
- `none`, no known RDAP service

Add a test that fails if any route source contains a hardcoded coverage number.

## Event Actions

RDAP event actions come from the IANA RDAP JSON Values registry, not from a free-text field. The complete registered set, fetched from `https://www.iana.org/assignments/rdap-json-values/rdap-json-values.xml` on 28 July 2026, is twelve values:

```
registration        reregistration      last changed        expiration
deletion            reinstantiation     transfer            locked
unlocked            last update of RDAP database
registrar expiration                    enum validation expiration
```

Three of these change how the tools should be built, and all three were previously assumed absent:

- **`transfer` exists.** Some registries publish it. When present it is the date the domain last moved between registrars, which is directly useful to Transfer Readiness and Registrar Lookup. It is optional, so absence means unknown and never "no transfer has happened".
- **`reregistration` exists.** When present it distinguishes a name that was dropped and registered again from one held continuously, which is the central caveat on Domain Age Checker. Absence still means unknown.
- **`locked` and `unlocked` exist** and can date a registry lock.

Handle every action as optional. Never default a missing event to a value, and never infer one event from another.

## Registry Expiry And Registrar Expiry Are Two Different Fields

`expiration` and `registrar expiration` are separately registered values in the IANA registry above. They are not the same fact under two names. ICANN's RDAP Response Profile maps `expiration` to the Registry Expiry Date and `registrar expiration` to the Registrar Registration Expiration Date, and the two can legitimately differ, most often when a renewal has been processed at one party and not yet reflected at the other.

Keep them as two independently sourced fields all the way through the engine and into the UI. Never coalesce them into one value. When only one is available, label which one it is. When both are available and they differ, show both and say which the registry will act on, because that is the one that governs deletion.

Measured against `stack127.com` on 28 July 2026:

| | registry (Verisign) | registrar (Hostinger) |
| --- | --- | --- |
| `registration` | `2026-07-03T08:37:56Z` | `2026-07-03T08:37:56+00:00` |
| `expiration` | `2027-07-03T08:37:56Z` | absent |
| `registrar expiration` | absent | `2027-07-03T08:37:56+00:00` |
| `last changed` | `2026-07-11T09:56:56Z` | absent |
| registrant entity | absent | present, redacted |
| `redacted` block | absent | present |

That is one domain at one registrar and it must not be treated as the shape of RDAP. See the fixtures section.

## Registry And Registrar Are Two Different Answers

A gTLD RDAP response from the registry carries a `links` entry with `rel: "related"` pointing at the registrar's own RDAP service. Rules that follow:

- The registry is authoritative for the registry expiry date, status codes, nameservers, and DNSSEC delegation. Quote it for those.
- The registrar hop is the only place contact structure, RFC 9537 redaction metadata, and the registrar expiry date appear. It is optional, slower, and less reliable than the registry, so it must never block or change the registry answer.
- Thin versus thick registries are a real difference, not a bug. `.com` is thin and holds no contact data at all.
- Never merge the two into one flattened object that hides which server said what.

## Name Normalization And The Public Suffix List

Reducing an input to the name we query is a shared-engine problem, not a per-tool detail, and getting it wrong produces confidently wrong answers. `www.example.co.uk` reduces to `example.co.uk`, not `co.uk`. There is no algorithm for this; it requires the Public Suffix List.

The decisions, all of which must be settled before the first tool ships:

**Dataset.** `https://publicsuffix.org/list/public_suffix_list.dat`, verified 28 July 2026 at 332 KB and 14,346 lines. Pin a committed copy with its fetch date. Never fetch it at request time.

**Update process.** A script under `scripts/domain-tools/` refreshes it, and the diff is reviewed rather than merged blind. A committed list that silently drifts is worse than one that is knowingly six months old, because registrable-domain behavior changes underneath every tool at once.

**ICANN section only.** The list has an `===BEGIN PRIVATE DOMAINS===` section, at line 11,277 of the current file, covering things like `github.io` and `s3.amazonaws.com`. Use the ICANN section only. The private section would make `github.io` a suffix, so `myproject.github.io` would reduce to itself and we would query a registry for a name that has no registration. That is exactly the wrong answer. Record this choice in code with a comment, because it looks like a bug to anyone who does not know why.

**Unknown suffixes.** A TLD absent from the list is not automatically invalid. Fall back to treating the last label as the suffix, and flag the result as a lower-confidence reduction rather than failing.

**IDN.** Convert to A-label form before matching, since the list stores both forms inconsistently. Use the same RFC 3492 and UTS-46 path as the Punycode Converter, so there is one implementation and one Unicode version across the site.

**Show the reduction.** When we reduce an input, say so on the result. A reader who typed a hostname and gets registration data for a different name must be able to see why.

## Availability Signalling

HTTP status is the signal. Response bodies are not consistent:

- `rdap.verisign.com` returned 404 with a completely empty body.
- `rdap.publicinterestregistry.org` returned 404 with a full RDAP error object.
- `rdap.centralnic.com` returned 404 with `objectClassName: "error"`.

So parse the status first, treat a missing or unparseable body on a 404 as normal, and never require an error object to conclude the name is not registered.

Map statuses explicitly: 200 registered, 404 not in this registry, 429 rate limited, 403 blocked, 5xx registry problem, timeout unknown. Rate limited and blocked are not availability answers and must never render as available.

## Caching

The DNS tools deliberately cache nothing and send `cache-control: no-store`. RDAP has to be different, because registry servers throttle by source IP and our entire site leaves the OVH VPS through one address.

Store responses in Postgres through `lib/db.ts`:

- Key on normalized lowercase domain, object type, and which server answered.
- Store the raw response, the HTTP status, and the fetch time.
- Suggested freshness: 24 hours for a registered domain, 1 hour for a not-registered answer, 5 minutes for an error.
- Never cache 429 or 403 as a result. Cache only that we were throttled, so we back off.
- Show the reader the fetch time when the answer came from cache.

## Throttling, Globally

Per-visitor rate limiting is not sufficient. The limiter in `lib/dns/rate-limit.ts` stops one visitor from hammering us; it does nothing about a hundred visitors each making one legitimate request to Verisign in the same minute. The shared resource being protected is our single outbound IP address, so the limiter that matters is global and per registry.

Required before any tool that fans out across registries goes live:

- A global per-registry-endpoint budget, shared across all visitors and all tools, not keyed by client.
- A circuit breaker per endpoint. On repeated 429 or 403, open the circuit, serve cache only, and return "check failed" for uncached rows until a cooldown expires.
- Backoff that is per endpoint, so a throttled Verisign never blocks a `.dev` query.
- Visibility, so we can tell that a registry has cut us off rather than discovering it from user reports.

Both limiters run. The per-visitor one prevents abuse; the global one prevents us becoming the abuser.

## Privacy, Stated Accurately

The DNS pages say Stack127 does not store lookup history. Do not copy that sentence here, and do not replace it with an equally absolute claim in the other direction.

What is actually true, and what pages should say:

- The queried name is sent to the registry and registrar that operate the TLD. That is unavoidable and should be stated plainly.
- Registration facts are cached on our server, keyed by domain name. So the domain names people look up are stored, for a bounded time, without any requester attached.
- Requester identifiers are processed transiently for abuse prevention. `dnsClientKey` derives a client key from the forwarded IP headers, and `lib/dns/rate-limit.ts` holds it in an in-memory map with a five minute window. It is never written to the cache, never joined to a lookup, and never persisted.
- We do not build lookup history, do not associate lookups with visitors, and do not sell or share registration data.

The accurate promise is that requester identifiers are used temporarily for rate limiting and are never persistently associated with cached lookups. Write that, not "we do not store who asked". Update `/privacy` when the first tool ships rather than only the tool pages.

## Request Discipline

- `readDnsJsonBody` for the bounded request body, or its `lib/domain/` equivalent with the same 4096 byte cap.
- `isSameOriginDnsRequest` and `dnsClientKey` for origin and client identity.
- Both limiters described above.
- Send `Accept: application/rdap+json` and a Stack127 user agent with a contact URL.
- Bound response size, timeout, and redirect depth. Never follow a redirect to a host outside the reviewed set.
- Reject non-public and malformed hostnames before any outbound call.
- Never return upstream stack traces, socket details, or filesystem paths.

## IP And ASN

The same bootstrap mechanism covers network objects: `ipv4.json`, `ipv6.json`, `asn.json`, and `object-tags.json` under `https://data.iana.org/rdap/`. All four returned 200 when checked. A query for `1.1.1.1` returns handle `1.1.1.0 - 1.1.1.255`, name `APNIC-LABS`, country `AU`, type `ASSIGNED PORTABLE`.

This is registration and allocation data. It is not geolocation, and the country field is the registered country of the allocation holder. The existing Team Cymru ASN enrichment in `lib/dns/network-enrichment.ts` answers a different question, BGP origin, and the two stay separate.

## Test Fixtures

The specification above leans heavily on one domain at one registrar. That is enough to prove the shape exists and nowhere near enough to build against. Capture a committed fixture set under `tests/pages/domain-tools/shared/fixtures/` before implementation, with each response recorded verbatim alongside its fetch date.

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

Tests run against fixtures, not the live network. Add one separate, clearly marked contract test that hits real endpoints on demand, so drift is detectable without making the suite depend on five registries being up.

## Positioning, Stated Honestly

Stack127 is not first here and page copy must not imply otherwise. Tools with overlapping intent already exist, checked 28 July 2026: `query.domains/tools` publishes a similar intent-separated set, `rdap.com` offers direct registry lookups, ICANN publishes a good EPP status code explainer, and `deployment.rdap.org` tracks RDAP deployment across TLDs, which overlaps the TLD Directory.

Do not write "nobody else", "every other tool", "the only tool that", or "no one maintains". Those claims are not defensible, they age badly, and `stack127_docs/writing-style.md` already forbids claims stronger than the source proves.

What we can say, because it is true and checkable: we separate registry evidence from registrar evidence, we report unknown as unknown, we combine registration data with our own DNS engine, and we explain the result rather than printing fields. Let the pages demonstrate that instead of claiming it.

## Files This Engine Will Own

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

# Multi-TLD Availability

Route: `/multi-tld-availability`

Publication state: controlled by the exact `multi-tld-availability` row in `public.stack127_pages`.

Status: plan.

## Purpose

Check one name across a small set of TLDs at once, against the registries, without a registrar trying to sell the result.

Ship this last, and not until `lib/domain/throttle.ts` exists. This is the tool most likely to get our outbound IP throttled or blocked by a registry, and a block breaks every other domain tool at the same time.

The blocker is specific: the per-visitor limiter in `lib/dns/rate-limit.ts` is not sufficient protection. It stops one visitor from hammering us and does nothing about a hundred visitors each making one legitimate request to Verisign in the same minute. A global per-registry budget and a circuit breaker, shared across all visitors and all tools, must be built and proven under real traffic on the single-domain tools before this route is published.

## Input

- One name without a TLD, for example `stack127`.
- A TLD selection.

Do not offer a free-text list of arbitrary TLDs and do not offer "check all". Offer a fixed reviewed set with a hard cap.

Suggested default set, all RDAP-covered and verified in the bootstrap on 28 July 2026: `com`, `net`, `org`, `dev`, `app`, `ai`, `xyz`, `info`, `biz`, `in`. Allow the reader to change the selection within a cap of twelve.

Deliberately excluded from the default set are `io`, `co`, and `me`, which readers will expect. `io` works only through our reviewed override and the others have no RDAP service at all, so including them means shipping a row that says "cannot check" every time. Offer them as selectable with the limitation shown, or leave them out entirely; decide when building and record the choice here.

## What the result shows

One row per TLD, in the order selected, each row settling independently as its query returns rather than the whole table waiting for the slowest registry.

Four states, and the last two must never look like the first:

- **not registered**, with the same reserved and premium caveat that Domain Availability Checker carries
- **registered**, with the registrar and expiry date, linking to Domain Registration Lookup
- **cannot check**, for a TLD with no RDAP service, stated as a coverage gap
- **check failed**, for a timeout, throttle, or registry error, stated as our failure and offering a retry for that row only

Never leave a failed row blank and never render a failure as available. A single wrong "available" on this page is worse than the page not existing, because the reader acts on it.

No prices, no registrar links, no affiliate links, no "buy" buttons, no name suggestions, no availability score.

## Engine

One RDAP query per selected TLD, run concurrently with a bounded concurrency of about four, not all at once. Each row is independent and one failure never fails the set.

Rate limiting is the whole design constraint, and it takes two limiters:

- **Per visitor.** Cost one unit per TLD queried against the weighted limiter in `lib/dns/rate-limit.ts`, so a twelve TLD check costs twelve units and one person cannot run this repeatedly.
- **Global, per registry endpoint.** A budget shared across all visitors and all domain tools, plus a circuit breaker that opens on repeated 429 or 403, serves cache only while open, and closes after a cooldown. This is the one that actually protects us, because the resource under pressure is our single outbound IP address, not any individual visitor's quota.

Also:

- Read every query through the cache first. A popular name checked by many visitors should mostly hit cache.
- Cache not-registered answers only briefly, since that is the answer people act on.
- Bound concurrency to about four, not all at once.
- Back off per endpoint. A 429 from Verisign must not stop the `.dev` query.
- When a circuit is open, show "check failed" for its rows rather than retrying into a longer block.

Registries throttle by source IP and our whole site leaves the OVH VPS through one address, so throttling is a shared failure, not a per-visitor one. That is why the global limiter is a prerequisite rather than a refinement.

## What this tool cannot do

Everything Domain Availability Checker cannot do applies here unchanged. Do not restate all of it; link there and repeat only the two that matter most in a multi-TLD context:

- **Not registered does not mean purchasable.** Reserved names, registry blocklists, and premium pricing are invisible, and premium pricing is far more common on the newer TLDs that people check in a set like this. A name free across ten TLDs may be priced at four figures on several of them.
- **A free answer can be stale.** Results may be served from cache and registration state changes suddenly.

Additionally:

- **It cannot check TLDs with no RDAP service**, which is most of the ccTLDs people want, so this tool is structurally biased toward gTLDs. State that rather than letting the TLD selection imply the internet is only gTLDs. Read coverage from `coverageSummary()`.
- **It is not a domain search or a name generator.** It does not suggest alternatives, score names, or check social handles.
- **It is not bulk checking.** One name across several TLDs, not a list of names. A paste-a-list feature multiplies the throttling risk and is not in this plan.

## What the page must tell the reader

- That each row states its own outcome, and that "cannot check" and "check failed" are different from "available".
- Which TLDs are unavailable to check at all, and why, linked to TLD Directory.
- That premium pricing exists and is invisible here, stated on the page rather than only in a footer, because this is the page where people plan a purchase.
- That results may come from cache, with the fetch time shown.
- That we query registries directly, sell nothing, and do not build a history of the names people check. Registration facts are cached by domain name for a bounded time; requester identifiers are used transiently for rate limiting and are never joined to a lookup. The registry operating each TLD does see the query, which is unavoidable.
- The per-check cap, plainly, so a throttled reader understands why rather than assuming the tool is broken.

## Content flow

1. Title and a paragraph on what the tool checks and against what.
2. The name field and the TLD selection.
3. The results table, rows settling independently.
4. One divider.
5. Why a free name may still not be registerable, with premium pricing on new TLDs as the concrete case.
6. Why we cap the check and cannot cover every TLD, which turns our limitation into a useful explanation of how RDAP coverage works.
7. Links to Domain Availability Checker, Domain Registration Lookup, and TLD Directory.

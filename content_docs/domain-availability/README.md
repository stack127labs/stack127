# Domain Availability Checker

Route: `/domain-availability`

Publication state: controlled by the exact `domain-availability` row in `public.stack127_pages`.

Status: plan.

## Purpose

Tell someone whether a domain name currently exists in its registry, using the registry itself rather than a reseller's search box.

The angle that makes this worth building is trust. Most availability checkers belong to a registrar and are trying to sell the name, and searched names leaking to front-runners is a long-standing suspicion in the domain community. Ours queries the registry, sells nothing, and says plainly what it does with the name you typed. Neutral registry-backed lookups do exist elsewhere, so the page should demonstrate that rather than claim to be alone.

## Input

One domain name, normalized as elsewhere. A name with no TLD is rejected with a prompt to include one, and the reader is pointed at Multi-TLD Availability if they want to try several.

## What the result shows

Three possible answers, and they must be visually distinct without a colored left edge or a large panel.

**Not registered.**

```
stack127-example-name.com is not registered. The .com registry has no record
for it, which usually means it can be registered, but see the note below on
reserved and premium names.
```

**Registered.**

```
stack127.com is registered. It was created on 3 July 2026 and expires on
3 July 2027, through HOSTINGER operations, UAB.
```

When it is registered, show enough to be useful rather than a dead end: creation and expiry dates, registrar, and the lifecycle status when the domain is expired or in redemption, because that is exactly the reader who wants it. Link to Domain Expiry Checker.

**Cannot tell.** Throttled, blocked, timed out, or a TLD with no RDAP service. This must never render as available. Say which of those happened.

Do not add a registrar affiliate link, a price, a "buy now" button, or a suggestions list of alternative names. If we ever add a link to register a name, it is one neutral, unpaid, clearly labelled link, and that is a separate decision from this plan.

## Engine

HTTP status from the registry RDAP query is the signal, per `stack127_docs/rdap.md`:

- 200 registered
- 404 not in this registry
- 429 rate limited, not an answer
- 403 blocked, not an answer
- 5xx or timeout, registry problem, not an answer

Response bodies are not consistent and must not be relied on. Verified 28 July 2026: `rdap.verisign.com` returned 404 with a completely empty body, while `rdap.publicinterestregistry.org` and `rdap.centralnic.com` returned 404 with full RDAP error objects. Parse the status, tolerate an empty or unparseable body on 404, and never require an error object to conclude the name is free.

Cache a not-registered answer for a short window only, on the order of an hour. Registration state is the one fact in this folder that changes suddenly, and a stale free answer is the worst thing this page can produce.

## What this tool cannot do

The gap between "not in the registry" and "you can buy this" is the whole risk of this page.

- **Not registered does not mean purchasable.** Registries reserve names. Two-letter names, country names, ICANN-reserved strings, and registry-specific blocklists all return 404 while being unregisterable.
- **Premium pricing is invisible here.** Plenty of unregistered names are priced at hundreds or thousands by the registry. RDAP says nothing about price.
- **A name in redemption returns 200 and is not available**, but a name that has just completed pending delete returns 404 and is very likely to be caught by a drop catcher within seconds. Availability at this instant is not availability when you get to checkout.
- **Trademark and dispute exposure is invisible.** A free name can still be one you should not register.
- **We cannot check a TLD with no RDAP service.** For those, this tool returns "cannot check" rather than falling back to a DNS guess. Read coverage from `coverageSummary()`; never quote a fixed count in page copy.
- **A DNS lookup is not an availability check** and we do not use one. A registered domain with no nameservers resolves to nothing, and an unregistered name under a wildcard TLD can appear to resolve. We say this on the page because it is the mistake people make when they check availability by visiting the URL.

## What the page must tell the reader

- That a not-registered result means the registry has no record, and that reserved, premium, and blocked names look identical to available ones from here.
- That we check with the registry directly, sell nothing, and do not build a history of the names people type. Registration facts are cached by domain name for a bounded time, requester identifiers are used transiently for rate limiting only, and the two are never joined. Say it in those terms, because this is the specific fear that brings people to a non-registrar checker and an overclaim here is worse than a careful sentence. Note honestly that the registry operating the TLD does see the query, since that is unavoidable.
- That registration facts are cached briefly, with the fetch time shown, and that a free answer can be minutes stale.
- That a registered result is not a dead end, with the expiry and lifecycle path offered.
- That this is not a domain search or a name generator and does not suggest alternatives.

## Content flow

1. Title and a paragraph on what the tool checks and against what.
2. The form.
3. The answer, with supporting registration detail when registered.
4. One divider.
5. What "not registered" really covers: reserved, premium, blocked, and just-dropped. This is the core of the page and deserves examples rather than a list.
6. Why checking by visiting the URL or running a DNS lookup gives wrong answers, with the wildcard and no-nameserver cases named.
7. What to do next if the name is taken, kept short and neutral: check expiry, check whether it is parked, and accept that most good names are held.
8. Coverage, our privacy position, freshness, and links to Multi-TLD Availability and Domain Registration Lookup.

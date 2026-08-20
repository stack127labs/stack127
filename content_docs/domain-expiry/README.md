# Domain Expiry Checker

Route: `/domain-expiry`

Publication state: controlled by the exact `domain-expiry` row in `public.stack127_pages`.

Status: plan.

## Purpose

Show when a domain's registry expiry date falls, and explain what happens after it, which is the part almost nobody knows.

Two readers arrive here. One owns the domain and wants to know how long they have. The other wants somebody else's domain and wants to know when it might drop. The page serves both with the same answer, because the lifecycle after expiry is the same either way.

The lifecycle explanation is what earns this its own route. Domain Registration Lookup shows the date. This page shows what the date leads to.

## Input

One domain name, normalized as elsewhere. No other controls.

## What the result shows

Lead with time remaining, then the date, then where the domain currently sits in its lifecycle.

```
stack127.com expires in 11 months, on 3 July 2027. The registry has no
expiry-related status on it, so it is in normal registered state.
```

When a domain is past its expiry date, the status codes tell us where it is, and that becomes the lead:

```
example.com passed its registry expiry date on 12 June 2026. The registry has it
in redemptionPeriod, which means it was deleted and the registrant can still
restore it by paying a redemption fee. It is not available to register.
```

Alongside:

- the registry expiry date from the `expiration` event, as published and in UTC
- the registrar expiry date from the `registrar expiration` event, shown as its own field and never merged into the one above
- days remaining, or days elapsed if past, computed from the registry date because that is the one the registry acts on
- every EPP status code relevant to the lifecycle, in plain language: `autoRenewPeriod`, `redemptionPeriod`, `pendingDelete`, `pendingRestore`, `clientHold`, `serverHold`
- the same three-point time path as Domain Age Checker, reused rather than reinvented

A lifecycle diagram below the result, showing the stages in order with their durations. This is the highest value visual on the page.

## The lifecycle we describe

For gTLDs under ICANN policy:

| stage | typical duration | what it means |
| --- | --- | --- |
| registered | up to 10 years | normal |
| auto-renew grace | up to 45 days | registry has renewed it; registrar decides whether to bill or delete |
| redemption grace period | 30 days | deleted, restorable by the registrant for a fee, not registerable by anyone else |
| pending delete | 5 days | no longer restorable, not yet released |
| released | immediate | anyone can register it |

Say "typical" and mean it. The 30 day redemption period and 5 day pending delete are ICANN requirements for gTLD registries. The auto-renew grace period is up to 45 days and registrars use it differently, some deleting on day 1 and some on day 40. ccTLDs run their own lifecycles entirely and several do not resemble this at all.

## Engine

The `expiration` event from the registry, the `registrar expiration` event from the registrar hop, plus the status codes. No computation beyond the date difference.

`expiration` and `registrar expiration` are separately registered RDAP event actions mapping to the Registry Expiry Date and the Registrar Registration Expiration Date. They are two fields, not one field with two spellings, and the engine keeps them independently sourced per `stack127_docs/rdap.md`.

When both are present and they differ, show both and say the registry date is the one that governs deletion. A gap usually means a renewal has been processed at one party and not yet reflected at the other, and it is worth surfacing rather than hiding, because a reader relying on the later of the two can lose the name.

Compute time remaining fresh at request time from the cached RDAP response, never cache the computed value.

## What this tool cannot do

- **It cannot tell you when a domain will become available.** The stages above are the shape, not a schedule. Registrars choose when to delete within the grace period, some registries batch releases, and expired domains are routinely caught by drop-catching services in the same second they release. Never render a predicted availability date.
- **It cannot tell you whether auto-renew is on.** That is a registrar account setting with no RDAP representation. Someone whose domain "expires in 3 days" may have auto-renew enabled and nothing to do.
- **It cannot tell you if the card on file will work.** The most common cause of a lost domain is a failed payment, and it is invisible here.
- **It cannot check a TLD with no RDAP service.** Read coverage from `coverageSummary()`; never quote a fixed count in page copy.
- **Some registries do not publish an expiry date at all**, including several ccTLDs that do run RDAP. Unknown, not "expired".
- It cannot show the registrar's internal expiry or grace policy, which is what actually determines whether a late renewal works.

## What the page must tell the reader

- That expiry does not mean the name becomes available on that date, with the lifecycle diagram as the proof.
- That auto-renew status is invisible to this tool, so an approaching date is not automatically a problem.
- That a domain in `redemptionPeriod` is not available and that restoring it costs meaningfully more than a renewal, typically a registry redemption fee on top of the registrar's charge.
- Which server published the date and when we fetched it.
- That waiting for a valuable domain to drop is a competitive business and this tool is not an advantage in it.

## Content flow

1. Title and a paragraph on what the tool returns.
2. The form.
3. Time remaining, the date, current lifecycle position.
4. One divider.
5. The lifecycle, as a diagram followed by prose explaining each stage. Do not turn each stage into a card.
6. What to do if you own the domain: where the real risk is, which is payment and contact email rather than the date.
7. What to expect if you want somebody else's domain, honestly, including that drop catching exists.
8. Coverage, ccTLD differences, freshness, privacy, and links to Domain Registration Lookup and EPP Status Code Explainer.

# Registrar Lookup

Route: `/domain-tools/domain-registrar`

Publication state: controlled by the exact `domain-tools/domain-registrar` row in `public.version127_pages`.

Status: plan.

## Purpose

Show which registrar a domain is registered through, and give the reader what they came for next: the abuse contact, the transfer route, or the account they forgot they had.

Nobody looks up a registrar out of curiosity. They are reporting abuse, taking over a domain from a former employee or agency, or trying to remember where they bought it. The page is built around those three, which is what earns it a route separate from Domain Registration Lookup.

## Input

One domain name, normalized as elsewhere.

## What the result shows

```
version127.com is registered through HOSTINGER operations, UAB, IANA registrar
ID 1636. The registry record was last changed on 11 July 2026.
```

Then:

- registrar name exactly as published, with the IANA registrar ID
- abuse contact email and phone when published, which ICANN requires accredited registrars to publish
- the registrar's RDAP or WHOIS URL and its website when available
- reseller name when the registry publishes one, clearly labelled as different from the registrar
- the registry that operates the TLD, named, because readers confuse the two constantly
- the `transfer` event date when the registry publishes one, which dates the last registrar change directly
- last changed date, shown as a weaker signal and never labelled as a transfer date

Show the registry and registrar as two named parties with a small visual of who does what. That relationship is the confusion this page exists to fix.

## Engine

The registrar entity from the registry RDAP response, identified by `roles` containing `registrar`. The IANA ID is the entity `handle`. Verified on `version127.com`: handle `1636`, `fn` value `HOSTINGER operations, UAB`.

Abuse contact usually lives on a nested entity with role `abuse` inside the registrar entity. Look for it there and fall back to the registrar hop when the registry does not carry it.

Match the IANA ID against a committed copy of the ICANN accredited registrar list, refreshed by a script under `scripts/domain-tools/`, so we can show a stable canonical name for registrars whose published `fn` varies. Never fetch that list during a request.

## What this tool cannot do

- **It cannot tell you which reseller you bought from.** Many domains are sold through resellers that share one registrar. A domain showing "Tucows" or "PDR" may have been bought from a hosting company whose name appears nowhere in the record. This is the single most common disappointment on this page and it needs to be answered on the page, not buried.
- **It cannot tell you your account username or which email address the account uses.**
- **It cannot recover access.** Only the registrar can, and only through their own verification.
- **It cannot always tell you when the domain moved to this registrar.** `transfer` is a registered RDAP event action and some registries publish it, in which case we show the date. Many omit it, and then the move is invisible: `last changed` moves for many reasons, including a nameserver edit, and must not be read as a transfer date.
- **It cannot tell you whether the registrar is good.** We do not rate registrars and we do not link affiliate offers.
- **It cannot check a TLD with no RDAP service.** Read coverage from `coverageSummary()`; never quote a fixed count in page copy.

## What the page must tell the reader

- The registry and the registrar are different parties with different jobs, and the reader almost certainly wants the registrar.
- If the registrar name is unfamiliar, a reseller is the likely explanation, and the practical next step is to search the registrar's name plus "reseller lookup" or contact them with the domain name.
- The abuse contact is for abuse reports, meaning phishing, malware, and spam originating from the domain. It is not support, and using it for a support question gets ignored.
- Where the transfer path goes, with a link to Domain Transfer Readiness.
- Which server published the data and when it was fetched.

## Content flow

1. Title and a paragraph on what the tool returns.
2. The form.
3. The registrar answer with abuse contact and links.
4. One divider.
5. Registry, registrar, and reseller as three roles, with the small visual. This is the explanation the page exists for.
6. Reporting abuse: what the abuse contact is for, what to include, and what to expect. Name ICANN's complaint route for a registrar that does not respond.
7. Regaining access to a domain you own but cannot reach, kept realistic about what the registrar will require.
8. Coverage, freshness, privacy, and links to Domain Registration Lookup and Domain Transfer Readiness.

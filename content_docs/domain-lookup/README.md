# Domain Registration Lookup

Route: `/domain-lookup`

Publication state: controlled by the exact `domain-lookup` row in `public.stack127_pages`.

Status: plan.

## Purpose

Show everything the registry and registrar publish about one domain's registration: who it is registered through, when it was created, when it expires, what the registry will currently allow, which nameservers are on record, and what contact data has been withheld.

This is the flagship. Every other tool in this folder is a scoped view of this response, so this page is where the complete answer and the complete explanation live.

The reader's question is: what is the current registration state of this name, and can I trust what I am seeing?

## Input

One domain name. Accept and normalize:

- a bare registrable name, `stack127.com`
- a hostname, `www.stack127.com`, reduced to its registrable domain with a visible note that we did so
- an HTTP or HTTPS URL, hostname extracted
- a Unicode IDN, converted to A-label before the query, with both forms shown

Reduction to the registrable domain uses the pinned Public Suffix List through `lib/domain/public-suffix.ts`, ICANN section only. `www.example.co.uk` reduces to `example.co.uk`, not `co.uk`. This is a shared-engine dependency and it must be built before this tool, since a wrong reduction produces a confidently wrong lookup for a different name. See `stack127_docs/rdap.md`.

Always show the reduction on the result when we performed one. A reader who typed a hostname and receives registration data for a shorter name has to be able to see why.

Reject IP addresses and point the reader to IP and ASN Registration Lookup. Reject names with no dot, names longer than 253 octets, and labels longer than 63 octets.

There is no record type, no resolver picker, and no "all" option. RDAP returns one object.

## What the result shows

Lead with a plain sentence that answers the question, then the evidence. Something close to:

```
stack127.com is registered through HOSTINGER operations, UAB. It was created on
3 July 2026 and the registry expiry date is 3 July 2027. The registry currently
has one status on it, client transfer prohibited, which blocks a transfer to
another registrar until it is removed.
```

Below that, grouped, not as a card per fact:

**Dates.** Registration, registry expiry, registrar expiry, last changed, and the registry's own database update time. Each shows the source.

`expiration` and `registrar expiration` are two separately registered RDAP event actions mapping to the Registry Expiry Date and the Registrar Registration Expiration Date. Show them as two fields, never coalesced, and say the registry date is the one that governs deletion when they differ.

Show `transfer` and `reregistration` when the registry publishes them. Both are registered event actions, both are optional, and both change how the record reads: `transfer` dates the last registrar change, and `reregistration` reveals that a name was dropped and picked up again. When absent, they are unknown rather than "never happened".

The three timestamps people confuse also get separated here, because this is the flagship and it is where the full explanation belongs:

| what | field | what it tracks |
| --- | --- | --- |
| record last changed | `last changed` | when the registry's stored data for this domain last changed |
| database published | `last update of RDAP database` | when the RDAP service refreshed its own copy, unrelated to this domain |
| our fetch | our cache | when Stack127 retrieved this |

Verified on `stack127.com`, 28 July 2026: `last changed` was `2026-07-11T09:56:56Z` and `last update of RDAP database` was `2026-07-28T06:18:58Z`. Seventeen days apart, and a reader who conflates them concludes something changed today. Show `last changed` prominently and the other two quietly.

**Registrar.** Name, IANA ID, abuse contact email and phone when published, and the registrar's own RDAP or WHOIS URL.

**Status codes.** Every EPP status the registry returned, each with a one-line plain meaning inline, linking to EPP Status Code Explainer for the full picture. Never show only the raw code.

**Nameservers.** The `ldhName` values on record at the registry, with a link to Nameserver Delegation Checker. State clearly that these are the nameservers the registry has recorded, which can differ from what DNS is serving.

**DNSSEC.** The `secureDNS` object. `delegationSigned: false` means no DS record is published at the parent, which is a delegation fact, not a validation result. Link to DNSSEC Chain Checker for the verdict.

**Contacts and redaction.** What the registrar published, and what it removed. See Domain Registrant Lookup for the full treatment; this page shows the summary and links there.

**Raw responses.** Registry and registrar responses in two separate collapsed disclosures, each labelled with the server that answered. Never one merged blob.

A JSON download of the complete normalized result plus both raw responses, matching the pattern the DNS diagnostic tools already use.

## Engine

Per `stack127_docs/rdap.md`:

1. Normalize the input to a registrable domain and A-label form.
2. Resolve the TLD to an RDAP base URL through the committed IANA bootstrap plus reviewed overrides. No bootstrap entry and no override means we stop and say we cannot check this TLD.
3. Query the registry. Map the HTTP status. 200 is registered, 404 is not registered, 429 and 403 are throttled or blocked and are not answers.
4. If the registry response carries a `links` entry with `rel: "related"` and an RDAP media type, query it as the registrar hop. Bound it to one hop, a short timeout, and one attempt. Failure here degrades the page quietly and never fails the lookup.
5. Read both through the cache, and show the fetch time when the answer was cached.

Events, statuses, entity roles, and jCard fields are all optional in RDAP. Every one of them normalizes to a value or `null`, never to a default. A registry that omits `last changed` produces an unknown, not an empty string that reads as "never changed".

## What this tool cannot do

State these on the page, near the part they limit:

- It cannot check a TLD with no RDAP service. `.de`, `.co`, `.me`, `.us`, `.jp`, `.eu`, `.ch`, `.it`, `.es`, and `.se` were all uncovered when last checked. Name the reader's actual TLD on the result and read the counts from `coverageSummary()`; do not put a fixed number in page copy, since overrides change it.
- It cannot show registrant identity for most gTLDs. That data is redacted at the source.
- It cannot show registration history. RDAP returns the current state. We do not have, and are not buying, historical WHOIS.
- It cannot tell you the true expiry date at the registrar. The registry date is what the registry will act on, and a registrar can hold a different internal date.
- It cannot tell you whether a domain is for sale, what it is worth, or who is behind a privacy service.
- It cannot confirm the site is legitimate. A recently created domain is a signal, not a verdict.
- Dates are registry timestamps in their own timezone handling. We show them as published and in UTC, and we do not silently convert to the reader's local time.

## What the page must tell the reader

- Which server answered, by name, for every fact shown.
- That the registry and the registrar can disagree, and that we show both rather than picking one.
- That contact redaction is ICANN and GDPR policy, not a gap in this tool.
- That the queried name is sent to that TLD's registry and registrar. Registration facts are cached on our server keyed by domain, requester identifiers are used transiently for rate limiting only, and the two are never joined.
- The registry's own database update time, which is often hours old, alongside our cache time.

## Content flow

1. Title and one natural paragraph on what the tool returns.
2. The form.
3. The composed result.
4. One divider, then a small visual showing the registry to registrar relationship and which facts each one owns. This is the thing readers most consistently misunderstand and it is worth the diagram.
5. What each date means, in prose, including why the expiry date is not the date the name becomes available.
6. Status codes in one simple table, kept short, pointing at the explainer.
7. Why contact data is missing, and where a legitimate request for it goes.
8. Coverage and scope, ending with links to the DNS tools that answer adjacent questions.

No eyebrows, no glossary section, no dashboard cards, no health score.

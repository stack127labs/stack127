# EPP Status Code Explainer

Route: `/domain-tools/epp-status-codes`

Publication state: controlled by the exact `domain-tools/epp-status-codes` row in `public.version127_pages`.

Status: plan.

## Purpose

Explain what each domain status code means, who set it, and what it stops you doing. Most domain tools print these codes without explaining them. Good explanations do exist, notably ICANN's own EPP status codes page, which should be linked rather than quietly reproduced. What we add is the framing: grouped by whether the reader can do anything about the code, connected to the specific situation that brought them here, and attached to a lookup of their actual domain.

This page is half reference and half tool, which is a shape the site does not have yet. The reference half is fully server-rendered and is the reason the page can rank and be quoted. The tool half looks up a real domain and explains its actual codes.

## Input

Optional. The page is complete and useful with no input at all.

When a domain is entered, fetch its statuses and lead with an explanation of that domain's specific situation before the general reference.

## What the result shows

With a domain entered:

```
version127.com has one status: client transfer prohibited. HOSTINGER operations,
UAB set this, and it blocks a transfer to another registrar until it is removed.
You can remove it yourself in your registrar account, usually shown there as a
domain lock. Nothing else about the domain is restricted.
```

Then, for each status: the RDAP value, the EPP name, who set it, what it prevents, and what to do about it if anything. Registrar-set codes are usually the reader's own to change; registry-set codes usually are not.

Group the reference by what the code means for the reader, not by protocol category:

**Normal.** `active`, `inactive`. `inactive` means no nameservers are on record, which is worth explaining because it looks alarming and often is not.

**Locks the registrar set, which you can usually remove.** `client transfer prohibited`, `client update prohibited`, `client delete prohibited`, `client renew prohibited`, `client hold`. `client hold` is the important one: the registry stops publishing the domain in DNS, so the site goes dark while the registration is perfectly valid. People debugging that spend hours in DNS tools before finding it here.

**Locks the registry set, which you cannot remove.** The `server` equivalents of the same five. These come from disputes, court orders, registry policy, or a security hold, and the route is the registrar and then the registry.

**In progress.** `pending create`, `pending delete`, `pending renew`, `pending restore`, `pending transfer`, `pending update`.

**Lifecycle grace periods.** `add period`, `auto renew period`, `renew period`, `transfer period`, `redemption period`. These connect directly to Domain Expiry Checker and should link there rather than repeating the lifecycle diagram.

For each code, one table row with the code, one sentence of meaning, and one sentence on what to do. Write every row for someone who has never seen the term, following the rule already set for DNS Lookup.

## Engine

The reference content is static and server-rendered from a typed table in `lib/domain/status-codes.ts`. It does not depend on RDAP being reachable.

The lookup half reads `status` from the registry RDAP response.

One accuracy detail: RDAP does not return EPP codes verbatim. It returns values from the IANA RDAP JSON Values registry, which are lowercase and space separated. Verified on `version127.com`: RDAP returned `client transfer prohibited` where WHOIS would have shown `clientTransferProhibited`. The page must show both spellings, because readers arrive having seen the camel case form in a registrar dashboard or an old WHOIS output, and searching for it is how they got here.

`ok` in EPP maps to `active` in RDAP. Say so rather than treating them as separate codes.

## What this tool cannot do

- **It cannot tell you why a code was set.** `server transfer prohibited` could be a UDRP dispute, a court order, a registry security action, or a registrar policy. The code carries no reason and the reason is not published anywhere public.
- **It cannot remove a code.** Only the party that set it can, through your registrar account or a support request.
- **It cannot show status history.** Current state only.
- **It cannot cover registry-specific codes.** Some registries publish non-standard statuses. Show unknown values exactly as returned and say we do not have an explanation for them, rather than guessing.
- **It cannot check a TLD with no RDAP service.** Read coverage from `coverageSummary()`; never quote a fixed count in page copy. ccTLD registries also use their own status vocabularies which may not map to this reference at all.

## What the page must tell the reader

- Which party set each code, because that determines whether the reader can do anything.
- That `client hold` and `server hold` remove the domain from DNS, which is the single most useful fact on the page for someone whose site is down.
- That `inactive` usually means no nameservers, not a problem with the registration.
- That codes on a healthy domain are normal. `client transfer prohibited` is the default lock most registrars apply and is a good thing.
- That an unknown code is shown as returned rather than guessed at.

## Content flow

1. Title and a paragraph on what these codes are and where the reader has seen them.
2. The optional lookup form, kept visually lighter than on the pure tool pages since the reference works without it.
3. The result when a domain was entered.
4. One divider.
5. Who sets codes: registrar versus registry, as a short explanation with a small visual.
6. The reference tables, grouped as above.
7. The three situations people arrive with, answered directly: my transfer is blocked, my site went down, my domain says pending delete.
8. Links to Domain Transfer Readiness, Domain Expiry Checker, and Domain Registration Lookup.

This page is allowed to be longer than the tool pages. It is a reference, and the reader came for completeness.

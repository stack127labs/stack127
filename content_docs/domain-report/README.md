# Domain Registration Report

Route: `/domain-report`

Publication state: controlled by the exact `domain-report` row in `public.version127_pages`.

Status: plan.

## Purpose

One page that checks a domain's registration and its DNS together, and shows where the two disagree.

This is the tool the site is unusually well placed to build, because it needs both engines and we already own one. `lib/dns/` does delegation, DNSSEC validation, SOA comparison, and CAA policy. `lib/domain/` will do registration. The interesting findings live in the gap between them, and that gap is where the marginal cost of building this is lowest for us and highest for a tool that owns only one side.

Build this last among the composed tools. It depends on everything else working.

## Input

One domain name, normalized as elsewhere. The tool discovers the zone the way the existing DNS diagnostics do.

Optionally a small set of checkboxes to skip the slower checks. Default to running everything, since a reader who came to this page wants the full picture.

## What the result shows

A short opening paragraph that states what was checked and what stood out, written as sentences rather than counts:

```
version127.com is registered through HOSTINGER operations, UAB until 3 July 2027,
delegated to two Cloudflare nameservers that both answer, and not signed with
DNSSEC. The registry and the zone agree on the nameservers. Nothing needs
attention.
```

Then the findings, each with its evidence and the tool it came from. The cross-source findings are the reason the page exists:

**Registry nameservers versus the live zone.** The registry has a nameserver set on record. The parent delegation and the child zone each publish one. Three sources that should agree and often do not. A mismatch here is a real, hard to spot misconfiguration and this is the only place it surfaces.

**DNSSEC delegation versus DNSSEC validation.** RDAP reports `secureDNS.delegationSigned`. The DNSSEC Chain Checker returns an actual validator verdict. `delegationSigned: true` with a bogus chain is a broken domain. `delegationSigned: false` with DNSKEY records published in the zone is a signing that was never activated at the registrar. Both are invisible to single-source tools.

**Expiry against operational reality.** A domain expiring in nine days that is serving production traffic is worth flagging as a risk. Not a score, a finding with a date.

**Registrar-set holds against DNS symptoms.** `client hold` explains a domain that is registered but resolves to nothing, and this is the report that connects those two facts in one place.

**CAA policy and certificate issuance.** From the existing CAA engine, with a note on which authorities may issue.

Group findings by whether they need attention, need a decision, or are just context. Do not sort into severity colours, do not add a left edge line, do not produce a score, a grade, a percentage, or a letter. `content_docs/dns-tools/README.md` already forbids the health score and it applies with more force here, because a combined report is exactly where the temptation appears.

Each finding keeps a link to the dedicated tool that investigates it properly. The report locates the problem; the specific tool diagnoses it.

A JSON download of the complete report including every raw response from both engines.

## Engine

Compose existing engines. Do not reimplement any check.

- `lib/domain/` for registration.
- `lib/dns/authoritative.ts`, `diagnostics.ts`, and `dnssec.ts` for the DNS side.

Run the registration query and the DNS checks concurrently with a bounded total time. Every check reports independently, so a failing DNSSEC validator produces one indeterminate finding rather than an empty report. A missing RDAP service for the TLD means the registration findings are unavailable while the DNS findings still render, and the page says which half is missing.

This is the most expensive page in the folder. It needs its own rate limit weight, on the order of the existing `all` selection cost in `lib/dns/rate-limit.ts`.

## What this tool cannot do

- **It is not a security scan.** It does not check the website, TLS certificates, open ports, blocklists, headers, or content.
- **It is not an email deliverability check.** SPF, DKIM, and DMARC records may be visible in DNS, but reading a TXT record is not validating a mail setup, and the existing rule against calling a TXT lookup DMARC validation applies here.
- **It is not monitoring.** One point in time, no history, no alerts. We do not store results.
- **It cannot grade a domain.** There is no correct configuration for every domain, and a finding is a thing to look at, not a deduction from a total.
- **It cannot see anything private.** No registrar account state, no hosting, no billing.
- **Registration findings are unavailable for a TLD with no RDAP service.** The DNS half still works, and the page says which half is missing rather than showing gaps. Read coverage from `coverageSummary()`.
- **It cannot check propagation.** The DNS scope limits already documented for the individual tools apply unchanged and must not be softened by being in a combined report.

## What the page must tell the reader

- Exactly which checks ran, which were skipped, and which failed, named. A combined report that quietly drops a check is worse than no report.
- That findings are observations, not a verdict, and that a domain with findings is not necessarily misconfigured.
- Where each finding came from, registry or DNS, and which tool to open next.
- That this is a snapshot from the Version127 server, not a view of what every resolver worldwide sees.
- Coverage, freshness for the registration half, and the privacy position for both halves.

## Content flow

1. Title and a paragraph on what the report combines and why that combination is useful.
2. The form.
3. The summary paragraph, then findings grouped by attention needed, decision needed, and context.
4. One divider.
5. What each source can and cannot see, as a short explanation with a small visual of registry, parent zone, and child zone as three places a nameserver set can live.
6. The cross-source disagreements worth understanding, with the nameserver mismatch and the DNSSEC delegation case explained properly. This is the substance.
7. What the report deliberately does not cover, and where to go for those.
8. Links to each individual tool.

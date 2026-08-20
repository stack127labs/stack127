# TLD Directory

Route: `/tld-directory`

Publication state: controlled by the exact `tld-directory` row in `public.stack127_pages`.

Status: plan.

## Purpose

A browsable, factual reference for every top-level domain in the root zone: who operates it, what kind of TLD it is, whether it publishes RDAP, and whether it is signed with DNSSEC.

This is a directory, not a tool, and Stack127 is a directory site, which makes it the strongest long-term asset in this folder.

Existing references each cover part of it. IANA's root zone database is authoritative but is a bare list with one page per TLD and no comparison, filtering, or derived facts. `deployment.rdap.org` already tracks RDAP deployment across TLDs and overlaps our RDAP column directly, so link it rather than implying the data is ours alone. Wikipedia's list is inconsistent and dated. Registrar TLD pages exist to sell. What is missing is one filterable table that puts type, operator, RDAP, and DNSSEC beside each other with a visible check date, and that is what we build.

It also documents our own coverage. The RDAP column is exactly the gap other pages in this folder have to work around, presented as useful information instead of a caveat.

## Shape

A filterable table of TLDs, following the patterns already established by `/self-host-apps` rather than inventing a new directory layout. Reuse the shell, the sidebar, the card and table styling, and the filter behavior that page already has.

Columns:

| column | source | notes |
| --- | --- | --- |
| TLD | IANA root zone | shown with the leading dot |
| type | IANA | generic, country-code, sponsored, infrastructure, generic-restricted, test |
| registry | IANA root zone database | the sponsoring organization |
| RDAP | our bootstrap plus overrides | yes, yes via override, or no |
| DNSSEC | root zone DS records | signed or not signed |
| IDN | IANA | whether it is an internationalized TLD, with both forms |

Filter by type, RDAP coverage, and DNSSEC. Search by string. Default sort alphabetical.

Whether each TLD gets its own page is a decision to make before building. 1,438 generated pages is a large and mostly thin surface and it conflicts with the thin page rule. The defensible version is one directory page that is genuinely complete, plus individual pages later for the small number of TLDs with enough real content to justify one.

## Data

Everything comes from sources we already fetch or can fetch by script. Nothing is fetched during a request.

- **TLD list.** `https://data.iana.org/TLD/tlds-alpha-by-domain.txt`. Verified 28 July 2026: version `2026072601`, 1,438 entries.
- **Type and registry.** The IANA root zone database. This needs parsing from IANA's pages, which is the one fragile part of this pipeline and needs a script that fails loudly rather than silently producing partial data.
- **RDAP coverage.** `https://data.iana.org/rdap/dns.json` plus our reviewed overrides. Verified 28 July 2026: 1,200 of the 1,438 covered, 238 not. `.io` is the notable override, covered by Identity Digital but absent from the bootstrap.
- **DNSSEC.** Query the root zone for a DS record at each TLD using the existing `lib/dns/` engine. This is our own measurement rather than a copied list, which makes it more trustworthy and keeps it current.

Store the result in Postgres, following the pattern `public.open_projects` already sets for directory data, and refresh by a script under `scripts/domain-tools/` on a schedule. Do not create a second table when an existing one fits; this one does not fit any existing table, so a new `public.tlds` is correct.

Record a `checked_at` per row and show it. A directory that does not say when it was last verified is not trustworthy.

## What this directory can do

- Show which TLDs our own domain tools can and cannot check, honestly and in one place.
- Answer "who actually runs .app" without a registrar sales page.
- Show DNSSEC adoption across the root as measured data rather than a claim.
- Give the uncovered TLDs a useful home, since a reader who hits "cannot check this TLD" on a tool page needs somewhere to go.

## What this directory cannot do

- **It cannot show prices.** Registry wholesale pricing is not public for most TLDs and retail pricing varies by registrar, by promotion, and by year. Publishing prices would mean either scraping registrars, which goes stale immediately and is misleading, or affiliate data, which we are not doing. Say prices are out of scope rather than showing a stale number.
- **It cannot show registration counts.** Registry reports are inconsistent, delayed, and not published for many TLDs.
- **It cannot show registration restrictions reliably.** Whether `.bank` requires verification or `.ca` requires Canadian presence is real and useful, but it lives in registry policy documents rather than in structured data. Adding it means hand-curated editorial fields for a subset, which is a deliberate scope decision, not something to derive.
- **It cannot tell you whether a TLD is a good choice.** No rankings, no recommendations, no trust scores.
- **It cannot be perfectly current.** The root zone changes and our data is a periodic snapshot with a visible `checked_at`.
- **The IANA root zone database parse is the weakest link.** When it breaks, rows go stale rather than wrong, and the script must fail loudly.

## What the page must tell the reader

- Where each column came from, named, with the IANA sources linked.
- When the data was last refreshed, per row.
- That RDAP coverage is the reason some domain tools cannot check some TLDs, with a link back to those tools.
- That DNSSEC here means the TLD itself is signed in the root zone, which is not the same as a domain under it being signed. That distinction is easy to get wrong and the page must be explicit.
- That prices and registration restrictions are deliberately not included, with the reason.

## Content flow

1. Title and a paragraph on what the directory covers and where it comes from.
2. The filters and the table, above the explanatory content.
3. One divider.
4. What the TLD types mean, briefly, since the type column is meaningless to most readers without it.
5. What RDAP coverage means for someone trying to look up a domain, linked to the tools.
6. What DNSSEC at the TLD level does and does not mean.
7. Sources and refresh cadence, stated plainly.

## Placement

The canonical route is `/tld-directory`. It can appear in the domain collection and any future reference collection without changing its URL or ownership folder.

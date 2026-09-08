# DNS Lookup content review

Reviewed on 2026-09-06 against the managed development database.

## Editorial decisions

The reader is trying to reconcile a website, email, or verification problem with what DNS returns. The introduction names that situation and cues the input. Supporting content follows the choice of hostname through record types, returned values, differing answers, email names, response codes, DNSSEC, and data handling.

The rewrite preserves useful coverage from revision 1 rather than treating brevity as the goal. It removes the troubleshooting table that repeated the record-type reference, replaces the second alias illustration with an inline example, and adds practical limits beside the relevant claims. There is no duplicate FAQ or keyword-variant section. Necessary terms are explained in context; the record-type and response tables supply the reference layer.

Search-facing headings name actual tasks and follow-up questions. The title and centrally owned SEO metadata are unchanged. Copy stays server-rendered through `ToolPageHeader` and `ToolPageMarkdown`; PostgreSQL remains the only live Markdown source.

The shared writing-voice and tool-writing skills governed the rewrite. Visual-first planning selected two wrapping reference tables without additional artwork. The writing-guidelines handbook was a supplementary review, with stack127's voice and conventions taking precedence. Unslop cleanup preserved useful technical detail and the connections between paragraphs.

## Facts and sources

Search backend: web connector, direct primary-source pages. Search engines were not used. These were source checks for an existing tool, not a competitive research pass.

| Topic | Evidence and boundary |
| --- | --- |
| Exact names, All, PTR, source choice | Observed in `lib/dns/lookup.ts`, `normalize-name.ts`, `resolvers.ts`, the API route, and existing DNS fixtures. All is 11 separate forward queries at one name, not a zone download or subdomain search. |
| Alias ownership and cache lifetime | [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html), especially sections 3.6 and 3.6.2; the tool preserves alias edges and actual record owner names. TTL is not a global propagation deadline. |
| Record types | [Cloudflare record reference](https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/), [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035.html), and [SRV definitions](https://www.rfc-editor.org/rfc/rfc2782.html). Match the types implemented here; do not imply a complete policy validator. |
| Response codes and negative answers | [RFC 1035 section 4.1.1](https://www.rfc-editor.org/rfc/rfc1035.html#section-4.1.1) and [RFC 2308](https://www.rfc-editor.org/rfc/rfc2308.html). Distinguish missing requested records, NXDOMAIN, failure, refusal, and no response. An alias target can be the nonexistent name. |
| Differences between sources | [Google Public DNS troubleshooting](https://developers.google.com/speed/public-dns/docs/troubleshooting). Cache age is one explanation; location, resolver policy, and the reader's local network can also matter. No fixed propagation time is promised. |
| Email record names | [Google's DKIM setup](https://knowledge.workspace.google.com/admin/security/set-up-dkim) and [DMARC setup](https://knowledge.workspace.google.com/admin/security/set-up-dmarc). Names and selectors matter; a generic TXT response does not validate email authentication. |
| DNSSEC interpretation | [RFC 4035 section 3.2.3](https://www.rfc-editor.org/rfc/rfc4035.html#section-3.2.3), existing flag fixtures, and the tool's compact authentication status. An absent authentication flag does not alone establish a broken signed domain. |
| ASN and country | [Team Cymru IP-to-ASN documentation](https://www.team-cymru.com/ip-asn-mapping) and `network-enrichment.ts`. Network routing context is not server geolocation or website ownership. |
| Privacy | Existing API, enrichment, favicon, and client code plus this page's technical README. Keep source disclosure, external favicon requests, and query-string exposure; do not claim that third parties keep no logs. |

Internal follow-up links resolve to `/nameserver-checker`, `/dns-change-checker`, `/dns-trace`, and `/dnssec-checker`. Each returned HTTP 200 during local QA.

## Development update

The reviewed content command was dry-run first, then applied to development. Content revision changed from 1 to 2. Hosted tool version remains 1.0.3, with version timestamp `2026-09-04T18:21:41.317Z`. Title, engine, inputs, results, metadata, and publication state are unchanged. No production content was updated, and no deployment was requested.

The saved supporting Markdown matches the reviewed draft, SHA-256 `4f7dffc99acf9940f77130323ebd0052d56469fd5fcb4086c6e808d6754631d3`.

Temporary reviewed Markdown and reproducible visual QA script are under `/tmp/stack127-dns-copy-kBDUxE/`. They are review artifacts, not another live content source.

## Verification

Browser backend: standalone Playwright. The in-app Browser runtime reported no connected browser, so no visible in-app tab handoff was possible.

- Test-first layout regression reproduced the old table at 1511px inside a 758px reading region. Page-scoped CSS fixes explanatory-table wrapping without changing result tables or other tools.
- All 24 DNS Lookup Playwright checks passed across desktop and mobile against `.env.local`, including the new server-rendering, table-width, theme, canonical, and page-overflow check.
- Existing DNS engine and shared workbench node test files passed.
- Type checking passed on a clean rerun. The initial concurrent attempt raced the Playwright server regenerating its type files; no application type changes were needed.
- Static policy passed for 289 route page files.
- Live `example.com` All lookup returned records in 8 of 11 types; `8.8.8.8` PTR returned `dns.google`. The API was not mocked for these visual checks.
- Complete-page screenshots captured at 1440px and 390px in dark and light themes. Guide tables measured 758px and 340px respectively, with no internal or page-level overflow. Reviewed the introduction, guide sections, reference tables, nameserver results, and expanded raw response.
- Expanded raw A response remained contained at 390px. No page JavaScript errors were recorded. The clean lookup URL remained unchanged after interaction.
- Database Markdown was compared with the prepared draft, rather than with a migration seed or production copy.

- `npm run build` passed, including compilation, TypeScript, page data collection, and route generation. No release or deployment followed.

Detailed live-check measurements are in `/tmp/stack127-dns-copy-kBDUxE/qa.json`. Screenshots are alongside that report. No remaining content or layout issues were found within this rewrite's scope.

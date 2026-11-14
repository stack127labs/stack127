# Private ad network MCP and REST API

This is the owner's research API. It reads the same ad network dataset and sourced joining/payment facts as the public pages. It does not crawl a site on demand. Both front doors start disabled. Nothing creates a public product or a public connector listing.

## One core, two front doors

`lib/data-api/ad-networks/core.ts` owns the queries and answer shapes. `schemas.ts` owns the Zod inputs. `app/api/mcp/route.ts`, `app/api/mcp/[secret]/route.ts` and `app/api/v1/ad-networks/[tool]/route.ts` are adapters. REST uses JSON POST bodies, including for reads, to keep filters and SQL out of ordinary URL logs. Query parameters are not inputs.

The official TypeScript SDK is pinned to `@modelcontextprotocol/sdk` **1.32.2**. npm reports publication on **2026-10-23**, 22 days before the **2026-11-14** review. Its [SDK documentation](https://github.com/modelcontextprotocol/typescript-sdk) describes Streamable HTTP; the installed package includes the stateless and JSON-response examples. The server uses the SDK's Web Standards transport, no session IDs, and JSON responses. GET event streams and resumable sessions are not offered. There is no scheduler or new service.

Every successful answer carries `as_of`, `queried_at`, definitions, caveats, normalized filters, a stack127 citation URL, data, and limits. For data tools, `as_of` is the latest stored successful site check, relationship event, or daily snapshot capture, not the request time and not a guarantee that every row is that fresh. Overview also gives oldest/newest successful site checks. CrUX's import month is not retained in these serving tables; answers say it is unknown. Factual joining/payment sources have their own `checkedAt` date.

## Tools and REST routes

For every row below, the REST route is **POST `/api/v1/ad-networks/<tool-name>`**. The MCP tool name and REST suffix are identical. MCP includes titles, input descriptions/examples, output schemas and read-only annotations. Tool errors use MCP `isError`; REST uses HTTP status codes with `{error: {code, message}}`.

| Tool / REST suffix | Use it for |
| --- | --- |
| `get_brand_kit` | Colors for both themes, font stacks, inline SVG wordmarks and marks, public logo URLs, credit and chart rules. Input `{}`. Call once per visual task; skip for data questions. |
| `ad_networks_overview` | Start here: sites checked, distinct listed/managed totals, freshness, measurement, definitions, caveats, allowed values, tool guide. Input `{}`. |
| `list_ad_networks` | Counts, domain-age median and measured base, sourced joining/payment facts and checked dates. Filter published numeric minimum, traffic unit, or public numeric rule; sort by listed, managed, name or minimum traffic. |
| `get_ad_network` | One `network` slug, facts/sources, counts, domain-age buckets/median, registration years, niche/size/platform mix, co-listing and daily listed snapshots. |
| `compare_ad_networks` | 2–6 distinct `networks`, one `dimension`: niche, registration_year, age_bucket, size_group, platform or domain_rating. Counts and shares use each network's filtered distinct-site base. |
| `count_sites` | Distinct-site counter; up to two `group_by` dimensions, including network. Global totals deduplicate sites listed at several networks. |
| `find_sites` | Public domains and listed memberships, types, confirmation dates, niche, platform, RDAP date and CrUX size. `limit` 1–200, `sort` domain/newest/oldest, opaque `cursor`. Keep filters/sort unchanged between pages. |
| `lookup_site` | Bare `domain`: current/past relationships, first/last confirmation and end dates, public ads.txt summary, classification, age, size and events. Unknown domain returns 404. |
| `network_movements` | Optional `networks`, inclusive UTC `from` and `to`; at most 366 days apart. Observed joins/leaves/newly-found only, with a strong fault warning. |
| `run_readonly_sql` | Disabled for this release. Future private SQL requires a dedicated database login and a separate switch. A single SELECT against the documented safe views. Never available to a public principal. |

`count_sites`, `find_sites` and `compare_ad_networks` share filters: `networks` (OR), `relationship` (`listed`, default, or `managed`), `niche`, `registered_after`/`registered_before` (exclusive RDAP dates), `min_age`/`max_age` (inclusive completed years), `size_group`, `platform`, `min_domain_rating`/`max_domain_rating` (inclusive integers 0–100; exclude unknowns), and `status` (`confirmed` or `stale`). Other filters combine with AND. Missing classifications remain null groups. `find_sites` returns all listed networks for each matched site, even if only one network matched the filter.

Listed means confirmed or stale. Managed means a listed `primary_or_exclusive_manager` relationship. This is the requested relationship-based measure; it differs from the public page's manager resolver, which also reconciles retained manager-domain evidence and ambiguous signals. Do not call those two measures interchangeable. The API reuses the public listed-status rule, domain-age bucket thresholds/median expression, source facts and observed-event definitions. Minimum traffic in sessions and pageviews is not interchangeable; use `traffic_unit`. `has_public_rule` specifically means a published numeric monthly traffic minimum, including an explicit zero; read full joining facts for alternatives.

Movement answers are not reliable growth/churn series. History begins around October 19, 2026. Homepage/checker faults were repaired November 13/14; the conservative repair search begins September 28. Some false departures were repaired; others remain uncertain. Missing history days are unknown, not zero. See [the production runbook](../content_docs/ad-networks/production-runbook.md) and [growth status](brand-growth/status.md).

## Brand kit

Call `get_brand_kit` before making a chart, image or table for sharing. Use dark mode by default, title it by what it shows, and add "Ad network data from stack127" with a small logo. Include `Source: stack127.com/ad-networks · data as of <as_of date>`. Use the data answer's `as_of` date and its more specific page URL when available. Keep its definitions and caveats with the visual.

The kit returns `as_of: null` because brand assets have no dataset freshness date. It opens no data transaction. Authentication and database-backed rate limits still apply to both front doors.

Colors and font stacks come from `app/globals.css` and the ad network visualization tokens. SVG text is embedded in `lib/data-api/brand-assets.generated.ts`, so standalone server bundles need no runtime file reads. After changing the source tokens or wordmarks, run `node scripts/stack127/brand/build-api-kit.mjs` to refresh the embedded assets and mark SVGs.

Connected clients must refresh their tool list to see `get_brand_kit` and the updated server instructions.

## Domain Rating (prepared; requires the DR migration and release)

`find_sites` and `lookup_site` include `domain_rating` (rounded integer 0–100 or null) and `domain_rating_checked_on` (successful UTC YYYY-MM-DD or null). A failed lookup does not clear a prior value or advance its date. `stack127_data.ad_network_publishers` projects these two private fields; anonymous/authenticated roles still have no view access. `dataset_summary` adds `domain_rating_base` and `domain_rating_total`, measured and total distinct listed publishers respectively.

`count_sites` and `compare_ad_networks` accept `min_domain_rating` and `max_domain_rating`; filters combine with the existing filters. `domain_rating` is a grouping/comparison dimension with exclusive buckets `0–9`, `10–19`, `20–29`, `30–49`, `50–69`, `70–100`, `unknown`. Zero is measured. Unknowns remain in the unfiltered base and unknown bucket; min/max filters exclude them. Grouped answers include `domain_rating_coverage` for all filtered distinct sites; network groups also include `network_domain_rating_coverage` with each network's measured count and full filtered base, even when group rows truncate.

Every network in `get_ad_network` and `list_ad_networks` includes `median_domain_rating`, `average_domain_rating`, and `domain_rating_base`. Both summaries use measured listed sites only. The denominator is that row's `listed` count. Empty measured cohorts return null summaries and zero coverage. Network profiles also include the DR bucket distribution. Network memberships can overlap; do not add their measured counts to estimate dataset coverage.

All successful answers, including optional private SQL, carry `data.domain_rating_metadata`: `attribution` = `Domain Rating by Ahrefs`, `url` = `https://ahrefs.com`, a ready-to-display linked `credit`, a `caveat` that DR is a third-party estimate, and `coverage` (`sites_with_rating`, `total_sites`, explicit dataset scope). This coverage describes all distinct listed sites, not just a page or SQL result; filtered groups and network rows provide their own bases. MCP text and structured content carry the same metadata. Clients must display [Domain Rating by Ahrefs](https://ahrefs.com) beside DR values/summaries, retain the third-party estimate caveat, and include coverage. DR estimates backlink strength; it is not traffic, revenue, quality or a recommendation.

The [free endpoint](https://docs.ahrefs.com/en/api/reference/public/get-domain-rating-free) uses `dr3`. The [license](https://ahrefs.com/legal/domain-rating-license) allows integration with linked attribution, bars redistribution of original DR data or a competing product, and forbids circumventing limits. The authenticated MCP/REST integration stays private to the owner. The public website and bounded `/api/ad-networks/sites` and `/api/ad-networks/site` responses include per-site DR with linked attribution; their `attribution` metadata is present when a rating is returned, including zero. Public page summaries show rated/total coverage. Sitemaps and registry JSON-LD carry no DR, and there is no DR CSV export. No bulk DR export or resale is offered. Future public MCP/REST plans remain limited to derived summaries per network. See [the collector instructions](../scripts/ad-networks/ovh/README.md) for priority, pacing, source coverage and freshness.

## Authentication and future public plans

`authenticate(request) -> Principal` is the replacement point for future user API keys/OAuth and paid plans. Today both credentials map to `private-owner`, plan `private`. `PUBLIC_MODE` is a hardcoded false constant. There is no anonymous fallback, public switch, signup, billing endpoint, or public SQL access.

- `https://stack127.com/api/mcp`: requires `Authorization: Bearer <STACK127_MCP_TOKEN>`.
- `https://stack127.com/api/mcp/<STACK127_MCP_PATH_SECRET>`: a bearer capability in the path, for browser connectors configured as no authentication. The server still authenticates the secret. Never use the literal placeholder as a URL.
- REST: always requires the bearer header; a URL secret is not accepted.

Generate **two different 32-byte random secrets**, encoded as hex (64 characters) or base64url (43 characters). Comparisons hash both sides and use `timingSafeEqual`. Missing, short, or malformed configured secrets fail closed. A supplied invalid Authorization header cannot fall back to the path. Neither credential is stored in the database or logged by this code.

Why this method: the [current OpenAI custom MCP guide](https://developers.openai.com/api/docs/guides/custom-mcp-server) supports “No authentication”, while [Claude's custom connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) supports “No sign in” and fixed request headers. Both were read **2026-11-14**. The path credential works across both without building an OAuth authorization server for one owner. Prefer the header endpoint where the client supports it. Before selling access, replace the authenticator, add per-tool/plan authorization, and use OAuth for browser clients. The query core and input/output contracts can remain.

A secret URL is a credential. Before enabling it, the lead must check OVH reverse-proxy logs, Cloudflare request logs, error tracking and analytics. Redact or omit the full `/api/mcp/*` path from logs; do not retain the capability in screenshots, public issue text or monitoring URLs. Application usage logs contain no URLs, bodies, SQL, headers, raw errors or credentials. Keep this connector private to the owner; a shared connector URL grants everyone who receives it the same owner's access.

## Plan for going public (owner decision, 2026-11-14)

When this becomes a public product, it moves to its own subdomain and gets real sign-in. Nothing below is built yet; the private setup above stays as it is until then.

- **Address:** `https://mcp.stack127.com` for MCP and the API, not `stack127.com/api/...`. The tool gets its own home, separate from the website: its own DNS record proxied by Cloudflare to the OVH app, its own cache rules (never cache), and its own logs. The website's `/api/*` routes stay for the website's own data.
- **Sign-in:** OAuth for claude.ai and ChatGPT, so each user clicks Connect, signs in on stack127, and approves access. No secret URLs for public users. Per-user API keys for REST and header clients. Both replace `authenticate(request)`; the tools and their input and output stay the same.
- **Accounts and plans:** user accounts, plans (for example free and paid), billing, and per-plan limits on requests a day, rows per answer, and which tools are available. The existing rate-limit and usage-log design is per principal, so it extends to per user.
- **Read-only by design, with a second lock:** every tool is read-only today (read-only transactions, fixed parameterized queries, read-only views; the only write is our own rate-limit counter). Today the tools use the website's normal database login, which can write elsewhere, so the read-only transaction is the main protection. Before launch, an admin creates a dedicated database login with SELECT on the `stack127_data` views only (plus the counter table), and the public MCP and API use only that login, so even a code bug cannot write.
- **DR in public plans:** expose only DR summaries per network with linked Ahrefs credit, third-party estimate caveat and measured coverage. Never expose per-site DR values, including in `find_sites`, `lookup_site`, downloads or dataset exports, under this planned API policy. The existing bounded website APIs are separate. Add plan-aware field projections before offering public MCP/REST access.
- **What stays private:** `run_readonly_sql` is never offered publicly. `publisher_name` and internal check fields are never returned. Whether site-by-site lists (`find_sites`, `lookup_site`) are paid-only is an owner decision to make before launch.
- **Before launch:** terms of use and an acceptable-use rule, public documentation for each tool, a status or uptime check, alerts on errors and abuse, and a review of data accuracy and its stated limits.
- **The owner's private access** moves to the same sign-in at launch, and the secret path is switched off.

## Environment keys

The lead adds runtime values through Infisical **`stack127 /vps/web-app`**. No values were added or changed by this implementation. Keys are also indexed in [environment-inventory.md](environment-inventory.md).

| Key | Format / default |
| --- | --- |
| `STACK127_MCP_ENABLED` | Exact `true` enables MCP; otherwise disabled. |
| `STACK127_REST_ENABLED` | Exact `true` enables REST; otherwise disabled. |
| `STACK127_DATA_SQL_ENABLED` | Defaults off. Must stay `false` for this release. The flag alone cannot expose SQL. |
| `STACK127_DATA_SQL_DATABASE_URL` | Dedicated restricted SQL login connection string. Must stay absent for this release. Never reuse `DATABASE_URL` / `DATABASE_POOLER_URL`. |
| `STACK127_MCP_TOKEN` | Random 32 bytes, hex or base64url. Header credential. |
| `STACK127_MCP_PATH_SECRET` | Different random 32 bytes, hex or base64url. Browser connector credential. Omit to disable path access. |
| `STACK127_DATA_RPM` | Positive integer, default 120; maximum 10,000. |
| `STACK127_DATA_RPD` | Positive integer, default 10,000; maximum 1,000,000. |
| `STACK127_DATA_MAX_ROWS` | Positive integer, default and maximum 200. |
| `STACK127_DATA_TIMEOUT_MS` | Positive integer milliseconds, default and maximum 15,000. |
| `STACK127_DATA_ALLOWED_ORIGINS` | Comma-separated exact origins. Default `https://stack127.com,https://chatgpt.com,https://claude.ai`. Requests without Origin are accepted after authentication. |

Existing `DATABASE_POOLER_URL` / `DATABASE_URL` supply the eight fixed tools and rate-limit storage. They are never used for arbitrary SQL. No new database password is needed for this release. This implementation only uses `.env.local` for development checks. It does not change the managed env files.

Generate each secret into a shell variable without printing it, then follow the existing Infisical stdin workflow. For example, the lead can use `openssl rand -hex 32` inside command substitution assigned to a task-specific variable. Do not put the generated value in a command argument or Git. Remove the variable after storing it. No generation command in this doc contains a real credential.

## Limits, data isolation, and usage

The migration is `supabase/migrations/20261114120000_private_ad_network_data_api.sql`. It creates private schemas, projected views and a counter table with RLS and explicit backend grants/policies. It creates no role and changes no role membership. It can be re-applied. Production release must use the existing `DATABASE_MIGRATION_URL` for owner `postgres`, not the runtime `stack127_app` URL. The owner can create schemas, views, tables, grants and policies; it cannot create roles. The runtime login cannot create schemas.

Each fixed tool runs parameterized, code-controlled queries in a repeatable-read, read-only transaction as the normal app login. It sets a private search path, UTC timezone and statement timeout, and always commits or rolls back before releasing the connection. A dedicated pool has at most two connections, separate from page queries. No `SET ROLE` is used. The app login still has its existing broader privileges; the projections and controlled query code define the fixed tools' boundary, not a claim that the login itself is restricted.

The unexposed `stack127_data` views omit `publisher_name`, evidence, hashes, leases, retries and discovery internals, and omit candidate-only sites/needs-review relationships. The ads.txt projection includes only line/direct/reseller/invalid counts and top seller systems. `dataset_summary` exposes aggregate coverage/freshness only. Anonymous and authenticated Supabase API roles have no grants to these schemas or objects.

`run_readonly_sql` is kept in code but unavailable for this release. Without `STACK127_DATA_SQL_DATABASE_URL`, SQL is absent from MCP discovery and overview, core calls fail closed, and its REST route returns 404 before authentication/database access, even when `STACK127_DATA_SQL_ENABLED=true`. If later enabled, SQL uses a separate one-connection pool with only that key; it never falls back to the app pool. The parser accepts one SELECT against named views and a small built-in function/cast allowlist. Arrays, `array(...)`, collection aggregates (`array_agg`, `json_agg`, `jsonb_agg`, `string_agg`, `xmlagg` and any other function outside the allowlist), CTEs, comments, separators, locks, system catalogs and arbitrary functions are rejected. A capped outer SELECT limits rows. Parsing and `SET LOCAL ROLE` are not database isolation: arbitrary SQL needs its own restricted login.

### Later admin bootstrap for SQL, not performed in this release

An administrator with role-creation privileges must create a separate LOGIN with NOINHERIT, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION, NOBYPASSRLS, no memberships, and a connection limit of one. Grant CONNECT to this database, USAGE only on `stack127_data`, and SELECT only on the six documented projected views (including `dataset_summary`). The login must own no objects and must not inherit app privileges or gain CREATE/TEMP privileges. Set a safe search path and read-only/timeout defaults as defense in depth.

Audit effective privileges, including grants inherited from PUBLIC. A role-specific REVOKE cannot remove a PUBLIC grant. Remove PUBLIC access to other schemas, tables, sequences and dangerous functions only after checking other consumers, or use a separate research database whose PUBLIC privileges are already locked down. In particular, deny schema USAGE and object/function access in `net`, `extensions`, `public`, `stack127_api`, `auth`, `storage`, `vault` and every other application/extension schema. Test that `net.http_request_queue`, `net._http_response`, base tables, counters, private columns and write/side-effect functions are inaccessible. PostgreSQL's built-in catalogs remain subject to built-in visibility; the parser still rejects them. Test `RESET ROLE` and confirm it cannot reach any more privileged login. Do not store the dedicated URL or enable SQL until this audit passes. None of this bootstrap is part of the release migration.

The row limit is a **total result-record budget per answer**, shared fairly across returned result sets (such as network distributions and daily history). Definitions, facts/sources and available filter values are metadata and do not consume that budget. Each SQL query also has a bounded result limit. `limits.row_count`, `limits.truncated`, `limits.truncated_sets` and local result-set `truncated` flags identify partial results. A result set can also be cut by its query cap; read the local flag. Never add incomplete returned groups to infer a total: use the supplied distinct total/base. Site cursors use stable keyset pagination, not offsets; live database changes between calls can still change membership. Other large result sets have no cursor; narrow their filters. Answers over 1 MB are rejected. MCP returns the full JSON answer as both structured content and readable text, and applies that same 1 MB limit after text formatting. Request bodies over 64 KB are rejected while reading.

An atomic upsert in `stack127_api.rate_limits` enforces fixed UTC minute/day windows per principal, shared by MCP and REST and all app instances. It stores one row per principal, so the private deployment needs no cleanup job. This is a separate small write from the read-only data transaction. Both limits count authenticated HTTP requests, including initialize, tool discovery, errors and method checks. MCP batches are rejected, so one request cannot contain several tool calls. A limit returns HTTP 429, Retry-After 60; a daily limit clears at midnight UTC. Limit-storage errors fail closed.

The existing application log stream receives JSON `data_api_usage` entries: principal, tool, duration_ms, row_count and status. It logs completed core calls and REST input failures; authentication failures, protocol discovery and MCP schema failures do not produce a tool usage row. A count-only answer reports zero result-list rows, with its aggregate in data.total. Do not treat this log as a billing ledger without adding durable authenticated attempt accounting.

The proxy skips canonical links, page tags, cache-class headers and pathname propagation only for private namespaces and unknown API routes. Every existing public API keeps its previous headers, including page/cache tags, query canonicals and query noindex headers. Wrong MCP secrets and unknown API paths return the same generic JSON 404 and private headers. Usage logs contain only allowlisted metadata; caught application errors never print the request URL or raw exception.

### Next routing and request logging

The Dockerfile and the `dev`/`start` commands use the normal Next entries from `origin/main`: standalone `node server.js`, `next dev` and `next start`. There is no custom HTTP wrapper. Next owns shutdown, development restarts, config watching and upgrades.

Browser connectors must use the exact canonical HTTPS URL: lowercase `/api/mcp/<secret>`, with no trailing slash, repeated slash, encoding or dot segment. Prefer `/api/mcp` with the bearer header when supported. Do not rely on a connector following redirects.

Malformed spellings can receive a framework normalization redirect before the proxy or route handler runs. For example, `/api//mcp/caller-value?q=private` returns 308 with `Location: /api/mcp/caller-value?q=private`, `Refresh: 0;url=/api/mcp/caller-value?q=private` and that same destination as the response body (empty for HEAD). This only repeats the URL the caller already supplied. It does not disclose a configured credential or another caller's URL. Accepting that reflection preserves Next's normal server lifecycle. It is acceptable only with the edge non-storage checks below; a redirect must never become a shared cached response.

Checked against installed Next **16.2.9**:

- `dist/server/lib/router-utils/resolve-routes.js:50` orders config redirects before the proxy. Its repeated-slash/backslash branch at `:105` returns 308 before custom header rules or the proxy. `dist/server/base-server.js:543` also normalizes repeated slashes.
- `dist/server/lib/router-server.js:359` sends `Location`, `Refresh` and the destination body for that 308. It adds **no `Cache-Control`, `CDN-Cache-Control` or `Cloudflare-CDN-Cache-Control`**. App `no-store` headers cannot protect this early response. The HTTP routing test verifies the actual headers, including trailing-slash redirects.
- `dist/lib/load-custom-routes.js:529` generates trailing-slash redirects. Public redirect policy stays unchanged. No basePath, i18n, API redirect or API rewrite is configured. Dot segments can instead normalize directly to a route and receive its normal authentication response.
- `dist/server/config-shared.d.ts:241` supports `logging.incomingRequests.ignore: RegExp[]`. The config ignores only `/^\/api\/(?:mcp|v1)(?:[/?]|$)/`: the two canonical private namespaces, including query strings and child routes. Public incoming-request logging keeps the `origin/main` default. `dist/server/dev/log-requests.js:38` matches raw `request.url`; malformed aliases outside these namespaces are not promised log redaction. Never use a real capability in malformed development probes.
- Incoming-request logs are **development only**. The sole runtime call to `logRequests` is in `dist/server/dev/next-dev-server.js:372`; production `next-server.js` does not install that development request logger. Production Next does not log incoming requests by default. Reverse proxies, Cloudflare and application error logs still need their own checks.

The routing test uses Next's own `startServer` listener and installed router, without a custom wrapper. It covers canonical URLs, wrong secrets, unknown API paths, seven methods, query strings, switches on/off and malformed spellings. Canonical responses never expose either synthetic credential, and use all three `no-store` headers. A malformed redirect may repeat only the caller's normalized URL. Origin-only tests cannot verify Cloudflare non-storage; that remains a required release check.

Every response handled by the private proxy or route handlers has `Cache-Control: no-store`, `CDN-Cache-Control: no-store`, and `Cloudflare-CDN-Cache-Control: no-store`, including errors. Framework redirects are the exception described above. No Next cache wraps the queries.

## Connect Claude.ai and Claude Desktop

Read **2026-11-14**: [Anthropic's connector instructions](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp). Remote connectors need public HTTPS on port 443; requests originate from Anthropic, including Desktop.

1. Enable MCP after release and log redaction. In Claude, open **Customize > Connectors > + Add > Add custom connector**.
2. Name it `stack127 private`. Enter the full secret-path endpoint; Continue.
3. Choose **No sign in**. Add it. No OAuth client credentials are needed.
4. Enable it using the conversation's **+ > Connectors** menu. Ask it to call `ad_networks_overview` first.
5. Claude Desktop uses the same account connector flow. Alternatively, use `/api/mcp` with No sign in and a fixed **Request headers** entry `Authorization: Bearer <token>` where those controls are present.

Team/Enterprise owners may need to add it in Organization settings first. Do not publish or share the secret-path connector with a workspace.

## Connect ChatGPT

Read **2026-11-14**: [OpenAI's setup guide](https://developers.openai.com/api/docs/guides/custom-mcp-server). Current instructions use Plugins; Developer Mode is no longer a prerequisite in that experience.

1. Open ChatGPT on the web, then **Plugins > + > Add custom MCP server**.
2. Name it `stack127 private`. Under Connection, enter the full HTTPS secret-path endpoint.
3. Choose **No authentication**. Review the risk notice and create the private plugin.
4. Review its tools, install it for yourself, then select it with **@** in a new conversation. Ask for `ad_networks_overview`.
5. Keep access private. Refresh tool definitions in its settings after changing the SQL switch or schemas.

Account/workspace permissions still apply. If the account shows the legacy Apps UI, use Apps > Create and scan tools, following its permission controls. The [official availability guide](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt), read the same day, says full MCP is available for Business/Enterprise/Edu and Pro can connect custom servers for reads. This server is read-only. The owner's actual account connection has not been tested by this implementation.

## Connect Claude Code

Read **2026-11-14**: [Claude Code MCP docs](https://code.claude.com/docs/en/mcp). Add a remote HTTP server with a bearer header using a private local/user config, not a committed project credential. This JSON is a template; supply the token through a supported local secret/environment reference:

```json
{
  "mcpServers": {
    "stack127-private": {
      "type": "http",
      "url": "https://stack127.com/api/mcp",
      "headers": { "Authorization": "Bearer ${STACK127_MCP_TOKEN}" }
    }
  }
}
```

Use `claude mcp add-json` with the locally supplied JSON and `--scope user`, or use the documented HTTP add command. Run `/mcp` in Claude Code to check the connection, then ask for overview. Keep shell history free of literal credentials. Claude Desktop's remote account connector steps above avoid a separate local bridge.

## Rotate or switch off

To rotate, set a new token/path secret in Infisical, let the normal sync/release restart pick it up, and update the affected clients. Each credential accepts only its current value: old URLs/headers stop working as soon as the new runtime starts. Keep the two secrets separate so browser URLs and header clients can rotate independently.

Set `STACK127_MCP_ENABLED=false` or `STACK127_REST_ENABLED=false` to disable that front door entirely; it returns 404 before database access. Keep `STACK127_DATA_SQL_ENABLED=false` and `STACK127_DATA_SQL_DATABASE_URL` absent for this release. Either condition hides SQL discovery and rejects direct calls. Refresh the clients' frozen tool list after changing SQL exposure. Public access remains off regardless of these flags.

## Cloudflare and release checks for the lead

See [cloudflare.md](cloudflare.md): `/api/*` goes to OVH without a Worker. This Worker exclusion is routing, not a cache bypass.

The checked-in `scripts/stack127/cache/configure-cloudflare.mjs` excludes `/api/` from HTML/RSC rules, caches only named public JSON APIs, and rewrites successful document cache headers only for 200/304. Its final `Public errors: no store` rule matches **400 and above**, so it does not protect 3xx. Private MCP/REST paths do not match the named public JSON APIs. But the script preserves the installed detail rule's expression/settings, the installed HTML rule and other existing rules; it is not a complete snapshot of the live zone policy.

Cloudflare's [default status caching](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#edge-ttl), checked **2026-11-14**, does not cache 308 by default. These extensionless private routes are not cache candidates under the documented allowlist. However, [status TTL or override-origin settings](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/#edge-ttl) can override origin directives. Therefore neither the absence of a Worker nor the current script proves a live 308 cannot be stored. Live rules were not read or changed in this implementation.

### Required edge protection before issuing a capability URL

The lead must verify the installed request and response cache rules, including status TTLs, Page Rules and any custom cache keys. Install the following protection if it is absent. Do not limit it to 200, errors or authenticated requests: secret-path connectors send no Authorization header.

1. Add a final request cache rule in `http_request_cache_settings`, after every existing rule (on 2026-11-14 the last one was `Public robots: origin cache control`), because Cloudflare's [last matching rule wins](https://developers.cloudflare.com/cache/how-to/cache-rules/order/). Description `Private MCP and REST: no cache`, action `set_cache_settings`, parameters `{"cache":false,"browser_ttl":{"mode":"respect_origin"}}`, expression:

```text
(http.host eq "stack127.com" and (
  starts_with(lower(http.request.uri.path), "/api/mcp") or
  starts_with(lower(http.request.uri.path), "/api/v1")
))
```

   It covers only the private namespaces, so public JSON APIs keep their edge caching. The zone's URL normalization is `{"scope":"incoming","type":"cloudflare"}` (checked 2026-11-14), so repeated slashes and backslashes are normalized before matching and `/api//mcp` matches. Encoded separators and dot segments that normalize outside these prefixes are covered by step 2.
2. Add the response rule below at the end of `http_response_cache_settings`. It sends browser-visible `no-store` for origin redirects on the whole host, excluding 304 revalidation. Using the whole host also covers malformed targets whose dot segments or encoded separators remove the visible `/api/` prefix. It does not change the redirect destination or status. `cloudflare_only` must remain false/absent.

```json
{
  "action": "set_cache_control",
  "expression": "(http.host eq \"stack127.com\" and http.response.code in {301 302 303 307 308})",
  "description": "Origin redirects: no store",
  "action_parameters": {
    "no-store": { "operation": "set" },
    "public": { "operation": "remove" },
    "max-age": { "operation": "remove" },
    "s-maxage": { "operation": "remove" },
    "stale-while-revalidate": { "operation": "remove" },
    "stale-if-error": { "operation": "remove" },
    "immutable": { "operation": "remove" }
  }
}
```

3. Any cache-eligibility rule outside the API bypass that uses status TTLs or ignores origin directives must also forbid redirect storage. In that rule's `edge_ttl.status_code_ttl`, set `value: -1` for each redirect code (301, 302, 303, 307, 308), for example `{"status_code":308,"value":-1}`. Split any overlapping ranges and preserve its other status settings, including 304 revalidation. `-1` means no-store; `0` permits storage with revalidation and is insufficient. Check browser TTL overrides also cannot replace the response rule's no-store policy. This closes the case where a malformed target normalizes outside `/api/`.

Keep these protections in the normal cache configuration when the lead implements the edge change. Purge any previously stored affected redirects after applying it. The local code does not make this Cloudflare change. Until the live checks pass, redirect non-storage is **unverified** and a real capability URL must not be issued.

Use two distinct synthetic probe values, with feature flags off. Repeat each raw request with Node HTTP or `curl --path-as-is --request-target`, without following redirects. Canonical paths must return the generic no-store 404; malformed paths may return that response or a 308 containing only the caller's normalized URL. At the final HTTPS edge, every probe and every 3xx must send `Cache-Control: no-store`, never `CF-Cache-Status: HIT`, `STALE`, `UPDATING`, `REVALIDATED` or `EXPIRED`, and never an `Age` header. Repeat identical probes to check non-storage, then change the probe value: the new response must never contain the first value. Headers alone are not a substitute for checking installed bypass/status-TTL rules.

Check WAF/Access does not challenge cloud MCP clients. Check request-log redaction at Cloudflare and OVH before issuing a path credential. This implementation did not inspect or change live Cloudflare rules, logs, WAF, or any server.

The release workflow applies changed Supabase migrations before the app deploy; PR CI does not apply them. Development already has this migration. Before production enablement, review its view ownership/grants and verify the deployed app login is `stack127_app`. After normal release, check authenticated and unauthenticated responses, no-store headers, both client connections and SQL hidden by default. Do not enable features before the migration and runtime are live.

## Before you turn it on

- Keep MCP, REST and SQL flags off until the reviewed migration and runtime are deployed. Keep `STACK127_DATA_SQL_DATABASE_URL` absent throughout this release.
- Confirm the deployed container uses the unchanged standalone `node server.js` entry. Run `npm run test:data-api:routing` before release.
- Verify the live route's final headers on success, wrong/missing credentials, 404, 429 and errors, with query strings too. There must be no secret, `Cache-Tag`, canonical `Link`, `x-stack127-pathname` or public cache-class header.
- Complete the edge protection and repeated synthetic redirect probes above before issuing a real path credential. Canonical responses must never echo a secret. Malformed spellings may redirect to the caller's normalized URL; all such redirects must be uncached. Repeat after Next upgrades.
- Confirm Traefik access logging is off or redacts the full capability path. Check other reverse-proxy and error logs too.
- Review Cloudflare request logs, Logpush and Security Events for the secret path and configure omission/redaction before issuing a real URL. No live log settings were changed by this implementation.
- Rotate both credentials if a credential URL ever appears in a log. Update the owner's clients after rotation.
- Connect claude.ai and ChatGPT through the secret URL with no-auth selected. Connect Claude Code and REST with the bearer token. Check both credential types after enablement.

Use synthetic values only, with feature flags off. Probe canonical `/api/mcp/<probe>`, wrong-secret and unknown `/api/` paths, plus repeated/trailing slashes, backslashes, encoded separators/letters and dot segments. Include malformed paths that resolve outside `/api/`. The raw-target cases in `tests/data-api/private-paths.mjs` cover the private routing matrix; expand the live probes for any edge normalization or rewrite rules. Check all seven methods with and without queries. Do not follow redirects or use a real configured secret in these probes.

## Checks and adding a tool

```bash
npm run quality
npm run test:data-api
npm run test:data-api:routing
npm run test:data-api:development
```

The development test uses `.env.local` and is skipped unless the effective connection exactly matches the pinned managed development project and its postgres pooler login. It starts only a temporary loopback HTTP adapter for the actual Next route handlers, and calls tools/list plus all fixed tools using the official SDK client. It tests REST parity, public count parity, grouping, cursor continuation, projection fields, read-only transactions, timeout, row limits, off switches, SQL hidden even with its flag on, and concurrent minute/day limits. Focused tests also run the real proxy plus route handlers for all methods and status/error paths, compare wrong-secret and unknown-API 404s, reject nested collections and check MCP text byte limits. It does not run a Next build or connect the owner's actual Claude/ChatGPT accounts.

To add a tool, add its strict described schema in `schemas.ts`, its read-only query in `core.ts`, and its AI-facing description in `mcp.ts`. The generic REST route automatically exposes that same tool name. Add safe projections to a reviewed migration only if new fields are needed. Keep output metadata and the shared result-row budget. Add focused tests and extend the SDK development test; run quality. Release through the normal reviewer/PR path, then refresh connected tool lists. No separate MCP server deployment is needed.

## Live state (2026-11-14)

- Released in pull request #128 (`4316d03d`). The migration applied: six views in `stack127_data` and `stack127_api.rate_limits`.
- Cloudflare, added by API at the end of each phase without changing other rules: request cache rule `Private MCP and REST: no cache` (last in `http_request_cache_settings`, ruleset version 10) and response rule `Origin redirects: no store` (last in `http_response_cache_settings`, version 20). If `scripts/stack127/cache/configure-cloudflare.mjs` is ever rerun, confirm both rules are still present afterwards.
- Edge probes with fake secrets passed: every private spelling returned 404 or a 308 with `no-store`, `CF-Cache-Status: DYNAMIC`, no `Age`, and no other value. An all-uppercase `/API/MCP/...` never reaches the app; it gets the static site's 404 page, which does not contain the path.
- Infisical `stack127 /vps/web-app`: `STACK127_MCP_ENABLED=true`, `STACK127_REST_ENABLED=true`, `STACK127_DATA_SQL_ENABLED=false`, `STACK127_DATA_ALLOWED_ORIGINS`, and two separate random secrets (`STACK127_MCP_PATH_SECRET`, `STACK127_MCP_TOKEN`). `STACK127_DATA_SQL_DATABASE_URL` is absent. Limits use the defaults (120 a minute, 10,000 a day, 200 rows, 15 seconds).
- Live tests passed: all eight tools through the secret path, `tools/list` with the bearer header, REST `POST /api/v1/ad-networks/<tool>` with the token (401 without or with a wrong token).
- The owner's connection details are in a mode-600 file on his MacBook Air. Rotate both secrets with `infisical-env set` and `infisical-env apply stack127 /vps/web-app` if either ever appears anywhere else.
- Known size: `list_ad_networks` returns about 160,000 characters of text, because every network's facts are included and the JSON is repeated as text. Some chat clients may truncate it; trim if that happens.

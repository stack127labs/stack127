# Cloudflare And DNS

Stack127 uses Cloudflare as the public DNS provider and edge proxy in front of its dedicated OVH deployment. This document records the production setup without storing credentials or origin secrets in the repository.

## Production Path

```text
visitor or crawler
  -> Cloudflare DNS and edge
  -> Dokploy Traefik on the dedicated OVH VPS
  -> Stack127 service
  -> production Supabase database when the page needs structured data

administrator
  -> Cloudflare Access
  -> stack127-dokploy Cloudflare Tunnel
  -> Dokploy on 127.0.0.1:3000
```

The Cloudflare zone is active. Hostinger delegates the domain to the two nameservers assigned by Cloudflare. Both the apex and `www` records are proxied.

## DNS

- `stack127.com`: proxied apex record to the Stack127 origin.
- `www.stack127.com`: proxied CNAME to `stack127.com`.
- `dokploy.stack127.com`: proxied CNAME to the dedicated Cloudflare Tunnel. It does not resolve to the VPS address.
- Google Search Console verification TXT: preserved and not proxied.
- Canonical host: `https://stack127.com`.
- `www` redirect: permanent `301`, preserving the path and query string.

Do not replace the apex record or disable its proxy without first checking the Dokploy deployment and the Cloudflare redirect rule.

Hostinger remains the registrar and delegates authoritative DNS to Cloudflare. The Hostinger API is not needed for normal Stack127 DNS record changes.

## TLS And Transport

- SSL mode: Full (strict).
- Always Use HTTPS: on.
- Minimum TLS: 1.2.
- TLS 1.3: on.
- HSTS: staged at one day (`max-age=86400`) with `nosniff`; subdomains and preload are intentionally off during observation.
- Automatic HTTPS Rewrites: on.
- HTTP/3: on.
- Brotli: on.
- 0-RTT: off.

The OVH origin presents a Cloudflare Origin CA certificate for `stack127.com` and `www.stack127.com`, which is valid for the Full (strict) Cloudflare-to-origin connection.

## Private Dokploy Administration

`https://dokploy.stack127.com` is the only intended browser entry point for the OVH Dokploy dashboard.

- Cloudflare Tunnel name: `stack127-dokploy`.
- Tunnel origin: `http://127.0.0.1:3000`.
- Tunnel catch-all: `http_status:404`.
- Cloudflare Access application: `Stack127 Dokploy`.
- Access policy: `Stack127 administrators`.
- Policy decision: allow only the explicitly approved administrator email addresses.
- Application and policy session duration: 24 hours.
- Access application is hidden from the application launcher.

The OVH host runs `cloudflared-stack127-dokploy.service`. It uses a remotely managed Tunnel token stored in a root-owned `0600` environment file. The service runs with a dynamic user, no Linux capabilities, `NoNewPrivileges`, a read-only system view, restricted address families, and the other systemd sandbox controls recorded in the migration runbook.

Dokploy has:

```text
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://dokploy.stack127.com
```

Its Web Server settings record `dokploy.stack127.com` as the host with HTTPS enabled and certificate type `none`, because Cloudflare terminates the public TLS connection. Direct public access to port `3000` remains blocked for IPv4 and IPv6.

## Caching

Public documents use `max-age=0, must-revalidate`: browsers check their saved copy each time. Successful public HTML and Next.js navigation data use separate Cloudflare cache entries. Cookies, authorization, private endpoints, live DNS/IP results, and errors bypass the public cache.

| Response | Edge time |
|---|---:|
| Content pages | 1 day during observation; 7 days after the reliability gate |
| Homepage, directories, app and device details | 24 hours |
| Search and filters, including planner search | 15 minutes |
| Sitemap and robots | 1 hour |
| Mutable icons, logos, and favicons | 30 days |
| Versioned Next.js bundles | Existing immutable 1 year policy |

Browser revalidation also applies to successful documents with cookies and to 304 responses. Cookies and authorization still bypass the edge cache. New client navigations reuse a page for at most 30 seconds instead of five minutes; browser Back/Forward keeps its normal history behavior.

Query pages keep their canonical base URL and `noindex, follow`. `_rsc` alone is navigation data and does not make a page a filtered search. Navigation cache keys retain the complete query string. The domain registry (RDAP) cache stays at 24 hours for registered domains and 1 hour for unregistered domains.

The app supplies `Cache-Tag` headers for public pages and mutable local assets. Releases purge `stack127-public` and `stack127-assets`, purge changed public file URLs, and warm primary routes. Registry-owned SEO lives in `lib/registry-layout.tsx`. The proxy checks the existing tagged publication cache before serving a page; a missing or unpublished exact slug uses the shared dynamic 404 page, which neither cache layer stores. Thin route layouts supply the public path, so pages without request-specific data can use the Next.js full-page cache. `scripts/stack127/cache/sync-registry-layouts.mjs` runs before development and builds to register new routes. Directory queries use shared tagged data and at most 500 recently used filter results per directory. Normal numbered pages share the complete default index.

Run one app instance. Its Next.js cache and bounded query cache are local to that instance; more instances need a shared cache and coordinated invalidation first.

Database triggers coalesce publication, tool, app, category, GitHub, and CLI changes in `public.stack127_revalidation_events`. The Supabase `cache-worker` processes each captured change in this order:

1. Invalidate matching Next.js tags, paths, and query results.
2. Call the signed `/api/cache/refresh` endpoint. It loads pages inside the same app instance, checks their registry revision or current API data, and accepts a removed page only when it returns 404.
3. Purge the affected Cloudflare tags.
4. Fetch the public responses and check their revision or API digest again.
5. Remove only the captured event version and store its source fingerprint in one database transaction. A newer edit remains queued.

There is no separately exposed origin URL. The signed bridge avoids receiving Cloudflare's old response when rebuilding pages. The signing key stays in `public.stack127_cache_credentials`; it is not copied into app runtime configuration.

Worker settings:

- The queue trigger wakes it through `pg_net`, at most once every 5 seconds. Supabase Cron also wakes it every 30 seconds.
- Repeated imports wait for 10 quiet seconds, with a maximum wait of 60 seconds. More than 20 app changes become one catalogue refresh, keeping direct detail checks within the run budget.
- Failures retain the event and retry after 15 seconds, 1 minute, then every 5 minutes.
- A 150-second database lease allows one processor at a time; each run has a 90-second work budget.
- Every 15 minutes, source fingerprints are compared with acknowledged revisions to recover missed changes and deletions.
- Waiting updates older than 5 minutes open a GitHub issue; recovery closes it. This requires the existing `GITHUB_ALERT_TOKEN` function secret.

The worker runs only where `public.stack127_cache_worker_wake.function_url` is set. Development leaves it empty and uses `npm run stack127:cache:watch:local`. Function secrets include `SUPABASE_DB_URL`, `STACK127_SITE_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, and `GITHUB_ALERT_TOKEN`. `CACHE_WORKER_DRY_RUN=1` skips refreshes and leaves events queued. The release deploys the function after the new app is live when the function or its shared cache scripts change.

`public.stack127_cache_observation` records consecutive reliable operation. Errors, missed updates, updates waiting more than two minutes, and gaps in checks reset the clock. Content response rules remove inherited stale allowances, so the listed TTLs remain the safety limit. Run the status command with the production database environment:

```bash
node --env-file=.env.database scripts/stack127/cache/status.mjs
```

The maintenance workflow automatically skips its scheduled processor after one reliable day; manual dispatch still provides a backup and the shared lease prevents overlap. A later reliability failure can reactivate the backup. After seven reliable days it runs `configure-cloudflare.mjs --long-ttl --apply`; that script independently checks the gate before changing the content TTL. The scheduled workflow may run late, so this final policy change can happen after the seven-day mark. Scheduled checks remain; they do not serve or invalidate ordinary edits.

For an immediate policy review or application, load `.env.deploy` and run `scripts/stack127/cache/configure-cloudflare.mjs`, adding `--apply` to write it. With `--long-ttl`, also load `.env.database`. Without that flag, content keeps the one-day observation policy. Never bypass the seven-day gate.

If an edit is not live within two minutes, inspect the queue, worker state, observation table, and Supabase function logs. `select public.stack127_wake_cache_worker(true);` wakes the worker manually. The GitHub maintenance workflow is also a manual recovery route. Existing browser copies from the old policy must expire before they start checking each time.

## Security And Crawlers

- Cloudflare Managed Free Ruleset: enabled.
- Cloudflare-managed `robots.txt`: off. The application owns `/robots.txt`.
- AI crawler blocking: off.
- Security level: medium.
- Browser Integrity Check: off.
- Email Obfuscation: off.
- Rocket Loader: off.
- Hotlink Protection: off.

The managed WAF protects the public site without a custom blanket bot block. Browser, Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, and normal command-line requests must continue to reach public pages. Do not add user-agent blocks or broad challenge rules without testing these clients first.

Email obfuscation stays off so contact information remains present in server-rendered HTML for people, search crawlers, and agents.

## Credentials

Production identity and deployment credentials live only in `.env.deploy`. The
non-secret schema is `.env.deploy.example`:

```text
STACK127_PRODUCTION_TARGET
STACK127_PRODUCTION_PROVIDER
STACK127_PRODUCTION_HOST
STACK127_PRODUCTION_IPV6
STACK127_PRODUCTION_SSH_USER
STACK127_PRODUCTION_DOKPLOY_URL
STACK127_PRODUCTION_DOKPLOY_APP_ID
STACK127_PRODUCTION_DOKPLOY_APP_NAME
STACK127_PRODUCTION_REPOSITORY
STACK127_PRODUCTION_BRANCH
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
HOSTINGER_Token
```

The Hostinger token is retained only because Hostinger is the registrar. It is
not a Stack127 server or deployment target. Generic `VPS_*` variables and
`DOKPLOY_PUBLIC_URL` are forbidden because they previously selected the shared
Hostinger server implicitly.

Local infrastructure administration uses the Account API token named
`stack127-infrastructure`. It is stored in `.env.deploy` and covers the
`stack127.com`, `version127.com`, and `basebuddycms.com` zones. Its account and
zone permissions cover the DNS, redirects, Access, Tunnel, cache, WAF, TLS, and
other edge settings maintained from this repository. The existing token was
renamed and expanded in place on 20 August 2026; its secret value did not
change.

The GitHub production Environment uses a separate token. Release preflight
needs DNS Read and Zone Read, while release cache purge needs Cache Purge for
`stack127.com`. On 24 September 2026 the owner expanded this CI token to more
permissions and three zones. Narrowing it to those three required permissions
on `stack127.com` would reduce its access. Do not replace it with the local
administration token, commit token values, or print them in logs.

The complete secret-free key list and rotation procedure are in
`stack127_docs/environment-inventory.md`.

## Verification

Run these checks after changing DNS or edge rules:

```bash
curl -I 'http://www.stack127.com/self-host-apps?page=2'
curl -I 'https://stack127.com/self-host-apps'
curl -I 'https://stack127.com/app-icons/immich.png'
curl -I 'https://stack127.com/robots.txt'
curl -I 'https://stack127.com/sitemap.xml'
curl -I 'https://dokploy.stack127.com/'
```

Expected results:

- `www` returns one `301` to the same path and query on the apex HTTPS host.
- Repeated public HTML requests return `200`, browser `max-age=0, must-revalidate` and the edge TTL above, and eventually `cf-cache-status: HIT`.
- Repeated RSC navigation requests with the same `_rsc` query key can become cache `HIT`. Requests with cookies or authorization, health checks, and 404s do not use the public cache.
- A repeated static-asset request becomes a Cloudflare cache `HIT`.
- Robots and sitemap remain public.
- An unauthenticated Dokploy request returns a Cloudflare Access `302`, never the dashboard HTML.
- Direct connections to the OVH address on ports `80`, `443`, `2377`, `3000`, and `7946` time out from non-Cloudflare sources.
- The Stack127 service and unrelated services remain healthy in Dokploy and Docker.

## Deferred Hardening

DNSSEC is not enabled yet. Enable it only when the Cloudflare DS record can be added at Hostinger in the same maintenance window. Enabling one side without the other can make the domain unavailable.

After the one-day HSTS policy has been observed without errors, increase it in stages before considering `includeSubDomains`. Do not enable preload until every retained subdomain and administrative hostname is permanently HTTPS-capable and the owner explicitly accepts the difficult rollback.

Hostinger domain lock and WHOIS privacy are active for `stack127.com`, `version127.com`, and `basebuddycms.com`. `stack127.com` auto-renew is active. The two legacy redirect domains are currently non-renewing; enabling their renewal creates future charges and remains an explicit owner-confirmation step.

The old Stack127 service and Dokploy project were removed from the shared
Hostinger VPS on 31 July 2026 after the observation period and explicit
approval. All unrelated applications remain on that shared VPS.

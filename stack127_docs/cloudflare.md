# Cloudflare and DNS

stack127 uses Cloudflare for public DNS and as the edge proxy in front of its dedicated OVH deployment. This doc records the production setup. It never stores credentials or origin secrets.

## Production path

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

The Cloudflare zone is active. Hostinger delegates the domain to the two nameservers Cloudflare assigned. The apex and `www` records are both proxied.

## DNS

| Record | Setup |
| --- | --- |
| `stack127.com` | Proxied apex record to the stack127 origin. |
| `www.stack127.com` | Proxied CNAME to `stack127.com`. |
| `dokploy.stack127.com` | Proxied CNAME to the dedicated Cloudflare Tunnel. It doesn't resolve to the VPS address. |
| Google Search Console verification TXT | Kept, not proxied. |

- Canonical host: `https://stack127.com`.
- `www` redirect: permanent `301` that keeps the path and query string.

Don't replace the apex record or turn off its proxy until you've checked the Dokploy deployment and the Cloudflare redirect rule.

Hostinger is still the registrar and delegates authoritative DNS to Cloudflare. You don't need the Hostinger API for normal stack127 DNS record changes.

## TLS and transport

| Setting | Value |
| --- | --- |
| SSL mode | Full (strict) |
| Always Use HTTPS | On |
| Minimum TLS | 1.2 |
| TLS 1.3 | On |
| HSTS | Staged at one day (`max-age=86400`) with `nosniff`. Subdomains and preload stay off on purpose during observation. |
| Automatic HTTPS Rewrites | On |
| HTTP/3 | On |
| Brotli | On |
| 0-RTT | Off |

The OVH origin presents a Cloudflare Origin CA certificate for `stack127.com` and `www.stack127.com`. It's valid for the Full (strict) connection from Cloudflare to the origin.

## Private Dokploy administration

`https://dokploy.stack127.com` is the only intended browser entry point for the OVH Dokploy dashboard.

| Setting | Value |
| --- | --- |
| Cloudflare Tunnel name | `stack127-dokploy` |
| Tunnel origin | `http://127.0.0.1:3000` |
| Tunnel catch-all | `http_status:404` |
| Cloudflare Access application | `Stack127 Dokploy` |
| Access policy | `Stack127 administrators` |
| Policy decision | Allow only the explicitly approved administrator email addresses. |
| Application and policy session duration | 24 hours |
| App launcher | Hidden |

The OVH host runs `cloudflared-stack127-dokploy.service`. It uses a remotely managed Tunnel token, stored in a root-owned `0600` environment file.

The service runs with a dynamic user, no Linux capabilities, `NoNewPrivileges`, a read-only system view, and restricted address families. The other systemd sandbox controls are listed in the migration runbook.

Dokploy has:

```text
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://dokploy.stack127.com
```

Its Web Server settings list `dokploy.stack127.com` as the host, with HTTPS on and certificate type `none`. That's because Cloudflare ends the public TLS connection.

Direct public access to port `3000` stays blocked for IPv4 and IPv6.

## Caching

Public documents use `max-age=0, must-revalidate`, so browsers check their saved copy every time. Successful public HTML and Next.js navigation data get separate Cloudflare cache entries.

These skip the public cache: cookies, authorization, private endpoints, live DNS and IP results, and errors.

| Response | Edge time |
|---|---:|
| Content pages | 1 day during observation; 7 days after the reliability gate |
| Homepage, directories, app and device details | 24 hours |
| Search and filters, including planner search | 15 minutes |
| Sitemap and robots | 1 hour |
| Mutable icons, logos, and favicons | 30 days |
| Versioned Next.js bundles | Existing immutable 1 year policy |

Browser revalidation also applies to successful documents with cookies and to 304 responses. Cookies and authorization still skip the edge cache.

New client navigations reuse a page for at most 30 seconds instead of five minutes. Browser Back and Forward keep their normal history behavior.

Query pages keep their canonical base URL and `noindex, follow`. `_rsc` on its own is navigation data. It doesn't make a page a filtered search. Navigation cache keys keep the full query string.

The domain registry (RDAP) cache stays at 24 hours for registered domains and 1 hour for unregistered domains.

### Tags, routes, and the publication cache

The app sends `Cache-Tag` headers for public pages and mutable local assets. Each release:

1. Purges `stack127-public` and `stack127-assets`.
2. Purges changed public file URLs.
3. Warms the main routes.

Registry-owned SEO lives in `lib/registry-layout.tsx`.

The proxy checks the existing tagged publication cache before serving a page. A missing or unpublished exact slug gets the shared dynamic 404 page, which neither cache layer stores.

Thin route layouts supply the public path. That lets pages without request-specific data use the Next.js full-page cache. `scripts/stack127/cache/sync-registry-layouts.mjs` runs before development and builds to register new routes.

Directory queries use shared tagged data, with at most 500 recently used filter results per directory. Normal numbered pages share the complete default index.

Run one app instance. Its Next.js cache and bounded query cache live in that instance only. Before running more instances, add a shared cache and coordinated invalidation.

### Cache worker

Database triggers collect publication, tool, app, category, GitHub, and CLI changes in `public.stack127_revalidation_events`. The Supabase `cache-worker` handles each captured change in this order:

1. Invalidate the matching Next.js tags, paths, and query results.
2. Call the signed `/api/cache/refresh` endpoint. It loads pages inside the same app instance and checks their registry revision or current API data. It accepts a removed page only when it returns 404.
3. Purge the affected Cloudflare tags.
4. Fetch the public responses and check their revision or API digest again.
5. In one database transaction, remove only the captured event version and store its source fingerprint. A newer edit stays queued.

There's no separately exposed origin URL. The signed bridge avoids getting Cloudflare's old response while rebuilding pages. The signing key stays in `public.stack127_cache_credentials` and isn't copied into the app's runtime config.

Worker settings:

- The queue trigger wakes the worker through `pg_net`, at most once every 5 seconds. Supabase Cron also wakes it every 30 seconds.
- Repeated imports wait for 10 quiet seconds, up to 60 seconds. More than 20 app changes become one catalogue refresh, which keeps direct detail checks inside the run budget.
- Failures keep the event and retry after 15 seconds, then 1 minute, then every 5 minutes.
- A 150-second database lease lets only one processor run at a time. Each run has a 90-second work budget.
- Every 15 minutes, source fingerprints are compared with acknowledged revisions to catch missed changes and deletions.
- Updates waiting longer than 5 minutes open a GitHub issue. Recovery closes it. This needs the existing `GITHUB_ALERT_TOKEN` function secret.

The worker runs only where `public.stack127_cache_worker_wake.function_url` is set. Development leaves it empty and uses `npm run stack127:cache:watch:local`.

Function secrets include `SUPABASE_DB_URL`, `STACK127_SITE_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, and `GITHUB_ALERT_TOKEN`. `CACHE_WORKER_DRY_RUN=1` skips refreshes and leaves events queued.

When the function or its shared cache scripts change, the release deploys the function after the new app is live.

### Reliability gate

`public.stack127_cache_observation` records how long the cache has run reliably without a break. These reset the clock:

- Errors.
- Missed updates.
- Updates waiting more than two minutes.
- Gaps in checks.

Content response rules remove inherited stale allowances, so the TTLs above stay the safety limit. Run the status command with the production database environment:

```bash
node --env-file=.env.database scripts/stack127/cache/status.mjs
```

After one reliable day, the maintenance workflow skips its scheduled processor on its own. Manual dispatch still works as a backup, and the shared lease prevents overlap. A later reliability failure can turn the backup back on.

After seven reliable days, the workflow runs `configure-cloudflare.mjs --long-ttl --apply`. That script checks the gate itself before changing the content TTL. The scheduled workflow can run late, so this final policy change may land after the seven-day mark.

Scheduled checks keep running. They don't serve or invalidate ordinary edits.

To review or apply the policy right away, load `.env.deploy` and run `scripts/stack127/cache/configure-cloudflare.mjs`. Add `--apply` to write it. With `--long-ttl`, also load `.env.database`. Without that flag, content keeps the one-day observation policy. Never bypass the seven-day gate.

### When an edit isn't live

If an edit isn't live within two minutes, inspect the queue, worker state, observation table, and Supabase function logs.

- `select public.stack127_wake_cache_worker(true);` wakes the worker by hand.
- The GitHub maintenance workflow is also a manual recovery route.

Browser copies saved under the old policy have to expire before they start checking every time.

## Security and crawlers

| Setting | Value |
| --- | --- |
| Cloudflare Managed Free Ruleset | On |
| Cloudflare-managed `robots.txt` | Off. The app owns `/robots.txt`. |
| AI crawler blocking | Off |
| Security level | Medium |
| Browser Integrity Check | Off |
| Email Obfuscation | Off |
| Rocket Loader | Off |
| Hotlink Protection | Off |

The managed WAF protects the public site without a custom blanket bot block. Browsers, Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, and normal command-line requests must still reach public pages.

Don't add user agent blocks or broad challenge rules without testing these clients first.

Email obfuscation stays off so contact details stay in the server-rendered HTML for people, search crawlers, and agents.

## Credentials

Production identity and deployment credentials live only in `.env.deploy`. The non-secret schema is `.env.deploy.example`:

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

The Hostinger token is kept only because Hostinger is the registrar. Hostinger isn't a stack127 server or deployment target.

Generic `VPS_*` variables and `DOKPLOY_PUBLIC_URL` are forbidden. They used to quietly select the shared Hostinger server.

### Local administration token

Local infrastructure work uses the Account API token named `stack127-infrastructure`, stored in `.env.deploy`.

- It covers the `stack127.com`, `version127.com`, and `basebuddycms.com` zones.
- Its account and zone permissions cover the DNS, redirects, Access, Tunnel, cache, WAF, TLS, and other edge settings this repo maintains.
- The existing token was renamed and expanded in place on 20 August 2026. Its secret value didn't change.

### CI token

The GitHub production Environment uses a separate token. Release preflight needs DNS Read and Zone Read. Release cache purge needs Cache Purge for `stack127.com`.

On 24 September 2026, the owner expanded this CI token to more permissions and three zones. Narrowing it to the three required permissions on `stack127.com` would reduce its access.

Don't replace it with the local administration token. Don't commit token values or print them in logs.

The full secret-free key list and rotation steps are in `stack127_docs/environment-inventory.md`.

## Verification

Run these checks after you change DNS or edge rules:

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
- Repeated public HTML requests return `200`, browser `max-age=0, must-revalidate`, and the edge TTL above. They eventually show `cf-cache-status: HIT`.
- Repeated RSC navigation requests with the same `_rsc` query key can become a cache `HIT`. Requests with cookies or authorization, health checks, and 404s don't use the public cache.
- A repeated static asset request becomes a Cloudflare cache `HIT`.
- Robots and sitemap stay public.
- An unauthenticated Dokploy request returns a Cloudflare Access `302`, never the dashboard HTML.
- Direct connections to the OVH address on ports `80`, `443`, `2377`, `3000`, and `7946` time out from non-Cloudflare sources.
- The stack127 service and unrelated services stay healthy in Dokploy and Docker.

## Deferred hardening

DNSSEC isn't on yet. Turn it on only when you can add the Cloudflare DS record at Hostinger in the same maintenance window. Turning on one side without the other can take the domain offline.

Once the one-day HSTS policy has run without errors, raise it in stages before considering `includeSubDomains`. Don't turn on preload until two things are true:

- Every kept subdomain and admin hostname can serve HTTPS permanently.
- The owner explicitly accepts that rollback is hard.

Hostinger domain lock and WHOIS privacy are on for `stack127.com`, `version127.com`, and `basebuddycms.com`. Auto-renew is on for `stack127.com`.

The two legacy redirect domains aren't set to renew. Turning renewal on creates future charges, so it needs explicit owner confirmation.

The old stack127 service and Dokploy project were removed from the shared Hostinger VPS on 31 July 2026, after the observation period and explicit approval. Every unrelated app is still on that shared VPS.

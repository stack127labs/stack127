# Cloudflare and DNS

stack127 uses Cloudflare for public DNS and as the edge proxy in front of its dedicated OVH deployment. This doc records the production setup. It never stores credentials or origin secrets.

The hosting switches choose Cloudflare's free static frontend or the legacy OVH page host. [Static frontend](#static-frontend-on-cloudflare) describes the Cloudflare setup and its release checks. The earlier page-cache sections describe legacy mode. APIs stay on OVH in either mode.

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

Planned path once the static frontend is live:

```text
visitor or crawler
  -> Cloudflare DNS and edge
     stack127.com/api/*     -> no Worker  -> OVH app
     stack127.com/vitals/*  -> no Worker  -> OVH app
     stack127.com/*         -> stack127-frontend static files
```

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

This section describes responses from the OVH app. That's every page in legacy mode, and only `/api/*` and `/vitals/*` once the static frontend is live. Static files have their own rules under [Static frontend](#static-frontend-on-cloudflare).

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

Function secrets include `SUPABASE_DB_URL`, `STACK127_SITE_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, and `GITHUB_ALERT_TOKEN`. Cloudflare mode adds `STACK127_FRONTEND_HOSTING` and `GITHUB_FRONTEND_TOKEN`. `CACHE_WORKER_DRY_RUN=1` reports how many events are ready and changes nothing: no lease, retry state, reconcile, or alert.

Everything above is legacy mode. In Cloudflare mode the worker dispatches a GitHub build instead. See [Database edits in Cloudflare mode](#database-edits-in-cloudflare-mode).

When the function or its shared cache scripts change, the release deploys the function after the new app is live.

#### After the database move

The self-hosted Postgres on OVH has no Edge Functions, pg_cron, or pg_net. The same work runs as a Node job from cron on the OVH server: `scripts/stack127/cache/worker.mjs`, every minute, behind `flock`. It reuses the queue, the 150-second lease, the signing key in `public.stack127_cache_credentials`, the retry delays, the 15-minute reconcile, and the GitHub delay alert. It refuses to run while the Edge Function's wake URL, trigger, or cron job still exists, so it starts only after the switch SQL in `scripts/stack127/selfhost-db/switch/` has run. That folder's README lists the cron line, the environment file, and the switch order.

### Reliability gate

`public.stack127_cache_observation` records how long the cache has run reliably without a break. These reset the clock:

- Errors.
- Missed updates.
- Updates waiting more than two minutes. This target is for legacy mode. A Cloudflare mode edit takes several minutes.
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

In legacy mode, if an edit isn't live within two minutes, inspect the queue, worker state, observation table, and Supabase function logs.

- `select public.stack127_wake_cache_worker(true);` wakes the worker by hand.
- The GitHub maintenance workflow is also a manual recovery route.

In Cloudflare mode, allow several minutes. Then check the latest `stack127-frontend-refresh.yml` run, the queue's `last_error`, and the function logs. Run that workflow by hand with `force` to rebuild current main and retry delayed events, or with `dry_run` to check without changing anything.

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

On 5 October 2026, the owner authorized reusing existing keys. The GitHub production environment was updated to use the existing `stack127-infrastructure` token. No Cloudflare token was rotated or revoked. Release preflight needs DNS Read and Zone Read. Release cache purge needs Cache Purge for `stack127.com`.

The existing token now also has Workers Scripts Write on the account, and Workers Routes Write plus Zone Transform Rules Write on `stack127.com` only. These permissions deploy the static service and configure its routes and query headers. The account's `workers.dev` subdomain read passed. The workflows also have `CLOUDFLARE_ACCOUNT_ID`.

Don't commit token values or print them in logs.

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

After the static frontend is live, also run:

```bash
curl -s 'https://stack127.com/frontend-release.json'
curl -I 'https://stack127.com/self-host-apps?page=2'
curl -I 'https://stack127.com/api/health?scope=deploy'
```

- The release file and every page's `X-Stack127-Frontend-SHA` show the released commit.
- The query URL returns `X-Robots-Tag: noindex, follow`.
- The health check still comes from OVH and reports the same commit.

## Static frontend on Cloudflare

The scripts in `scripts/stack127/frontend/` and the refresh workflow implement Cloudflare mode. Check the hosting switches and live revision to determine the active mode. A cutover is complete only after [Release in Cloudflare mode](#release-in-cloudflare-mode) passes.

The owner authorized moving public pages to Cloudflare's free static hosting. The OVH app stays as the API server and as the rollback site.

| Part | Setup |
| --- | --- |
| Service | `stack127-frontend`, a Workers service with static assets only. It has no Worker script, bindings, or `run_worker_first`, so no code runs on a request. |
| Routes | `stack127.com/api/*` and `stack127.com/vitals/*` have no Worker, so they go to OVH. `stack127.com/*` goes to `stack127-frontend`. The script writes the two exclusions before the catch-all, and refuses to replace a route another Worker owns. |
| DNS | Unchanged. The proxied apex record still points to OVH, which the API routes need. Hostinger stays the registrar. No custom domain is needed. |
| Preview | `stack127-frontend-preview` on `workers.dev`. Every run checks it before production. `workers.dev` responses send `noindex`. |
| Missing pages | The exported `404.html`, with status 404 and browser revalidation. Cloudflare can cache that file at the edge. |
| Version | Every response sends `X-Stack127-Frontend-SHA`. `/frontend-release.json` holds the commit, page count, and build time. |

### What the export holds

`scripts/stack127/frontend/build.mjs` makes a real Next.js static export. It runs only on GitHub and refuses to run anywhere else.

1. It reads published pages from `public.stack127_pages`. Tool, directory, and catalog pages also need their family row.
2. `prepare.mjs` copies only `app`, `lib`, `public`, the Next.js and TypeScript config, and the package files into a temporary project. No `.env` files, git state, or server output go in.
3. It removes `app/api`, `app/vitals`, `app/publication-not-found`, and every page that isn't published.
4. Dynamic routes get their exact parameters from the registry, with `dynamicParams = false`. The catalog `[slug]` route takes only catalog pages.
5. It runs the strict static route check. It fails if content changed during the build, or if an exported page's `stack127-content-revision` differs from its registry row.
6. It writes `_headers`, `_redirects` from the exact Next.js redirects, and `frontend-release.json`.

The output holds only the published pages (about 340 routes today), their RSC navigation `.txt` files, and public files. It has no secrets, API routes, or proxy code.

Before upload, `assets.mjs` checks the Cloudflare Free limits: at most 20,000 files, and 25 MiB per file. The count includes the RSC `.txt` files, which add several files per page. The build prints how many files are left.

### Headers and SEO

| Path | Headers |
| --- | --- |
| `/_next/static/*` | `public, max-age=31536000, immutable` |
| Other paths | Cloudflare's default asset caching, which revalidates |
| `*.txt` | `noindex`, with Cloudflare's text MIME type |
| `/404` | `no-store` and `noindex` |
| `/frontend-release.json` | `noindex` |

`proxy.ts` doesn't run on static hosting. A free zone response header transform rule, `Stack127 query pages: noindex`, sets `X-Robots-Tag: noindex, follow` on any query URL outside `/api/`, `/_next/`, and `/vitals/`. Canonicals, robots meta tags, and JSON-LD still come from the registry, inside the exported HTML. Indexable pages send no robots meta tag, so a query URL, which gets the same file, carries only the `noindex` header.

Static files are public whatever cookies the request carries, so analytics cookies don't lower the hit rate. The JSON routes on OVH keep their cookie bypass. To cache JSON requests that carry analytics cookies, add a strict allowlist of those cookie names. Don't remove the cookie checks.

Next.js accepts plain text navigation files in a static export. The build keeps `/robots.txt` as plain text too. Before upload, it scans every exported file for private credentials from the build environment and fails if it finds one.

### Client navigation

The static build sets Next.js `staleTimes.static` to 300 seconds, so a prefetched page is reused for 5 minutes. The OVH build keeps 30 seconds, so a rollback behaves as it does today.

Shared links prefetch only on intent: a mouse resting on the link for 80 ms, keyboard focus, or a touch. Each page view prefetches at most 12 links. A link is fetched again only after 5 minutes. Data saver and 2G connections skip it. See `app/ui/site/intent-prefetch-listener.tsx`.

### Hosting mode

Two switches pick the mode. Both default to legacy, where OVH serves pages and the cache worker refreshes them.

| Switch | Where |
| --- | --- |
| `STACK127_FRONTEND_HOSTING=cloudflare` | GitHub repository variable and matching `production` environment variable |
| `STACK127_FRONTEND_HOSTING=cloudflare` | Supabase `cache-worker` function secret |

After the isolated preview passes, set both GitHub variable scopes to Cloudflare mode so the release builds and activates the static frontend. Once the production route passes its checks, enable the Supabase hosting secret and verify a content refresh. Reset all three settings on rollback.

### Database edits in Cloudflare mode

This covers database edits: titles, search metadata, cards, dates, records, and content of pages that haven't moved to MDX. MDX page content ships with a code release instead.

A database edit still queues an event. The `cache-worker` doesn't refresh pages. It:

1. Checks for an active `stack127-frontend-refresh.yml` run on `main`. If none is running or queued, it dispatches one with `GITHUB_FRONTEND_TOKEN`.
2. Keeps its database lease after a dispatch, because a new run takes a moment to show in GitHub's API.
3. Never removes an event. A failed dispatch adds the normal retry delay.

The workflow joins the `stack127-production` concurrency group, then:

1. Checks out current `main` and checks that the live backend health SHA matches it.
2. Captures the queued event versions and their source fingerprints in one database snapshot.
3. Builds the full static export, previews it, checks `main` and the backend again, and deploys it.
4. Checks the public pages byte for byte against the export. Removed pages must return 404.
5. Refreshes the API responses that still live on OVH through the signed bridge, and purges their Cloudflare tags.
6. Removes only the captured event versions whose fingerprints still match. A newer edit stays queued for the next run.

A failure keeps the events and adds the retry delay. If `main` moves during a run, its events stay queued for the next build.

Every edit is a full build and deploy, so it takes several minutes to go live, not two.

Cloudflare mode opens the delay alert after 30 minutes. Dispatch alone does not advance `last_success_at`; verified deployment does, including a forced build with an empty queue. The legacy two-minute reliability and seven-day TTL gates do not apply. Run `content-queue.mjs status` with `STACK127_FRONTEND_HOSTING=cloudflare` to inspect this mode. Resource planner search responses must also match fresh database results before the workflow acknowledges related edits.

### Free plan limits

Static asset requests run no Worker code, so they don't count toward the Workers Free request limit.

GitHub Actions minutes are a separate budget. One active run at a time, plus the queue, turns a burst of edits into a few builds. That doesn't promise either free tier will cover this for years. Check usage from time to time.

The repository is private, so its GitHub builds consume the account's included minutes. In Cloudflare mode, Supabase dispatches builds only for pending edits. The GitHub backup runs once an hour and checks for pending edits before dispatching. It does not rebuild an unchanged site.

### Release in Cloudflare mode

1. Build the static export from the merge commit and check it on the preview service, before the backend changes.
2. Deploy the backend image and confirm its health SHA.
3. Deploy the static frontend. The first release also writes the routes and the header rule.
4. Check that `/`, `/robots.txt`, `/sitemap.xml`, and `/frontend-release.json` send the release SHA, and that a missing path returns 404.

The release is complete only when:

```text
merge commit = origin/main = deployed image SHA = backend health SHA = frontend-release.json SHA
```

### Rollback

To send pages back to OVH:

1. Run `node scripts/stack127/frontend/deploy.mjs --rollback-to-origin` with the deploy Cloudflare credentials. It removes only the `stack127.com/*` route that points to `stack127-frontend`. Pages fall through to the OVH standalone app, which every release still deploys.
2. Set both GitHub variable scopes and the Supabase hosting secret back to legacy.
3. Check `/api/health?scope=deploy`, the homepage, and a recently edited page.

The API exclusion routes and the header rule can stay. They match what `proxy.ts` does.

Cloudflare can also roll `stack127-frontend` back to an earlier version. That version serves exactly its own files, including its own `_next/static` scripts. A tab opened on the newer version can then ask for scripts that no longer exist, and client navigation can fail until a full reload. Test navigation in an open tab before you rely on this kind of rollback.

## Deferred hardening

DNSSEC isn't on yet. Turn it on only when you can add the Cloudflare DS record at Hostinger in the same maintenance window. Turning on one side without the other can take the domain offline.

Once the one-day HSTS policy has run without errors, raise it in stages before considering `includeSubDomains`. Don't turn on preload until two things are true:

- Every kept subdomain and admin hostname can serve HTTPS permanently.
- The owner explicitly accepts that rollback is hard.

Hostinger domain lock and WHOIS privacy are on for `stack127.com`, `version127.com`, and `basebuddycms.com`. Auto-renew is on for `stack127.com`.

The two legacy redirect domains aren't set to renew. Turning renewal on creates future charges, so it needs explicit owner confirmation.

The old stack127 service and Dokploy project were removed from the shared Hostinger VPS on 31 July 2026, after the observation period and explicit approval. Every unrelated app is still on that shared VPS.

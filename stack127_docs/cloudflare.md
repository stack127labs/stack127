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

Public documents use a 10-minute browser TTL and a one-day edge TTL. Successful HTML without `Set-Cookie` is cached at the edge. Next.js navigation responses (`text/x-component` with an `_rsc` query key) use separate cache rules and keep their full query string, so clicks can reuse the matching response. Cookies, authorization, error responses, and private API routes bypass these rules. Unpublished and missing pages remain uncacheable 404s.

The application adds `Cache-Tag` headers for public paths. Release deployment purges the `stack127-public` tag and warms primary routes. Database triggers coalesce publication, tool-content, app, category, and CLI changes in `public.stack127_revalidation_events`. The scheduled `Stack127 Cache Maintenance` workflow runs every five minutes, invalidates the Next.js data cache, purges affected Cloudflare tags, and warms changed paths from `public.stack127_cache_warm_events`. The queue is safe to retry; check its pending count and workflow logs if published edits do not appear after a few minutes. Browser cache copies cannot be purged and can remain for up to 10 minutes after a change.

Public detail APIs under `/api/shortcuts/`, `/api/hardware-directory/`, `/api/resource-planner-app/`, and `/api/self-host-apps/`, plus `/api/resource-planner-index`, opt into edge caching. Static detail responses use one hour in browsers and one day at the edge. Database-backed details and the planner index use 10 minutes in browsers and one day at the edge. Failed or unpublished responses use `no-store`. Health and private API endpoints remain dynamic.

A cache rule covers mutable static site assets under `/app-icons/`, `/logos/`, and the favicon and app-icon files:

- Edge TTL: 30 days for successful responses.
- Browser TTL: 1 day.
- `300` through `499`: no edge cache.
- `500` and above: no store.

Next.js immutable assets under `/_next/static/` keep their existing long-lived immutable cache headers.

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

The GitHub production Environment deliberately uses a different, narrower
token. Release preflight needs only DNS Read and Zone Read for `stack127.com`.
Do not grant CI the broader local administration token. Do not use Cloudflare
User API tokens for either purpose, commit token values, or print them in logs.

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
- Repeated public HTML requests return `200`, `cache-control: max-age=600, s-maxage=86400, public`, and eventually `cf-cache-status: HIT`.
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

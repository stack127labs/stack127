# Cloudflare And DNS

Version127 uses Cloudflare as the public DNS provider and edge proxy in front of the Dokploy deployment. This document records the production setup without storing credentials or origin details in the repository.

## Production Path

```text
visitor or crawler
  -> Cloudflare DNS and edge
  -> Dokploy Traefik on the shared VPS
  -> Version127 service
  -> production Supabase database when the page needs structured data
```

The Cloudflare zone is active. Hostinger delegates the domain to the two nameservers assigned by Cloudflare. Both the apex and `www` records are proxied.

## DNS

- `version127.com`: proxied apex record to the Version127 origin.
- `www.version127.com`: proxied CNAME to `version127.com`.
- Google Search Console verification TXT: preserved and not proxied.
- Canonical host: `https://version127.com`.
- `www` redirect: permanent `301`, preserving the path and query string.

Do not replace the apex record or disable its proxy without first checking the Dokploy deployment and the Cloudflare redirect rule.

## TLS And Transport

- SSL mode: Full (strict).
- Always Use HTTPS: on.
- Minimum TLS: 1.2.
- TLS 1.3: on.
- Automatic HTTPS Rewrites: on.
- HTTP/3: on.
- Brotli: on.
- 0-RTT: off.

The Dokploy origin currently has a valid publicly trusted certificate, which is required by Full (strict).

## Caching

HTML is not cached at the edge. Dynamic pages keep the application's private or no-store response headers.

A cache rule covers only mutable static site assets under `/app-icons/`, `/logos/`, and the favicon and app-icon files:

- Edge TTL: 30 days for successful responses.
- Browser TTL: 1 day.
- `300` through `499`: no edge cache.
- `500` and above: no store.

Next.js immutable assets under `/_next/static/` keep their existing long-lived immutable cache headers.

## Security And Crawlers

- Cloudflare Managed Free Ruleset: enabled.
- Security level: medium.
- Browser Integrity Check: off.
- Email Obfuscation: off.
- Rocket Loader: off.
- Hotlink Protection: off.

The managed WAF protects the public site without a custom blanket bot block. Browser, Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, and normal command-line requests must continue to reach public pages. Do not add user-agent blocks or broad challenge rules without testing these clients first.

Email obfuscation stays off so contact information remains present in server-rendered HTML for people, search crawlers, and agents.

## Credentials

Deployment credentials live only in `.env.deploy`:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
HOSTINGER_Token
```

The Cloudflare token must be scoped to the Version127 account and zone. It needs DNS edit, zone settings edit, rulesets edit, and zone read permissions for the current workflow. Do not commit the token or print its value in logs.

## Verification

Run these checks after changing DNS or edge rules:

```bash
curl -I 'http://www.version127.com/self-host-apps?page=2'
curl -I 'https://version127.com/self-host-apps'
curl -I 'https://version127.com/app-icons/immich.png'
curl -I 'https://version127.com/robots.txt'
curl -I 'https://version127.com/sitemap.xml'
```

Expected results:

- `www` returns one `301` to the same path and query on the apex HTTPS host.
- Public HTML returns `200` and `cf-cache-status: DYNAMIC`.
- A repeated static-asset request becomes a Cloudflare cache `HIT`.
- Robots and sitemap remain public.
- The Version127 service and unrelated services remain healthy in Dokploy and Docker.

## Deferred Hardening

DNSSEC is not enabled yet. Enable it only when the Cloudflare DS record can be added at Hostinger in the same maintenance window. Enabling one side without the other can make the domain unavailable.

The shared VPS still accepts the Version127 hostname at the origin. Do not restrict ports `80` or `443` globally because Dokploy, Bloxodes, Umami, Vaultwarden, Supabase, and other services share the host. A later origin-isolation pass should use a Version127-only Traefik policy or a staged Cloudflare Tunnel, verify certificate renewal, and preserve a tested rollback path.

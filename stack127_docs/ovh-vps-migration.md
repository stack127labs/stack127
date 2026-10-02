# stack127 OVH VPS migration

This runbook moves only stack127 to its own OVH VPS. Bloxodes, Dokploy, Supabase, Umami, Vaultwarden, Basebuddy, and every other app on the current shared VPS stay where they are.

Keep the old stack127 deployment online until the new origin passes every acceptance check and the Cloudflare cutover is confirmed. Don't stop or remove the old service during preparation.

## Current migration state

stack127 moved to the dedicated OVH origin on 16 July 2026 at 10:15 UTC.

- The host is hardened.
- Docker and Swarm have native IPv6 egress.
- Dokploy is healthy and private.
- Cloudflare serves the OVH origin over both its IPv4 and IPv6 records.
- The Dokploy dashboard is reachable only through `https://dokploy.stack127.com`, behind Cloudflare Access and an outbound-only Cloudflare Tunnel.

The origin presents a Cloudflare Origin CA certificate for `stack127.com` and `www.stack127.com`. Full (strict) stayed on through the whole cutover.

The observation window passed. On 31 July 2026, the old stack127 app, project, service, image, build folder, and logs were removed from the shared Hostinger VPS. Every unrelated service is still on that shared VPS.

## Sources of truth

| Item | Value |
| --- | --- |
| Application repository | `stack127labs/stack127` |
| Production repository branch | `main` |
| First repository-backed production commit | `d4a31afdad4649277ae515bcec5d2aafaa4d754a` |
| Current production image | Built by Dokploy from the repository `Dockerfile` and deployed as `app-navigate-1080p-matrix-3pmfy6:latest` |
| Previous accepted rollback image | `127.0.0.1:5000/stack127@sha256:41dc3a03699ddda2cad363663f66116dd8d8fb8b11d42ab0d33c630d8a14c72b` |
| Build type | Repository `Dockerfile` |
| Build path | Repository root |
| Container port | `3000` |
| Canonical host | `https://stack127.com` |
| Secondary host | `https://www.stack127.com` |
| Production database | The external `DATABASE_URL` stored in `.env.database` |
| Analytics values | `.env.analytics` |
| Infrastructure and Cloudflare credentials | `.env.deploy` |

Never copy credentials into this doc, shell history, build logs, commits, or screenshots.

## Phase 1: Set up trusted access

- [x] Verify the OVH SSH host fingerprint independently.
- [x] Install the dedicated Bitwarden-managed Ed25519 key for the `ubuntu` account.
- [x] Confirm key-only SSH access from a fresh session.
- [x] Confirm `ubuntu` has working sudo access.
- [x] Turn off SSH password login only after the key login works.
- [x] Turn off root SSH login, keyboard-interactive login, and X11 forwarding.
- [x] Keep an existing SSH session open while you test the hardened config.

## Phase 2: Prepare the host

- [x] Record the untouched OS, CPU, memory, storage, network, and listening port baseline.
- [x] Install security and kernel updates, then reboot.
- [x] Confirm SSH still works after the reboot.
- [x] Set a default-deny host firewall.
- [x] Allow SSH, HTTP, HTTPS, and the ICMPv6 traffic IPv6 needs.
- [x] Don't expose databases, Docker APIs, internal dashboards, or DNS proxy ports.
- [x] Add a small swap file for deployment spikes, and keep normal workloads in RAM.
- [x] Turn on automatic security updates and time sync.

## Phase 3: Prove IPv6 before Dokploy

The old shared VPS was hard to fix because Docker Swarm already existed with an IPv4-only gateway bridge. Set up the new server in the right order.

- [x] Confirm the host owns its assigned IPv6 address and has a working default route.
- [x] Confirm outbound IPv6 TCP and UDP traffic from the host.
- [x] Install Docker from its official repository.
- [x] Configure Docker IPv6 and packet filter integration before creating the Swarm.
- [x] Create the IPv6-capable `docker_gwbridge` before starting the Swarm.
- [x] Start the single-node Swarm, or let Dokploy start it without replacing the prepared bridge.
- [x] Run a throwaway Swarm service and prove real IPv4 and IPv6 egress from inside the container.
- [x] Confirm the test service isn't publicly exposed, then remove it.

An AAAA record that resolves doesn't prove IPv6 works. The container must connect to a real IPv6 destination.

## Phase 4: Install the deployment layer

- [x] Install a clean Dokploy instance just for stack127.
- [x] Keep the Dokploy admin surface private or behind its own access control.
- [x] Expose only Traefik ports `80` and `443` publicly.
- [x] Create a new stack127 app in the isolated Dokploy project from the exact accepted migration image.
- [x] Configure start-first updates, automatic rollback when an update fails, and one replica.
- [x] Pin the production service to the accepted registry digest. Confirm 90 public `200` responses in a row during its start-first deployment.
- [x] Commit and push the migration changes. Then connect the Dokploy app to the private repository and `main` branch with a read-only deploy key scoped to that repository.
- [x] Add the current Supabase root certificate without copying unrelated files from the old VPS.
- [x] Add only these runtime variables:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `UMAMI_URL`
  - `UMAMI_WEBSITE_ID`
- [x] Configure the apex and `www` domains before changing public DNS.

## Phase 5: Private origin acceptance

Test the new origin directly, with explicit host resolution, while Cloudflare still points to the old VPS.

- [x] Home, directory, course, legal, and DNS tool pages return the expected status.
- [x] Published pages are indexable, and unpublished pages return `404`.
- [x] Query-string tool results stay `noindex, follow`.
- [x] `/robots.txt` and `/sitemap.xml` match production publication state.
- [x] Static assets, favicons, fonts, and theme assets render correctly.
- [x] The production database is reachable through the mounted CA certificate.
- [x] All seven DNS tools return real results.
- [x] Direct authoritative DNS works over UDP and TCP port `53`.
- [x] Nameserver, SOA, and DNS change checks reach IPv4 and IPv6 nameserver addresses.
- [x] Raw responses and downloads stay inside the page layout.
- [x] Rate limits, body limits, target address validation, and same-origin checks still work.
- [x] Docker, Traefik, Dokploy, and the stack127 service stay healthy under repeated checks.
- [x] `npm run quality` passes from the exact revision being deployed.

## Phase 6: Cloudflare cutover

- [x] Record the existing proxied apex value and TTL for rollback.
- [x] Keep the proxied automatic TTL during the maintenance window.
- [x] Change only the stack127 apex origin, and add its OVH IPv6 origin record.
- [x] Keep `www` pointing to the canonical apex flow.
- [x] Keep Cloudflare proxying, Full (strict), HTTPS redirects, WAF, cache rules, and crawler policy unchanged.
- [x] Confirm the new origin certificate works through Cloudflare.
- [x] Once the proxy serves the new origin, change `/etc/stack127/firewall-mode` from `public` to `cloudflare`, refresh the official Cloudflare IP ranges, and reapply the Docker firewall.
- [x] Test desktop, mobile, crawlers, APIs, DNS tools, redirects, cache behavior, robots, and sitemap.
- [x] Confirm unrelated sites on the old VPS still return their normal responses.

The OVH host keeps the official Cloudflare IPv4 and IPv6 ranges in `/etc/stack127/cloudflare-ips-v4` and `/etc/stack127/cloudflare-ips-v6`. `stack127-cloudflare-ips-refresh.timer` refreshes and validates those lists every week.

The firewall stays in `public` mode during direct origin acceptance. `cloudflare` mode allows HTTP, HTTPS, and HTTP/3 only from Cloudflare, and keeps blocking Dokploy and other Docker-published ports.

## Phase 7: Observation and rollback

- [x] Keep the old stack127 service running for at least 48 hours.
- [x] Monitor app availability, the Dokploy service, registry, Traefik, and Cloudflare-only firewall every five minutes with `stack127-production-health.timer`.
- [x] Right after cutover, check app errors, resource use, Docker restarts, TLS, DNS tool timeouts, IPv6 checks, and Cloudflare origin failures.
- [ ] If the new origin fails, restore the recorded Cloudflare apex value and confirm the public site recovers before you investigate.
- [x] Remove the old stack127 service only after the observation window and explicit approval.
- [x] Don't remove or change any unrelated service, network, volume, database, firewall rule, or Dokploy project on the old VPS.

## Phase 8: Private Dokploy administration

- [x] Create the remotely managed Cloudflare Tunnel `stack127-dokploy`.
- [x] Route only `dokploy.stack127.com` to `http://127.0.0.1:3000`.
- [x] End the Tunnel config with an `http_status:404` catch-all.
- [x] Create a proxied CNAME from `dokploy.stack127.com` to the Tunnel hostname.
- [x] Create the `Stack127 Dokploy` self-hosted Access application.
- [x] Attach the `Stack127 administrators` allow policy with only the approved administrator email addresses.
- [x] Use a 24-hour application and policy session.
- [x] Keep the application out of the Access app launcher.
- [x] Install Cloudflare's signed `cloudflared` package from its stable APT repository.
- [x] Run `cloudflared-stack127-dokploy.service` with a dynamic user, no capabilities, `NoNewPrivileges`, restricted address families, protected kernel and system paths, and a root-owned `0600` token file.
- [x] Add the HTTPS hostname and local origins to `BETTER_AUTH_TRUSTED_ORIGINS`.
- [x] Set the Dokploy Web Server host to `dokploy.stack127.com`, with HTTPS on and certificate type `none`.
- [x] Verify the stored Dokploy admin password with login, session, dashboard redirect, and logout checks, without printing it.
- [x] Confirm Cloudflare reports the Tunnel healthy and the connector makes QUIC connections over IPv6.
- [x] Confirm an unauthenticated browser request gets a Cloudflare Access redirect.
- [x] Confirm the Access sign-in page shows an email login flow.
- [x] Confirm direct public access to Dokploy port `3000` times out.
- [x] Confirm direct public access to Swarm ports `2377` and `7946` times out.
- [x] Confirm the Cloudflare-only firewall blocks direct public origin access on `80` and `443`.
- [x] Confirm `stack127.com` still returns `200` after the admin setup.
- [x] Store a dedicated Ed25519 key in Dokploy. Add only its public half to the private GitHub repository as a verified read-only deploy key.
- [x] Build and deploy commit `d4a31afdad4649277ae515bcec5d2aafaa4d754a` from `main`, keeping start-first updates and rollback on failure.
- [x] Confirm all seven DNS APIs return successful production results after the repository-backed rollout.

The Hostinger API wasn't used for this hostname, because Cloudflare is authoritative for the stack127 zone.

If the Tunnel token is ever exposed, rotate it through Cloudflare. Then replace `/etc/cloudflared/stack127-dokploy.env` and restart the service.

Keep `cloudflared` updated through the signed Cloudflare APT repository.

## When the migration is complete

The migration is complete only when all of these are true:

- stack127 is served from the OVH VPS through Cloudflare.
- Direct checks have told the old and new origin paths apart.
- Native IPv6 works from both the host and the deployed stack127 container.
- Every DNS tool passes live output and rendering checks.
- Search, security, privacy, rate limit, download, and responsive layout checks pass.
- Every unrelated app on the old VPS stays healthy.
- The rollback path is recorded and still usable during the observation window.

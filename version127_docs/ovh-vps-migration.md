# Version127 OVH VPS Migration

This runbook moves only Version127 to its own OVH VPS. Bloxodes, Dokploy, Supabase, Umami, Vaultwarden, Basebuddy, and every other application on the current shared VPS stay where they are.

The old Version127 deployment remains online until the new origin passes every acceptance check and the Cloudflare cutover is confirmed. Do not stop or remove the old service during preparation.

## Current Migration State

Version127 was cut over to the dedicated OVH origin on 16 July 2026 at 10:15 UTC. The host is hardened, Docker and Swarm have native IPv6 egress, Dokploy is healthy and private, and Cloudflare serves the OVH origin over both its IPv4 and IPv6 records. The Dokploy dashboard is available only through `https://dokploy.version127.com`, protected by Cloudflare Access and an outbound-only Cloudflare Tunnel.

The origin presents a Cloudflare Origin CA certificate for `version127.com` and `www.version127.com`, and the existing Full (strict) setting remained enabled throughout cutover. The old Version127 service remains `1/1` on the shared VPS as the rollback path until at least 18 July 2026 at 10:15 UTC. Every unrelated service remains on the shared VPS.

## Sources Of Truth

- Application repository: `RaviTejaKNTS/version127`
- Intended repository branch after the local migration changes are intentionally published: `main`
- Current production image: the exact accepted local worktree, pinned to `127.0.0.1:5000/version127@sha256:41dc3a03699ddda2cad363663f66116dd8d8fb8b11d42ab0d33c630d8a14c72b`
- Build type: repository `Dockerfile`
- Build path: repository root
- Container port: `3000`
- Canonical host: `https://version127.com`
- Secondary host: `https://www.version127.com`
- Production database: the external `DATABASE_URL` stored in `.env.database`
- Analytics values: `.env.analytics`
- Infrastructure and Cloudflare credentials: `.env.deploy`

Never copy credentials into this document, shell history, build logs, commits, or screenshots.

## Phase 1: Establish Trusted Access

- [x] Verify the OVH SSH host fingerprint independently.
- [x] Install the dedicated Bitwarden-managed Ed25519 key for the `ubuntu` account.
- [x] Confirm key-only SSH access from a fresh session.
- [x] Confirm `ubuntu` has working sudo access.
- [x] Disable SSH password authentication only after the key login succeeds.
- [x] Disable root SSH login, keyboard-interactive login, and X11 forwarding.
- [x] Keep an existing SSH session open while validating the hardened configuration.

## Phase 2: Prepare The Host

- [x] Record the untouched OS, CPU, memory, storage, network, and listening-port baseline.
- [x] Install security and kernel updates, then reboot.
- [x] Confirm SSH still works after the reboot.
- [x] Set a default-deny host firewall.
- [x] Allow SSH, HTTP, HTTPS, and the ICMPv6 traffic required for IPv6 operation.
- [x] Do not expose databases, Docker APIs, internal dashboards, or DNS proxy ports.
- [x] Add a small swap file for deployment spikes and keep normal workloads in RAM.
- [x] Enable automatic security updates and time synchronisation.

## Phase 3: Prove IPv6 Before Dokploy

The old shared VPS was difficult to correct because Docker Swarm already existed with an IPv4-only gateway bridge. The new server must be configured in the correct order.

- [x] Confirm the host owns its assigned IPv6 address and has a working default route.
- [x] Confirm outbound IPv6 TCP and UDP traffic from the host.
- [x] Install Docker from its official repository.
- [x] Configure Docker IPv6 and packet-filter integration before creating the Swarm.
- [x] Create the IPv6-capable `docker_gwbridge` before Swarm initialisation.
- [x] Initialise the single-node Swarm or let Dokploy initialise it without replacing the prepared bridge.
- [x] Run a disposable Swarm service and prove real IPv4 and IPv6 egress from inside the container.
- [x] Confirm the test service is not publicly exposed, then remove it.

Do not treat DNS resolution of an AAAA record as proof of IPv6 connectivity. The container must connect to a real IPv6 destination.

## Phase 4: Install The Deployment Layer

- [x] Install a clean, Version127-only Dokploy instance.
- [x] Keep the Dokploy administration surface private or separately access-controlled.
- [x] Expose only Traefik ports `80` and `443` publicly.
- [x] Create a new Version127 application in the isolated Dokploy project from the exact accepted migration image.
- [x] Configure start-first updates, automatic rollback on update failure, and one replica.
- [x] Pin the production service to the accepted registry digest and confirm 90 consecutive public `200` responses during its start-first deployment.
- [ ] After the local dependency and migration-document changes are intentionally committed and pushed, connect the Dokploy application to the public repository and `main` branch.
- [x] Add the current Supabase root certificate without copying unrelated old-VPS files.
- [x] Add only these runtime variables:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `UMAMI_URL`
  - `UMAMI_WEBSITE_ID`
- [x] Configure the apex and `www` domains before changing public DNS.

## Phase 5: Private Origin Acceptance

Test the new origin directly with explicit host resolution while Cloudflare still points to the old VPS.

- [x] Home, directory, course, legal, and DNS tool pages return the expected status.
- [x] Published pages are indexable and unpublished pages return `404`.
- [x] Query-string tool results remain `noindex, follow`.
- [x] `/robots.txt` and `/sitemap.xml` match production publication state.
- [x] Static assets, favicons, fonts, and theme assets render correctly.
- [x] The production database is reachable through the mounted CA certificate.
- [x] All seven DNS tools return real results.
- [x] Direct authoritative DNS works over UDP and TCP port `53`.
- [x] Nameserver, SOA, and DNS change checks reach IPv4 and IPv6 nameserver addresses.
- [x] Raw responses and downloads stay inside the page layout.
- [x] Rate limits, body limits, target-address validation, and same-origin checks still work.
- [x] Docker, Traefik, Dokploy, and the Version127 service remain healthy under repeated checks.
- [x] `npm run quality` passes from the exact revision being deployed.

## Phase 6: Cloudflare Cutover

- [x] Record the existing proxied apex value and TTL for rollback.
- [x] Keep the proxied automatic TTL during the maintenance window.
- [x] Change only the Version127 apex origin and add its OVH IPv6 origin record.
- [x] Keep `www` pointing to the canonical apex flow.
- [x] Keep Cloudflare proxying, Full (strict), HTTPS redirects, WAF, cache rules, and crawler policy unchanged.
- [x] Confirm the new origin certificate works through Cloudflare.
- [x] Change `/etc/version127/firewall-mode` from `public` to `cloudflare`, refresh the official Cloudflare IP ranges, and reapply the Docker firewall after the proxy is serving the new origin.
- [x] Test desktop, mobile, crawlers, APIs, DNS tools, redirects, cache behaviour, robots, and sitemap.
- [x] Confirm unrelated sites on the old VPS still return their normal responses.

The OVH host keeps the official Cloudflare IPv4 and IPv6 ranges in `/etc/version127/cloudflare-ips-v4` and `/etc/version127/cloudflare-ips-v6`. `version127-cloudflare-ips-refresh.timer` refreshes and validates those lists weekly. The firewall stays in `public` mode during direct origin acceptance; `cloudflare` mode allows HTTP, HTTPS, and HTTP/3 only from Cloudflare while continuing to block Dokploy and other Docker-published ports.

## Phase 7: Observation And Rollback

- [ ] Keep the old Version127 service running for at least 48 hours.
- [x] Monitor application availability, the Dokploy service, registry, Traefik, and Cloudflare-only firewall every five minutes with `version127-production-health.timer`.
- [x] Check application errors, resource use, Docker restarts, TLS, DNS tool timeouts, IPv6 checks, and Cloudflare origin failures immediately after cutover.
- [ ] If the new origin fails, restore the recorded Cloudflare apex value and verify public recovery before investigating.
- [ ] Remove the old Version127 service only after the observation window and explicit approval.
- [x] Do not remove or modify any unrelated old-VPS service, network, volume, database, firewall rule, or Dokploy project.

## Phase 8: Private Dokploy Administration

- [x] Create the remotely managed Cloudflare Tunnel `version127-dokploy`.
- [x] Route only `dokploy.version127.com` to `http://127.0.0.1:3000`.
- [x] End the Tunnel configuration with an `http_status:404` catch-all.
- [x] Create a proxied CNAME from `dokploy.version127.com` to the Tunnel hostname.
- [x] Create the `Version127 Dokploy` self-hosted Access application.
- [x] Attach the `Version127 administrators` allow policy with only the approved administrator email addresses.
- [x] Use a 24-hour application and policy session.
- [x] Keep the application out of the Access application launcher.
- [x] Install Cloudflare's signed `cloudflared` package from its stable APT repository.
- [x] Run `cloudflared-version127-dokploy.service` with a dynamic user, no capabilities, `NoNewPrivileges`, restricted address families, protected kernel and system paths, and a root-owned `0600` token file.
- [x] Add the HTTPS hostname and local origins to `BETTER_AUTH_TRUSTED_ORIGINS`.
- [x] Set Dokploy Web Server host to `dokploy.version127.com`, HTTPS on, and certificate type `none`.
- [x] Verify the stored Dokploy administrator password with login, session, dashboard redirect, and logout checks without printing it.
- [x] Confirm Cloudflare reports the Tunnel healthy and the connector establishes QUIC connections over IPv6.
- [x] Confirm an unauthenticated browser request receives a Cloudflare Access redirect.
- [x] Confirm the Access sign-in page presents an email login flow.
- [x] Confirm direct public access to Dokploy port `3000` times out.
- [x] Confirm direct public access to Swarm ports `2377` and `7946` times out.
- [x] Confirm the Cloudflare-only firewall blocks direct public origin access on `80` and `443`.
- [x] Confirm `version127.com` continues returning `200` after the administration setup.

The Hostinger API was not used for this hostname because Cloudflare is authoritative for the Version127 zone. Rotate the Tunnel token through Cloudflare if it is ever exposed, then replace `/etc/cloudflared/version127-dokploy.env` and restart the service. Keep `cloudflared` updated through the signed Cloudflare APT repository.

## Completion Evidence

The migration is complete only when:

- Version127 is served from the OVH VPS through Cloudflare.
- The old and new origin paths have been distinguished with direct checks.
- Native IPv6 works from both the host and the deployed Version127 container.
- Every DNS tool passes live output and rendering checks.
- Search, security, privacy, rate-limit, download, and responsive-layout checks pass.
- All unrelated applications on the old VPS remain healthy.
- The rollback path is recorded and still usable during the observation window.

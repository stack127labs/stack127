# Stack127 Content Ideas

Date: 2026-07-07
Last updated: 2026-07-08

Note (2026-07-08): before acting on any idea below, apply the surface decision rule in `skills/stack127/stack127-topic-research/SKILL.md`. Several ideas here are shaped as standalone tools or curated cross-app tables, but entity-specific demand (per app, per device, per integration) belongs in the owning directory as structured facts or in reference pages, and a standalone tool is only justified when it computes live from universal sources or calculates over user-only inputs. For example, the Backup Map and Reverse Proxy Matrix are directory facets or reference pages, not tools; the Compose Checker and Model Fit Calculator can remain tools because they work from user input. See `content_ideas/2026-07-07-market-gap-tool-ideas.md` for the corrected framework.

Context: Stack127 already has a self-host app directory and a self-hosting beginner course. The next durable surface should be more tool-like or reference-like, with stronger search-gap potential than another broad directory.

Research note: Reddit blocked direct scripted access in the research environment, so these ideas are based on live web search, official docs, product documentation, and public community/problem patterns. Treat the gap claims as evidence-backed but not absolute "no page exists anywhere" claims.

## Ranked Ideas

### [ ] 1. Self-Hosted Backup Map

Recommended URL: `/self-host-backups`

Type: reference directory plus checklist generator.

User problem: People know they need backups, but for each app they have to hunt for which folders, named volumes, databases, generated files, and restore order actually matter. The pain becomes urgent after an upgrade, disk failure, or migration.

Likely searches:

- `what to backup for immich docker`
- `nextcloud docker backup folders database`
- `jellyfin backup docker config data`
- `self hosted app backup checklist`
- `docker compose what volumes to backup`

Market gap: Strong. Official docs exist per app, but the easy-reference cross-app table is fragmented. The useful page is not "how backups work"; it is "for this app, back up these exact things, in this order, with these restore warnings."

Evidence checked:

- Immich docs say database backups do not contain photos/videos and must be paired with `UPLOAD_LOCATION`; they also explain critical folders and backup ordering.
- Nextcloud docs list five required backup areas: config folder, custom apps folder when used, data folder, theme folder, and database.
- Jellyfin docs separate built-in backup from manual backup and warn that version upgrades can make older data incompatible without restore.

Can we build it: Yes. Stack127 already has app data and a source-first workflow. Start with 25-50 high-demand apps, then expand.

MVP fields:

- app name and slug
- backup criticality
- database type and dump method
- files/folders/volumes to preserve
- generated files that can be regenerated
- whether the app should be stopped
- backup order
- restore warning
- official source links
- last verified date

Risks:

- Needs careful source maintenance.
- Some apps have multiple install methods, so each row should distinguish Docker, package, and bare-metal when necessary.

Why it can rank: It targets long-tail app-specific searches and can create programmatic pages like `/self-host-backups/immich`, `/self-host-backups/nextcloud`, and `/self-host-backups/jellyfin`.

Primary sources:

- https://docs.immich.app/administration/backup-and-restore/
- https://docs.nextcloud.com/server/latest/admin_manual/maintenance/backup.html
- https://jellyfin.org/docs/general/administration/backup-and-restore/

### [ ] 2. Reverse Proxy Compatibility Matrix

Recommended URL: `/reverse-proxy-matrix`

Type: compatibility matrix plus config snippet generator.

User problem: Self-hosted apps often break behind Nginx, Caddy, Traefik, Nginx Proxy Manager, Cloudflare Tunnel, or subpaths because each app needs different headers, body limits, websocket handling, trusted proxy settings, or well-known redirects.

Likely searches:

- `immich reverse proxy websocket nginx`
- `home assistant reverse proxy trusted proxies`
- `nextcloud nginx proxy manager connection closed`
- `self hosted app subpath support`
- `reverse proxy config generator self hosted`

Market gap: Strong. The facts exist in separate docs, but there is no simple app-by-app table that says "subdomain only", "subpath works", "needs websockets", "needs upload body limit", "needs trusted proxies", and then gives the matching snippet.

Evidence checked:

- NGINX docs explain that WebSocket Upgrade and Connection headers require explicit proxy handling.
- Immich docs require forwarded headers, large upload handling, websocket support, and warn that sub-path hosting is unsupported.
- Home Assistant docs require `use_x_forwarded_for` and `trusted_proxies` for traditional reverse proxies.
- Nextcloud docs include trusted proxies, overwrite parameters, CalDAV/CardDAV well-known redirects, and an NPM-specific `proxy_hide_header Upgrade` note.

Can we build it: Yes. Use static source-backed records first, then add generators for Nginx, Caddy, Traefik, and NPM.

MVP fields:

- app
- internal port
- subdomain support
- subpath support
- websocket required
- large upload/body-size notes
- trusted proxy/app config needed
- well-known redirects
- sample Nginx/Caddy/Traefik snippets
- official source links

Risks:

- Generated config can become dangerous if too generic. Keep snippets scoped and label assumptions.
- Cloudflare Tunnel and auth proxy behavior needs careful caveats.

Why it can rank: It matches exact broken-setup searches and can produce both matrix and app-specific pages.

Primary sources:

- https://nginx.org/en/docs/http/websocket.html
- https://docs.immich.app/administration/reverse-proxy/
- https://www.home-assistant.io/integrations/http/#reverse-proxies
- https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/reverse_proxy_configuration.html

### [ ] 3. Docker Compose Homelab Risk Analyzer

Recommended URL: `/compose-checker`

Type: client-side tool.

User problem: People paste compose files from GitHub and run them without noticing port exposure, unnamed volumes, missing persistent storage, weak environment defaults, host path ambiguity, or broken reverse proxy labels.

Likely searches:

- `docker compose port conflict checker`
- `docker compose volume backup analyzer`
- `is this docker compose safe`
- `docker compose exposed ports checker`
- `homelab compose file review`

Market gap: Medium to strong. Docker has validation and canonical rendering, but not a homelab-readable risk report.

Evidence checked:

- Docker Compose docs define port and volume semantics.
- `docker compose config` can validate and render the resolved model, but it does not explain homelab operational risk in plain language.

Can we build it: Yes. Parse YAML in the browser, no upload required. Show warnings and suggestions without executing anything.

MVP checks:

- published ports and `0.0.0.0` exposure
- duplicate host ports
- missing persistent volumes for known database images
- bind mounts vs named volumes
- relative path ambiguity
- secrets in environment variables
- missing restart policy
- missing healthcheck
- privileged containers
- Docker socket mount
- network mode host
- no image tags or `latest` usage

Risks:

- Must avoid claiming a compose file is "secure." Use "risk signals" and "review needed."
- Some good compose files intentionally use host networking or privileged mode.

Why it can rank: It is an actual tool, not an article. It can also link into backup and reverse proxy surfaces.

Primary sources:

- https://docs.docker.com/reference/compose-file/services/
- https://docs.docker.com/reference/cli/docker/compose/config/

### [ ] 4. Home Assistant Local-Control Finder

Recommended URL: `/home-assistant-local-control`

Type: smart-home reference directory.

User problem: Before buying devices or choosing integrations, users want to know whether their smart home still works if the internet is down, whether a device is local push, local polling, cloud push, or cloud polling, and what network discovery it needs.

Likely searches:

- `home assistant local control device list`
- `home assistant cloud polling integrations`
- `which home assistant integrations work offline`
- `home assistant local push vs cloud polling`
- `home assistant vlan mdns ssdp devices`

Market gap: Medium to strong. Home Assistant exposes IoT class filters, but it is not framed as a buyer/setup decision aid.

Evidence checked:

- Home Assistant integration pages expose IoT class filters including Local Push, Local Polling, Cloud Push, and Cloud Polling.
- Home Assistant developer docs define `iot_class` in integration manifests.
- Zeroconf and SSDP docs list discovery behavior and discovered integrations.

Can we build it: Yes. Start with official integration metadata and add curated buyer-facing notes for popular devices and protocols.

MVP fields:

- integration name
- IoT class
- local/offline expectation
- discovery method
- protocol
- cloud account required
- VLAN/mDNS/SSDP notes
- official docs link
- last verified date

Risks:

- Device behavior can vary by firmware, region, or integration mode.
- Must avoid overpromising "works offline" unless the source explicitly proves it.

Why it can rank: It targets buyer-intent and setup-intent searches around local-first smart homes.

Primary sources:

- https://www.home-assistant.io/integrations/
- https://developers.home-assistant.io/docs/creating_integration_manifest/#iot-class
- https://www.home-assistant.io/integrations/zeroconf/
- https://www.home-assistant.io/integrations/ssdp/

### [ ] 5. Local AI Exposure Checker

Recommended URL: `/local-ai-exposure-checker`

Type: security checker plus hardening guide.

User problem: Local AI users expose Ollama or web UIs to a LAN, VPS, reverse proxy, or tunnel and do not know whether the endpoint is reachable from places it should not be.

Likely searches:

- `is my ollama exposed`
- `ollama public internet security`
- `ollama 11434 exposed fix`
- `secure ollama reverse proxy`
- `local ai server exposed checker`

Market gap: Medium. Security articles exist, but a simple self-check and fix path would be more useful than news coverage.

Evidence checked:

- TechRadar reported researchers finding roughly 175,000 publicly exposed Ollama systems.
- Ollama docs say the API is served by default at `http://localhost:11434/api`.
- Ollama FAQ says it binds `127.0.0.1:11434` by default and can be exposed with `OLLAMA_HOST`.

Can we build it: Yes, with strict safety boundaries. Only check a host or URL the user provides. Do not scan ranges or the wider internet.

MVP checks:

- user-supplied URL reachability
- `/api/version` style endpoint response when applicable
- CORS/origin warning
- reverse proxy header warning
- `OLLAMA_HOST` hardening instructions
- firewall checklist
- Cloudflare Tunnel/ngrok caveats

Risks:

- Public scanning is unsafe and out of scope.
- Need clear language: this is not a full security audit.

Why it can rank: Security urgency plus a simple tool gives it stronger click value than another guide.

Primary sources:

- https://www.techradar.com/pro/security/over-175-000-publicly-exposed-ollama-ai-servers-discovered-worldwide-so-fix-now
- https://docs.ollama.com/api
- https://docs.ollama.com/faq

### [ ] 6. Local AI Model Fit Calculator

Recommended URL: `/local-ai-model-calculator`

Type: calculator.

User problem: Users do not know whether a model will fit their machine, whether context length will push it out of VRAM, or why generation becomes slow.

Likely searches:

- `ollama vram calculator`
- `local llm memory calculator`
- `gguf context length vram`
- `can my gpu run qwen llama gemma`
- `ollama model fit calculator`

Market gap: Medium. There are articles and community calculators, but a Stack127 version could be practical if tied to homelab hardware and conservative assumptions.

Evidence checked:

- Ollama FAQ documents default context length, `OLLAMA_CONTEXT_LENGTH`, `ollama ps`, and CPU/GPU memory split reporting.
- Windows Central explains why VRAM and context length matter for Ollama performance.

Can we build it: Yes. The initial version can be formula-based and conservative, then later use known Ollama model sizes.

MVP fields:

- system RAM
- VRAM or unified memory
- CPU/GPU type
- model family and size
- quantization
- target context length
- expected fit: good, tight, CPU spill, or not recommended
- practical suggestions

Risks:

- Exact memory use varies by runtime, quantization, context, batch size, parallelism, and GPU backend.
- Must present estimates as estimates.

Why it can rank: Useful, but more competitive than backup/proxy/compose ideas.

Primary sources:

- https://docs.ollama.com/faq
- https://www.windowscentral.com/artificial-intelligence/when-it-comes-to-running-ollama-on-your-pc-for-local-ai-one-thing-matters-more-than-most-heres-why

## Recommended Build Order

1. Self-Hosted Backup Map
2. Reverse Proxy Compatibility Matrix
3. Docker Compose Homelab Risk Analyzer
4. Home Assistant Local-Control Finder
5. Local AI Exposure Checker
6. Local AI Model Fit Calculator

## Cluster Opportunity

The first three ideas can reinforce each other:

- Backup Map tells users what data matters.
- Reverse Proxy Matrix tells users how to expose apps correctly.
- Compose Checker can detect missing volumes, risky ports, and proxy labels, then link users into the first two references.

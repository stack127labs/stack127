# Stack127 Market Gap Tool Ideas

Created: 2026-07-07
Last updated: 2026-07-08

Revision note (2026-07-08): reviewed against the surface decision rule now recorded in `skills/stack127/stack127-topic-research/SKILL.md`. Idea 1 fails the tool tests (searches are app plus version specific, a picker tool needs near-total curated coverage, and safety labels cannot be automated responsibly), so it is reshaped as a directory facet plus editorial upgrade reference pages. Idea 3 splits into a directory facet plus a live lookup tool. Idea 2 stays a calculator. The demand and competition evidence below remains valid; the surface shapes have been corrected in place.

Goal: find the next Stack127 surface that is not "another directory" or "another course". Requirements from research brief: real search demand, no existing easy-reference page or tool on the internet, preferably a tool, and something we can actually build with our current stack and data pipeline.

Research method: live web search for both demand signals (forum threads, GitHub issues, blog posts, recurring community complaints) and competition (does any site or tool already own this query). Direct Reddit scraping is blocked in this environment, so demand evidence comes from indexed forum threads, GitHub issues, and community blog coverage. Each idea below survived a dedicated competitor check.

## Recommended: ranked ideas

### 1. Breaking Changes Coverage (directory facet plus upgrade reference pages)

Surface: release and update-caution facts on app records in `/self-host-apps`, plus hand-written reference pages for major upgrade events, for example an Immich v3 breaking changes page. Not a standalone tool.

Type: directory facet plus editorial reference pages.

The user problem: Updating self-hosted apps is the single most anxiety-inducing recurring task in the hobby. Auto-updaters (Watchtower) are widely warned against precisely because major releases break things. Immich v3 shipped a long breaking-changes migration guide; Nextcloud, Paperless-ngx, Vaultwarden, and Home Assistant all regularly ship breaking releases. The user's real question is never "is there an update?", it is "if I update from my version to latest, what breaks and what must I do first?"

Why it is a gap (competition checked):

- Every existing tool stops at notification. WUD, Diun, Watchtower, newreleases.io, and feature.delivery tell you an update exists and at most classify it by semver level (major/minor/patch). None of them tell you what the breaking changes are or what preparation is needed.
- Official docs are per-app and per-release. To answer "I am on Immich v1.119, is latest safe?" a user must read every release note between their version and now. No site aggregates or diffs this.
- No "can I update X safely" website exists. Multiple searches found nothing occupying this space.

Why not a tool (surface decision rule):

- Search shape: real queries are "immich v3 breaking changes" and "update paperless-ngx safely", app plus version specific. A picker tool captures none of that; indexable pages do.
- Coverage: a tool covering 30 curated apps fails every user running app 31 and reads as broken. A single reference page is useful standing alone.
- Trust: "safe to update" is a judgment call across heterogeneous release notes. Automating that label risks wrong reassurance, which costs more trust than the feature earns.

What we build:

- Directory facet: latest release, release date, and a reviewed update-caution note where relevant, on the app record, shown in the existing drawer. Raw release facts (versions, dates, links) can be ingested automatically from the GitHub Releases API through the existing refresh pipeline.
- Editorial reference pages for the few big upgrade events per year (Immich v3, Home Assistant yearly releases, Nextcloud majors): what actually breaks, required actions, links to official notes. These target the exact queries people type.
- Later: when per-app pages ship under the phased rollout, release history and breaking notes become a server-rendered section of each app page.

Risks:

- Judgment content must stay human-reviewed. Anything unreviewed displays as "read the official notes", never as "safe".
- Upgrade reference pages need updating when follow-up patch releases land; scope them to major events only.

Verdict: strongest demand of the three and zero direct competition, but it is directory data plus editorial content, not a tool. One reference page per major upgrade event is fast to produce, useful standalone, and compounds with the directory.

### 2. Stack RAM Planner (what can my box actually run)

Proposed URL: `/ram-planner`

Type: interactive calculator backed by a per-app memory dataset.

Note: this idea confirms an earlier plan rather than introducing a new one. It passes the surface decision rule as a tool because "does my stack fit my box" is a genuine calculation over inputs only the user knows, and it can run on the structured RAM data the directory already holds for all apps, with measured numbers improving precision over time rather than gating coverage.

The user problem: "What can I run on 8GB?" and "how much RAM does Immich/Nextcloud/Jellyfin need?" are permanent questions. People buy an N100 mini PC or Pi and have no way to know whether their planned stack fits. Official minimums are per-app, inconsistent, and usually describe the app alone, not a stack.

Why it is a gap (competition checked):

- RAM calculators exist only for Minecraft servers and LLM VRAM (selfhostllm.org). No self-hosted stack planner exists.
- Per-app memory numbers exist only as scattered blog estimates (e.g. homelab-creator.com benchmarks post) and forum anecdotes. No structured, sourced, browsable dataset.

What we build:

- The tool: pick apps from our directory, get summed idle and typical RAM, headroom verdicts for common boxes (Pi 4 2/4/8GB, Pi 5, N100 8/16GB, 32GB NUC), and warnings for known heavy pairings (Immich ML, Nextcloud + office, media server transcoding).
- The dataset: idle and typical RSS per app measured with `docker stats` on real hardware, with measurement conditions and a last-measured date. This is original data nobody else has, which is the moat and the reason to cite/link us.
- Each measurement also becomes a fact row in the existing directory drawer, so the dataset improves the directory at the same time.

How we build it:

- Add `ram_idle_mb`, `ram_typical_mb`, `ram_notes`, `measured_on`, `measured_date` to the apps data. Seed the top 50 apps from official docs where stated, then replace with our own measurements over time (a repeatable measurement script per app: compose up, wait, sample `docker stats`, record).
- Calculator is a client component; the per-app RAM table is server-rendered.

Risks:

- Numbers vary with usage, library size, and config. Present ranges, state conditions, and prefer "unknown" over fake precision (existing site rule).
- Measurement takes real bench time. That cost is also the defensibility.

Verdict: strong second. Slightly more manual data work than idea 1, but original measured data is exactly the kind of thing Reddit links to and LLMs cite.

### 3. ARM / Raspberry Pi Compatibility (directory facet plus live lookup tool)

Surface: supported-architecture facts as a filter and fact row in `/self-host-apps`, plus a standalone paste-an-image lookup tool at `/arm-check`.

Type: automated directory facet plus a live lookup tool. This one passes the surface decision rule as a tool because registry manifests are universal machine-readable sources: the nightly script covers every directory app with no editorial judgment, and the lookup tool computes its answer live for any public image, so there is no curated-coverage problem.

The user problem: "exec format error" and "no matching manifest for linux/arm64" are among the most common Pi self-hosting failures. Before buying a Pi or picking an app, users cannot easily see which apps ship arm64 (or armv7) images. The only current answers are CLI commands (`docker manifest inspect`, skopeo) or digging through Docker Hub tags manually.

Why it is a gap (competition checked):

- Searches for a compatibility website return only how-to articles explaining CLI methods and listicles of "10 apps for your Pi". No structured per-app architecture table and no web lookup tool exists.

What we build:

- Table: every app in our directory with supported architectures (amd64 / arm64 / armv7), pulled automatically from its published image manifest, plus notes (e.g. official vs community arm image).
- Tool: paste any public image reference, we query the registry and show supported platforms with a plain verdict ("runs natively on Pi 5, not on Pi Zero").

How we build it:

- Fully automatable: Docker Hub tags API returns per-architecture image lists for public repos without auth; GHCR and Quay support anonymous token pulls of manifest lists. A nightly script refreshes architecture data for all directory apps; the lookup tool calls a small server route that queries the registry live.
- Requires storing each app's canonical docker image reference, which also enriches the directory.

Risks:

- Registry rate limits (Docker Hub) need caching and a nightly batch rather than live-per-visitor for the table. The paste-a-name tool needs input validation and per-IP throttling.
- arm64 image existing does not guarantee the app performs well on a Pi; label the verdict as "image availability", not a performance promise.

Verdict: the most automatable of the three, near-zero ongoing editorial cost, but a somewhat narrower audience. Entity-specific searches like "immich raspberry pi arm64" are captured by the directory facet (and per-app pages once those ship); the lookup tool is the shareable single-URL drop on top.

## Checked and rejected (competition already exists)

- Idle power consumption database: idlewatt.com already owns this, with an open dataset on GitHub.
- SSO / OIDC support matrix: covered by the d-513/selfhosted-authentication-table GitHub repo (OpenID / SAML / LDAP / proxy auth per app).
- Matter / smart home device databases: matterdatabase.com, matterdevices.io, matter-smarthome.de, plus Blakadder for Zigbee and the zigbee2mqtt supported-devices list.
- Docker compose online validator / linter: onewebcare validator, DCLint, Dockadvisor already exist; a "risk report" variant is possible but the space is not empty.
- Default ports list: selfhostedheaven.com/concept/ports plus long-standing gists.
- Self-hosting cost-savings calculator: homedock.cloud ships a subscription calculator and big outlets (HowToGeek, XDA) publish the math yearly; also the honest math is often unfavorable, which weakens the page's appeal.
- Generic release trackers: newreleases.io, feature.delivery, Diun, WUD all exist, which is exactly why idea 1 must be the breaking-changes layer, not another notifier.

## Build order recommendation

1. Breaking changes coverage: add the release facet to app records via the existing refresh pipeline, and write the first editorial upgrade reference page for the biggest current event. Highest demand, no competitor, mostly content work.
2. ARM architecture facet: nightly registry script fills an architecture filter and fact row for every directory app. The `/arm-check` lookup tool is an optional one-week drop on top.
3. Stack RAM Planner: launch on existing structured RAM data, start real measurements in the background to replace estimates over time.

All three feed facts back into `/self-host-apps` (releases, architectures, RAM), so the directory gets stronger with every new surface instead of the surfaces competing with it. Everything here follows the surface decision rule in `skills/stack127/stack127-topic-research/SKILL.md`: entity-specific answers live in the directory and reference pages, and standalone tools exist only where the answer is computed live or from user-only inputs.

## Key sources

- WUD scope (notification only): https://getwud.github.io/wud/
- Release trackers landscape: https://newreleases.io/ and https://alternativeto.net/software/newreleases/
- Immich v3 breaking changes migration guide: https://immich.app/blog/v3-migration
- Immich upgrade guidance: https://docs.immich.app/install/upgrading/
- RAM anecdata that proves demand but no dataset: https://homelab-creator.com/blog/homelab-ram-requirements-benchmarks
- LLM-only RAM calculator (closest existing tool): https://selfhostllm.org/
- exec format error prevalence: https://forums.docker.com/t/exec-format-error-when-trying-to-start-a-arm64-docker-image-on-raspberry-pi-with-64-bit-kernel/120999
- Checking image architectures today requires CLI: https://oneuptime.com/blog/post/2026-02-08-how-to-check-the-os-and-architecture-of-a-docker-image/view
- Rejected-idea competitors: https://idlewatt.com/ , https://github.com/d-513/selfhosted-authentication-table , https://www.matterdatabase.com/ , https://selfhostedheaven.com/concept/ports/ , https://www.homedock.cloud/blog/self-hosting/subscription-calculator-track-monthly-spending/

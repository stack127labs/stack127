# Self-Hosted App And Home Server Planner Research

Date: 2026-06-05

## Goal

Build a data-driven site that helps users discover self-hosted apps, check project health, compare alternatives, and understand what hardware, VPS, NAS, or home server setup they need to run them.

This should not be only a directory. The differentiator is planning intelligence:

- Is this project active and healthy?
- Does it support Docker or other easy deployment methods?
- How difficult is setup and maintenance?
- What RAM, CPU, storage, database, and backup needs does it have?
- What are good alternatives?
- What kind of server should I buy or rent for my selected stack?

## High-Level Take

The idea is strong if the site positions itself as "planning intelligence for self-hosting" rather than another Awesome Selfhosted browser.

Awesome Selfhosted already covers discovery. The opportunity is decision support:

- "Can I run this on my NAS?"
- "Is this project abandoned?"
- "Which alternative is safer or easier?"
- "What hardware should I use for these five apps?"
- "What apps fit a low-power home server?"

The best initial wedge is app discovery plus hardware fit. Existing directories are weak here, and this maps naturally to hardware, VPS, storage, and backup affiliate monetization.

## Main Data Sources

### Awesome Selfhosted

URL: https://github.com/awesome-selfhosted/awesome-selfhosted

Usefulness: high for the app universe.

Notes:

- Broad, trusted, human-curated list.
- Good source for initial app discovery and taxonomy.
- Not enough by itself for operational decision-making.
- The main GitHub repo is generated from the machine-readable data repo.

### Awesome Selfhosted Data

URL: https://github.com/awesome-selfhosted/awesome-selfhosted-data

Usefulness: very high as the seed dataset.

Current observed structure:

- One YAML file per app under `software/`.
- One YAML file per tag/category under `tags/`.
- One YAML file per platform under `platforms/`.

Sample app fields observed:

- `name`
- `website_url`
- `description`
- `licenses`
- `platforms`
- `tags`
- `source_code_url`
- `stargazers_count`
- `updated_at`
- `archived`
- `current_release`
- `commit_history`

Example current fields observed in app files such as Actual, AdGuard Home, and Rocket.Chat:

- `current_release.tag`
- `current_release.published_at`
- Monthly `commit_history` such as `2026-05: 164`

Important implication:

The site should preserve imported source fields in a raw layer, then normalize them into product-facing tables. Do not overwrite manual curation when upstream data refreshes.

### GitHub REST API

URL: https://docs.github.com/en/rest

Usefulness: high for per-repository snapshots.

Good for:

- Stars
- Forks
- Watchers
- Open issues
- License
- Releases
- Commits
- Last pushed date
- Archived or disabled status
- Repository topics
- Default branch

Reliability notes:

- Public and stable.
- Unauthenticated requests are very limited, around 60 requests/hour.
- Authenticated requests are typically around 5,000 requests/hour.
- Some endpoints have stricter limits.
- Must handle secondary rate limits.
- Best used in backend ingestion jobs, not live frontend requests.

### GitHub GraphQL API

URL: https://docs.github.com/en/graphql

Usefulness: high for bulk enrichment.

Good for:

- Fetching multiple repository fields in fewer network round trips.
- Batch enrichment of app records.
- Pulling selected fields only.

Reliability notes:

- Uses point-based rate limits.
- Typical authenticated limit is 5,000 points/hour.
- Has node limits and timeout limits.
- Deeply nested queries can fail or become expensive.
- Best for scheduled ingestion with careful query design.

### Docker Hub API

URL: https://docs.docker.com/reference/api/hub/latest/

Usefulness: medium-high for container freshness and image metadata.

Good for:

- Docker repository metadata
- Tag lists
- Tag freshness
- Last updated date
- Pull counts
- Star counts
- Image existence checks

Reliability notes:

- Docker Hub API has per-minute rate limits.
- Documented endpoints often require bearer authentication.
- Tag endpoints are paginated.
- The API is useful but should be treated as an enrichment layer, not the canonical source.
- Mapping an app to the correct Docker image is often manual or heuristic.

### OpenSSF Scorecard

URL: https://api.securityscorecards.dev/

Usefulness: medium-high for security and project health.

Good for:

- Aggregate Scorecard score
- Check-level results
- Security practice indicators
- Date and version of Scorecard result

Observed API shape:

- `GET /projects/{platform}/{org}/{repo}`
- `GET /projects/{platform}/{org}/{repo}/badge`

Observed result fields:

- `date`
- `repo`
- `score`
- `scorecard`
- `checks`
- Check `name`
- Check `score`
- Check `reason`
- Check `details`
- Documentation URL

Reliability notes:

- Excellent when a published result exists.
- Missing results should be expected.
- This is a health signal, not a guaranteed live scanner unless we also run the Scorecard CLI ourselves.

### deps.dev

URL: https://docs.deps.dev/api/v3/

Usefulness: medium for package, dependency, license, and advisory enrichment.

Good for:

- Package versions
- Licenses
- Security advisories
- Dependency graphs
- Related projects

Supported ecosystems include:

- Go
- npm
- PyPI
- Cargo
- Maven
- NuGet
- RubyGems

Reliability notes:

- Strong for package ecosystems.
- Less direct for whole self-hosted apps unless the app can be mapped to package manifests or published packages.
- Useful as deeper enrichment, not required for every app.

## Product Positioning

The site should answer four core questions:

1. What should I self-host for this job?
2. Which projects are healthy and safe enough?
3. How hard will setup and maintenance be?
4. What machine or VPS do I need?

Example use cases:

- Find a self-hosted photo backup app that runs well on a mini PC.
- Compare Immich, PhotoPrism, and Nextcloud Memories.
- Show apps that are Docker-first, actively maintained, and fit in 2 GB RAM.
- Plan a home server for media, backups, password manager, DNS, and monitoring.

## Proposed Data Model

### `apps`

Canonical app record.

Fields:

- `id`
- `slug`
- `name`
- `description`
- `website_url`
- `primary_source_code_url`
- `license_summary`
- `is_open_source`
- `is_free_software`
- `created_at`
- `updated_at`

### `app_sources`

Tracks raw provenance and import source.

Fields:

- `id`
- `app_id`
- `source_type`
- `source_url`
- `source_key`
- `raw_payload`
- `imported_at`

Source types:

- `awesome_selfhosted_data`
- `github`
- `docker_hub`
- `openssf_scorecard`
- `deps_dev`
- `manual`

### `repositories`

Normalized source repository identity.

Fields:

- `id`
- `app_id`
- `provider`
- `owner`
- `name`
- `url`
- `default_branch`
- `is_primary`

Providers:

- `github`
- `gitlab`
- `codeberg`
- `sourcehut`
- `other`

### `repo_snapshots`

Time-series repository stats.

Fields:

- `id`
- `repository_id`
- `snapshot_at`
- `stars`
- `forks`
- `watchers`
- `open_issues`
- `open_pull_requests`
- `archived`
- `disabled`
- `pushed_at`
- `latest_release_tag`
- `latest_release_published_at`
- `commit_count_30d`
- `commit_count_90d`
- `commit_count_365d`

### `container_images`

Known Docker or OCI images.

Fields:

- `id`
- `app_id`
- `registry`
- `namespace`
- `repository`
- `image_ref`
- `image_url`
- `is_official`
- `is_project_owned`
- `confidence`
- `source`

Confidence examples:

- `confirmed_manual`
- `linked_from_docs`
- `linked_from_repo`
- `inferred`

### `container_image_snapshots`

Time-series image data.

Fields:

- `id`
- `container_image_id`
- `snapshot_at`
- `pull_count`
- `star_count`
- `tag_count`
- `latest_tag`
- `latest_tag_last_updated`
- `latest_digest`
- `architectures`
- `image_size_bytes`

### `security_snapshots`

Security and health enrichment.

Fields:

- `id`
- `repository_id`
- `snapshot_at`
- `openssf_score`
- `openssf_date`
- `openssf_version`
- `check_results`
- `known_advisory_count`
- `critical_advisory_count`
- `high_advisory_count`
- `license_risk`

### `deployment_methods`

Deployment methods per app.

Fields:

- `id`
- `app_id`
- `method`
- `source`
- `confidence`
- `notes`

Methods:

- `docker`
- `docker_compose`
- `helm`
- `kubernetes`
- `binary`
- `deb`
- `rpm`
- `nix`
- `source_build`
- `managed_service`

### `runtime_requirements`

Operational requirements.

Fields:

- `id`
- `app_id`
- `profile_name`
- `min_ram_mb`
- `recommended_ram_mb`
- `min_cpu_cores`
- `recommended_cpu_cores`
- `storage_baseline_mb`
- `storage_growth_model`
- `requires_database`
- `database_types`
- `requires_redis`
- `requires_object_storage`
- `requires_gpu`
- `benefits_from_gpu`
- `requires_transcoding`
- `network_ports`
- `backup_criticality`
- `public_exposure_risk`
- `source`
- `confidence`

### `difficulty_profiles`

Setup and maintenance difficulty.

Fields:

- `id`
- `app_id`
- `install_difficulty`
- `maintenance_difficulty`
- `upgrade_difficulty`
- `backup_difficulty`
- `docs_quality`
- `beginner_friendly`
- `notes`
- `source`

Suggested scale:

- `very_easy`
- `easy`
- `moderate`
- `hard`
- `expert`

### `comparison_groups`

Alternative sets.

Fields:

- `id`
- `slug`
- `name`
- `description`
- `primary_tag`

Examples:

- Personal finance
- Photo management
- Bookmark managers
- Password managers
- Media servers
- DNS blockers
- Monitoring
- Note-taking

### `comparison_group_apps`

Join table for alternatives.

Fields:

- `comparison_group_id`
- `app_id`
- `position`
- `recommended_for`
- `tradeoff_summary`

### `hardware_profiles`

Generic hardware and hosting classes.

Fields:

- `id`
- `slug`
- `name`
- `type`
- `ram_mb`
- `cpu_class`
- `storage_type`
- `storage_capacity_gb`
- `network_notes`
- `typical_monthly_cost`
- `typical_purchase_cost`
- `affiliate_slot`

Types:

- `tiny_vps`
- `small_vps`
- `mini_pc`
- `nas`
- `used_desktop`
- `storage_vps`
- `dedicated_server`
- `gpu_box`

### `recommendation_rules`

Rules for matching stacks to server classes.

Fields:

- `id`
- `rule_name`
- `conditions`
- `recommended_hardware_profile_id`
- `explanation`
- `priority`

### `curation_notes`

Manual editorial notes.

Fields:

- `id`
- `app_id`
- `note_type`
- `title`
- `body`
- `severity`
- `created_by`
- `reviewed_at`

Note types:

- `warning`
- `gotcha`
- `recommendation`
- `migration`
- `backup`
- `security`
- `hardware`
- `licensing`

## Automatable Fields

Good automation candidates:

| Field | Source |
|---|---|
| Name | Awesome Selfhosted Data |
| Description | Awesome Selfhosted Data |
| Website URL | Awesome Selfhosted Data |
| Source code URL | Awesome Selfhosted Data |
| Tags/categories | Awesome Selfhosted Data |
| Platforms | Awesome Selfhosted Data |
| Licenses | Awesome Selfhosted Data, GitHub, deps.dev |
| Stars | Awesome data, GitHub |
| Forks | GitHub |
| Open issues | GitHub |
| Archived status | Awesome data, GitHub |
| Last pushed date | GitHub |
| Latest release | Awesome data, GitHub |
| Release date | Awesome data, GitHub |
| Commit activity | Awesome data, GitHub |
| OpenSSF score | OpenSSF Scorecard API |
| Scorecard check-level scores | OpenSSF Scorecard API |
| Docker support flag | Awesome platforms, repo/docs heuristics |
| Docker tag freshness | Docker Hub API |
| Docker pull/star counts | Docker Hub API |
| Dependency graph | deps.dev where package mapping exists |
| Known advisories | deps.dev where package mapping exists |
| Possibly abandoned flag | Derived |
| Popularity trend | Derived from snapshots |
| Health score | Derived from multiple fields |

## Manual Or Semi-Manual Fields

These are likely the site's moat.

| Field | Why Manual |
|---|---|
| Real RAM usage | Usually absent, inaccurate, or workload-dependent. |
| Storage growth | Depends heavily on data type, users, retention, media, logs, and backups. |
| Setup difficulty | Docker support does not mean setup is easy. |
| Maintenance burden | Requires judgment about migrations, breaking changes, and upgrade pain. |
| Recommended hardware | Needs workload assumptions and editorial judgment. |
| Best alternatives | Taxonomy and use-case matching need curation. |
| Beginner friendliness | Depends on docs, defaults, recovery path, community support. |
| Public exposure risk | Depends on auth, maturity, security posture, and threat model. |
| Backup strategy | Depends on database, volume layout, consistency needs, and user data. |
| Affiliate recommendations | Must be editorially controlled to preserve trust. |
| Sponsored guides | Must be labeled and reviewed. |

## Health Scoring

Use transparent sub-scores, not a mysterious black-box score.

Suggested components:

| Component | Weight |
|---|---:|
| Maintenance freshness | 25% |
| Release cadence | 15% |
| Commit velocity | 15% |
| Community signal | 10% |
| OpenSSF score | 15% |
| Docker/package freshness | 10% |
| Documentation/install clarity | 10% |

Community signal can include:

- Stars
- Forks
- Issue activity
- Contributor activity
- Recent growth

Show sub-scores directly:

- Last release date
- Last pushed date
- Commits in last 30/90/365 days
- OpenSSF score
- Docker image last updated
- Archived flag
- Open issue count

Warning badges:

- Archived repository
- No release in 12+ months
- No commits in 6+ months
- Docker image stale
- No official container image
- OpenSSF missing
- OpenSSF low score
- License mismatch
- Requires external database
- High backup importance
- Public exposure caution

## Hardware Planning Model

Start with server classes instead of exact products.

| Tier | Typical Use |
|---|---|
| Tiny VPS | DNS, bookmarks, status page, small notes app. |
| 1-2 GB RAM VPS | Lightweight web apps, RSS, wiki, password manager. |
| 4 GB RAM VPS or mini PC | Several small apps plus Postgres/Redis. |
| 8-16 GB mini PC | General home server, documents, photos, monitoring. |
| NAS plus mini PC | Storage-heavy apps, backups, media library. |
| GPU/transcoding box | Media transcoding, AI, heavy photo/video workloads. |

For each app, estimate:

- Baseline RAM
- Burst RAM
- CPU intensity
- Storage class
- Storage growth model
- Database dependency
- Redis/cache dependency
- Object storage dependency
- Backup criticality
- Public exposure risk
- Multi-user scaling factor

Storage classes:

- `tiny`
- `documents`
- `photos`
- `media`
- `logs`
- `database`
- `backup`
- `mixed`

CPU classes:

- `idle_light`
- `periodic_jobs`
- `always_on_moderate`
- `transcoding`
- `indexing_heavy`
- `ai_gpu`

## Page Types

### App Detail Page

Purpose:

- Explain what the app does.
- Show project health.
- Show install/deployment options.
- Show hardware requirements.
- Show alternatives.

Sections:

- Overview
- Best for / not best for
- Health summary
- GitHub stats
- Docker support
- Security signals
- Requirements
- Setup difficulty
- Maintenance notes
- Backup notes
- Alternatives
- Recommended server classes

### Category Page

Purpose:

- Help users choose apps in a use case.

Filters:

- Health
- Docker support
- RAM
- Storage intensity
- License
- Beginner friendly
- Actively maintained
- Public exposure risk

### Comparison Page

Purpose:

- Side-by-side alternatives.

Compare:

- Use case fit
- Health
- Docker support
- Setup difficulty
- RAM/storage needs
- Database needs
- Backup complexity
- Public exposure risk
- Best for
- Tradeoffs

### Stack Builder

Purpose:

- Let users choose apps and estimate server needs.

Inputs:

- Apps
- Number of users
- Storage expectations
- Public/private access
- Home server vs VPS
- Backup preference

Outputs:

- Estimated RAM
- CPU class
- Storage growth
- Database services
- Ports/exposure
- Backup plan
- Recommended server class
- Hardware/VPS suggestions

### Hardware Planner

Purpose:

- Answer "what can I run on this machine?" or "what should I buy?"

Modes:

- I already have hardware
- Recommend hardware for my stack
- Recommend VPS for my stack
- Recommend NAS/storage setup

### Server Profile Pages

Examples:

- Best mini PC for a home server
- Best NAS setup for self-hosted photos
- Best cheap VPS for lightweight apps
- Best storage VPS for backups
- Raspberry Pi-class server limitations

### Alerts Page

Potential paid feature.

Alerts:

- New release
- Docker image updated
- Docker image stale
- Repository archived
- Project appears abandoned
- OpenSSF score changed
- Security advisory detected
- License changed

### Guides

Examples:

- Private cloud starter stack
- Family photo backup stack
- Low-power home server stack
- Self-hosted finance stack
- Media server stack
- Backup-first home server
- Beginner Docker Compose stack

### Trending And Changelog

Pages:

- Recently added apps
- Fast-growing apps
- Newly stale apps
- Recently archived apps
- New Docker-first apps
- Best-maintained apps this month

## API And Ingestion Strategy

Do not query third-party APIs live from user page loads.

Recommended backend ingestion flow:

1. Nightly import `awesome-selfhosted-data`.
2. Normalize app records and repository URLs.
3. Enrich GitHub repos via GraphQL batches where possible.
4. Fill GitHub gaps with REST endpoints.
5. Map container images from explicit docs, source files, and manual curation.
6. Enrich known Docker images through Docker Hub API.
7. Pull OpenSSF published results where available.
8. Use deps.dev for package-level enrichment where mapping exists.
9. Store snapshots for trends and alerts.
10. Apply manual curation overlays.
11. Recompute health scores and recommendation outputs.

Recommended refresh cadence:

| Data | Cadence |
|---|---|
| Awesome Selfhosted Data | Daily |
| GitHub repo snapshots | Daily or every 2-3 days |
| Releases | Daily |
| Docker image tags | Daily for popular apps, weekly for long tail |
| OpenSSF Scorecard | Weekly |
| deps.dev | Weekly or on release change |
| Manual curation | As needed |
| Health score recomputation | After every import |

## API Reliability And Risk

### GitHub

Risks:

- Rate limits
- Secondary rate limits
- API schema changes
- Renamed repositories
- Moved or archived projects

Mitigations:

- Use authenticated backend requests.
- Cache all responses.
- Store repository IDs when possible.
- Respect rate limit headers.
- Use incremental refresh.
- Avoid overly nested GraphQL queries.

### Docker Hub

Risks:

- Auth requirements
- Per-minute limits
- Unclear official vs community image mapping
- Tag naming inconsistency
- Some projects use GHCR, Quay, or other registries instead of Docker Hub

Mitigations:

- Treat Docker data as enrichment.
- Support multiple registries over time.
- Prefer manually confirmed image mappings.
- Store confidence levels.
- Cache aggressively.

### OpenSSF Scorecard

Risks:

- Missing published results
- Results may be stale
- Score can be misinterpreted

Mitigations:

- Show result date.
- Show individual checks.
- Use as one component, not the whole health score.
- Optionally run Scorecard CLI later for important apps.

### deps.dev

Risks:

- Mapping app repos to package ecosystems is not always clean.
- Some apps are not published packages.
- Monorepos complicate interpretation.

Mitigations:

- Use only where package mapping is confident.
- Store package mappings separately.
- Do not block core app pages on deps.dev data.

## Monetization

Potential paths:

- Hardware affiliate links for mini PCs, NAS devices, HDDs, SSDs, RAM, and UPS units.
- VPS affiliate links.
- Storage and backup provider affiliate links.
- Sponsored stack guides.
- Paid alerts for app updates, abandoned projects, Docker image updates, and security score changes.
- Newsletter sponsorships.

Best-fit monetization surfaces:

- Stack builder result pages.
- Hardware planner pages.
- Server profile pages.
- Curated guides.
- Newsletter.

Trust rule:

Recommendations should be requirements-first and affiliate-second. Sponsored content must be clearly labeled.

## MVP Recommendation

Build the first version around three loops:

1. App discovery with health filters.
2. App comparison pages.
3. Stack-to-server planner.

Recommended MVP scope:

- Import Awesome Selfhosted Data.
- Enrich GitHub health data.
- Add health score with transparent sub-scores.
- Add manual requirement profiles for 50-100 popular apps.
- Build comparison groups for the most searched categories.
- Build a simple stack planner that estimates server class.

Suggested first curated categories:

- Photo management
- Password managers
- DNS blockers
- Media servers
- Personal finance
- Bookmark managers
- Notes/wiki
- Monitoring
- Backups
- File sync/cloud storage

Suggested first manual app profiles:

- Actual
- AdGuard Home
- Bitwarden/Vaultwarden
- Home Assistant
- Immich
- Jellyfin
- Nextcloud
- Paperless-ngx
- Pi-hole
- Uptime Kuma
- Gitea/Forgejo
- Miniflux
- FreshRSS
- Mealie
- Syncthing

## Open Questions

- Should the site target beginners, homelab enthusiasts, or both?
- Should recommendations prefer home hardware, VPS, or both equally?
- Should the product include user accounts in the MVP?
- Should alerts be part of MVP or a later paid feature?
- Should Docker Compose examples be generated, curated, or linked only?
- How opinionated should hardware recommendations be?
- Should the site include non-open-source self-hostable apps or only free/open-source projects?

## Suggested Step-By-Step Plan

1. Define MVP audience and positioning.
2. Choose the initial 50-100 apps.
3. Finalize the canonical data model.
4. Design health scoring.
5. Design requirement scoring.
6. Build ingestion for Awesome Selfhosted Data.
7. Build GitHub enrichment.
8. Add manual curation layer.
9. Create app detail and category page content model.
10. Create comparison page model.
11. Create stack planner model.
12. Add Docker, Scorecard, and deps.dev enrichment incrementally.


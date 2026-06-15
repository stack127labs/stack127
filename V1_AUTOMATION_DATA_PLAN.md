# V1 Automation And Data Plan

Date: 2026-06-05

## Purpose

This plan defines what data we show, where it comes from, what we can automate, and what needs to be derived or curated.

V1 has four main surfaces:

1. Home app cards.
2. Home filters.
3. App detail page.
4. Compare view.

## Home App Card

The home page card should be compact, visual, and scannable.

### Card Content

Each app card should show:

- App name.
- Short description.
- Primary category.
- Docker support badge.
- Maintenance badge.
- RAM tier.
- Storage tier.
- Setup difficulty.
- License.
- Stars or popularity.

Optional if space allows:

- Last release date.
- Needs database badge.
- Beginner friendly badge.

### Visual Shape

Card layout:

```text
┌────────────────────────────────────┐
│ App Name              Active       │
│ Short description of what it does. │
│                                    │
│ [Photos] [Docker] [MIT]            │
│ RAM: 1-2 GB   Storage: High        │
│ Setup: Moderate   ★ 24k            │
└────────────────────────────────────┘
```

Visual rules:

- Use shadcn `Card`.
- Use shadcn `Badge` for status signals.
- Keep text small and readable.
- Use one or two lines for description.
- Use muted text for secondary data.
- Avoid large buttons on cards.
- Make the whole card clickable.

## Home Filters

Filters should live in a left sidebar on desktop and a sheet/drawer on mobile.

### Required Filters

- Search.
- Category.
- Docker support.
- RAM tier.
- Storage tier.
- Maintenance status.
- Setup difficulty.
- License.

### Filter Values

Category:

- Photos
- Media
- Notes
- Wiki
- Bookmarks
- Password managers
- DNS
- Backups
- File sync
- Documents
- Finance
- Monitoring
- Analytics
- Automation
- Communication
- Development tools
- Home automation

Docker support:

- Official/project Docker support.
- Community Docker support.
- No Docker support.
- Unknown.

RAM tier:

- Under 512 MB.
- Under 1 GB.
- 1-2 GB.
- 2-4 GB.
- 4 GB+.
- Unknown.

Storage tier:

- Tiny.
- Low.
- Medium.
- High.
- Very high.
- Depends.
- Unknown.

Maintenance status:

- Active.
- Slow but alive.
- Possibly stale.
- Archived.
- Unknown.

Setup difficulty:

- Very easy.
- Easy.
- Moderate.
- Hard.
- Expert.
- Unknown.

License:

- MIT.
- Apache-2.0.
- GPL.
- AGPL.
- BSD.
- Proprietary.
- Other.
- Unknown.

## App Detail Page

The app detail page should answer: "Should I actually run this app?"

### Detail Page Content

Show:

- App name.
- One-line description.
- Quick verdict.
- Best for.
- Not best for.
- Limitations.
- Docker/deployment support.
- RAM requirement.
- Storage requirement.
- CPU notes.
- Database/dependency needs.
- Maintenance status.
- GitHub stats.
- Latest release.
- Commit/release history chart.
- Docs/install links.
- Website/source links.
- Alternatives.
- Hardware recommendation.
- Affiliate disclosure if hardware links appear.

### Visual Shape

Suggested layout:

```text
┌────────────────────────────────────────────────────────┐
│ App Name                         [Compare] [Website]  │
│ Short description                                      │
│ [Docker] [Active] [RAM: 1-2 GB] [Storage: High]        │
└────────────────────────────────────────────────────────┘

┌──────────────┐ ┌───────────────────────────────────────┐
│ Quick Facts  │ │ Quick Verdict                         │
│ RAM          │ │ Best for...                            │
│ Storage      │ │ Not best for...                        │
│ Difficulty   │ │ Key limitations...                     │
└──────────────┘ └───────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Health and Activity Chart                              │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Install Links / Docs / Hardware Recommendation         │
└────────────────────────────────────────────────────────┘
```

Visual rules:

- App-like dashboard, not blog article layout.
- Use small sections and compact cards.
- Use badges for key signals.
- Use charts only where they add value.
- Keep paragraphs short.
- Put practical facts before long explanation.

## Compare View

Compare should show up to 3 apps side by side.

### Compare Content

Each column should show:

- App name.
- Quick verdict.
- Best for.
- Docker support.
- RAM tier.
- Storage tier.
- Setup difficulty.
- Maintenance status.
- Latest release.
- Stars.
- License.
- Main limitations.
- Hardware recommendation.

### Visual Shape

```text
┌───────────────┬───────────────┬───────────────┐
│ App A         │ App B         │ App C         │
│ Verdict       │ Verdict       │ Verdict       │
│ [Docker]      │ [Docker]      │ [No Docker]   │
│ RAM: Low      │ RAM: Medium   │ RAM: High     │
│ Storage: High │ Storage: Med  │ Storage: High │
│ Setup: Easy   │ Setup: Hard   │ Setup: Mod    │
│ Limitations   │ Limitations   │ Limitations   │
└───────────────┴───────────────┴───────────────┘
```

Visual rules:

- Use a compact table or resizable columns.
- Keep rows aligned.
- Use badges and short text.
- Highlight the best fit only if confidence is high.
- Compare practical concerns before popularity.

## App Gathering Sources

Primary source:

- Awesome Selfhosted Data: app names, descriptions, tags, platforms, licenses, source URLs, stars, releases, commit history.

Secondary discovery sources for later:

- Awesome Selfhosted main repo.
- GitHub topics such as `self-hosted`, `selfhosted`, `docker`, `homelab`.
- Product docs and official websites.
- Docker Hub search.
- GitHub Container Registry links from repositories.

V1 should start with Awesome Selfhosted Data.

## App Enrichment Sources

Use these in background jobs only:

- GitHub REST API: stars, forks, issues, releases, license, pushed date, archived status.
- GitHub GraphQL API: bulk repository enrichment.
- Docker Hub API: image existence, tags, freshness, pulls.
- OpenSSF Scorecard API: security/project health score.
- deps.dev: package/dependency/license/advisory data where mapping is clear.
- Official docs: install links and requirements when available.

No live external API calls during user page loads.

## Data We Can Collect Automatically

Automated:

- Name.
- Description.
- Website.
- Source code URL.
- License.
- Tags/categories.
- Platforms.
- GitHub stars.
- GitHub forks.
- Archived status.
- Latest release.
- Last update/pushed date.
- Commit history.
- Docker platform flag from Awesome data.
- OpenSSF score when available.
- Docker tag freshness when image is known.

## Data We Need To Derive Or Curate

Derived or curated:

- Clean user-facing category.
- Docker support quality.
- RAM tier.
- Storage tier.
- Setup difficulty.
- Maintenance status.
- Best for.
- Not best for.
- Limitations.
- Hardware recommendation.
- Beginner friendly.
- Needs database.
- Public exposure caution.
- Alternatives.

## Process For Derived Data

Use this order:

1. Import raw data.
2. Normalize fields.
3. Apply automated rules.
4. Apply manual overrides.
5. Store final public values.

### Example Derived Rules

Maintenance status:

- Archived repo = `Archived`.
- Last release within 6 months or recent commits = `Active`.
- No release but commits within 6 months = `Slow but alive`.
- No release and no commits for 12 months = `Possibly stale`.
- Not enough data = `Unknown`.

Docker support:

- Platform includes Docker = `Project Docker support`.
- Official docs link to Docker image = `Project Docker support`.
- Only community image found = `Community Docker support`.
- No evidence = `Unknown`.

RAM/storage:

- Prefer manual curated value.
- If docs state requirements, use docs value.
- If no docs, estimate by app type.
- If uncertain, mark as `Unknown` or `Depends`.

Hardware recommendation:

- Prefer manual curated value.
- Use RAM tier + storage tier + CPU notes.
- Avoid exact product recommendations unless reviewed.

## Minimum Database Schema

### `apps`

Core app record.

Fields:

- `id`
- `slug`
- `name`
- `description`
- `website_url`
- `source_code_url`
- `license`
- `created_at`
- `updated_at`

### `categories`

User-facing categories.

Fields:

- `id`
- `slug`
- `name`
- `description`
- `icon_key`

### `self_host_app_categories`

Many-to-many app/category mapping.

Fields:

- `app_id`
- `category_id`

### `app_public_profile`

Final public values used by cards, details, and compare.

Fields:

- `app_id`
- `docker_support`
- `ram_tier`
- `storage_tier`
- `setup_difficulty`
- `maintenance_status`
- `best_for`
- `not_best_for`
- `limitations`
- `hardware_recommendation`
- `beginner_friendly`
- `needs_database`
- `public_exposure_caution`
- `updated_at`

### `repositories`

Source repository.

Fields:

- `id`
- `app_id`
- `provider`
- `owner`
- `name`
- `url`
- `default_branch`

### `repo_snapshots`

Historical repo stats.

Fields:

- `id`
- `repository_id`
- `snapshot_at`
- `stars`
- `forks`
- `open_issues`
- `archived`
- `pushed_at`
- `latest_release_tag`
- `latest_release_at`
- `commit_count_30d`
- `commit_count_90d`

### `app_links`

Useful links.

Fields:

- `id`
- `app_id`
- `type`
- `label`
- `url`

Link types:

- `website`
- `docs`
- `install_docs`
- `source`
- `docker_image`
- `demo`

### `raw_imports`

Raw source payload storage.

Fields:

- `id`
- `source`
- `source_key`
- `payload`
- `imported_at`

### `manual_overrides`

Curated values that override automated data.

Fields:

- `id`
- `app_id`
- `field_name`
- `value`
- `note`
- `updated_at`

### `affiliate_links`

Hardware/VPS links kept separate from editorial data.

Fields:

- `id`
- `app_id`
- `label`
- `url`
- `provider`
- `disclosure_required`
- `active`

# version127 App Content Instructions

Use this file when adding or updating details for one self-hosted app. The goal is to create one high-quality app record that is useful to smart beginners in self-hosting.

Do not treat this as bulk data entry. Research the app, write version127-original copy, and only automate facts that are safe to automate.

## Audience And Voice

Write for smart beginners.

They may know what Docker, GitHub, DNS, backups, or a VPS are, but they may not know what matters before choosing an app. Explain practical tradeoffs clearly without dumbing things down.

Voice rules:

- Write original version127 copy. Do not copy descriptions, docs, README text, marketing copy, or video descriptions.
- Use simple, direct language.
- Avoid hype.
- Avoid analogies.
- Avoid em dashes.
- Prefer useful specifics over generic praise.
- Say what the app does, what it needs, what can go wrong, and who it is good for.
- If a fact is uncertain, say so in `notes` or lower `data_confidence`.

## Research Order

For one app, check these sources first:

1. Official website.
2. Official documentation.
3. Official source repository.
4. Official Docker image or container registry page.
5. Official demo, if available.
6. Official client app links, if available.
7. GitHub release and repository metadata.
8. Community or third-party YouTube video only if no official intro/trailer exists or if the third-party video is clearly useful.

Do not rely on a random blog post when an official source exists.

## Manual Fields

These should be manually written by the agent after research. Do not generate them by copying source text.

### `name`

Use the official app name.

Examples:

- `Immich`
- `Nextcloud`
- `Paperless-ngx`

### `slug`

Use lowercase URL-safe text.

Examples:

- `immich`
- `paperless-ngx`
- `home-assistant`

### `description`

Write one short sentence that explains what the app actually does.

Good:

```text
Photo and video backup app that gives you a private Google Photos-style library on your own server.
```

Bad:

```text
Open-source self-hosted photo management solution.
```

Rules:

- One sentence.
- Beginner-friendly.
- Specific to the app.
- Do not say "open source" or "self-hosted" unless that is the main point, because most apps in this database are both.

### Categories

Choose every existing category that clearly applies to the app. Do not force a single primary category when the app genuinely spans multiple areas.
When a new category is created, give it a unique `icon_key` that visually explains the category and does not repeat another category icon.

Examples:

- Immich: `photos`
- Nextcloud: `cloud-workspace`, `photos`, `documents`
- Jellyfin: `media`
- Home Assistant: `home-automation`

### `icon_url`

Use a square-friendly app icon or logo URL.

Preferred sources:

1. Official logo asset from the app website or repo.
2. Official organization/repository avatar if it represents the app well.
3. A curated self-hosted icon source, such as `selfh.st/icons`, when official square assets are not easy to use.

Rules:

- Prefer SVG or high-resolution PNG.
- The icon should work inside a square tile.
- Do not use random screenshots as icons.
- Store the source label in `icon_source`.

### `get_started`

Write 1 to 2 short paragraphs.

Purpose:

- Explain the normal hosting path.
- Mention what the user should already be comfortable with.
- Mention the important setup decisions before real use.

Include:

- Main install method, such as Docker Compose, package, binary, appliance, or OS image.
- Required supporting services, such as Postgres, Redis, MariaDB, object storage, or none.
- Basic operational concerns, such as HTTPS, storage path, DNS, backups, or update process.

Do not write a step-by-step tutorial here. Link install docs separately.

### `verdict`

Write a short version127 opinion.

Purpose:

- Say what the app is especially good at.
- Mention the main tradeoff.
- Mention if there are better alternatives for some users.

Tone:

- Practical.
- Honest.
- Not sales copy.

### `good_fit`

Use 2 to 4 short entries.

Examples:

- `Private photo and video backup`
- `Families replacing Google Photos or iCloud Photos`
- `Users who want polished mobile apps and smart search`

### `watch_outs`

Use 2 to 4 short entries.

Examples:

- `Tiny VPS installs with little storage`
- `People who do not want to manage a database and media backups`

### `known_issues`

Use practical warnings, not random bug tracker items. These may also be folded into `watch_outs` for the UI.

Examples:

- `Storage grows quickly with original media`
- `Database and upload folders must be protected together`
- `Transcoding can change hardware requirements completely`

### `storage_and_data_notes`

Explain where the app stores important data.

Include:

- User files or media.
- Database.
- Config.
- Generated files, thumbnails, cache, metadata, logs, uploads, or attachments.
- What grows over time.

This field combines old `storage_model` and `storage_notes`. Do not split them again.

### `backup_details`

Write 1 to 2 useful paragraphs.

Purpose:

- Explain what must be backed up together.
- Explain what a restore should prove.
- Mention special backup risks for this app.

Include:

- Database backup needs.
- File/media/config backup needs.
- Whether exports are useful.
- Whether snapshots are enough.
- Whether offsite backups matter.

Do not say only "Back up the database and files." That is too thin.

### `backup_difficulty`

Choose one:

```text
very_easy
easy
moderate
hard
expert
unknown
```

Base this on how many moving parts must be restored together.

### `backup_criticality`

Choose one:

```text
low
medium
high
critical
unknown
```

Use `critical` for personal photos, passwords, documents, primary files, source code, or home automation that people depend on.

### `raid_notes`

Explain RAID only where useful.

Rules:

- Always say RAID is not backup when relevant.
- Be precise when possible.
- Mention mirrored disks, RAIDZ1, or RAIDZ2 only if the app stores enough important data for that advice to matter.
- For lightweight apps, say a second instance or good backup may be more useful than RAID.

Examples:

- Photo library: mirrored disks, RAIDZ1, or RAIDZ2 can help uptime, but offsite backup is still required.
- DNS blocker: RAID is usually not useful. A second DNS instance is more useful.

### `hardware_recommendations`

Keep this useful but not overbuilt for now.

Use JSON with one or two practical recommendations.

Example:

```json
[
  {
    "type": "mini_pc_or_nas",
    "label": "Mini PC or NAS with reliable storage",
    "reason": "Prioritize storage capacity, backup drives, and enough RAM for the database plus app jobs.",
    "affiliate_url": null,
    "image_url": null,
    "price_note": "Use existing hardware first if storage is planned well."
  }
]
```

Do not invent affiliate links or prices.

### `notes`

Use this for internal editorial context.

Examples:

- `YouTube link is a verified third-party explainer.`
- `GitHub release count includes prereleases.`
- `Resource requirements are estimates and need deeper testing.`

### `data_confidence`

Choose one:

```text
high
medium
low
unknown
```

Use `medium` when the app profile is researched but not hands-on tested.

## Media Fields

### `screenshots`

Use an array of screenshot references.

Preferred sources:

1. Official repo raw image.
2. Official docs image.
3. Official product page with screenshot.
4. Official demo page.

Format:

```json
[
  {
    "url": "https://...",
    "type": "web",
    "caption": "Web dashboard screenshot",
    "source": "official_repo"
  }
]
```

Recommended `type` values:

```text
web
mobile
desktop
cli
demo
docs
clients
docker
```

Rules:

- Prefer direct image URLs where easy.
- If direct image URLs are hard, use official product/demo/docs pages as temporary references.
- Do not scrape or hotlink random third-party screenshots.
- Add captions in our words.

### `youtube_video_url`

Use one video only for now.

Priority:

1. Official trailer, intro, demo, or product video.
2. High-quality third-party explainer.
3. Null if no useful video is found.

Rules:

- Verify the video URL and title.
- If third-party, mention that in `notes`.
- Do not use shorts unless there is no better option.
- Do not use a video only because it ranks first.

## Link Fields

Gather these manually from official sources:

```text
website_url
source_code_url
demo_url
docker_url
install_docs_url
docs_url
```

Rules:

- Prefer official website and docs.
- Prefer official container image over community image.
- Use `demo_url` only if it is official or clearly maintained.
- If source code is not GitHub, use GitLab, Forgejo, Codeberg, or the official hosted Git link.

## Deployment Fields

Fill these based on official docs:

```text
deployment_methods
docker_support
compose_support
requires_database
database_types
requires_redis
requires_object_storage
supported_platforms
ram_required_mb
ram_recommended_mb
storage_required_gb
cpu_notes
gpu_notes
```

Rules:

- Do not fake exact RAM or storage requirements.
- Use null when unknown.
- Use `cpu_notes` and `gpu_notes` for practical workload notes.
- For `docker_support`, choose `official`, `community`, `none`, or `unknown`.

## Client Apps

Use `client_apps` JSON for official or compatible clients.

Format:

```json
[
  {
    "platform": "iOS",
    "url": "https://...",
    "official": true
  }
]
```

Rules:

- Use official app store links where possible.
- If an app uses compatible clients from another project, set `official` to `false` and explain in `notes`.

## GitHub Automation Fields

These should be gathered through automation when the source repo is on GitHub.

Current app row fields:

```text
github_owner
github_repo
github_stars
github_forks
github_open_issues
github_open_pull_requests
github_latest_release
github_latest_release_at
github_last_commit_at
github_commit_count_90d
github_release_count_90d
github_release_count
github_updated_at
github_checked_at
```

Snapshot table fields:

```text
app_id
snapshot_date
stars
forks
open_issues
open_pull_requests
latest_release
latest_release_at
last_commit_at
commit_count_90d
release_count_90d
release_count
```

Automation rules:

- Use GitHub API, not scraped GitHub HTML.
- Public GitHub clone counts are generally not available for repos we do not own. Do not invent clone counts.
- `github_open_issues` from the repo API can include pull requests depending on endpoint. If exact issue vs PR split matters, use the GitHub Search API or GraphQL.
- `github_release_count` can be derived from GitHub Releases pagination. Note if it includes prereleases.
- Prefer latest non-prerelease for `github_latest_release` when a stable release exists.
- Set `github_checked_at` to the time automation ran.
- Insert a snapshot row for each automation run so historical trends can be built later.

## Alternatives And Replacements

### `alternative_app_ids`

Use IDs from our own database only.

Rules:

- Link close alternatives, not every related app.
- Keep this sparse at first.

### `replaces_apps`

List non-self-hosted or closed services the app can reasonably replace.

Examples:

- `Google Photos`
- `iCloud Photos`
- `Dropbox`
- `Plex`
- `UptimeRobot`

Do not overclaim replacement if the app only covers a small part of the product.

## One-App Workflow

When asked to write details for one app:

1. Read `AGENTS/self-host-app-data-workflow.md` and `scripts/self-host-apps/README.md`.
2. If the app uses GitHub, create a draft:

```sh
npm run selfhost:draft -- --repo owner/name
```

3. Treat `content/app-drafts/*.generated.json` as a research draft only. Do not upsert it.
4. Identify official website, docs, source repo, install docs, Docker image, demo, screenshots, YouTube video, and clients.
5. Verify candidate links from the draft before copying them into a reviewed record.
6. Move or rewrite the record into `content/apps/<slug>.json` only after writing the manual fields.
7. Write original version127 copy for description, get started, verdict, storage/data notes, backup details, and RAID notes.
8. Fill structured fields conservatively. Keep unknown numeric requirements as `null`.
9. Run strict validation:

```sh
npm run selfhost:validate -- --file content/apps/<slug>.json
```

10. Run a local dry-run upsert first:

```sh
npm run selfhost:upsert -- --file content/apps/<slug>.json --dry-run
```

11. Insert or update only that one app row in the local database unless the user explicitly asks for production.
12. Verify the database row, category links, and GitHub snapshot with a readback query.

## Workflow Test Mode

When another agent asks you to test this workflow, do not promote the app into the reviewed dataset by default.

In workflow test mode:

- Keep the reviewed record at `content/app-drafts/subagent-<slug>.reviewed.json`.
- Run strict validation on that file.
- Run `selfhost:upsert` with `--dry-run` only.
- Do not write to `content/apps`.
- Do not run a committed database upsert.
- Do not edit workflow docs, scripts, package scripts, migrations, or schema files.

Only the main agent decides whether a test record should later move into `content/apps`.

## Quality Checklist

Before finishing one app, check:

- Description is one original sentence.
- Get started is 1 to 2 short paragraphs.
- Verdict is useful and opinionated.
- Icon URL is present when a usable app icon exists.
- Backup details explain strategy, not just a generic backup reminder.
- RAID notes are precise and do not imply RAID is backup.
- Screenshots are present or `notes` explains why not.
- YouTube video is present or `notes` explains why not.
- Official links are filled where available.
- GitHub stats are automated if the app is on GitHub.
- No copied marketing text.
- No em dashes.
- No fake precision for RAM, storage, or hardware.

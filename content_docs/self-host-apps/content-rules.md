# version127 App Content Instructions

Use this file when adding or updating self-host app rows for the version127 directory.

## Current Direction

The directory should stay minimal, structured, and easy to automate. Do not create prose-heavy app pages. The visible UI can stay compact, but the `/self-host-apps` page must expose the app facts in server-rendered HTML so search crawlers and AI agents can read the content without opening client-side drawers.

Source of truth:

- `content_docs/self-host-apps/schema.md`
- `supabase/migrations/20260629000000_create_version127_self_host_apps.sql`
- `supabase/seeds/20260629_version127_self_host_apps.sql`
- `scripts/self-host-apps/scripts.json`

## App Row Shape

Use the active schema fields:

```text
slug
name
summary
icon_url
website_url
repository_url
docs_url
install_docs_url
docker_url
license
publisher_name
publisher_type
publisher_url
published
maintenance_status
github_owner
github_repo
github_stars
github_latest_release
github_latest_release_at
github_last_commit_at
github_checked_at
docker_support
compose_support
requires_database
database_types
ram_mb
storage_profile
platforms
summary_source
summary_confidence
category links
field sources
source payloads
```

## Summary Rule

`summary` replaces the old long `description` style.

Write one short original sentence that explains what the app actually does. The sentence should be direct enough for a directory card and specific enough for an agent to classify the app.

Good:

```text
Photo and video backup app for building a private Google Photos-style library.
```

Bad:

```text
Open-source self-hosted photo management solution.
```

Avoid generic filler such as `open source`, `self-hosted`, `solution`, `platform`, `powerful`, `ultimate`, and `all-in-one` unless the word is essential to the app.

## Data Rules

- Keep `summary` to one clear line.
- Prefer official websites, docs, repositories, and container links.
- Use `unknown` or `null` instead of fake precision.
- Keep fields filterable, sortable, refreshable, or inferable.
- Do not add verdict, good fit, watch outs, install prose, screenshots, video fields, hardware recommendations, or long descriptions.
- Keep app details inside `/self-host-apps` through the in-page details panel.
- Put collection, validation, enrichment, and upsert scripts for this page under `scripts/self-host-apps`.
- Add future page pipelines under their own page-scoped folder, then register them in `scripts/scripts.json`.

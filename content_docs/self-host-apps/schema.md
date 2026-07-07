# Version127 Self-Host Apps Schema

This directory is intentionally minimal. The database stores facts we can filter, sort, automate, and refresh. The UI can infer the rest.

## Tables

### `self_host_apps_categories`

Controlled taxonomy only. Do not create one-off categories from import source headings.

| column | type | notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated with `gen_random_uuid()` |
| `slug` | `text` | Unique URL/filter value |
| `name` | `text` | Display name |
| `icon_key` | `text` | Optional frontend icon key |
| `sort_order` | `integer` | Sidebar/card ordering |
| `created_at` | `timestamptz` | Insert timestamp |
| `updated_at` | `timestamptz` | Trigger-maintained timestamp |

Current category slugs:

- `ai-ml`
- `automation`
- `bookmarks-read-it-later`
- `business-commerce`
- `calendars-contacts`
- `communication`
- `communities-social`
- `content-publishing`
- `dashboards`
- `databases`
- `developer-tools`
- `documents-pdfs`
- `ebooks-libraries`
- `email-newsletters`
- `file-sharing-sync`
- `finance-budgeting`
- `forms-polls-events`
- `games`
- `health-fitness`
- `home-automation-iot`
- `identity-access`
- `knowledge-notes`
- `learning-courses`
- `maps-travel`
- `media-servers`
- `monitoring-status`
- `music-audio`
- `networking-dns`
- `password-managers`
- `photos-galleries`
- `project-task-management`
- `recipes-food`
- `remote-access`
- `search`
- `security-privacy`
- `storage-backup`
- `system-admin-hosting`
- `video-conferencing`
- `wikis`

### `self_host_apps`

| column | type | notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated with `gen_random_uuid()` |
| `slug` | `text` | Unique app key |
| `name` | `text` | App name |
| `summary` | `text` | One-line directory summary |
| `icon_url` | `text` | Optional logo/icon URL |
| `website_url` | `text` | Official website |
| `repository_url` | `text` | Source repository |
| `docs_url` | `text` | General docs |
| `install_docs_url` | `text` | Install or usage docs |
| `docker_url` | `text` | Docker/package link |
| `license` | `text` | License label |
| `publisher_name` | `text` | Maintainer, publisher, company, foundation, team, or person |
| `publisher_type` | `text` | `company`, `foundation`, `community`, `individual`, `unknown` |
| `publisher_url` | `text` | Maintainer/publisher website or profile |
| `published` | `boolean` | Controls whether app appears publicly |
| `maintenance_status` | `text` | `active`, `slow`, `stale`, `archived`, `unknown` |
| `github_owner` | `text` | GitHub owner/org |
| `github_repo` | `text` | GitHub repo name |
| `github_stars` | `integer` | Current star snapshot |
| `github_latest_release` | `text` | Latest release/tag snapshot |
| `github_latest_release_at` | `timestamptz` | Latest release timestamp |
| `github_last_commit_at` | `timestamptz` | Recent commit timestamp |
| `github_checked_at` | `timestamptz` | Last automation/manual refresh timestamp |
| `docker_support` | `text` | `official`, `community`, `none`, `unknown` |
| `compose_support` | `boolean` | Has a clear Docker Compose path |
| `requires_database` | `boolean` | Needs a separate database service |
| `database_types` | `text[]` | Database engines, for example `postgres` |
| `ram_mb` | `integer` | Practical low-end RAM estimate |
| `storage_profile` | `text` | `tiny`, `low`, `medium`, `high`, `depends`, `unknown` |
| `platforms` | `text[]` | `web`, `ios`, `android`, etc. |
| `summary_source` | `text` | How the summary was produced, for example `curated` or `github_rewrite` |
| `summary_confidence` | `text` | `high`, `medium`, `low`, `unknown` |
| `created_at` | `timestamptz` | Insert timestamp |
| `updated_at` | `timestamptz` | Trigger-maintained timestamp |

### `self_host_apps_categories_join_table`

| column | type | notes |
| --- | --- | --- |
| `app_id` | `uuid` | References `self_host_apps(id)` |
| `category_id` | `uuid` | References `self_host_apps_categories(id)` |
| `created_at` | `timestamptz` | Link timestamp |

Primary key: `(app_id, category_id)`.

### `self_host_apps_import_runs`

Tracks bulk imports and refresh jobs.

| column | type | notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated with `gen_random_uuid()` |
| `source` | `text` | Import source, for example `awesome`, `github_topic`, or `manual` |
| `source_url` | `text` | Source list or API URL |
| `status` | `text` | `running`, `completed`, `failed`, `partial` |
| `discovered_count` | `integer` | Candidate count |
| `imported_count` | `integer` | New rows created |
| `updated_count` | `integer` | Existing rows updated |
| `error_count` | `integer` | Failed candidate count |
| `notes` | `text` | Optional run notes |
| `started_at` | `timestamptz` | Run start time |
| `finished_at` | `timestamptz` | Run finish time |
| `created_at` | `timestamptz` | Insert timestamp |

### `self_host_apps_sources`

Stores raw source payloads so imported facts can be audited later.

| column | type | notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated with `gen_random_uuid()` |
| `app_id` | `uuid` | Optional reference to `self_host_apps(id)` |
| `import_run_id` | `uuid` | Optional reference to `self_host_apps_import_runs(id)` |
| `source` | `text` | Source name |
| `source_key` | `text` | Stable key inside that source |
| `source_url` | `text` | Source URL |
| `payload` | `jsonb` | Raw imported payload |
| `imported_at` | `timestamptz` | Last import timestamp |

Unique key: `(source, source_key)`.

### `self_host_apps_field_sources`

Tracks where specific fields came from and how confident the pipeline is.

| column | type | notes |
| --- | --- | --- |
| `app_id` | `uuid` | References `self_host_apps(id)` |
| `field_name` | `text` | Field being sourced |
| `source` | `text` | Source name |
| `source_url` | `text` | Source URL |
| `confidence` | `text` | `high`, `medium`, `low`, `unknown` |
| `checked_at` | `timestamptz` | Last checked timestamp |
| `note` | `text` | Optional provenance note |

Primary key: `(app_id, field_name)`.

### `self_host_apps_curated_overrides`

Stores manual corrections that should override import output.

| column | type | notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated with `gen_random_uuid()` |
| `app_id` | `uuid` | Optional reference to `self_host_apps(id)` |
| `slug` | `text` | Optional slug when an app row does not exist yet |
| `field_name` | `text` | Field to override |
| `value` | `jsonb` | Curated value |
| `note` | `text` | Reason for the override |
| `updated_at` | `timestamptz` | Trigger-maintained timestamp |

## Current Seed Apps

- Immich
- Excalidraw
- Linkwarden
- Uptime Kuma
- Home Assistant
- Pi-hole

## Product Rules

No per-app pages for now. Selecting an app opens an in-page details panel powered by the same structured row.

The `/self-host-apps` route also renders complete app records in the server HTML for crawlers and AI agents. The route is public because `self-host-apps` has a published row in `public.version127_pages`. Query-param pagination and filters use the central registry rule: renderable, `noindex, follow`, and excluded from the sitemap.

# Self-host apps data model

`public.self_host_apps` is the source of truth for `/self-host-apps`, and the page owns it. It includes open source, source-available, and closed-source software, as long as a self-hosted install is verified. A public repository is optional.

## Core tables

| Table | Holds |
| --- | --- |
| `self_host_apps` | Reviewed app facts and stable page data. |
| `self_host_app_categories` | The controlled category list. |
| `self_host_app_category_links` | Links between apps and categories. |
| `self_host_app_resource_estimates` | One row per app with RAM and storage planning ranges. |
| `self_host_app_install_options` | One row per app with destination columns and detailed link JSON. |
| `github_projects` | Shared GitHub repository facts used by self-host apps, terminal apps, and future directories. |
| `self_host_app_candidates` | The only lasting discovery and review queue. Candidate rows are never public. |

The streamline migration removed `self_host_app_import_runs`, `self_host_app_sources`, `self_host_app_field_sources`, and `self_host_app_curated_overrides`. Job logs and artifacts are now the run history. The old `open_project_*` compatibility views are gone too.

Every page-owned table keeps RLS on and isn't exposed to `anon` or `authenticated`. The page reads published records on the server.

## Publication boundary

An app qualifies when an official website, docs page, download, package, appliance, or container image proves you can run it on infrastructure you control. Hosted-only and client-only software doesn't qualify.

`source_model` is a legal fact about how the app is distributed:

| Value | Meaning |
| --- | --- |
| `open_source` | A verified open source license. |
| `source_available` | The source is visible, with extra restrictions. |
| `closed_source` | The publisher ships a self-hosted build without public source. |
| `unknown` | Research is incomplete. A new record with this value can't be published. |

## Requirements and estimates

Publisher requirements stay on `self_host_apps`: `ram_min_mb`, `ram_recommended_mb`, and `storage_min_gb`. Use them to calibrate the estimate ranges.

Appliance defaults go in `ram_default_limit_mb`. They aren't app minimums. `storage_profile` and `persistent_storage` describe the shape of the workload.

`self_host_app_resource_estimates` stores RAM and storage ranges for every app. Each row has:

- A `derived` or `estimated` kind.
- A confidence level.
- A short internal basis.
- Source URLs.
- An optional note.
- A check date.

The UI labels every range `Est. RAM` and `Est. Storage`. Package caps aren't app requirements.

## Install destinations

`self_host_app_install_options` has one row per app. Destination columns are arrays, so one app can have several Docker, Compose, NAS, or appliance links.

The `options` JSON list keeps labels, support levels, image references, source links, notes, and order. Docker URLs point to registry or install pages, never Dockerfiles.

## Shared GitHub facts

`github_projects` has one row per owner and repository pair. Stars, forks, languages, topics, releases, commits, license, and maintenance are refreshed there.

`self_host_apps.github_project_id` and `terminal_apps.github_project_id` are nullable links. Duplicate app rows can point to the same repository, so the repository table isn't unique per app.

Other providers keep using the existing `source_*` columns until a provider table is worth adding. That's a planned transition, not a second source of truth for self-host apps.

## Evidence and QA

`data_source_urls`, `data_checked_at`, `data_confidence`, and `technical_fact_status` hold a short evidence summary for each app. They replace the old field-level provenance rows.

They still let QA tell unchecked data apart from an official source that published no value.

The migration `20260901060529_streamline_self_host_apps_data_model.sql` folds the old rows into these tables. It removes pipeline-only tables and compatibility views and keeps the candidate review queue.

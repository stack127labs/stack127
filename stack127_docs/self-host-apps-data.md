# Self-host apps data model

`public.self_host_apps` is the page-owned source of truth for `/self-host-apps`. It includes open-source, source-available, and closed-source software when a self-hosted installation is verified. A public repository is optional.

## Core tables

- `self_host_apps`: reviewed app facts and stable page data.
- `self_host_app_categories`: the controlled taxonomy.
- `self_host_app_category_links`: app-to-category links.
- `self_host_app_resource_estimates`: one row per app for RAM and storage planning ranges.
- `self_host_app_install_options`: one row per app with destination columns and detailed link JSON.
- `github_projects`: shared GitHub repository facts used by self-host apps, terminal apps, and future directories.
- `self_host_app_candidates`: the only durable discovery/review queue; candidate rows are never public.

`self_host_app_import_runs`, `self_host_app_sources`, `self_host_app_field_sources`, and `self_host_app_curated_overrides` are removed by the streamline migration. Job logs and artifacts are the run history. The old `open_project_*` compatibility views are removed too.

All page-owned tables keep RLS enabled and are not exposed to `anon` or `authenticated`. The page reads published records on the server.

## Publication boundary

An app is eligible when an official website, documentation page, download, package, appliance, or container image proves that users can run it on infrastructure they control. Hosted-only and client-only software is not eligible.

`source_model` is a legal distribution fact:

- `open_source`: a verified open-source license.
- `source_available`: source is visible under additional restrictions.
- `closed_source`: the publisher distributes a self-hosted build without public source.
- `unknown`: research is incomplete and cannot be published for a new record.

## Requirements and estimates

Publisher requirements stay on `self_host_apps`: `ram_min_mb`, `ram_recommended_mb`, and `storage_min_gb`. Use those values to calibrate the estimate ranges. Appliance defaults use `ram_default_limit_mb`; they are not app minimums. `storage_profile` and `persistent_storage` describe workload shape.

`self_host_app_resource_estimates` stores RAM and storage estimate ranges for every app, with `derived` or `estimated` kind, confidence, a short internal basis, source URLs, optional note, and check date. The UI labels every range `Est. RAM` and `Est. Storage`. Package caps are not app requirements.

## Install destinations

`self_host_app_install_options` has one row for each app. Destination columns are arrays, so one app can have several Docker, Compose, NAS, or appliance links. The `options` JSON list retains labels, support levels, image references, source links, notes, and order. Docker URLs are registry or install pages, never Dockerfiles.

## Shared GitHub facts

`github_projects` has one row per owner/repository pair. Stars, forks, languages, topics, releases, commits, license, and maintenance are refreshed there. `self_host_apps.github_project_id` and `terminal_apps.github_project_id` are nullable links. Duplicate app rows may point to the same repository; the repository table is not unique per app.

Non-GitHub providers continue to use the existing `source_*` columns until a provider table is worth adding. That is a deliberate transition, not a second self-host app source of truth.

## Evidence and QA

`data_source_urls`, `data_checked_at`, `data_confidence`, and `technical_fact_status` keep a compact, app-level evidence summary. They replace field-level provenance rows while preserving the information QA needs to distinguish unchecked data from an official source that published no value.

The migration `20260901060529_streamline_self_host_apps_data_model.sql` folds the old rows into these tables, removes pipeline-only tables and compatibility views, and keeps the candidate review queue.

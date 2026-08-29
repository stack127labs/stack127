# Self-host apps data model

`public.self_host_apps` is the page-owned source of truth for `/self-host-apps`. It includes open-source, source-available, and closed-source software when an official self-hosted installation can be verified. An app does not need a public repository or an open-source license.

## Core tables

- `self_host_apps`: reviewed app facts and current external metadata.
- `self_host_app_categories`: the controlled directory taxonomy.
- `self_host_app_category_links`: app-to-category relationships.
- `self_host_app_candidates`: noisy discovery staging. Candidate rows are never public.
- `self_host_app_sources`: preserved imported evidence.
- `self_host_app_field_sources`: field-level provenance and verification dates.
- `self_host_app_curated_overrides`: durable reviewed corrections.
- `self_host_app_import_runs`: discovery and refresh run records.

All tables keep RLS enabled and are not exposed to `anon` or `authenticated`. The public page reads published records on the server. Compatibility views with the former `open_project_*` names exist only to keep older jobs working during the migration; new code must use the page-owned names.

## Publication boundary

An app is eligible when an official website, documentation page, download, package, appliance, or container image proves that users can run it on infrastructure they control. Hosted-only services and client-only software are ineligible.

`source_model` records the legal distribution model:

- `open_source`: a verified license meets the open-source definition.
- `source_available`: source is visible under a license with additional restrictions.
- `closed_source`: the publisher distributes a self-hosted build without public source.
- `unknown`: research is incomplete. New records with this value cannot be published.

Open and source-available records require a verified source URL and license. Closed-source records require an official website and publisher identity, but do not require a repository or pretend license.

## Deployment and requirements

`deployment_methods` records verified methods such as `docker`, `compose`, `kubernetes`, `package`, `binary`, `appliance`, or `manual`. `docker_image`, `docker_url`, and `compose_url` distinguish a runnable image from documentation and Compose instructions.

RAM and storage fields contain only sourced requirements:

- `ram_min_mb`: documented minimum memory.
- `ram_recommended_mb`: documented recommended memory.
- `storage_min_gb`: documented minimum storage.
- `resource_requirement_kind`: whether figures are official requirements, measured guidance, or unknown.

Generic estimates and repeated defaults are not requirements. Unknown values stay `null` or `unknown` and remain visible in QA.
The older `ram_mb` and `storage_profile` values remain in the database for rollback compatibility, but the directory does not present them as requirements unless reviewed evidence is moved into the new fields.

## Commercial and popularity facts

`pricing_model` is `free`, `freemium`, `paid`, `subscription`, `usage_based`, `enterprise`, or `unknown`. It describes the self-hosted offer, not the availability of source code.

`popularity_score` is a sortable normalized signal. `popularity_basis` preserves the inputs, such as repository stars, catalog adoption, community installs, or a reviewed editorial signal. The page must not label that score as GitHub popularity when GitHub is not the source.

## Images and mutable releases

`icon_source_url` keeps the reviewed official image source. `icon_url` points to the normalized local PNG served by stack127. Official artwork is preferred; a site favicon is a fallback, never evidence of app identity by itself.

Generic `release_version`, `release_url`, `release_published_at`, and `release_checked_at` fields support apps distributed outside GitHub. Provider-specific source metadata remains available for repository-backed apps.

## Provenance

Known decision facts require a `self_host_app_field_sources` row with a source URL, verification date, confidence, and source type. Discovery payloads are evidence to inspect, not editorial truth. Categories, summaries, deployment support, pricing, resource requirements, and source model are assigned only during review.

The rename and inclusive fields are defined in `supabase/migrations/20260829090000_make_self_host_apps_page_owned.sql`. Historical migrations retain their original names because they describe the database state at the time they ran.

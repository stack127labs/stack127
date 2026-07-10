# Open projects data model

`public.open_projects` is the shared source of truth for open-source projects across Version127. A project can appear on several future pages without being copied into page-specific tables.

## Core tables

- `open_projects`: curated project facts and current external metadata.
- `open_project_categories`: controlled Version127 categories.
- `open_project_categories_join_table`: many-to-many project/category links.
- `open_project_candidates`: noisy discovery staging. Candidate rows are never public.
- `open_project_sources`: raw imported source payloads.
- `open_project_field_sources`: field-level provenance and verification dates.
- `open_project_curated_overrides`: durable reviewed corrections.
- `open_project_import_runs`: discovery and refresh run records.

All tables keep RLS enabled and are not exposed to `anon` or `authenticated`. Public pages read them on the server and render useful facts into HTML.

## Project identity

Every project has a stable UUID, slug, name, summary, optional icon, official website, source-code URL, source-code host, docs links, publisher, license, publication state, and timestamps.

`source_code_host` is a flexible text field such as `github`, `gitlab`, `codeberg`, `other`, or `unknown`. Do not assume every open project uses GitHub.

## Self-hosting status

`self_hosting_status` is the enum:

- `self_hostable`: verified to run on infrastructure controlled by the user.
- `not_self_hostable`: open source, but not a self-hosted service or installable self-host target.
- `unknown`: not researched enough to classify.

This is a classification, not a confidence score. `/self-host-apps` reads only published `self_hostable` projects.

## Categories and surfaces

Categories describe what a project helps users do. Use the controlled category table and join table. Do not turn source-list headings or GitHub topics into Version127 categories automatically.

`surfaces` is a text array for usable forms such as `web`, `cli`, `desktop`, `mobile`, `ios`, `android`, `api`, `library`, or `extension`.

There is no generic tag system. Add a real column when a fact has stable meaning and a real query or display use.

## Licenses

- `license`: readable license label.
- `license_spdx_id`: normalized SPDX identifier when verified.
- `license_type`: `permissive`, `copyleft`, `public_domain`, `mixed`, `custom`, or `unknown`.

An unknown license stays unknown. It must not be presented as proof that a project is open source.

## GitHub metadata

GitHub-backed projects can store:

- repository ID, node ID, full name, owner, repository, and owner type;
- stars, forks, watchers, and open issues;
- primary language and a JSON language-to-byte map;
- raw GitHub topics;
- repository created, updated, pushed, checked, and last-commit dates;
- default branch and repository size in KB;
- archived, disabled, fork, and template flags;
- latest stable release tag and date.

Project age is derived from `github_created_at`; do not store a changing age number. GitHub topics are external metadata, not editorial categories.

## Self-host facts

The shared project row currently also stores the facts needed by `/self-host-apps`: Docker and Compose support, database requirement and engines, RAM estimate, storage profile, maintenance status, install docs, and summary provenance.

Keep uncertain values `null` or `unknown`. Do not convert weak README keyword matches into confident infrastructure facts.

## Migration

`supabase/migrations/20260710111454_migrate_to_open_projects.sql` renames the original self-host tables in place, preserves UUIDs and relationships, adds the shared fields, creates candidate staging, enables RLS, and converts current directory rows to `self_hostable`.

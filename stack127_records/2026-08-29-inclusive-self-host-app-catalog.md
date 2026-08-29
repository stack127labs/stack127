# Inclusive self-host app catalog

## Outcome

The `/self-host-apps` catalog now treats self-hostability as the admission rule. Open-source, source-available, and closed-source apps can be published when an official self-hosted installation is verified.

The page-owned database family was renamed from `open_project_*` to `self_host_app_*`. Compatibility views keep older read jobs working during the transition, but current application and pipeline code uses the page-owned names.

## Data changes

Production retained all 2,329 existing app records during the migration. The visible catalog contains 2,076 published, self-hostable apps:

- 1,883 open-source apps
- 59 source-available apps
- 125 apps whose source model is still unknown
- 9 closed-source apps

Plex, Emby, Blue Iris, Channels DVR, Unraid, Resilio Sync, Ubooquity, Subsonic, and Poste.io were reviewed and published with official self-hosting evidence. Their icons were normalized to local 256 × 256 PNG files.

The migration did not promote generic resource estimates into exact requirements. Exact RAM and storage fields are populated only when their provenance points to official documentation. Missing values remain unknown.

## Discovery and review

The discovery pipeline now ingests the official TrueNAS and Umbrel app catalogs. It staged 799 previously unseen candidates and attached 498 exact source matches to existing apps. Structured manifests, Compose files, image references, release data, and catalog artwork remain in candidate evidence for later review.

Discovery still cannot publish or assign editorial facts. Exact repository or official-homepage matches can be deduplicated automatically. Name-only matches require review.

Closed-source reviews require an official publisher, website, and self-hosting documentation. Open-source and source-available reviews require a verified license and source URL. Every newly published app must have a known source model.

## Quality gates

The release gate checks only published, self-hostable rows because that is the page's actual query. It separately reports published records excluded from the page. At migration time there were 62 such historical records.

The production gate passed with zero blocking issues across 2,076 visible apps. The icon audit also passed all 2,076 local files. Remaining unknown Docker, database, memory, storage, pricing, and source-model fields are reported as enrichment work rather than replaced with guesses.

## Source revisions

- TrueNAS catalog: `truenas/apps` master catalog fetched on 2026-08-29
- Umbrel catalog: `getumbrel/umbrel-apps` master catalog fetched on 2026-08-29
- Closed-source launch batch: `scripts/self-host-apps/batches/2026-08-29-closed-source-launch.json`

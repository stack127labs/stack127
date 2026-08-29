# Self-host apps data model

`/self-host-apps` owns `public.self_host_apps` and its supporting tables. Source availability is a directory fact, not an eligibility rule.

## Public query

The page reads:

```sql
select *
from public.self_host_apps
where published = true
  and self_hosting_status = 'self_hostable';
```

Categories come from `self_host_app_categories` through `self_host_app_category_links`.

`source_model` records `open_source`, `source_available`, `closed_source`, or `unknown`. All four may appear when the app is genuinely self-hostable and its deployment is verified.

## Tables used by this page

- `self_host_apps`: page-owned app records.
- `self_host_app_categories`: controlled categories.
- `self_host_app_category_links`: app/category relationships.
- `self_host_app_candidates`: discovery staging.
- `self_host_app_sources`: raw source payloads.
- `self_host_app_field_sources`: provenance for verified fields.
- `self_host_app_curated_overrides`: reviewed corrections.
- `self_host_app_import_runs`: discovery and refresh runs.

## Self-hosting classification

`self_hosting_status` has exactly three values:

- `self_hostable`
- `not_self_hostable`
- `unknown`

Do not add a confidence score. An app is shown on this page only after official sources support `self_hostable`. Legacy rows may show `source_model = unknown` while they are re-reviewed, but candidate and upsert workflows reject new published records with an unknown source model.

## Category rules

Use the controlled taxonomy in `scripts/self-host-apps/lib/categories.mjs`. Assign one to three categories by the app's actual purpose. Raw directory categories and GitHub topics remain source metadata until reviewed.

## Technical fact rules

`ram_min_mb` and `ram_recommended_mb` hold app requirements stated by an official source. `ram_default_limit_mb` holds a default memory cap from a reviewed appliance package. The package cap must not be presented as an app minimum.

`storage_min_gb` holds a stated minimum. `storage_profile` holds a reviewed workload tier. `persistent_storage` records whether a reviewed deployment declares persistent storage, but it does not imply a capacity requirement.

A null value may mean that a checked official source did not publish the fact. `self_host_app_field_sources` records that checked outcome, including the source URL, date, and note. The page and QA report distinguish a researched null from a field that has not been checked.

## Candidate states

- `new`: discovered but not deduped.
- `duplicate`: matched an existing app or earlier candidate.
- `queued`: unique and ready for a batch.
- `enriching`: selected for official-source research.
- `published`: converted into a `self_host_apps` row.
- `needs_review`: enrichment could not verify a required fact.
- `rejected`: not an identifiable, installable self-host app.

Candidate identity uses exact canonical source-code URL and official homepage matches. Name-only matches require review. Slugs and names never prove that two apps are the same.

## Rendering

There are no per-app routes. Cards and the details drawer use the same server-loaded records. Complete records remain in server-rendered HTML so crawlers and AI agents can read the directory without executing the drawer interaction.

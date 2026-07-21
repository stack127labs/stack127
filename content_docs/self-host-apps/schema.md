# Self-host apps data projection

The sitewide data model is documented in `version127_docs/open-projects.md`. `/self-host-apps` does not own a separate app table.

## Public query

The page reads:

```sql
select *
from public.open_projects
where published = true
  and self_hosting_status = 'self_hostable';
```

Categories come from `open_project_categories` through `open_project_categories_join_table`.

`source_model` records whether the verified license is `open_source`, `source_available`, or `unknown`. Both reviewed open-source and source-available projects may appear here when they are genuinely self-hostable.

## Tables used by this page

- `open_projects`: shared curated project records.
- `open_project_categories`: controlled categories.
- `open_project_categories_join_table`: project/category relationships.
- `open_project_candidates`: discovery staging.
- `open_project_sources`: raw source payloads.
- `open_project_field_sources`: provenance for verified fields.
- `open_project_curated_overrides`: reviewed corrections.
- `open_project_import_runs`: discovery and refresh runs.

## Self-hosting classification

`self_hosting_status` has exactly three values:

- `self_hostable`
- `not_self_hostable`
- `unknown`

Do not add a confidence score. A project is shown on this page only after official sources support `self_hostable`.

## Category rules

Use the controlled taxonomy in `scripts/self-host-apps/lib/categories.mjs`. Assign one to three categories by the project's actual purpose. Raw directory categories and GitHub topics remain source metadata until reviewed.

## Candidate states

- `new`: discovered but not deduped.
- `duplicate`: matched an existing project or earlier candidate.
- `queued`: unique and ready for a batch.
- `enriching`: selected for official-source research.
- `published`: converted into an `open_projects` row.
- `needs_review`: enrichment could not verify a required fact.
- `rejected`: not an eligible open project.

Candidate identity uses exact canonical source-code URL and official homepage matches. Name-only matches require review. Slugs and names never prove that two projects are the same.

## Rendering

There are no per-project routes. Cards and the details drawer use the same server-loaded records. Complete records remain in server-rendered HTML so crawlers and AI agents can read the directory without executing the drawer interaction.

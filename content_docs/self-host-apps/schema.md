# Self-host apps data model

`/self-host-apps` owns `public.self_host_apps` and the small set of tables that make the directory useful. Source availability is a fact about an app, not a filter for this page.

## Public query

The page reads published, self-hostable rows:

```sql
select *
from public.self_host_apps
where published = true
  and self_hosting_status = 'self_hostable';
```

Categories come from `self_host_app_categories` through `self_host_app_category_links`. The page can show open-source, source-available, and closed-source apps. A public repository is optional for a closed product.

## Tables used by this page

- `self_host_apps`: the reviewed app record and stable page facts.
- `self_host_app_categories`: the controlled category list.
- `self_host_app_category_links`: app-to-category links.
- `self_host_app_resource_estimates`: one row per app with RAM and storage planning ranges.
- `self_host_app_install_options`: one row per app with arrays for each install destination and a JSON list of link details.
- `github_projects`: shared mutable GitHub facts. `self_host_apps.github_project_id` links an app when it has a GitHub repository.
- `self_host_app_candidates`: the durable discovery and review queue. Candidate rows are never public.

Discovery and refresh logs live in GitHub Actions or VPS job logs. The old import-run, raw-source, field-source, and curated-override tables are removed by the streamline migration.

## Self-hosting classification

`self_hosting_status` has exactly three values: `self_hostable`, `not_self_hostable`, and `unknown`. An app is published only when an official website, documentation page, package, appliance catalog, or container image proves that users can run it on infrastructure they control.

`source_model` records the legal distribution model: `open_source`, `source_available`, `closed_source`, or `unknown`. A closed-source app still belongs in this directory when its self-hosted build is verified.

## Categories

Use the controlled taxonomy in `scripts/self-host-apps/lib/categories.mjs`. Assign one to three categories by the app's actual purpose. Directory labels and GitHub topics are leads, not final categories.

## Technical facts

`ram_min_mb`, `ram_recommended_mb`, and `storage_min_gb` retain requirements stated by an official source as estimate evidence. `ram_default_limit_mb` is a reviewed appliance default and is not an app minimum. `storage_profile` and `persistent_storage` describe workload shape, not capacity. The directory displays estimate ranges for all apps.

Planning ranges live in `self_host_app_resource_estimates`. The row keeps separate RAM and storage ranges, each with a kind (`derived` or `estimated`), confidence, short basis, source URL, optional note, and check date. The UI labels every range `Est. RAM` and `Est. Storage`. Package limits are not app requirements.

`technical_fact_status` on the app row records whether each audited fact is `published`, `not_published`, or `unchecked`, plus source URLs and the check date. RAM and storage use `estimated` when the directory has a reviewed estimate. This replaces a separate field-source table and lets QA show real gaps.

## Install destinations

`self_host_app_install_options` has one row per app. Each destination column is a `text[]`, so an app can have more than one Docker, Compose, NAS, or appliance link without comma parsing. `options` keeps the label, support level, image, source URL, note, and sort order for each link. `docker_urls` always point to a registry or install page; Dockerfiles and Compose files remain evidence or Compose destinations. Reviewed candidate decisions can include `install_options`; the review applier stores those links in the same row when it publishes a new app.

Supported columns include Docker, Compose, TrueNAS SCALE, Umbrel, Unraid, YunoHost, CasaOS, Runtipi, Cosmos, OpenMediaVault, Synology, QNAP, Proxmox, Home Assistant OS, Kubernetes, Helm, native, binary, package, and other. Add a new column only when a destination has a reviewed source.

## Candidate states

- `new`: discovered but not deduped.
- `duplicate`: matched an existing app or candidate.
- `queued`: ready for research.
- `enriching`: claimed by a reviewer.
- `published`: converted into a `self_host_apps` row.
- `needs_review`: a real blocker remains.
- `rejected`: not an identifiable, installable self-host app.

Exact canonical source-code and homepage matches can be deduped automatically. Name-only matches require review.

## Rendering

There are no per-app routes. The server loads the compact filter index in bounded batches, then fetches complete records only for the 30 apps on the current results page. This keeps the cards server-rendered without making one large database read or transferring every detail field for thousands of apps on each request.

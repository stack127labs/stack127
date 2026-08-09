# Storage tools documentation

Status: foundation and first three tools complete and published on 2026-08-09; the remaining roadmap tools stay unpublished until each passes its own launch checks

This folder owns the shared technical documentation for the `/storage-tools` collection. The collection and its first three flat tool routes are published through `supabase/migrations/20260809140000_publish_storage_tools.sql`; see `publication.md`. Roadmap tools that are still in progress get a guarded row in the local database instead.

- `calculation-engine.md` defines the shared calculation contract, exact-byte rules, versioning, URL state, limits, and adapter workflow.
- `content_docs/raid-calculator/` owns the completed RAID Capacity and Level Explorer brief, formula contract, and page notes.
- `content_docs/zfs-capacity-calculator/` owns the completed ZFS Pool Capacity Calculator research, product, test, content-plan, and handoff artifacts.
- `content_docs/zfs-padding-calculator/` owns the completed ZFS Block Size and Padding Calculator research, product, test, and brief artifacts. Its manual content plan is the remaining handoff step.
- A page-specific `brief.md` must be created in the applicable route folder before any storage-tool page is implemented.

Run `node --env-file=.env.local scripts/storage-tools/preview-local-pages.mjs` to add local preview rows for a storage route that is not published yet. Pass `--remove` to remove only those rows. The script refuses any non-local database hostname, and its row list is empty while every shipped storage route is registry published.

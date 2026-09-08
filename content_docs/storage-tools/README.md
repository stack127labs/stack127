# Storage tools documentation

Status: foundation and four initial tools complete and published on 2026-08-09 and 2026-08-13; eight additional tools have passed integration review and are ready to publish together on 2026-08-24

This folder owns the shared technical documentation for the `/storage-tools` collection. The collection and its first three flat tool routes are published through `supabase/migrations/20260809140000_publish_storage_tools.sql`; the RAIDZ Expansion Planner was published separately; see `publication.md`. The eight additional flat routes are included in collection discovery and are ready to publish together through `supabase/migrations/20260824140000_publish_eight_storage_tools.sql`. That migration is committed but has not been applied, so these routes are not live yet.

- `brief.md` defines the audience, job, and shared visual format for the collection page.
- `calculation-engine.md` defines the shared calculation contract, exact-byte rules, versioning, URL state, limits, and adapter workflow.
- `content_docs/raid-calculator/` owns the completed RAID Capacity and Level Explorer brief, formula contract, and page notes.
- `content_docs/zfs-capacity-calculator/` owns the completed ZFS Pool Capacity Calculator research, product, test, content-plan, and handoff artifacts.
- `content_docs/zfs-padding-calculator/` owns the completed ZFS Block Size and Padding Calculator research, product, test, and brief artifacts. Its manual content plan is the remaining handoff step.
- A page-specific `brief.md` must be created in the applicable route folder before any storage-tool page is implemented.

Run `node --env-file=.env.local scripts/storage-tools/preview-local-pages.mjs` to add temporary preview rows for the eight unpublished storage routes in managed development. Pass `--remove` to remove only verified preview rows. The script positively identifies the managed development Supabase project, refuses production or any other database, refuses to overwrite an existing target row, and verifies that all eight target rows are gone after cleanup.

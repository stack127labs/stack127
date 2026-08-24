# Publication

- Approved for integration: 2026-08-24
- Canonical route: `/storage-tools`
- Registry migration: `supabase/migrations/20260809140000_publish_storage_tools.sql`
- Ownership state: `published`
- Discovery: homepage feature card plus the collection sidebar shared by the storage calculators

The collection organizes discovery only. Each calculator keeps its own flat canonical URL, docs folder, and ownership manifest. The RAIDZ Expansion Planner was published separately through `supabase/migrations/20260813000000_publish_raidz_expansion_planner.sql`. The eight completed child routes passed the integration browser review and are ready to publish together through `supabase/migrations/20260824140000_publish_eight_storage_tools.sql`.

The eight-tool migration is committed for the release sequence but has not been
applied to the database. The child routes are not live yet.

Metadata, indexing, sitemap inclusion, and page JSON-LD remain owned by `public.stack127_pages` and the shared root layout.

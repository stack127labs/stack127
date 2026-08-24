# Publication

- Approved: 2026-08-09
- Canonical route: `/storage-tools`
- Registry migration: `supabase/migrations/20260809140000_publish_storage_tools.sql`
- Ownership state: `published`
- Discovery: homepage feature card plus the collection sidebar shared by the storage calculators

The collection organizes discovery only. Each calculator keeps its own flat canonical URL, docs folder, and ownership manifest. The RAIDZ Expansion Planner was published separately through `supabase/migrations/20260813000000_publish_raidz_expansion_planner.sql`, and the eight completed child routes stay out of the registry until they pass browser review and ship.

Metadata, indexing, sitemap inclusion, and page JSON-LD remain owned by `public.stack127_pages` and the shared root layout.

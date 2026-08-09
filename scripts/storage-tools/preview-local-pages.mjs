import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Run this script with --env-file=.env.local.");
}

const parsed = new URL(databaseUrl);
if (!new Set(["127.0.0.1", "localhost", "::1"]).has(parsed.hostname)) {
  throw new Error("Refusing to change preview rows outside the local database.");
}

const remove = process.argv.includes("--remove");
const pool = new pg.Pool({ connectionString: databaseUrl });

// Storage routes that exist in the repo but are not published yet. The hub and
// the first three calculators moved to supabase/migrations, so this list is
// empty until the next roadmap tool needs a local visual review.
const previewRows = [];

try {
  if (previewRows.length === 0) {
    console.log("No unpublished storage routes to preview. Add the next roadmap tool to previewRows first.");
  } else if (remove) {
    await pool.query(
      "delete from public.version127_pages where slug = any($1::text[])",
      [previewRows.map((row) => row.slug)],
    );
    console.log(`Removed ${previewRows.length} local storage-tools preview rows.`);
  } else {
    for (const row of previewRows) {
      await pool.query(
        `
          insert into public.version127_pages (
            slug, label, meta_title, meta_description, is_published,
            published_at, cover_image_url, page_type, sitemap_priority
          ) values ($1, $2, $3, $4, true, now(), null, $5, $6)
          on conflict (slug) do update set
            label = excluded.label,
            meta_title = excluded.meta_title,
            meta_description = excluded.meta_description,
            is_published = true,
            published_at = coalesce(public.version127_pages.published_at, excluded.published_at),
            cover_image_url = excluded.cover_image_url,
            page_type = excluded.page_type,
            sitemap_priority = excluded.sitemap_priority,
            updated_at = now()
        `,
        [row.slug, row.label, row.title, row.description, row.pageType, row.priority],
      );
    }
    console.log(`Upserted ${previewRows.length} local storage-tools preview rows.`);
  }
} finally {
  await pool.end();
}

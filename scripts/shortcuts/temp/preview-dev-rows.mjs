// Temporary local-preview helper for verifying the unpublished shortcuts routes.
// Mirrors scripts/<page-slug>/preview-local-page.mjs but targets whatever
// DATABASE_URL is provided, so it can run against the managed dev Supabase.
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("PREVIEW_DATABASE_URL is required.");

const remove = process.argv.includes("--remove");
const pool = new pg.Pool({ connectionString: databaseUrl });

const slugs = [
  { slug: "shortcuts", label: "Keyboard shortcuts", title: "Keyboard shortcuts for dev tools", description: "Per-app shortcut tables with per-platform keys.", pageType: "CollectionPage", priority: 0.7 },
  { slug: "shortcuts-cheatsheet-generator", label: "Cheat sheet generator", title: "Shortcuts cheat sheet generator", description: "Print a cheat sheet from verified shortcut data.", pageType: "WebApplication", priority: 0.6 },
];

const appSlugs = JSON.parse(process.argv[2] ?? "[]").map((slug) => ({
  slug: `shortcuts/${slug}`,
  label: `${slug} shortcuts`,
  title: `${slug} keyboard shortcuts`,
  description: `Verified ${slug} keyboard shortcuts.`,
  pageType: "ReferencePage",
  priority: 0.6,
}));

try {
  const rows = [...slugs, ...appSlugs];
  if (remove) {
    await pool.query("delete from public.stack127_pages where slug = any($1::text[])", [rows.map((r) => r.slug)]);
    console.log(`Removed ${rows.length} preview rows.`);
  } else {
    for (const row of rows) {
      await pool.query(
        `insert into public.stack127_pages (slug, label, meta_title, meta_description, is_published, published_at, cover_image_url, page_type, sitemap_priority)
         values ($1,$2,$3,$4,true,now(),null,$5,$6)
         on conflict (slug) do update set label=excluded.label, meta_title=excluded.meta_title, meta_description=excluded.meta_description, is_published=true, updated_at=now()`,
        [row.slug, row.label, row.title, row.description, row.pageType, row.priority],
      );
    }
    console.log(`Upserted ${rows.length} preview rows.`);
  }
} finally {
  await pool.end();
}

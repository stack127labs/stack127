import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required. Use --env-file=.env.local.");
const parsed = new URL(databaseUrl);
if (!new Set(["127.0.0.1", "localhost", "::1"]).has(parsed.hostname)) {
  throw new Error("Refusing to change a non-local database.");
}

const remove = process.argv.includes("--remove");
const pool = new pg.Pool({ connectionString: databaseUrl });
try {
  if (remove) {
    await pool.query("delete from public.version127_pages where slug = $1", ["home-assistant-energy-entity-checker"]);
    console.log("Removed the local Energy checker preview row.");
  } else {
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
      [
        "home-assistant-energy-entity-checker",
        "Energy entity checker",
        "Home Assistant Energy entity checker",
        "Check Energy field and statistics attributes.",
        "WebApplication",
        0.5,
      ],
    );
    console.log("Added the local Energy checker preview row.");
  }
} finally {
  await pool.end();
}

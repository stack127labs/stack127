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
    const result = await pool.query(
      `update public.stack127_pages
       set is_published = false, published_at = null, updated_at = null
       where slug = $1 and page_family = 'tool'`,
      ["home-assistant-energy-entity-checker"],
    );
    if (result.rowCount !== 1) throw new Error("The Energy checker tool registry row is missing.");
    console.log("Unpublished the local Energy checker preview without deleting its tool content.");
  } else {
    const result = await pool.query(
      `
        update public.stack127_pages
        set
          label = $2,
          meta_title = $3,
          meta_description = $4,
          is_published = true,
          published_at = coalesce(published_at, now()),
          cover_image_url = null,
          page_type = $5,
          sitemap_priority = $6,
          updated_at = now()
        where slug = $1 and page_family = 'tool'
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
    if (result.rowCount !== 1) throw new Error("The Energy checker tool registry row is missing.");
    console.log("Published the local Energy checker preview using its existing tool row.");
  }
} finally {
  await pool.end();
}

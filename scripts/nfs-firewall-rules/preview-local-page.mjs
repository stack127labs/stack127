import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required. Use --env-file=.env.local.");
const parsed = new URL(databaseUrl);
if (!new Set(["127.0.0.1", "localhost", "::1"]).has(parsed.hostname)) throw new Error("Refusing to change a non-local database.");

const remove = process.argv.includes("--remove");
const pool = new pg.Pool({ connectionString: databaseUrl });
try {
  if (remove) {
    await pool.query("delete from public.stack127_pages where slug = $1", ["nfs-firewall-rules"]);
    console.log("Removed the local NFS firewall planner preview row.");
  } else {
    await pool.query(
      `
        insert into public.stack127_pages (
          slug, label, meta_title, meta_description, is_published,
          published_at, cover_image_url, page_type, sitemap_priority
        ) values ($1, $2, $3, $4, true, now(), null, $5, $6)
        on conflict (slug) do update set
          label = excluded.label,
          meta_title = excluded.meta_title,
          meta_description = excluded.meta_description,
          is_published = true,
          published_at = coalesce(public.stack127_pages.published_at, excluded.published_at),
          cover_image_url = excluded.cover_image_url,
          page_type = excluded.page_type,
          sitemap_priority = excluded.sitemap_priority,
          updated_at = now()
      `,
      [
        "nfs-firewall-rules",
        "NFS firewall rules planner",
        "NFS Firewall Rules Planner",
        "Plan NFSv3 and NFSv4 host-firewall listener rules.",
        "WebApplication",
        0.5,
      ],
    );
    console.log("Added the local NFS firewall planner preview row.");
  }
} finally {
  await pool.end();
}

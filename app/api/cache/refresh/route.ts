import { cacheBodyDigest } from "@/scripts/stack127/cache/refresh.mjs";
import { NextResponse } from "next/server";
import { cacheAuthorized } from "@/lib/cache-auth";
import { loadDirectoryAppsBySlugs } from "@/lib/apps";
import { loadSelfHostedAppResourcePlannerEntry } from "@/lib/self-hosted-app-resource-planner/data";
import { getPool } from "@/lib/db";
import { sitePageAvailable } from "@/lib/page-source";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };

// A signed call reaches the public site; page loads stay inside this app
// instance and cannot receive an old Cloudflare response.
export async function POST(request: Request) {
  try {
    if (!await cacheAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
    const { paths } = await request.json();
    if (!Array.isArray(paths) || paths.length > 20 || paths.some(path => typeof path !== "string" || !/^\/[a-z0-9/_-]*(?:\.xml)?$/.test(path))) {
      return NextResponse.json({ error: "Invalid paths" }, { status: 400, headers: noStore });
    }
    const verified: Array<{ path: string; status: number; revision: string | null; digest: string | null }> = [];
    for (let i = 0; i < paths.length; i += 4) {
      await Promise.all(paths.slice(i, i + 4).map(async (path: string) => {
        const hosts = [...new Set(["127.0.0.1", process.env.HOSTNAME].filter(Boolean))];
        let response: Response | undefined;
        for (const host of hosts) {
          try {
            response = await fetch(`http://${host}:${process.env.PORT || "3333"}${path}`, {
              cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15_000),
            });
            break;
          } catch { /* Standalone servers can bind to the container hostname. */ }
        }
        if (!response) throw new Error(`Origin unavailable for ${path}`);
        const html = await response.text();
        let contentRevision: string | null = null;
        if (path.startsWith("/api/")) {
          const slug = path.split("/").at(-1)!;
          const parent = path.startsWith("/api/self-host-apps/") ? "self-host-apps" : "self-hosted-app-resource-planner";
          const visible = (await getPool().query("select is_published from public.stack127_pages where slug=$1", [parent])).rows[0]?.is_published;
          const expected = !visible ? null : path.startsWith("/api/self-host-apps/")
            ? (await loadDirectoryAppsBySlugs([slug]))[0] ?? null
            : path.startsWith("/api/resource-planner-app/")
              ? await loadSelfHostedAppResourcePlannerEntry(slug) : undefined;
          if (expected === undefined) throw new Error("Unsupported API refresh");
          if (!expected) {
            if (response.status !== 404) throw new Error(`${path}: removed app is still served`);
          } else {
            if (response.status !== 200 || !response.headers.get("content-type")?.includes("application/json")) throw new Error(`${path}: invalid API response`);
            if (JSON.stringify(JSON.parse(html)) !== JSON.stringify(expected)) throw new Error(`${path}: stale API content`);
          }
        } else if (path.endsWith(".xml")) {
          if (!response.ok || !html.includes("<urlset")) throw new Error("Invalid origin sitemap");
        } else {
          const slug = path.replace(/^\//, "");
          const { rows } = await getPool().query<{ is_published: boolean; row_updated_at: Date; page_family: string; has_tool_content: boolean; has_catalog_content: boolean }>(
            `select is_published,row_updated_at,page_family,
              exists(select 1 from public.stack127_tool_pages content where content.page_id=page.id) as has_tool_content,
              exists(select 1 from public.stack127_tool_catalogs content where content.page_id=page.id) as has_catalog_content
              from public.stack127_pages page where slug=$1`, [slug],
          );
          const published = sitePageAvailable(path, rows[0]);
          if (!published) {
            if (response.status !== 404) throw new Error(`${path}: removed page is still served`);
          } else {
            if (response.status !== 200) throw new Error(`${path}: HTTP ${response.status}`);
            const revision = rows[0].row_updated_at.toISOString();
            contentRevision = revision;
            if (!html.includes(`name="stack127-content-revision" content="${revision}"`)) throw new Error(`${path}: rebuilt content is stale`);
          }
        }
        verified.push({ path, status: response.status, revision: contentRevision, digest: path.startsWith("/api/") && response.status === 200 ? await cacheBodyDigest(html) : null });
      }));
    }
    return NextResponse.json({ verified }, { headers: noStore });
  } catch (error) {
    console.error("Origin cache refresh failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Origin refresh failed" }, { status: 503, headers: noStore });
  }
}

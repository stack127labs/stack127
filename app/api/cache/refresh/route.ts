import { cacheBodyDigest } from "@/scripts/stack127/cache/refresh.mjs";
import { NextResponse } from "next/server";
import { cacheAuthorized } from "@/lib/cache-auth";
import { loadDirectoryAppsBySlugs } from "@/lib/apps";
import { loadTerminalApps } from "@/lib/terminal-apps";
import { getHardwareDirectorySnapshot, isHardwareDirectorySlug } from "@/lib/hardware-directories";
import { hardwareIndexRecord } from "@/lib/hardware-directories/search-index";
import { getZigbeeDevices, zigbeeCategoryLabels } from "@/lib/zigbee-devices";
import { zigbeeIndexRecord } from "@/lib/zigbee-devices/search-index";
import { addAmazonMatches } from "@/lib/amazon-affiliate/server";
import { loadSelfHostAppsSearch } from "@/lib/self-host-apps-search-data";
import { parseSelfHostAppsSearchParams } from "@/lib/self-host-apps-search";
import { loadSelfHostedAppResourcePlannerEntry } from "@/lib/self-hosted-app-resource-planner/data";
import { getPool } from "@/lib/db";
import { sitePageAvailable } from "@/lib/page-source";
import { getFeeGroup } from "@/lib/platform-fees/groups";
import { LAUNCH_DIRECTORY_REVISION_SQL, launchDirectoryRevisionMatches } from "@/lib/launch-directories-data";
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
    const verified: Array<{ path: string; status: number; revision: string | null; digest: string | null; sourceRevision: string | null }> = [];
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
        let sourceRevision: string | null = null;
        if (path.startsWith("/api/")) {
          const slug = path.split("/").at(-1)!;
          const hardwareDirectory = path.startsWith("/api/hardware-directory/") ? slug : null;
          const parent = hardwareDirectory ?? (path === "/api/cli-apps/index" ? "cli-apps"
            : path.startsWith("/api/self-host-apps/") ? "self-host-apps" : "self-hosted-app-resource-planner");
          const visible = (await getPool().query("select is_published from public.stack127_pages where slug=$1", [parent])).rows[0]?.is_published;
          let expected: unknown;
          if (!visible) expected = null;
          else if (hardwareDirectory === "zigbee-devices") {
            expected = (await addAmazonMatches(hardwareDirectory, getZigbeeDevices()))
              .map(device => zigbeeIndexRecord(device, zigbeeCategoryLabels));
          } else if (hardwareDirectory && isHardwareDirectorySlug(hardwareDirectory)) {
            expected = (await getHardwareDirectorySnapshot(hardwareDirectory)).records.map(hardwareIndexRecord);
          } else if (path === "/api/cli-apps/index") expected = await loadTerminalApps();
          else if (path === "/api/self-host-apps/search") {
            expected = await loadSelfHostAppsSearch(parseSelfHostAppsSearchParams(new URLSearchParams()));
          } else if (path.startsWith("/api/self-host-apps/")) expected = (await loadDirectoryAppsBySlugs([slug]))[0] ?? null;
          else if (path.startsWith("/api/resource-planner-app/")) expected = await loadSelfHostedAppResourcePlannerEntry(slug);
          if (expected === undefined) throw new Error("Unsupported API refresh");
          if (!expected) {
            if (response.status !== 404) throw new Error(`${path}: removed data is still served`);
          } else {
            if (response.status !== 200 || !response.headers.get("content-type")?.includes("application/json")) throw new Error(`${path}: invalid API response`);
            if (JSON.stringify(JSON.parse(html)) !== JSON.stringify(expected)) throw new Error(`${path}: stale API content`);
          }
        } else if (path.endsWith(".xml")) {
          if (!response.ok || !html.includes("<urlset")) throw new Error("Invalid origin sitemap");
        } else {
          const slug = path.replace(/^\//, "");
          const { rows } = await getPool().query<{ is_published: boolean; row_updated_at: Date; page_family: string; has_page_content: boolean }>(
            `select is_published,row_updated_at,page_family,
              case page_family
                when 'tool' then exists(select 1 from public.stack127_tool_pages content where content.page_id=page.id)
                when 'directory' then exists(select 1 from public.stack127_directory_pages content where content.page_id=page.id)
                when 'catalog' then exists(select 1 from public.stack127_catalog_pages content where content.page_id=page.id)
                else true end as has_page_content
              from public.stack127_pages page where slug=$1`, [slug],
          );
          let published = sitePageAvailable(path, rows[0]);
          if (published && path.startsWith("/ad-networks/")) {
            const source = await getPool().query("select 1 from public.ad_networks where slug=$1", [path.slice("/ad-networks/".length)]);
            published = source.rows.length > 0;
          } else if (published && path.startsWith("/platform-fees/")) {
            const group = getFeeGroup(path.slice("/platform-fees/".length));
            if (!group) published = false;
            else {
              const source = await getPool().query("select 1 from public.platform_fee_sections where group_name=$1 limit 1", [group.name]);
              published = source.rows.length > 0;
            }
          }
          if (!published) {
            if (response.status !== 404) throw new Error(`${path}: removed page is still served`);
          } else {
            if (response.status !== 200) throw new Error(`${path}: HTTP ${response.status}`);
            const revision = rows[0].row_updated_at.toISOString();
            contentRevision = revision;
            if (!html.includes(`name="stack127-content-revision" content="${revision}"`)) throw new Error(`${path}: rebuilt content is stale`);
            if (path === "/launch-directories" || path === "/") {
              const launchPublished = path === "/launch-directories" || (await getPool().query("select is_published from public.stack127_pages where slug = 'launch-directories'")).rows[0]?.is_published;
              if (launchPublished) {
                const versions = await getPool().query(LAUNCH_DIRECTORY_REVISION_SQL);
                sourceRevision = versions.rows[0]?.fingerprint ?? null;
                if (!sourceRevision || !launchDirectoryRevisionMatches(html, sourceRevision)) throw new Error(`${path}: launch directory data is stale`);
              } else {
                sourceRevision = "unpublished";
                if (!launchDirectoryRevisionMatches(html, sourceRevision)) throw new Error(`${path}: unpublished launch directory is still displayed`);
              }
            }
          }
        }
        verified.push({ path, status: response.status, revision: contentRevision, digest: path.startsWith("/api/") && response.status === 200 ? await cacheBodyDigest(html) : null, sourceRevision });
      }));
    }
    return NextResponse.json({ verified }, { headers: noStore });
  } catch (error) {
    console.error("Origin cache refresh failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Origin refresh failed" }, { status: 503, headers: noStore });
  }
}

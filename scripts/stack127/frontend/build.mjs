import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile, cp } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import pg from "pg";
import loadNextConfig from "next/dist/server/config.js";
import { inspectIndexingHtml, inspectSitemap } from '../publishing/verify.mjs';
import { prepareFrontend } from "./prepare.mjs";
import { inspectAssets, staticHeaders, staticRedirects, assertNoPrivateCredentials } from "./assets.mjs";

const run = promisify(execFile);

export async function buildFrontend({ output, environment = process.env } = {}) {
  if (environment.GITHUB_ACTIONS !== "true") throw new Error("Frontend builds run on GitHub, not on the homelab.");
  if (!output) throw new Error("--output is required.");
  const sha = environment.STACK127_RELEASE_SHA || environment.STACK127_BUILD_SHA || environment.GITHUB_SHA;
  staticHeaders(sha);
  const pool = new pg.Pool({ connectionString: environment.DATABASE_POOLER_URL || environment.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
  const target = await mkdtemp(path.join(os.tmpdir(), "stack127-frontend-"));
  try {
    const { rows: pages } = await pool.query(`select page.slug, page.page_family, page.is_indexable, page.row_updated_at::text as revision
      from public.stack127_pages page
      left join public.stack127_tool_pages tool on tool.page_id = page.id
      left join public.stack127_directory_pages directory on directory.page_id = page.id
      left join public.stack127_catalog_pages catalog on catalog.page_id = page.id
      where page.is_published and case page.page_family
        when 'tool' then tool.page_id is not null when 'directory' then directory.page_id is not null
        when 'catalog' then catalog.page_id is not null else true end order by page.slug`);
    const indexingPages = (await pool.query('select slug,is_published,is_indexable from public.stack127_pages')).rows;
    const canonicalOrigin = environment.NEXT_PUBLIC_SITE_URL || 'https://stack127.com';
    const revisions = async () => JSON.stringify((await pool.query("select * from public.stack127_cache_source_revisions() order by entity_type, slug")).rows);
    const before = await revisions();
    const loadConfig = loadNextConfig.default ?? loadNextConfig;
    const config = await loadConfig("phase-production-build", process.cwd());
    const redirects = await config.redirects();
    await prepareFrontend(process.cwd(), target, pages);
    // Use the copied Next runtime so rendering shares its request context.
    // The temporary project never loads local .env files.
    await run(process.execPath, [path.join(target, "node_modules/next/dist/bin/next"), "build"], {
      cwd: target, env: { ...environment, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", STACK127_BUILD_TARGET: "frontend", STACK127_BUILD_SHA: sha },
      maxBuffer: 32 * 1024 * 1024,
    }).then(result => console.log(result.stdout)).catch(error => {
      console.error(error.stdout ?? ""); console.error(error.stderr ?? ""); throw new Error("Static frontend build failed.");
    });
    await run(process.execPath, [path.join(process.cwd(), "scripts/stack127/check-static-routes.mjs"), "--strict"], {
      cwd: target, env: { ...environment, STACK127_TEST_DIST_DIR: path.join(target, ".next") }, maxBuffer: 8 * 1024 * 1024,
    }).then(result => console.log(result.stdout));
    if (await revisions() !== before) throw new Error("Content changed during the static build. Retry with the current content.");
    const exported = path.join(target, "out");
    for (const page of pages) {
      const html = await readFile(path.join(exported, page.slug ? `${page.slug}.html` : "index.html"), "utf8");
      inspectIndexingHtml(html,page,canonicalOrigin);
      if (!html.includes('name="stack127-content-revision"')) throw new Error(`Publication metadata missing: ${page.slug}`);
      if (!html.includes(`content="${new Date(page.revision).toISOString()}"`)) throw new Error(`Stale exported registry metadata: ${page.slug}`);
    }
    inspectSitemap(await readFile(path.join(exported,'sitemap.xml'),'utf8'),indexingPages,canonicalOrigin);
    await writeFile(path.join(exported, "_headers"), staticHeaders(sha));
    await writeFile(path.join(exported, "_redirects"), staticRedirects(redirects));
    await writeFile(path.join(exported, "frontend-release.json"), JSON.stringify({ sha, pages: pages.length, builtAt: new Date().toISOString() }) + "\n");
    const limits = await inspectAssets(exported);
    await assertNoPrivateCredentials(exported, environment);
    const resolvedOutput = path.resolve(output);
    await cp(exported, resolvedOutput, { recursive: true, errorOnExist: true, force: false });
    console.log(JSON.stringify({ frontend: resolvedOutput, sha, pages: pages.length, ...limits }));
    return { directory: resolvedOutput, sha, pages: pages.length, ...limits };
  } finally {
    await pool.end();
    await rm(target, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const position = process.argv.indexOf("--output");
  await buildFrontend({ output: position >= 0 ? process.argv[position + 1] : undefined });
}

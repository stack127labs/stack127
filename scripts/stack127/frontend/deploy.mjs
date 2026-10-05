import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { inspectAssets } from "./assets.mjs";
import { activateFrontend, deactivateFrontend, cloudflare, frontendService } from "./cloudflare.mjs";

const run = promisify(execFile);

export async function verifyFrontend(site, sha, { fetchImplementation = fetch } = {}) {
  for (const route of ["/", "/robots.txt", "/sitemap.xml", "/frontend-release.json"]) {
    const response = await fetchImplementation(`${site}${route}`, { signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    if (response.status !== 200 || response.headers.get("x-stack127-frontend-sha") !== sha) throw new Error(`Static frontend verification failed: ${route}`);
    if (route === "/frontend-release.json" && JSON.parse(body).sha !== sha) throw new Error("Frontend release differs from the expected commit.");
    if (route === "/sitemap.xml" && !body.includes("<urlset")) throw new Error("Static sitemap is invalid.");
    if (route === "/robots.txt" && !body.includes("Sitemap:")) throw new Error("Static robots file is invalid.");
    if (route === "/" && !body.includes("<main")) throw new Error("Static homepage is invalid.");
  }
  const missing = await fetchImplementation(`${site}/stack127-static-missing-${sha.slice(0, 12)}`, { signal: AbortSignal.timeout(20000) });
  if (missing.status !== 404) throw new Error("Static hosting must return a real 404 for missing routes.");
}

export async function deployFrontend({ directory, preview = false, activate = false, environment = process.env } = {}) {
  const limits = await inspectAssets(directory);
  if (!environment.CLOUDFLARE_ACCOUNT_ID || !environment.CLOUDFLARE_ZONE_ID || !environment.CLOUDFLARE_API_TOKEN) throw new Error("Cloudflare account, zone, and token are required.");
  const release = JSON.parse(await readFile(path.join(directory, "frontend-release.json"), "utf8"));
  if (!/^[a-f0-9]{40}$/.test(release.sha)) throw new Error("Frontend release SHA is invalid.");
  const name = preview ? `${frontendService}-preview` : frontendService;
  const temporary = await mkdtemp(path.join(os.tmpdir(), "stack127-cloudflare-"));
  try {
    const config = path.join(temporary, "wrangler.json");
    // No `main`, bindings, or run_worker_first: assets are served without code.
    await writeFile(config, JSON.stringify({ name, account_id: environment.CLOUDFLARE_ACCOUNT_ID, compatibility_date: "2026-10-05", workers_dev: preview,
      assets: { directory: path.resolve(directory), html_handling: "drop-trailing-slash", not_found_handling: "404-page" } }));
    const command = path.resolve("node_modules/wrangler/bin/wrangler.js");
    const result = await run(process.execPath, [command, "deploy", "--config", config], { env: environment, maxBuffer: 8 * 1024 * 1024 });
    console.log(result.stdout);
    if (preview) {
      const subdomain = await cloudflare(`/accounts/${environment.CLOUDFLARE_ACCOUNT_ID}/workers/subdomain`, { environment });
      const site = `https://${name}.${subdomain.subdomain}.workers.dev`;
      await verifyFrontend(site, release.sha);
      console.log(JSON.stringify({ preview: site, sha: release.sha, ...limits }));
      return { site, sha: release.sha };
    }
    if (activate) await activateFrontend({ environment });
    await verifyFrontend("https://stack127.com", release.sha);
    console.log(JSON.stringify({ deployed: true, sha: release.sha, ...limits }));
    return { site: "https://stack127.com", sha: release.sha };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  if (process.argv.includes("--rollback-to-origin")) {
    await deactivateFrontend();
    console.log("Frontend traffic now uses the retained OVH application.");
  } else {
    const position = process.argv.indexOf("--directory");
    if (position < 0 || !process.argv[position + 1]) throw new Error("--directory is required.");
    await deployFrontend({ directory: process.argv[position + 1], preview: process.argv.includes("--preview"), activate: process.argv.includes("--activate") });
  }
}

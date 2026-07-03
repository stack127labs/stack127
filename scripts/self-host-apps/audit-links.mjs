#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const linkFields = ["website_url", "repository_url", "docs_url", "install_docs_url", "docker_url", "publisher_url"];
const blockedStatuses = new Set([403, 429]);

async function checkUrl(url) {
  if (!url) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { ok: false, status: "error", finalUrl: url, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);

  await withClient(async (client) => {
    const result = await client.query(
      `
        select slug, ${linkFields.join(", ")}
        from public.self_host_apps
        order by slug
        limit $1
      `,
      [limit],
    );

    let failures = 0;
    for (const row of result.rows) {
      for (const field of linkFields) {
        const checked = await checkUrl(row[field]);
        if (!checked) continue;
        const label = `${row.slug}.${field}`;
        if (checked.ok) {
          console.log(`ok ${label} ${checked.status} ${checked.finalUrl}`);
        } else if (blockedStatuses.has(checked.status)) {
          console.warn(`blocked ${label} ${checked.status} ${checked.finalUrl}`);
        } else {
          failures += 1;
          console.error(`bad ${label} ${checked.status} ${checked.finalUrl}`);
        }
      }
    }

    if (failures > 0) throw new Error(`Link audit found ${failures} failing URL(s).`);
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

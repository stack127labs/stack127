#!/usr/bin/env node

import sharp from "sharp";

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import {
  contentDigest,
  isManagedMediaUrl,
  mediaObjectPath,
  uploadMediaObject,
  verifyMediaObject,
} from "../stack127/media/storage.mjs";

function githubOwnerAvatar(row) {
  if (!row.source_code_url) return null;
  try {
    const url = new URL(row.source_code_url);
    if (url.hostname !== "github.com") return null;
    const owner = url.pathname.split("/").filter(Boolean)[0];
    return owner ? `https://github.com/${owner}.png?size=256` : null;
  } catch {
    return null;
  }
}

async function fetchIcon(url) {
  const response = await fetch(url, {
    headers: {
      accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8",
      "user-agent": "stack127-icon-integrity",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`source image returned ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function normalizedIcon(bytes) {
  return sharp(bytes, { density: 256 })
    .resize(256, 256, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: "contain",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function mapConcurrent(items, workerCount, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await callback(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, items.length || 1) }, () => worker()));
  return results;
}

async function repairIcon(client, row) {
  const candidates = [
    row.icon_source_url,
    !isManagedMediaUrl(row.icon_url) ? row.icon_url : null,
    githubOwnerAvatar(row),
  ].filter((url, index, values) => url?.startsWith("http") && values.indexOf(url) === index);
  if (candidates.length === 0) throw new Error("no usable icon source URL");
  let png;
  let lastError;
  for (const sourceUrl of candidates) {
    try {
      png = await normalizedIcon(await fetchIcon(sourceUrl));
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!png) throw lastError ?? new Error("no usable icon source URL");
  const objectPath = mediaObjectPath({
    directory: "self-host-apps",
    digest: contentDigest(png),
    extension: "png",
    kind: "icons",
    slug: row.slug,
  });
  const iconUrl = await uploadMediaObject({ bytes: png, contentType: "image/png", objectPath });
  await verifyMediaObject(iconUrl);
  await client.query(
    `update public.self_host_apps set icon_url = $2, updated_at = now() where id = $1 and icon_url is distinct from $2`,
    [row.id, iconUrl],
  );
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const fix = Boolean(args.fix);
  const workers = Math.max(1, Math.min(numberArg(args, "workers", 24), 32));

  await withClient(async (client) => {
    const result = await client.query(
      `
        select id, slug, name, icon_url, icon_source_url, source_code_url
        from public.self_host_apps
        where published = true and self_hosting_status = 'self_hostable'
        order by slug
        limit $1
      `,
      [limit],
    );

    const issues = [];
    let checked = 0;
    await mapConcurrent(result.rows, workers, async (row) => {
      const managed = isManagedMediaUrl(row.icon_url, { directory: "self-host-apps", kind: "icons" });
      let issue = managed ? null : "icon_not_managed";
      if (managed) {
        try {
          await verifyMediaObject(row.icon_url);
        } catch {
          issue = "icon_unreachable";
        }
      }
      if (issue && fix) {
        try {
          await repairIcon(client, row);
          issue = null;
        } catch (error) {
          issues.push({ slug: row.slug, issue, repair_error: error.message });
        }
      } else if (issue) {
        issues.push({ slug: row.slug, issue });
      }
      checked += 1;
      if (checked % 100 === 0) console.log(`checked ${checked}/${result.rows.length}`);
    });

    console.log(JSON.stringify({
      checked,
      issue_count: issues.length,
      issue_rows: issues.slice(0, numberArg(args, "show", 50)),
    }, null, 2));
    if (issues.length > 0) process.exitCode = 1;
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});

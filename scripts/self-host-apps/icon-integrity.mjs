#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const appIconDir = path.join(process.cwd(), "public", "app-icons");

function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  );
}

function localIconPath(iconUrl) {
  if (!iconUrl?.startsWith("/app-icons/")) return null;
  return path.join(process.cwd(), "public", iconUrl);
}

async function convertToPng(inputFile, outputFile) {
  await sharp(inputFile, { density: 256 })
    .resize(256, 256, {
      fit: "contain",
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toFile(outputFile);
}

async function fetchIcon(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8",
      "User-Agent": "stack127-icon-cache",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

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

function inspectIcon(row) {
  const issues = [];
  if (!row.icon_url) {
    issues.push("missing_icon_url");
    return { issues };
  }
  if (!row.icon_url.startsWith("/app-icons/")) {
    issues.push("remote_icon");
    return { issues };
  }

  const file = localIconPath(row.icon_url);
  if (!existsSync(file)) {
    issues.push("missing_local_file");
    return { issues, file };
  }

  const stat = statSync(file);
  if (stat.size < 200) issues.push("tiny_file");

  const buffer = readFileSync(file);
  if (!isPng(buffer)) issues.push("not_png");

  return { issues, file, size: stat.size };
}

async function writeFetchedIcon(client, row, url) {
  const target = path.join(appIconDir, `${row.slug}.png`);
  const tempSource = path.join("/tmp", `stack127-${row.slug}-${Date.now()}.icon`);
  const tempPng = path.join("/tmp", `stack127-${row.slug}-${Date.now()}.png`);

  const buffer = await fetchIcon(url);
  writeFileSync(tempSource, buffer);

  if (isPng(buffer)) {
    renameSync(tempSource, target);
  } else {
    await convertToPng(tempSource, tempPng);
    renameSync(tempPng, target);
  }

  await client.query(
    `
      update public.self_host_apps
      set icon_url = $2, icon_source_url = coalesce(icon_source_url, $3), updated_at = now()
      where slug = $1
    `,
    [row.slug, `/app-icons/${row.slug}.png`, url],
  );
}

async function cacheRemoteIcon(client, row) {
  await writeFetchedIcon(client, row, row.icon_url);
}

async function refreshTinyIcon(client, row) {
  const avatarUrl = githubOwnerAvatar(row);
  if (!avatarUrl) throw new Error("missing GitHub owner avatar fallback");
  await writeFetchedIcon(client, row, avatarUrl);
}

async function fixLocalIcon(row) {
  const file = localIconPath(row.icon_url);
  if (!file) throw new Error("not a local icon path");
  const tempPng = path.join("/tmp", `stack127-${row.slug}-${Date.now()}.png`);
  await convertToPng(file, tempPng);
  renameSync(tempPng, file);
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const fix = Boolean(args.fix);
  const cacheRemote = Boolean(args["cache-remote"]);
  const fixLocal = Boolean(args["fix-local"]);

  mkdirSync(appIconDir, { recursive: true });

  await withClient(async (client) => {
    const result = await client.query(
      `
        select slug, name, icon_url, source_code_url
        from public.self_host_apps
        where published = true
          and self_hosting_status = 'self_hostable'
        order by slug
        limit $1
      `,
      [limit],
    );

    const rows = [];
    const counts = {};
    for (const row of result.rows) {
      const inspected = inspectIcon(row);
      if (inspected.issues.length === 0) continue;

      for (const issue of inspected.issues) counts[issue] = (counts[issue] ?? 0) + 1;
      rows.push({ slug: row.slug, icon_url: row.icon_url, issues: inspected.issues, size: inspected.size ?? null });

      if (fix && cacheRemote && inspected.issues.includes("remote_icon")) {
        try {
          await cacheRemoteIcon(client, row);
          console.log(`cached ${row.slug}`);
        } catch (error) {
          console.warn(`warning ${row.slug}: ${error.message}`);
        }
      }

      if (fix && fixLocal && inspected.issues.includes("not_png")) {
        try {
          await fixLocalIcon(row);
          console.log(`converted ${row.slug}`);
        } catch (error) {
          console.warn(`warning ${row.slug}: ${error.message}`);
        }
      }

      if (fix && args["refresh-tiny"] && inspected.issues.includes("tiny_file")) {
        try {
          await refreshTinyIcon(client, row);
          console.log(`refreshed-tiny ${row.slug}`);
        } catch (error) {
          console.warn(`warning ${row.slug}: ${error.message}`);
        }
      }
    }

    console.log(JSON.stringify({
      checked: result.rows.length,
      issue_counts: Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      issue_rows: rows.slice(0, numberArg(args, "show", 50)),
    }, null, 2));
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});

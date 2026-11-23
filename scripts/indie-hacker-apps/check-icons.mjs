#!/usr/bin/env node
// Checks the app icons for indie hacker apps.
// Usage: node scripts/indie-hacker-apps/check-icons.mjs [category] [--missing] [--warnings]
//
// Errors: no icon, no source record, wrong size, record doesn't match the PNG.
// Warnings (listed with --warnings): icon hosted off the app's own domain, same image as another app.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const showMissing = process.argv.includes("--missing");
const showWarnings = process.argv.includes("--warnings");

// Hosts that serve official brand assets for many companies.
const ASSET_HOSTS = [
  "framerusercontent.com", "website-files.com", "webflow.com", "cdn.prod.website-files.com", "ctfassets.net", "cloudfront.net",
  "githubusercontent.com", "github.com", "githubassets.com", "mzstatic.com", "googleusercontent.com", "gstatic.com", "ggpht.com",
  "wp.com", "wordpress.com", "squarespace-cdn.com", "wixstatic.com", "imgix.net", "cloudinary.com", "sanity.io", "storyblok.com",
  "hubspotusercontent", "hs-sites.com", "prismic.io", "contentful.com", "akamaized.net", "awsstatic.com", "media-amazon.com",
  "microsoft.com", "azureedge.net", "unpkg.com", "jsdelivr.net", "notion.so", "notion.site", "gitbook.io", "readme.io",
];
const base = (host) => host.replace(/^www\./, "").split(".").slice(-2).join(".");
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

let ok = 0, bad = 0, missing = 0;
const warnings = [];
const seen = new Map();
for (const category of config.categories.filter((c) => !args[0] || c.slug === args[0] || c.research_dir === args[0])) {
  const dir = path.join(root, "dev-space/indie-hacker-apps", category.research_dir);
  const slugs = readdirSync(path.join(dir, "cards")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort()
    .filter((s) => !args[1] || s === args[1]);
  for (const slug of slugs) {
    const pngPath = path.join(root, "public/indie-hacker-apps/icons", category.slug, `${slug}.png`);
    const recordPath = path.join(dir, "icons", `${slug}.json`);
    if (!existsSync(pngPath) && !existsSync(recordPath)) { missing += 1; if (showMissing || args[1]) console.log(`MISSING ${category.slug}/${slug}`); continue; }
    const errors = [];
    if (!existsSync(pngPath)) errors.push("no PNG");
    if (!existsSync(recordPath)) errors.push("no source record");
    let record;
    if (existsSync(recordPath)) {
      record = JSON.parse(readFileSync(recordPath, "utf8"));
      if (!/^https?:\/\//.test(record.source_page ?? "")) errors.push("source_page missing");
      if (!record.kind) errors.push("kind missing");
    }
    if (existsSync(pngPath)) {
      const png = readFileSync(pngPath);
      const meta = await sharp(png).metadata();
      if (meta.width !== 128 || meta.height !== 128) errors.push(`size ${meta.width}×${meta.height}, expected 128×128`);
      const digest = createHash("sha256").update(png).digest("hex");
      if (record && record.sha256 !== digest) errors.push("PNG was changed after its source record was written; save it again with save-icon.mjs");
      // Icons sit on a white tile; a mostly white mark on a transparent background would vanish.
      const { data, info } = await sharp(png).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
      let opaque = 0, light = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] < 128) continue;
        opaque += 1;
        if (data[i] > 225 && data[i + 1] > 225 && data[i + 2] > 225) light += 1;
      }
      const transparent = 1 - opaque / (info.width * info.height);
      if (opaque && light / opaque > 0.85 && transparent > 0.2) warnings.push(`LIGHT-ON-WHITE ${category.slug}/${slug}: mostly white mark on a transparent background; it will vanish on the white tile`);
      const key = digest;
      if (seen.has(key)) warnings.push(`DUPLICATE ${category.slug}/${slug} has the same image as ${seen.get(key)}`);
      else seen.set(key, `${category.slug}/${slug}`);
    }
    if (record) {
      const official = base(host(record.official_url));
      const sourceHosts = [record.source_host, host(record.source_page)].filter(Boolean);
      const onOfficial = sourceHosts.some((h) => base(h) === official);
      const onAssetHost = sourceHosts.some((h) => ASSET_HOSTS.some((a) => h.endsWith(a)));
      if (!onOfficial) warnings.push(`OFF-DOMAIN ${category.slug}/${slug}: icon from ${record.source_host || "?"} via ${host(record.source_page)}, official site ${host(record.official_url)}${onAssetHost ? " (known asset host)" : ""}`);
    }
    if (errors.length) { bad += 1; console.log(`FAIL ${category.slug}/${slug}\n  - ${errors.join("\n  - ")}`); }
    else ok += 1;
  }
}
if (showWarnings) for (const w of warnings) console.log(w);
console.log(`icons ok ${ok}, failing ${bad}, missing ${missing}, warnings ${warnings.length}`);
process.exit(bad ? 1 : 0);

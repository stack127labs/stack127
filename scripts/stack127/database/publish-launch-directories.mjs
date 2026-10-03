#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { pathToFileURL } from "node:url";
import { parseArgs, printResult, runMutation } from "../tool-pages/lib.mjs";
import { launchDirectoryDate, launchDirectorySources, latestLaunchEvidenceDate } from "../../../lib/launch-directories-data.ts";

const cover = "/launch-directories/launch-directories-cover.jpg";

export function validateLaunchPublication(records) {
  const visible = records.filter((record) => record.is_published);
  if (visible.length !== 165) throw new Error(`Expected 165 public listings, found ${visible.length}`);
  for (const row of visible) {
    if (row.categories?.includes("community-posts")) throw new Error(`Community post cannot publish: ${row.slug}`);
    for (const field of ["slug", "name", "website_url", "summary", "best_for", "cost_label", "review_time_label", "link_type_label", "eligibility_label"]) {
      if (typeof row[field] !== "string" || !row[field].trim()) throw new Error(`Missing ${field} for ${row.slug}`);
    }
    if (!launchDirectorySources(null, [row.website_url]).length) throw new Error(`Invalid website URL for ${row.slug}`);
    if (!["verified", "unavailable", "not_found"].includes(row.submission_status)
      || (row.submission_status === "verified") !== Boolean(row.submit_url)
      || (row.submit_url && !launchDirectorySources(null, [row.submit_url]).length)) throw new Error(`Invalid submission destination for ${row.slug}`);
    const checked = launchDirectoryDate(row.checked_on);
    const newest = latestLaunchEvidenceDate(row.evidence);
    if (!checked || (newest && checked < newest)) throw new Error(`Invalid record check date for ${row.slug}`);
    if (!launchDirectorySources(row.evidence, row.sources).length) throw new Error(`No usable public sources for ${row.slug}`);
  }
  return visible.length;
}

async function main() {
  const args = parseArgs();
  if (args.publish !== undefined && args.publish !== true) throw new Error("--publish is a flag");
  const image = await sharp(await readFile(`public${cover}`)).metadata();
  if (image.format !== "jpeg" || image.width !== 1200 || image.height !== 675) {
    throw new Error("The launch directory cover must be a 1200 by 675 JPEG");
  }

  printResult(await runMutation(args, async (client) => {
    const { rows } = await client.query("select * from public.stack127_pages where slug = $1 for update", ["launch-directories"]);
    const page = rows[0];
    if (!page || page.page_family !== "catalog") throw new Error("Launch directory registry entry is missing or has the wrong family");
    const records = (await client.query("select to_jsonb(directory) as record from public.launch_directories directory for share")).rows.map((row) => row.record);
    const count = args.publish ? validateLaunchPublication(records) : records.filter((row) => row.is_published).length;
    const publish = Boolean(args.publish || page.is_published);
    const changed = page.cover_image_url !== cover || page.page_type !== "CollectionPage"
      || page.is_published !== publish || (publish && !page.published_at);
    if (changed) await client.query(`update public.stack127_pages
      set cover_image_url = $2, page_type = 'CollectionPage', is_published = $3,
        published_at = case when $3 then coalesce(published_at, now()) else published_at end,
        updated_at = now()
      where slug = $1`, ["launch-directories", cover, publish]);
    return { slug: page.slug, count, changed, is_published: publish, cover_image_url: cover, page_type: "CollectionPage" };
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

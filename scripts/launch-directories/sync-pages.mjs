#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { runMutation, printResult } from "../stack127/tool-pages/lib.mjs";
import { insertDirectoryPageIfMissing } from "../stack127/directory-pages/lib.mjs";
import { developmentArgs } from "./import-facts.mjs";

export function launchMetaDescription(summary) {
  const words = summary.trim().split(/\s+/u);
  let result = "";
  for (const word of words) {
    const next = result ? `${result} ${word}` : word;
    if ([...next].length > 155) break;
    result = next;
  }
  if (!result) throw new Error("Directory summary needs a word within 155 characters");
  return result;
}
const escapeTitle = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export function launchChildPage(directory) {
  return {
    slug: `launch-directories/${directory.slug}`, label: directory.name,
    title: `<mark>${escapeTitle(directory.name)}</mark>`,
    meta_title: `${directory.name}: cost, link type, and review time`,
    meta_description: launchMetaDescription(directory.summary),
  };
}
const comparePage = {
  slug: "launch-directories/compare", label: "Compare", title: "Compare <mark>launch directories</mark>",
  meta_title: "Compare launch directories side by side",
  meta_description: "Put up to three launch directories side by side and see what each costs, how long review takes, and what link you get.",
};

/** Existing copy/publication choices stay intact. Retired children are only unpublished,
 * never deleted or automatically republished. A later editorial republish is explicit. */
export async function syncLaunchPages(client) {
  const parent = (await client.query("select page_family,is_published from public.stack127_pages where slug='launch-directories' for update")).rows[0];
  if (parent?.page_family !== "directory" || !parent.is_published) throw new Error("Publish the launch-directories parent directory before syncing children");
  const { rows: directories } = await client.query("select slug,name,summary,is_published from public.launch_directories order by slug for share");
  if (directories.some(directory => directory.slug === "compare")) throw new Error("Directory slug compare is reserved for the comparison page");
  const published = directories.filter(directory => directory.is_published);
  const pages = [...published.map(launchChildPage), comparePage];
  const desiredSlugs = new Set(pages.map(page => page.slug));
  const existing = (await client.query(`select p.id,p.slug,p.page_family,p.is_published,
    exists(select 1 from public.stack127_directory_pages d where d.page_id=p.id) has_directory
    from public.stack127_pages p where p.slug like 'launch-directories/%' order by p.slug for update of p`)).rows;
  const bySlug = new Map(existing.map(page => [page.slug, page]));
  for (const page of existing) if (page.page_family !== "directory") throw new Error(`Wrong page family for ${page.slug}`);
  const inserted = await client.query(`insert into public.stack127_pages
    (slug,page_family,label,meta_title,meta_description,is_published,is_indexable,page_type)
    select slug,'directory',label,meta_title,meta_description,false,false,'WebPage'
    from jsonb_to_recordset($1::jsonb) p(slug text,label text,meta_title text,meta_description text)
    on conflict(slug) do nothing returning id,slug`, [JSON.stringify(pages)]);
  // Lock and inspect conflicts again in case another writer inserted a row meanwhile.
  const current = (await client.query(`select p.id,p.slug,p.page_family,
    exists(select 1 from public.stack127_directory_pages d where d.page_id=p.id) has_directory
    from public.stack127_pages p where p.slug=any($1::text[]) order by p.slug for update of p`, [[...desiredSlugs]])).rows;
  const currentBySlug = new Map(current.map(page => [page.slug, page]));
  let directoryInserted = 0;
  for (const page of pages) {
    const row = currentBySlug.get(page.slug);
    if (row?.page_family !== "directory") throw new Error(`Wrong page family for ${page.slug}`);
    if (!row.has_directory) directoryInserted += await insertDirectoryPageIfMissing(client, { ...page, card_name: "", card_description: "" });
  }
  // Publish new pages last, after their family rows exist. Existing drafts stay drafts.
  const newlyPublished = await client.query(`update public.stack127_pages
    set is_published=true,published_at=coalesce(published_at,now()),updated_at=now()
    where id=any($1::bigint[]) and not is_published`, [inserted.rows.map(row => row.id)]);
  const retiredIds = existing.filter(page => !desiredSlugs.has(page.slug) && page.is_published).map(page => page.id);
  const retired = await client.query(`update public.stack127_pages
    set is_published=false,published_at=null,updated_at=null where id=any($1::bigint[]) and is_published`, [retiredIds]);
  // Include retired rows as well: purging their old URLs must still replace stale HTML.
  const cacheSlugs = [...new Set([...desiredSlugs, ...bySlug.keys()])].sort();
  return { directories: published.length, pages: pages.length, registry_inserted: inserted.rowCount,
    directory_inserted: directoryInserted, published: newlyPublished.rowCount, unpublished: retired.rowCount,
    existing_preserved: pages.length - inserted.rowCount, cacheSlugs };
}

async function main() {
  const args = developmentArgs();
  const { cacheSlugs, ...result } = await runMutation(args, syncLaunchPages);
  if (args.apply) {
    const file = new URL("./page-slugs.mjs", import.meta.url);
    const source = `// Generated by sync-pages.mjs --apply. Includes retired paths for cache removal.\nexport const launchDirectoryPageSlugs = ${JSON.stringify(cacheSlugs, null, 2)};\n`;
    let previous = "";
    try { previous = readFileSync(file, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
    if (previous !== source) writeFileSync(file, source);
  }
  printResult({ ...result, cache_paths: cacheSlugs.length });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main().catch(error => { console.error(error.message); process.exitCode = 1; });

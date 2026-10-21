#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import pg from "pg";
import { parseArgs } from "node:util";
import { resolveDatabaseUrl } from "../stack127/tool-pages/lib.mjs";

// Read development only. Publication always goes through the directory publisher.
const { values } = parseArgs({ options: { out: { type: "string" }, "parent-out": { type: "string" } } });
if (!values.out) throw new Error("--out is required (a new file)");
const pool = new pg.Pool({ connectionString: resolveDatabaseUrl({ environment: "development" }), max: 1, connectionTimeoutMillis: 15000 });
try {
  const { rows } = await pool.query(`select page.slug,
    jsonb_build_object('label',page.label,'meta_title',page.meta_title,'meta_description',page.meta_description,
      'is_published',true,'is_indexable',false,'cover_image_url',page.cover_image_url,'page_type',page.page_type,'sitemap_priority',page.sitemap_priority) registry,
    jsonb_build_object('title',content.title,'card_name',content.card_name,'card_description',content.card_description,
      'card_icon_key',content.card_icon_key,'card_art_key',content.card_art_key) content
    from public.stack127_pages page join public.stack127_directory_pages content on content.page_id=page.id
    where page.page_family='directory' and page.is_published and not page.is_indexable
      and (page.slug='launch-directories/compare' or exists(
        select 1 from public.launch_directories directory where directory.is_published and page.slug='launch-directories/'||directory.slug))
    order by page.slug`);
  const count = Number((await pool.query("select count(*) count from public.launch_directories where is_published")).rows[0].count);
  if (rows.length !== count + 1 || !rows.some(row => row.slug === "launch-directories/compare")) throw new Error("Missing or indexable development children; review the registry before preparing a manifest");
  const pages = rows.map(row => {
    const compare = row.slug === "launch-directories/compare";
    return { ...row, family: "directory", source: "development", requirements: {
      route: `app/(site)/(directories)/launch-directories/${compare ? "compare" : "[slug]"}/page.tsx`,
      records: { kind: "database", checks: [{ name: compare ? "Published launch listings loaded" : "Published listing exists",
        sql_file: `scripts/launch-directories/${compare ? "published-records-ready.sql" : "child-record-ready.sql"}`,
        params: compare ? [] : [row.slug.split("/")[1]] }] },
      checks: [], assets: ["lib/launch-directories.ts"],
      smoke: [{ path: `/${row.slug}`, text: compare ? "Compare launch directories" : row.registry.label }],
    } };
  });
  await writeFile(values.out, JSON.stringify({ schema_version: 1, kind: "directories", pages }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  if (values["parent-out"]) {
    const parent = (await pool.query(`select
      jsonb_build_object('label',page.label,'meta_title',page.meta_title,'meta_description',page.meta_description,
        'is_published',true,'is_indexable',true,'cover_image_url',page.cover_image_url,'page_type',page.page_type,'sitemap_priority',page.sitemap_priority) registry,
      jsonb_build_object('title',content.title,'card_name',content.card_name,'card_description',content.card_description,
        'card_icon_key',content.card_icon_key,'card_art_key',content.card_art_key) content
      from public.stack127_pages page join public.stack127_directory_pages content on content.page_id=page.id
      where page.slug='launch-directories' and page.page_family='directory' and page.is_published`)).rows[0];
    if (!parent) throw new Error("Published parent page is missing");
    await writeFile(values["parent-out"], JSON.stringify({ schema_version: 1, kind: "directories", pages: [{
      slug: "launch-directories", family: "directory", source: "development", ...parent,
      touch_reason: "Rebuilt the directory, comparison facts, and submission guide",
      requirements: { route: "app/(site)/(directories)/launch-directories/page.tsx", assets: [], checks: [],
        records: { kind: "database", checks: [{ name: "Published launch listings loaded", sql_file: "scripts/launch-directories/published-records-ready.sql", params: [] }] },
        smoke: [{ path: "/launch-directories", text: "launch" }] },
    }] }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  }
  console.log(JSON.stringify({ manifest: values.out, children: count, compare: 1, published: true, is_indexable: false }));
} finally { await pool.end(); }

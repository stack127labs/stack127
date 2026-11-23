#!/usr/bin/env node
// Imports the indie hacker apps research into public.indie_hacker_apps and copies the
// 12 directory definitions into public.indie_hacker_app_directories.
//
// Reads, for each category in lib/indie-hacker-apps/categories.json:
//   dev-space/indie-hacker-apps/<research_dir>/apps/<slug>.md    research facts
//   dev-space/indie-hacker-apps/<research_dir>/cards/<slug>.json card values (checked by check-cards.mjs)
//   dev-space/indie-hacker-apps/status-changes.md                dated status events
//   public/indie-hacker-apps/icons/<category>/<slug>.png         icons
//
// Refuses to run when any card fails check-cards.mjs. Apps without a card are skipped.
// Rows for apps that no longer have a card are deleted. Only changed rows are written,
// so an identical re-import moves no page dates.
//
// Usage:
//   node scripts/indie-hacker-apps/import-apps.mjs                       preview on development, roll back
//   node scripts/indie-hacker-apps/import-apps.mjs --apply               save to development
//   node scripts/indie-hacker-apps/import-apps.mjs --environment production --apply --confirm stack127-production
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { checkCard } from "./check-cards.mjs";
import { parseArgs, printResult, runMutation } from "../stack127/tool-pages/lib.mjs";
import { appDirectories } from "../../lib/indie-hacker-apps/directories.ts";

const root = process.cwd();
const researchRoot = path.join(root, "dev-space/indie-hacker-apps");
const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));

const STATES = new Set(["confirmed", "not_published", "unclear", "conflicting", "not_applicable", "check_failed"]);
const DATE = /\b(20\d\d-\d\d-\d\d)\b/;

// Card cells and status fields also have useful facts. These say which panel section
// shows them. Headline cost fields (H) are shown by the cost table instead.
const panelPlace = {
  "payment-providers": { F02: "D3", F03: "D2", F19: "D1", F33: "D3", F39: "D5" },
  "hosting-and-deploy": { "02": "D5", "03": "D3", "05": "D1", "08": "D1", "16": "D3" },
  "databases-and-backend": { C02: "D3", C03: "D5", C04: "D5", C09: "D1", C13: "D1" },
  "error-monitoring": { C02: "D3", C03: "D5", C05: "D3", C08: "D1", U02: "D3", H03: "D5" },
  "customer-support": { F02: "D3", F06: "D1", F14: "D1", F17: "D3", F38: "D5" },
  "email-and-newsletters": { F02: "D3", F03: "D3", F07: "D1", F13: "D3", F22: "D3" },
  analytics: { F02: "D3", F06: "D3", F09: "D1", F21: "D4", F23: "D4" },
  auth: { F02: "D3", F03: "D5", F05: "D3", F09: "D1", F15: "D1" },
};

const clean = (text) => String(text ?? "")
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/\*\*|`/g, "")
  .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
  .replace(/\s+/g, " ")
  .trim();
const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const norm = (name) => name.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

// Fact tables differ by category: some put "Applies to", "Unit" or "Plan" columns before or
// after the state. Column positions come from each table's own header row.
function headerColumns(header) {
  const find = (re) => header.findIndex((name) => re.test(name));
  return { state: find(/^state$/i), source: find(/source url|^source$|^url$/i), checked: find(/^checked date$|^checked$/i) };
}

// Sources may be bare URLs or Markdown links, several per cell, split by <br>, ";" or spaces.
export const firstUrl = (cell) => (String(cell).match(/https?:\/\/[^\s;,|<>()\[\]]+/) ?? [""])[0].replace(/[.]+$/, "");
// A few files list one date per source ("2026-11-04; 2026-11-05"); use the latest.
export const latestDate = (cell) => (String(cell ?? "").match(/20\d\d-\d\d-\d\d/g) ?? []).sort().at(-1) ?? "";

export function readFacts(text) {
  const rows = [];
  let inFacts = true;
  let columns = null;
  for (const line of text.split("\n")) {
    // Facts tables sit under "## Facts" or topic headings; skip the cost, conflict and bookkeeping sections.
    if (line.startsWith("## ")) inFacts = !/^## (Cost|Conflicts|Field problems|Counts|Scope|Sources)/i.test(line);
    if (!line.startsWith("|")) { columns = null; continue; }
    if (!inFacts) continue;
    const c = cells(line);
    if (!columns && /^(field )?id$/i.test(c[0])) { columns = headerColumns(c); continue; }
    if (!/^[A-Z]?\d\d$/.test(c[0])) continue;
    let state = columns?.state >= 0 && STATES.has(c[columns.state]) ? columns.state : -1;
    if (state < 0) state = c.findIndex((value, i) => i > 1 && STATES.has(value));
    if (state < 0) continue;
    // Without a usable header, fall back to the first URL and date after the state.
    const url = columns?.source >= 0 ? firstUrl(c[columns.source] ?? "") : firstUrl(c.slice(state + 1).join(" | "));
    const checked = columns?.checked >= 0
      ? latestDate(c[columns.checked])
      : latestDate(c.slice(state + 1).find((cell) => /^20\d\d-\d\d-\d\d\b/.test(cell)));
    rows.push({ id: c[0], label: clean(c[1]), value: clean(c[2]), state: c[state], url, checked });
  }
  return rows;
}

const STATUS_SECTIONS = [
  [/^Rows marked `closing`/, "Closing", "warning"],
  [/^Rows marked `risk`/, "Risk", "warning"],
  [/^## Owner changes/, "New owner", "neutral"],
  [/^## Security incidents/, "Security incident", "neutral"],
  [/^## Regulator actions/, "Regulator action", "neutral"],
  [/^## Licence changes/, "Licence change", "neutral"],
  [/^## Big product, plan/, "Plan change", "neutral"],
];

export function readStatus(text) {
  const events = [];
  let current = null;
  let columns = null;
  for (const line of text.split("\n")) {
    const section = STATUS_SECTIONS.find(([re]) => re.test(line));
    if (section) { current = section; columns = null; continue; }
    if (/^## /.test(line)) { current = null; continue; }
    if (!current || !line.startsWith("|")) continue;
    const c = cells(line);
    if (c[0] === "App") { columns = c.map((x) => x.toLowerCase()); continue; }
    if (!columns || /^-+$/.test(c[0])) continue;
    const listIndex = columns.indexOf("list");
    const eventText = clean(c[c.length - 1]);
    events.push({
      app: clean(c[0]),
      lists: listIndex >= 0 ? c[listIndex].split(",").map((x) => x.trim()) : null,
      label: current[1],
      tone: current[2],
      text: eventText,
      date: (eventText.match(DATE) ?? [""])[0],
    });
  }
  return events;
}

function matchesApp(event, card, researchDir) {
  if (event.lists && !event.lists.includes(researchDir)) return false;
  const names = event.app.split("/").map(norm).filter(Boolean);
  const cardName = norm(card.name);
  const slugName = card.slug.replace(/-/g, " ");
  return names.some((n) => n === cardName || n === slugName || cardName.startsWith(`${n} `) || n.startsWith(`${cardName} `));
}

/** One table row from a card, its research facts, the status events and the icon. */
export function appRecord({ category, card, facts, statusEvents, fieldPlan, sectionTitles, hasIcon }) {
  const sections = Object.entries(sectionTitles).map(([key, title]) => ({ key, title, facts: [] }));
  let news = "";
  let checked = "";
  for (const fact of facts) {
    if (fact.checked > checked) checked = fact.checked;
    if (/news check/i.test(fact.label) || /^news check/i.test(fact.value)) { news = fact.value; continue; }
    const place = panelPlace[category.research_dir]?.[fact.id] ?? fieldPlan?.[fact.id]?.place;
    const section = sections.find((s) => s.key === place);
    if (!section || !fact.value) continue;
    section.facts.push({ label: fact.label, value: fact.value, state: fact.state, url: fact.url, checked: fact.checked });
  }
  const status = statusEvents
    .filter((event) => matchesApp(event, card, category.research_dir))
    .map(({ label, tone, text, date }) => ({ label, tone, text, date }))
    .sort((a, b) => b.date.localeCompare(a.date));
  // Only the card's own fields: job_check and any other research bookkeeping stay in the repo.
  return {
    category: category.slug,
    slug: card.slug,
    name: card.name,
    url: card.url,
    jobs: card.jobs,
    line: card.line,
    free_kind: card.free.kind,
    free_text: card.free.text ?? "",
    cells: card.cells ?? {},
    costs: card.costs ?? {},
    status,
    checked: checked || null,
    icon: hasIcon ? `/indie-hacker-apps/icons/${category.slug}/${card.slug}.png` : "",
    news,
    sections: sections.filter((s) => s.facts.length).map(({ title, facts: list }) => ({ title, facts: list })),
  };
}

/** Reads every category. Throws when any card fails the card checker. */
export function readResearch() {
  const config = readJson("lib/indie-hacker-apps/categories.json");
  const plan = readJson("scripts/indie-hacker-apps/field-plan.json");
  const statusEvents = readStatus(readFileSync(path.join(researchRoot, "status-changes.md"), "utf8"));
  const categories = [];
  const failures = [];
  for (const category of config.categories) {
    const dir = path.join(researchRoot, category.research_dir);
    const slugs = readdirSync(path.join(dir, "apps")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort();
    const records = [];
    const missing = [];
    for (const slug of slugs) {
      const result = checkCard(category, slug);
      if (result.missing) { missing.push(slug); continue; }
      if (result.errors.length) { failures.push(`${category.slug}/${slug}: ${result.errors.join("; ")}`); continue; }
      const card = JSON.parse(readFileSync(path.join(dir, "cards", `${slug}.json`), "utf8"));
      records.push(appRecord({
        category,
        card,
        facts: readFacts(readFileSync(path.join(dir, "apps", `${slug}.md`), "utf8")),
        statusEvents,
        fieldPlan: plan.fields[category.research_dir],
        sectionTitles: plan.sections,
        hasIcon: existsSync(path.join(root, "public/indie-hacker-apps/icons", category.slug, `${slug}.png`)),
      }));
    }
    categories.push({ slug: category.slug, jobs: category.jobs.map(([id]) => id), sets: Object.keys(category.sets), records, missing });
  }
  if (failures.length) {
    throw new Error(`${failures.length} card(s) fail check-cards.mjs. Fix them before importing:\n  ${failures.join("\n  ")}`);
  }
  return categories;
}

/** Every directory must point at a known category, jobs and cost sets. */
export function checkDirectories(categories, directories = appDirectories) {
  const slugs = new Set();
  for (const directory of directories) {
    if (slugs.has(directory.slug)) throw new Error(`Duplicate directory ${directory.slug}`);
    slugs.add(directory.slug);
    const category = categories.find((item) => item.slug === directory.category);
    if (!category) throw new Error(`Directory ${directory.slug}: unknown category ${directory.category}`);
    for (const job of directory.jobs) if (!category.jobs.includes(job)) throw new Error(`Directory ${directory.slug}: unknown job ${job}`);
    for (const set of directory.sets) if (!category.sets.includes(set)) throw new Error(`Directory ${directory.slug}: unknown cost set ${set}`);
  }
  return directories;
}

const APP_COLUMNS = ["category", "slug", "name", "url", "jobs", "line", "free_kind", "free_text", "cells", "costs", "status", "checked", "icon", "news", "sections"];
const BATCH = 40;

export async function importApps(client, categories, directories = appDirectories) {
  checkDirectories(categories, directories);
  // One writer at a time; readers keep reading the old rows until commit.
  await client.query("lock table public.indie_hacker_apps, public.indie_hacker_app_directories in share row exclusive mode");

  const directoryRows = directories.map((directory, index) => ({ slug: directory.slug, category: directory.category, jobs: directory.jobs, sets: directory.sets, position: index + 1 }));
  const directoryWrite = await client.query(`
    with input as (select * from jsonb_populate_recordset(null::public.indie_hacker_app_directories, $1::jsonb))
    insert into public.indie_hacker_app_directories as d (slug, category, jobs, sets, position)
    select slug, category, jobs, sets, position from input
    on conflict (slug) do update set category = excluded.category, jobs = excluded.jobs, sets = excluded.sets, position = excluded.position
    where (d.category, d.jobs, d.sets, d.position) is distinct from (excluded.category, excluded.jobs, excluded.sets, excluded.position)
    returning slug`, [JSON.stringify(directoryRows)]);
  const directoryDelete = await client.query("delete from public.indie_hacker_app_directories where not (slug = any($1::text[])) returning slug",
    [directories.map((directory) => directory.slug)]);

  const updateColumns = APP_COLUMNS.filter((column) => column !== "category" && column !== "slug");
  const perCategory = [];
  for (const category of categories) {
    let inserted = 0;
    let updated = 0;
    for (let start = 0; start < category.records.length; start += BATCH) {
      const batch = category.records.slice(start, start + BATCH);
      const result = await client.query(`
        insert into public.indie_hacker_apps as a (${APP_COLUMNS.join(", ")})
        select ${APP_COLUMNS.join(", ")} from jsonb_populate_recordset(null::public.indie_hacker_apps, $1::jsonb)
        on conflict (category, slug) do update set ${updateColumns.map((column) => `${column} = excluded.${column}`).join(", ")}
        where (${updateColumns.map((column) => `a.${column}`).join(", ")}) is distinct from (${updateColumns.map((column) => `excluded.${column}`).join(", ")})
        returning (xmax = 0) as inserted`, [JSON.stringify(batch)]);
      for (const row of result.rows) if (row.inserted) inserted += 1; else updated += 1;
    }
    const removed = await client.query("delete from public.indie_hacker_apps where category = $1 and not (slug = any($2::text[])) returning slug",
      [category.slug, category.records.map((record) => record.slug)]);
    perCategory.push({
      category: category.slug,
      apps: category.records.length,
      inserted,
      updated,
      unchanged: category.records.length - inserted - updated,
      deleted: removed.rows.map((row) => row.slug),
      without_card: category.missing.length,
      with_icon: category.records.filter((record) => record.icon).length,
    });
  }
  const orphaned = await client.query("delete from public.indie_hacker_apps where not (category = any($1::text[])) returning category, slug",
    [categories.map((category) => category.slug)]);

  const counts = await client.query(`
    select directory.slug, count(app.slug)::int as apps,
      count(app.slug) filter (where app.jobs[1] = any(directory.jobs))::int as main
    from public.indie_hacker_app_directories directory
    left join public.indie_hacker_apps app on app.category = directory.category and app.jobs && directory.jobs
    group by directory.slug, directory.position order by directory.position`);
  const total = await client.query("select count(*)::int as apps, count(distinct category)::int as categories from public.indie_hacker_apps");
  return {
    total: total.rows[0],
    categories: perCategory,
    directories: counts.rows,
    directory_rows_written: directoryWrite.rows.map((row) => row.slug),
    directory_rows_deleted: directoryDelete.rows.map((row) => row.slug),
    deleted_from_unknown_categories: orphaned.rows,
  };
}

async function main() {
  const args = parseArgs();
  for (const key of Object.keys(args)) {
    if (!["apply", "environment", "confirm"].includes(key)) throw new Error(`Unknown option --${key}`);
  }
  const categories = readResearch();
  printResult(await runMutation(args, (client) => importApps(client, categories)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

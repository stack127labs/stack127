#!/usr/bin/env node
// Builds the indie hacker apps page data from the research files.
//
// Reads, for each category in lib/indie-hacker-apps/categories.json:
//   dev-space/indie-hacker-apps/<research_dir>/apps/<slug>.md   research facts
//   dev-space/indie-hacker-apps/<research_dir>/cards/<slug>.json card values (checked by check-cards.mjs)
//   dev-space/indie-hacker-apps/status-changes.md               dated status events
// Writes lib/indie-hacker-apps/data/<category>.json.
//
// Only apps with a card that passes the checker are published. Run with --check to
// report without writing.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { checkCard } from "./check-cards.mjs";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const plan = JSON.parse(readFileSync(path.join(root, "scripts/indie-hacker-apps/field-plan.json"), "utf8"));
const researchRoot = path.join(root, "dev-space/indie-hacker-apps");
const outDir = path.join(root, "lib/indie-hacker-apps/data");

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
const firstUrl = (cell) => (String(cell).match(/https?:\/\/[^\s;,|<>()\[\]]+/) ?? [""])[0].replace(/[.]+$/, "");
// A few files list one date per source ("2026-11-04; 2026-11-05"); use the latest.
const latestDate = (cell) => (String(cell ?? "").match(/20\d\d-\d\d-\d\d/g) ?? []).sort().at(-1) ?? "";

function readFacts(file) {
  const rows = [];
  let inFacts = true;
  let columns = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
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

function readStatus() {
  const events = [];
  let current = null;
  let columns = null;
  for (const line of readFileSync(path.join(researchRoot, "status-changes.md"), "utf8").split("\n")) {
    const section = STATUS_SECTIONS.find(([re]) => re.test(line));
    if (section) { current = section; columns = null; continue; }
    if (/^## /.test(line)) { current = null; continue; }
    if (!current || !line.startsWith("|")) continue;
    const c = cells(line);
    if (c[0] === "App") { columns = c.map((x) => x.toLowerCase()); continue; }
    if (!columns || /^-+$/.test(c[0])) continue;
    const listIndex = columns.indexOf("list");
    const text = clean(c[c.length - 1]);
    events.push({
      app: clean(c[0]),
      lists: listIndex >= 0 ? c[listIndex].split(",").map((x) => x.trim()) : null,
      label: current[1],
      tone: current[2],
      text,
      date: (text.match(DATE) ?? [""])[0],
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

const statusEvents = readStatus();
const summary = [];
if (!checkOnly) mkdirSync(outDir, { recursive: true });

for (const category of config.categories) {
  const dir = path.join(researchRoot, category.research_dir);
  const fieldPlan = plan.fields[category.research_dir];
  const slugs = readdirSync(path.join(dir, "apps")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort();
  const apps = [];
  const skipped = [];
  for (const slug of slugs) {
    const result = checkCard(category, slug);
    if (result.missing || result.errors.length) { skipped.push(slug); continue; }
    const card = JSON.parse(readFileSync(path.join(dir, "cards", `${slug}.json`), "utf8"));
    const facts = readFacts(path.join(dir, "apps", `${slug}.md`));
    const sections = Object.entries(plan.sections).map(([key, title]) => ({ key, title, facts: [] }));
    let news = "";
    let checked = "";
    for (const fact of facts) {
      if (fact.checked > checked) checked = fact.checked;
      if (/news check/i.test(fact.label) || /^news check/i.test(fact.value)) { news = fact.value; continue; }
      const place = panelPlace[category.research_dir][fact.id] ?? fieldPlan[fact.id]?.place;
      const section = sections.find((s) => s.key === place);
      if (!section || !fact.value) continue;
      section.facts.push({ label: fact.label, value: fact.value, state: fact.state, url: fact.url, checked: fact.checked });
    }
    const status = statusEvents
      .filter((event) => matchesApp(event, card, category.research_dir))
      .map(({ label, tone, text, date }) => ({ label, tone, text, date }))
      .sort((a, b) => b.date.localeCompare(a.date));
    // Icons are saved by save-icon.mjs; an app without one shows a letter tile.
    const iconFile = path.join(root, "public/indie-hacker-apps/icons", category.slug, `${slug}.png`);
    const icon = existsSync(iconFile) ? `/indie-hacker-apps/icons/${category.slug}/${slug}.png` : "";
    apps.push({ ...card, icon, status, checked, news, sections: sections.filter((s) => s.facts.length).map(({ title, facts }) => ({ title, facts })) });
  }
  const changes = [];
  for (const app of apps) for (const s of app.status) changes.push({ app: app.name, slug: app.slug, ...s });
  changes.sort((a, b) => b.date.localeCompare(a.date));
  const data = { slug: category.slug, apps, changes };
  const json = JSON.stringify(data);
  const facts = apps.flatMap((app) => app.sections.flatMap((section) => section.facts));
  const noSource = facts.filter((fact) => !fact.url).length;
  const withIcon = apps.filter((app) => app.icon).length;
  summary.push(`${category.slug}: ${apps.length} published, ${withIcon} with icons, ${skipped.length} without a passing card, ${facts.length} facts, ${noSource} without a source link, ${(json.length / 1024).toFixed(0)} KB`);
  if (!checkOnly) writeFileSync(path.join(outDir, `${category.slug}.json`), `${json}\n`);
}
console.log(summary.join("\n"));

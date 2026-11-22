#!/usr/bin/env node
// Checks the card files for indie hacker apps: one JSON file per researched app,
// at dev-space/indie-hacker-apps/<research_dir>/cards/<slug>.json.
// Usage: node scripts/indie-hacker-apps/check-cards.mjs [category-slug] [app-slug] [--missing] [--unchecked]
// --unchecked lists cards whose jobs have not had the job check yet (no job_check key).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const researchRoot = path.join(root, "dev-space/indie-hacker-apps");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const showMissing = process.argv.includes("--missing");
const showUnchecked = process.argv.includes("--unchecked");

const JOB_STATES = ["confirmed", "not_published", "unclear", "conflicting", "not_applicable", "check_failed"];
const FREE_KINDS = ["free", "trial", "credits", "selfhost", "none"];
const FIXED = {
  selfhost: ["Yes", "No"],
  api: ["Yes", "No"],
  newsletters: ["Yes", "No", "Unknown"],
  cookieless: ["Yes", "No", "Optional", "Unknown"],
};

const numbers = (text) => (String(text).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) ?? []);

export function checkCard(category, slug) {
  const errors = [];
  const dir = path.join(researchRoot, category.research_dir);
  const file = path.join(dir, "cards", `${slug}.json`);
  if (!existsSync(file)) return { missing: true, errors: ["no card file"] };
  let card;
  try { card = JSON.parse(readFileSync(file, "utf8")); } catch (e) { return { errors: [`invalid JSON: ${e.message}`] }; }
  const source = readFileSync(path.join(dir, "apps", `${slug}.md`), "utf8").replace(/(\d),(\d{3})/g, "$1$2");
  const allowedKeys = ["slug", "name", "url", "jobs", "job_check", "line", "free", "cells", "costs"];
  for (const key of Object.keys(card)) if (!allowedKeys.includes(key)) errors.push(`unknown key ${key}`);
  if (card.slug !== slug) errors.push(`slug must be "${slug}"`);
  if (!card.name || typeof card.name !== "string") errors.push("name missing");
  if (!/^https?:\/\//.test(card.url ?? "")) errors.push("url must start with http");
  const jobIds = category.jobs.map((j) => j[0]);
  if (!Array.isArray(card.jobs) || !card.jobs.length) errors.push("jobs must be a non-empty list");
  else for (const j of card.jobs) if (!jobIds.includes(j)) errors.push(`unknown job ${j} (use ${jobIds.join(", ")})`);
  if (Array.isArray(card.jobs) && new Set(card.jobs).size !== card.jobs.length) errors.push("jobs has a duplicate");
  // job_check: { checked: "YYYY-MM-DD", evidence: { <job>: "<field ID>: why the research file shows this job" } }
  // The first job in `jobs` is the app's main job. Every job needs one evidence line, and nothing else may have one.
  if (card.job_check !== undefined) {
    const jc = card.job_check;
    if (!jc || typeof jc !== "object") errors.push("job_check must be an object");
    else {
      for (const key of Object.keys(jc)) if (!["checked", "evidence"].includes(key)) errors.push(`job_check: unknown key ${key}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(jc.checked ?? "")) errors.push("job_check.checked must be a YYYY-MM-DD date");
      const ev = jc.evidence ?? {};
      if (typeof ev !== "object") errors.push("job_check.evidence must be an object");
      else {
        for (const j of card.jobs ?? []) {
          const line = ev[j];
          if (typeof line !== "string" || !line.trim()) errors.push(`job_check.evidence.${j} missing`);
          else if (line.length > 200) errors.push(`job_check.evidence.${j} is ${line.length} chars (max 200)`);
          else if (!/^[A-Z]?\d{1,3}\.?\b|^[A-Z]\d{1,3}/.test(line.trim())) errors.push(`job_check.evidence.${j} must start with the research file's field ID, e.g. "F12: ..."`);
        }
        for (const key of Object.keys(ev)) if (!(card.jobs ?? []).includes(key)) errors.push(`job_check.evidence.${key} is not in jobs`);
      }
    }
  }
  if (typeof card.line !== "string" || !card.line.trim()) errors.push("line missing");
  else if (card.line.length > 90) errors.push(`line is ${card.line.length} chars (max 90)`);
  if (!card.free || !FREE_KINDS.includes(card.free.kind)) errors.push(`free.kind must be one of ${FREE_KINDS.join(", ")}`);
  else if (typeof card.free.text !== "string" || !card.free.text.trim()) errors.push("free.text missing");
  else if (card.free.text.length > 80) errors.push(`free.text is ${card.free.text.length} chars (max 80)`);
  const cellKeys = category.cells.map((c) => c[0]);
  const cells = card.cells ?? {};
  for (const key of Object.keys(cells)) if (!cellKeys.includes(key)) errors.push(`unknown cell ${key}`);
  for (const key of cellKeys) {
    const v = cells[key];
    if (typeof v !== "string" || !v.trim()) { errors.push(`cell ${key} missing`); continue; }
    if (v.length > 60) errors.push(`cell ${key} is ${v.length} chars (max 60)`);
    if (FIXED[key] && !FIXED[key].some((w) => v === w || v.startsWith(`${w} `) || v.startsWith(`${w},`) || v.startsWith(`${w};`) || v.startsWith(`${w} (`))) {
      errors.push(`cell ${key} must start with ${FIXED[key].join(" / ")}`);
    }
  }
  const costs = card.costs ?? {};
  for (const key of Object.keys(costs)) if (!category.sets[key]) errors.push(`unknown cost set ${key}`);
  for (const [setKey, set] of Object.entries(category.sets)) {
    const rows = costs[setKey];
    if (!Array.isArray(rows) || rows.length !== set.levels.length) { errors.push(`costs.${setKey} needs ${set.levels.length} rows (${set.levels.join(" | ")})`); continue; }
    rows.forEach((row, i) => {
      const at = `costs.${setKey}[${i}] (${set.levels[i]})`;
      if (!row || typeof row !== "object") { errors.push(`${at} missing`); return; }
      if (!JOB_STATES.includes(row.state)) errors.push(`${at} state must be one of ${JOB_STATES.join(", ")}`);
      if (typeof row.v !== "string" || !row.v.trim()) errors.push(`${at} v missing`);
      else if (row.v.length > 40) errors.push(`${at} v is ${row.v.length} chars (max 40)`);
      if (typeof row.plan !== "string") errors.push(`${at} plan must be a string`);
      if (typeof row.math !== "string" || !row.math.trim()) errors.push(`${at} math missing`);
      else if (row.math.length > 220) errors.push(`${at} math is ${row.math.length} chars (max 220)`);
      if (row.state === "not_applicable" && row.v !== "—") errors.push(`${at} not_applicable needs v "—"`);
      if (row.state !== "not_applicable" && typeof row.v === "string") {
        const missing = numbers(row.v).filter((n) => !source.includes(n) && !source.includes(n.replace(/\.0+$/, "")));
        if (missing.length && !(row.state === "unclear" && /[×x*+=]/.test(row.math))) {
          errors.push(`${at} number ${missing.join(", ")} is not in the research file; copy it exactly, or mark the row unclear and show the sum in math`);
        }
      }
    });
  }
  return { errors };
}

function slugsFor(category) {
  return readdirSync(path.join(researchRoot, category.research_dir, "apps")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort();
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (isMain) {
  const cats = config.categories.filter((c) => !args[0] || c.slug === args[0] || c.research_dir === args[0]);
  if (!cats.length) { console.error(`Unknown category ${args[0]}`); process.exit(2); }
  let bad = 0, ok = 0, missing = 0, unchecked = 0;
  for (const category of cats) {
    for (const slug of slugsFor(category).filter((s) => !args[1] || s === args[1])) {
      const result = checkCard(category, slug);
      if (result.missing) { missing++; if (showMissing || args[1]) console.log(`MISSING ${category.slug}/${slug}`); continue; }
      if (showUnchecked && !result.errors.length) {
        const card = JSON.parse(readFileSync(path.join(researchRoot, category.research_dir, "cards", `${slug}.json`), "utf8"));
        if (!card.job_check) { unchecked++; console.log(`UNCHECKED ${category.slug}/${slug}`); }
      }
      if (result.errors.length) { bad++; console.log(`FAIL ${category.slug}/${slug}\n  - ${result.errors.join("\n  - ")}`); }
      else { ok++; if (args[1]) console.log(`OK ${category.slug}/${slug}`); }
    }
  }
  console.log(`cards ok ${ok}, failing ${bad}, missing ${missing}${showUnchecked ? `, job check not done ${unchecked}` : ""}`);
  process.exit(bad ? 1 : 0);
}

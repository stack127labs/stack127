// Run: npm run test:focused -- lib/indie-hacker-apps/logic.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { appDirectories, getAppDirectory } from "./directories.ts";
import {
  cardCost,
  costLevels,
  costSetFor,
  directoryCards,
  directoryCategory,
  directoryCounts,
  filterApps,
  sortApps,
  statusChanges,
} from "./logic.ts";
import { targetsForEvents } from "../../scripts/stack127/cache/targets.mjs";

const { categories } = JSON.parse(readFileSync(new URL("./categories.json", import.meta.url), "utf8"));
const category = (slug) => categories.find((item) => item.slug === slug);
const databases = category("databases");

const cost = (v, state = "confirmed") => ({ v, plan: "", state, math: "" });
const card = (slug, jobs, extra = {}) => ({
  slug, name: slug, url: `https://${slug}.example`, jobs, line: `${slug} line`,
  free: { kind: "none", text: "" }, cells: {}, costs: {}, status: [], checked: "2026-11-01", icon: "", ...extra,
});

test("every directory points at real jobs and cost sets, and each job lands in exactly one directory", () => {
  assert.equal(appDirectories.length, 12);
  assert.equal(new Set(appDirectories.map((directory) => directory.slug)).size, 12);
  for (const item of categories) {
    const covered = appDirectories.filter((directory) => directory.category === item.slug).flatMap((directory) => directory.jobs);
    assert.deepEqual([...covered].sort(), item.jobs.map(([id]) => id).sort(), item.slug);
  }
  for (const directory of appDirectories) directoryCategory(category(directory.category), directory);
});

test("an app is listed wherever it does a job and is main only for its first job", () => {
  const supabase = card("supabase", ["backend", "sql", "files", "jobs"]);
  const r2 = card("r2", ["files"]);
  const apps = [supabase, r2];
  const files = directoryCards(databases, getAppDirectory("file-storage"), apps);
  assert.deepEqual(files.map((app) => [app.slug, app.main, app.mainJob]), [
    ["supabase", false, databases.jobs.find(([id]) => id === "backend")[1]],
    ["r2", true, databases.jobs.find(([id]) => id === "files")[1]],
  ]);
  const db = directoryCards(databases, getAppDirectory("databases"), apps);
  assert.deepEqual(db.map((app) => [app.slug, app.main]), [["supabase", true]]);
  assert.equal(directoryCards(databases, getAppDirectory("background-jobs"), apps)[0].main, false);
});

test("a directory view keeps only its jobs and cost sets", () => {
  const view = directoryCategory(databases, getAppDirectory("file-storage"));
  assert.deepEqual(view.jobs.map(([id]) => id), ["files"]);
  assert.deepEqual(Object.keys(view.sets), ["files"]);
  assert.deepEqual(view.job_sets, { files: "files" });
  assert.deepEqual(view.cells, databases.cells);
  // A backend-first app still shows its file storage cost here.
  const supabase = card("supabase", ["backend", "sql", "files"], { costs: { sql: [cost("$25")], files: [cost("$5")] } });
  assert.equal(costSetFor(view, supabase), "files");
  assert.equal(cardCost(view, supabase, costLevels(view)).row.v, "$5");
});

test("filters, counts and the cheapest-first sort", () => {
  const view = directoryCategory(databases, getAppDirectory("databases"));
  const level = (v, state) => Array.from({ length: view.sets.sql.levels.length }, () => cost(v, state));
  const apps = directoryCards(databases, getAppDirectory("databases"), [
    card("pricey", ["sql"], { costs: { sql: level("$90") }, free: { kind: "free", text: "" }, cells: { selfhost: "Yes" } }),
    card("cheap", ["sql"], { costs: { sql: level("$1") }, free: { kind: "credits", text: "" } }),
    card("unknown", ["kv"], { costs: { sql: level("Unknown", "unclear") } }),
    card("na", ["kv"], { costs: { sql: level("—", "not_applicable") } }),
    card("side", ["files", "vector"], { costs: { sql: level("$5") } }),
  ]);
  assert.deepEqual(sortApps(view, apps, "cost", costLevels(view)).map((app) => app.slug), ["cheap", "side", "pricey", "unknown", "na"]);
  assert.deepEqual(filterApps(view, apps, { job: "kv" }).map((app) => app.slug), ["unknown", "na"]);
  assert.deepEqual(filterApps(view, apps, { job: "files" }).length, 5, "a job outside the directory is ignored");
  assert.deepEqual(filterApps(view, apps, { mainOnly: true }).map((app) => app.slug), ["pricey", "cheap", "unknown", "na"]);
  assert.deepEqual(filterApps(view, apps, { free: ["trial"] }).map((app) => app.slug), ["cheap"]);
  assert.deepEqual(filterApps(view, apps, { features: ["selfhost"], q: "PRI" }).map((app) => app.slug), ["pricey"]);
  const counts = directoryCounts(view, apps);
  assert.equal(counts.total, 5);
  assert.equal(counts.main, 4);
  assert.deepEqual(counts.jobs, { sql: 2, nosql: 0, kv: 2, backend: 0, vector: 1 });
  assert.deepEqual(counts.free, { free: 1, selfhost: 0, trial: 1 });
  assert.deepEqual(counts.features, { selfhost: 1 });
});

test("a NoSQL app is listed and counted in databases only", () => {
  const view = directoryCategory(databases, getAppDirectory("databases"));
  const mongo = card("mongo", ["nosql", "vector"]);
  const apps = directoryCards(databases, getAppDirectory("databases"), [mongo, card("postgres", ["sql"]), card("s3", ["files"])]);
  assert.deepEqual(apps.map((app) => [app.slug, app.main, app.mainJob]), [
    ["mongo", true, databases.jobs.find(([id]) => id === "nosql")[1]],
    ["postgres", true, databases.jobs.find(([id]) => id === "sql")[1]],
  ]);
  assert.deepEqual(filterApps(view, apps, { job: "nosql" }).map((app) => app.slug), ["mongo"]);
  assert.deepEqual(directoryCounts(view, apps).jobs, { sql: 1, nosql: 1, kv: 0, backend: 0, vector: 1 });
  for (const slug of ["file-storage", "background-jobs"]) {
    assert.deepEqual(directoryCards(databases, getAppDirectory(slug), [mongo]), [], slug);
  }
});

test("status changes are newest first", () => {
  const event = (date) => ({ label: "Risk", tone: "warning", text: date, date });
  const changes = statusChanges([card("a", ["sql"], { status: [event("2026-01-02")] }), card("b", ["sql"], { status: [event("2026-03-01")] })]);
  assert.deepEqual(changes.map((change) => change.slug), ["b", "a"]);
});

test("record and publication events refresh the directory page, its JSON index and family tag", () => {
  const records = targetsForEvents([{ entity_type: "indie_hacker_apps", slug: "file-storage" }]);
  for (const path of ["/file-storage", "/api/app-directories/file-storage/index", "/"]) assert.ok(records.paths.includes(path), path);
  assert.ok(records.nextTags.includes("stack127-indie-hacker-apps:databases"));
  assert.ok(records.edgeTags.includes("app-directory:file-storage"));
  assert.ok(!records.warmPaths.includes("/api/app-directories/file-storage/index"));
  assert.ok(records.verifyPaths.includes("/api/app-directories/file-storage/index"), "the index is checked against the database");
  const page = targetsForEvents([{ entity_type: "page", slug: "file-storage" }]);
  assert.ok(page.paths.includes("/api/app-directories/file-storage/index"));
  assert.ok(page.verifyPaths.includes("/api/app-directories/file-storage/index"), "publication changes are checked too");
  assert.ok(page.edgeTags.includes("app-directory:file-storage"));
  const removed = targetsForEvents([{ entity_type: "indie_hacker_apps", slug: "old-directory" }]);
  assert.ok(removed.nextTags.includes("stack127-indie-hacker-apps"));
});

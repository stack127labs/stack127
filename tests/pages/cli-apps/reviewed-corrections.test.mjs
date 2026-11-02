import test from "node:test";
import assert from "node:assert/strict";
import { guardCorrection, applyCorrections } from "../../../scripts/cli-apps/lib/reviewed-corrections.mjs";

const correction = {
  slug: "example", reviewed_at: "2026-09-08",
  fields: { summary: "Searches files by name and previews their contents." },
  expected: { summary: "Old description." },
  sources: { summary: "https://example.org/docs" },
};

test("install methods can be replaced with reviewed allowed values", () => {
  const record = { ...correction, fields: { install_methods: ["source"] }, expected: { install_methods: ["brew", "apt", "source"] }, sources: { install_methods: "https://example.org/install" } };
  assert.doesNotThrow(() => guardCorrection(record, record.expected));
  for (const value of [null, "source", ["source", "source"], ["invented"]]) {
    assert.throws(() => guardCorrection({ ...record, fields: { install_methods: value } }, record.expected), /install_methods/);
  }
});

test("CLI corrections require evidence and a matching prior value for each field", () => {
  assert.doesNotThrow(() => guardCorrection(correction, correction.expected));
  assert.throws(() => guardCorrection(correction, { summary: "Newer review." }), /changed since review/);
  assert.throws(() => guardCorrection({ ...correction, expected: {} }, {}), /expected value/);
  assert.throws(() => guardCorrection({ ...correction, sources: {} }, correction.expected), /source URL/);
});

test("partial corrections cannot publish records or change verification dates", () => {
  for (const field of ["last_verified_at", "published", "updated_at", "slug"]) {
    assert.throws(() => guardCorrection({ ...correction, fields: { [field]: "value" } }, {}), /not allowed/);
  }
});

test("CLI corrections reject malformed summaries and invalid review dates", () => {
  assert.throws(() => guardCorrection({ ...correction, fields: { summary: "Searches files and." } }, correction.expected), /unfinished/);
  assert.throws(() => guardCorrection({ ...correction, fields: { summary: "Searches [br] files by name." } }, correction.expected), /markup/);
  assert.throws(() => guardCorrection({ ...correction, reviewed_at: "yesterday" }, correction.expected), /review date/);
});

test("review dates reject calendar rollover and preserve valid leap days", () => {
  for (const reviewed_at of ["2026-02-29", "2026-02-31", "2026-04-31", "2026-13-01", "2026-00-10"]) {
    assert.throws(() => guardCorrection({ ...correction, reviewed_at }, correction.expected), /review date/);
  }
  assert.doesNotThrow(() => guardCorrection({ ...correction, reviewed_at: "2024-02-29" }, correction.expected));
});

function fieldCorrection(field, value, before = "old") {
  return { ...correction, fields: { [field]: value }, expected: { [field]: before }, sources: { [field]: "https://example.org/facts" } };
}

test("reviewed lists and enums accept the directory vocabulary and reject bad shapes", () => {
  const valid = { platforms: ["linux", "macos", "windows", "bsd", "web"], categories: ["development", "devops", "ai"], primary_type: "tui", additional_types: ["cli", "editor"], pricing_model: "usage_based", source_model: "source_available", aliases: ["Alternate name"], install_methods: ["brew-cask", "go", "binary", "source"] };
  for (const [field, value] of Object.entries(valid)) {
    const record = fieldCorrection(field, value);
    assert.doesNotThrow(() => guardCorrection(record, record.expected));
    for (const invalid of [null, 1, {}, "invented", ...(field === "aliases" ? [] : [["invented"]]), [""], ["cli", "cli"]]) {
      assert.throws(() => guardCorrection(fieldCorrection(field, invalid), record.expected), new RegExp(field));
    }
  }
  for (const value of [[], ["development", "files", "text", "ai"]]) {
    assert.throws(() => guardCorrection(fieldCorrection("categories", value), { categories: "old" }), /1 to 3/);
  }
  for (const field of ["aliases", "platforms", "additional_types", "install_methods"]) {
    assert.doesNotThrow(() => guardCorrection(fieldCorrection(field, []), { [field]: "old" }));
  }
});

test("nullable facts, HTTPS URLs, and unchanged replay still require evidence and expected values", () => {
  for (const field of ["website_url", "docs_url", "license", "language"]) {
    assert.doesNotThrow(() => guardCorrection(fieldCorrection(field, null), { [field]: "old" }));
  }
  for (const field of ["name", "summary", "repository_url", "primary_type", "pricing_model", "source_model"]) {
    assert.throws(() => guardCorrection(fieldCorrection(field, null), { [field]: "old" }), new RegExp(field));
  }
  for (const url of ["http://example.org", "https://", "https://bad host", "https://?oops"]) {
    assert.throws(() => guardCorrection(fieldCorrection("docs_url", url), { docs_url: "old" }), /HTTPS/);
    assert.throws(() => guardCorrection({ ...correction, sources: { summary: url } }, correction.expected), /source URL/);
  }
  assert.doesNotThrow(() => guardCorrection(correction, correction.fields));
  assert.throws(() => guardCorrection({ ...correction, expected: {} }, correction.fields), /expected value/);
  assert.throws(() => guardCorrection({ ...correction, sources: {} }, correction.fields), /source URL/);
});

// Transactional test double: app and provenance changes commit/roll back together.
function database(records, projects = []) {
  let rows = structuredClone(records);
  let sources = [];
  let repositories = structuredClone(projects);
  let saved;
  const queries = [];
  return {
    queries,
    get rows() { return rows; }, get sources() { return sources; }, get projects() { return repositories; },
    async query(sql, params) {
      queries.push(sql);
      if (sql === "begin") saved = structuredClone({ rows, sources, repositories });
      else if (sql === "rollback") ({ rows, sources, repositories } = saved);
      else if (sql === "commit") saved = undefined;
      else if (sql.startsWith("lock table public.github_projects")) {
        // Simulate a writer that committed a differently cased repo while the lock waited.
        if (this.concurrentProject) repositories.push(structuredClone(this.concurrentProject));
      }
      else if (sql.startsWith("select *")) return { rows: rows.filter(row => row.slug === params[0]) };
      else if (sql.startsWith("select id")) return { rows: repositories.filter(row => (sql.includes("lower(owner)") ? row.owner.toLowerCase() === params[0] && row.repo.toLowerCase() === params[1] : row.owner === params[0] && row.repo === params[1])) };
      else if (sql.startsWith("insert into public.github_projects")) {
        const project = { id: `project-${repositories.length}`, owner: params[0], repo: params[1], full_name: params[2], repository_url: params[3], checked_at: null };
        repositories.push(project);
        return { rows: [project] };
      } else if (sql.startsWith("update public.terminal_apps")) {
        const row = rows.find(row => row.id === params[0]);
        [...sql.matchAll(/(\w+) = \$(\d+)/g)].filter(match => match[1] !== "id").forEach(match => { row[match[1]] = params[Number(match[2]) - 1]; });
        row.updated_at = "changed";
      } else if (sql.startsWith("insert into public.terminal_app_field_sources")) {
        sources.push({ app: params[0], date: params[1], fields: params[2], urls: params[3], notes: params[4] });
        if (this.failSources) throw new Error("source write failed");
      } else throw new Error(`Unexpected SQL: ${sql}`);
      return { rows: [] };
    },
  };
}
const silent = { report() {} };
function batchOf(size) {
  return { apps: Array.from({ length: size }, (_, i) => ({ ...fieldCorrection("name", `App ${i}`, `Old ${i}`), slug: `app-${i}` })) };
}
function rowsFor(batch) {
  return batch.apps.map((record, i) => ({ id: `id-${i}`, slug: record.slug, ...record.expected, published: true, last_verified_at: "2025-01-01", updated_at: "original" }));
}

test("300 apps commit in 12 chunks, keep partial fields, record sources and replay without writes", async () => {
  const batch = batchOf(300);
  const db = database(rowsFor(batch));
  const reports = [];
  const result = await applyCorrections(db, batch, { apply: true, report: line => reports.push(line) });
  assert.equal(result.changedApps, 300);
  assert.equal(db.queries.filter(sql => sql === "commit").length, 12);
  assert.equal(reports.length, 12);
  assert.match(reports[11], /Chunk 12\/12: committed; 25 apps, 25 changed, 25 fields/);
  assert.equal(db.sources.length, 300);
  assert.deepEqual(db.sources[0].fields, ["name"]);
  assert.deepEqual(db.sources[0].urls, ["https://example.org/facts"]);
  assert.equal(db.rows[0].last_verified_at, "2025-01-01");
  db.queries.length = 0;
  const replay = await applyCorrections(db, batch, { apply: true, ...silent });
  assert.equal(replay.skippedApps, 300);
  assert.equal(db.queries.some(sql => /^(update|insert)/.test(sql)), false);
  assert.equal(db.sources.length, 300);
});

test("dry run rolls back each chunk by default", async () => {
  const batch = batchOf(3);
  const original = rowsFor(batch);
  const db = database(original);
  await applyCorrections(db, batch, { chunkSize: 2, ...silent });
  assert.deepEqual(db.rows, original);
  assert.deepEqual(db.sources, []);
  assert.equal(db.queries.filter(sql => sql === "rollback").length, 2);
  assert.equal(db.queries.includes("commit"), false);
});

test("stale fields roll back the whole failing chunk, preserve earlier chunks, and resume", async () => {
  const batch = batchOf(4);
  const original = rowsFor(batch);
  original[3].name = "Unexpected";
  const db = database(original);
  const reports = [];
  await assert.rejects(applyCorrections(db, batch, { apply: true, chunkSize: 2, report: line => reports.push(line) }), /Chunk 2\/2: app-3: name changed since review/);
  assert.deepEqual(db.rows.map(row => row.name), ["App 0", "App 1", "Old 2", "Unexpected"]);
  assert.equal(db.sources.length, 2);
  assert.match(reports[1], /rolled back; stopped/);
  db.rows[3].name = "Old 3";
  const result = await applyCorrections(db, batch, { apply: true, chunkSize: 2, ...silent });
  assert.equal(result.skippedApps, 2);
  assert.equal(result.changedApps, 2);
});

test("source failures roll back app changes and malformed later input prevents all commits", async () => {
  const batch = batchOf(2);
  const original = rowsFor(batch);
  const db = database(original);
  db.failSources = true;
  await assert.rejects(applyCorrections(db, batch, { apply: true, ...silent }), /source write failed/);
  assert.deepEqual(db.rows, original);
  assert.deepEqual(db.sources, []);
  db.queries.length = 0;
  batch.apps[1].sources = {};
  await assert.rejects(applyCorrections(db, batch, { apply: true, chunkSize: 1, ...silent }), /source URL/);
  assert.deepEqual(db.queries, []);
  for (const chunkSize of [0, -1, 1.5, 26, NaN]) {
    await assert.rejects(applyCorrections(db, batch, { chunkSize, ...silent }), /chunk-size/);
  }
  await assert.rejects(applyCorrections(db, { apps: [batch.apps[0], batch.apps[0]] }, silent), /Duplicate slug/);
});

test("repository corrections reuse normalized GitHub projects, create unchecked projects, and unlink non-GitHub repos", async () => {
  for (const existing of [true, false]) {
    const record = fieldCorrection("repository_url", "https://github.com/Micro-Editor/Micro.git/tree/main", "https://github.com/zyedidia/micro");
    const projects = existing ? [{ id: "existing", owner: "micro-editor", repo: "micro", checked_at: "2026-01-01" }] : [];
    const db = database([{ id: "app", slug: record.slug, ...record.expected, github_project_id: "old-project" }], projects);
    await applyCorrections(db, { apps: [record] }, { apply: true, ...silent });
    assert.equal(db.rows[0].github_project_id, existing ? "existing" : "project-0");
    assert.equal(db.projects[0].checked_at, existing ? "2026-01-01" : null);
    assert.equal(db.projects[0].owner, "micro-editor");
    assert.equal(db.projects[0].repo, "micro");
    assert.deepEqual(db.sources[0].fields, ["repository_url"]);
    db.queries.length = 0;
    await applyCorrections(db, { apps: [record] }, { apply: true, ...silent });
    assert.equal(db.queries.some(sql => /^(update|insert)/.test(sql)), false);
    const nonGithub = fieldCorrection("repository_url", "https://gitlab.com/example/app", record.fields.repository_url);
    await applyCorrections(db, { apps: [nonGithub] }, { apply: true, ...silent });
    assert.equal(db.rows[0].github_project_id, null);
  }
});

test("new GitHub project creation rolls back with a failed correction", async () => {
  const record = fieldCorrection("repository_url", "https://github.com/infracost/cli", "https://github.com/infracost/infracost");
  const original = [{ id: "app", slug: record.slug, ...record.expected, github_project_id: "old" }];
  const db = database(original);
  db.failSources = true;
  await assert.rejects(applyCorrections(db, { apps: [record] }, { apply: true, ...silent }), /source write failed/);
  assert.deepEqual(db.projects, []);
  assert.deepEqual(db.rows, original);
});

test("a lost commit response preserves the error, reports uncertainty, and allows replay", async () => {
  const batch = batchOf(1);
  const db = database(rowsFor(batch));
  let loseCommit = true;
  const reports = [];
  const client = { async query(sql, params) {
    const result = await db.query(sql, params);
    if (sql === "commit" && loseCommit) { loseCommit = false; throw new Error("lost commit response"); }
    return result;
  } };
  await assert.rejects(applyCorrections(client, batch, { apply: true, report: line => reports.push(line) }), /lost commit response/);
  assert.match(reports[0], /commit outcome may be uncertain/);
  const replay = await applyCorrections(client, batch, { apply: true, ...silent });
  assert.equal(replay.skippedApps, 1);
  assert.equal(db.sources.length, 1);
});


test("mixed-case existing GitHub projects are reused without creating duplicates", async () => {
  const record = fieldCorrection("repository_url", "https://github.com/couchpotato/couchpotatoserver", "https://github.com/example/old");
  const original = [{ id: "app", slug: record.slug, ...record.expected, github_project_id: "old" }];
  const project = { id: "mixed-case", owner: "CouchPotato", repo: "CouchPotatoServer", checked_at: "2026-01-01" };
  for (const concurrent of [false, true]) {
    const db = database(original, concurrent ? [] : [project]);
    if (concurrent) db.concurrentProject = project;
    await applyCorrections(db, { apps: [record] }, { apply: true, ...silent });
    assert.equal(db.rows[0].github_project_id, "mixed-case");
    assert.deepEqual(db.projects, [project]);
    assert.equal(db.queries.some(sql => sql.startsWith("insert into public.github_projects")), false);
    if (concurrent) assert.equal(db.queries.filter(sql => sql.startsWith("select id")).length, 2);
  }
});

test("invalid GitHub URLs in later chunks fail whole-batch validation before any transaction", async () => {
  for (const url of ["https://github.com/owner", "https://github.com/owner/.git"]) {
    const batch = batchOf(2);
    batch.apps[1] = { ...fieldCorrection("repository_url", url, "https://github.com/example/old"), slug: "app-1" };
    const db = database(rowsFor(batch));
    await assert.rejects(applyCorrections(db, batch, { apply: true, chunkSize: 1, ...silent }), /GitHub/);
    assert.deepEqual(db.queries, []);
  }
});

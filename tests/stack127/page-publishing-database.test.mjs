import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { preparePlan } from "../../scripts/stack127/publishing/cli.mjs";
import { checkRepositoryRequirements } from "../../scripts/stack127/publishing/readiness.mjs";
import { executeBatch, readStates } from "../../scripts/stack127/publishing/database.mjs";
import { CONTENT_FIELDS, REGISTRY_FIELDS, desiredStates, validateState } from "../../scripts/stack127/publishing/model.mjs";

function state(slug, family = "directory", published = false) {
  const content = {
    directory: { title: "Page title", intro_markdown: "Page introduction", content_markdown: null,
      card_name: "Page", card_description: "Page description", card_icon_key: null, card_art_key: null },
    tool: { title: "Tool title", intro_markdown: "Tool introduction", usage_markdown: null,
      content_markdown: "Tool instructions", tool_version: "1.0.0", stack127_repo_url: null,
      stack127_repo_version: null, stack127_repo_commit_sha: null, card_name: "Tool",
      card_description: "Tool description", card_icon_key: "calculator", card_art_key: "icon" },
    catalog: { heading_before: "", heading_mark: "Tools", heading_after: "", intro: "Find a tool",
      section_heading: "Tools", icon_key: "layers", hero_art_key: "icon", home_art_key: "icon",
      home_order: 10, card_name: "Tools", card_description: "Choose a tool" },
  }[family];
  return { slug, family, registry: { label: "Page", meta_title: "Page | stack127",
    meta_description: "Page description", is_published: published, is_indexable: true, cover_image_url: null,
    page_type: family === "tool" ? "WebPage" : "CollectionPage", sitemap_priority: 0.5 },
  content, ...(family === "tool" ? { catalogs: [] } : {}) };
}

function change(before, edit) {
  const after = structuredClone(before);
  edit(after);
  return { slug: before.slug, family: before.family, before, after };
}

function create(after) {
  return { slug: after.slug, family: after.family, before: null, after };
}

// This client models transactional persistence and the constraints used by the publisher.
// The development integration checks the same operations against PostgreSQL's real triggers.
function database(initial = [], { catalogSchema = "original", catalogColumns } = {}) {
  const catalogFields = schema => CONTENT_FIELDS.catalog.map(field => schema === "renamed"
    ? { icon_key: "card_icon_key", home_art_key: "card_art_key" }[field] ?? field : field);
  let physicalCatalogFields = catalogFields(catalogSchema);
  let availableCatalogColumns = catalogColumns ?? physicalCatalogFields;
  let store = { pages: [], content: { tool: [], directory: [], catalog: [] }, members: [] };
  let nextId = 1;
  for (const item of initial) {
    const id = nextId++;
    store.pages.push({ id, slug: item.slug, page_family: item.family, ...item.registry,
      published_at: item.registry.is_published ? "old" : null, updated_at: item.registry.is_published ? "old" : null,
      row_updated_at: "old" });
    if (item.content) {
      const fields = item.family === "catalog" ? physicalCatalogFields : CONTENT_FIELDS[item.family];
      const content = Object.fromEntries(CONTENT_FIELDS[item.family].map((field, index) => [fields[index], item.content[field]]));
      store.content[item.family].push({ page_id: id, ...content,
        content_revision: 1, row_updated_at: "old", tool_version_updated_at: "old" });
    }
  }
  for (const item of initial.filter(item => item.family === "tool")) {
    for (const [index, catalog] of item.catalogs.entries()) store.members.push({
      tool_page_id: store.pages.find(page => page.slug === item.slug).id,
      catalog_page_id: store.pages.find(page => page.slug === catalog.slug).id,
      catalog_rank: index + 1, display_order: catalog.display_order,
    });
  }
  let snapshot;
  const calls = [];
  let failure;
  let releases = 0;
  let ticks = 0;
  const result = rows => ({ rows: structuredClone(rows), rowCount: rows.length });
  const client = {
    async query(text, values = []) {
      const sql = text.replace(/\s+/g, " ").trim();
      calls.push({ sql, values: structuredClone(values) });
      if (failure?.(sql, values)) throw new Error("Injected late database failure");
      if (sql.startsWith("begin")) { snapshot = structuredClone(store); return result([]); }
      if (sql === "rollback") { if (snapshot) store = snapshot; snapshot = undefined; return result([]); }
      if (sql === "commit") { snapshot = undefined; return result([]); }
      if (sql.startsWith("set local") || sql.includes("pg_advisory_xact_lock")) return result([]);
      if (sql.startsWith("select")) {
        if (sql.includes("information_schema.columns")) {
          assert.deepEqual(values.slice(0, 2), ["public", "stack127_catalog_pages"]);
          return result(availableCatalogColumns.filter(column => values[2].includes(column))
            .map(column_name => ({ column_name })));
        }
        if (sql.includes("unnest")) return result(store.pages.filter(page => page.page_family === "directory"
          && page.is_published && values[0].some(prefix => page.slug.startsWith(prefix))));
        if (sql.includes("from public.stack127_pages where slug")) {
          return result(store.pages.filter(page => values[0].includes(page.slug)).sort((a, b) => a.slug.localeCompare(b.slug)));
        }
        const family = /from public\.stack127_(tool|directory|catalog)_pages where/.exec(sql)?.[1];
        if (family) {
          const projection = /^select (.*?) from/.exec(sql)[1].split(",").map(expression => {
            const match = /^(\w+)(?: as (\w+))?$/.exec(expression.trim());
            assert.ok(match, `Unexpected projection: ${expression}`);
            if (family === "catalog" && match[1] !== "page_id" && !availableCatalogColumns.includes(match[1])) {
              throw new Error(`Missing catalog column ${match[1]}`);
            }
            return { physical: match[1], canonical: match[2] ?? match[1] };
          });
          return result(store.content[family].filter(row => values[0].includes(row.page_id))
            .map(row => Object.fromEntries(projection.map(({ physical, canonical }) => [canonical, row[physical]]))));
        }
        if (sql.includes("stack127_tool_catalog_memberships")) {
          if (sql.includes("where member.tool_page_id")) return result(store.members
            .filter(member => values[0].includes(member.tool_page_id))
            .sort((a, b) => a.tool_page_id - b.tool_page_id || a.catalog_rank - b.catalog_rank)
            .map(member => ({ ...member, slug: store.pages.find(page => page.id === member.catalog_page_id).slug })));
          return result(store.members.map(member => {
            const tool = store.pages.find(page => page.id === member.tool_page_id);
            return { ...member, catalog_slug: store.pages.find(page => page.id === member.catalog_page_id).slug,
              tool_slug: tool.slug, tool_published: tool.is_published };
          }).filter(member => values[0].includes(member.catalog_slug)));
        }
      }
      if (sql.startsWith("insert into")) {
        const table = /^insert into public\.(\w+)/.exec(sql)[1];
        const columns = /^insert into public\.\w+ \(([^)]+)\)/.exec(sql)[1].split(",").map(column => column.trim());
        const row = Object.fromEntries(columns.map((column, index) => [column, values[index] ?? null]));
        if (table === "stack127_pages") {
          assert.equal(row.is_published, false, "New registry rows must start unpublished");
          if (store.pages.some(page => page.slug === row.slug)) throw new Error("Duplicate registry slug");
          row.id = nextId++;
          row.published_at = null;
          row.updated_at = null;
          store.pages.push(row);
          return result([{ id: row.id }]);
        }
        if (table === "stack127_tool_catalog_memberships") {
          if (!store.content.catalog.some(content => content.page_id === row.catalog_page_id)
            || !store.content.tool.some(content => content.page_id === row.tool_page_id)) throw new Error("Missing membership parent");
          if (store.members.some(member => (member.catalog_page_id === row.catalog_page_id
            && member.display_order === row.display_order) || (member.tool_page_id === row.tool_page_id
            && member.catalog_rank === row.catalog_rank))) throw new Error("Duplicate membership order");
          store.members.push(row);
          return result([]);
        }
        const family = /^stack127_(tool|directory|catalog)_pages$/.exec(table)[1];
        if (family === "catalog" && columns.some(column => column !== "page_id" && !availableCatalogColumns.includes(column))) {
          throw new Error("Catalog insert used a missing physical column");
        }
        if (store.content[family].some(content => content.page_id === row.page_id)) throw new Error("Duplicate family content");
        row.content_revision = 1;
        row.row_updated_at = `tick-${++ticks}`;
        if (family === "tool") {
          row.tool_version_updated_at = row.row_updated_at;
          row.stack127_repo_synced_at = sql.includes("now(), now()") ? row.row_updated_at : null;
        }
        store.content[family].push(row);
        return result([]);
      }
      if (sql.startsWith("delete from")) {
        const family = /^delete from public\.stack127_(tool|directory|catalog)_pages/.exec(sql)?.[1];
        if (family) {
          store.content[family] = store.content[family].filter(row => row.page_id !== values[0]);
          if (family === "tool") store.members = store.members.filter(row => row.tool_page_id !== values[0]);
          if (family === "catalog") store.members = store.members.filter(row => row.catalog_page_id !== values[0]);
        } else store.members = store.members.filter(row => !values[0].includes(row.tool_page_id));
        return result([]);
      }
      if (sql.startsWith("update")) {
        const registry = sql.startsWith("update public.stack127_pages ");
        const family = registry ? null : /^update public\.stack127_(tool|directory|catalog)_pages/.exec(sql)[1];
        const row = registry ? store.pages.find(page => page.id === values[0])
          : store.content[family].find(content => content.page_id === values[0]);
        const before = structuredClone(row);
        for (const match of sql.matchAll(/(\w+) = \$(\d+)/g)) {
          if (family === "catalog" && match[1] !== "page_id" && !availableCatalogColumns.includes(match[1])) {
            throw new Error(`Catalog update used a missing physical column ${match[1]}`);
          }
          row[match[1]] = values[Number(match[2]) - 1];
        }
        row.row_updated_at = `tick-${++ticks}`;
        if (registry) {
          if (row.is_published && !store.content[row.page_family].some(content => content.page_id === row.id)) {
            throw new Error("Publication preceded family content");
          }
          if (row.is_published && row.page_family === "tool" && !store.members.some(member => member.tool_page_id === row.id)) {
            throw new Error("Publication preceded memberships");
          }
          if (sql.includes("published_at = case")) {
            row.published_at = row.is_published ? row.published_at ?? row.row_updated_at : null;
            row.updated_at = row.is_published ? row.row_updated_at : null;
          }
        } else {
          if (["title", "intro_markdown", "usage_markdown", "content_markdown"].some(field => before[field] !== row[field])) {
            row.content_revision++;
          }
          if (before.tool_version !== row.tool_version) row.tool_version_updated_at = row.row_updated_at;
          if (sql.includes("stack127_repo_synced_at = now()")) row.stack127_repo_synced_at = row.row_updated_at;
          if (sql.includes("stack127_repo_synced_at = null")) row.stack127_repo_synced_at = null;
        }
        return result([]);
      }
      throw new Error(`Unhandled test database query: ${sql}`);
    },
    release() { releases++; },
  };
  return { client, pool: { async connect() { return client; } }, calls,
    get store() { return structuredClone(store); }, get releases() { return releases; },
    setCatalogSchema(schema) {
      const nextFields = catalogFields(schema);
      for (const row of store.content.catalog) {
        physicalCatalogFields.forEach((field, index) => {
          if (field === nextFields[index]) return;
          row[nextFields[index]] = row[field];
          delete row[field];
        });
      }
      physicalCatalogFields = nextFields;
      availableCatalogColumns = nextFields;
    },
    failWhen(predicate) { failure = predicate; },
    writes() { return calls.filter(call => /^(insert|update|delete) /.test(call.sql)); },
  };
}

test("readStates projects managed fields, preserves missing content, and normalizes database numbers", async () => {
  const complete = state("directory");
  const unfinished = state("unfinished");
  unfinished.content = null;
  const db = database([complete, unfinished]);
  const originalQuery = db.client.query;
  db.client.query = async (...args) => {
    const result = await originalQuery(...args);
    for (const row of result.rows) if (Object.hasOwn(row, "sitemap_priority")) row.sitemap_priority = "0.50";
    return result;
  };
  assert.deepEqual(await readStates(db.client, [
    { slug: "directory", family: "directory" }, { slug: "unfinished", family: "directory" },
    { slug: "missing", family: "directory" },
  ]), [complete, unfinished, null]);
  await assert.rejects(readStates(db.client, [{ slug: "directory", family: "tool" }]), /Wrong page family/);
});

test("full states require all managed fields and reject unknown or schema-invalid values", () => {
  const tool = state("tool", "tool");
  assert.deepEqual(validateState(tool), tool);
  for (const field of REGISTRY_FIELDS) {
    const incomplete = structuredClone(tool);
    delete incomplete.registry[field];
    assert.throws(() => validateState(incomplete), /Missing registry field/);
  }
  for (const field of CONTENT_FIELDS.tool) {
    const incomplete = structuredClone(tool);
    delete incomplete.content[field];
    assert.throws(() => validateState(incomplete), /Missing tool content field/);
  }
  assert.throws(() => validateState({ ...tool, extra: true }), /Unknown state field/);
  assert.throws(() => validateState({ ...tool, content: { ...tool.content, content_revision: 4 } }), /Unknown tool content field/);
  assert.throws(() => validateState({ ...tool, registry: { ...tool.registry, sitemap_priority: 0.555 } }), /two decimal places/);
  assert.throws(() => validateState({ ...tool, content: { ...tool.content, content_markdown: null } }), /nonempty text/);
  assert.throws(() => validateState({ ...tool, catalogs: [{ slug: "tools", display_order: 2147483648 }] }), /integer range/);
});

test("catalog heading fragments preserve the spaces used around marked text", async () => {
  const catalog = state("dns-tools", "catalog");
  catalog.content.heading_before = "DNS ";
  catalog.content.heading_after = " to check records";
  const db = database([catalog]);
  assert.deepEqual(validateState(catalog), catalog);
  assert.deepEqual(await readStates(db.client, [{ slug: catalog.slug, family: catalog.family }]), [catalog]);
});

test("a later optimistic conflict rejects the whole batch before any write", async () => {
  const first = state("first");
  const second = state("second");
  const actualSecond = structuredClone(second);
  actualSecond.content.title = "An independent edit";
  const db = database([first, actualSecond]);
  await assert.rejects(executeBatch(db.pool, [
    change(first, after => { after.content.title = "Updated first"; }),
    change(second, after => { after.content.title = "Updated second"; }),
  ], { apply: true }), /Publishing conflict for second/);
  assert.equal(db.writes().length, 0);
  assert.equal(db.calls.at(-1).sql, "rollback");
  assert.equal(db.releases, 1);
});

test("a database failure after an earlier page write rolls back every page", async () => {
  const first = state("first");
  const second = state("second");
  const db = database([first, second]);
  const original = db.store;
  db.failWhen((sql, values) => sql.startsWith("update public.stack127_directory_pages") && values[0] === 2);
  await assert.rejects(executeBatch(db.pool, [
    change(first, after => { after.content.title = "Updated first"; }),
    change(second, after => { after.content.title = "Updated second"; }),
  ], { apply: true }), /late database failure/);
  assert.ok(db.writes().length >= 2);
  assert.deepEqual(db.store, original);
  assert.equal(db.releases, 1);
});

test("dry runs validate writes and roll back, and a successful retry writes nothing", async () => {
  const before = state("directory", "directory", true);
  const entry = change(before, after => { after.content.title = "Updated title"; });
  const db = database([before]);
  const original = db.store;
  const preview = await executeBatch(db.pool, [entry]);
  assert.equal(preview.applied, false);
  assert.equal(preview.pages[0].changed, true);
  assert.deepEqual(db.store, original);
  await executeBatch(db.pool, [entry], { apply: true });
  assert.equal(db.store.content.directory[0].content_revision, 2);
  const applied = db.store;
  const writeCount = db.writes().length;
  const retry = await executeBatch(db.pool, [entry], { apply: true });
  assert.equal(retry.pages[0].changed, false);
  assert.equal(db.writes().length, writeCount);
  assert.deepEqual(db.store, applied);
});

test("new pages enter as drafts and get family content and memberships before publication", async () => {
  const catalog = state("tools", "catalog", true);
  const tool = state("new-tool", "tool", true);
  tool.catalogs = [{ slug: "tools", display_order: 1 }];
  const db = database();
  const result = await executeBatch(db.pool, [create(tool), create(catalog)], { apply: true });
  assert.deepEqual(result.states, [tool, catalog]);
  assert.deepEqual(await readStates(db.client, [{ slug: tool.slug, family: "tool" },
    { slug: catalog.slug, family: "catalog" }]), [tool, catalog]);
  assert.equal(db.store.content.tool[0].content_revision, 1);
  assert.match(db.store.content.tool[0].tool_version_updated_at, /^tick-/);
});

test("existing registry drafts without family content can be completed", async () => {
  const before = state("unfinished");
  before.content = null;
  const after = state("unfinished", "directory", true);
  const db = database([before]);
  await executeBatch(db.pool, [{ slug: after.slug, family: after.family, before, after }], { apply: true });
  assert.deepEqual(await readStates(db.client, [{ slug: after.slug, family: after.family }]), [after]);
  assert.equal(db.store.pages.length, 1);
});

test("selected tools can swap orders without duplicate memberships or writes on retry", async () => {
  const catalog = state("tools", "catalog", true);
  const first = state("first", "tool", true);
  const second = state("second", "tool", true);
  first.catalogs = [{ slug: "tools", display_order: 1 }];
  second.catalogs = [{ slug: "tools", display_order: 2 }];
  const entries = [change(first, after => { after.catalogs[0].display_order = 2; }),
    change(second, after => { after.catalogs[0].display_order = 1; })];
  const db = database([catalog, first, second]);
  await executeBatch(db.pool, entries, { apply: true });
  assert.deepEqual(await readStates(db.client, entries.map(({ slug, family }) => ({ slug, family }))), entries.map(entry => entry.after));
  const count = db.writes().length;
  await executeBatch(db.pool, entries, { apply: true });
  assert.equal(db.writes().length, count);
  assert.equal(db.store.members.length, 2);
  assert.ok(db.store.content.tool.every(row => row.content_revision === 1));
});

test("orders held by unselected tools cannot be overwritten", async () => {
  const catalog = state("tools", "catalog", true);
  const first = state("first", "tool", true);
  const second = state("second", "tool", true);
  first.catalogs = [{ slug: "tools", display_order: 1 }];
  second.catalogs = [{ slug: "tools", display_order: 2 }];
  const db = database([catalog, first, second]);
  await assert.rejects(executeBatch(db.pool, [change(first, after => { after.catalogs[0].display_order = 2; })],
    { apply: true }), /occupied.*second/);
  assert.equal(db.writes().length, 0);
});

test("duplicate requested orders fail before any new page is inserted", async () => {
  const catalog = state("tools", "catalog", true);
  const first = state("first", "tool", true);
  const second = state("second", "tool", true);
  first.catalogs = [{ slug: "tools", display_order: 1 }];
  second.catalogs = [{ slug: "tools", display_order: 1 }];
  const db = database([catalog]);
  await assert.rejects(executeBatch(db.pool, [create(first), create(second)], { apply: true }), /occupied/);
  assert.equal(db.writes().length, 0);
});

test("catalogs need real content and publication before a tool can be published", async () => {
  const tool = state("tool", "tool", true);
  tool.catalogs = [{ slug: "tools", display_order: 1 }];
  const catalog = state("tools", "catalog");
  for (const initial of [[], [{ ...catalog, content: null }], [catalog]]) {
    const db = database(initial);
    await assert.rejects(executeBatch(db.pool, [create(tool)], { apply: true }), /Catalog family content is missing|requires published catalog/);
    assert.equal(db.writes().length, 0);
  }
  const db = database([catalog]);
  await executeBatch(db.pool, [create(tool), change(catalog, after => { after.registry.is_published = true; })], { apply: true });
});

test("publishing an empty catalog and unpublishing a catalog with public tools both fail", async () => {
  const catalog = state("tools", "catalog", true);
  const db = database();
  await assert.rejects(executeBatch(db.pool, [create(catalog)], { apply: true }), /empty catalog/);
  assert.equal(db.writes().length, 0);
  const tool = state("tool", "tool", true);
  tool.catalogs = [{ slug: "tools", display_order: 1 }];
  const occupied = database([catalog, tool]);
  await assert.rejects(executeBatch(occupied.pool, [change(catalog, after => { after.registry.is_published = false; })],
    { apply: true }), /requires published catalog/);
  assert.equal(occupied.writes().length, 0);
});

test("directory children require a published parent in the batch's final state", async () => {
  const child = state("directory/child", "directory", true);
  const parent = state("directory");
  for (const initial of [[], [parent], [{ ...parent, registry: { ...parent.registry, is_published: true }, content: null }]]) {
    const db = database(initial);
    await assert.rejects(executeBatch(db.pool, [create(child)], { apply: true }), /requires published parent|content is missing/);
    assert.equal(db.writes().length, 0);
  }
  const db = database([parent]);
  await executeBatch(db.pool, [create(child), change(parent, after => { after.registry.is_published = true; })], { apply: true });
  const publishedParent = { ...parent, registry: { ...parent.registry, is_published: true } };
  await assert.rejects(executeBatch(db.pool, [change(publishedParent, after => { after.registry.is_published = false; })],
    { apply: true }), /requires published parent/);
});

test("restore uses the frozen after state and never overwrites a later edit", async () => {
  const before = state("directory");
  const entry = change(before, after => { after.content.title = "Published title"; after.registry.is_published = true; });
  const db = database([before]);
  await executeBatch(db.pool, [entry], { apply: true });
  const restored = await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.equal(restored.restored, true);
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [before]);
  const count = db.writes().length;
  assert.equal((await executeBatch(db.pool, [entry], { apply: true, restore: true })).pages[0].changed, false);
  assert.equal(db.writes().length, count);
  const later = change(entry.after, after => { after.content.title = "Independent newer copy"; });
  const edited = database([later.after]);
  await assert.rejects(executeBatch(edited.pool, [entry], { apply: true, restore: true }), /Publishing conflict/);
  assert.equal(edited.writes().length, 0);
});

test("restoring a newly created page keeps its content as an unpublished draft", async () => {
  const page = state("new-directory", "directory", true);
  const entry = create(page);
  const db = database();
  await executeBatch(db.pool, [entry], { apply: true });
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.equal(db.store.pages.length, 1);
  assert.equal(db.store.pages[0].is_published, false);
  assert.equal(db.store.pages[0].published_at, null);
  assert.equal(db.store.pages[0].updated_at, null);
  assert.equal(db.store.content.directory.length, 1);
  const count = db.writes().length;
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.equal(db.writes().length, count);
});

test("restore can return an unfinished registry draft to its exact content:null snapshot", async () => {
  const before = state("unfinished");
  before.content = null;
  const entry = { slug: before.slug, family: before.family, before, after: state("unfinished", "directory", true) };
  const db = database([before]);
  await executeBatch(db.pool, [entry], { apply: true });
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [before]);
});

test("query values remain parameters even when Markdown contains SQL syntax", async () => {
  const page = state("directory");
  page.content.content_markdown = "Text'); drop table public.stack127_pages; --";
  const db = database();
  await executeBatch(db.pool, [create(page)], { apply: true });
  assert.ok(db.calls.some(call => call.values.includes(page.content.content_markdown)));
  assert.ok(db.calls.every(call => !call.sql.includes(page.content.content_markdown)));
});

test("repo URLs alone do not claim a sync, and copy changes preserve an existing verified sync", async () => {
  const tool = state("tool", "tool");
  tool.content.stack127_repo_url = "https://github.com/stack127labs/tool";
  const db = database();
  await executeBatch(db.pool, [create(tool)], { apply: true });
  assert.equal(db.store.content.tool[0].stack127_repo_synced_at, null);
  const verified = change(tool, after => {
    after.content.stack127_repo_version = "1.0.0";
    after.content.stack127_repo_commit_sha = "a".repeat(40);
  });
  await executeBatch(db.pool, [verified], { apply: true });
  const syncDate = db.store.content.tool[0].stack127_repo_synced_at;
  assert.match(syncDate, /^tick-/);
  const copy = change(verified.after, after => { after.content.title = "Updated title"; });
  await executeBatch(db.pool, [copy], { apply: true });
  assert.equal(db.store.content.tool[0].stack127_repo_synced_at, syncDate);
  const nextVersion = change(copy.after, after => {
    after.content.stack127_repo_version = "1.0.1";
    after.content.stack127_repo_commit_sha = "b".repeat(40);
  });
  await executeBatch(db.pool, [nextVersion], { apply: true });
  assert.notEqual(db.store.content.tool[0].stack127_repo_synced_at, syncDate);
  const count = db.writes().length;
  const synced = db.store;
  await executeBatch(db.pool, [nextVersion], { apply: true });
  assert.deepEqual(db.store, synced);
  assert.equal(db.writes().length, count);
  const cleared = change(nextVersion.after, after => {
    after.content.stack127_repo_version = null;
    after.content.stack127_repo_commit_sha = null;
  });
  await executeBatch(db.pool, [cleared], { apply: true });
  assert.equal(db.store.content.tool[0].stack127_repo_synced_at, null);
});

test("new complete repo metadata gets its sync date inside the page transaction", async () => {
  const tool = state("tool", "tool");
  tool.content.stack127_repo_url = "https://github.com/stack127labs/tool";
  tool.content.stack127_repo_version = "1.0.0";
  tool.content.stack127_repo_commit_sha = "a".repeat(40);
  const db = database();
  await executeBatch(db.pool, [create(tool)], { apply: true });
  assert.match(db.store.content.tool[0].stack127_repo_synced_at, /^tick-/);
  const partial = change(tool, after => { after.content.stack127_repo_url = "https://github.com/stack127labs/other-tool";
    after.content.stack127_repo_version = null; after.content.stack127_repo_commit_sha = null; });
  await executeBatch(db.pool, [partial], { apply: true });
  assert.equal(db.store.content.tool[0].stack127_repo_synced_at, null);
});

for (const catalogSchema of ["original", "renamed"]) {
  test(`catalog reads, creation, updates, and restore use canonical states with ${catalogSchema} physical columns`, async () => {
    const catalog = state("tools", "catalog");
    catalog.content.icon_key = "network";
    catalog.content.home_art_key = "dns-tools";
    catalog.content.hero_art_key = "hero-art";
    const db = database([], { catalogSchema });
    const refs = [{ slug: catalog.slug, family: catalog.family }];
    const creation = create(catalog);
    await executeBatch(db.pool, [creation], { apply: true });
    assert.deepEqual(await readStates(db.client, refs), [catalog]);
    const updated = change(catalog, after => {
      after.content.icon_key = "globe";
      after.content.home_art_key = "domain-tools";
    });
    await executeBatch(db.pool, [updated], { apply: true });
    assert.deepEqual(await readStates(db.client, refs), [updated.after]);
    const physical = db.store.content.catalog[0];
    assert.equal(physical[catalogSchema === "renamed" ? "card_icon_key" : "icon_key"], "globe");
    assert.equal(physical[catalogSchema === "renamed" ? "card_art_key" : "home_art_key"], "domain-tools");
    assert.equal(physical.hero_art_key, "hero-art");
    const writeCount = db.writes().length;
    await executeBatch(db.pool, [updated], { apply: true });
    assert.equal(db.writes().length, writeCount);
    await executeBatch(db.pool, [updated], { apply: true, restore: true });
    assert.deepEqual(await readStates(db.client, refs), [catalog]);
  });

  test(`a batch shares one ${catalogSchema} catalog mapping across selected and dependency reads and writes`, async () => {
    const selected = state("selected-tools", "catalog");
    const dependency = state("other-tools", "catalog");
    const tool = state("tool", "tool");
    tool.catalogs = [{ slug: selected.slug, display_order: 1 }, { slug: dependency.slug, display_order: 1 }];
    const db = database([selected, dependency], { catalogSchema });
    await executeBatch(db.pool, [change(selected, after => { after.content.icon_key = "network"; }), create(tool)], { apply: true });
    assert.equal(db.calls.filter(call => call.sql.includes("information_schema.columns")).length, 1);
    assert.equal(db.store.members.length, 2);
  });
}

test("catalog column resolution is fresh for each read and batch on the same client", async () => {
  const catalog = state("tools", "catalog");
  const db = database([catalog]);
  const refs = [{ slug: catalog.slug, family: catalog.family }];
  assert.deepEqual(await readStates(db.client, refs), [catalog]);
  db.setCatalogSchema("renamed");
  assert.deepEqual(await readStates(db.client, refs), [catalog]);
  const updated = change(catalog, after => { after.content.home_art_key = "new-art"; });
  await executeBatch(db.pool, [updated], { apply: true });
  assert.equal(db.store.content.catalog[0].card_art_key, "new-art");
  assert.equal(db.calls.filter(call => call.sql.includes("information_schema.columns")).length, 3);
});

for (const invalid of [
  { field: "icon_key", error: "Missing", columns: ["home_art_key"] },
  { field: "home_art_key", error: "Missing", columns: ["icon_key"] },
  { field: "icon_key", error: "Ambiguous", columns: ["icon_key", "card_icon_key", "home_art_key"] },
  { field: "home_art_key", error: "Ambiguous", columns: ["icon_key", "home_art_key", "card_art_key"] },
]) {
  test(`${invalid.error.toLowerCase()} mapping for ${invalid.field} rejects catalog reads and batches before writes`, async () => {
    const catalog = state("tools", "catalog");
    const db = database([catalog], { catalogColumns: invalid.columns });
    const expected = new RegExp(`${invalid.error} catalog column mapping for ${invalid.field}`);
    await assert.rejects(readStates(db.client, [{ slug: catalog.slug, family: catalog.family }]), expected);
    const empty = database([], { catalogColumns: invalid.columns });
    await assert.rejects(executeBatch(empty.pool, [create(state("directory")), create(catalog)], { apply: true }), expected);
    assert.equal(empty.writes().length, 0);
    assert.equal(empty.calls.at(-1).sql, "rollback");
    assert.equal(empty.releases, 1);
  });
}

test("directory assets are complete managed state and restore exactly without writes on retries", async () => {
  const directory = state("directory", "directory", true);
  directory.content.card_icon_key = "book";
  directory.content.card_art_key = "cli-apps";
  const db = database([directory]);
  const refs = [{ slug: directory.slug, family: directory.family }];
  assert.deepEqual(await readStates(db.client, refs), [directory]);
  const updated = change(directory, after => {
    after.content.card_icon_key = "globe";
    after.content.card_art_key = "dns-tools";
  });
  const original = db.store;
  await executeBatch(db.pool, [updated]);
  assert.deepEqual(db.store, original);
  await executeBatch(db.pool, [updated], { apply: true });
  assert.deepEqual(await readStates(db.client, refs), [updated.after]);
  assert.equal(db.store.content.directory[0].card_icon_key, "globe");
  assert.equal(db.store.content.directory[0].card_art_key, "dns-tools");
  assert.equal(db.store.content.directory[0].content_revision, 1);
  const applied = db.store;
  let writes = db.writes().length;
  assert.equal((await executeBatch(db.pool, [updated], { apply: true })).pages[0].changed, false);
  assert.equal(db.writes().length, writes);
  assert.deepEqual(db.store, applied);
  await executeBatch(db.pool, [updated], { apply: true, restore: true });
  assert.deepEqual(await readStates(db.client, refs), [directory]);
  const restored = db.store;
  writes = db.writes().length;
  assert.equal((await executeBatch(db.pool, [updated], { apply: true, restore: true })).pages[0].changed, false);
  assert.equal(db.writes().length, writes);
  assert.deepEqual(db.store, restored);
  assert.equal(db.calls.filter(call => call.sql.includes("information_schema.columns")).length, 0);
});

test("restore returns directory assets to null and retries without writes", async () => {
  const before = state("directory", "directory", true);
  const entry = change(before, after => {
    after.content.card_icon_key = "book";
    after.content.card_art_key = "cli-apps";
  });
  const db = database([before]);
  await executeBatch(db.pool, [entry], { apply: true });
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [before]);
  const restored = db.store;
  const writes = db.writes().length;
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.equal(db.writes().length, writes);
  assert.deepEqual(db.store, restored);
});

test("directory asset edits after prepare prevent apply and restore from overwriting them", async () => {
  const before = state("directory");
  const entry = change(before, after => { after.content.card_art_key = "cli-apps"; });
  for (const restore of [false, true]) {
    const current = structuredClone(restore ? entry.after : before);
    current.content.card_icon_key = "book";
    const db = database([current]);
    await assert.rejects(executeBatch(db.pool, [entry], { apply: true, restore }), /Publishing conflict/);
    assert.equal(db.writes().length, 0);
    assert.deepEqual(await readStates(db.client, [{ slug: current.slug, family: current.family }]), [current]);
  }
});

test("directory assets accept null, reject invalid keys and timestamps, and require complete snapshots", async () => {
  const directory = state("directory");
  assert.deepEqual(validateState(directory), directory);
  for (const field of CONTENT_FIELDS.directory) {
    const incomplete = structuredClone(directory);
    delete incomplete.content[field];
    assert.throws(() => validateState(incomplete), /Missing directory content field/);
  }
  for (const field of ["card_icon_key", "card_art_key"]) {
    for (const value of ["", "Unknown", "bad/key", 1]) {
      assert.throws(() => validateState({ ...directory, content: { ...directory.content, [field]: value } }));
    }
    const db = database([directory]);
    const entry = change(directory, after => { after.content[field] = "cli-apps"; });
    entry.before = structuredClone(entry.before);
    delete entry.before.content[field];
    await assert.rejects(executeBatch(db.pool, [entry], { apply: true }), /Regenerate the plan/);
    assert.equal(db.calls.length, 0);
  }
  for (const field of ["published_at", "updated_at", "row_created_at", "row_updated_at"]) {
    assert.throws(() => validateState({ ...directory, registry: { ...directory.registry, [field]: "old" } }), /Unknown registry field/);
  }
  assert.throws(() => validateState({ ...directory, content: { ...directory.content, row_updated_at: "old" } }), /Unknown directory content field/);
});

test("shared targets preserve saved states and remove only invalid memberships from new tools", () => {
  const incomplete = state("incomplete-tools", "catalog");
  incomplete.content = null;
  const completed = state(incomplete.slug, "catalog", true);
  const newCatalog = state("new-tools", "catalog", true);
  const newTool = state("new-tool", "tool", true);
  newTool.catalogs = [{ slug: incomplete.slug, display_order: 1 },
    { slug: "other-tools", display_order: 7 }, { slug: newCatalog.slug, display_order: 3 }];
  const existingTool = state("existing-tool", "tool");
  existingTool.catalogs = [{ slug: "other-tools", display_order: 4 }];
  const entries = [{ slug: incomplete.slug, family: "catalog", before: incomplete, after: completed },
    create(newTool), create(newCatalog), change(existingTool, after => { after.content.title = "Updated title"; })]
    .map(entry => ({ ...entry, requirements: {} }));
  const original = structuredClone(entries);
  assert.deepEqual(desiredStates(entries), entries.map(entry => entry.after));
  const expectedTool = { ...newTool, registry: { ...newTool.registry, is_published: false },
    catalogs: [{ slug: "other-tools", display_order: 7 }, { slug: newCatalog.slug, display_order: 3 }] };
  const expectedCatalog = { ...newCatalog, registry: { ...newCatalog.registry, is_published: false } };
  assert.deepEqual(desiredStates(entries, { restore: true }), [incomplete, expectedTool, expectedCatalog, existingTool]);
  assert.deepEqual(entries, original);
  const incompatibleSaved = change({ ...existingTool, catalogs: [{ slug: incomplete.slug, display_order: 2 }] },
    after => { after.catalogs = []; });
  assert.deepEqual(desiredStates([entries[0], incompatibleSaved], { restore: true })[1], incompatibleSaved.before);
});

for (const catalogSchema of ["original", "renamed"]) {
  test(`restoring a completed catalog and its first new tool succeeds and retries without writes on ${catalogSchema} schema`, async () => {
    const incomplete = state("tools", "catalog");
    incomplete.content = null;
    const completed = state(incomplete.slug, "catalog", true);
    const tool = state("first-tool", "tool", true);
    tool.catalogs = [{ slug: incomplete.slug, display_order: 1 }];
    const entries = [create(tool), { slug: incomplete.slug, family: "catalog", before: incomplete, after: completed }];
    const db = database([incomplete], { catalogSchema });
    const refs = entries.map(({ slug, family }) => ({ slug, family }));
    await executeBatch(db.pool, entries, { apply: true });
    assert.deepEqual(await readStates(db.client, refs), desiredStates(entries));
    const appliedStore = db.store;
    const preview = await executeBatch(db.pool, entries, { restore: true });
    assert.deepEqual(preview.states, desiredStates(entries, { restore: true }));
    assert.deepEqual(db.store, appliedStore);
    const restored = await executeBatch(db.pool, entries, { apply: true, restore: true });
    assert.deepEqual(restored.states, desiredStates(entries, { restore: true }));
    assert.deepEqual(await readStates(db.client, refs), restored.states);
    assert.equal(db.store.pages.length, 2);
    assert.equal(db.store.content.catalog.length, 0);
    assert.equal(db.store.content.tool.length, 1);
    assert.equal(db.store.members.length, 0);
    assert.equal(restored.states[0].registry.is_published, false);
    assert.deepEqual(restored.states[0].content, tool.content);
    assert.deepEqual(restored.states[1], incomplete);
    const beforeRetry = db.store;
    const writeCount = db.writes().length;
    const retry = await executeBatch(db.pool, entries, { apply: true, restore: true });
    assert.ok(retry.pages.every(page => !page.changed));
    assert.equal(db.writes().length, writeCount);
    assert.deepEqual(db.store, beforeRetry);
  });
}

test("restore keeps valid memberships on new drafts and compacts their catalog ranks", async () => {
  const incomplete = state("incomplete-tools", "catalog");
  incomplete.content = null;
  const completed = state(incomplete.slug, "catalog", true);
  const retained = state("retained-tools", "catalog", true);
  const newCatalog = state("new-tools", "catalog", true);
  const seed = state("seed-tool", "tool", true);
  seed.catalogs = [{ slug: retained.slug, display_order: 1 }];
  const tool = state("new-tool", "tool", true);
  tool.catalogs = [{ slug: incomplete.slug, display_order: 1 },
    { slug: retained.slug, display_order: 7 }, { slug: newCatalog.slug, display_order: 3 }];
  const entries = [{ slug: incomplete.slug, family: "catalog", before: incomplete, after: completed },
    create(tool), create(newCatalog)];
  const db = database([incomplete, retained, seed]);
  await executeBatch(db.pool, entries, { apply: true });
  await executeBatch(db.pool, entries, { apply: true, restore: true });
  const wanted = desiredStates(entries, { restore: true });
  assert.deepEqual(await readStates(db.client, entries.map(({ slug, family }) => ({ slug, family }))), wanted);
  const id = db.store.pages.find(page => page.slug === tool.slug).id;
  const memberships = db.store.members.filter(member => member.tool_page_id === id);
  assert.deepEqual(memberships.map(member => [member.catalog_rank, member.display_order]), [[1, 7], [2, 3]]);
});

test("restore rejects an incompatible unselected membership without changing any saved state", async () => {
  const incomplete = state("tools", "catalog");
  incomplete.content = null;
  const completed = state(incomplete.slug, "catalog", true);
  const tool = state("first-tool", "tool", true);
  tool.catalogs = [{ slug: incomplete.slug, display_order: 1 }];
  const entries = [{ slug: incomplete.slug, family: "catalog", before: incomplete, after: completed }, create(tool)];
  const db = database([incomplete]);
  await executeBatch(db.pool, entries, { apply: true });
  const unselected = state("unselected-tool", "tool");
  unselected.catalogs = [{ slug: incomplete.slug, display_order: 2 }];
  await executeBatch(db.pool, [create(unselected)], { apply: true });
  const beforeRestore = db.store;
  const writeCount = db.writes().length;
  await assert.rejects(executeBatch(db.pool, entries, { apply: true, restore: true }), /Catalog family content is missing/);
  assert.equal(db.writes().length, writeCount);
  assert.deepEqual(db.store, beforeRestore);
});

for (const published of [false, true]) {
  test(`repo-only changes advance internal registry freshness without public dates or version changes on ${published ? "published pages" : "drafts"}`, async () => {
    const catalog = state("tools", "catalog", true);
    const tool = state("tool", "tool", published);
    tool.catalogs = [{ slug: catalog.slug, display_order: 1 }];
    const db = database([catalog, tool]);
    const initialPage = db.store.pages.find(page => page.slug === tool.slug);
    const initialContent = db.store.content.tool[0];
    const link = change(tool, after => { after.content.stack127_repo_url = "https://github.com/stack127labs/tool"; });
    await executeBatch(db.pool, [link], { apply: true });
    const linkedPage = db.store.pages.find(page => page.slug === tool.slug);
    const linkedContent = db.store.content.tool[0];
    assert.notEqual(linkedPage.row_updated_at, initialPage.row_updated_at);
    assert.equal(linkedPage.published_at, initialPage.published_at);
    assert.equal(linkedPage.updated_at, initialPage.updated_at);
    assert.equal(linkedContent.content_revision, initialContent.content_revision);
    assert.equal(linkedContent.tool_version_updated_at, initialContent.tool_version_updated_at);
    assert.equal(linkedContent.stack127_repo_synced_at, null);
    const verified = change(link.after, after => {
      after.content.stack127_repo_version = "1.0.0";
      after.content.stack127_repo_commit_sha = "a".repeat(40);
    });
    await executeBatch(db.pool, [verified], { apply: true });
    const verifiedPage = db.store.pages.find(page => page.slug === tool.slug);
    const verifiedContent = db.store.content.tool[0];
    assert.notEqual(verifiedPage.row_updated_at, linkedPage.row_updated_at);
    assert.equal(verifiedPage.published_at, initialPage.published_at);
    assert.equal(verifiedPage.updated_at, initialPage.updated_at);
    assert.equal(verifiedContent.content_revision, initialContent.content_revision);
    assert.equal(verifiedContent.tool_version_updated_at, initialContent.tool_version_updated_at);
    assert.match(verifiedContent.stack127_repo_synced_at, /^tick-/);
    const beforeRetry = db.store;
    const count = db.writes().length;
    await executeBatch(db.pool, [verified], { apply: true });
    assert.equal(db.writes().length, count);
    assert.deepEqual(db.store, beforeRetry);
    await executeBatch(db.pool, [verified], { apply: true, restore: true });
    const restoredPage = db.store.pages.find(page => page.slug === tool.slug);
    assert.notEqual(restoredPage.row_updated_at, verifiedPage.row_updated_at);
    assert.equal(restoredPage.published_at, initialPage.published_at);
    assert.equal(restoredPage.updated_at, initialPage.updated_at);
    assert.deepEqual(await readStates(db.client, [{ slug: tool.slug, family: "tool" }]), [link.after]);
  });
}


async function repositoryFixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "page-publishing-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const routes = { directory: "app/(site)/(directories)/[...slug]/page.tsx",
    catalog: "app/(site)/(catalogs)/[slug]/page.tsx", tool: "app/(site)/(tools)/[slug]/page.tsx" };
  for (const route of Object.values(routes)) {
    await mkdir(path.dirname(path.join(root, route)), { recursive: true });
    await writeFile(path.join(root, route), "export default function Page() {}\n");
    await writeFile(path.join(root, path.dirname(route), "layout.tsx"), "export default registryLayout;\n");
  }
  await mkdir(path.join(root, "lib"));
  for (const file of ["card-icons.ts", "card-art.ts", "page-registry-helpers.ts"]) {
    await writeFile(path.join(root, "lib", file), await readFile(new URL(`../../lib/${file}`, import.meta.url)));
  }
  await writeFile(path.join(root, "app/marker-art-registry.json"), "{}\n");
  return { root, requirements(family = "directory") {
    return { route: routes[family], assets: ["lib/card-icons.ts", "lib/card-art.ts"], checks: [], smoke: [],
      ...(family === "directory" ? { records: { kind: "code", files: ["lib/card-icons.ts"] } } : {}) };
  } };
}

const prepareOptions = root => ({ kind: "directories", environment: "development", root, sourceCommit: "a".repeat(40) });
const directoryManifest = (page, requirements) => ({ schema_version: 1, kind: "directories",
  pages: [{ ...page, family: "directory", requirements }] });

test("prepare defaults new pages to indexable and preserves existing noindex settings", async t => {
  const fixture = await repositoryFixture(t);
  const newPage = state("new-directory", "directory", true);
  delete newPage.registry.is_indexable;
  const created = await preparePlan(database().pool,
    directoryManifest({ slug: newPage.slug, registry: newPage.registry, content: newPage.content }, fixture.requirements()), prepareOptions(fixture.root));
  assert.equal(created.pages[0].after.registry.is_indexable, true);
  const existing = state("directory", "directory", true);
  existing.registry.is_indexable = false;
  const db = database([existing]);
  const unchanged = await preparePlan(db.pool,
    directoryManifest({ slug: existing.slug, content: { intro_markdown: "Reviewed copy" } }, fixture.requirements()), prepareOptions(fixture.root));
  assert.equal(unchanged.pages[0].after.registry.is_indexable, false);
  for (const invalid of ["false", null, 0]) {
    await assert.rejects(preparePlan(db.pool,
      directoryManifest({ slug: existing.slug, registry: { is_indexable: invalid } }, fixture.requirements()), prepareOptions(fixture.root)), /is_indexable must be a boolean/);
  }
});

test("indexability-only batches preview, apply, retry and restore without changing publication", async () => {
  const before = state("directory", "directory", true);
  const entry = change(before, after => { after.registry.is_indexable = false; });
  const db = database([before]);
  await executeBatch(db.pool, [entry]);
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [before]);
  await executeBatch(db.pool, [entry], { apply: true });
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [entry.after]);
  assert.equal(db.store.pages[0].is_published, true);
  assert.notEqual(db.store.pages[0].published_at, null);
  const writes = db.writes().length;
  await executeBatch(db.pool, [entry], { apply: true });
  assert.equal(db.writes().length, writes);
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [before]);
});

test("prepare freezes directory assets, preserves omitted values and supports explicit null restore", async t => {
  const fixture = await repositoryFixture(t);
  const before = state("directory", "directory", true);
  before.content.card_icon_key = "book";
  before.content.card_art_key = "cli-apps";
  const db = database([before]);
  const manifest = directoryManifest({ slug: before.slug, content: { intro_markdown: "Reviewed introduction" } }, fixture.requirements());
  const plan = await preparePlan(db.pool, manifest, prepareOptions(fixture.root));
  assert.deepEqual(plan.pages[0].before, before);
  assert.equal(plan.pages[0].after.content.card_icon_key, "book");
  assert.equal(plan.pages[0].after.content.card_art_key, "cli-apps");
  manifest.pages[0].content = { card_icon_key: null, card_art_key: null };
  const cleared = await preparePlan(db.pool, manifest, prepareOptions(fixture.root));
  assert.equal(cleared.pages[0].after.content.card_icon_key, null);
  assert.equal(cleared.pages[0].after.content.card_art_key, null);
  const { requirements, ...entry } = cleared.pages[0];
  await executeBatch(db.pool, [entry], { apply: true });
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [entry.after]);
  await executeBatch(db.pool, [entry], { apply: true, restore: true });
  assert.deepEqual(await readStates(db.client, [{ slug: before.slug, family: before.family }]), [before]);
  assert.equal(plan.pages[0].after.content.card_icon_key, "book");
});

test("new directory plans carry nullable asset defaults and persist explicit registered assets", async t => {
  const fixture = await repositoryFixture(t);
  for (const assets of [{}, { card_icon_key: "book", card_art_key: "cli-apps" }]) {
    const after = state("new-directory", "directory", true);
    const content = { ...after.content, ...assets };
    if (!Object.keys(assets).length) {
      delete content.card_icon_key;
      delete content.card_art_key;
    }
    const db = database();
    const plan = await preparePlan(db.pool, directoryManifest({ slug: after.slug, registry: after.registry, content }, fixture.requirements()), prepareOptions(fixture.root));
    const entry = plan.pages[0];
    assert.equal(entry.before, null);
    assert.equal(entry.after.content.card_icon_key, assets.card_icon_key ?? null);
    assert.equal(entry.after.content.card_art_key, assets.card_art_key ?? null);
    const batch = [{ slug: entry.slug, family: entry.family, before: entry.before, after: entry.after }];
    await executeBatch(db.pool, batch, { apply: true });
    assert.deepEqual(await readStates(db.client, [{ slug: entry.slug, family: entry.family }]), [entry.after]);
    const written = db.store;
    const writes = db.writes().length;
    await executeBatch(db.pool, batch, { apply: true });
    assert.equal(db.writes().length, writes);
    assert.deepEqual(db.store, written);
    await executeBatch(db.pool, batch, { apply: true, restore: true });
    assert.deepEqual(await readStates(db.client, [{ slug: entry.slug, family: entry.family }]),
      [{ ...entry.after, registry: { ...entry.after.registry, is_published: false } }]);
  }
});

test("development-sourced prepare freezes reviewed directory assets and target before values", async t => {
  const fixture = await repositoryFixture(t);
  const target = state("directory");
  target.content.card_icon_key = "book";
  target.content.card_art_key = "cli-apps";
  const reviewed = structuredClone(target);
  reviewed.content.card_icon_key = "globe";
  reviewed.content.card_art_key = "dns-tools";
  const db = database([target]);
  const development = database([reviewed]);
  const plan = await preparePlan(db.pool, directoryManifest({ slug: target.slug, source: "development", registry: { is_published: true } }, fixture.requirements()),
    { ...prepareOptions(fixture.root), environment: "production", developmentPool: development.pool });
  assert.deepEqual(plan.pages[0].before.content, target.content);
  assert.deepEqual(plan.pages[0].after.content, reviewed.content);
  await executeBatch(development.pool, [change(reviewed, after => { after.content.card_art_key = "domain-tools"; })], { apply: true });
  assert.equal(plan.pages[0].after.content.card_art_key, "dns-tools");
  assert.equal(db.writes().length, 0);
});

test("readiness checks shared registry keys for directories, catalogs and tools", async t => {
  const fixture = await repositoryFixture(t);
  for (const family of ["directory", "catalog", "tool"]) {
    const page = state("example", family, true);
    if (family === "catalog") {
      page.content.hero_art_key = "dns-tools";
      page.content.home_art_key = "cli-apps";
    } else {
      page.content.card_icon_key = "book";
      page.content.card_art_key = "cli-apps";
    }
    await checkRepositoryRequirements(fixture.requirements(family), page, fixture.root);
    const fields = family === "catalog" ? ["icon_key", "hero_art_key", "home_art_key"] : ["card_icon_key", "card_art_key"];
    for (const field of fields) {
      for (const key of ["unregistered-key", "constructor", "tostring"]) {
        const invalid = structuredClone(page);
        invalid.content[field] = key;
        await assert.rejects(checkRepositoryRequirements(fixture.requirements(family), invalid, fixture.root), /Unregistered icon or card art/);
      }
    }
  }
});

test("homepage directories require both registered assets while children can inherit null assets", async t => {
  const fixture = await repositoryFixture(t);
  const page = state("cli-apps", "directory", true);
  for (const field of ["card_icon_key", "card_art_key"]) {
    const invalid = structuredClone(page);
    invalid.content[field === "card_icon_key" ? "card_art_key" : "card_icon_key"] = "cli-apps";
    await assert.rejects(checkRepositoryRequirements(fixture.requirements(), invalid, fixture.root), /Homepage directory.*requires registered/);
  }
  page.content.card_icon_key = "cli-apps";
  page.content.card_art_key = "cli-apps";
  await checkRepositoryRequirements(fixture.requirements(), page, fixture.root);
  const child = state("cli-apps/item", "directory", true);
  await checkRepositoryRequirements(fixture.requirements(), child, fixture.root);
  const db = database([page]);
  await executeBatch(db.pool, [create(child)], { apply: true });
  assert.deepEqual(await readStates(db.client, [{ slug: child.slug, family: child.family }]), [child]);
  const draft = state("cli-apps");
  await checkRepositoryRequirements(fixture.requirements(), draft, fixture.root);
});

test("prepare rejects invalid directory registry keys without writing pages", async t => {
  const fixture = await repositoryFixture(t);
  for (const field of ["card_icon_key", "card_art_key"]) {
    const after = state("directory", "directory", true);
    after.content[field] = "unregistered-key";
    const db = database();
    await assert.rejects(preparePlan(db.pool, directoryManifest({ slug: after.slug, registry: after.registry, content: after.content }, fixture.requirements()), prepareOptions(fixture.root)), /Unregistered icon or card art/);
    assert.equal(db.writes().length, 0);
    assert.equal(db.store.pages.length, 0);
  }
});

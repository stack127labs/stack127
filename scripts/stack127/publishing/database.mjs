import { isDeepStrictEqual } from "node:util";
import { CONTENT_FIELDS, REGISTRY_FIELDS, desiredStates, validateRef, validateState } from "./model.mjs";

const TABLES = Object.freeze({
  tool: "public.stack127_tool_pages",
  directory: "public.stack127_directory_pages",
  catalog: "public.stack127_catalog_pages",
});
const REPO_FIELDS = ["stack127_repo_url", "stack127_repo_version", "stack127_repo_commit_sha"];
const CATALOG_COLUMN_NAMES = Object.freeze({
  icon_key: Object.freeze(["icon_key", "card_icon_key"]),
  home_art_key: Object.freeze(["home_art_key", "card_art_key"]),
});

function contentColumnResolver(client) {
  let catalogColumns;
  return async family => {
    if (family !== "catalog") return CONTENT_FIELDS[family];
    if (!catalogColumns) {
      const { rows } = await client.query(`
        select column_name from information_schema.columns
        where table_schema = $1 and table_name = $2 and column_name = any($3::text[])
      `, ["public", "stack127_catalog_pages", Object.values(CATALOG_COLUMN_NAMES).flat()]);
      const found = new Set(rows.map(row => row.column_name));
      const mapping = {};
      for (const [field, names] of Object.entries(CATALOG_COLUMN_NAMES)) {
        const matches = names.filter(name => found.has(name));
        if (matches.length !== 1) {
          throw new Error(`${matches.length ? "Ambiguous" : "Missing"} catalog column mapping for ${field}`);
        }
        mapping[field] = matches[0];
      }
      catalogColumns = CONTENT_FIELDS.catalog.map(field => mapping[field] ?? field);
    }
    return catalogColumns;
  };
}

function project(row, fields) {
  return Object.fromEntries(fields.map(field => [field,
    field === "sitemap_priority" || field === "home_order" ? Number(row[field]) : row[field],
  ]));
}

function references(refs) {
  if (!Array.isArray(refs)) throw new Error("Page references must be an array");
  return refs.map(validateRef);
}

async function readManaged(client, refs, lock = false, columns = contentColumnResolver(client)) {
  if (!refs.length) return { states: [], rows: new Map() };
  const { rows: pages } = await client.query(`
    select id, slug, page_family, ${REGISTRY_FIELDS.join(", ")}
    from public.stack127_pages where slug = any($1::text[])
    order by slug ${lock ? "for update" : ""}
  `, [[...new Set(refs.map(ref => ref.slug))]]);
  const bySlug = new Map(pages.map(page => [page.slug, page]));
  for (const ref of refs) {
    const page = bySlug.get(ref.slug);
    if (page && page.page_family !== ref.family) {
      throw new Error(`Wrong page family for ${ref.slug}: expected ${ref.family}, found ${page.page_family}`);
    }
  }
  const contents = new Map();
  for (const family of Object.keys(TABLES)) {
    const ids = [...new Set(refs.filter(ref => ref.family === family)
      .map(ref => bySlug.get(ref.slug)?.id).filter(id => id !== undefined))];
    if (!ids.length) continue;
    const physical = await columns(family);
    const selection = CONTENT_FIELDS[family].map((field, index) =>
      physical[index] === field ? field : `${physical[index]} as ${field}`);
    const { rows } = await client.query(`
      select page_id, ${selection.join(", ")}
      from ${TABLES[family]} where page_id = any($1::bigint[])
      order by page_id ${lock ? "for update" : ""}
    `, [ids]);
    for (const row of rows) contents.set(String(row.page_id), project(row, CONTENT_FIELDS[family]));
  }
  const memberships = new Map();
  const toolIds = [...new Set(refs.filter(ref => ref.family === "tool")
    .map(ref => bySlug.get(ref.slug)?.id).filter(id => id !== undefined))];
  if (toolIds.length) {
    const { rows } = await client.query(`
      select member.tool_page_id, catalog.slug, member.catalog_rank, member.display_order
      from public.stack127_tool_catalog_memberships member
      join public.stack127_pages catalog on catalog.id = member.catalog_page_id
      where member.tool_page_id = any($1::bigint[])
      order by member.tool_page_id, member.catalog_rank ${lock ? "for update of member" : ""}
    `, [toolIds]);
    for (const row of rows) {
      const key = String(row.tool_page_id);
      if (!memberships.has(key)) memberships.set(key, []);
      memberships.get(key).push({ slug: row.slug, display_order: Number(row.display_order) });
    }
  }
  const states = refs.map(ref => {
    const page = bySlug.get(ref.slug);
    if (!page) return null;
    return validateState({
      ...ref, registry: project(page, REGISTRY_FIELDS), content: contents.get(String(page.id)) ?? null,
      ...(ref.family === "tool" ? { catalogs: memberships.get(String(page.id)) ?? [] } : {}),
    });
  });
  return { states, rows: bySlug };
}

export async function readStates(client, refs) {
  return (await readManaged(client, references(refs))).states;
}

function batchEntries(entries, restore) {
  if (!Array.isArray(entries) || !entries.length) throw new Error("The batch must contain at least one page");
  const seen = new Set();
  const batch = entries.map(entry => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)
      || Object.keys(entry).some(key => !["slug", "family", "before", "after"].includes(key))
      || !Object.hasOwn(entry, "before") || !Object.hasOwn(entry, "after")) {
      throw new Error("Each batch entry must contain slug, family, before, and after only");
    }
    const ref = validateRef({ slug: entry.slug, family: entry.family });
    if (seen.has(ref.slug)) throw new Error(`Duplicate batch page: ${ref.slug}`);
    seen.add(ref.slug);
    const before = entry.before === null ? null : validateState(entry.before, ref.family);
    const after = validateState(entry.after, ref.family);
    if ((before && before.slug !== ref.slug) || after.slug !== ref.slug) {
      throw new Error(`State slug does not match batch entry: ${ref.slug}`);
    }
    if (after.content === null) throw new Error(`Desired ${ref.family} content is missing for ${ref.slug}`);
    return { ...ref, before, after };
  });
  const targets = desiredStates(batch, { restore });
  return batch.map((entry, index) => ({ ...entry, desired: targets[index] }));
}

function parentSlug(slug) {
  return slug.includes("/") ? slug.slice(0, slug.lastIndexOf("/")) : null;
}

async function readDependencies(client, entries, current, columns) {
  const selected = new Set(entries.map(entry => entry.slug));
  const refs = new Map();
  const add = (slug, family) => {
    if (selected.has(slug)) {
      if (entries.find(entry => entry.slug === slug).family !== family) {
        throw new Error(`Wrong page family for dependency ${slug}: expected ${family}`);
      }
    } else {
      const prior = refs.get(slug);
      if (prior && prior.family !== family) throw new Error(`Conflicting dependency families for ${slug}`);
      refs.set(slug, { slug, family });
    }
  };
  const catalogs = new Set();
  entries.forEach((entry, index) => {
    if (entry.family === "catalog") catalogs.add(entry.slug);
    if (entry.family === "tool") {
      for (const state of [entry.before, entry.after, entry.desired, current[index]]) {
        for (const catalog of state?.catalogs ?? []) {
          catalogs.add(catalog.slug);
          add(catalog.slug, "catalog");
        }
      }
    }
    if (entry.family === "directory") {
      for (let parent = parentSlug(entry.slug); parent; parent = parentSlug(parent)) add(parent, "directory");
    }
  });

  // Include published descendants so unpublishing a parent cannot orphan them.
  const prefixes = entries.filter(entry => entry.family === "directory").map(entry => `${entry.slug}/`);
  if (prefixes.length) {
    const { rows } = await client.query(`
      select slug from public.stack127_pages page
      where page_family = 'directory' and is_published
        and exists (select 1 from unnest($1::text[]) as prefix(value)
          where left(page.slug, length(prefix.value)) = prefix.value)
      order by slug for update of page
    `, [prefixes]);
    for (const row of rows) {
      add(row.slug, "directory");
      for (let parent = parentSlug(row.slug); parent; parent = parentSlug(parent)) add(parent, "directory");
    }
  }
  const dependencyRefs = [...refs.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  const dependencies = await readManaged(client, dependencyRefs, true, columns);
  const final = new Map(dependencyRefs.map((ref, index) => [ref.slug, dependencies.states[index]]));
  for (const entry of entries) final.set(entry.slug, entry.desired);

  const { rows: members } = catalogs.size ? await client.query(`
    select catalog.slug as catalog_slug, tool.slug as tool_slug,
      tool.is_published as tool_published, member.display_order
    from public.stack127_tool_catalog_memberships member
    join public.stack127_pages catalog on catalog.id = member.catalog_page_id
    join public.stack127_pages tool on tool.id = member.tool_page_id
    where catalog.slug = any($1::text[])
    order by catalog.slug, member.display_order for update of member, tool
  `, [[...catalogs].sort()]) : { rows: [] };
  return { final, members, rows: dependencies.rows, catalogs };
}

function checkFinalState(entries, current, { final, members, catalogs }) {
  const selectedTools = new Set(entries.filter(entry => entry.family === "tool").map(entry => entry.slug));
  const finalMembers = members.filter(member => !selectedTools.has(member.tool_slug))
    .map(member => ({ ...member, display_order: Number(member.display_order) }));
  for (const entry of entries.filter(entry => entry.family === "tool")) {
    for (const catalog of entry.desired.catalogs) {
      finalMembers.push({ catalog_slug: catalog.slug, tool_slug: entry.slug,
        tool_published: entry.desired.registry.is_published, display_order: catalog.display_order });
    }
    if (entry.desired.registry.is_published && !entry.desired.catalogs.length) {
      throw new Error(`Published tool ${entry.slug} must belong to a catalog`);
    }
  }
  const orders = new Map();
  for (const member of finalMembers) {
    const key = `${member.catalog_slug}:${member.display_order}`;
    if (orders.has(key)) {
      throw new Error(`Display order ${member.display_order} is occupied in ${member.catalog_slug} by ${orders.get(key)}`);
    }
    orders.set(key, member.tool_slug);
    const catalog = final.get(member.catalog_slug);
    if (!catalog?.content || catalog.family !== "catalog") {
      throw new Error(`Catalog family content is missing for ${member.catalog_slug}`);
    }
    if (member.tool_published && !catalog.registry.is_published) {
      throw new Error(`Published tool ${member.tool_slug} requires published catalog ${member.catalog_slug}`);
    }
  }
  for (const slug of catalogs) {
    const catalog = final.get(slug);
    const index = entries.findIndex(entry => entry.slug === slug);
    if (catalog?.registry.is_published && index !== -1 && !current[index]?.registry.is_published
      && !finalMembers.some(member => member.catalog_slug === slug && member.tool_published)) {
      throw new Error(`Cannot publish empty catalog ${slug}`);
    }
  }
  for (const [slug, state] of final) {
    if (!state?.registry.is_published) continue;
    if (!state.content) throw new Error(`Published ${state.family} content is missing for ${slug}`);
    if (state.family === "directory" && parentSlug(slug)) {
      const parent = final.get(parentSlug(slug));
      if (parent?.family !== "directory" || !parent.content || !parent.registry.is_published) {
        throw new Error(`Published directory ${slug} requires published parent ${parentSlug(slug)}`);
      }
    }
  }
}

async function insertRegistry(client, state) {
  const registry = { ...state.registry, is_published: false };
  const fields = ["slug", "page_family", ...REGISTRY_FIELDS];
  const values = [state.slug, state.family, ...REGISTRY_FIELDS.map(field => registry[field])];
  const { rows } = await client.query(`
    insert into public.stack127_pages (${fields.join(", ")})
    values (${values.map((_, index) => `$${index + 1}`).join(", ")}) returning id
  `, values);
  return rows[0].id;
}

async function writeContent(client, id, family, before, after, columns) {
  if (isDeepStrictEqual(before, after)) return;
  if (after === null) {
    await client.query(`delete from ${TABLES[family]} where page_id = $1`, [id]);
    return;
  }
  const fields = CONTENT_FIELDS[family];
  const physical = await columns(family);
  const values = [id, ...fields.map(field => after[field])];
  const repoChanged = family === "tool" && REPO_FIELDS.some(field => before?.[field] !== after[field]);
  const repoTimestamp = family === "tool" && REPO_FIELDS.every(field => after[field] !== null)
    ? "now()" : "null";
  if (before === null) {
    const extraFields = family === "tool" ? ", tool_version_updated_at, stack127_repo_synced_at" : "";
    const extraValues = family === "tool" ? `, now(), ${repoTimestamp}` : "";
    await client.query(`
      insert into ${TABLES[family]} (page_id, ${physical.join(", ")}${extraFields})
      values (${values.map((_, index) => `$${index + 1}`).join(", ")}${extraValues})
    `, values);
  } else {
    await client.query(`
      update ${TABLES[family]} set ${physical.map((field, index) => `${field} = $${index + 2}`).join(", ")}
        ${repoChanged ? `, stack127_repo_synced_at = ${repoTimestamp}` : ""}
      where page_id = $1
    `, values);
  }
}

async function writeRegistry(client, id, before, after, touch = false) {
  if (isDeepStrictEqual(before, after)) {
    if (touch) await client.query("update public.stack127_pages set row_updated_at = now() where id = $1", [id]);
    return;
  }
  // Family triggers own revisions. Registry publication needs explicit public dates.
  await client.query(`
    update public.stack127_pages set
      ${REGISTRY_FIELDS.map((field, index) => `${field} = $${index + 2}`).join(", ")},
      published_at = case when $5::boolean then coalesce(published_at, now()) else null end,
      updated_at = case when $5::boolean then now() else null end
    where id = $1
  `, [id, ...REGISTRY_FIELDS.map(field => after[field])]);
}

export async function executeBatch(pool, entries, { apply = false, restore = false } = {}) {
  if (typeof apply !== "boolean" || typeof restore !== "boolean") throw new Error("apply and restore must be booleans");
  const batch = batchEntries(entries, restore);
  const refs = batch.map(({ slug, family }) => ({ slug, family }));
  const client = await pool.connect();
  try {
    await client.query("begin isolation level serializable");
    await client.query("set local lock_timeout = '10s'");
    await client.query("set local statement_timeout = '60s'");
    await client.query("set local idle_in_transaction_session_timeout = '60s'");
    await client.query("select pg_advisory_xact_lock(hashtextextended($1, 0))", ["stack127-page-publishing"]);
    const columns = contentColumnResolver(client);
    const current = await readManaged(client, refs, true, columns);
    const changed = batch.map((entry, index) => {
      const state = current.states[index];
      if (isDeepStrictEqual(state, entry.desired)) return false;
      const expected = restore ? entry.after : entry.before;
      if (!isDeepStrictEqual(state, expected)) {
        throw new Error(`Publishing conflict for ${entry.slug}: current managed state differs from the frozen plan`);
      }
      return true;
    });
    const dependencies = await readDependencies(client, batch, current.states, columns);
    checkFinalState(batch, current.states, dependencies);
    if (batch.some(entry => entry.family === "catalog")) await columns("catalog");
    const ids = new Map([...current.rows, ...dependencies.rows].map(([slug, row]) => [slug, row.id]));
    for (let index = 0; index < batch.length; index++) {
      if (changed[index] && current.states[index] === null) {
        ids.set(batch[index].slug, await insertRegistry(client, batch[index].desired));
      }
    }
    const membershipChanges = batch.filter((entry, index) => changed[index] && entry.family === "tool"
      && !isDeepStrictEqual(current.states[index]?.catalogs ?? [], entry.desired.catalogs));
    if (membershipChanges.length) {
      await client.query("delete from public.stack127_tool_catalog_memberships where tool_page_id = any($1::bigint[])",
        [membershipChanges.map(entry => ids.get(entry.slug))]);
    }
    for (let index = 0; index < batch.length; index++) {
      if (changed[index]) await writeContent(client, ids.get(batch[index].slug), batch[index].family,
        current.states[index]?.content ?? null, batch[index].desired.content, columns);
    }
    for (const entry of membershipChanges) {
      for (const [index, catalog] of entry.desired.catalogs.entries()) {
        await client.query(`
          insert into public.stack127_tool_catalog_memberships
            (catalog_page_id, tool_page_id, catalog_rank, display_order) values ($1, $2, $3, $4)
        `, [ids.get(catalog.slug), ids.get(entry.slug), index + 1, catalog.display_order]);
      }
    }
    for (let index = 0; index < batch.length; index++) {
      if (!changed[index]) continue;
      const before = current.states[index]?.registry
        ?? { ...batch[index].desired.registry, is_published: false };
      const repoChanged = batch[index].family === "tool" && current.states[index] !== null
        && REPO_FIELDS.some(field => (current.states[index].content?.[field] ?? null)
          !== (batch[index].desired.content?.[field] ?? null));
      await writeRegistry(client, ids.get(batch[index].slug), before, batch[index].desired.registry, repoChanged);
    }
    await client.query(apply ? "commit" : "rollback");
    return { applied: apply, restored: restore,
      pages: batch.map((entry, index) => ({ slug: entry.slug, family: entry.family, changed: changed[index] })),
      states: batch.map(entry => entry.desired),
    };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

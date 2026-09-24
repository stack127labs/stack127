import {
  parseArgs,
  printResult,
  requireArg,
  runMutation,
} from "./lib.mjs";

const args = parseArgs();
const slug = requireArg(args, "slug");
const cardName = requireArg(args, "card-name").trim();
const cardDescription = requireArg(args, "card-description").trim();
const cardIconKey = requireArg(args, "card-icon-key").trim();
const cardArtKey = requireArg(args, "card-art-key").trim();
const catalogArg = requireArg(args, "catalogs");
const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!cardName || !cardDescription) throw new Error("Card name and description must not be empty");
if (!keyPattern.test(cardIconKey) || !keyPattern.test(cardArtKey)) {
  throw new Error("Card icon and art keys must use lowercase letters, numbers, and hyphens");
}

const requestedCatalogs = catalogArg.split(",").map((part, index) => {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)(?::([1-9][0-9]*))?$/.exec(part.trim());
  if (!match) throw new Error(`Invalid catalog assignment: ${part}`);
  const displayOrder = match[2] ? Number(match[2]) : null;
  if (displayOrder !== null && !Number.isSafeInteger(displayOrder)) {
    throw new Error(`Invalid catalog display order: ${part}`);
  }
  return { slug: match[1], catalog_rank: index + 1, display_order: displayOrder };
});
if (new Set(requestedCatalogs.map((catalog) => catalog.slug)).size !== requestedCatalogs.length) {
  throw new Error("Each catalog may be listed only once");
}

const result = await runMutation(args, async (client) => {
  const toolResult = await client.query(`
    select page.id, tool.card_name, tool.card_description, tool.card_icon_key, tool.card_art_key
    from public.stack127_pages page
    join public.stack127_tool_pages tool on tool.page_id = page.id
    where page.slug = $1 and page.page_family = 'tool'
    for update of page, tool
  `, [slug]);
  const tool = toolResult.rows[0];
  if (!tool) throw new Error(`Tool page not found: ${slug}`);

  const catalogResult = await client.query(`
    select page.id, page.slug
    from public.stack127_pages page
    join public.stack127_tool_catalogs catalog on catalog.page_id = page.id
    where page.slug = any($1::text[]) and page.page_family = 'catalog'
    order by page.id
    for update of page, catalog
  `, [requestedCatalogs.map((catalog) => catalog.slug)]);
  if (catalogResult.rowCount !== requestedCatalogs.length) {
    const found = new Set(catalogResult.rows.map((catalog) => catalog.slug));
    const missing = requestedCatalogs.filter((catalog) => !found.has(catalog.slug));
    throw new Error(`Catalog row not found: ${missing.map((catalog) => catalog.slug).join(", ")}`);
  }
  const catalogBySlug = new Map(catalogResult.rows.map((catalog) => [catalog.slug, catalog]));

  const existingResult = await client.query(`
    select member.catalog_page_id, page.slug, member.catalog_rank, member.display_order
    from public.stack127_tool_catalog_memberships member
    join public.stack127_pages page on page.id = member.catalog_page_id
    where member.tool_page_id = $1
    order by member.catalog_rank
    for update of member
  `, [tool.id]);
  const existing = existingResult.rows;
  const existingBySlug = new Map(existing.map((catalog) => [catalog.slug, catalog]));
  const desired = [];

  for (const requested of requestedCatalogs) {
    const catalog = catalogBySlug.get(requested.slug);
    const oldOrder = existingBySlug.get(requested.slug)?.display_order;
    const maxResult = await client.query(`
      select coalesce(max(display_order), 0)::integer as last_order
      from public.stack127_tool_catalog_memberships
      where catalog_page_id = $1
    `, [catalog.id]);
    const displayOrder = requested.display_order ?? oldOrder ?? maxResult.rows[0].last_order + 1;
    const occupied = await client.query(`
      select 1 from public.stack127_tool_catalog_memberships
      where catalog_page_id = $1 and display_order = $2 and tool_page_id <> $3
      limit 1
    `, [catalog.id, displayOrder, tool.id]);
    if (occupied.rowCount) {
      throw new Error(`Display order ${displayOrder} is already used in ${requested.slug}`);
    }
    desired.push({
      slug: requested.slug,
      catalog_page_id: catalog.id,
      catalog_rank: requested.catalog_rank,
      display_order: displayOrder,
    });
  }

  const cardChanged = tool.card_name !== cardName
    || tool.card_description !== cardDescription
    || tool.card_icon_key !== cardIconKey
    || tool.card_art_key !== cardArtKey;
  const membershipsChanged = existing.length !== desired.length
    || desired.some((catalog) => {
      const current = existingBySlug.get(catalog.slug);
      return !current || current.catalog_rank !== catalog.catalog_rank
        || current.display_order !== catalog.display_order;
    });

  if (cardChanged) {
    await client.query(`
      update public.stack127_tool_pages
      set card_name = $2, card_description = $3, card_icon_key = $4, card_art_key = $5
      where page_id = $1
    `, [tool.id, cardName, cardDescription, cardIconKey, cardArtKey]);
  }
  if (membershipsChanged) {
    await client.query(`
      delete from public.stack127_tool_catalog_memberships where tool_page_id = $1
    `, [tool.id]);
    for (const catalog of desired) {
      await client.query(`
        insert into public.stack127_tool_catalog_memberships
          (catalog_page_id, tool_page_id, catalog_rank, display_order)
        values ($1, $2, $3, $4)
      `, [catalog.catalog_page_id, tool.id, catalog.catalog_rank, catalog.display_order]);
    }
  }

  return {
    slug,
    changed: cardChanged || membershipsChanged,
    card_changed: cardChanged,
    memberships_changed: membershipsChanged,
    card: {
      name: cardName,
      description: cardDescription,
      icon_key: cardIconKey,
      art_key: cardArtKey,
    },
    catalogs: desired.map(({ slug: catalogSlug, catalog_rank, display_order }) => ({
      slug: catalogSlug, catalog_rank, display_order,
    })),
  };
});

printResult(result);

import { TOOL_CATALOGS_TAG, TOOL_CATALOG_TAG, TOOL_PRIMARY_CATALOGS_TAG } from "./cache-tags";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPool } from "./db";
import type { Stack127Page } from "./page-registry";
import { readPublicData, selectPublicRows } from "./public-data-api";
import { normalizeCardAssets, selectCardRows } from "./card-data";

type CatalogContent = {
  card_name: string;
  card_description: string;
  page_id: number | string;
  title: string;
  card_icon_key: string;
  card_art_key: string;
  display_order: number;
};

type Membership = {
  catalog_page_id: number | string;
  tool_page_id: number | string;
  catalog_rank: number;
  display_order: number;
};

type CardContent = {
  page_id: number | string;
  card_name: string;
  card_description: string;
  card_icon_key: string;
  card_art_key: string;
};

export type ToolCatalogSummary = CatalogContent & {
  page: Stack127Page;
  published_at: Stack127Page["published_at"];
  updated_at: Stack127Page["updated_at"];
  tool_count: number;
};

export type ToolCatalogCard = CardContent & {
  slug: string;
  catalog_rank: number;
  display_order: number;
};

export type PublishedToolCatalog = ToolCatalogSummary & {
  tools: ToolCatalogCard[];
};

const catalogColumns = "card_name,card_description,page_id,title,card_icon_key,card_art_key,display_order";
const pageColumns = "id,slug,page_family,label,meta_title,meta_description,is_published,is_indexable,row_created_at,published_at,updated_at,row_updated_at,cover_image_url,page_type,sitemap_priority";
const membershipColumns = "catalog_page_id,tool_page_id,catalog_rank,display_order";
const cardColumns = "page_id,card_name,card_description,card_icon_key,card_art_key";

function ids(values: Array<number | string>) {
  return `in.(${values.join(",")})`;
}

export const getPublishedToolCatalogs = cache(unstable_cache(async (): Promise<ToolCatalogSummary[]> => {
  return readPublicData({
    dataApiRead: async () => {
      const contents = await selectCardRows<CatalogContent>("stack127_catalog_pages", {
        select: catalogColumns,
        order: "display_order.asc",
      });
      if (!contents.length) return [];
      const catalogIds = contents.map((content) => content.page_id);
      const [pages, members] = await Promise.all([
        selectPublicRows<Stack127Page>("stack127_pages", {
          id: ids(catalogIds), is_published: "eq.true", page_family: "eq.catalog", select: pageColumns,
        }),
        selectPublicRows<Membership>("stack127_tool_catalog_memberships", {
          catalog_page_id: ids(catalogIds), select: membershipColumns,
        }),
      ]);
      const pageById = new Map(pages.map((page) => [String(page.id), page]));
      const counts = new Map<string, number>();
      for (const member of members) {
        const key = String(member.catalog_page_id);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return contents.flatMap((content) => {
        const page = pageById.get(String(content.page_id));
        return page ? [{ ...(normalizeCardAssets(content) as CatalogContent), page,
          published_at: page.published_at, updated_at: page.updated_at,
          tool_count: counts.get(String(content.page_id)) ?? 0 }] : [];
      });
    },
    postgresRead: async () => {
      const result = await getPool().query<ToolCatalogSummary & Stack127Page>(`
        select catalog.page_id,catalog.title,catalog.card_name,catalog.card_description,
          catalog.card_icon_key,catalog.card_art_key,catalog.display_order,
          to_jsonb(page.*) as page,page.published_at,page.updated_at,
          count(tool_page.id)::integer as tool_count
        from public.stack127_catalog_pages catalog
        join public.stack127_pages page on page.id = catalog.page_id
          and page.page_family = 'catalog' and page.is_published
        left join public.stack127_tool_catalog_memberships member
          on member.catalog_page_id = catalog.page_id
        left join public.stack127_pages tool_page
          on tool_page.id = member.tool_page_id and tool_page.is_published
        group by catalog.page_id, page.id
        order by catalog.display_order, page.label
      `);
      return result.rows.map(row => normalizeCardAssets(row) as ToolCatalogSummary);
    },
  });
}, [TOOL_CATALOGS_TAG], {
  revalidate: false,
  tags: [TOOL_CATALOGS_TAG],
}));

export const getPublishedToolCatalog = cache(async (slug: string) => unstable_cache(async (): Promise<PublishedToolCatalog | null> => {
  const summary = (await getPublishedToolCatalogs()).find((catalog) => catalog.page.slug === slug);
  if (!summary) return null;
  const tools = await readPublicData<ToolCatalogCard[]>({
    dataApiRead: async () => {
      const members = await selectPublicRows<Membership>("stack127_tool_catalog_memberships", {
        catalog_page_id: `eq.${summary.page_id}`,
        order: "display_order.asc",
        select: membershipColumns,
      });
      if (!members.length) return [];
      const toolIds = members.map((member) => member.tool_page_id);
      const [pages, cards] = await Promise.all([
        selectPublicRows<Pick<Stack127Page, "id" | "slug">>("stack127_pages", {
          id: ids(toolIds), is_published: "eq.true", page_family: "eq.tool", select: "id,slug",
        }),
        selectPublicRows<CardContent>("stack127_tool_pages", {
          page_id: ids(toolIds), select: cardColumns,
        }),
      ]);
      const slugById = new Map(pages.map((page) => [String(page.id), page.slug]));
      const cardById = new Map(cards.map((card) => [String(card.page_id), card]));
      return members.flatMap((member) => {
        const card = cardById.get(String(member.tool_page_id));
        const toolSlug = slugById.get(String(member.tool_page_id));
        return card && toolSlug ? [{ ...card, slug: toolSlug, catalog_rank: member.catalog_rank,
          display_order: member.display_order }] : [];
      });
    },
    postgresRead: async () => {
      const result = await getPool().query<ToolCatalogCard>(`
        select content.page_id, page.slug, content.card_name, content.card_description,
          content.card_icon_key, content.card_art_key, member.catalog_rank, member.display_order
        from public.stack127_tool_catalog_memberships member
        join public.stack127_tool_pages content on content.page_id = member.tool_page_id
        join public.stack127_pages page on page.id = member.tool_page_id
          and page.page_family = 'tool' and page.is_published
        where member.catalog_page_id = $1
        order by member.display_order
      `, [summary.page_id]);
      return result.rows;
    },
  });
  return { ...summary, tools };
}, ["stack127-tool-catalog", slug], {
  revalidate: false,
  tags: [`${TOOL_CATALOG_TAG}:${slug}`],
})());

/** Resolve a tool's rank-one catalog. A tool may also appear in other catalogs. */
export const getPrimaryToolCatalog = cache(async (toolPageId: number | string) => {
  const catalogPageId = await unstable_cache(async (): Promise<number | string | null> => {
    return readPublicData({
      dataApiRead: async () => {
        const rows = await selectPublicRows<Membership>("stack127_tool_catalog_memberships", {
          tool_page_id: `eq.${toolPageId}`,
          catalog_rank: "eq.1",
          limit: "1",
          select: membershipColumns,
        });
        return rows[0]?.catalog_page_id ?? null;
      },
      postgresRead: async () => {
        const result = await getPool().query<Pick<Membership, "catalog_page_id">>(`
          select catalog_page_id
          from public.stack127_tool_catalog_memberships
          where tool_page_id = $1 and catalog_rank = 1
          limit 1
        `, [toolPageId]);
        return result.rows[0]?.catalog_page_id ?? null;
      },
    });
  }, ["stack127-tool-primary-catalog", String(toolPageId)], {
    revalidate: false,
    tags: [TOOL_PRIMARY_CATALOGS_TAG],
  })();

  if (catalogPageId === null) return null;
  const catalog = (await getPublishedToolCatalogs()).find((item) => String(item.page_id) === String(catalogPageId));
  return catalog ? getPublishedToolCatalog(catalog.page.slug) : null;
});

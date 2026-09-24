import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPool } from "./db";
import type { Stack127Page } from "./page-registry";
import { readPublicData, selectPublicRows } from "./public-data-api";

type CatalogContent = {
  page_id: number | string;
  heading_before: string;
  heading_mark: string;
  heading_after: string;
  intro: string;
  section_heading: string;
  icon_key: string;
  hero_art_key: string;
  home_art_key: string;
  home_order: number;
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

const catalogColumns = "page_id,heading_before,heading_mark,heading_after,intro,section_heading,icon_key,hero_art_key,home_art_key,home_order";
const pageColumns = "id,slug,page_family,label,meta_title,meta_description,is_published,row_created_at,published_at,updated_at,row_updated_at,cover_image_url,page_type,sitemap_priority";
const membershipColumns = "catalog_page_id,tool_page_id,catalog_rank,display_order";
const cardColumns = "page_id,card_name,card_description,card_icon_key,card_art_key";

function ids(values: Array<number | string>) {
  return `in.(${values.join(",")})`;
}

export const getPublishedToolCatalogs = cache(unstable_cache(async (): Promise<ToolCatalogSummary[]> => {
  return readPublicData({
    dataApiRead: async () => {
      const contents = await selectPublicRows<CatalogContent>("stack127_tool_catalogs", {
        select: catalogColumns,
        order: "home_order.asc",
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
        return page ? [{ ...content, page, tool_count: counts.get(String(content.page_id)) ?? 0 }] : [];
      });
    },
    postgresRead: async () => {
      const result = await getPool().query<ToolCatalogSummary & Stack127Page>(`
        select catalog.*, to_jsonb(page.*) as page,
          count(tool_page.id)::integer as tool_count
        from public.stack127_tool_catalogs catalog
        join public.stack127_pages page on page.id = catalog.page_id
          and page.page_family = 'catalog' and page.is_published
        left join public.stack127_tool_catalog_memberships member
          on member.catalog_page_id = catalog.page_id
        left join public.stack127_pages tool_page
          on tool_page.id = member.tool_page_id and tool_page.is_published
        group by catalog.page_id, page.id
        order by catalog.home_order, page.label
      `);
      return result.rows;
    },
  });
}, ["stack127-tool-catalogs"], {
  revalidate: 604800,
  tags: ["stack127-tool-catalogs"],
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
  revalidate: 604800,
  tags: [`stack127-tool-catalog:${slug}`],
})());

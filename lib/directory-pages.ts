import { cache } from "react";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { DIRECTORY_PAGES_TAG } from "./cache-tags";
import { getPool } from "./db";
import { getPublishedPage } from "./page-registry";
import { readPublicData } from "./public-data-api";
import { normalizeCardAssets, selectCardRows } from "./card-data";

export type Stack127DirectoryPage = {
  page_id: number | string;
  slug: string;
  title: string;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
  published_at: Date | string;
  updated_at: Date | string;
  row_updated_at: Date | string;
};

const columns = "page_id,title,card_name,card_description,card_icon_key,card_art_key,row_updated_at";

export const getPublishedDirectoryPage = cache(async (slug: string) => unstable_cache(async () => {
  return readPublicData<Stack127DirectoryPage | null>({
    dataApiRead: async () => {
      const page = await getPublishedPage(slug);
      if (!page || page.page_family !== "directory") return null;
      const rows = await selectCardRows<Omit<Stack127DirectoryPage, "slug" | "published_at" | "updated_at">>("stack127_directory_pages", {
        page_id: `eq.${page.id}`, select: columns, limit: "1",
      });
      return rows[0] ? {
        ...normalizeCardAssets(rows[0]), slug: page.slug,
        published_at: page.published_at, updated_at: page.updated_at,
      } : null;
    },
    postgresRead: async () => {
      const result = await getPool().query<Stack127DirectoryPage>(`
        select content.page_id,content.title,content.card_name,content.card_description,
          content.card_icon_key,content.card_art_key,content.row_updated_at,
          page.slug,page.published_at,page.updated_at
        from public.stack127_directory_pages content
        join public.stack127_pages page on page.id = content.page_id
        where page.slug = $1 and page.page_family = 'directory' and page.is_published
        limit 1
      `, [slug]);
      return result.rows[0] ? normalizeCardAssets(result.rows[0]) : null;
    },
  });
}, ["stack127-directory-page", slug], { revalidate: false, tags: [`${DIRECTORY_PAGES_TAG}:${slug}`] })());

export const getRequiredDirectoryPage = cache(async (slug: string) => {
  const page = await getPublishedDirectoryPage(slug);
  if (!page) notFound();
  return page;
});

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
  intro_markdown: string;
  content_markdown: string | null;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
  row_updated_at: Date | string;
};

const columns = "page_id,title,intro_markdown,content_markdown,card_name,card_description,card_icon_key,card_art_key,row_updated_at";

export const getPublishedDirectoryPage = cache(async (slug: string) => unstable_cache(async () => {
  return readPublicData<Stack127DirectoryPage | null>({
    dataApiRead: async () => {
      const page = await getPublishedPage(slug);
      if (!page || page.page_family !== "directory") return null;
      const rows = await selectCardRows<Omit<Stack127DirectoryPage, "slug">>("stack127_directory_pages", {
        page_id: `eq.${page.id}`, select: columns, limit: "1",
      });
      return rows[0] ? { ...normalizeCardAssets(rows[0], "directory", page.slug), slug: page.slug } : null;
    },
    postgresRead: async () => {
      const result = await getPool().query<Stack127DirectoryPage>(`
        select content.*, page.slug
        from public.stack127_directory_pages content
        join public.stack127_pages page on page.id = content.page_id
        where page.slug = $1 and page.page_family = 'directory' and page.is_published
        limit 1
      `, [slug]);
      return result.rows[0] ? normalizeCardAssets(result.rows[0], "directory", slug) : null;
    },
  });
}, ["stack127-directory-page", slug], { revalidate: false, tags: [`${DIRECTORY_PAGES_TAG}:${slug}`] })());

export const getRequiredDirectoryPage = cache(async (slug: string) => {
  const page = await getPublishedDirectoryPage(slug);
  if (!page) notFound();
  return page;
});

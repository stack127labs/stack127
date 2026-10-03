import { cache } from "react";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { DIRECTORY_PAGES_TAG } from "./cache-tags";
import { getPool } from "./db";
import { getPublishedPage } from "./page-registry";
import { readPublicData, selectPublicRows } from "./public-data-api";

export type Stack127DirectoryPage = {
  page_id: number | string;
  slug: string;
  title: string;
  intro_markdown: string;
  content_markdown: string | null;
  content_revision: number;
  card_name: string;
  card_description: string;
  row_updated_at: Date | string;
};

const columns = "page_id,title,intro_markdown,content_markdown,content_revision,card_name,card_description,row_updated_at";

export const getPublishedDirectoryPage = cache(async (slug: string) => unstable_cache(async () => {
  return readPublicData<Stack127DirectoryPage | null>({
    dataApiRead: async () => {
      const page = await getPublishedPage(slug);
      if (!page || page.page_family !== "directory") return null;
      const rows = await selectPublicRows<Omit<Stack127DirectoryPage, "slug">>("stack127_directory_pages", {
        page_id: `eq.${page.id}`, select: columns, limit: "1",
      });
      return rows[0] ? { ...rows[0], slug: page.slug } : null;
    },
    postgresRead: async () => {
      const result = await getPool().query<Stack127DirectoryPage>(`
        select content.*, page.slug
        from public.stack127_directory_pages content
        join public.stack127_pages page on page.id = content.page_id
        where page.slug = $1 and page.page_family = 'directory' and page.is_published
        limit 1
      `, [slug]);
      return result.rows[0] ?? null;
    },
  });
}, ["stack127-directory-page", slug], { revalidate: false, tags: [`${DIRECTORY_PAGES_TAG}:${slug}`] })());

export const getRequiredDirectoryPage = cache(async (slug: string) => {
  const page = await getPublishedDirectoryPage(slug);
  if (!page) notFound();
  return page;
});

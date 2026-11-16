import { unstable_cache } from "next/cache";
import { getPool } from "./db";
import { COURSE_PAGES_TAG, HOME_PAGES_TAG, SITEMAP_TAG } from "./cache-tags";
import { readPageCards } from "./page-cards";
import type { Stack127Page } from "./page-registry";
import { readPublicData, selectPublicRows } from "./public-data-api";
import { buildSiteSearchEntries } from "./site-search";

type Lesson = { page_id: number | string; title: string };

const columns = "id,slug,page_family,label,meta_title,meta_description,is_published,is_indexable";

/**
 * The site search index. Every page event refreshes the sitemap and homepage
 * tags, so publishing, unpublishing, or a card edit refreshes this too.
 */
export const getSiteSearchIndex = unstable_cache(async () => {
  const pages = await readPublicData<Stack127Page[]>({
    // Indexable pages plus noindex top-level pages; noindex children stay out.
    dataApiRead: () => selectPublicRows<Stack127Page>("stack127_pages", {
      is_published: "eq.true",
      or: "(is_indexable.eq.true,slug.not.like.*/*)",
      order: "slug.asc",
      select: columns,
    }),
    postgresRead: async () => (await getPool().query<Stack127Page>(`
      select ${columns} from public.stack127_pages
      where is_published and (is_indexable or position('/' in slug) = 0)
      order by slug asc
    `)).rows,
  });
  const lessonIds = pages.filter(page => page.page_family === "course").map(page => page.id);
  const [cards, lessons] = await Promise.all([readPageCards(pages), lessonIds.length ? readPublicData<Lesson[]>({
    dataApiRead: () => selectPublicRows<Lesson>("stack127_course_lessons", {
      page_id: `in.(${lessonIds.join(",")})`, select: "page_id,title",
    }),
    postgresRead: async () => (await getPool().query<Lesson>(
      "select page_id, title from public.stack127_course_lessons where page_id = any($1::bigint[])", [lessonIds],
    )).rows,
  }) : []]);
  return buildSiteSearchEntries(pages, cards, new Map(lessons.map(lesson => [String(lesson.page_id), lesson.title])));
}, ["stack127-site-search-index"], { revalidate: false, tags: [SITEMAP_TAG, HOME_PAGES_TAG, COURSE_PAGES_TAG] });

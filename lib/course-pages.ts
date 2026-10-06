import { cache } from "react";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { COURSE_PAGES_TAG } from "./cache-tags";
import { getPool } from "./db";
import { readPublicData, selectPublicRows } from "./public-data-api";
import { getPublishedPage, type Stack127Page } from "./page-registry";
import type { CourseDefinition } from "./courses";

type CourseContent = {
  page_id: number | string;
  title: string;
  intro_markdown: string;
  content_markdown: string | null;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
  author_name: string;
  author_avatar_url: string;
  navigation_label: string;
};
type LessonContent = {
  page_id: number | string;
  course_page_id: number | string;
  title: string;
  sidebar_label: string;
  display_order: number;
};
type CourseRows = { content: CourseContent; lessons: LessonContent[]; pages: Stack127Page[] };

// Every lesson uses the course's copy and full navigation. One tag refreshes that snapshot.
export const getCourse = cache(async (slug: string) => unstable_cache(async (): Promise<CourseDefinition | null> => {
  const page = await getPublishedPage(slug);
  if (!page || page.page_family !== "course") return null;
  const rows = await readPublicData<CourseRows | null>({
    dataApiRead: async () => {
      const [contents, lessons] = await Promise.all([
        selectPublicRows<CourseContent>("stack127_course_pages", { page_id: `eq.${page.id}`, select: "*" }),
        selectPublicRows<LessonContent>("stack127_course_lessons", { course_page_id: `eq.${page.id}`, select: "*", order: "display_order.asc" }),
      ]);
      if (!contents[0]) return null;
      const pages = lessons.length ? await selectPublicRows<Stack127Page>("stack127_pages", {
        id: `in.(${lessons.map(lesson => lesson.page_id).join(",")})`, select: "*",
      }) : [];
      return { content: contents[0], lessons, pages };
    },
    postgresRead: async () => {
      const [contents, lessons] = await Promise.all([
        getPool().query<CourseContent>("select * from public.stack127_course_pages where page_id=$1", [page.id]),
        getPool().query<LessonContent & { page: Stack127Page }>(`
          select lesson.*, to_jsonb(page.*) as page from public.stack127_course_lessons lesson
          join public.stack127_pages page on page.id=lesson.page_id and page.page_family='course'
          where lesson.course_page_id=$1 order by lesson.display_order
        `, [page.id]),
      ]);
      return contents.rows[0] ? { content: contents.rows[0], lessons: lessons.rows,
        pages: lessons.rows.map(lesson => lesson.page) } : null;
    },
  });
  if (!rows) return null;
  const byId = new Map(rows.pages.map(lessonPage => [String(lessonPage.id), lessonPage]));
  const { content } = rows;
  return {
    title: content.title, intro_markdown: content.intro_markdown, content_markdown: content.content_markdown,
    card_name: content.card_name, card_description: content.card_description,
    card_icon_key: content.card_icon_key, card_art_key: content.card_art_key,
    author: { name: content.author_name, avatarUrl: content.author_avatar_url },
    navigationLabel: content.navigation_label, registrySlug: slug, basePath: `/${slug}`,
    lessons: rows.lessons.map(lesson => {
      const lessonPage = byId.get(String(lesson.page_id));
      // Public registry policies omit drafts; their definitions still appear as coming soon.
      return { title: lesson.title, order: lesson.display_order, sidebarLabel: lesson.sidebar_label,
        slug: String(lesson.page_id) === String(page.id) ? "" : lessonPage?.slug.slice(slug.length + 1) ?? null,
        published: lessonPage?.is_published ?? false,
        updatedAt: lessonPage?.updated_at ? new Date(lessonPage.updated_at).toISOString() : null };
    }),
  };
}, ["stack127-course", slug], { revalidate: false, tags: [COURSE_PAGES_TAG] })());

export async function getRequiredCourse(slug: string) {
  const course = await getCourse(slug);
  if (!course) notFound();
  return course;
}

import { TOOL_PAGES_TAG } from "./cache-tags";
import { notFound } from "next/navigation";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPool } from "./db";
import { getPublishedPage } from "./page-registry";
import { readPublicData, selectPublicRows } from "./public-data-api";

export type Stack127ToolPage = {
  page_id: number | string;
  slug: string;
  title: string;
  intro_markdown: string;
  usage_markdown: string | null;
  content_markdown: string;
  content_revision: number;
  tool_version: string;
  tool_version_updated_at: Date | string;
  stack127_repo_url: string | null;
  stack127_repo_version: string | null;
  stack127_repo_commit_sha: string | null;
  stack127_repo_synced_at: Date | string | null;
  published_at: Date | string;
  updated_at: Date | string;
};

type Stack127ToolContentRow = Omit<Stack127ToolPage, "published_at" | "slug" | "updated_at">;

const toolContentColumns = [
  "page_id",
  "title",
  "intro_markdown",
  "usage_markdown",
  "content_markdown",
  "content_revision",
  "tool_version",
  "tool_version_updated_at",
  "stack127_repo_url",
  "stack127_repo_version",
  "stack127_repo_commit_sha",
  "stack127_repo_synced_at",
].join(",");

export const getPublishedToolPage = cache(async (slug: string) => unstable_cache(async () => {
  return readPublicData<Stack127ToolPage | null>({
    dataApiRead: async () => {
      const page = await getPublishedPage(slug);
      if (!page || page.page_family !== "tool") return null;
      const rows = await selectPublicRows<Stack127ToolContentRow>("stack127_tool_pages", {
        limit: "1",
        page_id: `eq.${page.id}`,
        select: toolContentColumns,
      });
      const tool = rows[0];
      return tool ? {
        ...tool,
        published_at: page.published_at,
        slug: page.slug,
        updated_at: page.updated_at,
      } : null;
    },
    postgresRead: async () => {
      const result = await getPool().query<Stack127ToolPage>(
        `
          select
            tool.page_id,
            page.slug,
            tool.title,
            tool.intro_markdown,
            tool.usage_markdown,
            tool.content_markdown,
            tool.content_revision,
            tool.tool_version,
            tool.tool_version_updated_at,
            tool.stack127_repo_url,
            tool.stack127_repo_version,
            tool.stack127_repo_commit_sha,
            tool.stack127_repo_synced_at,
            page.published_at,
            page.updated_at
          from public.stack127_tool_pages tool
          join public.stack127_pages page on page.id = tool.page_id
          where page.slug = $1
            and page.page_family = 'tool'
            and page.is_published = true
          limit 1
        `,
        [slug],
      );
      return result.rows[0] ?? null;
    },
  });
}, ["stack127-tool-page", slug], { revalidate: false, tags: [`${TOOL_PAGES_TAG}:${slug}`] })());

export const getRequiredToolPage = cache(async (slug: string) => {
  const page = await getPublishedToolPage(slug);
  if (!page) notFound();
  return page;
});

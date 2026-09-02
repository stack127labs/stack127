import { notFound } from "next/navigation";
import { cache } from "react";
import { getPool } from "./db";

export type Stack127ToolPage = {
  page_id: number | string;
  slug: string;
  title: string;
  intro_markdown: string;
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

export const getPublishedToolPage = cache(async (slug: string) => {
  const result = await getPool().query<Stack127ToolPage>(
    `
      select
        tool.page_id,
        page.slug,
        tool.title,
        tool.intro_markdown,
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
});

export const getRequiredToolPage = cache(async (slug: string) => {
  const page = await getPublishedToolPage(slug);
  if (!page) notFound();
  return page;
});

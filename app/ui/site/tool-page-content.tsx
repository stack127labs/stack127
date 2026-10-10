import type { ReactNode } from "react";
import { getToolBreadcrumbs } from "@/lib/breadcrumbs";
import type { Stack127ToolPage } from "@/lib/tool-pages";
import { PageHeader } from "./page-header";
import { PageMeta } from "./page-meta";
import { PageTitleIcon } from "./page-title-icon";
import { ContentMarkdown } from "../content-markdown";
import { proseClassName, proseFlowClassName } from "./prose";
import styles from "./tool-page-content.module.css";

/** `intro` is the page's content/intro.mdx. Pages not yet moved to MDX render intro_markdown. */
export async function ToolPageHeader({
  icon,
  intro,
  toolPage,
}: {
  icon: ReactNode;
  intro?: ReactNode;
  toolPage: Stack127ToolPage;
}) {
  const breadcrumbs = await getToolBreadcrumbs(toolPage.page_id, toolPage.slug, toolPage.card_name);
  return (
    <PageHeader breadcrumbs={breadcrumbs}>
      <h1>
        <PageTitleIcon>{icon}</PageTitleIcon>{" "}
        {toolPage.title}
      </h1>
      <PageMeta
        githubUrl={toolPage.stack127_repo_url}
        updatedAt={toolPage.updated_at}
        version={toolPage.tool_version}
      />
      {intro ?? <ContentMarkdown markdown={toolPage.intro_markdown} />}
    </PageHeader>
  );
}

/** Holds the usage and article content shown after the tool. */
export function ToolPageArticle({ children }: { children: ReactNode }) {
  return (
    <article
      className={`${styles.content} ${proseClassName} ${proseFlowClassName}`}
      data-tool-page-content
    >
      {children}
    </article>
  );
}

/** For pages whose usage and article still come from the database. */
export function ToolPageMarkdown({ toolPage }: { toolPage: Stack127ToolPage }) {
  return (
    <ToolPageArticle>
      {toolPage.usage_markdown ? <ContentMarkdown markdown={toolPage.usage_markdown} /> : null}
      <ContentMarkdown markdown={toolPage.content_markdown} />
    </ToolPageArticle>
  );
}

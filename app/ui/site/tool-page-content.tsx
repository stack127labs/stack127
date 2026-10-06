import type { ReactNode } from "react";
import type { Stack127ToolPage } from "@/lib/tool-pages";
import { PageHeader } from "./page-header";
import { PageMeta } from "./page-meta";
import { PageTitleIcon } from "./page-title-icon";
import { ContentMarkdown } from "../content-markdown";
import { proseClassName, proseFlowClassName } from "./prose";
import styles from "./tool-page-content.module.css";

export function ToolPageHeader({
  icon,
  toolPage,
}: {
  icon: ReactNode;
  toolPage: Stack127ToolPage;
}) {
  return (
    <PageHeader>
      <h1>
        <PageTitleIcon>{icon}</PageTitleIcon>{" "}
        {toolPage.title}
      </h1>
      <PageMeta
        githubUrl={toolPage.stack127_repo_url}
        updatedAt={toolPage.updated_at}
        version={toolPage.tool_version}
      />
      <ContentMarkdown markdown={toolPage.intro_markdown} />
    </PageHeader>
  );
}

export function ToolPageMarkdown({ toolPage }: { toolPage: Stack127ToolPage }) {
  return (
    <article
      className={`${styles.content} ${proseClassName} ${proseFlowClassName}`}
      data-tool-page-content
    >
      {toolPage.usage_markdown ? <ContentMarkdown markdown={toolPage.usage_markdown} /> : null}
      <ContentMarkdown markdown={toolPage.content_markdown} />
    </article>
  );
}

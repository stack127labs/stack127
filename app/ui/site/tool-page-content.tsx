import { CalendarDays, Tag } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { ReactNode } from "react";
import type { Stack127ToolPage } from "@/lib/tool-pages";
import { PageHeader } from "./page-header";
import { PageTitleIcon } from "./page-title-icon";
import { ContentMarkdown } from "../content-markdown";
import { proseClassName, proseFlowClassName } from "./prose";
import styles from "./tool-page-content.module.css";

const updatedDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function ToolPageHeader({
  icon,
  toolPage,
}: {
  icon: ReactNode;
  toolPage: Stack127ToolPage;
}) {
  const updatedAt = new Date(toolPage.updated_at);

  return (
    <PageHeader>
      <h1>
        <PageTitleIcon>{icon}</PageTitleIcon>{" "}
        {toolPage.title}
      </h1>
      <div className={styles.metadata}>
        {toolPage.stack127_repo_url ? (
          <a
            aria-label="GitHub repository"
            className={styles.metadataItem}
            href={toolPage.stack127_repo_url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaGithub aria-hidden="true" size={15} />
            GitHub
          </a>
        ) : null}
        <span className={styles.metadataItem}>
          <Tag aria-hidden="true" size={15} strokeWidth={1.8} />
          Version {toolPage.tool_version}
        </span>
        <span className={styles.metadataItem}>
          <CalendarDays aria-hidden="true" size={15} strokeWidth={1.8} />
          <time dateTime={updatedAt.toISOString()}>Updated {updatedDateFormatter.format(updatedAt)}</time>
        </span>
      </div>
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

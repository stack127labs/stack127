import type { ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Stack127ToolPage } from "@/lib/tool-pages";
import { PageHeader } from "./page-header";
import { PageTitleIcon } from "./page-title-icon";
import { proseClassName, proseFlowClassName } from "./prose";
import styles from "./tool-page-content.module.css";

const markdownComponents: Components = {
  a({ children, href, ...props }) {
    if (href?.startsWith("/")) {
      return <Link href={href}>{children}</Link>;
    }

    return <a href={href} {...props}>{children}</a>;
  },
  table({ children, ...props }) {
    return (
      <div className={styles.tableScroll} role="region" tabIndex={0}>
        <table {...props}>{children}</table>
      </div>
    );
  },
};

function Markdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
      {markdown}
    </ReactMarkdown>
  );
}

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
      <Markdown markdown={toolPage.intro_markdown} />
    </PageHeader>
  );
}

export function ToolPageMarkdown({ toolPage }: { toolPage: Stack127ToolPage }) {
  return (
    <article className={`${styles.content} ${proseClassName} ${proseFlowClassName}`}>
      <Markdown markdown={toolPage.content_markdown} />
    </article>
  );
}

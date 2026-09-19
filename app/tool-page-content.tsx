import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Stack127ToolPage } from "@/lib/tool-pages";
import { PageHeader } from "./page-header";
import { PageTitleIcon } from "./page-title-icon";
import { MarkerArt } from "./marker-art";
import { resolveMarkerArtReference } from "./marker-art-registry";
import { proseClassName, proseFlowClassName } from "./prose";
import styles from "./tool-page-content.module.css";

type MarkdownNode = {
  type: string;
  value?: string;
  data?: { hName?: string };
  children?: MarkdownNode[];
};

function definitionEntry(node: MarkdownNode) {
  if (node.type !== "paragraph" || node.children?.length !== 1 || node.children[0].type !== "text") return null;
  const match = /^([^\n]+)\n:\s+([\s\S]+)$/.exec(node.children[0].value ?? "");
  return match ? { term: match[1].trim(), description: match[2].trim() } : null;
}

function remarkDefinitionLists() {
  return (tree: MarkdownNode) => {
    function transform(parent: MarkdownNode) {
      if (!parent.children) return;
      const children: MarkdownNode[] = [];
      for (let index = 0; index < parent.children.length;) {
        const entries = [];
        while (index < parent.children.length) {
          const entry = definitionEntry(parent.children[index]);
          if (!entry) break;
          entries.push(entry);
          index += 1;
        }
        if (entries.length) {
          children.push({
            type: "paragraph",
            data: { hName: "dl" },
            children: entries.flatMap((entry) => [
              { type: "paragraph", data: { hName: "dt" }, children: [{ type: "text", value: entry.term }] },
              { type: "paragraph", data: { hName: "dd" }, children: [{ type: "text", value: entry.description }] },
            ]),
          });
          continue;
        }
        transform(parent.children[index]);
        children.push(parent.children[index]);
        index += 1;
      }
      parent.children = children;
    }
    transform(tree);
  };
}

function transformMarkdownUrl(url: string) {
  return url.startsWith("marker-art://") ? url : defaultUrlTransform(url);
}

function MarkdownParagraph({ children, ...props }: ComponentPropsWithoutRef<"p">) {
  const items = Children.toArray(children);
  const onlyChild = items.length === 1 ? items[0] : null;
  if (
    isValidElement<{ src?: unknown }>(onlyChild)
    && typeof onlyChild.props.src === "string"
    && onlyChild.props.src.startsWith("marker-art://")
  ) {
    return <>{onlyChild}</>;
  }

  return <p {...props}>{children}</p>;
}

const markdownComponents: Components = {
  p: MarkdownParagraph,
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
  img({ src, alt, ...props }) {
    if (typeof src === "string" && src.startsWith("marker-art://")) {
      const svg = resolveMarkerArtReference(src);
      if (!svg) throw new Error(`Invalid marker art reference: ${src}`);
      if (!alt?.trim()) throw new Error(`Marker art requires a useful caption: ${src}`);
      return <MarkerArt svg={svg} caption={alt} />;
    }
    return <img src={src} alt={alt} {...props} />;
  },
};

function Markdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      components={markdownComponents}
      remarkPlugins={[remarkGfm, remarkDefinitionLists]}
      urlTransform={transformMarkdownUrl}
    >
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
    <article
      className={`${styles.content} ${proseClassName} ${proseFlowClassName}`}
      data-tool-page-content
    >
      {toolPage.usage_markdown ? <Markdown markdown={toolPage.usage_markdown} /> : null}
      <Markdown markdown={toolPage.content_markdown} />
    </article>
  );
}

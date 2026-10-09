import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import Link from "next/link";
import { CodeBlock } from "@/app/ui/site/code-block";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { resolveMarkerArtReference } from "@/app/marker-art-registry";
import { Callout } from "./callout";
import { ContentBlock } from "./content-block";
import { TableFrame } from "./table-frame";
import styles from "./content-markdown.module.css";

/**
 * Element renderers shared by ContentMarkdown (database Markdown) and mdx-components.tsx
 * (content in code), so both render the same HTML. Keep anything that loads chart-client out.
 */

export type ContentBlockKind = "note" | "warning" | "tip" | "formula" | "example";

const calloutTitles = { note: "Note", warning: "Warning", tip: "Tip" } as const;

export function ContentCallout({ children, kind, title }: { children: ReactNode; kind: ContentBlockKind; title?: string }) {
  if (kind === "formula" || kind === "example") return <ContentBlock kind={kind} title={title}>{children}</ContentBlock>;
  return <Callout title={title || calloutTitles[kind]} tone={kind === "tip" ? "recommend" : kind}>{children}</Callout>;
}

export function ContentMarkerArt({ alt, reference }: { alt?: string; reference: string }) {
  try {
    const svg = resolveMarkerArtReference(reference);
    if (!svg || !alt?.trim()) throw new Error("Check the figure reference and caption.");
    return <MarkerArt svg={svg} caption={alt} />;
  } catch {
    return <span role="note">Figure unavailable: check its reference and caption.</span>;
  }
}

/** A paragraph holding only a marker art image renders the figure without the paragraph. */
export function ContentParagraph({ children, ...props }: ComponentPropsWithoutRef<"p">) {
  const items = Children.toArray(children);
  const onlyChild = items.length === 1 ? items[0] : null;
  if (isValidElement<{ src?: unknown }>(onlyChild)
    && typeof onlyChild.props.src === "string"
    && onlyChild.props.src.startsWith("marker-art://")) return <>{onlyChild}</>;
  return <p {...props}>{children}</p>;
}

export function ContentLink({ children, href, ...props }: ComponentPropsWithoutRef<"a">) {
  return href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} {...props}>{children}</a>;
}

export function ContentTable({ children, ...props }: ComponentPropsWithoutRef<"table">) {
  return <TableFrame ariaLabel="Content table" className={styles.tableScroll}><table {...props}>{children}</table></TableFrame>;
}

export function ContentPre({ children }: ComponentPropsWithoutRef<"pre">) {
  const item = Children.toArray(children)[0];
  if (isValidElement<{ className?: string; children?: ReactNode }>(item) && !item.props.className) {
    return <CodeBlock>{String(item.props.children ?? "")}</CodeBlock>;
  }
  return <>{children}</>;
}

/** Inline code stays a plain code element. A fenced block with a language renders as a labeled CodeBlock. */
export function ContentCode({ children, className, ...props }: ComponentPropsWithoutRef<"code">) {
  if (!className) return <code {...props}>{children}</code>;
  const language = className.replace(/^language-/, "");
  return <CodeBlock label={language || undefined}>{String(children).replace(/\n$/, "")}</CodeBlock>;
}

export function ContentImage({ alt, src, ...props }: ComponentPropsWithoutRef<"img">) {
  if (typeof src === "string" && src.startsWith("marker-art://")) return <ContentMarkerArt alt={alt} reference={src} />;
  return <img src={src} alt={alt} {...props} />;
}

export function Terms({ children }: { children: ReactNode }) {
  return <dl>{children}</dl>;
}

/** A meaning written as one paragraph sits directly in the dd, as Markdown definition lists render it. */
export function Term({ children, name }: { children: ReactNode; name: string }) {
  const items = Children.toArray(children);
  const only = items.length === 1 ? items[0] : null;
  const meaning = isValidElement<{ children?: ReactNode }>(only) && (only.type === "p" || only.type === ContentParagraph) ? only.props.children : children;
  return <><dt>{name}</dt><dd>{meaning}</dd></>;
}

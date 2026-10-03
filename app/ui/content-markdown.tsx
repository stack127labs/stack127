import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/app/ui/site/code-block";
import { MarkerArt } from "@/app/ui/site/marker-art";
import { resolveMarkerArtReference } from "@/app/marker-art-registry";
import { Callout, type CalloutTone } from "./callout";
import { ContentBlock } from "./content-block";
import { TableFrame } from "./table-frame";
import { UiBarChart, UiDonutChart, UiLineChart, type UiChartDatum, type UiLinePoint } from "./visuals";
import styles from "./content-markdown.module.css";

type MarkdownNode = {
  type: string;
  value?: string;
  data?: { hName?: string; hProperties?: Record<string, string> };
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

function remarkContentBlocks() {
  return (tree: MarkdownNode) => {
    function visit(node: MarkdownNode) {
      if (node.type === "blockquote") {
        const first = node.children?.[0];
        const text = first?.type === "paragraph" ? first.children?.[0] : null;
        if (text?.type === "text") {
          const match = /^\[!(NOTE|WARNING|TIP|FORMULA|EXAMPLE)\](?:[ \t]+([^\n]+))?/.exec(text.value ?? "");
          if (match) {
            const kind = match[1].toLowerCase();
            node.data = { hName: "blockquote", hProperties: { "data-content-block": kind, "data-content-title": match[2]?.trim() ?? "" } };
            text.value = (text.value ?? "").slice(match[0].length).trimStart();
            if (!text.value) first?.children?.shift();
            if (!first?.children?.length) node.children?.shift();
          }
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

function isDatum(value: unknown): value is UiChartDatum {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.label === "string" && typeof item.value === "number"
    && Number.isFinite(item.value) && (item.formattedValue === undefined || typeof item.formattedValue === "string");
}

function ChartFromMarkdown({ kind, source }: { kind: string; source: string }) {
  try {
    const input: unknown = JSON.parse(source);
    if (!input || typeof input !== "object") throw new Error("Chart data must be an object.");
    const chart = input as Record<string, unknown>;
    if (typeof chart.title !== "string" || !chart.title.trim()) throw new Error("Add a chart title.");
    if (!Array.isArray(chart.data) || !chart.data.length || !chart.data.every(isDatum)) throw new Error("Add labeled data with finite numeric values.");
    const data: UiChartDatum[] = chart.data;
    if (new Set(data.map((item) => item.id)).size !== data.length) throw new Error("Chart data IDs must be unique.");
    const caption = typeof chart.caption === "string" ? chart.caption : undefined;
    if (kind === "bar") {
      if (data.some((item) => item.value < 0)) throw new Error("Bar chart values must be zero or higher.");
      return <UiBarChart ariaLabel={chart.title} caption={caption} data={data} />;
    }
    if (kind === "donut") {
      if (data.some((item) => item.value < 0) || !data.some((item) => item.value > 0)) throw new Error("Donut chart values must be nonnegative and include a positive value.");
      return <UiDonutChart ariaLabel={chart.title} caption={caption} data={data} />;
    }
    if (kind === "line") {
      if (typeof chart.valueLabel !== "string" || !chart.valueLabel.trim()) throw new Error("Add a value label.");
      if (!data.every((item) => {
        const point = item as UiChartDatum & { xLabel?: unknown; xValue?: unknown };
        return typeof point.xLabel === "string"
          && (point.xValue === undefined || (typeof point.xValue === "number" && Number.isFinite(point.xValue)));
      })) {
        throw new Error("Each point needs an xLabel and any xValue must be numeric.");
      }
      return <UiLineChart ariaLabel={chart.title} caption={caption} points={data as UiLinePoint[]} valueLabel={chart.valueLabel} />;
    }
  } catch (error) {
    return <p role="note">Chart unavailable: {error instanceof Error ? error.message : "Check the chart data."}</p>;
  }
  return <p role="note">Chart unavailable: Unknown chart type.</p>;
}

function MarkdownParagraph({ children, node: _node, ...props }: ComponentPropsWithoutRef<"p"> & { node?: unknown }) {
  const items = Children.toArray(children);
  const onlyChild = items.length === 1 ? items[0] : null;
  if (isValidElement<{ src?: unknown }>(onlyChild)
    && typeof onlyChild.props.src === "string"
    && onlyChild.props.src.startsWith("marker-art://")) return <>{onlyChild}</>;
  return <p {...props}>{children}</p>;
}

const components: Components = {
  p: MarkdownParagraph,
  a({ children, href, node: _node, ...props }) {
    return href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} {...props}>{children}</a>;
  },
  blockquote({ children, node: _node, ...props }) {
    const attributes = props as Record<string, unknown>;
    const kind = attributes["data-content-block"];
    const customTitle = attributes["data-content-title"];
    const title = typeof customTitle === "string" && customTitle ? customTitle : undefined;
    if (kind === "formula" || kind === "example") return <ContentBlock kind={kind} title={title}>{children}</ContentBlock>;
    if (kind === "note" || kind === "warning" || kind === "tip") {
      const tone: CalloutTone = kind === "tip" ? "recommend" : kind;
      return <Callout title={title ?? (kind === "tip" ? "Tip" : kind === "warning" ? "Warning" : "Note")} tone={tone}>{children}</Callout>;
    }
    return <blockquote {...props}>{children}</blockquote>;
  },
  table({ children, node: _node, ...props }) {
    return <TableFrame ariaLabel="Content table" className={styles.tableScroll}><table {...props}>{children}</table></TableFrame>;
  },
  pre({ children }) {
    const item = Children.toArray(children)[0];
    if (isValidElement<{ className?: string; children?: ReactNode }>(item) && !item.props.className) {
      return <CodeBlock>{String(item.props.children ?? "")}</CodeBlock>;
    }
    return <>{children}</>;
  },
  code({ children, className, node: _node, ...props }) {
    if (!className) return <code {...props}>{children}</code>;
    const language = className.replace(/^language-/, "");
    const source = String(children).replace(/\n$/, "");
    if (language === "chart-bar" || language === "chart-line" || language === "chart-donut") {
      return <ChartFromMarkdown kind={language.slice(6)} source={source} />;
    }
    return <CodeBlock label={language || undefined}>{source}</CodeBlock>;
  },
  img({ src, alt, node: _node, ...props }) {
    if (typeof src === "string" && src.startsWith("marker-art://")) {
      try {
        const svg = resolveMarkerArtReference(src);
        if (!svg || !alt?.trim()) throw new Error("Check the figure reference and caption.");
        return <MarkerArt svg={svg} caption={alt} />;
      } catch {
        return <span role="note">Figure unavailable: check its reference and caption.</span>;
      }
    }
    return <img src={src} alt={alt} {...props} />;
  },
};

function transformUrl(url: string) {
  return url.startsWith("marker-art://") ? url : defaultUrlTransform(url);
}

export function ContentMarkdown({ markdown, components: overrides }: { markdown: string; components?: Components }): ReactNode {
  return <ReactMarkdown components={overrides ? { ...components, ...overrides } : components} remarkPlugins={[remarkGfm, remarkContentBlocks, remarkDefinitionLists]} urlTransform={transformUrl}>{markdown}</ReactMarkdown>;
}

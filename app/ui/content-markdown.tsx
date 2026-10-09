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
import { UiChart } from "./charts/chart";
import type { UiChartSpec } from "./charts/chart-option";
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

type ChartDatum = { id: string; label: string; value: number; xLabel?: unknown; xValue?: unknown };

function isDatum(value: unknown): value is ChartDatum {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.label === "string" && typeof item.value === "number"
    && Number.isFinite(item.value) && (item.formattedValue === undefined || typeof item.formattedValue === "string");
}

/** Reads a chart fence's JSON into a chart spec, or throws a message the writer can act on. */
function chartFromFence(kind: string, source: string): UiChartSpec {
  const input: unknown = JSON.parse(source);
  if (!input || typeof input !== "object") throw new Error("Chart data must be an object.");
  const chart = input as Record<string, unknown>;
  if (typeof chart.title !== "string" || !chart.title.trim()) throw new Error("Add a chart title.");
  if (!Array.isArray(chart.data) || !chart.data.length || !chart.data.every(isDatum)) throw new Error("Add labeled data with finite numeric values.");
  const data: ChartDatum[] = chart.data;
  if (new Set(data.map((item) => item.id)).size !== data.length) throw new Error("Chart data IDs must be unique.");
  const valueLabel = typeof chart.valueLabel === "string" && chart.valueLabel.trim() ? chart.valueLabel : "Value";
  const shared = { caption: typeof chart.caption === "string" && chart.caption.trim() ? chart.caption : undefined, format: "number", height: 300, title: chart.title } as const;
  if (kind === "bar") {
    if (data.some((item) => item.value < 0)) throw new Error("Bar chart values must be zero or higher.");
    return { ...shared, categories: data.map((item) => item.label), kind: "bar", series: [{ id: "value", label: valueLabel, values: data.map((item) => item.value) }] };
  }
  if (kind === "donut") {
    if (data.some((item) => item.value < 0) || !data.some((item) => item.value > 0)) throw new Error("Donut chart values must be nonnegative and include a positive value.");
    return { ...shared, kind: "donut", slices: data.map(({ id, label, value }) => ({ id, label, value })) };
  }
  if (kind === "line") {
    if (typeof chart.valueLabel !== "string" || !chart.valueLabel.trim()) throw new Error("Add a value label.");
    if (!data.every((point) => typeof point.xLabel === "string" && (point.xValue === undefined || (typeof point.xValue === "number" && Number.isFinite(point.xValue))))) {
      throw new Error("Each point needs an xLabel and any xValue must be numeric.");
    }
    // Numeric x values space the points by their gaps; otherwise each label is one even step.
    if (data.some((point) => point.xValue !== undefined)) {
      if (data.some((point, index) => point.xValue === undefined || (index > 0 && (point.xValue as number) <= (data[index - 1].xValue as number)))) {
        throw new Error("Give every point an xValue, in increasing order.");
      }
      return { ...shared, kind: "line", series: [{ id: "value", label: valueLabel, points: data.map((point) => [point.xValue as number, point.value] as const) }], xFormat: "number" };
    }
    return { ...shared, kind: "line", series: [{ id: "value", label: valueLabel, points: data.map((point) => [point.xLabel as string, point.value] as const) }] };
  }
  throw new Error("Unknown chart type.");
}

function ChartFromMarkdown({ kind, source }: { kind: string; source: string }) {
  let spec: UiChartSpec;
  try {
    spec = chartFromFence(kind, source);
  } catch (error) {
    return <p role="note">Chart unavailable: {error instanceof SyntaxError ? "Check the chart JSON." : error instanceof Error ? error.message : "Check the chart data."}</p>;
  }
  return <UiChart interactive={false} spec={spec} />;
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

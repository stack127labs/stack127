import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { UiStaticChart } from "@/app/ui/charts/chart-static";
import {
  ContentCallout,
  ContentCode,
  ContentImage,
  ContentLink,
  ContentMarkerArt,
  ContentParagraph,
  ContentPre,
  ContentTable,
  Term,
  Terms,
} from "@/app/ui/content-elements";
import { UiDataTable } from "@/app/ui/display";

type BlockProps = { children: ReactNode; title?: string };

// Every component page content may use. Keep scripts/stack127/content/allowed-components.mjs aligned.
// UiChart loads the chart script, so it never goes here: a route that needs it passes it in.
const contentComponents: MDXComponents = {
  p: ContentParagraph,
  a: ContentLink,
  table: ContentTable,
  pre: ContentPre,
  code: ContentCode,
  img: ContentImage,
  Note: ({ children, title }: BlockProps) => <ContentCallout kind="note" title={title}>{children}</ContentCallout>,
  Warning: ({ children, title }: BlockProps) => <ContentCallout kind="warning" title={title}>{children}</ContentCallout>,
  Tip: ({ children, title }: BlockProps) => <ContentCallout kind="tip" title={title}>{children}</ContentCallout>,
  Formula: ({ children, title }: BlockProps) => <ContentCallout kind="formula" title={title}>{children}</ContentCallout>,
  Example: ({ children, title }: BlockProps) => <ContentCallout kind="example" title={title}>{children}</ContentCallout>,
  Terms,
  Term,
  UiStaticChart,
  UiDataTable,
  MarkerArt: ({ alt, figure }: { alt: string; figure: string }) => <ContentMarkerArt alt={alt} reference={`marker-art://${figure}`} />,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...contentComponents, ...components };
}

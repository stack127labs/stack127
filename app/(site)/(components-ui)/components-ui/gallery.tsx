import type { ReactNode } from "react";
import { CodeBlock } from "@/app/ui/site/code-block";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import type { GallerySection } from "./sections";
import styles from "./components-ui.module.css";

export function GalleryPage({ children, section }: { children: ReactNode; section: GallerySection }) {
  return (
    <PageCanvas>
      <PageHeader bordered>
        <h1><PageTitleIcon><section.icon strokeWidth={2.2} /></PageTitleIcon> {section.label}</h1>
        <p>{section.description}</p>
      </PageHeader>
      <div className={styles.examples}>{children}</div>
    </PageCanvas>
  );
}

/**
 * One example: a plain name, the components it shows, where they live, the working demo,
 * and optionally what to write to get it. Show each look once; list every component that renders it.
 */
export function Example({
  children,
  components,
  note,
  source,
  title,
  usage,
}: {
  children: ReactNode;
  components: string[];
  note?: ReactNode;
  source: string;
  title: string;
  /** What to write, for example the MDX tags. The label names the language. */
  usage?: { label: "MDX" | "TSX"; code: string };
}) {
  return (
    <section className={styles.example}>
      <div className={styles.exampleHeading}>
        <h2>{title}</h2>
        <p className={styles.source}>
          {components.map((name) => <code key={name}>{name}</code>)}
          <span>{source}</span>
        </p>
        {note ? <p>{note}</p> : null}
      </div>
      {children}
      {usage ? <CodeBlock label={usage.label}>{usage.code}</CodeBlock> : null}
    </section>
  );
}

import { ToolCard, type ToolCardData } from "@/app/ui/cards/tool-card";
import styles from "./tool-catalog.module.css";

export function ToolCatalog({ heading, tools }: { heading: string; tools: ToolCardData[] }) {
  return (
    <section aria-labelledby="catalog-tools-title" className={styles.section}>
      <h2 id="catalog-tools-title">{heading}</h2>
      <div className={styles.grid}>
        {tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
      </div>
    </section>
  );
}

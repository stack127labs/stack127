import Link from "next/link";
import { Doodle } from "@/app/ui/site/doodle";
import styles from "./tool-catalog.module.css";

export type CatalogTool = {
  art: string;
  description: string;
  href: string;
  name: string;
};

export function ToolCatalog({ heading, tools }: { heading: string; tools: CatalogTool[] }) {
  return (
    <section aria-labelledby="catalog-tools-title" className={styles.section}>
      <h2 id="catalog-tools-title">{heading}</h2>
      <div className={styles.grid} data-catalog-grid>
        {tools.map((tool) => (
          <Link className={styles.card} data-catalog-card href={tool.href} key={tool.href}>
            <span className={styles.art} data-catalog-card-art>
              <Doodle svg={tool.art} />
            </span>
            <span className={styles.copy}>
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </span>
            <span aria-hidden="true" className={styles.arrow}>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

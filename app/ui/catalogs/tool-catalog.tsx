import Link from "next/link";
import { Doodle } from "@/app/ui/site/doodle";
import type { LucideIcon } from "lucide-react";
import styles from "./tool-catalog.module.css";

export type CatalogTool = {
  art: string | null;
  description: string;
  href: string;
  icon?: LucideIcon;
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
              {tool.art ? <Doodle svg={tool.art} /> : tool.icon ? <span className={styles.icon}><tool.icon strokeWidth={1.4} /></span> : null}
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

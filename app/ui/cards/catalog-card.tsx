import Link from "next/link";
import { cardIcon } from "@/lib/card-icons";
import type { ToolCatalogCard, ToolCatalogSummary } from "@/lib/tool-catalogs";
import { intentPrefetch } from "@/app/ui/site/intent-prefetch";
import styles from "./catalog-card.module.css";

/** How many tools a catalog card lists before the "+ N more" row. */
export const CATALOG_CARD_TOOL_LIMIT = 5;

export type CatalogCardProps = {
  catalog: Pick<ToolCatalogSummary, "card_name" | "card_icon_key"> & { page: { slug: string } };
  /** The catalog's published tools, in catalog order. The card shows the first five. */
  tools: Pick<ToolCatalogCard, "slug" | "card_name">[];
};

/** A tool catalog's homepage card: icon, name, tool count, and its first tools. */
export function CatalogCard({ catalog, tools }: CatalogCardProps) {
  const Icon = cardIcon(catalog.card_icon_key);
  const href = `/${catalog.page.slug}`;
  const count = tools.length;
  const more = count - CATALOG_CARD_TOOL_LIMIT;
  return (
    <div className={styles.card}>
      <Link {...intentPrefetch} className={styles.head} href={href}>
        <span aria-hidden="true" className={styles.icon}><Icon size={15} strokeWidth={2.2} /></span>
        <h3 className={styles.name}>{catalog.card_name}</h3>
        <span className={styles.count}>{count.toLocaleString("en-US")} {count === 1 ? "tool" : "tools"}</span>
      </Link>
      {count > 0 ? (
        <ul className={styles.list}>
          {tools.slice(0, CATALOG_CARD_TOOL_LIMIT).map((tool) => (
            <li key={tool.slug}>
              <Link {...intentPrefetch} className={styles.tool} href={`/${tool.slug}`}>
                <span aria-hidden="true" className={styles.arrow}>→</span>
                {tool.card_name}
              </Link>
            </li>
          ))}
          {more > 0 ? (
            <li>
              <Link {...intentPrefetch} aria-label={`${more} more ${catalog.card_name}`} className={`${styles.tool} ${styles.more}`} href={href}>
                + {more} more
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

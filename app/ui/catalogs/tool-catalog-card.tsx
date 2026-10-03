import Link from "next/link";
import { Doodle } from "@/app/ui/site/doodle";
import { toolCatalogArt } from "@/lib/tool-catalog-art";
import { toolCatalogIcon } from "@/lib/tool-catalog-icons";
import type { ToolCatalogSummary } from "@/lib/tool-catalogs";
import styles from "./tool-catalog-card.module.css";

export function ToolCatalogCard({ catalog }: { catalog: ToolCatalogSummary }) {
  const Icon = toolCatalogIcon(catalog.icon_key);
  const art = toolCatalogArt(catalog.home_art_key);
  const { page, tool_count } = catalog;

  return (
    <Link className={styles.card} href={`/${page.slug}`} prefetch={false}>
      <span className={styles.art} aria-hidden="true">
        {art ? <Doodle svg={art} /> : <Icon size={64} strokeWidth={1.4} />}
      </span>
      <span className={styles.copy}>
        <h3 className={styles.title}>
          <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
          {catalog.card_name}
        </h3>
        <p className={styles.description}>{catalog.card_description}</p>
      </span>
      <span className={styles.count}>{tool_count.toLocaleString("en-US")} {tool_count === 1 ? "tool" : "tools"}</span>
    </Link>
  );
}

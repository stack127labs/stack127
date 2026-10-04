import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import type { ToolCatalogSummary } from "@/lib/tool-catalogs";
import { PageCard } from "./page-card";

/** A tool catalog's homepage card, with its published tool count. */
export function CatalogCard({ catalog }: { catalog: ToolCatalogSummary }) {
  const { page, tool_count } = catalog;
  return (
    <PageCard
      art={cardArt(catalog.card_art_key)}
      count={`${tool_count.toLocaleString("en-US")} ${tool_count === 1 ? "tool" : "tools"}`}
      description={catalog.card_description}
      href={`/${page.slug}`}
      icon={cardIcon(catalog.card_icon_key)}
      name={catalog.card_name}
    />
  );
}

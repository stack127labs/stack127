import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import type { ToolCatalogCard } from "@/lib/tool-catalogs";
import { PageCard } from "./page-card";

export type ToolCardData = Pick<ToolCatalogCard, "slug" | "card_name" | "card_description" | "card_icon_key" | "card_art_key">;

/** A tool's card in every catalog that lists it. */
export function ToolCard({ tool }: { tool: ToolCardData }) {
  return (
    <PageCard
      art={cardArt(tool.card_art_key)}
      description={tool.card_description}
      href={`/${tool.slug}`}
      icon={cardIcon(tool.card_icon_key)}
      name={tool.card_name}
      size="tool"
    />
  );
}

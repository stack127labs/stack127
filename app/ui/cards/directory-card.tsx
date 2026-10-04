import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import { PageCard, PageCardCounts, type PageCardCount } from "./page-card";

export type DirectoryCardData = {
  slug: string;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
};

/** A directory's homepage card. The directory's own code computes its counts. */
export function DirectoryCard({ page, counts }: { page: DirectoryCardData; counts: PageCardCount[] }) {
  return (
    <PageCard
      art={cardArt(page.card_art_key)}
      count={counts.length ? <PageCardCounts counts={counts} label={`${page.card_name} stats`} /> : null}
      description={page.card_description}
      href={`/${page.slug}`}
      icon={cardIcon(page.card_icon_key)}
      name={page.card_name}
    />
  );
}

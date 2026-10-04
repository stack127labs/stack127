import { cache } from "react";
import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getLaunchDirectorySnapshot } from "@/lib/launch-directories";

/** One snapshot per render feeds the card counts and the homepage freshness marker, so they can't straddle a refresh. */
export const getCardSnapshot = cache(getLaunchDirectorySnapshot);

export async function cardCounts(): Promise<PageCardCount[]> {
  const { directories } = await getCardSnapshot();
  return [
    { label: "places", value: directories.length },
    { label: "categories", value: new Set(directories.flatMap((directory) => directory.categories)).size },
  ];
}

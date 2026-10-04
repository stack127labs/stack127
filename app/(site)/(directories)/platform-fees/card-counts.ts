import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getFeeDirectory } from "@/lib/platform-fees/queries";

export async function cardCounts(): Promise<PageCardCount[]> {
  const directory = await getFeeDirectory();
  return [
    { label: "listings", value: directory.entries.length },
    { label: "categories", value: new Set(directory.sections.map(section => section.group_name)).size },
  ];
}

import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getFeeDirectory } from "@/lib/platform-fees/queries";

export async function cardCounts(): Promise<PageCardCount[]> {
  const directory = await getFeeDirectory();
  return [
    { label: "platforms", value: directory.entries.length },
    { label: "categories", value: directory.sections.length },
  ];
}

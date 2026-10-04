import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getSelfHostAppsStats } from "@/lib/apps";

export async function cardCounts(): Promise<PageCardCount[]> {
  return [{ label: "apps", value: (await getSelfHostAppsStats()).appCount }];
}

import type { PageCardCount } from "@/app/ui/cards/page-card";
import { shortcutAppCatalog } from "@/lib/shortcuts/catalog.generated";

export async function cardCounts(): Promise<PageCardCount[]> {
  return [
    { label: "apps", value: shortcutAppCatalog.length },
    { label: "shortcuts", value: shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0) },
  ];
}

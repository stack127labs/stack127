import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getTerminalApps } from "@/lib/terminal-apps";

export async function cardCounts(): Promise<PageCardCount[]> {
  return [{ label: "apps", value: (await getTerminalApps()).length }];
}

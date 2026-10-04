import type { PageCardCount } from "@/app/ui/cards/page-card";
import tldDirectory from "@/lib/domain/data/tld-directory.json";

export async function cardCounts(): Promise<PageCardCount[]> {
  return [{ label: "domain extensions", value: tldDirectory.rows.length }];
}

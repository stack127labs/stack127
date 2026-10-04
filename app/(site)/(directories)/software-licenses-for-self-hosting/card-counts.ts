import type { PageCardCount } from "@/app/ui/cards/page-card";
import { licenses } from "@/lib/software-licenses";

export async function cardCounts(): Promise<PageCardCount[]> {
  return [{ label: "licenses", value: licenses.length }];
}

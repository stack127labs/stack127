import type { PageCardCount } from "@/app/ui/cards/page-card";
import { STATUS_CODES } from "@/lib/domain/status-codes";

export async function cardCounts(): Promise<PageCardCount[]> {
  return [{ label: "status codes", value: STATUS_CODES.length }];
}

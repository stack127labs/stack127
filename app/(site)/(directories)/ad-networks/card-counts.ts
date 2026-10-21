import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getAdNetworkDirectoryData } from "@/lib/ad-networks";

export async function cardCounts(): Promise<PageCardCount[]> {
  const { networks_tracked, listed } = await getAdNetworkDirectoryData();
  return [
    { label: "networks", value: networks_tracked },
    { label: "sites", value: listed },
  ];
}

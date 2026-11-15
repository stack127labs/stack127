import type { PageCardCount } from "@/app/ui/cards/page-card";
import { getIndieCategoryData, indieCategories } from "@/lib/indie-hacker-apps";

export async function cardCounts(): Promise<PageCardCount[]> {
  const data = await Promise.all(indieCategories.map((category) => getIndieCategoryData(category.slug)));
  return [
    { label: "apps", value: data.reduce((sum, item) => sum + item.apps.length, 0) },
    { label: "categories", value: indieCategories.length },
  ];
}

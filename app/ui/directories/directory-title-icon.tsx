import type { ReactNode } from "react";
import { cardIcon } from "@/lib/card-icons";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";

/**
 * The h1 icon reads the same `card_icon_key` as the directory's homepage card
 * and sidebar row. A child page without its own key passes its parent's key.
 * A directory with no key yet shows its route's fallback icon.
 */
export function DirectoryTitleIcon({ iconKey, fallback }: { iconKey: string | null | undefined; fallback?: ReactNode }) {
  if (!iconKey && fallback) return <PageTitleIcon>{fallback}</PageTitleIcon>;
  const Icon = cardIcon(iconKey);
  return <PageTitleIcon><Icon strokeWidth={2.2} /></PageTitleIcon>;
}

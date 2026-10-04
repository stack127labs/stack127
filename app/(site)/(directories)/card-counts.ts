import type { PageCardCount } from "@/app/ui/cards/page-card";
import { cardCounts as cliApps } from "./cli-apps/card-counts";
import { cardCounts as eppStatusCodes } from "./epp-status-codes/card-counts";
import { cardCounts as keyboardShortcuts } from "./keyboard-shortcuts/card-counts";
import { cardCounts as launchDirectories } from "./launch-directories/card-counts";
import { cardCounts as platformFees } from "./platform-fees/card-counts";
import { cardCounts as selfHostApps } from "./self-host-apps/card-counts";
import { cardCounts as softwareLicenses } from "./software-licenses-for-self-hosting/card-counts";
import { cardCounts as tldDirectory } from "./tld-directory/card-counts";

/** Live homepage card counts. Each directory computes its own from its records. */
const counts: Record<string, () => Promise<PageCardCount[]>> = {
  "cli-apps": cliApps,
  "epp-status-codes": eppStatusCodes,
  "keyboard-shortcuts": keyboardShortcuts,
  "launch-directories": launchDirectories,
  "platform-fees": platformFees,
  "self-host-apps": selfHostApps,
  "software-licenses-for-self-hosting": softwareLicenses,
  "tld-directory": tldDirectory,
};

export function directoryCardCounts(slug: string) {
  const load = counts[slug];
  if (!load) throw new Error(`Directory card counts are missing for ${slug}`);
  return load();
}

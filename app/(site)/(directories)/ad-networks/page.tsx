import { Network } from "lucide-react";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { listAdNetworks } from "@/lib/ad-networks";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AdNetworkList } from "./ad-network-view";
import styles from "./page.module.css";

export default async function AdNetworksPage() {
  await getRequiredPublishedPage("ad-networks");
  const networks = await listAdNetworks("");

  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>About this directory</SidebarLabel></div>
    <p className={styles.sidebarCopy}>A network page shows publisher sites only after a current first-party check supports the relationship.</p>
  </div>;

  return <DirectoryQueryProvider route="/ad-networks">
    <AppShell mainLabel="Ad networks directory" sidebar={sidebar} sidebarLabel="Directory guide">
      <EntryHero art={null}>
        <PageHeader>
          <h1><PageTitleIcon><Network strokeWidth={2.2} /></PageTitleIcon>{" "}Ad networks and their publisher sites</h1>
          <p>Explore ad networks and the websites verified for each one. Counts include confirmed relationships only.</p>
        </PageHeader>
      </EntryHero>
      <PageCanvas flow className={styles.content}>
        <AdNetworkList networks={networks.map(({ name, slug, summary, verified_count }) => ({ name, slug, summary, verified_count }))} />
      </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}

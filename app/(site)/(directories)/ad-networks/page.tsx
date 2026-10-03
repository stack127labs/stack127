import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { Network } from "lucide-react";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { listAdNetworks } from "@/lib/ad-networks";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AdNetworkList } from "./ad-network-view";
import { AdNetworksSidebar } from "./ad-networks-sidebar";
import styles from "./page.module.css";

export default async function AdNetworksPage() {
  const directoryPage = await getRequiredDirectoryPage("ad-networks");
  await getRequiredPublishedPage("ad-networks");
  const networks = await listAdNetworks("");

  return <DirectoryQueryProvider route="/ad-networks">
    <AppShell mainLabel="Ad networks directory" menuLabel="Networks" sidebar={<AdNetworksSidebar networks={networks} />} sidebarLabel="Ad networks">
      <EntryHero art={null}>
        <PageHeader>
          <h1><PageTitleIcon><Network strokeWidth={2.2} /></PageTitleIcon>{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <ContentMarkdown markdown={directoryPage.intro_markdown} />
        </PageHeader>
      </EntryHero>
      <PageCanvas flow className={styles.content}>
        <AdNetworkList networks={networks.map(({ name, slug, summary, verified_count }) => ({ name, slug, summary, verified_count }))} />
      <DirectoryPageContent page={directoryPage} />
          </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}

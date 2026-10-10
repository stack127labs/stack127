import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { PageMeta } from "@/app/ui/site/page-meta";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { notFound } from "next/navigation";
import { Network } from "lucide-react";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import type { DirectoryIndexSource } from "@/app/ui/directories/directory-index";
import { AppShell } from "@/app/ui/site/app-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { getAdNetwork, listAdNetworks, listAllVerifiedPublishers, publisherPageSize, type VerifiedPublisher } from "@/lib/ad-networks";
import { getPublishedDirectoryPage, getRequiredDirectoryPage } from "@/lib/directory-pages";
import { PublisherList } from "../ad-network-view";
import { AdNetworksSidebar } from "../ad-networks-sidebar";
import styles from "../page.module.css";

// Build every network during the release. Unpublished networks still return 404.
export async function generateStaticParams() {
  return (await listAdNetworks("")).map((network) => ({ slug: network.slug }));
}

export default async function AdNetworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const directoryPage = await getRequiredDirectoryPage(`ad-networks/${slug}`);
  const [network, networks, parentPage] = await Promise.all([getAdNetwork(slug), listAdNetworks(""), getPublishedDirectoryPage("ad-networks")]);
  if (!network) notFound();
  const route = `/ad-networks/${slug}`;
  // The full list ships with the page for search and paging. A network with
  // thousands of sites should move it to a cached JSON route ({ url }).
  const rows = await listAllVerifiedPublishers(network.id);
  const index: DirectoryIndexSource<VerifiedPublisher> = { records: rows };

  return <DirectoryQueryProvider route={route}>
    <AppShell mainLabel={`${network.name} publisher sites`} menuLabel="Networks" sidebar={<AdNetworksSidebar networks={networks} current={slug} />} sidebarLabel="Ad networks">
      <PageCanvas flow className={styles.content}>
        <PageHeader breadcrumbs={await getBreadcrumbs(`ad-networks/${slug}`)} bordered>
          <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key ?? parentPage?.card_icon_key} fallback={<Network strokeWidth={2.2} />} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          <ContentMarkdown markdown={directoryPage.intro_markdown} />
        </PageHeader>
        {network.official_url ? <p className={styles.official}><a href={network.official_url} rel="noopener noreferrer" target="_blank">Official {network.name} website ↗</a></p> : null}
        <PublisherList firstPage={rows.slice(0, publisherPageSize)} index={index} networkName={network.name} route={route} total={rows.length} />
        <div className={styles.method}><DirectoryPageContent page={directoryPage} /></div>
      </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}

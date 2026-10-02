import Link from "next/link";
import { notFound } from "next/navigation";
import { Network } from "lucide-react";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import type { DirectoryIndexSource } from "@/app/ui/directories/directory-index";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { getAdNetwork, listAdNetworks, listAllVerifiedPublishers, publisherPageSize, type VerifiedPublisher } from "@/lib/ad-networks";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { PublisherList } from "../ad-network-view";
import styles from "../page.module.css";

// Build every network during the release. Unpublished networks still return 404.
export async function generateStaticParams() {
  return (await listAdNetworks("")).map((network) => ({ slug: network.slug }));
}

export default async function AdNetworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await getRequiredPublishedPage(`ad-networks/${slug}`);
  const network = await getAdNetwork(slug);
  if (!network) notFound();
  const route = `/ad-networks/${slug}`;
  // The full list ships with the page for search and paging. A network with
  // thousands of sites should move it to a cached JSON route ({ url }).
  const rows = await listAllVerifiedPublishers(network.id);
  const index: DirectoryIndexSource<VerifiedPublisher> = { records: rows };

  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>Ad networks</SidebarLabel></div>
    <Link href="/ad-networks">All ad networks</Link>
    <p className={styles.sidebarCopy}>Listed sites have a confirmed relationship. The label on each row says what the check supports.</p>
  </div>;

  return <DirectoryQueryProvider route={route}>
    <AppShell mainLabel={`${network.name} publisher sites`} sidebar={sidebar} sidebarLabel="Directory guide">
      <PageCanvas flow className={styles.content}>
        <PageHeader bordered>
          <h1><PageTitleIcon><Network strokeWidth={2.2} /></PageTitleIcon>{" "}{network.name} publisher websites</h1>
          <p>{network.summary ?? `Browse publisher websites with a verified ${network.name} relationship.`} A site can use more than one ad network.</p>
        </PageHeader>
        {network.official_url ? <p className={styles.official}><a href={network.official_url} rel="noopener noreferrer" target="_blank">Official {network.name} website ↗</a></p> : null}
        <PublisherList firstPage={rows.slice(0, publisherPageSize)} index={index} networkName={network.name} route={route} total={rows.length} />
        <p className={styles.method}>A site appears here only when its current ads.txt or live configuration supports the stated relationship. A seller authorization alone does not establish active use.</p>
      </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}

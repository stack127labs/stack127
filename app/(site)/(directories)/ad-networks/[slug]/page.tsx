import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAdNetworkPageData, listAdNetworks } from "@/lib/ad-networks";
import { NetworkLogo } from "@/app/ui/ad-networks/network-logo";
import { networkLogo } from "@/app/ui/ad-networks/network-logo-src";
import { SitesTable } from "@/app/ui/ad-networks/sites-table";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { Figure, adNetworksSectionNav, joinRule, joinSentence } from "../ad-networks-shared";
import { adNetworkContent } from "./content";
import { NetworkDetails } from "./network-details";
import { NetworkStats } from "./network-stats";
import styles from "./network.module.css";

// Build every network during the release. Unpublished networks still return 404.
export async function generateStaticParams() {
  return (await listAdNetworks()).map((network) => ({ slug: network.slug }));
}

/** The intro is one MDX paragraph; it joins the live sentences after it in one lede, like the mockup. */
const inline = { p: ({ children }: { children?: ReactNode }) => <>{children}</> };

export default async function AdNetworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = adNetworkContent[slug];
  if (!content) notFound();
  const directoryPage = await getRequiredDirectoryPage(`ad-networks/${slug}`);
  const [data, breadcrumbs] = await Promise.all([
    getAdNetworkPageData(slug),
    getBreadcrumbs(`ad-networks/${slug}`),
  ]);
  if (!data) notFound();
  const { network, sites, stats } = data;
  const { Intro } = content;
  const rule = joinRule(slug);
  const officialHost = network.official_url ? new URL(network.official_url).hostname.replace(/^www\./, "") : null;

  return (
    <AppShell mainLabel={`${network.name} ad network`} sectionNav={adNetworksSectionNav("/ad-networks")} sidebarPosition="none">
      <EntryHero art={null}>
        <PageHeader breadcrumbs={breadcrumbs} className={styles.header}>
          <h1><NetworkLogo logo={networkLogo(slug)} name={network.name} size="title" /><DirectoryPageTitle title={directoryPage.title} /></h1>
          <div className={styles.metaRow}>
            <PageMeta updatedAt={stats.updated_at ?? directoryPage.updated_at} />
            {network.official_url && officialHost ? (
              <a className={styles.official} href={network.official_url} rel="noopener noreferrer" target="_blank"><ExternalLink aria-hidden="true" />{officialHost}</a>
            ) : null}
          </div>
          <p>
            <Intro components={inline} />
            {rule ? <> {joinSentence(rule)}</> : null}
            {/* data-gate: the sync fills the listed and confirmed counts. */}
            {network.listed_count ? (
              network.listed_count === 1
                ? <> We list <Figure>{1}</Figure> site that uses {network.name}, and it {network.verified_count ? "is" : "isn't"} confirmed live from its own ads.txt file or ad code.</>
                : <> We list <Figure>{network.listed_count}</Figure> sites that use {network.name}, and <Figure live>{network.verified_count}</Figure> {network.verified_count === 1 ? "is" : "are"} confirmed live from their own ads.txt files or ad code.</>
            ) : null}
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas flow className={styles.body}>
        {network.listed_count ? (
          <SitesTable
            columns={["niche", "traffic", "age", "platform", "manager", "checked"]}
            defaultSort={sites.effectiveSort}
            heading={`Sites using ${network.name}`}
            headingId="sites"
            initial={sites}
            nicheFilter
            noun="sites"
            route={`/ad-networks/${slug}`}
            scope={{ network: slug }}
          />
        ) : null}
        <NetworkDetails content={content} name={network.name} slug={slug} />
        <NetworkStats network={network} stats={stats} />
      </PageCanvas>
    </AppShell>
  );
}

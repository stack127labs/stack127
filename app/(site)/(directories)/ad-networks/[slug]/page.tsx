import Link from "next/link";
import { notFound } from "next/navigation";
import { Network, Search } from "lucide-react";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { directoryPage, directoryPageHref, directoryQuery, getAdNetwork, listVerifiedPublishers } from "@/lib/ad-networks";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import styles from "../page.module.css";

type SearchParams = { q?: string | string[]; page?: string | string[] };

export default async function AdNetworkPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  await getRequiredPublishedPage(`ad-networks/${slug}`);
  const network = await getAdNetwork(slug);
  if (!network) notFound();
  const requested = await searchParams;
  const query = directoryQuery(requested.q);
  const route = `/ad-networks/${slug}`;
  const publishers = await listVerifiedPublishers(network.id, query, directoryPage(requested.page));

  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>Ad networks</SidebarLabel></div>
    <Link href="/ad-networks">All ad networks</Link>
    <p className={styles.sidebarCopy}>Listed sites have a confirmed relationship. The label on each row says what the check supports.</p>
  </div>;

  return <AppShell mainLabel={`${network.name} publisher sites`} sidebar={sidebar} sidebarLabel="Directory guide">
    <PageCanvas flow className={styles.content}>
      <PageHeader bordered>
        <h1><PageTitleIcon><Network strokeWidth={2.2} /></PageTitleIcon>{" "}{network.name} publisher websites</h1>
        <p>{network.summary ?? `Browse publisher websites with a verified ${network.name} relationship.`} A site can use more than one ad network.</p>
      </PageHeader>
      {network.official_url ? <p className={styles.official}><a href={network.official_url} rel="noopener noreferrer" target="_blank">Official {network.name} website ↗</a></p> : null}
      <form action={route} className={styles.search} role="search">
        <label htmlFor="publisher-search">Search verified sites</label>
        <div className={styles.searchRow}><Search aria-hidden="true" size={18} /><input defaultValue={query} id="publisher-search" name="q" placeholder="Search a domain" type="search" /><button type="submit">Search</button></div>
      </form>
      <div className={styles.results}><h2>Verified sites</h2><p>{publishers.total.toLocaleString("en-US")} {publishers.total === 1 ? "site" : "sites"}</p></div>
      {publishers.rows.length ? <>
        <ul className={styles.siteList}>{publishers.rows.map((site) => <li key={site.normalized_domain}>
          <div><a href={`https://${site.normalized_domain}`} rel="noopener noreferrer" target="_blank">{site.display_domain} <span aria-hidden="true">↗</span></a><span className={styles.domain}>{site.normalized_domain}</span></div>
          <div className={styles.siteMeta}><span>{site.relationship_type === "primary_or_exclusive_manager" ? "Primary or exclusive monetization manager" : "Uses this network"}</span><time dateTime={new Date(site.last_confirmed_at).toISOString()}>Checked {new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(site.last_confirmed_at))}</time></div>
        </li>)}</ul>
        <Pagination ariaLabel={`${network.name} publisher pages`} currentPage={publishers.currentPage} hrefForPage={(page) => directoryPageHref(route, query, page)} totalPages={publishers.totalPages} />
      </> : <StatePanel action={query ? <Link href={route}>Show all verified sites</Link> : undefined} title={query ? "No verified sites match that search" : "No publisher sites verified yet"}><p>{query ? "Try another part of the domain." : "This network will show sites here after their current records confirm a relationship."}</p></StatePanel>}
      <p className={styles.method}>A site appears here only when its current ads.txt or live configuration supports the stated relationship. A seller authorization alone does not establish active use.</p>
    </PageCanvas>
  </AppShell>;
}

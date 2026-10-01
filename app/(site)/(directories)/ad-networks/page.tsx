import Link from "next/link";
import { Network, Search } from "lucide-react";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { StatePanel } from "@/app/ui/state-panel";
import { directoryQuery, listAdNetworks } from "@/lib/ad-networks";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import styles from "./page.module.css";

type SearchParams = { q?: string | string[] };

export default async function AdNetworksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await getRequiredPublishedPage("ad-networks");
  const query = directoryQuery((await searchParams).q);
  const networks = await listAdNetworks(query);

  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>About this directory</SidebarLabel></div>
    <p className={styles.sidebarCopy}>A network page shows publisher sites only after a current first-party check supports the relationship.</p>
  </div>;

  return <AppShell mainLabel="Ad networks directory" sidebar={sidebar} sidebarLabel="Directory guide">
    <EntryHero art={null}>
      <PageHeader>
        <h1><PageTitleIcon><Network strokeWidth={2.2} /></PageTitleIcon>{" "}Ad networks and their publisher sites</h1>
        <p>Explore ad networks and the websites verified for each one. Counts include confirmed relationships only.</p>
      </PageHeader>
    </EntryHero>
    <PageCanvas flow className={styles.content}>
      <form action="/ad-networks" className={styles.search} role="search">
        <label htmlFor="ad-network-search">Search ad networks</label>
        <div className={styles.searchRow}><Search aria-hidden="true" size={18} /><input defaultValue={query} id="ad-network-search" name="q" placeholder="Search by network name" type="search" /><button type="submit">Search</button></div>
      </form>
      <div className={styles.results}><h2>Networks</h2><p>{networks.length.toLocaleString("en-US")} {networks.length === 1 ? "network" : "networks"}</p></div>
      {networks.length ? <div className={styles.grid}>{networks.map((network) => <article className={styles.card} key={network.id}>
        <div className={styles.cardMain}><h3><Link href={`/ad-networks/${network.slug}`}>{network.name}</Link></h3><p>{network.summary ?? "Browse verified publisher websites for this network."}</p></div>
        <div className={styles.cardFoot}><span>{network.verified_count.toLocaleString("en-US")} verified {network.verified_count === 1 ? "site" : "sites"}</span><Link aria-label={`View ${network.name} publishers`} href={`/ad-networks/${network.slug}`}>View sites <span aria-hidden="true">↗</span></Link></div>
      </article>)}</div> : <StatePanel action={<Link href="/ad-networks">Show all networks</Link>} title="No networks match that search"><p>Try a shorter name or browse all networks.</p></StatePanel>}
    </PageCanvas>
  </AppShell>;
}

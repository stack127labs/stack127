import { Network } from "lucide-react";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAdNetworkDirectoryData } from "@/lib/ad-networks";
import { getExactPublishedPage, getRequiredPublishedPage } from "@/lib/page-registry";
import { RegistryStructuredData } from "@/lib/registry-layout";
import { NetworkCard } from "@/app/ui/ad-networks/network-card";
import { networkLogo } from "@/app/ui/ad-networks/network-logo-src";
import { checkerHref } from "@/app/ui/ad-networks/site-format";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import Article from "./content/article.mdx";
import { Figure, adNetworksSectionNav, joinLabel } from "./ad-networks-shared";
import { DirectoryView, HeroSearch, NetworkBrowser, type DirectoryNiche } from "./directory-browser";
import styles from "./directory.module.css";

// A real confirmed site, shown as an example the search box can check.
const exampleDomain = "collegefashion.net";

export default async function AdNetworksPage() {
  const [directoryPage, data, breadcrumbs] = await Promise.all([
    getRequiredDirectoryPage("ad-networks"),
    getAdNetworkDirectoryData(),
    getBreadcrumbs("ad-networks"),
    getRequiredPublishedPage("ad-networks"),
  ]);

  // data-gate: the niche run fills by_niche once classification coverage passes; until then the
  // By niche sort, the niche filter, niche search, and the niche example stay hidden.
  const niches: DirectoryNiche[] = data.by_niche.map(({ niche, networks }) => ({
    slug: niche.slug,
    name: niche.name,
    order: [...networks].sort((a, b) => b.niche_count - a.niche_count).map((network) => network.slug),
  }));
  const publishedNiches = (await Promise.all(data.by_niche.map(async ({ niche }) =>
    (await getExactPublishedPage(`ad-networks/niches/${niche.slug}`)) ? { slug: niche.slug, name: niche.name } : null)))
    .filter((niche) => niche !== null);

  const networks = data.most_sites.map(({ name, slug }) => ({ name, slug }));
  const cards = Object.fromEntries(data.most_sites.map((network) => [network.slug, (
    <NetworkCard
      confirmed={network.verified_count}
      href={`/ad-networks/${network.slug}`}
      join={joinLabel(network.slug).value}
      logo={networkLogo(network.slug)}
      name={network.name}
      sites={network.listed_count}
    />
  )]));
  const easiest = data.easiest_to_join.map((network) => network.slug);
  const anyOpen = data.easiest_to_join.some((network) => network.minTraffic?.amount === 0);

  const examples = [
    ...(data.most_sites[0] ? [{ label: data.most_sites[0].name, href: `/ad-networks/${data.most_sites[0].slug}` }] : []),
    { label: exampleDomain, href: checkerHref(exampleDomain) },
    ...(publishedNiches[0] ? [{ label: publishedNiches[0].name, href: `/ad-networks/niches/${publishedNiches[0].slug}` }] : []),
  ];

  return (
    <>
      <RegistryStructuredData path="/ad-networks" />
      <AppShell mainLabel="Ad networks directory" sectionNav={adNetworksSectionNav("/ad-networks")} sidebarPosition="none">
        <DirectoryView niches={niches} sorts={data.availableSorts}>
          <EntryHero art={null}>
            <PageHeader breadcrumbs={breadcrumbs} className={styles.header}>
              <h1><DirectoryTitleIcon fallback={<Network strokeWidth={2.2} />} iconKey={directoryPage.card_icon_key} /> <DirectoryPageTitle title={directoryPage.title} /></h1>
              <PageMeta updatedAt={data.updated_at ?? directoryPage.updated_at} />
              <p>
                A directory of <Figure>{data.networks_tracked}</Figure> ad networks for publishers, from Ezoic and Mediavine to Google AdSense. See what each one takes to join and how many sites run it.
                {/* data-gate: the sync fills the listed and confirmed counts. */}
                {data.listed ? <> We list <Figure>{data.listed}</Figure> sites, and <Figure live>{data.confirmed}</Figure> {data.confirmed === 1 ? "is" : "are"} confirmed live from their own ads.txt files or ad code.</> : null}
              </p>
              <HeroSearch
                examples={examples}
                networks={networks}
                niches={publishedNiches}
                placeholder={publishedNiches.length ? "Network, site, or niche" : "Network or site"}
              />
            </PageHeader>
          </EntryHero>
          <PageCanvas flow className={styles.body}>
            <NetworkBrowser
              cards={cards}
              easiest={easiest}
              easiestNote={anyOpen
                ? "Networks with no traffic minimum first, then the lowest minimums. Networks that don't publish one come last."
                : "The lowest traffic minimums first. Networks that don't publish one come last."}
              networks={networks}
              niches={niches}
              sorts={data.availableSorts}
            />
            <article className={styles.article}>
              <Article />
            </article>
          </PageCanvas>
        </DirectoryView>
      </AppShell>
    </>
  );
}

import { currentText } from "@/lib/current-text.mjs";
import { Network } from "@/app/ui/icons";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAdNetworkDirectoryCardFacts, getAdNetworkDirectoryData } from "@/lib/ad-networks";
import { getExactPublishedPage } from "@/lib/page-registry";
import { RegistryStructuredData } from "@/lib/registry-layout";
import { AhrefsCredit } from "@/app/ui/ahrefs-credit";
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
import { Figure, adNetworksSectionNav } from "./ad-networks-shared";
import { DirectoryView, HeroSearch, NetworkBrowser, type DirectoryNiche } from "./directory-browser";
import styles from "./directory.module.css";

// A real confirmed site, shown as an example the search box can check.
const exampleDomain = "collegefashion.net";

export default async function AdNetworksPage() {
  const directoryPage = await getRequiredDirectoryPage("ad-networks");
  const [data, cardFacts, breadcrumbs] = await Promise.all([
    getAdNetworkDirectoryData(),
    getAdNetworkDirectoryCardFacts(),
    getBreadcrumbs("ad-networks"),
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
      averageDr={cardFacts[network.slug]?.average_dr}
      href={`/ad-networks/${network.slug}`}
      logo={networkLogo(network.slug)}
      name={network.name}
      sites={network.listed_count}
      topNiches={cardFacts[network.slug]?.top_niches}
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
              <PageMeta updatedAt={directoryPage.updated_at} />
              <p>
                Trying to pick an ad network for your site?{" "}
                {/* data-gate: the sync fills the listed count. */}
                {data.listed
                  ? <>We found ads on <Figure>{data.listed}</Figure> websites so far, and here are the top <Figure>{data.networks_tracked}</Figure> ad networks in {currentText("[year]")}.</>
                  : <>Here are the top <Figure>{data.networks_tracked}</Figure> ad networks in {currentText("[year]")}.</>}
                {" "}You can open each network to find the list of all the sites it works with, its rules to join, and stats and insights that will help you make a better judgement.
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
              credit={Object.values(cardFacts).some((facts) => facts.average_dr !== null) ? <AhrefsCredit /> : null}
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

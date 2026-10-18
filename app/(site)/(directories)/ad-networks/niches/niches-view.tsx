import type { ReactNode } from "react";
import { Shapes } from "lucide-react";
import type { Breadcrumb } from "@/lib/breadcrumbs";
import type { AdNetworkNichesPageData } from "@/lib/ad-networks-types";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { NichesTable, type NicheTableRow } from "@/app/ui/ad-networks/niches-table";
import { AdSection } from "@/app/ui/ad-networks/section";
import { Heatmap } from "@/app/ui/ad-networks/viz/heatmap";
import { Treemap } from "@/app/ui/ad-networks/viz/treemap";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { Figure, adNetworksSectionNav, joinLabel } from "../ad-networks-shared";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import styles from "./niches.module.css";

/** Networks shown as columns in the niche grid: the ones on the most sites. */
const gridNetworks = 9;

const inlineIntro = { p: ({ children }: { children?: ReactNode }) => <>{children}</> };
/** Short names from the mockup, such as `AdSense` and `Journey`, where space is tight. */
const shortName = (name: string) => name.replace(/^Google /, "").replace(/ by Mediavine$/, "");
const networkHref = (slug: string) => `/ad-networks/${slug}`;

/**
 * The niches index (mockup `niches.html`): sites per niche, each niche's top networks, and the
 * niche by network grid. Takes loader data so it can be checked with any data.
 */
export function NichesView({ breadcrumbs, data, nicheHref, title, updatedAt }: {
  breadcrumbs: Breadcrumb[];
  data: AdNetworkNichesPageData;
  /** The niche page link, or undefined while that page isn't published. */
  nicheHref: (slug: string) => string | undefined;
  title: string;
  updatedAt: string | Date | null;
}) {
  const { niches } = data;
  const rows: NicheTableRow[] = niches.map((niche) => ({
    slug: niche.slug,
    name: niche.name,
    href: nicheHref(niche.slug),
    sites: niche.listed,
    live: niche.confirmed,
    share: niche.share / 100,
    top: niche.networks.slice(0, 3).map((network) => ({ name: shortName(network.name), href: networkHref(network.slug), share: network.share / 100 })),
    easiest: niche.easiest_to_join
      ? { name: shortName(niche.easiest_to_join.name), href: networkHref(niche.easiest_to_join.slug), rule: joinLabel(niche.easiest_to_join.slug).value }
      : undefined,
    networkShares: Object.fromEntries(niche.networks.map((network) => [network.slug, network.share / 100])),
  }));
  const columns = data.networks.slice(0, gridNetworks);

  return (
    <AppShell mainLabel="Ad networks by niche" sectionNav={adNetworksSectionNav("/ad-networks/niches")} sidebarPosition="none">
      <EntryHero art={null}>
        <PageHeader breadcrumbs={breadcrumbs}>
          <h1><DirectoryTitleIcon fallback={<Shapes strokeWidth={2.2} />} iconKey={null} /> <DirectoryPageTitle title={title} /></h1>
          <PageMeta updatedAt={updatedAt} />
          <p>
            <Intro components={inlineIntro} />
            {niches.length ? (
              <> We sort <Figure>{data.classified}</Figure> of the <Figure>{data.listed}</Figure> sites we list into <Figure>{niches.length}</Figure> niches.{data.unclassified ? <> The other <Figure>{data.unclassified}</Figure> aren't sorted yet.</> : null}</>
            ) : null}
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas flow>
        {/* data-gate: the niche run sorts sites into niches; until it reaches coverage the loader returns none and these sections hide. */}
        {niches.length ? (
          <>
            <AdSection description="Each block is one niche, sized by how many of our sites belong to it." id="sizes" title="Which niches have the most sites?">
              <Treemap caption="Sites per niche" items={niches.map((niche) => ({ label: niche.name, value: niche.listed, href: nicheHref(niche.slug) }))} total={data.classified} />
            </AdSection>
            <NichesTable
              description="The three networks used most in each niche, and the easiest of those three to join."
              id="by-niche"
              networks={data.networks.map((network) => ({ value: network.slug, label: shortName(network.name) }))}
              rows={rows}
              title="Which ad networks does each niche use?"
            />
            {columns.length ? (
              <AdSection description="The share of each niche's sites that run each network. Darker cells mean more sites." id="grid" title="Which networks lead in each niche?">
                <Heatmap
                  caption="Share of each niche's sites that run each network"
                  columns={columns.map((network) => ({ key: network.slug, label: shortName(network.name) }))}
                  corner="niche"
                  rows={niches.map((niche) => ({
                    label: niche.name,
                    href: nicheHref(niche.slug),
                    values: columns.map((network) => {
                      const share = niche.networks.find((row) => row.slug === network.slug)?.share;
                      return share === undefined ? null : Math.round(share);
                    }),
                  }))}
                  unitNote="Numbers are % of the niche's sites."
                />
              </AdSection>
            ) : null}
          </>
        ) : null}
        <article className={`${proseClassName} ${proseFlowClassName} ${styles.article}`}>
          <Article />
        </article>
      </PageCanvas>
    </AppShell>
  );
}

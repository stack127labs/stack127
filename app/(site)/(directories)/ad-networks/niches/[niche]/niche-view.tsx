import Link from "next/link";
import type { ReactNode } from "react";
import type { MDXContent } from "mdx/types";
import { Shapes } from "lucide-react";
import type { Breadcrumb } from "@/lib/breadcrumbs";
import type { AdNetworkNichePageData } from "@/lib/ad-networks-types";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { NetworkLadder } from "@/app/ui/ad-networks/network-ladder";
import { AdSection } from "@/app/ui/ad-networks/section";
import { checkerHref, formatDay } from "@/app/ui/ad-networks/site-format";
import { SitesTable } from "@/app/ui/ad-networks/sites-table";
import { MoveBars } from "@/app/ui/ad-networks/viz/bars";
import { NewestList } from "@/app/ui/ad-networks/viz/lists";
import { SizeStacks } from "@/app/ui/ad-networks/viz/size-stacks";
import { ReportBlock, ReportRow } from "@/app/ui/report";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { Figure, NOT_PUBLIC, adNetworksSectionNav, joinLabel, joinOrder } from "../../ad-networks-shared";
import { trafficLabel, trafficOrder } from "@/lib/ad-networks-report";
import styles from "../niches.module.css";

/** Networks drawn by name in the size stacks. The rest are grouped as Other. */
const sizeNetworks = 5;

const inlineIntro = { p: ({ children }: { children?: ReactNode }) => <>{children}</> };
/** Short names from the mockup, such as `AdSense` and `Journey`, where space is tight. */
const shortName = (name: string) => name.replace(/^Google /, "").replace(/ by Mediavine$/, "");
const networkHref = (slug: string) => `/ad-networks/${slug}`;

/** Each size group as 100% split across the niche's biggest networks, with the rest as Other. */
function sizeStacks(traffic: AdNetworkNichePageData["traffic"]) {
  const totals = new Map<string, { name: string; count: number }>();
  for (const group of traffic) {
    for (const network of group.networks) {
      totals.set(network.slug, { name: network.name, count: (totals.get(network.slug)?.count ?? 0) + network.count });
    }
  }
  const shown = [...totals.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, sizeNetworks);
  const groups = [...traffic].sort((a, b) => trafficOrder(a.traffic_group) - trafficOrder(b.traffic_group)).map((group) => {
    // Raw shares from counts; Other is the sites left over, so rounding never invents a slice.
    const counts = shown.map(([slug]) => group.networks.find((row) => row.slug === slug)?.count ?? 0);
    const rest = Math.max(0, group.sites - counts.reduce((sum, value) => sum + value, 0));
    const share = (count: number) => (group.sites ? (count / group.sites) * 100 : 0);
    return { label: trafficLabel(group.traffic_group), sites: group.sites, shares: [...counts.map(share), share(rest)] };
  });
  return { groups, series: [...shown.map(([, network]) => ({ label: network.name })), { label: "Other" }] };
}

/**
 * One niche (mockup `food.html`): its sites, the networks they run with what it takes to join,
 * what sites of each size run, and recent moves. Takes loader data so it can be checked with any data.
 */
export function NicheView({ breadcrumbs, data, Intro, title, updatedAt }: {
  breadcrumbs: Breadcrumb[];
  data: AdNetworkNichePageData;
  Intro: MDXContent;
  title: string;
  updatedAt: string | Date | null;
}) {
  const { niche, sites, switches } = data;
  const noun = `${niche.name.toLowerCase()} sites`;
  const leader = niche.networks[0];
  const sizes = sizeStacks(data.traffic);
  const newest = (data.newest_arrivals ?? []).map((arrival) => ({
    domain: arrival.site.domain,
    href: checkerHref(arrival.site.domain),
    network: shortName(arrival.network.name),
    networkHref: networkHref(arrival.network.slug),
    date: formatDay(arrival.observed_at) ?? "",
  }));
  const moves = switches.slice(0, 6).map((row) => ({
    from: shortName(row.from.name),
    fromHref: networkHref(row.from.slug),
    to: shortName(row.to.name),
    toHref: networkHref(row.to.slug),
    count: row.count,
  }));
  const movesDescription = moves.length && newest.length
    ? `${niche.name} sites that switched networks in the last 90 days, and the newest sites on each network.`
    : moves.length ? `${niche.name} sites that switched networks in the last 90 days.` : `The newest ${noun} we found, and the network each one joined.`;

  return (
    <AppShell mainLabel={`Ad networks for ${noun}`} sectionNav={adNetworksSectionNav("/ad-networks/niches")} sidebarPosition="none">
      <EntryHero art={null}>
        <PageHeader breadcrumbs={breadcrumbs}>
          <h1><DirectoryTitleIcon fallback={<Shapes strokeWidth={2.2} />} iconKey={null} /> <DirectoryPageTitle title={title} /></h1>
          <PageMeta updatedAt={updatedAt} />
          <p>
            <Intro components={inlineIntro} /> We list <Figure>{niche.listed}</Figure> {noun}, and <Figure live>{niche.confirmed}</Figure> {niche.confirmed === 1 ? "is" : "are"} confirmed live from their own ads.txt files or ad code.
            {leader ? <> <Link href={networkHref(leader.slug)}>{leader.name}</Link> runs on more of them than any other network.</> : null}
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas className={styles.sections} flow>
        <SitesTable
          columns={["networks", "traffic", "age", "platform", "checked"]}
          defaultSort={sites.effectiveSort}
          heading={`Which ${noun} run ads?`}
          headingId="sites"
          initial={sites}
          networkFilter={niche.networks.map(({ name, slug }) => ({ name, slug }))}
          noun={noun}
          route={`/ad-networks/niches/${niche.slug}`}
          scope={{ niche: niche.slug }}
        />

        {niche.networks.length ? (
          <NetworkLadder
            countLabel={noun}
            description={`Every network that runs on ${noun}, with what it takes to join.`}
            id="networks"
            rows={niche.networks.map((network) => {
              const rule = joinLabel(network.slug).value;
              return {
                name: shortName(network.name),
                href: networkHref(network.slug),
                sites: network.count,
                rule: rule === NOT_PUBLIC || rule === "Not listed" ? null : rule,
                ruleRank: joinOrder(network.slug),
              };
            })}
            shareLabel={`share of ${noun}`}
            title={`Which ad networks do ${noun} use?`}
            total={niche.listed}
          />
        ) : null}

        {/* data-gate: the traffic run and resolved main managers fill the size groups. */}
        {sizes.groups.length ? (
          <AdSection description="Sites grouped by their place in Chrome's list of the most visited sites. Each site counts once, under its main ad network." id="sizes" title={`What do ${noun} of each size run?`}>
            <SizeStacks caption={`Main ad network of ${noun} in each traffic group`} groups={sizes.groups} series={sizes.series} />
          </AdSection>
        ) : null}

        {/* data-gate: the verifier's manager replacements fill switches; observed arrivals (never the starting import) fill newest sites. */}
        {moves.length || newest.length ? (
          <AdSection description={movesDescription} id="moves" title={`Which networks are ${noun} moving to?`}>
            <ReportRow layout="1-1">
              {moves.length ? (
                <ReportBlock label="switches, last 90 days">
                  <MoveBars ariaLabel={`${niche.name} sites that switched networks`} moves={moves} />
                </ReportBlock>
              ) : null}
              {newest.length ? (
                <ReportBlock label="newest sites">
                  <NewestList caption={`Newest ${noun}`} sites={newest} />
                </ReportBlock>
              ) : null}
            </ReportRow>
          </AdSection>
        ) : null}
      </PageCanvas>
    </AppShell>
  );
}

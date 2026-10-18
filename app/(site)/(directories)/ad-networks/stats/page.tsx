import type { ReactNode } from "react";
import { ChartColumn } from "lucide-react";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAdNetworkStatsPageData } from "@/lib/ad-networks";
import type { AdNetworkStatsPageData } from "@/lib/ad-networks-types";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { Report, ReportBars, ReportBlock, ReportGroup, ReportNumbers, ReportRow, type ReportNumber } from "@/app/ui/report";
import { ColumnChart } from "@/app/ui/ad-networks/viz/columns";
import { DivergingBars } from "@/app/ui/ad-networks/viz/diverging-bars";
import { DotPlot } from "@/app/ui/ad-networks/viz/dot-plot";
import { formatCompact, logStepPosition } from "@/app/ui/ad-networks/viz/format";
import { MultiLine, type LineSeries } from "@/app/ui/ad-networks/viz/multi-line";
import { ScatterPlot } from "@/app/ui/ad-networks/viz/scatter-plot";
import { SizeStacks } from "@/app/ui/ad-networks/viz/size-stacks";
import { StackedColumns } from "@/app/ui/ad-networks/viz/stacked-columns";
import { formatCount } from "@/app/ui/ad-networks/site-format";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { Figure, adNetworksSectionNav, percent } from "../ad-networks-shared";
import { trafficLabel, trafficOrder } from "@/lib/ad-networks-report";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import styles from "./stats.module.css";

/** Networks drawn by name in the size stacks. The rest are grouped as Other. */
const sizeNetworks = 5;
/** Line colors for the five biggest networks, in rank order, as in the mockup. */
const lineTones: Pick<LineSeries, "tone" | "dashed">[] = [{ tone: "ac" }, { tone: "ac2" }, { tone: "n1" }, { tone: "ac", dashed: true }, { tone: "n2" }];

/** Chart labels use the short names from the mockup, such as `AdSense` and `Journey`. */
const shortName = (name: string) => name.replace(/^Google /, "").replace(/ by Mediavine$/, "");
const inlineIntro = { p: ({ children }: { children?: ReactNode }) => <>{children}</> };
const monthShort = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const monthFull = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const weekLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const day = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);

/** How we confirmed each link, in words. Keys come from the verifier. */
const methodLabels: Record<string, string> = {
  ads_txt_managerdomain: "ads.txt MANAGERDOMAIN line",
  ads_txt_and_adsense_account: "ads.txt and AdSense account",
  ads_txt_and_page_signature: "ads.txt and page ad setup",
  page_signature: "Page ad setup only",
};
const methodLabel = (key: string) => methodLabels[key] ?? key.replace(/_/g, " ");

/** Month-end counts of the biggest networks, on the dates every line has. */
function shareOverTime(history: AdNetworkStatsPageData["history"]) {
  const dates = [...new Set(history.flatMap((network) => network.history.map((row) => row.date)))]
    .filter((date) => history.every((network) => network.history.some((row) => row.date === date)))
    .sort();
  return {
    points: dates.map((date) => ({ label: monthShort.format(day(date)), fullLabel: monthFull.format(day(date)) })),
    series: history.slice(0, lineTones.length).map((network, index) => ({
      label: network.name,
      shortLabel: shortName(network.name),
      values: dates.map((date) => network.history.find((row) => row.date === date)?.listed ?? 0),
      ...lineTones[index],
    })),
  };
}

/** Each size group as 100% split across the biggest networks, with the rest as Other. */
function sizeStacks(traffic: AdNetworkStatsPageData["traffic"]) {
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


// Monthly traffic minimums on the joining rule chart's x axis (mockup `SCX`).
const ruleSteps = [0, 1_000, 10_000, 50_000, 100_000, 500_000, 1_000_000];
const ruleStepLabels = ruleSteps.map((step) => (step ? formatCompact(step) : "none"));
export default async function AdNetworkStatsPage() {
  const directoryPage = await getRequiredDirectoryPage("ad-networks/stats");
  const [data, breadcrumbs] = await Promise.all([
    getAdNetworkStatsPageData(),
    getBreadcrumbs("ad-networks/stats"),
  ]);

  const summary: ReportNumber[] = [
    { label: "sites listed", value: formatCount(data.listed) },
    { label: "confirmed live", value: formatCount(data.confirmed), accent: true },
    { label: "networks tracked", value: formatCount(data.networks_tracked) },
    ...(data.multiple_networks_share === null ? [] : [{ label: "run 2+ networks", value: percent(data.multiple_networks_share) }]),
  ];
  const shareRows = data.market_share.filter((row) => row.count > 0).slice(0, 12)
    .map((row) => ({ label: row.name, value: row.count, display: `${row.share.toFixed(1)}% · ${formatCount(row.count)}`, href: `/ad-networks/${row.slug}` }));
  const lines = shareOverTime(data.history);

  const changes = [...data.net_change].sort((a, b) => b.change - a.change);
  const changeRows = (changes.length > 10 ? [...changes.slice(0, 5), ...changes.slice(-5)] : changes)
    .map((row) => ({ label: row.name, shortLabel: shortName(row.name), value: row.change }));
  const switchRows = data.switches.slice(0, 6)
    .map((row) => ({ label: `${shortName(row.from.name)} → ${shortName(row.to.name)}`, value: row.count, display: formatCount(row.count) }));

  const sizes = sizeStacks(data.traffic);

  const perSiteTotal = data.networks_per_site.reduce((sum, row) => sum + row.count, 0);
  const perSite = data.networks_per_site.map((row, index) => {
    const share = perSiteTotal ? (row.count / perSiteTotal) * 100 : 0;
    return { label: row.key === "1" ? "1 network" : row.label, value: share, display: percent(share), tone: index ? "ac3" as const : "ac" as const };
  });
  const pairRows = data.pairs.slice(0, 5)
    .map((row) => ({ label: `${shortName(row.first.name)} + ${shortName(row.second.name)}`, value: row.count, display: formatCount(row.count) }));

  // The mockup's fixed steps. Each network sits by its real minimum on a log scale between them.
  const scatter = data.joining_rules.map((rule) => ({
    label: rule.name,
    shortLabel: shortName(rule.name),
    x: logStepPosition(rule.amount, ruleSteps),
    xDisplay: rule.amount ? `${formatCount(rule.amount)} ${rule.unit}` : "none",
    y: rule.sites,
  }));
  const ageRows = data.median_domain_age.slice(0, 9).map((row) => ({ label: row.name, shortLabel: shortName(row.name), value: Math.round(row.years) }));
  const wordpressRows = data.wordpress_share.slice(0, 8)
    .map((row) => ({ label: row.name, value: row.share, display: percent(row.share), href: `/ad-networks/${row.slug}` }));

  const ads = data.ads_txt_metrics;
  const fileSizeTop = Math.max(0, ...data.ads_txt.file_sizes.map((row) => row.count));
  const fileSizes = data.ads_txt.file_sizes.map((row) => {
    const share = data.ads_txt.measured ? (row.count / data.ads_txt.measured) * 100 : 0;
    return { label: row.label, value: row.count, display: percent(share), tone: row.count === fileSizeTop ? "ac" as const : "n2" as const };
  });

  const fresh = data.freshness;
  const freshNumbers: ReportNumber[] = [
    ...(fresh.checked_share === null ? [] : [{ label: "checked in the last 7 days", value: percent(fresh.checked_share) }]),
    ...(data.confirmed_share === null ? [] : [{ label: "confirmed live", value: `${data.confirmed_share.toFixed(1)}%`, accent: true }]),
    ...(fresh.new_last_week === null ? [] : [{ label: "new sites last week", value: formatCount(fresh.new_last_week) }]),
  ];
  const weeks = fresh.weekly.map((row) => ({ label: `Week of ${weekLabel.format(day(row.week))}`, total: row.discovered + row.checker, part: row.checker }));
  const methodTotal = data.verification_methods.reduce((sum, row) => sum + row.count, 0);
  const methodRows = data.verification_methods.map((row) => ({
    label: methodLabel(row.key),
    value: row.count,
    display: `${percent(methodTotal ? (row.count / methodTotal) * 100 : 0)} · ${formatCount(row.count)}`,
  }));

  return (
    <AppShell mainLabel="Ad network market share and stats" sectionNav={adNetworksSectionNav("/ad-networks/stats")} sidebarPosition="none">
      <EntryHero art={null}>
        <PageHeader breadcrumbs={breadcrumbs}>
          <h1><DirectoryTitleIcon fallback={<ChartColumn strokeWidth={2.2} />} iconKey={null} /> <DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          <p>
            <Intro components={inlineIntro} /> From our checks of <Figure>{data.listed}</Figure> sites across <Figure>{data.networks_tracked}</Figure> networks, with <Figure live>{data.confirmed}</Figure> confirmed live.
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas flow>
        <Report ariaLabel="Ad network stats">
          <ReportGroup level={2} title="Which ad networks do most sites use?">
            <ReportNumbers items={summary} />
            {shareRows.length || lines.points.length > 1 ? (
              <ReportRow layout="1-1">
                {shareRows.length ? (
                  <ReportBlock description="The share of all sites we list that run each network. A site can run more than one." label="market share">
                    <ReportBars ariaLabel="Market share by network" rows={shareRows} />
                  </ReportBlock>
                ) : null}
                {/* data-gate: daily snapshots fill a second month end for the five biggest networks. */}
                {lines.points.length > 1 ? (
                  <ReportBlock description="Sites on the five biggest networks at the end of each month." label="share over time">
                    <MultiLine caption="Sites on the five biggest networks at the end of each month" points={lines.points} series={lines.series} />
                  </ReportBlock>
                ) : null}
              </ReportRow>
            ) : null}
          </ReportGroup>

          {/* data-gate: 90 days of snapshots fill net change; the verifier's manager replacements fill switches. */}
          {changeRows.length || switchRows.length ? (
            <ReportGroup level={2} title="Which ad networks are growing?">
              <ReportRow layout="1-1">
                {changeRows.length ? (
                  <ReportBlock description="Sites gained minus sites lost." label="net change, last 90 days">
                    <DivergingBars caption="Net change in sites per network, last 90 days" rows={changeRows} />
                  </ReportBlock>
                ) : null}
                {switchRows.length ? (
                  <ReportBlock description="The most common moves from one network to another." label="biggest switches, last 90 days">
                    <ReportBars ariaLabel="Most common switches between networks" rows={switchRows} />
                  </ReportBlock>
                ) : null}
              </ReportRow>
            </ReportGroup>
          ) : null}

          {/* data-gate: the traffic run and resolved main managers fill the size groups. */}
          {sizes.groups.length ? (
            <ReportGroup level={2} title="What do sites of each size run?">
              <ReportBlock description="Sites grouped by their place in Chrome's list of the most visited sites. Each site counts once, under its main ad network.">
                <SizeStacks caption="Main ad network of sites in each traffic group" groups={sizes.groups} series={sizes.series} />
              </ReportBlock>
            </ReportGroup>
          ) : null}

          {perSiteTotal || pairRows.length ? (
            <ReportGroup level={2} title="How many ad networks does a site run?">
              <ReportRow layout="1-1">
                {perSiteTotal ? (
                  <ReportBlock description="Networks from our list found on each site." label="networks per site">
                    <ColumnChart caption="Share of sites by number of networks" height={150} items={perSite} />
                  </ReportBlock>
                ) : null}
                {pairRows.length ? (
                  <ReportBlock description="Networks that run together on the same site." label="most common pairs">
                    <ReportBars ariaLabel="Networks that run together" rows={pairRows} />
                  </ReportBlock>
                ) : null}
              </ReportRow>
            </ReportGroup>
          ) : null}

          {/* data-gate: the domain-age run fills median ages; the platform run fills WordPress shares. */}
          {scatter.length > 1 || ageRows.length || wordpressRows.length ? (
            <ReportGroup level={2} title="How do the networks compare?">
              <ReportRow layout="1-1-1">
                {scatter.length > 1 ? (
                  <ReportBlock description="Each dot is a network, placed by its monthly traffic minimum and how many sites run it. Networks without a public traffic minimum are left out." label="joining rule vs sites">
                    <ScatterPlot caption="Monthly traffic minimum and sites per network" points={scatter} xLabels={ruleStepLabels} xTitle="traffic minimum →" />
                  </ReportBlock>
                ) : null}
                {ageRows.length ? (
                  <ReportBlock description="How long the domains of each network's sites have been registered." label="median domain age">
                    <DotPlot caption="Median domain age per network, in years" rows={ageRows} unit="yrs" />
                  </ReportBlock>
                ) : null}
                {wordpressRows.length ? (
                  <ReportBlock description="The share of each network's sites built on WordPress." label="WordPress share">
                    <ReportBars ariaLabel="WordPress share by network" max={100} rows={wordpressRows} />
                  </ReportBlock>
                ) : null}
              </ReportRow>
            </ReportGroup>
          ) : null}

          {/* data-gate: the ads-txt-summary run fills these numbers and the file sizes. */}
          {ads ? (
            <ReportGroup level={2} title="What do ads.txt files look like?">
              <ReportRow layout="1-1">
                <ReportBlock>
                  <ReportNumbers items={[
                    { label: "name an ad manager", value: percent(ads.manager_share), accent: true },
                    ...(ads.median_lines === null ? [] : [{ label: "median lines", value: formatCount(Math.round(ads.median_lines)) }]),
                    { label: "have broken lines", value: percent(ads.broken_share) },
                  ]} variant="plain" />
                </ReportBlock>
                {fileSizes.length ? (
                  <ReportBlock description="Sites by the number of lines in their ads.txt file." label="file size">
                    <ColumnChart caption="Sites by ads.txt line count" height={140} items={fileSizes} />
                  </ReportBlock>
                ) : null}
              </ReportRow>
            </ReportGroup>
          ) : null}

          {freshNumbers.length || weeks.length || methodRows.length ? (
            <ReportGroup level={2} title="How fresh is this data?">
              {freshNumbers.length || weeks.length ? (
                <ReportRow layout="1-1">
                  {freshNumbers.length ? <ReportBlock><ReportNumbers items={freshNumbers} variant="plain" /></ReportBlock> : null}
                  {/* data-gate: real new-site observations with a source for each site fill the weekly columns. */}
                  {weeks.length ? (
                    <ReportBlock description="Sites added to the directory each week, and how many came from people using the checker." label="new sites per week">
                      <StackedColumns caption="New sites per week" columns={weeks} endLabel="last week" partLabel="from the checker" restLabel="found by our scans" startLabel={`${weeks.length} weeks ago`} />
                    </ReportBlock>
                  ) : null}
                </ReportRow>
              ) : null}
              {methodRows.length ? (
                <ReportBlock description="Confirmed links by what showed us the network. A site with two networks has two links." label="how each link is confirmed">
                  <ReportBars ariaLabel="Confirmed links by how we confirmed them" rows={methodRows} />
                </ReportBlock>
              ) : null}
            </ReportGroup>
          ) : null}
        </Report>
        <article className={`${proseClassName} ${proseFlowClassName} ${styles.article}`}>
          <Article />
        </article>
      </PageCanvas>
    </AppShell>
  );
}

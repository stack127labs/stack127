import type { ReactNode } from "react";
import type { AdNetworkListRow, AdNetworkStatsReport } from "@/lib/ad-networks-types";
import { trafficLabel } from "@/lib/ad-networks-report";
import { Report, ReportBlock, ReportFigure, ReportGroup } from "@/app/ui/report";
import { RankedBars, type RankedBar } from "@/app/ui/ad-networks/viz/bars";
import { ColumnChart } from "@/app/ui/ad-networks/viz/columns";
import { formatNumber } from "@/app/ui/ad-networks/viz/format";
import viz from "@/app/ui/ad-networks/viz/viz.module.css";
import { nicheName } from "@/app/ui/ad-networks/site-format";
import { AhrefsCredit } from "@/app/ui/ahrefs-credit";
import { percent } from "../ad-networks-shared";
import styles from "./network-stats.module.css";

// Loader shares are 0 to 100. Never round a share that isn't 100% up to 100%.
const pct = (share: number | undefined) => percent(share ?? 0);
const shareOf = (count: number, total: number) => (total ? (count / total) * 100 : 0);
const sum = (rows: readonly { count: number }[]) => rows.reduce((total, row) => total + row.count, 0);
const joined = (parts: readonly string[]) => parts.join(" · ");

/** The loader's domain age buckets, in the order of `domainAgeOrder` in lib/ad-networks-report.ts. */
const ageBuckets = ["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16+ years"];

/** The column that holds the median: the first where the running count reaches half. */
const medianIndex = (counts: readonly number[]) => {
  const half = counts.reduce((total, count) => total + count, 0) / 2;
  let running = 0;
  return counts.findIndex((count) => (running += count) >= half);
};

/** One number: a label, the big share with plain words beside it, one thin bar, and one detail line. */
function SharePanel({ detail, label, value, words }: { detail?: ReactNode; label: string; value: number; words: ReactNode }) {
  return (
    <ReportBlock level={3} label={label}>
      <ReportFigure note={words} value={pct(value)} />
      <div aria-hidden="true" className={`${styles.bar} ${viz.tokens}`}><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
    </ReportBlock>
  );
}

/** Panels side by side, each capped so bars never stretch. Nothing renders when no panel has data. */
function Columns({ children }: { children: readonly ReactNode[] }) {
  const shown = children.filter(Boolean);
  return shown.length ? <div className={styles.columns}>{shown}</div> : null;
}

/**
 * A network's stats, with no section title: question-led groups, each an h2. Every panel hides when
 * its loader field is empty or null, and a group with no panels left hides. The gates live in
 * lib/ad-networks*.ts; each field's data run is in dev-space/ad-networks-data-contract.md.
 */
export function NetworkStats({ network, stats }: { network: AdNetworkListRow; stats: AdNetworkStatsReport }) {
  const { name } = network;
  if (!stats.listed) return null;

  // What kind of sites?
  const topNiches = stats.niches.slice(0, 6);
  const otherNiches = stats.niches.slice(6).reduce((total, row) => total + (row.share ?? 0), 0);
  const nicheRows: RankedBar[] = [
    ...topNiches.map((row) => ({ label: nicheName(row.key) ?? row.label, value: row.share ?? 0, display: pct(row.share), href: `/ad-networks/niches/${row.key}` })),
    ...(otherNiches > 0 ? [{ label: "Other", value: otherNiches, display: pct(otherNiches) }] : []),
  ];

  // Traffic: every ranked group together, out of every listed site, so sites with no traffic data
  // never inflate the share.
  const trafficTotal = sum(stats.traffic);
  const ranked = stats.traffic.filter((row) => row.key.toLowerCase().startsWith("top-"));
  const rankedLine = joined(ranked.filter((row) => row.count > 0).map((row) => {
    const label = trafficLabel(row.key);
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${formatNumber(row.count)}`;
  }));

  // Built with: the most used platform, on the same base as the old donut (unknown included).
  const platforms = stats.platform_mix ?? [];
  const measured = platforms.filter((row) => row.key !== "unknown").sort((a, b) => b.count - a.count);
  const [topPlatform, ...restPlatforms] = measured;
  const otherPlatforms = restPlatforms.slice(3).reduce((total, row) => total + (row.share ?? 0), 0);
  const unknownPlatforms = platforms.find((row) => row.key === "unknown")?.share ?? 0;
  const platformLine = joined([
    ...restPlatforms.slice(0, 3).map((row) => `${row.label} ${pct(row.share)}`),
    ...(otherPlatforms > 0 ? [`Other ${pct(otherPlatforms)}`] : []),
    ...(unknownPlatforms > 0 ? [`Unknown ${pct(unknownPlatforms)}`] : []),
  ]);

  // Domain endings: the top ending, then the next three and the rest.
  const [topEnding, ...restEndings] = stats.domain_endings;
  const otherEndings = restEndings.slice(3).reduce((total, row) => total + (row.share ?? 0), 0);
  const endingLine = joined([
    ...restEndings.slice(0, 3).map((row) => `${row.label} ${pct(row.share)}`),
    ...(otherEndings > 0 ? [`other ${pct(otherEndings)}`] : []),
  ]);

  // Domain age: each bucket as a share of sites with a known age.
  const ageCounts = ageBuckets.map((key) => stats.domain_age.find((row) => row.key === key)?.count ?? 0);
  const agedSites = ageCounts.reduce((total, count) => total + count, 0);
  const ageMedian = medianIndex(ageCounts);
  const medianAge = stats.median_domain_age === null ? null : Math.round(stats.median_domain_age);

  // Domain rating: hidden until enough of this network's sites are rated (AD_NETWORK_DR_GATE in
  // lib/ad-networks-report.ts). Ahrefs' license needs the linked credit wherever DR shows.
  const dr = stats.domain_rating;
  const ratedSites = dr ? sum(dr.bands) || dr.rated : 0;
  const underTwenty = dr ? sum(dr.bands.filter((band) => band.min < 20)) : 0;

  // What else is in their ads.txt?
  const manager = (key: string) => stats.managers.find((row) => row.key === key);
  const managerLine = joined(["another-network", "not-listed"].map(manager)
    .filter((row) => row && (row.share ?? 0) >= 1)
    .map((row) => `${row!.label} ${pct(row!.share)}`));
  const alsoRuns = stats.also_runs.filter((row) => row.count > 0);
  // Per-network shares overlap, so they are never summed into one "runs another network" share.
  const alsoRows: RankedBar[] = alsoRuns.slice(0, 5)
    .map((row) => ({ label: row.name, value: row.share, display: pct(row.share), href: `/ad-networks/${row.slug}` }));
  const alsoAsList = alsoRuns.some((row) => row.share >= 1);

  const kindRight = [
    trafficTotal > 0 ? (
      <SharePanel detail={rankedLine} key="traffic" label="Traffic" value={shareOf(sum(ranked), Math.max(stats.listed, trafficTotal))} words="are in Chrome's top 1 million sites" />
    ) : null,
    topPlatform ? (
      <SharePanel detail={platformLine} key="platforms" label="Built with" value={topPlatform.share ?? 0} words={`run on ${topPlatform.label}`} />
    ) : null,
    topEnding ? (
      <SharePanel detail={endingLine} key="endings" label="Domain endings" value={topEnding.share ?? 0} words={`use a ${topEnding.label}`} />
    ) : null,
  ].filter(Boolean);
  const kindPanels = [
    nicheRows.length ? (
      <ReportBlock key="niches" label="Top niches" level={3}>
        <RankedBars ariaLabel={`Top niches on ${name}`} rows={nicheRows} />
      </ReportBlock>
    ) : null,
    kindRight.length ? <div className={styles.stack} key="right">{kindRight}</div> : null,
  ];

  const strengthPanels = [
    agedSites > 0 ? (
      <ReportBlock key="age" label="Domain age" level={3}>
        {medianAge !== null ? <ReportFigure note="median" value={`${medianAge} ${medianAge === 1 ? "yr" : "yrs"}`} /> : null}
        <ColumnChart
          caption={`${name} sites by domain age`}
          height={150}
          items={ageBuckets.map((key, index) => ({
            label: index === ageBuckets.length - 1 ? key.replace(" years", " yrs") : key.replace(" years", ""),
            value: ageCounts[index],
            display: pct(shareOf(ageCounts[index], agedSites)),
            tone: index === ageMedian ? "ac" as const : "ac2" as const,
          }))}
        />
        <p className={styles.detail}>{pct(shareOf(ageCounts[0], Math.max(stats.listed, agedSites)))} of sites are under 3 years old.</p>
      </ReportBlock>
    ) : null,
    dr ? (
      <ReportBlock key="dr" label="Domain rating" level={3}>
        <ReportFigure note="average" value={Math.round(dr.average)} />
        <ColumnChart
          caption={`${name} sites by Domain Rating`}
          height={150}
          items={dr.bands.map((band) => ({
            label: band.label,
            value: band.count,
            display: pct(shareOf(band.count, ratedSites)),
            tone: band.key === dr.median_band ? "ac" as const : "ac2" as const,
          }))}
        />
        <p className={styles.detail}>
          {pct(shareOf(underTwenty, Math.max(dr.listed, ratedSites)))} of sites are under DR 20. · <AhrefsCredit />, {formatNumber(dr.rated)} of {formatNumber(dr.listed)} sites rated
        </p>
      </ReportBlock>
    ) : null,
  ];

  const topOther = alsoRuns[0];
  const adsTxtPanels = [
    stats.managers.length ? (
      <SharePanel detail={managerLine} key="manager" label="Ad manager" value={manager("this-network")?.share ?? 0} words={`name ${name} as their ad manager`} />
    ) : null,
    alsoAsList ? (
      <ReportBlock key="also" label="Also runs" level={3}>
        <RankedBars ariaLabel={`Networks ${name} sites also run`} max={100} rows={alsoRows} />
      </ReportBlock>
    ) : topOther ? (
      <SharePanel key="also" label="Also runs" value={topOther.share} words={`also run ${topOther.name}, the most common other network`} />
    ) : null,
  ];

  const groups: { title: string; panels: ReactNode[] }[] = [
    { title: `What kind of sites use ${name}?`, panels: kindPanels },
    { title: `How old and how strong are ${name} sites?`, panels: strengthPanels },
    { title: "What else is in their ads.txt?", panels: adsTxtPanels },
  ];

  return (
    <Report ariaLabel={`${name} stats`}>
      {groups.filter((group) => group.panels.some(Boolean)).map((group) => (
        <ReportGroup key={group.title} level={2} title={group.title}><Columns>{group.panels}</Columns></ReportGroup>
      ))}
    </Report>
  );
}

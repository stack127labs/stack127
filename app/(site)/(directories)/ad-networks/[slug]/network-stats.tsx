import type { ReactNode } from "react";
import type { AdNetworkListRow, AdNetworkStatsReport } from "@/lib/ad-networks-types";
import { trafficLabel } from "@/lib/ad-networks-report";
import { Report, ReportBlock, ReportFigure, ReportGroup, ReportNumbers, ReportRow, type ReportNumber } from "@/app/ui/report";
import { AgeStrip } from "@/app/ui/ad-networks/viz/age-strip";
import { AreaLine } from "@/app/ui/ad-networks/viz/area-line";
import { RankedBars, StackBar, type RankedBar } from "@/app/ui/ad-networks/viz/bars";
import { ColumnChart } from "@/app/ui/ad-networks/viz/columns";
import { Donut } from "@/app/ui/ad-networks/viz/donut";
import { formatNumber, formatSigned } from "@/app/ui/ad-networks/viz/format";
import { JoinedLeftBars } from "@/app/ui/ad-networks/viz/joined-left";
import { SwitchFlow } from "@/app/ui/ad-networks/viz/switch-flow";
import { TypeScale } from "@/app/ui/ad-networks/viz/type-scale";
import { nicheName } from "@/app/ui/ad-networks/site-format";
import { ordinal, percent } from "../ad-networks-shared";

// Loader shares are 0 to 100. Never round a share that isn't 100% up to 100%.
const pct = (share: number | undefined) => percent(share ?? 0);

const monthShort = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const monthLong = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

const dayMs = 86_400_000;
const monday = (time: number) => time - ((new Date(time).getUTCDay() + 6) % 7) * dayMs;

/**
 * The loader's joined and left periods hold only days or weeks with changes. Place each on the
 * period's timeline, ending today in UTC like the loader's windows, so gaps read as gaps.
 */
function timeline(periods: NonNullable<AdNetworkStatsReport["movement_periods"]>, now = Date.now()) {
  const today = Date.parse(`${new Date(now).toISOString().slice(0, 10)}T00:00:00Z`);
  return periods.map((period) => {
    const weekly = period.interval === "week";
    const first = weekly ? monday(today - (period.days - 1) * dayMs) : today - (period.days - 1) * dayMs;
    const step = weekly ? 7 * dayMs : dayMs;
    const slots = Math.round(((weekly ? monday(today) : today) - first) / step) + 1;
    return {
      ...period,
      slots,
      startLabel: `${period.days} days ago`,
      endLabel: "today",
      points: period.points.map((point) => ({ ...point, slot: Math.round((day(point.date) - first) / step) })),
    };
  });
}

/** Shorter names for tight chart labels on phones. */
const shortName = (name: string) => name.replace(/^Google /, "").replace(/ by Mediavine$/, "");

/** A row of blocks with only the blocks that have data. Nothing renders when none do. */
function Row({ blocks, layout }: { blocks: readonly ReactNode[]; layout: "1-1" | "2-1" | "1-1-1" | "2-1-1" }) {
  const shown = blocks.filter(Boolean);
  // A lone block takes the full width instead of leaving an empty column beside it.
  if (shown.length === 1) return <>{shown}</>;
  return shown.length ? <ReportRow layout={layout}>{shown}</ReportRow> : null;
}

/**
 * "<Network> stats" (mockup `.stats`): question-led groups in the mockup's order. Every block hides
 * when its loader field is empty or null, and a group with no blocks left hides. The gates live in
 * lib/ad-networks*.ts; each field's data run is in dev-space/ad-networks-data-contract.md.
 */
export function NetworkStats({ network, stats }: { network: AdNetworkListRow; stats: AdNetworkStatsReport }) {
  const { name } = network;
  if (!stats.listed) return null;

  // How many sites use it?
  const summary: ReportNumber[] = [
    { label: "sites listed", value: formatNumber(stats.listed) },
    { label: "confirmed live", value: formatNumber(stats.confirmed), accent: true },
    ...(stats.rank ? [{ label: `of ${stats.networks_tracked} networks`, value: ordinal(stats.rank) }] : []),
    ...(stats.change_year !== null ? [{ label: "sites in a year", value: formatSigned(stats.change_year), accent: stats.change_year > 0 }] : []),
  ];
  const history = stats.history.map((row) => ({ label: monthShort.format(day(row.date)), fullLabel: monthLong.format(day(row.date)), value: row.listed }));

  // What kind of sites?
  const topNiches = stats.niches.slice(0, 6);
  const otherNiches = stats.niches.slice(6).reduce((sum, row) => sum + (row.share ?? 0), 0);
  const nicheRows: RankedBar[] = [
    ...topNiches.map((row) => ({ label: nicheName(row.key) ?? row.label, value: row.share ?? 0, display: pct(row.share), href: `/ad-networks/niches/${row.key}` })),
    ...(otherNiches > 0 ? [{ label: "Other", value: otherNiches, display: pct(otherNiches) }] : []),
  ];
  const traffic = stats.traffic.map((row) => ({
    label: trafficLabel(row.key),
    value: row.count,
    tone: row.key.startsWith("not") ? "n2" as const : "ac" as const,
  }));

  // Joined, left, and switches.
  const periods = timeline(stats.movement_periods ?? []);
  const flow = stats.switch_flow;

  // How are the sites built?
  const age = stats.domain_age_strip;
  const platforms = stats.platform_mix ?? [];
  const measuredPlatforms = platforms.filter((row) => row.key !== "unknown");
  const topEndings = stats.domain_endings.slice(0, 5);
  const otherEndings = stats.domain_endings.slice(5).reduce((sum, row) => sum + (row.share ?? 0), 0);
  const endings = [
    ...topEndings.map((row) => ({ label: row.label, share: (row.share ?? 0) / 100 })),
    ...(otherEndings > 0 ? [{ label: "other", share: otherEndings / 100 }] : []),
  ];

  // What else is in their ads.txt?
  const manager = (key: string) => stats.managers.find((row) => row.key === key);
  const alsoRows: RankedBar[] = stats.also_runs.filter((row) => row.count > 0).slice(0, 5)
    .map((row) => ({ label: row.name, value: row.share, display: pct(row.share), href: `/ad-networks/${row.slug}` }));

  const kindBlocks = [
    nicheRows.length ? (
      <ReportBlock description={`Share of ${stats.niches.reduce((sum, row) => sum + row.count, 0).toLocaleString("en-US")} sorted sites.`} key="niches" label="Top niches">
        <RankedBars ariaLabel={`Top niches on ${name}`} rows={nicheRows} />
      </ReportBlock>
    ) : null,
    traffic.length ? (
      <ReportBlock description="Sites grouped by their place in Chrome's list of the most visited sites." key="traffic" label="Traffic">
        <ColumnChart caption={`${name} sites per Chrome rank group`} items={traffic} />
      </ReportBlock>
    ) : null,
  ];
  const moveBlocks = [
    periods.length ? (
      <ReportBlock description={`Sites that started or stopped running ${name}, per day or per week.`} key="moves" label="Joined and left">
        <JoinedLeftBars caption={`${name} sites joined and left`} periods={periods} />
      </ReportBlock>
    ) : null,
    flow && (flow.came_from.length || flow.went_to.length) ? (
      <ReportBlock description={`Sites that moved to or from ${name}, and the network on the other side.`} key="switches" label="Switches, last 90 days">
        <SwitchFlow
          cameFrom={flow.came_from.map((row) => ({ label: row.label, shortLabel: shortName(row.label), count: row.count }))}
          caption={`Where sites came from and went to in the last 90 days`}
          center={flow.center.name}
          wentTo={flow.went_to.map((row) => ({ label: row.label, shortLabel: shortName(row.label), count: row.count }))}
        />
      </ReportBlock>
    ) : null,
  ];
  const buildBlocks = [
    age ? (
      <ReportBlock description="When each site's domain was first registered. A domain can be older than the site on it." key="age" label="Domain age">
        {stats.median_domain_age !== null ? (
          <ReportFigure note={`median, registered ${Math.round(age.median_year)}`} value={`${Math.round(stats.median_domain_age)} ${Math.round(stats.median_domain_age) === 1 ? "yr" : "yrs"}`} />
        ) : null}
        <AgeStrip
          binYears={age.bin_years}
          bins={age.bins}
          caption={`Domain registration years of ${name} sites`}
          median={age.median_year}
          middleHalf={age.middle_half}
          newest={{ year: age.newest.year, domain: age.newest.domain }}
          oldest={{ year: age.oldest.year, domain: age.oldest.domain }}
        />
      </ReportBlock>
    ) : null,
    measuredPlatforms.length ? (
      <ReportBlock description="What the sites are built with, from clues in their page code." key="platforms" label="Platforms">
        <Donut
          caption={`Platforms ${name} sites are built with`}
          parts={platforms.map((row) => ({ label: row.label, value: row.count, ...(row.key === "unknown" ? { tone: "track" as const } : {}) }))}
        />
      </ReportBlock>
    ) : null,
    endings.length ? (
      <ReportBlock description="The share of sites on each domain ending, such as .com or .co.uk." key="endings" label="Domain endings">
        <TypeScale items={endings} />
      </ReportBlock>
    ) : null,
  ];
  const adsTxtBlocks = [
    stats.managers.length ? (
      <ReportBlock description="Which company each site names as its main ad manager in its ads.txt file." key="manager" label="Ad manager">
        <ReportFigure note={`name ${name}`} value={pct(manager("this-network")?.share)} />
        <StackBar parts={[
          { label: name, value: manager("this-network")?.count ?? 0, tone: "ac", display: pct(manager("this-network")?.share) },
          { label: "another network", value: manager("another-network")?.count ?? 0, tone: "ac3", display: pct(manager("another-network")?.share) },
          { label: "not listed", value: manager("not-listed")?.count ?? 0, tone: "n2", display: pct(manager("not-listed")?.share) },
        ]} />
      </ReportBlock>
    ) : null,
    alsoRows.length ? (
      <ReportBlock description="Other networks from our list that these sites run at the same time." key="also" label="Also runs">
        <RankedBars ariaLabel={`Networks ${name} sites also run`} max={100} rows={alsoRows} />
      </ReportBlock>
    ) : null,
  ];

  const groups: { title: string; content: ReactNode; has: boolean }[] = [
    {
      title: `How many sites use ${name}?`,
      has: true,
      content: (
        <>
          <ReportNumbers items={summary} />
          <Row layout="2-1" blocks={[
            history.length ? (
              <ReportBlock description={`How many sites ran ${name} at the end of each month.`} key="history" label="Sites over time">
                <AreaLine caption={`${name} sites at the end of each month`} points={history} />
              </ReportBlock>
            ) : null,
          ]} />
        </>
      ),
    },
    { title: `What kind of sites use ${name}?`, has: kindBlocks.some(Boolean), content: <Row blocks={kindBlocks} layout="1-1" /> },
    { title: `Which sites joined or left ${name}?`, has: moveBlocks.some(Boolean), content: <Row blocks={moveBlocks} layout="1-1" /> },
    { title: `How are ${name} sites built?`, has: buildBlocks.some(Boolean), content: <Row blocks={buildBlocks} layout={age ? "2-1-1" : "1-1"} /> },
    { title: "What else is in their ads.txt?", has: adsTxtBlocks.some(Boolean), content: <Row blocks={adsTxtBlocks} layout="1-1" /> },
  ];

  return (
    <Report note={`From our checks of ${formatNumber(stats.listed)} ${stats.listed === 1 ? "site" : "sites"}`} title={`${name} stats`} titleId="stats">
      {groups.filter((group) => group.has).map((group) => <ReportGroup key={group.title} title={group.title}>{group.content}</ReportGroup>)}
    </Report>
  );
}

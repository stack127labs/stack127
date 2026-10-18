import { ReportFigure, ReportRow, ReportBlock } from "@/app/ui/report";
import { AgeStrip } from "@/app/ui/ad-networks/viz/age-strip";
import { AreaLine } from "@/app/ui/ad-networks/viz/area-line";
import { MoveBars, RankedBars, StackBar } from "@/app/ui/ad-networks/viz/bars";
import { ColumnChart } from "@/app/ui/ad-networks/viz/columns";
import { DivergingBars } from "@/app/ui/ad-networks/viz/diverging-bars";
import { Donut } from "@/app/ui/ad-networks/viz/donut";
import { DotPlot } from "@/app/ui/ad-networks/viz/dot-plot";
import { Heatmap } from "@/app/ui/ad-networks/viz/heatmap";
import { EventsList, NewestList } from "@/app/ui/ad-networks/viz/lists";
import { HistoryGantt } from "@/app/ui/ad-networks/viz/history-gantt";
import { JoinedLeftBars, type JoinedLeftPoint } from "@/app/ui/ad-networks/viz/joined-left";
import { MultiLine } from "@/app/ui/ad-networks/viz/multi-line";
import { PublisherBlocks } from "@/app/ui/ad-networks/viz/publisher-blocks";
import { ScatterPlot } from "@/app/ui/ad-networks/viz/scatter-plot";
import { SizeStacks } from "@/app/ui/ad-networks/viz/size-stacks";
import { StackedColumns } from "@/app/ui/ad-networks/viz/stacked-columns";
import { SwitchFlow } from "@/app/ui/ad-networks/viz/switch-flow";
import { Treemap } from "@/app/ui/ad-networks/viz/treemap";
import { TypeScale } from "@/app/ui/ad-networks/viz/type-scale";
import { Example } from "../gallery";

// Every example uses the sample numbers from dev-space/ad-networks-mockups, so each one can be
// checked side by side with the mockup element it reproduces.

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const monthPoints = months.map((label, index) => ({ label, fullLabel: `${label} ${index < 2 ? 2025 : 2026}` }));
const sitesOverTime = [6904, 6980, 7051, 7088, 7162, 7240, 7311, 7395, 7480, 7590, 7702, 7852];

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const day = (offset: number, from: string) => dayFormat.format(new Date(Date.parse(`${from}T00:00:00Z`) + offset * 86_400_000));
const joined30 = [5, 7, 6, 8, 4, 6, 7, 5, 6, 9, 6, 5, 7, 6, 4, 6, 8, 7, 5, 6, 7, 6, 5, 8, 6, 7, 5, 6, 4, 7];
const left30 = [2, 3, 2, 1, 3, 2, 4, 2, 3, 2, 1, 3, 2, 3, 2, 4, 2, 3, 1, 2, 3, 2, 4, 2, 3, 2, 3, 2, 1, 3];
const joined90 = [38, 41, 35, 52, 44, 39, 47, 36, 40, 45, 49, 42, 46];
const left90 = [18, 15, 22, 17, 20, 14, 19, 16, 21, 15, 18, 17, 20];
const days: JoinedLeftPoint[] = joined30.map((joined, index) => ({ label: day(index - 29, "2026-10-15"), joined, left: left30[index] }));
const weeks: JoinedLeftPoint[] = joined90.map((joined, index) => ({ label: `Week of ${day((index - 12) * 7, "2026-10-12")}`, joined, left: left90[index] }));

const lineSeries = (from: number, to: number, curve = 1) => months.map((_, index) => Math.round(from + (to - from) * Math.pow(index / 11, curve)));

const niches = [["Food", 6320], ["Home & DIY", 3410], ["Travel", 2980], ["Parenting", 2450], ["Personal finance", 2210], ["Health & fitness", 2180], ["Beauty & fashion", 1960], ["Gaming", 1840], ["Tech", 1720], ["Crafts", 1510], ["Pets", 1280], ["Outdoors", 1140], ["Gardening", 980], ["Sports", 940], ["Entertainment", 910], ["Lifestyle", 870], ["Education", 720], ["Automotive", 640], ["Business", 590], ["News", 470]] as const;

export function DataVisualsExamples() {
  return (
    <>
      <Example
        components={["RankedBars"]}
        note="Ranked bars with the exact value at the end. tone=&quot;highlight&quot; keeps bars neutral and fills the row the page is about; tone=&quot;all&quot; fills every bar. Reads as a description list, so it needs no hidden table."
        source="app/ui/ad-networks/viz/bars.tsx"
        title="Ranked bars"
      >
        <ReportRow layout="1-1">
          <ReportBlock description="Where Mediavine sits among the networks we track, by number of sites." label="Rank among networks">
            <RankedBars rows={[
              { label: "Ezoic", value: 8144 },
              { label: "Mediavine", value: 7852, highlight: true },
              { label: "Raptive", value: 7152 },
              { label: "Journey", value: 6953 },
              { label: "Google AdSense", value: 5349 },
            ]} tone="highlight" />
          </ReportBlock>
          <ReportBlock description="What the sites are about, as a share of all sites." label="Top niches">
            <RankedBars rows={[
              { label: "Food", value: 31, display: "31%" },
              { label: "Home & DIY", value: 14, display: "14%" },
              { label: "Travel", value: 11, display: "11%" },
              { label: "Parenting", value: 9, display: "9%" },
              { label: "Other", value: 22, display: "22%" },
            ]} />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["StackBar", "VizLegend", "ReportFigure"]}
        note="Parts of one whole as a thin bar, with a legend of values below. Put a ReportFigure above it for the headline share."
        source="app/ui/ad-networks/viz/bars.tsx, app/ui/ad-networks/viz/parts.tsx"
        title="Stacked bar"
      >
        <ReportBlock description="Which company each site names as its main ad manager in its ads.txt file." label="Ad manager">
          <ReportFigure note="name Mediavine" value="88%" />
          <StackBar parts={[
            { label: "Mediavine", value: 88, tone: "ac", display: "88%" },
            { label: "another network", value: 3, tone: "ac3", display: "3%" },
            { label: "not listed", value: 9, tone: "n2", display: "9%" },
          ]} />
        </ReportBlock>
      </Example>

      <Example
        components={["Donut", "TypeScale"]}
        note="Donut: parts of a whole with the leader's share in the middle and a legend beside it. Use the track tone for Unknown. Type scale: labels sized by share, the leader in accent."
        source="app/ui/ad-networks/viz/donut.tsx, app/ui/ad-networks/viz/type-scale.tsx"
        title="Donut and type scale"
      >
        <ReportRow layout="1-1">
          <ReportBlock description="What the sites are built with, from clues in their page code." label="Platforms">
            <Donut caption="Platforms" parts={[
              { label: "WordPress", value: 86 },
              { label: "Squarespace", value: 3 },
              { label: "Shopify", value: 2 },
              { label: "Next.js", value: 2 },
              { label: "Ghost", value: 1 },
              { label: "Other", value: 2 },
              { label: "Unknown", value: 4, tone: "track" },
            ]} />
          </ReportBlock>
          <ReportBlock description="The share of sites on each domain ending, such as .com or .co.uk." label="Domain endings">
            <TypeScale items={[
              { label: ".com", share: 0.89 },
              { label: ".net", share: 0.03 },
              { label: ".co.uk", share: 0.02 },
              { label: ".org", share: 0.02 },
              { label: ".co", share: 0.01 },
              { label: "other", share: 0.03 },
            ]} />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["PublisherBlocks", "ColumnChart"]}
        note="Publisher blocks: the two biggest companies as tall columns, the rest stacked in a third. Column chart: one bar per group with its value above, drawn in HTML so it needs no script."
        source="app/ui/ad-networks/viz/publisher-blocks.tsx, app/ui/ad-networks/viz/columns.tsx"
        title="Publisher blocks and columns"
      >
        <ReportRow layout="1-1-1">
          <ReportBlock description="Sites grouped by their place in Chrome's list of the most visited sites." label="Traffic">
            <ColumnChart caption="Sites per Chrome rank group" items={[
              { label: "1k", value: 12 },
              { label: "10k", value: 418 },
              { label: "100k", value: 2906 },
              { label: "1M", value: 3611 },
              { label: "not ranked", value: 905, tone: "n2" },
            ]} />
          </ReportBlock>
          <ReportBlock description="Companies that run the most Mediavine sites, from Mediavine's seller list." label="Biggest publishers">
            <PublisherBlocks items={[
              { label: "Tiny Kitchen Lab LLC", count: 14 },
              { label: "Nestly Brands LLC", count: 11 },
              { label: "Cozy Home Media Inc", count: 9 },
              { label: "Slow Notes Media LLC", count: 7 },
              { label: "Pantry Press Ltd", count: 6 },
            ]} />
          </ReportBlock>
          <ReportBlock description="Networks from our list found on each site." label="Networks per site">
            <ColumnChart caption="Networks per site" height={150} items={[
              { label: "1 network", value: 61, display: "61%" },
              { label: "2", value: 27, display: "27%", tone: "ac3" },
              { label: "3", value: 9, display: "9%", tone: "ac3" },
              { label: "4+", value: 3, display: "3%", tone: "ac3" },
            ]} />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["AreaLine", "RankedBars"]}
        note="A count over time as a filled line. Server HTML holds the chart; after hydration it redraws at the box's real width so text stays 12px. Hover, tap, or focus it and use the arrow keys to read each month."
        source="app/ui/ad-networks/viz/area-line.tsx"
        title="Sites over time"
      >
        <ReportRow layout="2-1">
          <ReportBlock description="How many sites ran Mediavine at the end of each month." label="Sites over time">
            <AreaLine caption="Mediavine sites over the last 12 months" points={monthPoints.map((point, index) => ({ ...point, value: sitesOverTime[index] }))} />
          </ReportBlock>
          <ReportBlock description="Where Mediavine sits among the networks we track." label="Rank among networks">
            <RankedBars rows={[
              { label: "Ezoic", value: 8144 },
              { label: "Mediavine", value: 7852, highlight: true },
              { label: "Raptive", value: 7152 },
            ]} tone="highlight" />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["JoinedLeftBars", "SwitchFlow"]}
        note="Joined and left: accent bars above the line, neutral below, with a 30 days / 90 days switch and totals. Switch flow: where sites came from and went to, band widths by count; names shorten on phones."
        source="app/ui/ad-networks/viz/joined-left.tsx, app/ui/ad-networks/viz/switch-flow.tsx"
        title="Joined, left, and switches"
      >
        <ReportRow layout="1-1">
          <ReportBlock description="Sites that started or stopped running Mediavine, per day or per week." label="Joined and left">
            <JoinedLeftBars caption="Mediavine sites joined and left" periods={[
              { key: "30", label: "30 days", points: days, startLabel: "30 days ago" },
              { key: "90", label: "90 days", points: weeks, startLabel: "13 weeks ago" },
            ]} />
          </ReportBlock>
          <ReportBlock description="Sites that moved to or from Mediavine, and the network on the other side." label="Switches, last 90 days">
            <SwitchFlow
              cameFrom={[
                { label: "Journey", count: 96 },
                { label: "Ezoic", count: 61 },
                { label: "Google AdSense", shortLabel: "AdSense", count: 40 },
                { label: "Monumetric", count: 22 },
              ]}
              caption="Where Mediavine sites came from and went to in the last 90 days"
              center="Mediavine"
              wentTo={[
                { label: "Raptive", count: 38 },
                { label: "Ezoic", count: 9 },
                { label: "Journey", count: 5 },
                { label: "Other", count: 12 },
              ]}
            />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["AgeStrip"]}
        note="When the domains were registered: histogram, middle-half band, median line, and the oldest and newest domains. Redraws at the real width; on phones the end labels take two lines."
        source="app/ui/ad-networks/viz/age-strip.tsx"
        title="Domain age strip"
      >
        <ReportBlock description="When each site's domain was first registered. A domain can be older than the site on it." label="Domain age">
          <ReportFigure note="median, registered 2013" value="13 yrs" />
          <AgeStrip
            bins={[1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024].map((year, index) => ({ year, count: [8, 22, 61, 120, 210, 330, 520, 760, 940, 1010, 980, 890, 760, 640, 531][index] }))}
            caption="Domain registration years"
            median={2013}
            middleHalf={[2008, 2018]}
            newest={{ year: 2025, domain: "newcampfire.co" }}
            oldest={{ year: 1996, domain: "oldfarmrecipes.com" }}
          />
        </ReportBlock>
      </Example>

      <Example
        components={["SizeStacks"]}
        note="One 100% bar per size group, split by network. Hover or focus a part for its share and about how many sites."
        source="app/ui/ad-networks/viz/size-stacks.tsx"
        title="Size stacks"
      >
        <SizeStacks
          caption="Main ad network by site size"
          groups={[
            { label: "top 10k", sites: 196, shares: [39, 48, 0, 3, 2, 8] },
            { label: "top 100k", sites: 2140, shares: [52, 31, 6, 4, 2, 5] },
            { label: "top 1M", sites: 3180, shares: [39, 15, 26, 10, 6, 4] },
            { label: "not ranked", sites: 804, shares: [14, 3, 31, 24, 21, 7] },
          ]}
          series={[{ label: "Mediavine" }, { label: "Raptive" }, { label: "Journey" }, { label: "Ezoic" }, { label: "Google AdSense" }, { label: "Other" }]}
        />
      </Example>

      <Example
        components={["MoveBars", "NewestList"]}
        note="Moves: from → to with a bar and count. Newest list: the latest sites with their network and the day we found them."
        source="app/ui/ad-networks/viz/bars.tsx, app/ui/ad-networks/viz/lists.tsx"
        title="Moves and newest sites"
      >
        <ReportRow layout="1-1">
          <ReportBlock label="switches, last 90 days">
            <MoveBars ariaLabel="Food sites that switched networks" moves={[
              { from: "Journey", to: "Mediavine", count: 52 },
              { from: "Ezoic", to: "Mediavine", count: 34 },
              { from: "Mediavine", to: "Raptive", count: 21 },
              { from: "Google AdSense", to: "Ezoic", count: 12 },
              { from: "Ezoic", to: "Journey", count: 9 },
            ]} />
          </ReportBlock>
          <ReportBlock label="newest sites">
            <NewestList caption="Newest food sites" sites={[
              { domain: "crumbandcoast.com", network: "Mediavine", date: "Oct 11" },
              { domain: "grainbowlguide.com", network: "Journey", date: "Oct 9" },
              { domain: "smokehousenotes.com", network: "Raptive", date: "Oct 8" },
              { domain: "tinytacotuesday.com", network: "Ezoic", date: "Oct 6" },
              { domain: "panfriedpantry.com", network: "Mediavine", date: "Oct 3" },
            ]} />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["Treemap"]}
        note="Blocks sized by value, squarified at the box's real size, the biggest in accent. Blocks link to their page when they have an href. Hover or focus a block for its count and share."
        source="app/ui/ad-networks/viz/treemap.tsx"
        title="Treemap"
      >
        <Treemap caption="Sites per niche" items={niches.map(([label, value]) => ({ label, value, href: label === "Food" ? "/components-ui/data-visuals" : undefined }))} total={35120} />
      </Example>

      <Example
        components={["Heatmap"]}
        note="Rows by columns, darker accent for bigger values. Hovering a cell outlines its column and underlines its row. The first column stays put while the grid scrolls on phones."
        source="app/ui/ad-networks/viz/heatmap.tsx"
        title="Heatmap"
      >
        <Heatmap
          caption="Share of each niche's sites that run each network"
          columns={["Mediavine", "Raptive", "Ezoic", "Journey", "AdSense", "Playwire", "Freestar", "Publift", "NitroPay"].map((label) => ({ key: label, label }))}
          corner="niche"
          rows={[
            { label: "Food", values: [41, 22, 9, 18, 7, 2, 2, 2, 1] },
            { label: "Home & DIY", values: [33, 21, 11, 19, 10, 2, 2, 2, 1] },
            { label: "Travel", values: [29, 24, 14, 17, 10, 2, 2, 2, 1] },
            { label: "Personal finance", values: [17, 31, 15, 12, 14, 2, 2, 2, 1] },
            { label: "Gaming", values: [3, 4, 15, 2, 14, 21, 5, 9, 18] },
          ]}
          unitNote="Numbers are % of the niche's sites."
        />
      </Example>

      <Example
        components={["MultiLine", "DivergingBars"]}
        note="Multi-line: a few series over time with names at the line ends; hover lists every value at that month. Diverging bars: gains right of the line in accent, losses left in neutral."
        source="app/ui/ad-networks/viz/multi-line.tsx, app/ui/ad-networks/viz/diverging-bars.tsx"
        title="Share over time and net change"
      >
        <ReportRow layout="1-1">
          <ReportBlock description="Sites on the five biggest networks at the end of each month." label="share over time">
            <MultiLine caption="Sites on the five biggest networks" points={monthPoints} series={[
              { label: "Ezoic", values: lineSeries(7900, 8144), tone: "n1" },
              { label: "Mediavine", values: lineSeries(6904, 7852, 1.2), tone: "ac" },
              { label: "Raptive", values: lineSeries(6600, 7152), tone: "ac2" },
              { label: "Journey", values: lineSeries(5100, 6953, 0.8), tone: "ac", dashed: true },
              { label: "Google AdSense", shortLabel: "AdSense", values: lineSeries(5600, 5349), tone: "n2" },
            ]} />
          </ReportBlock>
          <ReportBlock description="Sites gained minus sites lost." label="net change, last 90 days">
            <DivergingBars caption="Net change in sites, last 90 days" rows={[
              { label: "Journey", value: 612 },
              { label: "Mediavine", value: 418 },
              { label: "Raptive", value: 205 },
              { label: "Publift", value: 38 },
              { label: "Playwire", value: 22 },
              { label: "NitroPay", value: -9 },
              { label: "Freestar", value: -14 },
              { label: "Monumetric", value: -41 },
              { label: "Google AdSense", shortLabel: "AdSense", value: -96 },
              { label: "Ezoic", value: -187 },
            ]} />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["ScatterPlot", "DotPlot", "StackedColumns"]}
        note="Scatter: each network by its traffic minimum and site count. Dot plot: one value per row from zero, the leader in accent. Stacked columns: totals over time with an accent part; hover for one week."
        source="app/ui/ad-networks/viz/scatter-plot.tsx, dot-plot.tsx, stacked-columns.tsx"
        title="Scatter, dot plot, and stacked columns"
      >
        <ReportRow layout="1-1-1">
          <ReportBlock description="Each dot is a network, placed by its traffic minimum and how many sites run it." label="joining rule vs sites">
            <ScatterPlot caption="Joining rule against sites" points={[
              { label: "Ezoic", x: 0, y: 8144 },
              { label: "Google AdSense", shortLabel: "AdSense", x: 0, y: 5349 },
              { label: "NitroPay", x: 0, y: 559 },
              { label: "Journey", x: 1, y: 6953 },
              { label: "Monumetric", x: 2, y: 778 },
              { label: "Mediavine", x: 3, y: 7852 },
              { label: "Raptive", x: 4, y: 7152 },
              { label: "Snack Media", x: 4, y: 402 },
              { label: "Freestar", x: 5, y: 524 },
              { label: "Playwire", x: 6, y: 626 },
            ]} xLabels={["none", "1k", "10k", "50k", "100k", "500k", "1M"]} xTitle="traffic minimum →" />
          </ReportBlock>
          <ReportBlock description="How long the domains of each network's sites have been registered." label="median domain age">
            <DotPlot caption="Median domain age per network" rows={[
              { label: "Raptive", value: 14 },
              { label: "Mediavine", value: 12 },
              { label: "Freestar", value: 12 },
              { label: "Playwire", value: 11 },
              { label: "Monumetric", value: 10 },
              { label: "Google AdSense", shortLabel: "AdSense", value: 9 },
              { label: "Journey", value: 7 },
            ]} unit="yrs" />
          </ReportBlock>
          <ReportBlock description="Sites added each week, and how many came from people using the checker." label="new sites per week">
            <StackedColumns
              caption="New sites per week"
              columns={[210, 240, 198, 265, 301, 288, 320, 350, 310, 395, 420, 446].map((total, index) => ({ label: `Week of ${day((index - 11) * 7, "2026-10-05")}`, total, part: [12, 18, 15, 22, 30, 28, 35, 41, 38, 52, 61, 70][index] }))}
              endLabel="last week"
              partLabel="from the checker"
              restLabel="found by our scans"
              startLabel="12 weeks ago"
            />
          </ReportBlock>
        </ReportRow>
      </Example>

      <Example
        components={["HistoryGantt", "EventsList"]}
        note="One bar per network from first to last month seen, across whole years, with the dated events below. On phones the names sit above the bars and every other year label hides."
        source="app/ui/ad-networks/viz/history-gantt.tsx, app/ui/ad-networks/viz/lists.tsx"
        title="Network history"
      >
        <div>
          <HistoryGantt endYear={2026} rows={[
            { label: "Mediavine", from: "2021-03", to: null, tone: "ac" },
            { label: "Amazon APS", from: "2022-06", to: null, tone: "ac2" },
            { label: "Google AdSense", from: "2019-01", to: null, tone: "n2", note: "not confirmed" },
            { label: "Ezoic", from: "2017-03", to: "2021-02", tone: "n1" },
          ]} startYear={2017} />
          <EventsList events={[
            { date: "Jun 2022", text: "Added Amazon APS" },
            { date: "Mar 2021", text: "Moved from Ezoic to Mediavine" },
            { date: "Jan 2019", text: "Added Google AdSense" },
            { date: "Mar 2017", text: "First ads.txt file, with Ezoic" },
          ]} />
        </div>
      </Example>
    </>
  );
}

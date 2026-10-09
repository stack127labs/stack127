import { thinPoints } from "@/app/ui/charts/chart-data";
import type { UiChartPoint, UiChartSpec } from "@/app/ui/charts/chart-option";
import { renderChartSvg, UiChart } from "@/app/ui/charts/chart";
import { Example } from "../gallery";
import { PageWeight } from "./page-weight";
import styles from "../components-ui.module.css";

// Sample data only. A fixed seed keeps every load the same, so screenshots compare cleanly.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const day = 86_400_000;
const lastDay = Date.UTC(2026, 8, 30);

function dailySeries(seed: number, base: number, growth: number) {
  const random = seeded(seed);
  return Array.from({ length: 730 }, (_, index): UiChartPoint => {
    const time = lastDay - (729 - index) * day;
    const weekday = new Date(time).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.72 : 1;
    return [time, Math.round((base + index * growth) * weekend * (0.85 + random() * 0.3))];
  });
}

const visitors: UiChartSpec = {
  format: "compact",
  kind: "line",
  range: "6m",
  series: [
    { id: "tools", label: "Tools", points: dailySeries(1, 2400, 6) },
    { id: "directories", label: "Directories", points: dailySeries(2, 1500, 3.2) },
    { id: "courses", label: "Courses", points: dailySeries(3, 500, 1.6) },
    { id: "references", label: "References", points: dailySeries(4, 900, 0.8) },
  ],
  title: "Daily visitors by page family",
  xFormat: "date",
};

const minute = 60_000;
const rawLatency = (() => {
  const random = seeded(9);
  const start = Date.UTC(2026, 7, 26);
  let level = 180;
  return Array.from({ length: 50_000 }, (_, index): UiChartPoint => {
    level = Math.max(60, level + (random() - 0.5) * 12 + (180 - level) * 0.02);
    const spike = random() > 0.998 ? 300 + random() * 900 : 0;
    return [start + index * minute, Math.round(level + spike)];
  });
})();

const latency: UiChartSpec = {
  format: "number",
  height: 320,
  kind: "line",
  range: "all",
  series: [{ id: "latency", label: "Response time", points: thinPoints(rawLatency, 2000) }],
  title: "Response time in ms, one reading a minute",
  xFormat: "datetime",
};

const storage: UiChartSpec = (() => {
  const random = seeded(5);
  const months = Array.from({ length: 24 }, (_, index) => Date.UTC(2024, 9 + index, 1));
  const grow = (start: number, step: number) => months.map((month, index): UiChartPoint => [month, (start + index * step * (0.8 + random() * 0.4)) * 1e12]);
  return {
    format: "bytes",
    kind: "stacked-area",
    series: [
      { id: "photos", label: "Photos", points: grow(1.2, 0.08) },
      { id: "video", label: "Video", points: grow(2.4, 0.15) },
      { id: "backups", label: "Backups", points: grow(1.8, 0.05) },
      { id: "documents", label: "Documents", points: grow(0.3, 0.01) },
    ],
    title: "Storage used, by type",
    xFormat: "date",
  };
})();

const royalties: UiChartSpec = {
  categories: ["US", "UK", "DE", "FR", "ES", "IT", "JP", "CA"],
  format: "currency",
  kind: "bar",
  series: [
    { id: "paperback", label: "Paperback", values: [412, 168, 121, 64, 38, 41, 22, 57] },
    { id: "ebook", label: "Ebook", values: [288, 132, 97, 51, 29, 33, 48, 39] },
  ],
  title: "Royalties by marketplace, last 30 days",
};

const renewals: UiChartSpec = {
  categories: [".ai", ".io", ".co", ".app", ".dev", ".net", ".org", ".com"],
  format: "currency",
  height: 320,
  kind: "horizontal-bar",
  series: [{ id: "renewal", label: "Renewal price", values: [80, 47.5, 28.99, 17.2, 15.4, 13.1, 11.9, 10.44] }],
  title: "Typical yearly renewal price",
};

const disk: UiChartSpec = {
  format: "bytes",
  height: 280,
  kind: "donut",
  slices: [
    { id: "media", label: "Media", value: 4.2e12 },
    { id: "backups", label: "Backups", value: 2.1e12 },
    { id: "apps", label: "Apps", value: 0.6e12 },
    { id: "free", label: "Free", value: 1.1e12 },
  ],
  title: "Disk use on an 8 TB pool",
};

const prices: UiChartSpec = (() => {
  const random = seeded(7);
  const books = (count: number, base: number, perPage: number) => Array.from({ length: count }, (): UiChartPoint => {
    const pages = Math.round(80 + random() * 520);
    return [pages, Math.round((base + pages * perPage) * (0.85 + random() * 0.3) * 100) / 100];
  });
  return {
    format: "currency",
    kind: "scatter",
    series: [
      { id: "paperback", label: "Paperback", points: books(60, 6, 0.024) },
      { id: "hardcover", label: "Hardcover", points: books(40, 14, 0.032) },
    ],
    title: "List price by page count",
    xFormat: "number",
    xName: "Pages",
    yName: "List price",
  };
})();

const activity: UiChartSpec = (() => {
  const random = seeded(11);
  const hours = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells = days.flatMap((_, dayIndex) => hours.map((__, hour): readonly [number, number, number] => {
    const workday = dayIndex < 5 ? 1 : 0.55;
    const daytime = Math.exp(-((hour - 14) ** 2) / 30);
    return [hour, dayIndex, Math.round((40 + 420 * daytime * workday) * (0.8 + random() * 0.4))];
  }));
  return { cells, format: "compact", height: 260, kind: "heatmap", title: "Visits by hour and weekday, UTC", valueLabel: "Visits", xCategories: hours, yCategories: days };
})();

const signups: UiChartSpec = {
  format: "number",
  height: 260,
  kind: "area",
  series: [{ id: "signups", label: "Signups", points: [182, 205, 198, 240, 262, 251, 290, 318, 305, 344, 371, 402].map((value, index): UiChartPoint => [Date.UTC(2025, 9 + index, 1), value]) }],
  title: "Newsletter signups a month",
  xFormat: "date",
};

const kilobytes = (text: string) => `${(new TextEncoder().encode(text).length / 1000).toFixed(1)} KB`;

/** What a chart adds to the page HTML: the server drawing, and the data handed to the browser. */
function Weight({ interactive = true, spec, note }: { interactive?: boolean; note?: string; spec: UiChartSpec }) {
  const svg = renderChartSvg(spec);
  return (
    <p className={styles.chartWeight}>
      Server drawing {kilobytes(svg)}
      {interactive ? ` · data for the browser ${kilobytes(JSON.stringify(spec))}` : " · no chart script"}
      {note ? ` · ${note}` : ""}
    </p>
  );
}

export function EChartsTrialExamples() {
  return (
    <>
      <Example components={["UiChart"]} note="Live numbers for this page. The 2 MB limit is Google's cut-off for one HTML file, before compression." source="app/ui/charts/" title="Page weight">
        <PageWeight />
      </Example>

      <Example components={["UiChart"]} note="Four lines over two years. Click a name to hide or show its line; a dim name is off. Hover for every line's value on that day. Pick a range with the buttons, the dates, the slider, or Shift and the mouse wheel." source="app/ui/charts/chart.tsx" title="Lines with toggles and ranges">
        <UiChart spec={visitors} />
        <Weight spec={visitors} />
      </Example>

      <Example components={["UiChart"]} note="50,000 readings, thinned on the server to 2,000 that keep the line's shape. The browser gets the 2,000." source="app/ui/charts/chart-data.ts" title="Lots of data">
        <UiChart spec={latency} />
        <Weight note={`raw data would be ${kilobytes(JSON.stringify(rawLatency))}`} spec={latency} />
      </Example>

      <Example components={["UiChart"]} note="Stacked areas add up to the total. Bytes use the same units as our tools." source="app/ui/charts/chart.tsx" title="Stacked area">
        <UiChart spec={storage} />
        <Weight spec={storage} />
      </Example>

      <Example components={["UiChart"]} note="Grouped bars compare a few values across categories." source="app/ui/charts/chart.tsx" title="Bars">
        <UiChart spec={royalties} />
        <Weight spec={royalties} />
      </Example>

      <Example components={["UiChart"]} note="Sideways bars suit rankings and long names. Values sit at the end of each bar." source="app/ui/charts/chart.tsx" title="Ranking">
        <UiChart spec={renewals} />
        <Weight spec={renewals} />
      </Example>

      <Example components={["UiChart"]} note="Parts of a whole, with the total in the middle. The names show each value and toggle its slice." source="app/ui/charts/chart.tsx" title="Donut">
        <UiChart spec={disk} />
        <Weight spec={disk} />
      </Example>

      <Example components={["UiChart"]} note="Two measures for each item. Hover a dot for both values." source="app/ui/charts/chart.tsx" title="Scatter">
        <UiChart spec={prices} />
        <Weight spec={prices} />
      </Example>

      <Example components={["UiChart"]} note="Darker means more. One color with changing strength, so it works in both themes." source="app/ui/charts/chart.tsx" title="Heatmap">
        <UiChart spec={activity} />
        <Weight spec={activity} />
      </Example>

      <Example components={["UiChart"]} note="interactive={false}: drawn on the server only. No chart script, no hover. For articles and reference pages." source="app/ui/charts/chart.tsx" title="Static chart">
        <UiChart interactive={false} spec={signups} />
        <Weight interactive={false} spec={signups} />
      </Example>
    </>
  );
}

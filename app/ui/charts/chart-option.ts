import type { EChartsCoreOption } from "echarts/core";
import styles from "./charts.module.css";

/**
 * Placeholder colors. ECharts writes colors into SVG attributes, and charts.module.css maps each
 * placeholder to a site token, so one drawing follows both themes without a redraw.
 * Every color in an option must come from here; any other color skips the theme.
 */
export const ink = {
  text: "#0a0b01",
  muted: "#0a0b02",
  grid: "#0a0b03",
  axis: "#0a0b04",
  surface: "#0a0b05",
  page: "#0a0b06",
  filler: "#0a0b07",
  band: "#0a0b08",
} as const;

export const seriesInk = ["#0a0c00", "#0a0c01", "#0a0c02", "#0a0c03", "#0a0c04", "#0a0c05", "#0a0c06"] as const;

const seriesColor = (index: number) => seriesInk[index % seriesInk.length];

export type UiChartFormat = "number" | "compact" | "bytes" | "currency" | "percent" | "date" | "datetime";

export type UiChartPoint = readonly [x: number, y: number];

/** A point on a labeled axis, such as "Q1" or "2026". */
export type UiChartLabelPoint = readonly [x: string, y: number];

export type UiChartSeries<Point = UiChartPoint> = { id: string; label: string; points: readonly Point[] };

export type UiChartRange = "1m" | "3m" | "6m" | "1y" | "all";

type Shared = {
  /** The chart's name. Screen readers and the tooltip use it. */
  title: string;
  /** One short line under the title, such as the source or what was measured. */
  caption?: string;
  /** Height in pixels. The width always fills the column. */
  height?: number;
  format: UiChartFormat;
};

export type UiChartSpec = Shared & (
  | {
      kind: "line" | "area" | "stacked-area";
      /** x values are dates as milliseconds, numbers, or labels. Labels give a category axis. */
      series: readonly UiChartSeries[] | readonly UiChartSeries<UiChartLabelPoint>[];
      /** How numeric x values read. Labels need none. */
      xFormat?: UiChartFormat;
      /** Time charts: show range buttons and a range slider, starting at this range. */
      range?: UiChartRange;
      /** Labeled dots at numeric x values, such as the person's own value on a curve. */
      marks?: readonly UiChartMark[];
    }
  | { kind: "bar" | "stacked-bar" | "horizontal-bar"; categories: readonly string[]; series: readonly { id: string; label: string; values: readonly number[] }[] }
  | { kind: "donut"; slices: readonly { id: string; label: string; value: number }[] }
  | { kind: "scatter"; series: readonly UiChartSeries[]; xFormat: UiChartFormat; xName: string; yName: string }
  | {
      kind: "heatmap";
      xCategories: readonly string[];
      yCategories: readonly string[];
      cells: readonly (readonly [x: number, y: number, value: number])[];
      /** What a cell counts, for the tooltip. */
      valueLabel: string;
    }
  /** Stages that narrow, such as trials to paid. Stages keep their order. */
  | { kind: "funnel"; stages: readonly UiChartPart[] }
  /** One value against a scale, such as progress toward a goal. */
  | { kind: "gauge"; label: string; max: number; min?: number; value: number }
  /** Parts of a total as nested-feeling blocks, for many parts or long tails. */
  | { kind: "treemap"; parts: readonly UiChartPart[] }
  /** How amounts flow from one group to the next, such as MRR movements. */
  | { kind: "sankey"; nodes: readonly { id: string; label: string }[]; links: readonly { source: string; target: string; value: number }[] }
  /** Several measures compared as shapes, such as two plans across five qualities. */
  | { kind: "radar"; axes: readonly { label: string; max: number }[]; series: readonly { id: string; label: string; values: readonly number[] }[] }
);

export type UiChartPart = { id: string; label: string; value: number };

/** One labeled dot on a line chart, such as `Your price`. */
export type UiChartMark = { label: string; x: number; y: number };

/** Kinds drawn by chart types that load only on pages that use them. See echarts-more.ts. */
const moreKinds: ReadonlySet<UiChartSpec["kind"]> = new Set(["funnel", "gauge", "treemap", "sankey", "radar"]);

export const needsMoreCharts = (spec: UiChartSpec) => moreKinds.has(spec.kind);

// The drawing, tooltip, and screen-reader table all read data through these, so they always agree.

/** Funnel stages with a finite value. */
const funnelStages = (spec: Extract<UiChartSpec, { kind: "funnel" }>) => spec.stages.filter((stage) => Number.isFinite(stage.value));

/** Treemap parts with a finite positive value. */
const treemapParts = (spec: Extract<UiChartSpec, { kind: "treemap" }>) => spec.parts.filter((part) => Number.isFinite(part.value) && part.value > 0);

/** A radar value on its axis, or null for a gap. */
const radarValue = (values: readonly number[], index: number) => (Number.isFinite(values[index]) ? values[index] : null);

type SankeySpec = Extract<UiChartSpec, { kind: "sankey" }>;

/**
 * Links ECharts can lay out: both ends known, a finite positive value, and no loop back. A flow
 * must only move forward, so a link that would close a cycle is left out instead of crashing the drawing.
 */
const sankeyLinks = (spec: SankeySpec) => {
  const ids = new Set(spec.nodes.map((node) => node.id));
  const next = new Map<string, string[]>();
  const reaches = (from: string, to: string) => {
    const seen = new Set<string>();
    const stack = [from];
    while (stack.length) {
      const id = stack.pop()!;
      if (id === to) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...(next.get(id) ?? []));
    }
    return false;
  };
  return spec.links.filter((link) => {
    if (!ids.has(link.source) || !ids.has(link.target) || !Number.isFinite(link.value) || link.value <= 0) return false;
    if (reaches(link.target, link.source)) return false;
    next.set(link.source, [...(next.get(link.source) ?? []), link.target]);
    return true;
  });
};

const hasGaugeScale = (spec: Extract<UiChartSpec, { kind: "gauge" }>) =>
  Number.isFinite(spec.min ?? 0) && Number.isFinite(spec.max) && spec.max > (spec.min ?? 0) && Number.isFinite(spec.value);

const share = (value: number, total: number) => `${numberFormat.format(total ? value / total * 100 : 0)}%`;

/** Names shown in the legend, in series order. Donut slices also show their value and share. */
export function chartLegend(spec: UiChartSpec): { label: string; detail?: string }[] {
  if (spec.kind === "donut") {
    const total = spec.slices.reduce((sum, slice) => sum + slice.value, 0);
    return spec.slices.map((slice) => ({
      detail: `${formatChartValue(slice.value, spec.format)} · ${numberFormat.format(total ? slice.value / total * 100 : 0)}%`,
      label: slice.label,
    }));
  }
  // These label their parts on the drawing itself, so a toggle legend would only repeat them.
  if (spec.kind === "heatmap" || spec.kind === "funnel" || spec.kind === "gauge" || spec.kind === "treemap" || spec.kind === "sankey") return [];
  return spec.series.map((series) => ({ label: series.label }));
}

export function donutTotal(spec: UiChartSpec) {
  return spec.kind === "donut" ? formatChartValue(spec.slices.reduce((sum, slice) => sum + slice.value, 0), spec.format) : null;
}

type LineSpec = Extract<UiChartSpec, { kind: "line" | "area" | "stacked-area" }>;

const isLine = (spec: UiChartSpec): spec is LineSpec => spec.kind === "line" || spec.kind === "area" || spec.kind === "stacked-area";

/** Marks with finite values. A labeled x axis places by position, so it takes none. */
function lineMarks(spec: UiChartSpec) {
  if (!isLine(spec) || !spec.marks || xLabels(spec)) return [];
  return spec.marks.filter((mark) => Number.isFinite(mark.x) && Number.isFinite(mark.y));
}

/** How a mark reads out loud, such as `Your price, $14.99: $4.39`. */
const markText = (spec: LineSpec, mark: UiChartMark) => `${mark.label}, ${formatChartValue(mark.x, spec.xFormat ?? "number")}: ${formatChartValue(mark.y, spec.format)}`;

/** Every mark read out loud, for charts too large for a hidden table. */
export const chartMarksText = (spec: UiChartSpec) => (isLine(spec) ? lineMarks(spec).map((mark) => markText(spec, mark)) : []);

/**
 * The labels of a labeled x axis, or null when x values are numbers. Labels are positions: every
 * series lists its points in the same order, and a label may repeat, so the longest series names them.
 */
function xLabels(spec: LineSpec) {
  const series = spec.series as readonly UiChartSeries<UiChartPoint | UiChartLabelPoint>[];
  const points = series.flatMap((line) => line.points);
  if (!points.length || !points.every((point) => typeof point[0] === "string")) return null;
  const longest = series.reduce((most, line) => (line.points.length > most.points.length ? line : most));
  return longest.points.map((point) => String(point[0]));
}

const isTimeFormat = (format: UiChartFormat | undefined) => format === "date" || format === "datetime";

/** The numeric points of a time chart that shows range controls, or null. */
export function rangedSeries(spec: UiChartSpec) {
  return isLine(spec) && spec.range !== undefined && isTimeFormat(spec.xFormat) && !xLabels(spec) ? spec.series as readonly UiChartSeries[] : null;
}

/** Charts with up to this many values carry a hidden data table. */
const tableLimit = 60;

function valueCount(spec: UiChartSpec) {
  if (spec.kind === "donut") return spec.slices.length;
  if (spec.kind === "heatmap") return spec.cells.length;
  if (spec.kind === "funnel") return funnelStages(spec).length;
  if (spec.kind === "gauge") return 1;
  if (spec.kind === "treemap") return treemapParts(spec).length;
  if (spec.kind === "sankey") return sankeyLinks(spec).length;
  if (spec.kind === "radar") return spec.axes.length * spec.series.length;
  if (spec.kind === "bar" || spec.kind === "stacked-bar" || spec.kind === "horizontal-bar") return spec.categories.length * spec.series.length;
  const points = (spec.series as readonly UiChartSeries<unknown>[]).reduce((count, line) => count + line.points.length, 0);
  return spec.kind === "scatter" ? points * 2 : points;
}

export const hasChartTable = (spec: UiChartSpec) => valueCount(spec) <= tableLimit;

/**
 * The chart's numbers as a small table for screen readers, or null for a large chart.
 * Rows are x values, categories, or items; columns are series.
 */
export function chartTable(spec: UiChartSpec): { columns: string[]; corner: string; rows: { cells: string[]; label: string }[] } | null {
  if (!hasChartTable(spec)) return null;
  const format = (value: number) => formatChartValue(value, spec.format);
  if (spec.kind === "donut") {
    const total = spec.slices.reduce((sum, slice) => sum + slice.value, 0);
    return {
      columns: ["Value", "Share"],
      corner: "Part",
      // The total that sits in the hole is read out as the last row.
      rows: [
        ...spec.slices.map((slice) => ({ cells: [format(slice.value), `${numberFormat.format(total ? slice.value / total * 100 : 0)}%`], label: slice.label })),
        { cells: [format(total), "100%"], label: "Total" },
      ],
    };
  }
  if (spec.kind === "funnel") {
    const stages = funnelStages(spec);
    const first = stages[0]?.value ?? 0;
    return {
      columns: ["Value", "Share of first stage"],
      corner: "Stage",
      rows: stages.map((stage) => ({ cells: [format(stage.value), share(stage.value, first)], label: stage.label })),
    };
  }
  if (spec.kind === "gauge") {
    const cells = hasGaugeScale(spec) ? [format(spec.value), `${format(spec.min ?? 0)} to ${format(spec.max)}`] : ["No value", ""];
    return { columns: ["Value", "Scale"], corner: "Measure", rows: [{ cells, label: spec.label }] };
  }
  if (spec.kind === "treemap") {
    const parts = treemapParts(spec);
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    return { columns: ["Value", "Share"], corner: "Part", rows: parts.map((part) => ({ cells: [format(part.value), share(part.value, total)], label: part.label })) };
  }
  if (spec.kind === "sankey") {
    const names = new Map(spec.nodes.map((node) => [node.id, node.label]));
    return { columns: ["To", "Value"], corner: "From", rows: sankeyLinks(spec).map((link) => ({ cells: [names.get(link.target) ?? link.target, format(link.value)], label: names.get(link.source) ?? link.source })) };
  }
  if (spec.kind === "radar") {
    return {
      columns: spec.series.map((shape) => shape.label),
      corner: "Measure",
      rows: spec.axes.map((axis, index) => ({
        cells: spec.series.map((shape) => {
          const value = radarValue(shape.values, index);
          return value === null ? "No value" : format(value);
        }),
        label: axis.label,
      })),
    };
  }
  if (spec.kind === "heatmap") {
    const cells = new Map(spec.cells.map(([x, y, value]) => [`${x},${y}`, value]));
    return {
      columns: [...spec.xCategories],
      corner: spec.valueLabel,
      rows: spec.yCategories.map((label, y) => ({ cells: spec.xCategories.map((_, x) => cells.has(`${x},${y}`) ? format(cells.get(`${x},${y}`)!) : ""), label })),
    };
  }
  if (spec.kind === "scatter") {
    return {
      columns: [spec.xName, spec.yName],
      corner: "Series",
      rows: spec.series.flatMap((dots) => dots.points.map(([x, y]) => ({ cells: [formatChartValue(x, spec.xFormat), format(y)], label: dots.label }))),
    };
  }
  if (spec.kind === "bar" || spec.kind === "stacked-bar" || spec.kind === "horizontal-bar") {
    return {
      columns: spec.series.map((bars) => bars.label),
      corner: "Category",
      rows: spec.categories.map((label, index) => ({ cells: spec.series.map((bars) => bars.values[index] === undefined ? "" : format(bars.values[index])), label })),
    };
  }
  if (!isLine(spec)) return null;
  const series = spec.series as readonly UiChartSeries<UiChartPoint | UiChartLabelPoint>[];
  const labels = xLabels(spec);
  if (labels) {
    return {
      columns: series.map((line) => line.label),
      corner: "Point",
      rows: labels.map((label, index) => ({ cells: series.map((line) => (line.points[index] ? format(line.points[index][1]) : "")), label })),
    };
  }
  // One row per x value, so lines that share a date share a row.
  const xs = [...new Set(series.flatMap((line) => line.points.map((point) => point[0])))];
  xs.sort((a, b) => Number(a) - Number(b));
  // A mark belongs to no one line, so its value gets its own column.
  const marks = lineMarks(spec);
  const markColumn = marks.length ? [""] : [];
  return {
    columns: [...series.map((line) => line.label), ...(marks.length ? ["Marked value"] : [])],
    corner: isTimeFormat(spec.xFormat) ? "Date" : "Point",
    rows: [
      ...xs.map((x) => ({
        cells: [
          ...series.map((line) => {
            const point = line.points.find((item) => item[0] === x);
            return point ? format(point[1]) : "";
          }),
          ...markColumn,
        ],
        label: typeof x === "string" ? x : formatChartValue(x, spec.xFormat ?? "number"),
      })),
      // Each mark gets its own row, read with its label, after the line's points.
      ...marks.map((mark) => ({
        cells: [...series.map(() => ""), format(mark.y)],
        label: `${mark.label}, ${formatChartValue(mark.x, spec.xFormat ?? "number")}`,
      })),
    ],
  };
}

// Fixed locale and UTC, so the server drawing and the browser drawing match exactly.
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const compactFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, notation: "compact" });
const wholeCurrencyFormat = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });
const centsCurrencyFormat = new Intl.NumberFormat("en-US", { currency: "USD", minimumFractionDigits: 2, style: "currency" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const dateTimeFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
const byteUnits = ["B", "KB", "MB", "GB", "TB", "PB"];

export function formatChartValue(value: number, format: UiChartFormat) {
  if (format === "compact") return compactFormat.format(value);
  // Whole amounts without cents; anything else with both digits, so $47.50 never shows as $47.5.
  if (format === "currency") return (Number.isInteger(value) ? wholeCurrencyFormat : centsCurrencyFormat).format(value);
  if (format === "percent") return `${numberFormat.format(value)}%`;
  if (format === "date") return dateFormat.format(value);
  if (format === "datetime") return dateTimeFormat.format(value);
  if (format === "bytes") {
    let unit = 0;
    let size = Math.abs(value);
    while (size >= 1000 && unit < byteUnits.length - 1) {
      size /= 1000;
      unit += 1;
    }
    return `${numberFormat.format(Math.sign(value) * size)} ${byteUnits[unit]}`;
  }
  return numberFormat.format(value);
}

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);

type TooltipRow = { color: number; label: string; value: string };

function tooltipHtml(heading: string, rows: TooltipRow[]) {
  const items = rows.map((row) => `<li><span class="${styles.swatch}" data-series="${row.color % seriesInk.length}"></span><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></li>`).join("");
  return `<div class="${styles.tooltip}"><p>${escapeHtml(heading)}</p><ul>${items}</ul></div>`;
}

type TooltipParam = { axisValue?: number | string; data: unknown; dataIndex: number; name: string; seriesIndex: number; seriesName: string; value: unknown };

const asParams = (params: unknown) => (Array.isArray(params) ? params : [params]) as TooltipParam[];

const monthsBack: Record<Exclude<UiChartRange, "all">, number> = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };

/** The first x value shown for a range, counted back from the last point. */
export function rangeStart(last: number, first: number, range: UiChartRange) {
  if (range === "all") return first;
  const end = new Date(last);
  return Math.max(first, Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - monthsBack[range], end.getUTCDate()));
}

export function xBounds(series: readonly UiChartSeries[]) {
  let first = Infinity;
  let last = -Infinity;
  for (const line of series) {
    if (line.points.length) {
      first = Math.min(first, line.points[0][0]);
      last = Math.max(last, line.points[line.points.length - 1][0]);
    }
  }
  return { first, last };
}

// The padding keeps a gap between neighbouring labels, so crowded ones are hidden instead of touching.
const axisLabel = { color: ink.muted, fontSize: 12, hideOverlap: true, padding: [0, 6] };
// Every label says where it is: a zoomed-in axis shows "May 25", not a bare "25".
const timeLabels = { day: "{MMM} {d}", hour: "{HH}:{mm}", millisecond: "{HH}:{mm}", minute: "{HH}:{mm}", month: "{MMM}", second: "{HH}:{mm}:{ss}", year: "{yyyy}" };
const splitLine = { lineStyle: { color: ink.grid } };
// Text drawn over colored shapes: the page color outlines it, so it reads on any data color in both themes.
const onShape = { color: ink.text, textBorderColor: ink.page, textBorderWidth: 3 };
const axisLine = { lineStyle: { color: ink.axis } };

/** Turns data into a complete ECharts option in the site style. The server and the browser call it with the same data. */
export function chartOption(spec: UiChartSpec): EChartsCoreOption {
  const format = (value: number) => formatChartValue(value, spec.format);
  const base = {
    animation: false,
    // Small charts carry a data table instead; see chartTable.
    aria: { enabled: !hasChartTable(spec), label: { description: [spec.title, spec.caption, ...chartMarksText(spec)].filter(Boolean).join(". ") } },
    color: [...seriesInk],
    legend: { show: false },
    textStyle: { color: ink.text, fontFamily: "var(--font-mono)", fontSize: 12 },
    tooltip: {
      backgroundColor: "transparent",
      borderWidth: 0,
      className: styles.tooltipBox,
      confine: true,
      extraCssText: "box-shadow:none;",
      padding: 0,
      transitionDuration: 0,
    },
    useUTC: true,
  };

  if (isLine(spec)) {
    const xFormat = (value: number) => formatChartValue(value, spec.xFormat ?? "number");
    const labels = xLabels(spec);
    const isTime = !labels && isTimeFormat(spec.xFormat);
    const ranged = rangedSeries(spec);
    const { first, last } = ranged ? xBounds(ranged) : { first: 0, last: 0 };
    const withRange = ranged !== null;
    const marks = lineMarks(spec);
    return {
      ...base,
      dataZoom: withRange
        ? [
            { filterMode: "filter", startValue: rangeStart(last, first, spec.range ?? "all"), type: "inside", xAxisIndex: 0, zoomOnMouseWheel: "shift" },
            {
              backgroundColor: "transparent",
              borderColor: ink.grid,
              bottom: 8,
              brushSelect: false,
              dataBackground: { areaStyle: { color: ink.grid, opacity: 1 }, lineStyle: { color: ink.axis, opacity: 1, width: 1 } },
              fillerColor: ink.filler,
              handleStyle: { borderColor: ink.axis, color: ink.surface },
              height: 26,
              moveHandleSize: 0,
              selectedDataBackground: { areaStyle: { color: ink.grid, opacity: 1 }, lineStyle: { color: ink.muted, opacity: 1, width: 1 } },
              // The From and To fields already show the dates.
              showDetail: false,
              type: "slider",
              xAxisIndex: 0,
            },
          ]
        : undefined,
      grid: { bottom: withRange ? 52 : 16, left: 12, right: 16, top: 16 },
      series: [
        ...spec.series.map((line, index) => ({
          areaStyle: spec.kind === "line" ? undefined : { color: seriesColor(index), opacity: spec.kind === "stacked-area" ? 0.32 : 0.14 },
          color: seriesColor(index),
          // A labeled axis places values by position, so a repeated label keeps its own point.
          data: labels ? line.points.map((point) => point[1]) : line.points,
          emphasis: { disabled: true },
          id: line.id,
          itemStyle: { borderColor: ink.page, borderWidth: 2, color: seriesColor(index) },
          lineStyle: { color: seriesColor(index), width: 2 },
          name: line.label,
          sampling: "lttb",
          showSymbol: false,
          stack: spec.kind === "stacked-area" ? "total" : undefined,
          symbol: "circle",
          symbolSize: 8,
          type: "line",
        })),
        // Marks sit on top of the lines as outlined dots, each named by its label.
        ...(marks.length ? [{
          data: marks.map((mark) => ({ name: mark.label, value: [mark.x, mark.y] })),
          emphasis: { disabled: true },
          id: "marks",
          itemStyle: { borderColor: ink.page, borderWidth: 2, color: ink.text },
          label: { ...onShape, formatter: "{b}", position: "top", show: true },
          name: "Marks",
          symbolSize: 11,
          type: "scatter",
          z: 3,
        }] : []),
      ],
      tooltip: {
        ...base.tooltip,
        axisPointer: { lineStyle: { color: ink.axis, width: 1 }, type: "line" },
        formatter: (params: unknown) => {
          // The marks repeat a line's own value, so the tooltip lists the lines only.
          const list = asParams(params).filter((item) => item.seriesIndex < spec.series.length);
          if (!list.length) return "";
          const x = list[0]?.axisValue ?? (list[0]?.value as number[])[0];
          // A labeled axis holds plain values; numeric and time axes hold [x, y] pairs.
          const y = (item: TooltipParam) => (labels ? Number(item.value) : (item.value as number[])[1]);
          return tooltipHtml(labels ? String(x) : xFormat(Number(x)), list.map((item) => ({ color: item.seriesIndex, label: item.seriesName, value: format(y(item)) })));
        },
        trigger: "axis",
      },
      xAxis: {
        // ECharts always keeps a time axis's last label, even on top of its neighbour.
        axisLabel: labels ? axisLabel : { ...axisLabel, formatter: isTime ? timeLabels : xFormat, showMaxLabel: isTime ? false : undefined },
        axisLine,
        axisPointer: { label: { show: false } },
        axisTick: { show: false },
        boundaryGap: false,
        data: labels ?? undefined,
        splitLine: { show: false },
        type: labels ? "category" : isTime ? "time" : "value",
      },
      yAxis: { axisLabel: { ...axisLabel, formatter: (value: number) => formatChartValue(value, spec.format === "currency" ? "currency" : spec.format === "bytes" ? "bytes" : "compact") }, splitLine, type: "value" },
    };
  }

  if (spec.kind === "bar" || spec.kind === "stacked-bar" || spec.kind === "horizontal-bar") {
    const horizontal = spec.kind === "horizontal-bar";
    // One bar with cents means every bar shows cents, so $80.00 lines up with $47.50.
    const withCents = spec.format === "currency" && spec.series.some((bars) => bars.values.some((value) => !Number.isInteger(value)));
    const barValue = (value: number) => (withCents ? centsCurrencyFormat.format(value) : format(value));
    const categoryAxis = { axisLabel: { ...axisLabel, color: ink.text }, axisLine, axisTick: { show: false }, data: [...spec.categories], inverse: horizontal, type: "category" };
    const valueAxis = { axisLabel: { ...axisLabel, formatter: format }, splitLine, type: "value" };
    return {
      ...base,
      grid: { bottom: 16, left: 12, right: horizontal ? 72 : 16, top: 16 },
      series: spec.series.map((bars, index) => ({
        barGap: "20%",
        barMaxWidth: horizontal ? 22 : 36,
        color: seriesColor(index),
        data: bars.values,
        emphasis: { disabled: true },
        id: bars.id,
        itemStyle: { borderRadius: horizontal ? [0, 2, 2, 0] : [2, 2, 0, 0], color: seriesColor(index) },
        label: horizontal ? { color: ink.text, formatter: (item: { value: number }) => barValue(item.value), position: "right", show: true } : undefined,
        name: bars.label,
        stack: spec.kind === "stacked-bar" ? "total" : undefined,
        type: "bar",
      })),
      tooltip: {
        ...base.tooltip,
        axisPointer: { shadowStyle: { color: ink.band }, type: "shadow" },
        formatter: (params: unknown) => {
          const list = asParams(params);
          return tooltipHtml(list[0]?.name ?? "", list.map((item) => ({ color: item.seriesIndex, label: item.seriesName, value: barValue(item.value as number) })));
        },
        trigger: "axis",
      },
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
    };
  }

  if (spec.kind === "donut") {
    const total = spec.slices.reduce((sum, slice) => sum + slice.value, 0);
    return {
      ...base,
      series: [{
        avoidLabelOverlap: true,
        center: ["50%", "50%"],
        data: spec.slices.map((slice, index) => ({ itemStyle: { color: seriesColor(index) }, name: slice.label, value: slice.value })),
        emphasis: { disabled: true },
        itemStyle: { borderColor: ink.page, borderWidth: 3 },
        label: { show: false },
        name: spec.title,
        radius: ["58%", "86%"],
        type: "pie",
      }],
      tooltip: {
        ...base.tooltip,
        formatter: (params: unknown) => {
          const [item] = asParams(params);
          const share = total ? ` (${numberFormat.format((item.value as number) / total * 100)}%)` : "";
          return tooltipHtml(spec.title, [{ color: item.dataIndex, label: item.name, value: `${format(item.value as number)}${share}` }]);
        },
        trigger: "item",
      },
    };
  }

  if (spec.kind === "scatter") {
    const xFormat = (value: number) => formatChartValue(value, spec.xFormat);
    return {
      ...base,
      grid: { bottom: 32, left: 12, right: 16, top: 28 },
      series: spec.series.map((dots, index) => ({
        color: seriesColor(index),
        data: dots.points,
        emphasis: { disabled: true },
        id: dots.id,
        itemStyle: { color: seriesColor(index), opacity: 0.8 },
        name: dots.label,
        symbolSize: 9,
        type: "scatter",
      })),
      tooltip: {
        ...base.tooltip,
        formatter: (params: unknown) => {
          const [item] = asParams(params);
          const [x, y] = item.value as number[];
          return tooltipHtml(item.seriesName, [{ color: item.seriesIndex, label: spec.xName, value: xFormat(x) }, { color: item.seriesIndex, label: spec.yName, value: format(y) }]);
        },
        trigger: "item",
      },
      xAxis: { axisLabel: { ...axisLabel, formatter: xFormat }, axisLine, name: spec.xName, nameGap: 28, nameLocation: "middle", nameTextStyle: { color: ink.muted }, splitLine, type: "value" },
      yAxis: { axisLabel: { ...axisLabel, formatter: format }, name: spec.yName, nameTextStyle: { align: "left", color: ink.muted }, splitLine, type: "value" },
    };
  }

  if (spec.kind === "funnel") {
    const stages = funnelStages(spec);
    const first = stages[0]?.value ?? 0;
    const max = Math.max(0, ...stages.map((stage) => stage.value));
    return {
      ...base,
      series: [{
        bottom: 8,
        data: stages.map((stage, index) => ({ itemStyle: { color: seriesColor(index) }, name: stage.label, value: stage.value })),
        emphasis: { disabled: true },
        gap: 3,
        itemStyle: { borderWidth: 0 },
        // Labels sit beside the funnel in plain text, so they read in both themes without an outline.
        // The value goes under the name, and long names wrap, so labels fit beside the funnel on phones.
        label: { color: ink.text, formatter: (item: { name: string; value: number }) => `${item.name}\n${format(item.value)}`, lineHeight: 18, overflow: "break", position: "right", width: 128 },
        labelLine: { length: 12, lineStyle: { color: ink.axis } },
        left: 8,
        max,
        min: 0,
        minSize: "8%",
        name: spec.title,
        sort: "none",
        width: "50%",
        top: 8,
        type: "funnel",
      }],
      tooltip: {
        ...base.tooltip,
        formatter: (params: unknown) => {
          const [item] = asParams(params);
          const previous = stages[item.dataIndex - 1]?.value;
          const rows = [{ color: item.dataIndex, label: "Value", value: format(item.value as number) }, { color: item.dataIndex, label: "Of first stage", value: share(item.value as number, first) }];
          if (previous !== undefined) rows.push({ color: item.dataIndex, label: "Of previous stage", value: share(item.value as number, previous) });
          return tooltipHtml(item.name, rows);
        },
        trigger: "item",
      },
    };
  }

  if (spec.kind === "gauge") {
    // A broken scale draws nothing rather than progress that means nothing.
    if (!hasGaugeScale(spec)) return base;
    const min = spec.min ?? 0;
    return {
      ...base,
      series: [{
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: [[1, ink.grid]], width: 16 } },
        axisTick: { show: false },
        center: ["50%", "62%"],
        data: [{ name: spec.label, value: Math.min(spec.max, Math.max(min, spec.value)) }],
        detail: { color: ink.text, fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 600, formatter: () => format(spec.value), offsetCenter: [0, "-8%"] },
        emphasis: { disabled: true },
        endAngle: -20,
        max: spec.max,
        min,
        name: spec.title,
        pointer: { show: false },
        progress: { itemStyle: { color: seriesColor(0) }, show: true, width: 16 },
        radius: "92%",
        splitLine: { show: false },
        startAngle: 200,
        title: { color: ink.muted, fontSize: 12, offsetCenter: [0, "22%"] },
        type: "gauge",
      }],
      tooltip: { show: false },
    };
  }

  if (spec.kind === "treemap") {
    const parts = treemapParts(spec);
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    return {
      ...base,
      series: [{
        breadcrumb: { show: false },
        // ECharts puts a root node first, so each part carries its own color index for the tooltip.
        data: parts.map((part, index) => ({ colorIndex: index, itemStyle: { color: seriesColor(index) }, name: part.label, value: part.value })),
        emphasis: { disabled: true },
        height: "100%",
        itemStyle: { borderColor: ink.page, borderWidth: 2, gapWidth: 2 },
        label: { ...onShape, formatter: (item: { name: string; value: number }) => `${item.name}\n${format(item.value)}`, position: "insideTopLeft" },
        left: 0,
        name: spec.title,
        nodeClick: false,
        roam: false,
        top: 0,
        type: "treemap",
        width: "100%",
      }],
      tooltip: {
        ...base.tooltip,
        formatter: (params: unknown) => {
          const [item] = asParams(params);
          const colorIndex = (item.data as { colorIndex?: number } | undefined)?.colorIndex ?? 0;
          return tooltipHtml(spec.title, [{ color: colorIndex, label: item.name, value: `${format(item.value as number)} (${share(item.value as number, total)})` }]);
        },
        trigger: "item",
      },
    };
  }

  if (spec.kind === "sankey") {
    // Nodes are keyed by id, so two nodes may share a label.
    const names = new Map(spec.nodes.map((node) => [node.id, node.label]));
    const nameOf = (id: string) => names.get(id) ?? id;
    return {
      ...base,
      series: [{
        bottom: 8,
        data: spec.nodes.map((node, index) => ({ itemStyle: { color: seriesColor(index) }, name: node.id })),
        draggable: false,
        emphasis: { disabled: true },
        label: { color: ink.text, formatter: (item: { name: string }) => nameOf(item.name) },
        left: 8,
        lineStyle: { color: "source", opacity: 0.32 },
        links: sankeyLinks(spec).map((link) => ({ source: link.source, target: link.target, value: link.value })),
        nodeGap: 12,
        nodeWidth: 12,
        right: 96,
        top: 8,
        type: "sankey",
      }],
      tooltip: {
        ...base.tooltip,
        formatter: (params: unknown) => {
          const item = asParams(params)[0] as TooltipParam & { dataType?: string; data: { source?: string; target?: string; value?: number } };
          if (item.dataType === "edge") return tooltipHtml(`${nameOf(item.data.source ?? "")} to ${nameOf(item.data.target ?? "")}`, [{ color: 0, label: "Value", value: format(item.data.value ?? 0) }]);
          return tooltipHtml(nameOf(item.name), [{ color: item.dataIndex, label: "Value", value: format(item.value as number) }]);
        },
        trigger: "item",
      },
    };
  }

  if (spec.kind === "radar") {
    if (!spec.axes.length) return base;
    return {
      ...base,
      radar: {
        axisLine: axisLine,
        axisName: { color: ink.muted, fontSize: 12 },
        indicator: spec.axes.map((axis) => ({ max: axis.max, name: axis.label })),
        axisNameGap: 8,
        // Leaves room for axis names beside the shape on a phone-width chart.
        radius: "52%",
        splitArea: { show: false },
        splitLine,
      },
      series: [{
        data: spec.series.map((shape, index) => ({
          areaStyle: { color: seriesColor(index), opacity: 0.14 },
          itemStyle: { color: seriesColor(index) },
          lineStyle: { color: seriesColor(index), width: 2 },
          name: shape.label,
          // One value per axis. A missing or broken value draws as a gap, not as zero.
          value: spec.axes.map((_, axis) => radarValue(shape.values, axis) ?? "-"),
        })),
        emphasis: { disabled: true },
        symbol: "circle",
        symbolSize: 6,
        type: "radar",
      }],
      tooltip: {
        ...base.tooltip,
        formatter: (params: unknown) => {
          const [item] = asParams(params);
          const values = spec.series[item.dataIndex]?.values ?? [];
          return tooltipHtml(item.name, spec.axes.map((axis, index) => {
            const value = radarValue(values, index);
            return { color: item.dataIndex, label: axis.label, value: value === null ? "No value" : format(value) };
          }));
        },
        trigger: "item",
      },
    };
  }

  if (spec.kind !== "heatmap") return base;
  const values = spec.cells.map((cell) => cell[2]);
  return {
    ...base,
    grid: { bottom: 16, left: 12, right: 8, top: 8 },
    series: [{
      data: spec.cells,
      emphasis: { disabled: true },
      itemStyle: { borderColor: ink.page, borderWidth: 2, color: seriesColor(0) },
      name: spec.title,
      type: "heatmap",
    }],
    tooltip: {
      ...base.tooltip,
      formatter: (params: unknown) => {
        const [item] = asParams(params);
        const [x, y, value] = item.value as number[];
        return tooltipHtml(`${spec.yCategories[y]} ${spec.xCategories[x]}`, [{ color: 0, label: spec.valueLabel, value: format(value) }]);
      },
      trigger: "item",
    },
    // Darker means more: one color with changing opacity, so the theme mapping still works.
    visualMap: { inRange: { opacity: [0.12, 1] }, max: Math.max(...values), min: Math.min(...values), show: false },
    xAxis: { axisLabel: { ...axisLabel, interval: 2 }, axisLine: { show: false }, axisTick: { show: false }, data: [...spec.xCategories], splitArea: { show: false }, type: "category" },
    yAxis: { axisLabel: { ...axisLabel, color: ink.text }, axisLine: { show: false }, axisTick: { show: false }, data: [...spec.yCategories], inverse: true, type: "category" },
  };
}

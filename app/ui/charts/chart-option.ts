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

export type UiChartSeries = { id: string; label: string; points: readonly UiChartPoint[] };

export type UiChartRange = "1m" | "3m" | "6m" | "1y" | "all";

type Shared = {
  /** The chart's name. Screen readers and the tooltip use it. */
  title: string;
  /** Height in pixels. The width always fills the column. */
  height?: number;
  format: UiChartFormat;
};

export type UiChartSpec = Shared & (
  | {
      kind: "line" | "area" | "stacked-area";
      series: readonly UiChartSeries[];
      xFormat: UiChartFormat;
      /** Time charts: show range buttons and a range slider, starting at this range. */
      range?: UiChartRange;
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
);

/** Names shown in the legend, in series order. Donut slices also show their value and share. */
export function chartLegend(spec: UiChartSpec): { label: string; detail?: string }[] {
  if (spec.kind === "donut") {
    const total = spec.slices.reduce((sum, slice) => sum + slice.value, 0);
    return spec.slices.map((slice) => ({
      detail: `${formatChartValue(slice.value, spec.format)} · ${numberFormat.format(total ? slice.value / total * 100 : 0)}%`,
      label: slice.label,
    }));
  }
  if (spec.kind === "heatmap") return [];
  return spec.series.map((series) => ({ label: series.label }));
}

export function donutTotal(spec: UiChartSpec) {
  return spec.kind === "donut" ? formatChartValue(spec.slices.reduce((sum, slice) => sum + slice.value, 0), spec.format) : null;
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
const axisLine = { lineStyle: { color: ink.axis } };

/** Turns data into a complete ECharts option in the site style. The server and the browser call it with the same data. */
export function chartOption(spec: UiChartSpec): EChartsCoreOption {
  const format = (value: number) => formatChartValue(value, spec.format);
  const base = {
    animation: false,
    aria: { enabled: true, label: { description: spec.title } },
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

  if (spec.kind === "line" || spec.kind === "area" || spec.kind === "stacked-area") {
    const xFormat = (value: number) => formatChartValue(value, spec.xFormat);
    const isTime = spec.xFormat === "date" || spec.xFormat === "datetime";
    const { first, last } = xBounds(spec.series);
    const withRange = isTime && spec.range !== undefined;
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
      series: spec.series.map((line, index) => ({
        areaStyle: spec.kind === "line" ? undefined : { color: seriesColor(index), opacity: spec.kind === "stacked-area" ? 0.32 : 0.14 },
        color: seriesColor(index),
        data: line.points,
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
      tooltip: {
        ...base.tooltip,
        axisPointer: { lineStyle: { color: ink.axis, width: 1 }, type: "line" },
        formatter: (params: unknown) => {
          const list = asParams(params);
          const x = Number(list[0]?.axisValue ?? (list[0]?.value as number[])[0]);
          return tooltipHtml(xFormat(x), list.map((item) => ({ color: item.seriesIndex, label: item.seriesName, value: format((item.value as number[])[1]) })));
        },
        trigger: "axis",
      },
      xAxis: {
        // ECharts always keeps a time axis's last label, even on top of its neighbour.
        axisLabel: { ...axisLabel, formatter: isTime ? timeLabels : xFormat, showMaxLabel: isTime ? false : undefined },
        axisLine,
        axisPointer: { label: { show: false } },
        axisTick: { show: false },
        boundaryGap: false,
        splitLine: { show: false },
        type: isTime ? "time" : "value",
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

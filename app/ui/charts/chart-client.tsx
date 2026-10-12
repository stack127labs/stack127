"use client";

import { CalendarDate } from "@internationalized/date";
import type { EChartsType } from "echarts/core";
import type { DateValue } from "react-aria-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { UiDatePicker } from "@/app/ui/controls";
import { chartLegend, chartOption, donutTotal, hasChartTable, needsMoreCharts, rangedSeries, rangeStart, xBounds, type UiChartRange, type UiChartSpec } from "./chart-option";
import { ChartDataTable, ChartHeading } from "./chart-parts";
import { echarts } from "./echarts";
import styles from "./charts.module.css";

// Funnel, gauge, treemap, sankey, and radar load once, on the first chart that needs one.
let moreCharts: Promise<void> | null = null;
let moreChartsReady = false;
const loadMoreCharts = () => (moreCharts ??= import("./echarts-more").then(
  () => {
    moreChartsReady = true;
  },
  (error: unknown) => {
    // A failed download can be tried again by the next chart.
    moreCharts = null;
    throw error;
  },
));

const ranges: { id: UiChartRange; label: string; name: string }[] = [
  { id: "1m", label: "1M", name: "Last month" },
  { id: "3m", label: "3M", name: "Last 3 months" },
  { id: "6m", label: "6M", name: "Last 6 months" },
  { id: "1y", label: "1Y", name: "Last year" },
  { id: "all", label: "All", name: "All time" },
];

const toDay = (time: number) => {
  const date = new Date(time);
  return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
};
const fromDay = (day: DateValue) => Date.UTC(day.year, day.month - 1, day.day);

const dayLength = 86_400_000;
const startOfDay = (time: number) => Math.floor(time / dayLength) * dayLength;
const formatDay = (time: number) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(time);

type ZoomEvent = { batch?: { end: number; start: number }[]; end?: number; start?: number };
type Bounds = { first: number; last: number };
type Span = { end: number; start: number };

const boundsOf = (spec: UiChartSpec) => {
  const series = rangedSeries(spec);
  return series ? xBounds(series) : null;
};
const startingRange = (spec: UiChartSpec) => "range" in spec && rangedSeries(spec) ? spec.range ?? null : null;
const presetSpan = (bounds: Bounds, range: UiChartRange) => ({ end: bounds.last, start: rangeStart(bounds.last, bounds.first, range) });

/** The reader's range on new data: the same preset, or the same dates kept inside the data. */
function keepSpan(bounds: Bounds | null, preset: UiChartRange | null, span: Span | null): Span | null {
  if (!bounds) return null;
  if (preset) return presetSpan(bounds, preset);
  const start = Math.max(bounds.first, Math.min(span?.start ?? bounds.first, bounds.last));
  const end = Math.min(bounds.last, Math.max(span?.end ?? bounds.last, start));
  return { end, start };
}

/**
 * The chart drawn in the browser, with line toggles, hover, and range controls. Use it inside client
 * components for data computed in the browser; it redraws when the spec changes. UiChart uses it too,
 * with `svg` holding the server drawing to show until the browser has drawn its own.
 */
export function UiLiveChart({ spec, svg }: { spec: UiChartSpec; svg?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  // ECharts copies its layout steps when an instance starts, so a chart started before the extra
  // types loaded is started again to draw them.
  const startRef = useRef<(() => void) | null>(null);
  const startedWithMore = useRef(false);
  const [drawnIn, setDrawnIn] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const legend = chartLegend(spec);
  // New data may drop series: forget hidden names that are gone, and never leave every series hidden.
  const stillThere = hidden.filter((label) => legend.some((item) => item.label === label));
  const off = stillThere.length >= legend.length ? [] : stillThere;
  if (off.length !== hidden.length) setHidden(off);
  const total = donutTotal(spec);
  const withTable = hasChartTable(spec);
  const bounds = useMemo(() => boundsOf(spec), [spec]);
  const [preset, setPreset] = useState(() => startingRange(spec));
  const [visible, setVisible] = useState(() => keepSpan(bounds, preset, null));
  // What the reader typed in From and To. The chart follows only complete dates inside the data,
  // so the fields never jump back while someone is still typing.
  const [draft, setDraft] = useState<{ end?: DateValue | null; start?: DateValue | null }>({});

  // New data with a different date span: keep the reader's range on it.
  const boundsKey = bounds ? `${bounds.first}:${bounds.last}` : "";
  const [shownBoundsKey, setShownBoundsKey] = useState(boundsKey);
  if (boundsKey !== shownBoundsKey) {
    setShownBoundsKey(boundsKey);
    setVisible(keepSpan(bounds, preset, visible));
    setDraft({});
  }

  // The latest state, for the chart's own events and redraws.
  const latestState = useRef({ bounds, hidden, visible });
  useEffect(() => {
    latestState.current = { bounds, hidden, visible };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const start = () => {
      chartRef.current?.dispose();
      const chart = echarts.init(host, null, { renderer: "svg" });
      chartRef.current = chart;
      startedWithMore.current = moreChartsReady;
      chart.on("datazoom", (event) => {
        const current = latestState.current.bounds;
        if (!current) return;
        const zoom = (event as ZoomEvent).batch?.[0] ?? (event as ZoomEvent);
        if (zoom.start === undefined || zoom.end === undefined) return;
        const span = current.last - current.first;
        setVisible({ end: current.first + span * zoom.end / 100, start: current.first + span * zoom.start / 100 });
        setDraft({});
        setPreset(null);
      });
    };
    start();
    startRef.current = start;
    const resize = new ResizeObserver(() => chartRef.current?.resize());
    resize.observe(host);
    return () => {
      resize.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
      startRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const started = performance.now();
    const draw = () => {
      if (cancelled) return;
      if (needsMoreCharts(spec) && !startedWithMore.current) startRef.current?.();
      const chart = chartRef.current;
      if (!chart || chart.isDisposed()) return;
      const option = chartOption(spec);
      // A redraw keeps the lines the reader turned off and the range they picked.
      const { hidden: off, visible: span } = latestState.current;
      option.legend = { selected: Object.fromEntries(off.map((label) => [label, false])), show: false };
      if (span && Array.isArray(option.dataZoom)) option.dataZoom = option.dataZoom.map((zoom) => ({ ...zoom, endValue: span.end, startValue: span.start }));
      chart.setOption(option, { notMerge: true });
      // Reported once the browser has painted the chart; the gallery's page weight panel reads it.
      frame = requestAnimationFrame(() => setDrawnIn((time) => time ?? performance.now() - started));
    };
    // Until the extra types arrive, the server drawing, if any, stays in place.
    if (needsMoreCharts(spec)) loadMoreCharts().then(draw, () => {});
    else draw();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [spec]);

  const zoomTo = (start: number, end: number) => {
    chartRef.current?.dispatchAction({ endValue: end, startValue: start, type: "dataZoom" }, { silent: true });
    setVisible({ end, start });
  };

  const dateError = (day: DateValue | null | undefined, earliest: number, latest: number) => {
    if (day === undefined) return undefined;
    if (day === null) return "Enter a date.";
    // A year under 1000 is one still being typed.
    if (day.year < 1000) return undefined;
    // Whole days: a range that starts or ends partway through a day still accepts that day.
    const time = fromDay(day);
    const firstDay = startOfDay(earliest);
    const lastDay = startOfDay(latest);
    return time < firstDay || time > lastDay ? `Pick a date from ${formatDay(firstDay)} to ${formatDay(lastDay)}.` : undefined;
  };

  const pickDate = (side: "end" | "start", day: DateValue | null) => {
    if (!bounds || !visible) return;
    const next = { ...draft, [side]: day };
    setDraft(next);
    setPreset(null);
    const start = side === "start" ? day : null;
    const end = side === "end" ? day : null;
    if (start && start.year >= 1000 && !dateError(start, bounds.first, visible.end)) zoomTo(Math.max(bounds.first, fromDay(start)), visible.end);
    // "To" includes the whole chosen day, so intraday readings later that day stay in view.
    if (end && end.year >= 1000 && !dateError(end, visible.start, bounds.last)) zoomTo(visible.start, Math.min(bounds.last, fromDay(end) + dayLength - 1));
  };

  const toggle = (label: string) => {
    chartRef.current?.dispatchAction({ name: label, type: "legendToggleSelect" });
    setHidden((current) => current.includes(label) ? current.filter((name) => name !== label) : [...current, label]);
  };

  return (
    <figure className={styles.figure} data-chart-drawn-ms={drawnIn === null ? undefined : Math.round(drawnIn)}>
      <ChartHeading spec={spec} />

      {bounds && visible ? (
        <div className={styles.toolbar}>
          <div aria-label="Range" className={styles.ranges} role="group">
            {/* Only ranges shorter than the data: on 34 days of data, 3M and 1Y would just mean All. */}
            {ranges.filter((range) => range.id === "all" || rangeStart(bounds.last, bounds.first, range.id) > bounds.first).map((range) => (
              <button
                aria-label={range.name}
                aria-pressed={preset === range.id}
                className={styles.rangeButton}
                key={range.id}
                onClick={() => {
                  zoomTo(rangeStart(bounds.last, bounds.first, range.id), bounds.last);
                  setDraft({});
                  setPreset(range.id);
                }}
                type="button"
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className={styles.dates}>
            <UiDatePicker
              error={dateError(draft.start, bounds.first, visible.end)}
              label="From"
              maxValue={toDay(visible.end)}
              minValue={toDay(bounds.first)}
              onChange={(day) => pickDate("start", day)}
              value={draft.start === undefined ? toDay(visible.start) : draft.start}
            />
            <UiDatePicker
              error={dateError(draft.end, visible.start, bounds.last)}
              label="To"
              maxValue={toDay(bounds.last)}
              minValue={toDay(visible.start)}
              onChange={(day) => pickDate("end", day)}
              value={draft.end === undefined ? toDay(visible.end) : draft.end}
            />
          </div>
        </div>
      ) : null}

      {legend.length > 1 ? (
        <div aria-label="Shown in the chart" className={styles.legend} role="group">
          {legend.map(({ detail, label }, index) => {
            const isOn = !off.includes(label);
            return (
              <button
                aria-pressed={isOn}
                className={styles.legendButton}
                disabled={isOn && off.length === legend.length - 1}
                key={label}
                onClick={() => toggle(label)}
                type="button"
              >
                <span className={styles.swatch} data-series={index % 7} />
                {label}
                {detail ? <span className={styles.legendDetail}>{detail}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* The box keeps its height before the first drawing, so nothing below it moves. */}
      <div aria-hidden={withTable || undefined} className={styles.plot} style={{ height: spec.height ?? 360 }}>
        {svg && drawnIn === null ? <div aria-hidden="true" className={styles.serverDrawing} dangerouslySetInnerHTML={{ __html: svg }} /> : null}
        <div className={styles.host} ref={hostRef} />
        {total ? <p className={styles.donutTotal}><strong>{total}</strong><span>Total</span></p> : null}
      </div>
      <ChartDataTable spec={spec} />
    </figure>
  );
}

"use client";

import { CalendarDate } from "@internationalized/date";
import type { EChartsType } from "echarts/core";
import type { DateValue } from "react-aria-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { UiDatePicker } from "@/app/ui/controls";
import { chartLegend, chartOption, donutTotal, rangeStart, xBounds, type UiChartRange, type UiChartSpec } from "./chart-option";
import { echarts } from "./echarts";
import styles from "./charts.module.css";

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

export function UiChartClient({ spec, svg }: { spec: UiChartSpec; svg: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const [drawnIn, setDrawnIn] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const legend = chartLegend(spec);
  const total = donutTotal(spec);
  const bounds = useMemo(() => (spec.kind === "line" || spec.kind === "area" || spec.kind === "stacked-area") && spec.range ? xBounds(spec.series) : null, [spec]);
  const [preset, setPreset] = useState<UiChartRange | null>(spec.kind === "line" || spec.kind === "area" || spec.kind === "stacked-area" ? spec.range ?? null : null);
  const [visible, setVisible] = useState(() => bounds && preset ? { end: bounds.last, start: rangeStart(bounds.last, bounds.first, preset) } : null);
  // What the reader typed in From and To. The chart follows only complete dates inside the data,
  // so the fields never jump back while someone is still typing.
  const [draft, setDraft] = useState<{ end?: DateValue | null; start?: DateValue | null }>({});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const started = performance.now();
    const chart = echarts.init(host, null, { renderer: "svg" });
    chart.setOption(chartOption(spec));
    chartRef.current = chart;
    // Reported once the browser has painted the chart; the gallery's page weight panel reads it.
    const frame = requestAnimationFrame(() => setDrawnIn(performance.now() - started));

    const resize = new ResizeObserver(() => chart.resize());
    resize.observe(host);
    chart.on("datazoom", (event) => {
      if (!bounds) return;
      const zoom = (event as ZoomEvent).batch?.[0] ?? (event as ZoomEvent);
      if (zoom.start === undefined || zoom.end === undefined) return;
      const span = bounds.last - bounds.first;
      setVisible({ end: bounds.first + span * zoom.end / 100, start: bounds.first + span * zoom.start / 100 });
      setDraft({});
      setPreset(null);
    });

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [bounds, spec]);

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
      <figcaption className={styles.caption}>{spec.title}</figcaption>

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
            const isOn = !hidden.includes(label);
            return (
              <button
                aria-pressed={isOn}
                className={styles.legendButton}
                disabled={isOn && hidden.length === legend.length - 1}
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

      <div className={styles.plot} style={{ height: spec.height ?? 360 }}>
        {drawnIn === null ? <div aria-hidden="true" className={styles.serverDrawing} dangerouslySetInnerHTML={{ __html: svg }} /> : null}
        <div className={styles.host} ref={hostRef} />
        {total ? <p className={styles.donutTotal}><strong>{total}</strong><span>Total</span></p> : null}
      </div>
    </figure>
  );
}

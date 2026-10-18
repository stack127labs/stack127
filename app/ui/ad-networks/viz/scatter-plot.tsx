"use client";

import { MeasuredChart, svgSize, useChartWidth } from "./chart-frame";
import { formatCompact, formatNumber, niceScale } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type ScatterPoint = {
  label: string;
  shortLabel?: string;
  /** Position on the x axis in steps: 0 is the first step. Fractions sit between steps. */
  x: number;
  y: number;
  /** The x value in words for the data table, such as `25,000 pageviews`. Defaults to the nearest step. */
  xDisplay?: string;
  /** Accent dot with its name beside it. Defaults to points at 60% or more of the biggest value. */
  highlight?: boolean;
};

const height = 250;
const left = 40;
const right = 10;
const bottom = 40;
const top = 10;
const dot = 6;
const charWidth = 6.6;
const textHeight = 12;

type Box = { x1: number; y1: number; x2: number; y2: number };
const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

/**
 * Each item as a dot, placed by a position on stepped x axis and a count on the y axis (mockup
 * joining rule vs sites). Big items are accent dots, the rest neutral. Names go right, left,
 * above, or below their dot, wherever they clear the axis labels, the other dots, and the names
 * already placed. On phones only the big items are named.
 */
export function ScatterPlot({ caption, points, xLabels, xTitle }: {
  caption: string;
  points: readonly ScatterPoint[];
  /** The x steps in order, such as `none`, `1k`, `10k`. */
  xLabels: readonly string[];
  /** Words at the end of the x axis, such as `traffic minimum →`. */
  xTitle: string;
}) {
  const { measured, ref, width } = useChartWidth(420);
  const { high, ticks } = niceScale(points.map((point) => point.y), 3, true);
  const steps = Math.max(1, xLabels.length - 1);
  const x = (step: number) => left + (step / steps) * (width - left - right - 40) + 20;
  const y = (value: number) => top + (1 - value / high) * (height - top - bottom);
  const biggest = Math.max(0, ...points.map((point) => point.y));

  const placed = points.map((point) => ({ point, cx: x(point.x), cy: y(point.y), big: point.highlight ?? point.y >= biggest * 0.6 }));
  // Names stay inside the plot: right of the y axis labels, above the x axis labels.
  const bounds: Box = { x1: left, y1: 0, x2: width, y2: height - bottom + 4 };
  const taken: Box[] = placed.map(({ cx, cy }) => ({ x1: cx - dot, y1: cy - dot, x2: cx + dot, y2: cy + dot }));
  const labels = new Map<string, { x: number; y: number; anchor: "start" | "middle" | "end"; text: string }>();
  // Big dots pick first, so their names get the best spot.
  for (const { point, cx, cy, big } of [...placed].sort((a, b) => Number(b.big) - Number(a.big) || b.point.y - a.point.y)) {
    if (!big && width <= 420) continue;
    const text = point.shortLabel ?? point.label;
    const w = text.length * charWidth;
    const spots = [
      { x: cx + 10, y: cy + 4, anchor: "start" as const, box: { x1: cx + 9, y1: cy - 8, x2: cx + 11 + w, y2: cy + 6 } },
      { x: cx - 10, y: cy + 4, anchor: "end" as const, box: { x1: cx - 11 - w, y1: cy - 8, x2: cx - 9, y2: cy + 6 } },
      { x: cx, y: cy - 11, anchor: "middle" as const, box: { x1: cx - w / 2, y1: cy - 11 - textHeight + 2, x2: cx + w / 2, y2: cy - 9 } },
      { x: cx, y: cy + 19, anchor: "middle" as const, box: { x1: cx - w / 2, y1: cy + 9, x2: cx + w / 2, y2: cy + 21 } },
    ];
    const spot = spots.find(({ box }) => box.x1 >= bounds.x1 && box.x2 <= bounds.x2 && box.y1 >= bounds.y1 && box.y2 <= bounds.y2
      && !taken.some((other) => overlaps(box, other)));
    if (!spot) continue;
    taken.push(spot.box);
    labels.set(point.label, { x: spot.x, y: spot.y, anchor: spot.anchor, text });
  }

  return (
    <>
      <MeasuredChart measureRef={ref}>
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line strokeDasharray="2 4" style={{ stroke: "var(--color-border)" }} x1={left} x2={width} y1={y(tick)} y2={y(tick)} />
              <text className={styles.tMuted} x={0} y={y(tick) + 4}>{tick ? formatCompact(tick) : "0"}</text>
            </g>
          ))}
          {xLabels.map((label, index) => <text className={styles.tMuted} key={label} textAnchor="middle" x={x(index)} y={height - 22}>{label}</text>)}
          <text className={styles.tMuted} textAnchor="end" x={width} y={height - 4}>{xTitle}</text>
          {placed.map(({ point, cx, cy, big }) => {
            const label = labels.get(point.label);
            return (
              <g key={point.label}>
                <circle cx={cx} cy={cy} r={dot} style={{ fill: big ? "var(--viz-ac)" : "var(--viz-n1)" }} />
                {label ? <text className={styles.tInk} textAnchor={label.anchor} x={label.x} y={label.y}>{label.text}</text> : null}
              </g>
            );
          })}
        </svg>
      </MeasuredChart>
      <VizDataTable caption={caption} head={["name", "x", "y"]} rows={points.map((point) => [point.label, point.xDisplay ?? xLabels[Math.round(point.x)] ?? "", formatNumber(point.y)])} />
    </>
  );
}

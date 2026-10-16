"use client";

import { useState } from "react";
import { InteractiveChart, svgSize, useChartWidth } from "./chart-frame";
import { formatNumber, formatSigned } from "./format";
import { VizDataTable, VizLegend } from "./parts";
import styles from "./viz.module.css";

export type JoinedLeftPoint = {
  /** The day or week, such as `Oct 3` or `Week of Sep 28`. */
  label: string;
  joined: number;
  left: number;
  /** Position on the period's timeline, 0 for the first day or week. Needed with `slots`. */
  slot?: number;
};

export type JoinedLeftPeriod = {
  /** Stable key, such as `30`. */
  key: string;
  /** Switch label, such as `30 days`. */
  label: string;
  points: readonly JoinedLeftPoint[];
  /** Words under the first bar, such as `30 days ago` or `13 weeks ago`. */
  startLabel: string;
  /** Words under the last bar. Defaults to `today`. */
  endLabel?: string;
  /**
   * Days or weeks in the period. Set it when `points` holds only the days with changes: each bar
   * then sits at its `slot`, and days with no changes stay empty instead of the bars stretching.
   */
  slots?: number;
};

const height = 120;
const middle = 74;

/**
 * Sites that joined (accent, above the line) and left (neutral, below) per day or week, with a
 * 30 days / 90 days switch and a legend of totals and the net change (mockup joined and left).
 * Hover, tap, or the arrow keys show one bar pair. The switch hides when there is one period.
 */
export function JoinedLeftBars({ caption, periods }: { caption: string; periods: readonly JoinedLeftPeriod[] }) {
  const [key, setKey] = useState(periods[0]?.key ?? "");
  const [active, setActive] = useState(-1);
  const { measured, ref, width } = useChartWidth(560);
  const period = periods.find((item) => item.key === key) ?? periods[0];
  if (!period) return null;

  const { points } = period;
  const count = points.length;
  const slotted = Boolean(period.slots) && points.every((point) => point.slot !== undefined);
  const barWidth = width / Math.max(1, slotted ? period.slots! : count);
  const slotOf = (index: number) => (slotted ? points[index].slot! : index);
  // With slots, a pointer over an empty day reads the nearest day with changes.
  const indexAt = (px: number) => {
    const slot = Math.floor(px / barWidth);
    if (!slotted) return slot;
    let best = 0;
    points.forEach((point, index) => { if (Math.abs(point.slot! - slot) < Math.abs(points[best].slot! - slot)) best = index; });
    return best;
  };
  const topMax = Math.max(1, ...points.map((point) => point.joined));
  const bottomMax = Math.max(1, ...points.map((point) => point.left));
  const scale = Math.min((middle - 4) / topMax, (height - 16 - middle - 2) / bottomMax);
  const joined = points.reduce((sum, point) => sum + point.joined, 0);
  const left = points.reduce((sum, point) => sum + point.left, 0);

  return (
    <>
      {periods.length > 1 ? (
        <div aria-label="Period" className={styles.seg} role="group">
          {periods.map((item) => (
            <button aria-pressed={item.key === period.key} key={item.key} onClick={() => setKey(item.key)} type="button">{item.label}</button>
          ))}
        </div>
      ) : null}
      <InteractiveChart
        count={count}
        indexAt={indexAt}
        label={`${caption}, ${period.label}`}
        measureRef={ref}
        onActive={setActive}
        pointAt={(index) => ({
          x: slotOf(index) * barWidth + barWidth / 2,
          y: middle - points[index].joined * scale,
          tip: <>{points[index].label} · <b>{formatNumber(points[index].joined)}</b> joined · <b>{formatNumber(points[index].left)}</b> left</>,
        })}
        width={width}
      >
        <svg aria-hidden="true" className={active >= 0 ? styles.hovering : undefined} {...svgSize(width, height, measured)}>
          {points.map((point, index) => {
            const x = slotOf(index) * barWidth + 1;
            const w = Math.max(barWidth - 2, 1);
            const on = index === active || undefined;
            return (
              <g key={index}>
                <rect data-i={index} data-on={on} height={point.joined * scale} rx={1} style={{ fill: "var(--viz-ac)" }} width={w} x={x} y={middle - point.joined * scale} />
                <rect data-i={index} data-on={on} height={point.left * scale} rx={1} style={{ fill: "var(--viz-n1)" }} width={w} x={x} y={middle + 2} />
              </g>
            );
          })}
          <line style={{ stroke: "var(--color-border-strong)" }} x1={0} x2={width} y1={middle + 1} y2={middle + 1} />
          <text className={styles.tMuted} x={0} y={height - 2}>{period.startLabel}</text>
          <text className={styles.tMuted} textAnchor="end" x={width} y={height - 2}>{period.endLabel ?? "today"}</text>
        </svg>
      </InteractiveChart>
      <VizLegend items={[
        { label: "joined", tone: "ac", value: formatNumber(joined) },
        { label: "left", tone: "n1", value: formatNumber(left) },
        { label: "net", value: formatSigned(joined - left) },
      ]} />
      <VizDataTable caption={`${caption}, ${period.label}`} head={["period", "joined", "left"]} rows={points.map((point) => [point.label, point.joined, point.left])} />
    </>
  );
}

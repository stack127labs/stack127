"use client";

import { MeasuredChart, svgSize, useChartWidth } from "./chart-frame";
import { niceScale } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type DotRow = { label: string; shortLabel?: string; value: number };

const labelWidth = 112;
const rowHeight = 24;

/**
 * One dot per row on a shared scale from zero, with a stem and the value beside it (mockup median
 * domain age). The first row's dot is accent, so pass the leader first. `unit` follows each value.
 */
export function DotPlot({ caption, rows, unit = "" }: { caption: string; rows: readonly DotRow[]; unit?: string }) {
  const { measured, ref, width } = useChartWidth(360);
  const { high, ticks } = niceScale(rows.map((row) => row.value), 3, true);
  const x = (value: number) => labelWidth + (value / high) * (width - labelWidth - 40);
  const height = rows.length * rowHeight + 20;
  const suffix = unit ? ` ${unit}` : "";
  return (
    <>
      <MeasuredChart measureRef={ref}>
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          {rows.map((row, index) => {
            const y = index * rowHeight + 12;
            return (
              <g key={row.label}>
                <text className={styles.tInk} x={0} y={y + 4}>{row.shortLabel ?? row.label}</text>
                <line style={{ stroke: "var(--color-border-strong)" }} x1={labelWidth} x2={x(row.value)} y1={y} y2={y} />
                <circle cx={x(row.value)} cy={y} r={5} style={{ fill: index === 0 ? "var(--viz-ac)" : "var(--viz-n1)" }} />
                <text className={styles.tMuted} x={x(row.value) + 9} y={y + 4}>{row.value}{suffix}</text>
              </g>
            );
          })}
          {ticks.map((tick) => <text className={styles.tMuted} key={tick} textAnchor="middle" x={x(tick)} y={rows.length * rowHeight + 18}>{tick}</text>)}
        </svg>
      </MeasuredChart>
      <VizDataTable caption={caption} head={["name", "value"]} rows={rows.map((row) => [row.label, `${row.value}${suffix}`])} />
    </>
  );
}

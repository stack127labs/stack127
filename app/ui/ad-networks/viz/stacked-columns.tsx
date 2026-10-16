"use client";

import { useState } from "react";
import { InteractiveChart, svgSize, useChartWidth } from "./chart-frame";
import { formatNumber } from "./format";
import { VizDataTable, VizLegend } from "./parts";
import styles from "./viz.module.css";

export type StackedColumn = {
  /** Such as `Week of Oct 5`. */
  label: string;
  total: number;
  /** The accent part of the total, drawn at the bottom. */
  part: number;
};

const height = 150;
const bottom = 20;
const top = 8;

/**
 * Columns over time, each split into an accent part at the bottom and the rest above it (mockup
 * new sites per week). Hover, tap, or the arrow keys show one column's numbers.
 */
export function StackedColumns({ caption, columns, endLabel, partLabel, restLabel, startLabel, totalLabel = "new" }: {
  caption: string;
  columns: readonly StackedColumn[];
  /** Legend and note words for the accent part, such as `from the checker`. */
  partLabel: string;
  /** Legend words for the rest, such as `found by our scans`. */
  restLabel: string;
  /** Note word after the total, such as `new`. */
  totalLabel?: string;
  startLabel: string;
  endLabel: string;
}) {
  const { measured, ref, width } = useChartWidth(560);
  const [active, setActive] = useState(-1);
  const count = columns.length;
  const barWidth = width / Math.max(1, count);
  const scale = (height - bottom - top) / Math.max(1, ...columns.map((column) => column.total));
  return (
    <>
      <InteractiveChart
        count={count}
        indexAt={(px) => Math.floor(px / barWidth)}
        label={caption}
        measureRef={ref}
        onActive={setActive}
        pointAt={(index) => ({
          x: index * barWidth + barWidth / 2,
          y: height - bottom - columns[index].total * scale - 4,
          tip: <>{columns[index].label} · <b>{formatNumber(columns[index].total)}</b> {totalLabel} · <b>{formatNumber(columns[index].part)}</b> {partLabel}</>,
        })}
        width={width}
      >
        <svg aria-hidden="true" className={active >= 0 ? styles.hovering : undefined} {...svgSize(width, height, measured)}>
          {columns.map((column, index) => {
            const x = index * barWidth + 2;
            const w = Math.max(barWidth - 4, 1);
            const on = index === active || undefined;
            return (
              <g key={index}>
                <rect data-i={index} data-on={on} height={Math.max(0, column.total - column.part) * scale} rx={1} style={{ fill: "var(--viz-n2)" }} width={w} x={x} y={height - bottom - column.total * scale} />
                <rect data-i={index} data-on={on} height={column.part * scale} rx={1} style={{ fill: "var(--viz-ac)" }} width={w} x={x} y={height - bottom - column.part * scale} />
              </g>
            );
          })}
          <line style={{ stroke: "var(--color-border-strong)" }} x1={0} x2={width} y1={height - bottom} y2={height - bottom} />
          <text className={styles.tMuted} x={0} y={height - 4}>{startLabel}</text>
          <text className={styles.tMuted} textAnchor="end" x={width} y={height - 4}>{endLabel}</text>
        </svg>
      </InteractiveChart>
      <VizLegend items={[{ label: restLabel, tone: "n2" }, { label: partLabel, tone: "ac" }]} />
      <VizDataTable caption={caption} head={["period", totalLabel, partLabel]} rows={columns.map((column) => [column.label, formatNumber(column.total), formatNumber(column.part)])} />
    </>
  );
}

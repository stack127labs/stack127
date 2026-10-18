"use client";

import { MeasuredChart, svgSize, useChartWidth } from "./chart-frame";
import { formatSigned } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type DivergingRow = { label: string; shortLabel?: string; value: number };

const labelWidth = 112;
const rowHeight = 24;

/**
 * Gains right of a center line in accent, losses left in neutral, with the signed number at the
 * bar end (mockup net change, last 90 days). Pass rows in the order to show, usually biggest gain
 * first.
 */
export function DivergingBars({ caption, rows }: { caption: string; rows: readonly DivergingRow[] }) {
  const { measured, ref, width } = useChartWidth(560);
  const gain = Math.max(1, ...rows.map((row) => row.value));
  const loss = Math.max(1, ...rows.map((row) => -row.value));
  const middle = labelWidth + (width - labelWidth) * (gain >= loss * 2 ? 0.4 : gain * 2 <= loss ? 0.6 : 0.5);
  const scale = Math.max(0.0001, Math.min((width - middle - 44) / gain, (middle - labelWidth - 40) / loss));
  const height = rows.length * rowHeight + 4;
  return (
    <>
      <MeasuredChart measureRef={ref}>
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          <line style={{ stroke: "var(--color-border-strong)" }} x1={middle} x2={middle} y1={0} y2={rows.length * rowHeight} />
          {rows.map((row, index) => {
            const y = index * rowHeight;
            const w = Math.abs(row.value) * scale;
            const up = row.value >= 0;
            return (
              <g key={row.label}>
                <text className={styles.tInk} x={0} y={y + 15}>{row.shortLabel ?? row.label}</text>
                <rect height={13} rx={1} style={{ fill: up ? "var(--viz-ac)" : "var(--viz-n1)" }} width={Math.max(w, 1.5)} x={up ? middle : middle - w} y={y + 5} />
                <text className={styles.tMuted} textAnchor={up ? "start" : "end"} x={up ? middle + w + 5 : middle - w - 5} y={y + 15}>{formatSigned(row.value)}</text>
              </g>
            );
          })}
        </svg>
      </MeasuredChart>
      <VizDataTable caption={caption} head={["name", "change"]} rows={rows.map((row) => [row.label, formatSigned(row.value)])} />
    </>
  );
}

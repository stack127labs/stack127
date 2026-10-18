"use client";

import { InteractiveChart, svgSize, useChartWidth } from "./chart-frame";
import { formatCompact, formatNumber, lineScale } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type AreaLinePoint = {
  /** Short axis label, such as `Nov`. */
  label: string;
  /** Full label in the hover note and data table, such as `Nov 2025`. */
  fullLabel: string;
  value: number;
};

const height = 170;
const left = 44;
const bottom = 22;
const top = 8;
const right = 10;

/**
 * One count over time as a filled line, ending in a dot (mockup sites over time). Hover, tap, or
 * the arrow keys show the exact count and the change from the point before. `unit` follows the
 * count in the note, such as `sites`.
 */
export function AreaLine({ caption, points, unit = "sites" }: { caption: string; points: readonly AreaLinePoint[]; unit?: string }) {
  const { measured, ref, width } = useChartWidth(640);
  const count = points.length;
  const { high, low, ticks } = lineScale(points.map((point) => point.value), 3);
  const plotWidth = Math.max(1, width - left - right);
  const x = (index: number) => (count > 1 ? left + (index * plotWidth) / (count - 1) : left + plotWidth / 2);
  const y = (value: number) => top + (1 - (value - low) / (high - low || 1)) * (height - top - bottom);
  const path = points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`).join(" ");
  const step = Math.max(1, Math.ceil((count * 40) / plotWidth));
  const last = points[count - 1];

  return (
    <>
      <InteractiveChart
        count={count}
        guide={[top, height - bottom]}
        indexAt={(px) => (count > 1 ? Math.round((px - left) / (plotWidth / (count - 1))) : 0)}
        label={caption}
        measureRef={ref}
        pointAt={(index) => {
          const point = points[index];
          const change = index ? point.value - points[index - 1].value : null;
          return {
            x: x(index),
            y: y(point.value),
            dot: true,
            tip: (
              <>
                {point.fullLabel} · <b>{formatNumber(point.value)}</b> {unit}
                {change === null ? null : <> · <span className={change >= 0 ? styles.up : undefined}>{change >= 0 ? "+" : "−"}{formatNumber(Math.abs(change))}</span></>}
              </>
            ),
          };
        }}
        width={width}
      >
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line strokeDasharray="2 4" style={{ stroke: "var(--color-border)" }} x1={left} x2={width} y1={y(tick)} y2={y(tick)} />
              <text className={styles.tMuted} x={0} y={y(tick) + 4}>{formatCompact(tick)}</text>
            </g>
          ))}
          {count > 1 ? <path d={`${path} L${x(count - 1)} ${height - bottom} L${x(0)} ${height - bottom}Z`} opacity={0.45} style={{ fill: "var(--viz-ac3)" }} /> : null}
          {count > 1 ? <path d={path} fill="none" strokeWidth={2} style={{ stroke: "var(--viz-ac)" }} /> : null}
          {last ? <circle cx={x(count - 1)} cy={y(last.value)} r={4} style={{ fill: "var(--viz-ac)" }} /> : null}
          <line style={{ stroke: "var(--color-border-strong)" }} x1={left} x2={width} y1={height - bottom} y2={height - bottom} />
          {points.map((point, index) => (index % step === 0 || index === count - 1) && !(index !== count - 1 && count - 1 - index < step) ? (
            <text className={styles.tMuted} key={index} textAnchor={count === 1 ? "middle" : index === count - 1 ? "end" : index === 0 ? "start" : "middle"} x={x(index)} y={height - 5}>{point.label}</text>
          ) : null)}
        </svg>
      </InteractiveChart>
      <VizDataTable caption={caption} head={["date", unit]} rows={points.map((point) => [point.fullLabel, formatNumber(point.value)])} />
    </>
  );
}

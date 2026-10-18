"use client";

import { InteractiveChart, svgSize, useChartWidth } from "./chart-frame";
import { formatCompact, formatNumber, lineScale, toneColor, type VizTone } from "./format";
import { VizDataTable, VizLegend } from "./parts";
import styles from "./viz.module.css";

export type LineSeries = {
  label: string;
  /** Shorter name for the line-end label, such as `AdSense`. */
  shortLabel?: string;
  /** One value per point, in the order of `points`. */
  values: readonly number[];
  tone: VizTone;
  /** Dashed line, to tell two lines of the same tone apart. */
  dashed?: boolean;
};

const height = 220;
const left = 40;
const bottom = 20;
const top = 8;

/**
 * A few series over time, with names at the line ends on wide screens and a legend below (mockup
 * share over time). Hover, tap, or the arrow keys list every series' value at that point, biggest
 * first.
 */
export function MultiLine({ caption, points, series }: {
  caption: string;
  /** The x axis: short label such as `Nov`, and full label such as `Nov 2025`. */
  points: readonly { label: string; fullLabel: string }[];
  series: readonly LineSeries[];
}) {
  const { measured, ref, width } = useChartWidth(640);
  const right = width < 480 ? 8 : 92;
  const count = points.length;
  const { high, low, ticks } = lineScale(series.flatMap((item) => item.values), 4);
  const plotWidth = Math.max(1, width - left - right);
  const x = (index: number) => (count > 1 ? left + (index * plotWidth) / (count - 1) : left + plotWidth / 2);
  const y = (value: number) => top + (1 - (value - low) / (high - low || 1)) * (height - top - bottom);
  const step = Math.max(1, Math.ceil((count * 40) / plotWidth));
  const ends = series
    .map((item) => ({ name: item.shortLabel ?? item.label, y: y(item.values[count - 1] ?? low) + 4 }))
    .sort((a, b) => a.y - b.y);
  for (let index = 1; index < ends.length; index += 1) ends[index].y = Math.max(ends[index].y, ends[index - 1].y + 14);

  return (
    <>
      <InteractiveChart
        count={count}
        guide={[top, height - bottom]}
        indexAt={(px) => (count > 1 ? Math.round((px - left) / (plotWidth / (count - 1))) : 0)}
        label={caption}
        measureRef={ref}
        pointAt={(index) => ({
          x: x(index),
          y: top,
          tip: (
            <>
              <b>{points[index].fullLabel}</b>
              {[...series].sort((a, b) => (b.values[index] ?? 0) - (a.values[index] ?? 0)).map((item) => (
                <div className={styles.tipRow} key={item.label}><span>{item.label}</span><b>{formatNumber(item.values[index] ?? 0)}</b></div>
              ))}
            </>
          ),
        })}
        width={width}
      >
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line strokeDasharray="2 4" style={{ stroke: "var(--color-border)" }} x1={left} x2={width - right + 4} y1={y(tick)} y2={y(tick)} />
              <text className={styles.tMuted} x={0} y={y(tick) + 4}>{formatCompact(tick)}</text>
            </g>
          ))}
          {series.map((item) => (
            <path
              d={item.values.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(" ")}
              fill="none"
              key={item.label}
              strokeDasharray={item.dashed ? "5 4" : undefined}
              strokeWidth={2}
              style={{ stroke: toneColor(item.tone) }}
            />
          ))}
          {right > 20 ? ends.map((end) => <text className={styles.tInk} key={end.name} x={x(count - 1) + 8} y={end.y}>{end.name}</text>) : null}
          {points.map((point, index) => (index % step === 0 || index === count - 1) && !(index !== count - 1 && count - 1 - index < step) ? (
            <text className={styles.tMuted} key={index} textAnchor={index === 0 ? "start" : index === count - 1 ? "end" : "middle"} x={x(index)} y={height - 4}>{point.label}</text>
          ) : null)}
        </svg>
      </InteractiveChart>
      <VizLegend items={series.map((item) => ({ label: item.label, tone: item.tone, dashed: item.dashed }))} />
      <VizDataTable
        caption={caption}
        head={["date", ...series.map((item) => item.label)]}
        rows={points.map((point, index) => [point.fullLabel, ...series.map((item) => formatNumber(item.values[index] ?? 0))])}
      />
    </>
  );
}

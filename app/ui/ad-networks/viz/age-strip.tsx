"use client";

import { MeasuredChart, svgSize, useChartWidth } from "./chart-frame";
import { formatNumber } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type AgeBin = {
  /** First registration year in the bin. */
  year: number;
  count: number;
};

export type AgeEnd = { year: number; domain?: string };

const base = 66;

/**
 * When the domains were registered: a small histogram over a year line, the middle half as a
 * band, the median as an accent line, and the oldest and newest domains at the ends (mockup
 * domain age). Bins are evenly spaced, `binYears` apart.
 */
export function AgeStrip({ bins, binYears, caption, median, middleHalf, newest, oldest }: {
  bins: readonly AgeBin[];
  /** Years per bin. Defaults to the gap between the first two bins, or 1. */
  binYears?: number;
  caption: string;
  /** Median registration year. */
  median: number;
  /** The 25th and 75th percentile years, drawn as a band. */
  middleHalf?: readonly [number, number];
  newest: AgeEnd;
  oldest: AgeEnd;
}) {
  const { measured, ref, width } = useChartWidth(720);
  const first = oldest.year - 1;
  const last = Math.max(newest.year + 1, first + 2);
  const x = (year: number) => ((year - first) / (last - first)) * (width - 8) + 4;
  const top = Math.max(1, ...bins.map((bin) => bin.count));
  const years = binYears ?? (bins.length > 1 ? Math.abs(bins[1].year - bins[0].year) : 1);
  const barWidth = ((width - 8) / (last - first)) * years;
  const tickStep = width < 420 ? 10 : 5;
  const ticks: number[] = [];
  for (let tick = Math.ceil((first + 1) / tickStep) * tickStep; tick < last; tick += tickStep) ticks.push(tick);
  const two = width < 480;
  const height = two ? 130 : 112;
  const medianX = x(median);
  const medianLeft = medianX + 110 > width;

  return (
    <>
      <MeasuredChart measureRef={ref}>
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          {bins.map((bin) => {
            const h = (bin.count / top) * 46;
            return <rect height={h} key={bin.year} rx={1} style={{ fill: "var(--viz-n2)" }} width={Math.max(barWidth - 2, 1)} x={x(bin.year)} y={base - 10 - h} />;
          })}
          {middleHalf ? <rect height={12} rx={1} style={{ fill: "var(--viz-ac3)" }} width={Math.max(x(middleHalf[1]) - x(middleHalf[0]), 2)} x={x(middleHalf[0])} y={base - 6} /> : null}
          <line strokeWidth={2} style={{ stroke: "var(--color-border-strong)" }} x1={x(oldest.year)} x2={x(newest.year)} y1={base} y2={base} />
          <line strokeWidth={2} style={{ stroke: "var(--viz-ac)" }} x1={medianX} x2={medianX} y1={base - 62} y2={base + 9} />
          <text className={styles.tAccent} textAnchor={medianLeft ? "end" : "start"} x={medianLeft ? medianX - 6 : medianX + 6} y={base - 52}>median {median}</text>
          <circle className={styles.tInk} cx={x(oldest.year)} cy={base} r={4.5} />
          <circle className={styles.tInk} cx={x(newest.year)} cy={base} r={4.5} />
          {ticks.map((tick) => <text className={styles.tMuted} key={tick} textAnchor="middle" x={x(tick)} y={base + 24}>{tick}</text>)}
          <text className={styles.tInk} x={0} y={base + 44}>oldest {oldest.year}{oldest.domain ? <tspan className={styles.tMuted}> {oldest.domain}</tspan> : null}</text>
          <text className={styles.tInk} textAnchor={two ? "start" : "end"} x={two ? 0 : width} y={base + (two ? 62 : 44)}>newest {newest.year}{newest.domain ? <tspan className={styles.tMuted}> {newest.domain}</tspan> : null}</text>
        </svg>
      </MeasuredChart>
      <VizDataTable caption={`${caption}. Median ${median}, oldest ${oldest.year}, newest ${newest.year}.`} head={["registered", "sites"]} rows={bins.map((bin) => [years > 1 ? `${bin.year} to ${bin.year + years - 1}` : String(bin.year), formatNumber(bin.count)])} />
    </>
  );
}

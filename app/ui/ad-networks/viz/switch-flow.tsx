"use client";

import { MeasuredChart, svgSize, useChartWidth } from "./chart-frame";
import { formatNumber } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type FlowSide = {
  label: string;
  /** Shorter name for phones, such as `AdSense` for `Google AdSense`. */
  shortLabel?: string;
  count: number;
};

const top = 22;
const gap = 8;
const minRow = 16;

/**
 * Sites that moved to this network (left, accent) and away from it (right, neutral), with the
 * network in the middle (mockup switches flow). Band widths follow the counts. Pass each side
 * largest first. An empty side draws nothing.
 */
export function SwitchFlow({ cameFrom, caption, center, wentTo }: {
  caption: string;
  /** The network the page is about. */
  center: string;
  cameFrom: readonly FlowSide[];
  wentTo: readonly FlowSide[];
}) {
  const { measured, ref, width } = useChartWidth(520);
  const narrow = width < 480;
  const sideWidth = narrow ? width * 0.34 : Math.min(150, width * 0.32);
  const x1 = sideWidth;
  const x2 = width - sideWidth;
  const cx = width / 2;
  const inTotal = cameFrom.reduce((sum, item) => sum + item.count, 0);
  const outTotal = wentTo.reduce((sum, item) => sum + item.count, 0);
  const k = 130 / Math.max(1, inTotal, outTotal);
  const place = (rows: readonly FlowSide[]) => {
    let y = top;
    return rows.map((row) => {
      const h = row.count * k;
      const placed = { name: narrow && row.shortLabel ? row.shortLabel : row.label, count: row.count, y, h };
      y += Math.max(h, minRow) + gap;
      return placed;
    });
  };
  const lefts = place(cameFrom);
  const rights = place(wentTo);
  const link = (ax: number, ay: number, bx: number, by: number, h: number) => {
    const mx = (ax + bx) / 2;
    return `M${ax} ${ay}C${mx} ${ay},${mx} ${by},${bx} ${by}L${bx} ${by + h}C${mx} ${by + h},${mx} ${ay + h},${ax} ${ay + h}Z`;
  };
  const end = (rows: typeof lefts) => (rows.length ? rows[rows.length - 1].y + Math.max(rows[rows.length - 1].h, minRow) : top);
  const centerHeight = Math.max(inTotal, outTotal) * k;
  const height = Math.max(end(lefts), end(rights), top + centerHeight) + 4;
  let into = top;
  let out = top;

  return (
    <>
      <MeasuredChart measureRef={ref}>
        <svg aria-hidden="true" {...svgSize(width, height, measured)}>
          <text className={styles.tMuted} x={0} y={12}>came from</text>
          <text className={styles.tInk} textAnchor="middle" x={cx} y={12}>{center}</text>
          <text className={styles.tMuted} textAnchor="end" x={width} y={12}>went to</text>
          {lefts.map((row) => {
            const band = <path d={link(x1, row.y, cx - 5, into, row.h)} style={{ fill: "var(--viz-ac3)" }} />;
            into += row.h;
            return (
              <g key={`in-${row.name}`}>
                {band}
                <rect height={Math.max(row.h, 2)} style={{ fill: "var(--viz-ac)" }} width={4} x={x1 - 4} y={row.y} />
                <text className={styles.tInk} textAnchor="end" x={x1 - 10} y={row.y + Math.max(row.h, minRow) / 2 + 4}>{row.name} <tspan className={styles.tMuted}>{formatNumber(row.count)}</tspan></text>
              </g>
            );
          })}
          {rights.map((row) => {
            const band = <path d={link(cx + 5, out, x2, row.y, row.h)} style={{ fill: "var(--viz-n3)" }} />;
            out += row.h;
            return (
              <g key={`out-${row.name}`}>
                {band}
                <rect height={Math.max(row.h, 2)} style={{ fill: "var(--viz-n1)" }} width={4} x={x2} y={row.y} />
                <text className={styles.tInk} x={x2 + 10} y={row.y + Math.max(row.h, minRow) / 2 + 4}>{row.name} <tspan className={styles.tMuted}>{formatNumber(row.count)}</tspan></text>
              </g>
            );
          })}
          <rect height={Math.max(centerHeight, 2)} style={{ fill: "var(--viz-n1)" }} width={10} x={cx - 5} y={top} />
        </svg>
      </MeasuredChart>
      <VizDataTable
        caption={caption}
        head={["network", "direction", "sites"]}
        rows={[
          ...cameFrom.map((row) => [row.label, `to ${center}`, formatNumber(row.count)]),
          ...wentTo.map((row) => [row.label, `from ${center}`, formatNumber(row.count)]),
        ]}
      />
    </>
  );
}

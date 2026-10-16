"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useChartWidth } from "./chart-frame";
import { clamp, formatNumber, onAccent, toneColor, type VizTone } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type TreemapItem = { label: string; value: number; href?: string };

type Cell = TreemapItem & { index: number; x: number; y: number; w: number; h: number };

/** Squarified layout: rows of blocks as close to square as the space allows. Items largest first. */
function squarify(items: readonly TreemapItem[], width: number, height: number): Cell[] {
  const sum = items.reduce((total, item) => total + Math.max(0, item.value), 0) || 1;
  const out: Cell[] = [];
  let rect = { x: 0, y: 0, w: width, h: height };
  let row: (TreemapItem & { index: number; area: number })[] = [];
  const areas = items.map((item, index) => ({ ...item, index, area: (Math.max(0, item.value) / sum) * width * height }));
  const worst = (cells: typeof row, length: number) => {
    const total = cells.reduce((acc, cell) => acc + cell.area, 0);
    const most = Math.max(...cells.map((cell) => cell.area));
    const least = Math.min(...cells.map((cell) => cell.area));
    return Math.max((length * length * most) / (total * total), (total * total) / (length * length * least));
  };
  const place = (cells: typeof row) => {
    const total = cells.reduce((acc, cell) => acc + cell.area, 0);
    if (rect.w >= rect.h) {
      const cw = total / rect.h;
      let y = rect.y;
      cells.forEach((cell) => { const ch = cell.area / cw; out.push({ ...cell, x: rect.x, y, w: cw, h: ch }); y += ch; });
      rect = { x: rect.x + cw, y: rect.y, w: rect.w - cw, h: rect.h };
    } else {
      const rh = total / rect.w;
      let x = rect.x;
      cells.forEach((cell) => { const cw = cell.area / rh; out.push({ ...cell, x, y: rect.y, w: cw, h: rh }); x += cw; });
      rect = { x: rect.x, y: rect.y + rh, w: rect.w, h: rect.h - rh };
    }
  };
  let next = 0;
  while (next < areas.length) {
    const length = Math.min(rect.w, rect.h);
    const item = areas[next];
    if (!row.length || worst([...row, item], length) <= worst(row, length)) {
      row.push(item);
      next += 1;
    } else {
      place(row);
      row = [];
    }
  }
  if (row.length) place(row);
  return out;
}

const shade = (index: number): VizTone => (index < 1 ? "ac" : index < 3 ? "ac2" : index < 6 ? "ac3" : index < 10 ? "n1" : index < 15 ? "n2" : "n3");

/**
 * Parts of a whole as blocks sized by value, the biggest in accent (mockup niche sizes). Each block
 * links to its page when it has an `href`. Hover or focus shows the count and share of `total`.
 * Pass items largest first.
 */
export function Treemap({ caption, items, total, unit = "sites" }: {
  caption: string;
  items: readonly TreemapItem[];
  /** The whole the shares are of. Defaults to the sum of the items. */
  total?: number;
  unit?: string;
}) {
  const { measured, ref, width } = useChartWidth(1000);
  const [tip, setTip] = useState<{ cell: Cell; text: ReactNode } | null>(null);
  const height = width < 640 ? 300 : 340;
  const whole = total ?? (items.reduce((sum, item) => sum + item.value, 0) || 1);
  const cells = squarify(items, width, height);
  // Before the box is measured, place blocks by percent so the server HTML fits any width.
  const box = (cell: Cell) => measured
    ? { left: cell.x, top: cell.y, width: Math.max(cell.w - 2, 1), height: Math.max(cell.h - 2, 1) }
    : { left: `${(cell.x / width) * 100}%`, top: cell.y, width: `calc(${(cell.w / width) * 100}% - 2px)`, height: Math.max(cell.h - 2, 1) };
  const text = (cell: Cell) => <>{cell.label} · <b>{formatNumber(cell.value)}</b> {unit} · {((cell.value / whole) * 100).toFixed(1)}%</>;

  return (
    <>
      <div className={`${styles.treemap} ${styles.tokens}`} onMouseLeave={() => setTip(null)} ref={ref} style={{ height }}>
        {cells.map((cell) => {
          const tone = shade(cell.index);
          const big = cell.w > 92 && cell.h > 46;
          const mid = cell.w > 58 && cell.h > 24;
          const props = {
            "aria-label": `${cell.label}, ${formatNumber(cell.value)} ${unit}`,
            className: styles.cell,
            "data-on-ac": onAccent(tone) || undefined,
            onBlur: () => setTip(null),
            onFocus: () => setTip({ cell, text: text(cell) }),
            onMouseEnter: () => setTip({ cell, text: text(cell) }),
            style: { ...box(cell), background: toneColor(tone) },
          };
          const inner = big ? <><span>{cell.label}</span><b>{formatNumber(cell.value)}</b></> : mid ? <span>{cell.label}</span> : null;
          return cell.href
            ? <Link href={cell.href} key={cell.label} prefetch={false} {...props}>{inner}</Link>
            : <span key={cell.label} role="img" tabIndex={0} {...props}>{inner}</span>;
        })}
        {tip ? (
          <div
            className={styles.tip}
            ref={(element) => {
              if (!element) return;
              const half = element.offsetWidth / 2;
              element.style.left = `${clamp(tip.cell.x + tip.cell.w / 2, half, Math.max(half, width - half))}px`;
            }}
            role="status"
            style={{ top: tip.cell.y + 6 }}
          >
            {tip.text}
          </div>
        ) : null}
      </div>
      <VizDataTable caption={caption} head={["name", unit]} rows={items.map((item) => [item.label, formatNumber(item.value)])} />
    </>
  );
}

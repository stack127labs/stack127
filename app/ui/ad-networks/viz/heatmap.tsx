"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import styles from "./viz.module.css";

export type HeatmapColumn = { key: string; label: string };
export type HeatmapRow = { label: string; href?: string; values: readonly (number | null)[] };

/**
 * A grid of rows by columns where darker accent cells mean bigger values (mockup niche by network
 * grid). Values are whole percents or counts, printed in each cell. Hovering a cell outlines its
 * row and column. The first column stays put while the grid scrolls sideways on phones.
 */
export function Heatmap({ caption, columns, corner, rows, unitNote }: {
  caption: string;
  columns: readonly HeatmapColumn[];
  /** Header of the row-name column, such as `niche`. */
  corner: string;
  rows: readonly HeatmapRow[];
  /** A short mono line under the grid, such as `Numbers are % of the niche's sites.` */
  unitNote?: string;
}) {
  const [cross, setCross] = useState<{ row: number; column: number } | null>(null);
  const top = Math.max(1, ...rows.flatMap((row) => row.values.map((value) => value ?? 0)));
  return (
    <>
      <div className={`${styles.heatScroll} ${styles.tokens}`}>
        <table className={styles.heat} onMouseLeave={() => setCross(null)}>
          <caption className={styles.srOnly}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{corner}</th>
              {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr data-x={cross?.row === rowIndex || undefined} key={row.label}>
                <th scope="row">{row.href ? <Link href={row.href} prefetch={false}>{row.label}</Link> : row.label}</th>
                {row.values.map((value, columnIndex) => {
                  const alpha = value === null ? 0 : 0.05 + 0.9 * (value / top);
                  return (
                    <td
                      data-hot={alpha >= 0.5 || undefined}
                      data-x={cross?.column === columnIndex || undefined}
                      key={columns[columnIndex]?.key ?? columnIndex}
                      onMouseEnter={() => setCross({ row: rowIndex, column: columnIndex })}
                      style={{ "--a": alpha.toFixed(2) } as CSSProperties}
                    >
                      {value ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {unitNote ? <p className={styles.heatUnit}>{unitNote}</p> : null}
    </>
  );
}

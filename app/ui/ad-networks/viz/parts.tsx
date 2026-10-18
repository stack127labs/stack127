import type { ReactNode } from "react";
import { DATA_TABLE_LIMIT, toneColor, type VizTone } from "./format";
import styles from "./viz.module.css";

/** Leave `tone` out for a plain entry with no swatch, such as a net total. */
export type LegendItem = { label: ReactNode; tone?: VizTone; value?: ReactNode; dashed?: boolean };

/** A row of swatches with names and optional bold values. `column` stacks them, as beside a donut. */
export function VizLegend({ column, items }: { column?: boolean; items: readonly LegendItem[] }) {
  return (
    <ul className={`${styles.legend} ${styles.tokens}`} data-column={column || undefined}>
      {items.map((item, index) => (
        <li key={index}>
          {item.tone ? <i aria-hidden="true" data-dashed={item.dashed || undefined} style={{ background: toneColor(item.tone) }} /> : null}
          {item.label}
          {item.value !== undefined ? <b>{item.value}</b> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * The exact numbers behind a chart, for screen readers. Left out when the chart has more than
 * 60 values, where the chart's label says what it shows instead.
 */
export function VizDataTable({ caption, head, rows }: {
  caption: string;
  head: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  const values = rows.length * Math.max(1, head.length - 1);
  if (!rows.length || values > DATA_TABLE_LIMIT) return null;
  return (
    <div className={styles.srOnly}>
      <table>
        <caption>{caption}</caption>
        <thead><tr>{head.map((cell, index) => <th key={index} scope="col">{cell}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) => column === 0 ? <th key={column} scope="row">{cell}</th> : <td key={column}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

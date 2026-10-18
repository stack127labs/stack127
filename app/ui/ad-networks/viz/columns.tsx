import { formatNumber, toneColor, type VizTone } from "./format";
import { VizDataTable } from "./parts";
import styles from "./viz.module.css";

export type ColumnItem = {
  label: string;
  value: number;
  /** The number above the column, such as `61%`. Defaults to the value. */
  display?: string;
  /** Defaults to the accent. Use `n2` for an "unknown" or "not ranked" group. */
  tone?: VizTone;
};

/**
 * One column per group with its value above and label below (mockup traffic, networks per site,
 * and file size charts). Drawn in HTML, so text keeps its size at every width with no script.
 */
export function ColumnChart({ caption, height = 170, items }: { caption: string; height?: number; items: readonly ColumnItem[] }) {
  const top = Math.max(1, ...items.map((item) => item.value));
  const plot = height - 22 - 18;
  return (
    <div className={`${styles.viz} ${styles.tokens}`}>
      <ul aria-hidden="true" className={styles.columns} style={{ height }}>
        {items.map((item) => (
          <li key={item.label}>
            <div className={styles.colPlot}>
              <span className={styles.colValue}>{item.display ?? formatNumber(item.value)}</span>
              <i style={{ background: toneColor(item.tone ?? "ac"), height: Math.max(2, (item.value / top) * plot) }} />
            </div>
            <span className={styles.colLabel}>{item.label}</span>
          </li>
        ))}
      </ul>
      <VizDataTable caption={caption} head={["group", "value"]} rows={items.map((item) => [item.label, item.display ?? formatNumber(item.value)])} />
    </div>
  );
}

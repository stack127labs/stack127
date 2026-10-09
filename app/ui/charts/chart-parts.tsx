import { chartTable, type UiChartSpec } from "./chart-option";
import styles from "./charts.module.css";

/** The title, and the caption under it. */
export function ChartHeading({ spec }: { spec: UiChartSpec }) {
  return (
    <figcaption className={styles.heading}>
      <span className={styles.title}>{spec.title}</span>
      {spec.caption ? <span className={styles.caption}>{spec.caption}</span> : null}
    </figcaption>
  );
}

/** A small chart's numbers for screen readers. Large charts get none; see chartTable. */
export function ChartDataTable({ spec }: { spec: UiChartSpec }) {
  const table = chartTable(spec);
  if (!table) return null;
  return (
    <table className={styles.hidden}>
      <caption>{spec.title}</caption>
      <thead>
        <tr>
          <th scope="col">{table.corner}</th>
          {table.columns.map((column, index) => <th key={index} scope="col">{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, index) => (
          <tr key={index}>
            <th scope="row">{row.label}</th>
            {row.cells.map((cell, column) => <td key={column}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

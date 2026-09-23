import { MediaFigure } from "./media-figure";
import styles from "./chart.module.css";

/**
 * Renders a generated clean chart inline. The svg string comes from the
 * generated .ts module next to the chart's .chart.json spec, so nothing is
 * fetched or drawn at runtime: it is bundled, server rendered, and cached
 * with the page. Marker art explains concepts; this states data.
 *
 * Rendering workflow: stack127_docs/design-system.md
 */
export function Chart({ svg, caption }: { svg: string; caption?: string }) {
  return <MediaFigure caption={caption} className={styles.chart} kind="diagram" svg={svg} />;
}

import { MediaFigure } from "./media-figure";
import styles from "./marker-art.module.css";

/**
 * Renders a generated marker art figure inline. The svg string comes from the
 * generated .ts module next to the figure's .spec.json, so nothing is fetched
 * or drawn at runtime: it is bundled, server rendered, and cached with the page.
 *
 * Workflow and style guide: version127_docs/marker-art.md
 */
export function MarkerArt({
  svg,
  caption,
}: {
  svg: string;
  caption?: string;
}) {
  return <MediaFigure caption={caption} className={styles.markerArt} kind="diagram" svg={svg} />;
}

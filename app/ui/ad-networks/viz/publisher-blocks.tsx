import { formatNumber, onAccent, toneColor, type VizTone } from "./format";
import styles from "./viz.module.css";

export type PublisherBlock = { label: string; count: number };

const tones: readonly VizTone[] = ["ac", "ac2", "ac3", "n2", "n3", "n3"];

/**
 * Companies by how many sites they run, as blocks sized by count (mockup biggest publishers). The two
 * biggest are tall columns; the rest stack in a third column, so five blocks read like the mockup.
 * Pass them largest first. `unit` names what is counted.
 */
export function PublisherBlocks({ height = 180, items, unit = "sites" }: { height?: number; items: readonly PublisherBlock[]; unit?: string }) {
  const block = (item: PublisherBlock, index: number, grow: number) => {
    const tone = tones[Math.min(index, tones.length - 1)];
    return (
      <div className={styles.block} data-on-ac={onAccent(tone) || undefined} key={item.label} style={{ background: toneColor(tone), flex: `${grow} 1 0` }}>
        <span>{item.label}</span>
        <b>{formatNumber(item.count)} {item.count === 1 ? unit.replace(/s$/, "") : unit}</b>
      </div>
    );
  };
  const rest = items.slice(2);
  return (
    <div className={`${styles.blocks} ${styles.tokens}`} style={{ height }}>
      {items.slice(0, 2).map((item, index) => block(item, index, item.count))}
      {rest.length ? (
        <div className={styles.blocksColumn} style={{ flex: `${rest.reduce((sum, item) => sum + item.count, 0)} 1 0` }}>
          {rest.map((item, index) => block(item, index + 2, item.count))}
        </div>
      ) : null}
    </div>
  );
}

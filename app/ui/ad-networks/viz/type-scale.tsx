import { formatShare } from "./format";
import styles from "./viz.module.css";

export type TypeScaleItem = { label: string; share: number };

/**
 * Labels sized by their share, the biggest in the accent color (mockup domain endings). Shares are
 * 0 to 1. The first item leads, so pass them largest first.
 */
export function TypeScale({ items }: { items: readonly TypeScaleItem[] }) {
  const top = Math.max(0.0001, ...items.map((item) => item.share));
  return (
    <p className={styles.typescale}>
      {items.map((item, index) => (
        <span className={index === 0 ? styles.lead : undefined} key={item.label} style={{ fontSize: `${Math.round(15 + 49 * (item.share / top))}px` }}>
          {item.label}<small>{formatShare(item.share)}</small>
        </span>
      ))}
    </p>
  );
}

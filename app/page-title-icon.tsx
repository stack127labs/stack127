import type { ReactNode } from "react";
import styles from "./page-title-icon.module.css";

/**
 * The page's identity icon rendered as a chip beside its h1 — the same icon
 * the sidebar uses for that page, so each page reads as its own crafted thing.
 * Decorative only: the chip is aria-hidden and scales with the heading.
 */
export function PageTitleIcon({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className={styles.chip}>
      {children}
    </span>
  );
}

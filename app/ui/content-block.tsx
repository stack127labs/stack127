import type { ReactNode } from "react";
import styles from "./content-block.module.css";

export function ContentBlock({ children, kind, title }: {
  children: ReactNode;
  kind: "formula" | "example";
  title?: string;
}) {
  return (
    <section aria-label={title || (kind === "formula" ? "Formula" : "Worked example")} className={styles.block}>
      <p className={styles.title}>{title || (kind === "formula" ? "Formula" : "Worked example")}</p>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

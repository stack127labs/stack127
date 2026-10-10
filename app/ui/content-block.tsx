import type { ReactNode } from "react";
import { FlaskConical, Sigma } from "lucide-react";
import styles from "./content-block.module.css";

const kinds = {
  example: { icon: FlaskConical, label: "Example" },
  formula: { icon: Sigma, label: "Formula" },
} as const;

/** A formula or worked example: a kind label, an optional title, then the body. */
export function ContentBlock({ children, kind, title }: {
  children: ReactNode;
  kind: "formula" | "example";
  title?: string;
}) {
  const { icon: Icon, label } = kinds[kind];
  return (
    <section aria-label={title ? `${label}: ${title}` : label} className={styles.block} data-kind={kind}>
      <header className={styles.header}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <p className={styles.kind}><Icon aria-hidden="true" size={14} strokeWidth={2.2} />{label}</p>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

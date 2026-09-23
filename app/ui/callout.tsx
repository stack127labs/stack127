import type { ReactNode } from "react";
import styles from "./callout.module.css";

export type CalloutTone = "note" | "warning" | "recommend";

export function Callout({ children, title, tone = "note" }: {
  children: ReactNode;
  title: string;
  tone?: CalloutTone;
}) {
  return (
    <aside aria-label={title} className={styles.callout} data-tone={tone}>
      <p className={styles.title}>{title}</p>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}

export function Note({ children, title = "Note" }: { children: ReactNode; title?: string }) {
  return <Callout title={title} tone="note">{children}</Callout>;
}

export function Warning({ children, title = "Warning" }: { children: ReactNode; title?: string }) {
  return <Callout title={title} tone="warning">{children}</Callout>;
}

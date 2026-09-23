import type { ReactNode } from "react";
import styles from "./state-panel.module.css";

export function StatePanel({ action, children, state = "empty", title, visual }: {
  action?: ReactNode;
  children?: ReactNode;
  state?: "empty" | "loading" | "error";
  title: string;
  visual?: ReactNode;
}) {
  return (
    <section aria-busy={state === "loading" || undefined} aria-label={title} className={styles.panel} data-state={state} role={state === "error" ? "alert" : state === "loading" ? "status" : undefined}>
      {visual}
      <h2>{title}</h2>
      {children ? <div className={styles.body}>{children}</div> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}

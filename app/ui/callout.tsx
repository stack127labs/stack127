import type { ReactNode } from "react";
import { Info, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react";
import styles from "./callout.module.css";

export type CalloutTone = "note" | "warning" | "recommend";

const toneIcons: Record<CalloutTone, LucideIcon> = {
  note: Info,
  recommend: Lightbulb,
  warning: TriangleAlert,
};

export function Callout({ children, title, tone = "note" }: {
  children: ReactNode;
  title: string;
  tone?: CalloutTone;
}) {
  const Icon = toneIcons[tone];
  return (
    <aside aria-label={title} className={styles.callout} data-tone={tone}>
      <Icon aria-hidden="true" className={styles.icon} size={18} strokeWidth={2.2} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <div className={styles.body}>{children}</div>
      </div>
    </aside>
  );
}

export function Note({ children, title = "Note" }: { children: ReactNode; title?: string }) {
  return <Callout title={title} tone="note">{children}</Callout>;
}

export function Warning({ children, title = "Warning" }: { children: ReactNode; title?: string }) {
  return <Callout title={title} tone="warning">{children}</Callout>;
}

export function Tip({ children, title = "Tip" }: { children: ReactNode; title?: string }) {
  return <Callout title={title} tone="recommend">{children}</Callout>;
}

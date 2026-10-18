import type { ReactNode } from "react";
import styles from "./section.module.css";

/**
 * A section heading with controls beside it, such as a search and sorts (mockup `.sec-head`).
 * The controls drop below the heading when there isn't room.
 */
export function SectionHead({ actions, id, title }: { actions?: ReactNode; id: string; title: ReactNode }) {
  return (
    <div className={styles.head}>
      <h2 id={id}>{title}</h2>
      {actions}
    </div>
  );
}

/**
 * One section of an ad networks page (mockup `.nsec`): an h2 asked as a question, optional controls
 * beside it, a one-line muted description, then the content. Sections that follow each other are
 * split by a hairline.
 */
export function AdSection({ actions, children, description, id, title }: {
  actions?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  id: string;
  title: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={styles.section}>
      {actions ? <SectionHead actions={actions} id={id} title={title} /> : <h2 className={styles.title} id={id}>{title}</h2>}
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </section>
  );
}

/** A small muted line under a block, such as where dates come from (mockup `.note`). */
export function SectionNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}

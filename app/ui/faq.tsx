import type { ReactNode } from "react";
import styles from "./faq.module.css";

/** Questions and answers, always open, separated by rules. */
export function Faq({ items, title = "Common questions" }: {
  items: Array<{ question: string; answer: ReactNode }>;
  title?: string;
}) {
  return (
    <section className={styles.faq}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.list}>
        {items.map((item) => <div className={styles.item} key={item.question}>
          <h3 className={styles.question}>{item.question}</h3>
          <div className={styles.answer}>{item.answer}</div>
        </div>)}
      </div>
    </section>
  );
}

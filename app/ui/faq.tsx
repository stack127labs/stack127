import type { ReactNode } from "react";
import styles from "./faq.module.css";

export function Faq({ items, title = "Common questions" }: {
  items: Array<{ question: string; answer: ReactNode }>;
  title?: string;
}) {
  return (
    <section className={styles.faq}>
      <h2>{title}</h2>
      {items.map((item) => <div className={styles.item} key={item.question}>
        <h3>{item.question}</h3>
        <div>{item.answer}</div>
      </div>)}
    </section>
  );
}

import type { CSSProperties, ReactNode } from "react";
import styles from "./details.module.css";

export type KeyNumber = {
  label: string;
  value: ReactNode;
  /** A short caveat under the label, such as `in older public terms`. */
  note?: ReactNode;
};

/** Up to three headline facts in one bordered row, value above label (mockup `dl.key-nums`). */
export function KeyNumbers({ items }: { items: readonly KeyNumber[] }) {
  return (
    <dl className={styles.keyNumbers} style={{ "--count": Math.max(1, items.length) } as CSSProperties}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}{item.note ? <small>{item.note}</small> : null}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type Fact = {
  label: string;
  value: ReactNode;
  /** A small muted line under the value, such as `Measured in Google Analytics`. */
  note?: ReactNode;
};

/** Label and value rows split by hairlines, with an optional small note (mockup `dl.facts`). */
export function FactsList({ items }: { items: readonly Fact[] }) {
  return (
    <dl className={styles.facts}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}{item.note ? <small>{item.note}</small> : null}</dd>
        </div>
      ))}
    </dl>
  );
}

/** For a fact the network doesn't publish. Research says so; it isn't missing data. */
export function NotPublic({ label = "Not public" }: { label?: string }) {
  return <span className={styles.notPublic}>{label}</span>;
}

/**
 * The network details area (mockup `.details-body`): the facts column with its h2, key numbers,
 * tabs, and sources, and the guide prose beside it. On wide screens the prose sits on the left
 * behind a hairline; below 1200px it follows the facts.
 */
export function DetailsLayout({ children, prose, title, titleId }: {
  /** Key numbers, tabs, and the sources line. */
  children: ReactNode;
  /** The Q&A prose, as h3 sections. */
  prose?: ReactNode;
  title: ReactNode;
  titleId: string;
}) {
  return (
    <section aria-labelledby={titleId} className={styles.details}>
      <div className={styles.body}>
        <div className={styles.main}>
          <h2 id={titleId}>{title}</h2>
          {children}
        </div>
        {prose ? <div className={styles.prose}>{prose}</div> : null}
      </div>
    </section>
  );
}

/** Where the facts come from and when we checked (mockup `.src`). */
export function SourcesLine({ checked, sources }: { checked?: string; sources: readonly { label: string; href: string }[] }) {
  return (
    <p className={styles.sources}>
      Sources: {sources.map((source, index) => (
        <span key={source.href}>{index ? ", " : ""}<a href={source.href} rel="noopener">{source.label}</a></span>
      ))}
      {checked ? ` · checked ${checked}` : null}
    </p>
  );
}

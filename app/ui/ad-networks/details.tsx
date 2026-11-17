import styles from "./details.module.css";

/** For a fact the network doesn't publish. Research says so; it isn't missing data. */
export function NotPublic({ label = "Not public" }: { label?: string }) {
  return <span className={styles.notPublic}>{label}</span>;
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

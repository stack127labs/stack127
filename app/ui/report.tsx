import type { CSSProperties, ReactNode } from "react";
import { RankedBars } from "./ad-networks/viz/bars";
import styles from "./report.module.css";

type HeadingLevel = 2 | 3 | 4;

/**
 * A data report (mockup `.stats`): question-led groups split by hairlines, with related blocks side
 * by side. No boxes. Use it for stats sections where each group answers one question people ask.
 * Hide a block, row, or group that has no data; never fill it with a placeholder.
 */
export function Report({ ariaLabel, children, title, note, titleId }: {
  ariaLabel?: string;
  children: ReactNode;
  /** Optional section heading above the first group, always an h2. */
  title?: string;
  /** One short mono line under the title, such as where the numbers come from. */
  note?: ReactNode;
  titleId?: string;
}) {
  return (
    <section aria-label={title ? undefined : ariaLabel} aria-labelledby={title ? titleId : undefined} className={styles.report}>
      {title ? (
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          {note ? <p>{note}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/** One question and the blocks that answer it. Write the title as the question people search. */
export function ReportGroup({ children, level = 3, title }: { children: ReactNode; level?: HeadingLevel; title: string }) {
  const Heading = `h${level}` as const;
  return (
    <section className={styles.group}>
      <Heading className={styles.groupTitle}>{title}</Heading>
      {children}
    </section>
  );
}

/**
 * Blocks side by side, split by hairlines, stacked on phones. `1-1` (mockup `.row.r-11`) and `2-1`
 * (`.r-21`, first block twice as wide) sit side by side from 1100px. `1-1-1` (`.r-3`) goes to two
 * columns on tablets with the third block full width below. `2-1-1` (`.trio`) puts a wide block
 * first, such as domain age, then two narrow ones; on tablets the wide block takes its own row.
 * A row with one block left is fine: it takes the full width.
 */
export function ReportRow({ children, layout = "1-1" }: { children: ReactNode; layout?: "1-1" | "2-1" | "1-1-1" | "2-1-1" }) {
  return <div className={styles.row} data-layout={layout}>{children}</div>;
}

/** One block (mockup `.blk`): a short mono label, one line saying what it shows, then the chart, bars, or numbers. */
export function ReportBlock({ children, description, label, level = 4 }: {
  children: ReactNode;
  description?: ReactNode;
  label?: string;
  level?: HeadingLevel;
}) {
  const Heading = `h${level}` as const;
  return (
    <div className={styles.block}>
      {label ? <Heading className={styles.label}>{label}</Heading> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </div>
  );
}

export type ReportNumber = { label: string; value: ReactNode; accent?: boolean };

/**
 * Headline numbers. `ruled` (mockup `.summary`) draws up to four as a row between hairlines, for the
 * top of a group. `plain` (mockup `.big3`) sets up to three loose, for numbers inside a block.
 */
export function ReportNumbers({ items, variant = "ruled" }: { items: readonly ReportNumber[]; variant?: "ruled" | "plain" }) {
  return (
    <dl className={styles.numbers} data-variant={variant} style={{ "--count": Math.max(1, items.length) } as CSSProperties}>
      {items.map((item) => (
        <div key={item.label}>
          <dd data-accent={item.accent || undefined}>{item.value}</dd>
          <dt>{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/** One big number with a short note beside it, such as `13 yrs` and `median` (mockup `.head`). */
export function ReportFigure({ note, value }: { note?: ReactNode; value: ReactNode }) {
  return (
    <p className={styles.figure}>
      <span className={styles.figureValue}>{value}</span>
      {note ? <span className={styles.figureNote}>{note}</span> : null}
    </p>
  );
}

export type ReportBar = {
  label: string;
  value: number;
  /** The number as shown at the end of the row, such as `31%` or `7,852`. */
  display: string;
  href?: string;
  /** Marks the row the page is about, such as this network in a ranking. */
  current?: boolean;
};

/**
 * A ranked list of bars, label left and exact value right (mockup `dl.bars`). The same component
 * as `RankedBars`: `tone="accent"` fills every bar, `tone="current"` fills only the current row.
 */
export function ReportBars({ ariaLabel, max, rows, tone = "accent" }: {
  ariaLabel: string;
  max?: number;
  rows: readonly ReportBar[];
  tone?: "accent" | "current";
}) {
  return (
    <RankedBars
      ariaLabel={ariaLabel}
      max={max}
      rows={rows.map((row) => ({ label: row.label, value: row.value, display: row.display, href: row.href, highlight: row.current }))}
      tone={tone === "current" ? "highlight" : "all"}
    />
  );
}

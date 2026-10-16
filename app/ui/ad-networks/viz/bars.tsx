import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { clamp, formatNumber, toneColor, type VizTone } from "./format";
import { VizLegend } from "./parts";
import styles from "./viz.module.css";

export type RankedBar = {
  label: ReactNode;
  value: number;
  /** The number at the end of the row, such as `31%` or `7,852`. Defaults to the value. */
  display?: ReactNode;
  href?: string;
  /** Marks the row the page is about, such as this network in a ranking. */
  highlight?: boolean;
};

/**
 * Ranked bars, label left and exact value right (mockup `dl.bars`). Bars scale to the largest value
 * unless `max` is set. `tone="all"` fills every bar with the accent; `tone="highlight"` keeps the
 * bars neutral and fills only highlighted rows. Reads as a description list, so it needs no table.
 */
export function RankedBars({ ariaLabel, max, rows, tone = "all" }: {
  ariaLabel?: string;
  max?: number;
  rows: readonly RankedBar[];
  tone?: "all" | "highlight";
}) {
  const top = max ?? Math.max(1, ...rows.map((row) => row.value));
  return (
    <dl aria-label={ariaLabel} className={`${styles.bars} ${styles.tokens}`} data-tone={tone}>
      {rows.map((row, index) => (
        <div className={styles.barRow} data-hi={row.highlight || undefined} key={index}>
          <dt>{row.href ? <Link href={row.href} prefetch={false}>{row.label}</Link> : row.label}</dt>
          <dd aria-hidden="true" className={styles.track}><i style={{ width: `${clamp((row.value / top) * 100, 0, 100)}%` }} /></dd>
          <dd className={styles.barValue}>{row.display ?? formatNumber(row.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export type StackPart = { label: ReactNode; value: number; tone: VizTone; /** Legend value, such as `88%`. */ display?: ReactNode };

/**
 * One thin bar split into parts of a whole, with a legend below (mockup `.stackbar`). Parts keep
 * their order. Set `legend={false}` when the parts are named elsewhere.
 */
export function StackBar({ legend = true, parts }: { legend?: boolean; parts: readonly StackPart[] }) {
  const shown = parts.filter((part) => part.value > 0);
  return (
    <>
      <div aria-hidden="true" className={`${styles.stackbar} ${styles.tokens}`}>
        {shown.map((part, index) => <i key={index} style={{ background: toneColor(part.tone), flex: part.value }} />)}
      </div>
      {legend ? <VizLegend items={parts.map((part) => ({ label: part.label, tone: part.tone, value: part.display }))} /> : null}
    </>
  );
}

export type Move = { from: ReactNode; to: ReactNode; fromHref?: string; toHref?: string; count: number };

/** Switches between networks: `from → to`, a bar, and the count (mockup `dl.moves`). */
export function MoveBars({ ariaLabel, moves }: { ariaLabel?: string; moves: readonly Move[] }) {
  const top = Math.max(1, ...moves.map((move) => move.count));
  const name = (label: ReactNode, href?: string) => href ? <Link href={href} prefetch={false}>{label}</Link> : label;
  return (
    <dl aria-label={ariaLabel} className={`${styles.moves} ${styles.tokens}`}>
      {moves.map((move, index) => (
        <Fragment key={index}>
          <dt>{name(move.from, move.fromHref)}<span aria-label="to" className={styles.arrow} role="img">→</span>{name(move.to, move.toHref)}</dt>
          <dd aria-hidden="true" className={styles.track}><i style={{ width: `${(move.count / top) * 100}%` }} /></dd>
          <dd className={styles.movesValue}>{formatNumber(move.count)}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

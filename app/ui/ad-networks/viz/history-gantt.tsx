import type { CSSProperties } from "react";
import { clamp, onAccent, toneColor, type VizTone } from "./format";
import styles from "./viz.module.css";

export type GanttRow = {
  label: string;
  /** `YYYY-MM`, the month the network first appeared. */
  from: string;
  /** `YYYY-MM`, the last month it appeared, or null while it still runs. */
  to: string | null;
  tone: VizTone;
  /** Added after the dates, such as `not confirmed`. */
  note?: string;
};

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const monthText = (value: string) => monthFormat.format(new Date(`${value}-01T00:00:00Z`));
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const monthLongText = (value: string) => monthLong.format(new Date(`${value}-01T00:00:00Z`));
// Where a label goes on wide screens, from the bar's share of the track. The track is at least
// this wide above 640px; below that every label sits on its own line under its bar.
const narrowestTrack = 560;
const charWidth = 7.2;
const barPadding = 16;

const position = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return year + ((month || 1) - 1) / 12;
};

/**
 * One bar per network from the month it first appeared to the month it last did, across whole
 * years (mockup history timeline). Pass `endYear` as the current year so open bars run to "now".
 * The whole chart is one image with a plain sentence for screen readers.
 */
export function HistoryGantt({ endYear, rows, startYear }: { endYear: number; rows: readonly GanttRow[]; startYear?: number }) {
  const first = startYear ?? Math.min(endYear, ...rows.map((row) => Math.floor(position(row.from))));
  const years = Array.from({ length: endYear - first + 1 }, (_, index) => first + index);
  const span = years.length;
  const at = (value: number) => clamp(((value - first) / span) * 100, 0, 100);
  const summary = rows.map((row) => `${row.label} ${row.to === row.from ? `in ${monthLongText(row.from)}` : `from ${monthLongText(row.from)} to ${row.to ? monthLongText(row.to) : "now"}`}${row.note ? `, ${row.note}` : ""}.`).join(" ");
  return (
    <div aria-label={summary} className={`${styles.gantt} ${styles.tokens}`} role="img" style={{ "--years": span, "--half-years": Math.ceil(span / 2) } as CSSProperties}>
      <div className={styles.gAxis}>{years.map((year) => <span key={year}>{year}</span>)}</div>
      {rows.map((row) => {
        const left = at(position(row.from));
        const right = row.to ? at(position(row.to) + 1 / 12) : 100;
        const width = Math.max(right - left, 1);
        // One month reads as that month, not "Sep 2026 to Sep 2026".
        const dates = row.to === row.from ? monthText(row.from) : `${monthText(row.from)} to ${row.to ? monthText(row.to) : "now"}`;
        const text = `${dates}${row.note ? ` · ${row.note}` : ""}`;
        const textShare = ((text.length * charWidth + barPadding) / narrowestTrack) * 100;
        // Inside the bar when it fits, else after it, else before it. A label never gets cut short.
        const place = width >= textShare ? "inside" : right + textShare <= 100 ? "after" : left >= textShare ? "before" : "inside";
        const textStyle = { "--left": `${left}%`, "--right": `${right}%`, "--width": `${width}%` } as CSSProperties;
        return (
          <div className={styles.gRow} key={row.label}>
            <span className={styles.gName}>{row.label}</span>
            <div className={styles.gTrack}>
              <i className={styles.gBar} style={{ background: toneColor(row.tone), left: `${left}%`, width: `${width}%` }} />
              <span className={styles.gText} data-on-ac={(place === "inside" && onAccent(row.tone)) || undefined} data-place={place} style={textStyle}>{text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import type { ReactNode, Ref } from "react";
import { TableFrame } from "./table-frame";
import styles from "./controls.module.css";

export function UiActionRow({ children }: { children: ReactNode }) {
  return <div className={styles.actionRow}>{children}</div>;
}


export function UiStatus({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <p aria-live="polite" className={styles.status} data-tone={tone} role={tone === "danger" ? "alert" : "status"}>{children}</p>;
}

export function UiResultLead({ children, inputRef }: { children: ReactNode; inputRef?: Ref<HTMLParagraphElement> }) {
  return <p className={styles.resultLead} ref={inputRef} tabIndex={inputRef ? -1 : undefined}>{children}</p>;
}

export function UiPrimaryResult({
  detail,
  inputRef,
  label,
  tone = "neutral",
  unit,
  value,
}: {
  detail?: ReactNode;
  inputRef?: Ref<HTMLOutputElement>;
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  unit?: ReactNode;
  value: ReactNode;
}) {
  return (
    <output aria-label={label} className={styles.primaryResult} data-tone={tone} ref={inputRef} tabIndex={inputRef ? -1 : undefined}>
      <span className={styles.primaryResultLabel}>{label}</span>
      <span className={styles.primaryResultLine}>
        <strong className={styles.primaryResultValue}>{value}</strong>
        {unit ? <span className={styles.primaryResultUnit}> {unit}</span> : null}
      </span>
      {detail ? <span className={styles.primaryResultDetail}>{detail}</span> : null}
    </output>
  );
}

export function UiProgressBar({
  label,
  max = 100,
  value,
  valueText,
}: {
  label: string;
  max?: number;
  value: number;
  valueText?: string;
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Math.min(safeMax, Math.max(0, Number.isFinite(value) ? value : 0));
  const display = valueText ?? `${Math.round((safeValue / safeMax) * 100)}%`;

  return (
    <figure className={styles.progressFigure}>
      <figcaption className={styles.progressHeader}>
        <span>{label}</span>
        <strong>{display}</strong>
      </figcaption>
      <progress aria-label={label} aria-valuetext={display} className={styles.progressBar} max={safeMax} value={safeValue} />
    </figure>
  );
}

export type UiAllocationPalette = "neutral" | "accent" | "categorical";

export type UiAllocationTone =
  | "strong"
  | "medium"
  | "light"
  | "empty"
  | "accent"
  | "chartreuse"
  | "cyan"
  | "blue"
  | "yellow"
  | "red"
  | "violet"
  | "green";

export type UiAllocationSegment = {
  id: string;
  label: string;
  tone?: UiAllocationTone;
  value: number | bigint;
};

const allocationPalettes: Record<UiAllocationPalette, readonly UiAllocationTone[]> = {
  neutral: ["strong", "medium", "light", "empty"],
  accent: ["accent", "strong", "light", "empty"],
  categorical: ["chartreuse", "cyan", "blue", "yellow", "red", "violet", "green"],
};

function allocationClass(tone: UiAllocationTone) {
  return styles[`allocation${tone[0].toUpperCase()}${tone.slice(1)}`];
}

function positiveAllocationValue(value: number | bigint) {
  if (typeof value === "bigint") return value > 0n ? value : 0n;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function isPositiveAllocationValue(value: number | bigint) {
  return typeof value === "bigint" ? value > 0n : value > 0;
}

function allocationWidth(value: number | bigint, scale: number | bigint) {
  if (typeof value === "bigint" && typeof scale === "bigint") {
    if (scale <= 0n) return "0%";
    const precision = 1_000_000n;
    const scaled = value * 100n * precision / scale;
    const whole = scaled / precision;
    const fraction = (scaled % precision).toString().padStart(6, "0").replace(/0+$/, "");
    return `${whole}${fraction ? `.${fraction}` : ""}%`;
  }
  const numericValue = typeof value === "bigint" ? parseFloat(value.toString()) : value;
  const numericScale = typeof scale === "bigint" ? parseFloat(scale.toString()) : scale;
  return `${numericScale > 0 ? numericValue / numericScale * 100 : 0}%`;
}

export function UiAllocationBar({
  ariaLabel,
  formatValue = (value) => value.toLocaleString("en-US"),
  palette = "neutral",
  segments,
  total,
}: {
  ariaLabel: string;
  formatValue?: (value: number | bigint) => string;
  palette?: UiAllocationPalette;
  segments: UiAllocationSegment[];
  total?: number | bigint;
}) {
  const normalized = segments.map((segment) => ({
    ...segment,
    value: positiveAllocationValue(segment.value),
  }));
  const allBigInt = normalized.every((segment) => typeof segment.value === "bigint")
    && (total === undefined || typeof total === "bigint");
  const segmentTotal = allBigInt
    ? normalized.reduce((sum, segment) => sum + (segment.value as bigint), 0n)
    : normalized.reduce((sum, segment) => sum + (typeof segment.value === "bigint" ? parseFloat(segment.value.toString()) : segment.value), 0);
  const normalizedTotal = total === undefined ? (allBigInt ? 0n : 0) : positiveAllocationValue(total);
  const scale = allBigInt
    ? [segmentTotal as bigint, normalizedTotal as bigint, 1n].reduce((largest, value) => value > largest ? value : largest)
    : Math.max(segmentTotal as number, typeof normalizedTotal === "bigint" ? parseFloat(normalizedTotal.toString()) : normalizedTotal, 1);
  const paletteTones = allocationPalettes[palette];

  return (
    <figure aria-label={ariaLabel} className={styles.allocationFigure} data-allocation-palette={palette}>
      <div aria-hidden="true" className={styles.allocationBar}>
        {normalized.map((segment, index) => {
          const tone = segment.tone ?? paletteTones[index % paletteTones.length];
          return isPositiveAllocationValue(segment.value) ? (
            <span
              aria-hidden="true"
              className={`${styles.allocationSegment} ${allocationClass(tone)}`}
              data-allocation-segment={segment.id}
              key={segment.id}
              style={{ width: allocationWidth(segment.value, scale) }}
            />
          ) : null;
        })}
      </div>
      <figcaption>
        <ul className={styles.allocationLegend}>
          {normalized.map((segment, index) => {
            const tone = segment.tone ?? paletteTones[index % paletteTones.length];
            return (
              <li key={segment.id}>
                <span aria-hidden="true" className={`${styles.allocationSwatch} ${allocationClass(tone)}`} />
                <span>{segment.label}</span>
                <strong>{formatValue(segment.value)}</strong>
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}


export function UiCodeOutput({
  actions,
  code,
  label,
}: {
  actions?: ReactNode;
  code: string;
  label: string;
}) {
  return (
    <section aria-label={label} className={styles.codeOutput}>
      <header className={styles.codeHeader}>
        <h3>{label}</h3>
        {actions ? <div className={styles.codeActions}>{actions}</div> : null}
      </header>
      <div className={styles.codeViewport}>
        <pre tabIndex={0}><code>{code}</code></pre>
      </div>
    </section>
  );
}


export type UiMetric = {
  id: string;
  label: string;
  unit?: ReactNode;
  value: ReactNode;
};

export function UiMetricGroup({ ariaLabel, items }: { ariaLabel: string; items: UiMetric[] }) {
  return (
    <dl aria-label={ariaLabel} className={styles.metricGroup}>
      {items.map((item) => (
        <div key={item.id}>
          <dt>{item.label}</dt>
          <dd>
            <strong>{item.value}</strong>
            {item.unit ? <span>{item.unit}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type UiTimelineEvent = {
  dateTime?: string;
  id: string;
  label: string;
  state?: "past" | "current" | "future";
  value: ReactNode;
};

export function UiTimeline({ ariaLabel, events }: { ariaLabel: string; events: UiTimelineEvent[] }) {
  return (
    <ol aria-label={ariaLabel} className={styles.timeline}>
      {events.map((event) => (
        <li aria-current={event.state === "current" ? "step" : undefined} data-state={event.state} key={event.id}>
          <span className={styles.timelineLabel}>{event.label}</span>
          {event.dateTime && typeof event.value === "string" ? (
            <time dateTime={event.dateTime}>{event.value}</time>
          ) : (
            <strong>{event.value}</strong>
          )}
        </li>
      ))}
    </ol>
  );
}

export function UiKeyValueList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className={styles.keyValues}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function UiDataTable({
  ariaLabel,
  caption,
  columns,
  rows,
}: {
  ariaLabel: string;
  caption?: string;
  columns: { id: string; label: string; align?: "left" | "right" }[];
  rows: { id: string; cells: Record<string, ReactNode> }[];
}) {
  return (
    <TableFrame ariaLabel={ariaLabel}>
      <table aria-label={ariaLabel} className={styles.table}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>{columns.map((column) => <th data-align={column.align} key={column.id} scope="col">{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column, index) => index === 0
                ? <th data-align={column.align} data-label={column.label} key={column.id} scope="row">{row.cells[column.id]}</th>
                : <td data-align={column.align} data-label={column.label} key={column.id}>{row.cells[column.id]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </TableFrame>
  );
}

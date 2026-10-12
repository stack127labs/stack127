import { ArrowRight, Check, Circle } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { UiHint } from "./controls";
import { TableFrame } from "./table-frame";
import styles from "./controls.module.css";

export function UiActionRow({ children }: { children: ReactNode }) {
  return <div className={styles.actionRow}>{children}</div>;
}


export function UiStatus({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <p aria-live="polite" className={styles.status} data-tone={tone} role={tone === "danger" ? "alert" : "status"}>{children}</p>;
}

export function UiStatusWord({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <span className={styles.statusWord} data-tone={tone}>{children}</span>;
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

export type UiRangeBand = {
  id: string;
  from: number;
  to: number;
  /** A plain name, such as `Median, no-card trials`. Never a grade. */
  label: string;
  /** The range as people read it, such as `4 to 6%`. */
  valueText: string;
  /** One sentence naming the source, such as `ChartMogul survey, January 2026.` */
  hint?: string;
};

/** The span the person's own value probably sits in, such as a likely range at a small sample size. */
export type UiRangeSpan = {
  from: number;
  to: number;
  /** A plain name, such as `Likely range at 500 starts`. */
  label: string;
  /** The span as people read it, such as `5.92 to 10.72%`. */
  valueText: string;
  /** One sentence on what the span means. */
  hint?: string;
};

// Callers check the scale and value are finite first.
function rangePercent(value: number, min: number, max: number) {
  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
}

/**
 * Where the person's value sits next to published ranges. It shows position only: no grade,
 * and no success or danger colors, because a healthy number differs by niche.
 */
export function UiRangeMarker({
  ariaLabel,
  bands,
  max,
  maxText,
  min = 0,
  minText,
  range,
  value,
  valueText,
  youLabel = "You",
}: {
  ariaLabel: string;
  bands: readonly UiRangeBand[];
  max: number;
  maxText: string;
  min?: number;
  minText: string;
  /** The span the person's value probably sits in. It draws under the track in the first data color. */
  range?: UiRangeSpan;
  value: number;
  valueText: string;
  youLabel?: string;
}) {
  // A broken scale or value draws nothing rather than a marker in the wrong place.
  const hasScale = Number.isFinite(min) && Number.isFinite(max) && max > min;
  const hasValue = hasScale && Number.isFinite(value);
  const position = hasValue ? rangePercent(value, min, max) : 0;
  const edge = position < 15 ? "start" : position > 85 ? "end" : undefined;
  const hasRange = hasScale && range !== undefined && Number.isFinite(range.from) && Number.isFinite(range.to);
  const rangeFrom = hasRange ? rangePercent(Math.min(range.from, range.to), min, max) : 0;
  const rangeTo = hasRange ? rangePercent(Math.max(range.from, range.to), min, max) : 0;

  return (
    <figure aria-label={ariaLabel} className={styles.rangeFigure}>
      {hasScale ? <div aria-hidden="true" className={styles.rangeScale}>
        <div className={styles.rangeLane}>
          <div className={styles.rangeTrack}>
            {bands.map((band, index) => {
              if (!Number.isFinite(band.from) || !Number.isFinite(band.to)) return null;
              const from = rangePercent(Math.min(band.from, band.to), min, max);
              const to = rangePercent(Math.max(band.from, band.to), min, max);
              return to > from ? (
                <span className={styles.rangeBand} data-band={index % 3} key={band.id} style={{ left: `${from}%`, width: `${to - from}%` }} />
              ) : null;
            })}
          </div>
          {hasRange ? (
            <div className={styles.rangeSpanLane}>
              <span className={styles.rangeSpan} style={{ left: `${rangeFrom}%`, width: `${rangeTo - rangeFrom}%` }} />
            </div>
          ) : null}
          {hasValue ? (
            <span className={styles.rangeMarker} data-edge={edge} style={{ left: `${position}%` }}>
              <span className={styles.rangeMarkerLabel}>{youLabel} <strong>{valueText}</strong></span>
            </span>
          ) : null}
        </div>
        <div className={styles.rangeAxis}>
          <span>{minText}</span>
          <span>{maxText}</span>
        </div>
      </div> : null}
      <figcaption>
        {hasValue ? <span className={styles.visuallyHidden}>{youLabel}: {valueText}.</span> : null}
        <ul className={styles.rangeLegend}>
          {hasRange ? (
            <li>
              <span aria-hidden="true" className={styles.rangeSwatch} data-span="" />
              <span className={styles.rangeLegendLabel}>
                {range.label}
                {range.hint ? <UiHint label={range.label} text={range.hint} /> : null}
              </span>
              <strong>{range.valueText}</strong>
            </li>
          ) : null}
          {bands.map((band, index) => (
            <li key={band.id}>
              <span aria-hidden="true" className={styles.rangeSwatch} data-band={index % 3} />
              <span className={styles.rangeLegendLabel}>
                {band.label}
                {band.hint ? <UiHint label={band.label} text={band.hint} /> : null}
              </span>
              <strong>{band.valueText}</strong>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

/**
 * A share of a group as filled units, such as 8 paid out of every 100 who started. Units fill
 * row by row, and the last one fills partly, so 13.22 fills 13 units and a fifth of the next.
 */
export function UiUnitGrid({
  ariaLabel,
  columns = 10,
  emptyLabel,
  filled,
  filledLabel,
  target,
  tone = "accent",
  units = 100,
  valueText,
}: {
  ariaLabel: string;
  columns?: number;
  emptyLabel: string;
  /** How many units to fill, from 0 to `units`. A fraction fills the last unit partly. */
  filled: number;
  filledLabel: string;
  /** A goal above the filled amount. Units between the two draw outlined, so the gap shows. */
  target?: { amount: number; label: string; valueText: string };
  /** `accent` fills with the first data color, `neutral` with the text color. */
  tone?: "accent" | "neutral";
  units?: number;
  /** The filled amount as people read it, such as `8 of every 100`. Screen readers hear it. */
  valueText: string;
}) {
  const requested = Number.isInteger(units) && units > 0 ? units : 100;
  // Large groups draw at most 400 cells, scaled, so the filled share stays true.
  const count = Math.min(requested, 400);
  const scale = count / requested;
  const perRow = Number.isInteger(columns) && columns > 0 ? Math.min(columns, count) : 10;
  const rawFilled = Number.isFinite(filled) ? Math.max(0, filled) : 0;
  const rawGoal = target && Number.isFinite(target.amount) ? Math.max(0, target.amount) : 0;
  const amount = Math.min(count, rawFilled * scale);
  const goal = Math.min(count, rawGoal * scale);
  // A goal past the grid still counts as unmet: the cells can't show it, so the legend and text do.
  const showsTarget = target !== undefined && rawGoal > rawFilled;

  return (
    <figure aria-label={ariaLabel} className={styles.unitFigure} data-tone={tone}>
      <div aria-hidden="true" className={styles.unitGrid} style={{ gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))` }}>
        {Array.from({ length: count }, (_, index) => {
          const fill = Math.min(1, Math.max(0, amount - index));
          return (
            <span className={styles.unit} data-target={showsTarget && fill < 1 && goal > index ? "" : undefined} key={index}>
              {fill > 0 ? <span className={styles.unitFill} style={{ width: `${(fill * 100).toFixed(2)}%` }} /> : null}
            </span>
          );
        })}
      </div>
      <figcaption>
        <span className={styles.visuallyHidden}>
          {filledLabel}: {valueText}.{showsTarget ? ` ${target.label}: ${target.valueText}.` : null}
        </span>
        <ul aria-hidden="true" className={styles.unitLegend}>
          <li><span className={styles.unitSwatch} data-filled="" />{filledLabel}</li>
          {showsTarget ? <li><span className={styles.unitSwatch} data-target="" />{target.label}</li> : null}
          <li><span className={styles.unitSwatch} />{emptyLabel}</li>
        </ul>
      </figcaption>
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
  /** One plain sentence behind a small ? beside the label. */
  hint?: string;
  unit?: ReactNode;
  value: ReactNode;
};

/**
 * Supporting numbers under a main answer. `columns` spreads them across the width. `list` gives
 * one row per number, label left and value right, for numbers people read down.
 */
export function UiMetricGroup({ ariaLabel, items, layout = "columns" }: { ariaLabel: string; items: UiMetric[]; layout?: "columns" | "list" }) {
  return (
    <dl aria-label={ariaLabel} className={styles.metricGroup} data-layout={layout === "list" ? "list" : undefined}>
      {items.map((item) => (
        <div key={item.id}>
          <dt>
            {item.label}
            {item.hint ? <UiHint label={item.label} text={item.hint} /> : null}
          </dt>
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

export type UiStep = Readonly<{
  detail?: string;
  id: string;
  label: string;
  state: "complete" | "current" | "pending";
}>;

/** Ordered stages and which one is done, current, or next. */
export function UiSteps({ ariaLabel, steps }: { ariaLabel: string; steps: readonly UiStep[] }) {
  return (
    <ol aria-label={ariaLabel} className={styles.steps}>
      {steps.map((step, index) => (
        <li aria-current={step.state === "current" ? "step" : undefined} data-state={step.state} key={step.id}>
          <span className={styles.stepMarker}>
            {step.state === "complete" ? <Check aria-hidden="true" size={18} /> : step.state === "current" ? <ArrowRight aria-hidden="true" size={18} /> : <Circle aria-hidden="true" size={14} />}
          </span>
          <div>
            <strong>{step.label}</strong>
            {step.detail ? <span>{step.detail}</span> : null}
          </div>
          {index < steps.length - 1 ? <ArrowRight aria-hidden="true" className={styles.stepConnector} size={20} /> : null}
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

import { ArrowRight, Check, Circle } from "lucide-react";
import styles from "./visuals.module.css";

export type UiChartDatum = Readonly<{
  formattedValue?: string;
  id: string;
  label: string;
  value: number;
}>;

function defaultValue(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value);
}

export function UiBarChart({ ariaLabel, caption, data, formatValue = defaultValue, maxValue }: { ariaLabel: string; caption?: string; data: readonly UiChartDatum[]; formatValue?: (value: number) => string; maxValue?: number }) {
  if (!data.length || data.some((item) => !Number.isFinite(item.value) || item.value < 0)) {
    return <p role="note">Bar chart unavailable: values must be nonnegative numbers.</p>;
  }
  const largest = Math.max(0, maxValue ?? 0, ...data.map((item) => item.value));
  return (
    <figure aria-label={ariaLabel} className={styles.figure}>
      <figcaption className={styles.caption}>
        <strong>{ariaLabel}</strong>
        {caption ? <span>{caption}</span> : null}
      </figcaption>
      <ol className={styles.barChart}>
        {data.map((item, index) => {
          const width = largest > 0 ? Math.max(0, Math.min(100, item.value / largest * 100)) : 0;
          return (
            <li key={item.id}>
              <span className={styles.barLabel}>{item.label}</span>
              <span aria-hidden="true" className={styles.barTrack}><span data-series={index % 7} style={{ width: `${width}%` }} /></span>
              <strong>{item.formattedValue ?? formatValue(item.value)}</strong>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

export function UiDonutChart({ ariaLabel, caption, data, formatValue = defaultValue }: {
  ariaLabel: string;
  caption?: string;
  data: readonly UiChartDatum[];
  formatValue?: (value: number) => string;
}) {
  if (!data.length || data.some((item) => !Number.isFinite(item.value) || item.value < 0)) {
    return <p role="note">Donut chart unavailable: values must be nonnegative numbers.</p>;
  }
  const positive = data;
  const total = positive.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  return (
    <figure aria-label={ariaLabel} className={styles.figure}>
      <figcaption className={styles.caption}>
        <strong>{ariaLabel}</strong>
        {caption ? <span>{caption}</span> : null}
      </figcaption>
      {total > 0 ? <div className={styles.donutLayout}>
        <svg aria-hidden="true" className={styles.donut} viewBox="0 0 120 120">
          {positive.map((item, index) => {
            const length = item.value / total * 100;
            const start = offset;
            offset += length;
            return item.value > 0 ? <circle
              className={styles.donutSegment}
              cx="60"
              cy="60"
              data-series={index % 7}
              fill="none"
              key={item.id}
              pathLength={100}
              r="42"
              strokeDasharray={`${length} ${100 - length}`}
              strokeDashoffset={-start}
              strokeWidth="18"
            /> : null;
          })}
        </svg>
        <ul className={styles.donutLegend}>
          {positive.map((item, index) => <li key={item.id}>
            <span aria-hidden="true" className={styles.donutSwatch} data-series={index % 7} />
            <span>{item.label}</span>
            <strong>{item.formattedValue ?? formatValue(item.value)} ({new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(item.value / total * 100)}%)</strong>
          </li>)}
        </ul>
      </div> : <p>No values to chart.</p>}
    </figure>
  );
}

export type UiLinePoint = UiChartDatum & { xLabel: string; xValue?: number };

export function UiLineChart({ ariaLabel, caption, formatValue = defaultValue, points, valueLabel }: { ariaLabel: string; caption?: string; formatValue?: (value: number) => string; points: readonly UiLinePoint[]; valueLabel: string }) {
  if (!points.length || points.some((point) => !Number.isFinite(point.value))) {
    return <p role="note">Line chart unavailable: points need numeric values.</p>;
  }
  const numericAxis = points.every((point) => typeof point.xValue === "number" && Number.isFinite(point.xValue));
  if (points.some((point) => point.xValue !== undefined) && (!numericAxis || points.some((point, index) => index > 0 && point.xValue! <= points[index - 1].xValue!))) {
    return <p role="note">Line chart unavailable: x values must be finite and increasing.</p>;
  }
  const width = 720;
  const height = 280;
  const padding = { bottom: 42, left: 64, right: 22, top: 34 };
  const values = points.map((point) => point.value);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(1, ...values);
  const span = rawMax - rawMin || 1;
  const firstX = points[0].xValue ?? 0;
  const lastX = points[points.length - 1].xValue ?? 1;
  const x = (index: number) => padding.left + (numericAxis
    ? (lastX === firstX ? 0 : (points[index].xValue! - firstX) / (lastX - firstX))
    : index / Math.max(1, points.length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + (rawMax - value) / span * (height - padding.top - padding.bottom);
  const ticks = Array.from({ length: 5 }, (_, index) => rawMin + span * index / 4).reverse();
  const line = points.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");

  return (
    <figure aria-label={ariaLabel} className={styles.figure}>
      <figcaption className={styles.caption}>
        <strong>{ariaLabel}</strong>
        {caption ? <span>{caption}</span> : null}
      </figcaption>
      <div className={styles.lineViewport}>
        <svg aria-hidden="true" className={styles.lineChart} style={{ minWidth: Math.max(520, points.length * 84) }} viewBox={`0 0 ${width} ${height}`}>
          {ticks.map((tick) => {
            const tickY = y(tick);
            return <g key={tick}>
              <line className={styles.gridLine} x1={padding.left} x2={width - padding.right} y1={tickY} y2={tickY} />
              <text className={styles.axisText} textAnchor="end" x={padding.left - 10} y={tickY + 4}>{formatValue(tick)}</text>
            </g>;
          })}
          <polyline className={styles.line} points={line} />
          {points.map((point, index) => <g key={point.id}>
            <circle className={styles.point} cx={x(index)} cy={y(point.value)} r="5" />
            <text className={styles.pointValue} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} x={x(index)} y={y(point.value) - 12}>{point.formattedValue ?? formatValue(point.value)}</text>
            <text className={styles.axisText} textAnchor="middle" x={x(index)} y={height - 14}>{point.xLabel}</text>
          </g>)}
        </svg>
      </div>
      <table className={styles.visuallyHidden}>
        <caption>{ariaLabel}</caption>
        <thead><tr><th>Point</th><th>{valueLabel}</th></tr></thead>
        <tbody>{points.map((point) => <tr key={point.id}><th>{point.label}</th><td>{point.formattedValue ?? formatValue(point.value)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

export type UiFlowStage = Readonly<{
  detail?: string;
  id: string;
  label: string;
  state: "complete" | "current" | "pending";
}>;

export function UiFlowChart({ ariaLabel, stages }: { ariaLabel: string; stages: readonly UiFlowStage[] }) {
  return (
    <ol aria-label={ariaLabel} className={styles.flow}>
      {stages.map((stage, index) => <li aria-current={stage.state === "current" ? "step" : undefined} data-state={stage.state} key={stage.id}>
        <span className={styles.flowMarker}>
          {stage.state === "complete" ? <Check aria-hidden="true" size={18} /> : stage.state === "current" ? <ArrowRight aria-hidden="true" size={18} /> : <Circle aria-hidden="true" size={14} />}
        </span>
        <div>
          <strong>{stage.label}</strong>
          {stage.detail ? <span>{stage.detail}</span> : null}
        </div>
        {index < stages.length - 1 ? <ArrowRight aria-hidden="true" className={styles.flowConnector} size={20} /> : null}
      </li>)}
    </ol>
  );
}

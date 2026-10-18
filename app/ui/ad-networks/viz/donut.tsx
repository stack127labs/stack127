import type { ReactNode } from "react";
import { formatShare, partTones, toneColor, type VizTone } from "./format";
import { VizDataTable, VizLegend } from "./parts";
import styles from "./viz.module.css";

export type DonutPart = { label: string; value: number; tone?: VizTone };

const size = 132;
const radius = 52;
const circumference = 2 * Math.PI * radius;

/**
 * Parts of one whole as a ring, with the biggest part's share in the middle and a legend beside
 * it (mockup platforms donut). Parts default to the accent steps, then the neutrals. Give a part
 * the `track` tone for "Unknown".
 */
export function Donut({ caption, centerLabel, centerValue, parts }: {
  /** What the ring shows, for screen readers, such as `Platforms`. */
  caption: string;
  /** Defaults to the first part's share and name. */
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
  parts: readonly DonutPart[];
}) {
  const total = parts.reduce((sum, part) => sum + Math.max(0, part.value), 0) || 1;
  const toned = parts.map((part, index) => ({ ...part, tone: part.tone ?? partTones[Math.min(index, partTones.length - 1)] }));
  let offset = 0;
  const arcs = toned.map((part, index) => {
    const length = (Math.max(0, part.value) / total) * circumference;
    const arc = (
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        key={index}
        r={radius}
        strokeDasharray={`${Math.max(length - (toned.length > 1 ? 1.5 : 0), 0.6)} ${circumference}`}
        strokeDashoffset={-offset}
        strokeWidth={14}
        style={{ stroke: toneColor(part.tone) }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    );
    offset += length;
    return arc;
  });
  const first = toned[0];
  return (
    <div className={`${styles.donutWrap} ${styles.tokens}`}>
      <div className={styles.viz} style={{ width: size }}>
        <svg aria-hidden="true" height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
          <circle cx={size / 2} cy={size / 2} fill="none" r={radius} strokeWidth={14} style={{ stroke: "var(--color-surface-2)" }} />
          {arcs}
          {first ? (
            <>
              <text className={`${styles.tInk} ${styles.donutValue}`} textAnchor="middle" x={size / 2} y={size / 2}>{centerValue ?? formatShare(first.value / total)}</text>
              <text className={`${styles.tMuted} ${styles.donutLabel}`} textAnchor="middle" x={size / 2} y={size / 2 + 18}>{centerLabel ?? first.label}</text>
            </>
          ) : null}
        </svg>
      </div>
      <VizLegend column items={toned.map((part) => ({ label: part.label, tone: part.tone, value: formatShare(part.value / total) }))} />
      <VizDataTable caption={caption} head={["part", "share"]} rows={toned.map((part) => [part.label, formatShare(part.value / total)])} />
    </div>
  );
}

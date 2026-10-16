"use client";

import { useState, type ReactNode } from "react";
import { clamp, formatNumber, formatPercent, onAccent, partTones, toneColor, type VizTone } from "./format";
import { VizDataTable, VizLegend } from "./parts";
import styles from "./viz.module.css";

export type SizeSeries = { label: string; tone?: VizTone };
export type SizeGroup = {
  /** Such as `top 10k`. */
  label: string;
  /** Sites in the group. */
  sites: number;
  /** Percent of the group per series, in series order, unrounded. They should add up to 100. */
  shares: readonly number[];
};

/**
 * One 100% bar per size group, split by network, with the group's site count beside it (mockup
 * "what do sites of each size run"). Parts of 7% or more print their percent. Hover or focus
 * shows the part's network, percent, and about how many sites.
 */
export function SizeStacks({ caption, groups, series }: { caption: string; groups: readonly SizeGroup[]; series: readonly SizeSeries[] }) {
  const [tip, setTip] = useState<{ group: number; left: number; text: ReactNode } | null>(null);
  const tones = series.map((item, index) => item.tone ?? partTones[Math.min(index, partTones.length - 1)]);
  return (
    <>
      <div className={`${styles.sizes} ${styles.tokens}`} onMouseLeave={() => setTip(null)}>
        {groups.map((group, groupIndex) => (
          <div className={styles.srow} key={group.label}>
            <span className={styles.srowLabel}><b>{group.label}</b>{formatNumber(group.sites)} sites</span>
            <div className={styles.stack}>
              {group.shares.map((share, index) => {
                if (!share) return null;
                const text = <>{group.label} · <b>{series[index]?.label}</b> · {formatPercent(share)} · about {formatNumber(Math.round((group.sites * share) / 100))} sites</>;
                const open = (element: HTMLElement) => setTip({ group: groupIndex, left: element.offsetLeft + element.offsetWidth / 2, text });
                return (
                  <i
                    aria-label={`${series[index]?.label}, ${formatPercent(share)}`}
                    data-on-ac={onAccent(tones[index]) || undefined}
                    key={index}
                    onBlur={() => setTip(null)}
                    onFocus={(event) => open(event.currentTarget)}
                    onMouseEnter={(event) => open(event.currentTarget)}
                    role="img"
                    style={{ background: toneColor(tones[index]), flex: share }}
                    tabIndex={0}
                  >
                    {share >= 7 ? formatPercent(share) : ""}
                  </i>
                );
              })}
              {tip?.group === groupIndex ? (
                <div
                  className={styles.tip}
                  ref={(element) => {
                    const box = element?.parentElement;
                    if (!element || !box) return;
                    const half = element.offsetWidth / 2;
                    element.style.left = `${clamp(tip.left, half, Math.max(half, box.clientWidth - half))}px`;
                  }}
                  role="status"
                  style={{ top: -6 }}
                >
                  {tip.text}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <VizLegend items={series.map((item, index) => ({ label: item.label, tone: tones[index] }))} />
      <VizDataTable
        caption={caption}
        head={["group", ...series.map((item) => item.label)]}
        rows={groups.map((group) => [group.label, ...series.map((_, index) => formatPercent(group.shares[index] ?? 0))])}
      />
    </>
  );
}

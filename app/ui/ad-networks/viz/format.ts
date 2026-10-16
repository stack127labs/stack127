// Shared by every ad network visual. Fixed en-US formats keep the server and browser output identical.

/** The visual's fill steps: accent at three strengths, neutral at three, and the empty track. */
export type VizTone = "ac" | "ac2" | "ac3" | "n1" | "n2" | "n3" | "track";

/** The CSS color for a tone. The values live in `viz.module.css` under `.tokens`. */
export const toneColor = (tone: VizTone) => (tone === "track" ? "var(--color-surface-2)" : `var(--viz-${tone})`);

/** Strong accent fills take dark text in dark mode and white text in light mode. */
export const onAccent = (tone: VizTone) => tone === "ac" || tone === "ac2";

/** The default order of tones for parts of a whole, largest first. */
export const partTones: readonly VizTone[] = ["ac", "ac2", "ac3", "n1", "n2", "n3"];

export const formatNumber = (value: number) => value.toLocaleString("en-US");

/** `7,000` reads `7k`, `7,500` reads `7.5k`, `1,200,000` reads `1.2M`. */
export function formatCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(value / 1_000)}k`;
  return trim(value);
}

const trim = (value: number) => String(Number(value.toFixed(1)));

/**
 * A percent from 0 to 100 for labels. Whole percents, except near the ends: a tiny nonzero value
 * reads `<1%`, and only a complete 100 reads `100%` (99.96 reads `99.9%`). Round only for the
 * label; keep raw values for sums, widths, and remainders.
 */
export function formatPercent(value: number) {
  if (value > 0 && value < 1) return "<1%";
  if (value >= 99.5 && value < 100) return `${Math.min(99.9, Math.floor(value * 10) / 10)}%`;
  return `${Math.round(value)}%`;
}

/** A share from 0 to 1 as a percent label, with the same rules as `formatPercent`. */
export const formatShare = (share: number) => formatPercent(share * 100);

/** `+12`, `−4` (true minus sign), `0`. */
export const formatSigned = (value: number) => (value > 0 ? `+${formatNumber(value)}` : value < 0 ? `−${formatNumber(-value)}` : "0");

/** A round step that splits `span` into about `count` parts: 1, 2, 2.5, or 5 times a power of ten. */
export function niceStep(span: number, count: number) {
  const raw = Math.max(span, 1e-9) / Math.max(count, 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10) * power;
}

/** Axis bounds and ticks around the data. `zero` keeps the axis starting at 0. */
export function niceScale(values: readonly number[], count = 3, zero = false) {
  const min = zero ? 0 : Math.min(...values);
  const max = Math.max(...values, zero ? 1 : -Infinity);
  const span = max - min || Math.abs(max) || 1;
  const step = niceStep(span, count);
  const low = zero ? 0 : Math.floor(min / step) * step;
  const high = Math.max(Math.ceil(max / step) * step, low + step);
  const ticks: number[] = [];
  for (let tick = low; tick <= high + step / 2; tick += step) ticks.push(Number(tick.toFixed(6)));
  return { low, high, ticks };
}

export const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** Charts with this many values or fewer carry a visually hidden data table. */
export const DATA_TABLE_LIMIT = 60;

/**
 * Axis bounds for lines: some room below the lowest point, and the top snapped to the next round
 * tick when the data comes close to it. Ticks are the round steps inside the bounds.
 */
export function lineScale(values: readonly number[], count = 3) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max) || 1;
  const step = niceStep(span, count);
  const ceiling = Math.ceil(max / step) * step;
  const low = min - span * 0.12;
  const high = ceiling - max < step * 0.35 ? ceiling : max + span * 0.12;
  const ticks: number[] = [];
  for (let tick = Math.ceil(low / step) * step; tick <= high + 1e-9; tick += step) if (tick > low) ticks.push(Number(tick.toFixed(6)));
  return { low, high, ticks };
}

/**
 * Where a value sits on fixed steps such as `0, 1k, 10k, 50k, 100k, 500k, 1M`: zero and below on
 * the first step, others placed on a log scale between the two steps around them, so 25k sits
 * a little past halfway from 10k to 50k. Values past the last step stay on it.
 */
export function logStepPosition(value: number, steps: readonly number[]) {
  if (!steps.length) return 0;
  if (value <= steps[0]) return 0;
  for (let index = 1; index < steps.length; index += 1) {
    if (value > steps[index]) continue;
    const low = steps[index - 1];
    const high = steps[index];
    if (value === high) return index;
    // A zero step has no log; values below the next step's half-way read as just past it.
    const from = low > 0 ? Math.log10(low) : Math.log10(high) - 1;
    const share = Math.max(0, (Math.log10(value) - from) / (Math.log10(high) - from));
    return index - 1 + Math.min(1, share);
  }
  return steps.length - 1;
}

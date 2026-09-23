/**
 * Clean chart style tokens. Marker art explains concepts vaguely on purpose;
 * clean charts state data precisely. Straight lines, exact geometry, real
 * axes, tabular numerals. The style guide lives in
 * stack127_docs/design-system.md.
 *
 * Colors are emitted as CSS variables (var(--ma-<tone>, <fallback>)) so charts
 * share the same semantic tone system as marker art and theme with the site.
 * Fallbacks are the dark palette so a raw .svg renders standalone.
 */
export const CHART = {
  name: "clean-charts",
  strokeWidth: 1.5,
  font: "var(--font-sans),ui-sans-serif,system-ui,sans-serif",
  monoFont: "var(--font-mono),ui-monospace,Menlo,Consolas,monospace",
  baseSize: 13,
  // semantic tones -> dark-mode fallback hex (light mode comes from globals.css)
  tones: {
    ink: "#f2f2ee", // axes, default text
    sub: "#9d9c95", // gridlines, secondary labels
    primary: "#bafc3c", // the subject series
    good: "#7ddc64",
    warn: "#ff8a80",
    note: "#ffb757",
    bg: "#101010",
    grid: "rgba(255,255,255,.14)",
  },
  width: 640,
  height: 320,
};

/** '@tone' string helpers used across builders. */
export const T = Object.fromEntries(
  Object.keys(CHART.tones).map((k) => [k, "@" + k]),
);

/** Map a color value ('@tone' token or raw color) to its final CSS value. */
export function resolveColor(value) {
  if (typeof value === "string" && value.startsWith("@")) {
    const tone = value.slice(1);
    const fallback = CHART.tones[tone];
    if (!fallback) throw new Error(`unknown chart tone: ${value}`);
    return `var(--ma-${tone},${fallback})`;
  }
  return value;
}

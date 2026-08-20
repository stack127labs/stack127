/**
 * Marker art style tokens. Single source of truth for how marker art looks.
 * The style guide lives in stack127_docs/marker-art.md. Change values here,
 * rerun the generator, and every figure on the site updates identically.
 *
 * Colors are emitted as CSS variables (var(--ma-<tone>, <fallback>)) so art
 * themes with the site. Fallbacks are the dark palette because dark is the
 * site default and lets a generated .svg render standalone.
 */
export const MARKER = {
  name: "marker-art",
  // hand drawn look
  roughness: 2.1,
  bowing: 1,
  strokeWidth: 2.6,
  fillStyle: "zigzag",
  hachureGap: 7,
  // typography inside figures
  font: "var(--font-marker),'Shantell Sans','Comic Sans MS',cursive",
  monoFont: "ui-monospace,Menlo,Monaco,Consolas,monospace",
  baseSize: 13,
  // semantic tones -> dark-mode fallback hex (light mode comes from globals.css)
  tones: {
    ink: "#f2f2ee", // default stroke and text
    sub: "#9d9c95", // secondary text, axes
    primary: "#bafc3c", // the subject, the main thing
    good: "#7ddc64", // good, recommended, safe, light
    warn: "#ff8a80", // heavy, costly, risky, avoid
    note: "#ffb757", // neutral highlight, sticky notes
    bg: "#101010", // page background (donut holes, badges)
    grid: "rgba(255,255,255,.12)", // faint guide lines
  },
  // canvas defaults; figures may compute their own height
  width: 340,
  height: 240,
};

/** '@tone' string helpers used across builders. */
export const T = Object.fromEntries(
  Object.keys(MARKER.tones).map((k) => [k, "@" + k]),
);

/** Map a color value ('@tone' token or raw color) to its final CSS value. */
export function resolveColor(value) {
  if (typeof value === "string" && value.startsWith("@")) {
    const tone = value.slice(1);
    const fallback = MARKER.tones[tone];
    if (!fallback) throw new Error(`unknown marker tone: ${value}`);
    return `var(--ma-${tone},${fallback})`;
  }
  return value;
}

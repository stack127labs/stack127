/**
 * Clean chart builders. Each takes (spec, C) and draws onto the Canvas.
 * Geometry is always computed from the numbers in the spec; nobody eyeballs a
 * bar length or an axis position. New chart types get added here once and
 * become available everywhere.
 *
 * Specs are documented in stack127_docs/visual-first.md.
 */
import { CHART } from "./config.mjs";
import { formatValue, measureText, niceCeil } from "./svg.mjs";

const toneOf = (t) => "@" + (t || "primary");

/* ---------------- bar: horizontal comparison of exact values ---------------- */
function bar(spec, C) {
  const d = spec.data;
  const items = d.sorted === false ? d.items : [...d.items].sort((a, b) => b.value - a.value);
  const rowH = 34;
  const top = d.unit ? 30 : 12;
  C.h = spec.height || top + items.length * rowH + 24;

  const labelW = Math.max(...items.map((i) => measureText(i.label))) + 14;
  const valueW = Math.max(...items.map((i) => measureText(formatValue(i.value, d.valueFormat), 12.5, true))) + 14;
  const x0 = Math.min(Math.max(labelW, 80), 200);
  const barMax = C.w - x0 - valueW - 24;
  const ceiling = niceCeil(Math.max(...items.map((i) => i.value)));

  if (d.unit) C.text(x0, 18, d.unit, { size: 12, color: "@sub" });

  // quarter gridlines behind the bars, exact and quiet
  for (let i = 1; i <= 4; i++) {
    const gx = x0 + (barMax * i) / 4;
    C.line(gx, top - 2, gx, C.h - 20, { stroke: "@grid", strokeWidth: 1 });
  }
  C.line(x0, top - 2, x0, C.h - 20, { stroke: "@sub", strokeWidth: 1 });

  items.forEach((item, index) => {
    const y = top + index * rowH;
    const w = Math.max((item.value / ceiling) * barMax, 2);
    C.text(x0 - 10, y + 21, item.label, { anchor: "end", size: 13 });
    C.rect(x0, y + 8, w, 18, { fill: toneOf(item.tone), rx: 2 });
    C.text(x0 + w + 10, y + 21, formatValue(item.value, d.valueFormat), {
      size: 12.5,
      mono: true,
      color: "@sub",
    });
  });
}

/* ---------------- line: exact values over an ordered axis ---------------- */
function line(spec, C) {
  const d = spec.data;
  const series = d.series;
  const top = 16;
  const bottom = C.h - 44;
  const legendW = Math.max(...series.map((s) => measureText(s.label, 12.5))) + 30;
  const left = 16 + Math.max(...[niceCeil(maxPoint(series))].map((v) => measureText(formatValue(v, d.valueFormat), 12, true))) + 10;
  const right = C.w - Math.max(legendW, 20) - 12;

  const ceiling = niceCeil(maxPoint(series));
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const value = (ceiling * i) / ticks;
    const y = bottom - ((bottom - top) * i) / ticks;
    C.line(left, y, right, y, { stroke: i === 0 ? "@sub" : "@grid", strokeWidth: 1 });
    C.text(left - 8, y + 4, formatValue(value, d.valueFormat), {
      anchor: "end",
      size: 12,
      mono: true,
      color: "@sub",
    });
  }

  const n = d.xLabels.length;
  const xAt = (i) => left + ((right - left) * i) / Math.max(n - 1, 1);
  const yAt = (v) => bottom - ((bottom - top) * v) / ceiling;

  d.xLabels.forEach((label, i) => {
    // thin out crowded axes: always show first and last, then every step
    const step = Math.ceil(n / 8);
    if (i % step !== 0 && i !== n - 1) return;
    C.text(xAt(i), bottom + 20, label, { anchor: "middle", size: 12, color: "@sub" });
  });

  series.forEach((s) => {
    const tone = toneOf(s.tone);
    C.polyline(s.points.map((v, i) => [xAt(i), yAt(v)]), { stroke: tone, strokeWidth: 2 });
    s.points.forEach((v, i) => C.circle(xAt(i), yAt(v), 3, { fill: tone }));
  });

  // legend, right side, one line per series
  series.forEach((s, i) => {
    const y = top + 10 + i * 20;
    C.line(right + 12, y - 4, right + 26, y - 4, { stroke: toneOf(s.tone), strokeWidth: 2.5 });
    C.text(right + 32, y, s.label, { size: 12.5, color: "@ink" });
  });

  if (d.unit) C.text(left, top - 2, d.unit, { size: 12, color: "@sub" });
}

function maxPoint(series) {
  return Math.max(...series.flatMap((s) => s.points));
}

export const FIGURES = {
  bar,
  line,
};

import { CHART, resolveColor } from "./config.mjs";

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Rough width of a text run, for layout math. Sans ~0.56em, mono 0.6em. */
export function measureText(str, size = CHART.baseSize, mono = false) {
  return String(str).length * size * (mono ? 0.6 : 0.56);
}

/**
 * Precise SVG surface. Unlike the marker Art class there is no roughness or
 * seeding: geometry lands exactly where the numbers say.
 */
export class Canvas {
  constructor(spec) {
    this.spec = spec;
    this.w = spec.width || CHART.width;
    this.h = spec.height || CHART.height;
    this.els = [];
  }

  rect(x, y, w, h, { fill = "none", stroke = "none", strokeWidth = CHART.strokeWidth, rx = 0 } = {}) {
    this.els.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${resolveColor(fill)}" stroke="${resolveColor(stroke)}"${stroke === "none" ? "" : ` stroke-width="${strokeWidth}"`}/>`,
    );
  }

  line(x1, y1, x2, y2, { stroke = "@ink", strokeWidth = CHART.strokeWidth, dash } = {}) {
    this.els.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${resolveColor(stroke)}" stroke-width="${strokeWidth}"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="round"/>`,
    );
  }

  polyline(points, { stroke = "@primary", strokeWidth = 2 } = {}) {
    const d = points.map(([x, y]) => `${x},${y}`).join(" ");
    this.els.push(
      `<polyline points="${d}" fill="none" stroke="${resolveColor(stroke)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }

  circle(cx, cy, r, { fill = "@primary", stroke = "none" } = {}) {
    this.els.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${resolveColor(fill)}" stroke="${resolveColor(stroke)}"/>`,
    );
  }

  text(x, y, str, { size = CHART.baseSize, anchor = "start", color = "@ink", mono = false, weight = 400 } = {}) {
    this.els.push(
      `<text x="${x}" y="${y}" font-family="${mono ? CHART.monoFont : CHART.font}" font-size="${size}" text-anchor="${anchor}" fill="${resolveColor(color)}"${weight !== 400 ? ` font-weight="${weight}"` : ""}${mono ? ` style="font-variant-numeric:tabular-nums"` : ""}>${esc(str)}</text>`,
    );
  }

  serialize() {
    const title = esc(this.spec.takeaway || this.spec.id);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-labelledby="${this.spec.id}-title">` +
      `<title id="${this.spec.id}-title">${title}</title>` +
      this.els.join("") +
      `</svg>`
    );
  }
}

/** Round a max value up to a friendly tick ceiling (1/2/5 times a power of 10). */
export function niceCeil(value) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * power) return step * power;
  }
  return 10 * power;
}

/** Format a value with the spec's format string, "%v" is the number. */
export function formatValue(value, format) {
  const rendered = Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
  return format ? format.replaceAll("%v", rendered) : rendered;
}

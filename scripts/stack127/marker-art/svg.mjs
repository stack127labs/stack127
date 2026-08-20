/**
 * Art: a build-time drawing surface. Wraps rough.js's DOM-free generator,
 * collects elements, and serializes to a final SVG string with semantic
 * CSS-variable colors. No rough.js ever ships to the browser.
 */
import rough from "roughjs";
import { MARKER, resolveColor } from "./config.mjs";

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ESC[c]);
}

/** Round long decimals in a path d string to keep files small. */
function roundD(d) {
  return d.replace(/-?\d+\.\d{3,}/g, (m) => Number(m).toFixed(2));
}

/** Rough estimate of rendered text width for lint. Handwritten fonts run wide. */
export function measureText(str, size, mono) {
  return String(str).length * size * (mono ? 0.62 : 0.55) + 2;
}

export class Art {
  constructor(spec) {
    this.spec = spec;
    this.w = spec.width || MARKER.width;
    this.h = spec.height || MARKER.height;
    this.gen = rough.generator();
    this.els = [];
    this.textBoxes = []; // for overlap lint
    this.bounds = null;
    this._seed = (spec.seed || 42) * 1000;
  }

  /** Default rough options; every shape gets a fresh deterministic seed. */
  opt(over = {}) {
    this._seed++;
    return {
      stroke: "@ink",
      strokeWidth: MARKER.strokeWidth,
      roughness: MARKER.roughness,
      bowing: MARKER.bowing,
      fillStyle: MARKER.fillStyle,
      fillWeight: MARKER.strokeWidth * 0.5,
      hachureGap: MARKER.hachureGap,
      seed: this._seed,
      ...over,
    };
  }

  _push(drawable) {
    for (const p of this.gen.toPaths(drawable)) {
      const d = roundD(p.d);
      this.els.push({
        kind: "path",
        d,
        stroke: p.stroke,
        fill: p.fill && p.fill !== "none" ? p.fill : "none",
        sw: p.strokeWidth,
      });
      this._includePathBounds(d, p.strokeWidth);
    }
  }

  _includeBounds(x0, y0, x1, y1, pad = 0) {
    if (![x0, y0, x1, y1].every(Number.isFinite)) return;
    const b = {
      x0: Math.min(x0, x1) - pad,
      y0: Math.min(y0, y1) - pad,
      x1: Math.max(x0, x1) + pad,
      y1: Math.max(y0, y1) + pad,
    };
    if (!this.bounds) {
      this.bounds = b;
      return;
    }
    this.bounds.x0 = Math.min(this.bounds.x0, b.x0);
    this.bounds.y0 = Math.min(this.bounds.y0, b.y0);
    this.bounds.x1 = Math.max(this.bounds.x1, b.x1);
    this.bounds.y1 = Math.max(this.bounds.y1, b.y1);
  }

  _includePathBounds(d, strokeWidth = MARKER.strokeWidth) {
    const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (nums.length < 2) return;
    const xs = [];
    const ys = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      xs.push(nums[i]);
      ys.push(nums[i + 1]);
    }
    this._includeBounds(
      Math.min(...xs),
      Math.min(...ys),
      Math.max(...xs),
      Math.max(...ys),
      Math.max(strokeWidth || 0, MARKER.strokeWidth),
    );
  }

  rect(x, y, w, h, o) {
    this._push(this.gen.rectangle(x, y, w, h, this.opt(o)));
  }
  line(x1, y1, x2, y2, o) {
    this._push(this.gen.line(x1, y1, x2, y2, this.opt(o)));
  }
  ellipse(x, y, w, h, o) {
    this._push(this.gen.ellipse(x, y, w, h, this.opt(o)));
  }
  circle(x, y, d, o) {
    this._push(this.gen.circle(x, y, d, this.opt(o)));
  }
  arc(x, y, w, h, start, stop, closed, o) {
    this._push(this.gen.arc(x, y, w, h, start, stop, closed, this.opt(o)));
  }
  polygon(points, o) {
    this._push(this.gen.polygon(points, this.opt(o)));
  }
  path(d, o) {
    this._push(this.gen.path(d, this.opt(o)));
  }
  curve(points, o) {
    this._push(this.gen.curve(points, this.opt(o)));
  }
  linearPath(points, o) {
    this._push(this.gen.linearPath(points, this.opt(o)));
  }

  /** Solid dot (plain circle, no roughness; used for tiny details). */
  dot(x, y, r, tone = "@ink") {
    this.els.push({ kind: "dot", x, y, r, fill: tone });
    this._includeBounds(x - r, y - r, x + r, y + r);
  }

  /** Text label. Registers a bounding box for the overlap lint. */
  txt(x, y, str, o = {}) {
    const size = o.size || MARKER.baseSize;
    const el = {
      kind: "text",
      x,
      y,
      str: String(str),
      size,
      color: o.color || "@ink",
      anchor: o.anchor || "start",
      mono: !!o.mono,
      bold: !!o.bold,
      rot: o.rot || 0,
      skipStrokeLint: !!o.skipStrokeLint,
    };
    this.els.push(el);
    if (!el.rot) {
      const w = measureText(el.str, size, el.mono);
      const x0 =
        el.anchor === "middle" ? x - w / 2 : el.anchor === "end" ? x - w : x;
      const box = {
        label: el.str,
        x0,
        y0: y - size * 0.82,
        x1: x0 + w,
        y1: y + size * 0.24,
        skipStrokeLint: el.skipStrokeLint,
      };
      this.textBoxes.push(box);
      this._includeBounds(box.x0, box.y0, box.x1, box.y1, 1);
    } else {
      const w = measureText(el.str, size, el.mono);
      this._includeBounds(x - w / 2, y - size, x + w / 2, y + size, 2);
    }
  }

  /** Straight or curved arrow with a hand drawn head. */
  arrow(x1, y1, x2, y2, o = {}) {
    const tone = o.tone || "@ink";
    const sw = o.sw || MARKER.strokeWidth;
    let bx = x1;
    let by = y1;
    if (o.curve) {
      const mx = (x1 + x2) / 2 - (y2 - y1) * o.curve;
      const my = (y1 + y2) / 2 + (x2 - x1) * o.curve;
      this.curve(
        [
          [x1, y1],
          [mx, my],
          [x2, y2],
        ],
        { stroke: tone, strokeWidth: sw },
      );
      bx = mx;
      by = my;
    } else {
      this.line(x1, y1, x2, y2, { stroke: tone, strokeWidth: sw });
    }
    const ang = Math.atan2(y2 - by, x2 - bx);
    const L = 8 + sw * 1.6;
    for (const d of [2.6, -2.6]) {
      this.line(
        x2,
        y2,
        x2 + L * Math.cos(ang + d),
        y2 + L * Math.sin(ang + d),
        { stroke: tone, strokeWidth: sw },
      );
    }
  }

  serialize() {
    const id = this.spec.id;
    const center = this._centerTransform();
    const parts = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-labelledby="ma-title-${esc(id)}" data-marker-art="${esc(id)}">`,
    );
    parts.push(`<title id="ma-title-${esc(id)}">${esc(this.spec.takeaway)}</title>`);
    if (center) parts.push(`<g transform="translate(${center.dx} ${center.dy})">`);
    for (const e of this.els.filter((el) => el.kind !== "text")) {
      if (e.kind === "path") {
        const style = [];
        style.push(`stroke:${resolveColor(e.stroke)}`);
        style.push(
          e.fill === "none" ? "fill:none" : `fill:${resolveColor(e.fill)}`,
        );
        parts.push(
          `<path d="${e.d}" stroke-width="${e.sw}" stroke-linecap="round" fill-rule="evenodd" style="${style.join(";")}"/>`,
        );
      } else if (e.kind === "dot") {
        parts.push(
          `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" style="fill:${resolveColor(e.fill)}"/>`,
        );
      }
    }
    for (const e of this.els.filter((el) => el.kind === "text")) {
      const style = [
        `font-family:${e.mono ? MARKER.monoFont : MARKER.font}`,
        `font-size:${e.size}px`,
        `font-weight:${e.bold ? 700 : 500}`,
        `fill:${resolveColor(e.color)}`,
      ].join(";");
      const rot = e.rot
        ? ` transform="rotate(${e.rot} ${e.x} ${e.y})"`
        : "";
      parts.push(
        `<text x="${e.x}" y="${e.y}" text-anchor="${e.anchor}" style="${style}"${rot}>${esc(e.str)}</text>`,
      );
    }
    if (center) parts.push("</g>");
    parts.push("</svg>");
    return parts.join("\n");
  }

  _centerTransform() {
    if (!this.bounds || this.spec.autoCenter === false) return null;
    const pad = this.spec.framePad ?? 16;
    const desiredDx = this.w / 2 - (this.bounds.x0 + this.bounds.x1) / 2;
    const desiredDy = this.h / 2 - (this.bounds.y0 + this.bounds.y1) / 2;
    const minDx = pad - this.bounds.x0;
    const maxDx = this.w - pad - this.bounds.x1;
    const minDy = pad - this.bounds.y0;
    const maxDy = this.h - pad - this.bounds.y1;
    const dx = minDx <= maxDx ? Math.min(Math.max(desiredDx, minDx), maxDx) : 0;
    const dy = minDy <= maxDy ? Math.min(Math.max(desiredDy, minDy), maxDy) : 0;
    const roundedDx = Math.round(dx * 10) / 10;
    const roundedDy = Math.round(dy * 10) / 10;
    if (Math.abs(roundedDx) < 0.1 && Math.abs(roundedDy) < 0.1) return null;
    return { dx: roundedDx, dy: roundedDy };
  }
}

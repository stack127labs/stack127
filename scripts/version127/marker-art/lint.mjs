/**
 * Marker art lint: spec validation and overlap checks.
 *
 * The overlap check is heuristic (estimated text boxes, no browser at build
 * time). It catches the gross cases; the drawing skill still reviews a real
 * render before calling a figure done.
 */
import { FIGURES } from "./figures.mjs";

const COMMAND_RE = /[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const isCommand = (token) => /^[a-zA-Z]$/.test(token);
const toNum = (token) => Number(token);

function textStrokeBox(box, pad = 0.5) {
  const width = box.x1 - box.x0;
  const size = (box.y1 - box.y0) / 1.06;
  const xInset = Math.min(4, width * 0.08);
  const y = box.y1 - size * 0.24;
  return {
    x0: box.x0 + xInset - pad,
    y0: y - size * 0.65 - pad,
    x1: box.x1 - xInset + pad,
    y1: y + size * 0.04 + pad,
  };
}

function pointInBox(p, b) {
  return p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1;
}

function ccw(a, b, c) {
  return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
}

function segmentsIntersect(a, b, c, d) {
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

function segmentHitsBox(a, b, box) {
  if (
    Math.max(a.x, b.x) < box.x0 ||
    Math.min(a.x, b.x) > box.x1 ||
    Math.max(a.y, b.y) < box.y0 ||
    Math.min(a.y, b.y) > box.y1
  ) {
    return false;
  }
  if (pointInBox(a, box) || pointInBox(b, box)) return true;

  const corners = [
    { x: box.x0, y: box.y0 },
    { x: box.x1, y: box.y0 },
    { x: box.x1, y: box.y1 },
    { x: box.x0, y: box.y1 },
  ];
  for (let i = 0; i < corners.length; i++) {
    if (segmentsIntersect(a, b, corners[i], corners[(i + 1) % corners.length])) {
      return true;
    }
  }
  return false;
}

function sampleLine(from, to) {
  return [[from, to]];
}

function sampleCubic(from, c1, c2, to, steps = 14) {
  const segments = [];
  let prev = from;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const p = {
      x:
        mt * mt * mt * from.x +
        3 * mt * mt * t * c1.x +
        3 * mt * t * t * c2.x +
        t * t * t * to.x,
      y:
        mt * mt * mt * from.y +
        3 * mt * mt * t * c1.y +
        3 * mt * t * t * c2.y +
        t * t * t * to.y,
    };
    segments.push([prev, p]);
    prev = p;
  }
  return segments;
}

function sampleQuadratic(from, c, to, steps = 12) {
  const segments = [];
  let prev = from;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const p = {
      x: mt * mt * from.x + 2 * mt * t * c.x + t * t * to.x,
      y: mt * mt * from.y + 2 * mt * t * c.y + t * t * to.y,
    };
    segments.push([prev, p]);
    prev = p;
  }
  return segments;
}

function pathSegments(d) {
  const tokens = d.match(COMMAND_RE) || [];
  const segments = [];
  let i = 0;
  let cmd = "";
  let cur = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };

  const hasNums = (count) =>
    i + count <= tokens.length && tokens.slice(i, i + count).every((t) => !isCommand(t));
  const point = (relative = false) => {
    const x = toNum(tokens[i++]);
    const y = toNum(tokens[i++]);
    return relative ? { x: cur.x + x, y: cur.y + y } : { x, y };
  };

  while (i < tokens.length) {
    if (isCommand(tokens[i])) cmd = tokens[i++];
    if (!cmd) break;
    const relative = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();

    if (c === "M") {
      if (!hasNums(2)) continue;
      cur = point(relative);
      start = cur;
      while (hasNums(2)) {
        const next = point(relative);
        segments.push(...sampleLine(cur, next));
        cur = next;
      }
      continue;
    }

    if (c === "L") {
      while (hasNums(2)) {
        const next = point(relative);
        segments.push(...sampleLine(cur, next));
        cur = next;
      }
      continue;
    }

    if (c === "H") {
      while (hasNums(1)) {
        const x = toNum(tokens[i++]);
        const next = { x: relative ? cur.x + x : x, y: cur.y };
        segments.push(...sampleLine(cur, next));
        cur = next;
      }
      continue;
    }

    if (c === "V") {
      while (hasNums(1)) {
        const y = toNum(tokens[i++]);
        const next = { x: cur.x, y: relative ? cur.y + y : y };
        segments.push(...sampleLine(cur, next));
        cur = next;
      }
      continue;
    }

    if (c === "C") {
      while (hasNums(6)) {
        const c1 = point(relative);
        const c2 = point(relative);
        const next = point(relative);
        segments.push(...sampleCubic(cur, c1, c2, next));
        cur = next;
      }
      continue;
    }

    if (c === "Q") {
      while (hasNums(4)) {
        const q = point(relative);
        const next = point(relative);
        segments.push(...sampleQuadratic(cur, q, next));
        cur = next;
      }
      continue;
    }

    if (c === "Z") {
      segments.push(...sampleLine(cur, start));
      cur = start;
      continue;
    }

    // Unsupported commands are rare in our generated paths. Skip their numeric tail
    // so a future rough.js output change cannot trap this parser in a loop.
    while (i < tokens.length && !isCommand(tokens[i])) i++;
  }

  return segments;
}

function strokeSegments(A) {
  const out = [];
  for (const el of A.els) {
    if (el.kind === "path") {
      if (el.fill === "@bg" || el.stroke === "@bg") continue;
      for (const [a, b] of pathSegments(el.d)) out.push({ a, b });
    } else if (el.kind === "dot") {
      out.push({
        a: { x: el.x - el.r, y: el.y - el.r },
        b: { x: el.x + el.r, y: el.y + el.r },
      });
    }
  }
  return out;
}

export function validateSpec(spec, file) {
  const errors = [];
  const warnings = [];
  for (const field of ["id", "type", "takeaway", "source", "dataAsOf"]) {
    if (!spec[field]) errors.push(`${file}: missing required field "${field}"`);
  }
  if (spec.type && !FIGURES[spec.type]) {
    errors.push(
      `${file}: unknown figure type "${spec.type}" (have: ${Object.keys(FIGURES).join(", ")})`,
    );
  }
  if (!spec.data) errors.push(`${file}: missing "data"`);

  if (spec.type === "donut" && spec.data?.segments) {
    const sum = spec.data.segments.reduce((s, x) => s + x.value, 0);
    if (spec.data.unit === "%" && Math.abs(sum - 100) > 0.5) {
      errors.push(`${file}: donut percentages sum to ${sum}, expected 100`);
    }
    if (sum <= 0) errors.push(`${file}: donut values must be positive`);
  }
  if (spec.type === "bar" && spec.data?.items) {
    for (const it of spec.data.items) {
      if (typeof it.value !== "number" || Number.isNaN(it.value)) {
        errors.push(`${file}: bar item "${it.label}" has a non numeric value`);
      }
    }
  }
  if (spec.type === "line" && spec.data?.series) {
    for (const s of spec.data.series) {
      if (!Array.isArray(s.points) || s.points.length < 2) {
        errors.push(`${file}: line series "${s.label}" needs at least 2 points`);
      }
    }
  }
  return { errors, warnings };
}

/** Post-render checks on the drawn Art surface. */
export function lintRender(A, file) {
  const errors = [];
  const warnings = [];
  const boxes = A.textBoxes;
  const strokes = strokeSegments(A);

  for (const b of boxes) {
    if (b.x0 < -2 || b.y0 < -2 || b.x1 > A.w + 2 || b.y1 > A.h + 2) {
      warnings.push(
        `${file}: label "${b.label}" may run outside the canvas (${A.w}x${A.h})`,
      );
    }
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox > 3 && oy > 3) {
        errors.push(
          `${file}: labels overlap: "${a.label}" and "${b.label}" (move one in the spec)`,
        );
      }
    }
  }

  for (const b of boxes) {
    if (b.skipStrokeLint) continue;
    const expanded = textStrokeBox(b);
    const hit = strokes.some((s) => segmentHitsBox(s.a, s.b, expanded));
    if (hit) {
      errors.push(
        `${file}: label "${b.label}" overlaps a drawn stroke or icon (move the text or shape)`,
      );
    }
  }
  return { errors, warnings };
}

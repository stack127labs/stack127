/**
 * Figure builders. Each takes (spec, A) and draws onto the Art surface.
 * Geometry for data figures (bar, donut, line) is always computed from the
 * numbers in the spec: nobody eyeballs a bar length or a pie angle.
 *
 * Specs are documented in stack127_docs/marker-art.md. New figure types get
 * added here once and become available everywhere.
 */
import { MARKER } from "./config.mjs";
import { measureText } from "./svg.mjs";
import { drawIcon } from "./icons.mjs";

const toneOf = (t) => "@" + (t || "ink");

function drawCheck(A, x, y, tone = "@primary") {
  A.linearPath(
    [
      [x - 9, y],
      [x - 3, y + 7],
      [x + 11, y - 9],
    ],
    { stroke: tone, strokeWidth: MARKER.strokeWidth + 0.5 },
  );
}

function drawCross(A, x, y, size = 14, tone = "@warn") {
  A.line(x - size / 2, y - size / 2, x + size / 2, y + size / 2, {
    stroke: tone,
    strokeWidth: MARKER.strokeWidth + 0.5,
  });
  A.line(x + size / 2, y - size / 2, x - size / 2, y + size / 2, {
    stroke: tone,
    strokeWidth: MARKER.strokeWidth + 0.5,
  });
}

function drawFolder(A, x, y, w, h, tone = "@ink") {
  A.path(
    `M${x} ${y + 16} L${x + w} ${y + 16} L${x + w} ${y + h} L${x} ${y + h} Z ` +
      `M${x + 4} ${y + 16} L${x + 26} ${y} L${x + 78} ${y} L${x + 92} ${y + 16}`,
    { stroke: tone },
  );
}

function drawPanel(A, x, y, w, h, label, tone = "@ink") {
  A.rect(x, y, w, h, { stroke: tone });
  if (label) A.txt(x + w / 2, y + 23, label, { anchor: "middle", size: 12, color: "@sub" });
}

/* ---------------- bar: comparisons ---------------- */
function bar(spec, A) {
  const d = spec.data;
  const items = d.items;
  const labelW =
    Math.max(...items.map((i) => measureText(i.label, 12.5))) + 10;
  const x0 = Math.min(Math.max(labelW + 8, 70), 150);
  const maxV = Math.max(...items.map((i) => i.value));
  const barMax = A.w - x0 - 60;
  A.h = spec.height || 34 + items.length * 38 + 6;

  if (d.unit) A.txt(x0 + 2, 22, d.unit, { size: 11, color: "@sub" });
  A.line(x0 - 2, 28, x0 - 2, A.h - 6, { stroke: "@sub" });
  items.forEach((it, i) => {
    const y = 36 + i * 38;
    const w = Math.max((it.value / maxV) * barMax, 6);
    const tone = toneOf(it.tone);
    A.txt(x0 - 8, y + 15, it.label, { anchor: "end", size: 12.5 });
    A.rect(x0, y, w, 20, { stroke: tone, fill: tone });
    A.txt(x0 + w + 16, y + 14, String(it.value), {
      size: 11,
      mono: true,
      color: "@sub",
    });
  });
  if (d.note) {
    const nx = A.w - 22;
    A.txt(nx, 22, d.note.text, { anchor: "end", size: 12.5, color: "@sub" });
    const ty = 36 + (d.note.pointsTo || 0) * 38 + 10;
    A.arrow(nx - 20, 28, x0 + (items[d.note.pointsTo || 0].value / maxV) * barMax + 6, ty, {
      tone: toneOf(d.note.tone || "warn"),
      curve: 0.3,
    });
  }
}

/* ---------------- donut: composition ---------------- */
function donut(spec, A) {
  const d = spec.data;
  const cx = 100;
  const cy = A.h / 2 + 6;
  const D = Math.min(A.h - 80, 160);
  const total = d.segments.reduce((s, x) => s + x.value, 0);
  let a = -Math.PI / 2;
  d.segments.forEach((s, i) => {
    const a2 = a + (s.value / total) * 2 * Math.PI;
    const tone = toneOf(s.tone);
    A.arc(cx, cy, D, D, a, a2, true, {
      stroke: tone,
      fill: tone,
      hachureAngle: 41 + i * 49,
    });
    a = a2;
  });
  A.circle(cx, cy, D * 0.56, { stroke: "@ink", fill: "@bg", fillStyle: "solid" });
  if (d.centerLabel)
    A.txt(cx, cy + 2, d.centerLabel, {
      anchor: "middle",
      size: 17,
      bold: true,
      skipStrokeLint: true,
    });
  if (d.centerSub)
    A.txt(cx, cy + 20, d.centerSub, {
      anchor: "middle",
      size: 10.5,
      color: "@sub",
      skipStrokeLint: true,
    });
  d.segments.forEach((s, i) => {
    const y = cy - D / 2 + 18 + i * 34;
    const tone = toneOf(s.tone);
    A.rect(200, y - 12, 15, 15, { stroke: tone, fill: tone });
    const pct = Math.round((s.value / total) * 100);
    A.txt(224, y, `${s.label} · ${pct}%`, { size: 12.5 });
  });
}

/* ---------------- line: change over time ---------------- */
function line(spec, A) {
  const d = spec.data;
  const padL = 46;
  const padR = 22;
  const top = 28;
  const bottom = A.h - 50;
  const allX = d.series.flatMap((s) => s.points.map((p) => p[0]));
  const allY = d.series.flatMap((s) => s.points.map((p) => p[1]));
  const xMin = d.xMin ?? Math.min(...allX);
  const xMax = d.xMax ?? Math.max(...allX);
  const yMin = d.yMin ?? 0;
  const yMax = d.yMax ?? Math.max(...allY) * 1.1;
  const X = (v) => padL + ((v - xMin) / (xMax - xMin)) * (A.w - padL - padR);
  const Y = (v) => bottom - ((v - yMin) / (yMax - yMin)) * (bottom - top);

  if (d.title) A.txt(padL, 20, d.title, { size: 11, color: "@sub" });
  for (const t of d.yTicks || []) {
    if (t.v !== yMin)
      A.line(padL, Y(t.v), A.w - padR, Y(t.v), { stroke: "@grid", roughness: 0.6 });
    A.txt(padL - 6, Y(t.v) + 4, t.label ?? String(t.v), {
      anchor: "end",
      size: 10,
      mono: true,
      color: "@sub",
    });
  }
  A.line(padL, bottom, A.w - padR, bottom, { stroke: "@sub" });
  A.line(padL, bottom, padL, top, { stroke: "@sub" });
  for (const t of d.xTicks || []) {
    A.txt(X(t.v), bottom + 16, t.label ?? String(t.v), {
      anchor: "middle",
      size: 10,
      mono: true,
      color: "@sub",
    });
  }
  d.series.forEach((s) => {
    const tone = toneOf(s.tone);
    A.curve(
      s.points.map((p) => [X(p[0]), Y(p[1])]),
      { stroke: tone, strokeWidth: MARKER.strokeWidth + 0.4 },
    );
    if (s.dots) s.points.forEach((p) => A.dot(X(p[0]), Y(p[1]), 2, tone));
    const last = s.points[s.points.length - 1];
    A.txt(X(last[0]) - 2, Y(last[1]) - 12, s.label, {
      anchor: "end",
      size: 12.5,
      color: tone,
    });
  });
  if (d.note) {
    A.txt(d.note.x, d.note.y, d.note.text, { size: 12.5, color: "@sub" });
    if (d.note.arrowTo)
      A.arrow(d.note.x + 30, d.note.y + 8, d.note.arrowTo[0], d.note.arrowTo[1], {
        tone: "@sub",
        curve: 0.25,
      });
  }
}

/* ---------------- compose-map: annotated compose file ---------------- */
function composeMap(spec, A) {
  const d = spec.data;
  A.w = spec.width || 440;
  A.h = spec.height || 250;
  const codeX = 26;
  const codeY = 25;
  const codeW = 218;
  const lineH = 19;
  A.rect(codeX, codeY, codeW, 198, { stroke: "@ink" });
  A.txt(codeX + 12, codeY + 20, d.title || "compose.yml", {
    size: 12,
    mono: true,
    color: "@sub",
  });

  const lineYs = {};
  (d.lines || []).forEach((line, i) => {
    const y = codeY + 46 + i * lineH;
    lineYs[line.id] = y;
    const tone = toneOf(line.tone);
    if (line.tone) A.line(codeX + 10, y + 5, codeX + codeW - 12, y + 5, { stroke: tone });
    A.txt(codeX + 14, y, line.text, {
      size: 10.5,
      mono: true,
      color: line.tone ? tone : "@ink",
    });
  });

  (d.callouts || []).forEach((c, i) => {
    const y = 48 + i * 41;
    const tone = toneOf(c.tone);
    A.arrow(codeX + codeW - 8, lineYs[c.line] + 1, 278, y - 2, {
      tone,
      curve: i % 2 ? -0.08 : 0.08,
    });
    A.txt(294, y, c.label, { size: 12.5, color: tone });
    if (c.sub) A.txt(294, y + 16, c.sub, { size: 10.5, color: "@sub" });
  });
}

/* ---------------- port-map: host port to container port ---------------- */
function portMap(spec, A) {
  const d = spec.data;
  A.w = spec.width || 430;
  A.h = spec.height || 220;
  drawIcon(A, "laptop", 58, 104, 40, "@ink");
  A.txt(58, 154, d.client || "browser", { anchor: "middle", size: 12, color: "@sub" });
  A.txt(58, 171, d.clientSub || "server ip:8080", {
    anchor: "middle",
    size: 10.5,
    color: "@sub",
  });

  drawPanel(A, 162, 34, 210, 142, d.server || "server", "@ink");
  A.rect(206, 82, 122, 58, { stroke: "@ink" });
  A.txt(267, 112, d.container || "container", { anchor: "middle", size: 12.5 });
  A.txt(267, 130, d.containerSub || "port 80", {
    anchor: "middle",
    size: 10.5,
    color: "@sub",
  });

  A.arrow(82, 104, 158, 104, { tone: "@primary", curve: -0.05 });
  A.txt(120, 88, d.hostPort || ":8080", { anchor: "middle", mono: true, size: 12, color: "@primary" });
  A.arrow(184, 104, 202, 104, { tone: "@primary" });
  A.txt(184, 154, d.map || "8080 -> 80", { mono: true, size: 12, color: "@primary" });
}

/* ---------------- survival: replaceable container, persistent data ---------------- */
function survival(spec, A) {
  const d = spec.data;
  A.w = spec.width || 420;
  A.h = spec.height || 230;
  A.rect(36, 52, 128, 62, { stroke: "@sub" });
  A.txt(100, 83, d.replaceable || "container", { anchor: "middle", size: 12, color: "@sub" });
  A.txt(100, 101, d.replaceSub || "replaceable", { anchor: "middle", size: 10.5, color: "@sub" });
  drawCross(A, 150, 52, 18, "@sub");

  drawFolder(A, 230, 42, 128, 86, "@primary");
  A.txt(294, 82, d.folder || "./data", { anchor: "middle", mono: true, size: 14, color: "@primary" });
  A.txt(294, 102, d.folderSub || "keep this", { anchor: "middle", size: 10.5, color: "@sub" });

  drawIcon(A, "disk", 294, 166, 42, "@ink");
  A.txt(294, 207, d.disk || "server disk", { anchor: "middle", size: 11, color: "@sub" });
  A.arrow(162, 86, 228, 86, { tone: "@sub", curve: -0.08 });
  A.txt(194, 72, d.writes || "writes", { anchor: "middle", size: 10.5, color: "@sub" });
  A.arrow(294, 128, 294, 145, { tone: "@primary" });
}

/* ---------------- tunnel: private remote path ---------------- */
function tunnel(spec, A) {
  const d = spec.data;
  A.w = spec.width || 420;
  A.h = spec.height || 230;
  drawIcon(A, "phone", 52, 122, 34, "@ink");
  A.txt(52, 170, d.remote || "away phone", { anchor: "middle", size: 11, color: "@sub" });
  drawIcon(A, "cloud", 160, 74, 42, "@sub");
  A.txt(160, 28, d.internet || "internet", { anchor: "middle", size: 11, color: "@sub" });
  drawIcon(A, "server", 336, 122, 42, "@ink");
  A.txt(336, 170, d.server || "home server", { anchor: "middle", size: 11, color: "@sub" });

  A.arrow(74, 136, 314, 136, { tone: "@primary", curve: 0.1, sw: MARKER.strokeWidth + 0.4 });
  A.txt(202, 210, d.tunnel || "tailscale tunnel", {
    anchor: "middle",
    size: 12.5,
    color: "@primary",
  });
  drawIcon(A, "lock", 202, 166, 20, "@primary");

  A.arrow(160, 92, 308, 92, { tone: "@warn", curve: 0.12 });
  drawCross(A, 244, 78, 18, "@warn");
  A.txt(245, 63, d.blocked || "no public port", { anchor: "middle", size: 10.5, color: "@sub" });
}

/* ---------------- stack: calm layer stack ---------------- */
function stack(spec, A) {
  const d = spec.data;
  A.w = spec.width || 380;
  A.h = spec.height || 230;
  const rows = d.layers || [];
  const x = 72;
  const w = 236;
  const h = 34;
  const gap = 12;
  const startY = 42;
  rows.forEach((row, i) => {
    const y = startY + i * (h + gap);
    const tone = toneOf(row.tone);
    A.rect(x, y, w, h, { stroke: row.tone ? tone : "@ink" });
    A.txt(x + w / 2, y + 22, row.label, {
      anchor: "middle",
      size: 12.5,
      color: row.tone ? tone : "@ink",
    });
  });
  if (d.note) {
    drawCheck(A, x + w + 34, startY + (d.note.layer || rows.length - 1) * (h + gap) + 16, "@primary");
    A.txt(x + w + 52, startY + (d.note.layer || rows.length - 1) * (h + gap) + 20, d.note.text, {
      size: 11,
      color: "@sub",
    });
  }
}

/* ---------------- tradeoff: compact choice table ---------------- */
function tradeoff(spec, A) {
  const d = spec.data;
  const rows = d.rows || [];
  A.w = spec.width || 430;
  A.h = spec.height || 46 + rows.length * 38;
  const x = 28;
  const y = 28;
  const cols = d.cols || [130, 80, 80, 80];
  A.line(x, y + 24, x + cols.reduce((s, v) => s + v, 0), y + 24, { stroke: "@sub" });
  let cx = x;
  (d.headers || []).forEach((h, i) => {
    A.txt(cx + 4, y + 15, h, { size: 10.5, color: "@sub" });
    cx += cols[i] || 80;
  });
  rows.forEach((row, r) => {
    const yy = y + 48 + r * 38;
    if (row.tone) A.line(x - 4, yy - 12, x - 4, yy + 14, { stroke: toneOf(row.tone) });
    let xx = x;
    row.cells.forEach((cell, i) => {
      A.txt(xx + 4, yy, cell, {
        size: i === 0 ? 12 : 11,
        color: row.tone && i === 0 ? toneOf(row.tone) : i === 0 ? "@ink" : "@sub",
      });
      xx += cols[i] || 80;
    });
  });
}

/* ---------------- risk-ladder: order of trust ---------------- */
function riskLadder(spec, A) {
  const d = spec.data;
  const items = d.items || [];
  A.w = spec.width || 420;
  A.h = spec.height || 230;
  const startX = 42;
  const baseY = 166;
  const stepW = 102;
  items.forEach((it, i) => {
    const x = startX + i * 112;
    const h = 62 + i * 24;
    const tone = toneOf(it.tone);
    A.rect(x, baseY - h, stepW, h, { stroke: it.tone ? tone : "@ink" });
    A.txt(x + stepW / 2, baseY - h + 28, it.label, {
      anchor: "middle",
      size: 12,
      color: it.tone ? tone : "@ink",
    });
    if (it.sub) A.txt(x + stepW / 2, baseY - h + 46, it.sub, { anchor: "middle", size: 10, color: "@sub" });
  });
  if (d.note) {
    const noteX = startX + stepW * 2.35;
    A.txt(noteX, 36, d.note, { anchor: "middle", size: 11, color: "@primary" });
    A.arrow(noteX + 54, 42, startX + 2 * 112 + stepW - 14, baseY - (62 + 2 * 24) + 8, {
      tone: "@primary",
      curve: 0.08,
    });
  }
}

/* ---------------- restore-loop: backup proof cycle ---------------- */
function restoreLoop(spec, A) {
  const d = spec.data;
  A.w = spec.width || 420;
  A.h = spec.height || 230;
  const pts = [
    [92, 78, "disk", d.live || "live data", 42],
    [296, 78, "usb", d.copy || "copy away", 42],
    [296, 162, "terminal", d.restore || "restore test", 42],
    [92, 162, "shield", d.trust || "trust it", 42],
  ];
  pts.forEach(([x, y, icon, label, labelOffset], i) => {
    const tone = i === 2 ? "@primary" : "@ink";
    drawIcon(A, icon, x, y, 32, tone);
    A.txt(x, i < 2 ? y - labelOffset : y + labelOffset, label, {
      anchor: "middle",
      size: 11,
      color: i === 2 ? tone : "@sub",
    });
  });
  A.arrow(118, 78, 270, 78, { tone: "@sub" });
  A.arrow(296, 102, 296, 138, { tone: "@primary" });
  A.arrow(270, 162, 118, 162, { tone: "@sub" });
  A.arrow(92, 138, 92, 102, { tone: "@sub" });
}

/* ---------------- roadmap: grouped course map ---------------- */
function roadmap(spec, A) {
  const d = spec.data;
  const groups = d.groups || [];
  A.w = spec.width || 480;
  A.h = spec.height || 250;
  const y = 72;
  const gap = 16;
  const w = 76;
  groups.forEach((g, i) => {
    const x = 24 + i * (w + gap);
    const tone = toneOf(g.tone);
    A.rect(x, y, w, 76, { stroke: g.tone ? tone : "@ink" });
    if (g.icon) drawIcon(A, g.icon, x + w / 2, y + 30, 24, g.tone ? tone : "@ink");
    A.txt(x + w / 2, y + 64, g.label, {
      anchor: "middle",
      size: 10.5,
      color: g.tone ? tone : "@sub",
    });
    if (i > 0) A.arrow(x - gap + 4, y + 38, x - 5, y + 38, { tone: "@sub" });
  });
  if (d.note) A.txt(A.w / 2, 194, d.note, { anchor: "middle", size: 12, color: "@sub" });
}

/* ---------------- workbench: first app workspace ---------------- */
function workbench(spec, A) {
  const d = spec.data;
  A.w = spec.width || 430;
  A.h = spec.height || 230;
  drawFolder(A, 34, 54, 112, 74, "@ink");
  A.txt(90, 96, d.folder || "app folder", { anchor: "middle", size: 12, color: "@sub" });
  A.rect(178, 42, 104, 92, { stroke: "@ink" });
  A.txt(230, 72, "compose.yml", { anchor: "middle", mono: true, size: 11, color: "@sub" });
  A.txt(230, 98, "image:", { anchor: "middle", mono: true, size: 10.5 });
  A.txt(230, 116, "ports:", { anchor: "middle", mono: true, size: 10.5, color: "@primary" });
  A.rect(314, 70, 80, 40, { stroke: "@primary" });
  A.txt(354, 94, d.command || "up -d", { anchor: "middle", mono: true, size: 12, color: "@primary" });
  A.arrow(148, 92, 176, 92, { tone: "@sub" });
  A.arrow(284, 92, 312, 92, { tone: "@primary" });
  drawIcon(A, "laptop", 354, 158, 34, "@ink");
  A.txt(354, 202, d.open || "open url", { anchor: "middle", size: 11, color: "@sub" });
  A.arrow(354, 112, 354, 136, { tone: "@sub" });
}

/* ---------------- flow: topology / how pieces connect ---------------- */
function nodeBox(n) {
  if (n.kind === "icon") {
    const r = (n.s || 30) * 0.75;
    return { x0: n.x - r, y0: n.y - r, x1: n.x + r, y1: n.y + r };
  }
  return { x0: n.x, y0: n.y, x1: n.x + n.w, y1: n.y + n.h };
}
function center(b) {
  return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
}
/** Clip the line from box center toward (tx, ty) at the box edge plus pad. */
function edgePoint(b, tx, ty, pad = 5) {
  const [cx, cy] = center(b);
  const dx = tx - cx;
  const dy = ty - cy;
  let t = Infinity;
  if (dx > 0) t = Math.min(t, (b.x1 + pad - cx) / dx);
  if (dx < 0) t = Math.min(t, (b.x0 - pad - cx) / dx);
  if (dy > 0) t = Math.min(t, (b.y1 + pad - cy) / dy);
  if (dy < 0) t = Math.min(t, (b.y0 - pad - cy) / dy);
  if (!isFinite(t)) t = 0;
  return [cx + dx * t, cy + dy * t];
}

function edgeLabelPoint(x1, y1, x2, y2, e) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const curve = e.curve || 0;
  const side = curve ? Math.sign(curve) : -1;
  const offset = e.labelOffset ?? 24;
  return [mx + nx * offset * side, my + ny * offset * side];
}

function flow(spec, A) {
  const d = spec.data;
  const byId = {};
  for (const n of d.nodes) byId[n.id] = n;

  // edges first so nodes draw over the line ends
  for (const e of d.edges || []) {
    const from = byId[e.from];
    const to = byId[e.to];
    const bf = nodeBox(from);
    const bt = nodeBox(to);
    const [tcx, tcy] = center(bt);
    const [fcx, fcy] = center(bf);
    const [x1, y1] = edgePoint(bf, tcx, tcy);
    const [x2, y2] = edgePoint(bt, fcx, fcy);
    A.arrow(x1, y1, x2, y2, { tone: toneOf(e.tone), curve: e.curve });
    if (e.label) {
      const [lx, ly] = edgeLabelPoint(x1, y1, x2, y2, e);
      A.txt(lx, ly, e.label, {
        anchor: "middle",
        size: 11,
        color: "@sub",
      });
    }
  }

  for (const n of d.nodes) {
    const tone = toneOf(n.tone);
    if (n.kind === "icon") {
      drawIcon(A, n.icon, n.x, n.y, n.s || 30, tone);
      if (n.label)
        A.txt(n.x, n.y + (n.s || 30) * 0.85 + 12, n.label, {
          anchor: "middle",
          size: 11,
          color: "@sub",
        });
      if (n.sub)
        A.txt(n.x, n.y + (n.s || 30) * 0.85 + 27, n.sub, {
          anchor: "middle",
          size: 10,
          color: "@sub",
        });
    } else if (n.kind === "group") {
      A.rect(n.x, n.y, n.w, n.h, {
        stroke: tone,
        strokeWidth: MARKER.strokeWidth + 0.6,
      });
      if (n.label)
        A.txt(n.x + n.w / 2, n.y + 22, n.label, {
          anchor: "middle",
          size: 14,
          color: tone,
          bold: true,
        });
    } else {
      // box: colored stroke, no fill, so the label stays readable
      A.rect(n.x, n.y, n.w, n.h, { stroke: tone });
      if (n.label)
        A.txt(n.x + n.w / 2, n.y + n.h / 2 + 4.5, n.label, {
          anchor: "middle",
          size: 12.5,
        });
    }
  }
}

/* ---------------- steps: a numbered path ---------------- */
function steps(spec, A) {
  const items = spec.data.items;
  const perRow = Math.min(spec.data.perRow || 5, 5);
  const stepGap = spec.data.stepGap || 92;
  const sidePad = spec.data.sidePad || 56;
  const rowH = 96;
  const rows = Math.ceil(items.length / perRow);
  A.w = spec.width || Math.max(MARKER.width, sidePad * 2 + (perRow - 1) * stepGap);
  A.h = spec.height || rows * rowH + 56;

  const pos = items.map((_, i) => {
    const row = Math.floor(i / perRow);
    const rowStart = row * perRow;
    const rowCount = Math.min(perRow, items.length - rowStart);
    const col = i % perRow;
    const visualCol = row % 2 === 0 ? col : rowCount - 1 - col;
    const startX = A.w / 2 - ((rowCount - 1) * stepGap) / 2;
    const x = startX + visualCol * stepGap;
    return [x, 64 + row * rowH];
  });
  pos.forEach((p, i) => {
    if (i === 0) return;
    const [px, py] = pos[i - 1];
    const [x, y] = p;
    if (py === y) {
      const dir = x > px ? 1 : -1;
      A.arrow(px + 28 * dir, py, x - 28 * dir, y, {});
    } else {
      A.arrow(px, py + 28, x, y - 28, {});
    }
  });
  items.forEach((it, i) => {
    const [x, y] = pos[i];
    const tone = toneOf(it.tone);
    const hasInsideContent = !!it.icon;
    A.circle(
      x,
      y,
      52,
      hasInsideContent
        ? { stroke: tone, strokeWidth: MARKER.strokeWidth + 0.4 }
        : { stroke: tone, fill: tone, hachureGap: MARKER.hachureGap * 1.9 },
    );
    if (it.icon) drawIcon(A, it.icon, x, y, 20, "@ink");
    A.circle(x - 23, y - 21, 18, { stroke: "@ink", fill: "@bg", fillStyle: "solid" });
    A.txt(x - 23, y - 17, String(i + 1), {
      anchor: "middle",
      size: 11,
      mono: true,
      bold: true,
      skipStrokeLint: true,
    });
    A.txt(x, y + 42, it.label, { anchor: "middle", size: 11, color: "@sub" });
  });
}

/* ---------------- decision: one question, two roads ---------------- */
function decision(spec, A) {
  const d = spec.data;
  const q = Array.isArray(d.question) ? d.question : [d.question];
  A.rect(135, 14, 70, 30, { stroke: "@ink" });
  A.txt(170, 34, d.start || "start", { anchor: "middle", size: 12.5 });
  A.arrow(170, 46, 170, 62, {});
  A.polygon(
    [
      [170, 66],
      [234, 104],
      [170, 142],
      [106, 104],
    ],
    { stroke: "@note", strokeWidth: MARKER.strokeWidth + 0.4 },
  );
  q.forEach((lineTxt, i) =>
    A.txt(170, 100 + i * 14 - (q.length - 1) * 7, lineTxt, {
      anchor: "middle",
      size: 10,
    }),
  );
  const noTone = toneOf(d.no.tone || "good");
  const yesTone = toneOf(d.yes.tone || "primary");
  A.arrow(106, 104, 72, 156, { tone: noTone });
  A.txt(58, 127, "no", { size: 12, color: noTone });
  A.arrow(234, 104, 266, 156, { tone: yesTone });
  A.txt(274, 127, "yes", { size: 12, color: yesTone });
  A.rect(16, 160, 124, 46, { stroke: noTone });
  A.txt(78, 180, d.no.label, { anchor: "middle", size: 12 });
  if (d.no.sub) A.txt(78, 197, d.no.sub, { anchor: "middle", size: 10.5, color: "@sub" });
  A.rect(202, 160, 124, 46, { stroke: yesTone });
  A.txt(264, 180, d.yes.label, { anchor: "middle", size: 12 });
  if (d.yes.sub) A.txt(264, 197, d.yes.sub, { anchor: "middle", size: 10.5, color: "@sub" });
}

/* ---------------- buckets: equal categories with their members ---------------- */
/*
 * A row of equal boxes, each naming a category and listing its members.
 * Use when the useful information is which items belong to which family.
 */
function buckets(spec, A) {
  const d = spec.data;
  const n = d.items.length;
  const gap = 14;
  const margin = 18;
  const top = 20;
  const w = (A.w - margin * 2 - gap * (n - 1)) / n;
  const maxMembers = Math.max(...d.items.map((it) => (it.members || []).length));
  const h = 44 + maxMembers * 17 + 14;
  A.h = spec.height || top + h + 14;

  d.items.forEach((it, i) => {
    const x = margin + i * (w + gap);
    const tone = toneOf(it.tone);
    A.rect(x, top, w, h, { stroke: it.tone ? tone : "@ink" });
    A.txt(x + w / 2, top + 26, it.label, {
      anchor: "middle",
      size: 12.5,
      color: it.tone ? tone : "@ink",
    });
    (it.members || []).forEach((member, j) => {
      A.txt(x + w / 2, top + 50 + j * 17, member, {
        anchor: "middle",
        size: 10.5,
        color: "@sub",
        mono: true,
      });
    });
  });
}

/* ---------------- doodle: decorative marker art ---------------- */
/*
 * Decorative doodles for hero corners, margins, and empty states. No data is
 * shown, so unlike every other figure there is nothing to compute. Composition
 * rule: muted sub-tone strokes plus at most one primary stroke, so decoration
 * whispers instead of competing with the content beside it.
 */
function drawStar(A, cx, cy, r, tone) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  A.polygon(pts, { stroke: tone });
}

const DOODLE_SHAPES = {
  // one reporting month moves from a starting revenue column to its ending figure
  saasRevenue(A) {
    A.rect(18, 49, 34, 55, { stroke: "@ink" });
    A.line(18, 65, 52, 65, { stroke: "@sub" });
    A.arrow(61, 76, 83, 76, { tone: "@sub" });
    A.rect(91, 42, 34, 62, { stroke: "@primary" });
    A.line(91, 58, 125, 58, { stroke: "@primary" });
  },
  // paper plane, dotted trail, one primary star: empty states and 404s
  spark(A) {
    A.polygon(
      [
        [34, 30],
        [56, 72],
        [16, 60],
      ],
      { stroke: "@sub" },
    );
    for (let i = 0; i < 5; i++) A.dot(66 + i * 13, 82 - (i % 2) * 5, 1.6, "@sub");
    drawStar(A, 116, 36, 14, "@primary");
  },
  // shooting star with a dotted tail: hero corners
  star(A) {
    for (let i = 0; i < 4; i++) A.dot(12 + i * 11, 66 - i * 8, 1.6, "@sub");
    drawStar(A, 74, 32, 16, "@primary");
  },
  // potted plant with one primary leaf: reference and hub margins
  plant(A) {
    A.polygon(
      [
        [38, 92],
        [86, 92],
        [79, 126],
        [45, 126],
      ],
      { stroke: "@sub" },
    );
    A.curve(
      [
        [62, 92],
        [60, 66],
        [48, 56],
        [42, 40],
      ],
      { stroke: "@sub" },
    );
    A.curve(
      [
        [42, 40],
        [58, 44],
        [62, 66],
        [62, 92],
      ],
      { stroke: "@sub" },
    );
    A.curve(
      [
        [62, 84],
        [66, 60],
        [78, 50],
        [84, 34],
      ],
      { stroke: "@primary" },
    );
    A.curve(
      [
        [84, 34],
        [68, 40],
        [63, 62],
        [62, 84],
      ],
      { stroke: "@primary" },
    );
  },
  // looping arrow: margins and section transitions
  arrowLoop(A) {
    A.curve(
      [
        [58, 14],
        [96, 40],
        [96, 82],
        [58, 108],
        [38, 112],
        [26, 106],
      ],
      { stroke: "@sub" },
    );
    A.linearPath(
      [
        [40, 96],
        [26, 106],
        [42, 114],
      ],
      { stroke: "@sub" },
    );
    A.dot(46, 12, 2, "@primary");
  },
  // dotted wave: quiet divider inside empty space
  wave(A) {
    for (let i = 0; i < 16; i++) {
      const x = 12 + i * 15;
      const y = 20 + Math.sin(i * 0.8) * 8;
      A.dot(x, y, 1.7, i === 8 ? "@primary" : "@sub");
    }
  },
  // three rack units with one live primary indicator: apps running yourself
  serverRack(A) {
    A.rect(24, 26, 100, 24, { stroke: "@ink" });
    A.rect(26, 58, 100, 24, { stroke: "@ink" });
    A.rect(24, 90, 100, 24, { stroke: "@ink" });
    A.dot(38, 38, 3, "@primary");
    A.dot(40, 70, 3, "@ink");
    A.dot(38, 102, 3, "@ink");
    A.line(96, 38, 114, 38, { stroke: "@ink" });
    A.line(100, 70, 116, 70, { stroke: "@ink" });
    A.line(96, 102, 114, 102, { stroke: "@ink" });
  },
  // globe with meridians and a primary marker: domain lookups
  globe(A) {
    A.circle(70, 62, 84, { stroke: "@ink" });
    A.ellipse(70, 62, 40, 84, { stroke: "@sub" });
    A.line(28, 62, 112, 62, { stroke: "@sub" });
    A.curve(
      [
        [32, 40],
        [70, 32],
        [108, 40],
      ],
      { stroke: "@sub" },
    );
    A.curve(
      [
        [32, 84],
        [70, 92],
        [108, 84],
      ],
      { stroke: "@sub" },
    );
    A.dot(94, 44, 4.5, "@primary");
  },
  // broadcast arcs over a primary dot: dns answers on their way
  signal(A) {
    A.arc(70, 96, 128, 116, Math.PI * 1.16, Math.PI * 1.84, false, { stroke: "@ink" });
    A.arc(70, 96, 88, 80, Math.PI * 1.16, Math.PI * 1.84, false, { stroke: "@sub" });
    A.arc(70, 96, 48, 44, Math.PI * 1.16, Math.PI * 1.84, false, { stroke: "@sub" });
    A.dot(70, 92, 5, "@primary");
    A.line(70, 92, 70, 110, { stroke: "@ink" });
  },
  // steaming mug: the course you settle in with
  coffee(A) {
    A.polygon(
      [
        [40, 58],
        [96, 58],
        [90, 104],
        [46, 104],
      ],
      { stroke: "@ink" },
    );
    A.path("M96 66 C 112 64, 114 88, 92 90", { stroke: "@ink" });
    A.curve(
      [
        [56, 46],
        [52, 34],
        [58, 24],
      ],
      { stroke: "@sub" },
    );
    A.curve(
      [
        [74, 46],
        [70, 32],
        [76, 20],
      ],
      { stroke: "@primary" },
    );
  },
  // balance scales: licenses weighed plainly
  scales(A) {
    A.line(70, 22, 70, 92, { stroke: "@ink" });
    A.line(34, 32, 106, 32, { stroke: "@ink" });
    A.line(50, 100, 90, 100, { stroke: "@ink" });
    A.line(34, 32, 26, 58, { stroke: "@sub" });
    A.line(34, 32, 42, 58, { stroke: "@sub" });
    A.arc(34, 56, 32, 22, 0, Math.PI, false, { stroke: "@primary" });
    A.line(106, 32, 98, 66, { stroke: "@sub" });
    A.line(106, 32, 114, 66, { stroke: "@sub" });
    A.arc(106, 64, 32, 22, 0, Math.PI, false, { stroke: "@sub" });
  },
  // rule sheet with a traced deciding line: .dockerignore path checks
  ignoreTrace(A) {
    A.polygon([[28, 18], [94, 18], [112, 36], [112, 104], [28, 104]], { stroke: "@ink" });
    A.line(94, 18, 94, 36, { stroke: "@sub" });
    A.line(94, 36, 112, 36, { stroke: "@sub" });
    A.line(42, 46, 92, 46, { stroke: "@sub" });
    A.line(42, 62, 98, 62, { stroke: "@primary" });
    A.line(42, 78, 84, 78, { stroke: "@sub" });
    A.arrow(102, 62, 126, 62, { tone: "@primary", curve: 0.08 });
  },
  // dial and checked reading: Home Assistant energy eligibility
  energyGauge(A) {
    A.arc(68, 78, 92, 92, Math.PI, Math.PI * 2, false, { stroke: "@ink" });
    A.line(68, 78, 94, 48, { stroke: "@primary" });
    A.dot(68, 78, 4, "@ink");
    A.line(30, 92, 106, 92, { stroke: "@sub" });
    A.linearPath([[102, 26], [110, 34], [126, 18]], { stroke: "@primary" });
  },
  // incoming path, replacement bend, and upstream: proxy_pass routing
  proxyRoute(A) {
    A.line(16, 42, 54, 42, { stroke: "@sub" });
    A.arrow(54, 42, 82, 70, { tone: "@primary", curve: 0.18 });
    A.line(82, 70, 120, 70, { stroke: "@primary" });
    A.linearPath([[112, 62], [124, 70], [112, 78]], { stroke: "@primary" });
    A.line(54, 88, 82, 70, { stroke: "@sub" });
    A.dot(16, 42, 3, "@ink");
    A.dot(54, 88, 3, "@sub");
  },
  // drive bodies with one parity drive and a usable-capacity bar: storage planning
  driveArray(A) {
    A.rect(20, 24, 28, 60, { stroke: "@ink" });
    A.rect(56, 24, 28, 60, { stroke: "@ink" });
    A.rect(92, 24, 28, 60, { stroke: "@primary" });
    A.dot(34, 38, 3, "@ink");
    A.dot(70, 38, 3, "@ink");
    A.dot(106, 38, 3, "@primary");
    A.line(26, 70, 42, 70, { stroke: "@sub" });
    A.line(62, 70, 78, 70, { stroke: "@sub" });
    A.line(98, 70, 114, 70, { stroke: "@primary" });
    A.line(20, 102, 84, 102, { stroke: "@ink" });
    A.line(92, 102, 120, 102, { stroke: "@primary" });
  },
  // shield with explicit listener paths: NFS firewall planning
  firewallShield(A) {
    A.polygon([[70, 16], [112, 32], [106, 78], [70, 106], [34, 78], [28, 32]], { stroke: "@ink" });
    A.line(10, 48, 50, 48, { stroke: "@sub" });
    A.line(10, 72, 50, 72, { stroke: "@sub" });
    A.line(90, 60, 130, 60, { stroke: "@sub" });
    A.dot(62, 48, 3, "@primary");
    A.dot(62, 72, 3, "@ink");
    A.linearPath([[58, 58], [68, 68], [84, 48]], { stroke: "@primary" });
  },
  // flask with one active mixture: small experiments in the labs
  labFlask(A) {
    A.line(54, 18, 86, 18, { stroke: "@ink" });
    A.line(58, 18, 58, 48, { stroke: "@ink" });
    A.line(82, 18, 82, 48, { stroke: "@ink" });
    A.path("M58 48 L30 98 Q28 106 40 108 L100 108 Q112 106 110 98 L82 48", {
      stroke: "@ink",
    });
    A.curve([[40, 88], [58, 82], [76, 88], [100, 82]], { stroke: "@primary" });
    A.dot(56, 72, 3, "@primary");
    A.dot(86, 68, 2.5, "@sub");
    A.dot(70, 58, 2, "@primary");
  },
  // three keys complete one motion: keyboard shortcuts
  shortcutKeys(A) {
    A.rect(16, 48, 30, 30, { stroke: "@ink" });
    A.rect(56, 48, 30, 30, { stroke: "@ink" });
    A.rect(96, 48, 30, 30, { stroke: "@primary" });
    A.line(26, 63, 36, 63, { stroke: "@sub" });
    A.line(66, 63, 76, 63, { stroke: "@sub" });
    A.linearPath([[106, 67], [112, 59], [118, 67]], { stroke: "@primary" });
    A.line(112, 59, 112, 72, { stroke: "@primary" });
    A.line(48, 63, 54, 63, { stroke: "@sub" });
    A.line(88, 63, 94, 63, { stroke: "@sub" });
  },
  // prompt and live cursor inside a terminal: command line apps
  cliTerminal(A) {
    A.rect(16, 24, 110, 82, { stroke: "@ink" });
    A.line(16, 42, 126, 42, { stroke: "@sub" });
    A.dot(28, 33, 2, "@sub");
    A.dot(38, 33, 2, "@sub");
    A.dot(48, 33, 2, "@sub");
    A.linearPath([[30, 58], [38, 65], [30, 72]], { stroke: "@primary" });
    A.line(48, 72, 70, 72, { stroke: "@primary" });
    A.line(32, 86, 86, 86, { stroke: "@sub" });
    A.line(94, 80, 94, 92, { stroke: "@primary" });
  },
  // one home server branching into the three main kinds of work on stack127
  stack127Map(A) {
    drawIcon(A, "server", 34, 62, 34, "@ink");
    A.line(52, 62, 68, 62, { stroke: "@primary" });
    A.line(68, 28, 68, 96, { stroke: "@primary" });
    A.arrow(68, 28, 98, 28, { tone: "@sub" });
    A.arrow(68, 62, 98, 62, { tone: "@primary" });
    A.arrow(68, 96, 98, 96, { tone: "@sub" });
    drawIcon(A, "search", 112, 28, 18, "@sub");
    drawIcon(A, "terminal", 112, 62, 18, "@primary");
    drawIcon(A, "document", 112, 96, 18, "@sub");
  },
};

function doodle(spec, A) {
  const draw = DOODLE_SHAPES[spec.data.shape];
  if (!draw) {
    throw new Error(
      `unknown doodle shape "${spec.data.shape}" (have: ${Object.keys(DOODLE_SHAPES).join(", ")})`,
    );
  }
  draw(A);
}

/** Short marker dashes. Rough.js output drops stroke-dasharray, so gaps are separate lines. */
function markerDash(A, x1, y1, x2, y2, tone, dash = 7, gap = 5) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const stroke = { stroke: tone, strokeWidth: 1.55, roughness: 0.5, bowing: 0.25 };
  const inset = Math.min(1.5, len / 8);
  for (let t = inset; t < len - inset - 1; t += dash + gap) {
    const end = Math.min(t + dash, len - inset);
    if (end - t < 2.4) continue;
    A.line(x1 + ux * t, y1 + uy * t, x1 + ux * end, y1 + uy * end, stroke);
  }
}

function dashedRect(A, x, y, w, h, tone) {
  markerDash(A, x, y, x + w, y, tone, 6, 4);
  markerDash(A, x + w, y, x + w, y + h, tone, 6, 4);
  markerDash(A, x + w, y + h, x, y + h, tone, 6, 4);
  markerDash(A, x, y + h, x, y, tone, 6, 4);
}

/* ---------------- tool-spot: small semantic art for scan cards ---------------- */
function toolSpot(spec, A) {
  const d = spec.data;
  const cx = A.w / 2;
  const cy = A.h / 2;
  if (d.motif === "adNetworkShortlist") {
    // Three choices point from one post; the longest, picked route gets the accent.
    A.line(42, 16, 42, 82, { stroke: "@ink", strokeWidth: 2.4 });
    A.line(32, 83, 52, 83, { stroke: "@ink", strokeWidth: 1.7 });
    A.arrow(46, 28, 108, 28, { tone: "@primary", sw: 2.3 });
    A.arrow(46, 49, 97, 49, { tone: "@ink", sw: 2.0 });
    A.arrow(46, 70, 83, 70, { tone: "@ink", sw: 2.0 });
    const star = [];
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? 4.3 : 1.9;
      const angle = -Math.PI / 2 + (point * Math.PI) / 5;
      star.push([119 + Math.cos(angle) * radius, 21 + Math.sin(angle) * radius]);
    }
    A.polygon(star, { stroke: "@primary", fill: "@primary", fillStyle: "solid", strokeWidth: 1.4 });
    drawIcon(A, "browserPage", 42, 96, 23, "@ink");
    return;
  } else if (d.motif === "publisherTools") {
    // One site page sits beside a measured traffic gate and a separate network-tag gate.
    drawIcon(A, "browserPage", 34, 56, 35, "@ink");
    drawIcon(A, "heightGate", 79, 56, 43, "@ink");
    A.line(111, 22, 111, 94, { stroke: "@ink", strokeWidth: 2.1 });
    A.line(111, 94, 130, 94, { stroke: "@ink", strokeWidth: 1.6 });
    A.line(111, 29, 129, 29, { stroke: "@ink", strokeWidth: 1.6 });
    drawIcon(A, "tag", 120, 52, 20, "@primary");
    return;
  } else if (d.motif === "customerEconomics") {
    drawIcon(A, "user", 28, cy, 23, "@ink");
    A.line(49, cy, 58, cy, { stroke: "@sub" });
    A.line(58, 23, 58, 87, { stroke: "@sub" });
    const measures = [
      { icon: "coin", y: 23, tone: "@primary" },
      { icon: "server", y: cy, tone: "@sub" },
      { icon: "tag", y: 87, tone: "@sub" },
    ];
    for (const measure of measures) {
      A.arrow(58, measure.y, 82, measure.y, { tone: measure.tone });
      drawIcon(A, measure.icon, 104, measure.y, 17, measure.tone);
    }
  } else if (d.motif === "usagePrice") {
    drawIcon(A, "document", 28, cy, 26, "@ink");
    A.line(42, cy, 50, cy, { stroke: "@sub" });
    A.line(54, cy - 14, 68, cy - 14, { stroke: "@sub" });
    A.line(54, cy, 76, cy, { stroke: "@primary" });
    A.line(54, cy + 14, 64, cy + 14, { stroke: "@sub" });
    A.arrow(80, cy, 97, cy, { tone: "@sub" });
    drawIcon(A, "coin", 115, cy, 22, "@primary");
  } else if (d.motif === "bidThreshold") {
    drawIcon(A, d.icon, cx, cy, Math.min(A.w, A.h) * 0.48, "@ink");
  } else if (d.motif === "kenpEarnings") {
    drawIcon(A, d.icon, cx - 22, cy, Math.min(A.w, A.h) * 0.42, "@ink");
    A.line(cx + 15, cy - 6, cx + 34, cy - 6, { stroke: "@sub" });
    A.line(cx + 17, cy, cx + 34, cy, { stroke: "@sub" });
    A.line(cx + 15, cy + 6, cx + 34, cy + 6, { stroke: "@sub" });
    drawIcon(A, "coin", cx + 47, cy, 19, "@primary");
  } else if (d.motif === "customerChurn") {
    // A small opening group remains together while one account moves out of it.
    for (const [x, y] of [[26, 39], [49, 39], [26, 72], [49, 72]]) {
      drawIcon(A, "user", x, y, 15, "@ink");
    }
    A.arrow(67, 55, 91, 55, { tone: "@sub" });
    drawIcon(A, "user", 112, 55, 17, "@primary");
    return;
  } else if (d.motif === "revenueChurn") {
    // A month-end opening base is shown beside its smaller remaining amount and one separated slice.
    const baseline = 94;
    A.rect(14, 28, 34, baseline - 28, {
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "solid",
      roughness: 1.15,
      strokeWidth: 1.8,
    });
    A.arrow(54, 60, 82, 60, { tone: "@sub" });
    A.rect(98, 43, 30, baseline - 43, {
      stroke: "@ink",
      fill: "@ink",
      fillStyle: "solid",
      roughness: 1.15,
      strokeWidth: 1.8,
    });
    A.rect(98, 28, 30, 11, {
      stroke: "@sub",
      fill: "@sub",
      fillStyle: "solid",
      roughness: 1.15,
      strokeWidth: 1.6,
    });
    A.line(6, baseline, 134, baseline, { stroke: "@sub", strokeWidth: 1.4 });
    return;
  } else if (d.motif === "burnMultiple") {
    // A cash stack tapers down beside one rising ARR step.
    const bills = [
      { x: 12, y: 34, width: 52 },
      { x: 20, y: 48, width: 44 },
      { x: 28, y: 62, width: 36 },
    ];
    for (const bill of bills) {
      A.rect(bill.x, bill.y, bill.width, 17, {
        stroke: "@ink",
        fill: "@primary",
        fillStyle: "solid",
        roughness: 1.15,
        strokeWidth: 1.7,
      });
    }
    A.linearPath(
      [
        [76, 86],
        [91, 86],
        [91, 65],
        [109, 65],
        [109, 43],
        [130, 43],
      ],
      { stroke: "@ink", strokeWidth: 3.2 },
    );
    return;
  } else if (d.motif === "cohortRetention") {
    // The opening group remains anchored across one gain and one loss.
    const baseline = 93;
    const bars = [
      { x: 10, width: 16, top: 43, bottom: baseline, level: 43, anchor: true },
      { x: 42, width: 14, top: 30, bottom: 43, level: 30 },
      { x: 72, width: 14, top: 30, bottom: 41, level: 41 },
      { x: 108, width: 16, top: 41, bottom: baseline, level: 41, anchor: true },
    ];

    // A shared bracket marks the same opening group across the interval.
    A.line(17, 20, 17, 28, { stroke: "@sub", strokeWidth: 1.4 });
    A.line(17, 20, 123, 20, { stroke: "@sub", strokeWidth: 1.4 });
    A.line(123, 20, 123, 28, { stroke: "@sub", strokeWidth: 1.4 });

    for (let index = 0; index < bars.length; index += 1) {
      const bar = bars[index];
      if (index > 0) {
        const previous = bars[index - 1];
        A.line(previous.x + previous.width, previous.level, bar.x, previous.level, {
          stroke: "@sub",
          strokeWidth: 1.5,
        });
      }
      A.rect(bar.x, bar.top, bar.width, bar.bottom - bar.top, {
        stroke: bar.anchor ? "@primary" : "@ink",
        fill: bar.anchor ? "@primary" : "@sub",
        fillStyle: "solid",
        roughness: 1.15,
        strokeWidth: 1.6,
      });
    }
    A.line(5, baseline, 135, baseline, { stroke: "@sub", strokeWidth: 1.4 });
    return;
  } else if (d.motif === "mrrWaterfall") {
    // Five movements carry an opening MRR balance back to an equal closing level.
    const baseline = 93;
    const bars = [
      { x: 9, top: 46, bottom: baseline, level: 46, anchor: true },
      { x: 27, top: 34, bottom: 46, level: 34 },
      { x: 45, top: 26, bottom: 34, level: 26 },
      { x: 63, top: 20, bottom: 26, level: 20 },
      { x: 81, top: 20, bottom: 36, level: 36 },
      { x: 99, top: 36, bottom: 46, level: 46 },
      { x: 117, top: 46, bottom: baseline, level: 46, anchor: true },
    ];

    for (let index = 0; index < bars.length; index += 1) {
      const bar = bars[index];
      if (index > 0) {
        const previous = bars[index - 1];
        A.line(previous.x + 13, previous.level, bar.x, previous.level, {
          stroke: "@sub",
          strokeWidth: 1.5,
        });
      }
      A.rect(bar.x, bar.top, 13, bar.bottom - bar.top, {
        stroke: bar.anchor ? "@ink" : "@primary",
        fill: bar.anchor ? "@ink" : "@primary",
        fillStyle: "solid",
        roughness: 1.15,
        strokeWidth: 1.6,
      });
    }
    A.line(5, baseline, 135, baseline, { stroke: "@sub", strokeWidth: 1.4 });
    return;
  } else if (d.motif === "monthlyNormalize") {
    // Unequal billing plans converge into one monthly calendar figure.
    A.line(11, 33, 35, 33, { stroke: "@sub" });
    A.line(11, 54, 47, 54, { stroke: "@sub" });
    A.line(11, 75, 29, 75, { stroke: "@sub" });
    A.arrow(38, 33, 74, 43, { tone: "@sub", curve: -0.08 });
    A.arrow(50, 54, 74, 55, { tone: "@sub" });
    A.arrow(32, 75, 74, 66, { tone: "@sub", curve: 0.08 });
    A.rect(82, 23, 46, 68, { stroke: "@ink" });
    A.line(82, 40, 128, 40, { stroke: "@ink" });
    A.line(94, 18, 94, 28, { stroke: "@ink" });
    A.line(116, 18, 116, 28, { stroke: "@ink" });
    A.rect(99, 53, 13, 26, { stroke: "@primary", fill: "@primary", fillStyle: "solid", hachureGap: 11, roughness: 1.2, strokeWidth: 1.8 });
    A.line(93, 80, 119, 80, { stroke: "@ink" });
    return;
  } else if (d.motif === "grossMargin") {
    // Recognized revenue and delivery cost stay side by side; cost is taller here to avoid implying every margin is positive.
    const baseline = 92;
    const revenueTop = 40;
    const deliveryTop = 28;
    A.rect(20, revenueTop, 38, baseline - revenueTop, {
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "solid",
      roughness: 1.15,
      strokeWidth: 1.8,
    });
    A.rect(82, deliveryTop, 38, baseline - deliveryTop, {
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "hachure",
      hachureAngle: -45,
      hachureGap: 8,
      roughness: 1.15,
      strokeWidth: 1.8,
    });
    A.line(70, deliveryTop, 70, revenueTop, { stroke: "@sub", strokeWidth: 1.4 });
    A.line(70, deliveryTop, 82, deliveryTop, { stroke: "@sub", strokeWidth: 1.4 });
    A.line(58, revenueTop, 70, revenueTop, { stroke: "@sub", strokeWidth: 1.4 });
    return;
  } else if (d.motif === "revenueBridge") {
    // Two month-end revenue columns and one reading-direction arrow.
    A.rect(15, 39, 35, 55, { stroke: "@ink" });
    A.line(15, 68, 50, 68, { stroke: "@ink" });
    A.arrow(58, 66, 80, 66, { tone: "@sub" });
    A.rect(89, 39, 35, 55, { stroke: "@primary" });
    A.line(89, 57, 124, 57, { stroke: "@primary" });
    A.line(89, 75, 124, 75, { stroke: "@primary" });
    return;
  } else if (d.motif === "annualizeMonthly") {
    // One monthly tile feeds an equal 3-by-4 grid for the annual run rate.
    A.rect(11, 42, 26, 28, { stroke: "@sub" });
    A.line(11, 50, 37, 50, { stroke: "@sub" });
    A.rect(17, 56, 14, 9, { stroke: "@primary", fill: "@primary", fillStyle: "solid", roughness: 1.2, strokeWidth: 1.8 });
    A.arrow(40, 56, 55, 56, { tone: "@sub" });

    A.rect(60, 14, 70, 82, { stroke: "@ink" });
    A.line(60, 30, 130, 30, { stroke: "@ink" });
    A.line(74, 9, 74, 20, { stroke: "@ink" });
    A.line(116, 9, 116, 20, { stroke: "@ink" });

    const gridX = 62;
    const gridY = 32;
    const cellWidth = 66 / 3;
    const cellHeight = 62 / 4;
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        A.rect(
          gridX + column * cellWidth + 2,
          gridY + row * cellHeight + 2,
          cellWidth - 4,
          cellHeight - 4,
          { stroke: "@primary", fill: "@primary", fillStyle: "solid", roughness: 1.2, strokeWidth: 1.4 },
        );
      }
    }
    return;
  } else if (d.motif === "revenuePerPopulation") {
    // A revenue amount is divided by the people grouped inside one account.
    A.rect(12, 20, 32, 18, {
      stroke: "@sub",
      fill: "@sub",
      fillStyle: "solid",
      roughness: 1.2,
      strokeWidth: 1.8,
    });
    A.line(10, 53, 50, 53, { stroke: "@ink" });
    A.arrow(52, 53, 65, 53, { tone: "@sub" });

    A.rect(68, 17, 64, 78, { stroke: "@ink" });
    A.line(68, 36, 132, 36, { stroke: "@ink" });
    for (const x of [81, 100, 119]) {
      drawIcon(A, "user", x, 63, 10, "@primary");
    }
    return;
  } else if (d.motif === "paybackStaircase") {
    // Equal monthly steps climb until they first reach the dashed cost level.
    const baseline = 92;
    const stepWidth = 20;
    const stepRise = 12;
    const steps = 5;
    const left = 20;
    const points = [[left, baseline]];
    for (let index = 0; index < steps; index += 1) {
      const top = baseline - stepRise * (index + 1);
      points.push([left + index * stepWidth, top], [left + (index + 1) * stepWidth, top]);
    }
    points.push([left + steps * stepWidth, baseline]);
    A.polygon(points, {
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "solid",
      roughness: 1.15,
      strokeWidth: 1.8,
    });
    const level = baseline - stepRise * steps;
    const touchX = left + (steps - 1) * stepWidth;
    for (let x = 8; x < touchX - 6; x += 12) {
      A.line(x, level, Math.min(x + 7, touchX - 6), level, { stroke: "@sub", strokeWidth: 1.6, roughness: 0.6 });
    }
    A.dot(touchX, level, 3.6, "@ink");
    return;
  } else if (d.motif === "breakEvenBalance") {
    // One hatched fixed-cost block balances a neat stack of small equal account tiles.
    const beamY = 64;
    A.polygon([[70, beamY + 1], [56, 92], [84, 92]], { stroke: "@ink", strokeWidth: 1.8, roughness: 1.1 });
    A.line(12, beamY, 128, beamY, { stroke: "@ink", strokeWidth: 2.4, roughness: 0.8 });
    A.rect(16, 30, 34, beamY - 32, {
      stroke: "@ink",
      fill: "@sub",
      fillStyle: "hachure",
      hachureAngle: -45,
      hachureGap: 6,
      roughness: 1.15,
      strokeWidth: 1.8,
    });
    const tile = 9;
    const gap = 2;
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        A.rect(92 + column * (tile + gap), beamY - 2 - (row + 1) * tile - row * gap, tile, tile, {
          stroke: "@ink",
          fill: "@primary",
          fillStyle: "solid",
          roughness: 0.9,
          strokeWidth: 1.3,
        });
      }
    }
    return;
  } else if (d.motif === "acquisitionCost") {
    // Three cost rows of different heights sit under one customer. The dashed top row is counted time, not cash.
    const left = 40;
    const rowWidth = 60;
    const row = { roughness: 1.05, strokeWidth: 1.65 };
    A.rect(left, 84, rowWidth, 14, {
      ...row,
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "solid",
    });
    A.rect(left, 68, rowWidth, 11, {
      ...row,
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "hachure",
      hachureAngle: -45,
      hachureGap: 4.5,
    });
    dashedRect(A, left, 56, rowWidth, 8, "@sub");
    drawIcon(A, "user", cx, 36, 40, "@ink");
    return;
  } else if (d.motif === "lifetimeValue") {
    // Shrinking horizontal layers build one column. A dashed ceiling stays above the top layer.
    const left = 46;
    const columnWidth = 48;
    const gap = 3;
    const heights = [20, 14, 10, 7, 6];
    let bottom = 96;
    for (const height of heights) {
      bottom -= height;
      A.rect(left, bottom, columnWidth, height, {
        stroke: "@ink",
        fill: "@primary",
        fillStyle: "solid",
        roughness: 1.05,
        strokeWidth: 1.55,
      });
      bottom -= gap;
    }
    markerDash(A, 20, 16, 120, 16, "@sub", 7, 5);
    return;
  } else if (d.motif === "valueToCost") {
    // A tall hatched value bar beside a narrow stack of equal cost tiles. The stack stops short of the bar.
    const baseline = 96;
    A.line(12, baseline, 128, baseline, { stroke: "@sub", strokeWidth: 1.45, roughness: 0.55 });
    A.rect(16, 18, 42, baseline - 18, {
      stroke: "@ink",
      fill: "@primary",
      fillStyle: "hachure",
      hachureAngle: -45,
      hachureGap: 7,
      roughness: 1.1,
      strokeWidth: 1.7,
    });
    const tile = 16;
    const tileGap = 7;
    const tileX = 82;
    for (let index = 0; index < 3; index += 1) {
      const y = baseline - (index + 1) * tile - index * tileGap;
      if (index === 0) {
        A.rect(tileX, y, tile, tile, {
          stroke: "@ink",
          fill: "@sub",
          fillStyle: "solid",
          roughness: 0.75,
          strokeWidth: 1.45,
        });
      } else {
        dashedRect(A, tileX, y, tile, tile, "@ink");
      }
    }
    return;
  } else if (d.motif === "trialConversion") {
    // A group that started together waits on a time track. Two filled accounts sit past the dashed day-N gate.
    const track = 88;
    const size = 14;
    const r = size / 2;
    const ring = { stroke: "@ink", strokeWidth: 1.6, roughness: 0.7 };
    A.line(12, track, 128, track, { stroke: "@sub", strokeWidth: 1.5, roughness: 0.55 });
    A.line(14, track - 5, 14, track + 5, { stroke: "@sub", strokeWidth: 1.5, roughness: 0.5 });
    const starters = [
      [28, track - r - 1.5], [47, track - r - 1.5], [66, track - r - 1.5],
      [37.5, track - r - 18], [56.5, track - r - 18],
      [47, track - r - 34.5],
    ];
    for (const [x, y] of starters) A.circle(x, y, size, ring);
    markerDash(A, 86, 26, 86, track + 6, "@ink", 7, 5);
    // Rough's solid circle fill loops twice and cancels under evenodd, so fill with a plain dot.
    for (const x of [104, 122]) {
      A.dot(x, track - r - 1.5, r - 0.4, "@primary");
      A.circle(x, track - r - 1.5, size, ring);
    }
    return;
  } else if (d.motif === "annualDiscount") {
    // A price tag holds a row of paid months. The last slot is empty, its month lifted out above the tag.
    A.path("M21 63 C 13 52, 17 38, 7 27", { stroke: "@sub", strokeWidth: 1.5, roughness: 0.7 });
    A.polygon([[9, 63], [26, 41], [110, 41], [110, 85], [26, 85]], { stroke: "@ink", strokeWidth: 1.8, roughness: 0.9 });
    A.circle(21, 63, 6, { stroke: "@ink", strokeWidth: 1.5, roughness: 0.5 });
    const tile = 8.4;
    const gap = 4.4;
    const top = 56;
    const height = 14;
    for (let index = 0; index < 5; index += 1) {
      A.rect(33 + index * (tile + gap), top, tile, height, { stroke: "@sub", fill: "@sub", fillStyle: "solid", roughness: 0.8, strokeWidth: 1.4 });
    }
    dashedRect(A, 33 + 5 * (tile + gap), top - 1, tile + 1, height + 2, "@sub");
    A.polygon([[99, 20], [109, 23], [105, 37], [95, 34]], { stroke: "@primary", fill: "@primary", fillStyle: "solid", roughness: 0.9, strokeWidth: 1.8 });
    return;
  } else if (d.motif === "churnCompounding") {
    // Customers lost add up along flattening steps, because each period starts with fewer people.
    // A dashed cap on the last step shows how much higher a straight multiply puts the total.
    const baseline = 94;
    const width = 16;
    const scale = 70;
    const lost = [1, 2, 3, 4, 5].map((periods) => 1 - 0.77 ** periods);
    for (let index = 0; index < lost.length; index += 1) {
      const height = scale * lost[index];
      A.rect(14 + index * 23, baseline - height, width, height, {
        stroke: "@ink",
        fill: "@primary",
        fillStyle: "solid",
        roughness: 1.05,
        strokeWidth: 1.55,
      });
    }
    const lastX = 14 + 4 * 23;
    const lastTop = baseline - scale * lost[4];
    const linearTop = baseline - scale * 0.23 * 5;
    dashedRect(A, lastX, linearTop, width, lastTop - linearTop - 3, "@sub");
    A.line(6, baseline, 134, baseline, { stroke: "@sub", strokeWidth: 1.4 });
    return;
  } else if (d.motif === "goalFlag") {
    // Monthly dots climb to a dashed target line and meet it at the foot of a planted flag.
    const target = 30;
    const poleX = 108;
    markerDash(A, 12, target, 130, target, "@sub", 7, 5);
    const dots = Array.from({ length: 7 }, (_, index) => {
      const share = index / 6;
      return [18 + share * (poleX - 18), 96 - (96 - target) * share ** 0.9];
    });
    for (let index = 1; index < dots.length; index += 1) {
      A.line(dots[index - 1][0], dots[index - 1][1], dots[index][0], dots[index][1], { stroke: "@sub", strokeWidth: 1.3, roughness: 0.6 });
    }
    for (const [x, y] of dots) A.dot(x, y, 3.2, "@ink");
    A.line(poleX, target, poleX, 7, { stroke: "@ink", strokeWidth: 1.9, roughness: 0.6 });
    A.polygon([[poleX, 8], [128, 13.5], [poleX, 19]], { stroke: "@primary", fill: "@primary", fillStyle: "solid", roughness: 0.8, strokeWidth: 1.6 });
    return;
  } else if (d.motif === "runwayLiftoff") {
    // A strip recedes to a marked end. A paper plane has already lifted off well before the end bars.
    A.line(6, 76, 100, 83, { stroke: "@ink", strokeWidth: 1.8, roughness: 0.6 });
    A.line(6, 104, 100, 95, { stroke: "@ink", strokeWidth: 1.8, roughness: 0.6 });
    markerDash(A, 12, 90, 94, 89, "@sub", 6, 5);
    A.line(104, 78, 104, 100, { stroke: "@ink", strokeWidth: 3.4, roughness: 0.5 });
    markerDash(A, 36, 88, 54, 74, "@primary", 5, 4);
    markerDash(A, 54, 74, 72, 58, "@primary", 5, 4);
    markerDash(A, 72, 58, 88, 45, "@primary", 5, 4);
    A.polygon([[118, 20], [82, 33], [95, 37]], { stroke: "@primary", fill: "@primary", fillStyle: "solid", roughness: 0.8, strokeWidth: 1.6 });
    A.polygon([[118, 20], [95, 37], [93, 49]], { stroke: "@primary", strokeWidth: 1.6, roughness: 0.8 });
    return;
  } else if (d.motif === "coverBarcode") {
    // A book's back corner sits behind a white barcode label. Scanners need black bars on white, so those two colors stay fixed in both themes.
    A.rect(14, 14, 110, 86, { stroke: "@sub", roughness: 1.15, strokeWidth: 1.8 });
    A.line(24, 14, 24, 100, { stroke: "@sub", strokeWidth: 1.2, roughness: 0.6 });
    A.rect(36, 32, 86, 56, { stroke: "#111111", fill: "#ffffff", fillStyle: "solid", roughness: 1.15, strokeWidth: 1.6 });
    // Guard bars at the start, middle, and end run longer than the data bars.
    const mainBars = [
      { x: 44, width: 2.6, guard: true }, { x: 49, width: 1.4 }, { x: 52.4, width: 1.4 },
      { x: 56.8, width: 3.8 }, { x: 62.6, width: 1.4 }, { x: 66, width: 2.6, guard: true },
      { x: 70.6, width: 1.4 }, { x: 73.9, width: 1.4 }, { x: 78.3, width: 3.8 },
      { x: 84.1, width: 2.6, guard: true },
    ];
    for (const bar of mainBars) {
      A.rect(bar.x, 40, bar.width, bar.guard ? 40 : 34, { stroke: "#111111", fill: "#111111", fillStyle: "solid", roughness: 1.15, strokeWidth: 1.2 });
    }
    // The smaller add-on block sits to the right, shorter than the main bars.
    const addOnBars = [
      { x: 96, width: 1.6 }, { x: 99.6, width: 1.6 }, { x: 103.6, width: 2.8 },
      { x: 109.2, width: 1.6 }, { x: 112.4, width: 1.6 },
    ];
    for (const bar of addOnBars) {
      A.rect(bar.x, 50, bar.width, 20, { stroke: "#111111", fill: "#111111", fillStyle: "solid", roughness: 1.15, strokeWidth: 1.2 });
    }
    return;
  } else if (d.motif === "adsTxtManager") {
    // A site's ads.txt file lists seller lines. One marked line points out to the network that manages the ads.
    A.polygon([[10, 14], [50, 14], [66, 30], [66, 96], [10, 96]], { stroke: "@ink", strokeWidth: 1.8, roughness: 0.9 });
    A.line(50, 14, 50, 30, { stroke: "@ink", strokeWidth: 1.4, roughness: 0.6 });
    A.line(50, 30, 66, 30, { stroke: "@ink", strokeWidth: 1.4, roughness: 0.6 });
    for (const [y, end] of [[38, 54], [51, 48], [77, 52]]) {
      A.line(20, y, end, y, { stroke: "@sub", strokeWidth: 1.5, roughness: 0.6 });
    }
    A.line(20, 64, 56, 64, { stroke: "@primary", strokeWidth: 3.2, roughness: 0.6 });
    A.arrow(72, 63, 88, 58, { tone: "@sub" });
    // The network badge: a ring holding three linked nodes.
    A.circle(112, 55, 42, { stroke: "@ink", strokeWidth: 1.8, roughness: 0.8 });
    const nodes = [[112, 43], [101, 62], [123, 62]];
    for (let index = 0; index < nodes.length; index += 1) {
      const [x1, y1] = nodes[index];
      const [x2, y2] = nodes[(index + 1) % nodes.length];
      A.line(x1, y1, x2, y2, { stroke: "@primary", strokeWidth: 1.5, roughness: 0.5 });
    }
    for (const [x, y] of nodes) A.dot(x, y, 3.8, "@primary");
    return;
  } else if (d.motif === "adSlotSites") {
    // A website window in front of quieter ones. Its marked banner is the ad slot a network fills.
    A.linearPath([[34, 10], [132, 10], [132, 74]], { stroke: "@sub", strokeWidth: 1.4, roughness: 0.8 });
    A.linearPath([[24, 18], [122, 18], [122, 84]], { stroke: "@sub", strokeWidth: 1.6, roughness: 0.8 });
    A.rect(12, 26, 100, 74, { stroke: "@ink", strokeWidth: 1.9, roughness: 0.9 });
    A.line(12, 39, 112, 39, { stroke: "@ink", strokeWidth: 1.4, roughness: 0.6 });
    A.rect(22, 48, 80, 20, { stroke: "@primary", fill: "@primary", strokeWidth: 2, roughness: 1 });
    A.line(22, 79, 92, 79, { stroke: "@sub", strokeWidth: 1.5, roughness: 0.6 });
    A.line(22, 89, 70, 89, { stroke: "@sub", strokeWidth: 1.5, roughness: 0.6 });
    return;
  } else if (d.motif === "seriesSpines") {
    // Three spines stand on one baseline, the first a little taller. Each hop is a thinner arrow than the one before.
    const baseline = 96;
    const spines = [
      { x: 16, width: 26, top: 36 },
      { x: 56, width: 26, top: 46 },
      { x: 96, width: 26, top: 46 },
    ];
    for (const spine of spines) {
      A.rect(spine.x, spine.top, spine.width, baseline - spine.top, { stroke: "@ink", fill: "@primary", fillStyle: "solid", roughness: 1.15, strokeWidth: 1.8 });
      A.line(spine.x, spine.top + 8, spine.x + spine.width, spine.top + 8, { stroke: "@ink", strokeWidth: 1.4, roughness: 0.6 });
    }
    A.line(8, baseline, 132, baseline, { stroke: "@sub", strokeWidth: 1.4 });
    A.arrow(30, 30, 62, 42, { tone: "@ink", sw: 3.4, curve: -0.3 });
    A.arrow(76, 40, 104, 42, { tone: "@ink", sw: 1.8, curve: -0.3 });
    return;
  } else {
    drawIcon(A, d.icon, cx, cy, Math.min(A.w, A.h) * 0.48, "@ink");
  }

  if (d.motif === "check") {
    drawCheck(A, A.w - 25, 25, "@primary");
  } else if (d.motif === "path") {
    A.arrow(14, A.h - 18, A.w - 18, 20, { tone: "@primary", curve: 0.28 });
  } else if (d.motif === "compare") {
    A.line(14, 24, 36, 24, { stroke: "@sub" });
    A.line(A.w - 36, A.h - 22, A.w - 14, A.h - 22, { stroke: "@primary" });
    A.arrow(34, 28, A.w - 34, A.h - 28, { tone: "@sub", curve: -0.18 });
  } else if (d.motif === "branch") {
    A.line(cx, A.h - 18, cx, A.h - 34, { stroke: "@primary" });
    A.line(cx - 30, A.h - 18, cx + 30, A.h - 18, { stroke: "@primary" });
    A.dot(cx - 30, A.h - 18, 2.8, "@primary");
    A.dot(cx + 30, A.h - 18, 2.8, "@primary");
  } else if (d.motif === "alert") {
    A.line(A.w - 24, 16, A.w - 24, 34, { stroke: "@primary" });
    A.dot(A.w - 24, 44, 2.8, "@primary");
  } else if (d.motif === "expand") {
    A.arrow(cx, A.h - 18, 18, A.h - 18, { tone: "@sub" });
    A.arrow(cx, A.h - 18, A.w - 18, A.h - 18, { tone: "@primary" });
  } else if (d.motif === "boundary") {
    A.line(18, 16, 18, A.h - 16, { stroke: "@sub" });
    A.line(A.w - 18, 16, A.w - 18, A.h - 16, { stroke: "@primary" });
  } else if (d.motif === "stack") {
    A.line(18, A.h - 18, A.w - 18, A.h - 18, { stroke: "@primary" });
    A.dot(24, 22, 2.2, "@sub");
    A.dot(A.w - 24, 22, 2.2, "@primary");
  } else if (d.motif === "floor") {
    A.line(22, A.h - 25, A.w - 22, A.h - 25, { stroke: "@sub" });
  } else if (d.motif === "sharedPrice") {
    A.line(18, A.h - 16, A.w - 18, A.h - 16, { stroke: "@primary" });
  }
}

export const FIGURES = {
  bar,
  donut,
  line,
  flow,
  steps,
  decision,
  composeMap,
  portMap,
  survival,
  tunnel,
  stack,
  tradeoff,
  riskLadder,
  restoreLoop,
  roadmap,
  workbench,
  buckets,
  doodle,
  toolSpot,
};

/**
 * Figure builders. Each takes (spec, A) and draws onto the Art surface.
 * Geometry for data figures (bar, donut, line) is always computed from the
 * numbers in the spec: nobody eyeballs a bar length or a pie angle.
 *
 * Specs are documented in version127_docs/marker-art.md. New figure types get
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
  // two rack units with a primary heart: apps worth running yourself
  serverHeart(A) {
    A.rect(24, 46, 100, 26, { stroke: "@ink" });
    A.rect(26, 80, 100, 26, { stroke: "@ink" });
    A.dot(38, 59, 3, "@ink");
    A.dot(40, 93, 3, "@ink");
    A.line(96, 59, 114, 59, { stroke: "@ink" });
    A.line(100, 93, 116, 93, { stroke: "@ink" });
    A.path(
      "M74 38 C 66 28, 52 31, 52 20 C 52 12, 62 9, 68 15 C 71 18, 77 18, 80 15 C 86 9, 96 12, 96 20 C 96 31, 82 28, 74 38 Z",
      { stroke: "@primary" },
    );
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
  doodle,
};

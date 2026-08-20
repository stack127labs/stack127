/**
 * The marker art icon library. Parametric hand drawn icons built from rough
 * primitives so they restyle with the config. Icons are the first choice over
 * text labels; grow this file instead of drawing ad hoc shapes in figures.
 *
 * Every icon draws centered on (cx, cy) at nominal size s (roughly its width).
 */

export const ICONS = {
  server(A, cx, cy, s, tone = "@ink") {
    const top = cy - 0.62 * s;
    const h = 1.24 * s;
    A.rect(cx - 0.52 * s, top, 1.04 * s, h, { stroke: tone });
    A.line(cx - 0.52 * s, top + h / 3, cx + 0.52 * s, top + h / 3, { stroke: tone });
    A.line(cx - 0.52 * s, top + (2 * h) / 3, cx + 0.52 * s, top + (2 * h) / 3, { stroke: tone });
    A.dot(cx + 0.3 * s, top + h / 6, 0.05 * s + 1, tone);
    A.dot(cx + 0.3 * s, top + h / 2, 0.05 * s + 1, tone);
    A.dot(cx + 0.3 * s, top + (5 * h) / 6, 0.05 * s + 1, tone);
  },
  router(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.6 * s, cy - 0.05 * s, 1.2 * s, 0.5 * s, { stroke: tone });
    A.line(cx - 0.3 * s, cy - 0.05 * s, cx - 0.42 * s, cy - 0.6 * s, { stroke: tone });
    A.line(cx + 0.3 * s, cy - 0.05 * s, cx + 0.42 * s, cy - 0.6 * s, { stroke: tone });
    A.dot(cx - 0.15 * s, cy + 0.2 * s, 1.6, tone);
    A.dot(cx + 0.15 * s, cy + 0.2 * s, 1.6, tone);
  },
  phone(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.3 * s, cy - 0.58 * s, 0.6 * s, 1.16 * s, { stroke: tone });
    A.line(cx - 0.1 * s, cy + 0.42 * s, cx + 0.1 * s, cy + 0.42 * s, { stroke: tone });
  },
  laptop(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.5 * s, cy - 0.48 * s, s, 0.7 * s, { stroke: tone });
    A.line(cx - 0.66 * s, cy + 0.36 * s, cx + 0.66 * s, cy + 0.36 * s, {
      stroke: tone,
      strokeWidth: 3.1,
    });
  },
  disk(A, cx, cy, s, tone = "@ink") {
    A.ellipse(cx, cy - 0.32 * s, 0.95 * s, 0.38 * s, { stroke: tone });
    A.line(cx - 0.475 * s, cy - 0.32 * s, cx - 0.475 * s, cy + 0.3 * s, { stroke: tone });
    A.line(cx + 0.475 * s, cy - 0.32 * s, cx + 0.475 * s, cy + 0.3 * s, { stroke: tone });
    A.arc(cx, cy + 0.3 * s, 0.95 * s, 0.38 * s, 0, Math.PI, false, { stroke: tone });
  },
  cloud(A, cx, cy, s, tone = "@ink") {
    const f = s / 30;
    const d =
      `M${cx - 26 * f} ${cy + 9 * f}` +
      ` C${cx - 38 * f} ${cy + 3 * f} ${cx - 31 * f} ${cy - 12 * f} ${cx - 14 * f} ${cy - 9 * f}` +
      ` C${cx - 9 * f} ${cy - 22 * f} ${cx + 11 * f} ${cy - 22 * f} ${cx + 15 * f} ${cy - 9 * f}` +
      ` C${cx + 31 * f} ${cy - 12 * f} ${cx + 38 * f} ${cy + 3 * f} ${cx + 26 * f} ${cy + 9 * f} Z`;
    A.path(d, { stroke: tone });
  },
  lock(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.42 * s, cy - 0.02 * s, 0.84 * s, 0.62 * s, { stroke: tone });
    A.arc(cx, cy - 0.02 * s, 0.56 * s, 0.72 * s, Math.PI, 2 * Math.PI, false, { stroke: tone });
    A.dot(cx, cy + 0.28 * s, 0.06 * s + 0.8, tone);
  },
  shield(A, cx, cy, s, tone = "@ink") {
    const d =
      `M${cx - 0.42 * s} ${cy - 0.34 * s}` +
      ` Q${cx} ${cy - 0.5 * s} ${cx + 0.42 * s} ${cy - 0.34 * s}` +
      ` C${cx + 0.45 * s} ${cy + 0.06 * s} ${cx + 0.26 * s} ${cy + 0.36 * s} ${cx} ${cy + 0.52 * s}` +
      ` C${cx - 0.26 * s} ${cy + 0.36 * s} ${cx - 0.45 * s} ${cy + 0.06 * s} ${cx - 0.42 * s} ${cy - 0.34 * s} Z`;
    A.path(d, { stroke: tone });
    A.linearPath(
      [
        [cx - 0.16 * s, cy],
        [cx - 0.04 * s, cy + 0.14 * s],
        [cx + 0.2 * s, cy - 0.14 * s],
      ],
      { stroke: tone },
    );
  },
  wifi(A, cx, cy, s, tone = "@ink") {
    for (const m of [0.55, 1.0, 1.45]) {
      A.arc(cx, cy + 0.32 * s, m * s, m * s * 0.85, Math.PI * 1.16, Math.PI * 1.84, false, {
        stroke: tone,
      });
    }
    A.dot(cx, cy + 0.32 * s, 0.07 * s + 0.8, tone);
  },
  box(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.5 * s, cy - 0.16 * s, s, 0.64 * s, { stroke: tone });
    A.polygon(
      [
        [cx - 0.5 * s, cy - 0.16 * s],
        [cx - 0.26 * s, cy - 0.42 * s],
        [cx + 0.74 * s, cy - 0.42 * s],
        [cx + 0.5 * s, cy - 0.16 * s],
      ],
      { stroke: tone },
    );
    A.polygon(
      [
        [cx + 0.5 * s, cy - 0.16 * s],
        [cx + 0.74 * s, cy - 0.42 * s],
        [cx + 0.74 * s, cy + 0.22 * s],
        [cx + 0.5 * s, cy + 0.48 * s],
      ],
      { stroke: tone },
    );
  },
  usb(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.55 * s, cy - 0.18 * s, 0.74 * s, 0.36 * s, { stroke: tone });
    A.rect(cx + 0.19 * s, cy - 0.11 * s, 0.34 * s, 0.22 * s, { stroke: tone });
    A.line(cx + 0.27 * s, cy - 0.04 * s, cx + 0.4 * s, cy - 0.04 * s, { stroke: tone });
    A.line(cx + 0.27 * s, cy + 0.05 * s, cx + 0.4 * s, cy + 0.05 * s, { stroke: tone });
  },
  monitor(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.5 * s, cy - 0.42 * s, s, 0.68 * s, { stroke: tone });
    A.line(cx, cy + 0.26 * s, cx, cy + 0.4 * s, { stroke: tone });
    A.line(cx - 0.2 * s, cy + 0.42 * s, cx + 0.2 * s, cy + 0.42 * s, { stroke: tone });
  },
  smile(A, cx, cy, s, tone = "@ink") {
    A.circle(cx, cy, 0.95 * s, { stroke: tone });
    A.dot(cx - 0.16 * s, cy - 0.08 * s, 0.05 * s + 0.8, tone);
    A.dot(cx + 0.16 * s, cy - 0.08 * s, 0.05 * s + 0.8, tone);
    A.arc(cx, cy + 0.04 * s, 0.5 * s, 0.42 * s, Math.PI * 0.15, Math.PI * 0.85, false, {
      stroke: tone,
    });
  },
  terminal(A, cx, cy, s, tone = "@ink") {
    A.txt(cx, cy + s * 0.22, ">_", {
      anchor: "middle",
      size: s * 0.72,
      mono: true,
      bold: true,
      color: tone,
    });
  },
};

export function drawIcon(A, name, cx, cy, s, tone) {
  const fn = ICONS[name];
  if (!fn) throw new Error(`unknown marker icon: "${name}". add it to icons.mjs`);
  fn(A, cx, cy, s, tone);
}

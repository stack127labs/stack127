/**
 * The marker art icon library. Parametric hand drawn icons built from rough
 * primitives so they restyle with the config. Icons are the first choice over
 * text labels; grow this file instead of drawing ad hoc shapes in figures.
 *
 * Every icon draws centered on (cx, cy) at nominal size s (roughly its width).
 */

export const ICONS = {
  securityCamera(A, cx, cy, s, tone = "@ink") {
    A.linearPath([[cx-.72*s,cy-.34*s],[cx+.35*s,cy-.34*s],[cx+.55*s,cy+.1*s],[cx-.58*s,cy+.1*s],[cx-.72*s,cy-.34*s]], {stroke:tone});
    A.ellipse(cx+.34*s,cy-.08*s,.35*s,.36*s,{stroke:"@primary"});
    A.linearPath([[cx-.25*s,cy+.12*s],[cx-.25*s,cy+.45*s],[cx+.12*s,cy+.62*s]],{stroke:tone});
    A.line(cx-.08*s,cy+.62*s,cx+.36*s,cy+.62*s,{stroke:tone});
  },
  backupPower(A, cx, cy, s, tone = "@ink") {
    A.rect(cx-.48*s,cy-.68*s,.96*s,1.35*s,{stroke:tone});
    A.rect(cx-.23*s,cy-.44*s,.46*s,.23*s,{stroke:"@sub"});
    A.linearPath([[cx+.1*s,cy-.05*s],[cx-.15*s,cy+.22*s],[cx+.1*s,cy+.22*s],[cx-.08*s,cy+.49*s]],{stroke:"@primary"});
    A.line(cx-.32*s,cy+.69*s,cx-.32*s,cy+.76*s,{stroke:tone});
    A.line(cx+.32*s,cy+.69*s,cx+.32*s,cy+.76*s,{stroke:tone});
  },
  radioCoordinator(A, cx, cy, s, tone = "@ink") {
    A.rect(cx-.3*s,cy-.26*s,.6*s,.85*s,{stroke:tone});
    A.rect(cx-.16*s,cy+.6*s,.32*s,.23*s,{stroke:tone});
    A.line(cx,cy-.28*s,cx+.1*s,cy-.76*s,{stroke:tone});
    A.arc(cx+.1*s,cy-.61*s,.68*s,.68*s,-.65,.55,false,{stroke:"@primary"});
    A.dot(cx,cy+.12*s,2,"@sub");
  },
  contactSensor(A, cx, cy, s, tone = "@ink") {
    A.rect(cx-.53*s,cy-.57*s,.5*s,1.14*s,{stroke:tone});
    A.rect(cx+.2*s,cy-.35*s,.3*s,.7*s,{stroke:tone});
    A.line(cx-.04*s,cy,cx+.2*s,cy,{stroke:"@primary"});
    A.dot(cx-.28*s,cy-.33*s,2,"@sub");
  },
  smartPlug(A, cx, cy, s, tone = "@ink") {
    A.rect(cx-.56*s,cy-.46*s,1.12*s,.92*s,{stroke:tone});
    A.ellipse(cx,cy,.64*s,.62*s,{stroke:"@primary"});
    A.line(cx-.12*s,cy-.1*s,cx-.12*s,cy+.03*s,{stroke:tone});
    A.line(cx+.12*s,cy-.1*s,cx+.12*s,cy+.03*s,{stroke:tone});
    A.line(cx-.22*s,cy+.47*s,cx-.22*s,cy+.67*s,{stroke:tone});
    A.line(cx+.22*s,cy+.47*s,cx+.22*s,cy+.67*s,{stroke:tone});
  },
  wallSwitch(A, cx, cy, s, tone = "@ink") {
    A.rect(cx-.46*s,cy-.67*s,.92*s,1.34*s,{stroke:tone});
    A.rect(cx-.28*s,cy-.43*s,.56*s,.86*s,{stroke:tone});
    A.line(cx-.27*s,cy-.03*s,cx+.27*s,cy+.04*s,{stroke:"@primary"});
    A.dot(cx,cy-.55*s,1.4,"@sub");
    A.dot(cx,cy+.55*s,1.4,"@sub");
  },
  softwareStack(A, cx, cy, s, tone = "@ink") {
    // One app window in front of a quieter offset window.
    const outline = { stroke: tone, roughness: 0.9, bowing: 0.3 };
    const secondary = { ...outline, stroke: "@sub" };
    A.linearPath([
      [cx - 0.64 * s, cy - 0.62 * s],
      [cx + 0.9 * s, cy - 0.62 * s],
      [cx + 0.9 * s, cy + 0.36 * s],
    ], secondary);
    A.rect(cx - 0.9 * s, cy - 0.4 * s, 1.56 * s, 1.02 * s, outline);
    A.line(cx - 0.9 * s, cy - 0.16 * s, cx + 0.66 * s, cy - 0.16 * s, secondary);
    A.linearPath([
      [cx - 0.56 * s, cy + 0.05 * s],
      [cx - 0.36 * s, cy + 0.23 * s],
      [cx - 0.56 * s, cy + 0.41 * s],
    ], { ...outline, stroke: "@primary" });
    A.line(cx - 0.13 * s, cy + 0.4 * s, cx + 0.2 * s, cy + 0.4 * s, outline);
  },
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
  search(A, cx, cy, s, tone = "@ink") {
    A.circle(cx - 0.12 * s, cy - 0.12 * s, 0.72 * s, { stroke: tone });
    A.line(cx + 0.14 * s, cy + 0.14 * s, cx + 0.5 * s, cy + 0.5 * s, { stroke: tone });
  },
  clock(A, cx, cy, s, tone = "@ink") {
    A.circle(cx, cy, 0.92 * s, { stroke: tone });
    A.line(cx, cy, cx, cy - 0.26 * s, { stroke: tone });
    A.line(cx, cy, cx + 0.22 * s, cy + 0.12 * s, { stroke: tone });
  },
  calendar(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.46 * s, cy - 0.38 * s, 0.92 * s, 0.82 * s, { stroke: tone });
    A.line(cx - 0.46 * s, cy - 0.14 * s, cx + 0.46 * s, cy - 0.14 * s, { stroke: tone });
    A.line(cx - 0.24 * s, cy - 0.5 * s, cx - 0.24 * s, cy - 0.28 * s, { stroke: tone });
    A.line(cx + 0.24 * s, cy - 0.5 * s, cx + 0.24 * s, cy - 0.28 * s, { stroke: tone });
  },
  user(A, cx, cy, s, tone = "@ink") {
    A.circle(cx, cy - 0.25 * s, 0.36 * s, { stroke: tone });
    A.arc(cx, cy + 0.46 * s, 0.9 * s, 0.7 * s, Math.PI, 2 * Math.PI, false, { stroke: tone });
  },
  building(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.46 * s, cy - 0.46 * s, 0.92 * s, 0.92 * s, { stroke: tone });
    for (const x of [-0.22, 0.22]) {
      for (const y of [-0.22, 0.08]) A.dot(cx + x * s, cy + y * s, 1.8, tone);
    }
    A.line(cx, cy + 0.2 * s, cx, cy + 0.46 * s, { stroke: tone });
  },
  document(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.4 * s, cy - 0.5 * s],
      [cx + 0.18 * s, cy - 0.5 * s],
      [cx + 0.4 * s, cy - 0.28 * s],
      [cx + 0.4 * s, cy + 0.5 * s],
      [cx - 0.4 * s, cy + 0.5 * s],
    ], { stroke: tone });
    A.line(cx - 0.22 * s, cy - 0.08 * s, cx + 0.2 * s, cy - 0.08 * s, { stroke: tone });
    A.line(cx - 0.22 * s, cy + 0.14 * s, cx + 0.24 * s, cy + 0.14 * s, { stroke: tone });
  },
  openBook(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx, cy - 0.34 * s],
      [cx - 0.22 * s, cy - 0.43 * s],
      [cx - 0.75 * s, cy - 0.37 * s],
      [cx - 0.75 * s, cy + 0.38 * s],
      [cx - 0.22 * s, cy + 0.34 * s],
      [cx, cy + 0.45 * s],
    ], { stroke: tone });
    A.polygon([
      [cx, cy - 0.34 * s],
      [cx + 0.22 * s, cy - 0.43 * s],
      [cx + 0.75 * s, cy - 0.37 * s],
      [cx + 0.75 * s, cy + 0.38 * s],
      [cx + 0.22 * s, cy + 0.34 * s],
      [cx, cy + 0.45 * s],
    ], { stroke: tone });
    A.line(cx, cy - 0.34 * s, cx, cy + 0.45 * s, { stroke: "@primary" });
    A.line(cx - 0.75 * s, cy + 0.45 * s, cx - 0.22 * s, cy + 0.41 * s, { stroke: "@sub" });
    A.line(cx + 0.22 * s, cy + 0.41 * s, cx + 0.75 * s, cy + 0.45 * s, { stroke: "@sub" });
  },
  tag(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.5 * s, cy - 0.18 * s],
      [cx + 0.1 * s, cy - 0.48 * s],
      [cx + 0.5 * s, cy - 0.08 * s],
      [cx - 0.1 * s, cy + 0.48 * s],
    ], { stroke: tone });
    A.dot(cx + 0.08 * s, cy - 0.24 * s, 2.2, tone);
  },
  translate(A, cx, cy, s, tone = "@ink") {
    A.txt(cx - 0.2 * s, cy + 0.12 * s, "A", { anchor: "middle", size: s * 0.62, bold: true, color: tone });
    A.txt(cx + 0.24 * s, cy + 0.2 * s, "a", { anchor: "middle", size: s * 0.5, bold: true, color: tone });
  },
  layers(A, cx, cy, s, tone = "@ink") {
    for (const offset of [-0.22, 0, 0.22]) {
      A.polygon([
        [cx, cy - 0.42 * s + offset * s],
        [cx + 0.5 * s, cy - 0.1 * s + offset * s],
        [cx, cy + 0.22 * s + offset * s],
        [cx - 0.5 * s, cy - 0.1 * s + offset * s],
      ], { stroke: tone });
    }
  },
  chart(A, cx, cy, s, tone = "@ink") {
    A.line(cx - 0.5 * s, cy + 0.42 * s, cx + 0.5 * s, cy + 0.42 * s, { stroke: tone });
    A.line(cx - 0.5 * s, cy + 0.42 * s, cx - 0.5 * s, cy - 0.42 * s, { stroke: tone });
    A.linearPath([
      [cx - 0.38 * s, cy + 0.18 * s],
      [cx - 0.08 * s, cy - 0.02 * s],
      [cx + 0.12 * s, cy + 0.08 * s],
      [cx + 0.4 * s, cy - 0.3 * s],
    ], { stroke: tone });
  },
  grid(A, cx, cy, s, tone = "@ink") {
    for (const x of [-0.27, 0.27]) {
      for (const y of [-0.27, 0.27]) A.rect(cx + x * s - 0.2 * s, cy + y * s - 0.2 * s, 0.4 * s, 0.4 * s, { stroke: tone });
    }
  },
  permissionFile(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.5 * s, cy - 0.62 * s],
      [cx + 0.2 * s, cy - 0.62 * s],
      [cx + 0.5 * s, cy - 0.32 * s],
      [cx + 0.5 * s, cy + 0.62 * s],
      [cx - 0.5 * s, cy + 0.62 * s],
    ], { stroke: tone });
    A.line(cx + 0.2 * s, cy - 0.62 * s, cx + 0.2 * s, cy - 0.32 * s, { stroke: "@sub" });
    A.line(cx + 0.2 * s, cy - 0.32 * s, cx + 0.5 * s, cy - 0.32 * s, { stroke: "@sub" });
    for (const [index, y] of [-0.05, 0.23, 0.5].entries()) {
      const xEnd = cx + (index === 0 ? 0.28 : index === 1 ? 0.06 : -0.16) * s;
      A.line(cx - 0.28 * s, cy + y * s, xEnd, cy + y * s, {
        stroke: index === 0 ? "@primary" : "@sub",
      });
    }
  },
  composeServices(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.58 * s, cy - 0.28 * s, 0.42 * s, 0.56 * s, { stroke: "@sub" });
    A.rect(cx + 0.06 * s, cy - 0.53 * s, 0.5 * s, 0.4 * s, { stroke: tone });
    A.rect(cx + 0.06 * s, cy + 0.13 * s, 0.5 * s, 0.4 * s, { stroke: tone });
    A.line(cx - 0.16 * s, cy, cx - 0.02 * s, cy, { stroke: "@primary" });
    A.line(cx - 0.02 * s, cy - 0.33 * s, cx - 0.02 * s, cy + 0.33 * s, { stroke: "@primary" });
    A.line(cx - 0.02 * s, cy - 0.33 * s, cx + 0.06 * s, cy - 0.33 * s, { stroke: "@primary" });
    A.line(cx - 0.02 * s, cy + 0.33 * s, cx + 0.06 * s, cy + 0.33 * s, { stroke: "@primary" });
  },
  ipRegistry(A, cx, cy, s, tone = "@ink") {
    A.circle(cx - 0.23 * s, cy, 0.82 * s, { stroke: tone });
    A.ellipse(cx - 0.23 * s, cy, 0.34 * s, 0.82 * s, { stroke: "@sub" });
    A.line(cx - 0.63 * s, cy, cx + 0.17 * s, cy, { stroke: "@sub" });
    A.line(cx - 0.55 * s, cy - 0.23 * s, cx + 0.09 * s, cy - 0.23 * s, { stroke: "@sub" });
    A.line(cx - 0.55 * s, cy + 0.23 * s, cx + 0.09 * s, cy + 0.23 * s, { stroke: "@sub" });
    A.arrow(cx + 0.2 * s, cy, cx + 0.43 * s, cy, { tone: "@primary" });
    A.rect(cx + 0.45 * s, cy - 0.36 * s, 0.36 * s, 0.72 * s, { stroke: tone });
    A.line(cx + 0.53 * s, cy - 0.15 * s, cx + 0.72 * s, cy - 0.15 * s, { stroke: "@primary" });
    A.line(cx + 0.53 * s, cy + 0.02 * s, cx + 0.72 * s, cy + 0.02 * s, { stroke: "@sub" });
    A.line(cx + 0.53 * s, cy + 0.18 * s, cx + 0.68 * s, cy + 0.18 * s, { stroke: "@sub" });
  },
  bookRuler(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx, cy - 0.27 * s],
      [cx - 0.18 * s, cy - 0.38 * s],
      [cx - 0.69 * s, cy - 0.33 * s],
      [cx - 0.69 * s, cy + 0.34 * s],
      [cx - 0.18 * s, cy + 0.3 * s],
      [cx, cy + 0.4 * s],
    ], { stroke: tone });
    A.polygon([
      [cx, cy - 0.27 * s],
      [cx + 0.18 * s, cy - 0.38 * s],
      [cx + 0.69 * s, cy - 0.33 * s],
      [cx + 0.69 * s, cy + 0.34 * s],
      [cx + 0.18 * s, cy + 0.3 * s],
      [cx, cy + 0.4 * s],
    ], { stroke: tone });
    A.line(cx, cy - 0.27 * s, cx, cy + 0.4 * s, { stroke: "@primary" });
    A.line(cx - 0.47 * s, cy + 0.55 * s, cx + 0.47 * s, cy + 0.55 * s, { stroke: "@primary" });
    for (const x of [-0.3, -0.06, 0.18, 0.42]) {
      A.line(cx + x * s, cy + 0.55 * s, cx + x * s, cy + (x === -0.06 ? 0.43 : 0.48) * s, { stroke: "@primary" });
    }
  },
  imageResolution(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.62 * s, cy - 0.45 * s, 1.05 * s, 0.78 * s, { stroke: tone });
    A.circle(cx - 0.34 * s, cy - 0.19 * s, 0.13 * s, { stroke: "@primary" });
    A.linearPath([
      [cx - 0.54 * s, cy + 0.2 * s],
      [cx - 0.28 * s, cy - 0.02 * s],
      [cx - 0.08 * s, cy + 0.14 * s],
      [cx + 0.2 * s, cy - 0.12 * s],
      [cx + 0.4 * s, cy + 0.22 * s],
    ], { stroke: "@sub" });
    A.circle(cx + 0.41 * s, cy + 0.3 * s, 0.46 * s, { stroke: "@primary" });
    A.line(cx + 0.56 * s, cy + 0.46 * s, cx + 0.76 * s, cy + 0.66 * s, { stroke: "@primary" });
    A.dot(cx + 0.41 * s, cy + 0.3 * s, 2.2, "@sub");
  },
  metadataBook(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.46 * s, cy - 0.52 * s],
      [cx + 0.18 * s, cy - 0.52 * s],
      [cx + 0.46 * s, cy - 0.24 * s],
      [cx + 0.46 * s, cy + 0.48 * s],
      [cx - 0.46 * s, cy + 0.48 * s],
    ], { stroke: tone });
    A.line(cx + 0.18 * s, cy - 0.52 * s, cx + 0.18 * s, cy - 0.24 * s, { stroke: "@sub" });
    A.line(cx + 0.18 * s, cy - 0.24 * s, cx + 0.46 * s, cy - 0.24 * s, { stroke: "@sub" });
    A.line(cx - 0.25 * s, cy - 0.08 * s, cx + 0.19 * s, cy - 0.08 * s, { stroke: "@sub" });
    A.line(cx - 0.25 * s, cy + 0.13 * s, cx + 0.19 * s, cy + 0.13 * s, { stroke: "@sub" });
    A.polygon([
      [cx + 0.28 * s, cy + 0.02 * s],
      [cx + 0.63 * s, cy + 0.16 * s],
      [cx + 0.54 * s, cy + 0.67 * s],
      [cx + 0.36 * s, cy + 0.52 * s],
      [cx + 0.21 * s, cy + 0.68 * s],
    ], { stroke: "@primary" });
  },
  pageStack(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.4 * s, cy - 0.42 * s], [cx + 0.27 * s, cy - 0.42 * s],
      [cx + 0.45 * s, cy - 0.24 * s], [cx + 0.45 * s, cy + 0.53 * s],
      [cx - 0.4 * s, cy + 0.53 * s],
    ], { stroke: "@sub" });
    A.polygon([
      [cx - 0.55 * s, cy - 0.58 * s], [cx + 0.12 * s, cy - 0.58 * s],
      [cx + 0.31 * s, cy - 0.39 * s], [cx + 0.31 * s, cy + 0.38 * s],
      [cx - 0.55 * s, cy + 0.38 * s],
    ], { stroke: tone });
    A.line(cx + 0.12 * s, cy - 0.58 * s, cx + 0.12 * s, cy - 0.39 * s, { stroke: "@primary" });
    A.line(cx + 0.12 * s, cy - 0.39 * s, cx + 0.31 * s, cy - 0.39 * s, { stroke: "@primary" });
    A.line(cx - 0.35 * s, cy - 0.1 * s, cx + 0.06 * s, cy - 0.1 * s, { stroke: "@sub" });
    A.line(cx - 0.35 * s, cy + 0.13 * s, cx - 0.03 * s, cy + 0.13 * s, { stroke: "@primary" });
  },
  paymentCalendar(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.56 * s, cy - 0.47 * s, 0.88 * s, 0.88 * s, { stroke: tone });
    A.line(cx - 0.56 * s, cy - 0.18 * s, cx + 0.32 * s, cy - 0.18 * s, { stroke: "@sub" });
    A.line(cx - 0.34 * s, cy - 0.59 * s, cx - 0.34 * s, cy - 0.34 * s, { stroke: tone });
    A.line(cx + 0.1 * s, cy - 0.59 * s, cx + 0.1 * s, cy - 0.34 * s, { stroke: tone });
    A.circle(cx + 0.39 * s, cy + 0.23 * s, 0.58 * s, { stroke: "@primary" });
    A.line(cx + 0.39 * s, cy + 0.23 * s, cx + 0.39 * s, cy + 0.04 * s, { stroke: "@primary" });
    A.line(cx + 0.39 * s, cy + 0.23 * s, cx + 0.54 * s, cy + 0.31 * s, { stroke: "@primary" });
  },
  pdfPreflight(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.38 * s, cy - 0.58 * s], [cx + 0.17 * s, cy - 0.58 * s],
      [cx + 0.39 * s, cy - 0.36 * s], [cx + 0.39 * s, cy + 0.58 * s],
      [cx - 0.38 * s, cy + 0.58 * s],
    ], { stroke: tone });
    A.line(cx + 0.17 * s, cy - 0.58 * s, cx + 0.17 * s, cy - 0.36 * s, { stroke: "@sub" });
    A.line(cx + 0.17 * s, cy - 0.36 * s, cx + 0.39 * s, cy - 0.36 * s, { stroke: "@sub" });
    A.line(cx - 0.17 * s, cy - 0.14 * s, cx + 0.19 * s, cy - 0.14 * s, { stroke: "@sub" });
    A.linearPath([
      [cx - 0.16 * s, cy + 0.19 * s],
      [cx - 0.02 * s, cy + 0.34 * s],
      [cx + 0.22 * s, cy + 0.07 * s],
    ], { stroke: "@primary", strokeWidth: 3 });
    for (const sign of [-1, 1]) {
      A.line(cx + sign * 0.55 * s, cy - 0.58 * s, cx + sign * 0.43 * s, cy - 0.58 * s, { stroke: "@sub" });
      A.line(cx + sign * 0.55 * s, cy - 0.58 * s, cx + sign * 0.55 * s, cy - 0.46 * s, { stroke: "@sub" });
      A.line(cx + sign * 0.55 * s, cy + 0.58 * s, cx + sign * 0.43 * s, cy + 0.58 * s, { stroke: "@sub" });
      A.line(cx + sign * 0.55 * s, cy + 0.58 * s, cx + sign * 0.55 * s, cy + 0.46 * s, { stroke: "@sub" });
    }
  },
  royaltyBook(A, cx, cy, s, tone = "@ink") {
    A.polygon([
      [cx - 0.58 * s, cy - 0.35 * s], [cx - 0.18 * s, cy - 0.43 * s],
      [cx, cy - 0.28 * s], [cx, cy + 0.42 * s],
      [cx - 0.18 * s, cy + 0.3 * s], [cx - 0.58 * s, cy + 0.36 * s],
    ], { stroke: tone });
    A.polygon([
      [cx, cy - 0.28 * s], [cx + 0.18 * s, cy - 0.43 * s],
      [cx + 0.58 * s, cy - 0.35 * s], [cx + 0.58 * s, cy + 0.36 * s],
      [cx + 0.18 * s, cy + 0.3 * s], [cx, cy + 0.42 * s],
    ], { stroke: tone });
    A.line(cx, cy - 0.28 * s, cx, cy + 0.42 * s, { stroke: "@sub" });
    A.circle(cx + 0.48 * s, cy - 0.48 * s, 0.3 * s, { stroke: "@primary" });
    A.circle(cx + 0.67 * s, cy - 0.22 * s, 0.3 * s, { stroke: "@primary" });
    A.arc(cx + 0.49 * s, cy - 0.48 * s, 0.11 * s, 0.11 * s, 0, Math.PI, false, { stroke: "@primary" });
    A.arc(cx + 0.68 * s, cy - 0.22 * s, 0.11 * s, 0.11 * s, 0, Math.PI, false, { stroke: "@primary" });
  },
  idMap(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.58 * s, cy - 0.49 * s, 0.72 * s, 0.3 * s, { stroke: tone });
    A.rect(cx - 0.42 * s, cy + 0.17 * s, 1.0 * s, 0.3 * s, { stroke: "@sub" });
    A.line(cx - 0.43 * s, cy - 0.34 * s, cx - 0.18 * s, cy - 0.34 * s, { stroke: "@primary" });
    A.line(cx - 0.23 * s, cy + 0.32 * s, cx + 0.32 * s, cy + 0.32 * s, { stroke: "@primary" });
    A.arrow(cx + 0.18 * s, cy - 0.18 * s, cx + 0.03 * s, cy + 0.13 * s, { tone: "@primary" });
  },
  mqttDiscovery(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.66 * s, cy - 0.34 * s, 0.48 * s, 0.68 * s, { stroke: tone });
    A.circle(cx - 0.42 * s, cy - 0.04 * s, 0.18 * s, { stroke: "@primary" });
    A.line(cx - 0.58 * s, cy + 0.48 * s, cx - 0.26 * s, cy + 0.48 * s, { stroke: "@sub" });
    A.arc(cx + 0.08 * s, cy, 0.7 * s, 0.72 * s, -0.82, 0.82, false, { stroke: "@primary" });
    A.arc(cx + 0.08 * s, cy, 1.08 * s, 1.08 * s, -0.8, 0.8, false, { stroke: "@sub" });
    A.circle(cx + 0.57 * s, cy, 0.3 * s, { stroke: tone });
    A.dot(cx + 0.57 * s, cy, 2, "@primary");
  },
  rsyncFilter(A, cx, cy, s, tone = "@ink") {
    A.path(
      `M${cx - 0.72 * s} ${cy - 0.38 * s} L${cx - 0.1 * s} ${cy - 0.38 * s} L${cx + 0.02 * s} ${cy - 0.22 * s} L${cx + 0.02 * s} ${cy + 0.55 * s} L${cx - 0.72 * s} ${cy + 0.55 * s} Z`,
      { stroke: tone },
    );
    A.line(cx - 0.54 * s, cy - 0.08 * s, cx - 0.2 * s, cy - 0.08 * s, { stroke: "@sub" });
    A.line(cx - 0.54 * s, cy + 0.16 * s, cx - 0.2 * s, cy + 0.16 * s, { stroke: "@sub" });
    A.line(cx - 0.54 * s, cy + 0.4 * s, cx - 0.2 * s, cy + 0.4 * s, { stroke: "@sub" });
    A.polygon([
      [cx + 0.12 * s, cy - 0.42 * s], [cx + 0.74 * s, cy - 0.42 * s],
      [cx + 0.5 * s, cy - 0.06 * s], [cx + 0.5 * s, cy + 0.38 * s],
      [cx + 0.34 * s, cy + 0.5 * s], [cx + 0.34 * s, cy - 0.06 * s],
    ], { stroke: "@primary" });
  },
  resourceFit(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.72 * s, cy - 0.3 * s, 0.4 * s, 0.58 * s, { stroke: "@sub" });
    A.line(cx - 0.62 * s, cy - 0.12 * s, cx - 0.42 * s, cy - 0.12 * s, { stroke: "@sub" });
    A.arrow(cx - 0.25 * s, cy, cx - 0.02 * s, cy, { tone: "@primary" });
    A.rect(cx + 0.04 * s, cy - 0.57 * s, 0.72 * s, 1.14 * s, { stroke: tone });
    A.line(cx + 0.04 * s, cy - 0.19 * s, cx + 0.76 * s, cy - 0.19 * s, { stroke: "@sub" });
    A.line(cx + 0.04 * s, cy + 0.19 * s, cx + 0.76 * s, cy + 0.19 * s, { stroke: "@sub" });
    A.line(cx + 0.35 * s, cy - 0.48 * s, cx + 0.35 * s, cy - 0.28 * s, { stroke: "@primary" });
    A.line(cx + 0.35 * s, cy - 0.1 * s, cx + 0.64 * s, cy - 0.1 * s, { stroke: "@primary" });
    A.line(cx + 0.35 * s, cy + 0.28 * s, cx + 0.56 * s, cy + 0.28 * s, { stroke: "@primary" });
  },
  shortcutSheet(A, cx, cy, s, tone = "@ink") {
    A.rect(cx - 0.69 * s, cy - 0.37 * s, 0.72 * s, 0.72 * s, { stroke: tone });
    for (const y of [-0.18, 0.04]) {
      for (const x of [-0.52, -0.31, -0.1]) {
        A.rect(cx + x * s, cy + y * s, 0.12 * s, 0.12 * s, {
          stroke: x === -0.31 && y === -0.18 ? "@primary" : "@sub",
        });
      }
    }
    A.polygon([
      [cx + 0.2 * s, cy - 0.58 * s], [cx + 0.58 * s, cy - 0.58 * s],
      [cx + 0.72 * s, cy - 0.44 * s], [cx + 0.72 * s, cy + 0.58 * s],
      [cx + 0.2 * s, cy + 0.58 * s],
    ], { stroke: tone });
    A.line(cx + 0.58 * s, cy - 0.58 * s, cx + 0.58 * s, cy - 0.44 * s, { stroke: "@primary" });
    A.line(cx + 0.58 * s, cy - 0.44 * s, cx + 0.72 * s, cy - 0.44 * s, { stroke: "@primary" });
    A.line(cx + 0.31 * s, cy - 0.18 * s, cx + 0.58 * s, cy - 0.18 * s, { stroke: "@sub" });
    A.line(cx + 0.31 * s, cy + 0.04 * s, cx + 0.58 * s, cy + 0.04 * s, { stroke: "@primary" });
  },
  resticRetention(A, cx, cy, s, tone = "@ink") {
    A.arrow(cx - 0.74 * s, cy + 0.53 * s, cx + 0.74 * s, cy + 0.53 * s, { tone: "@sub" });
    A.line(cx + 0.28 * s, cy - 0.55 * s, cx + 0.28 * s, cy + 0.35 * s, { stroke: "@primary" });
    for (const [index, x] of [-0.55, -0.04, 0.52].entries()) {
      const top = cy - 0.14 * s;
      const stroke = index === 2 ? "@primary" : tone;
      A.ellipse(cx + x * s, top, 0.4 * s, 0.15 * s, { stroke });
      A.line(cx + (x - 0.2) * s, top, cx + (x - 0.2) * s, cy + 0.16 * s, { stroke });
      A.line(cx + (x + 0.2) * s, top, cx + (x + 0.2) * s, cy + 0.16 * s, { stroke });
      A.arc(cx + x * s, cy + 0.16 * s, 0.4 * s, 0.15 * s, 0, Math.PI, false, { stroke });
    }
  },
};

export function drawIcon(A, name, cx, cy, s, tone) {
  const fn = ICONS[name];
  if (!fn) throw new Error(`unknown marker icon: "${name}". add it to icons.mjs`);
  fn(A, cx, cy, s, tone);
}

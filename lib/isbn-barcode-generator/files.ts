import { type SymbolDrawing, glyphContours } from "./symbol.ts";

const MM_PER_INCH = 25.4;
const POINTS_PER_MM = 72 / MM_PER_INCH;

function number(value: number, places: number): string {
  const text = value.toFixed(places).replace(/\.?0+$/, "");
  return text === "-0" ? "0" : text;
}

// SVG: inches outside, millimetres inside. Only the engine's own paths.
export function drawingSvg(drawing: SymbolDrawing): string {
  const n = (value: number) => number(value, 4);
  const bars = drawing.bars.map(bar => `M${n(bar.x)} ${n(bar.y)}h${n(bar.width)}v${n(bar.height)}h${n(-bar.width)}z`).join("");
  let text = "";
  for (const glyph of drawing.glyphs) {
    for (const contour of glyphContours(glyph)) {
      for (const segment of contour) {
        text += segment.type === "C"
          ? `C${n(segment.x1)} ${n(segment.y1)} ${n(segment.x2)} ${n(segment.y2)} ${n(segment.x)} ${n(segment.y)}`
          : `${segment.type}${n(segment.x)} ${n(segment.y)}`;
      }
      text += "z";
    }
  }
  const width = n(drawing.widthMm);
  const height = n(drawing.heightMm);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${number(drawing.widthMm / MM_PER_INCH, 4)}in" height="${number(drawing.heightMm / MM_PER_INCH, 4)}in" viewBox="0 0 ${width} ${height}">`
    + `<rect width="${width}" height="${height}" fill="#fff"/>`
    + `<path fill="#000" d="${bars}"/>`
    + `<path fill="#000" d="${text}"/>`
    + `</svg>`;
}

// PDF: one page the size of the white box, vector paths in DeviceCMYK, no fonts.
export function drawingPdf(drawing: SymbolDrawing): Uint8Array {
  const width = drawing.widthMm * POINTS_PER_MM;
  const height = drawing.heightMm * POINTS_PER_MM;
  const n = (value: number) => number(value, 3);
  const x = (mm: number) => n(mm * POINTS_PER_MM);
  const y = (mm: number) => n(height - mm * POINTS_PER_MM);

  const ops: string[] = [`0 0 0 0 k`, `0 0 ${n(width)} ${n(height)} re f`, `0 0 0 1 k`];
  for (const bar of drawing.bars) {
    ops.push(`${x(bar.x)} ${y(bar.y + bar.height)} ${n(bar.width * POINTS_PER_MM)} ${n(bar.height * POINTS_PER_MM)} re`);
  }
  ops.push("f");
  for (const glyph of drawing.glyphs) {
    for (const contour of glyphContours(glyph)) {
      for (const s of contour) {
        if (s.type === "M") ops.push(`${x(s.x)} ${y(s.y)} m`);
        else if (s.type === "L") ops.push(`${x(s.x)} ${y(s.y)} l`);
        else ops.push(`${x(s.x1)} ${y(s.y1)} ${x(s.x2)} ${y(s.y2)} ${x(s.x)} ${y(s.y)} c`);
      }
      ops.push("h");
    }
  }
  ops.push("f");
  const content = ops.join("\n") + "\n";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(width)} ${n(height)}] /Resources << >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

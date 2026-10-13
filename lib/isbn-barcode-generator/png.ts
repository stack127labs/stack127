import { type Segment, type SymbolDrawing, glyphContours } from "./symbol.ts";

// 600 ppi, 1-bit grayscale PNG with pHYs, white box included.

const PIXELS_PER_MM = 600 / 25.4;
const PIXELS_PER_METRE = 23622;
const CURVE_STEPS = 12;

type Edge = { x0: number; y0: number; x1: number; y1: number; winding: number };

function edgesOf(contours: Segment[][], scale: number): Edge[] {
  const edges: Edge[] = [];
  for (const contour of contours) {
    let startX = 0, startY = 0, lastX = 0, lastY = 0;
    const lineTo = (x: number, y: number) => {
      if (y !== lastY) {
        edges.push(y > lastY ? { x0: lastX, y0: lastY, x1: x, y1: y, winding: 1 } : { x0: x, y0: y, x1: lastX, y1: lastY, winding: -1 });
      }
      lastX = x;
      lastY = y;
    };
    for (const s of contour) {
      if (s.type === "M") {
        startX = lastX = s.x * scale;
        startY = lastY = s.y * scale;
      } else if (s.type === "L") {
        lineTo(s.x * scale, s.y * scale);
      } else {
        const x0 = lastX, y0 = lastY;
        const x1 = s.x1 * scale, y1 = s.y1 * scale, x2 = s.x2 * scale, y2 = s.y2 * scale, x3 = s.x * scale, y3 = s.y * scale;
        for (let step = 1; step <= CURVE_STEPS; step += 1) {
          const t = step / CURVE_STEPS, u = 1 - t;
          lineTo(
            u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
            u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
          );
        }
      }
    }
    lineTo(startX, startY);
  }
  return edges;
}

export function drawingPng(drawing: SymbolDrawing): Uint8Array {
  const width = Math.round(drawing.widthMm * PIXELS_PER_MM);
  const height = Math.round(drawing.heightMm * PIXELS_PER_MM);
  const rowBytes = Math.ceil(width / 8);
  const stride = rowBytes + 1;
  // Filter byte 0 on every row, then bits with 1 = white.
  const raw = new Uint8Array(stride * height);
  for (let row = 0; row < height; row += 1) raw.fill(0xff, row * stride + 1, (row + 1) * stride);

  const black = (row: number, fromX: number, toX: number) => {
    const base = row * stride + 1;
    for (let px = Math.max(0, fromX); px < Math.min(width, toX); px += 1) raw[base + (px >> 3)] &= ~(0x80 >> (px & 7));
  };

  // Bars: each bar edge rounds to the nearest pixel. Rows between two bar
  // edges are identical, so draw the first and copy it down.
  const bars = drawing.bars.map(bar => ({
    x0: Math.round(bar.x * PIXELS_PER_MM),
    x1: Math.round((bar.x + bar.width) * PIXELS_PER_MM),
    y0: Math.max(0, Math.round(bar.y * PIXELS_PER_MM)),
    y1: Math.min(height, Math.round((bar.y + bar.height) * PIXELS_PER_MM)),
  }));
  const breaks = [...new Set(bars.flatMap(bar => [bar.y0, bar.y1]))].sort((a, b) => a - b);
  for (let index = 0; index < breaks.length - 1; index += 1) {
    const from = breaks[index], to = breaks[index + 1];
    const covering = bars.filter(bar => bar.y0 <= from && bar.y1 >= to);
    if (covering.length === 0 || from >= to) continue;
    for (const bar of covering) black(from, bar.x0, bar.x1);
    const first = raw.subarray(from * stride, (from + 1) * stride);
    for (let row = from + 1; row < to; row += 1) raw.set(first, row * stride);
  }

  // Glyphs: scanline fill at pixel centres with the nonzero rule.
  for (const glyph of drawing.glyphs) {
    const edges = edgesOf(glyphContours(glyph), PIXELS_PER_MM);
    let top = Infinity, bottom = -Infinity;
    for (const edge of edges) {
      top = Math.min(top, edge.y0);
      bottom = Math.max(bottom, edge.y1);
    }
    for (let row = Math.max(0, Math.floor(top)); row < Math.min(height, Math.ceil(bottom)); row += 1) {
      const y = row + 0.5;
      const crossings: [number, number][] = [];
      for (const edge of edges) {
        if (y < edge.y0 || y >= edge.y1) continue;
        crossings.push([edge.x0 + ((y - edge.y0) / (edge.y1 - edge.y0)) * (edge.x1 - edge.x0), edge.winding]);
      }
      crossings.sort((a, b) => a[0] - b[0]);
      let winding = 0;
      for (let index = 0; index < crossings.length - 1; index += 1) {
        winding += crossings[index][1];
        if (winding !== 0) black(row, Math.ceil(crossings[index][0] - 0.5), Math.ceil(crossings[index + 1][0] - 0.5));
      }
    }
  }

  const header = new Uint8Array(13);
  const headerView = new DataView(header.buffer);
  headerView.setUint32(0, width);
  headerView.setUint32(4, height);
  header.set([1, 0, 0, 0, 0], 8); // bit depth 1, grayscale, deflate, adaptive filter, no interlace
  const phys = new Uint8Array(9);
  const physView = new DataView(phys.buffer);
  physView.setUint32(0, PIXELS_PER_METRE);
  physView.setUint32(4, PIXELS_PER_METRE);
  phys[8] = 1; // metres

  return concat([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("pHYs", phys),
    chunk("IDAT", zlib(raw, stride)),
    chunk("IEND", new Uint8Array(0)),
  ]);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let index = 0; index < 4; index += 1) out[4 + index] = type.charCodeAt(index);
  out.set(data, 8);
  let crc = 0xffffffff;
  for (let index = 4; index < 8 + data.length; index += 1) crc = CRC_TABLE[(crc ^ out[index]) & 0xff] ^ (crc >>> 8);
  view.setUint32(8 + data.length, (crc ^ 0xffffffff) >>> 0);
  return out;
}

// zlib stream with one fixed-Huffman deflate block. Matches look back one byte
// (runs) or one row (rows repeat through the bars), which is enough here.

const LENGTH_BASE: number[] = [];
const LENGTH_EXTRA: number[] = [];
const DISTANCE_BASE: number[] = [];
const DISTANCE_EXTRA: number[] = [];
(() => {
  let length = 3;
  for (let code = 0; code < 28; code += 1) {
    const extra = code < 8 ? 0 : Math.floor(code / 4) - 1;
    LENGTH_BASE.push(length);
    LENGTH_EXTRA.push(extra);
    length += 1 << extra;
  }
  LENGTH_BASE.push(258);
  LENGTH_EXTRA.push(0);
  let distance = 1;
  for (let code = 0; code < 30; code += 1) {
    const extra = code < 4 ? 0 : Math.floor(code / 2) - 1;
    DISTANCE_BASE.push(distance);
    DISTANCE_EXTRA.push(extra);
    distance += 1 << extra;
  }
})();

class BitWriter {
  private out = new Uint8Array(1 << 16);
  length = 0;
  private buffer = 0;
  private count = 0;

  // Least significant bit first, as deflate packs everything but Huffman codes.
  bits(value: number, length: number) {
    this.buffer |= value << this.count;
    this.count += length;
    while (this.count >= 8) {
      this.byte(this.buffer & 0xff);
      this.buffer >>>= 8;
      this.count -= 8;
    }
  }

  flush() {
    if (this.count > 0) this.byte(this.buffer & 0xff);
    this.buffer = 0;
    this.count = 0;
  }

  bytes(): Uint8Array {
    return this.out.subarray(0, this.length);
  }

  private byte(value: number) {
    if (this.length === this.out.length) {
      const grown = new Uint8Array(this.out.length * 2);
      grown.set(this.out);
      this.out = grown;
    }
    this.out[this.length++] = value;
  }
}

function reversed(code: number, length: number): number {
  let out = 0;
  for (let index = 0; index < length; index += 1) out |= ((code >> index) & 1) << (length - 1 - index);
  return out;
}

// Fixed Huffman codes, bit-reversed so they can go out least significant bit first.
const LITERAL_CODES = new Uint16Array(288);
const LITERAL_LENGTHS = new Uint8Array(288);
for (let symbol = 0; symbol < 288; symbol += 1) {
  const [code, length] = symbol < 144 ? [0x30 + symbol, 8]
    : symbol < 256 ? [0x190 + symbol - 144, 9]
    : symbol < 280 ? [symbol - 256, 7]
    : [0xc0 + symbol - 280, 8];
  LITERAL_CODES[symbol] = reversed(code, length);
  LITERAL_LENGTHS[symbol] = length;
}
const DISTANCE_CODES = Array.from({ length: 30 }, (_, code) => reversed(code, 5));

function literalOrLength(writer: BitWriter, symbol: number) {
  writer.bits(LITERAL_CODES[symbol], LITERAL_LENGTHS[symbol]);
}

function lastIndexAtMost(table: number[], value: number): number {
  let index = table.length - 1;
  while (table[index] > value) index -= 1;
  return index;
}

function zlib(data: Uint8Array, stride: number): Uint8Array {
  const writer = new BitWriter();
  writer.bits(0x78, 8);
  writer.bits(0x01, 8);
  writer.bits(1, 1); // final block
  writer.bits(1, 2); // fixed Huffman

  let position = 0;
  while (position < data.length) {
    let bestLength = 0, bestDistance = 0;
    for (const distance of [1, stride]) {
      if (distance > position) continue;
      let length = 0;
      const limit = Math.min(258, data.length - position);
      while (length < limit && data[position + length] === data[position + length - distance]) length += 1;
      if (length > bestLength) {
        bestLength = length;
        bestDistance = distance;
      }
    }
    if (bestLength >= 3) {
      const lengthCode = lastIndexAtMost(LENGTH_BASE, bestLength);
      literalOrLength(writer, 257 + lengthCode);
      writer.bits(bestLength - LENGTH_BASE[lengthCode], LENGTH_EXTRA[lengthCode]);
      const distanceCode = lastIndexAtMost(DISTANCE_BASE, bestDistance);
      writer.bits(DISTANCE_CODES[distanceCode], 5);
      writer.bits(bestDistance - DISTANCE_BASE[distanceCode], DISTANCE_EXTRA[distanceCode]);
      position += bestLength;
    } else {
      literalOrLength(writer, data[position]);
      position += 1;
    }
  }
  literalOrLength(writer, 256);
  writer.flush();

  let a = 1, b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  const body = writer.bytes();
  const out = new Uint8Array(body.length + 4);
  out.set(body);
  new DataView(out.buffer).setUint32(body.length, ((b << 16) | a) >>> 0);
  return out;
}

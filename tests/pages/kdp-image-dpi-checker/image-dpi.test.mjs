import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePlacement,
  fromInches,
  KDP_IMAGE_MAX_BYTES,
  KdpImageError,
  parseKdpImageBytes,
  parsePrintDimension,
  toInches,
} from "../../../app/(site)/(tools)/kdp-image-dpi-checker/image-dpi.ts";

function concat(...parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function pngChunk(name, payload = new Uint8Array()) {
  const type = new TextEncoder().encode(name);
  const chunk = new Uint8Array(12 + payload.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, payload.length, false);
  chunk.set(type, 4);
  chunk.set(payload, 8);
  return chunk;
}

function makePng(width, height, extraChunks = []) {
  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width, false);
  view.setUint32(4, height, false);
  header[8] = 8;
  header[9] = 2;
  const density = extraChunks.map((chunk) => pngChunk(chunk.name, chunk.payload));
  return concat(signature, pngChunk("IHDR", header), ...density, pngChunk("IDAT", Uint8Array.of(0)), pngChunk("IEND"));
}

function makeTiff({ orientation = null, orientationType = 3, xDpi = null, yDpi = null, unit = 2, invalidXOffset = false } = {}) {
  const tags = [];
  if (orientation !== null) tags.push({ tag: 0x0112, type: orientationType, value: orientation });
  if (xDpi !== null) tags.push({ tag: 0x011a, type: 5, value: xDpi, invalidOffset: invalidXOffset });
  if (yDpi !== null) tags.push({ tag: 0x011b, type: 5, value: yDpi });
  if (unit !== null) tags.push({ tag: 0x0128, type: 3, value: unit });
  const directoryEnd = 8 + 2 + tags.length * 12 + 4;
  const rationalCount = tags.filter((tag) => tag.type === 5 && !tag.invalidOffset).length;
  const output = new Uint8Array(directoryEnd + rationalCount * 8);
  output.set([0x49, 0x49], 0);
  const view = new DataView(output.buffer);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, tags.length, true);
  let rationalOffset = directoryEnd;
  for (const [index, tag] of tags.entries()) {
    const entry = 10 + index * 12;
    view.setUint16(entry, tag.tag, true);
    view.setUint16(entry + 2, tag.type, true);
    view.setUint32(entry + 4, 1, true);
    if (tag.type === 3) view.setUint16(entry + 8, tag.value, true);
    else if (tag.type === 4) view.setUint32(entry + 8, tag.value, true);
    else if (tag.invalidOffset) view.setUint32(entry + 8, 0xfffffff0, true);
    else {
      view.setUint32(entry + 8, rationalOffset, true);
      view.setUint32(rationalOffset, tag.value, true);
      view.setUint32(rationalOffset + 4, 1, true);
      rationalOffset += 8;
    }
  }
  return output;
}

function jpegSegment(marker, payload) {
  const segment = new Uint8Array(payload.length + 4);
  segment[0] = 0xff;
  segment[1] = marker;
  segment[2] = (payload.length + 2) >> 8;
  segment[3] = (payload.length + 2) & 0xff;
  segment.set(payload, 4);
  return segment;
}

function makeJpeg(width, height, { orientation = null, xDpi = 300, yDpi = 150, unit = 1 } = {}) {
  const jfif = Uint8Array.from([0x4a, 0x46, 0x49, 0x46, 0x00, 1, 2, unit, xDpi >> 8, xDpi & 0xff, yDpi >> 8, yDpi & 0xff, 0, 0]);
  const sof = Uint8Array.from([8, height >> 8, height & 0xff, width >> 8, width & 0xff, 1, 1, 0x11, 0]);
  const sos = Uint8Array.from([1, 1, 0, 0, 63, 0]);
  const exifSegments = orientation === null ? [] : [jpegSegment(0xe1, concat(Uint8Array.from([0x45, 0x78, 0x69, 0x66, 0, 0]), makeTiff({ orientation, xDpi: 72, yDpi: 72, unit: 2 })))];
  return concat(
    Uint8Array.from([0xff, 0xd8]),
    jpegSegment(0xe0, jfif),
    ...exifSegments,
    jpegSegment(0xc0, sof),
    jpegSegment(0xda, sos),
    Uint8Array.of(0x00),
    Uint8Array.from([0xff, 0xd9]),
  );
}

test("PNG dimensions, pHYs conversion, and density do not affect placement math", () => {
  const density = Uint8Array.from([0, 0, 0x2e, 0x23, 0, 0, 0x2e, 0x23, 1]);
  const image = parseKdpImageBytes(makePng(1200, 1800, [{ name: "pHYs", payload: density }]));
  assert.deepEqual([image.width, image.height], [1200, 1800]);
  assert.equal(image.densities[0].horizontalDpi, 11811 * 0.0254);
  assert.ok(Math.abs(image.densities[0].horizontalDpi - 299.9994) < 1e-9);
  const placement = calculatePlacement(image, 4, 6);
  assert.deepEqual([placement.horizontalDpi, placement.verticalDpi, placement.tone], [300, 300, "success"]);
  assert.deepEqual([placement.maximumWidthInches, placement.maximumHeightInches], [4, 6]);
  const missingDensity = parseKdpImageBytes(makePng(1200, 1800));
  assert.deepEqual([missingDensity.densities[0].horizontalDpi, missingDensity.densities[0].verticalDpi], [null, null]);
});

test("JPEG JFIF and EXIF density sources remain visible when their values disagree", () => {
  const image = parseKdpImageBytes(makeJpeg(1200, 1800));
  assert.equal(image.format, "JPEG");
  assert.deepEqual(image.densities.map((density) => density.source), ["JPEG JFIF"]);
  assert.equal(image.densityConflict, false);

  const exif = jpegSegment(0xe1, concat(Uint8Array.from([0x45, 0x78, 0x69, 0x66, 0, 0]), makeTiff({ orientation: 1, xDpi: 72, yDpi: 72, unit: 2 })));
  const base = makeJpeg(1200, 1800);
  const withExif = concat(base.subarray(0, 2), exif, base.subarray(2));
  const conflicting = parseKdpImageBytes(withExif);
  assert.equal(conflicting.densityConflict, true);
  assert.deepEqual(conflicting.densities.map((density) => density.source), ["EXIF", "JPEG JFIF"]);
});

test("EXIF orientation swaps displayed dimensions and density axes", () => {
  const exif = jpegSegment(0xe1, concat(Uint8Array.from([0x45, 0x78, 0x69, 0x66, 0, 0]), makeTiff({ orientation: 6, xDpi: 300, yDpi: 150, unit: 3 })));
  const base = makeJpeg(3000, 2000, { xDpi: 300, yDpi: 150, unit: 1 });
  const image = parseKdpImageBytes(concat(base.subarray(0, 2), exif, base.subarray(2)));
  assert.deepEqual([image.encodedWidth, image.encodedHeight, image.width, image.height, image.orientation], [3000, 2000, 2000, 3000, 6]);
  assert.deepEqual([image.densities[0].horizontalDpi, image.densities[0].verticalDpi], [381, 762]);
  const placement = calculatePlacement(image, 4, 6);
  assert.deepEqual([placement.horizontalDpi, placement.verticalDpi], [500, 500]);
});

test("PNG eXIf orientation and density are read while malformed density stays partial", () => {
  const oriented = parseKdpImageBytes(makePng(3000, 2000, [{ name: "eXIf", payload: makeTiff({ orientation: 6, xDpi: 300, yDpi: 150, unit: 3 }) }]));
  assert.deepEqual([oriented.width, oriented.height, oriented.orientation], [2000, 3000, 6]);
  assert.deepEqual([oriented.densities[0].horizontalDpi, oriented.densities[0].verticalDpi], [381, 762]);

  const unreadable = parseKdpImageBytes(makePng(1200, 1800, [{ name: "eXIf", payload: makeTiff({ orientation: 1, xDpi: 300, yDpi: 300, invalidXOffset: true }) }]));
  assert.equal(unreadable.densityUnreadable, true);
  assert.equal(unreadable.densities[0].unreadable, true);
  assert.equal(calculatePlacement(unreadable, 4, 6).controllingDpi, 300);
});

test("invalid, conflicting, and unreadable orientations stop image interpretation", () => {
  const invalid = makePng(10, 20, [{ name: "eXIf", payload: makeTiff({ orientation: 9 }) }]);
  assert.throws(() => parseKdpImageBytes(invalid), (error) => error instanceof KdpImageError && error.code === "invalid-orientation");
  const wrongType = makePng(10, 20, [{ name: "eXIf", payload: makeTiff({ orientation: 6, orientationType: 4 }) }]);
  assert.throws(() => parseKdpImageBytes(wrongType), (error) => error instanceof KdpImageError && error.code === "invalid-orientation");

  const conflict = makePng(10, 20, [
    { name: "eXIf", payload: makeTiff({ orientation: 6 }) },
    { name: "eXIf", payload: makeTiff({ orientation: 3 }) },
  ]);
  assert.throws(() => parseKdpImageBytes(conflict), (error) => error instanceof KdpImageError && error.code === "invalid-orientation");

  const malformed = makePng(10, 20, [{ name: "eXIf", payload: Uint8Array.of(1, 2, 3) }]);
  assert.throws(() => parseKdpImageBytes(malformed), (error) => error instanceof KdpImageError && error.code === "invalid-orientation");
});

test("truncated data, unsupported signatures, animation, and local resource limits are rejected", () => {
  assert.throws(() => parseKdpImageBytes(Uint8Array.from([0x25, 0x50, 0x44, 0x46])), (error) => error.code === "unsupported-type");
  assert.throws(() => parseKdpImageBytes(makePng(1200, 1800).subarray(0, 17)), (error) => error.code === "invalid-image");
  assert.throws(() => parseKdpImageBytes(makePng(1200, 1800, [{ name: "acTL", payload: new Uint8Array(8) }])), (error) => error.code === "animated");
  assert.throws(() => parseKdpImageBytes(makePng(20_001, 100)), (error) => error.code === "resource-limit");
  assert.throws(() => parseKdpImageBytes(new Uint8Array(KDP_IMAGE_MAX_BYTES + 1)), (error) => error.code === "too-large");
});

test("JPEG truncation and malformed segment lengths are rejected", () => {
  assert.throws(() => parseKdpImageBytes(makeJpeg(1200, 1800).subarray(0, -2)), (error) => error.code === "invalid-image");
  const malformed = concat(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0xff, 0xff]));
  assert.throws(() => parseKdpImageBytes(malformed), (error) => error.code === "invalid-image");
});

test("print-size validation accepts plain decimals and rejects ambiguous or out-of-range values", () => {
  assert.deepEqual(parsePrintDimension(" .5 ", "in"), { status: "valid", inches: 0.5 });
  assert.equal(parsePrintDimension("10.16", "cm").status, "valid");
  assert.equal(parsePrintDimension("10.16", "cm").status === "valid" ? parsePrintDimension("10.16", "cm").inches : null, 4);
  for (const value of ["1e2", "4,5", "1/2", "4 in", "0", "-1", "201", "NaN", "2."]) {
    assert.equal(parsePrintDimension(value, "in").status, "invalid", value);
  }
  assert.equal(parsePrintDimension("0.0254", "cm").status, "valid");
  assert.equal(parsePrintDimension("508", "cm").status, "valid");
  assert.equal(parsePrintDimension("0.254", "mm").status, "valid");
  assert.equal(parsePrintDimension("5080", "mm").status, "valid");
  assert.equal(fromInches(toInches(10.16, "cm"), "in"), 4);
});

test("effective-DPI thresholds use both unrounded axes and retain the limiting direction", () => {
  const image = { width: 1200, height: 1800 };
  assert.deepEqual([calculatePlacement(image, 4, 6).controllingDpi, calculatePlacement(image, 4, 6).tone], [300, "success"]);
  assert.deepEqual([calculatePlacement(image, 6, 9).controllingDpi, calculatePlacement(image, 6, 9).tone], [200, "warning"]);
  assert.deepEqual([calculatePlacement(image, 8, 12).controllingDpi, calculatePlacement(image, 8, 12).tone], [150, "danger"]);
  const stretched = calculatePlacement(image, 4, 8);
  assert.deepEqual([stretched.horizontalDpi, stretched.verticalDpi, stretched.controllingDpi, stretched.tone, stretched.distorted], [300, 225, 225, "warning", true]);
  const boundary = calculatePlacement({ width: 2999, height: 3000 }, 10, 10);
  assert.deepEqual([boundary.horizontalDpi, boundary.verticalDpi, boundary.tone], [299.9, 300, "warning"]);
  assert.equal(calculatePlacement({ width: 2400, height: 3600 }, 3, 4.5).exceeds600Dpi, true);
});

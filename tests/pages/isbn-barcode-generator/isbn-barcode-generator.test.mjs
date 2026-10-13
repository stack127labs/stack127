import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { inflateSync } from "node:zlib";
import {
  ISBN_BARCODE_EXAMPLE_INPUT,
  makeIsbnBarcode,
  renderIsbnBarcodePdf,
  renderIsbnBarcodePng,
} from "../../../lib/isbn-barcode-generator/engine.ts";
import { ean5Check, ean5Modules } from "../../../lib/isbn-barcode-generator/encoding.ts";
import { measureSymbol } from "../../../lib/isbn-barcode-generator/symbol.ts";

const require = createRequire(import.meta.url);
const ZXing = require("@zxing/library");
const bwipjs = require("bwip-js");

const OPENING_LINE = "ISBN 978-0-306-40615-7".length;

function make(overrides = {}) {
  return makeIsbnBarcode({ ...ISBN_BARCODE_EXAMPLE_INPUT, ...overrides });
}
function ready(overrides = {}) {
  const result = make(overrides);
  assert.equal(result.status, "ready", JSON.stringify(result.errors));
  return result.value;
}
function errors(overrides) {
  const result = make(overrides);
  assert.equal(result.status, "invalid");
  return result.errors;
}

test("opening example", () => {
  const value = ready();
  assert.equal(value.isbn.isbn13, "9780306406157");
  assert.equal(value.isbn.isbn10, "0306406152");
  assert.equal(value.isbn.printedIsbn13, "978-0-306-40615-7");
  assert.equal(value.isbn.printedIsbn10, "0-306-40615-2");
  assert.deepEqual(value.addOn, { code: "51499", priceCents: 1499, limit: null });
  assert.deepEqual(value.size, { percent: 90, mode: "fit-kdp", limit: null });
  assert.equal(value.layout.widthMm, 50.495);
  assert.equal(value.fit[0].area, "kdp");
  assert.equal(value.fit[0].fits, true);
  assert.equal(value.fit[0].largestFitPercent, 90);
  assert.equal(value.fit[1].area, "ingramspark");
  assert.equal(value.fit[1].largestFitPercent, null);
  assert.equal(value.fileBaseName, "isbn-9780306406157-51499");
});

test("valid ISBN forms", () => {
  assert.equal(ready({ isbnText: "9780110002224" }).isbn.isbn10, "0110002229");

  const isbn10 = ready({ isbnText: "0306406152" }).isbn;
  assert.equal(isbn10.isbn13, "9780306406157");
  assert.equal(isbn10.entered, "isbn10");
  assert.equal(isbn10.printedIsbn13, "9780306406157");

  const dashed10 = ready({ isbnText: "0-306-40615-2" }).isbn;
  assert.equal(dashed10.printedIsbn13, "978-0-306-40615-7");
  assert.equal(dashed10.printedIsbn10, "0-306-40615-2");

  const x = ready({ isbnText: "080442957x" }).isbn;
  assert.equal(x.isbn13, "9780804429573");
  assert.equal(x.printedIsbn10, "080442957X");

  assert.equal(ready({ isbnText: "ISBN: 978 0 306 40615 7" }).isbn.printedIsbn13, "9780306406157");
  assert.equal(ready({ isbnText: "ISBN-13: 978–0–306–40615–7" }).isbn.printedIsbn13, "978-0-306-40615-7");
  assert.equal(ready({ isbnText: "ISBN 13: 9780306406157" }).isbn.printedIsbn13, "9780306406157");
  assert.equal(ready({ isbnText: "ISBN13 9780306406157" }).isbn.printedIsbn13, "9780306406157");
  // Dashes that don't make a full ISBN shape aren't kept.
  assert.equal(ready({ isbnText: "978-030640615-7" }).isbn.printedIsbn13, "9780306406157");

  const isbn979 = ready({ isbnText: "9791032305690" });
  assert.equal(isbn979.isbn.isbn10, null);
  assert.equal(isbn979.isbn.printedIsbn10, null);
  assert.equal(isbn979.isbn.prefix, "979");
});

test("invalid ISBNs name the first rule that fails", () => {
  const isbn = isbnText => errors({ isbnText })[0];
  assert.deepEqual(isbn("9780306406158"), { field: "isbn", code: "check-digit", form: "isbn13" });
  assert.deepEqual(isbn("0306406153"), { field: "isbn", code: "check-digit", form: "isbn10" });
  assert.deepEqual(isbn("9790000000001"), { field: "isbn", code: "ismn" });
  assert.deepEqual(isbn("4006381333931"), { field: "isbn", code: "prefix" });
  assert.deepEqual(isbn("978030640615"), { field: "isbn", code: "length", digitCount: 12 });
  assert.deepEqual(isbn("9780306406157 51499"), { field: "isbn", code: "includes-add-on" });
  assert.deepEqual(isbn("03064X6152"), { field: "isbn", code: "x-position" });
  assert.deepEqual(isbn("978-0-306-4O615-7"), { field: "isbn", code: "characters" });
  assert.deepEqual(isbn("  "), { field: "isbn", code: "empty" });
});

test("price add-on", () => {
  const addOn = priceText => ready({ priceText }).addOn;
  assert.deepEqual(addOn(""), { code: "90000", priceCents: null, limit: null });
  assert.equal(addOn("0.01").code, "50001");
  assert.equal(addOn("$99.98").code, "59998");
  assert.equal(addOn("14.9").code, "51490");
  for (const priceText of ["99.99", "150", "59999"]) {
    assert.deepEqual(addOn(priceText), { code: "90000", priceCents: null, limit: "above-max" }, priceText);
  }
  assert.deepEqual(addOn("51995"), { code: "51995", priceCents: 1995, limit: null });
  assert.deepEqual(addOn("90000"), { code: "90000", priceCents: null, limit: null });

  const price = priceText => errors({ priceText })[0].code;
  assert.equal(price("0"), "zero");
  for (const priceText of ["00000", "50000", "61995", "99990"]) assert.equal(price(priceText), "code", priceText);
  for (const priceText of ["14.999", "abc", "1,499", "-5"]) assert.equal(price(priceText), "format", priceText);

  assert.deepEqual(errors({ addOn: "none" }), [{ field: "price", code: "without-add-on" }]);
  const off = ready({ addOn: "none", priceText: "" });
  assert.equal(off.addOn, null);
  assert.equal(off.fileBaseName, "isbn-9780306406157");
  assert.equal(ready({ addOn: "anything" }).addOn.code, "51499");
});

test("size", () => {
  assert.deepEqual(ready({ sizeText: "70" }).size, { percent: 80, mode: "entered", limit: "below-min" });
  assert.deepEqual(ready({ sizeText: "250%" }).size, { percent: 200, mode: "entered", limit: "above-max" });
  for (const sizeText of ["90.5", "big"]) assert.deepEqual(errors({ sizeText }), [{ field: "size", code: "format" }]);
});

test("every failing field is returned in field order", () => {
  assert.deepEqual(errors({ isbnText: "123", priceText: "abc", sizeText: "big" }).map(error => error.field), ["isbn", "price", "size"]);
  assert.deepEqual(errors({ sizeText: "big" }), [{ field: "size", code: "format" }]);
});

test("widths and fit match the worked examples", () => {
  const bars = (percent, hasAddOn = true) => Math.round(measureSymbol(percent, OPENING_LINE, hasAddOn).barsAndQuietMm * 1000) / 1000;
  assert.equal(bars(100), 55.841);
  assert.equal(bars(90), 50.495);
  assert.equal(bars(91), 51.030);
  assert.equal(bars(80), 45.149);
  assert.equal(bars(100, false), 37.361);

  assert.equal(ready({ sizeText: "100" }).fit[0].fits, false);
  assert.equal(ready({ sizeText: "91" }).fit[0].fits, false);
  const at90 = ready({ sizeText: "90" });
  assert.equal(at90.layout.widthMm, 50.495);
  assert.ok(at90.layout.heightMm <= 30.48);
  assert.equal(at90.fit[0].fits, true);

  const at80 = ready({ sizeText: "80" });
  assert.ok(at80.layout.heightMm <= 25.4);
  assert.equal(at80.fit[1].fits, false);
  assert.equal(at80.fit[1].largestFitPercent, null);
});

test("file formats", () => {
  const value = ready();
  assert.match(value.svg, /^<svg [^>]*width="1\.988in" height="[\d.]+in" viewBox="0 0 50\.4953 [\d.]+"/);
  assert.doesNotMatch(value.svg, /<text|<script|href=/);

  const pdf = Buffer.from(renderIsbnBarcodePdf(value)).toString("latin1");
  assert.ok(pdf.startsWith("%PDF-"));
  assert.doesNotMatch(pdf, /\/Font/);
  assert.match(pdf, /0 0 0 1 k/);

  const png = readPng(renderIsbnBarcodePng(value));
  assert.equal(png.bitDepth, 1);
  assert.equal(png.colorType, 0);
  assert.deepEqual(png.phys, [23622, 23622, 1]);
  assert.equal(png.width, Math.round(value.layout.widthMm * 600 / 25.4));
});

// Decode proof. zxing reads the EAN-13 from the engine's PNG. Its EAN-5 reader
// throws on every add-on (AbstractUPCEANReader.L_AND_G_PATTERNS is undefined in
// @zxing/library 0.21), so the add-on is checked against bwip-js instead: its
// module pattern for 20 codes, and the bars read back from the PNG.

test("zxing decodes the EAN-13 and the PNG add-on bars match bwip-js", () => {
  const cases = [
    { name: "opening example" },
    { name: "979", isbnText: "9791032305690" },
    { name: "no price", priceText: "" },
    { name: "50001", priceText: "50001" },
    { name: "59998", priceText: "59998" },
    { name: "no add-on", addOn: "none", priceText: "" },
    { name: "80%", sizeText: "80" },
    { name: "200%", sizeText: "200" },
    { name: "ISBN-10 with X", isbnText: "080442957X", sizeText: "120" },
  ];
  for (const { name, ...overrides } of cases) {
    const value = ready(overrides);
    const png = readPng(renderIsbnBarcodePng(value));
    assert.equal(decodeEan13(png), value.isbn.isbn13, name);
    if (value.addOn) assert.deepEqual(addOnRunsFromPng(png, value), bwipRuns(value.addOn.code), name);
  }
});

test("EAN-5 module patterns match bwip-js for every check value", () => {
  // Two codes per check value, spread across the price range, plus the edges.
  const codes = ["90000", "50001", "59998", "51499"];
  const perCheck = new Array(10).fill(0);
  for (let code = 50002; code < 59998; code += 37) {
    const check = ean5Check(String(code));
    if (perCheck[check] < 2) {
      perCheck[check] += 1;
      codes.push(String(code));
    }
  }
  assert.deepEqual(perCheck, new Array(10).fill(2));
  assert.equal(new Set(codes.map(ean5Check)).size, 10);
  for (const code of codes) assert.deepEqual(runs(ean5Modules(code)), bwipRuns(code), code);
});

function runs(modules) {
  const out = [];
  for (let index = 0; index < modules.length;) {
    let end = index;
    while (modules[end] === modules[index]) end += 1;
    out.push(end - index);
    index = end;
  }
  return out;
}

function bwipRuns(code) {
  return bwipjs.raw("ean5", code, {})[0].sbs;
}

function readPng(bytes) {
  const buffer = Buffer.from(bytes);
  assert.deepEqual([...buffer.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const png = { idat: [] };
  for (let position = 8; position < buffer.length;) {
    const length = buffer.readUInt32BE(position);
    const type = buffer.toString("ascii", position + 4, position + 8);
    const data = buffer.subarray(position + 8, position + 8 + length);
    if (type === "IHDR") Object.assign(png, { width: data.readUInt32BE(0), height: data.readUInt32BE(4), bitDepth: data[8], colorType: data[9] });
    if (type === "pHYs") png.phys = [data.readUInt32BE(0), data.readUInt32BE(4), data[8]];
    if (type === "IDAT") png.idat.push(data);
    position += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(png.idat));
  const stride = Math.ceil(png.width / 8) + 1;
  assert.equal(raw.length, stride * png.height);
  png.dark = (x, y) => ((raw[y * stride + 1 + (x >> 3)] >> (7 - (x & 7))) & 1) === 0;
  return png;
}

function decodeEan13(png) {
  const luminance = new Uint8ClampedArray(png.width * png.height);
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) luminance[y * png.width + x] = png.dark(x, y) ? 0 : 255;
  }
  const reader = new ZXing.MultiFormatReader();
  reader.setHints(new Map([[ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13]], [ZXing.DecodeHintType.TRY_HARDER, true]]));
  const bitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(new ZXing.RGBLuminanceSource(luminance, png.width, png.height)));
  return reader.decode(bitmap).getText();
}

// Bar and space widths in modules, read from one pixel row through the add-on.
function addOnRunsFromPng(png, value) {
  const modulePx = value.layout.moduleMm * 600 / 25.4;
  const y = Math.floor(png.height * 0.75);
  const isDark = [];
  for (let x = 0; x < png.width; x += 1) isDark.push(png.dark(x, y));
  // The add-on starts at the first bar after a gap of more than 7 modules.
  let x = isDark.indexOf(true);
  for (let gap = 0; x < png.width; x += 1) {
    gap = isDark[x] ? 0 : gap + 1;
    if (gap > 7 * modulePx) break;
  }
  x = isDark.indexOf(true, x);
  const end = isDark.lastIndexOf(true) + 1;
  const pixels = runs(isDark.slice(x, end).map(Number).join(""));
  return pixels.map(width => Math.round(width / modulePx));
}

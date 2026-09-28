import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePrintSize,
  formatRoundedMeasurement,
  parsePixelDimension,
  parsePrintResolution,
} from "../../../app/(site)/(tools)/pixels-to-print-size-calculator/print-size.ts";

function calculate(width, height, resolution) {
  const parsedWidth = parsePixelDimension(String(width));
  const parsedHeight = parsePixelDimension(String(height));
  const parsedResolution = parsePrintResolution(String(resolution));
  assert.equal(parsedWidth.status, "valid");
  assert.equal(parsedHeight.status, "valid");
  assert.equal(parsedResolution.status, "valid");
  return calculatePrintSize({
    widthPixels: parsedWidth.value,
    heightPixels: parsedHeight.value,
    resolution: parsedResolution.value,
  });
}

test("converts pixels to all physical units using the selected resolution", () => {
  const result = calculate(3600, 2400, 300);
  assert.deepEqual(
    [result.inches.displayWidth, result.inches.displayHeight],
    ["12", "8"],
  );
  assert.deepEqual(
    [result.centimeters.displayWidth, result.centimeters.displayHeight],
    ["30.48", "20.32"],
  );
  assert.deepEqual(
    [result.millimeters.displayWidth, result.millimeters.displayHeight],
    ["304.8", "203.2"],
  );
});

test("calculates metric values directly from the unrounded inch values", () => {
  const result = calculate(1001, 667, 300);
  assert.deepEqual(
    [result.inches.displayWidth, result.inches.displayHeight],
    ["3.3367", "2.2233"],
  );
  assert.deepEqual(
    [result.centimeters.displayWidth, result.centimeters.displayHeight],
    ["8.4751", "5.6473"],
  );
  assert.deepEqual(
    [result.millimeters.displayWidth, result.millimeters.displayHeight],
    ["84.7513", "56.4727"],
  );
});

test("supports decimal resolution and the smallest and largest valid dimensions", () => {
  const decimal = calculate(1203, 802, 200.5);
  assert.deepEqual(
    [decimal.inches.displayWidth, decimal.inches.displayHeight],
    ["6", "4"],
  );

  const smallest = calculate(1, 1, 10000);
  assert.deepEqual(
    [smallest.inches.displayWidth, smallest.centimeters.displayWidth, smallest.millimeters.displayWidth],
    ["0.0001", "0.0003", "0.0025"],
  );

  const largest = calculate(1_000_000, 1_000_000, 1);
  assert.deepEqual(
    [largest.inches.displayWidth, largest.centimeters.displayWidth, largest.millimeters.displayWidth],
    ["1000000", "2540000", "25400000"],
  );
});

test("rounds exact half values upward and removes trailing zeroes", () => {
  assert.equal(formatRoundedMeasurement(100005n, 100000n), "1.0001");
  assert.equal(formatRoundedMeasurement(120000n, 10000n), "12");
  assert.equal(formatRoundedMeasurement(304800n, 1000n), "304.8");
});

test("pixel parsing accepts whitespace and leading zeroes but rejects invalid or out-of-range text", () => {
  assert.deepEqual(parsePixelDimension("  00042  "), { status: "valid", value: 42 });
  assert.deepEqual(parsePixelDimension(""), { status: "invalid", reason: "missing" });
  assert.deepEqual(parsePixelDimension("1,200"), { status: "invalid", reason: "format" });
  assert.deepEqual(parsePixelDimension("1200.5"), { status: "invalid", reason: "format" });
  assert.deepEqual(parsePixelDimension("0"), { status: "invalid", reason: "range" });
  assert.deepEqual(parsePixelDimension("1000001"), { status: "invalid", reason: "range" });
});

test("resolution parsing enforces decimal grammar, precision, and bounds", () => {
  const leadingDecimal = parsePrintResolution(".5");
  assert.equal(leadingDecimal.status, "invalid");
  if (leadingDecimal.status === "invalid") assert.equal(leadingDecimal.reason, "range");

  assert.equal(parsePrintResolution("200.500").status, "valid");
  assert.deepEqual(parsePrintResolution("1e3"), { status: "invalid", reason: "format" });
  assert.deepEqual(parsePrintResolution("10,000"), { status: "invalid", reason: "format" });
  assert.deepEqual(parsePrintResolution("300."), { status: "invalid", reason: "format" });
  assert.deepEqual(parsePrintResolution("10000.001"), { status: "invalid", reason: "range" });
  assert.deepEqual(parsePrintResolution(""), { status: "invalid", reason: "missing" });
});

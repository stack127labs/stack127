import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  DEFAULT_CHMOD_BITS,
  calculateChmod,
  bitsFromMode,
  formatOctalMode,
  formatSymbolicMode,
  modeFromBits,
  parseOctalMode,
} from "../../../app/(site)/(tools)/chmod-calculator/chmod-calculator-engine.ts";

function valid(input) {
  const result = calculateChmod(input);
  assert.equal(result.status, "valid", JSON.stringify(result));
  return result;
}

test("accepts trimmed octal text while preserving strict grammar", () => {
  assert.equal(parseOctalMode(" 640 ").status, "valid");
  assert.equal(valid(" 640 ").octal, "0640");
  for (const candidate of ["", "648", "07558", "64 0", "+640", "0o640", "６４０", "rw-r-----"]) {
    const result = parseOctalMode(candidate);
    assert.equal(result.status, "invalid", candidate);
    assert.equal(result.message, candidate === "" ? "Enter an octal mode." : "Use 1 to 4 digits from 0 to 7.");
  }
});

test("normalizes zero and class arithmetic exactly", () => {
  for (const input of ["0", "000", "0000"]) {
    const result = valid(input);
    assert.equal(result.octal, "0000");
    assert.equal(result.symbolic, "---------");
    assert.deepEqual(result.classRows.map((row) => [row.label, row.digit, row.calculation]), [
      ["Owner", "0", "0"],
      ["Group", "0", "0"],
      ["Others", "0", "0"],
    ]);
    assert.equal(result.command, "chmod 0000 ./path/to/file");
  }
});

test("matches authoritative chmod fixtures", () => {
  const normal = valid("0640");
  assert.equal(normal.octal, "0640");
  assert.equal(normal.symbolic, "rw-r-----");
  assert.deepEqual(normal.classRows.map((row) => [row.digit, row.calculation]), [["6", "4 + 2"], ["4", "4"], ["0", "0"]]);

  const sticky = valid("1777");
  assert.equal(sticky.symbolic, "rwxrwxrwt");
  assert.equal(sticky.bits.sticky, true);
  assert.equal(sticky.othersWrite, true);

  const setuidUpper = valid("4640");
  assert.equal(setuidUpper.symbolic, "rwSr-----");
  assert.equal(setuidUpper.bits.setuid, true);
  assert.equal(setuidUpper.bits.ownerExecute, false);

  assert.equal(valid("7777").symbolic, "rwsrwsrwt");
});

test("round-trips every normalized mode through bits, octal, and symbolic output", () => {
  for (let mode = 0; mode <= 4095; mode += 1) {
    const bits = bitsFromMode(mode);
    assert.equal(modeFromBits(bits), mode);
    assert.equal(formatOctalMode(mode), mode.toString(8).padStart(4, "0"));
    assert.equal(formatSymbolicMode(bits).length, 9);
    assert.equal(valid(bits).mode, mode);
  }
});

test("keeps text and checkbox input equivalent", () => {
  for (const mode of [0, 0o7, 0o640, 0o4640, 0o1777, 0o2771, 0o7777]) {
    assert.deepEqual(valid(mode.toString(8)).bits, bitsFromMode(mode));
    assert.equal(valid(bitsFromMode(mode)).octal, formatOctalMode(mode));
  }
  assert.deepEqual(DEFAULT_CHMOD_BITS, bitsFromMode(0o644));
});

test("is deterministic and bounded for repeated local calculations", () => {
  const expected = valid("4640");
  const started = performance.now();
  for (let index = 0; index < 10_000; index += 1) assert.deepEqual(valid("4640"), expected);
  assert.ok(performance.now() - started < 10_000);
});

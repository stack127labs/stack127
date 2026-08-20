import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expectedOriginals = new Map([
  ["public/brand/originals/stack127-wordmark-original.png", "23a3c59cf0b00ad585972b47fc9e65dbe45109b09fe48471346fc14d8c5efd0d"],
  ["public/brand/originals/stack127-mark-original.png", "8c2ad19cacc55b0b923bf689574de28d2bc8483e689f21386a9d32e6150ae18e"],
]);

function pngDetails(buffer) {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG");
  return {
    colorType: buffer.readUInt8(25),
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16),
  };
}

test("the supplied Stack127 originals remain byte-for-byte preserved", async () => {
  for (const [file, expectedHash] of expectedOriginals) {
    const fileBuffer = await readFile(file);
    const actualHash = createHash("sha256").update(fileBuffer).digest("hex");
    assert.equal(actualHash, expectedHash, file);
  }
});

test("the wordmark has transparent light and dark theme variants", async () => {
  for (const file of [
    "public/logos/stack127-wordmark-on-light.png",
    "public/logos/stack127-wordmark-on-dark.png",
  ]) {
    const details = pngDetails(await readFile(file));
    assert.equal(details.colorType, 6, `${file} must use RGBA`);
    assert.ok(details.width > details.height * 4, `${file} must remain a wide wordmark`);
  }
});

test("favicon and app icons use the square 127 mark", async () => {
  for (const [file, size] of [
    ["public/favicon-16x16.png", 16],
    ["public/favicon-32x32.png", 32],
    ["public/favicon-48x48.png", 48],
    ["public/apple-touch-icon.png", 180],
    ["public/android-chrome-192x192.png", 192],
    ["public/android-chrome-512x512.png", 512],
  ]) {
    const details = pngDetails(await readFile(file));
    assert.equal(details.width, size, file);
    assert.equal(details.height, size, file);
  }

  const ico = await readFile("public/favicon.ico");
  assert.equal(ico.readUInt16LE(2), 1, "favicon.ico must be an icon resource");
  assert.equal(ico.readUInt16LE(4), 3, "favicon.ico must contain 16, 32, and 48px images");
});

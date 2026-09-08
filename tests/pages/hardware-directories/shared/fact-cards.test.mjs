import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (file) => readFileSync(new URL(`../../../../${file}`, import.meta.url), "utf8");

test("all hardware card renderers use the shared large-image fact card", () => {
  for (const file of ["app/(site)/(directories)/_components/hardware-directory-browser.tsx", "app/(site)/(directories)/zigbee-devices/zigbee-device-browser.tsx"]) {
    const source = read(file);
    const card = source.slice(source.indexOf(file.includes("zigbee-device-browser") ? "function DeviceCard(" : "function HardwareCard("));
    assert.match(card, /HardwareFactCardContent/);
    assert.doesNotMatch(card, /styles\.(cardIdentity|cardDecision|compatibilityRow|cardHeading)/);
    assert.match(card, /aria-haspopup="dialog"/);
  }
});

test("hardware cards share the app fact rows, keep large contained images, and omit subtitles", () => {
  const component = read("app/(site)/(directories)/_components/hardware-fact-card.tsx");
  const css = read("app/(site)/(directories)/_components/hardware-fact-card.module.css");
  assert.match(component, /AppCardFacts/);
  assert.match(component, /<h2>\{name\}<\/h2>/);
  assert.doesNotMatch(component, /<p\b|subtitle|summary/);
  assert.match(component, /onError/);
  assert.match(css, /height: 200px/);
  assert.match(css, /object-fit: contain/);
});

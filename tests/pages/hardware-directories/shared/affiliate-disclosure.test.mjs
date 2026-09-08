import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../../../../${file}`, import.meta.url), "utf8");

test("About explains affiliate income and preserves Amazon's required statement", () => {
  const about = read("app/(site)/(legal)/about/page.tsx");
  assert.match(about, /id="how-we-earn-money"/);
  assert.match(about, /As an Amazon Associate I earn from qualifying purchases\./);
  assert.match(about, /no extra cost to you/);
  assert.match(about, /rankings or placement/);
  assert.doesNotMatch(read("app/app-shell.tsx"), /Amazon Associate/);
});

test("hardware disclosures follow the displayed cards only when a displayed record has an Amazon link", () => {
  for (const [file, list, browser] of [
    ["app/(site)/(directories)/_components/hardware-directory-page.tsx", "pageRecords", "HardwareDirectoryBrowser"],
    ["app/(site)/(directories)/zigbee-devices/page.tsx", "pageDevices", "ZigbeeDeviceBrowser"],
  ]) {
    const source = read(file);
    assert.match(source, new RegExp(`${list}\\.some\\(\\(record\\) => Boolean\\(record\\.amazon\\)\\)`));
    assert.ok(source.indexOf("<DirectoryAffiliateDisclosure") > source.indexOf(`<${browser}`));
  }
  const component = read("app/(site)/(directories)/_components/directory-affiliate-disclosure.tsx");
  assert.match(component, /Some of the links on this page are affiliate links/);
  assert.match(component, /no extra cost to you/);
  assert.match(component, /rankings or placement/);
  assert.match(component, /\/about#how-we-earn-money/);
});

test("Amazon purchase buttons use the clean label and preserve sponsored link attributes", () => {
  for (const file of ["app/(site)/(directories)/_components/hardware-directory-browser.tsx", "app/(site)/(directories)/zigbee-devices/zigbee-device-browser.tsx"]) {
    assert.match(read(file), /<span>Check price on Amazon<\/span>/);
    assert.doesNotMatch(read(file), /Paid link/);
    assert.match(read(file), /rel="sponsored noreferrer"/);
  }
});

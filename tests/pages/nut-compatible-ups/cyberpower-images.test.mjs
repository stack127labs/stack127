import assert from "node:assert/strict";
import { test } from "node:test";
import { cyberPowerModelToken, exactCyberPowerImageLinks, exactCyberPowerProductLinks } from "../../../scripts/nut-compatible-ups/lib/cyberpower.mjs";

test("finds only the exact CyberPower product result", () => {
  const html = `
    <a href="https://www.cyberpowersystems.com/product/ups/pfc-sinewave/cp1500pfclcd/">CP1500PFCLCD</a>
    <a href="https://www.cyberpowersystems.com/product/taa/cp1500pfclcdtaa/">CP1500PFCLCDTAA</a>`;
  assert.deepEqual(exactCyberPowerProductLinks(html, "CP1500PFCLCD"), [
    "https://www.cyberpowersystems.com/product/ups/pfc-sinewave/cp1500pfclcd/",
  ]);
});

test("accepts an exact discontinued-model photo but rejects a longer TAA model", () => {
  const html = `
    <img src="https://www.cyberpowersystems.com/wp-content/uploads/CPS1200AVR_F-150x150.jpg">
    <img src="https://www.cyberpowersystems.com/wp-content/uploads/CPS1200AVRTAA_F-150x150.jpg">`;
  assert.deepEqual(exactCyberPowerImageLinks(html, "CPS1200AVR"), [
    "https://www.cyberpowersystems.com/wp-content/uploads/CPS1200AVR_F.jpg",
  ]);
});

test("rejects HCL family expressions as exact CyberPower models", () => {
  assert.equal(cyberPowerModelToken("CP 1500C"), "cp1500c");
  assert.equal(cyberPowerModelToken("CP825AVR-G / LE825G"), null);
  assert.equal(cyberPowerModelToken("(various)"), null);
});

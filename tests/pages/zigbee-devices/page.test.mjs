import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the directory page stays server-readable and keeps SEO in the registry", async () => {
  const page = await read("app/(site)/(directories)/zigbee-devices/page.tsx");

  assert.match(page, /Zigbee devices/);
  assert.match(page, /ZHA/);
  assert.match(page, /Zigbee2MQTT/);
  assert.match(page, /PageHeader/);
  assert.match(page, /getZigbeeDevices/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|canonical|JsonLd/);
});

test("the page explains evidence and does not promise universal compatibility", async () => {
  const page = await read("app/(site)/(directories)/zigbee-devices/page.tsx");
  const browser = await read("app/(site)/(directories)/zigbee-devices/zigbee-device-browser.tsx");

  assert.match(page, /community (?:member )?reported/);
  assert.match(page, /exact model/);
  assert.match(page, /firmware/);
  assert.match(browser, /Support record available/);
  assert.match(browser, /Community compatibility record/);
  assert.match(browser, /next\/image/);
  assert.match(browser, /device\.image_path/);
  assert.match(browser, /device\.image_source_url/);
  assert.match(browser, /role="dialog"/);
  assert.match(browser, /aria-modal="true"/);
  assert.match(browser, /Not published in source/);
  assert.doesNotMatch(`${page}\n${browser}`, /fully compatible|works with everything|guaranteed/iu);
});

test("the committed snapshot keeps source revisions and field provenance", async () => {
  const snapshot = JSON.parse(await read("lib/zigbee-devices/data/devices.json"));

  assert.ok(snapshot.devices.length >= 300);
  assert.match(snapshot.meta.zigbee2mqtt.version, /^\d+\.\d+\.\d+$/);
  assert.match(snapshot.meta.blakadder.commit, /^[a-f0-9]{40}$/);
  assert.equal(snapshot.devices.every((device) => device.zigbee2mqtt_url || device.blakadder_url), true);
  assert.ok(snapshot.devices.some((device) => device.zigbee2mqtt_url && !device.blakadder_url));
  assert.ok(snapshot.devices.some((device) => !device.zigbee2mqtt_url && device.blakadder_url));
  assert.equal(snapshot.devices.every((device) => device.image_path && device.image_source_url), true);
  assert.equal(new Set(snapshot.devices.map((device) => device.slug)).size, snapshot.devices.length);
  assert.equal(snapshot.devices.some((device) => device.category === "coordinator"), false);

  assert.equal(
    snapshot.devices.every((device) => device.image_path.startsWith(
      "https://tulgfrqamtcshdtmhvpx.supabase.co/storage/v1/object/public/stack127-media/directories/zigbee-devices/images/",
    )),
    true,
  );
});

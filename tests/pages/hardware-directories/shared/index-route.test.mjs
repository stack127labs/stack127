import assert from "node:assert/strict";
import test from "node:test";
import "../../../helpers/register-repo-imports.mjs";
import { loadTypeScript } from "../../../helpers/load-typescript.mjs";

const { hardwareIndexRecord } = await import("../../../../lib/hardware-directories/search-index.ts");
const { zigbeeIndexRecord } = await import("../../../../lib/zigbee-devices/search-index.ts");
const root = new URL("../../../../", import.meta.url);
const hardwareDirectories = ["nut-compatible-ups", "local-security-cameras", "matter-devices", "z-wave-devices"];
const categoryLabels = new Map([["sensor", "Sensors"]]);
const amazon = { url: "https://www.amazon.com/dp/B0B6P22YJC/ref=nosim?tag=stack127-20", asin: "B0B6P22YJC" };
const hardware = {
  slug: "sensor", vendor: "Acme", model: "A1", name: "Sensor", category: "Sensors", image_path: null,
  features: ["Thread"], search_terms: ["CSA123", "x".repeat(161)],
  card: { compatibility: { label: "Matter certification", status: "confirmed", value: "1 CSA record" }, facts: [] },
  facts: [], stats: [], evidence: [], notes: ["Full description"], source_links: [], amazon,
};
const zigbee = {
  slug: "sensor", vendor: "Acme", model: "A1", name: "Sensor", category: "sensor", image_path: "/sensor.webp",
  battery_reporting: true, ota: false, date_added: "2026-01-01", fingerprints: [{ manufacturer_name: "Acme", model_id: "A1" }],
  zigbee_models: ["A1"], zigbee2mqtt_capabilities: ["battery", "temperature"], zha_reported_capabilities: ["temperature"],
  blakadder_url: "https://zigbee.blakadder.com/sensor.html", zigbee2mqtt_url: "https://www.zigbee2mqtt.io/devices/sensor.html",
  detail_sections: [{ heading: "Details", facts: [{ label: "Source", value: "Evidence" }] }],
};

test("hardware indexes omit details and Matter descriptions while keeping identifiers and filter fields", () => {
  const index = hardwareIndexRecord(hardware);
  assert.deepEqual(index.search_terms, ["CSA123"]);
  assert.equal(index.amazon, true);
  assert.deepEqual(index.features, ["Thread"]);
  assert.equal(index.compatibility.value, "Certified");
  assert.equal("notes" in index, false);
  assert.equal("source_links" in index, false);
  assert.equal(hardware.search_terms.length, 2);
  const other = { ...hardware, card: { ...hardware.card, compatibility: { ...hardware.card.compatibility, label: "Compatibility" } } };
  assert.deepEqual(hardwareIndexRecord(other).search_terms, hardware.search_terms);
});

test("Zigbee indexes preserve search fields and card facts without shipping device details", () => {
  const index = zigbeeIndexRecord({ ...zigbee, amazon }, categoryLabels);
  assert.equal(index.amazon, true);
  assert.equal(index.cardFacts[0].value, "Sensors");
  assert.deepEqual(index.fingerprints, zigbee.fingerprints);
  assert.deepEqual(index.zigbee2mqtt_capabilities, zigbee.zigbee2mqtt_capabilities);
  assert.equal("detail_sections" in index, false);
  assert.equal("blakadder_url" in index, false);
  const card = { facts: [{ label: "Type", value: "Custom" }], compatibility: { label: "Works with", status: "reported", value: "ZHA" } };
  assert.deepEqual(zigbeeIndexRecord({ ...zigbee, card }, categoryLabels).cardFacts, card.facts);
  assert.equal(zigbeeIndexRecord(zigbee, categoryLabels).amazon, false);
});

function route(file) {
  const state = { published: true, fail: false, loads: 0, enrichments: 0 };
  const exports = loadTypeScript(new URL(file, root), {
    "next/server": { NextResponse: { json: (value, options) => Response.json(value, options) } },
    "@/lib/page-registry": { getPublishedPage: async () => state.published ? {} : null },
    "@/lib/hardware-directories": {
      isHardwareDirectorySlug: slug => [...hardwareDirectories, "zigbee-coordinators"].includes(slug),
      getHardwareDirectorySnapshot: async () => {
        state.loads++;
        if (state.fail) throw new Error("snapshot unavailable");
        return { records: [hardware] };
      },
    },
    "@/lib/hardware-directories/search-index": { hardwareIndexRecord },
    "@/lib/zigbee-devices": { getZigbeeDevices: () => [zigbee], zigbeeCategoryLabels: categoryLabels },
    "@/lib/zigbee-devices/search-index": { zigbeeIndexRecord },
    "@/lib/amazon-affiliate/server": {
      addAmazonMatches: async (_directory, records) => {
        state.enrichments++;
        return records.map(record => ({ ...record, amazon }));
      },
    },
  });
  return { ...exports, state };
}
const context = (directory, record = "sensor") => ({ params: Promise.resolve({ directory, record }) });

test("the index API returns every compact record at the five client URLs with a shared cache tag", async () => {
  const { GET, generateStaticParams, state } = route("app/api/hardware-directory/[directory]/route.ts");
  assert.deepEqual(Array.from(generateStaticParams(), params => params.directory).sort(), [...hardwareDirectories, "zigbee-devices"].sort());
  for (const directory of [...hardwareDirectories, "zigbee-devices"]) {
    const response = await GET(null, context(directory));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("Cache-Control"), /s-maxage=31536000/);
    assert.ok(response.headers.get("Cache-Tag").includes("stack127-public"));
    assert.deepEqual(await response.json(), [directory === "zigbee-devices"
      ? zigbeeIndexRecord({ ...zigbee, amazon }, categoryLabels) : hardwareIndexRecord(hardware)]);
  }
  assert.equal(state.loads, 4);
  assert.equal(state.enrichments, 1);
});

test("the index API rejects unsupported and unpublished directories and throws on source failure", async () => {
  const { GET, state } = route("app/api/hardware-directory/[directory]/route.ts");
  for (const directory of ["unknown", "zigbee-coordinators"]) {
    const response = await GET(null, context(directory));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
  state.published = false;
  assert.equal((await GET(null, context("zigbee-devices"))).status, 404);
  assert.equal(state.loads, 0);
  assert.equal(state.enrichments, 0);
  state.published = true;
  state.fail = true;
  await assert.rejects(GET(null, context("matter-devices")), /snapshot unavailable/);
});

test("details return full Zigbee devices with Amazon data and preserve existing hardware details", async () => {
  const { GET, state } = route("app/api/hardware-directory/[directory]/[record]/route.ts");
  const response = await GET(null, context("zigbee-devices"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ...zigbee, amazon });
  assert.ok(response.headers.get("Cache-Tag").split(",").includes("page:zigbee-devices"));
  assert.equal(state.enrichments, 1);
  assert.deepEqual(await (await GET(null, context("matter-devices"))).json(), hardware);
  const missing = await GET(null, context("zigbee-devices", "missing"));
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get("Cache-Control"), "no-store");
  assert.equal(state.enrichments, 1);
  state.published = false;
  assert.equal((await GET(null, context("zigbee-devices"))).status, 404);
  assert.equal((await GET(null, context("unknown"))).status, 404);
});

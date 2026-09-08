import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addZWaveRecordToGroups,
  buildAllianceRecord,
  finalizeZWaveGroups,
  parseAllianceProductDetail,
} from "../../../scripts/z-wave-devices/lib/catalog.mjs";

const detailHtml = `
  <div id="product-detail-page"><div class="owl-carousel">
    <img src="https://products.z-wavealliance.org/wp-content/uploads/products/42/device.png" alt="">
  </div></div>
  <table class="table">
    <tr><th class="th-min-with" scope="col"><div>Product Recognition</div></th><td><div class="fs-zwa-lr-badge" title="LR Certified"></div><div class="fs-zwa-plus-badge" title="Z-Wave Plus Certified"></div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Certification Number</div></th><td><div>ZC10-12345</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Name</div></th><td><div>Example Motion Sensor</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Brand</div></th><td><div>Example</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Identifier</div></th><td><div>EX-MOTION-US</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Product URL</div></th><td><div>https://example.com/ex-motion-us</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Device Type</div></th><td><div>NOTIFICATION_SENSOR</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Frequency Plans</div></th><td><div>US: 916.00MHz, 908.40MHz, US_LR: 912.00MHz, 920.00MHz</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Categories</div></th><td><div>Sensors</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Countries / Regions</div></th><td><div>Canada, United States of America</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Radio Range Z-Wave LR (m)</div></th><td><div>400</div></td></tr>
    <tr><th class="th-min-with" scope="col"><div>Documents</div></th><td><div><table><tr><td><a href="https://example.com/manual.pdf">Manual.pdf</a></td></tr></table></div></td></tr>
  </table>`;

test("Alliance detail parser preserves certification, region, image, and documents", () => {
  const parsed = parseAllianceProductDetail(detailHtml);

  assert.equal(parsed.fields.get("Certification Number"), "ZC10-12345");
  assert.equal(parsed.fields.get("Identifier"), "EX-MOTION-US");
  assert.deepEqual(parsed.recognition, ["Long Range", "Z-Wave Plus"]);
  assert.deepEqual(parsed.imageUrls, ["https://products.z-wavealliance.org/wp-content/uploads/products/42/device.png"]);
  assert.deepEqual(parsed.documents, [{ label: "Manual.pdf", url: "https://example.com/manual.pdf" }]);
});

test("Alliance record makes the buying decision readable on the card", () => {
  const apiRecord = {
    date: "2026-01-05T00:00:00",
    link: "https://products.z-wavealliance.org/z-wave-product/example-motion-sensor/",
    modified_gmt: "2026-02-10T00:00:00",
    slug: "example-motion-sensor",
    title: { rendered: "Example Motion Sensor" },
  };
  const record = buildAllianceRecord(apiRecord, parseAllianceProductDetail(detailHtml), {
    imagePath: "/hardware-directory-images/z-wave-devices/example-motion-sensor.webp",
    imageQuality: "official-high-resolution",
    imageSourceUrl: "https://products.z-wavealliance.org/wp-content/uploads/products/42/device.png",
    zwaveJsMatches: [],
  });

  assert.equal(record.vendor, "Example");
  assert.equal(record.model, "EX-MOTION-US");
  assert.equal(record.category, "Sensors");
  assert.equal(record.image_quality, "official-high-resolution");
  assert.deepEqual(record.card, {
    compatibility: { label: "Certification", status: "confirmed", value: "Z-Wave Plus + Long Range" },
    facts: [
      { label: "Frequency", value: "US + US LR" },
      { label: "Software config", value: "No Z-Wave JS match" },
    ],
  });
  assert.equal(record.detail_sections.some((section) => section.heading === "Radio and region"), true);
  assert.equal(record.provenance.some((item) => item.field === "Certification Number"), true);
});

test("groups repeated protocol identities and preserves each Alliance certification", () => {
  const apiRecord = {
    date: "2026-01-05T00:00:00", link: "https://products.z-wavealliance.org/z-wave-product/example-motion-sensor/",
    slug: "example-motion-sensor", title: { rendered: "Example Motion Sensor" },
  };
  const first = buildAllianceRecord(apiRecord, parseAllianceProductDetail(detailHtml), {
    imagePath: "/hardware-directory-images/z-wave-devices/first.webp", imageQuality: "official-high-resolution",
    imageSourceUrl: "https://products.z-wavealliance.org/wp-content/uploads/products/42/device.png", zwaveJsMatches: [],
  });
  const secondHtml = detailHtml.replace("ZC10-12345", "ZC10-67890").replace("US: 916.00MHz, 908.40MHz, US_LR: 912.00MHz, 920.00MHz", "EU: 868.40MHz");
  const second = buildAllianceRecord({ ...apiRecord, date: "2026-02-05T00:00:00", link: `${apiRecord.link}eu/`, slug: "example-motion-sensor-eu" }, parseAllianceProductDetail(secondHtml), {
    imagePath: null, imageQuality: null, imageSourceUrl: null, zwaveJsMatches: [],
  });
  for (const record of [first, second]) record.facts.push(
    { label: "Manufacturer ID", value: "0x1234" }, { label: "Product type ID", value: "0x0001" }, { label: "Product ID", value: "0x0002" },
  );
  const groups = new Map();
  addZWaveRecordToGroups(groups, first);
  addZWaveRecordToGroups(groups, second);
  const [product] = finalizeZWaveGroups(groups);
  assert.equal(product.certification_variant_kind, "z-wave");
  assert.equal(product.certification_variants.length, 2);
  assert.equal(product.image_source_slug, "example-motion-sensor");
  assert.equal(product.card.facts[0].value.includes("EU"), true);
});

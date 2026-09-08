import assert from "node:assert/strict";
import { test } from "node:test";
import { addMatterRecordToGroups, buildMatterRecord, finalizeMatterGroups, parseMatterProductDetail } from "../../../scripts/matter-devices/lib/catalog.mjs";

const html = `
  <div class="entry-image"><img src="https://csa-iot.org/product.jpg"></div>
  <p class="entry-company notranslate">By Example Devices Ltd.</p>
  <ul class="detail-items">
    <li class="item"><span class="label">Certificate ID</span><span class="value">CSA123MAT456-24</span></li>
    <li class="item"><span class="label">Certified Date</span><span class="value">05/08/2024</span></li>
    <li class="item"><span class="label">Specification Version</span><span class="value">1.3</span></li>
    <li class="item"><span class="label">Transport Interface</span><span class="value">Thread, Bluetooth</span></li>
    <li class="item"><span class="label">Vendor ID</span><span class="value">0x1234</span></li>
    <li class="item"><span class="label">Compliance Document</span><span class="value"><a href="https://example.com/compliance.zip">Download</a></span></li>
  </ul>`;

test("CSA parser preserves structured certification fields and ignores the generic image", () => {
  const parsed = parseMatterProductDetail(html);
  assert.equal(parsed.company, "Example Devices Ltd.");
  assert.equal(parsed.fields.get("Certificate ID"), "CSA123MAT456-24");
  assert.equal(parsed.imageUrl, "https://csa-iot.org/product.jpg");
  assert.deepEqual(parsed.links, [{ label: "Compliance Document", url: "https://example.com/compliance.zip" }]);
  assert.equal(parseMatterProductDetail(html.replace("product.jpg", "CSA-Certified-Product-default-01-1.jpg")).imageUrl, "");
});

test("Matter record presents certification, transport, and version on the card", () => {
  const apiRecord = {
    content: { rendered: "A certified sensor" },
    date: "2024-05-08T00:00:00",
    excerpt: { rendered: "For indoor use" },
    id: 42,
    link: "https://csa-iot.org/csa_product/example-sensor/",
    title: { rendered: "Example Sensor" },
  };
  const record = buildMatterRecord(apiRecord, parseMatterProductDetail(html), {
    company: "Example Devices Ltd.",
    deviceType: "Contact Sensor",
    imagePath: "/hardware-directory-images/matter-devices/example.webp",
    imageQuality: "official-high-resolution",
    imageSourceUrl: "https://csa-iot.org/product.jpg",
    productType: "End Product",
    slug: "example-sensor",
  });
  assert.deepEqual(record.card, {
    compatibility: { label: "Matter certification", status: "confirmed", value: "CSA123MAT456-24" },
    facts: [
      { label: "Transport", value: "Thread + Bluetooth" },
      { label: "Matter version", value: "1.3" },
    ],
  });
  assert.equal(record.category, "Contact Sensor");
  assert.equal(record.detail_sections.some((section) => section.heading === "Certification"), true);
});

test("groups repeated product certifications while retaining every exact variant", () => {
  const base = buildMatterRecord({
    content: { rendered: "A certified sensor" }, date: "2024-05-08T00:00:00", excerpt: { rendered: "" }, id: 42,
    link: "https://csa-iot.org/csa_product/example-sensor/", title: { rendered: "Example Sensor" },
  }, parseMatterProductDetail(html), {
    company: "Example Devices Ltd.", deviceType: "Contact Sensor", imagePath: "/hardware-directory-images/matter-devices/first.webp",
    imageSourceUrl: "https://csa-iot.org/product.jpg", slug: "first",
  });
  const secondHtml = html.replaceAll("CSA123MAT456-24", "CSA123MAT789-24").replace("0x1234", "0x1235");
  const second = buildMatterRecord({
    content: { rendered: "A certified sensor" }, date: "2024-06-08T00:00:00", excerpt: { rendered: "" }, id: 43,
    link: "https://csa-iot.org/csa_product/example-sensor-2/", title: { rendered: "Example Sensor" },
  }, parseMatterProductDetail(secondHtml), { company: "Example Devices Ltd.", deviceType: "Contact Sensor", slug: "second" });
  const groups = new Map();
  addMatterRecordToGroups(groups, base);
  addMatterRecordToGroups(groups, second);
  const [product] = finalizeMatterGroups(groups);
  assert.equal(product.card.compatibility.value, "2 CSA records");
  assert.equal(product.certification_variants.length, 2);
  assert.equal(product.image_source_slug, "first");
  assert.equal(product.search_terms.includes("CSA123MAT789-24"), true);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../../../../", import.meta.url);
const catalogs = [
  { data: "lib/zigbee-devices/data/devices.json", slug: "zigbee-devices" },
  { data: "lib/hardware-directories/data/zigbee-coordinators.json", slug: "zigbee-coordinators" },
  { data: "lib/hardware-directories/data/z-wave-devices.json", slug: "z-wave-devices" },
  { data: "lib/hardware-directories/data/nut-compatible-ups.json", slug: "nut-compatible-ups" },
  { data: "lib/hardware-directories/data/local-security-cameras.json", slug: "local-security-cameras" },
  { data: "lib/hardware-directories/data/matter-devices.json", slug: "matter-devices" },
];

const unresolved = /^(unknown|not recorded|no or unknown|not published)$/i;

for (const catalog of catalogs) {
  test(`${catalog.slug} snapshot proves complete source and detail coverage`, async () => {
    const snapshot = JSON.parse(await readFile(new URL(catalog.data, root), "utf8"));
    const records = snapshot.records ?? snapshot.devices;
    const { coverage } = snapshot.meta;

    assert.ok(coverage, `${catalog.slug} needs a coverage ledger`);
    for (const key of ["source_total", "eligible_total", "record_total", "detail_total", "image_total", "excluded_total"]) {
      assert.equal(Number.isInteger(coverage[key]), true, `${catalog.slug} coverage.${key} must be an integer`);
      assert.ok(coverage[key] >= 0, `${catalog.slug} coverage.${key} cannot be negative`);
    }
    assert.equal(coverage.record_total, records.length);
    assert.equal(coverage.record_total, coverage.eligible_total, `${catalog.slug} omits eligible source records`);
    assert.ok(coverage.detail_total >= coverage.record_total, `${catalog.slug} has incomplete detail records`);
    if (Number.isInteger(coverage.certification_total)) {
      assert.equal(coverage.certification_total, coverage.source_total, `${catalog.slug} omits certification records`);
      const certificationDetailTotal = Number.isInteger(coverage.certification_detail_total)
        ? coverage.certification_detail_total
        : coverage.detail_total;
      assert.equal(certificationDetailTotal, coverage.certification_total, `${catalog.slug} has incomplete certification details`);
    }
    assert.equal(coverage.missing_image_total, coverage.record_total - coverage.image_total);
    assert.deepEqual(coverage.failures, [], `${catalog.slug} has unresolved importer failures`);
    assert.equal(snapshot.meta.ready_for_catalog, true);
    assert.equal(snapshot.meta.ready_for_publication, coverage.missing_image_total === 0);
    assert.ok(snapshot.meta.source_revision);
    assert.ok(snapshot.meta.generated_at);
  });

  test(`${catalog.slug} cards contain decisions instead of source bookkeeping`, async () => {
    const snapshot = JSON.parse(await readFile(new URL(catalog.data, root), "utf8"));
    const records = snapshot.records ?? snapshot.devices;

    for (const record of records) {
      assert.ok(record.card?.compatibility?.label, `${catalog.slug}/${record.slug} needs a compatibility label`);
      assert.ok(record.card?.compatibility?.value, `${catalog.slug}/${record.slug} needs a compatibility result`);
      assert.match(record.card.compatibility.status, /^(confirmed|reported|limited|not-applicable)$/);
      assert.equal(record.card.facts.length, 2, `${catalog.slug}/${record.slug} needs exactly two decision facts`);
      assert.equal(record.card.facts.some((fact) => unresolved.test(fact.value)), false, `${catalog.slug}/${record.slug} exposes an unresolved value on the card`);
      assert.ok(record.detail_sections?.length >= 2, `${catalog.slug}/${record.slug} needs grouped details`);
      assert.ok(record.provenance?.length > 0, `${catalog.slug}/${record.slug} needs field provenance`);
    }
  });

  test(`${catalog.slug} managed product images retain exact provenance and missing images are explicit`, async () => {
    const snapshot = JSON.parse(await readFile(new URL(catalog.data, root), "utf8"));
    const records = snapshot.records ?? snapshot.devices;

    for (const record of records) {
      assert.equal(Boolean(record.image_path), Boolean(record.image_source_url));
      if (!record.image_path) continue;
      assert.match(
        record.image_path,
        new RegExp(`^https://tulgfrqamtcshdtmhvpx\\.supabase\\.co/storage/v1/object/public/stack127-media/directories/${catalog.slug}/images/.+\\.webp$`, "u"),
      );
      assert.match(record.image_source_url, /^https?:\/\//u);
      assert.ok(record.image_quality, `${catalog.slug}/${record.slug} needs an image quality label`);
    }
  });
}

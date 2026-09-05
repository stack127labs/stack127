import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../../../../", import.meta.url);
const directories = [
  ["zigbee-coordinators", 78],
  ["z-wave-devices", 3154],
  ["nut-compatible-ups", 1218],
  ["local-security-cameras", 3124],
  ["matter-devices", 2353],
];

for (const [slug, minimum] of directories) {
  test(`${slug} owns a published source-backed directory with managed images`, async () => {
    const manifest = JSON.parse(await readFile(new URL(`tests/pages/${slug}/page.json`, root), "utf8"));
    assert.equal(manifest.route, `/${slug}`);
    assert.equal(manifest.state, "published");

    await access(new URL(`content_docs/${slug}/brief.md`, root));
    await access(new URL(`app/(site)/(directories)/${slug}/page.tsx`, root));

    const snapshot = JSON.parse(
      await readFile(new URL(`lib/hardware-directories/data/${slug}.json`, root), "utf8"),
    );
    assert.ok(snapshot.records.length >= minimum, `${slug} needs at least ${minimum} reviewed records`);
    assert.ok(snapshot.meta.generated_at);
    assert.ok(snapshot.meta.source_url);
    assert.ok(snapshot.meta.source_revision);
    assert.equal(new Set(snapshot.records.map((record) => record.slug)).size, snapshot.records.length);
    assert.equal(snapshot.records.every((record) => record.vendor && record.model && record.name), true);
    assert.equal(snapshot.records.every((record) => Boolean(record.image_path) === Boolean(record.image_source_url)), true);
    assert.equal(snapshot.records.every((record) => record.source_links?.length > 0), true);
    assert.equal(snapshot.meta.coverage?.record_total, snapshot.records.length);

    const picturedRecords = snapshot.records.filter((record) => record.image_path);
    assert.equal(
      picturedRecords.every((record) =>
        record.image_path.startsWith(
          `https://tulgfrqamtcshdtmhvpx.supabase.co/storage/v1/object/public/stack127-media/directories/${slug}/images/`,
        ) && record.image_path.endsWith(".webp")
      ),
      true,
    );
    assert.equal(snapshot.meta.coverage.image_total, picturedRecords.length);
  });
}

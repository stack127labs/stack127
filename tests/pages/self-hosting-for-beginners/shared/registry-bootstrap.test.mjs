import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync(
  new URL("../../../../supabase/config.toml", import.meta.url),
  "utf8",
);
const pages = JSON.parse(
  readFileSync(
    new URL("../../../../scripts/self-hosting-for-beginners/pages.json", import.meta.url),
    "utf8",
  ),
);
const seed = readFileSync(
  new URL(
    "../../../../supabase/seeds/20260817_self_hosting_for_beginners_pages.sql",
    import.meta.url,
  ),
  "utf8",
);

test("managed dev bootstrap seeds the complete course registry", () => {
  assert.match(
    config,
    /sql_paths\s*=\s*\[\s*"\.\/seeds\/20260629_stack127_open_projects\.sql",\s*"\.\/seeds\/20260817_self_hosting_for_beginners_pages\.sql",?\s*\]/,
  );

  const payload = seed.match(
    /\$course_pages\$([\s\S]+?)\$course_pages\$::jsonb/,
  );
  assert.ok(payload, "course seed must contain a course_pages JSON payload");
  assert.deepEqual(JSON.parse(payload[1]), pages);
  assert.match(seed, /on conflict \(slug\) do update set/);
  assert.match(seed, /is_published = true/);
});

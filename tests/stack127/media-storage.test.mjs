import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  contentDigest,
  isManagedMediaUrl,
  mediaObjectPath,
  publicMediaUrl,
  uploadMediaObject,
} from "../../scripts/stack127/media/storage.mjs";

const supabaseUrl = "https://project-ref.supabase.co";

test("directory media uses one namespaced public bucket", () => {
  const digest = contentDigest(Buffer.from("icon"));
  const objectPath = mediaObjectPath({
    directory: "cli-apps",
    extension: "png",
    kind: "icons",
    slug: "superfile",
    digest,
  });

  assert.equal(
    objectPath,
    `directories/cli-apps/icons/superfile-${digest.slice(0, 16)}.png`,
  );

  const url = publicMediaUrl({ objectPath, supabaseUrl });
  assert.equal(
    url,
    `${supabaseUrl}/storage/v1/object/public/stack127-media/${objectPath}`,
  );
  assert.equal(isManagedMediaUrl(url, { directory: "cli-apps", kind: "icons" }), true);
});

test("managed media validation rejects local and unrelated URLs", () => {
  assert.equal(isManagedMediaUrl("/cli-app-icons/superfile.png"), false);
  assert.equal(isManagedMediaUrl("https://example.com/superfile.png"), false);
  assert.equal(
    isManagedMediaUrl(
      `${supabaseUrl}/storage/v1/object/public/another-bucket/directories/cli-apps/icons/superfile.png`,
    ),
    false,
  );
});

test("object paths reject traversal and unsafe names", () => {
  assert.throws(() => mediaObjectPath({
    directory: "../cli-apps",
    extension: "png",
    kind: "icons",
    slug: "superfile",
    digest: "a".repeat(64),
  }));
  assert.throws(() => publicMediaUrl({
    objectPath: "../secret.png",
    supabaseUrl,
  }));
});

test("the database creates one image-only public bucket and constrains directory URLs", async () => {
  const root = new URL("../../", import.meta.url);
  const bucketMigration = await readFile(
    new URL("supabase/migrations/20260903124503_create_stack127_media_bucket.sql", root),
    "utf8",
  );
  const constraintMigration = await readFile(
    new URL("supabase/migrations/20260903125614_enforce_managed_directory_media.sql", root),
    "utf8",
  );

  assert.match(bucketMigration, /'stack127-media'/);
  assert.match(bucketMigration, /true,\s*10485760/);
  assert.doesNotMatch(bucketMigration, /image\/svg\+xml/);
  assert.doesNotMatch(bucketMigration, /create policy/i);
  assert.match(constraintMigration, /terminal_apps_icon_url_managed/);
  assert.match(constraintMigration, /terminal_apps_screenshot_url_managed/);
  assert.match(constraintMigration, /self_host_apps_icon_url_managed/);
});

test("uploads use the secret key and immutable cache headers", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return new Response("{}", { status: 200 });
  };
  const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const objectPath = `directories/cli-apps/icons/superfile-${"a".repeat(16)}.png`;

  const url = await uploadMediaObject({
    bytes,
    contentType: "image/png",
    fetchImpl,
    objectPath,
    secretKey: "test-secret",
    supabaseUrl,
  });

  assert.equal(url, `${supabaseUrl}/storage/v1/object/public/stack127-media/${objectPath}`);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.method, "POST");
  assert.equal(requests[0].options.headers.apikey, "test-secret");
  assert.equal(requests[0].options.headers.authorization, "Bearer test-secret");
  assert.equal(requests[0].options.headers["cache-control"], "max-age=31536000, immutable");
});

test("uploads retry transient Storage failures", async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return new Response(attempts < 3 ? "temporary" : "{}", { status: attempts < 3 ? 504 : 200 });
  };
  const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

  await uploadMediaObject({
    bytes,
    contentType: "image/png",
    fetchImpl,
    objectPath: `directories/cli-apps/icons/retry-${"b".repeat(16)}.png`,
    secretKey: "test-secret",
    supabaseUrl,
  });
  assert.equal(attempts, 3);
});

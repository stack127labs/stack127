import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("the legacy backup refuses static events before connecting to the database", () => {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", "scripts/stack127/cache/process-revalidation.mjs"], {
    env: { ...process.env, STACK127_FRONTEND_HOSTING: "cloudflare", DATABASE_URL: "", DATABASE_POOLER_URL: "",
      CLOUDFLARE_API_TOKEN: "", CLOUDFLARE_ZONE_ID: "" },
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot acknowledge static frontend events/);
  assert.doesNotMatch(result.stderr, /credentials are required/);
});

import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { cleanupOptions, targetSources } from "../../scripts/self-host-apps/apply-artifact-cleanup.mjs";

const developmentUrl = "postgresql://postgres.devref:secret@aws-0-eu.pooler.supabase.com:6543/postgres";
const productionUrl = "postgresql://stack127:secret@database.stack127.com:5432/stack127";

test("retirement preserves reviewed evidence and Compose destinations alongside direct links", () => {
  assert.deepEqual(targetSources({ source_code_url: "https://github.com/example/app", compose_url: "https://example.com/compose.yml", data_source_urls: ["https://example.com/install"], website_url: null }), [
    "https://github.com/example/app", "https://example.com/compose.yml", "https://example.com/install",
  ]);
  assert.deepEqual(targetSources({}), []);
});

function withEnvFiles(callback) {
  const previous = process.cwd();
  const dir = mkdtempSync(join(tmpdir(), "artifact-cleanup-"));
  writeFileSync(join(dir, ".env.local"), `SUPABASE_URL=https://devref.supabase.co\nDATABASE_URL=${developmentUrl}\n`);
  writeFileSync(join(dir, ".env.database"), `SUPABASE_URL=https://api.stack127.com\nDATABASE_URL=${productionUrl}\n`);
  process.chdir(dir);
  try {
    return callback();
  } finally {
    process.chdir(previous);
    rmSync(dir, { recursive: true, force: true });
  }
}

test("production cleanup uses the self-hosted production database", () => {
  withEnvFiles(() => {
    const options = cleanupOptions({ environment: "production", confirm: "stack127-production", apply: true });
    assert.equal(options.databaseUrl, productionUrl);
    assert.equal(options.apply, true);
  });
});

test("development cleanup uses the development database", () => {
  withEnvFiles(() => {
    assert.equal(cleanupOptions({ environment: "development" }).databaseUrl, developmentUrl);
  });
});

test("production cleanup needs the shared confirm value, even for a preview", () => {
  withEnvFiles(() => {
    assert.throws(() => cleanupOptions({ environment: "production" }), /stack127-production/);
    assert.throws(() => cleanupOptions({ environment: "production", apply: true, confirm: "yes" }), /stack127-production/);
  });
});

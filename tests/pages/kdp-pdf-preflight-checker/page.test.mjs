import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/kdp-pdf-preflight-checker/", root);

test("owns an unpublished local-file route and possible-issue boundary", () => {
  for (const file of ["page.tsx", "kdp-pdf-preflight-checker.tsx"]) assert.equal(existsSync(new URL(file, route)), true, file);
  const page = readFileSync(new URL("page.tsx", route), "utf8");
  const client = readFileSync(new URL("kdp-pdf-preflight-checker.tsx", route), "utf8");
  const uploads = readFileSync(new URL("app/tool-ui/tool-uploads.tsx", root), "utf8");
  const engine = readFileSync(new URL("lib/kdp/pdf-preflight.ts", root), "utf8");
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.state, "unpublished");
  assert.match(page, /getRequiredToolPage\("kdp-pdf-preflight-checker"\)/);
  assert.match(client, /ToolFileDropzone/);
  assert.match(client, /ToolFileList/);
  assert.match(uploads, /DropZone/);
  assert.match(uploads, /FileTrigger/);
  assert.doesNotMatch(client, /<input[^>]+type="file"/);
  assert.match(client, /Check PDF/);
  assert.match(client, /PDF limit:/);
  assert.match(client, /Fix KDP settings first\./);
  assert.match(client, /Local check failed\./);
  assert.match(client, /stays local/);
  assert.match(client, /Cover dimensions:/);
  assert.match(client, /Rules 2026-09-16/);
  assert.match(engine, /Possible issue/);
  assert.doesNotMatch(engine, /fetch\(|localStorage|sessionStorage|navigator\.|document\.createElement|window\./i);
});

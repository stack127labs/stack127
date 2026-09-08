import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const source = readFileSync(path.join(root, "app/(site)/(tools)/caa-checker/caa-checker.tsx"), "utf8");

test("CAA checker uses the contracted shared controls and one ordered evidence path", () => {
  for (const component of [
    "ToolTextField",
    "ToolButton",
    "ToolStatus",
    "ToolResultLead",
    "ToolDataTable",
    "ToolActionRow",
    "ToolDownloadAction",
    "ToolRawOutput",
  ]) {
    assert.match(source, new RegExp(component), `${component} must remain in the CAA interface`);
  }
  assert.match(source, /<ol[^>]+aria-label="CAA lookup path"/);
  assert.doesNotMatch(source, /DiagnosticFavicon|DiagnosticResultHeader|DownloadResultButton|ToolTimeline|ToolAllocationBar|ToolProgressBar/);
  assert.equal((source.match(/<ToolResultLead/g) ?? []).length, 1);
  assert.equal((source.match(/<ToolRawOutput/g) ?? []).length, 1);
});

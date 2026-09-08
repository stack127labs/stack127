import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const toolUrl = new URL(
  "../../../app/(site)/(tools)/domain-expiry/domain-expiry-tool.tsx",
  import.meta.url,
);

test("domain expiry composes shared controls around expiry-specific results", async () => {
  const tool = await readFile(toolUrl, "utf8");

  for (const component of [
    "ToolButton",
    "ToolDataTable",
    "ToolDownloadAction",
    "ToolMetricGroup",
    "ToolPrimaryResult",
    "ToolRawOutput",
    "ToolTextField",
  ]) {
    assert.match(tool, new RegExp(component));
  }

  assert.doesNotMatch(tool, /DomainForm/);
  assert.doesNotMatch(tool, /ResultHeader/);
  assert.doesNotMatch(tool, /StatePill/);
  assert.doesNotMatch(tool, /RawResponses/);
  assert.doesNotMatch(tool, /DownloadReportButton/);
  assert.doesNotMatch(tool, /function lifecycleEvents/);
  assert.doesNotMatch(tool, /ToolTimeline/);
  assert.match(tool, /Typical path after expiry/);
});

test("domain expiry does not turn an expiry date into an availability prediction", async () => {
  const tool = await readFile(toolUrl, "utf8");

  assert.match(tool, /Release time varies/);
  assert.match(tool, /Not available to register/);
  assert.doesNotMatch(tool, /available on/);
  assert.doesNotMatch(tool, /release date/);
  assert.doesNotMatch(tool, /expiry date governs deletion/i);
});

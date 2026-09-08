import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL(
  "../../../app/(site)/(tools)/domain-age/page.tsx",
  import.meta.url,
);

test("domain age serves its current introduction and supporting copy from the database", async () => {
  const route = await readFile(pageUrl, "utf8");

  assert.match(route, /getRequiredToolPage\("domain-age"\)/);
  assert.match(route, /<ToolPageHeader[\s\S]*toolPage=\{toolPage\}/);
  assert.match(route, /<ToolPageMarkdown toolPage=\{toolPage\}/);
  assert.doesNotMatch(route, /^"use client"/);
});

test("domain age results do not overstate RDAP events", async () => {
  const tool = await readFile(
    new URL(
      "../../../app/(site)/(tools)/domain-age/domain-age-tool.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(tool, /Registration date only\. It does not date the website or its current owner\./);
  assert.match(
    tool,
    /does not say why the domain was registered\s+again/,
  );
  assert.doesNotMatch(tool, /The name was dropped at some point/);
  assert.doesNotMatch(tool, /edited yesterday/);
});

test("domain age composes the shared controls around an answer-first result", async () => {
  const tool = await readFile(
    new URL(
      "../../../app/(site)/(tools)/domain-age/domain-age-tool.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  for (const component of [
    "ToolButton",
    "ToolDownloadAction",
    "ToolPrimaryResult",
    "ToolRawOutput",
    "ToolTextField",
    "ToolTimeline",
  ]) {
    assert.match(tool, new RegExp(component));
  }

  assert.doesNotMatch(tool, /DomainForm/);
  assert.doesNotMatch(tool, /RawResponses/);
  assert.doesNotMatch(tool, /DownloadReportButton/);
});

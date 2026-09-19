import assert from "node:assert/strict";
import test from "node:test";

import { summarizeUsageRows } from "../../scripts/stack127/tool-pipeline/audit-usage.mjs";

test("usage inventory distinguishes authored guides from unreviewed legacy rows", () => {
  const result = summarizeUsageRows([
    { slug: "complete-tool", usage_markdown: "## Use it", content_revision: 3, tool_version: "1.0.0" },
    { slug: "legacy-tool", usage_markdown: null, content_revision: 1, tool_version: "1.0.0" },
  ], "development");
  assert.equal(result.total, 2);
  assert.equal(result.authored, 1);
  assert.equal(result.notReviewed, 1);
  assert.deepEqual(result.routes.map((row) => [row.route, row.status]), [
    ["/complete-tool", "authored"],
    ["/legacy-tool", "not-reviewed"],
  ]);
});

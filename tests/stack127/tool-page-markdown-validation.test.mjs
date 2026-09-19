import assert from "node:assert/strict";
import test from "node:test";

import { validateToolMarkdown } from "../../scripts/stack127/tool-pages/validate-markdown.mjs";

test("accepts a registered spec-backed marker figure with a caption", () => {
  assert.doesNotThrow(() => validateToolMarkdown({
    content_markdown: "![Vdevs combine into one pool](marker-art://catalog/zfs-capacity)",
  }));
});

test("rejects unknown, uncaptioned, and non-image marker references before database integration", () => {
  assert.throws(
    () => validateToolMarkdown({ content_markdown: "![Unknown](marker-art://catalog/missing)" }),
    /unknown marker art reference/,
  );
  assert.throws(
    () => validateToolMarkdown({ content_markdown: "![](marker-art://catalog/zfs-capacity)" }),
    /requires a useful caption/,
  );
  assert.throws(
    () => validateToolMarkdown({ content_markdown: "See marker-art:\/\/catalog\/zfs-capacity" }),
    /must use Markdown image syntax/,
  );
});

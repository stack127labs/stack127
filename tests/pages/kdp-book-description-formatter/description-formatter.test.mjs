import test from "node:test";
import assert from "node:assert/strict";
import { formatKdpDescription } from "../../../lib/kdp/description-formatter.ts";

test("formats paragraph groups and line breaks with the documented source overhead", () => {
  const result = formatKdpDescription({ source: "First line\nSecond line\n\nThird line", mode: "plain-text" });
  assert.equal(result.status, "formatted");
  if (result.status !== "formatted") return;
  assert.equal(result.html, "<p>First line<br>Second line</p><p>Third line</p>");
  assert.equal(result.htmlCharacters, 49);
  assert.equal(result.visibleTextCharacters, 31);
  assert.equal(result.sourceOverhead, 18);
});

test("escapes plain text entities and never treats pasted angle brackets as markup", () => {
  const result = formatKdpDescription({ source: "A & B < C", mode: "plain-text" });
  assert.equal(result.status, "formatted");
  if (result.status !== "formatted") return;
  assert.equal(result.html, "<p>A &amp; B &lt; C</p>");
  assert.deepEqual(result.tree, [{ type: "element", tag: "p", children: [{ type: "text", value: "A & B < C" }] }]);
});

test("unwraps unsupported wrappers, strips attributes, and retains ordinary text safely", () => {
  const result = formatKdpDescription({
    source: '<h3>Start</h3><p class="x">Use <b>bold</b> and <a href="https://example.test">this</a>.</p>',
    mode: "html-source",
  });
  assert.equal(result.status, "formatted");
  if (result.status !== "formatted") return;
  assert.equal(result.html, "<h4>Start</h4><p>Use <b>bold</b> and this.</p>");
  assert.ok(result.changes.some((change) => change.type === "unsupported-tags"));
  assert.ok(result.changes.some((change) => change.type === "attributes"));
  assert.equal(JSON.stringify(result.tree).includes("https://example.test"), false);
});

test("drops active content and media without rendering it or retaining fetchable URLs", () => {
  const result = formatKdpDescription({ source: '<p>Safe</p><script>alert(1)</script><img src="https://example.test/p.png">', mode: "html-source" });
  assert.equal(result.status, "formatted");
  if (result.status !== "formatted") return;
  assert.equal(result.html, "<p>Safe</p>");
  assert.ok(result.changes.some((change) => change.type === "dropped-content"));
  assert.equal(JSON.stringify(result.tree).includes("script"), false);
  assert.equal(JSON.stringify(result.tree).includes("example.test"), false);
});

test("rejects unbalanced supported tags and preserves empty visible output as a no-output state", () => {
  const malformed = formatKdpDescription({ source: "<p><b>text</p></b>", mode: "html-source" });
  assert.equal(malformed.status, "invalid");
  const noText = formatKdpDescription({ source: '<img src="https://example.test/a.png">', mode: "html-source" });
  assert.equal(noText.status, "no-output");
  if (noText.status === "no-output") assert.equal(noText.changes.some((change) => change.type === "dropped-content"), true);
});

test("decodes recognized entities, escapes them for output, and normalizes nonbreaking spaces", () => {
  const result = formatKdpDescription({ source: "<p>A&nbsp;&amp; B &#x1F4D8;</p>", mode: "html-source" });
  assert.equal(result.status, "formatted");
  if (result.status !== "formatted") return;
  assert.equal(result.html, "<p>A &amp; B 📘</p>");
  assert.equal(result.visibleTextCharacters, 7);
  assert.ok(result.changes.some((change) => change.type === "entities"));
});

test("allows exactly 4,000 local source characters and withholds copy at 4,001", () => {
  const allowed = formatKdpDescription({ source: "A".repeat(3993), mode: "plain-text" });
  const tooLong = formatKdpDescription({ source: "A".repeat(3994), mode: "plain-text" });
  assert.equal(allowed.status, "formatted");
  if (allowed.status === "formatted") {
    assert.equal(allowed.htmlCharacters, 4000);
    assert.equal(allowed.copyAllowed, true);
  }
  assert.equal(tooLong.status, "formatted");
  if (tooLong.status === "formatted") {
    assert.equal(tooLong.htmlCharacters, 4001);
    assert.equal(tooLong.overBy, 1);
    assert.equal(tooLong.copyAllowed, false);
  }
});

test("rejects blank, oversized, and malformed source without truncating it", () => {
  assert.equal(formatKdpDescription({ source: "  ", mode: "plain-text" }).status, "invalid");
  const tooLarge = formatKdpDescription({ source: "A".repeat(64 * 1024 + 1), mode: "plain-text" });
  assert.equal(tooLarge.status, "invalid");
  if (tooLarge.status === "invalid") assert.match(tooLarge.message, /64 KiB/u);
  const unclosed = formatKdpDescription({ source: "<p>text", mode: "html-source" });
  assert.equal(unclosed.status, "invalid");
});


test("converts bold and unsupported headings while keeping their boundaries", () => {
  const result = formatKdpDescription({ source: "<h1>One</h1><h2>Two</h2><h3>Three</h3><strong>Bold</strong>", mode: "html-source" });
  assert.equal(result.status, "formatted");
  assert.equal(result.html, "<h4>One</h4><h4>Two</h4><h4>Three</h4><b>Bold</b>");
  assert.equal(result.changes.find((change) => change.type === "converted-tags").count, 4);
  assert.equal(formatKdpDescription({ source: "<strong>Bold</b>", mode: "html-source" }).status, "invalid");
});

test("cleans selected invisible characters and prevents copying invisible-only output", () => {
  for (const mode of ["plain-text", "html-source"]) {
    for (const source of ["\u200b", "\u2060", "\ufeff\u200b"]) {
      const result = formatKdpDescription({ source, mode });
      assert.equal(result.status, "no-output");
      assert.ok(result.changes.some((change) => change.type === "invisible-characters"));
    }
  }
  for (const source of ["<p>&#8203;&#x2060;&#65279;</p>", "&#8203;"]) {
    assert.equal(formatKdpDescription({ source, mode: "html-source" }).status, "no-output");
  }
  const result = formatKdpDescription({ source: "<p>A&#8203;B 👩‍💻</p>", mode: "html-source" });
  assert.equal(result.status, "formatted");
  assert.equal(result.html, "<p>AB 👩‍💻</p>");
  assert.equal(result.visibleTextCharacters, 6);
  assert.ok(result.changes.find((change) => change.type === "invisible-characters").details.includes("Removed invisible U+200B."));
});

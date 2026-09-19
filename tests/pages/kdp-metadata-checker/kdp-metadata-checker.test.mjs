import assert from "node:assert/strict";
import test from "node:test";
import { checkKdpMetadata, tokenizeKdpDescription } from "../../../lib/kdp/metadata.ts";

const validInput = (overrides = {}) => ({
  title: "A Quiet Atlas",
  subtitle: "Notes for paying attention",
  description: "<p>A short field guide.</p><p><b>Start here.</b></p>",
  keywords: ["quiet travel", "field notes", "observation guide", "slow reading", "nature writing", "paper book", "gift for walkers"],
  ...overrides,
});

test("FF-006 accepts supported description HTML and counts its tags", () => {
  const result = checkKdpMetadata(validInput());
  assert.equal(result.status, "clean");
  assert.equal(result.values?.descriptionCharacters, validInput().description.length);
  assert.equal(result.values?.supportedTagCount, 6);
  assert.equal(result.values?.keywordCount, 7);
  assert.equal(result.findings.length, 0);
  assert.deepEqual(tokenizeKdpDescription("<p>Hi <b>there</b>.</p>"), [
    { type: "tag", name: "p", closing: false, selfClosing: false },
    { type: "text", value: "Hi " },
    { type: "tag", name: "b", closing: false, selfClosing: false },
    { type: "text", value: "there" },
    { type: "tag", name: "b", closing: true, selfClosing: false },
    { type: "text", value: "." },
    { type: "tag", name: "p", closing: true, selfClosing: false },
  ]);
});

test("FF-007 reports title, description, keyword, and HTML problems without mutating input", () => {
  const input = validInput({
    title: "<b>A Quiet Atlas</b>",
    subtitle: "A subtitle that makes the combined title long enough to cross the current limit".repeat(3),
    description: "<h3>Bad heading<p>Buy now at https://example.com or email@sample.test and please review this book.",
    keywords: ["quiet travel", "quiet travel", "<b>nature</b>", "atlas", "atlas", "", ""],
  });
  const snapshot = structuredClone(input);
  const result = checkKdpMetadata(input);
  assert.equal(result.status, "possible-issues");
  assert.deepEqual(input, snapshot);
  assert.ok(result.findings.some((finding) => finding.code === "title-html"));
  assert.ok(result.findings.some((finding) => finding.code === "title-too-long"));
  assert.ok(result.findings.some((finding) => finding.code === "description-unsupported-tag"));
  assert.ok(result.findings.some((finding) => finding.code === "description-unclosed-tag"));
  assert.ok(result.findings.some((finding) => finding.code === "description-url"));
  assert.ok(result.findings.some((finding) => finding.code === "description-email"));
  assert.ok(result.findings.some((finding) => finding.code === "description-review-request"));
  assert.ok(result.findings.some((finding) => finding.code === "keyword-duplicate"));
  assert.ok(result.findings.some((finding) => finding.code === "keyword-html"));
});

test("FF-008 detects malformed tag nesting and title wording repeated in keywords", () => {
  const result = checkKdpMetadata(validInput({
    title: "Gardening for Small Spaces",
    subtitle: "",
    description: "<p>Good</b>",
    keywords: ["small spaces", "gardening", "garden tools", "winter", "summer", "soil", "plants"],
  }));
  assert.equal(result.status, "possible-issues");
  assert.ok(result.findings.some((finding) => finding.code === "description-mismatched-tag"));
  assert.ok(result.findings.some((finding) => finding.code === "keyword-title-repeat"));
});

test("FF-009 does not treat plain angle-bracket text as safe HTML", () => {
  const result = checkKdpMetadata(validInput({ description: "Use < and > to compare values." }));
  assert.equal(result.status, "clean");
  assert.equal(result.values?.supportedTagCount, 0);
});

test("FF-010 detects emoji and bare domains in description text", () => {
  const result = checkKdpMetadata(validInput({
    description: "A description 🙂. Visit example.com for more.",
  }));
  assert.equal(result.status, "possible-issues");
  assert.ok(result.findings.some((finding) => finding.code === "description-emoji"));
  assert.ok(result.findings.some((finding) => finding.code === "description-url"));
});

test("FF-011 rejects malformed keyword input without returning a partial payload", () => {
  const result = checkKdpMetadata(validInput({ keywords: ["one", "two"] }));
  assert.equal(result.status, "input-error");
  assert.equal(result.values, null);
  assert.deepEqual(result.findings.map((finding) => finding.code), ["keywords-invalid"]);
});

test("FF-012 treats the 50-character keyword boundary as a local Unicode advisory", () => {
  for (const [count, hasLengthAdvisory] of [[49, false], [50, false], [51, true]]) {
    const keyword = "é".repeat(count);
    const result = checkKdpMetadata(validInput({ keywords: [keyword, "field notes", "observation guide", "slow reading", "nature writing", "paper book", "gift for walkers"] }));
    const lengthFindings = result.findings.filter((finding) => finding.code === "keyword-too-long");

    assert.equal(lengthFindings.length, hasLengthAdvisory ? 1 : 0);
    assert.equal(result.values?.normalizedKeywords[0], keyword);
    if (hasLengthAdvisory) {
      assert.equal(lengthFindings[0]?.severity, "warning");
      assert.match(lengthFindings[0]?.message ?? "", /local|KDP does not publish/i);
    }
  }
});

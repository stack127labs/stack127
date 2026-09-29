import test from "node:test";
import assert from "node:assert/strict";
import { reviewKdpBookTitle } from "../../../lib/kdp/book-title.ts";

function input(overrides = {}) {
  return {
    title: "Balcony Herbs",
    subtitle: "Growing Food in Small Spaces",
    topic: "Grow herbs on apartment balconies and small patios",
    intendedReader: "Apartment gardeners",
    targetPhrases: "balcony herbs\nurban gardening",
    ...overrides,
  };
}

test("reports literal topic, reader, and target-phrase matches without a score", () => {
  const result = reviewKdpBookTitle(input());
  assert.equal(result.status, "reviewed");
  if (result.status !== "reviewed") return;
  assert.equal(result.titleCharacters, 13);
  assert.equal(result.subtitleCharacters, 28);
  assert.equal(result.combinedCharacters, 42);
  assert.deepEqual(result.comparisons[0], {
    source: "topic",
    found: ["herbs", "small"],
    onlyInContext: ["grow", "apartment", "balconies", "patios"],
  });
  assert.deepEqual(result.comparisons[1].found, []);
  assert.deepEqual(result.phraseMatches.map((phrase) => phrase.status), ["title", "not-found"]);
  assert.equal("score" in result, false);
});

test("keeps a title-only result partial and reports shared wording as a prompt", () => {
  const result = reviewKdpBookTitle(input({ title: "Quiet Garden", subtitle: "Quiet Garden for Beginners", topic: "", intendedReader: "", targetPhrases: "" }));
  assert.equal(result.status, "reviewed");
  if (result.status !== "reviewed") return;
  assert.equal(result.partial, true);
  assert.ok(result.prompts.some((prompt) => prompt.text === "quiet garden" && prompt.field === "both"));
});

test("uses Unicode code points and preserves the 199, 200, and 201 boundary states", () => {
  const emoji = reviewKdpBookTitle(input({ title: "A📘", subtitle: "", topic: "", intendedReader: "", targetPhrases: "" }));
  assert.equal(emoji.status, "reviewed");
  if (emoji.status === "reviewed") assert.equal(emoji.titleCharacters, 2);
  const states = [199, 200, 201].map((count) => reviewKdpBookTitle(input({ title: "A".repeat(count), subtitle: "", topic: "", intendedReader: "", targetPhrases: "" })));
  assert.deepEqual(states.map((result) => result.status === "reviewed" ? result.lengthState : "invalid"), ["under", "ambiguous", "over"]);
  const exact = states[1];
  if (exact.status === "reviewed") assert.ok(exact.prompts.some((prompt) => prompt.text === "200 characters"));
});

test("flags markup as text, punctuation-only titles, and immediately repeated words", () => {
  const result = reviewKdpBookTitle(input({ title: "<b>Herbs</b> Herbs", subtitle: "", topic: "", intendedReader: "", targetPhrases: "" }));
  assert.equal(result.status, "reviewed");
  if (result.status !== "reviewed") return;
  assert.ok(result.prompts.some((prompt) => prompt.kind === "kdp-guidance" && prompt.text === "HTML-like tag"));
  assert.ok(result.prompts.some((prompt) => prompt.text === "herbs" && prompt.message.includes("repeats immediately")));
  const punctuation = reviewKdpBookTitle(input({ title: "…—", subtitle: "", topic: "", intendedReader: "", targetPhrases: "" }));
  assert.equal(punctuation.status, "reviewed");
  if (punctuation.status === "reviewed") assert.ok(punctuation.prompts.some((prompt) => prompt.message.includes("at least one letter or number")));
});

test("rejects blank titles, guard violations, duplicate phrases, and phrases that cross the title boundary", () => {
  assert.equal(reviewKdpBookTitle(input({ title: " " })).status, "invalid");
  assert.equal(reviewKdpBookTitle(input({ title: "x".repeat(501) })).status, "invalid");
  const duplicate = reviewKdpBookTitle(input({ targetPhrases: "balcony herbs\nBALCONY   HERBS" }));
  assert.equal(duplicate.status, "invalid");
  const across = reviewKdpBookTitle(input({ title: "quiet", subtitle: "garden", topic: "", intendedReader: "", targetPhrases: "quiet garden" }));
  assert.equal(across.status, "reviewed");
  if (across.status === "reviewed") assert.equal(across.phraseMatches[0].status, "not-found");
});

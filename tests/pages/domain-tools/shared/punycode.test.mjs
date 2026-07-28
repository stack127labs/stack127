import { test } from "node:test";
import assert from "node:assert/strict";
import {
  punycodeEncode,
  punycodeDecode,
  convertName,
  convertLabel,
} from "../../../../lib/domain/punycode.ts";
import { mapLabel, analyzeScripts, describeCharacters, UNICODE_VERSION } from "../../../../lib/domain/unicode.ts";

/** The sample strings from RFC 3492 section 7.1. If these drift, the codec is wrong. */
const RFC_VECTORS = [
  ["ليهمابتكلموشعربي؟", "egbpdaj6bu4bxfgehfvwxn"],
  ["他们为什么不说中文", "ihqwcrb4cv8a8dqg056pqjye"],
  ["Pročprostěnemluvíčesky", "Proprostnemluvesky-uyb24dma41a"],
  ["ひとつ屋根の下2", "2-u9tlzr9756bt3uc0v"],
  ["Hello-Another-Way-それぞれの場所", "Hello-Another-Way--fc4qua05auwb3674vfr0b"],
  ["MajiでKoiする5秒前", "MajiKoi5-783gue6qz075azm5e"],
  ["パフィーdeルンバ", "de-jg4avhby1noc0d"],
  ["そのスピードで", "d9juau41awczczp"],
];

test("encodes the RFC 3492 vectors", () => {
  for (const [unicode, expected] of RFC_VECTORS) assert.equal(punycodeEncode(unicode), expected, unicode);
});

test("decodes the RFC 3492 vectors", () => {
  for (const [unicode, encoded] of RFC_VECTORS) assert.equal(punycodeDecode(encoded), unicode, encoded);
});

test("converts real names in both directions", () => {
  assert.equal(convertName("münchen.de").ascii, "xn--mnchen-3ya.de");
  assert.equal(convertName("xn--mnchen-3ya.de").unicode, "münchen.de");
  assert.equal(convertName("日本.jp").ascii, "xn--wgv71a.jp");
  assert.equal(convertName("xn--wgv71a.jp").unicode, "日本.jp");
});

test("leaves plain ASCII names alone", () => {
  const result = convertName("example.com");
  assert.equal(result.ascii, "example.com");
  assert.equal(result.labels.some((label) => label.converted), false);
  assert.deepEqual(result.problems, []);
});

test("lowercases without changing meaning", () => {
  assert.equal(convertName("EXAMPLE.COM").ascii, "example.com");
});

test("reports malformed punycode instead of throwing", () => {
  const result = convertName("xn--!!!.com");
  assert.ok(result.problems.includes("invalid_punycode"));
});

test("validates what an A-label decodes to, not just that it decodes", () => {
  // "xn--abc" is perfectly canonical punycode: it re-encodes to itself. What it
  // encodes is three C1 control characters, which are disallowed in a domain
  // name. Decoding successfully is not the same as being a legitimate label, and
  // this is exactly the case a converter is used to examine.
  const decoded = convertLabel("xn--abc").unicode;
  assert.deepEqual(Array.from(decoded, (character) => character.codePointAt(0)), [130, 129, 128]);

  const result = convertName("xn--abc.com", mapLabel);
  assert.ok(
    result.problems.includes("disallowed_character"),
    `expected a disallowed character, got ${JSON.stringify(result.problems)}`,
  );
});

test("every label that decodes re-encodes to itself", () => {
  // A search over single character insertions into known good bodies found no
  // input that decodes cleanly and then re-encodes differently: the decoder's own
  // overflow and digit checks reject malformed sequences first. So the
  // canonicality check in convertLabel is a backstop rather than a common path,
  // and this test pins the property it depends on. If a future change to the
  // codec breaks bijectivity, this fails.
  const bodies = ["mnchen-3ya", "wgv71a", "pple-43d", "d9juau41awczczp", "egbpdaj6bu4bxfgehfvwxn"];
  for (const body of bodies) {
    assert.equal(punycodeEncode(punycodeDecode(body)), body, body);
  }
});

test("garbage in an A-label is rejected by the decoder", () => {
  for (const bad of ["xn--0.com", "xn---.com", "xn--zz.com"]) {
    assert.ok(convertName(bad, mapLabel).problems.length > 0, bad);
  }
});

test("a canonical A-label is not flagged", () => {
  assert.deepEqual(convertName("xn--mnchen-3ya.de").problems, []);
});

test("enforces the DNS length limits", () => {
  const longLabel = "a".repeat(64);
  assert.ok(convertName(`${longLabel}.com`).problems.includes("label_too_long"));
  const longName = Array.from({ length: 10 }, () => "a".repeat(50)).join(".");
  assert.ok(convertName(`${longName}.com`).problems.includes("name_too_long"));
});

test("rejects hyphen placement that DNS reserves", () => {
  assert.ok(convertName("-example.com").problems.includes("leading_hyphen"));
  assert.ok(convertName("example-.com").problems.includes("trailing_hyphen"));
  assert.ok(convertName("ab--cd.com").problems.includes("hyphen_third_fourth"));
});

test("flags an empty label", () => {
  assert.ok(convertName("a..com").problems.includes("empty_label"));
});

test("mixed script detection catches the classic homograph", () => {
  // Cyrillic а (U+0430) standing in for Latin a.
  const spoof = analyzeScripts("аpple");
  assert.equal(spoof.mixed, true);
  assert.equal(spoof.latinMixedWithOther, true);
  assert.deepEqual(spoof.scripts, ["Cyrillic", "Latin"]);
});

test("a single script name is not reported as mixed", () => {
  assert.equal(analyzeScripts("apple").mixed, false);
  assert.equal(analyzeScripts("пример").mixed, false, "an all Cyrillic name is perfectly normal");
  assert.equal(analyzeScripts("münchen").mixed, false);
});

test("digits and hyphens do not make a name look mixed", () => {
  assert.equal(analyzeScripts("shop-24").mixed, false);
});

test("character detail names the exact code point", () => {
  const [first] = describeCharacters("а");
  assert.equal(first.codePoint, "U+0430");
  assert.equal(first.script, "Cyrillic");
});

test("UTS-46 maps case and disallows what it should", () => {
  assert.equal(mapLabel("EXAMPLE").output, "example");
  assert.equal(mapLabel("example").disallowed, false);
  // Underscore is disallowed in a hostname under STD3 rules.
  assert.equal(mapLabel("bad_name").disallowed, true);
});

test("the Unicode version is pinned and reported", () => {
  assert.match(UNICODE_VERSION, /^\d+\.\d+\.\d+$/);
});

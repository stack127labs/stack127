import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateSummary } from "../../../scripts/self-host-apps/lib/summary-rules.mjs";

test("imported markup blocks publication rather than being displayed or silently stripped", () => {
  for (const text of ["A database[br]for documents.", "Run [b]tasks[/b] on a schedule.", "Run <strong>tasks</strong> on a schedule."]) {
    assert.ok(validateSummary(text).errors.some(e => /markup/.test(e)), text);
  }
});

test("obvious unfinished descriptions block publication", () => {
  for (const text of ["Stores documents and is.", "Configure the gateway when.", "Upload tracks to build a catalogue, this is the."]) {
    assert.ok(validateSummary(text).errors.some(e => /unfinished/.test(e)), text);
  }
  assert.equal(validateSummary("Stores documents in a database that applications can query over HTTP.").errors.length, 0);
  assert.equal(validateSummary("Searches documents to find the people and companies you look for.").errors.length, 0);
});

test("summary utilities cannot manufacture or truncate editorial copy", () => {
  const code = readFileSync("scripts/self-host-apps/lib/summary-rules.mjs", "utf8");
  assert.doesNotMatch(code, /export function (trimSentence|rewriteSummaryFromInputs)/);
});

test("repository refresh is not described as a general fact review", () => {
  const code = readFileSync("app/(site)/(directories)/self-host-apps/directory-app-browser.tsx", "utf8");
  assert.doesNotMatch(code, /\["facts checked"/);
  assert.match(code, /\["repository checked", formatDate\(app.github_checked_at\)/);
});

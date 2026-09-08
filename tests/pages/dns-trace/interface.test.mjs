import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { sentenceFragment } from "../../../app/(site)/(tools)/dns-trace/dns-trace-format.ts";

const root = process.cwd();
const source = readFileSync(path.join(root, "app/(site)/(tools)/dns-trace/dns-trace-tool.tsx"), "utf8");
const styles = readFileSync(path.join(root, "app/(site)/(tools)/dns-trace/dns-trace.module.css"), "utf8");

test("DNS trace uses the contracted shared controls and one ordered path", () => {
  for (const component of [
    "ToolTextField",
    "ToolChoiceGroup",
    "ToolButton",
    "ToolStatus",
    "ToolResultLead",
    "ToolKeyValueList",
    "ToolDataTable",
    "ToolRawOutput",
    "ToolCopyAction",
  ]) {
    assert.match(source, new RegExp(component), `${component} must remain in the DNS trace interface`);
  }

  assert.match(source, /<ol[^>]+aria-label="DNS trace path"/);
  assert.equal((source.match(/<ToolResultLead/g) ?? []).length, 1);
  assert.equal((source.match(/<ToolRawOutput/g) ?? []).length, 1);
  assert.doesNotMatch(source, /ToolTimeline|ToolProgressBar|ToolPrimaryResult|navigator\.clipboard|<details|finalRecords\.map/);
  assert.doesNotMatch(source, /className="dns-(?:tool|lookup-form|name-field|record-type-picker|submit|form-error)"/);
});

test("DNS trace styles use the site token set", () => {
  assert.doesNotMatch(styles, /--color-link-hover/);
});

test("stopping reasons keep acronyms intact inside the outcome sentence", () => {
  assert.equal(sentenceFragment("UDP timed out."), "UDP timed out");
  assert.equal(sentenceFragment("No delegated nameserver answered."), "no delegated nameserver answered");
});

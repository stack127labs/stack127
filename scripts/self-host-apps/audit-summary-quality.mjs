#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";

function inputRecords(input) {
  if (Array.isArray(input)) return input;
  return input.apps ?? input.records ?? [];
}

const checks = {
  hidden_or_markdown: /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00A0\u200B-\u200F\u202A-\u202E]|`|\*\*|\[[^\]]+\]\([^)]*\)|<\/?[a-z][^>]*>/i,
  html_entity: /&#(?:x[0-9a-f]+|[0-9]+);|&[a-z][a-z0-9]+;/i,
  url: /https?:\/\/|www\./i,
  instruction: /\b(?:see here|for examples|required in|click here|learn more|visit|how to run|quick setup|environment variables?\s*:|setup process|before installing|after installing|please)\b/i,
  source_or_setup_artifact: /\b(?:dockerfile|docker[- ]compose\.(?:ya?ml)|locustfile(?:\.py)?|(?:the\s+)?readme|(?:this|the)\s+repo(?:sitory)?|note\s*:|demo credentials|docker pull)\b|\/(?:mnt|app|config|data)\//i,
  dangling: /(?:,|;)\s*(?:and|or|the|a|an|your|when|which|that|it|this|for|to|with|from|of|like|via|because|including|such as|is|are|has|have|can|will|requires|provides|supports)\s*[.!?]*$/i,
  malformed_article: /\b(?:a|an)\s+(?:analytics|continuous|office|binary|application|mcp|captcha)\b|\ba,\s*[.!?]/i,
  semicolon: /;\s+/,
  likely_clause_splice: /,\s+(?:(?:This|It|For example|Note|When|Once|Please|But|If|After|Before|You|Most|Designed|Supports|Requires|Each|Use|Available|Also|There|Then|Upon|Inside|Outside|Attention)\b|[A-Z][A-Za-z0-9+.-]*\s+(?:is|are|was|were|has|have|can|will|allows|provides|supports|includes|uses|works|runs|requires|designed|built|created|offers|lets|helps|contains|exposes|connects|controls|monitors|tracks|manages|generates|hosts)\b)/,
};

async function readInput(args) {
  if (args.file) return inputRecords(JSON.parse(await readFile(args.file, "utf8")));
  return withClient(async (client) => {
    const result = await client.query(`
      select slug, summary
      from public.self_host_apps
      where published = true
        and self_hosting_status = 'self_hostable'
      order by slug
    `);
    return result.rows;
  }, args["database-url"]);
}

async function main() {
  const args = parseArgs();
  const rows = await readInput(args);
  const counts = Object.fromEntries(Object.keys(checks).map((key) => [key, 0]));
  const issues = [];
  const ruleExamples = [];
  let ruleIssueRows = 0;

  for (const row of rows) {
    const summary = String(row.summary ?? "");
    const ruleResult = validateSummary(summary);
    if (ruleResult.errors.length || ruleResult.warnings.length) {
      ruleIssueRows += 1;
      if (ruleExamples.length < 40) ruleExamples.push({ slug: row.slug, ...ruleResult, summary });
    }
    for (const [key, pattern] of Object.entries(checks)) {
      if (!pattern.test(summary)) continue;
      counts[key] += 1;
      issues.push({ slug: row.slug, check: key, summary });
    }
  }

  console.log(JSON.stringify({ rows: rows.length, ruleIssueRows, counts, ruleExamples, issueExamples: issues.slice(0, 40) }, null, 2));
  if (Object.values(counts).some((count) => count > 0) || ruleIssueRows > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});

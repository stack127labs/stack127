import { appendFileSync } from "node:fs";

function cell(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\|/g, "&#124;");
}

export function jobSummary(title, counts, failures = []) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const lines = [`## ${cell(title)}`, "", ...Object.entries(counts).map(([name, count]) => `- ${cell(name)}: ${cell(count)}`)];
  if (failures.length) {
    lines.push("", "| Record | Failure |", "| --- | --- |", ...failures.map((failure) => `| ${cell(failure.repository ?? failure.slug)} | ${cell(failure.error)} |`));
  }
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n\n`);
}

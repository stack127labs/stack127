import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// Detailed evidence belongs in artifacts. Console summaries have a fixed size,
// even when an upstream error contains a complete response body.
export function boundedSummary(value, reportPath) {
  function compact(item, depth = 0) {
    if (typeof item === 'string') return item.replace(/[\r\n]+/g, ' ').slice(0, 300);
    if (!item || typeof item !== 'object') return item;
    if (depth >= 3) return '[details in report]';
    if (Array.isArray(item)) return item.slice(0, 5).map(entry => compact(entry, depth + 1));
    return Object.fromEntries(Object.entries(item).slice(0, 30).map(([key, entry]) => [key.slice(0, 80), compact(entry, depth + 1)]));
  }
  const text = JSON.stringify({ ...compact(value), report_path: reportPath ? String(reportPath).slice(0, 500) : null }, null, 2);
  return text.length <= 12000 ? text : `${text.slice(0, 11500)}\n[summary capped; see report file]`;
}

export function reportOutput(report, out, summary) {
  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(`${out}.tmp`, `${JSON.stringify(report, null, 2)}\n`);
    renameSync(`${out}.tmp`, out);
  }
  console.log(boundedSummary(summary, out));
}

export function technicalReportOutput(report, out) {
  reportOutput(report, out, {
    selected: report.selected, passed: report.passed, failed_count: report.failed_count,
    facts: report.facts, failures: report.failed.map(({ slug, error }) => ({ slug, error })),
  });
}

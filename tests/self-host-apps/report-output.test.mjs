import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { boundedSummary, technicalReportOutput } from '../../scripts/self-host-apps/lib/report-output.mjs';

test('technical output retains full evidence on disk and prints bounded counts and failure reasons', t => {
  const dir = mkdtempSync(join(tmpdir(), 'technical-summary-'));
  t.after(() => rmSync(dir, { force: true, recursive: true }));
  const report = {
    selected: 5000, passed: 4000, failed_count: 1000, facts: { dockerSupport: 3000 },
    failed: Array.from({ length: 1000 }, (_, i) => ({ slug: `failed-${i}`, error: 'HTTP 503 '.repeat(100), sources: [{ url: 'https://example.invalid', error: 'large'.repeat(1000) }] })),
    records: Array.from({ length: 4000 }, (_, i) => ({ slug: `app-${i}`, evidence: 'evidence'.repeat(100) })),
  };
  const lines = [];
  t.mock.method(console, 'log', line => lines.push(line));
  const out = join(dir, 'reports', 'technical.json');
  technicalReportOutput(report, out);
  assert.ok(readFileSync(out).length > 4000000);
  assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), report);
  const summary = JSON.parse(lines.join(''));
  assert.equal(summary.selected, 5000);
  assert.equal(summary.failed_count, 1000);
  assert.equal(summary.report_path, out);
  assert.equal(summary.failures.length, 5);
  assert.match(summary.failures[0].error, /HTTP 503/);
  assert.ok(Buffer.byteLength(lines.join('')) < 12000);
  assert.doesNotMatch(lines.join(''), /app-3999|failed-999/);
});

test('QA and install summaries cap arbitrary strings and nested lists', () => {
  const text = boundedSummary({ blocked_rows: Array(5000).fill({ slug: 'x'.repeat(100000), blockers: Array(1000).fill('reason') }), sample: Array(5000).fill('url'.repeat(10000)) });
  assert.ok(Buffer.byteLength(text) < 12000);
});

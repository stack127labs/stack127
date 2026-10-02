import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { check } from '../../scripts/stack127/agents/lane-guard.mjs';
import { createWorkerApproval, readWorkerApproval, workerEnvironment } from '../../scripts/stack127/agents/worker-approval.mjs';
import { grokDenyRules, runWorker } from '../../scripts/stack127/agents/worker-process.mjs';

const root = fs.realpathSync(fileURLToPath(new URL('../../', import.meta.url)));
const sha = 'a'.repeat(40);
const now = Date.now();
const bash = command => ({ session_id: 'worker-approval-test', tool_name: 'Bash', tool_input: { command } });
function fixture(t, lane, scope = {}) {
  const runDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stack127-worker-approval-'));
  t.after(() => fs.rmSync(runDir, { recursive: true, force: true }));
  const approval = createWorkerApproval({ root, lane, runDir, task: 'Release the reviewed tool', now, ...scope }, {});
  const workerEnv = workerEnvironment({}, lane, approval);
  return { approval, workerEnv, options: { lane, delegated: true, now, workerEnv, revision: () => sha } };
}

test('workers can read agent scripts and apply guarded development tool updates', () => {
  const allowed = [
    'cat scripts/stack127/agents/delegate.mjs',
    "rg 'create|remove' scripts/stack127/agents/task-exception.mjs",
    'git diff -- scripts/stack127/agents/delegate.mjs',
    'node scripts/stack127/tool-pages/update-content.mjs --slug fixture --apply',
    'node scripts/stack127/tool-pages/update-catalogs.mjs --environment development --apply',
    'node scripts/stack127/tool-pages/update-version.mjs --environment=development --apply',
    'npm run stack127:tool-page:content:update -- --environment development --apply',
    'npm run stack127:tool-page:catalogs:update -- --apply',
    'npm run stack127:tool-page:version:update -- --apply',
    'npm run stack127:tool-page:repo:sync -- --apply',
    'npm run stack127:deploy:preflight',
    'npm run quality',
    'codex exec --help',
    'codex exec -h',
    'claude --version',
    'node --check scripts/stack127/agents/delegate.mjs',
    'node --check scripts/stack127/agents/task-exception.mjs',
  ];
  const rejected = [
    'node scripts/stack127/tool-pages/update-content.mjs --environment production --apply',
    'node scripts/stack127/tool-pages/update-content.mjs --environment=production --apply',
    'node scripts/stack127/tool-pages/update-content.mjs --environment development --environment production --apply',
    'node scripts/stack127/tool-pages/update-content.mjs --confirm stack127-production --apply',
    'node scripts/stack127/tool-pages/update-content.mjs --database-url example --apply',
    'node scripts/unknown.mjs --environment development --apply',
    'cd /tmp && node scripts/stack127/tool-pages/update-content.mjs --apply',
    'npm --prefix /tmp run stack127:tool-page:content:update -- --apply',
    'npm run stack127:tool-page:content:update -- --apply && git push origin main',
    'node scripts/stack127/agents/delegate.mjs sol task',
    'node scripts/stack127/agents/delegate.mjs --check',
    'claude -p task',
    'codex exec task',
    'node scripts/stack127/agents/task-exception.mjs renew',
  ];
  for (const lane of ['opus', 'sol', 'luna']) {
    const options = { lane, delegated: true, workerEnv: {} };
    for (const command of allowed) assert.equal(check(bash(command), options), null, `${lane}: ${command}`);
    for (const command of rejected) assert.ok(check(bash(command), options), `${lane}: ${command}`);
    assert.equal(check({ tool_name: 'Read', tool_input: { path: 'AGENTS.md', content: '*** Update File: app/ui/callout.tsx' } }, options), null);
  }
});

test('release approval permits only the reviewed revision and origin/main', t => {
  for (const lane of ['opus', 'sol', 'luna']) {
    const { options } = fixture(t, lane, { releaseSha: sha });
    for (const command of ['git push origin main', 'git push origin HEAD:main', `git push origin ${sha}:main`, 'node scripts/stack127/deployment/dokploy-release.mjs release', `gh workflow run stack127-release-e2e.yml -f commit_sha=${sha}`]) {
      assert.equal(check(bash(command), options), null, command);
      assert.ok(check(bash(command), { ...options, revision: () => 'b'.repeat(40) }), command);
    }
    for (const command of ['git push --force origin main', 'git push other main', 'git push origin other', 'git push origin HEAD:other', 'git push origin main --tags', 'gh workflow run stack127-release-e2e.yml', 'supabase db push', 'node scripts/stack127/tool-pages/update-content.mjs --environment production --apply']) assert.ok(check(bash(command), options), command);
    assert.ok(check(bash('git push origin main'), { ...options, revision: (_directory, ref) => ref === 'refs/heads/main' ? 'b'.repeat(40) : sha }));
  }
});

test('production data approval is separate from release and cannot expand lane access', t => {
  for (const lane of ['opus', 'sol', 'luna']) {
    const { options, approval } = fixture(t, lane, { productionData: true });
    assert.equal(check(bash('supabase db push'), options), null);
    assert.equal(check(bash('node scripts/stack127/tool-pages/update-content.mjs --environment production --confirm stack127-production --apply'), options), null);
    assert.ok(check(bash('git push origin main'), options));
    assert.ok(check(bash('npm run stack127:deploy'), options));
    for (const command of ['node scripts/stack127/agents/task-exception.mjs create', 'node scripts/stack127/agents/task-exception.mjs extend', 'node scripts/stack127/agents/task-exception.mjs renew', 'node scripts/stack127/agents/task-exception.mjs remove', 'node scripts/stack127/agents/delegate.mjs sol task']) assert.ok(check(bash(command), options));
    assert.ok(check({ tool_name: 'Write', tool_input: { file_path: approval.file } }, options));
    const otherLaneFile = lane === 'opus' ? 'lib/dns/lookup.ts' : 'app/ui/callout.tsx';
    assert.match(check({ tool_name: 'Edit', tool_input: { file_path: otherLaneFile } }, options), /belongs to/);
  }
});

test('worker approval rejects wrong identities, expired grants, and inherited approval', t => {
  const { approval, workerEnv, options } = fixture(t, 'sol', { releaseSha: sha });
  assert.throws(() => createWorkerApproval({ root, lane: 'sol' }, { STACK127_DELEGATED: '1' }), /Only the coordinator/);
  assert.throws(() => createWorkerApproval({ root, lane: 'sol', task: 'release', releaseSha: 'short' }, {}), /full reviewed commit/);
  assert.ok(readWorkerApproval({ root, env: workerEnv, now }));
  for (const env of [{ ...workerEnv, STACK127_WORKER_RUN_ID: 'another-run' }, { ...workerEnv, STACK127_LANE: 'opus' }, workerEnvironment(workerEnv, 'sol', null)]) assert.equal(readWorkerApproval({ root, env, now }), null);
  assert.equal(readWorkerApproval({ root: os.tmpdir(), env: workerEnv, now }), null);
  assert.ok(check(bash('git push origin main'), { ...options, now: Date.parse(approval.expiresAt) }));
  const childEnv = workerEnvironment({ ...workerEnv, CODEX_THREAD_ID: 'parent', CLAUDE_SESSION_ID: 'parent' }, 'sol', null);
  assert.equal(childEnv.CODEX_THREAD_ID, undefined);
  assert.equal(childEnv.CLAUDE_SESSION_ID, undefined);
  assert.equal(childEnv.STACK127_LANE_GUARD, 'on');
  assert.equal(childEnv.STACK127_DELEGATED, '1');
});

test('actual Claude and Codex hooks allow reads and enforce coordinator approval', t => {
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  assert.equal(head.status, 0, head.stderr);
  const releaseSha = head.stdout.trim();
  for (const lane of ['opus', 'sol', 'luna']) {
    const { workerEnv, approval } = fixture(t, lane, { releaseSha });
    const env = { ...process.env, ...workerEnv, CODEX_THREAD_ID: '', CLAUDE_SESSION_ID: '' };
    for (const [command, approved, expected] of [['cat scripts/stack127/agents/delegate.mjs', false, 0], ['npm run stack127:tool-page:content:update -- --apply', false, 0], ['git push origin HEAD:main', false, 2], ['git push origin HEAD:main', true, 0], ['git push --force origin main', true, 2]]) {
      const run = spawnSync(process.execPath, [path.join(root, 'scripts/stack127/agents/lane-guard.mjs'), lane === 'opus' ? 'claude' : 'codex'], { input: JSON.stringify(bash(command)), env: { ...env, STACK127_WORKER_APPROVAL: approved ? approval.file : '', STACK127_WORKER_RUN_ID: approved ? approval.id : '' }, encoding: 'utf8', timeout: 10000 });
      assert.equal(run.status, expected, `${lane}: ${command}\n${run.stderr}`);
    }
  }
});

test('Grok rules leave reads, preflight, and development available and honor approval scope', () => {
  const files = ['app/ui/callout.tsx', 'lib/dns/lookup.ts'];
  const ordinary = grokDenyRules('sol', files);
  const approved = grokDenyRules('sol', files, { releaseSha: sha, productionData: true });
  assert.ok(ordinary.includes('Bash(git *push*)'));
  assert.ok(ordinary.includes('Bash(supabase db push*)'));
  assert.ok(!ordinary.includes('Bash(*--apply*)'));
  assert.ok(!ordinary.includes('Bash(*delegate.mjs*)'));
  assert.ok(!approved.includes('Bash(git *push*)'));
  assert.ok(!approved.includes('Bash(supabase db push*)'));
  for (const rules of [ordinary, approved]) {
    assert.ok(rules.includes('Edit(app/ui/callout.tsx)'));
    assert.ok(rules.includes('Bash(node *scripts/stack127/agents/delegate.mjs *)'));
    assert.ok(!rules.includes('Bash(*stack127:deploy*)'));
  }
});

test('approved Codex tasks request automatic sandbox review without disabling protections', t => {
  for (const scope of [{}, { releaseSha: sha }, { productionData: true }]) {
    const { approval, workerEnv } = fixture(t, 'sol', scope);
    for (const resume of [false, true]) {
      let args;
      runWorker({ lane: 'sol', model: 'fixture-model', effort: 'high', repoRoot: root, session: 'fixture-session', resultPath: '/tmp/fixture-result.md', env: workerEnv, prompt: 'fixture task', approval, resume }, (_command, value) => { args = value; return { status: 0 }; });
      assert.equal(args.includes('--approve-for-me'), Boolean(approval));
      if (resume && approval) assert.ok(args.indexOf('--approve-for-me') < args.indexOf('resume'));
      assert.ok(args.includes('sandbox_mode="workspace-write"'));
      assert.ok(!args.includes('--dangerously-bypass-approvals-and-sandbox'));
      assert.ok(!args.includes('--dangerously-bypass-hook-trust'));
      assert.equal(workerEnv.STACK127_LANE_GUARD, 'on');
    }
  }
});

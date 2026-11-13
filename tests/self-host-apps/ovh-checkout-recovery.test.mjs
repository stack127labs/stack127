import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const runner = fileURLToPath(new URL('../../scripts/self-host-apps/ovh/run-job.sh', import.meta.url));
const dueSource = readFileSync(new URL('../../scripts/self-host-apps/ovh/due.mjs', import.meta.url), 'utf8');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;

function fixture(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'selfhost-recovery-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const origin = path.join(dir, 'origin');
  const checkout = path.join(dir, 'checkout');
  const root = path.join(dir, 'state');
  mkdirSync(origin);
  mkdirSync(path.join(root, 'state'), { recursive: true });
  git(origin, 'init', '-b', 'main');
  git(origin, 'config', 'user.name', 'Fixture');
  git(origin, 'config', 'user.email', 'fixture@example.invalid');
  writeFileSync(path.join(origin, 'tracked.txt'), 'original\n');
  writeFileSync(path.join(origin, '.gitattributes'), 'new.txt filter=interrupt\n');
  const ovh = path.join(origin, 'scripts/self-host-apps/ovh');
  mkdirSync(ovh, { recursive: true });
  writeFileSync(path.join(ovh, 'due.mjs'), 'broken old due module !!!\n');
  git(origin, 'add', '.');
  git(origin, 'commit', '-m', 'initial');
  git(dir, 'clone', origin, checkout);
  const base = git(checkout, 'rev-parse', 'HEAD');
  writeFileSync(path.join(origin, 'tracked.txt'), 'updated\n');
  writeFileSync(path.join(origin, 'a-new.txt'), 'created before interrupt\n');
  writeFileSync(path.join(origin, 'new.txt'), 'new file\n');
  writeFileSync(path.join(ovh, 'due.mjs'), dueSource);
  git(origin, 'add', '.');
  git(origin, 'commit', '-m', 'update');
  const target = git(origin, 'rev-parse', 'HEAD');
  // Source the real functions, using only scratch paths. Linux also exercises
  // the same shared OS lock; macOS has no flock in its base system.
  const script = `source "$RUNNER_FIXTURE"; root=$ROOT_FIXTURE; checkout=$CHECKOUT_FIXTURE; cd "$checkout"; if command -v flock >/dev/null; then exec 8>"$root/checkout.lock"; flock 8; fi; `;
  function run(command = 'update_checkout') {
    return execFileSync('/bin/bash', ['-c', script + command], {
      env: { ...process.env, RUNNER_FIXTURE: runner, ROOT_FIXTURE: root, CHECKOUT_FIXTURE: checkout },
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30_000,
    });
  }
  function assertRecovered() {
    assert.equal(git(checkout, 'rev-parse', 'HEAD'), target);
    assert.equal(git(checkout, 'status', '--porcelain'), '');
    assert.equal(readFileSync(path.join(checkout, 'tracked.txt'), 'utf8'), 'updated\n');
    assert.equal(readFileSync(path.join(checkout, 'a-new.txt'), 'utf8'), 'created before interrupt\n');
    assert.equal(existsSync(path.join(root, 'update-in-progress')), false);
    assert.equal(existsSync(path.join(checkout, '.git/index.lock')), false);
  }
  return { dir, origin, checkout, root, base, target, run, assertRecovered };
}

test('SIGKILL during a real fast-forward recovers a new untracked file, index lock and half-written tracked file', async t => {
  const f = fixture(t);
  git(f.checkout, 'fetch', 'origin', 'main');
  const ready = path.join(f.dir, 'merge-in-progress');
  // Git takes index.lock before invoking this smudge filter. Stop inside that
  // real merge, leaving a corrupt tracked file as well as Git's index lock.
  git(f.checkout, 'config', 'filter.interrupt.smudge', `printf half-written > ${quote(path.join(f.checkout, 'tracked.txt'))}; touch ${quote(ready)}; sleep 30; cat`);
  // Run the actual updater too: it must record the target before Git writes.
  const merge = spawn('/bin/bash', ['-c', `source ${quote(runner)}; root=${quote(f.root)}; cd ${quote(f.checkout)}; update_checkout`], {
    cwd: f.checkout, detached: true, stdio: 'ignore',
  });
  const exited = once(merge, 'exit');
  t.after(() => { try { process.kill(-merge.pid, 'SIGKILL'); } catch {} });
  const deadline = Date.now() + 10_000;
  while (!existsSync(ready)) {
    if (Date.now() > deadline) throw new Error('Merge did not reach the interrupt point');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(readFileSync(path.join(f.root, 'update-in-progress'), 'utf8'), `${f.base} ${f.target}\n`);
  assert.equal(readFileSync(path.join(f.checkout, 'a-new.txt'), 'utf8'), 'created before interrupt\n');
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(existsSync(path.join(f.checkout, '.git/index.lock')), true);
  assert.throws(() => f.run(), error => /Git is still running/.test(error.stdout));
  assert.equal(existsSync(path.join(f.checkout, '.git/index.lock')), true);
  process.kill(-merge.pid, 'SIGKILL');
  assert.equal((await exited)[1], 'SIGKILL');
  assert.equal(readFileSync(path.join(f.checkout, 'tracked.txt'), 'utf8'), 'half-written');
  assert.match(git(f.checkout, 'ls-files', '--others', '--exclude-standard'), /^a-new\.txt$/m);
  git(f.checkout, 'config', '--unset', 'filter.interrupt.smudge');
  const output = f.run();
  assert.match(output, /RECOVERY: interrupted checkout update/);
  assert.match(output, /removing stale Git lock index.lock/);
  assert.match(output, /tracked.txt/);
  f.assertRecovered();
  assert.doesNotMatch(f.run(), /RECOVERY/);
  f.assertRecovered();
});

test('a stale legacy index lock without a journal also recovers tracked files', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.checkout, '.git/index.lock'), '');
  writeFileSync(path.join(f.checkout, 'tracked.txt'), 'half-written');
  assert.match(f.run(), /RECOVERY/);
  f.assertRecovered();
});

test('an interrupted reset with a journal but no lock retries safely', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.root, 'update-in-progress'), `${f.base}\n`);
  writeFileSync(path.join(f.checkout, 'tracked.txt'), 'half-written');
  assert.match(f.run(), /RECOVERY/);
  f.assertRecovered();
});

test('ordinary human edits and unpublished history fail without being discarded', t => {
  const f = fixture(t);
  const tracked = path.join(f.checkout, 'tracked.txt');
  writeFileSync(tracked, 'human edit');
  assert.throws(() => f.run(), error => /refusing to reset local edits/.test(error.stdout));
  assert.equal(readFileSync(tracked, 'utf8'), 'human edit');
  git(f.checkout, 'config', 'user.name', 'Fixture');
  git(f.checkout, 'config', 'user.email', 'fixture@example.invalid');
  git(f.checkout, 'add', '.');
  git(f.checkout, 'commit', '-m', 'unpublished');
  const head = git(f.checkout, 'rev-parse', 'HEAD');
  assert.throws(() => f.run(), error => /ahead of or diverged/.test(error.stdout));
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), head);
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
});

test('recovery keeps its journal while unrelated untracked files still block a clean checkout', t => {
  const f = fixture(t);
  git(f.checkout, 'fetch', 'origin', 'main');
  const journal = path.join(f.root, 'update-in-progress');
  writeFileSync(journal, `${f.base} ${f.target}\n`);
  const local = path.join(f.checkout, 'operator-notes.txt');
  writeFileSync(local, 'keep this file');
  assert.throws(() => f.run(), error => /journal retained/.test(error.stdout));
  assert.equal(existsSync(journal), true);
  assert.equal(readFileSync(local, 'utf8'), 'keep this file');
  rmSync(local);
  assert.match(f.run(), /RECOVERY/);
  f.assertRecovered();
});

test('execution repairs a broken due module before checking its success marker', { skip: process.platform !== 'linux' && 'execute requires Linux flock' }, t => {
  const f = fixture(t);
  const job = 'self-host-refresh-github';
  const marker = path.join(f.root, 'state', `${job}.success`);
  const last = String(Date.now() + 86_400_000);
  writeFileSync(marker, last);
  // No env or dependencies are present: a not-due check must not use either.
  const output = f.run(`job=${job}; minutes=20; due=1; validation=0; catchup_child=0; execute`);
  assert.doesNotMatch(output, /start self-host|end self-host/);
  assert.equal(readFileSync(marker, 'utf8'), last);
  f.assertRecovered();
});

// Opt in only on a Linux host with a working systemd user manager. All commands,
// credentials, dependencies, locks and logs here belong to the temporary fixture.
test('installed supervisor logs checkout wrapper syntax failures, then fetches a repair', {
  skip: process.platform !== 'linux' || !process.env.SELFHOST_TEST_SCOPE ? 'requires opt-in Linux systemd user scope' : false,
}, t => {
  const f = fixture(t);
  const job = 'self-host-refresh-github';
  const logs = path.join(f.dir, 'logs');
  const scriptPath = path.join(f.origin, 'scripts/self-host-apps/ovh/run-job.sh');
  const installed = path.join(f.dir, 'installed-run-job.sh');
  const envFile = `${f.root}.env`;
  const validator = readFileSync(new URL('../../scripts/self-host-apps/ovh/validate-env.mjs', import.meta.url), 'utf8');
  writeFileSync(path.join(f.origin, 'scripts/self-host-apps/ovh/validate-env.mjs'), validator);
  const lockfile = '{"lockfileVersion":3}\n';
  writeFileSync(path.join(f.origin, 'package-lock.json'), lockfile);
  writeFileSync(scriptPath, '#!/bin/bash\nif (\n');
  git(f.origin, 'add', '.');
  git(f.origin, 'commit', '-m', 'broken job wrapper fixture');
  writeFileSync(installed, readFileSync(runner, 'utf8')
    .replaceAll('/srv/stack127-data/self-host-apps', f.root)
    .replaceAll('/srv/stack127-self-host', f.checkout)
    .replaceAll('/srv/stack127-data/logs', logs));
  // Public dummy connection syntax passes preflight; no process connects to it.
  writeFileSync(envFile, 'DATABASE_URL=postgresql://stack127_app@127.0.0.1:5432/postgres?sslmode=disable\nGITHUB_TOKEN=fixture-only\n', { mode: 0o600 });
  mkdirSync(path.join(f.checkout, 'node_modules'));
  writeFileSync(path.join(f.root, 'dependencies.sha256'), `${createHash('sha256').update(lockfile).digest('hex')}\n`);
  const run = () => execFileSync('/bin/bash', [installed, job, '--due'], { encoding: 'utf8', timeout: 30_000, stdio: ['ignore', 'pipe', 'pipe'] });
  assert.throws(run, error => error.status === 2);
  const logFile = path.join(logs, `${job}.log`);
  let log = readFileSync(logFile, 'utf8');
  assert.match(log, new RegExp(`== .* start ${job}`));
  assert.match(log, /syntax error/);
  assert.match(log, new RegExp(`== .* end ${job} exit 2`));
  const success = path.join(f.root, 'state', `${job}.success`);
  assert.equal(existsSync(success), false);
  // Only this harmless fixture wrapper is ever run; production job steps cannot
  // execute. The original installed supervisor remains unchanged for the repair.
  writeFileSync(scriptPath, '#!/bin/bash\necho fixture-only-job\n');
  git(f.origin, 'add', '.');
  git(f.origin, 'commit', '-m', 'repair job wrapper fixture');
  run();
  log = readFileSync(logFile, 'utf8');
  assert.match(log, /fixture-only-job/);
  assert.match(log, new RegExp(`== .* end ${job} exit 0`));
  assert.equal(existsSync(success), true);
  const last = readFileSync(success, 'utf8');
  run();
  assert.equal(readFileSync(success, 'utf8'), last);
  assert.equal(readFileSync(logFile, 'utf8'), log);
  log = readFileSync(logFile, 'utf8');
  assert.equal((log.match(/fixture-only-job/g) || []).length, 1);
  // Even an argument failure before starting the resource scope must be logged.
  assert.throws(() => execFileSync('/bin/bash', [installed, job, '--bad-argument'], { stdio: 'pipe' }), error => error.status === 2);
  log = readFileSync(logFile, 'utf8');
  assert.match(log, /Unknown argument: --bad-argument/);
  assert.match(log.trim().split('\n').at(-1), new RegExp(`end ${job} exit 2$`));
});

const scopeOptions = {
  skip: process.platform !== 'linux' || !process.env.SELFHOST_TEST_SCOPE ? 'requires opt-in Linux systemd user scope' : false,
};
const jobs = ['discovery-github', 'refresh-github', 'discovery-lists', 'discovery-catalogs', 'discovery-directories', 'refresh-source-hosts', 'refresh-technical'].map(suffix => `self-host-${suffix}`);

function supervisorFixture(t, steps = 'echo "fixture-only-job $job"') {
  const f = fixture(t);
  const logs = path.join(f.dir, 'logs');
  const scriptPath = path.join(f.origin, 'scripts/self-host-apps/ovh/run-job.sh');
  const installed = path.join(f.dir, 'installed-run-job.sh');
  // Replace all real data steps before copying anywhere. Only scratch repositories,
  // dummy env syntax and harmless shell steps are used, including in --steps.
  const source = readFileSync(runner, 'utf8')
    .replace(/steps\(\) \{[\s\S]*?\n\}/, `steps() {\n  ${steps}\n}`)
    .replaceAll('/srv/stack127-data/self-host-apps', f.root)
    .replaceAll('/srv/stack127-self-host', f.checkout)
    .replaceAll('/srv/stack127-data/logs', logs);
  writeFileSync(installed, source);
  writeFileSync(scriptPath, source);
  writeFileSync(path.join(f.origin, 'scripts/self-host-apps/ovh/validate-env.mjs'), readFileSync(new URL('../../scripts/self-host-apps/ovh/validate-env.mjs', import.meta.url)));
  const lockfile = '{"lockfileVersion":3}\n';
  writeFileSync(path.join(f.origin, 'package-lock.json'), lockfile);
  git(f.origin, 'add', '.');
  git(f.origin, 'commit', '-m', 'safe supervisor fixture');
  writeFileSync(`${f.root}.env`, 'DATABASE_URL=postgresql://stack127_app@127.0.0.1:5432/postgres?sslmode=disable\nGITHUB_TOKEN=fixture-only\n', { mode: 0o600 });
  mkdirSync(path.join(f.checkout, 'node_modules'));
  writeFileSync(path.join(f.root, 'dependencies.sha256'), `${createHash('sha256').update(lockfile).digest('hex')}\n`);
  const run = (job = 'self-host-catch-up', args = []) => execFileSync('/bin/bash', [installed, job, ...args], {
    encoding: 'utf8', timeout: 45_000, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const log = job => {
    try { return readFileSync(path.join(logs, `${job}.log`), 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; return ''; }
  };
  const commit = message => { git(f.origin, 'add', '.'); git(f.origin, 'commit', '-m', message); };
  return { ...f, installed, scriptPath, source, run, log, commit };
}

test('catch-up runs missed data periods once; later catch-up and nominal checks leave data logs unchanged', scopeOptions, t => {
  const f = supervisorFixture(t);
  f.run();
  const snapshots = jobs.map(job => {
    const log = f.log(job);
    assert.equal((log.match(new RegExp(`start ${job}`, 'g')) || []).length, 1);
    assert.match(log, new RegExp(`end ${job} exit 0`));
    assert.match(log, /fixture-only-job/);
    return [job, log, readFileSync(path.join(f.root, 'state', `${job}.success`), 'utf8')];
  });
  f.run();
  for (const [job, log, success] of snapshots) {
    f.run(job, ['--due']);
    assert.equal(f.log(job), log);
    assert.equal(readFileSync(path.join(f.root, 'state', `${job}.success`), 'utf8'), success);
  }
  const log = f.log('self-host-catch-up');
  assert.equal((log.match(/start self-host-catch-up/g) || []).length, 2);
  assert.equal((log.match(/end self-host-catch-up exit 0/g) || []).length, 2);
});

test('catch-up fetches before reporting supervisor drift; data jobs continue and reinstall restores catch-up', scopeOptions, t => {
  const f = supervisorFixture(t);
  writeFileSync(f.scriptPath, `${f.source}\n# reviewed supervisor update\n`);
  f.commit('supervisor drift fixture');
  assert.throws(() => f.run(), error => error.status === 1);
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), git(f.origin, 'rev-parse', 'HEAD'));
  assert.match(f.log('self-host-catch-up'), /ERROR: installed self-host supervisor differs.*reviewed atomic reinstall/);
  assert.match(f.log('self-host-catch-up'), /end self-host-catch-up exit 1/);
  for (const job of jobs) assert.equal(f.log(job), '');
  f.run(jobs[0], ['--due']);
  assert.match(f.log(jobs[0]), /end self-host-discovery-github exit 0/);
  // Only the fixture is reinstalled; no /srv path is accessed.
  writeFileSync(f.installed, readFileSync(f.scriptPath));
  f.run();
  assert.match(f.log('self-host-catch-up').trim().split('\n').at(-1), /end self-host-catch-up exit 0/);
});

test('checkout failures stay visible for both nominal and catch-up runs, even with a completed period', scopeOptions, t => {
  const f = supervisorFixture(t);
  const job = jobs[0];
  writeFileSync(path.join(f.root, 'state', `${job}.success`), String(Date.now() + 86_400_000));
  git(f.checkout, 'remote', 'set-url', 'origin', path.join(f.dir, 'missing-origin'));
  assert.throws(() => f.run(job, ['--due']), error => error.status !== 0);
  assert.match(f.log(job), new RegExp(`start ${job}`));
  assert.match(f.log(job), /Could not read from remote repository/);
  assert.match(f.log(job), new RegExp(`end ${job} exit [1-9]`));
  assert.throws(() => f.run(), error => error.status !== 0);
  assert.match(f.log('self-host-catch-up'), /Could not read from remote repository/);
  assert.match(f.log('self-host-catch-up'), /end self-host-catch-up exit [1-9]/);
  git(f.checkout, 'remote', 'set-url', 'origin', f.origin);
  const log = f.log(job);
  f.run();
  assert.equal(f.log(job), log);
  assert.match(f.log('self-host-catch-up').trim().split('\n').at(-1), /end self-host-catch-up exit 0/);
});

test('one failed data job fails catch-up but the remaining due jobs still run', scopeOptions, t => {
  const f = supervisorFixture(t, 'echo "fixture-only-job $job"; if [[ "$job" = self-host-discovery-github ]]; then return 9; fi');
  assert.throws(() => f.run(), error => error.status === 1);
  assert.match(f.log(jobs[0]), /end self-host-discovery-github exit 9/);
  assert.equal(existsSync(path.join(f.root, 'state', `${jobs[0]}.success`)), false);
  for (const job of jobs.slice(1)) assert.match(f.log(job), new RegExp(`end ${job} exit 0`));
  assert.match(f.log('self-host-catch-up'), /ERROR: catch-up self-host-discovery-github failed \(exit 9\)/);
  assert.match(f.log('self-host-catch-up'), /end self-host-catch-up exit 1/);
});

test('busy catch-up lock skips at once with its own identity and no fake data runs', scopeOptions, async t => {
  const f = supervisorFixture(t);
  const ready = path.join(f.dir, 'catch-up-locked');
  const holder = spawn('/bin/bash', ['-c', `exec 7>${quote(path.join(f.root, 'self-host-catch-up.lock'))}; flock 7; touch ${quote(ready)}; sleep 30`], {
    detached: true, stdio: 'ignore',
  });
  const exited = once(holder, 'exit');
  t.after(() => { try { process.kill(-holder.pid, 'SIGKILL'); } catch {} });
  const deadline = Date.now() + 10_000;
  while (!existsSync(ready)) {
    if (Date.now() > deadline) throw new Error('Lock fixture did not become ready');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.throws(() => f.run(), error => error.status === 76);
  assert.doesNotMatch(f.log('self-host-catch-up'), /start self-host|end self-host/);
  for (const job of jobs) assert.equal(f.log(job), '');
  process.kill(-holder.pid, 'SIGKILL');
  await exited;
  f.run();
  assert.match(f.log('self-host-catch-up').trim().split('\n').at(-1), /end self-host-catch-up exit 0/);
});

test('catch-up gives up a busy shared checkout after 30 seconds and recovers on the next run', scopeOptions, async t => {
  const f = supervisorFixture(t);
  const ready = path.join(f.dir, 'checkout-locked');
  const holder = spawn('/bin/bash', ['-c', `exec 8>${quote(path.join(f.root, 'checkout.lock'))}; flock 8; touch ${quote(ready)}; sleep 60`], {
    detached: true, stdio: 'ignore',
  });
  const exited = once(holder, 'exit');
  t.after(() => { try { process.kill(-holder.pid, 'SIGKILL'); } catch {} });
  const deadline = Date.now() + 10_000;
  while (!existsSync(ready)) {
    if (Date.now() > deadline) throw new Error('Shared-lock fixture did not become ready');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  const started = Date.now();
  assert.throws(() => f.run(), error => error.status === 76);
  assert.ok(Date.now() - started >= 29_000);
  assert.match(f.log('self-host-catch-up'), /Checkout lock busy; retry next hour/);
  assert.match(f.log('self-host-catch-up'), /end self-host-catch-up exit 76/);
  for (const job of jobs) assert.equal(f.log(job), '');
  process.kill(-holder.pid, 'SIGKILL');
  await exited;
  f.run();
  assert.match(f.log('self-host-catch-up').trim().split('\n').at(-1), /end self-host-catch-up exit 0/);
});

// Same marker pairing as the dashboard: a new start supersedes a pending start.
function dashboardRuns(log, job) {
  let active = null;
  const runs = [];
  for (const line of Buffer.from(log).subarray(-250000).toString().split('\n')) {
    const start = line.match(/^== (\S+) start (\S+)$/);
    const end = line.match(/^== (\S+) end (\S+) exit (\d+)$/);
    if (start?.[2] === job) active = start[1];
    if (end?.[2] === job && active) { runs.push({ start: active, exit: Number(end[3]) }); active = null; }
  }
  return runs;
}

test('overlapping catch-up cannot hide the active sweep final failure from the dashboard', scopeOptions, async t => {
  const f = supervisorFixture(t, 'echo "fixture-only-job $job"; if [[ "$job" = self-host-discovery-github ]]; then sleep 2; return 9; fi');
  const job = 'self-host-catch-up';
  const active = spawn('/bin/bash', [f.installed, job], { stdio: 'ignore', detached: true });
  const exited = once(active, 'exit');
  t.after(() => { try { process.kill(-active.pid, 'SIGKILL'); } catch {} });
  const deadline = Date.now() + 10000;
  while (!f.log(job).includes(`start ${job}`)) {
    if (Date.now() > deadline) throw new Error('Active catch-up did not start');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.throws(() => f.run(), error => error.status === 76);
  assert.equal((await exited)[0], 1);
  assert.equal((f.log(job).match(/start self-host-catch-up/g) || []).length, 1);
  assert.deepEqual(dashboardRuns(f.log(job), job).map(run => run.exit), [1]);
});

test('nominal checkout wait skips, while timeout after checkout acquisition fails', scopeOptions, async t => {
  const f = supervisorFixture(t, 'sleep 5');
  // Shorten only scratch deadlines. Keep the ten-second reserve proportional.
  const short = f.source.replace('minutes=20', 'minutes=1').replaceAll('minutes * 60 - 10', '1').replaceAll('"${minutes}m"', '"3s"').replaceAll('"${minutes}min"', '"3s"');
  writeFileSync(f.installed, short);
  writeFileSync(f.scriptPath, short);
  f.commit('short fixture timeout');
  const ready = path.join(f.dir, 'shared-lock-ready');
  const holder = spawn('/bin/bash', ['-c', `exec 8>${quote(path.join(f.root, 'checkout.lock'))}; flock 8; touch ${quote(ready)}; sleep 30`], { detached: true, stdio: 'ignore' });
  const exited = once(holder, 'exit');
  t.after(() => { try { process.kill(-holder.pid, 'SIGKILL'); } catch {} });
  while (!existsSync(ready)) await new Promise(resolve => setTimeout(resolve, 20));
  const job = jobs[0];
  assert.throws(() => f.run(job), error => error.status === 76);
  assert.match(f.log(job), /Skipped: checkout lock busy; no job steps started/);
  assert.deepEqual(dashboardRuns(f.log(job), job).map(run => run.exit), [76]);
  process.kill(-holder.pid, 'SIGKILL');
  await exited;
  assert.throws(() => f.run(job), error => error.status !== 0 && error.status !== 76);
  const runs = dashboardRuns(f.log(job), job);
  assert.equal(runs.length, 2);
  assert.notEqual(runs[1].exit, 76);
});

test('large step output stays inside dashboard tail without changing its exit status', scopeOptions, t => {
  const f = supervisorFixture(t, 'node -e \'process.stdout.write("x".repeat(4000000) + "\\nERROR: late failure reason\\n")\'; return 9');
  const job = jobs[0];
  assert.throws(() => f.run(job), error => error.status === 9);
  assert.ok(Buffer.byteLength(f.log(job)) < 200000);
  assert.match(f.log(job), /console output capped/);
  assert.match(f.log(job), /ERROR: late failure reason/);
  assert.deepEqual(dashboardRuns(f.log(job), job).map(run => run.exit), [9]);
});

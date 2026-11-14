import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readlinkSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const source = readFileSync(new URL('../../scripts/stack127/checkout/update.sh', import.meta.url), 'utf8');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const quote = s => `'${s.replaceAll("'", "'\\''")}'`;
function fixture(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'checkout-update-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const origin = path.join(dir, 'origin'), checkout = path.join(dir, 'checkout');
  const data = path.join(dir, 'data'), root = path.join(data, 'checkout'), bin = path.join(dir, 'bin');
  const lockTmp = path.join(dir, 'tmp'), proc = path.join(dir, 'proc');
  for (const p of [origin, root, bin, lockTmp, path.join(proc, 'self'), path.join(data, 'state')]) mkdirSync(p, { recursive: true });
  // Use the same OS flock on macOS via Python; never fake lock success.
  writeFileSync(path.join(bin, 'flock'), `#!/usr/bin/env python3
import fcntl, sys
try: fcntl.flock(int(sys.argv[-1]), fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError: sys.exit(76)
`, { mode: 0o755 });
  // Only Git running inside this fixture counts. Unrelated Git on the test
  // machine (editors, other checkouts) must not trip the recovery guard.
  writeFileSync(path.join(bin, 'pgrep'), `#!/bin/sh
real=$(PATH=/usr/bin:/bin command -v pgrep) || exit 3
for pid in $("$real" "$@"); do
  if [ -d /proc/$pid ]; then cwd=$(readlink /proc/$pid/cwd 2>/dev/null)
  else cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p'); fi
  case "$cwd" in ${quote(realpathSync(dir))}*) exit 0 ;; esac
done
exit 1
`, { mode: 0o755 });
  writeFileSync(path.join(bin, 'sha256sum'), '#!/usr/bin/env python3\nimport hashlib,sys\nprint(hashlib.sha256(open(sys.argv[1],"rb").read()).hexdigest())\n', { mode: 0o755 });
  const calls = path.join(dir, 'npm-calls');
  writeFileSync(path.join(bin, 'npm'), `#!/bin/sh
printf '%s\\n' "$*" >> ${quote(calls)}
mkdir -p node_modules/.bin node_modules/example
printf new > node_modules/version
printf '#!/bin/sh\\necho relocated\\n' > node_modules/example/cli.sh
chmod +x node_modules/example/cli.sh
ln -s ../example/cli.sh node_modules/.bin/example
# npm must never run in the live checkout, nor invalidate its success marker.
test "$PWD" != ${quote(checkout)} || exit 91
if [ -f ${quote(path.join(dir, 'npm-fail'))} ]; then exit 9; fi
`, { mode: 0o755 });
  const updaterPath = 'scripts/stack127/checkout/update.sh';
  mkdirSync(path.join(origin, path.dirname(updaterPath)), { recursive: true });
  writeFileSync(path.join(origin, updaterPath), source);
  writeFileSync(path.join(origin, 'tracked.txt'), 'base\n');
  writeFileSync(path.join(origin, 'package.json'), '{"name":"fixture","version":"1.0.0"}\n');
  writeFileSync(path.join(origin, 'package-lock.json'), '{"lockfileVersion":3}\n');
  git(origin, 'init', '-b', 'main');
  for (const p of [origin]) { git(p, 'config', 'user.name', 'Fixture'); git(p, 'config', 'user.email', 'fixture@example.invalid'); }
  git(origin, 'add', '.'); git(origin, 'commit', '-m', 'base');
  git(dir, 'clone', origin, checkout);
  mkdirSync(path.join(checkout, 'node_modules'));
  writeFileSync(path.join(checkout, 'node_modules/version'), 'base');
  // Match production's ignored dependency tree.
  writeFileSync(path.join(checkout, '.git/info/exclude'), 'node_modules/\n');
  const installed = path.join(root, 'update.sh'); writeFileSync(installed, source);
  const hold = path.join(data, 'state/checkout-hold');
  const setup = `source ${quote(installed)}; checkout=${quote(checkout)}; data=${quote(data)}; root=${quote(root)}; hold=${quote(hold)}; lock_tmp=${quote(lockTmp)}; proc_root=${quote(proc)}; self=${quote(installed)}; export PATH=${quote(bin)}:"$PATH"; utc_minute() { echo 25; }; `;
  function run(command = 'execute') {
    return execFileSync('/bin/bash', ['-c', setup + command], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000 });
  }
  const commit = message => { git(origin, 'add', '.'); git(origin, 'commit', '-m', message); return git(origin, 'rev-parse', 'HEAD'); };
  const seed = () => writeFileSync(path.join(root, 'dependencies.sha256'), createHash('sha256').update(readFileSync(path.join(checkout, 'package-lock.json'))).digest('hex') + '\n');
  seed();
  const base = git(checkout, 'rev-parse', 'HEAD');
  return { dir, origin, checkout, data, root, hold, proc, lockTmp, installed, run, setup, commit, base, calls, seed };
}
const skipped = action => assert.throws(action, e => e.status === 76 && /SKIPPED:/.test(e.stdout));

test('hold prevents fetch and mutation', t => {
  const f = fixture(t);
  writeFileSync(f.hold, 'maintenance');
  git(f.checkout, 'remote', 'set-url', 'origin', path.join(f.dir, 'missing'));
  skipped(() => f.run());
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(existsSync(f.calls), false);
});

test('live retry PID and checkout cwd skip; stale retry PID does not', t => {
  const f = fixture(t), marker = path.join(f.lockTmp, 'adn-pending-discovery-1');
  writeFileSync(marker, String(process.pid) + '\n');
  skipped(() => f.run());
  writeFileSync(marker, '2147483647\n');
  f.run();
  const processDir = path.join(f.proc, String(process.pid)); mkdirSync(processDir);
  symlinkSync(f.checkout, path.join(processDir, 'cwd'));
  skipped(() => f.run());
});

for (const job of ['adn-discovery.lock', 'adn-future-job.lock', 'launch-directory-metrics.lock', 'cache-worker.lock']) {
  test(`active ${job} prevents an update using a real OS lock`, async t => {
    const f = fixture(t);
    const lock = path.join(job.startsWith('adn-') ? f.lockTmp : f.data, job);
    const child = spawn('python3', ['-c', 'import fcntl,sys,time; f=open(sys.argv[1],"w"); fcntl.flock(f,fcntl.LOCK_EX); print("ready",flush=True); time.sleep(30)', lock], { stdio: ['ignore', 'pipe', 'pipe'] });
    const exit = once(child, 'exit');
    t.after(() => child.kill('SIGKILL'));
    await once(child.stdout, 'data');
    skipped(() => f.run());
    child.kill('SIGKILL'); await exit;
    f.run();
  });
}

test('dirty tree and unpublished commits refuse without resetting edits', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.checkout, 'tracked.txt'), 'operator edit');
  assert.throws(() => f.run(), e => e.status === 1 && /checkout is dirty/.test(e.stdout));
  assert.equal(readFileSync(path.join(f.checkout, 'tracked.txt'), 'utf8'), 'operator edit');
  git(f.checkout, 'config', 'user.name', 'Fixture'); git(f.checkout, 'config', 'user.email', 'fixture@example.invalid');
  git(f.checkout, 'add', '.'); git(f.checkout, 'commit', '-m', 'local change');
  const head = git(f.checkout, 'rev-parse', 'HEAD');
  assert.throws(() => f.run(), e => e.status === 1 && /local commits or cannot fast-forward/.test(e.stdout));
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), head);
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
});

test('code-only fast-forward avoids npm; changed lockfile installs once with production flags', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, 'tracked.txt'), 'updated'); const target = f.commit('code only');
  f.run(); assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), target);
  assert.equal(existsSync(f.calls), false);
  writeFileSync(path.join(f.origin, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n'); f.commit('dependency change');
  f.run(); f.run();
  assert.equal(readFileSync(f.calls, 'utf8'), 'ci --omit=dev --ignore-scripts --no-audit --no-fund\n');
});

test('failed staging install leaves HEAD, working dependencies and marker unchanged', t => {
  const f = fixture(t);
  const oldModules = statSync(path.join(f.checkout, 'node_modules')).ino;
  const oldMarker = readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8');
  writeFileSync(path.join(f.origin, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n'); f.commit('lock change');
  writeFileSync(path.join(f.dir, 'npm-fail'), '');
  assert.throws(() => f.run(), e => e.status === 9);
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(statSync(path.join(f.checkout, 'node_modules')).ino, oldModules);
  assert.equal(readFileSync(path.join(f.checkout, 'node_modules/version'), 'utf8'), 'base');
  assert.equal(readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8'), oldMarker);
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
  rmSync(path.join(f.dir, 'npm-fail')); f.run();
  assert.equal(readFileSync(f.calls, 'utf8').trim().split('\n').length, 2);
});

for (const failure of ['merge', 'first rename', 'second rename', 'marker']) {
  test(`failed ${failure} restores base and dependencies in the same run`, t => {
    const f = fixture(t);
    writeFileSync(path.join(f.origin, 'tracked.txt'), 'target');
    writeFileSync(path.join(f.origin, 'new.txt'), 'created by interrupted merge');
    writeFileSync(path.join(f.origin, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n');
    const target = f.commit('dependency change');
    const marker = readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8');
    const modules = statSync(path.join(f.checkout, 'node_modules')).ino;
    let inject;
    if (failure === 'merge') {
      // Simulate Git failing after checking out target paths but before moving HEAD.
      inject = `git() { if [[ "$1" = merge ]]; then command git checkout ${quote(target)} -- tracked.txt new.txt; return 23; fi; command git "$@"; }; `;
    } else if (failure === 'marker') {
      inject = `mv() { if [[ "$2" = ${quote(path.join(f.root, 'dependencies.sha256'))} && ! -f ${quote(path.join(f.dir, 'failed-once'))} ]]; then touch ${quote(path.join(f.dir, 'failed-once'))}; return 23; fi; command mv "$@"; }; `;
    } else {
      const destination = failure === 'first rename' ? path.join(f.root, 'staging/old-node_modules') : path.join(f.checkout, 'node_modules');
      inject = `original_rename=$(declare -f rename_tree); eval "\${original_rename/rename_tree/original_rename_tree}"; rename_tree() { if [[ "$2" = ${quote(destination)} && ! -f ${quote(path.join(f.dir, 'failed-once'))} ]]; then touch ${quote(path.join(f.dir, 'failed-once'))}; return 23; fi; original_rename_tree "$@"; }; `;
    }
    assert.throws(() => f.run(inject + 'execute'), e => e.status === 23 && /RECOVERY: rolling back/.test(e.stdout));
    assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
    assert.equal(git(f.checkout, 'status', '--porcelain'), '');
    assert.equal(readFileSync(path.join(f.checkout, 'tracked.txt'), 'utf8'), 'base\n');
    assert.equal(existsSync(path.join(f.checkout, 'new.txt')), false);
    assert.equal(statSync(path.join(f.checkout, 'node_modules')).ino, modules);
    assert.equal(readFileSync(path.join(f.checkout, 'node_modules/version'), 'utf8'), 'base');
    assert.equal(readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8'), marker);
    assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
    f.run();
    assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), target);
  });
}

test('successful update swaps relocatable dependencies and writes the marker last', t => {
  const f = fixture(t);
  const marker = readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8');
  const modules = statSync(path.join(f.checkout, 'node_modules')).ino;
  writeFileSync(path.join(f.origin, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n');
  const target = f.commit('dependency change');
  // At marker publication, HEAD and new dependencies must match and the old
  // dependency tree must still be available for rollback under the journal.
  const hook = `mv() { if [[ "$2" = ${quote(path.join(f.root, 'dependencies.sha256'))} ]]; then
    [[ "$(git rev-parse HEAD)" = ${quote(target)} ]]
    [[ "$(cat node_modules/version)" = new ]]
    [[ "$(cat ${quote(path.join(f.root, 'staging/old-node_modules/version'))})" = base ]]
    [[ "$(cat ${quote(path.join(f.root, 'dependencies.sha256'))})" = ${quote(marker.trim())} ]]
    [[ -f ${quote(path.join(f.root, 'update-in-progress'))} ]]
    fi; command mv "$@"; }; execute`;
  f.run(hook);
  assert.notEqual(statSync(path.join(f.checkout, 'node_modules')).ino, modules);
  assert.equal(readlinkSync(path.join(f.checkout, 'node_modules/.bin/example')), '../example/cli.sh');
  assert.equal(execFileSync(path.join(f.checkout, 'node_modules/.bin/example'), { encoding: 'utf8' }), 'relocated\n');
  assert.equal(statSync(path.join(f.checkout, 'node_modules')).uid, process.getuid());
  assert.equal(readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8'), createHash('sha256').update(readFileSync(path.join(f.checkout, 'package-lock.json'))).digest('hex') + '\n');
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
  assert.equal(existsSync(path.join(f.root, 'staging/old-node_modules')), false);
});

test('journal recovery repairs interrupted Git files and locks; unjournaled locks are preserved', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, 'tracked.txt'), 'target'); writeFileSync(path.join(f.origin, 'new.txt'), 'new');
  const target = f.commit('target'); git(f.checkout, 'fetch', 'origin', 'main');
  const lock = path.join(f.checkout, '.git/index.lock'); writeFileSync(lock, '');
  assert.throws(() => f.run(), e => /unjournaled Git lock/.test(e.stdout));
  assert.equal(existsSync(lock), true);
  writeFileSync(path.join(f.root, 'update-in-progress'), `${f.base} ${target}\n`);
  writeFileSync(path.join(f.checkout, 'tracked.txt'), 'half-written');
  writeFileSync(path.join(f.checkout, 'new.txt'), 'new');
  assert.match(f.run(), /RECOVERY: completing interrupted fast-forward/);
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), target);
  assert.equal(git(f.checkout, 'status', '--porcelain'), '');
  assert.equal(existsSync(lock), false);
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
});

test('updater fetches repairs even on install drift and reports the need to reinstall', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, 'scripts/stack127/checkout/update.sh'), source + '\n# reviewed change\n'); const target = f.commit('updater change');
  assert.throws(() => f.run(), e => /installed checkout updater differs/.test(e.stdout));
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), target);
});

test('SIGKILL during Git leaves a journal and recovers on the next run', async t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, '.gitattributes'), 'z-new.txt filter=interrupt\n');
  writeFileSync(path.join(f.origin, 'a-new.txt'), 'created before interrupt\n');
  writeFileSync(path.join(f.origin, 'tracked.txt'), 'updated\n');
  writeFileSync(path.join(f.origin, 'z-new.txt'), 'filtered\n');
  const target = f.commit('interrupted merge');
  const ready = path.join(f.dir, 'ready');
  git(f.checkout, 'config', 'filter.interrupt.smudge', `printf half-written > ${quote(path.join(f.checkout, 'tracked.txt'))}; touch ${quote(ready)}; sleep 30; cat`);
  const child = spawn('/bin/bash', ['-c', f.setup + 'execute'], { cwd: f.dir, detached: true, stdio: 'ignore' });
  const exit = once(child, 'exit');
  t.after(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} });
  const deadline = Date.now() + 10000;
  while (!existsSync(ready)) {
    assert.ok(Date.now() < deadline, 'Git never reached the interrupt point');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(readFileSync(path.join(f.root, 'update-in-progress'), 'utf8'), `apply ${f.base} ${target}\n`);
  // Even a manual recovery call cannot reset a live Git operation.
  assert.throws(() => f.run('update_checkout'), e => /Git still running/.test(e.stdout));
  process.kill(-child.pid, 'SIGKILL'); await exit;
  git(f.checkout, 'config', '--unset', 'filter.interrupt.smudge');
  assert.match(f.run(), /RECOVERY: rolling back interrupted update/);
  assert.equal(readFileSync(path.join(f.checkout, 'tracked.txt'), 'utf8'), 'updated\n');
  assert.equal(readFileSync(path.join(f.checkout, 'a-new.txt'), 'utf8'), 'created before interrupt\n');
  assert.equal(git(f.checkout, 'status', '--porcelain'), '');
  assert.equal(existsSync(path.join(f.checkout, '.git/index.lock')), false);
  f.run(); // No stale job lock or repeated recovery.
});

test('installed supervisor logs skipped, successful and failed runs with the dashboard identity', t => {
  const f = fixture(t);
  const bin = path.join(f.dir, 'bin');
  // The local timeout adapter preserves descriptors and bounds the subprocess;
  // production uses GNU timeout, absent on a base Mac installation.
  writeFileSync(path.join(bin, 'timeout'), '#!/usr/bin/env python3\nimport subprocess,sys\nsys.exit(subprocess.run(sys.argv[3:], timeout=12, close_fds=False).returncode)\n', { mode: 0o755 });
  const scoped = source.replace('utc_minute() { date -u +%M; }', 'utc_minute() { echo 25; }').replaceAll('/srv/stack127-data', f.data).replaceAll('/srv/stack127', f.checkout)
    .replace('proc_root=/proc', `proc_root=${quote(f.proc)}`)
    .replace('lock_tmp=/tmp', `lock_tmp=${quote(f.lockTmp)}`)
    .replace('PATH=/usr/local/bin:/usr/bin:/bin', `PATH=${quote(bin)}:"$PATH"`)
    .replace('HOME=/home/ubuntu', `HOME=${quote(f.dir)}`);
  writeFileSync(f.installed, scoped);
  writeFileSync(path.join(f.origin, 'scripts/stack127/checkout/update.sh'), scoped);
  f.commit('safe installed fixture');
  const run = () => execFileSync('/bin/bash', [f.installed, 'stack127-checkout-update'], { cwd: f.dir, stdio: 'pipe', timeout: 15000 });
  const logPath = path.join(f.data, 'logs/stack127-checkout-update.log');
  writeFileSync(f.hold, ''); assert.throws(run, e => e.status === 76);
  rmSync(f.hold);
  try { run(); } catch (error) { throw new Error(`${error.message}\n${readFileSync(logPath, 'utf8')}`); }
  writeFileSync(path.join(f.checkout, 'tracked.txt'), 'human edit');
  assert.throws(run, e => e.status === 1);
  const log = readFileSync(logPath, 'utf8');
  assert.equal((log.match(/== .* start stack127-checkout-update\n/g) || []).length, 3);
  for (const code of [76, 0, 1]) assert.match(log, new RegExp(`== .* end stack127-checkout-update exit ${code}\\n`));
  assert.match(log, /checkout is dirty/);
});

test('failed staging with missing live dependencies does not publish a success marker', t => {
  const f = fixture(t);
  rmSync(path.join(f.checkout, 'node_modules'), { recursive: true });
  rmSync(path.join(f.root, 'dependencies.sha256'));
  writeFileSync(path.join(f.dir, 'npm-fail'), '');
  assert.throws(() => f.run(), e => e.status === 9);
  assert.equal(existsSync(path.join(f.root, 'dependencies.sha256')), false);
  assert.equal(existsSync(path.join(f.checkout, 'node_modules')), false);
  rmSync(path.join(f.dir, 'npm-fail'));
  f.run(); f.run();
  assert.equal(readFileSync(f.calls, 'utf8').trim().split('\n').length, 2);
});

test('UTC start window covers only minutes 15–28, including manual runs', t => {
  const f = fixture(t);
  for (let minute = 0; minute < 60; minute++) {
    const command = `utc_minute() { echo ${String(minute).padStart(2, '0')}; }; check_window`;
    if (minute >= 15 && minute <= 28) f.run(command);
    else skipped(() => f.run(command));
  }
  git(f.checkout, 'remote', 'set-url', 'origin', path.join(f.dir, 'missing'));
  for (const minute of [0, 10, 14, 29, 39, 40, 59]) {
    skipped(() => f.run(`utc_minute() { echo ${String(minute).padStart(2, '0')}; }; execute`));
  }
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
  assert.equal(existsSync(f.calls), false);
  // Never take job locks if it is already too late to start.
  assert.equal(existsSync(path.join(f.lockTmp, 'adn-discovery.lock')), false);
});

test('fetch recovery preserves edits and refuses locks outside its phase', t => {
  const f = fixture(t);
  const journal = path.join(f.root, 'update-in-progress');
  const ownLock = path.join(f.checkout, '.git/refs/remotes/origin/main.lock');
  const otherLock = path.join(f.checkout, '.git/index.lock');
  writeFileSync(journal, `fetch ${f.base} ${f.base}\n`);
  writeFileSync(ownLock, ''); writeFileSync(otherLock, '');
  writeFileSync(path.join(f.checkout, 'tracked.txt'), 'operator edit');
  assert.throws(() => f.run(), e => /Git lock outside journaled fetch phase/.test(e.stdout));
  assert.equal(existsSync(ownLock), true);
  assert.equal(existsSync(otherLock), true);
  rmSync(otherLock);
  assert.throws(() => f.run(), e => /working tree preserved/.test(e.stdout) && /checkout is dirty/.test(e.stdout));
  assert.equal(readFileSync(path.join(f.checkout, 'tracked.txt'), 'utf8'), 'operator edit');
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(existsSync(ownLock), false);
});

test('SIGKILL during a real fetch ref transaction recovers its lock on the next run', async t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, 'tracked.txt'), 'fetched update\n');
  const target = f.commit('fetch target');
  const ready = path.join(f.dir, 'fetch-ready');
  const hook = path.join(f.checkout, '.git/hooks/reference-transaction');
  writeFileSync(hook, `#!/bin/sh
if [ "$1" = prepared ]; then
  if grep -q ' refs/remotes/origin/main$'; then
    touch ${quote(ready)}
    sleep 30
  fi
fi
`, { mode: 0o755 });
  const child = spawn('/bin/bash', ['-c', f.setup + 'execute'], { cwd: f.dir, detached: true, stdio: 'ignore' });
  const exit = once(child, 'exit');
  t.after(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} });
  const deadline = Date.now() + 10000;
  while (!existsSync(ready)) {
    assert.ok(Date.now() < deadline, 'fetch never reached its ref transaction');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  const lock = path.join(f.checkout, '.git/refs/remotes/origin/main.lock');
  assert.equal(existsSync(lock), true);
  assert.equal(readFileSync(path.join(f.root, 'update-in-progress'), 'utf8'), `fetch ${f.base} ${f.base}\n`);
  process.kill(-child.pid, 'SIGKILL'); await exit;
  rmSync(hook);
  assert.equal(existsSync(lock), true, 'SIGKILL must leave the real fetch lock');
  assert.match(f.run(), /RECOVERY: interrupted fetch; working tree preserved/);
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), target);
  assert.equal(existsSync(lock), false);
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
  f.run();
});

for (const script of ['scripts/ad-networks/ovh/run-job.sh', 'scripts/launch-directories/ovh/run-job.sh', 'scripts/stack127/cache/ovh/run-worker.sh']) {
  for (const timing of ['before wrapper starts', 'after initial check before job lock']) {
    test(`${script} fails visibly with an interrupted-update journal ${timing}`, t => {
      const f = fixture(t), bin = path.join(f.dir, 'bin');
      const journal = path.join(f.root, 'update-in-progress');
      mkdirSync(path.join(f.data, 'logs'));
      const job = script.includes('ad-networks') ? 'discovery' : 'launch-directory-metrics';
      const worker = script.includes('cache/ovh');
      // Keep the wrapper's logic, including its POSIX shell and post-lock check.
      // Only production paths, PATH and GNU stat are adapted for this scratch tree.
      const wrapper = readFileSync(new URL(`../../${script}`, import.meta.url), 'utf8')
        .replaceAll('/srv/stack127-data', f.data).replaceAll('/srv/stack127', f.checkout)
        .replaceAll('/tmp/adn-', `${f.lockTmp}/adn-`)
        .replace('PATH=/usr/local/bin:/usr/bin:/bin', `PATH=${quote(bin)}:"$PATH"`);
      const installed = path.join(f.dir, 'wrapper.sh'); writeFileSync(installed, wrapper);
      writeFileSync(path.join(bin, 'stat'), `#!/usr/bin/env python3
import os,sys
s=os.stat(sys.argv[-1]); print(oct(s.st_mode & 0o777)[2:] if sys.argv[2] == '%a' else s.st_uid)
`, { mode: 0o755 });
      writeFileSync(path.join(bin, 'node'), `#!/bin/sh\ntouch ${quote(path.join(f.dir, 'node-started'))}\n`, { mode: 0o755 });
      writeFileSync(path.join(bin, 'flock'), `#!/bin/sh
# Inject a crash journal at the lock boundary; the inner shell must recheck it.
touch ${quote(journal)}
shift 4
exec "$@"
`, { mode: 0o755 });
      for (const name of ['ad-networks.env', 'launch-directory-metrics.env', 'cache-worker.env']) {
        writeFileSync(path.join(f.data, name), 'AD_NETWORK_DB_PATH=fixture\nAD_NETWORKS_STATE_DIRECTORY=fixture\n', { mode: 0o600 });
      }
      if (timing === 'before wrapper starts') writeFileSync(journal, 'interrupted\n');
      assert.throws(() => execFileSync('/bin/sh', [installed, ...(worker ? [] : [job])], {
        encoding: 'utf8', env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, stdio: 'pipe', timeout: 5000,
      }), e => {
        assert.equal(e.status, 1);
        const output = worker ? e.stderr : readFileSync(path.join(f.data, `logs/${job}.log`), 'utf8');
        assert.match(output, /ERROR: checkout update in progress or interrupted/);
        if (!worker) assert.match(output, new RegExp(`end ${job} exit 1`));
        return true;
      });
      assert.equal(existsSync(path.join(f.dir, 'node-started')), false);
    });
  }
}

for (const boundary of ['old moved aside', 'new installed', 'marker written']) {
  test(`SIGKILL with changed dependencies at ${boundary} recovers the old pair`, async t => {
    const f = fixture(t);
    const oldMarker = readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8');
    const oldModules = statSync(path.join(f.checkout, 'node_modules')).ino;
    writeFileSync(path.join(f.origin, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n');
    f.commit('dependency update');
    const ready = path.join(f.dir, 'swap-ready');
    const pause = `touch ${quote(ready)}; sleep 30`;
    const hook = boundary === 'marker written'
      ? `mv() { command mv "$@"; if [[ "$2" = ${quote(path.join(f.root, 'dependencies.sha256'))} ]]; then ${pause}; fi; }; `
      : `original_rename=$(declare -f rename_tree); eval "\${original_rename/rename_tree/original_rename_tree}"; rename_tree() {
        original_rename_tree "$@"
        if [[ "$2" = ${quote(boundary === 'old moved aside' ? path.join(f.root, 'staging/old-node_modules') : path.join(f.checkout, 'node_modules'))} ]]; then ${pause}; fi
      }; `;
    const child = spawn('/bin/bash', ['-c', f.setup + hook + 'execute'], { cwd: f.dir, detached: true, stdio: 'ignore' });
    const exit = once(child, 'exit');
    t.after(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} });
    const deadline = Date.now() + 10000;
    while (!existsSync(ready)) {
      assert.ok(Date.now() < deadline, 'updater never reached the swap boundary');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    process.kill(-child.pid, 'SIGKILL'); await exit;
    assert.equal(existsSync(path.join(f.root, 'update-in-progress')), true);
    // Recovery must restore the base pair before a new staging attempt, even
    // if that next attempt fails, rather than merely finishing a new update.
    writeFileSync(path.join(f.dir, 'npm-fail'), '');
    assert.throws(() => f.run(), e => e.status === 9 && /RECOVERY: rolling back/.test(e.stdout));
    assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
    assert.equal(statSync(path.join(f.checkout, 'node_modules')).ino, oldModules);
    assert.equal(readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8'), oldMarker);
    assert.equal(git(f.checkout, 'status', '--porcelain'), '');
    assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
    rmSync(path.join(f.dir, 'npm-fail')); f.run();
  });
}

test('SIGTERM after merging rolls back in the same run', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, 'tracked.txt'), 'new'); f.commit('new code');
  // Signal the execute subshell after a real successful merge. The parent shell
  // must not be the signal target (Bash retains its parent's $$ in subshells).
  const hook = `git() { command git "$@"; if [[ "$1" = merge ]]; then /bin/sh -c 'kill -TERM "$PPID"'; fi; }; execute`;
  assert.throws(() => f.run(hook), e => e.status === 143 && /RECOVERY: rolling back/.test(e.stdout));
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(readFileSync(path.join(f.checkout, 'node_modules/version'), 'utf8'), 'base');
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
});

test('a real Git smudge failure removes partial target files and restores base immediately', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, '.gitattributes'), 'z-new.txt filter=fail\n');
  writeFileSync(path.join(f.origin, 'a-new.txt'), 'written before failure\n');
  writeFileSync(path.join(f.origin, 'z-new.txt'), 'fails smudge\n');
  f.commit('failing checkout filter');
  git(f.checkout, 'config', 'filter.fail.smudge', 'exit 1');
  git(f.checkout, 'config', 'filter.fail.required', 'true');
  assert.throws(() => f.run(), e => e.status !== 0 && /RECOVERY: rolling back/.test(e.stdout) && /smudge/.test(e.stderr));
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(existsSync(path.join(f.checkout, 'a-new.txt')), false);
  assert.equal(git(f.checkout, 'status', '--porcelain'), '');
  assert.equal(readFileSync(path.join(f.checkout, 'node_modules/version'), 'utf8'), 'base');
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
});

test('a staged absolute dependency link is rejected without touching the live pair', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.origin, 'package-lock.json'), '{"lockfileVersion":3,"packages":{}}\n');
  f.commit('dependency change');
  const marker = readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8');
  assert.throws(() => f.run('npm() { command npm "$@"; ln -s /tmp node_modules/absolute; }; execute'),
    e => e.status === 1 && /dependency link cannot be relocated/.test(e.stderr));
  assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), f.base);
  assert.equal(readFileSync(path.join(f.checkout, 'node_modules/version'), 'utf8'), 'base');
  assert.equal(readFileSync(path.join(f.root, 'dependencies.sha256'), 'utf8'), marker);
  assert.equal(existsSync(path.join(f.root, 'update-in-progress')), false);
});

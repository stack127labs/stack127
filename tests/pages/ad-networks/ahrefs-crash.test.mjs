import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { ahrefsRequester } from '../../../scripts/stack127/ahrefs-dr.mjs';

const startedAt = Date.parse('2026-11-14T12:00:00Z');
const moduleUrl = new URL('../../../scripts/stack127/ahrefs-dr.mjs', import.meta.url).href;

async function crashAt(t, point) {
  const directory = mkdtempSync(join(tmpdir(), 's127-ahrefs-crash-'));
  const stateFile = join(directory, 'ahrefs.sqlite');
  let child, requests = 0, receivedRequest;
  const inFlight = new Promise(resolve => { receivedRequest = resolve; });
  const server = createServer((request, response) => {
    requests++;
    receivedRequest();
    if (point !== 'during-request') {
      response.writeHead(429, { 'Retry-After': '86400' });
      response.end('limited');
    }
  });
  t.after(async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill('SIGKILL');
      await exited;
    }
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  child = spawn(process.execPath, ['--input-type=module', '-e', `
    import { ahrefsRequester } from ${JSON.stringify(moduleUrl)};
    const [stateFile, point, url] = process.argv.slice(1);
    function checkpoint(point) {
      process.send({ point });
      return new Promise(resolve => setTimeout(resolve, 60000));
    }
    const request = ahrefsRequester({ apiKey: 'test-only', stateFile, now: () => ${startedAt},
      fetchImplementation: async () => {
        if (point === 'before-request') await checkpoint(point);
        const response = await fetch(url);
        if (point === 'before-cleanup') return {
          status: response.status, headers: response.headers,
          body: { cancel: () => checkpoint(point) },
        };
        return response;
      },
      onRateLimit: () => {
        process.send({ point: 'in-callback' });
        // A synchronous callback must not be able to prevent the state commit.
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
      },
    });
    await request('example.com');
    throw new Error('request returned before the crash checkpoint');
  `, stateFile, point, `http://127.0.0.1:${server.address().port}`], {
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  });
  let stderr = '';
  child.stderr.on('data', data => { stderr += data; });
  const exited = once(child, 'exit');
  const reached = point === 'during-request' ? inFlight : once(child, 'message').then(([message]) => {
    assert.equal(message.point, point);
  });
  await Promise.race([
    reached,
    exited.then(([code, signal]) => assert.fail(`child exited before ${point}: ${code}/${signal}\n${stderr}`)),
  ]);
  assert.equal(requests, point === 'before-request' ? 0 : 1);
  child.kill('SIGKILL');
  assert.deepEqual(await exited, [null, 'SIGKILL']);
  return { stateFile, requests: () => requests };
}

for (const point of ['before-request', 'during-request']) {
  test(`SIGKILL ${point} preserves the pacing reservation and releases the request lock`, { timeout: 10000 }, async t => {
    const { stateFile, requests } = await crashAt(t, point);
    let time = startedAt + 100, calls = 0;
    const waits = [];
    const request = ahrefsRequester({ apiKey: 'test-only', stateFile, now: () => time,
      sleepImplementation: async ms => {
        assert.equal(calls, 0, 'no HTTP before the reserved slot');
        waits.push(ms);
        time += ms;
      },
      fetchImplementation: async () => {
        calls++;
        assert.equal(time, startedAt + 3000);
        return new Response(JSON.stringify({ domain_rating: { domain_rating: 15 } }));
      },
    });
    assert.deepEqual(await request('next.example'), { value: 15 });
    assert.deepEqual(waits, [2900]);
    assert.equal(calls, 1);
    assert.equal(requests(), point === 'before-request' ? 0 : 1);
  });
}

for (const point of ['before-cleanup', 'in-callback']) {
  test(`SIGKILL after 429 ${point} preserves Retry-After before cleanup or callbacks finish`, { timeout: 10000 }, async t => {
    const { stateFile, requests } = await crashAt(t, point);
    let calls = 0;
    const options = { apiKey: 'test-only', stateFile,
      sleepImplementation: async () => assert.fail('long cooldown must stop without waiting'),
      fetchImplementation: async () => {
        calls++;
        return new Response(JSON.stringify({ domain_rating: { domain_rating: 20 } }));
      },
    };
    // Read from a fresh connection after death: the cooldown must already be committed.
    const db = new DatabaseSync(stateFile);
    try {
      assert.equal(db.prepare('select cooldown_until from request_state where id=1').get().cooldown_until, startedAt + 86400000);
    } finally { db.close(); }
    for (const elapsed of [100, 3600000, 86339999]) {
      assert.deepEqual(await ahrefsRequester({ ...options, now: () => startedAt + elapsed })('next.example'), { stopped: 'rate_limited' });
      assert.equal(calls, 0, 'no HTTP throughout the retained cooldown');
    }
    const controller = new AbortController();
    await assert.rejects(ahrefsRequester({ ...options, now: () => startedAt + 86399999, signal: controller.signal,
      sleepImplementation: async ms => {
        assert.equal(ms, 1);
        assert.equal(calls, 0, 'the final millisecond still blocks HTTP');
        controller.abort();
      },
    })('next.example'), { name: 'AbortError' });
    assert.equal(calls, 0);
    assert.deepEqual(await ahrefsRequester({ ...options, now: () => startedAt + 86400001 })('next.example'), { value: 20 });
    assert.equal(calls, 1);
    assert.equal(requests(), 1);
  });
}

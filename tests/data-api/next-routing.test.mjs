import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {request} from 'node:http';
import {readFileSync, writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {canonicalPrivatePaths, malformedPrivatePaths} from './private-paths.mjs';

// Use raw HTTP targets: fetch's URL parser would erase dot segments under test.
function send(port, path, method) {
  return new Promise((accept, reject) => {
    const req = request({host: '127.0.0.1', port, path, method, agent: false}, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => accept({status: response.statusCode, headers: response.headers, body}));
      response.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(Error('routing test request timed out')));
    req.end();
  });
}

function privateResponse(response, method, status, label) {
  assert.equal(response.status, status, label);
  for (const name of ['cache-control', 'cdn-cache-control', 'cloudflare-cdn-cache-control']) {
    assert.equal(response.headers[name], 'no-store', label + ' ' + name);
  }
  for (const name of ['location', 'refresh', 'cache-tag', 'link', 'x-stack127-pathname', 'x-stack127-cache-class']) {
    assert.equal(response.headers[name], undefined, label + ' ' + name);
  }
  if (status === 404) assert.equal(response.body, method === 'HEAD' ? '' : '{"error":{"code":"not_found","message":"Not found."}}', label);
}

for (const enabled of [false, true]) {
  test(`Next routing protects canonical private URLs and only reflects caller URLs in normalization redirects; enabled=${enabled}`, {timeout: 180000}, async t => {
    // Restore only Next dev's known declaration edit, preserving concurrent work.
    const nextEnvPath = new URL('../../next-env.d.ts', import.meta.url);
    const originalNextEnv = readFileSync(nextEnvPath, 'utf8');
    t.after(() => {
      if (readFileSync(nextEnvPath, 'utf8') === originalNextEnv.replace('./.next/types/routes.d.ts', './.next/dev/types/routes.d.ts')) {
        writeFileSync(nextEnvPath, originalNextEnv);
      }
    });
    const configuredSecret = randomBytes(32).toString('hex');
    const callerSecret = randomBytes(32).toString('hex');
    let logs = '';
    const child = spawn(process.execPath, ['tests/data-api/fixtures/next-server.mjs'], {
      cwd: new URL('../../', import.meta.url),
      env: {...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1',
        STACK127_MCP_ENABLED: String(enabled), STACK127_REST_ENABLED: String(enabled), STACK127_DATA_SQL_ENABLED: 'false',
        STACK127_DATA_SQL_DATABASE_URL: '', STACK127_MCP_PATH_SECRET: configuredSecret},
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });
    child.stdout.on('data', chunk => { logs += chunk; });
    child.stderr.on('data', chunk => { logs += chunk; });
    t.after(async () => {
      if (child.exitCode === null) {
        const exited = new Promise(accept => child.once('exit', accept));
        const kill = setTimeout(() => child.kill('SIGKILL'), 10000).unref();
        child.kill('SIGTERM');
        await exited;
        clearTimeout(kill);
      }
      // Noncanonical URLs are outside the narrow development log exclusion.
      assert.ok(!logs.includes(configuredSecret), 'server output contained the configured capability');
    });
    const port = await new Promise((accept, reject) => {
      child.once('message', ({port}) => accept(port));
      child.once('error', reject);
      child.once('exit', code => reject(Error(`Next server exited ${code}: ${logs}`)));
    });
    const publicRedirect = await send(port, '/dns-tools/dns-lookup/', 'GET');
    assert.equal(publicRedirect.status, 308);
    assert.ok(publicRedirect.headers.location);

    let count = 0, redirects = 0;
    for (const path of canonicalPrivatePaths(callerSecret)) {
      for (const query of ['', '?q=private']) {
        for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
          const response = await send(port, path + query, method);
          const label = method + ' ' + path.replaceAll(callerSecret, '<caller>') + query;
          const status = enabled && ['/api/mcp', '/api/v1/ad-networks/count_sites'].includes(path) ? 401 : 404;
          privateResponse(response, method, status, label);
          for (const secret of [callerSecret, configuredSecret]) {
            assert.ok(!JSON.stringify(response).includes(secret), label + ' credential leak');
          }
          count++;
        }
      }
    }
    // A correct capability also stays private when the feature is switched off.
    if (!enabled) for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
      const response = await send(port, '/api/mcp/' + configuredSecret, method);
      privateResponse(response, method, 404, 'disabled correct capability');
      assert.ok(!JSON.stringify(response).includes(configuredSecret));
      count++;
    }
    assert.ok(!logs.includes(callerSecret), 'canonical request appeared in development logs');

    for (const {path, destination, enabledStatus} of malformedPrivatePaths(callerSecret)) {
      for (const query of ['', '?q=private']) {
        for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
          const response = await send(port, path + query, method);
          const label = method + ' ' + path.replaceAll(callerSecret, '<caller>') + query;
          assert.ok(!JSON.stringify(response).includes(configuredSecret), label + ' exposed a different credential');
          for (const name of ['cache-tag', 'link', 'x-stack127-pathname', 'x-stack127-cache-class']) {
            assert.equal(response.headers[name], undefined, label + ' ' + name);
          }
          if (destination) {
            assert.equal(response.status, 308, label);
            assert.equal(response.headers.location, destination + query, label);
            assert.equal(response.headers.refresh, '0;url=' + destination + query, label);
            assert.equal(response.body, method === 'HEAD' ? '' : destination + query, label);
            // This is the origin, without Cloudflare: early redirects run before
            // app headers. Edge non-storage is a required separate release check.
            for (const name of ['cache-control', 'cdn-cache-control', 'cloudflare-cdn-cache-control']) {
              assert.equal(response.headers[name], undefined, label + ' unexpected origin cache directive');
            }
            redirects++;
          } else {
            privateResponse(response, method, enabled ? enabledStatus ?? 404 : 404, label);
            assert.ok(!JSON.stringify(response).includes(callerSecret), label + ' echoed a nonredirect URL');
          }
          count++;
        }
      }
    }
    t.diagnostic(`${count} real HTTP requests; ${redirects} caller-only 308s with no origin cache directive; Cloudflare no-store/bypass must be verified at release; no build or database calls`);
  });
}

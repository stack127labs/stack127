import { readFile, writeFile, rename, chmod } from 'node:fs/promises';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
const payload = JSON.parse(raw);
if (payload.redirectUri !== 'http://127.0.0.1:8765/' ||
    !/^[A-Za-z0-9._~\/-]+$/.test(payload.code || '') ||
    !/^[A-Za-z0-9._~-]{43,128}$/.test(payload.verifier || '')) {
  throw new Error('Invalid OAuth callback data');
}
const body = new URLSearchParams({
  code: payload.code,
  code_verifier: payload.verifier,
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri: payload.redirectUri,
  grant_type: 'authorization_code',
});
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', body, signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`Google token exchange returned HTTP ${response.status}`);
const token = await response.json();
if (!token.refresh_token || !token.access_token) throw new Error('Google did not provide an offline refresh token');
const granted = new Set((token.scope || '').split(/\s+/));
for (const scope of ['https://www.googleapis.com/auth/webmasters', 'https://www.googleapis.com/auth/analytics.readonly']) {
  if (!granted.has(scope)) throw new Error('Google did not grant the requested scopes');
}
const path = '/home/teja/projects/stack127/.env.search';
const contents = await readFile(path, 'utf8');
if (!/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m.test(contents)) throw new Error('Missing refresh-token env key');
const updated = contents.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, `GOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token}`);
const temp = `${path}.tmp-${process.pid}`;
await writeFile(temp, updated, { mode: 0o600 });
await chmod(temp, 0o600);
await rename(temp, path);
console.log('Google refresh token stored in homelab .env.search');

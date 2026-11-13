// Runs only after Node has parsed the private env file. Never print a credential.
import { spawn } from 'node:child_process';
const [job, wrapper, checkout, runId] = process.argv.slice(2);
function fail(message) { console.error(`ERROR: ${message}`); process.exit(1); }
let database;
try { database = new URL(process.env.DATABASE_URL); } catch { fail('DATABASE_URL is missing or invalid'); }
if (database.hostname !== '127.0.0.1' || database.username !== 'stack127_app' || database.pathname !== '/postgres' || (database.port || '5432') !== '5432' || database.searchParams.get('sslmode') !== 'disable') fail('DATABASE_URL must use the loopback production app connection with sslmode=disable');
if (['self-host-discovery-github', 'self-host-discovery-catalogs', 'self-host-refresh-github', 'self-host-refresh-technical'].includes(job) && !process.env.GITHUB_TOKEN?.trim()) fail('GITHUB_TOKEN is missing');
if (job === 'self-host-awesome-list' && !process.env.PUBLIC_REPOS_GITHUB_TOKEN?.trim()) fail('PUBLIC_REPOS_GITHUB_TOKEN is missing');
// GITLAB_TOKEN and CODEBERG_TOKEN are optional: both APIs answer public reads without them.
// Descriptor 8 holds the checkout flock. The step shell must retain it if this launcher dies.
const child = spawn('/bin/bash', [wrapper, '--steps', job, checkout, runId], { stdio: ['inherit', 'inherit', 'inherit', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore', 8] });
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('error', () => fail('Could not start job steps'));
child.on('exit', (code, signal) => process.exit(code ?? (signal === 'SIGKILL' ? 137 : 143)));

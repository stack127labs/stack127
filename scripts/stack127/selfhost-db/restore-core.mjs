#!/usr/bin/env node
// Initial reduced restore + consistent SQLite refill. Never a final core update.
import { spawn } from 'node:child_process';
import { mkdir, open, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { parseArgs, parseEnv } from 'node:util';
import { pathToFileURL, fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const docker = ['sudo', '-n', 'docker'];
const bigTables = ['ad_network_publishers', 'ad_network_publisher_relationships',
  'ad_network_relationship_events', 'ad_network_check_observations'];

export function refillEnvironment(url, inherited = process.env) {
  const allowed = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'NODE_EXTRA_CA_CERTS'];
  const env = Object.fromEntries(allowed.filter(name => inherited[name] !== undefined)
    .map(name => [name, inherited[name]]));
  return { ...env, AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', DATABASE_POOLER_URL: url };
}

export function targetUrl(raw, container, host) {
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== '127.0.0.1'
    || url.port !== '5432' || url.pathname !== '/postgres' || url.username !== 'stack127_app') {
    throw new Error('The protected app URL must identify the local rehearsal target');
  }
  if (container === 'stack127-db' && host === '127.0.0.1') return url.toString();
  if (container !== 'stack127-db-rehearsal-scratch' || host !== '127.0.0.2') {
    throw new Error('Only the main target or explicit loopback scratch target is allowed');
  }
  url.hostname = host;
  return url.toString();
}

export function assertIdentity(actual, expected) {
  if (actual.system_id !== expected || actual.login !== 'stack127_app'
    || actual.database !== 'postgres' || !actual.server_address) {
    throw new Error('TCP identity does not match the selected Docker cluster');
  }
}

async function main() {
  const { values } = parseArgs({ options: {
    archive: { type: 'string' }, 'work-directory': { type: 'string' },
    'sqlite-source': { type: 'string', default: '/srv/stack127-data/ad-networks.sqlite' },
    'env-file': { type: 'string', default: '/srv/stack127-db/.env' },
    repository: { type: 'string', default: '/srv/stack127' },
    container: { type: 'string', default: 'stack127-db' },
    'loopback-host': { type: 'string', default: '127.0.0.1' },
    confirm: { type: 'string' }, help: { type: 'boolean', default: false },
  } });
  if (values.help) {
    console.log('restore-core.sh --archive <reduced.dump> --work-directory <NEW private directory> --confirm stack127-empty-restore');
    console.log('Requires an empty prepared PG17 target, matching roles, pg_net 0.20.4 installed but not preloaded, and cron off.');
    return;
  }
  if (!values.archive || !values['work-directory'] || values.confirm !== 'stack127-empty-restore') {
    throw new Error('Archive, new work directory and explicit empty-restore confirmation are required');
  }
  const work = resolve(values['work-directory']), repository = resolve(values.repository);
  const container = values.container, envFile = resolve(values['env-file']);
  const protectedEnv = parseEnv(await readFile(envFile, 'utf8'));
  if ((await stat(envFile)).mode & 0o077) throw new Error('Protected env file must have mode 0600');
  const url = targetUrl(protectedEnv.SELFHOST_DATABASE_URL_LOOPBACK, container, values['loopback-host']);
  const archive = resolve(values.archive);
  await stat(archive);
  await mkdir(work, { mode: 0o700 }); // Refuse an existing directory, including logs from a failed attempt.
  process.umask(0o077);
  let client;
  let copied = false;
  const remote = '/tmp/stack127-initial-' + process.pid;
  const metrics = {};
  async function run(stage, args, options = {}) {
    const started = performance.now(), log = join(work, stage + '.log');
    const file = await open(log, 'wx', 0o600);
    let heartbeat;
    try {
      await new Promise((resolveRun, reject) => {
        const child = spawn(args[0], args.slice(1), { cwd: repository, ...options,
          stdio: ['pipe', file.fd, file.fd] });
        heartbeat = setInterval(() => console.log(JSON.stringify({ stage,
          elapsed_seconds: Math.round((performance.now() - started) / 1000) })), 30000);
        child.on('error', reject);
        child.on('close', code => code === 0 ? resolveRun() : reject(new Error('Stage failed: ' + stage)));
        child.stdin.on('error', () => {});
        child.stdin.end(options.input);
      });
    } finally { clearInterval(heartbeat); await file.close(); }
    metrics[stage + '_seconds'] = +((performance.now() - started) / 1000).toFixed(3);
    console.log(JSON.stringify({ stage, seconds: metrics[stage + '_seconds'] }));
    return readFile(log, 'utf8');
  }
  const psql = [...docker, 'exec', '-i', '--user', 'postgres', container, 'psql',
    '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '--host=/var/run/postgresql', '-U', 'supabase_admin', '-d', 'postgres'];
  const sql = (stage, text) => run(stage, psql, { input: text });
  const identityQuery = `select (pg_control_system()).system_identifier::text as system_id,
    current_user as login,current_database() as database,inet_server_addr()::text as server_address`;
  const started = performance.now();
  try {
    const state = JSON.parse(await sql('empty_target_guard', `select json_build_object(
      'id',(pg_control_system()).system_identifier::text,'major',current_setting('server_version_num')::int/10000,
      'tables',(select count(*) from pg_tables where schemaname='public'),
      'cron',current_setting('cron.launch_active_jobs'),
      'http', 'pg_net'=any(string_to_array(replace(current_setting('shared_preload_libraries'),' ',''),',')),
      'pg_net',(select extversion from pg_extension where extname='pg_net'));`));
    if (state.major !== 17 || state.tables !== 0 || state.cron !== 'off' || state.http || state.pg_net !== '0.20.4') {
      throw new Error('Requires an empty, neutralised PG17 target with pg_net 0.20.4 installed');
    }
    const { default: pg } = await import(pathToFileURL(join(repository, 'node_modules/pg/lib/index.js')));
    client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10000, query_timeout: 15000 });
    await client.connect();
    assertIdentity((await client.query(identityQuery)).rows[0], state.id);
    // No database mutation or SQLite access precedes both empty/identity checks.
    await run('archive_copy', [...docker, 'cp', archive, container + ':' + remote + '.dump']); copied = true;
    await run('archive_mode', [...docker, 'exec', container, 'sh', '-c',
      'chown postgres:postgres ' + remote + '.dump && chmod 600 ' + remote + '.dump']);
    const toc = await run('archive_toc', [...docker, 'exec', '--user', 'postgres', container,
      'pg_restore', '--list', remote + '.dump']);
    const tables = new Set([...toc.matchAll(/^\d+; \d+ \d+ TABLE DATA public (\w+) /gm)].map(match => match[1]));
    if (bigTables.some(name => tables.has(name)) || !['stack127_pages', 'ad_networks', 'ad_network_daily_counts'].every(name => tables.has(name))
      || /^\d+; \d+ \d+ TABLE DATA (cron|net) /m.test(toc)) {
      throw new Error('Use the reduced application archive with big table data, cron and HTTP queues excluded');
    }
    const list = toc.split('\n').filter(line => !/ SCHEMA - (public|extensions) /.test(line)).join('\n');
    await run('use_list', [...docker, 'exec', '-i', container, 'tee', remote + '.list'], { input: list });
    await run('use_list_mode', [...docker, 'exec', container, 'sh', '-c',
      'chown postgres:postgres ' + remote + '.list && chmod 600 ' + remote + '.list']);
    await sql('prepare', await readFile(join(directory, 'prepare-target.sql'), 'utf8'));
    for (const section of ['pre-data', 'data', 'post-data']) {
      if (section === 'post-data') await sql('neutralise_wake',
        'UPDATE public.stack127_cache_worker_wake SET function_url=NULL; UPDATE cron.job SET active=false;');
      await run('restore_' + section.replace('-', '_'), [...docker, 'exec', '--user', 'postgres', container,
        'pg_restore', '--exit-on-error', '--use-list=' + remote + '.list', '--section=' + section,
        '--host=/var/run/postgresql', '--username=supabase_admin', '--dbname=postgres', remote + '.dump']);
    }
    await sql('app_grants', await readFile(join(directory, 'app-role.sql'), 'utf8'));
    assertIdentity((await client.query(identityQuery)).rows[0], state.id);
    const wake = (await client.query(`select not exists(select from public.stack127_cache_worker_wake
      where function_url is not null) as safe`)).rows[0];
    // The app cannot inspect superuser-only settings. Keep that guard on the
    // selected container's local admin socket rather than broadening its role.
    const isolation = (await sql('isolation_guard', `select current_setting('cron.launch_active_jobs')='off'
      and not 'pg_net'=any(string_to_array(replace(current_setting('shared_preload_libraries'),' ',''),','))
      and not exists(select from net.http_request_queue);`)).trim();
    if (!wake.safe || isolation !== 't') throw new Error('Wake, cron or HTTP queue is not neutralised');
    const env = refillEnvironment(url), snapshot = join(work, 'ad-networks-snapshot.sqlite');
    const snapshotEnv = { ...env }; delete snapshotEnv.DATABASE_POOLER_URL; delete snapshotEnv.AD_NETWORKS_RUNTIME_ENVIRONMENT;
    await run('sqlite_snapshot', [process.execPath, '--experimental-strip-types', 'scripts/ad-networks/snapshot-local.mjs',
      '--local-database', resolve(values['sqlite-source']), '--output', snapshot], { env: snapshotEnv });
    await run('sqlite_refill', [process.execPath, '--experimental-strip-types', 'scripts/ad-networks/sync.mjs',
      '--sqlite', snapshot, '--environment', 'production', '--confirm', 'stack127-production', '--apply'], { env });
    metrics.total_seconds = +((performance.now() - started) / 1000).toFixed(3);
    metrics.container_identity_verified = true;
    metrics.wake_disabled = true;
    await writeFile(join(work, 'metrics.json'), JSON.stringify(metrics, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ restored_and_refilled: true, ...metrics }));
  } catch (error) {
    await writeFile(join(work, 'failure.log'), String(error.stack), { mode: 0o600 });
    throw error;
  } finally {
    await client?.end().catch(() => {});
    if (copied) {
      const cleanup = spawn(docker[0], [...docker.slice(1), 'exec', container, 'rm', '-f', remote + '.dump', remote + '.list'], { stdio: 'ignore' });
      await new Promise(resolveCleanup => { cleanup.on('error', resolveCleanup); cleanup.on('close', resolveCleanup); });
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error('Restore/refill stopped. Check inputs and private stage logs; do not retry over a populated target.');
    process.exitCode = 1;
  });
}

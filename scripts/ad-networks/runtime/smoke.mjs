#!/usr/bin/env node
// Runs inside the image, without network, database credentials or a data volume.
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { checkRuntimeExecutables } from './check-executables.mjs';

const checked = checkRuntimeExecutables();
const directory = await mkdtemp(join(tmpdir(), 'ad-network-smoke-'));
try {
  await writeFile(join(directory, 'heartbeat.json'), JSON.stringify({ at: new Date().toISOString(), phase: 'ready' }));
  const result = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/ad-networks/scheduler.mjs', '--check'], {
    env: { ...process.env, AD_NETWORKS_STATE_DIRECTORY: directory }, stdio: 'inherit', timeout: 15000,
  });
  if (result.error || result.status !== 0) throw new Error('Runtime scheduler health smoke failed');
  console.log(JSON.stringify({ smoke: true, ...checked, scheduler_health: true }));
} finally { await rm(directory, { recursive: true, force: true }); }

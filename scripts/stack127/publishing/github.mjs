import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { validatePlan } from './cli.mjs';

export function publicationEvent(event, repository = 'stack127labs/stack127') {
  const deployment = event.deployment;
  if (event.repository?.full_name !== repository || deployment?.environment !== 'stack127-page-publication' || deployment.task !== 'page-publication') throw new Error('This is not a stack127 page publication deployment');
  const payload = typeof deployment.payload === 'string' ? JSON.parse(deployment.payload) : deployment.payload;
  if (!/^[a-f0-9]{40}$/.test(payload?.release_sha ?? '') || deployment.sha !== payload.release_sha || deployment.ref !== payload.release_sha || !Number.isSafeInteger(deployment.id)) throw new Error('Deployment ref, SHA, and publication payload must agree');
  const plan = validatePlan(payload.plan, payload.plan?.kind, 'production');
  if (!['tools', 'directories'].includes(plan.kind)) throw new Error('Unknown publication kind');
  return { deploymentId: deployment.id, releaseSha: deployment.sha, plan };
}

function gh(args, input) {
  return JSON.parse(execFileSync('gh', ['api', ...args], { encoding: 'utf8', input: input && JSON.stringify(input), maxBuffer: 10 * 1024 * 1024 }));
}

export async function githubMain(argv = process.argv.slice(2)) {
  const [command, file] = argv;
  const event = await readFile(process.env.GITHUB_EVENT_PATH, 'utf8').then(JSON.parse);
  const { deploymentId, releaseSha, plan } = publicationEvent(event);
  const endpoint = `repos/stack127labs/stack127/deployments/${deploymentId}/statuses`;
  if (command === 'extract') {
    const permission = gh([`repos/stack127labs/stack127/collaborators/${encodeURIComponent(event.sender.login)}/permission`]);
    if (!['admin', 'maintain', 'write'].includes(permission.permission)) throw new Error('Publication requires a repository writer');
    const main = gh(['repos/stack127labs/stack127/commits/main']);
    if (main.sha !== releaseSha) throw new Error('Publication deployment must use the current main SHA');
    if (!file) throw new Error('Provide an output plan file');
    await writeFile(file, JSON.stringify(plan), { mode: 0o600, flag: 'wx' });
    gh([endpoint, '--method', 'POST', '--input', '-'], { state: 'in_progress', description: 'Checking deployment and publishing the reviewed page batch', auto_inactive: false });
    return;
  }
  if (!['success', 'failure', 'error'].includes(command)) throw new Error('Use extract, success, failure, or error');
  gh([endpoint, '--method', 'POST', '--input', '-'], {
    state: command, auto_inactive: false, environment_url: 'https://stack127.com',
    log_url: `https://github.com/stack127labs/stack127/actions/runs/${process.env.GITHUB_RUN_ID}`,
    description: command === 'success' ? 'Database and public page verification passed' : 'Publication is incomplete; check the workflow before retrying',
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await githubMain();

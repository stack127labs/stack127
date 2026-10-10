import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { validatePlan } from './cli.mjs';
import { onlyKeys } from './readiness.mjs';
import { loadPlan, storePlan, validatePlanBlob, MAX_PLAN_BYTES, PUBLICATION_REPOSITORY } from './plan-storage.mjs';

export function publicationEvent(event, repository = PUBLICATION_REPOSITORY) {
  const deployment = event.deployment;
  if (event.repository?.full_name !== repository || deployment?.environment !== 'stack127-page-publication' || deployment.task !== 'page-publication') throw new Error('This is not a stack127 page publication deployment');
  const payload = typeof deployment.payload === 'string' ? JSON.parse(deployment.payload) : deployment.payload;
  if (!/^[a-f0-9]{40}$/.test(payload?.release_sha ?? '') || deployment.sha !== payload.release_sha || deployment.ref !== payload.release_sha || !Number.isSafeInteger(deployment.id)) throw new Error('Deployment ref, SHA, and publication payload must agree');
  onlyKeys(payload, ['schema_version', 'release_sha', 'plan_blob'], 'Publication payload');
  if (payload.schema_version !== 2) throw new Error('Regenerate and dispatch the plan with the current publisher');
  return { deploymentId: deployment.id, releaseSha: deployment.sha, planBlob: validatePlanBlob(payload.plan_blob) };
}

export function gh(args, input) {
  return JSON.parse(execFileSync('gh', ['api', '-H', 'Accept: application/vnd.github+json', ...args], {
    encoding: 'utf8', input: input && JSON.stringify(input), maxBuffer: MAX_PLAN_BYTES * 1.5 + 1024 * 1024,
  }));
}

export async function dispatchPublication(plan, releaseSha, { github = gh } = {}) {
  validatePlan(plan, plan.kind, 'production');
  if (!/^[a-f0-9]{40}$/.test(releaseSha)) throw new Error('Dispatch requires a full release SHA');
  const planBlob = await storePlan(plan, github);
  const response = await github([`repos/${PUBLICATION_REPOSITORY}/deployments`, '--method', 'POST', '--input', '-'], {
    ref: releaseSha, task: 'page-publication', environment: 'stack127-page-publication',
    auto_merge: false, required_contexts: [], production_environment: true,
    payload: { schema_version: 2, release_sha: releaseSha, plan_blob: planBlob },
  });
  if (!Number.isSafeInteger(response.id) || response.sha !== releaseSha) throw new Error('GitHub did not accept the expected publication deployment');
  return { dispatched: true, deployment_id: response.id,
    url: `https://github.com/${PUBLICATION_REPOSITORY}/deployments`, complete: false };
}

export async function extractPublication(event, file, { github = gh } = {}) {
  const publication = publicationEvent(event);
  if (typeof event.sender?.login !== 'string' || !event.sender.login) throw new Error('Publication needs a repository writer');
  const permission = await github([`repos/${PUBLICATION_REPOSITORY}/collaborators/${encodeURIComponent(event.sender.login)}/permission`]);
  if (!['admin', 'maintain', 'write'].includes(permission.permission)) throw new Error('Publication requires a repository writer');
  const main = await github([`repos/${PUBLICATION_REPOSITORY}/commits/main`]);
  if (main.sha !== publication.releaseSha) throw new Error('Publication deployment must use the current main SHA');
  if (!file) throw new Error('Provide an output plan file');
  const plan = validatePlan(await loadPlan(publication.planBlob, github), publication.planBlob.kind, 'production');
  await writeFile(file, JSON.stringify(plan), { mode: 0o600, flag: 'wx' });
  return { ...publication, plan };
}

export async function githubMain(argv = process.argv.slice(2)) {
  const [command, file] = argv;
  const event = await readFile(process.env.GITHUB_EVENT_PATH, 'utf8').then(JSON.parse);
  const { deploymentId } = publicationEvent(event);
  const endpoint = `repos/${PUBLICATION_REPOSITORY}/deployments/${deploymentId}/statuses`;
  if (command === 'extract') {
    await extractPublication(event, file);
    gh([endpoint, '--method', 'POST', '--input', '-'], { state: 'in_progress', description: 'Checking deployment and publishing the reviewed page batch', auto_inactive: false });
    return;
  }
  if (!['success', 'failure', 'error'].includes(command)) throw new Error('Use extract, success, failure, or error');
  gh([endpoint, '--method', 'POST', '--input', '-'], {
    state: command, auto_inactive: false, environment_url: 'https://stack127.com',
    log_url: `https://github.com/${PUBLICATION_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    description: command === 'success' ? 'Database and public page verification passed' : 'Publication is incomplete; check the workflow before retrying',
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await githubMain();

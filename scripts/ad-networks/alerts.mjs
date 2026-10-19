import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { progressFile } from './enrichment-store.mjs';

export function safeError(error, env = process.env) {
  let message = String(error?.message ?? error);
  for (const [key, value] of Object.entries(env)) {
    if (/TOKEN|PASSWORD|SECRET|DATABASE.*URL|SIGNING_KEY/i.test(key) && value?.length > 3) message = message.replaceAll(value, '[redacted]');
  }
  return message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[database]').slice(0, 1000);
}

export async function jobAlert(options, failed, dependencies = {}) {
  if (options.environment !== 'production') return { skipped: true, reason: 'development' };
  const env = dependencies.env ?? process.env;
  if (!env.GITHUB_ALERT_TOKEN) throw new Error('GITHUB_ALERT_TOKEN missing; failure alerts unavailable');
  const file = join(options['state-directory'], `alert-${options.job}.json`);
  let state = {};
  try { state = JSON.parse(await readFile(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const request = async (path, method = 'GET', body) => {
    const response = await (dependencies.fetch ?? fetch)(`https://api.github.com/repos/stack127labs/stack127${path}`, {
      method, headers: { Authorization: `Bearer ${env.GITHUB_ALERT_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), redirect: 'error', signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Job alert HTTP ${response.status}`);
    return response.json();
  };
  if (failed && !state.issue) {
    const title = `Ad network job failed: ${options.job}`;
    const issues = await request('/issues?state=open&per_page=100');
    const issue = issues.find(row => row.title === title) ?? await request('/issues', 'POST', {
      title, body: `The production ${options.job} job failed at ${new Date().toISOString()}.\n\nInspect the ad-network job logs and persistent state. This issue closes after that job succeeds.\n\nRaw errors and credentials are kept out of alerts.`,
    });
    state = { issue: issue.number };
  } else if (!failed && state.issue) {
    await request(`/issues/${state.issue}`, 'PATCH', { state: 'closed' });
    state = {};
  } else return state;
  await progressFile(file, state);
  return state;
}

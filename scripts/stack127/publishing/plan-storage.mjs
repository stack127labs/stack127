import { createHash } from 'node:crypto';
import { onlyKeys } from './readiness.mjs';

// GitHub's Git blob API accepts files up to 100 MB. This leaves space below it.
export const MAX_PLAN_BYTES = 90 * 1024 * 1024;
export const PUBLICATION_REPOSITORY = 'stack127labs/stack127';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const blobSha = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

export function validatePlanBlob(reference) {
  onlyKeys(reference, ['sha', 'sha256', 'size', 'kind'], 'Frozen plan blob');
  if (!/^[a-f0-9]{40}$/.test(reference.sha ?? '') || !/^[a-f0-9]{64}$/.test(reference.sha256 ?? '')
    || !Number.isSafeInteger(reference.size) || reference.size < 1 || reference.size > MAX_PLAN_BYTES
    || !['tools', 'directories', 'courses'].includes(reference.kind)) {
    throw new Error('Frozen plan blob needs its SHA, SHA-256, size, and publication kind');
  }
  return { ...reference };
}

export async function storePlan(plan, github) {
  const bytes = Buffer.from(JSON.stringify(plan));
  if (bytes.length > MAX_PLAN_BYTES) throw new Error('Publication plan exceeds the 90 MiB Git blob limit');
  const expected = blobSha(bytes);
  const response = await github([`repos/${PUBLICATION_REPOSITORY}/git/blobs`, '--method', 'POST', '--input', '-'], {
    encoding: 'base64', content: bytes.toString('base64'),
  });
  if (response.sha !== expected) throw new Error('GitHub did not store the exact frozen publication plan');
  return validatePlanBlob({ sha: response.sha, sha256: sha256(bytes), size: bytes.length, kind: plan.kind });
}

export async function loadPlan(reference, github) {
  validatePlanBlob(reference);
  const response = await github([`repos/${PUBLICATION_REPOSITORY}/git/blobs/${reference.sha}`]);
  if (response.sha !== reference.sha || response.encoding !== 'base64' || response.size !== reference.size
    || typeof response.content !== 'string' || response.content.length > Math.ceil(reference.size / 3) * 4 * 1.1 + 100) {
    throw new Error('GitHub plan blob metadata differs from the frozen request');
  }
  const bytes = Buffer.from(response.content, 'base64');
  if (bytes.length !== reference.size || sha256(bytes) !== reference.sha256 || blobSha(bytes) !== reference.sha) {
    throw new Error('GitHub plan blob failed its frozen-plan integrity check');
  }
  return JSON.parse(bytes.toString('utf8'));
}

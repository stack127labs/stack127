import { createHash, timingSafeEqual } from 'node:crypto';
import { ApiError } from './config.ts';
export type Principal = { id: string; plan: 'private'; allowSql: boolean };
export type Authenticator = (request: Request, pathSecret?: string) => Promise<Principal>;
export function matchesSecret(actual: string, expected: string | undefined) {
  if (!expected || !/^[A-Za-z0-9_-]{43,256}$/.test(expected) || actual.length > 512) return false;
  return timingSafeEqual(createHash('sha256').update(actual).digest(), createHash('sha256').update(expected).digest());
}
export const authenticate: Authenticator = async (request, pathSecret) => {
  // A wrong capability path is an unknown endpoint, even with a valid header.
  if (pathSecret !== undefined && !matchesSecret(pathSecret,process.env.STACK127_MCP_PATH_SECRET)) throw new ApiError(404,'not_found','Not found.');
  const header = request.headers.get('authorization');
  // A supplied invalid header never falls back to a URL credential.
  const ok = header !== null
    ? /^Bearer [A-Za-z0-9_-]+$/.test(header) && matchesSecret(header.slice(7), process.env.STACK127_MCP_TOKEN)
    : pathSecret !== undefined && matchesSecret(pathSecret, process.env.STACK127_MCP_PATH_SECRET);
  if (!ok) throw new ApiError(401, 'unauthorized', 'Authentication required.');
  return { id: 'private-owner', plan: 'private', allowSql: true };
};

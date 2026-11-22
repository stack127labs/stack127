export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status=status; this.code=code; }
}
export function integerEnv(name: string, fallback: number, max: number) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 1 || n > max) throw new ApiError(503, 'configuration', 'Invalid data API configuration.');
  return n;
}
export const enabled = (name: string) => process.env[name] === 'true';
export const rowLimit = () => integerEnv('STACK127_DATA_MAX_ROWS', 200, 200);
// SQL must never fall back to the application's broadly privileged login.
export const sqlEnabled = () => enabled('STACK127_DATA_SQL_ENABLED') && Boolean(process.env.STACK127_DATA_SQL_DATABASE_URL?.trim());
export const MAX_ANSWER_BYTES = 1_000_000;
// Public plans must add their own authenticator and authorization policy here.
// There is deliberately no env flag that turns anonymous/public access on.
export const PUBLIC_MODE = false;

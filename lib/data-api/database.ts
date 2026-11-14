import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';
import { observePoolErrors } from '../database-errors.ts';
import { ApiError, integerEnv, sqlEnabled } from './config.ts';
import type { Principal } from './auth.ts';
const globalDb = globalThis as typeof globalThis & { stack127DataApiPool?: Pool; stack127DataSqlPool?: Pool };
export function dataPool() {
  if (!globalDb.stack127DataApiPool) {
    const connectionString=process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
    if(!connectionString)throw new ApiError(503,'configuration','Database is not configured.');
    globalDb.stack127DataApiPool = new Pool({ connectionString,
      max: 2, connectionTimeoutMillis: 15000, idleTimeoutMillis: 10000, query_timeout: 20000 });
    observePoolErrors(globalDb.stack127DataApiPool);
  }
  return globalDb.stack127DataApiPool;
}
function sqlPool() {
  if (!sqlEnabled()) throw new ApiError(404,'not_found','Not found.');
  if (!globalDb.stack127DataSqlPool) {
    globalDb.stack127DataSqlPool = new Pool({ connectionString: process.env.STACK127_DATA_SQL_DATABASE_URL,
      max: 1, connectionTimeoutMillis: 15000, idleTimeoutMillis: 10000, query_timeout: 20000 });
    observePoolErrors(globalDb.stack127DataSqlPool);
  }
  return globalDb.stack127DataSqlPool;
}
export type Reader = { query: <T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]) => Promise<T[]> };
async function transaction<T>(pool: Pool, run: (db: Reader) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let broken = false, committed = false;
  try {
    await client.query('begin transaction isolation level repeatable read read only');
    await client.query("set local search_path = stack127_data, pg_catalog");
    await client.query("set local timezone = 'UTC'");
    await client.query("select set_config('statement_timeout', $1, true)", [String(integerEnv('STACK127_DATA_TIMEOUT_MS', 15000, 15000))]);
    const result = await run({ query: async <R extends QueryResultRow>(sql: string, values?: unknown[]) => (await client.query<R>(sql, values)).rows });
    await client.query('commit');
    committed = true;
    return result;
  } finally {
    if(!committed)try { await client.query('rollback'); } catch { broken = true; }
    client.release(broken);
  }
}
export function readTransaction<T>(run: (db: Reader) => Promise<T>): Promise<T> {
  return transaction(dataPool(), run);
}
export function sqlReadTransaction<T>(run: (db: Reader) => Promise<T>): Promise<T> {
  return transaction(sqlPool(), run);
}
// One atomic statement; fixed UTC minute/day windows, shared by both front doors.
export async function consumeRateLimit(principal: Principal) {
  const result = await dataPool().query(`insert into stack127_api.rate_limits as r
    (principal,minute_on,day_on,minute_count,day_count)
    values ($1,date_trunc('minute',now()),date_trunc('day',now() at time zone 'UTC') at time zone 'UTC',1,1)
    on conflict(principal) do update set
      minute_on=excluded.minute_on,day_on=excluded.day_on,
      minute_count=case when r.minute_on=excluded.minute_on then r.minute_count+1 else 1 end,
      day_count=case when r.day_on=excluded.day_on then r.day_count+1 else 1 end
    where (r.minute_on<>excluded.minute_on or r.minute_count<$2)
      and (r.day_on<>excluded.day_on or r.day_count<$3) returning principal`,
  [principal.id,integerEnv('STACK127_DATA_RPM',120,10000),integerEnv('STACK127_DATA_RPD',10000,1000000)]);
  if (!result.rowCount) throw new ApiError(429,'rate_limit','Request limit reached. Try again in the next UTC window.');
}

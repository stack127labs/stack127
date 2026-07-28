/**
 * Read through cache for RDAP responses.
 *
 * The DNS tools cache nothing. RDAP has to, because registries throttle by source
 * IP and the whole site leaves through one address.
 *
 * Privacy: rows are keyed by the queried URL and hold the registry's answer. No
 * requester address, session, or identifier is stored, and nothing here is ever
 * joined to who asked. Requester identifiers live only in the in-memory rate
 * limiter for a few minutes. See version127_docs/rdap.md.
 *
 * Degrades to no caching when DATABASE_URL is absent or the table is missing, so
 * local development and the public repository work without a database.
 */

import { getPool } from "../db.ts";
import type { RdapFetch } from "./types.ts";

const REGISTERED_TTL_SECONDS = 24 * 60 * 60;
const NOT_REGISTERED_TTL_SECONDS = 60 * 60;

let cacheUsable: boolean | null = null;

function ttlFor(status: RdapFetch["status"]) {
  if (status === "registered") return REGISTERED_TTL_SECONDS;
  if (status === "not_registered") return NOT_REGISTERED_TTL_SECONDS;
  return 0;
}

async function usable() {
  if (cacheUsable !== null) return cacheUsable;
  if (!process.env.DATABASE_URL) {
    cacheUsable = false;
    return cacheUsable;
  }
  try {
    await getPool().query("select 1 from public.rdap_cache limit 1");
    cacheUsable = true;
  } catch {
    // Missing table or unreachable database. Work without the cache rather than
    // failing the lookup; the throttle still protects the registries.
    cacheUsable = false;
  }
  return cacheUsable;
}

export async function readCachedRdap(url: string, source: RdapFetch["source"]): Promise<RdapFetch | null> {
  if (!(await usable())) return null;
  try {
    const result = await getPool().query<{
      http_status: number | null;
      status: string;
      body: unknown;
      fetched_at: Date;
    }>(
      `select http_status, status, body, fetched_at
         from public.rdap_cache
        where url = $1
          and fetched_at > now() - make_interval(secs => $2)
        limit 1`,
      [url, REGISTERED_TTL_SECONDS],
    );
    const row = result.rows[0];
    if (!row) return null;
    const age = (Date.now() - new Date(row.fetched_at).getTime()) / 1000;
    if (age > ttlFor(row.status as RdapFetch["status"])) return null;
    return {
      status: row.status as RdapFetch["status"],
      httpStatus: row.http_status,
      url,
      source,
      body: row.body,
      error: null,
      fetchedAt: new Date(row.fetched_at).toISOString(),
      fromCache: true,
    };
  } catch {
    return null;
  }
}

export async function writeCachedRdap(url: string, value: RdapFetch) {
  if (!(await usable())) return;
  if (ttlFor(value.status) === 0) return;
  try {
    await getPool().query(
      `insert into public.rdap_cache (url, status, http_status, body, fetched_at)
       values ($1, $2, $3, $4, now())
       on conflict (url) do update
         set status = excluded.status,
             http_status = excluded.http_status,
             body = excluded.body,
             fetched_at = excluded.fetched_at`,
      [url, value.status, value.httpStatus, value.body === null ? null : JSON.stringify(value.body)],
    );
  } catch {
    // A cache write failure must never affect the answer we already have.
  }
}

export function resetCacheStateForTests() {
  cacheUsable = null;
}

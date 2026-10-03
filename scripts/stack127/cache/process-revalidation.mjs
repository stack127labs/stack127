import { createHmac, randomUUID } from "node:crypto";
import pg from "pg";
import { targetsForEvents } from "./targets.mjs";
import { refreshTargets, cacheBodyDigest } from "./refresh.mjs";
import { launchDirectoryRevisionMatches } from "../../../lib/launch-directories-data.ts";

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = process.env;
const DATABASE_URL = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
if (!DATABASE_URL || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) throw new Error("Database and Cloudflare credentials are required.");
const site = (process.env.STACK127_SITE_URL || "https://stack127.com").replace(/\/$/, "");
const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 2, connectionTimeoutMillis: 15000, statement_timeout: 15000 });
const leaseId = randomUUID();
const deadline = Date.now() + 90_000;
let leased = false;
let failure = null;
async function request(url, options = {}, allowed404 = false) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(Math.max(1, Math.min(20_000, deadline - Date.now()))) });
  if (!response.ok && !(allowed404 && response.status === 404)) throw new Error(`Cache request failed: HTTP ${response.status} ${new URL(url).pathname}`);
  return response;
}
try {
  leased = (await pool.query(`update public.stack127_cache_worker_state set lease_id=$1,lease_until=now()+interval '150 seconds',last_run_at=now()
    where id and (lease_until is null or lease_until<now()) returning id`, [leaseId])).rowCount > 0;
  if (!leased) console.log("The Supabase worker is processing updates; no backup run is needed.");
  else {
    const { rows: credentials } = await pool.query("select signing_key from public.stack127_cache_credentials where id");
    const token = createHmac("sha256", credentials[0].signing_key).update("stack127-cache-revalidation-v1").digest("hex");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    let processed = 0;
    while (Date.now() < deadline) {
      const { rows: events } = await pool.query(`select id::text,entity_type,slug,created_at::text from public.stack127_revalidation_events
        where next_attempt_at<=now() and (created_at<=now()-interval '10 seconds' or first_queued_at<=now()-interval '60 seconds')
        order by first_queued_at,id limit 1`);
      if (!events.length) break;
      const { rows: catalogs } = await pool.query(`select page.slug from public.stack127_pages page join public.stack127_tool_catalogs catalog on catalog.page_id=page.id where page.page_family='catalog' and page.is_published`);
      const tools = events[0].entity_type === 'page' && catalogs.some(row => row.slug === events[0].slug)
        ? (await pool.query("select slug from public.stack127_pages where page_family='tool' and is_published")).rows.map(row => row.slug) : [];
      const targets = targetsForEvents(events, catalogs.map(row => row.slug), tools);
      const { rows: versions } = await pool.query("select * from public.stack127_cache_source_revisions($1::text[], $2::text[])", [[events[0].entity_type], [events[0].slug]]);
      try {
        await refreshTargets(targets, {
          invalidate: async () => {
            const paths = targets.paths.filter(path => !path.endsWith('.xml'));
            for (let i=0; i<Math.max(paths.length,1); i+=200) await request(`${site}/api/cache/revalidate`, {method:'POST',headers,body:JSON.stringify({paths:paths.slice(i,i+200),tags:i===0?targets.nextTags:[]})});
          },
          rebuild: async paths => {
            const result = await (await request(`${site}/api/cache/refresh`, {method:'POST',headers,body:JSON.stringify({paths})})).json();
            if (!Array.isArray(result.verified) || result.verified.length !== paths.length) throw new Error('Origin did not verify every path');
            return result.verified;
          },
          purge: async tags => {
            for (let i=0;i<tags.length;i+=100) {
              const result = await (await request(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,{method:'POST',headers:{Authorization:`Bearer ${CLOUDFLARE_API_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({tags:tags.slice(i,i+100)})})).json();
              if (!result.success) throw new Error('Cloudflare purge rejected');
            }
          },
          warm: async proofs => Promise.all(proofs.map(async proof => {
            const response = await request(`${site}${proof.path}`, {}, true);
            const body = await response.text();
            if (proof.digest && await cacheBodyDigest(body) !== proof.digest) throw new Error("Public API is stale");
            if (proof.sourceRevision && !launchDirectoryRevisionMatches(body, proof.sourceRevision)) throw new Error("Public launch directory data is stale");
            if (response.status !== proof.status || (proof.revision && !body.includes(`name="stack127-content-revision" content="${proof.revision}"`))) throw new Error('Public warm returned stale content');
          })),
        });
        const client = await pool.connect();
        try {
          await client.query('begin');
          const event = events[0];
          const removed = await client.query('delete from public.stack127_revalidation_events where id=$1 and created_at=$2::text::timestamptz returning id',[event.id,event.created_at]);
          if (removed.rowCount) await client.query(`insert into public.stack127_cache_processed(entity_type,slug,fingerprint) values($1,$2,$3)
            on conflict(entity_type,slug) do update set fingerprint=excluded.fingerprint,processed_at=now()`,[event.entity_type,event.slug,versions[0]?.fingerprint??'deleted']);
          await client.query('commit'); processed += removed.rowCount;
        } catch(error) { await client.query('rollback'); throw error; } finally {client.release();}
        // Leave another full refresh to the next run, with a fresh time budget.
        break;
      } catch(error) {
        const event=events[0];
        await pool.query(`update public.stack127_revalidation_events set attempts=attempts+1,last_error=$1,next_attempt_at=now()+case attempts when 0 then interval '15 seconds' when 1 then interval '1 minute' else interval '5 minutes' end
          where id=$2 and created_at=$3::text::timestamptz`,[String(error).slice(0,500),event.id,event.created_at]);
        throw error;
      }
    }
    console.log(JSON.stringify({processed,pending:(await pool.query('select count(*)::int as count from public.stack127_revalidation_events')).rows[0].count}));
  }
} catch(error) {failure=String(error).slice(0,500);throw error;}
finally {
  if(leased) await pool.query(`update public.stack127_cache_worker_state set lease_id=null,lease_until=null,last_error=$2,
    last_success_at=case when $2::text is null then now() else last_success_at end where id and lease_id=$1`,[leaseId,failure]);
  await pool.end();
}

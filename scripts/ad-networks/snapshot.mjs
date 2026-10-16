#!/usr/bin/env node
import pg from 'pg';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { resolveDatabaseUrl } from '../stack127/tool-pages/lib.mjs';
export function snapshotCounts(client) {
  return client.query(`insert into public.ad_network_daily_counts as d(ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count)
    select n.id,(now() at time zone 'UTC')::date,count(r.publisher_id) filter(where r.status in ('confirmed','stale')),
      count(r.publisher_id) filter(where r.status='confirmed'),count(r.publisher_id) filter(where r.status='stale')
    from public.ad_networks n left join public.ad_network_publisher_relationships r on r.ad_network_id=n.id group by n.id
    on conflict(ad_network_id,snapshot_on) do update set listed_count=excluded.listed_count,
      confirmed_count=excluded.confirmed_count,stale_count=excluded.stale_count,captured_at=now()
    where (d.listed_count,d.confirmed_count,d.stale_count) is distinct from (excluded.listed_count,excluded.confirmed_count,excluded.stale_count)`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const {values}=parseArgs({options:{apply:{type:'boolean',default:false},environment:{type:'string',default:'development'},confirm:{type:'string'}}});
  if(values.environment!=='development')throw new Error('This gathering command only supports development');
  const pool=new pg.Pool({connectionString:resolveDatabaseUrl(values),max:1,connectionTimeoutMillis:15000,query_timeout:120000});
  try {
    const result=values.apply?await snapshotCounts(pool):await pool.query('select count(*)::int as networks from public.ad_networks');
    console.log(JSON.stringify({applied:values.apply,environment:values.environment,changed:values.apply?result.rowCount:0,rows:values.apply?undefined:result.rows}));
  }finally{await pool.end();}
}

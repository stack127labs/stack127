/** Classify only arrivals supported by successive successful checks.
 * Initial imports and incomplete older histories cannot establish a join.
 * @param {{checked_at:string,network_ids:string[]}|null} previous
 * @param {{checked_at:string,network_ids:string[]}} current
 * @param {{baseline?:boolean,known_site?:boolean,known_network_ids?:string[],established_network_ids?:string[],departed_network_ids?:string[]}} context
 * @returns {{network_id:string,event:'joined'|'newly_found'|'baseline'}[]}
 */
export function classifyNetworkArrivals(previous, current, context = {}) {
  const time = new Date(current.checked_at).getTime();
  if (!Number.isFinite(time) || (previous && time <= new Date(previous.checked_at).getTime())) return [];
  const prior = new Set(previous?.network_ids ?? []);
  const known = new Set(context.known_network_ids ?? []);
  const established = new Set(context.established_network_ids ?? []);
  const departed = new Set(context.departed_network_ids ?? []);
  return [...new Set(current.network_ids)].flatMap(network_id => {
    if (prior.has(network_id) || (known.has(network_id) && !departed.has(network_id))) return [];
    // An incomplete check or an older matcher can omit an existing relationship.
    // Its recovery is not a join. A recorded departure permits a genuine return.
    const imported = established.has(network_id) && !departed.has(network_id);
    return [{network_id,event:context.baseline || imported ? 'baseline' : previous ? 'joined' : context.known_site ? 'baseline' : 'newly_found'}];
  });
}

/** Snapshot the latest successful check after reviewed relationships have been synced.
 * Failed requests never establish absence. Unchanged snapshots never create events.
 * @param {import('pg').PoolClient} client
 * @param {{baseline?:boolean,batchSize?:number}} options
 */
export async function captureNetworkObservations(client, {baseline=false,batchSize=500} = {}) {
  if (baseline) {
    await client.query(`insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
      select ad_network_id,publisher_id,'baseline',first_confirmed_at,relationship_type
      from public.ad_network_publisher_relationships where status in ('confirmed','stale','ended') and first_confirmed_at is not null
      on conflict do nothing`);
  }
  let after='0';let observations=0;let arrivals=0;
  while (true) {
    // Limit before reading large evidence JSON; materialize its small network slice
    // once per publisher and share the batch event history across all subqueries.
    const result=await client.query(`with cohort as materialized (
      select p.id,p.last_checked_at,p.last_check_evidence->'confirmed_networks' as confirmed_networks,
        o.checked_at as previous_checked_at,o.confirmed_network_ids as previous_network_ids
      from public.ad_network_publishers p left join public.ad_network_check_observations o on o.publisher_id=p.id
      where p.id>$1::bigint and p.last_check_outcome in ('matched','no_match','no_ads_txt','not_modified')
        and p.last_checked_at=p.last_successful_check_at
        and (o.publisher_id is null or p.last_checked_at>o.checked_at)
        and exists(select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id
          and (r.status in ('confirmed','stale') or (r.status='ended' and r.first_confirmed_at is not null)))
      order by p.id limit $2
    ), cohort_events as materialized (
      select e.* from public.ad_network_relationship_events e join cohort p on p.id=e.publisher_id
    )
    select p.id::text,p.last_checked_at::text as checked_at,
      p.previous_checked_at::text as previous_checked_at,p.previous_network_ids as previous_network_ids,
      array(select n.id::text from public.ad_networks n
        where coalesce(p.confirmed_networks,'[]'::jsonb) ? n.slug order by n.id) as network_ids,
      array(select distinct e.ad_network_id::text from cohort_events e
        where e.publisher_id=p.id and e.event in ('baseline','newly_found','joined')) as known_network_ids,
      array(select r.ad_network_id::text from public.ad_network_publisher_relationships r
        where r.publisher_id=p.id and r.first_confirmed_at<p.last_checked_at) as established_network_ids,
      array(select e.ad_network_id::text from (
        select distinct on (e.ad_network_id) e.ad_network_id,e.event
        from cohort_events e where e.publisher_id=p.id and e.observed_at<p.last_checked_at
        order by e.ad_network_id,e.observed_at desc,case when e.event='left' then 0 else 1 end desc
      ) e where e.event='left') as departed_network_ids,
      exists(select 1 from cohort_events e where e.publisher_id=p.id) as known_site
      from cohort p order by p.id`,[after,batchSize]);
    if (!result.rows.length) break;
    const events=[];
    const rows=result.rows.map(row=>{
      const current={checked_at:row.checked_at,network_ids:row.network_ids};
      const previous=row.previous_checked_at ? {checked_at:row.previous_checked_at,network_ids:row.previous_network_ids.map(String)} : null;
      for (const event of classifyNetworkArrivals(previous,current,{baseline,known_site:row.known_site,
        known_network_ids:row.known_network_ids,established_network_ids:row.established_network_ids,departed_network_ids:row.departed_network_ids})) {
        events.push({...event,publisher_id:row.id,observed_at:current.checked_at});
      }
      return {publisher_id:row.id,checked_at:current.checked_at,confirmed_network_ids:current.network_ids};
    });
    if (events.length) await client.query(`insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
      select x.network_id,x.publisher_id,x.event,x.observed_at,coalesce(r.relationship_type,'unknown')
      from jsonb_to_recordset($1::jsonb) x(network_id bigint,publisher_id bigint,event text,observed_at timestamptz)
      left join public.ad_network_publisher_relationships r on r.ad_network_id=x.network_id and r.publisher_id=x.publisher_id
      on conflict do nothing`,[JSON.stringify(events)]);
    await client.query(`insert into public.ad_network_check_observations as o(publisher_id,checked_at,confirmed_network_ids)
      select publisher_id,checked_at,confirmed_network_ids from jsonb_to_recordset($1::jsonb)
        x(publisher_id bigint,checked_at timestamptz,confirmed_network_ids bigint[])
      on conflict(publisher_id) do update set checked_at=excluded.checked_at,confirmed_network_ids=excluded.confirmed_network_ids
      where excluded.checked_at>o.checked_at`,[JSON.stringify(rows)]);
    observations+=rows.length;arrivals+=events.length;after=result.rows.at(-1).id;
  }
  return {observations,arrivals};
}

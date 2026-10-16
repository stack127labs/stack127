// Runs inside the caller's SQLite transaction. Keep raw domains and source keys:
// they describe the evidence we actually checked, even after a company merger.
export function relabelNetworkEvidence(value) {
  if (value === 'snigel') return 'publisher-collective';
  if (Array.isArray(value)) return [...new Map(value.map(item => {
    const next = relabelNetworkEvidence(item);
    return [JSON.stringify(next), next];
  })).values()];
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, relabelNetworkEvidence(item)]));
  return value;
}

const statusRank = {confirmed: 4, stale: 3, ended: 2, needs_review: 1};
const earliest = (...dates) => dates.filter(Boolean).sort()[0] ?? null;
const latest = (...dates) => dates.filter(Boolean).sort().at(-1) ?? null;
export function mergeNetworkRelationship(source, target) {
  const winner = !target || statusRank[source.status] > statusRank[target.status]
    || (statusRank[source.status] === statusRank[target.status]
      && (source.last_confirmed_at ?? source.updated_at) > (target.last_confirmed_at ?? target.updated_at))
    ? source : target;
  const result = {...winner,
    first_confirmed_at: earliest(source.first_confirmed_at, target?.first_confirmed_at),
    last_confirmed_at: latest(source.last_confirmed_at, target?.last_confirmed_at),
    created_at: earliest(source.created_at, target?.created_at),
    updated_at: latest(source.updated_at, target?.updated_at),
    ended_at: winner.status === 'ended' ? winner.ended_at : null,
  };
  result.evidence = JSON.stringify({...relabelNetworkEvidence(JSON.parse(winner.evidence)),
    identity_merge: {from: 'snigel', into: 'publisher-collective',
      previous_relationships: [source, ...(target ? [target] : [])].map(row => ({
        status: row.status, relationship_type: row.relationship_type,
        verification_method: row.verification_method, evidence: JSON.parse(row.evidence),
        first_confirmed_at: row.first_confirmed_at, last_confirmed_at: row.last_confirmed_at,
        ended_at: row.ended_at,
      }))}});
  return result;
}

export function mergeRetiredLocalNetworks(database) {
  const source = database.prepare("select id from ad_networks where slug='snigel'").get();
  if (!source) return;
  const target = database.prepare("select id from ad_networks where slug='publisher-collective'").get();
  if (!target) throw new Error('Cannot retire Snigel without Publisher Collective');
  const columns = ['status','relationship_type','verification_method','evidence','first_confirmed_at',
    'last_confirmed_at','ended_at','consecutive_misses','first_missed_at','last_missed_at','created_at','updated_at'];
  const upsert = database.prepare(`insert into relationships(ad_network_id,publisher_id,${columns.join(',')})
    values(?,?,${columns.map(() => '?').join(',')}) on conflict(ad_network_id,publisher_id)
    do update set ${columns.map(key => `${key}=excluded.${key}`).join(',')}`);
  for (const row of database.prepare('select * from relationships where ad_network_id=?').all(source.id)) {
    const existing = database.prepare('select * from relationships where ad_network_id=? and publisher_id=?').get(target.id, row.publisher_id);
    const merged = mergeNetworkRelationship(row, existing);
    upsert.run(target.id, row.publisher_id, ...columns.map(key => merged[key]));
  }
  // Keep last-check sets consistent with the remapped ID to prevent false arrivals.
  for (const row of database.prepare("select id,last_check_evidence from publishers where last_check_evidence like '%snigel%'").all()) {
    const evidence = JSON.stringify(relabelNetworkEvidence(JSON.parse(row.last_check_evidence)));
    if (evidence !== row.last_check_evidence) database.prepare('update publishers set last_check_evidence=? where id=?').run(evidence, row.id);
  }
  database.prepare('delete from relationships where ad_network_id=?').run(source.id);
  database.prepare('delete from ad_networks where id=?').run(source.id);
}

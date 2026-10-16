/**
 * Prefer explicit publisher MANAGERDOMAIN evidence. If a later failed check erased
 * it, use one confirmed manager relationship's retained evidence or identity.
 * Selling relationships, ended managers, and ambiguous managers never qualify.
 * @param {unknown} evidence
 * @param {{slug:string,name:string,manager_domains:string[]}[]} networks
 * @param {{slug:string,status:string,relationship_type:string,evidence?:unknown}[]} relationships
 * @returns {{managed_by:{slug:string,name:string}|null,manager_domain:string|null}}
 */
export function deriveManagedBy(evidence, networks, relationships = []) {
  const record = evidence && typeof evidence === 'object' ? evidence : {};
  const entries = 'manager_domains' in record && Array.isArray(record.manager_domains) ? record.manager_domains : [];
  const normalize = value => typeof value === 'string' ? value.toLowerCase().trim().replace(/\.$/, '') : '';
  const domains = [...new Set(entries.map(item => normalize(typeof item === 'string' ? item : item?.value)).filter(Boolean))];
  const unknown = { managed_by: null, manager_domain: null };
  const fromDomain = domain => {
    const matches = networks.filter(network => network.manager_domains.includes(domain));
    return { managed_by: matches.length === 1 ? { slug: matches[0].slug, name: matches[0].name } : null, manager_domain: domain };
  };
  if (domains.length > 1) return unknown;
  if (domains.length === 1) return fromDomain(domains[0]);

  const managers = relationships.filter(r => r.status === 'confirmed' && r.relationship_type === 'primary_or_exclusive_manager');
  if (managers.length !== 1) return unknown;
  const relationship = managers[0];
  const retained = relationship.evidence && typeof relationship.evidence === 'object' ? relationship.evidence : {};
  const domain = normalize('manager_domain' in retained ? retained.manager_domain : null)
    || normalize('matched_signal' in retained && typeof retained.matched_signal === 'string'
      ? /^MANAGERDOMAIN\s*=\s*([^,\s]+)/i.exec(retained.matched_signal)?.[1] : null);
  if (domain) return fromDomain(domain);
  const network = networks.find(n => n.slug === relationship.slug);
  if (!network) return unknown;
  return { managed_by: { slug: network.slug, name: network.name },
    manager_domain: network.manager_domains.length === 1 ? network.manager_domains[0] : null };
}

/** First ten source lines plus the first MANAGERDOMAIN line if it is further down.
 * Each ordinary line is capped at 256 UTF-8 bytes; the manager line at 512;
 * the complete preview at 4096 bytes. Null means no stored source text.
 * @param {unknown} text
 * @returns {string|null}
 */
export function buildAdsTxtPreview(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  function truncate(value, limit) {
    let result = '', bytes = 0;
    for (const character of value) {
      const size = Buffer.byteLength(character);
      if (bytes + size > limit) break;
      result += character; bytes += size;
    }
    return result;
  }
  const lines = text.split(/\r\n|\n|\r/);
  const preview = lines.slice(0, 10).map(line => truncate(line, 256));
  const managerIndex = lines.findIndex(line => /^\s*MANAGERDOMAIN\s*=/i.test(line));
  if (managerIndex >= 10) preview.push(truncate(lines[managerIndex], 512));
  return truncate(preview.join('\n'), 4096);
}

/** Aggregate the same manager resolution used by public rows. Counts can be
 * grouped in SQL first; only sites with a summary enter the ads.txt percentage.
 * @param {{evidence:unknown,manager_relationships:{slug:string,status:string,relationship_type:string,evidence?:unknown}[],network_slugs:string[],has_summary:boolean,count:number}[]} groups
 * @param {{slug:string,name:string,manager_domains:string[]}[]} identities
 */
export function aggregateAdNetworkManagers(groups, identities) {
  /** @type {Record<string,Map<string,number>>} */
  const byNetwork={};
  let with_manager=0,measured=0;
  for (const group of groups) {
    const manager=deriveManagedBy(group.evidence,identities,group.manager_relationships);
    const named=Boolean(manager.managed_by || manager.manager_domain);
    if (group.has_summary) {measured+=group.count;if(named)with_manager+=group.count;}
    for (const slug of group.network_slugs) {
      const key=manager.managed_by?.slug===slug ? 'this-network' : named ? 'another-network' : 'not-listed';
      const counts=byNetwork[slug]??(byNetwork[slug]=new Map());
      counts.set(key,(counts.get(key)??0)+group.count);
    }
  }
  return {with_manager,measured,network_counts:Object.fromEntries(Object.entries(byNetwork).map(([slug,counts])=>[
    slug,[...counts].sort(([a],[b])=>a.localeCompare(b)).map(([key,count])=>({key,label:key,count})),
  ]))};
}

/** Traffic shares count each site under its resolved manager, including retained
 * confirmation evidence after a failed check. Unresolved managers are excluded.
 * @param {{traffic_group:string,evidence:unknown,manager_relationships:{slug:string,status:string,relationship_type:string,evidence?:unknown}[],count:number}[]} groups
 * @param {{slug:string,name:string,manager_domains:string[]}[]} identities
 */
export function aggregateAdNetworkTrafficShares(groups, identities) {
  /** @type {Map<string,Map<string,{slug:string,name:string,count:number}>>} */
  const buckets = new Map();
  for (const group of groups) {
    const manager = deriveManagedBy(group.evidence, identities, group.manager_relationships).managed_by;
    if (!manager) continue;
    const counts = buckets.get(group.traffic_group) ?? new Map();
    buckets.set(group.traffic_group, counts);
    const row = counts.get(manager.slug) ?? { ...manager, count: 0 };
    row.count += group.count;
    counts.set(manager.slug, row);
  }
  return [...buckets].sort(([a], [b]) => a.localeCompare(b)).map(([traffic_group, counts]) => {
    const networks = [...counts.values()].sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
    const sites = networks.reduce((sum, row) => sum + row.count, 0);
    return { traffic_group, sites, networks: networks.map(row => ({ ...row, share: sites ? row.count / sites * 100 : 0 })) };
  });
}

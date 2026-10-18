#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { getDomain } from 'tldts';
import { openLocalDatabase } from './local-db.mjs';
import { assertLocalCatalog } from './identity-catalog.mjs';

export function mergeRdap(options) {
  if (resolve(options['local-database']) === resolve(options['source-sqlite'])) throw new Error('RDAP source must differ from working store');
  const source = new DatabaseSync(resolve(options['source-sqlite']), { readOnly: true });
  const target = options.apply ? openLocalDatabase(options['local-database']) : new DatabaseSync(options['local-database'], { readOnly: true });
  let merged = 0, dates = 0;
  try {
    assertLocalCatalog(source); assertLocalCatalog(target);
    target.exec(options.apply ? 'begin immediate' : 'begin');
    const roots = new Map();
    for (const site of target.prepare('select id,normalized_domain,domain_created_on from publishers').all()) {
      const root = getDomain(site.normalized_domain, { allowPrivateDomains: false });
      if (!roots.has(root)) roots.set(root, []); roots.get(root).push(site);
    }
    for (const row of source.prepare('select * from rdap_domains').all()) {
      const prior = target.prepare('select * from rdap_domains where domain=?').get(row.domain);
      const newer = !prior || row.checked_at > prior.checked_at;
      if (newer) {
        merged++;
        if (options.apply) target.prepare(`insert into rdap_domains(domain,status,registered_on,checked_at,retry_at,source_url) values(?,?,?,?,?,?)
          on conflict(domain) do update set status=excluded.status,registered_on=coalesce(excluded.registered_on,rdap_domains.registered_on),checked_at=excluded.checked_at,retry_at=excluded.retry_at,source_url=excluded.source_url`)
          .run(row.domain,row.status,row.registered_on,row.checked_at,row.retry_at,row.source_url);
      }
      const date = newer ? row.registered_on ?? prior?.registered_on : prior?.registered_on;
      if (date) for (const site of roots.get(row.domain) ?? []) if (site.domain_created_on !== date) {
        dates++;
        if (options.apply) target.prepare('update publishers set domain_created_on=? where id=?').run(date, site.id);
      }
    }
    target.exec(options.apply ? 'commit' : 'rollback');
    return { applied: options.apply, rdap_checkpoints: merged, publisher_dates: dates };
  } catch (error) { target.exec('rollback'); throw error; }
  finally { source.close(); target.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: { 'source-sqlite': { type: 'string' }, 'local-database': { type: 'string' }, apply: { type: 'boolean', default: false } } });
  if (!values['source-sqlite'] || !values['local-database']) throw new Error('Supply source-sqlite and local-database');
  console.log(JSON.stringify(mergeRdap(values)));
}

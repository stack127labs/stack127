import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { IDENTITY_CATALOG_VERSION, networkIdentities } from "./network-identities.mjs";

import { mergeRetiredLocalNetworks } from "./merge-identities.mjs";
import { assertLocalCatalog,localCatalogProblems,newerCatalog } from './identity-catalog.mjs';

export const defaultLocalDatabasePath = resolve(
  process.env.AD_NETWORK_DB_PATH ?? `${homedir()}/.local/share/stack127/ad-networks.sqlite`,
);

const schema = `
create table if not exists schema_meta (
  key text primary key,
  value text not null
);

create table if not exists ad_networks (
  id integer primary key,
  slug text not null unique,
  name text not null,
  manager_domains text not null,
  ad_system_domains text not null,
  program_signatures text not null,
  identity_reviewed_at text not null
);

create table if not exists publishers (
  id integer primary key,
  normalized_domain text not null unique,
  display_domain text not null,
  first_seen_at text not null,
  last_discovered_at text not null,
  last_checked_at text,
  check_status text not null default 'unverified',
  next_check_at text,
  lease_until text,
  verification_priority integer not null default 80,
  check_attempt_count integer not null default 0,
  consecutive_failures integer not null default 0,
  last_check_outcome text,
  last_check_evidence text not null default '{}',
  last_successful_check_at text,
  ads_txt_hash text,
  ads_txt_etag text,
  ads_txt_last_modified text,
  created_at text not null,
  updated_at text not null
);

create table if not exists publisher_sources (
  publisher_id integer not null references publishers(id) on delete cascade,
  source_key text not null,
  source_url text,
  domain_as_supplied text,
  license_attribution text,
  first_seen_at text not null,
  last_seen_at text not null,
  primary key (publisher_id, source_key)
);

create table if not exists relationships (
  ad_network_id integer not null references ad_networks(id),
  publisher_id integer not null references publishers(id) on delete cascade,
  status text not null,
  relationship_type text not null,
  verification_method text,
  evidence text not null default '{}',
  first_confirmed_at text,
  last_confirmed_at text,
  ended_at text,
  consecutive_misses integer not null default 0,
  first_missed_at text,
  last_missed_at text,
  created_at text not null,
  updated_at text not null,
  primary key (ad_network_id, publisher_id)
);

create table if not exists source_state (
  source_key text primary key,
  source_url text not null,
  etag text,
  last_modified text,
  candidate_count integer not null,
  completed_at text not null,
  last_status text not null default 'complete',
  last_error text
);

create table if not exists worker_runs (
  id integer primary key,
  worker text not null,
  started_at text not null,
  finished_at text,
  status text not null,
  summary text not null default '{}'
);

create table if not exists collector_checkpoints (
  source_key text primary key,
  cursor integer not null default 0,
  collected integer not null default 0,
  status text not null default 'pending',
  last_error text,
  updated_at text not null
);

create index if not exists publishers_queue_idx
  on publishers (verification_priority desc, next_check_at, id);
create index if not exists publishers_lease_idx on publishers (lease_until);
create index if not exists publishers_outcome_idx on publishers (last_check_outcome);
create index if not exists publisher_sources_key_idx on publisher_sources (source_key, publisher_id);
create index if not exists relationships_publisher_idx on relationships (publisher_id, status);
create index if not exists publishers_unchecked_idx on publishers (verification_priority desc, next_check_at, id)
  where last_check_outcome is null;
create index if not exists relationships_status_idx on relationships (status, ad_network_id, publisher_id);
create index if not exists worker_runs_worker_idx on worker_runs (worker, id desc);
`;

function seedNetworks(database) {
  const previousCatalog = database.prepare(
    "select value from schema_meta where key = 'identity_catalog_version'",
  ).get()?.value;
  const catalogChanged = previousCatalog !== IDENTITY_CATALOG_VERSION;
  if(newerCatalog(previousCatalog))throw new Error(`Refusing to downgrade identity catalog ${previousCatalog} to ${IDENTITY_CATALOG_VERSION}`);
  if (!catalogChanged && !localCatalogProblems(database).length) return;
  const statement = database.prepare(`
    insert into ad_networks (
      slug, name, manager_domains, ad_system_domains, program_signatures, identity_reviewed_at
    ) values (?, ?, ?, ?, ?, ?)
    on conflict(slug) do update set
      name = excluded.name,
      manager_domains = excluded.manager_domains,
      ad_system_domains = excluded.ad_system_domains,
      program_signatures = excluded.program_signatures,
      identity_reviewed_at = excluded.identity_reviewed_at
  `);
  database.exec("begin immediate");
  try {
    for (const network of networkIdentities) {
      statement.run(
        network.slug,
        network.name,
        JSON.stringify(network.managerDomains),
        JSON.stringify(network.adSystemDomains),
        JSON.stringify(network.programSignatures),
        network.identityReviewedAt,
      );
    }
    mergeRetiredLocalNetworks(database);
    database.prepare("insert or replace into schema_meta (key, value) values ('schema_version', '2')").run();
    database.prepare("insert or replace into schema_meta (key, value) values ('identity_catalog_version', ?)")
      .run(IDENTITY_CATALOG_VERSION);
    if (catalogChanged) {
      const now = new Date().toISOString();
      database.prepare(`
        update publishers
        set next_check_at = case
          when next_check_at is null or next_check_at > ? then ?
          else next_check_at
        end,
        updated_at = ?
        where last_checked_at is not null
      `).run(now, now, now);
    }
    assertLocalCatalog(database);
    database.exec("commit");
  } catch (error) {
    database.exec("rollback");
    throw error;
  }
}

let backedUpDay = null;
function requireDailyBackup(path) {
  // Only the homelab working store has this backup service. Tests and portable
  // stores do not acquire a hidden systemd dependency.
  const directory = '/srv/data/backups/stack127-ad-networks';
  if (process.platform !== 'linux' || path !== defaultLocalDatabasePath || !existsSync(directory) || !existsSync(path)) return;
  const day = new Date().toISOString().slice(0,10);
  if (backedUpDay === day) return;
  const file = `${directory}/ad-networks-${day}.sqlite`;
  if (!existsSync(file)) execFileSync('systemctl',['--user','start','stack127-ad-network-backup.service'],{timeout:300000,stdio:'pipe'});
  if (!existsSync(file)) throw new Error(`Daily SQLite backup is missing: ${file}`);
  backedUpDay = day;
}

export function openLocalDatabase(path = defaultLocalDatabasePath, options = {}) {
  const absolutePath = resolve(path);
  requireDailyBackup(absolutePath);
  mkdirSync(dirname(absolutePath), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(absolutePath, { timeout: options.timeout ?? 10_000 });
  // Long RDAP jobs can cross UTC midnight. Check before mutations as well as
  // at startup, so the next day's first write is protected by an online backup.
  const prepare = database.prepare.bind(database), exec = database.exec.bind(database);
  database.prepare = (sql) => {
    const statement = prepare(sql), run = statement.run.bind(statement);
    statement.run = (...args) => { requireDailyBackup(absolutePath); return run(...args); };
    return statement;
  };
  database.exec = (sql) => { requireDailyBackup(absolutePath); return exec(sql); };
  database.exec("pragma journal_mode = WAL");
  database.exec("pragma synchronous = NORMAL");
  database.exec("pragma foreign_keys = ON");
  database.exec("pragma busy_timeout = 10000");
  database.exec("pragma wal_autocheckpoint = 1000");
  database.exec(schema);
  const columns = new Set(database.prepare('pragma table_info(publishers)').all().map(row => row.name));
  for (const name of ['niche','publisher_name','platform','domain_created_on','traffic_group','ads_txt_summary','favicon']) {
    if (!columns.has(name)) database.exec(`alter table publishers add column ${name} text`);
  }
  database.exec(`create table if not exists enrichment_state (
    publisher_id integer not null references publishers(id), kind text not null,
    status text not null, checked_at text not null, retry_at text, data text not null default '{}',
    primary key (publisher_id,kind));
    create table if not exists rdap_domains (domain text primary key, status text not null,
    registered_on text, checked_at text not null, retry_at text, source_url text);
    create table if not exists seller_names (network_slug text not null, seller_id text not null,
    domain text not null, name text not null, source_url text not null,
    primary key(network_slug,seller_id,domain));`);
  try {seedNetworks(database);}catch(error){database.close();throw error;}
  return database;
}

export function loadLocalNetworks(database) {
  return database.prepare(`
    select id, slug, name, manager_domains, ad_system_domains,
      program_signatures, identity_reviewed_at
    from ad_networks order by id
  `).all().map((row) => ({
    ...row,
    manager_domains: JSON.parse(row.manager_domains),
    ad_system_domains: JSON.parse(row.ad_system_domains),
    program_signatures: JSON.parse(row.program_signatures),
  }));
}

export function recordWorkerRun(database, worker, status, summary = {}, startedAt = new Date().toISOString()) {
  const now = new Date().toISOString();
  database.prepare(`
    insert into worker_runs (worker, started_at, finished_at, status, summary)
    values (?, ?, ?, ?, ?)
  `).run(worker, startedAt, now, status, JSON.stringify(summary));
}

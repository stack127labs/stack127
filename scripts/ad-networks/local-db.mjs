import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { IDENTITY_CATALOG_VERSION, networkIdentities } from "./network-identities.mjs";

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
create index if not exists relationships_status_idx on relationships (status, ad_network_id, publisher_id);
create index if not exists worker_runs_worker_idx on worker_runs (worker, id desc);
`;

function seedNetworks(database) {
  const previousCatalog = database.prepare(
    "select value from schema_meta where key = 'identity_catalog_version'",
  ).get()?.value;
  const catalogChanged = previousCatalog !== IDENTITY_CATALOG_VERSION;
  if (!catalogChanged) return;
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
    database.exec("commit");
  } catch (error) {
    database.exec("rollback");
    throw error;
  }
}

export function openLocalDatabase(path = defaultLocalDatabasePath, options = {}) {
  const absolutePath = resolve(path);
  mkdirSync(dirname(absolutePath), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(absolutePath, { timeout: options.timeout ?? 10_000 });
  database.exec("pragma journal_mode = WAL");
  database.exec("pragma synchronous = NORMAL");
  database.exec("pragma foreign_keys = ON");
  database.exec("pragma busy_timeout = 10000");
  database.exec("pragma wal_autocheckpoint = 1000");
  database.exec(schema);
  seedNetworks(database);
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

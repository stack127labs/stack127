#!/usr/bin/env node

// The source connection is read-only. Only the database in .env.local is written.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs, parseEnv } from 'node:util';
import pg from 'pg';
import { parse as parseConnectionString } from 'pg-connection-string';

export function preserveDevelopmentPublication(productionRows, developmentRows) {
  const previews = new Map(developmentRows.filter((row) => isDraftRoute(row.slug)).map((row) => [row.slug, row]));
  return productionRows.map((row) => {
    const preview = previews.get(row.slug);
    return preview ? { ...row, is_published: preview.is_published, published_at: preview.published_at, updated_at: preview.updated_at } : row;
  });
}

export function remapDevelopmentPageIds(rows, fields, developmentPages, restoredPages) {
  const slugById = new Map(developmentPages.map(row => [String(row.id), row.slug]));
  const idBySlug = new Map(restoredPages.map(row => [row.slug, row.id]));
  return rows.map(row => {
    const restored = { ...row };
    for (const field of fields) {
      const id = idBySlug.get(slugById.get(String(row[field])));
      if (id === undefined) throw new Error(`Cannot restore ${field}: its registry page is missing`);
      restored[field] = id;
    }
    return restored;
  });
}

function isDraftRoute(slug) {
  return ['ad-networks', 'launch-directories', 'platform-fees'].includes(slug) || slug.startsWith('platform-fees/') || slug.startsWith('ad-networks/');
}

export function planForwardMigrations(productionVersions, developmentVersions, repositoryVersions) {
  const production = new Set(productionVersions);
  const development = new Set(developmentVersions);
  const repository = new Set(repositoryVersions);
  const latestProduction = [...production].sort().at(-1) ?? '';
  const missingProduction = [...production].filter((version) => !development.has(version));
  const unknownDevelopment = [...development].filter((version) => !production.has(version) && (!repository.has(version) || version <= latestProduction));
  const missingFiles = [...production, ...development].filter((version) => !repository.has(version));
  if (missingProduction.length || unknownDevelopment.length || missingFiles.length) {
    throw new Error(`Migration history has drift (${missingProduction.length} production versions missing, ${unknownDevelopment.length} old development versions, ${missingFiles.length} versions without files). Do not replay old SQL. Back up development, verify its schema, then run --apply --copy --verify --align-history --history-backup <path>.`);
  }
  if (repository.size !== repositoryVersions.length) throw new Error('Duplicate migration versions in repository');
  const pending = [...repository].filter((version) => !development.has(version)).sort();
  const latestDevelopment = [...development].sort().at(-1) ?? '';
  if (pending.some((version) => version <= latestProduction || version <= latestDevelopment)) throw new Error('Only forward migrations may be applied; repair canonical history first');
  return pending;
}

async function main() {
  const { values } = parseArgs({ options: {
    apply: { type: 'boolean', default: false },
    migrate: { type: 'boolean', default: false },
    copy: { type: 'boolean', default: false },
    verify: { type: 'boolean', default: false },
    'align-history': { type: 'boolean', default: false },
    'history-backup': { type: 'string' },
  } });

  if (values['align-history'] && (!values.apply || !values.copy || !values.verify || values.migrate || !values['history-backup'])) {
    throw new Error('--align-history requires --apply --copy --verify --history-backup <path>, without --migrate');
  }

  const tables = [
    'github_projects', 'self_host_app_categories', 'self_host_apps',
    'self_host_app_candidates', 'self_host_app_category_links',
    'self_host_app_resource_estimates', 'self_host_app_install_options',
    'terminal_app_import_runs', 'terminal_apps', 'terminal_app_candidates',
    'terminal_app_field_sources', 'stack127_pages', 'stack127_tool_pages',
    'stack127_catalog_pages', 'stack127_directory_pages', 'stack127_tool_catalog_memberships',
  ];
  const sourceEnv = parseEnv(await readFile('.env.database', 'utf8'));
  const targetEnv = parseEnv(await readFile('.env.local', 'utf8'));
  const sourceUrl = sourceEnv.DATABASE_POOLER_URL || sourceEnv.DATABASE_URL;
  const targetUrl = targetEnv.DATABASE_POOLER_URL || targetEnv.DATABASE_URL;
  function projectIdentity(url) {
    const parsed = new URL(url);
    if (parsed.hostname.startsWith('db.') && parsed.hostname.endsWith('.supabase.co')) return parsed.hostname.split('.')[1];
    const user = decodeURIComponent(parsed.username);
    if (parsed.hostname.endsWith('.pooler.supabase.com') && user.startsWith('postgres.')) return user.slice('postgres.'.length);
    return `${parsed.hostname}/${decodeURIComponent(parsed.username)}`;
  }
  if (!sourceUrl || !targetUrl || projectIdentity(sourceUrl) === projectIdentity(targetUrl)) {
    throw new Error('Production and development must be distinct database projects');
  }
  if (sourceEnv.SUPABASE_URL && sourceEnv.SUPABASE_URL === targetEnv.SUPABASE_URL) {
    throw new Error('Production and development API URLs must differ');
  }
  const sourceConfig = parseConnectionString(sourceUrl);
  if (process.env.STACK127_SOURCE_DATABASE_ADDRESS) sourceConfig.host = process.env.STACK127_SOURCE_DATABASE_ADDRESS;
  const source = new pg.Client({ ...sourceConfig, connectionTimeoutMillis: 15000,
    options: '-c default_transaction_read_only=on', application_name: 'stack127-development-source-read-only' });
  const target = new pg.Client({ connectionString: targetUrl, connectionTimeoutMillis: 15000,
    application_name: 'stack127-development-rebuild', query_timeout: 120000 });
  const identifier = (value) => `"${value.replaceAll('"', '""')}"`;
  const tableName = (name) => `public.${identifier(name)}`;

  async function migrate() {
    const applied = (await target.query('select version from supabase_migrations.schema_migrations')).rows.map((row) => row.version);
    const production = (await source.query('select version from supabase_migrations.schema_migrations')).rows.map((row) => row.version);
    const files = (await readdir('supabase/migrations')).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
    const pending = new Set(planForwardMigrations(production, applied, files.map((file) => file.split('_')[0])));
    for (const file of files) {
      const [version] = file.split('_');
      if (!pending.has(version)) continue;
      const original = await readFile(`supabase/migrations/${file}`, 'utf8');
      const ownsTransaction = /^begin;\s*$/im.test(original);
      // Preserve deliberate commit boundaries, including enum additions used later.
      if (!ownsTransaction) await target.query('begin');
      try {
        await target.query(original);
        await target.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',
          [version, file.slice(version.length + 1, -4), [original]]);
        if (!ownsTransaction) await target.query('commit');
        console.log(JSON.stringify({ migration: file, status: 'applied' }));
      } catch (error) {
        await target.query('rollback');
        throw new Error(`Migration ${file}: ${error.message}`);
      }
    }
  }

  async function columns(client, name) {
    return (await client.query(`select column_name,data_type,udt_name,is_identity,is_generated,column_default
      from information_schema.columns where table_schema='public' and table_name=$1
      order by ordinal_position`, [name])).rows;
  }

  async function verifySchema() {
    const queries = {
      relations: `select c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity from pg_class c
        join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','S') order by c.relname`,
      columns: `select c.relname,a.attname,format_type(a.atttypid,a.atttypmod) type,a.attnotnull,a.attidentity,a.attgenerated,
        pg_get_expr(d.adbin,d.adrelid) default_value from pg_attribute a join pg_class c on c.oid=a.attrelid
        join pg_namespace n on n.oid=c.relnamespace left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
        where n.nspname='public' and c.relkind in ('r','p','v','m') and a.attnum>0 and not a.attisdropped order by c.relname,a.attnum`,
      constraints: `select c.relname,k.conname,pg_get_constraintdef(k.oid) definition from pg_constraint k
        join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' order by c.relname,k.conname`,
      indexes: `select tablename,indexname,indexdef from pg_indexes where schemaname='public'
        and indexname<>'open_projects_source_model_idx' order by tablename,indexname`,
      functions: `select p.proname,pg_get_function_identity_arguments(p.oid) arguments,pg_get_functiondef(p.oid) definition
        from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind in ('f','p')
        order by p.proname,pg_get_function_identity_arguments(p.oid)`,
      enums: `select t.typname,e.enumsortorder,e.enumlabel from pg_type t join pg_namespace n on n.oid=t.typnamespace
        join pg_enum e on e.enumtypid=t.oid where n.nspname='public' order by t.typname,e.enumsortorder`,
      triggers: `select c.relname,t.tgname,t.tgenabled,pg_get_triggerdef(t.oid) definition from pg_trigger t
        join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and not t.tgisinternal order by c.relname,t.tgname`,
      policies: `select tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname='public' order by tablename,policyname`,
      views: `select c.relname,pg_get_viewdef(c.oid,true) definition,c.reloptions from pg_class c
        join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('v','m') order by c.relname`,
      tableGrants: `select c.relname,case when x.grantee=0 then 'PUBLIC' else pg_get_userbyid(x.grantee)::text end grantee,x.privilege_type,x.is_grantable
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        cross join lateral aclexplode(coalesce(c.relacl,acldefault(case when c.relkind='S' then 's'::"char" else 'r'::"char" end,c.relowner))) x
        where n.nspname='public' and c.relkind in ('r','p','v','m','S') order by c.relname,grantee,x.privilege_type,x.is_grantable`,
      functionGrants: `select p.proname,pg_get_function_identity_arguments(p.oid) arguments,
        case when x.grantee=0 then 'PUBLIC' else pg_get_userbyid(x.grantee)::text end grantee,x.privilege_type,x.is_grantable
        from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        cross join lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) x
        where n.nspname='public' and p.prokind in ('f','p') order by p.proname,arguments,grantee,x.privilege_type,x.is_grantable`,
    };
    for (const [kind, query] of Object.entries(queries)) {
      const original = (await source.query(query)).rows;
      const current = (await target.query(query)).rows;
      if (JSON.stringify(original) !== JSON.stringify(current)) throw new Error(`Public schema mismatch: ${kind}. Resolve it before aligning history; no history entries were replaced.`);
    }
    console.log(JSON.stringify({ publicSchemaMatches: true, allowedDevelopmentIndex: 'open_projects_source_model_idx' }));
  }

  async function alignHistory() {
    const history = (await source.query('select version,name,statements from supabase_migrations.schema_migrations order by version')).rows;
    const files = (await readdir('supabase/migrations')).filter((name) => /^\d+_.+\.sql$/.test(name)).map((name) => name.split('_')[0]).sort();
    if (JSON.stringify(files) !== JSON.stringify(history.map((row) => row.version))) throw new Error('Repository and production migration versions must match before aligning development history');
    await target.query('lock table supabase_migrations.schema_migrations in exclusive mode');
    const previous = (await target.query('select version,name,statements from supabase_migrations.schema_migrations order by version')).rows;
    await writeFile(values['history-backup'], JSON.stringify({ developmentProject: projectIdentity(targetUrl), savedAt: new Date().toISOString(), history: previous }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    await target.query('delete from supabase_migrations.schema_migrations');
    for (const row of history) await target.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)', [row.version,row.name,row.statements]);
    const current = (await target.query('select version,name,statements from supabase_migrations.schema_migrations order by version')).rows;
    if (JSON.stringify(history) !== JSON.stringify(current)) throw new Error('Migration history verification failed');
    console.log(JSON.stringify({ developmentMigrationHistoryAligned: history.length, previousVersions: previous.length }));
  }

  async function snapshotRows(name) {
    const rows = [];
    await source.query(`declare recovery_snapshot no scroll cursor for select to_jsonb(record) payload from ${tableName(name)} record`);
    try {
      while (true) {
        const batch = (await source.query('fetch forward 250 from recovery_snapshot')).rows;
        rows.push(...batch.map((row) => row.payload));
        if (batch.length < 250) return rows;
      }
    } finally { await source.query('close recovery_snapshot'); }
  }

  async function copy() {
    const snapshot = new Map();
    if (values['align-history']) await verifySchema();
    for (const name of tables) {
        const sourceColumns = await columns(source, name);
        const targetColumns = await columns(target, name);
        const sourceShape = sourceColumns.map(({column_name,data_type,udt_name}) => ({column_name,data_type,udt_name}));
        const targetShape = targetColumns.map(({column_name,data_type,udt_name}) => ({column_name,data_type,udt_name}));
        if (JSON.stringify(sourceShape) !== JSON.stringify(targetShape)) throw new Error(`Schema mismatch for ${name}`);
        const rows = await snapshotRows(name);
        snapshot.set(name, { rows, columns: targetColumns.filter((column) => column.is_generated === 'NEVER') });
        console.log(JSON.stringify({ table: name, snapshotRows: rows.length }));
      }

    const prodSlugs = new Set(snapshot.get('stack127_pages').rows.map((row) => row.slug));
    await target.query('begin');
    try {
      await target.query(`lock table ${tables.map(tableName).join(', ')} in share row exclusive mode`);
      const developmentPages = (await target.query('select to_jsonb(record) payload from public.stack127_pages record')).rows.map((row) => row.payload);
      const extraPages = developmentPages.filter((row) => !prodSlugs.has(row.slug));
      const extraPageIds = new Set(extraPages.map(row => String(row.id)));
      const extraContent = new Map();
      for (const name of ['stack127_tool_pages', 'stack127_catalog_pages', 'stack127_directory_pages']) {
        const rows = (await target.query(`select to_jsonb(record) payload from ${tableName(name)} record
          where page_id=any($1::bigint[])`, [[...extraPageIds]])).rows.map(row => row.payload);
        extraContent.set(name, rows);
      }
      const extraMemberships = (await target.query(`select * from public.stack127_tool_catalog_memberships
        where catalog_page_id=any($1::bigint[]) or tool_page_id=any($1::bigint[])`, [[...extraPageIds]])).rows;
      snapshot.get('stack127_pages').rows = preserveDevelopmentPublication(snapshot.get('stack127_pages').rows, developmentPages);
      const triggerStates = (await target.query(`select c.relname,t.tgname,t.tgenabled from pg_trigger t
        join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname=any($1::text[]) and not t.tgisinternal`, [tables])).rows;
      const foreignKeys = (await target.query(`select table_name.relname as table_name,
        constraint_row.conname, constraint_row.condeferrable, constraint_row.condeferred
        from pg_constraint constraint_row
        join pg_class table_name on table_name.oid=constraint_row.conrelid
        join pg_namespace namespace on namespace.oid=table_name.relnamespace
        where constraint_row.contype='f' and namespace.nspname='public'
          and table_name.relname=any($1::text[])`, [tables])).rows;
      // Candidate duplicates refer to other candidates, including later batches.
      // Defer their checks until the complete snapshot is present, then restore the schema.
      for (const key of foreignKeys) await target.query(`alter table ${tableName(key.table_name)}
        alter constraint ${identifier(key.conname)} deferrable initially deferred`);
      await target.query('set constraints all deferred');
      for (const name of tables) await target.query(`alter table ${tableName(name)} disable trigger user`);
      // No CASCADE: fail if an unexpected dependent table would be affected.
      await target.query(`truncate table ${tables.map(tableName).join(', ')} restart identity`);
      for (const name of tables) {
        const { rows, columns: fields } = snapshot.get(name);
        const names = fields.map((column) => identifier(column.column_name)).join(', ');
        for (let offset=0; offset<rows.length; offset+=200) {
          await target.query(`insert into ${tableName(name)} (${names}) overriding system value
            select ${names} from jsonb_populate_recordset(null::${tableName(name)}, $1::jsonb)`,
            [JSON.stringify(rows.slice(offset, offset+200))]);
        }
        console.log(JSON.stringify({ table: name, copied: rows.length }));
      }
      await resetSequences();
      const pageFields = snapshot.get('stack127_pages').columns.filter((column) => column.is_identity !== 'YES' && column.column_name !== 'id');
      const names = pageFields.map((column) => identifier(column.column_name)).join(', ');
      if (extraPages.length) await target.query(`insert into public.stack127_pages (${names})
        select ${names} from jsonb_populate_recordset(null::public.stack127_pages,$1::jsonb)`, [JSON.stringify(extraPages)]);
      const currentPages = (await target.query('select id,slug from public.stack127_pages')).rows;
      for (const [name, rows] of extraContent) {
        if (!rows.length) continue;
        const remapped = remapDevelopmentPageIds(rows, ['page_id'], developmentPages, currentPages);
        const fields = snapshot.get(name).columns.map(column => identifier(column.column_name)).join(', ');
        await target.query(`insert into ${tableName(name)} (${fields})
          select ${fields} from jsonb_populate_recordset(null::${tableName(name)},$1::jsonb)`, [JSON.stringify(remapped)]);
      }
      if (extraMemberships.length) await target.query(`insert into public.stack127_tool_catalog_memberships
        select * from jsonb_populate_recordset(null::public.stack127_tool_catalog_memberships,$1::jsonb)`,
        [JSON.stringify(remapDevelopmentPageIds(extraMemberships, ['catalog_page_id', 'tool_page_id'], developmentPages, currentPages))]);
      await target.query('set constraints all immediate');
      for (const key of foreignKeys) await target.query(`alter table ${tableName(key.table_name)}
        alter constraint ${identifier(key.conname)} ${key.condeferrable
          ? `deferrable initially ${key.condeferred ? 'deferred' : 'immediate'}` : 'not deferrable'}`);
      for (const trigger of triggerStates) {
        const action = { O: 'enable', D: 'disable', R: 'enable replica', A: 'enable always' }[trigger.tgenabled];
        await target.query(`alter table ${tableName(trigger.relname)} ${action} trigger ${identifier(trigger.tgname)}`);
      }
      await target.query('truncate public.stack127_revalidation_events, public.stack127_cache_warm_events');
      await target.query("notify pgrst,'reload schema'");
      if (values.verify) await verify(snapshot.get('stack127_pages').rows.filter((row) => isDraftRoute(row.slug)));
      if (values['align-history']) { await verifySchema(); await alignHistory(); }
      await target.query('commit');
      console.log(JSON.stringify({ preservedDevelopmentPages: extraPages.length, preservedDraftPreviewFlags: developmentPages.filter((row) => isDraftRoute(row.slug) && row.is_published).length }));
    } catch(error) { await target.query('rollback'); throw error; }
  }

  async function resetSequences() {
    for (const name of tables) {
      const fields = await columns(target, name);
      for (const field of fields.filter((field) => field.is_identity === 'YES' || field.column_default?.startsWith('nextval('))) {
        const sequence = (await target.query('select pg_get_serial_sequence($1,$2) sequence', [tableName(name), field.column_name])).rows[0].sequence;
        if (sequence) {
          const nextValue = (await target.query(`select coalesce(max(${identifier(field.column_name)})+1,1)::text next_value from ${tableName(name)}`)).rows[0].next_value;
          // ALTER SEQUENCE rolls back with the data restore; setval does not.
          await target.query(`alter sequence ${sequence} restart with ${BigInt(nextValue)}`);
        }
      }
    }
  }

  function verificationPayload(name) {
    return name === 'stack127_pages'
      ? "case when slug in ('ad-networks','launch-directories','platform-fees') or slug like 'platform-fees/%' or slug like 'ad-networks/%' then to_jsonb(record)-'is_published'-'published_at'-'updated_at' else to_jsonb(record) end"
      : 'to_jsonb(record)';
  }

  async function verify(expectedDraftPages) {
    if (expectedDraftPages) {
      const current = new Map((await target.query('select to_jsonb(record) payload from public.stack127_pages record where slug=any($1::text[])', [expectedDraftPages.map((row) => row.slug)])).rows.map(({payload}) => [payload.slug,payload]));
      for (const expected of expectedDraftPages) {
        const actual = current.get(expected.slug);
        if (!actual || actual.is_published !== expected.is_published || actual.published_at !== expected.published_at || actual.updated_at !== expected.updated_at) throw new Error(`Development preview was not preserved: ${expected.slug}`);
      }
    }
    const productionSlugs = (await source.query('select slug from public.stack127_pages')).rows.map((row) => row.slug);
    for (const name of tables) {
      const count = (await target.query(`select count(*)::int count from ${tableName(name)}`)).rows[0].count;
      const original = (await source.query(`select count(*)::int count from ${tableName(name)}`)).rows[0].count;
      if (name !== 'stack127_pages' && count !== original) throw new Error(`Count mismatch for ${name}`);
      const sourceHash = (await source.query(`select md5(coalesce(string_agg(payload::text,'' order by payload::text),'')) digest
        from (select ${verificationPayload(name)} payload from ${tableName(name)} record) records`)).rows[0].digest;
      const targetHash = (await target.query(`select md5(coalesce(string_agg(payload::text,'' order by payload::text),'')) digest
        from (select ${verificationPayload(name)} payload from ${tableName(name)} record
        ${name === 'stack127_pages' ? 'where slug=any($1::text[])' : ''}) records`,
        name === 'stack127_pages' ? [productionSlugs] : [])).rows[0].digest;
      if (sourceHash !== targetHash) throw new Error(`Content mismatch for ${name}`);
      console.log(JSON.stringify({ table: name, source: original, development: count, contentMatches: true }));
    }
    console.log(JSON.stringify({size:(await target.query('select pg_size_pretty(pg_database_size(current_database())) size')).rows[0].size}));
  }

  try {
    if (values.copy || values.verify || values.migrate) {
      await source.connect();
      await source.query('begin isolation level repeatable read read only');
    }
    await target.connect();
    if (values.apply && values.migrate) await migrate();
    if (values.apply && values.copy) await copy();
    if (values.verify && !(values.apply && values.copy)) await verify();
    if (!values.apply && !values.verify) console.log(JSON.stringify({mode:'dry_run',tables,excluded:['ads publishers','platform fee data','RDAP cache','cache queue','production cache signing key']}));
  } catch(error) {
    console.error(error.message.replace(/postgres(?:ql)?:\/\/\S+/g,'[redacted]'));
    process.exitCode=1;
  } finally { await source.end(); await target.end(); }

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

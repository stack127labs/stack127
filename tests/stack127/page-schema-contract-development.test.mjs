import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import pg from 'pg';
import {resolveDatabaseUrl} from '../../scripts/stack127/tool-pages/lib.mjs';
import {executeBatch,readStates} from '../../scripts/stack127/publishing/database.mjs';

const enabled=process.env.STACK127_TEST_DEVELOPMENT_DATABASE==='1';
const withoutTransaction=sql=>sql.replace(/^begin;\s*$/gim,'').replace(/^commit;\s*$/gim,'');
const retired=['heading_before','heading_mark','heading_after','intro','section_heading','hero_art_key','home_order','content_revision','intro_markdown','usage_markdown','content_markdown'];
const catalogColumns='card_name,card_description,page_id,title,card_icon_key,card_art_key,display_order';
const toolColumns='page_id,title,card_name,card_description,tool_version,tool_version_updated_at,stack127_repo_url,stack127_repo_version,stack127_repo_commit_sha,stack127_repo_synced_at';
const directoryColumns='page_id,title,card_name,card_description,card_icon_key,card_art_key,row_updated_at';

test('development contract preserves content and dates, supports current readers, and guards writes',{skip:!enabled},async()=>{
  const client=new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000});
  await client.connect();
  const dates=async()=> (await client.query('select slug,published_at::text,updated_at::text from public.stack127_pages order by slug')).rows;
  const copy=async()=> (await client.query(`select * from (select 'catalog' family,to_jsonb(content)-$1::text[] content from public.stack127_catalog_pages content
    union all select 'tool',to_jsonb(content)-$1::text[] from public.stack127_tool_pages content
    union all select 'directory',to_jsonb(content)-$1::text[] from public.stack127_directory_pages content) rows order by family,content::text`,[retired])).rows;
  async function rejected(sql,pattern){
    await client.query('savepoint invalid_write');
    await assert.rejects(client.query(sql),pattern);
    await client.query('rollback to savepoint invalid_write');
  }
  try {
    await client.query('begin');
    const beforeDates=await dates();const beforeCopy=await copy();
    const expanded=(await client.query("select exists(select 1 from information_schema.columns where table_schema='public' and table_name='stack127_catalog_pages' and column_name='heading_before') present")).rows[0].present;
    if(expanded) await client.query(withoutTransaction(await readFile(new URL('../../supabase/migrations/20261006185439_contract_legacy_page_columns.sql',import.meta.url),'utf8')));
    assert.deepEqual(await dates(),beforeDates);assert.deepEqual(await copy(),beforeCopy);
    assert.equal((await client.query("select column_name from information_schema.columns where table_schema='public' and table_name=any($1) and column_name=any($2)",[['stack127_catalog_pages','stack127_tool_pages','stack127_directory_pages'],retired])).rowCount,0);
    assert.equal((await client.query("select to_regprocedure('public.stack127_sync_catalog_legacy_columns()') sync,to_regprocedure('public.prepare_stack127_directory_page_update()') directory")).rows[0].sync,null);
    assert.equal((await client.query("select to_regprocedure('public.prepare_stack127_directory_page_update()') directory")).rows[0].directory,null);
    for(const role of ['postgres','anon']){
      await client.query(`set local role ${role}`);
      for(const [table,columns] of [['stack127_catalog_pages',catalogColumns],['stack127_tool_pages',toolColumns],['stack127_directory_pages',directoryColumns]]){
        assert.ok((await client.query(`select ${columns} from public.${table}`)).rowCount>0);
      }
      assert.ok((await client.query('select * from public.stack127_course_pages')).rowCount>0);
      assert.ok((await client.query('select * from public.stack127_course_lessons order by display_order')).rowCount>0);
      await client.query('reset role');
    }
    await client.query('update public.stack127_catalog_pages set title=title,display_order=display_order');
    await client.query('update public.stack127_tool_pages set title=title,tool_version=tool_version');
    await client.query('update public.stack127_directory_pages set title=title');
    assert.deepEqual(await dates(),beforeDates);
    const tool=(await client.query('select page_id,tool_version_updated_at from public.stack127_tool_pages order by page_id limit 1')).rows[0];
    await rejected(`update public.stack127_tool_pages set tool_version_updated_at=tool_version_updated_at+interval '1 second' where page_id=${tool.page_id}`,/changes only with tool_version/);
    const updated=(await client.query("update public.stack127_tool_pages set tool_version='99.0.0' where page_id=$1 returning tool_version_updated_at=now() refreshed",[tool.page_id])).rows[0];
    assert.equal(updated.refreshed,true);
    await rejected("update public.stack127_catalog_pages set card_art_key='Bad key'",/asset_check/);
    await rejected("update public.stack127_catalog_pages set title=' '",/title_check/);
    await client.query(`insert into public.stack127_pages(id,slug,label,meta_title,meta_description,page_family,is_published)
      overriding system value values(-90002,'catalog-contract-test','Test catalog','Test catalog','Test catalog description','catalog',false)`);
    const inserted=(await client.query(`insert into public.stack127_catalog_pages(page_id,title,card_name,card_description,card_icon_key,card_art_key)
      values(-90002,'New catalog','New catalog','New description','network','dns-tools') returning display_order`)).rows[0];
    assert.equal(inserted.display_order,100);
    assert.deepEqual((await client.query('select published_at,updated_at from public.stack127_pages where id=-90002')).rows[0],{published_at:null,updated_at:null});
    assert.ok((await client.query("select * from public.stack127_cache_source_revisions(array['page'],array['dns-tools'])")).rowCount>0);
  } finally {await client.query('rollback');await client.end();}
});

test('release preparation preserves old words and lets the publisher create metadata with columns present or absent',{skip:!enabled},async()=>{
  const client=new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000});
  await client.connect();
  const preparation=withoutTransaction(await readFile(new URL('../../supabase/migrations/20261010064142_prepare_page_content_retirement.sql',import.meta.url),'utf8'));
  const dates=async()=> (await client.query('select slug,published_at::text,updated_at::text from public.stack127_pages order by slug')).rows;
  const tables={tool:['intro_markdown','usage_markdown','content_markdown'],directory:['intro_markdown','content_markdown'],catalog:['intro_markdown','content_markdown']};
  const transactionalPool={connect:async()=>({query:async(sql,args)=>{
    if(sql.startsWith('begin')) return client.query('savepoint publishing_compatibility_test');
    if(sql==='commit') return client.query('release savepoint publishing_compatibility_test');
    if(sql==='rollback') return client.query('rollback to savepoint publishing_compatibility_test');
    return client.query(sql,args);
  },release(){}})};
  try {
    await client.query('begin');
    // Restore the original schema and archived values only inside this rollback.
    for(const [family,fields] of Object.entries(tables)){
      const table=`stack127_${family}_pages`;
      for(const field of fields){
        await client.query(`alter table public.${table} add column ${field} text`);
        await client.query(`update public.${table} live set ${field}=archive.value
          from public.stack127_retired_page_content archive
          where archive.page_id=live.page_id and archive.table_name=$1 and archive.column_name=$2`,[table,field]);
        await client.query(`alter table public.${table} add constraint compatibility_${field}_check
          check (${field}=btrim(${field}) and length(${field})>0)`);
        if(field==='intro_markdown' || family==='tool' && field==='content_markdown'){
          await client.query(`alter table public.${table} alter column ${field} set not null`);
        }
      }
    }
    const words=async()=> (await client.query(`select * from (
      select 'tool' family,page_id,intro_markdown,content_markdown,usage_markdown from public.stack127_tool_pages
      union all select 'directory',page_id,intro_markdown,content_markdown,null from public.stack127_directory_pages
      union all select 'catalog',page_id,intro_markdown,content_markdown,null from public.stack127_catalog_pages
    ) content order by family,page_id`)).rows;
    const originalWords=await words();const originalDates=await dates();
    await client.query(preparation);
    assert.deepEqual(await words(),originalWords);
    assert.deepEqual(await dates(),originalDates);
    assert.equal((await client.query(`select * from information_schema.columns where table_schema='public'
      and table_name=any($1) and column_name=any($2) and is_nullable='NO'`,[
      Object.keys(tables).map(family=>`stack127_${family}_pages`),['intro_markdown','usage_markdown','content_markdown'],
    ])).rowCount,0);
    for(const present of [true,false]){
      if(!present){
        for(const [family,fields] of Object.entries(tables)){
          await client.query(`alter table public.stack127_${family}_pages ${fields.map(field=>`drop column ${field}`).join(',')}`);
        }
      }
      for(const [family,source] of [['tool','dns-lookup'],['directory','tld-directory'],['catalog','dns-tools']]){
        const [original]=await readStates(client,[{slug:source,family}]);
        const after={...original,slug:`compatibility-${family}-${present?'present':'absent'}`,
          registry:{...original.registry,is_published:false},...(family==='tool'?{catalogs:[]}:{}),
        };
        await executeBatch(transactionalPool,[{slug:after.slug,family,before:null,after}],{apply:true});
        assert.deepEqual(await readStates(client,[{slug:after.slug,family}]),[after]);
        if(present){
          const fields=tables[family];
          const row=(await client.query(`select ${fields.join(',')} from public.stack127_${family}_pages
            where page_id=(select id from public.stack127_pages where slug=$1)`,[after.slug])).rows[0];
          assert.ok(fields.every(field=>row[field]===null));
        }
      }
    }
    const afterDates=await dates();await client.query(preparation);assert.deepEqual(await dates(),afterDates);
  } finally {await client.query('rollback');await client.end();}
});

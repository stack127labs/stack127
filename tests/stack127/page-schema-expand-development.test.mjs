import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import pg from 'pg';
import {resolveDatabaseUrl} from '../../scripts/stack127/tool-pages/lib.mjs';

const enabled=process.env.STACK127_TEST_DEVELOPMENT_DATABASE==='1';
// These are the deployed origin/main readers, including the Data API column lists.
const oldCatalogColumns='card_name,card_description,page_id,heading_before,heading_mark,heading_after,intro,section_heading,card_icon_key,hero_art_key,card_art_key,home_order';
const oldToolColumns='page_id,title,card_name,card_description,intro_markdown,usage_markdown,content_markdown,content_revision,tool_version,tool_version_updated_at,stack127_repo_url,stack127_repo_version,stack127_repo_commit_sha,stack127_repo_synced_at';
const oldDirectoryColumns='page_id,title,intro_markdown,content_markdown,content_revision,card_name,card_description,card_icon_key,card_art_key,row_updated_at';
const newCatalogColumns='card_name,card_description,page_id,title,intro_markdown,content_markdown,card_icon_key,card_art_key,display_order';
const withoutTransaction=sql=>sql.replace(/^begin;\s*$/gim,'').replace(/^commit;\s*$/gim,'');

test('development expand schema supports both app generations and the later contract',{skip:!enabled},async()=>{
  const client=new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000});
  await client.connect();
  async function scenario(name,fn){await client.query('begin');try{await fn();console.log(`Passed: ${name}`);}finally{await client.query('rollback');}}
  async function oldReads(){
    const catalogs=await client.query(`select ${oldCatalogColumns} from public.stack127_catalog_pages order by home_order`);
    const tools=await client.query(`select ${oldToolColumns} from public.stack127_tool_pages`);
    const directories=await client.query(`select ${oldDirectoryColumns} from public.stack127_directory_pages`);
    assert.ok(catalogs.rowCount>0);assert.ok(tools.rowCount>0);assert.ok(directories.rowCount>0);
    const joined=await client.query(`select tool.page_id,page.slug,tool.content_revision,tool.title,tool.intro_markdown,tool.usage_markdown,tool.content_markdown,tool.tool_version,tool.tool_version_updated_at,tool.stack127_repo_url,tool.stack127_repo_version,tool.stack127_repo_commit_sha,tool.stack127_repo_synced_at,page.published_at,page.updated_at from public.stack127_tool_pages tool join public.stack127_pages page on page.id=tool.page_id where page.page_family='tool' and page.is_published limit 1`);
    assert.equal(joined.rowCount,1);
    await client.query('set local role anon');
    assert.ok((await client.query(`select ${oldCatalogColumns} from public.stack127_catalog_pages order by home_order`)).rowCount>0);
    assert.ok((await client.query(`select ${oldToolColumns} from public.stack127_tool_pages`)).rowCount>0);
    assert.ok((await client.query(`select ${oldDirectoryColumns} from public.stack127_directory_pages`)).rowCount>0);
    await client.query('reset role');
    console.log(JSON.stringify({legacyReadRows:{catalogs:catalogs.rowCount,tools:tools.rowCount,directories:directories.rowCount},anonymousLegacyReads:true}));
  }
  try {
    await scenario('deployed catalog, tool, and directory reads succeed after Release A',oldReads);
    await scenario('legacy and new catalog writers keep introductions, titles, ordering, and artwork consistent',async()=>{
      const id=(await client.query('select page_id from public.stack127_catalog_pages order by page_id limit 1')).rows[0].page_id;
      await client.query("update public.stack127_catalog_pages set heading_before='Legacy ',heading_mark='title',heading_after='',intro='Legacy intro.',home_order=17,hero_art_key='dns-tools' where page_id=$1",[id]);
      let row=(await client.query('select * from public.stack127_catalog_pages where page_id=$1',[id])).rows[0];
      assert.equal(row.title,'Legacy <mark>title</mark>');assert.equal(row.intro_markdown,row.intro);
      assert.equal(row.display_order,17);assert.equal(row.card_art_key,'dns-tools');
      await client.query("update public.stack127_catalog_pages set title='New <mark>title</mark>',intro_markdown='New intro.',display_order=31,card_art_key='domain-tools' where page_id=$1",[id]);
      row=(await client.query('select * from public.stack127_catalog_pages where page_id=$1',[id])).rows[0];
      assert.equal(row.heading_before,'New ');assert.equal(row.heading_mark,'title');assert.equal(row.heading_after,'');
      assert.equal(row.intro,row.intro_markdown);assert.equal(row.home_order,31);assert.equal(row.hero_art_key,'domain-tools');
      await client.query("update public.stack127_catalog_pages set title='Plain title' where page_id=$1",[id]);
      row=(await client.query('select * from public.stack127_catalog_pages where page_id=$1',[id])).rows[0];
      assert.equal(row.heading_before,'Plain title');assert.equal(row.heading_mark,'');assert.equal(row.heading_after,'');
      await client.query('savepoint conflicting_copy');
      await assert.rejects(client.query("update public.stack127_catalog_pages set intro='Old writer',intro_markdown='New writer' where page_id=$1",[id]),/Conflicting/);
      await client.query('rollback to savepoint conflicting_copy');
      const before=(await client.query('select slug,updated_at::text from public.stack127_pages order by slug')).rows;
      await client.query('update public.stack127_catalog_pages set title=title,intro=intro,home_order=home_order');
      assert.deepEqual((await client.query('select slug,updated_at::text from public.stack127_pages order by slug')).rows,before);
    });
    await scenario('catalog inserts work with either the old or new column set',async()=>{
      for(const [id,slug] of [[-90001,'catalog-expand-old'],[-90002,'catalog-expand-new']])await client.query(`insert into public.stack127_pages(id,slug,label,meta_title,meta_description,page_family,is_published,published_at,updated_at) overriding system value values($1,$2,'Test catalog','Test catalog','Test catalog description','catalog',false,null,null)`,[id,slug]);
      await client.query(`insert into public.stack127_catalog_pages(page_id,heading_before,heading_mark,intro,section_heading,home_order,hero_art_key,card_name,card_description,card_icon_key,card_art_key) values(-90001,'Old ','catalog','Choose a tool.','Old tools',7,'dns-tools','Old catalog','Old description','network','dns-tools')`);
      await client.query(`insert into public.stack127_catalog_pages(page_id,title,intro_markdown,display_order,card_name,card_description,card_icon_key,card_art_key) values(-90002,'New catalog','Choose a tool.',9,'New catalog','New description','network','dns-tools')`);
      const rows=(await client.query('select * from public.stack127_catalog_pages where page_id<0 order by page_id')).rows;
      assert.equal(rows.length,2);
      for(const row of rows){assert.equal(row.intro,row.intro_markdown);assert.equal(row.home_order,row.display_order);assert.equal(row.hero_art_key,row.card_art_key);}
      assert.equal(rows.find(row=>String(row.page_id)==='-90001').title,'Old <mark>catalog</mark>');
      assert.equal(rows.find(row=>String(row.page_id)==='-90002').heading_before,'New catalog');
    });
    await scenario('old explicit revision writers and new automatic revision writers increment once',async()=>{
      for(const table of ['stack127_tool_pages','stack127_directory_pages']){
        const before=(await client.query(`select page_id,content_revision from public.${table} order by page_id limit 1`)).rows[0];
        let row=(await client.query(`update public.${table} set title=title || ' reviewed',content_revision=content_revision+1 where page_id=$1 returning content_revision`,[before.page_id])).rows[0];
        assert.equal(row.content_revision,before.content_revision+1);
        row=(await client.query(`update public.${table} set intro_markdown=intro_markdown || ' Reviewed.' where page_id=$1 returning content_revision`,[before.page_id])).rows[0];
        assert.equal(row.content_revision,before.content_revision+2);
        await client.query('savepoint invalid_revision');
        await assert.rejects(client.query(`update public.${table} set content_revision=content_revision+1 where page_id=$1`,[before.page_id]),/changes only/);
        await client.query('rollback to savepoint invalid_revision');
      }
    });
    await scenario('fresh catalog expansion preserves old data and public dates',async()=>{
      const dates=(await client.query('select slug,updated_at::text from public.stack127_pages order by slug')).rows;
      const before=(await client.query(`select ${oldCatalogColumns} from public.stack127_catalog_pages order by page_id`)).rows;
      await client.query('drop trigger stack127_sync_catalog_legacy_columns on public.stack127_catalog_pages');
      await client.query('drop trigger stack127_touch_catalogs_on_tool_removal on public.stack127_pages');
      await client.query('drop function public.stack127_sync_catalog_legacy_columns()');
      await client.query('alter table public.stack127_catalog_pages drop column title,drop column intro_markdown,drop column content_markdown,drop column display_order');
      const sql=await readFile(new URL('../../supabase/migrations/20261006122500_catalog_page_content_shape.sql',import.meta.url),'utf8');
      await client.query(withoutTransaction(sql));
      assert.deepEqual((await client.query(`select ${oldCatalogColumns} from public.stack127_catalog_pages order by page_id`)).rows,before);
      assert.deepEqual((await client.query('select slug,updated_at::text from public.stack127_pages order by slug')).rows,dates);
      assert.ok((await client.query(`select ${newCatalogColumns} from public.stack127_catalog_pages order by display_order`)).rowCount>0);
      await oldReads();
    });
    await scenario('Release C removes compatibility columns while new reads and writes keep working',async()=>{
      await client.query(withoutTransaction(await readFile(new URL('../../supabase/pending/20261006164106_contract_legacy_page_columns.sql',import.meta.url),'utf8')));
      assert.ok((await client.query(`select ${newCatalogColumns} from public.stack127_catalog_pages order by display_order`)).rowCount>0);
      assert.ok((await client.query('select page_id,title,intro_markdown,usage_markdown,content_markdown,tool_version from public.stack127_tool_pages')).rowCount>0);
      assert.ok((await client.query('select page_id,title,intro_markdown,content_markdown from public.stack127_directory_pages')).rowCount>0);
      await client.query('update public.stack127_catalog_pages set title=title');
      await client.query('update public.stack127_tool_pages set intro_markdown=intro_markdown');
      await client.query('update public.stack127_directory_pages set intro_markdown=intro_markdown');
      assert.ok((await client.query("select * from public.stack127_cache_source_revisions(array['page'],array['dns-tools'])")).rowCount>0);
    });
  } finally {await client.end();}
});

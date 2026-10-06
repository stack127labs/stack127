import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {resolveDatabaseUrl} from '../../scripts/stack127/tool-pages/lib.mjs';
import {syncPlatformFeeRecords,ensurePlatformFeePages} from '../../scripts/platform-fees/sync-records.mjs';
import {readFile} from 'node:fs/promises';
import {executeBatch,readStates} from '../../scripts/stack127/publishing/database.mjs';
import {syncRecords} from '../../scripts/stack127/database/sync-records.mjs';
import {upsertApp,upsertInstallOptions} from '../../scripts/self-host-apps/apply-candidate-review.mjs';
import {upsertRecord} from '../../scripts/self-host-apps/upsert-batch.mjs';
import {normalizeRecord} from '../../scripts/self-host-apps/lib/schema.mjs';

const enabled=process.env.STACK127_TEST_DEVELOPMENT_DATABASE==='1';
test('development public dates follow real content changes and identical imports preserve dates',{skip:!enabled},async()=>{
  const pool=new pg.Pool({connectionString:resolveDatabaseUrl({environment:'development'}),max:2});
  const client=await pool.connect();
  const dates=async()=> (await client.query('select slug,updated_at::text from public.stack127_pages order by slug')).rows;
  const queues=async()=> (await client.query('select entity_type,slug,created_at::text from public.stack127_revalidation_events order by entity_type,slug')).rows;
  async function scenario(name,fn){
    await client.query('begin');
    try {await fn();console.log(`Passed: ${name}`);}
    finally {await client.query('rollback');}
  }
  async function changedSlugs(before){
    const original=new Map(before.map(row=>[row.slug,row.updated_at]));
    return (await dates()).filter(row=>original.get(row.slug)!==row.updated_at).map(row=>row.slug);
  }
  try {
    await scenario('no-op updates and zero-row statements keep dates and the queue',async()=>{
      const before=await dates();const events=await queues();
      await client.query('update public.launch_directories set name=name');
      await client.query('update public.terminal_apps set name=name');
      await client.query('update public.self_host_apps set name=name');
      await client.query('update public.ad_network_publishers set display_domain=display_domain');
      await client.query('update public.platform_fee_entries set summary=summary where false');
      assert.deepEqual(await dates(),before);assert.deepEqual(await queues(),events);
    });
    await scenario('fees update the category and hub',async()=>{
      const before=await dates();
      await client.query("update public.platform_fee_entries set summary=summary || ' Date rule test.' where id=(select entry.id from public.platform_fee_entries entry join public.platform_fee_sections section on section.id=entry.section_id where section.group_name='Digital products and stores' order by entry.id limit 1)");
      assert.deepEqual(await changedSlugs(before),['platform-fees','platform-fees/digital-products-and-stores']);
      assert.ok((await queues()).some(row=>row.entity_type==='platform_fees'));
    });
    await scenario('moving fee sections updates both categories and the hub',async()=>{
      const before=await dates();
      await client.query("update public.platform_fee_sections set group_name='Payments' where id=(select id from public.platform_fee_sections where group_name='Digital products and stores' order by id limit 1)");
      assert.deepEqual(await changedSlugs(before),['platform-fees','platform-fees/digital-products-and-stores','platform-fees/payments']);
    });
    await scenario('identical platform fee syncs preserve dates and handwritten copy',async()=>{
      const data=JSON.parse(await readFile(new URL('../../scripts/platform-fees/data/directory.json',import.meta.url)));
      await syncPlatformFeeRecords(client,data);await ensurePlatformFeePages(client);
      const before=await dates();const events=await queues();
      const copy=(await client.query('select to_jsonb(content) value from public.stack127_directory_pages content order by page_id')).rows;
      const changes=await syncPlatformFeeRecords(client,data);await ensurePlatformFeePages(client);
      assert.deepEqual(changes,{sections:0,entries:0,removedSections:0,removedEntries:0});
      assert.deepEqual(await dates(),before);assert.deepEqual(await queues(),events);
      assert.deepEqual((await client.query('select to_jsonb(content) value from public.stack127_directory_pages content order by page_id')).rows,copy);
    });
    await scenario('tool cards keep tool dates and still update their catalogs',async()=>{
      const before=await dates();
      const row=(await client.query("select page.id,page.slug from public.stack127_pages page where slug='dns-lookup'")).rows[0];
      const catalogs=(await client.query('select page.slug from public.stack127_tool_catalog_memberships member join public.stack127_pages page on page.id=member.catalog_page_id where member.tool_page_id=$1 and page.is_published order by slug',[row.id])).rows.map(row=>row.slug);
      await client.query("update public.stack127_tool_pages set card_description=card_description || ' Card test.' where page_id=$1",[row.id]);
      assert.deepEqual(await changedSlugs(before),catalogs);
      assert.equal((await client.query('select row_updated_at=now() refreshed from public.stack127_pages where id=$1',[row.id])).rows[0].refreshed,true);
      const events=await queues();
      for(const slug of [row.slug,...catalogs]) assert.ok(events.some(event=>event.entity_type==='page' && event.slug===slug));
    });
    await scenario('tool copy updates its page date',async()=>{
      const before=await dates();
      await client.query("update public.stack127_tool_pages set intro_markdown=intro_markdown || ' Copy test.' where page_id=(select id from public.stack127_pages where slug='dns-lookup')");
      assert.deepEqual(await changedSlugs(before),['dns-lookup']);
    });
    await scenario('tool versions update the public and version dates',async()=>{
      const before=await dates();
      const result=await client.query("update public.stack127_tool_pages set tool_version='999.0.0' where page_id=(select id from public.stack127_pages where slug='dns-lookup') returning tool_version_updated_at::text");
      assert.equal(result.rows[0].tool_version_updated_at,(await client.query('select now()::text value')).rows[0].value);
      assert.deepEqual(await changedSlugs(before),['dns-lookup']);
    });
    await scenario('directory child copy updates child and hub',async()=>{
      const before=await dates();
      await client.query("update public.stack127_directory_pages set intro_markdown=intro_markdown || ' Copy test.' where page_id=(select id from public.stack127_pages where slug='keyboard-shortcuts/vscode')");
      assert.deepEqual(await changedSlugs(before),['keyboard-shortcuts','keyboard-shortcuts/vscode']);
    });
    await scenario('directory child SEO and retirement update the registered hub',async()=>{
      const before=await dates();
      await client.query("update public.stack127_pages set meta_description=meta_description || ' SEO test.' where slug='keyboard-shortcuts/vscode'");
      assert.deepEqual(await changedSlugs(before),['keyboard-shortcuts','keyboard-shortcuts/vscode']);
      await client.query("update public.stack127_pages set updated_at='2026-10-02' where slug='keyboard-shortcuts' or slug='keyboard-shortcuts/vscode'");
      const reset=await dates();
      await client.query("update public.stack127_pages set is_published=false,published_at=null,updated_at=null where slug='keyboard-shortcuts/vscode'");
      assert.deepEqual(await changedSlugs(reset),['keyboard-shortcuts','keyboard-shortcuts/vscode']);
      assert.equal((await client.query("select updated_at from public.stack127_pages where slug='keyboard-shortcuts/vscode'")).rows[0].updated_at,null);
    });
    await scenario('unpublished pages keep null public dates',async()=>{
      await client.query("update public.stack127_pages set is_published=false,published_at=null,updated_at=null where slug='platform-fees/payments'");
      await client.query("select public.stack127_touch_page('platform-fees/payments','date test')");
      const row=(await client.query("select published_at,updated_at from public.stack127_pages where slug='platform-fees/payments'")).rows[0];
      assert.deepEqual(row,{published_at:null,updated_at:null});
    });
    for (const [table,slug,filter] of [['launch_directories','launch-directories','is_published'],['terminal_apps','cli-apps','published'],['self_host_apps','self-host-apps',"published and self_hosting_status='self_hostable'"]]) {
      await scenario(`${table} updates its directory`,async()=>{
        const before=await dates();
        await client.query(`update public.${table} set summary=summary || ' Record test.' where id=(select id from public.${table} where ${filter} order by slug limit 1)`);
        assert.deepEqual(await changedSlugs(before),[slug]);
      });
    }
    await scenario('published license changes also update the license counts directory',async()=>{
      const before=await dates();
      await client.query("update public.self_host_apps set license='AGPL-3.0-only',license_spdx_id='AGPL-3.0-only' where id=(select id from public.self_host_apps where published and self_hosting_status='self_hostable' and license is distinct from 'AGPL-3.0-only' order by slug limit 1)");
      assert.deepEqual(await changedSlugs(before),['self-host-apps','software-licenses-for-self-hosting']);
    });
    await scenario('self-host review and batch imports skip identical records and category links',async()=>{
      const raw=(await client.query("select to_jsonb(app) record from public.self_host_apps app where published and self_hosting_status='self_hostable' order by slug limit 1")).rows[0].record;
      raw.categories=(await client.query('select category.slug from public.self_host_app_category_links link join public.self_host_app_categories category on category.id=link.category_id where link.app_id=$1 order by category.slug',[raw.id])).rows.map(row=>row.slug);
      const record=normalizeRecord(raw);
      await upsertApp(client,record,raw.id);await upsertRecord(client,record);
      const before=await dates();const events=await queues();
      await upsertApp(client,record,raw.id);await upsertRecord(client,record);
      assert.deepEqual(await dates(),before);assert.deepEqual(await queues(),events);
      const install=(await client.query('select to_jsonb(install) record from public.self_host_app_install_options install where app_id=$1',[raw.id])).rows[0]?.record;
      if (install?.options?.length) {
        await upsertInstallOptions(client,raw.id,install.options,install.catalog_sources,new Date().toISOString());
        const stable=(await client.query('select to_jsonb(install) record from public.self_host_app_install_options install where app_id=$1',[raw.id])).rows;
        await upsertInstallOptions(client,raw.id,install.options,install.catalog_sources,new Date(Date.now()+1000).toISOString());
        assert.deepEqual((await client.query('select to_jsonb(install) record from public.self_host_app_install_options install where app_id=$1',[raw.id])).rows,stable);
      }
    });
    await scenario('bulk syncs preserve identical app children and GitHub records',async()=>{
      const before=await dates();const events=await queues();
      for (const [table,keys] of [['self_host_app_category_links',['app_id','category_id']],['self_host_app_resource_estimates',['app_id']],['self_host_app_install_options',['app_id']],['github_projects',['owner','repo']]]) {
        const rows=(await client.query(`select to_jsonb(record) - array['created_at','updated_at','row_updated_at'] record from public.${table} record limit 3`)).rows.map(row=>row.record);
        if (!rows.length) continue;
        const result=await syncRecords(client,{table,rows,keys});
        assert.deepEqual(result,{changed:0,removed:0});
      }
      assert.deepEqual(await dates(),before);assert.deepEqual(await queues(),events);
    });
    await scenario('GitHub facts update both linked directories',async()=>{
      const before=await dates();
      const row=(await client.query(`select project.id,exists(select 1 from public.self_host_apps app where app.github_project_id=project.id and app.published and app.self_hosting_status='self_hostable') self_host,
        exists(select 1 from public.terminal_apps app where app.github_project_id=project.id and app.published) cli
        from public.github_projects project where exists(select 1 from public.self_host_apps app where app.github_project_id=project.id and app.published) order by project.id limit 1`)).rows[0];
      await client.query('update public.github_projects set stars=coalesce(stars,0)+1 where id=$1',[row.id]);
      assert.deepEqual(await changedSlugs(before),[...(row.cli?['cli-apps']:[]),...(row.self_host?['self-host-apps']:[])]);
    });
    await scenario('keyboard record sync detects same-count edits and ignores identical records',async()=>{
      const slug='keyboard-shortcuts/vscode';
      await client.query('delete from public.stack127_directory_record_state where page_id=(select id from public.stack127_pages where slug=$1)',[slug]);
      await client.query('select public.stack127_sync_directory_records($1,$2::jsonb)',[slug,JSON.stringify({shortcuts:[{keys:'Ctrl+A',action:'Select'}]})]);
      const before=await dates();
      await client.query('select public.stack127_sync_directory_records($1,$2::jsonb)',[slug,JSON.stringify({shortcuts:[{keys:'Ctrl+B',action:'Select'}]})]);
      assert.deepEqual(await changedSlugs(before),['keyboard-shortcuts','keyboard-shortcuts/vscode']);
      const unchanged=await client.query('select public.stack127_sync_directory_records($1,$2::jsonb) changed',[slug,JSON.stringify({shortcuts:[{action:'Select',keys:'Ctrl+B'}]})]);
      assert.equal(unchanged.rows[0].changed,false);
    });
    await scenario('keyboard hub sync detects removed apps',async()=>{
      const slug='keyboard-shortcuts';
      await client.query('delete from public.stack127_directory_record_state where page_id=(select id from public.stack127_pages where slug=$1)',[slug]);
      await client.query('select public.stack127_sync_directory_records($1,$2::jsonb)',[slug,JSON.stringify([{slug:'one'},{slug:'two'}])]);
      const before=await dates();
      await client.query('select public.stack127_sync_directory_records($1,$2::jsonb)',[slug,JSON.stringify([{slug:'one'}])]);
      assert.deepEqual(await changedSlugs(before),['keyboard-shortcuts']);
      const unchanged=await client.query('select public.stack127_sync_directory_records($1,$2::jsonb) changed',[slug,JSON.stringify([{slug:'one'}])]);
      assert.equal(unchanged.rows[0].changed,false);
    });
    await scenario('ad network changes update child and hub; leases keep dates alone',async()=>{
      await client.query("update public.stack127_pages set is_published=true,published_at=coalesce(published_at,now()),updated_at=now() where slug='ad-networks' or slug='ad-networks/adapex'");
      // Compare against older dates while this unpublished preview is inside one transaction.
      await client.query("update public.stack127_pages set published_at='2026-01-01',updated_at='2026-01-01' where slug='ad-networks' or slug='ad-networks/adapex'");
      const before=await dates();
      await client.query("update public.ad_networks set summary=coalesce(summary,'') || ' Network test.' where slug='adapex'");
      assert.deepEqual(await changedSlugs(before),['ad-networks','ad-networks/adapex']);
      const after=await dates();
      await client.query('update public.ad_network_publishers set lease_until=now()');
      assert.deepEqual(await dates(),after);
    });
    await scenario('only confirmed ad publisher facts update directory dates',async()=>{
      await client.query("update public.stack127_pages set is_published=true,published_at='2026-01-01',updated_at='2026-01-01' where slug='ad-networks' or slug='ad-networks/adapex'");
      await client.query("update public.stack127_pages set updated_at='2026-01-01' where slug='ad-networks' or slug='ad-networks/adapex'");
      const before=await dates();
      await client.query("insert into public.ad_network_publishers(id,normalized_domain,display_domain) overriding system value values(-127,'stack127-date-test.example','stack127-date-test.example')");
      assert.deepEqual(await dates(),before);
      await client.query(`insert into public.ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at)
        select id,-127,'confirmed','active_network_use','live_configuration',
          '{"checked_url":"https://stack127-date-test.example","checked_at":"2026-10-06","matched_signal":"test","parser_version":"test"}',now(),now()
        from public.ad_networks where slug='adapex'`);
      assert.deepEqual(await changedSlugs(before),['ad-networks','ad-networks/adapex']);
      await client.query("update public.stack127_pages set updated_at='2026-01-01' where slug='ad-networks' or slug='ad-networks/adapex'");
      const reset=await dates();
      await client.query("update public.ad_network_publishers set display_domain='www.stack127-date-test.example' where id=-127");
      assert.deepEqual(await changedSlugs(reset),['ad-networks','ad-networks/adapex']);
    });
    // Publisher touch-only batches are reversible previews, and retries leave dates alone.
    const [state]=await readStates(client,[{slug:'epp-status-codes',family:'directory'}]);
    const baseline=(await client.query("select updated_at::text from public.stack127_pages where slug='epp-status-codes'")).rows[0].updated_at;
    const batch=[{slug:state.slug,family:state.family,before:state,after:state,touch:{reason:'Reviewed record correction',expected_updated_at:baseline}}];
    const before=await dates();
    await executeBatch(pool,batch);assert.deepEqual(await dates(),before);
    // Keep even the applied-batch proof inside a rollback by using this connection.
    await client.query('begin');
    const transactionalPool={connect:async()=>({query:async(sql,args)=> {
      if(sql.startsWith('begin')) return await client.query('savepoint publishing_date_test');
      if(sql==='commit') return await client.query('release savepoint publishing_date_test');
      if(sql==='rollback') return await client.query('rollback to savepoint publishing_date_test');
      return await client.query(sql,args);
    },release(){}})};
    try {
      await executeBatch(transactionalPool,batch,{apply:true});
      assert.deepEqual(await changedSlugs(before),['epp-status-codes']);
      const applied=await dates();await executeBatch(transactionalPool,batch,{apply:true});assert.deepEqual(await dates(),applied);
    } finally {await client.query('rollback');}
  } finally {client.release();await pool.end();}
});

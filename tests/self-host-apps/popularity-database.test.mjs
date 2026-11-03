import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../scripts/stack127/tool-pages/lib.mjs';
import { refreshPopularity } from '../../scripts/self-host-apps/refresh-popularity.mjs';
import { writeFacts } from '../../scripts/self-host-apps/refresh-source-host.mjs';

const databaseTest = {skip:process.env.SELF_HOST_APPS_TEST_ENVIRONMENT !== 'development'};
test('backfill preview, apply, repeat, release preservation and source refresh are isolated and roll back', databaseTest, async () => {
  const client = new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000});
  try {
    await client.connect();
    await client.query('begin');
    await client.query(`create temporary table apps_fixture as select * from public.self_host_apps where false;
      create temporary table projects_fixture as select * from public.github_projects where false;
      create temporary table write_events (slug text);
      create function pg_temp.record_write() returns trigger language plpgsql as $$
        begin insert into pg_temp.write_events values (new.slug); return new; end $$;
      create trigger writes after update on apps_fixture for each row execute function pg_temp.record_write();
      insert into apps_fixture (id,slug,published,source_code_host,source_stars,popularity_score,popularity_basis,release_version,source_latest_release,license_type)
      values (gen_random_uuid(),'zero',true,'gitlab',5760,0,'{}',null,'v1','unknown'),
        (gen_random_uuid(),'manual',true,'gitlab',363,95,'{source_stars}','5.2.2 LTS','v6','unknown'),
        (gen_random_uuid(),'draft',false,'gitlab',100000,0,'{}',null,'v1','unknown');`);
    const isolated = {query(sql,params) {
      if (/^(begin(?: read only)?|commit|rollback)$/i.test(sql.trim())) return Promise.resolve({rows:[]});
      return client.query(sql.replaceAll('public.self_host_apps','pg_temp.apps_fixture').replaceAll('public.github_projects','pg_temp.projects_fixture'),params);
    }};
    await client.query("update apps_fixture set source_code_url='https://gitlab.com/example/' || slug");
    await client.query('delete from write_events'); // Count only the writes the code under test makes.
    const before = (await client.query('select * from apps_fixture order by slug')).rows;
    const preview = await refreshPopularity(isolated,{all:true});
    assert.equal(preview.changed,2);
    assert.deepEqual((await client.query('select * from apps_fixture order by slug')).rows,before);
    assert.equal((await client.query('select count(*)::int n from write_events')).rows[0].n,0);
    assert.equal((await refreshPopularity(isolated,{all:true,apply:true})).written,2);
    const rows = (await client.query('select * from apps_fixture order by slug')).rows;
    assert.equal(rows.find(r=>r.slug==='manual').release_version,'5.2.2 LTS');
    assert.equal(rows.find(r=>r.slug==='zero').release_version,'v1');
    assert.equal(rows.find(r=>r.slug==='zero').popularity_score,80);
    assert.equal(rows.find(r=>r.slug==='draft').popularity_score,0);
    assert.equal((await refreshPopularity(isolated,{all:true,apply:true})).written,0);
    assert.equal((await client.query('select count(*)::int n from write_events')).rows[0].n,2);
    const row=rows.find(r=>r.slug==='zero');
    await writeFacts(isolated,row,'gitlab',{source_stars:20000,source_latest_release:'v2',source_latest_release_at:null,source_archived:false,source_last_commit_at:null,license:null},new Date().toISOString());
    const refreshed=(await client.query("select * from apps_fixture where slug='zero'")).rows[0];
    assert.equal(refreshed.popularity_score,90);
    assert.equal(refreshed.source_stars,20000);
    assert.equal(refreshed.release_version,'v1');
    // Use the installed projection that controls page-date/cache comparisons.
    await client.query("update apps_fixture set self_hosting_status='self_hostable' where slug='zero'");
    const publicValue = async () => (await client.query("select public.stack127_directory_record_value('self_host_apps',to_jsonb(app)) value from apps_fixture app where slug='zero'")).rows[0].value;
    const beforeRepeat = await publicValue();
    await writeFacts(isolated,row,'gitlab',{source_stars:20000,source_latest_release:'v2',source_latest_release_at:null,source_archived:false,source_last_commit_at:null,license:null},new Date(Date.now()+60000).toISOString());
    assert.deepEqual(await publicValue(),beforeRepeat,'An identical refresh must not change the page-date/cache projection');

  } finally {
    await client.query('rollback').catch(()=>{});
    await client.end();
  }
});

test('repository roots elect one published star row and preserve variants across backfill and refresh', databaseTest, async () => {
  const client = new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000,query_timeout:60000});
  try {
    await client.connect();
    await client.query('begin');
    await client.query("set local statement_timeout='60s'");
    await client.query(`create temporary table apps_fixture as select * from public.self_host_apps where false;
      create temporary table projects_fixture as select * from public.github_projects where false;`);
    const seeds = [
      ['aquacomputer-d5next','Aquacomputer D5 Next','https://github.com/torvalds/linux/blob/master/drivers/hwmon/aquacomputer_d5next.c',24,[],true],
      ['tree-link','Tree link','https://github.com/torvalds/linux/tree/master',38,[],true],
      ['issues-link','Issues link','https://github.com/torvalds/linux/issues',40,[],true],
      ['dify','Dify','https://GitHub.com/LangGenius/DiFy.git/',100,['source_stars'],true],
      ['dify-ai','Dify AI','https://github.com/langgenius/dify/',0,[],true],
      ['comfyui','ComfyUI','https://github.com/comfyanonymous/ComfyUI',0,[],true],
      ['comfyui-intel-xpu','ComfyUI Intel XPU','https://github.com/comfyanonymous/comfyui.git',18,[],true],
      ['syncthing','Syncthing','https://github.com/syncthing/syncthing',70,['source_stars'],true],
      ['binhex-syncthing','Binhex Syncthing','https://github.com/syncthing/syncthing.git/',70,['source_stars'],true],
      ['established','Established wrapper','https://github.com/example/project',90,['source_stars'],true],
      ['project','Project','https://github.com/example/project',0,[],true],
      ['long-name','Alpha Beta','https://github.com/example/shortest',0,[],true],
      ['short-name','Gamma','https://github.com/example/shortest',0,[],true],
      ['alpha','Beta','https://github.com/example/unrelated',0,[],true],
      ['zeta','Zeta','https://github.com/example/unrelated',0,[],true],
      ['draft','Unrelated','https://github.com/example/unrelated',0,['source_stars'],false],
    ];
    await client.query(`insert into apps_fixture
      (id,slug,name,source_code_url,popularity_score,popularity_basis,published,source_stars,source_latest_release,source_code_host,license_type)
      select gen_random_uuid(),value->>0,value->>1,value->>2,(value->>3)::integer,
        array(select jsonb_array_elements_text(value->4)),(value->>5)::boolean,200000,'v1','github','unknown'
      from jsonb_array_elements($1::jsonb)`,[JSON.stringify(seeds)]);
    await client.query(`insert into apps_fixture
      (id,slug,name,source_code_url,popularity_score,popularity_basis,published,source_stars,source_code_host,license_type)
      select gen_random_uuid(),value->>0,value->>0,value->>1,0,'{}',true,5000,'gitlab','unknown'
      from jsonb_array_elements($1::jsonb)`,[JSON.stringify([
        ['duniter','https://git.duniter.org/nodes/typescript/duniter'],
        ['gitlab-file','https://gitlab.com/group/project/-/blob/main/README.md'],
        ['gitlab-old-tree','https://gitlab.com/group/project/tree/main'],
      ])]);
    const isolated = {query(sql,params) {
      if (/^(begin(?: read only)?|commit|rollback)$/i.test(sql.trim())) return Promise.resolve({rows:[]});
      return client.query(sql.replaceAll('public.self_host_apps','pg_temp.apps_fixture').replaceAll('public.github_projects','pg_temp.projects_fixture'),params);
    }};
    // A single-slug request must still rank the other published apps.
    const variantPreview = await refreshPopularity(isolated,{slug:'comfyui-intel-xpu'});
    assert.equal(variantPreview.changes[0].new.release_version,'v1');
    assert.equal(variantPreview.changes[0].new.popularity_score,undefined);
    assert.equal((await client.query("select release_version from apps_fixture where slug='comfyui-intel-xpu'")).rows[0].release_version,null);
    await refreshPopularity(isolated,{all:true,apply:true});
    const state = Object.fromEntries((await client.query('select * from apps_fixture')).rows.map(row=>[row.slug,row]));
    for (const [slug,score] of Object.entries({
      'aquacomputer-d5next':24,'tree-link':38,'issues-link':40,
      dify:100,'dify-ai':0,comfyui:100,'comfyui-intel-xpu':18,
      syncthing:100,'binhex-syncthing':70,established:100,project:0,'long-name':0,'short-name':100,alpha:100,zeta:0,draft:0,
      duniter:80,'gitlab-file':0,'gitlab-old-tree':0,
    })) assert.equal(state[slug].popularity_score,score,slug);
    assert.equal(state['comfyui-intel-xpu'].release_version,'v1');
    // The elected row now has source_stars; re-running is a complete no-op.
    assert.equal((await refreshPopularity(isolated,{all:true,apply:true})).written,0);
    await client.query("update apps_fixture set release_version=null where slug='comfyui-intel-xpu'");
    await writeFacts(isolated,state['comfyui-intel-xpu'],'codeberg',{
      source_stars:300000,source_latest_release:'v2',source_latest_release_at:null,
      source_archived:false,source_last_commit_at:null,license:null,
    },new Date().toISOString());
    const variant = (await client.query("select * from apps_fixture where slug='comfyui-intel-xpu'")).rows[0];
    assert.equal(variant.popularity_score,18);
    assert.deepEqual(variant.popularity_basis,[]);
    assert.equal(variant.release_version,'v2');
  } finally {
    await client.query('rollback').catch(()=>{});
    await client.end();
  }
});

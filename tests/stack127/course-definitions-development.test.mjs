import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {resolveDatabaseUrl} from '../../scripts/stack127/tool-pages/lib.mjs';
import {preparePlan} from '../../scripts/stack127/publishing/cli.mjs';
import {executeBatch,readStates} from '../../scripts/stack127/publishing/database.mjs';

const enabled=process.env.STACK127_TEST_DEVELOPMENT_DATABASE==='1';
test('development course dates, navigation refresh, publication, and frozen plans',{skip:!enabled},async()=>{
  const pool=new pg.Pool({connectionString:resolveDatabaseUrl({environment:'development'}),max:1});
  const client=await pool.connect();
  const root='self-hosting-for-beginners';const child=root+'/install-docker';
  const refs=[{slug:root,family:'course'},{slug:child,family:'course'}];
  const dates=async()=> (await client.query('select slug,published_at::text,updated_at::text from public.stack127_pages order by slug')).rows;
  const queue=async()=> (await client.query('select entity_type,slug,created_at::text from public.stack127_revalidation_events order by entity_type,slug')).rows;
  async function scenario(fn){await client.query('begin');try{await fn();}finally{await client.query('rollback');}}
  const transactionalPool={connect:async()=>({query:async(sql,args)=>{
    if(sql.startsWith('begin'))return client.query('savepoint course_publisher');
    if(sql==='commit')return client.query('release savepoint course_publisher');
    if(sql==='rollback')return client.query('rollback to savepoint course_publisher');
    return client.query(sql,args);
  },release(){}})};
  try {
    const access=(await client.query("select has_table_privilege('anon','public.stack127_course_pages','TRUNCATE') root_truncate,has_table_privilege('authenticated','public.stack127_course_lessons','UPDATE') lesson_update")).rows[0];
    assert.deepEqual(access,{root_truncate:false,lesson_update:false});
    await scenario(async()=>{
      const before=await dates();const events=await queue();
      await client.query('update public.stack127_course_pages set title=title,author_name=author_name');
      await client.query('update public.stack127_course_lessons set title=title,sidebar_label=sidebar_label');
      assert.deepEqual(await dates(),before);assert.deepEqual(await queue(),events);
      const states=await readStates(client,refs);
      const result=await executeBatch(transactionalPool,states.map(state=>({slug:state.slug,family:state.family,before:state,after:state})));
      assert.ok(result.pages.every(page=>!page.changed));assert.deepEqual(await dates(),before);
    });
    for(const [table,slug,field] of [['stack127_course_pages',root,'author_name'],['stack127_course_lessons',child,'title']]) await scenario(async()=>{
      const before=await dates();await client.query("delete from public.stack127_revalidation_events where entity_type='page'");
      const fingerprint=async()=> (await client.query("select fingerprint from public.stack127_cache_source_revisions(array['page'],$1::text[])",[[slug]])).rows[0].fingerprint;
      const original=await fingerprint();
      await client.query(`update public.${table} set ${field}=${field} || ' check' where page_id=(select id from public.stack127_pages where slug=$1)`,[slug]);
      const changed=(await dates()).filter((row,index)=>row.updated_at!==before[index].updated_at).map(row=>row.slug);
      assert.deepEqual(changed,[slug]);assert.notEqual(await fingerprint(),original);
      const queued=(await queue()).filter(row=>row.entity_type==='page').map(row=>row.slug);
      assert.equal(queued.filter(value=>value===root||value.startsWith(root+'/')).length,16);
    });
    await scenario(async()=>{
      const states=await readStates(client,refs);const before=await dates();
      const after={...states[1],lesson:{...states[1].lesson,title:states[1].lesson.title+' changed'}};
      const batch=[{slug:child,family:'course',before:states[1],after}];
      await executeBatch(transactionalPool,batch);assert.deepEqual(await dates(),before);
      await executeBatch(transactionalPool,batch,{apply:true});
      const applied=await dates();await executeBatch(transactionalPool,batch,{apply:true});assert.deepEqual(await dates(),applied);
      await executeBatch(transactionalPool,batch,{apply:true,restore:true});
      assert.deepEqual((await readStates(client,[refs[1]]))[0],states[1]);
    });
    for (const slug of [root,child]) await scenario(async()=>{
      await client.query("update public.stack127_pages set is_published=true,published_at='2026-01-01',updated_at='2026-01-01' where slug=$1",[slug]);
      const before=await dates();
      const manifest={schema_version:1,kind:'courses',pages:[{slug,family:'course',touch_reason:'Reviewed lesson body correction',
        requirements:{route:slug===root?'app/(site)/(courses)/self-hosting-for-beginners/(index)/page.tsx':`app/(site)/(courses)/${slug}/page.tsx`,assets:[],checks:[],smoke:[]}}]};
      const plan=await preparePlan(transactionalPool,manifest,{kind:'courses',environment:'development',sourceCommit:'a'.repeat(40)});
      assert.equal(plan.pages[0].touch.reason,manifest.pages[0].touch_reason);
      assert.equal(plan.pages[0].touch.expected_updated_at,before.find(row=>row.slug===slug).updated_at);
      const batch=plan.pages.map(({slug,family,before,after,touch})=>({slug,family,before,after,touch}));
      const preview=await executeBatch(transactionalPool,batch);
      assert.equal(preview.pages[0].changed,true);assert.deepEqual(await dates(),before);
      const applied=await executeBatch(transactionalPool,batch,{apply:true});assert.equal(applied.pages[0].changed,true);
      assert.deepEqual((await dates()).filter((row,index)=>row.updated_at!==before[index].updated_at).map(row=>row.slug),[slug]);
      const after=await dates();const events=await queue();
      const retry=await executeBatch(transactionalPool,batch,{apply:true});assert.equal(retry.pages[0].changed,false);
      assert.deepEqual(await dates(),after);assert.deepEqual(await queue(),events);
      const restore=await executeBatch(transactionalPool,batch,{apply:true,restore:true});assert.equal(restore.pages[0].changed,false);
      assert.deepEqual(await dates(),after);
    });
    await scenario(async()=>{
      const [state]=await readStates(client,[refs[1]]);
      await assert.rejects(executeBatch(transactionalPool,[{slug:child,family:'course',before:state,after:{...state,lesson:{...state.lesson,display_order:1}}}]),/unique|duplicate/);
    });
    await scenario(async()=>{
      const [state]=await readStates(client,[refs[0]]);
      await assert.rejects(executeBatch(transactionalPool,[{slug:root,family:'course',before:state,after:{...state,registry:{...state.registry,is_published:false}}}]),/published course/);
    });
    await scenario(async()=>{
      await client.query("update public.stack127_pages set is_published=false,published_at=null,updated_at=null where slug=$1",[child]);
      const row=(await client.query('select is_published,published_at,updated_at from public.stack127_pages where slug=$1',[child])).rows[0];
      assert.deepEqual(row,{is_published:false,published_at:null,updated_at:null});
      await client.query('set local role anon');
      assert.equal((await client.query('select count(*)::int count from public.stack127_course_lessons')).rows[0].count,16);
      await client.query('reset role');
    });
    await scenario(async()=>{
      const [template]=await readStates(client,[refs[0]]);
      const slug='course-definition-test';
      const newRoot={...template,slug,registry:{...template.registry,is_published:false},lesson:{...template.lesson,course_slug:slug}};
      const newChild={...newRoot,slug:slug+'/lesson',content:null,lesson:{...newRoot.lesson,title:'Child lesson',display_order:2}};
      const result=await executeBatch(transactionalPool,[newChild,newRoot].map(after=>({slug:after.slug,family:'course',before:null,after})),{apply:true});
      assert.ok(result.pages.every(page=>page.changed));
      const registry=(await client.query('select is_published,published_at,updated_at from public.stack127_pages where slug=$1',[slug])).rows[0];
      assert.deepEqual(registry,{is_published:false,published_at:null,updated_at:null});
      await client.query('delete from public.stack127_course_lessons where page_id=(select id from public.stack127_pages where slug=$1)',[newChild.slug]);
      await client.query('delete from public.stack127_course_pages where page_id=(select id from public.stack127_pages where slug=$1)',[slug]);
    });
    await scenario(async()=>{
      await assert.rejects(client.query("update public.stack127_pages set page_family='site' where slug=$1",[child]),/Remove course definitions/);
    });
  } finally {client.release();await pool.end();}
});

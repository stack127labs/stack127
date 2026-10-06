import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {resolveDatabaseUrl} from '../../scripts/stack127/tool-pages/lib.mjs';
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

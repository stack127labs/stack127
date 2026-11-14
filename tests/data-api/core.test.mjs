import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { executeTool,filterSql,validateInput,decodeCursor,normalizeDomain } from '../../lib/data-api/ad-networks/core.ts';
import { validateReadonlySql } from '../../lib/data-api/ad-networks/sql.ts';
import { authenticate,matchesSecret } from '../../lib/data-api/auth.ts';
import { rowLimit } from '../../lib/data-api/config.ts';
import { handleMcp } from '../../lib/data-api/mcp.ts';
import { handleRest } from '../../lib/data-api/rest.ts';

const token=randomBytes(32).toString('hex');
test('private authentication rejects missing, malformed, short and wrong secrets; accepts bearer or path',async()=>{
  process.env.STACK127_MCP_TOKEN=token;process.env.STACK127_MCP_PATH_SECRET=token+'a';
  for(const headers of [{},{authorization:'Bearer wrong'},{authorization:'Basic '+token}])await assert.rejects(authenticate(new Request('http://localhost',{headers})),{status:401});
  assert.equal((await authenticate(new Request('http://localhost',{headers:{authorization:'Bearer '+token}}))).id,'private-owner');
  assert.equal((await authenticate(new Request('http://localhost'),token+'a')).id,'private-owner');
  await assert.rejects(authenticate(new Request('http://localhost',{headers:{authorization:'Bearer wrong'}}),token+'a'));
  assert.equal(matchesSecret('short','short'),false);assert.equal(matchesSecret(token+'a',token),false);
});
test('off switches fail closed before database/authentication',async()=>{
  delete process.env.STACK127_MCP_ENABLED;delete process.env.STACK127_REST_ENABLED;
  for(const r of [await handleMcp(new Request('http://localhost',{method:'POST'})),await handleRest(new Request('http://localhost',{method:'POST'}),'count_sites')]){
    assert.equal(r.status,404);assert.equal(r.headers.get('cache-control'),'no-store');
  }
});
test('input bounds and ranges reject unsafe/unbounded requests',()=>{
  for(const [name,input] of [['find_sites',{limit:201}],['count_sites',{status:'ended'}],['count_sites',{networks:['ezoic','ezoic']}],['count_sites',{group_by:['network','network']}],['count_sites',{group_by:['network','niche','platform']}],['count_sites',{registered_after:'2026-02-30'}],['count_sites',{registered_after:'2026-01-02',registered_before:'2026-01-01'}],['count_sites',{min_age:10,max_age:2}],['network_movements',{from:'2020-01-01',to:'2026-01-01'}],['compare_ad_networks',{networks:['ezoic'],dimension:'niche'}]])assert.throws(()=>validateInput(name,input),{status:400});
  process.env.STACK127_DATA_MAX_ROWS='201';assert.throws(rowLimit);delete process.env.STACK127_DATA_MAX_ROWS;
  assert.throws(()=>decodeCursor('invalid','a'),{status:400});
  assert.equal(normalizeDomain('EXAMPLE.COM.'),'example.com');assert.throws(()=>normalizeDomain('https://example.com'));
});
test('filters bind values and always use listed status, including managed',()=>{
  const f=filterSql({networks:['ezoic'],relationship:'managed',niche:"food' or 1=1--",registered_after:'2020-01-01',max_age:5});
  assert.match(f.text,/confirmed','stale/);assert.match(f.text,/primary_or_exclusive_manager/);
  assert.ok(!f.text.includes("food'"));assert.deepEqual(f.values,[['ezoic'],"food' or 1=1--",'2020-01-01',5]);
});
test('SQL parser rejects writes, batches, CTE mutations, locks, private fields by relation, functions and casts',()=>{
  for(const sql of ['delete from stack127_data.ad_networks','select 1; select 2','with x as (delete from public.ad_networks returning *) select * from x',
    'select * from public.ad_network_publishers','select * from pg_catalog.pg_authid','select pg_read_file(\'/etc/passwd\')',
    "select current_setting('app.secret')",'select set_config(\'role\',\'postgres\',true)',
    'select * from stack127_data.ad_networks for update','select 1 into temporary table stolen',
    'select pg_sleep(10)','select * from stack127_data.ad_networks -- comment',"select 'public.ad_network_publishers'::regclass",'values (1)',
    'with x as (select 1) select * from x'])assert.throws(()=>validateReadonlySql(sql),{status:400},sql);
  for(const sql of ['select slug,name from stack127_data.ad_networks order by slug',
    'select count(distinct p.id) from stack127_data.ad_network_publishers p join stack127_data.ad_network_publisher_relationships r on p.id=r.publisher_id',
    'select * from (select slug from stack127_data.ad_networks) as n'])assert.equal(validateReadonlySql(sql),sql);
});
test('every core response carries definitions, caveats, filters, data time and citation',async()=>{
  const transaction=async run=>run({query:async sql=>sql.includes('dataset_summary')?[{as_of:'2026-11-14T00:00:00Z'}]:[{total:2}]});
  const answer=await executeTool('count_sites',{},transaction);
  assert.equal(answer.data.total,2);assert.equal(answer.filters.relationship,'listed');assert.ok(answer.as_of);
  assert.match(answer.definitions.not_ranked,/not small/);assert.ok(answer.definitions.managed);assert.ok(answer.definitions.shares);
  assert.ok(answer.caveats.some(x=>x.includes('STRONG WARNING')));assert.ok(answer.url.startsWith('https://stack127.com/'));
});

test('one response shares a hard row budget across distributions and history',async()=>{
  const {boundResults}=await import('../../lib/data-api/ad-networks/core.ts');
  const data={co_listed:[1,2,3],daily_counts:[1,2,3],distributions:{niche:{rows:[1,2,3]},platform:{rows:[1,2]}}};
  const budget=boundResults(data,5);
  assert.equal(budget.row_count,5);assert.ok(budget.truncated_sets.length);
  assert.equal(data.co_listed.length+data.daily_counts.length+data.distributions.niche.rows.length+data.distributions.platform.rows.length,5);
});
test('body limit is checked while reading, even without Content-Length',async()=>{
  const {readJson}=await import('../../lib/data-api/http.ts');
  await assert.rejects(readJson(new Request('http://localhost',{method:'POST',body:'x'.repeat(65537)})),{status:413});
  await assert.rejects(readJson(new Request('http://localhost',{method:'POST',body:'{'})),{status:400});
});

test('SQL cannot pack unbounded records into arrays or collection aggregates',()=>{
  for(const sql of [
    'select array(select normalized_domain from stack127_data.ad_network_publishers limit 1000)',
    'select array_agg(normalized_domain) from stack127_data.ad_network_publishers',
    'select json_agg(p) from stack127_data.ad_network_publishers p',
    'select jsonb_agg(normalized_domain) from stack127_data.ad_network_publishers',
    "select string_agg(normalized_domain,',') from stack127_data.ad_network_publishers",
    'select xmlagg(normalized_domain) from stack127_data.ad_network_publishers',
    'select array[1,2,3]',
  ]) assert.throws(()=>validateReadonlySql(sql),{status:400},sql);
});
test('SQL flag alone cannot run a query or expose a REST route',async()=>{
  process.env.STACK127_DATA_SQL_ENABLED='true';delete process.env.STACK127_DATA_SQL_DATABASE_URL;
  await assert.rejects(executeTool('run_readonly_sql',{sql:'select 1'},async()=>assert.fail('SQL reached a transaction')),{status:404});
  const response=await handleRest(new Request('http://localhost',{method:'POST'}),'run_readonly_sql');
  assert.equal(response.status,404);
  delete process.env.STACK127_DATA_SQL_ENABLED;
});
test('MCP text contains the full answer and applies the same byte limit after formatting',async()=>{
  const {mcpAnswer}=await import('../../lib/data-api/mcp.ts');
  const answer=await executeTool('count_sites',{},async run=>run({query:async sql=>sql.includes('dataset_summary')?[{as_of:null}]:[{total:42}]}));
  const result=mcpAnswer(answer);
  assert.deepEqual(JSON.parse(result.content[0].text),result.structuredContent);
  assert.equal(JSON.parse(result.content[0].text).data.total,42);
  assert.throws(()=>mcpAnswer({...answer,data:{huge:'x'.repeat(1_000_000)}}),{status:413});
  assert.throws(()=>mcpAnswer({...answer,data:{many:Array(50000).fill({a:1})}}),{status:413});
});

test('future SQL uses only its dedicated pool and read-only transaction, including rollback',async()=>{
  const {sqlReadTransaction}=await import('../../lib/data-api/database.ts');
  const statements=[];let released=0;
  const previous={app:globalThis.stack127DataApiPool,sql:globalThis.stack127DataSqlPool,flag:process.env.STACK127_DATA_SQL_ENABLED,url:process.env.STACK127_DATA_SQL_DATABASE_URL};
  globalThis.stack127DataApiPool={connect:()=>assert.fail('arbitrary SQL used the app login')};
  globalThis.stack127DataSqlPool={connect:async()=>({query:async(sql,values)=>{
    statements.push({sql,values});return {rows:sql.includes('dataset_summary')?[{as_of:null}]:[{value:1}]};
  },release(){released++;}})};
  Object.assign(process.env,{STACK127_DATA_SQL_ENABLED:'true',STACK127_DATA_SQL_DATABASE_URL:'postgresql://restricted:unused@localhost/research'});
  try {
    const answer=await executeTool('run_readonly_sql',{sql:'select 1 as value'});
    assert.equal(answer.data.rows[0].value,1);
    assert.match(statements[0].sql,/begin transaction.*read only/);
    assert.ok(statements.some(q=>q.sql.includes('statement_timeout')&&q.values[0]==='15000'));
    assert.ok(!statements.some(q=>/set local role/i.test(q.sql)));
    assert.equal(statements.at(-1).sql,'commit');
    await assert.rejects(sqlReadTransaction(()=>{throw Error('callback failed');}),/callback failed/);
    assert.equal(statements.at(-1).sql,'rollback');assert.equal(released,2);
  } finally {
    for(const [key,value] of [['STACK127_DATA_SQL_ENABLED',previous.flag],['STACK127_DATA_SQL_DATABASE_URL',previous.url]]) {
      if(value===undefined)delete process.env[key];else process.env[key]=value;
    }
    globalThis.stack127DataApiPool=previous.app;globalThis.stack127DataSqlPool=previous.sql;
  }
});

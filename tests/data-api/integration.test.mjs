import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { once } from 'node:events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { POST as bearerMcp } from '../../app/api/mcp/route.ts';
import { POST as pathMcp } from '../../app/api/mcp/[secret]/route.ts';
import { POST as restRoute } from '../../app/api/v1/ad-networks/[tool]/route.ts';
import { executeTool,validateInput } from '../../lib/data-api/ad-networks/core.ts';
import { dataPool,readTransaction,consumeRateLimit } from '../../lib/data-api/database.ts';
import { toolNames } from '../../lib/data-api/ad-networks/schemas.ts';

// Opt-in is insufficient: compare the effective connection with the checked
// development credential and pin the managed project identity before any write.
let devEnv={};
try {devEnv=parseEnv(readFileSync(new URL('../../.env.local',import.meta.url),'utf8'));} catch { /* No development credentials: skip. */ }
const connection=process.env.DATABASE_POOLER_URL||process.env.DATABASE_URL;
const devConnection=devEnv.DATABASE_POOLER_URL||devEnv.DATABASE_URL;
const live=process.env.STACK127_DATA_INTEGRATION==='true'
  && devEnv.SUPABASE_URL==='https://yzasonowwlvritqicatj.supabase.co'
  && connection===devConnection
  && new URL(connection).username==='postgres.yzasonowwlvritqicatj'
  && new URL(connection).hostname.endsWith('.pooler.supabase.com');
test('development: SDK Streamable HTTP calls every tool, REST parity, public-count parity, projection boundaries and durable limits',{skip:!live,timeout:180000},async()=>{
  delete process.env.STACK127_DATA_SQL_DATABASE_URL;
  Object.assign(process.env,{STACK127_MCP_ENABLED:'true',STACK127_REST_ENABLED:'true',STACK127_DATA_SQL_ENABLED:'true',STACK127_MCP_TOKEN:randomBytes(32).toString('hex'),STACK127_MCP_PATH_SECRET:randomBytes(32).toString('hex'),STACK127_DATA_RPM:'1000'});
  const principal={id:'data-api-test-'+randomBytes(6).toString('hex'),plan:'private',allowSql:true};
  const server=createServer(async(req,res)=>{
    try {
      const chunks=[];for await(const c of req)chunks.push(c);
      const request=new Request(`http://127.0.0.1${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});
      const path=new URL(request.url).pathname;
      const response=path.startsWith('/api/v1/')?await restRoute(request,{params:Promise.resolve({tool:path.split('/').at(-1)})}):path.split('/')[3]?await pathMcp(request,{params:Promise.resolve({secret:path.split('/')[3]})}):await bearerMcp(request);
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    }catch{res.writeHead(500);res.end();}
  });
  const client=new Client({name:'stack127-data-api-test',version:'1.0.0'});
  server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(base+'/api/mcp/'+process.env.STACK127_MCP_PATH_SECRET)));
    const {tools}=await client.listTools();assert.deepEqual(tools.map(t=>t.name).sort(),toolNames.filter(n=>n!=='run_readonly_sql').toSorted());
    for(const t of tools){assert.equal(t.annotations.readOnlyHint,true);assert.ok(t.title&&t.description&&t.outputSchema);}
    const sample=(await executeTool('find_sites',{limit:1})).data.sites[0];assert.ok(sample);
    const inputs={get_brand_kit:{},ad_networks_overview:{},list_ad_networks:{},get_ad_network:{network:'mediavine'},compare_ad_networks:{networks:['mediavine','ezoic'],dimension:'niche'},count_sites:{networks:['mediavine'],relationship:'managed'},find_sites:{limit:2},lookup_site:{domain:sample.domain},network_movements:{from:'2026-10-19',to:'2026-11-14'},run_readonly_sql:{sql:'select slug,name from stack127_data.ad_networks order by slug'}};
    for(const name of toolNames.filter(n=>n!=='run_readonly_sql')){const result=await client.callTool({name,arguments:inputs[name]});assert.ok(!result.isError,`${name}: ${JSON.stringify(result.content)}`);const answer=result.structuredContent;assert.ok(answer.definitions&&answer.caveats&&answer.url);assert.ok('as_of' in answer);assert.deepEqual(JSON.parse(result.content[0].text),answer);assert.ok(!JSON.stringify(answer).includes('publisher_name'));console.log('SDK tool passed:',name);}
    const response=await fetch(base+'/api/v1/ad-networks/count_sites',{method:'POST',headers:{authorization:'Bearer '+process.env.STACK127_MCP_TOKEN,'content-type':'application/json'},body:JSON.stringify(inputs.count_sites)});
    assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const rest=await response.json();
    // Same SQL definition used by loadAdNetworks/public listed rows, restricted to the agreed manager relationship.
    const raw=await dataPool().connect();try{await raw.query('begin transaction read only');
      const direct=await raw.query("select count(distinct r.publisher_id)::int as total from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id where n.slug='mediavine' and r.status in ('confirmed','stale') and r.relationship_type='primary_or_exclusive_manager'");assert.equal(rest.data.total,direct.rows[0].total);
      const global=await raw.query("select count(distinct publisher_id)::int as total from public.ad_network_publisher_relationships where status in ('confirmed','stale')");assert.equal((await executeTool('count_sites',{})).data.total,global.rows[0].total);
      console.log('Public query parity: managed mediavine',direct.rows[0].total,'global distinct listed',global.rows[0].total);
    }finally{await raw.query('rollback');raw.release();}
    const byGroup=await executeTool('count_sites',{networks:['mediavine','ezoic'],group_by:['network','niche']});
    for(const slug of ['mediavine','ezoic']){const rows=byGroup.data.rows.filter(r=>r.network===slug);assert.equal(rows.reduce((s,r)=>s+r.count,0),(await executeTool('count_sites',{networks:[slug]})).data.total);assert.ok(Math.abs(rows.reduce((s,r)=>s+r.share_percent,0)-100)<0.00001);}
    for(const sort of ['domain','newest','oldest']){const first=await executeTool('find_sites',{limit:2,sort});const second=await executeTool('find_sites',{limit:2,sort,cursor:first.data.next_cursor});assert.equal(new Set([...first.data.sites,...second.data.sites].map(s=>s.domain)).size,4);}
    await assert.rejects(readTransaction(db=>db.query('select publisher_name from ad_network_publishers')));
    await assert.rejects(readTransaction(db=>db.query("delete from ad_networks where false")));
    const identity=(await readTransaction(db=>db.query("select current_user as role,current_setting('transaction_read_only') as ro")))[0];
    assert.equal(identity.role,'postgres');assert.equal(identity.ro,'on');
    const before=await readTransaction(db=>db.query("select current_setting('statement_timeout') as timeout"));assert.equal(before[0].timeout,'15s');
    process.env.STACK127_DATA_TIMEOUT_MS='10';await assert.rejects(readTransaction(db=>db.query('select pg_sleep(0.05)')),{code:'57014'});delete process.env.STACK127_DATA_TIMEOUT_MS;
    process.env.STACK127_DATA_MAX_ROWS='2';const capped=await executeTool('list_ad_networks',{});assert.equal(capped.data.networks.length,2);assert.equal(capped.limits.truncated,true);delete process.env.STACK127_DATA_MAX_ROWS;
    process.env.STACK127_DATA_RPM='2';const rates=await Promise.allSettled(Array.from({length:5},()=>consumeRateLimit(principal)));assert.equal(rates.filter(r=>r.status==='fulfilled').length,2);
    process.env.STACK127_DATA_RPM='1000';process.env.STACK127_DATA_RPD='2';await assert.rejects(consumeRateLimit(principal),{status:429});
    process.env.STACK127_DATA_RPD='10000';process.env.STACK127_DATA_SQL_ENABLED='false';const noSql=await client.listTools();assert.ok(!noSql.tools.some(t=>t.name==='run_readonly_sql'));
    const rejectedSql=await fetch(base+'/api/v1/ad-networks/run_readonly_sql',{method:'POST',headers:{authorization:'Bearer '+process.env.STACK127_MCP_TOKEN},body:JSON.stringify({sql:'select 1'})});assert.equal(rejectedSql.status,404);
    const invalid=await fetch(base+'/api/v1/ad-networks/find_sites',{method:'POST',headers:{authorization:'Bearer '+process.env.STACK127_MCP_TOKEN},body:'{"limit":201}'});assert.equal(invalid.status,400);
    const unauthorized=await fetch(base+'/api/v1/ad-networks/count_sites',{method:'POST',body:'{}'});assert.equal(unauthorized.status,401);
    const origin=await fetch(base+'/api/mcp',{method:'POST',headers:{origin:'https://evil.example',authorization:'Bearer '+process.env.STACK127_MCP_TOKEN},body:'{}'});assert.equal(origin.status,403);
  }finally{await client.close();await new Promise(resolve=>server.close(resolve));await dataPool().query('delete from stack127_api.rate_limits where principal=$1',[principal.id]);await dataPool().end();}
});

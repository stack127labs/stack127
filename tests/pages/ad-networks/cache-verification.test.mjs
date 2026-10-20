import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as niches from '../../../lib/ad-network-niches.ts';
import {cacheBodyDigest} from '../../../scripts/stack127/cache/refresh.mjs';
import {targetsForEvents} from '../../../scripts/stack127/cache/targets.mjs';
import {refreshApiRecords} from '../../../scripts/stack127/frontend/content-queue.mjs';
import {parseAdNetworkSitesParams} from '../../../app/api/ad-networks/input.ts';
import {adNetworksLibrary} from './loader-harness.mjs';

const {defaultAdNetworkSitesQuery}=adNetworksLibrary(()=>{throw Error('Defaults must not query the database');});

function load(file,imports,globals={}) {
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
  }).outputText;
  vm.runInNewContext(code,{exports,URL,URLSearchParams,Response,AbortSignal,process:{env:{}},console:{error(){}},
    require(name){if(Object.hasOwn(imports,name))return imports[name];throw Error(`Unexpected import: ${name}`);},...globals});
  return exports;
}
function sourceProbe({published=true}={}) {
  const calls=[];
  const api=load('../../../lib/ad-networks-cache-verification.ts',{
    './db':{getPool:()=>({query:async sql=>{
      if(sql.includes('select is_published'))return {rows:[{is_published:published}]};
      if(!published)throw Error('Unpublished sources must not sample publishers');
      return {rows:[{domain:'collegefashion.net',network:'mediavine'}]};
    }})},
    './ad-network-niches':niches,
    './ad-networks':{
      defaultAdNetworkSitesQuery,
      loadAdNetworkSites:async query=>{calls.push(['sites',query]);return {rows:[{domain:query.q}],total:1};},
      loadAdNetworkCheckerSite:async domain=>{calls.push(['site',domain]);return {site:{domain,managed_by:{slug:'mediavine'}}};},
      getAdNetworkSites:()=>{throw Error('Cached getter used as source');},getAdNetworkCheckerSite:()=>{throw Error('Cached getter used as source');},
    },
  });
  return {...api,calls};
}
function refreshRoute({probe,fetch,query=async()=>({rows:[]})}) {
  const ignored=['apps','terminal-apps','hardware-directories','hardware-directories/search-index','zigbee-devices',
    'zigbee-devices/search-index','amazon-affiliate/server','self-host-apps-search-data','self-host-apps-search',
    'self-hosted-app-resource-planner/data','platform-fees/groups','launch-directories-data'];
  return load('../../../app/api/cache/refresh/route.ts',{
    ...Object.fromEntries(ignored.map(name=>[`@/lib/${name}`,{}])),
    'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},
    '@/scripts/stack127/cache/refresh.mjs':{cacheBodyDigest},
    '@/scripts/stack127/cache/verify-origin-indexing.mjs':{inspectOriginIndexing:()=>{}},
    '@/lib/cache-auth':{cacheAuthorized:async()=>true},
    '@/lib/db':{getPool:()=>({query})},'@/lib/page-source':{sitePageAvailable:(_path,row)=>Boolean(row?.is_published)},
    '@/lib/ad-networks-cache-verification':probe,
  },{fetch});
}
const request=path=>new Request('https://stack127.com/api/cache/refresh',{method:'POST',body:JSON.stringify({paths:[path]})});

test('representative API checks use direct source loaders and real request parameters',async()=>{
  const probe=sourceProbe();
  const sites=await probe.getAdNetworkApiVerification('/api/ad-networks/sites');
  assert.equal(new URL(sites.requestPath,'https://stack127.com').searchParams.get('q'),'collegefashion.net');
  assert.equal(probe.calls[0][0],'sites');assert.equal(probe.calls[0][1].network,'mediavine');
  assert.equal(probe.calls[0][1].sort,'traffic');
  assert.deepEqual(JSON.parse(JSON.stringify(probe.calls[0][1])),
    parseAdNetworkSitesParams(new URL(sites.requestPath,'https://stack127.com').searchParams));
  const site=await probe.getAdNetworkApiVerification('/api/ad-networks/site');
  assert.equal(site.requestPath,'/api/ad-networks/site?domain=collegefashion.net');
  assert.equal(site.expected.site.site.managed_by.slug,'mediavine');
  const hidden=sourceProbe({published:false});assert.equal((await hidden.getAdNetworkApiVerification('/api/ad-networks/site')).expected,null);
  assert.equal(hidden.calls.length,0);
});

test('unpublished API verification returns valid 404 probes without sampling or loading publishers',async()=>{
  for(const published of [false,null]) {
    const probe=sourceProbe({published});
    for(const path of ['/api/ad-networks/sites','/api/ad-networks/site']) {
      const result=await probe.getAdNetworkApiVerification(path);
      assert.equal(result.expected,null);
      assert.equal(result.requestPath,path==='/api/ad-networks/site'?`${path}?domain=stack127.com`:path);
    }
    assert.equal(probe.calls.length,0);
  }
});

test('stats and niche refreshes do not look up reserved names as network identities',async()=>{
  const probe=sourceProbe();let networkQueries=0;
  const revision='2026-10-15T12:00:00.000Z';
  const {POST}=refreshRoute({probe,query:async sql=>{
    if(sql.includes('from public.ad_networks')){networkQueries++;return {rows:[]};}
    return {rows:[{is_published:true,is_indexable:true,row_updated_at:new Date(revision),page_family:'directory',has_page_content:true}]};
  },fetch:async()=>new Response(`<meta name="stack127-content-revision" content="${revision}">`)});
  for(const path of ['/ad-networks/stats','/ad-networks/niches','/ad-networks/niches/food'])assert.equal((await POST(request(path))).status,200,path);
  assert.equal(networkQueries,0);
  assert.equal(probe.adNetworkPageKind('/ad-networks/niches/missing'),'missing');
});

test('origin API verification rejects stale data and proves the concrete query used for public checks',async()=>{
  for(const path of ['/api/ad-networks/sites','/api/ad-networks/site']) {
    const probe=sourceProbe();const expected=await probe.getAdNetworkApiVerification(path);let stale=false;const fetched=[];
    const {POST}=refreshRoute({probe,fetch:async url=>{fetched.push(url);return Response.json(stale?{old:true}:expected.expected);}});
    const response=await POST(request(path));assert.equal(response.status,200);
    const proof=(await response.json()).verified[0];assert.equal(proof.path,path);assert.equal(proof.requestPath,expected.requestPath);
    assert.match(proof.digest,/^[a-f0-9]{64}$/);assert.ok(fetched[0].endsWith(expected.requestPath));
    stale=true;assert.equal((await POST(request(path))).status,503);
  }
});

test('ad-network APIs are verified after purge and stale public responses prevent completion',async()=>{
  const targets=targetsForEvents([{entity_type:'ad_networks',slug:'mediavine'}]);
  for(const path of ['/api/ad-networks/sites','/api/ad-networks/site'])assert.ok(targets.verifyPaths.includes(path));
  const fresh=JSON.stringify({fresh:true});const digest=await cacheBodyDigest(fresh);
  for(const stale of [false,true]) {
    const calls=[];
    const run=refreshApiRecords({targets},'test-key',{site:'https://stack127.com',zone:'zone',cloudflareToken:'token',fetchImplementation:async(url,init={})=>{
      const parsed=new URL(url);calls.push(parsed.pathname+parsed.search);
      if(parsed.pathname==='/api/cache/revalidate')return Response.json({ok:true});
      if(parsed.pathname==='/api/cache/refresh')return Response.json({verified:JSON.parse(init.body).paths.map(path=>({path,
        requestPath:path==='/api/ad-networks/site'?`${path}?domain=collegefashion.net`:`${path}?network=mediavine&q=collegefashion.net`,status:200,digest}))});
      if(parsed.hostname==='api.cloudflare.com')return Response.json({success:true});
      return new Response(stale?'old':fresh);
    }});
    if(stale)await assert.rejects(run,/Public API content is stale/);else await run;
    const purged=calls.findIndex(path=>path.includes('purge_cache'));
    assert.ok(purged>=0);assert.ok(calls.findIndex(path=>path.startsWith('/api/ad-networks/site?'))>purged);
    assert.ok(calls.findIndex(path=>path.startsWith('/api/ad-networks/sites?'))>purged);
  }
});

test('unpublishing either ad-network API source requires a 404 at its representative request',async()=>{
  for(const path of ['/api/ad-networks/sites','/api/ad-networks/site']) {
    const probe=sourceProbe({published:false});let removed=false;
    const {POST}=refreshRoute({probe,fetch:async()=>removed?Response.json({error:'Not found'},{status:404}):Response.json({old:true})});
    assert.equal((await POST(request(path))).status,503);
    removed=true;const response=await POST(request(path));assert.equal(response.status,200);
    assert.equal((await response.json()).verified[0].status,404);
  }
});

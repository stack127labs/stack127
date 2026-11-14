import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import * as pathPolicy from '../../lib/data-api/path-policy.mjs';
import * as privateResponse from '../../lib/data-api/private-response.mjs';
import {randomBytes} from 'node:crypto';
import * as bearer from '../../app/api/mcp/route.ts';
import * as pathRoute from '../../app/api/mcp/[secret]/route.ts';
import * as rest from '../../app/api/v1/ad-networks/[tool]/route.ts';
import * as unknown from '../../app/api/[...path]/route.ts';

const require=createRequire(import.meta.url);
const {NextRequest}=require('next/server');
// Execute the real proxy. Stub only public-page imports, which private API
// requests must never call. This avoids loading the unrelated Next page cache.
const exports={};
const forbidden=()=>assert.fail('API entered public page metadata code');
const publicModules={
  './lib/data-api/path-policy.mjs':pathPolicy,
  './lib/data-api/private-response.mjs':privateResponse,
  '@/lib/page-registry':{getExactPublishedPage:forbidden,slugFromPathname:forbidden},
  '@/lib/tool-catalogs':{getPublishedToolCatalog:forbidden},
  '@/lib/tool-pages':{getPublishedToolPage:forbidden},
  '@/lib/directory-pages':{getPublishedDirectoryPage:forbidden},
  '@/lib/page-source':{sitePageAvailable:forbidden},
  '@/lib/seo':{absoluteUrl:forbidden},
  '@/lib/seo/query-indexing.mjs':{queryNeedsNoindex:forbidden},
};
const source=ts.transpileModule(readFileSync(new URL('../../proxy.ts',import.meta.url),'utf8'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
}).outputText;
vm.runInNewContext(source,{exports,Headers,URLSearchParams,process,require:name=>publicModules[name]??require(name)});
const {proxy}=exports;

// Follow Next's response-header merge and request-header override protocol.
async function pipeline(path,method,route,context,headers={}) {
  const request=new NextRequest('http://localhost'+path,{method,headers,
    ...(method==='POST'?{body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'}),headers:{...headers,'content-type':'application/json','accept':'application/json, text/event-stream'}}:{})});
  const middleware=await proxy(request);
  for(const [key,value] of middleware.headers) {
    assert.ok(!value.includes(secret),key+' exposed the path credential');
    assert.ok(!['cache-tag','link','x-stack127-pathname','x-middleware-request-x-stack127-pathname'].includes(key),key);
  }
  const forwarded=new Headers(request.headers);
  const overrides=middleware.headers.get('x-middleware-override-headers');
  if(overrides!==null) {
    for(const key of [...forwarded.keys()])forwarded.delete(key);
    for(const key of overrides.split(',').filter(Boolean))forwarded.set(key,middleware.headers.get('x-middleware-request-'+key));
  }
  assert.equal(forwarded.get('x-stack127-pathname'),null);
  let response;
  try {response=middleware.status===404?middleware:await route(new Request(request,{headers:forwarded}),context);}
  catch {response=new Response(null,{status:500});} // Framework error boundary.
  for(const [key,value] of middleware.headers)if(!key.startsWith('x-middleware-'))response.headers.set(key,value);
  for(const [key,value] of response.headers) {
    assert.ok(!value.includes(secret),key+' exposed the path credential');
    assert.ok(!['cache-tag','link','x-stack127-pathname','x-stack127-cache-class'].includes(key),key);
  }
  assert.ok(!(await response.clone().text()).includes(secret));
  return response;
}
const secret=randomBytes(32).toString('hex');
let mode='ok';
globalThis.stack127DataApiPool={
  query:async()=>{if(mode==='error')throw Error(secret);return {rowCount:mode==='rate'?0:1};},
  connect:async()=>({query:async sql=>({rows:sql.includes('dataset_summary')?[{as_of:null}]:sql.includes('count(')?[{total:42}]:[]}),release(){}}),
};
test('real proxy plus real API routes never expose capability paths on success or errors, for every method',async t=>{
  Object.assign(process.env,{STACK127_MCP_ENABLED:'true',STACK127_REST_ENABLED:'true',STACK127_MCP_PATH_SECRET:secret,STACK127_MCP_TOKEN:secret+'a',STACK127_DATA_SQL_ENABLED:'true'});
  delete process.env.STACK127_DATA_SQL_DATABASE_URL;
  const logs=[];
  for(const name of ['info','warn','error'])t.mock.method(console,name,(...args)=>logs.push(args.join(' ')));
  const context={params:Promise.resolve({secret})};
  for(const method of ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD']) {
    assert.equal((await pipeline('/api/mcp/'+secret+'?q=private',method,pathRoute[method],context)).status,method==='POST'?200:405);
    assert.equal((await pipeline('/api/mcp/wrong?q=private',method,pathRoute[method],{params:Promise.resolve({secret:'wrong'})})).status,404);
    assert.equal((await pipeline('/api/v1/ad-networks/count_sites?q=private',method,rest[method],{params:Promise.resolve({tool:'count_sites'})})).status,401);
    assert.equal((await pipeline('/api/mcp?q=private',method,bearer[method])).status,401);
  }
  const discovery=await pipeline('/api/mcp/'+secret,'POST',pathRoute.POST,context);
  assert.ok(!(await discovery.json()).result.tools.some(tool=>tool.name==='run_readonly_sql'));
  const unknownTool=await pipeline('/api/v1/ad-networks/unknown?q=private','POST',rest.POST,{params:Promise.resolve({tool:'unknown'})});
  assert.equal(unknownTool.status,404);
  await pipeline('/api/mcp/'+secret,'POST',pathRoute.POST,context,{'x-stack127-pathname':secret});
  const wrong=await pipeline('/api/mcp/wrong?q=private','POST',pathRoute.POST,{params:Promise.resolve({secret:'wrong'})});
  const missing=await pipeline('/api/does-not-exist?q=private','POST',unknown.POST);
  assert.deepEqual([...wrong.headers],[...missing.headers]);assert.equal(await wrong.text(),await missing.text());
  mode='rate';assert.equal((await pipeline('/api/mcp/'+secret,'POST',pathRoute.POST,context)).status,429);
  mode='error';assert.equal((await pipeline('/api/mcp/'+secret,'POST',pathRoute.POST,context)).status,503);
  mode='ok';assert.equal((await pipeline('/api/mcp/'+secret,'POST',pathRoute.POST,{params:Promise.reject(Error(secret))})).status,500);
  process.env.STACK127_MCP_ENABLED='false';assert.equal((await pipeline('/api/mcp/'+secret,'POST',pathRoute.POST,context)).status,404);
  assert.ok(!logs.join('\n').includes(secret));
});

test('installed Next logger omits canonical private namespaces and still logs public requests',t=>{
  const configExports={};
  const configCode=ts.transpileModule(readFileSync(new URL('../../next.config.ts',import.meta.url),'utf8'),{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true},
  }).outputText;
  vm.runInNewContext(configCode,{exports:configExports,process,URL,require:name=>{
    if(name==='@next/mdx')return ()=>config=>config;
    if(name==='./lib/allowed-dev-origins')return {collectAllowedDevOrigins:()=>[]};
    if(name==='./lib/legacy-shortcut-redirects')return {legacyShortcutRedirects:[]};
    throw Error('Unexpected config import: '+name);
  }});
  const {logRequests}=require('next/dist/server/dev/log-requests.js');
  const writes=[];
  const writer=t.mock.method(process.stdout,'write',chunk=>{writes.push(String(chunk));return true;});
  try {
    for(const method of ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD']) {
      for(const statusCode of [200,400,401,404,405,429,500,503]) {
        for(const url of ['/api/mcp', '/api/mcp/'+secret, '/api/mcp/wrong', '/api/v1', '/api/v1/ad-networks/count_sites'].flatMap(path=>[path,path+'?q=private'])) {
          logRequests({url,method},{statusCode},configExports.default.logging,1n,2n);
        }
      }
    }
    assert.deepEqual(writes,[]);
    for (const url of ['/api/health', '/api/ad-networks/overview', '/api/mcp-public', '/api/v10', '/self-host-apps?q=private']) {
      logRequests({url, method:'GET'}, {statusCode:200}, configExports.default.logging, 1n, 2n);
      assert.ok(writes.some(line=>line.includes(url)), 'public request logging missing for '+url);
    }
  }finally{writer.mock.restore();}
});

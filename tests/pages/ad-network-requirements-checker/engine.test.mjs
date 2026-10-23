import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateRecommendationInput, recommendAdNetworks, parseRecommendationQuery, recommendationShareParams } from '../../../lib/ad-network-requirements/engine.ts';
import { estimateMeasures } from '../../../lib/ad-network-requirements/estimate.ts';
import { adNetworkProfiles } from '../../../lib/ad-network-requirements/profiles.ts';
import { adNetworkNiches } from '../../../lib/ad-network-niches.ts';

const input = extra => ({ visitsUnit:'sessions', ...extra });
const recommend = extra => recommendAdNetworks(input(extra),null);
const names = cards => cards.map(c=>c.slug);
const scenarios = [
  { title:'tiny food blog', input:{niche:'food',pageviews:3000,siteAge:'3to6m',tier1Share:60,current:'none'},
    rows:[['google-adsense',89.96,89.96,'no_minimum'],['journey-by-mediavine',54.10,57.10,'estimate']],
    add:[['infolinks',77.28],['revcontent',73.42]],growth:['monumetric'],suggest:null },
  { title:'default 40k food blog', input:{niche:'food',pageviews:40000,visits:22000,siteAge:'gt12m',tier1Share:65,current:'google-adsense',adRevenueMonth:350},
    rows:[['monumetric',96.67,99.67,'estimate'],['raptive',88.72,91.72,'estimate'],['journey-by-mediavine',87,90,'estimate'],['newor-media',80.04,80.04,'no_minimum'],['she-media',69.81,63.81,'review_led']],
    add:[['infolinks',77.28],['revcontent',74.70]],growth:['mediavine','clickio'],suggest:null },
  { title:'developer site', input:{niche:'tech',pageviews:60000,visits:35000,siteAge:'gt12m',tier1Share:55,current:'none'},
    rows:[['raptive',88.46,91.46,'estimate'],['monumetric',85.44,88.44,'estimate'],['journey-by-mediavine',75.39,78.39,'estimate'],['newor-media',76.90,76.90,'no_minimum'],['buysellads-carbon-ads',77.66,71.66,'review_led']],
    add:[['ethicalads',76.24],['infolinks',77.28]],growth:['pubfuture','pubpower'],suggest:'adRevenueMonth' },
  { title:'gaming site', input:{niche:'gaming',pageviews:300000,visits:150000,siteAge:'gt12m',tier1Share:45,current:'google-adsense',adRevenueMonth:900},
    rows:[['clickio',87.71,93.71,'published_number'],['raptive',88.93,91.93,'estimate'],['publisher-collective',93.33,87.33,'review_led'],['pubfuture',81,87,'published_number'],['mediavine',83.82,86.82,'estimate']],
    add:[['sovrn',82.80],['mgid',79.73]],growth:['monumetric','freestar'],suggest:null },
  { title:'high volume outside Tier 1', input:{niche:'education',pageviews:2000000,visits:1100000,siteAge:'gt12m',tier1Share:10,current:'google-adsense',adRevenueMonth:2500},
    rows:[['ezoic',90,93,'estimate'],['publisher-collective',96.67,90.67,'review_led'],['clickio',82.80,88.80,'published_number'],['monetizemore-pubguru',79.73,85.73,'published_number'],['pubfuture',74.52,80.52,'published_number']],
    add:[['mgid',85.87],['sovrn',85.87]],setup:[['amazon-publisher-services',73.14],['sparteo',67.50]],growth:['the-moneytizer','she-media'],suggest:null },
  { title:'high revenue on Raptive', input:{niche:'food',pageviews:600000,visits:330000,siteAge:'gt12m',tier1Share:80,shares:{US:70},current:'raptive',adRevenueMonth:12000},
    rows:[['monetizemore-pubguru',93.33,99.33,'published_number'],['publift',92,98,'published_number'],['mediavine',93.33,96.33,'estimate'],['she-media',93.33,96.33,'estimate'],['clickio',85.87,91.87,'published_number']],
    add:[['mgid',85.87],['sovrn',85.87]],setup:[['adpushup',64.40],['publir',64.40]],growth:['the-moneytizer','publisher-collective'],suggest:null },
  { title:'unknowns with one visits number', input:{niche:'lifestyle',visits:25000,visitsUnit:'visits'},
    rows:[['google-adsense',76.67,76.67,'no_minimum'],['newor-media',76.48,76.48,'no_minimum'],['monumetric',68.74,71.74,'estimate'],['raptive',60.32,63.32,'estimate'],['journey-by-mediavine',52.59,55.59,'estimate']],
    add:[['infolinks',77.28],['revcontent',74.70]],growth:['pubfuture','pubpower'],suggest:'adRevenueMonth' },
  { title:'upgrading Journey', input:{niche:'food',pageviews:120000,visits:70000,siteAge:'gt12m',tier1Share:70,current:'journey-by-mediavine',adRevenueMonth:1100},
    rows:[['mediavine',98.33,109.33,'estimate'],['raptive',98.33,101.33,'estimate'],['she-media',98.33,101.33,'estimate'],['monumetric',91.78,94.78,'estimate'],['clickio',85.87,91.87,'published_number']],
    add:[['infolinks',77.28],['revcontent',75.99]],growth:['publift','ezoic'],suggest:null },
  { title:'developer already on Carbon', input:{niche:'tech',pageviews:150000,visits:90000,siteAge:'gt12m',tier1Share:50,current:'buysellads-carbon-ads'},
    rows:[['raptive',90.47,93.47,'estimate'],['clickio',83,86,'estimate'],['monumetric',78.40,81.40,'estimate'],['newor-media',75.99,75.99,'no_minimum'],['journey-by-mediavine',72.98,75.98,'estimate']],
    add:[],growth:['ezoic','publift'],suggest:'adRevenueMonth' },
];
for (const scenario of scenarios) test(`expected ranking: ${scenario.title}`,()=>{
  const result=recommend(scenario.input);
  assert.deepEqual(result.main.map(c=>[c.slug,c.debug.score,c.debug.rank,c.debug.basis]),scenario.rows);
  for(const c of [...result.main,...result.more.add,...result.more.setup])assert.equal(c.status,c.debug.basis!=='review_led'&&c.debug.score>=70?'good_fit':'worth_a_try');
  assert.deepEqual(result.lead,{kind:'apply',slug:scenario.rows[0][0],count:scenario.rows.length});
  assert.deepEqual(result.more.add.map(c=>[c.slug,c.debug.score]),scenario.add);
  assert.deepEqual(result.more.setup.map(c=>[c.slug,c.debug.score]),scenario.setup??[]);
  assert.deepEqual(names(result.more.growth),scenario.growth);
  assert.equal(result.suggestInput,scenario.suggest);
});

const base={niche:'food',pageviews:40000,siteAge:'gt12m',tier1Share:60,current:'none'};
const get=(slug,extra)=>recommendAdNetworks(input(extra),null,adNetworkProfiles.filter(p=>p.slug===slug || p.slug===extra.current));
const only=(slug,extra)=>get(slug,extra).main[0];
const close=(actual,expected,tolerance=1e-8)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);

test('R1: partial country split keeps feasible US bounds, and ranks the geography growth target',()=>{
  const x={niche:'lifestyle',pageviews:80000,siteAge:'gt12m',tier1Share:60,shares:{GB:50},current:'none'};
  assert.deepEqual(estimateMeasures(input(x)).usShare,{lo:0,hi:10,exact:false});
  const r=recommend(x);
  assert.deepEqual(r.main.map(c=>[c.slug,c.debug.score]),[['raptive',96.15],['monumetric',92.87],['journey-by-mediavine',83.58],['newor-media',76.90],['google-adsense',70.53]]);
  assert.deepEqual(names(r.more.growth),['pubfuture','she-media']);assert.equal(r.more.growth[1].bar.metric,'us_share');
});
test('R2: entered zero shares remain zero, including Moneytizer uniques',()=>{
  const x={niche:'lifestyle',visits:1000000,visitsUnit:'users',siteAge:'gt12m',shares:{US:0,GB:0,CA:0,AU:50,NZ:50},current:'none'};
  const m=estimateMeasures(input(x));assert.deepEqual(m.moneytizerShare,{lo:0,hi:0,exact:true});assert.equal(m.moneytizerUniques30d.lo,0);assert.equal(m.moneytizerUniques30d.hi,0);
  const r=recommend(x);assert.deepEqual(names(r.main),['raptive','publift','monumetric','ezoic','clickio']);assert.deepEqual(names(r.more.setup),['monetizemore-pubguru','amazon-publisher-services']);assert.ok(!names(r.more.growth).includes('the-moneytizer'));
});
test('R3/R4: choose Newor program on the lower bound before scoring',()=>{
  const x={niche:'sports',pageviews:100000,siteAge:'gt12m',tier1Share:70,current:'none'};
  const m=estimateMeasures(input(x));close(m.usPageviews.lo,38500);close(m.usPageviews.hi,63000);
  assert.equal(only('newor-media',x).program,'Elevate');assert.equal(only('newor-media',x).debug.score,76.90);
  const catapult=only('newor-media',{...x,shares:{US:62}});assert.equal(catapult.program,'Catapult');close(catapult.debug.S,0.8508333333333333);assert.equal(catapult.debug.basis,'published_number');assert.equal(catapult.debug.score,74.21);assert.equal(catapult.debug.rank,80.21);
});
test('R5: Concert has no clear step up at low traffic',()=>{
  const r=recommend({niche:'news',pageviews:20000,siteAge:'gt12m',tier1Share:50,current:'concert'});
  assert.deepEqual(r.lead,{kind:'no_step_up',current:'concert'});assert.deepEqual(r.main,[]);assert.deepEqual(r.more.growth,[]);assert.deepEqual(names(r.more.add),['revcontent','infolinks']);assert.equal(r.suggestInput,'adRevenueMonth');
});
test('R6: current Newor means its lowest tier, not inferred Premier',()=>{
  const x={niche:'food',pageviews:150000,siteAge:'gt12m',tier1Share:70,current:'newor-media',adRevenueMonth:900};
  assert.deepEqual(names(recommend(x).main),['mediavine','raptive','she-media','monumetric','clickio']);
  const journey=only('journey-by-mediavine',x);assert.equal(journey.debug.score,82.60);assert.equal(journey.debug.rank,85.60);
});
test('R7: young site softens age without becoming a growth gate',()=>{
  const x={...base,siteAge:'3to6m'};const r=recommend(x);
  assert.deepEqual(names(r.main),['monumetric','newor-media','google-adsense','journey-by-mediavine','she-media']);
  assert.ok(!names(r.more.growth).includes('raptive'));assert.deepEqual(get('raptive',x).main,[]);
  assert.equal(r.main.find(c=>c.slug==='journey-by-mediavine').debug.Aage,0.85);
});
test('R8/R10: complete country splits normalize Tier 1 or reject mismatches',()=>{
  const raw={niche:'food',pageviews:'40000',siteAge:'gt12m',tier1Share:'55.4',shareUS:'40',shareGB:'8',shareCA:'4',shareAU:'3',shareNZ:'0'};
  const valid=validateRecommendationInput(raw);assert.equal(valid.ok,true);assert.equal(valid.input.tier1Share,55);
  const m=estimateMeasures(valid.input);assert.deepEqual(m.monumetricShare,{lo:55,hi:55,exact:true});
  assert.equal(validateRecommendationInput({...raw,tier1Share:'65'}).errors.shareUS,'split_mismatch');
});
test('R9: niche alone produces a short useful list without revenue or traffic invention',()=>{
  const r=recommend({niche:'food'});
  assert.deepEqual(r.main.map(c=>[c.slug,c.debug.score,c.status]),[['google-adsense',85.87,'good_fit'],['newor-media',55.94,'worth_a_try'],['monumetric',47.29,'worth_a_try'],['journey-by-mediavine',45.60,'worth_a_try']]);
  assert.equal(r.suggestInput,'adRevenueMonth');assert.equal(r.main[1].reason.code,'fit_estimate');assert.equal(estimateMeasures(input({niche:'food'})).adRevenueMonth,undefined);
});
test('R11: real revenue opens premium routes at small traffic; pin and family removal both apply',()=>{
  const x={niche:'personal-finance',pageviews:8000,siteAge:'gt12m',tier1Share:70,current:'none',adRevenueMonth:6000};const r=recommend(x);
  assert.deepEqual(r.main.map(c=>[c.slug,c.debug.score,c.debug.rank]),[['mediavine',94.44,97.44],['publift',89.96,95.96],['clickio',86.89,92.89],['monetizemore-pubguru',80.96,86.96],['google-adsense',80.76,80.76]]);
  assert.deepEqual(r.more.setup.map(c=>[c.slug,c.debug.score]),[['adpushup',64.40],['adapex',61.77]]);assert.deepEqual(names(r.more.growth),['monumetric','raptive']);
  const adsense=recommend({...x,current:'google-adsense'});assert.deepEqual(names(adsense.main),['mediavine','publift','clickio','monetizemore-pubguru','adpushup']);assert.deepEqual(names(adsense.more.setup),['adapex','anymind-anymanager']);
  const journey=only('journey-by-mediavine',{...x,current:'google-adsense'});assert.equal(journey.debug.score,77.70);assert.equal(journey.debug.rank,80.70);
});

test('known traffic conversions retain measure identity and exactness',()=>{
  const sessions=estimateMeasures(input({niche:'food',visits:22000}));assert.deepEqual(sessions.pageviews,{lo:26400,hi:44000,exact:false});
  const pv=estimateMeasures(input({niche:'food',pageviews:40000}));assert.equal(pv.sessions.lo,20000);close(pv.sessions.hi,33333.333333333336);assert.equal(pv.visits.exact,false);
  const users=estimateMeasures(input({niche:'food',visits:50000,visitsUnit:'users'}));close(users.sessions.lo,55555.555555555555);close(users.sessions.hi,83333.33333333333);assert.deepEqual(users.visitors,{lo:50000,hi:50000,exact:false});assert.deepEqual(users.monthlyActiveUsers,users.visitors);
  const explicit=estimateMeasures(input({niche:'food',pageviews:1,visits:100}));assert.equal(explicit.pageviews.lo,1);assert.equal(explicit.sessions.lo,100);
});
test('strict Sovrn visits preserve the source comparator and basis',()=>{
  const x={niche:'food',siteAge:'gt12m',tier1Share:60};
  assert.equal(get('sovrn',{...x,visits:100000,visitsUnit:'visits'}).more.add.length,0);
  const exact=get('sovrn',{...x,visits:100001,visitsUnit:'visits'}).more.add[0];assert.equal(exact.debug.basis,'published_number');assert.equal(exact.reason.values.bar,100000);assert.equal(exact.detail.bars[0].comparator,'more_than');
  assert.equal(get('sovrn',{...x,visits:100001}).more.add[0].debug.basis,'estimate');
});
test('PubFuture 100k and Mediavine $420 boundaries use published growth bars',()=>{
  const x={niche:'gaming',pageviews:99999,siteAge:'gt12m',tier1Share:40,current:'none'};assert.equal(recommend(x).more.growth[0].slug,'pubfuture');const pub=recommend({...x,pageviews:100000}).main[2];assert.equal(pub.slug,'pubfuture');assert.equal(pub.debug.score,79);
  const food={niche:'food',pageviews:120000,siteAge:'gt12m',tier1Share:70,current:'none',adRevenueMonth:419};
  const growth=recommend(food).more.growth[0];assert.equal(growth.slug,'mediavine');assert.equal(growth.bar.amount,5000);assert.equal(growth.bar.period,'previous_calendar_year');
  const med=recommend({...food,adRevenueMonth:420}).main[3];assert.equal(med.slug,'mediavine');assert.equal(med.debug.score,89.59);assert.equal(med.reason.code,'revenue_signal');assert.deepEqual(med.reason.values,{});
});
test('Monumetric interval intersection sharpens geography without inventing country shares',()=>{
  const x={...base,tier1Share:50};let m=estimateMeasures(input(x));assert.deepEqual(m.monumetricShare,{lo:47,hi:50,exact:false});assert.equal(only('monumetric',x).debug.G,0.7);
  m=estimateMeasures(input({...x,shares:{US:40,GB:6,CA:3,AU:1}}));assert.deepEqual(m.monumetricShare,{lo:50,hi:50,exact:true});assert.equal(only('monumetric',{...x,shares:{US:40,GB:6,CA:3,AU:1}}).debug.G,1);
});
test('family, specialists, current aliases and contract restrictions',()=>{
  const x={...base,pageviews:2000000,adRevenueMonth:12000};
  for(const current of ['mediavine','pubnation'])assert.ok(!recommend({...x,current}).main.some(c=>['mediavine','journey-by-mediavine'].includes(c.slug)));
  assert.ok(!recommend({...x,current:'snigel'}).main.some(c=>c.slug==='publisher-collective'));
  assert.deepEqual(recommend({...x,current:'buysellads-carbon-ads'}).more.add,[]);
  for(const c of recommend({...x,current:'raptive'}).more.add){assert.equal(c.checkContract,true);assert.equal(c.reason.code,'check_contract');}
  const other=recommend({...x,niche:'other'});for(const c of [...other.main,...other.more.add,...other.more.setup]){assert.equal(c.detail.peers,null);assert.ok(!['nitropay','venatus','snack-media','buysellads-carbon-ads','ethicalads'].includes(c.slug));}
  assert.equal(recommend(scenarios[7].input).main[0].reason.code,'upgrade');
});
test('every calibration invariant holds across size, revenue, niche and current-network cases',()=>{
  for(const niche of [...adNetworkNiches.map(n=>n.slug),'other'])for(const pageviews of [0,3000,9999,40000,300000,3000000])for(const adRevenueMonth of [undefined,100,499,6000]){
    const x=input({niche,pageviews,adRevenueMonth,siteAge:'gt12m',tier1Share:60,current:'none'});const r=recommendAdNetworks(x,null);
    assert.ok(r.main.length<=5);assert.ok(r.more.add.length<=2&&r.more.setup.length<=2&&r.more.growth.length<=2);
    assert.ok(r.main.filter(c=>['mediavine','journey-by-mediavine'].includes(c.slug)).length<=1);
    for(const c of [...r.main,...r.more.add,...r.more.setup]){assert.ok(c.reason.code);assert.ok(c.applyUrl.startsWith('https://'));}
    if(adRevenueMonth===undefined)assert.ok(!r.main.some(c=>c.slug==='mediavine'));
    if(pageviews<10000&&(adRevenueMonth===undefined||adRevenueMonth<500))for(const c of r.main){const p=adNetworkProfiles.find(p=>p.slug===c.slug);assert.ok(p.tier<3);assert.notEqual(p.evidence,'low');}
    const pc=r.main.find(c=>c.slug==='publisher-collective');if(pc&&!['tech','gaming','crafts','education','sports','health-fitness'].includes(niche))assert.ok(pageviews>=3000000);
  }
  for(const current of adNetworkProfiles.map(p=>p.slug)){
    const r=recommend({...base,pageviews:3000000,adRevenueMonth:12000,current});const tier=adNetworkProfiles.find(p=>p.slug===current).tier;
    for(const c of r.main.filter(c=>c.lane==='main')){const p=adNetworkProfiles.find(p=>p.slug===c.slug);const pt=c.slug==='newor-media'?{Elevate:1,Catapult:2,Premier:3}[c.program]:p.tier;assert.ok(pt>=tier);assert.notEqual(c.slug,current);}
  }
});
test('peer weights require real counts and never change other-niche results',()=>{
  const x=input(scenarios[1].input);const no=recommendAdNetworks(x,null);
  assert.deepEqual(recommendAdNetworks(x,{monumetric:4}),no);
  const five=recommendAdNetworks(x,{monumetric:5}).main.find(c=>c.slug==='monumetric');assert.equal(five.debug.P,0.25);assert.equal(five.detail.peers,5);
  const twenty=recommendAdNetworks(x,{monumetric:20}).main.find(c=>c.slug==='monumetric');assert.equal(twenty.debug.P,1);
  assert.deepEqual(recommendAdNetworks({...x,niche:'other'},{monumetric:100}),recommendAdNetworks({...x,niche:'other'},null));
});
test('parsing, boundaries and share validation accept a correct example and reject invalid input',()=>{
  const raw={niche:'food',pageviews:'40, 000',visits:'22 000',visitsUnit:'sessions',siteAge:'gt12m',tier1Share:'65',current:'google-adsense',adRevenueMonth:'350'};
  assert.deepEqual(validateRecommendationInput(raw),{ok:true,input:input(scenarios[1].input)});
  for(const [key,value,code] of [['pageviews','-5','negative'],['pageviews','abc','not_a_number'],['pageviews','9.5','not_whole'],['pageviews','10000000001','too_large'],['tier1Share','101','over_100'],['tier1Share','50.11','too_many_decimals'],['adRevenueMonth','100000000.01','too_large'],['adRevenueMonth','4.001','too_many_decimals'],['siteAge','2y','invalid_choice'],['current','foo','invalid_choice'],['niche','','required'],['pageviews','','required'],['niche','foo','invalid_choice'],['visitsUnit','pv','invalid_choice']]){const result=validateRecommendationInput({...raw,[key]:value});assert.equal(result.ok,false);assert.equal(result.errors[key],code);}
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'40000',shareUS:'60',shareGB:'50'}).errors.shareUS,'shares_over_100');
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'40000',tier1Share:'40',shareUS:'45'}).errors.shareUS,'shares_over_tier1');
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'40000',visitsUnit:'bad'}).ok,true);
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'10000000000',adRevenueMonth:'100000000'}).ok,true);
  const partial=validateRecommendationInput({niche:'food',pageviews:'40000',tier1Share:'50',shareUS:'50.4'});assert.equal(partial.input.tier1Share,50.4);
});
test('share links round trip only the new contract and preserve invalid choices for validation',()=>{
  const raw={niche:'food',pageviews:'40000',visits:'22000',visitsUnit:'sessions',siteAge:'gt12m',tier1Share:'65',current:'google-adsense',adRevenueMonth:'350',shareUS:'0'};
  assert.deepEqual(parseRecommendationQuery(new URLSearchParams(recommendationShareParams(raw))),{shared:true,raw});
  assert.deepEqual(parseRecommendationQuery(new URLSearchParams('traffic=40000&rev_prev=5000&pv_min3=10000&domain_on=2000-01-01&site=example.com')),{shared:false,raw:{}});
  assert.equal(parseRecommendationQuery(new URLSearchParams('niche=')).shared,true);assert.ok(!('siteAge' in recommendationShareParams({siteAge:''})));
  const parsed=parseRecommendationQuery(new URLSearchParams('niche=food&pv=9.5&age=2y&current=foo'));assert.equal(validateRecommendationInput(parsed.raw).errors.siteAge,'invalid_choice');
  assert.deepEqual(recommend(scenarios[1].input),recommend(scenarios[1].input));
});

function pageModule(query,list){
  const exports={},imports={
    'server-only':{},'next/cache':{unstable_cache:(fn,keys,options)=>{assert.equal(options.revalidate,false);assert.ok(options.tags.includes('stack127-ad-networks'));return fn;}},
    '../ad-networks':{queryAdNetworkReport:query,listAdNetworks:list},'../ad-network-niches.ts':{adNetworkNiches},'../cache-tags':{AD_NETWORKS_TAG:'stack127-ad-networks'},'../../app/ui/ad-networks/network-logo-src':{networkLogo:()=>null},'./profiles.ts':{adNetworkProfiles},'./engine.ts':{recommendAdNetworks},
  };
  const code=ts.transpileModule(fs.readFileSync(new URL('../../../lib/ad-network-requirements/page-data.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,require(name){assert.ok(name in imports,name);return imports[name];}});return exports;
}
test('static page data uses one bounded confirmed-peer query and all 44 DB names, including legacy',async()=>{
  let queries=0;
  const mod=pageModule(async(sql,args)=>{queries++;assert.match(sql,/r.status='confirmed'/);assert.match(sql,/group by p.niche,n.slug/);assert.equal(args[0].length,20);assert.equal(args[1].length,44);return {rows:[{niche:'food',slug:'monumetric',count:20},{niche:'tech',slug:'ethicalads',count:4}]};},async()=>adNetworkProfiles.map(p=>({slug:p.slug,name:`DB ${p.slug}`})));
  const data=await mod.loadRequirementsPageData();assert.equal(queries,1);assert.equal(data.networks.length,44);assert.equal(data.networks.find(n=>n.slug==='pubnation').name,'DB pubnation');assert.equal(data.peers.food.monumetric,20);assert.equal(data.defaultResult.main.find(c=>c.slug==='monumetric').detail.peers,20);
});
test('static page data throws on missing DB brands or failed peer loading',async()=>{
  const missing=pageModule(async()=>({rows:[]}),async()=>[]);await assert.rejects(missing.loadRequirementsPageData(),/Missing ad network/);
  const failed=pageModule(async()=>{throw Error('database unavailable');},async()=>[]);await assert.rejects(failed.loadRequirementsPageData(),/database unavailable/);
});

test('numeric inputs accept pasted thousands separators without weakening bounds or precision',()=>{
  for(const value of ['1,100','1 100','1\u00a0100']) {
    const result=validateRecommendationInput({niche:'food',pageviews:'40000',adRevenueMonth:value});
    assert.equal(result.ok,true);assert.equal(result.input.adRevenueMonth,1100);
  }
  const decimal=validateRecommendationInput({niche:'food',pageviews:'40000',adRevenueMonth:'1,100.25',tier1Share:'6 5.0',shareUS:'3 0.0'});
  assert.equal(decimal.ok,true);assert.equal(decimal.input.adRevenueMonth,1100.25);assert.equal(decimal.input.tier1Share,65);assert.equal(decimal.input.shares.US,30);
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'40000',adRevenueMonth:'1,100.251'}).errors.adRevenueMonth,'too_many_decimals');
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'40000',adRevenueMonth:'100,000,001'}).errors.adRevenueMonth,'too_large');
  assert.equal(validateRecommendationInput({niche:'food',pageviews:'40000',shareUS:'1,000'}).errors.shareUS,'over_100');
});
test('every recommendation has readable, dated sources even when no published bar exists',()=>{
  for(const profile of adNetworkProfiles) {
    assert.ok(profile.sources.length>0,profile.slug);
    for(const source of profile.sources) {
      assert.ok(source.label.length>0&&source.label!==source.url,profile.slug);
      assert.ok(!/https?:\/\/|\d{9,}/.test(source.label),source.label);
      assert.match(source.url,/^https?:\/\//);assert.match(source.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
    }
    for(const bar of profile.bars)assert.ok(profile.sources.some(source=>source.url===bar.sourceUrl),`${profile.slug}: missing source for bar`);
  }
  for(const [slug,x] of [
    ['buysellads-carbon-ads',{niche:'tech',pageviews:60000,siteAge:'gt12m',tier1Share:55}],
    ['nitropay',{niche:'gaming',pageviews:300000,siteAge:'gt12m',tier1Share:60}],
    ['venatus',{niche:'gaming',pageviews:1000000,siteAge:'gt12m',tier1Share:60}],
  ]) {
    const card=only(slug,x);assert.ok(card,slug);assert.equal(card.detail.bars.length,0);
    assert.ok(card.detail.sources.length>0);
    assert.ok(card.detail.sources.every(source=>adNetworkProfiles.find(profile=>profile.slug===slug).joiningSourceUrls.includes(source.url)));
  }
});
test('conditional and program-level bars explain which threshold applies',()=>{
  const raptive=only('raptive',{...base,pageviews:120000});
  const shares=raptive.detail.bars.filter(bar=>bar.metric==='tier1_share');
  assert.match(shares.find(bar=>bar.amount===50).scope,/under 100,000 pageviews/);
  assert.match(shares.find(bar=>bar.amount===40).scope,/from 100,000 pageviews/);
  for(const profile of adNetworkProfiles) {
    const scopes=new Set();
    for(const bar of profile.bars) {
      const key=JSON.stringify([bar.metric,bar.period,bar.program,bar.kind,bar.scope]);
      assert.ok(!scopes.has(key),`${profile.slug}: ambiguous threshold scope`);scopes.add(key);
    }
  }
  const journey=only('journey-by-mediavine',{...base,pageviews:120000});
  assert.deepEqual(journey.detail.alsoNeeds.filter(key=>['domain_age_4_months','domain_history_4_months_guidance'].includes(key)),['domain_history_4_months_guidance']);
});
test('Setupad Self-Serve entry is 10 million visits; 50 million describes the Enterprise plan',()=>{
  const card=only('setupad',{niche:'food',visits:10000000,visitsUnit:'visits',siteAge:'gt12m',tier1Share:60});
  assert.equal(card.program,'Self-Serve');assert.equal(card.debug.basis,'published_number');assert.equal(card.reason.values.bar,10000000);
  assert.deepEqual(card.detail.bars.filter(bar=>bar.kind==='requirement').map(bar=>bar.amount),[10000000]);
  const enterprise=card.detail.bars.find(bar=>bar.amount===50000000);
  assert.equal(enterprise.kind,'guidance');assert.match(enterprise.scope,/Enterprise plan/);
});

test('public details cite official joining pages, never research anecdotes or payment and earnings pages',()=>{
  for(const profile of adNetworkProfiles) {
    assert.ok(profile.joiningSourceUrls.length>0,profile.slug);
    assert.ok(profile.joiningSourceUrls.every(url=>profile.sources.some(source=>source.url===url)),profile.slug);
    if(profile.lane==='legacy')continue; // Legacy brands never produce recommendations.
    const niche=profile.nicheGate?.[0]??profile.strong[0]??'food';
    const result=recommendAdNetworks(input({niche,pageviews:100000000,visits:90000000,visitsUnit:'visits',siteAge:'gt12m',tier1Share:90,shares:{US:80,GB:4,CA:3,AU:2,NZ:1},adRevenueMonth:1000000,current:'none'}),null,[profile]);
    const card=[...result.main,...result.more.add,...result.more.setup].find(card=>card.slug===profile.slug);
    assert.ok(card,profile.slug);assert.ok(card.detail.sources.length>0,profile.slug);
    for(const source of card.detail.sources) {
      assert.doesNotMatch(source.label,/anecdote|forum|report/i);
      assert.doesNotMatch(source.url,/reddit\.com|trustpilot\.com|medium\.com|g2\.com|redvolcano\.io|adxdesk\.com/);
      assert.ok(profile.joiningSourceUrls.includes(source.url));assert.match(source.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
    }
    for(const bar of card.detail.bars)assert.ok(card.detail.sources.some(source=>source.url===bar.sourceUrl));
  }
  const raptive=only('raptive',{...base,pageviews:120000});assert.equal(raptive.detail.sources.length,1);assert.match(raptive.detail.sources[0].url,/Who-is-eligible/);
  const journey=only('journey-by-mediavine',{...base,pageviews:120000});assert.equal(journey.detail.sources.length,3);
  const carbon=only('buysellads-carbon-ads',{niche:'tech',pageviews:60000,siteAge:'gt12m',tier1Share:55});assert.equal(carbon.detail.sources.length,3);
  assert.ok(adNetworkProfiles.find(profile=>profile.slug==='raptive').sources.some(source=>/anecdote/i.test(source.label)));
});

test('Monumetric Propel conditions stay explicitly scoped on the 120k-pageview recommendation',()=>{
  const result=recommend({niche:'food',pageviews:120000,visits:70000,siteAge:'gt12m',tier1Share:70,current:'google-adsense',adRevenueMonth:1100});
  const card=result.main.find(card=>card.slug==='monumetric');assert.ok(card);
  for(const key of ['six_ad_slots','setup_fee_99_usd','wordpress_or_blogger'])assert.ok(!card.detail.alsoNeeds.includes(key));
  for(const key of ['propel_six_ad_slots','propel_setup_fee_99_usd','propel_wordpress_or_blogger'])assert.ok(card.detail.alsoNeeds.includes(key));
  assert.ok(card.detail.alsoNeeds.includes('english'));assert.ok(card.detail.alsoNeeds.includes('three_month_history'));
  assert.ok(card.detail.sources.some(source=>source.url==='https://www.monumetric.com/frequently-asked-questions/'));
});
test('Newor and Setupad keep program-specific requirements on the right program',()=>{
  const x={niche:'food',siteAge:'gt12m',tier1Share:70};
  for(const [pageviews,shares,program] of [[40000,undefined,'Elevate'],[100000,{US:62},'Catapult'],[1000000,{US:60},'Premier']]) {
    const card=only('newor-media',{...x,pageviews,shares});assert.equal(card.program,program);
    assert.ok(card.detail.alsoNeeds.includes('own_gam'));assert.ok(card.detail.alsoNeeds.includes('exclusive'));
    assert.equal(card.detail.alsoNeeds.includes('english'),program==='Elevate');
  }
  for(const [visits,program] of [[1000000,'Managed'],[10000000,'Self-Serve']]) {
    const card=only('setupad',{...x,visits,visitsUnit:'visits'});assert.equal(card.program,program);
    assert.equal(card.detail.alsoNeeds.includes('own_gam'),program==='Self-Serve');
  }
});
test('Ezoic Incubator note appears only while the estimated users could be under the standard threshold',()=>{
  const x={niche:'tech',siteAge:'gt12m',tier1Share:70};
  const straddling=only('ezoic',{...x,pageviews:700000});assert.ok(straddling);assert.ok(straddling.detail.alsoNeeds.includes('incubator_limited'));
  const standard=only('ezoic',{...x,visits:250000,visitsUnit:'users'});assert.ok(standard);assert.ok(!standard.detail.alsoNeeds.includes('incubator_limited'));
  assert.deepEqual(only('ezoic',{...x,visits:100000,visitsUnit:'users'}),undefined);
});

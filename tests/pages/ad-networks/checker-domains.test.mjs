import assert from 'node:assert/strict';
import test from 'node:test';
import {adNetworksLibrary} from './loader-harness.mjs';
import {loadTypeScript} from '../../helpers/load-typescript.mjs';
import * as input from '../../../app/api/ad-networks/input.ts';

test('site API returns each relationship ad-system domains without substituting manager or unrelated domains',async()=>{
  const identities=[
    {slug:'mediavine',name:'Mediavine',manager_domains:['manager.example'],ad_system_domains:['mediavine.com','ads.mediavine.com']},
    {slug:'amazon-publisher-services',name:'Amazon APS',manager_domains:[],ad_system_domains:['aps.amazon.com']},
    {slug:'ended',name:'Ended network',manager_domains:[],ad_system_domains:['ended.example']},
    {slug:'unrelated',name:'Unrelated network',manager_domains:[],ad_system_domains:['unrelated.example']},
  ];
  const relationship=(slug,status)=>({...identities.find(n=>n.slug===slug),status,relationship_type:'active_network_use',
    first_confirmed_at:'2026-10-01T00:00:00Z',last_confirmed_at:'2026-10-15T00:00:00Z',ended_at:null});
  const relationships=[relationship('mediavine','confirmed'),relationship('amazon-publisher-services','confirmed'),relationship('ended','ended')]
    .map(({manager_domains,ad_system_domains,...row})=>row);
  const lib=adNetworksLibrary(async(sql)=>{
    if(sql.includes('select slug,name,manager_domains'))return {rows:identities};
    if(sql.includes('p.normalized_domain=$1'))return {rows:[{
      id:'1',domain:'example.com',publisher_name:null,niche:null,traffic_group:null,domain_created_on:null,platform:null,
      last_checked_at:'2026-10-15T00:00:00Z',favicon:null,evidence:{},manager_relationships:[],
      networks:relationships.filter(r=>r.status==='confirmed').map(({slug,name})=>({slug,name})),ads_txt_summary:null,
    }]};
    if(sql.includes('select n.slug,n.name,r.status'))return {rows:relationships};
    if(sql.includes('e.observed_at::text')||sql.includes('p.normalized_domain<>$2'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  });
  const {GET}=loadTypeScript(new URL('../../../app/api/ad-networks/site/route.ts',import.meta.url),{
    'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},
    '@/lib/ad-networks':{getAdNetworkCheckerSite:lib.loadAdNetworkCheckerSite},
    '@/lib/page-registry':{getPublishedPage:async()=>({})},'../input':input,
  });
  const response=await GET(new Request('https://stack127.com/api/ad-networks/site?domain=example.com'));
  assert.equal(response.status,200);
  const body=await response.json(),rows=body.site.relationships;
  assert.deepEqual(rows.find(r=>r.slug==='mediavine').ad_system_domains,['mediavine.com','ads.mediavine.com']);
  assert.deepEqual(rows.find(r=>r.slug==='amazon-publisher-services').ad_system_domains,['aps.amazon.com']);
  assert.deepEqual(rows.find(r=>r.slug==='ended').ad_system_domains,['ended.example']);
  const highlighted=rows.filter(r=>r.status==='confirmed').flatMap(r=>r.ad_system_domains);
  assert.deepEqual(highlighted,['mediavine.com','ads.mediavine.com','aps.amazon.com']);
  assert.equal(highlighted.includes('manager.example'),false);assert.equal(highlighted.includes('unrelated.example'),false);
  assert.equal(rows[0].first_confirmed_at,'2026-10-01T00:00:00.000Z');
});

test('a relationship with no ad-system domains returns an empty array',async()=>{
  const lib=adNetworksLibrary(async(sql)=>{
    if(sql.includes('select slug,name,manager_domains'))return {rows:[{slug:'network',name:'Network',manager_domains:[],ad_system_domains:[]}]};
    if(sql.includes('p.normalized_domain=$1'))return {rows:[{id:'1',domain:'example.com',publisher_name:null,niche:null,
      traffic_group:null,domain_created_on:null,platform:null,last_checked_at:null,favicon:null,evidence:{},manager_relationships:[],networks:[],ads_txt_summary:null}]};
    if(sql.includes('select n.slug,n.name,r.status'))return {rows:[{slug:'network',name:'Network',status:'ended',relationship_type:'active_network_use',
      first_confirmed_at:null,last_confirmed_at:null,ended_at:null}]};
    if(sql.includes('e.observed_at::text'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  });
  const result=await lib.loadAdNetworkCheckerSite('example.com');
  assert.deepEqual(Array.from(result.relationships[0].ad_system_domains),[]);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {deriveManagedBy} from '../../../lib/ad-network-site-facts.mjs';

const connectionString=process.env.DATABASE_POOLER_URL||process.env.DATABASE_URL;
test('compact database projections preserve manager resolution and ambiguity', {skip:!connectionString}, async()=>{
  const networks=[{slug:'a',name:'A',manager_domains:['a.example','a-alt.example']},
    {slug:'b',name:'B',manager_domains:['b.example']}];
  const manager=(slug,evidence,status='confirmed')=>({slug,status,relationship_type:'primary_or_exclusive_manager',evidence});
  const cases=[
    {evidence:{manager_domains:[' A.EXAMPLE. ']},relationships:[]},
    {evidence:{manager_domains:[{value:'a.example'},'a.example']},relationships:[]},
    {evidence:{manager_domains:['a.example','b.example']},relationships:[]},
    {evidence:{manager_domains:[12,{value:12}]},relationships:[manager('a',{manager_domain:'a.example'})]},
    {evidence:{},relationships:[manager('a',{matched_signal:'MANAGERDOMAIN = A.EXAMPLE.'})]},
    {evidence:{manager_domains:['x'.repeat(300)]},relationships:[]},
    {evidence:{manager_domains:['x'.repeat(300),'y'.repeat(300)]},relationships:[]},
    {evidence:{},relationships:[manager('a',{}),manager('b',{})]},
    {evidence:{},relationships:[manager('a',{manager_domain:'a.example'},'ended')]},
    {evidence:{},relationships:[manager('a',{manager_domain:'b.example'})]},
    {evidence:{},relationships:[manager('a',{manager_domain:12,matched_signal:'MANAGERDOMAIN=a.example'})]},
    {evidence:{},relationships:[manager('a',{manager_domain:'x'.repeat(300)})]},
  ].map((row,id)=>({...row,id}));
  const pool=new pg.Pool({connectionString,max:1,connectionTimeoutMillis:15000,query_timeout:15000});
  try {
    const rows=(await pool.query(`select x.id,public.stack127_ad_network_report_manager_domains(x.evidence) as domains,
      coalesce((select jsonb_agg(r || jsonb_build_object('evidence',jsonb_build_object('manager_domain',
        public.stack127_ad_network_report_retained_manager(r->'evidence')))) from jsonb_array_elements(x.relationships) r),'[]') as relationships
      from jsonb_to_recordset($1::jsonb) x(id int,evidence jsonb,relationships jsonb) order by x.id`,[JSON.stringify(cases)])).rows;
    const meaning=result=>({manager:result.managed_by?.slug??null,named:Boolean(result.managed_by||result.manager_domain)});
    for(const row of rows){
      const original=cases[row.id];
      assert.deepEqual(meaning(deriveManagedBy({manager_domains:row.domains},networks,row.relationships)),
        meaning(deriveManagedBy(original.evidence,networks,original.relationships)),`case ${row.id}`);
      assert.ok(Buffer.byteLength(JSON.stringify(row.domains))<1024);
    }
  } finally {await pool.end();}
});

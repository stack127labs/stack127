#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { enrichmentArgs } from './enrichment-store.mjs';
const args=enrichmentArgs(),db=new DatabaseSync(args['local-database'],{readOnly:true});
try{
  db.exec('begin');
  const columns=new Set(db.prepare('pragma table_info(publishers)').all().map(row=>row.name));
  const scope=`from publishers p where exists(select 1 from relationships r where r.publisher_id=p.id and r.status='confirmed')`;
  const total=db.prepare(`select count(*) n ${scope}`).get().n;
  const fields={};
  for(const field of ['ads_txt_summary','platform','favicon','domain_created_on','publisher_name','traffic_group','niche']){
    const filled=columns.has(field)?db.prepare(`select count(*) n ${scope} and p.${field} is not null`).get().n:0;
    fields[field]={filled,null:total-filled};
  }
  const hasState=db.prepare("select 1 from sqlite_schema where type='table' and name='enrichment_state'").get();
  const states=hasState?db.prepare("select kind,status,count(*) sites from enrichment_state group by kind,status order by kind,status").all():[];
  const homepage=hasState?db.prepare(`select count(json_extract(s.data,'$.title')) title,
    count(json_extract(s.data,'$.description')) description,count(json_extract(s.data,'$.h1')) h1,
    count(json_extract(s.data,'$.language')) language from publishers p
    left join enrichment_state s on s.publisher_id=p.id and s.kind='homepage' and s.status='measured'
    where exists(select 1 from relationships r where r.publisher_id=p.id and r.status='confirmed')`).get():{};
  const niche_inputs=Object.fromEntries(['title','description','h1','language'].map(field=>[field,{filled:homepage[field]??0,null:total-(homepage[field]??0)}]));
  const queue=db.prepare('select last_check_outcome outcome,count(*) sites from publishers group by last_check_outcome order by last_check_outcome').all();
  console.log(JSON.stringify({confirmed:total,fields,niche_inputs,states,queue},null,2));
}finally{db.exec('rollback');db.close();}

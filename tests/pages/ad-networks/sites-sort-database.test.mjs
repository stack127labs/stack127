import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {adNetworksLibrary} from './loader-harness.mjs';

// Read-only fixture query: no tables, temporary tables or public records are written.
const connectionString=process.env.DATABASE_URL;
test('traffic groups, oldest registrations, null dates and stable ties survive pagination', {skip:!connectionString}, async()=>{
  let tableSql;
  const library=adNetworksLibrary(async sql=>{
    if(sql.includes('as classified'))return {rows:[{listed:20,classified:0,traffic:20,age:20,platform:0,publisher:0,checked:0,niches:[],networks:[]}]};
    if(sql.includes('count(*)::int as total'))return {rows:[{total:20}]};
    if(sql.startsWith('with matches as materialized'))tableSql=sql;
    return {rows:[]};
  });
  await library.loadAdNetworkSites(library.defaultAdNetworkSitesQuery('mediavine'));
  const pagingOrder=tableSql.match(/select p.id from matches p order by (.*?) limit \$4 offset \$5/s)[1];
  const resultOrder=tableSql.slice(tableSql.lastIndexOf('order by '));
  const site=(id,normalized_domain,traffic_group,domain_created_on)=>({id,normalized_domain,traffic_group,domain_created_on});
  const rows=[
    site(9,'a.com','top-1m','1980-01-01'),site(10,'a.com','not-ranked','1970-01-01'),
    site(11,'a.com',null,'1960-01-01'),site(12,'b.com',null,null),
    site(8,'a.com','top-100k','1980-01-01'),site(7,'a.com','top-10k',null),
    site(6,'z.com','top-10k','2000-01-01'),site(5,'a.com','top-1k',null),
    site(4,'a.com','top-1k','2020-01-01'),site(3,'same.com','top-1k','1990-01-01'),
    site(2,'same.com','top-1k','1990-01-01'),site(1,'a.com','top-1k','1990-01-01'),
  ];
  const client=new pg.Client({connectionString,connectionTimeoutMillis:15000,
    options:'-c default_transaction_read_only=on -c statement_timeout=15000'});
  try {
    await client.connect();
    const sql=`with matches as materialized (
      select * from jsonb_to_recordset($1::jsonb) p(id int,normalized_domain text,traffic_group text,domain_created_on date)
    ), selected as materialized (
      select p.id from matches p order by ${pagingOrder} limit $2 offset $3
    ) select p.id from selected s join matches p on p.id=s.id ${resultOrder}`;
    const page=async(size,offset)=>(await client.query(sql,[JSON.stringify(rows),size,offset])).rows.map(row=>row.id);
    const expected=[1,2,3,4,5,6,7,8,9,10,11,12];
    assert.deepEqual(await page(100,0),expected);
    assert.deepEqual([...(await page(4,0)),...(await page(4,4)),...(await page(4,8))],expected);
    assert.deepEqual(await page(4,12),[]);
  } finally {await client.end();}
});

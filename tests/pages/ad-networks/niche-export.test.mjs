import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {openLocalDatabase} from '../../../scripts/ad-networks/local-db.mjs';
import {saveState} from '../../../scripts/ad-networks/enrichment-store.mjs';

test('incremental exports append complete batches without repeating or changing inputs already given to Haiku',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-niche-batches-')),path=join(directory,'data.sqlite'),output=join(directory,'input');
  const db=openLocalDatabase(path);
  try {
    for(let id=1;id<=5;id++){
      db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at)
        values(?,?,?,'2026-10-01','2026-10-01','2026-10-01','2026-10-01')`).run(id,`site${id}.com`,`site${id}.com`);
      db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,created_at,updated_at)
        select id,?,'confirmed','active_network_use','2026-10-01','2026-10-01' from ad_networks order by id limit 1`).run(id);
    }
    const homepage=id=>saveState(db,id,'homepage','measured',{title:`Title ${id}`,description:null,h1:null,language:'en'});
    const run=(extra=[])=>{
      const result=spawnSync(process.execPath,[fileURLToPath(new URL('../../../scripts/ad-networks/niche-export.mjs',import.meta.url)),
        '--local-database',path,'--incremental','--run-directory',output,'--batch-size','2','--progress-file',join(directory,'progress.json'),...extra],{encoding:'utf8'});
      assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
    };
    homepage(1);homepage(2);assert.equal(run().rows,2);
    const first=readFileSync(join(output,'batch-0001.jsonl'),'utf8');
    homepage(3);assert.equal(run().rows,0);
    homepage(4);saveState(db,1,'homepage','measured',{title:'Updated title'});assert.equal(run().rows,2);
    assert.equal(readFileSync(join(output,'batch-0001.jsonl'),'utf8'),first);
    assert.equal(run(['--include-unknown']).rows,1);assert.equal(run(['--include-unknown']).rows,0);
    const rows=readdirSync(output).filter(name=>name.endsWith('.jsonl')).flatMap(name=>readFileSync(join(output,name),'utf8').trim().split('\n').map(line=>JSON.parse(line)));
    assert.equal(rows.length,5);assert.equal(new Set(rows.map(row=>row.domain)).size,5);
    assert.equal(rows.find(row=>row.domain==='site5.com').title,null);
  }finally{db.close();rmSync(directory,{recursive:true,force:true});}
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('QA override CLI selects the named database, gates production, and retains correction guards', t => {
  const dir = mkdtempSync(join(tmpdir(), 'self-host-qa-gate-'));
  t.after(() => rmSync(dir, {recursive:true,force:true}));
  writeFileSync(join(dir,'.env.local'),'DATABASE_URL=postgres://development/db\n');
  writeFileSync(join(dir,'.env.database'),'DATABASE_URL=postgres://production/db\n');
  const report = join(dir,'calls.json');
  const hook = join(dir,'mock-db.mjs');
  writeFileSync(hook, `
    import { registerHooks } from 'node:module';
    registerHooks({load(url,context,nextLoad) {
      if (url.endsWith('/scripts/self-host-apps/lib/db.mjs')) return {
        format:'module',shortCircuit:true,source: \`
          import {writeFileSync} from 'node:fs';
          export async function withClient(work,databaseUrl) {
            const calls=[];
            try {
              return await work({query:async (sql,params)=>{
                calls.push(sql);
                if (sql.includes('select * from public.self_host_apps')) return {rowCount:1,rows:[{
                  id:'app-id',slug:'example',published:false,source_code_url:'https://example.org/old'
                }]};
                return {rowCount:1,rows:[]};
              }});
            } finally {writeFileSync(process.env.QA_TEST_REPORT,JSON.stringify({databaseUrl,calls}));}
          }
        \`
      };
      return nextLoad(url,context);
    }});
  `);
  const file = join(dir,'reviewed.json');
  const review = {slug:'example',review_scope:'partial',source_code_url:'https://example.org/new',
    expected:{source_code_url:'https://example.org/old'},data_source_urls:['https://example.org/docs']};
  const script = fileURLToPath(new URL('../../scripts/self-host-apps/apply-qa-overrides.mjs',import.meta.url));
  const run = (args, record = review) => {
    rmSync(report,{force:true});
    writeFileSync(file,JSON.stringify([record]));
    const result = spawnSync(process.execPath,['--import',hook,script,'--file',file,...args],{
      cwd:dir,encoding:'utf8',env:{...process.env,NODE_ENV:'production',DATABASE_URL:'postgres://unintended/db',QA_TEST_REPORT:report},
    });
    return {...result,report:existsSync(report)?JSON.parse(readFileSync(report,'utf8')):null};
  };
  for (const flags of [[],['--dry-run']]) {
    const result = run(flags);
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.report.databaseUrl,'postgres://development/db');
    assert.equal(result.report.calls.at(-1),flags.length?'rollback':'commit');
    assert.ok(result.report.calls.some(sql=>sql.includes('update public.self_host_apps')));
  }
  for (const flags of [[],['--dry-run']]) {
    const refused = run(['--environment','production',...flags]);
    assert.equal(refused.status,1);
    assert.match(refused.stderr,/Production requires --confirm stack127-production/);
    assert.equal(refused.report,null,'The production gate must run before connecting');
    const result = run(['--environment','production','--confirm','stack127-production',...flags]);
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.report.databaseUrl,'postgres://production/db');
    assert.equal(result.report.calls.at(-1),flags.length?'rollback':'commit');
  }
  for (const flags of [['--environment','development'],['--database-url','postgres://override/db'],['--dry-run=false']]) {
    const result = run(flags);
    if(flags[0]==='--environment') {
      assert.equal(result.status,0,result.stderr);
      assert.equal(result.report.databaseUrl,'postgres://development/db');
    } else {
      assert.equal(result.status,1);
      assert.equal(result.report,null);
    }
  }
  const stale = run(['--dry-run'],{...review,expected:{source_code_url:'https://example.org/stale'}});
  assert.equal(stale.status,1);
  assert.match(stale.stderr,/changed since review/);
  assert.equal(stale.report.calls.at(-1),'rollback');
  assert.ok(!stale.report.calls.some(sql=>sql.includes('update public.self_host_apps')));
  const invalid = run(['--dry-run'],{...review,published:true});
  assert.equal(invalid.status,1);
  assert.match(invalid.stderr,/correction cannot leave this app published/);
  assert.equal(invalid.report.calls.at(-1),'rollback');
});

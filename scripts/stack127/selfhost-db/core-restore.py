#!/usr/bin/env python3
"""Atomically replace only core data; retain schema, grants and frozen ad networks."""
import argparse,importlib.util,json,os,re,subprocess,time
from pathlib import Path
os.umask(0o077)
parser=argparse.ArgumentParser();parser.add_argument('--archive',type=Path,required=True);parser.add_argument('--manifest',type=Path,required=True);parser.add_argument('--retire-sql',type=Path,required=True);parser.add_argument('--container',default='stack127-db',choices=['stack127-db','stack127-db-rehearsal-scratch']);parser.add_argument('--confirm',required=True);parser.add_argument('--test-abort',action='store_true');args=parser.parse_args()
if args.test_abort and args.container!='stack127-db-rehearsal-scratch':raise SystemExit('Failure injection is scratch-only')
if args.confirm!='stack127-core-cutover':raise SystemExit('Explicit core cutover confirmation required')
module=importlib.util.spec_from_file_location('guard',Path(__file__).with_name('ad-network-guard.py'));guard=importlib.util.module_from_spec(module);module.loader.exec_module(guard)
operation_started=time.monotonic();D=guard.D;container=args.container;manifest=json.loads(args.manifest.read_text());guard.check(container,manifest)
if guard.sql(container,"select current_setting('cron.launch_active_jobs')='off' and not 'pg_net'=any(string_to_array(replace(current_setting('shared_preload_libraries'),' ',''),','));")!='t':raise SystemExit('Target cron/HTTP worker must remain off')
# The approved switch script retires wiring, not ordinary queue triggers.
subprocess.run(D+['exec','-i','--user','postgres',container,'psql','-X','-q','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','postgres'],input=args.retire_sql.read_bytes(),check=True,stdout=subprocess.DEVNULL)
q=lambda value:'"'+value.replace('"','""')+'"'
core=json.loads(guard.sql(container,"select json_agg(c.relname order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname not like 'ad_network%' and c.relname<>'stack127_ad_network_source_revision';"))
core_names={('public',name) for name in core}|{('supabase_migrations','schema_migrations')}
sequence_names=json.loads(guard.sql(container,"select json_agg(sequencename order by sequencename) from pg_sequences where schemaname='public' and sequencename not in ('ad_networks_id_seq','ad_network_publishers_id_seq');"))
previous_sequences={name:guard.sql(container,'select last_value,is_called from public.'+q(name)+';').split('|') for name in sequence_names}
foreign_keys=json.loads(guard.sql(container,"select coalesce(json_agg(v),'[]') from (select con.conname,cn.nspname as child_schema,c.relname as child,pn.nspname as parent_schema,p.relname as parent,con.confmatchtype, array(select a.attname from unnest(con.conkey) with ordinality k(num,pos) join pg_attribute a on a.attrelid=c.oid and a.attnum=k.num order by k.pos) as child_columns,array(select a.attname from unnest(con.confkey) with ordinality k(num,pos) join pg_attribute a on a.attrelid=p.oid and a.attnum=k.num order by k.pos) as parent_columns from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace cn on cn.oid=c.relnamespace join pg_class p on p.oid=con.confrelid join pg_namespace pn on pn.oid=p.relnamespace where con.contype='f' and cn.nspname='public')v;"))
for fk in foreign_keys:
 if ((fk['child_schema'],fk['child']) in core_names)!=((fk['parent_schema'],fk['parent']) in core_names):raise SystemExit('A foreign key crosses the core/frozen boundary; review scope')
# Read the archive through the container's matching PostgreSQL 17 tools.
suffix=str(os.getpid());remote='/tmp/stack127-core-'+suffix
subprocess.run(D+['cp',str(args.archive),container+':'+remote+'.dump'],check=True,stdout=subprocess.DEVNULL)
subprocess.run(D+['exec',container,'chown','postgres:postgres',remote+'.dump'],check=True)
try:
 toc=subprocess.check_output(D+['exec','--user','postgres',container,'pg_restore','--list',remote+'.dump']).decode();selected=[];archive_tables=set();archive_sequences=set()
 for line in toc.splitlines():
  m=re.match(r'\d+; \d+ \d+ (TABLE DATA|SEQUENCE SET) (\w+) (\w+) ',line)
  if not m:continue
  kind,schema,name=m.groups()
  if (kind=='TABLE DATA' and (schema,name) in core_names) or (kind=='SEQUENCE SET' and schema=='public' and name in sequence_names):
   selected.append(line)
   if kind=='TABLE DATA':archive_tables.add((schema,name))
   else:archive_sequences.add(name)
 if archive_tables!=core_names or archive_sequences!=set(sequence_names):raise RuntimeError('Archive core tables or sequences differ from the target')
 subprocess.run(D+['exec','-i',container,'tee',remote+'.list'],input=('\n'.join(selected)+'\n').encode(),stdout=subprocess.DEVNULL,check=True)
 subprocess.run(D+['exec',container,'chown','postgres:postgres',remote+'.list'],check=True)
 data=subprocess.check_output(D+['exec','--user','postgres',container,'pg_restore','--data-only','--disable-triggers','--use-list='+remote+'.list','--file=-',remote+'.dump'])
 counts={};current=None
 for line in data.splitlines():
  if current:
   if line==b'\\.':current=None
   else:counts[current]+=1
  elif line.startswith(b'COPY '):
   m=re.match(rb'COPY (\w+)\.(\w+) \(',line)
   if not m:raise RuntimeError('Unexpected COPY table')
   current=(m[1].decode(),m[2].decode());counts[current]=0
 if set(counts)!=core_names:raise RuntimeError('Incomplete core COPY payload')
 checks=[]
 for (schema,name),count in counts.items():checks.append('IF (SELECT count(*) FROM '+q(schema)+'.'+q(name)+') <> '+str(count)+" THEN RAISE EXCEPTION 'Core count mismatch'; END IF;")
 for fk in foreign_keys:
  if (fk['child_schema'],fk['child']) not in core_names:continue
  if fk['confmatchtype']!='s':raise RuntimeError('Review non-simple foreign key')
  present=' AND '.join('c.'+q(c)+' IS NOT NULL' for c in fk['child_columns']);equal=' AND '.join('p.'+q(p)+'=c.'+q(c) for c,p in zip(fk['child_columns'],fk['parent_columns']))
  checks.append('IF EXISTS(SELECT FROM '+q(fk['child_schema'])+'.'+q(fk['child'])+' c WHERE '+present+' AND NOT EXISTS(SELECT FROM '+q(fk['parent_schema'])+'.'+q(fk['parent'])+' p WHERE '+equal+")) THEN RAISE EXCEPTION 'Core foreign key mismatch'; END IF;")
 before=b"BEGIN; SET LOCAL lock_timeout='10s'; SET LOCAL statement_timeout='5min';\nTRUNCATE "+','.join(q(s)+'.'+q(t) for s,t in sorted(core_names)).encode()+b';\n'
 after=("\nUPDATE public.stack127_cache_worker_wake SET function_url=NULL;\nDO $verify$ BEGIN "+' '.join(checks)+" END $verify$;\n"+("DO $abort$ BEGIN RAISE EXCEPTION 'Scratch-only rollback test'; END $abort$;\n" if args.test_abort else '')+"COMMIT;\n").encode()
 start=time.monotonic()
 p=subprocess.run(D+['exec','-i','--user','postgres',container,'psql','-X','-q','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','postgres'],input=before+data+after,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 transaction_seconds=round(time.monotonic()-start,3);log=args.archive.with_suffix('.core-restore.log');log.write_bytes(p.stdout+p.stderr)
 if p.returncode:
  # setval is not transactional. Data/trigger changes roll back when psql exits,
  # and the frozen-window sequence states must be restored explicitly as well.
  for name,(value,called) in previous_sequences.items():
   guard.sql(container,"select pg_catalog.setval('public."+name+"',"+value+','+('true' if called=='t' else 'false')+');')
  raise RuntimeError('Core transaction rolled back and original sequence states restored; inspect private restore log')
 guard.check(container,manifest)
 result={'core_tables':len(core_names),'public_tables':len(core),'migration_rows':counts[('supabase_migrations','schema_migrations')],'transaction_seconds':transaction_seconds,'total_seconds':round(time.monotonic()-operation_started,3),'frozen_refill_unchanged':True,'core_foreign_keys_checked':sum((f['child_schema'],f['child']) in core_names for f in foreign_keys)}
 args.archive.with_suffix('.core-restore-metrics.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
finally:
 subprocess.run(D+['exec',container,'rm','-f',remote+'.dump',remote+'.list'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

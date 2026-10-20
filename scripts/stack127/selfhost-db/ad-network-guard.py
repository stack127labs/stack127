#!/usr/bin/env python3
"""Detect changes to the frozen refill without logging any row values."""
import argparse,hashlib,json,os,re,subprocess
from pathlib import Path
os.umask(0o077)
FROZEN=('ad_networks','ad_network_publishers','ad_network_publisher_relationships','ad_network_relationship_events','ad_network_check_observations','ad_network_daily_counts','stack127_ad_network_source_revision')
SEQUENCES=('ad_networks_id_seq','ad_network_publishers_id_seq')
D=['sudo','-n','docker']
def digest(rows):return hashlib.sha256(b''.join(sorted(rows))).hexdigest()
def sql(container,text):
 return subprocess.check_output(D+['exec','-i','--user','postgres',container,'psql','-X','-q','-At','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','postgres'],input=text.encode(),stderr=subprocess.PIPE).decode().strip()
def backup_manifest(container,archive):
 args=D+['exec','-i','--user','postgres',container,'pg_restore','--data-only','--schema=public','--file=-']
 for name in FROZEN:args+=['--table='+name]
 args+=['--table='+name for name in SEQUENCES]
 result={'tables':{},'sequences':{}};current=None;rows=[]
 with archive.open('rb') as source:
  p=subprocess.Popen(args,stdin=source,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  for line in p.stdout:
   if current:
    if line.rstrip(b'\r\n')==b'\\.':
     result['tables'][current]['hash']=digest(rows);current=None
    else:rows.append(hashlib.sha256(line).digest());result['tables'][current]['rows']+=1
   elif line.startswith(b'COPY public.'):
    m=re.match(rb'COPY public\.([a-z0-9_]+) \((.+)\) FROM stdin;',line)
    if not m:raise RuntimeError('Unexpected frozen COPY header')
    current=m[1].decode();rows=[];result['tables'][current]={'columns':[x.strip(' "') for x in m[2].decode().split(',')],'rows':0}
   elif line.startswith(b'SELECT pg_catalog.setval('):
    m=re.match(rb"SELECT pg_catalog.setval\('public\.([a-z0-9_]+)', ([0-9]+), (true|false)\);",line)
    if m and m[1].decode() in SEQUENCES:result['sequences'][m[1].decode()]=m[2].decode()+'|'+('t' if m[3]==b'true' else 'f')
  error=p.stderr.read();code=p.wait()
  if code:raise RuntimeError('Cannot read reference archive')
 if set(result['tables'])!=set(FROZEN) or set(result['sequences'])!=set(SEQUENCES):raise RuntimeError('Incomplete frozen baseline')
 return result
def check(container,manifest):
 if set(manifest.get('tables',{}))!=set(FROZEN) or set(manifest.get('sequences',{}))!=set(SEQUENCES):raise RuntimeError('Incomplete frozen baseline')
 for name,expected in manifest['tables'].items():
  if name not in FROZEN:raise RuntimeError('Unexpected table in frozen baseline')
  columns=','.join('"'+c.replace('"','""')+'"' for c in expected['columns'])
  query="SET extra_float_digits=3; SET DateStyle='ISO, MDY'; SET timezone='UTC'; COPY (SELECT "+columns+' FROM public."'+name+'") TO STDOUT;'
  p=subprocess.Popen(D+['exec','-i','--user','postgres',container,'psql','-X','-q','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','postgres'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  p.stdin.write(query.encode());p.stdin.close();rows=[hashlib.sha256(line).digest() for line in p.stdout];error=p.stderr.read()
  if p.wait() or len(rows)!=expected['rows'] or digest(rows)!=expected['hash']:raise RuntimeError('Frozen ad-network data changed: '+name)
 for name,expected in manifest['sequences'].items():
  if name not in SEQUENCES or sql(container,'select last_value,is_called from public."'+name+'";')!=expected:raise RuntimeError('Frozen ad-network sequence changed')
 return {name:v['rows'] for name,v in manifest['tables'].items()}
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--container',default='stack127-db',choices=['stack127-db','stack127-db-rehearsal-scratch']);parser.add_argument('--manifest',type=Path,required=True);parser.add_argument('--record-from-backup',type=Path);args=parser.parse_args()
 if args.record_from_backup:
  if args.manifest.exists():raise SystemExit('Refusing to replace a frozen baseline')
  value=backup_manifest(args.container,args.record_from_backup);check(args.container,value);args.manifest.write_text(json.dumps(value,indent=2))
 else:value=json.loads(args.manifest.read_text());check(args.container,value)
 print(json.dumps({'frozen_refill_unchanged':True,'tables':len(FROZEN),'sequences':len(SEQUENCES),'rows':{k:v['rows'] for k,v in value['tables'].items()}}))

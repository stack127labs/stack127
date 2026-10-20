#!/usr/bin/env python3
"""Cheap source drift gate; never reads the four large ad-network tables."""
import argparse,hashlib,json,os,subprocess
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--directory',type=Path,required=True);parser.add_argument('--inventory',type=Path,required=True);parser.add_argument('--metadata',type=Path);parser.add_argument('--queries',type=Path);args=parser.parse_args()
expected=json.loads(args.inventory.read_text())['tables']['public.stack127_ad_network_source_revision']
columns=','.join('"'+c.replace('"','""')+'"' for c in expected['columns'])
query="SET search_path=pg_catalog; SET extra_float_digits=3; SET DateStyle='ISO, MDY'; SET timezone='UTC'; COPY (SELECT "+columns+" FROM public.stack127_ad_network_source_revision) TO STDOUT;"
command=['docker','run','--rm','--interactive','--network=host','--user',str(os.getuid())+':'+str(os.getgid()),'--mount','type=bind,src='+str(args.directory.resolve())+',dst=/run/db','-e','PGSERVICEFILE=/run/db/pg_service.conf','postgres:17','psql','-X','-qAt','-v','ON_ERROR_STOP=1','--dbname=service=stack127_source']
def sql(text):
 p=subprocess.run(command,input=text.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if p.returncode:raise SystemExit('Source preflight failed; inspect privately, without retrying a dump')
 return p.stdout
rows=sql(query).splitlines(keepends=True)
actual=hashlib.sha256(b''.join(sorted(hashlib.sha256(row).digest() for row in rows))).hexdigest()
if len(rows)!=expected['rows'] or actual!=expected['multiset_sha256']:raise SystemExit('Source ad-network token changed: reconcile before retaining the refill')
if sql('select (select count(*) from pg_largeobject_metadata)=0 and (select count(*) from supabase_migrations.schema_migrations)=219;').strip()!=b't':raise SystemExit('Large objects or migration history changed: review core-copy scope')
if bool(args.metadata)!=bool(args.queries):raise SystemExit('Supply both metadata and query files')
if args.metadata:
 expected_metadata=json.loads(args.metadata.read_text());queries=json.loads(args.queries.read_text())
 names=('tables','roles','memberships','extensions','migrations','constraints','indexes','functions','triggers','policies','schemas','sequences')
 parts=["'"+name+"',(SELECT coalesce(json_agg(v),'[]'::json) FROM ("+queries[name]+")v)" for name in names]
 actual_metadata=json.loads(sql('SET search_path=pg_catalog; SELECT json_build_object('+','.join(parts)+');'))
 for name in names:
  if actual_metadata[name]!=expected_metadata[name]:raise SystemExit('Source metadata changed: '+name+'; review core-copy compatibility')
 print('Source schema, roles, grants, policies and migration contents match the rehearsal.')
print('Source ad-network token unchanged; migrations=219; large objects=0.')

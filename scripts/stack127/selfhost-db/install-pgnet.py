#!/usr/bin/env python3
"""Install pg_net on the empty isolated target, then disable its worker."""
from pathlib import Path
import subprocess,time,json,os
os.umask(0o077)
config=Path('/srv/stack127-db/postgresql.conf');D=['sudo','-n','docker']
def sql(q):
 return subprocess.check_output(D+['exec','-i','--user','postgres','stack127-db','psql','-X','-q','-At','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d','postgres'],input=q.encode(),stderr=subprocess.PIPE).decode().strip()
def restart():
 subprocess.run(D+['restart','stack127-db'],check=True,stdout=subprocess.DEVNULL)
 for i in range(60):
  if subprocess.check_output(D+['inspect','stack127-db','--format','{{.State.Health.Status}}']).decode().strip()=='healthy':return
  time.sleep(1)
 raise RuntimeError('Target did not become healthy')
if sql("select count(*) from pg_tables where schemaname='public';")!='0':raise SystemExit('Target is not empty')
if sql('show cron.launch_active_jobs;')!='off':raise SystemExit('Target cron is not disabled')
libs=sql('show shared_preload_libraries;')
installed=sql("select extversion from pg_extension where extname='pg_net';")
if installed:
 if installed!='0.20.4' or 'pg_net' in [x.strip() for x in libs.split(',')]:
  raise SystemExit('Review the installed pg_net version and remove its preload before restoring data')
 print(json.dumps({'pg_net_installed':installed,'preload_removed':True}));raise SystemExit(0)
block="\n# BEGIN temporary empty-target pg_net installation\nshared_preload_libraries = '"+libs+",pg_net'\n# END temporary empty-target pg_net installation\n"
if 'BEGIN temporary empty-target' in config.read_text():raise SystemExit('Temporary override already present')
started=time.monotonic();config.write_text(config.read_text()+block)
try:
 restart()
 sql("CREATE EXTENSION pg_net WITH SCHEMA extensions VERSION '0.20.4';")
 print(json.dumps({'pg_net_installed':'0.20.4','queue_rows':sql('select count(*) from net.http_request_queue;')}),flush=True)
finally:
 text=config.read_text()
 if block not in text:raise RuntimeError('Temporary preload block changed; inspect target configuration')
 config.write_text(text.replace(block,''));restart()
print(json.dumps({'pg_net_install_seconds':round(time.monotonic()-started,3),'preload_removed':'pg_net' not in sql('show shared_preload_libraries;')}),flush=True)

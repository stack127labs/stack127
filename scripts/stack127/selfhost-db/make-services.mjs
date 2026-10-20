#!/usr/bin/env node
// Prepare private libpq files. This never opens a database or changes live env.
import {mkdir,writeFile,chmod} from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {pathToFileURL} from 'node:url';
import {rootCertificates} from 'node:tls';
const {targetDatabaseUrl}=await import(pathToFileURL(process.cwd()+'/scripts/ad-networks/runtime-db.mjs'));
const {values}=parseArgs({options:{directory:{type:'string'}}});if(!values.directory)throw new Error('--directory required');
process.loadEnvFile('.env.selfhost-db');
await mkdir(values.directory,{recursive:true,mode:0o700});await chmod(values.directory,0o700);
const urls={stack127_source:targetDatabaseUrl({environment:'production'}),stack127_source_switch:targetDatabaseUrl({environment:'production'}),stack127_target:process.env.SELFHOST_DATABASE_URL_REMOTE,stack127_migration:process.env.DATABASE_MIGRATION_URL};
const remoteHost=new URL(process.env.SELFHOST_DATABASE_URL_REMOTE).hostname;
if(remoteHost!=='database.stack127.com')throw new Error('Unexpected staged target host');
let services='',passwords='';
for(const[name,raw]of Object.entries(urls)){
 const u=new URL(raw);
 if(name.startsWith('stack127_source')&&!u.hostname.endsWith('.supabase.com')&&!u.hostname.endsWith('.supabase.co'))throw new Error('Source must still be managed Supabase');
 if(!name.startsWith('stack127_source')){
  if(u.hostname!==remoteHost||u.port!=='5432'||u.pathname!=='/postgres'||decodeURIComponent(u.username)!==(name==='stack127_target'?'stack127_app':'postgres'))throw new Error('Unexpected staged target identity');
  if(u.searchParams.get('sslmode')!=='verify-full')throw new Error('The target requires verified PostgreSQL TLS');
 }
 const fields={host:u.hostname,port:u.port||'5432',dbname:decodeURIComponent(u.pathname.slice(1)),user:decodeURIComponent(u.username),passfile:'/run/db/.pgpass',sslmode:name.startsWith('stack127_source')?'require':u.searchParams.get('sslmode')||'require',connect_timeout:'15'};
 // The postgres:17 image has no CA bundle, so verify the target against Node's list.
 if(!name.startsWith('stack127_source'))fields.sslrootcert='/run/db/ca.pem';
 if(name==='stack127_source_switch')fields.options='-c default_transaction_read_only=off -c statement_timeout=300000 -c lock_timeout=10000';
 if(name==='stack127_source')fields.options='-c default_transaction_read_only=on -c statement_timeout=300000 -c lock_timeout=10000';
 for(const value of Object.values(fields))if(/[\r\n]/.test(value))throw new Error('Invalid service value');
 services+='['+name+']\n'+Object.entries(fields).map(([k,v])=>k+'='+v).join('\n')+'\n';
 passwords+=[fields.host,fields.port,fields.dbname,fields.user,decodeURIComponent(u.password)].map(x=>x.replaceAll('\\','\\\\').replaceAll(':','\\:')).join(':')+'\n';
}
await writeFile(values.directory+'/ca.pem',rootCertificates.join('\n')+'\n',{mode:0o644});
await writeFile(values.directory+'/pg_service.conf',services,{mode:0o600});await writeFile(values.directory+'/.pgpass',passwords,{mode:0o600});
await chmod(values.directory+'/pg_service.conf',0o600);await chmod(values.directory+'/.pgpass',0o600);
console.log('Private source/app/migration services prepared; no database connection opened.');

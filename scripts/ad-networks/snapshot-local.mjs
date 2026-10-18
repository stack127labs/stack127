#!/usr/bin/env node
import { DatabaseSync,backup } from 'node:sqlite';
import { mkdir,rename,rm } from 'node:fs/promises';
import { dirname,resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { defaultLocalDatabasePath } from './local-db.mjs';

export async function snapshotLocal(sourcePath,output) {
  const destination=resolve(output),temporary=`${destination}.${process.pid}.tmp`;
  if(resolve(sourcePath)===destination)throw new Error('Snapshot destination must differ from the working database');
  await mkdir(dirname(destination),{recursive:true});
  const source=new DatabaseSync(resolve(sourcePath),{readOnly:true,timeout:10000});
  try {
    // Pin the WAL read view. Without this, an online backup can restart forever
    // while the verifier continuously changes pages between backup steps.
    source.exec('begin');source.prepare('select name from sqlite_schema limit 1').get();
    await backup(source,temporary);source.exec('rollback');
  } catch(error) {await rm(temporary,{force:true});throw error;}
  finally{source.close();}
  const check=new DatabaseSync(temporary,{readOnly:true});
  try{if(check.prepare('pragma quick_check').get().quick_check!=='ok')throw new Error('Snapshot quick_check failed');}
  finally{check.close();}
  await rename(temporary,destination);return destination;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const {values}=parseArgs({options:{'local-database':{type:'string',default:defaultLocalDatabasePath},output:{type:'string'}}});
  if(!values.output)throw new Error('Supply --output for the consistent SQLite snapshot');
  console.log(JSON.stringify({snapshot:await snapshotLocal(values['local-database'],values.output)}));
}

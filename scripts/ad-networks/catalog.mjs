#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { parseArgs } from 'node:util';
import { defaultLocalDatabasePath,openLocalDatabase,loadLocalNetworks } from './local-db.mjs';
import { assertLocalCatalog } from './identity-catalog.mjs';
const {values}=parseArgs({options:{apply:{type:'boolean',default:false},'local-database':{type:'string',default:defaultLocalDatabasePath}}});
const db=values.apply?openLocalDatabase(values['local-database']):new DatabaseSync(values['local-database'],{readOnly:true});
try {
  assertLocalCatalog(db);
  const rows=loadLocalNetworks(db),violations=db.prepare('pragma foreign_key_check').all();
  if(violations.length)throw new Error(`Foreign-key violations: ${violations.length}`);
  console.log(JSON.stringify({applied:values.apply,networks:rows.length,catalog:db.prepare("select value from schema_meta where key='identity_catalog_version'").get().value,
    retired_snigel:rows.some(row=>row.slug==='snigel'),signatures:Object.fromEntries(rows.filter(row=>row.program_signatures.length).map(row=>[row.slug,row.program_signatures.length]))}));
}finally{db.close();}

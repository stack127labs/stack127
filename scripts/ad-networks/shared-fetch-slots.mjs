import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
const databases=new Map();
function databaseFor(path) {
  path=resolve(path);
  if(!databases.has(path)) {
    mkdirSync(dirname(path),{recursive:true,mode:0o700});
    const db=new DatabaseSync(path,{timeout:10000});
    db.exec(`pragma journal_mode=WAL; pragma synchronous=NORMAL; pragma busy_timeout=10000;
      create table if not exists host_slots(host text primary key,token text,lease_until integer not null,next_at integer not null);`);
    databases.set(path,db);
  }
  return databases.get(path);
}
// Separate processes share the same one-request limit and post-response pause.
// Leases outlive both bounded DNS and HTTP/body timeouts, recovering after a crash.
export async function sharedHostSlot(host,{databasePath=process.env.AD_NETWORK_FETCH_THROTTLE_DB,pauseMs=1000,leaseMs=90000}={}) {
  if(!databasePath)return ()=>{};
  const db=databaseFor(databasePath),token=`${process.pid}:${randomUUID()}`;
  const acquire=db.prepare(`insert into host_slots(host,token,lease_until,next_at) values(?,?,?,0)
    on conflict(host) do update set token=excluded.token,lease_until=excluded.lease_until
    where host_slots.lease_until<=? and host_slots.next_at<=? returning host`);
  while(true) {
    const now=Date.now();
    if(acquire.get(host,token,now+leaseMs,now,now))break;
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  let released=false;
  return ()=>{
    if(released)return;released=true;
    db.prepare('update host_slots set token=null,lease_until=0,next_at=? where host=? and token=?').run(Date.now()+pauseMs,host,token);
  };
}
export function closeSharedFetchSlots(){for(const db of databases.values())db.close();databases.clear();}

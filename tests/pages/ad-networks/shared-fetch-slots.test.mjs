import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {sharedHostSlot,closeSharedFetchSlots} from '../../../scripts/ad-networks/shared-fetch-slots.mjs';

test('different processes share the host limit and post-body pause while other hosts remain free',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-fetch-slots-')),databasePath=join(directory,'slots.sqlite');
  const release=await sharedHostSlot('shared.example',{databasePath,pauseMs:40});
  const moduleUrl=new URL('../../../scripts/ad-networks/shared-fetch-slots.mjs',import.meta.url).href;
  const child=spawn(process.execPath,['--input-type=module','-e',`import {sharedHostSlot} from ${JSON.stringify(moduleUrl)};
    console.log('ready');const release=await sharedHostSlot('shared.example',{databasePath:${JSON.stringify(databasePath)},pauseMs:40});
    console.log(Date.now());release();`],{stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',chunk=>{output+=chunk;});
  const finished=new Promise((yes,no)=>{child.on('error',no);child.on('exit',code=>code===0?yes():no(new Error(`child ${code}`)));});
  try {
    while(!output.includes('ready'))await new Promise(resolve=>setTimeout(resolve,5));
    const other=await sharedHostSlot('independent.example',{databasePath,pauseMs:0});other();
    await new Promise(resolve=>setTimeout(resolve,25));assert.equal(output.trim(),'ready');
    const releasedAt=Date.now();release();await finished;
    assert.ok(Number(output.trim().split('\n')[1])>=releasedAt+40);
  }finally{release();child.kill();closeSharedFetchSlots();rmSync(directory,{recursive:true,force:true});}
});

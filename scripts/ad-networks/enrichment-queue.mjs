// Admission is separate from transport throttling. A shared redirect destination
// gets at most two workers; the fetch policy still permits only one live request.
export function createEnrichmentQueue(rows,{concurrency,groupKey,perGroup=2,shouldStop=()=>false}) {
  const groups=new Map();
  for(const row of rows) {
    const key=groupKey(row);
    if(!groups.has(key))groups.set(key,{key,rows:[],cursor:0,processed:0,active:0,milliseconds:0});
    groups.get(key).rows.push(row);
  }
  // Keep the largest shared destinations moving from the start, while the other
  // workers visit independent hosts. Tokens are returned only after work finishes.
  const ready=[...groups.values()].sort((a,b)=>a.rows.length-b.rows.length)
    .flatMap(group=>Array.from({length:Math.min(perGroup,group.rows.length)},()=>group));
  let failed=false,active=0;
  return {
    snapshot() {
      const pending=[...groups.values()].filter(group=>group.processed<group.rows.length);
      const busiest=pending.sort((a,b)=>(b.rows.length-b.processed)-(a.rows.length-a.processed)).slice(0,10);
      const buckets=busiest.map(group=>({host:group.key,total:group.rows.length,processed:group.processed,
        remaining:group.rows.length-group.processed,active:group.active,
        etaSeconds:group.processed ? Math.ceil((group.rows.length-group.processed)*group.milliseconds/group.processed/Math.min(perGroup,concurrency,group.rows.length)/1000):null}));
      const completed=[...groups.values()].reduce((n,group)=>n+group.processed,0);
      const workerMilliseconds=[...groups.values()].reduce((n,group)=>n+group.milliseconds,0);
      return {activeWorkers:active,pendingHosts:pending.length,hostBuckets:buckets,workerSeconds:Math.round(workerMilliseconds/1000),
        meanWorkSeconds:completed?workerMilliseconds/completed/1000:null,
        hostEtaSeconds:Math.max(0,...buckets.map(group=>group.etaSeconds??0))};
    },
    async run(work) {
      const results=await Promise.allSettled(Array.from({length:Math.min(concurrency,rows.length)},async()=>{
        while(!failed&&!shouldStop()&&ready.length) {
          const group=ready.pop();
          if(group.cursor>=group.rows.length)continue;
          const row=group.rows[group.cursor++],started=performance.now();
          group.active++;active++;
          try {await work(row);group.processed++;}
          catch(error){failed=true;throw error;}
          finally {group.active--;active--;group.milliseconds+=performance.now()-started;}
          if(group.cursor<group.rows.length)ready.push(group);
        }
      }));
      const rejected=results.find(result=>result.status==='rejected');
      if(rejected)throw rejected.reason;
    },
  };
}

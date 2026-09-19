import {simulateResticRetention as run, DEFAULT_RESTIC_INPUT as defaults} from '../../../lib/restic-retention-simulator/engine.ts';
const policy={keepLast:0,keepDaily:2,keepWeekly:0,keepMonthly:0,keepYearly:0};
const cases=[
 ['oldest fallback',{snapshots:[{id:'new',time:'2026-01-01T12:00:00Z',host:'nas'},{id:'old',time:'2026-01-01T08:00:00Z',host:'nas'}],policy}],
 ['native hostname',{snapshots:[{id:'a',time:'2026-01-01T12:00:00Z',hostname:'a'},{id:'b',time:'2026-01-01T08:00:00Z',hostname:'b'}],policy:{...policy,keepDaily:0,keepLast:1}}],
 ['host wrong type',{snapshots:[{id:'x',time:'2026-01-01T12:00:00Z',host:42}]}],
 ['trim collision',{snapshots:[{id:'x',time:'2026-01-02T12:00:00Z'},{id:' x ',time:'2026-01-01T12:00:00Z'}],policy:{...policy,keepDaily:0,keepLast:1}}],
 ['group key collision',{groupBy:'paths',snapshots:[{id:'a',time:'2026-01-02T12:00:00Z',paths:['/a, /b']},{id:'b',time:'2026-01-01T12:00:00Z',paths:['/a','/b']}],policy:{...policy,keepDaily:0,keepLast:1}}]
];
for(const [name,input] of cases){try{console.log(JSON.stringify({name,input,result:run({...defaults,...input})}));}catch(e){console.log(JSON.stringify({name,input,thrown:e.message}));}}

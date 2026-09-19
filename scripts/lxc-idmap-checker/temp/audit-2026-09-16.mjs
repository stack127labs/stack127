import {checkLxcIdmap as run,DEFAULT_LXC_INPUT as defaults} from '../../../lib/lxc-idmap-checker/engine.ts';
const cases=[
 ['host overlap',{uidMap:'u 0 100000 10\nu 10 100005 10',queryId:'12'}],
 ['one id grant',{uidGrants:'root:101000:1'}],
 ['unrelated owner',{uidGrants:'other-user:100000:65536'}],
 ['reserved id',{uidMap:'u 0 4294967295 1',queryId:'0'}],
 ['overflow range',{uidMap:'u 0 18446744073709551615 2',queryId:'1'}]
];
for(const [name,input] of cases)console.log(JSON.stringify({name,input,result:run({...defaults,...input})}));

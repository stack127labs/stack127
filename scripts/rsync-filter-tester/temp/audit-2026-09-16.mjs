import {testRsyncFilters as run} from '../../../lib/rsync-filter-tester/engine.ts';
const cases=[
 ['parent first match','+ cache/\n- cache/','cache/\ncache/keep.txt'],
 ['directory only file','- cache/','cache'],
 ['directory basename','- cache','cache/\ncache/keep.txt'],
 ['normal include traversal','+ */\n+ *.txt\n- *','src/\nsrc/readme.txt'],
 ['directory only include children','+ cache/\n- *','cache/\ncache/secret.txt'],
 ['negated character class','- [!a].txt','b.txt\na.txt'],
 ['invalid modifier','-p *.log','error.log'],
 ['invalid regex class','- [z-a]','a'],
 ['default excluded parent','+ src/readme.txt','src/\nsrc/readme.txt','exclude']
];
for(const [name,rules,paths,unmatched='include'] of cases){const input={rules,paths,unmatched};console.log(JSON.stringify({name,input,result:run(input)}));}

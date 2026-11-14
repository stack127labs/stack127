import {readFileSync, writeFileSync} from 'node:fs';

// Keep SVG geometry exact while reducing repeated absolute coordinates.
function compactPath(path) {
  const tokens=path.match(/[a-z]|-?(?:\d*\.)?\d+/gi);
  const arity={M:2,L:2,H:1,V:1,Q:4,C:6,Z:0};
  let i=0,x=0,y=0,sx=0,sy=0,command='',previous='',out='',controlX=0,controlY=0,lastCommand='';
  const numbers=values=>values.join(' ').replace(/ -/g,'-');
  while(i<tokens.length) {
    if(/^[A-Z]$/.test(tokens[i]))command=tokens[i++];
    const count=arity[command];
    if(count===undefined)throw Error('Unsupported SVG command: '+command);
    if(command==='Z'){out+='z';previous='z';x=sx;y=sy;command='';continue;}
    const values=tokens.slice(i,i+count).map(Number);i+=count;
    const relative=values.map((v,j)=>v-(command==='H'?x:command==='V'?y:j%2===0?x:y));
    const absoluteText=(previous===command&&command!=='M'?'':command)+numbers(values);
    const lower=command.toLowerCase();
    const relativeText=(previous===lower&&command!=='M'?'':lower)+numbers(relative);
    const candidates=[{text:absoluteText,cmd:command},{text:relativeText,cmd:lower}];
    const add=(cmd,values)=>candidates.push({text:(previous===cmd?'':cmd)+numbers(values),cmd});
    if(command==='L') {
      if(values[0]===x){add('V',[values[1]]);add('v',[values[1]-y]);}
      if(values[1]===y){add('H',[values[0]]);add('h',[values[0]-x]);}
    }
    if(command==='C') {
      const dx=values[4]-x,dy=values[5]-y,length=dx*dx+dy*dy;
      const straight=[0,2].every(j=> (values[j]-x)*dy===(values[j+1]-y)*dx
        && (values[j]-x)*dx+(values[j+1]-y)*dy>=0
        && (values[j]-x)*dx+(values[j+1]-y)*dy<=length);
      if(straight){add('L',values.slice(4));add('l',relative.slice(4));}
    }
    if(command==='C'&&lastCommand==='C'&&values[0]===2*x-controlX&&values[1]===2*y-controlY) {
      add('S',values.slice(2));add('s',relative.slice(2));
    }
    if(command==='Q'&&lastCommand==='Q'&&values[0]===2*x-controlX&&values[1]===2*y-controlY) {
      add('T',values.slice(2));add('t',relative.slice(2));
    }
    const best=candidates.sort((a,b)=>a.text.length-b.text.length)[0];
    const part=best.text;
    if(command==='C'||command==='Q'){controlX=values.at(-4);controlY=values.at(-3);}
    lastCommand=best.cmd.toUpperCase()==='S'?'C':best.cmd.toUpperCase()==='T'?'Q':best.cmd.toUpperCase();
    if(out&&/^\d/.test(part)&&/[\d.]$/.test(out))out+=' ';
    out+=part;previous=best.cmd;
    if(command==='H')x=values[0];else if(command==='V')y=values[0];
    else {x=values.at(-2);y=values.at(-1);}
    if(command==='M'){sx=x;sy=y;command='L';}
  }
  return out;
}
const read=path=>readFileSync(path,'utf8');
const compact=svg=>svg.replace(/\bd="([^"]+)"/g,(_,d)=>`d="${compactPath(d)}"`).replace(/\n/g,'');
const logos={};
for(const theme of ['dark','light']) {
  const wordmark=read(`public/logos/stack127-wordmark-on-${theme}.svg`);
  const path=[...wordmark.matchAll(/<path\b[^>]*\/>/g)].at(-1)[0];
  const circle=wordmark.match(/<circle\b[^>]*\/>/)[0];
  // The 127 path spans x=7598..11538, y=72..2146. Include a small clear margin.
  const mark=`<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="127." viewBox="7580 54 3976 2110">${path}${circle}</svg>`;
  writeFileSync(`public/logos/stack127-mark-on-${theme}.svg`,compact(mark)+'\n');
  logos[theme]={wordmark_svg:compact(wordmark),wordmark_url:`https://stack127.com/logos/stack127-wordmark-on-${theme}.svg`,mark_svg:compact(mark),mark_url:`https://stack127.com/logos/stack127-mark-on-${theme}.svg`,mark_png_url:`https://stack127.com/logos/stack127-mark-on-${theme}.png`};
}
const globals=read('app/globals.css'),viz=read('app/ui/ad-networks/viz/viz.module.css');
const declarations=block=>Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
const light=declarations(globals.split('[data-theme="dark"]')[0]);
const dark={...light,...declarations(globals.split('[data-theme="dark"]')[1].split('}')[0])};
const vizLight=declarations(viz.split(':global')[0]),vizDark=declarations(viz.split(':global')[1].split('}')[0]);
const colors={};
for(const [theme,tokens,steps] of [['dark',dark,vizDark],['light',light,vizLight]]) {
  const resolve=value=>value.replace(/var\((--[\w-]+)\)/g,(_,key)=>tokens[key]);
  colors[theme]={...Object.fromEntries(Object.entries({background:'bg',surface:'surface',text:'text',muted_text:'text-muted',border:'border',accent:'accent',accent_text:'accent-text'}).map(([key,value])=>[key,tokens['--color-'+value]])),accent_steps:['ac','ac2','ac3'].map(key=>resolve(steps['--viz-'+key])),neutral_steps:['n1','n2','n3'].map(key=>steps['--viz-'+key]),categorical:Object.fromEntries(Object.entries(tokens).filter(([key])=>key.startsWith('--color-data-')).map(([key,value])=>[key.replace('--color-data-',''),value]))};
}
const fonts=Object.fromEntries([['titles','display','Space Grotesk'],['body','sans','Inter'],['numbers','mono','IBM Plex Mono']].map(([key,token,name])=>[key,{name,css:light['--font-'+token].replace(/var\([^)]+\)/,`"${name}"`).replace(/\s+/g,' ')}]));
writeFileSync('lib/data-api/brand-assets.generated.ts','// Generated by node scripts/stack127/brand/build-api-kit.mjs. SVGs are bundled with the server.\nexport const brandAssets = '+JSON.stringify({colors,fonts,logo:logos},null,2)+' as const;\n');
console.log('Embedded brand assets:',Buffer.byteLength(JSON.stringify({colors,fonts,logo:logos})),'bytes');

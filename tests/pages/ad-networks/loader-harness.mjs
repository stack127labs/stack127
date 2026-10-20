import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as niches from '../../../lib/ad-network-niches.ts';
import * as report from '../../../lib/ad-networks-report.ts';
import * as facts from '../../../lib/ad-network-site-facts.mjs';
import * as networkFacts from '../../../app/(site)/(directories)/ad-networks/network-facts.ts';
import * as tldts from 'tldts';

/** Exercise real SQL loaders with an injected database and an isolated Next cache. */
export function adNetworksLibrary(query, overrides={}, globals={}) {
  const exports={};
  const imports={
    './db':{getPool:()=>({query})},
    'next/cache':{unstable_cache:fn=>fn},
    './ad-network-niches':niches,'./ad-networks-report':report,'./ad-network-site-facts.mjs':facts,
    '../app/(site)/(directories)/ad-networks/network-facts':networkFacts,
    './cache-tags':{AD_NETWORKS_TAG:'stack127-ad-networks'},'tldts':tldts,...overrides,
  };
  const code=ts.transpileModule(fs.readFileSync(new URL('../../../lib/ad-networks.ts',import.meta.url),'utf8'),{
    compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
  }).outputText;
  vm.runInNewContext(code,{exports,Buffer,URL,URLSearchParams,process,require(name){
    if(Object.hasOwn(imports,name))return imports[name];throw Error(`Unexpected import: ${name}`);
  },...globals});
  return exports;
}

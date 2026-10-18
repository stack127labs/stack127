import { networkIdentities,IDENTITY_CATALOG_VERSION } from './network-identities.mjs';

function canonical(value) {
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
}
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
export function catalogProblems(rows,version=null) {
  const problems=[];
  if(version!==null&&version!==IDENTITY_CATALOG_VERSION)problems.push(`version ${version} differs from ${IDENTITY_CATALOG_VERSION}`);
  const expected=new Set(networkIdentities.map(row=>row.slug));
  if(rows.length!==expected.size)problems.push(`expected ${expected.size} identities, found ${rows.length}`);
  for(const row of rows)if(!expected.has(row.slug))problems.push(`unexpected identity ${row.slug}`);
  for(const identity of networkIdentities) {
    const row=rows.find(row=>row.slug===identity.slug);
    if(!row){problems.push(`missing ${identity.slug}`);continue;}
    for(const [field,value] of [['manager_domains',identity.managerDomains],['ad_system_domains',identity.adSystemDomains]]) {
      if(!same([...(row[field]??[])].sort(),[...value].sort()))problems.push(`${identity.slug}.${field} differs`);
    }
    if(!same(row.program_signatures,identity.programSignatures))problems.push(`${identity.slug}.program_signatures differs`);
  }
  return problems;
}
export function localCatalogProblems(database) {
  const version=database.prepare("select value from schema_meta where key='identity_catalog_version'").get()?.value??'missing';
  const rows=database.prepare('select slug,manager_domains,ad_system_domains,program_signatures from ad_networks').all()
    .map(row=>({...row,...Object.fromEntries(['manager_domains','ad_system_domains','program_signatures'].map(key=>[key,JSON.parse(row[key])]))}));
  return catalogProblems(rows,version);
}
export function assertLocalCatalog(database) {
  const problems=localCatalogProblems(database);
  if(problems.length)throw new Error(`SQLite identity catalog is not current: ${problems.join('; ')}. Re-seed using the released code before exporting or syncing.`);
}
export function assertTargetCatalog(rows) {
  const problems=catalogProblems(rows);
  if(problems.length)throw new Error(`Target identity catalog is not current: ${problems.join('; ')}. Apply the reviewed identity migration before syncing.`);
}
export function newerCatalog(previous,current=IDENTITY_CATALOG_VERSION) {
  const a=/^(\d{4}-\d{2}-\d{2})\.(\d+)$/.exec(previous??''),b=/^(\d{4}-\d{2}-\d{2})\.(\d+)$/.exec(current);
  return Boolean(a&&b&&(a[1]>b[1]||(a[1]===b[1]&&BigInt(a[2])>BigInt(b[2]))));
}

import { parse } from 'pgsql-ast-parser';
import { ApiError } from '../config.ts';
export const sqlSchema = `Only these read-only views exist in stack127_data:
ad_networks(id,slug,name,official_url,summary);
ad_network_publishers(id,normalized_domain,niche,platform,domain_created_on,traffic_group,last_successful_check_at,ads_txt_summary);
ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type,first_confirmed_at,last_confirmed_at,ended_at);
ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type);
ad_network_daily_counts(ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count,captured_at).
Use schema-qualified view names. No CTEs, comments, locks, arrays, collection aggregates, system catalogs, arbitrary functions or casts. SELECT/subqueries/joins/aggregates are supported. Safe functions: count,sum,avg,min,max,round,coalesce,nullif,lower,upper,abs,date_trunc,extract. Hard row cap and timeout apply.`;
const tables = new Set(['ad_networks','ad_network_publishers','ad_network_publisher_relationships','ad_network_relationship_events','ad_network_daily_counts']);
const funcs = new Set(['count','sum','avg','min','max','round','coalesce','nullif','lower','upper','abs','date_trunc','extract']);
const types = new Set(['select','table','ref','call','integer','numeric','string','boolean','null','binary','unary','cast','case','extract','list','statement','INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','CROSS JOIN']);
export function validateReadonlySql(sql: string) {
  const reject = () => { throw new ApiError(400,'invalid_sql','Use a single SELECT over the documented stack127_data views and safe functions.'); };
  if (/--|\/\*|;|\$|\\/.test(sql)) reject();
  let statements;
  try { statements = parse(sql); } catch { return reject(); }
  if (statements.length !== 1 || statements[0].type !== 'select') reject();
  function walk(value: unknown) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(walk); return; }
    const node = value as Record<string, any>;
    if ('type' in node && !types.has(node.type)) reject();
    if (node.type === 'select' && (node.with || node.into || node.for || node.skip)) reject();
    if (node.type === 'table' && (node.name?.schema !== 'stack127_data' || !tables.has(node.name?.name))) reject();
    if (node.type === 'call' && (node.function?.schema || !funcs.has(node.function?.name?.toLowerCase()))) reject();
    if (node.type === 'cast' && (node.to?.schema || !['text','int','integer','bigint','numeric','float','date','timestamp','boolean'].includes(node.to?.name))) reject();
    // Qualified operators and alternate namespace escapes are not part of this SQL subset.
    if (node.op && !['=','!=','<>','<','>','<=','>=','+','-','*','/','%','AND','OR','IN','NOT IN','LIKE','ILIKE','NOT LIKE','NOT ILIKE','IS','IS NOT','NOT','IS NULL','IS NOT NULL'].includes(node.op)) reject();
    Object.values(node).forEach(walk);
  }
  walk(statements[0]);
  return sql;
}

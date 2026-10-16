import type {
  AdNetworkCount, AdNetworkDailyCount, AdNetworkMovement, AdNetworkSitesAvailability,
  AdNetworkRef, AdNetworkSwitch, AdNetworkSwitchFlow, AdNetworkSwitchFlowSide, AdNetworkMovementPeriod, AdNetworkHistoryObservation, AdNetworkCheckerEvent,
} from "./ad-networks-types.ts";
import { adNetworkNiches } from "./ad-network-niches.ts";

export const AD_NETWORK_SITES_PAGE_SIZE = 10;
export const AD_NETWORK_NICHE_MIN_SITES = 100;
export const AD_NETWORK_NICHE_MIN_SHARE = 0.8;

/** A broad niche comparison needs both a useful sample and broad coverage. */
export function hasAdNetworkNicheCoverage(listed: number, classified: number) {
  // data-gate: the niche classification run fills at least 100 sites and 80% of the scope.
  return listed > 0 && classified >= AD_NETWORK_NICHE_MIN_SITES && classified / listed >= AD_NETWORK_NICHE_MIN_SHARE;
}

export type AdNetworkSiteCoverage = {
  listed: number; classified: number; traffic: number; age: number; platform: number;
  publisher: number; checked: number; manager: number;
  niches: string[]; networks: { slug: string; name: string }[];
};

export function adNetworkSiteAvailability(coverage: AdNetworkSiteCoverage): AdNetworkSitesAvailability {
  const availableColumns: AdNetworkSitesAvailability["availableColumns"] = ["domain"];
  const availableSorts: AdNetworkSitesAvailability["availableSorts"] = ["domain"];
  const availableFilters: AdNetworkSitesAvailability["availableFilters"] = [];
  const nicheReady = hasAdNetworkNicheCoverage(coverage.listed, coverage.classified);
  // data-gate: niche run; traffic run; RDAP run; platform run; publisher-name run; verifier.
  if (nicheReady) { availableColumns.push("niche"); availableFilters.push("niche"); }
  if (coverage.traffic > 0) { availableColumns.push("traffic"); availableSorts.push("traffic"); }
  if (coverage.age > 0) { availableColumns.push("domain_age"); availableSorts.push("oldest", "newest"); }
  if (coverage.platform > 0) availableColumns.push("platform");
  if (coverage.publisher > 0) availableColumns.push("publisher");
  if (coverage.checked > 0) { availableColumns.push("checked"); availableSorts.push("checked"); }
  if (coverage.manager > 0) availableColumns.push("manager");
  if (coverage.networks.length) { availableColumns.push("network"); availableFilters.push("network"); }
  return { availableColumns, availableSorts, availableFilters,
    filters: { niches: nicheReady ? adNetworkNiches.filter(n => coverage.niches.includes(n.slug)) : [], networks: coverage.networks } };
}

/** Only actual month-end observations; no interpolation or partial current month. */
export function adNetworkMonthEnds(rows: AdNetworkDailyCount[]): AdNetworkDailyCount[] {
  const points = rows.filter(row => {
    const date = new Date(`${row.date}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && new Date(date.getTime() + 86400000).getUTCDate() === 1;
  }).sort((a,b) => a.date.localeCompare(b.date));
  // data-gate: daily snapshot run or reviewed archive backfill supplies two month ends.
  return points.length >= 2 ? points : [];
}

export function adNetworkYearChange(rows: AdNetworkDailyCount[], current: number, now = new Date()): number | null {
  const cutoff = new Date(now); cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  if (cutoff.getUTCMonth() !== now.getUTCMonth()) cutoff.setUTCDate(0);
  const day = cutoff.toISOString().slice(0,10);
  const earlier = rows.find(row => row.date === day);
  // data-gate: a snapshot on the year-ago date (Feb 28 for a leap-day anniversary), never a longer span.
  return earlier ? current - earlier.listed : null;
}

export function adNetworkMovementTotals(rows: AdNetworkMovement[]) {
  return rows.reduce((total,row) => ({joined:total.joined+row.joined,left:total.left+row.left,
    newly_found:total.newly_found+(row.newly_found??0),baseline:total.baseline+(row.baseline??0)}),
  {joined:0,left:0,newly_found:0,baseline:0});
}

/** Do not expose an all-unknown manager chart as measured manager data. */
export function adNetworkManagerBreakdown(rows: AdNetworkCount[]) {
  // data-gate: verifier MANAGERDOMAIN or retained confirmed manager evidence.
  return rows.some(row => row.key !== "not-listed" && row.count > 0) ? rows : [];
}

const trafficKeys = ["top-1k", "top-10k", "top-100k", "top-1m", "not-ranked"];
export function trafficOrder(key: string) {
  const index = trafficKeys.indexOf(key.toLowerCase().replace(/\s+/g, "-"));
  return index === -1 ? trafficKeys.length : index;
}
export function trafficLabel(key: string) {
  return key.toLowerCase().replace(/-/g, " ").replace(/(\d)m\b/, "$1M");
}
const ageKeys = ["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16+ years"];
export function domainAgeOrder(key: string) {
  const index = ageKeys.indexOf(key); return index === -1 ? ageKeys.length : index;
}
export function lastDays(dates: readonly string[], count: number) {
  const latest = dates.reduce((max,date) => date > max ? date : max, "");
  if (!latest) return [];
  const end = Date.parse(`${latest}T00:00:00Z`);
  return Array.from({length:count},(_,i) => new Date(end-(count-1-i)*86400000).toISOString().slice(0,10));
}
const dayLabel = new Intl.DateTimeFormat("en-US", {day:"numeric",month:"short",timeZone:"UTC"});
export const shortDay = (day: string) => dayLabel.format(Date.parse(`${day}T00:00:00Z`));

/** Only consumes already-gated unambiguous manager replacements, never overlaps. */
export function adNetworkSwitchFlow(center: AdNetworkRef,
  switches: AdNetworkSwitch[]): AdNetworkSwitchFlow | null {
  const incoming=new Map<string,AdNetworkSwitchFlowSide>();
  const outgoing=new Map<string,AdNetworkSwitchFlowSide>();
  const add=(map: typeof incoming,network: AdNetworkRef,count: number)=>{
    const previous=map.get(network.slug);
    map.set(network.slug,{...network,label:network.name,count:(previous?.count??0)+count});
  };
  for(const row of switches) {
    if(row.count<=0 || row.from.slug===row.to.slug)continue;
    if(row.to.slug===center.slug)add(incoming,row.from,row.count);
    if(row.from.slug===center.slug)add(outgoing,row.to,row.count);
  }
  const order=(map: typeof incoming)=>[...map.values()].sort((a,b)=>b.count-a.count||a.slug.localeCompare(b.slug));
  const came_from=order(incoming),went_to=order(outgoing);
  // data-gate: real unambiguous manager replacements populate either side; empty flows hide.
  if(!came_from.length&&!went_to.length)return null;
  return {center,came_from,went_to,incoming_total:came_from.reduce((sum,row)=>sum+row.count,0),
    outgoing_total:went_to.reduce((sum,row)=>sum+row.count,0)};
}

/** Exactly `days` UTC calendar dates including the observation day. Until is exclusive. */
export function adNetworkUtcWindow(days: number,now=new Date()) {
  const today=Date.parse(`${now.toISOString().slice(0,10)}T00:00:00Z`);
  const day=(offset:number)=>new Date(today+offset*86400000).toISOString().slice(0,10);
  return {start:day(1-days),end:day(0),until:day(1),baseline:day(-days)};
}

/** Preserve sparse observed dates. Missing checks are never invented as zero days. */
export function adNetworkMovementPeriods(rows: AdNetworkMovement[],now=new Date()): AdNetworkMovementPeriod[] {
  const periods: AdNetworkMovementPeriod[]=[];
  for(const days of [30,90] as const) {
    const window=adNetworkUtcWindow(days,now);
    const interval=days===30 ? "day" : "week";
    const groups=new Map<string,{date:string;label:string;joined:number;left:number}>();
    for(const row of rows) {
      const time=Date.parse(`${row.date}T00:00:00Z`);
      if(row.date<window.start||row.date>=window.until||!Number.isFinite(time)||!(row.joined||row.left))continue;
      const date=new Date(time);
      if(interval==='week')date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
      const key=date.toISOString().slice(0,10);
      const point=groups.get(key)??{date:key,label:interval==='week' ? `Week of ${shortDay(key)}` : shortDay(key),joined:0,left:0};
      point.joined+=row.joined;point.left+=row.left;groups.set(key,point);
    }
    // data-gate: real joined/left observations in the selected window, excluding baseline/new-site imports.
    if(!groups.size)continue;
    const points=[...groups.values()].sort((a,b)=>a.date.localeCompare(b.date));
    const joined=points.reduce((sum,row)=>sum+row.joined,0),left=points.reduce((sum,row)=>sum+row.left,0);
    periods.push({key:String(days),label:`${days} days`,days,interval,points,
      startLabel:points[0].label,endLabel:points.at(-1)!.label,joined,left,net:joined-left});
  }
  return periods;
}

/** Known platform values and an explicit unknown slice share the same site denominator. */
export function adNetworkPlatformMix(platforms: AdNetworkCount[],listed: number): AdNetworkCount[] {
  // data-gate: the platform run supplies a measured platform before Unknown can be drawn.
  if(!platforms.length || !listed)return [];
  const measured=platforms.reduce((sum,row)=>sum+row.count,0);
  const rows=platforms.map(row=>({...row,share:row.count/listed*100}));
  return measured<listed ? [...rows,{key:"unknown",label:"Unknown",count:listed-measured,share:(listed-measured)/listed*100}] : rows;
}

/** Keep microsecond precision at the seven-day boundary, matching PostgreSQL. */
function observationMicros(value: string): bigint | null {
  const milliseconds=Date.parse(value);
  if(!Number.isFinite(milliseconds))return null;
  const fraction=/\.(\d+)(?=Z|[+-]\d\d(?::?\d\d)?$)/i.exec(value)?.[1]??"";
  return BigInt(milliseconds)*1000n+BigInt(fraction.padEnd(6,"0").slice(3,6)||"0");
}

/** Age at the stored check, so identical database reads produce identical API bodies. */
export function adNetworkObservedDomainAge(created: string | null,checked: string | null): number | null {
  // data-gate: RDAP registration and a stored verifier check date are both required.
  if(!created||!checked)return null;
  const start=Date.parse(created),end=Date.parse(checked);
  return Number.isFinite(start)&&Number.isFinite(end)&&end>=start ? (end-start)/31557600000 : null;
}

/** Same reciprocal uniqueness rule as the switches SQL, across the complete site history.
 * Baselines establish our earliest observation; they never prove that a network was added.
 */
export function adNetworkCheckerEvents(history: AdNetworkHistoryObservation[],lastChecked: string | null): AdNetworkCheckerEvent[] {
  const unique=new Map<string,{row:AdNetworkHistoryObservation;time:bigint;key:string}>();
  for(const row of history) {
    const time=observationMicros(row.date);
    if(time===null)continue;
    const key=`${row.network.slug}:${row.event}:${time}`;
    unique.set(key,{row,time,key});
  }
  const source=[...unique.values()];
  const managers=source.filter(({row})=>row.relationship_type==='primary_or_exclusive_manager');
  const departures=managers.filter(({row})=>row.event==='left');
  const arrivals=managers.filter(({row})=>row.event==='joined');
  const within=(a:typeof source[number],b:typeof source[number])=>
    a.row.network.slug!==b.row.network.slug && (a.time>b.time ? a.time-b.time : b.time-a.time)<=604800000000n;
  const used=new Set<string>();
  const events:AdNetworkCheckerEvent[]=[];
  // data-gate: only explicit manager departures and joins with one candidate on each side are switches.
  for(const departure of departures) {
    const candidates=arrivals.filter(arrival=>within(departure,arrival));
    if(candidates.length!==1)continue;
    const arrival=candidates[0];
    if(departures.filter(other=>within(other,arrival)).length!==1)continue;
    used.add(departure.key);used.add(arrival.key);
    events.push({date:new Date(arrival.row.date).toISOString(),kind:'switched',network:arrival.row.network,from_network:departure.row.network});
  }
  for(const {row,key} of source) {
    if(used.has(key)||row.event==='baseline')continue;
    events.push({date:new Date(row.date).toISOString(),kind:row.event==='left' ? 'dropped' : 'added',network:row.network});
  }
  const checkTime=lastChecked ? observationMicros(lastChecked) : null;
  const first=source.reduce<bigint|null>((earliest,item)=>earliest===null||item.time<earliest ? item.time : earliest,checkTime);
  let firstCheck:AdNetworkCheckerEvent|undefined;
  if(first!==null) {
    const networks=[...new Map(source.filter(item=>item.time===first&&item.row.event!=='left')
      .map(item=>[item.row.network.slug,item.row.network])).values()].sort((a,b)=>a.slug.localeCompare(b.slug));
    firstCheck={date:new Date(Number(first/1000n)).toISOString(),kind:'first_check',network:networks.length===1 ? networks[0] : null,networks};
  }
  const order=(a:AdNetworkCheckerEvent,b:AdNetworkCheckerEvent)=>b.date.localeCompare(a.date)
    ||a.kind.localeCompare(b.kind)||(a.network?.slug??'').localeCompare(b.network?.slug??'');
  // Bound public output only after detection, so truncating a candidate never creates a false switch.
  return [...events.sort(order).slice(0,199),...(firstCheck ? [firstCheck] : [])].sort(order);
}

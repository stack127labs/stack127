import { matchNetworks,scriptMarkup } from './matcher.mjs';

export const REVIEW_METHOD='discovery_hint_and_ads_txt_system';
export function reviewLinks(db,id) {
  return db.prepare('select * from relationships where publisher_id=? and status=\'needs_review\' and verification_method=?')
    .all(id,REVIEW_METHOD).map(row=>({...row,evidence:JSON.parse(row.evidence)}));
}
const normalized=value=>String(value).trim().toLowerCase();
export function gateReviewMatches({matches,relationships=[],networks,parsed,fetchResult,homepage,checkedAt,discoverySources}) {
  const confirmed=[],review=matches.review.map(match=>{
    const existing=relationships.find(row=>row.ad_network_id===match.networkId&&row.verification_method===REVIEW_METHOD);
    // A new seller lead must not replace the exact signal awaiting review.
    return existing?{...match,verificationMethod:REVIEW_METHOD,evidence:{...existing.evidence}}:match;
  });
  for(const match of matches.confirmed) {
    const relationship=relationships.find(row=>row.ad_network_id===match.networkId&&row.verification_method===REVIEW_METHOD);
    // The normal MANAGERDOMAIN verifier is the separate manager-evidence path.
    if(!relationship||match.verificationMethod==='ads_txt_managerdomain'){confirmed.push(match);continue;}
    const result=reviewDecision({relationship,network:networks.find(row=>row.id===match.networkId),parsed,
      fetchResult,homepage,checkedAt,discoverySources});
    if(result.decision==='confirmed')confirmed.push({...match,relationshipType:'active_network_use',evidence:result.evidence});
    else if(!review.some(row=>row.networkId===match.networkId))review.push({...match,status:'needs_review',relationshipType:'unknown',
      verificationMethod:REVIEW_METHOD,evidence:{...relationship.evidence,last_review:{checked_at:checkedAt,reason:result.reason}}});
  }
  return {confirmed,review};
}
export function reviewDecision({relationship,network,parsed,fetchResult,homepage,checkedAt,discoverySources=[]}) {
  const keep=reason=>({decision:'kept',reason});
  if(fetchResult?.outcome!=='parsed'||fetchResult.httpStatus!==200||!parsed||parsed.errors.length
    ||(!parsed.sellers.length&&!parsed.managerDomains.length&&!parsed.ownerDomains?.length))return keep('no_valid_fresh_ads_txt');
  const signal=relationship.evidence.matched_signal?.split(',').map(normalized);
  if(signal?.length!==3||!(network.ad_system_domains??[]).map(normalized).includes(signal[0]))return keep('unrecognized_stored_signal');
  const seller=parsed.sellers.find(row=>normalized(row.adSystem)===signal[0]&&normalized(row.sellerId)===signal[1]
    &&normalized(row.relationship)===signal[2]);
  const managers=parsed.managerDomains.map(row=>row.value);
  if(managers.some(domain=>(network.manager_domains??[]).includes(domain)))return {...keep('route_manager_evidence'),present:true};
  if(!seller) {
    const now=Date.parse(checkedAt),last=Date.parse(relationship.last_missed_at),first=Date.parse(relationship.first_missed_at);
    if(Number.isFinite(last)&&now-last<48*3600000)return keep('absence_not_yet_due');
    const misses=(relationship.consecutive_misses??0)+1;
    return {decision:misses>=3&&Number.isFinite(first)&&now-first>=7*86400000?'dropped':'kept',reason:'valid_absence',
      absence:{misses,first:relationship.first_missed_at??checkedAt,last:checkedAt}};
  }
  if(managers.length)return {...keep('different_manager'),present:true};
  if(!homepage?.html)return {...keep('homepage_unavailable'),present:true};
  // Only configured, network-specific tags/configuration in executable script markup qualify.
  // Plain article text, commented-out tags, seller rows and shared wrappers cannot match.
  const scripts=scriptMarkup(homepage.html);
  const signatures=(network.program_signatures??[]).filter(signature=>signature.kind==='html_substring'
    &&typeof signature.value==='string'&&signature.value.trim().length>=8
    &&signature.distinctive!==false&&signature.shared_wrapper!==true
    &&!/(?:googletagmanager\.com|googlesyndication\.com|doubleclick\.net|prebid\.js|gpt\.js)/i.test(signature.value));
  if(!signatures.length)return {...keep('no_distinctive_configured_signature'),present:true};
  const matches=matchNetworks({parsed,networks:[{...network,program_signatures:signatures}],
    fetchEvidence:{...fetchResult,checkedAt},homepage:{...homepage,html:scripts},discoverySources});
  const match=matches.confirmed.find(row=>row.networkId===network.id&&row.verificationMethod!=='ads_txt_managerdomain');
  if(!match)return {...keep('no_current_distinctive_tag'),present:true};
  return {decision:'confirmed',reason:'exact_line_and_current_distinctive_tag',present:true,evidence:{...match.evidence,
    matched_signal:`${seller.adSystem},${seller.sellerId},${seller.relationship}`,
    page_signature:match.evidence.matched_signal,review_rule:'exact-system-and-current-tag-v1',
    seller_type:seller.relationship,ads_txt_line:seller.raw,ads_txt_line_number:seller.line}};
}

export function applyReviewDecision(db,relationship,result,checkedAt) {
  // Another verifier may have resolved the row during the fetch. Never overwrite its decision.
  const current=db.prepare('select status,verification_method,evidence,last_missed_at from relationships where publisher_id=? and ad_network_id=?')
    .get(relationship.publisher_id,relationship.ad_network_id);
  if(current?.status!=='needs_review'||current.verification_method!==REVIEW_METHOD
    ||JSON.parse(current.evidence).matched_signal!==relationship.evidence.matched_signal
    ||(current.last_missed_at??null)!==(relationship.last_missed_at??null))return 'changed_elsewhere';
  if(result.decision==='confirmed') {
    db.prepare(`update relationships set status='confirmed',relationship_type='active_network_use',
      verification_method='ads_txt_and_page_signature',evidence=?,first_confirmed_at=coalesce(first_confirmed_at,?),
      last_confirmed_at=?,ended_at=null,consecutive_misses=0,first_missed_at=null,last_missed_at=null,updated_at=?
      where publisher_id=? and ad_network_id=?`).run(JSON.stringify(result.evidence),checkedAt,checkedAt,checkedAt,
        relationship.publisher_id,relationship.ad_network_id);
  } else if(result.absence) {
    db.prepare(`update relationships set status=?,consecutive_misses=?,first_missed_at=?,last_missed_at=?,
      ended_at=?,updated_at=? where publisher_id=? and ad_network_id=?`).run(result.decision==='dropped'?'ended':'needs_review',
        result.absence.misses,result.absence.first,result.absence.last,result.decision==='dropped'?checkedAt:null,
        checkedAt,relationship.publisher_id,relationship.ad_network_id);
  } else if(result.present) {
    db.prepare('update relationships set consecutive_misses=0,first_missed_at=null,last_missed_at=null where publisher_id=? and ad_network_id=?')
      .run(relationship.publisher_id,relationship.ad_network_id);
  }
  return result.decision;
}

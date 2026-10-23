import { getAdNetworkNiche } from "../ad-network-niches.ts";
import { estimateMeasures } from "./estimate.ts";
import { adNetworkProfiles } from "./profiles.ts";
import type { AdNetworkProfile, BarFact, Basis, CountryCode, GrowthTarget, InputErrorCode, InputKey, Interval, MeasureKey, Measures, ProfileRequirement, ProgramProfile, Recommendation, RecommendationInput, RecommendationResult, ScaleRoute } from "./types.ts";

const countryCodes: CountryCode[] = ["US", "GB", "CA", "AU", "NZ"];
const ageBands = { lt3m: [0, 3], "3to6m": [3, 6], "6to12m": [6, 12], gt12m: [12, Infinity] } as const;
const currentOptions = new Set([...adNetworkProfiles.map(p => p.slug), "snigel", "none", "other"]);
const evidenceWeights = { high: 1, medium: 0.9, low: 0.75 };
const accessWeights = { open: 1, form: 0.95, contact: 0.8, invite: 0.6 };
const nativeWidgets = new Set(["mgid", "revcontent", "taboola"]);
const exclusive = new Set(["raptive", "mediavine", "she-media", "newor-media", "playwire", "freestar"]);
const core = new Set(["tech", "gaming", "crafts", "education", "sports", "health-fitness"]);
const lexical = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function validateRecommendationInput(raw: Partial<Record<InputKey, string>>):
  { ok: true; input: RecommendationInput } | { ok: false; errors: Partial<Record<InputKey, InputErrorCode>> } {
  const errors: Partial<Record<InputKey, InputErrorCode>> = {};
  const text = (key: InputKey) => (raw[key] ?? "").trim();
  const niche = text("niche");
  if (!niche) errors.niche = "required";
  else if (niche !== "other" && !getAdNetworkNiche(niche)) errors.niche = "invalid_choice";
  if (!text("pageviews")) errors.pageviews = "required";
  const input: RecommendationInput = { niche: niche as RecommendationInput["niche"], visitsUnit: "sessions" };
  for (const key of ["siteAge", "current"] as const) {
    const value = text(key);
    if (!value) continue;
    if (key === "siteAge") {
      if (!Object.hasOwn(ageBands, value)) errors[key] = "invalid_choice";
      else input.siteAge = value as RecommendationInput["siteAge"];
    } else if (!currentOptions.has(value)) errors[key] = "invalid_choice";
    else input.current = value;
  }
  const numbers: InputKey[] = ["pageviews", "visits", "tier1Share", ...countryCodes.map(c => `share${c}` as InputKey), "adRevenueMonth"];
  for (const key of numbers) {
    const rawValue = text(key);
    if (!rawValue) continue;
    const count = key === "pageviews" || key === "visits";
    const value = rawValue.replace(/[,\s]/g, "");
    const n = Number(value), precision = count ? 0 : key === "adRevenueMonth" ? 2 : 1;
    const max = count ? 10_000_000_000 : key === "adRevenueMonth" ? 100_000_000 : 100;
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !Number.isFinite(n)) errors[key] = "not_a_number";
    else if (n < 0) errors[key] = "negative";
    else if (n > max) errors[key] = max === 100 ? "over_100" : "too_large";
    else if (count && !Number.isInteger(n)) errors[key] = "not_whole";
    else if (!count && (value.split(".")[1]?.length ?? 0) > precision) errors[key] = "too_many_decimals";
    else if (key.startsWith("share")) { input.shares ??= {}; input.shares[key.slice(5) as CountryCode] = n; }
    else if (key === "pageviews") input.pageviews = n;
    else if (key === "visits") input.visits = n;
    else if (key === "tier1Share") input.tier1Share = n;
    else input.adRevenueMonth = n;
  }
  if (input.visits !== undefined) {
    const unit = text("visitsUnit") || "sessions";
    if (!["sessions", "visits", "users"].includes(unit)) errors.visitsUnit = "invalid_choice";
    else input.visitsUnit = unit as RecommendationInput["visitsUnit"];
  }
  const splits = Object.values(input.shares ?? {}), total = splits.reduce((sum, n) => sum + Math.round(n * 10), 0);
  if (total > 1000) errors.shareUS = "shares_over_100";
  else if (input.tier1Share !== undefined && splits.length === 5 && Math.abs(total - Math.round(input.tier1Share * 10)) > 5) errors.shareUS = "split_mismatch";
  else if (input.tier1Share !== undefined && splits.length < 5 && total > Math.round(input.tier1Share * 10) + 5) errors.shareUS = "shares_over_tier1";
  if (Object.keys(errors).length) return { ok: false, errors };
  if (splits.length === 5) input.tier1Share = total / 10;
  else if (input.tier1Share !== undefined) input.tier1Share = Math.max(input.tier1Share, total / 10);
  return { ok: true, input };
}

function userTier(measures: Measures): number | null {
  const pv = measures.pageviews?.lo, rev = measures.adRevenueMonth?.lo;
  if (pv === undefined && rev === undefined) return null;
  const trafficTier = pv === undefined ? 0 : pv >= 2_000_000 ? 4 : pv >= 250_000 ? 3 : pv >= 50_000 ? 2 : pv >= 10_000 ? 1 : 0;
  const revenueTier = rev === undefined ? 0 : rev >= 15_000 ? 4 : rev >= 3000 ? 3 : rev >= 500 ? 2 : 0;
  return Math.max(trafficTier, revenueTier);
}
function pickProgram(profile: AdNetworkProfile, m: Measures): ProgramProfile {
  if (profile.slug === "newor-media") return profile.programs[(m.usPageviews?.lo ?? -1) >= 420_000 ? 2 : (m.usPageviews?.lo ?? -1) >= 60_000 ? 1 : 0];
  if (profile.slug === "setupad") return profile.programs[(m.visits?.lo ?? -1) >= 10_000_000 ? 1 : 0];
  return profile.programs[0];
}
function routesFor(profile: AdNetworkProfile, program: ProgramProfile, m: Measures, input: RecommendationInput): ScaleRoute[] {
  if (profile.slug === "publisher-collective" && !core.has(input.niche)) return [{ metric: "pageviews", floor: 3_000_000, comfortable: 6_000_000, kind: "hard", official: true }];
  if (profile.slug === "clickio" && (m.tier1Share?.lo ?? 0) < 50) return program.routes.map(r => r.metric === "pageviews" ? { ...r, floor: 1_000_000, comfortable: 2_000_000 } : r);
  return program.routes;
}
const barMetrics: Partial<Record<MeasureKey, BarFact["metric"]>> = { pageviews: "pageviews", visits: "visits", visitors: "visitors", monthlyActiveUsers: "monthly_active_users", tier1Sessions30d: "tier1_sessions_30d", usPageviews: "us_pageviews", adRevenueMonth: "ad_revenue_month", tier1Share: "tier1_share", usShare: "us_share", monumetricShare: "tier1_share", moneytizerUniques30d: "organic_unique_visitors_30d" };
function routeBar(profile: AdNetworkProfile, route: ScaleRoute, program: ProgramProfile): BarFact | undefined {
  if (route.bar) return route.bar;
  if (profile.slug === "mediavine") return profile.bars.find(b => b.metric === "ad_revenue_previous_calendar_year");
  const matches = profile.bars.filter(b => b.metric === barMetrics[route.metric] && (b.program === null || b.program === program.name || !["newor-media", "setupad"].includes(profile.slug)));
  return matches.find(b => b.amount === route.floor || (b.comparator === "more_than" && b.amount !== null && Math.abs(b.amount + (b.currency ? 0.01 : 1) - route.floor) < 0.00001)) ?? matches[0];
}
function requirementsFor(profile: AdNetworkProfile, m: Measures, input: RecommendationInput): ProfileRequirement[] {
  const slug = profile.slug;
  const metric = slug === "raptive" || slug === "freestar" ? "tier1Share" : slug === "monumetric" ? "monumetricShare" : slug === "she-media" ? "usShare" : slug === "publisher-collective" && !core.has(input.niche) ? "pageviews" : null;
  if (!metric) return [];
  const threshold = slug === "raptive" ? (m.pageviews?.lo ?? 0) >= 100_000 ? 40 : 50 : slug === "she-media" ? 30 : slug === "publisher-collective" ? 3_000_000 : 50;
  const bar = profile.bars.find(b => b.metric === barMetrics[metric] && b.amount === threshold);
  if (!bar) throw new Error(`Missing published requirement: ${slug} ${metric} ${threshold}`);
  return [{ metric, threshold, bar }];
}
function ageFactor(months: number | undefined, band: RecommendationInput["siteAge"]) {
  if (months === undefined) return 1;
  if (!band) return 0.8;
  const [lo, hi] = ageBands[band];
  return lo >= months ? 1 : hi <= months ? 0.5 : 0.85;
}
function scale(route: ScaleRoute, value: Interval | undefined): number {
  if (route.kind === "none") return 1;
  if (route.kind === "pref") return 0.5 + 0.5 * Math.min(1, (value?.lo ?? 0) / route.comfortable);
  if (!value) return route.floor <= 10_000 ? 0.5 : route.floor <= 50_000 ? 0.35 : route.floor <= 250_000 ? 0.2 : 0.05;
  if (value.lo >= route.comfortable) return 1;
  if (value.lo >= route.floor) return 0.85 + 0.15 * (value.lo - route.floor) / (route.comfortable - route.floor);
  if (value.hi >= route.floor) return 0.6;
  if (value.hi >= 0.7 * route.floor) return 0.35;
  return 0.1;
}
function routePasses(route: ScaleRoute, value: Interval | undefined, lane: AdNetworkProfile["lane"]): boolean | null {
  if (!value && route.metric === "adRevenueMonth") return null;
  if (!value) return true;
  if (route.kind === "hard" || route.kind === "editorial_gate") return value.hi >= route.floor;
  if (route.kind === "soft" && lane === "main") return value.hi >= 0.5 * route.floor;
  return true;
}
type Failed = { metric: MeasureKey; threshold: number; bar?: BarFact; ratio: number };
function predicateKey(item: Failed) {
  const b = item.bar;
  return JSON.stringify([item.metric, b?.comparator ?? "at_least", b?.amount ?? item.threshold, b?.currency ?? null, b?.period ?? "month", b?.scope ?? null]);
}
type Candidate = { card: Recommendation; E: number; A: number; tier: number; family?: string };
type Growth = { target: GrowthTarget; closeness: number; tier: number; E: number };
function candidateOrder(a: Candidate, b: Candidate) {
  const diff = b.card.debug.rank - a.card.debug.rank;
  return (Math.abs(diff) > 1e-10 ? diff : 0) || b.E - a.E || b.A - a.A || lexical(a.card.slug, b.card.slug);
}

export function recommendAdNetworks(input: RecommendationInput, peers: Partial<Record<string, number>> | null, profiles: AdNetworkProfile[] = adNetworkProfiles): RecommendationResult {
  const measures = estimateMeasures(input), ut = userTier(measures);
  const current = input.current;
  const currentTier = current === "pubnation" || current === "pubgalaxy" ? 2 : current === "snigel" ? 3 : profiles.find(p => p.slug === current)?.tier;
  const large = (measures.pageviews?.lo ?? 0) >= 1_000_000 || (input.adRevenueMonth ?? 0) >= 5000;
  const candidates: Candidate[] = [], growth: Growth[] = [];
  for (const profile of profiles) {
    const program = pickProgram(profile, measures), slug = profile.slug;
    const upgrade = slug === "mediavine" && (current === "journey-by-mediavine" || current === "pubnation");
    if (profile.lane === "legacy" || slug === current || (profile.family === "mediavine" && ["mediavine", "pubnation"].includes(current ?? "")) || (slug === "publisher-collective" && current === "snigel")) continue;
    if ((profile.nicheGate && (input.niche === "other" || !profile.nicheGate.includes(input.niche))) || (profile.specialist && (input.niche === "other" || !profile.strong.includes(input.niche)))) continue;
    if (profile.lane === "main" && currentTier !== undefined && program.tier < currentTier && !upgrade) continue;
    const E = evidenceWeights[program.evidence ?? profile.evidence], A = profile.accessScore ?? accessWeights[profile.access];
    const routes = routesFor(profile, program, measures, input);
    const evaluated = routes.map(route => ({ route, value: measures[route.metric], pass: routePasses(route, measures[route.metric], profile.lane), S: scale(route, measures[route.metric]) }));
    let caseByCase = false;
    if (slug === "she-media" && evaluated[0]?.pass === false && (measures.pageviews?.lo ?? 0) >= 25_000 && input.niche !== "other" && profile.strong.includes(input.niche)) {
      evaluated[0] = { ...evaluated[0], pass: true, S: 0.5 }; caseByCase = true;
    }
    // Within official routes, hard beats soft on an S tie (model scenarios 5 and 6).
    const passing = evaluated.filter(r => r.pass === true).sort((a, b) => b.S - a.S || Number(b.route.official) - Number(a.route.official) || Number(b.route.kind === "hard") - Number(a.route.kind === "hard"));
    const failed: Failed[] = [];
    if (!passing.length) {
      const failing = evaluated.filter(r => r.pass === false).map(r => ({ metric: r.route.metric, threshold: r.route.floor, ratio: clamp((r.value?.hi ?? 0) / r.route.floor, 0, 1), bar: routeBar(profile, r.route, program) })).sort((a, b) => b.ratio - a.ratio);
      if (!failing.length) continue;
      failed.push(failing[0]);
    }
    const requirements = requirementsFor(profile, measures, input);
    let G = profile.geography === "region" ? 0.75 : profile.geography === "tier1" ? measures.noCountryInput ? 0.8 : clamp(measures.tier1Share!.lo / 60, 0.3, 1) : 1;
    for (const req of requirements) {
      const value = measures[req.metric];
      if (req.metric !== "pageviews" && measures.noCountryInput) { G = Math.min(G, 0.6); continue; }
      if (!value) continue;
      if (value.hi < req.threshold) failed.push({ metric: req.metric, threshold: req.threshold, bar: req.bar, ratio: clamp(value.hi / req.threshold, 0, 1) });
      else if (req.metric !== "pageviews") G = Math.min(G, value.lo >= req.threshold ? 1 : 0.7);
    }
    if (failed.length) {
      if (profile.lane === "main") {
        const distinct = new Map(failed.map(f => [predicateKey(f), f]));
        const closeness = [...distinct.values()].reduce((n, f) => n * f.ratio, 1);
        const bar = [...distinct.values()].find(f => f.bar)?.bar;
        if (closeness >= 0.2 && bar) growth.push({ target: { slug, program: program.name, bar }, closeness, tier: program.tier, E });
      }
      continue;
    }
    if (!passing.length) continue;
    const deciding = passing[0], route = deciding.route;
    let S = deciding.S;
    if (slug === "google-adsense") {
      const pageviews = measures.pageviews?.lo ?? 0;
      S *= pageviews < 25_000 ? 1 : pageviews < 100_000 ? 0.75 : pageviews < 500_000 ? 0.45 : 0.3;
    }
    let basis: Basis;
    if (caseByCase || slug === "the-moneytizer") basis = "review_led";
    else if (route.kind === "none" || route.kind === "pref" || (slug === "newor-media" && program.name === "Elevate" && S >= 0.6)) basis = "no_minimum";
    else if ((route.kind === "editorial" || (slug === "newor-media" && program.name === "Elevate")) && S >= 0.35) basis = "review_led";
    else if (S < 0.35) continue;
    else if (S < 0.6) basis = "review_led";
    else if (route.kind === "hard" && S >= 0.85 && deciding.value?.exact && requirements.every(req => measures[req.metric]?.exact) && profile.ageMonths === undefined) basis = "published_number";
    else basis = "estimate";
    const diff = program.tier - (ut ?? program.tier);
    const TM = profile.lane !== "main" || ut === null ? 0.8 : diff === 0 ? 1 : diff === -1 ? 0.85 : diff === 1 ? 0.75 : diff <= -2 ? 0.55 : 0.4;
    const Cc = profile.lane !== "main" || currentTier === undefined ? 0.8 : upgrade || program.tier > currentTier ? 1 : 0.7;
    const count = input.niche === "other" ? undefined : peers?.[slug];
    const P = count !== undefined && count >= 5 ? Math.min(1, count / 20) : null;
    const Aeff = ut === null ? A : 1 - (1 - A) * Math.max(0, (3 - ut) / 3);
    const Aage = ageFactor(profile.ageMonths, input.siteAge);
    const Nmult = input.niche === "other" ? 0.92 : profile.strong.includes(input.niche) ? 1 : profile.weak.includes(input.niche) ? 0.75 : 0.92;
    const base = (0.4 * S + 0.2 * TM + 0.2 * G + 0.1 * Cc + (P === null ? 0 : 0.1 * P)) / (P === null ? 0.9 : 1);
    const score = Math.min(E === 0.75 && S < 0.85 ? 40 : Infinity, 100 * base * E * Aeff * Aage * Nmult);
    const rank = score + ({ published_number: 6, estimate: 3, no_minimum: 0, review_led: -6 }[basis]) + (upgrade ? 8 : 0) + (profile.specialist ? 5 : 0);
    const checkContract = profile.lane === "add" && exclusive.has(current ?? "");
    const bar = routeBar(profile, route, program);
    const reason = reasonFor(profile, route, basis, deciding.value, { upgrade, checkContract, caseByCase }, bar, input);
    const estimated = new Set<keyof Measures>();
    for (const metric of [route.metric, ...requirements.map(req => req.metric), ...(profile.geography === "tier1" ? ["tier1Share" as const] : [])]) if (measures[metric] && !measures[metric]!.exact) estimated.add(metric);
    const detailBars = profile.bars.filter(b => !["newor-media", "setupad"].includes(slug) || b.program === null || b.program === program.name);
    // Public details cite the joining pages, while profile.sources retains the
    // wider research evidence. Put the pages behind the displayed bars first.
    const joiningUrls = new Set(profile.joiningSourceUrls);
    const sourceUrls = [...new Set([...detailBars.map(b => b.sourceUrl).filter(url => joiningUrls.has(url)), ...joiningUrls])];
    const detailSources = sourceUrls.flatMap(url => {
      const source = profile.sources.find(source => source.url === url);
      return source ? [source] : [];
    });
    const alsoNeeds = [...new Set([...profile.alsoNeeds, ...(program.alsoNeeds ?? [])])]
      .filter(key => key !== "incubator_limited" || (measures.monthlyActiveUsers?.lo ?? 0) < 250_000);
    candidates.push({ tier: program.tier, E, A, family: profile.family, card: {
      slug, program: program.name, lane: profile.lane, status: basis !== "review_led" && score >= 70 ? "good_fit" : "worth_a_try", reason,
      upgrade, checkContract, applyUrl: profile.applyUrl,
      detail: { sources: detailSources, bars: detailBars, alsoNeeds, peers: count !== undefined && count >= 5 ? count : null, directoryHref: `/ad-networks/${slug}` },
      debug: { score, rank, basis, S, TM, G, Cc, P, Aeff, Aage, Nmult, estimated: [...estimated] },
    } });
  }
  candidates.sort(candidateOrder);
  const main: Candidate[] = [], families = new Set<string>();
  for (const candidate of candidates) {
    const card = candidate.card;
    if (card.debug.score < 45 || !(card.lane === "main" || card.lane === "setup" && large && card.debug.S >= 0.85)) continue;
    if (candidate.family && families.has(candidate.family)) continue;
    if (candidate.family) families.add(candidate.family);
    main.push(candidate);
  }
  const selected = main.slice(0, 5);
  if ((!current || current === "none") && (measures.pageviews?.lo ?? 0) < 25_000) {
    const adsense = main.find(c => c.card.slug === "google-adsense");
    if (adsense && !selected.includes(adsense)) selected.splice(4, 1, adsense);
  }
  const add: Recommendation[] = [];
  if (current !== "buysellads-carbon-ads") {
    let native = false;
    for (const { card } of candidates) if (card.lane === "add" && card.debug.score >= 45 && !(nativeWidgets.has(card.slug) && native)) {
      add.push(card); if (nativeWidgets.has(card.slug)) native = true; if (add.length === 2) break;
    }
  }
  const setup = large ? candidates.filter(c => c.card.lane === "setup" && c.card.debug.score >= 50 && !selected.includes(c)).slice(0, 2).map(c => c.card) : [];
  growth.sort((a, b) => b.closeness - a.closeness || a.tier - b.tier || b.E - a.E || lexical(a.target.slug, b.target.slug));
  const targets = growth.slice(0, 2).map(g => g.target);
  const mainCards = selected.map(c => ({ ...c.card, debug: { ...c.card.debug, score: round(c.card.debug.score), rank: round(c.card.debug.rank) } }));
  const publicCard = (c: Recommendation) => ({ ...c, debug: { ...c.debug, score: round(c.debug.score), rank: round(c.debug.rank) } });
  const suggestInput: InputKey | null = input.adRevenueMonth === undefined && (measures.pageviews === undefined || measures.pageviews.lo >= 20_000) ? "adRevenueMonth" : measures.noCountryInput ? "tier1Share" : !input.siteAge ? "siteAge" : null;
  const lead: RecommendationResult["lead"] = mainCards.length ? { kind: "apply", slug: mainCards[0].slug, count: mainCards.length } : targets.length ? { kind: "grow", slug: targets[0].slug } : current && current !== "none" ? { kind: "no_step_up", current } : { kind: "none_stand_out" };
  return { lead, main: mainCards, more: { add: add.map(publicCard), setup: setup.map(publicCard), growth: targets }, suggestInput };
}

function reasonFor(profile: AdNetworkProfile, route: ScaleRoute, basis: Basis, value: Interval | undefined, flags: { upgrade: boolean; checkContract: boolean; caseByCase: boolean }, bar: BarFact | undefined, input: RecommendationInput): Recommendation["reason"] {
  const values: Record<string, number | string> = { metric: bar?.metric ?? route.metric };
  if (bar?.amount !== null && bar?.amount !== undefined) values.bar = bar.amount;
  if (value?.exact) values.yours = value.lo;
  if (flags.upgrade) return { code: "upgrade", values: { current: input.current! } };
  if (flags.checkContract) return { code: "check_contract", values: { current: input.current! } };
  if (profile.specialist) return { code: "niche_specialist", values: { niche: input.niche } };
  if (profile.slug === "mediavine") return { code: "revenue_signal", values: {} };
  if (flags.caseByCase) return { code: "case_by_case", values: {} };
  if (route.metric === "adRevenueMonth" && route.official) return { code: "revenue_bar", values };
  if (basis === "published_number") return { code: "published_bar", values };
  if (basis === "estimate" && route.kind === "hard") return { code: "estimated_bar", values };
  if (route.kind === "soft") return { code: "apply_guidance", values };
  if (basis === "no_minimum") return { code: "no_minimum", values: {} };
  if (route.kind === "editorial" && ["contact", "invite"].includes(profile.access)) return { code: "sales_led", values: {} };
  return { code: "fit_estimate", values: {} };
}

const queryFields: [string, InputKey][] = [["niche", "niche"], ["pv", "pageviews"], ["visits", "visits"], ["unit", "visitsUnit"], ["age", "siteAge"], ["t1", "tier1Share"], ["us", "shareUS"], ["gb", "shareGB"], ["ca", "shareCA"], ["au", "shareAU"], ["nz", "shareNZ"], ["current", "current"], ["rev", "adRevenueMonth"]];
export function parseRecommendationQuery(params: URLSearchParams): { shared: boolean; raw: Partial<Record<InputKey, string>> } {
  return { shared: params.has("niche"), raw: Object.fromEntries(queryFields.flatMap(([param, key]) => params.get(param)?.trim() ? [[key, params.get(param)!]] : [])) };
}
export function recommendationShareParams(raw: Partial<Record<InputKey, string>>): Record<string, string> {
  return Object.fromEntries(queryFields.flatMap(([param, key]) => raw[key]?.trim() ? [[param, raw[key]!.trim()]] : []));
}

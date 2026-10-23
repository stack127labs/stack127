import type { AdNetworkNicheSlug } from "../ad-network-niches.ts";
import type { NetworkLogoFile } from "../../app/ui/ad-networks/network-logo-src.ts";

export type NicheSlug = AdNetworkNicheSlug;
export type CountryCode = "US" | "GB" | "CA" | "AU" | "NZ";
export type VisitsUnit = "sessions" | "visits" | "users";
export type SiteAge = "lt3m" | "3to6m" | "6to12m" | "gt12m";
export type InputKey = "niche" | "pageviews" | "visits" | "visitsUnit" | "siteAge" | "tier1Share" | "shareUS" | "shareGB" | "shareCA" | "shareAU" | "shareNZ" | "current" | "adRevenueMonth";
export type RecommendationInput = {
  niche: NicheSlug | "other"; pageviews?: number; visits?: number; visitsUnit: VisitsUnit;
  siteAge?: SiteAge; tier1Share?: number; shares?: Partial<Record<CountryCode, number>>;
  current?: string; adRevenueMonth?: number;
};
export type InputErrorCode = "required" | "not_a_number" | "negative" | "not_whole" | "too_many_decimals" | "too_large" | "over_100" | "shares_over_100" | "shares_over_tier1" | "split_mismatch" | "invalid_choice";
export type Interval = { lo: number; hi: number; exact: boolean };
export type MeasureKey = "pageviews" | "sessions" | "visits" | "visitors" | "monthlyActiveUsers" | "tier1Sessions30d" | "tier1Share" | "usShare" | "monumetricShare" | "moneytizerShare" | "usPageviews" | "adRevenueMonth" | "moneytizerUniques30d";
export type Measures = Partial<Record<MeasureKey, Interval>> & { noCountryInput: boolean };
export type Lane = "main" | "add" | "setup";
export type Status = "good_fit" | "worth_a_try" | "growth_target";
export type Basis = "published_number" | "estimate" | "no_minimum" | "review_led";
export type ReasonCode = "published_bar" | "estimated_bar" | "apply_guidance" | "revenue_signal" | "revenue_bar" | "no_minimum" | "case_by_case" | "niche_specialist" | "sales_led" | "upgrade" | "check_contract" | "fit_estimate";
export type BarFact = {
  metric: "pageviews" | "tier1_sessions_30d" | "visits" | "visitors" | "monthly_active_users" | "us_pageviews" | "ad_revenue_month" | "ad_revenue_previous_calendar_year" | "tier1_share" | "us_share" | "organic_unique_visitors_30d" | "none";
  comparator: "at_least" | "more_than" | "none"; amount: number | null; currency: "USD" | "EUR" | null;
  period: "month" | "day" | "30_days" | "previous_calendar_year" | null;
  scope: string | null; program: string | null; kind: "requirement" | "guidance"; sourceUrl: string; checkedAt: string;
};
export type RouteKind = "hard" | "soft" | "editorial" | "editorial_gate" | "none" | "pref";
export type ScaleRoute = {
  metric: MeasureKey; floor: number; comfortable: number; kind: RouteKind;
  official: boolean; bar?: BarFact;
};
export type ProfileRequirement = { metric: MeasureKey; threshold: number; bar: BarFact };
export type ProgramProfile = {
  name: string | null; tier: number; routes: ScaleRoute[];
  evidence?: "high" | "medium" | "low"; alsoNeeds?: string[];
};
export type RecommendationSource = { label: string; url: string; checkedAt: string };
export type AdNetworkProfile = {
  slug: string; lane: Lane | "legacy"; tier: number; access: "open" | "form" | "contact" | "invite";
  accessScore?: number; evidence: "high" | "medium" | "low";
  strong: NicheSlug[]; weak: NicheSlug[]; geography: "none" | "tier1" | "region";
  ageMonths?: number; family?: string; nicheGate?: NicheSlug[]; specialist?: boolean;
  programs: ProgramProfile[]; bars: BarFact[]; alsoNeeds: string[]; applyUrl: string;
  sources: RecommendationSource[];
  joiningSourceUrls: string[]; // Official joining pages; research evidence stays in sources.
};
export type Recommendation = {
  slug: string; program: string | null; lane: Lane; status: Exclude<Status, "growth_target">;
  reason: { code: ReasonCode; values: Record<string, number | string> };
  upgrade: boolean; checkContract: boolean; applyUrl: string;
  detail: { bars: BarFact[]; alsoNeeds: string[]; sources: RecommendationSource[]; peers: number | null; directoryHref: string };
  debug: { score: number; rank: number; basis: Basis; S: number; TM: number; G: number; Cc: number;
    P: number | null; Aeff: number; Aage: number; Nmult: number; estimated: (keyof Measures)[] };
};
export type GrowthTarget = { slug: string; program: string | null; bar: BarFact };
export type Lead = { kind: "apply"; slug: string; count: number } | { kind: "grow"; slug: string } | { kind: "no_step_up"; current: string } | { kind: "none_stand_out" };
export type RecommendationResult = {
  lead: Lead; main: Recommendation[]; more: { add: Recommendation[]; setup: Recommendation[]; growth: GrowthTarget[] }; suggestInput: InputKey | null;
};
export type RequirementsPageData = {
  networks: { slug: string; name: string; logo: NetworkLogoFile | null; directoryHref: string }[];
  peers: Record<NicheSlug, Partial<Record<string, number>>>; defaultResult: RecommendationResult;
};

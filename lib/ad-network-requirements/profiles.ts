import { profileFacts } from "./profile-facts.ts";
import type { AdNetworkProfile, NicheSlug, ProgramProfile, ScaleRoute } from "./types.ts";

// Editorial priors from recommendation-model.md. These rank estimated fit;
// only the separately sourced bars describe a network's own published criteria.
const lifestyle: NicheSlug[] = ["food", "travel", "lifestyle", "parenting", "personal-finance", "home-diy", "crafts", "health-fitness", "beauty-fashion", "gardening", "pets", "outdoors", "education"];
const core: NicheSlug[] = ["tech", "gaming", "crafts", "education", "sports", "health-fitness"];
const route = (metric: ScaleRoute["metric"], floor: number, comfortable: number, kind: ScaleRoute["kind"]): ScaleRoute => ({ metric, floor, comfortable, kind, official: ["hard", "soft", "none", "pref"].includes(kind) });
const pv = (f: number, c: number, kind: ScaleRoute["kind"] = "editorial") => route("pageviews", f, c, kind);
const revenue = (f: number, c: number, kind: ScaleRoute["kind"] = "editorial") => route("adRevenueMonth", f, c, kind);
function profile(slug: string, lane: AdNetworkProfile["lane"], tier: number, access: AdNetworkProfile["access"], evidence: AdNetworkProfile["evidence"], routes: ScaleRoute[], extra: Partial<AdNetworkProfile> = {}): AdNetworkProfile {
  const facts = profileFacts[slug];
  return { slug, lane, tier, access, evidence, strong: [], weak: [], geography: "none", programs: [{ name: null, tier, routes }], ...facts, ...extra };
}
const neworPrograms: ProgramProfile[] = [
  { name: "Elevate", tier: 1, routes: [pv(10_000, 40_000)], alsoNeeds: ["english"] },
  { name: "Catapult", tier: 2, routes: [route("usPageviews", 60_000, 420_000, "hard")] },
  { name: "Premier", tier: 3, routes: [route("usPageviews", 420_000, 420_000, "hard")] },
];
export const adNetworkProfiles: AdNetworkProfile[] = [
  profile("google-adsense", "main", 0, "open", "high", [pv(0, 0, "none")]),
  profile("journey-by-mediavine", "main", 1, "form", "medium", [route("tier1Sessions30d", 1000, 5000, "hard")], { strong: lifestyle, weak: ["news"], geography: "tier1", ageMonths: 4, family: "mediavine" }),
  profile("monumetric", "main", 1, "form", "high", [pv(10_000, 20_000, "hard")], { strong: ["personal-finance", "food", "travel", "lifestyle", "home-diy", "parenting", "crafts", "health-fitness"], ageMonths: 3 }),
  profile("newor-media", "main", 1, "form", "medium", [], { programs: neworPrograms }),
  profile("buysellads-carbon-ads", "main", 1, "form", "medium", [pv(20_000, 100_000)], { accessScore: 0.9, strong: ["tech"], nicheGate: ["tech"], geography: "tier1" }),
  profile("pubfuture", "main", 1, "open", "medium", [pv(100_000, 200_000, "hard")], { strong: ["gaming"], weak: ["food", "home-diy", "travel", "parenting", "personal-finance", "health-fitness", "beauty-fashion", "tech", "crafts", "pets", "outdoors", "gardening", "sports", "lifestyle", "automotive", "business", "news"] }),
  profile("pubpower", "main", 1, "form", "low", [route("visitors", 100_000, 200_000, "soft")], { strong: ["entertainment", "gaming"] }),
  profile("raptive", "main", 2, "form", "high", [pv(25_000, 50_000, "hard")], { strong: ["food", "lifestyle", "home-diy", "parenting", "travel", "crafts", "personal-finance", "health-fitness", "beauty-fashion", "gardening", "pets"], ageMonths: 6 }),
  profile("mediavine", "main", 2, "form", "high", [revenue(420, 700, "editorial_gate")], { strong: lifestyle, weak: ["news"], geography: "tier1", family: "mediavine" }),
  profile("she-media", "main", 2, "form", "high", [pv(50_000, 100_000, "hard")], { strong: ["lifestyle", "food", "parenting", "home-diy", "beauty-fashion", "health-fitness", "crafts", "travel"], weak: ["gaming", "tech", "automotive", "sports", "news", "business"], ageMonths: 3 }),
  profile("ezoic", "main", 2, "open", "high", [route("monthlyActiveUsers", 250_000, 400_000, "hard")], { strong: ["tech", "news", "education"] }),
  profile("clickio", "main", 2, "contact", "high", [pv(100_000, 200_000, "soft"), revenue(500.01, 1000, "hard")]),
  profile("the-moneytizer", "main", 2, "form", "high", [route("moneytizerUniques30d", 300_000, 450_000, "hard")]),
  profile("nitropay", "main", 2, "form", "medium", [pv(25_000, 100_000)], { strong: ["gaming", "entertainment"], specialist: true }),
  profile("refinery89", "main", 2, "contact", "low", [pv(100_000, 500_000)], { strong: ["news", "lifestyle"], geography: "region" }),
  profile("playwire", "main", 3, "form", "medium", [pv(100_000, 500_000, "soft")], { strong: ["gaming", "education", "entertainment", "travel"], geography: "tier1" }),
  profile("freestar", "main", 3, "contact", "medium", [pv(300_000, 1_000_000)], { strong: ["sports", "news", "personal-finance", "automotive", "gaming", "entertainment"] }),
  profile("publift", "main", 3, "contact", "high", [revenue(2000.01, 4000, "hard"), pv(500_000, 1_000_000, "soft")], { strong: ["gaming"], geography: "tier1" }),
  profile("publisher-collective", "main", 3, "contact", "high", [pv(300_000, 1_000_000), revenue(9000, 15_000)], { strong: core }),
  profile("snack-media", "main", 3, "contact", "medium", [pv(250_000, 1_000_000)], { strong: ["sports", "entertainment"], specialist: true }),
  profile("venatus", "main", 3, "contact", "low", [pv(250_000, 1_000_000)], { strong: ["gaming", "sports", "entertainment"], specialist: true }),
  profile("adnimation", "main", 3, "form", "low", [pv(1_000_000, 3_000_000)], { strong: ["news", "automotive"], programs: [{ name: "Standard", tier: 3, routes: [pv(1_000_000, 3_000_000)] }] }),
  profile("concert", "main", 4, "invite", "low", [pv(10_000_000, 30_000_000)], { strong: ["news", "entertainment"] }),
  profile("media-net", "main", 0, "form", "low", [pv(50_000, 250_000)], { strong: ["news", "personal-finance", "tech"], geography: "tier1" }),
  profile("infolinks", "add", 0, "open", "medium", [pv(0, 0, "none")]),
  profile("revcontent", "add", 0, "form", "medium", [pv(0, 0, "none")], { strong: ["news", "entertainment"] }),
  profile("taboola", "add", 0, "form", "medium", [pv(0, 100_000, "pref")], { strong: ["news", "entertainment", "lifestyle"] }),
  profile("mgid", "add", 0, "open", "high", [route("visitors", 90_000, 180_000, "hard")], { strong: ["news", "entertainment", "sports"] }),
  profile("sovrn", "add", 0, "form", "high", [route("visits", 100_001, 200_000, "hard")]),
  profile("ethicalads", "add", 0, "form", "medium", [pv(50_000, 100_000, "hard")], { strong: ["tech"], nicheGate: ["tech", "education"], geography: "tier1" }),
  profile("teads", "add", 4, "contact", "low", [pv(1_000_000, 5_000_000)], { strong: ["news", "education", "entertainment"] }),
  profile("amazon-publisher-services", "setup", 4, "invite", "medium", [pv(1_000_000, 5_000_000)], { strong: ["news"] }),
  profile("monetizemore-pubguru", "setup", 3, "contact", "high", [revenue(5000, 10_000, "hard"), pv(2_000_000, 4_000_000, "hard")], { strong: ["food"] }),
  profile("adpushup", "setup", 3, "form", "low", [revenue(3000, 6000), pv(500_000, 1_000_000)], { strong: ["tech"] }),
  profile("adapex", "setup", 3, "contact", "low", [pv(500_000, 2_000_000), revenue(3000, 10_000)]),
  profile("aditude", "setup", 4, "contact", "low", [pv(1_000_000, 5_000_000), revenue(10_000, 30_000)], { strong: ["gaming", "entertainment"] }),
  profile("anymind-anymanager", "setup", 4, "contact", "low", [pv(1_000_000, 3_000_000), revenue(5000, 15_000)], { strong: ["news", "gaming"], geography: "region" }),
  profile("geniee-ssp", "setup", 4, "form", "low", [pv(1_000_000, 3_000_000)], { strong: ["news"], geography: "region" }),
  profile("opti-digital", "setup", 4, "contact", "low", [pv(1_000_000, 3_000_000), revenue(5000, 15_000)], { geography: "region" }),
  profile("publir", "setup", 3, "form", "low", [pv(100_000, 500_000)]),
  profile("setupad", "setup", 3, "form", "low", [], { programs: [
    { name: "Managed", tier: 3, routes: [route("visits", 100_000, 500_000, "editorial")] },
    { name: "Self-Serve", tier: 3, evidence: "high", routes: [route("visits", 10_000_000, 50_000_000, "hard")], alsoNeeds: ["own_gam"] },
  ] }),
  profile("sparteo", "setup", 4, "contact", "low", [pv(1_000_000, 3_000_000)], { strong: ["education"] }),
  profile("pubnation", "legacy", 2, "contact", "low", []),
  profile("pubgalaxy", "legacy", 2, "contact", "low", []),
];

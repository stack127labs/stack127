// The fixed niche list for ad network sites. A site gets one niche, or none
// until it is sorted. The slug is stored in the database; names and lines
// are page words and stay here.

export type AdNetworkNiche = {
  slug: string;
  name: string;
  line: string;
};

export const adNetworkNiches = [
  { slug: "food", name: "Food", line: "Recipes, cooking, baking, and drinks." },
  { slug: "home-diy", name: "Home & DIY", line: "Home decor, cleaning, repairs, and home projects." },
  { slug: "travel", name: "Travel", line: "Trip guides, destinations, and travel tips." },
  { slug: "parenting", name: "Parenting", line: "Pregnancy, babies, kids, and family life." },
  { slug: "personal-finance", name: "Personal finance", line: "Saving, budgets, debt, investing, and side income." },
  { slug: "health-fitness", name: "Health & fitness", line: "Workouts, diets, wellness, and health topics." },
  { slug: "beauty-fashion", name: "Beauty & fashion", line: "Makeup, skin care, hair, and clothing." },
  { slug: "gaming", name: "Gaming", line: "Game guides, wikis, news, and tools for players." },
  { slug: "tech", name: "Tech", line: "Software, devices, how-to guides, and reviews." },
  { slug: "crafts", name: "Crafts", line: "Sewing, knitting, paper crafts, and printables." },
  { slug: "pets", name: "Pets", line: "Dogs, cats, and other pets." },
  { slug: "outdoors", name: "Outdoors", line: "Camping, hiking, hunting, and fishing." },
  { slug: "gardening", name: "Gardening", line: "Plants, vegetables, and yard care." },
  { slug: "sports", name: "Sports", line: "Teams, scores, leagues, and fantasy sports." },
  { slug: "entertainment", name: "Entertainment", line: "TV, movies, music, books, and celebrities." },
  { slug: "lifestyle", name: "Lifestyle", line: "General life, relationships, and personal blogs." },
  { slug: "education", name: "Education", line: "Learning, school help, languages, and reference." },
  { slug: "automotive", name: "Automotive", line: "Cars, trucks, repairs, and buying guides." },
  { slug: "business", name: "Business", line: "Small business, marketing, and careers." },
  { slug: "news", name: "News", line: "News and current events." },
] as const satisfies readonly AdNetworkNiche[];

export type AdNetworkNicheSlug = (typeof adNetworkNiches)[number]["slug"];

const bySlug = new Map<string, AdNetworkNiche>(adNetworkNiches.map((niche) => [niche.slug, niche]));

export function getAdNetworkNiche(slug: string | null | undefined): AdNetworkNiche | null {
  return slug ? bySlug.get(slug) ?? null : null;
}

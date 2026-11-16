/**
 * Site page search. The index lists published pages only, never directory
 * records. It is built on the server and matched in the browser, so this file
 * has no imports and is safe in both places.
 */

export type SiteSearchFamily = "tool" | "directory" | "catalog" | "course" | "site";

export type SiteSearchEntry = {
  title: string;
  description: string;
  family: SiteSearchFamily;
  path: string;
  icon: string | null;
};

export type SiteSearchPage = {
  id: number | string;
  slug: string;
  page_family: SiteSearchFamily;
  label: string;
  meta_description: string;
  is_published: boolean;
  is_indexable: boolean;
};

export type SiteSearchCard = {
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
};

/** Code-owned identity icons for site pages, as on the homepage cards. */
const sitePageIcons: Record<string, string> = { labs: "labs" };

/** Families whose exported page needs a card row, as in the static export query. */
const cardFamilies = new Set<SiteSearchFamily>(["tool", "directory", "catalog"]);

/**
 * Every published page except the homepage and noindex child pages. A child
 * page without its own icon uses its parent's, like the directory h1 icons.
 * Course lessons have no card, so they use their lesson title.
 */
export function buildSiteSearchEntries(
  pages: readonly SiteSearchPage[],
  cards: ReadonlyMap<string, SiteSearchCard>,
  lessonTitles: ReadonlyMap<string, string> = new Map(),
): SiteSearchEntry[] {
  const included = pages.filter(page => page.is_published && page.slug
    && (page.is_indexable || !page.slug.includes("/"))
    && (!cardFamilies.has(page.page_family) || cards.has(String(page.id))));
  const iconBySlug = new Map<string, string>();
  for (const page of included) {
    const icon = cards.get(String(page.id))?.card_icon_key || sitePageIcons[page.slug];
    if (icon) iconBySlug.set(page.slug, icon);
  }
  const inheritedIcon = (slug: string) => {
    const parts = slug.split("/");
    for (let index = parts.length - 1; index > 0; index -= 1) {
      const icon = iconBySlug.get(parts.slice(0, index).join("/"));
      if (icon) return icon;
    }
    return null;
  };

  return included
    .map(page => {
      const card = cards.get(String(page.id));
      return {
        title: clean(card?.card_name) || clean(lessonTitles.get(String(page.id))) || clean(page.label),
        description: clean(card?.card_description) || clean(page.meta_description),
        family: page.page_family,
        path: `/${page.slug}`,
        icon: iconBySlug.get(page.slug) ?? inheritedIcon(page.slug),
      };
    })
    .filter(entry => entry.title)
    .sort((a, b) => a.path.localeCompare(b.path));
}

function clean(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function words(value: string) {
  return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
}

/** True when every query word starts some word in `target`. */
function prefixMatch(queryWords: readonly string[], targetWords: readonly string[]) {
  return queryWords.every(query => targetWords.some(word => word.startsWith(query)));
}

/**
 * Case-insensitive word-prefix search. Every query word must start a word in
 * the title or description. Title matches rank above description matches;
 * within each, a title that starts with the query and a shorter title rank first.
 */
export function searchSiteEntries(entries: readonly SiteSearchEntry[], query: string, limit = 20) {
  const queryWords = words(query);
  if (!queryWords.length) return [];
  const phrase = queryWords.join(" ");
  const scored: { entry: SiteSearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const titleWords = words(entry.title);
    let score: number;
    if (prefixMatch(queryWords, titleWords)) {
      score = titleWords.join(" ").startsWith(phrase) ? 0 : 1;
    } else if (prefixMatch(queryWords, [...titleWords, ...words(entry.description), ...words(entry.path)])) {
      score = 2;
    } else continue;
    scored.push({ entry, score });
  }
  return scored
    .sort((a, b) => a.score - b.score
      || a.entry.title.length - b.entry.title.length
      || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map(item => item.entry);
}

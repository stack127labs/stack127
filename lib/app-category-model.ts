/** A category page needs at least this many published apps. */
export const MIN_CATEGORY_APPS = 15;
export type AppDirectory = "self-host-apps" | "cli-apps";
export type AppCategoryCount = { slug: string; name: string; count: number };
export type AppCategoryLink = AppCategoryCount & { href: string };

export function countAppCategories<T>(apps: readonly T[], categories: readonly { slug: string; name: string }[], slugs: (app: T) => readonly string[]): AppCategoryCount[] {
  const counts = new Map<string, number>();
  for (const app of apps) for (const slug of new Set(slugs(app))) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  return categories.map(category => ({ slug: category.slug, name: category.name, count: counts.get(category.slug) ?? 0 }));
}

/** Only exact, published registry children with enough records can have links or build params. */
export function publishedAppCategories(directory: AppDirectory, categories: readonly AppCategoryCount[], pages: readonly { slug: string; is_published: boolean; page_family: string }[]): AppCategoryLink[] {
  const published = new Set(pages.filter(page => page.is_published && page.page_family === "directory").map(page => page.slug));
  return categories.filter(category => category.count >= MIN_CATEGORY_APPS && published.has(`${directory}/categories/${category.slug}`))
    .map(category => ({ ...category, href: `/${directory}/categories/${category.slug}` }));
}

export function appCategoryStaticParams(categories: readonly AppCategoryLink[]) {
  return categories.map(category => ({ category: category.slug }));
}

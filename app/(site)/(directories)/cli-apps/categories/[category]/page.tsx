import { notFound } from "next/navigation";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAppCategoryLinks } from "@/lib/app-categories";
import { appCategoryStaticParams, selectCategoryApps, MIN_CATEGORY_APPS } from "@/lib/app-category-model";
import { getTerminalApps, terminalAppTypeLabels } from "@/lib/terminal-apps";
import { AppCategoryPage } from "@/app/ui/directories/app-category-page";
import { categoryIntros } from "./content";

export const revalidate = false;
export async function generateStaticParams() {
  return appCategoryStaticParams(await getAppCategoryLinks("cli-apps"));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const directoryPage = await getRequiredDirectoryPage(`cli-apps/categories/${category}`);
  const categories = await getAppCategoryLinks("cli-apps");
  if (!categories.some(entry => entry.slug === category)) notFound();
  const Intro = categoryIntros[category];
  if (!Intro) throw new Error(`Missing CLI category intro: ${category}`);
  const apps = selectCategoryApps(await getTerminalApps(), category, app => app.categories, app => app.stars ?? 0);
  if (apps.length < MIN_CATEGORY_APPS) notFound();
  return <AppCategoryPage directory="cli-apps" category={category} directoryPage={directoryPage}
    intro={<Intro />} categories={categories} apps={apps.map(app => ({
      name: app.name, summary: app.summary, href: app.repository_url || app.website_url,
      facts: [terminalAppTypeLabels.get(app.primary_type) ?? app.primary_type, app.language || "Language unknown",
        app.license || "License unknown", app.platforms.length ? app.platforms.join(", ") : "Platforms unknown"].join(" · "),
    }))} />;
}

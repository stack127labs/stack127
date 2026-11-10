import { notFound } from "next/navigation";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAppCategoryLinks, getSelfHostCategoryApps } from "@/lib/app-categories";
import { appCategoryStaticParams, MIN_CATEGORY_APPS } from "@/lib/app-category-model";
import { AppCategoryPage } from "@/app/ui/directories/app-category-page";
import { categoryIntros } from "./content";

export const revalidate = false;
export async function generateStaticParams() {
  return appCategoryStaticParams(await getAppCategoryLinks("self-host-apps"));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const directoryPage = await getRequiredDirectoryPage(`self-host-apps/categories/${category}`);
  const categories = await getAppCategoryLinks("self-host-apps");
  if (!categories.some(entry => entry.slug === category)) notFound();
  const Intro = categoryIntros[category];
  if (!Intro) throw new Error(`Missing self-host category intro: ${category}`);
  const apps = await getSelfHostCategoryApps(category);
  if (apps.length < MIN_CATEGORY_APPS) notFound();
  return <AppCategoryPage directory="self-host-apps" category={category} directoryPage={directoryPage}
    intro={<Intro />} categories={categories} apps={apps.map(app => ({
      name: app.name, summary: app.summary, href: app.href,
      facts: [app.license || app.source_model.replaceAll("_", " "), app.maintenance_status,
        `Docker: ${app.docker_support.replaceAll("_", " ")}`,
        ...(app.ram_min_mb !== null ? [`Minimum RAM: ${app.ram_min_mb} MB`] : [])].join(" · "),
    }))} />;
}

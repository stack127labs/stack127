import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { indieCategories, type IndieApp, type IndieAppCard, type IndieCategoryData } from "./model";

export * from "./model";

// Page data is generated from the research files by scripts/indie-hacker-apps/build-data.mjs
// and ships with the release, like the hardware directories.
const dataPromises = new Map<string, Promise<IndieCategoryData>>();

export function getIndieCategoryData(slug: string): Promise<IndieCategoryData> {
  if (!indieCategories.some((category) => category.slug === slug)) {
    throw new Error(`Unknown indie hacker apps category: ${slug}`);
  }
  let data = dataPromises.get(slug);
  if (!data) {
    const file = path.join(process.cwd(), "lib/indie-hacker-apps/data", `${slug}.json`);
    data = readFile(file, "utf8").then((text) => JSON.parse(text) as IndieCategoryData);
    dataPromises.set(slug, data);
    data.catch(() => dataPromises.delete(slug));
  }
  return data;
}

export async function getIndieApp(categorySlug: string, appSlug: string): Promise<IndieApp | undefined> {
  return (await getIndieCategoryData(categorySlug)).apps.find((app) => app.slug === appSlug);
}

/** The card fields only, for the browser index. Panel facts load per app. */
export function indieAppCard(app: IndieApp): IndieAppCard {
  return {
    slug: app.slug,
    name: app.name,
    url: app.url,
    jobs: app.jobs,
    line: app.line,
    free: app.free,
    cells: app.cells,
    costs: app.costs,
    status: app.status,
    checked: app.checked,
    icon: app.icon ?? "",
  };
}

export async function getIndieAppCards(categorySlug: string) {
  return (await getIndieCategoryData(categorySlug)).apps.map(indieAppCard);
}

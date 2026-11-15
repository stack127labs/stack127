import { NextResponse } from "next/server";
import { getIndieApp, getIndieCategoryData, indieCategories } from "@/lib/indie-hacker-apps";
import { getPublishedPage } from "@/lib/page-registry";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  const params: Array<{ category: string; app: string }> = [];
  for (const category of indieCategories) {
    for (const app of (await getIndieCategoryData(category.slug)).apps) params.push({ category: category.slug, app: app.slug });
  }
  return params;
}

// One app's full panel: every fact with its source and checked date.
export async function GET(_request: Request, { params }: { params: Promise<{ category: string; app: string }> }) {
  const { category, app: appSlug } = await params;
  const slug = `indie-hacker-apps/${category}`;
  const app = indieCategories.some((item) => item.slug === category) ? await getIndieApp(category, appSlug) : undefined;
  if (!app || !await getPublishedPage(slug)) {
    return NextResponse.json({ error: "App not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(app, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=31536000",
      "Cache-Tag": `stack127-public,page:indie-hacker-apps:${category},page:api:indie-hacker-apps:${category}`,
    },
  });
}

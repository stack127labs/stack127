import { NextResponse } from "next/server";
import { getIndieAppCards, indieCategories } from "@/lib/indie-hacker-apps";
import { getPublishedPage } from "@/lib/page-registry";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return indieCategories.map((category) => ({ category: category.slug }));
}

// The card list for one category. The page loads it when a filter, size, or page is set.
export async function GET(_request: Request, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const slug = `indie-hacker-apps/${category}`;
  if (!indieCategories.some((item) => item.slug === category) || !await getPublishedPage(slug)) {
    return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(await getIndieAppCards(category), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=31536000",
      "Cache-Tag": `stack127-public,page:indie-hacker-apps:${category},page:api:indie-hacker-apps:${category}`,
    },
  });
}

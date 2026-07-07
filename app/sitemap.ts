import type { MetadataRoute } from "next";
import { getPublishedSitemapPages, pathFromSlug } from "@/lib/page-registry";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPublishedSitemapPages();

  return pages.map((page) => ({
    changeFrequency: "weekly",
    lastModified: new Date(page.updated_at).toISOString(),
    priority: Number(page.sitemap_priority),
    url: absoluteUrl(pathFromSlug(page.slug)),
  }));
}

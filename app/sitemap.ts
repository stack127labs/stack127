import type { MetadataRoute } from "next";
import { getSelfHostAppsModifiedAt } from "@/lib/apps";
import { absoluteUrl, latestIsoDate, pageDates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let selfHostModifiedAt: Date | null = null;

  try {
    selfHostModifiedAt = await getSelfHostAppsModifiedAt();
  } catch {
    selfHostModifiedAt = null;
  }

  return [
    {
      changeFrequency: "weekly",
      lastModified: latestIsoDate(pageDates.home.updated, selfHostModifiedAt),
      priority: 1,
      url: absoluteUrl("/"),
    },
    {
      changeFrequency: "daily",
      lastModified: latestIsoDate(pageDates.selfHostApps.updated, selfHostModifiedAt),
      priority: 0.9,
      url: absoluteUrl("/self-host-apps"),
    },
    {
      changeFrequency: "monthly",
      lastModified: pageDates.about.updated,
      priority: 0.5,
      url: absoluteUrl("/about"),
    },
    {
      changeFrequency: "yearly",
      lastModified: pageDates.privacy.updated,
      priority: 0.3,
      url: absoluteUrl("/privacy"),
    },
    {
      changeFrequency: "yearly",
      lastModified: pageDates.terms.updated,
      priority: 0.3,
      url: absoluteUrl("/terms"),
    },
  ];
}

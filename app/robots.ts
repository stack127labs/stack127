import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: "/api/",
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

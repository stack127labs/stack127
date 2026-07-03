export const siteName = "version127";
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://version127.com");
export const defaultDescription = "Find useful technical tools, references, and directories.";

export const pageDates = {
  about: {
    published: "2026-07-02T00:00:00.000Z",
    updated: "2026-07-02T00:00:00.000Z",
  },
  home: {
    published: "2026-07-03T00:00:00.000Z",
    updated: "2026-07-03T00:00:00.000Z",
  },
  privacy: {
    published: "2026-07-02T00:00:00.000Z",
    updated: "2026-07-02T00:00:00.000Z",
  },
  selfHostApps: {
    published: "2026-07-03T00:00:00.000Z",
    updated: "2026-07-03T00:00:00.000Z",
  },
  terms: {
    published: "2026-07-02T00:00:00.000Z",
    updated: "2026-07-02T00:00:00.000Z",
  },
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function latestIsoDate(...values: Array<Date | string | null | undefined>) {
  const dates = values
    .filter((value): value is Date | string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => Number.isFinite(date.getTime()));

  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}

export function hasPublicQueryParams(params: Record<string, string | string[] | undefined>) {
  return Object.values(params).some((value) => {
    if (Array.isArray(value)) {
      return value.some((entry) => entry.trim() !== "");
    }

    return typeof value === "string" && value.trim() !== "";
  });
}

export function buildWebPageStructuredData({
  dateModified,
  datePublished,
  description,
  name,
  path,
  type = "WebPage",
}: {
  dateModified: Date | string;
  datePublished: Date | string;
  description: string;
  name: string;
  path: string;
  type?: "AboutPage" | "CollectionPage" | "PrivacyPolicy" | "TermsOfService" | "WebPage";
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    dateModified: new Date(dateModified).toISOString(),
    datePublished: new Date(datePublished).toISOString(),
    description,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
    },
    name,
    url: absoluteUrl(path),
  };
}

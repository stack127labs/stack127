export const siteName = "stack127";
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://stack127.com");
export const defaultDescription = "Free tools, calculators, directories, and reference data for indie hackers, solo developers, and digital creators who build and run projects online.";

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

export function buildBreadcrumbStructuredData(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

// Site-wide WebSite and Organization data. Registry layouts emit it only on indexable pages.
export const siteStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: defaultDescription,
    name: siteName,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
    },
    url: absoluteUrl("/"),
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    email: "stack127@proton.me",
    logo: absoluteUrl("/android-chrome-512x512.png"),
    name: siteName,
    url: absoluteUrl("/"),
  },
];

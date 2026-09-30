import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPool } from "./db";
import { readPublicData, selectPublicRows } from "./public-data-api";
import { absoluteUrl, siteName, siteUrl } from "./seo";
import { homePageSlugs } from "./page-registry-helpers";

export type Stack127Page = {
  id: number | string;
  slug: string;
  page_family: "tool" | "catalog" | "course" | "info" | "legal";
  /** Compact UI label for sidebars, home cards, and other chrome. */
  label: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  row_created_at: Date | string;
  published_at: Date | string;
  updated_at: Date | string;
  row_updated_at: Date | string;
  cover_image_url: string | null;
  page_type: string;
  sitemap_priority: number | string;
};

export {
  isHomeFeaturePage,
  isHomePageSlug,
  isHomeVisiblePage,
  isMainPageSlug,
} from "./page-registry-helpers";

// Keep flat routes live while the registry migration and application release
// roll out independently. Remove this compatibility map after production has
// been verified on the flat slugs.
const legacyToolSlugByFlatSlug = new Map<string, string>([
  ...[
    "caa-checker",
    "dns-change-checker",
    "dns-lookup",
    "dns-trace",
    "dnssec-checker",
    "nameserver-checker",
    "soa-checker",
  ].map((slug) => [slug, `dns-tools/${slug}`] as const),
  ...[
    "domain-age",
    "domain-availability",
    "domain-expiry",
    "domain-lookup",
    "domain-owner",
    "domain-registrar",
    "domain-report",
    "epp-status-codes",
    "multi-tld-availability",
    "punycode-converter",
    "tld-directory",
    "transfer-readiness",
  ].map((slug) => [slug, `domain-tools/${slug}`] as const),
]);

const flatToolSlugByLegacySlug = new Map(
  [...legacyToolSlugByFlatSlug].map(([flat, legacy]) => [legacy, flat]),
);

export type PagePublicationState =
  | {
      kind: "exact";
      index: boolean;
      page: Stack127Page;
      pathname: string;
      slug: string;
    }
  | {
      kind: "child";
      index: false;
      page: Stack127Page;
      parentSlug: string;
      pathname: string;
      slug: string;
    }
  | {
      kind: "missing";
      pathname: string;
      slug: string;
    };

const publishedPageSelect = `
  select
    id,
    slug,
    page_family,
    label,
    meta_title,
    meta_description,
    is_published,
    row_created_at,
    published_at,
    updated_at,
    row_updated_at,
    cover_image_url,
    page_type,
    sitemap_priority
  from public.stack127_pages
  where is_published = true
`;

const publishedPageColumns = [
  "id",
  "slug",
  "page_family",
  "label",
  "meta_title",
  "meta_description",
  "is_published",
  "row_created_at",
  "published_at",
  "updated_at",
  "row_updated_at",
  "cover_image_url",
  "page_type",
  "sitemap_priority",
].join(",");

async function queryPublishedPage(slug: string) {
  return readPublicData<Stack127Page | null>({
    dataApiRead: async () => {
      const rows = await selectPublicRows<Stack127Page>("stack127_pages", {
        is_published: "eq.true",
        limit: "1",
        select: publishedPageColumns,
        slug: `eq.${slug}`,
      });
      return rows[0] ?? null;
    },
    postgresRead: async () => {
      const result = await getPool().query<Stack127Page>(
        `${publishedPageSelect} and slug = $1 limit 1`,
        [slug],
      );
      return result.rows[0] ?? null;
    },
  });
}

function cachedPublishedPage(slug: string) {
  return unstable_cache(() => queryPublishedPage(slug), ["stack127-published-page", slug], {
    revalidate: 604800,
    tags: [`stack127-page:${slug || "home"}`],
  })();
}

function cleanPathname(pathname: string) {
  const pathOnly = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
}

export function slugFromPathname(pathname: string) {
  const cleaned = cleanPathname(pathname);
  return cleaned === "/" ? "" : decodeURIComponent(cleaned.slice(1));
}

export function pathFromSlug(slug: string) {
  return slug ? `/${slug}` : "/";
}

function ancestorSlugs(slug: string) {
  const parts = slug.split("/").filter(Boolean);
  const ancestors: string[] = [];

  for (let index = parts.length - 1; index > 0; index -= 1) {
    ancestors.push(parts.slice(0, index).join("/"));
  }

  return ancestors;
}

export const getPublishedPage = cache(async (slug: string) => {
  const page = await cachedPublishedPage(slug);
  if (page) return page;

  const legacySlug = legacyToolSlugByFlatSlug.get(slug);
  if (!legacySlug) return null;

  const legacyPage = await cachedPublishedPage(legacySlug);

  return legacyPage ? { ...legacyPage, slug } : null;
});

export const getRequiredPublishedPage = cache(async (slug: string) => {
  const page = await getPublishedPage(slug);

  if (!page) {
    notFound();
  }

  return page;
});

export const getPagePublicationState = cache(
  async (pathname: string, hasQueryParams = false): Promise<PagePublicationState> => {
    const cleanedPathname = cleanPathname(pathname);
    const slug = slugFromPathname(cleanedPathname);
    const exact = await getPublishedPage(slug);

    if (exact) {
      return {
        kind: "exact",
        index: !hasQueryParams,
        page: exact,
        pathname: cleanedPathname,
        slug,
      };
    }

    for (const parentSlug of ancestorSlugs(slug)) {
      const parent = await getPublishedPage(parentSlug);

      if (parent) {
        return {
          kind: "child",
          index: false,
          page: parent,
          parentSlug,
          pathname: cleanedPathname,
          slug,
        };
      }
    }

    return {
      kind: "missing",
      pathname: cleanedPathname,
      slug,
    };
  },
);

export const getPublishedSitemapPages = cache(unstable_cache(async () => {
  const rows = await readPublicData<Stack127Page[]>({
    dataApiRead: () => selectPublicRows<Stack127Page>("stack127_pages", {
      is_published: "eq.true",
      order: "slug.asc",
      select: publishedPageColumns,
    }),
    postgresRead: async () => {
      const result = await getPool().query<Stack127Page>(
        `${publishedPageSelect} order by slug asc`,
      );
      return result.rows;
    },
  });

  const pagesBySlug = new Map<string, Stack127Page>();

  for (const page of rows) {
    const slug = flatToolSlugByLegacySlug.get(page.slug) ?? page.slug;
    const normalizedPage = { ...page, slug };
    const currentPage = pagesBySlug.get(slug);

    // Prefer an already-migrated canonical row if both rollout states exist.
    if (!currentPage || page.slug === slug) {
      pagesBySlug.set(slug, normalizedPage);
    }
  }

  return [...pagesBySlug.values()].sort((left, right) =>
    left.slug.localeCompare(right.slug),
  );
}, ["stack127-sitemap-pages"], { revalidate: 3600, tags: ["stack127-sitemap-pages"] }));

/**
 * Curated published pages for site-wide home navigation. URL depth is not
 * navigation metadata because tool pages intentionally use flat routes.
 */
export const getMainPublishedPages = cache(unstable_cache(async () => {
  return readPublicData<Stack127Page[]>({
    dataApiRead: () => selectPublicRows<Stack127Page>("stack127_pages", {
      is_published: "eq.true",
      order: "sitemap_priority.desc,label.asc",
      select: publishedPageColumns,
      slug: `in.(${homePageSlugs.join(",")})`,
    }),
    postgresRead: async () => {
      const result = await getPool().query<Stack127Page>(
        `
          ${publishedPageSelect}
            and slug = any($1::text[])
          order by sitemap_priority desc, label asc
        `,
        [homePageSlugs],
      );
      return result.rows;
    },
  });
}, ["stack127-home-pages"], { revalidate: 86400, tags: ["stack127-home-pages"] }));

export function buildRegistryMetadata(state: PagePublicationState): Metadata {
  if (state.kind === "missing") {
    return {
      metadataBase: siteUrl,
      robots: {
        follow: false,
        index: false,
      },
      title: "Not found",
    };
  }

  const canonicalPath = state.kind === "child"
    ? pathFromSlug(state.parentSlug)
    : pathFromSlug(state.page.slug);
  const image = state.page.cover_image_url ?? "/android-chrome-512x512.png";

  return {
    metadataBase: siteUrl,
    applicationName: siteName,
    alternates: {
      canonical: canonicalPath,
    },
    description: state.page.meta_description,
    openGraph: {
      description: state.page.meta_description,
      images: [
        {
          alt: state.page.meta_title,
          url: image,
        },
      ],
      siteName,
      title: state.page.meta_title,
      type: "website",
      url: canonicalPath,
    },
    robots: {
      follow: true,
      index: state.index,
    },
    title: state.page.meta_title,
    other: { "stack127-content-revision": new Date(state.page.row_updated_at).toISOString() },
    twitter: {
      card: "summary",
      description: state.page.meta_description,
      images: [image],
      title: state.page.meta_title,
    },
  };
}

export function buildRegistryPageStructuredData(state: PagePublicationState) {
  if (state.kind !== "exact" || !state.index) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": state.page.page_type,
    dateModified: new Date(state.page.updated_at).toISOString(),
    datePublished: new Date(state.page.published_at).toISOString(),
    description: state.page.meta_description,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
    },
    name: state.page.meta_title,
    url: absoluteUrl(pathFromSlug(state.page.slug)),
  };
}

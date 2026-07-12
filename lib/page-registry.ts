import type { Metadata } from "next";
import { cache } from "react";
import { getPool } from "./db";
import { absoluteUrl, siteName, siteUrl } from "./seo";

export type Version127Page = {
  slug: string;
  /** Compact UI label for sidebars, home cards, and other chrome. */
  label: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  created_at: Date | string;
  published_at: Date | string | null;
  updated_at: Date | string;
  cover_image_url: string | null;
  page_type: string;
  sitemap_priority: number | string;
};

export { isHomeFeaturePage, isMainPageSlug } from "./page-registry-helpers";

export type PagePublicationState =
  | {
      kind: "exact";
      index: boolean;
      page: Version127Page;
      pathname: string;
      slug: string;
    }
  | {
      kind: "child";
      index: false;
      page: Version127Page;
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
    slug,
    label,
    meta_title,
    meta_description,
    is_published,
    created_at,
    published_at,
    updated_at,
    cover_image_url,
    page_type,
    sitemap_priority
  from public.version127_pages
  where is_published = true
`;

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
  const result = await getPool().query<Version127Page>(
    `${publishedPageSelect} and slug = $1 limit 1`,
    [slug],
  );

  return result.rows[0] ?? null;
});

export const getRequiredPublishedPage = cache(async (slug: string) => {
  const page = await getPublishedPage(slug);

  if (!page) {
    throw new Error(`Published page registry row is required for slug "${slug}".`);
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

export const getPublishedSitemapPages = cache(async () => {
  const result = await getPool().query<Version127Page>(
    `${publishedPageSelect} order by slug asc`,
  );

  return result.rows;
});

/**
 * Published root pages for site-wide navigation (home sidebar, etc.).
 * Excludes the home row and any child route (slug contains `/`).
 */
export const getMainPublishedPages = cache(async () => {
  const result = await getPool().query<Version127Page>(
    `
      ${publishedPageSelect}
        and slug <> ''
        and position('/' in slug) = 0
      order by sitemap_priority desc, label asc
    `,
  );

  return result.rows;
});

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
    datePublished: new Date(state.page.published_at ?? state.page.created_at).toISOString(),
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

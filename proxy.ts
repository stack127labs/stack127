import { NextResponse, type NextRequest } from "next/server";
import { getExactPublishedPage, slugFromPathname } from "@/lib/page-registry";
import { getPublishedToolCatalog } from "@/lib/tool-catalogs";
import { getPublishedToolPage } from "@/lib/tool-pages";
import { getPublishedDirectoryPage } from "@/lib/directory-pages";
import { sitePageAvailable } from "@/lib/page-source";
import { absoluteUrl } from "@/lib/seo";
import { queryNeedsNoindex } from "@/lib/seo/query-indexing.mjs";

import { isPrivateApiPath, isCanonicalPrivateApiPath } from "./lib/data-api/path-policy.mjs";
import { notFoundResponse } from "./lib/data-api/private-response.mjs";

function isPublicApiPath(pathname: string) {
  return /^\/api\/(?:ad-networks(?:\/|$)|cache(?:\/|$)|cli-apps(?:\/|$)|dns(?:\/|$)|domain(?:\/|$)|self-host-apps(?:\/|$)|shortcuts(?:\/|$)|resource-planner-app(?:\/|$)|resource-planner-index(?:\/|$)|ip-asn-lookup(?:\/|$)|health(?:\/|$))/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  // Only private namespaces bypass the existing public API cache/SEO policy.
  // Reject noncanonical spellings that reach the proxy. Next may normalize
  // repeated/backslashes or redirect trailing slashes before this runs.
  if (isPrivateApiPath(request.url ?? pathname)) {
    if (!isCanonicalPrivateApiPath(request.url ?? pathname)) return notFoundResponse();
    headers.delete("x-stack127-pathname");
    return request.headers.has("x-stack127-pathname")
      ? NextResponse.next({ request: { headers } }) : NextResponse.next();
  }
  if ((pathname === "/api" || pathname.startsWith("/api/")) && !isPublicApiPath(pathname)) {
    return notFoundResponse();
  }
  const userQuery = new URLSearchParams(request.nextUrl.search);
  userQuery.delete("_rsc");
  const withQueryIndexing = (response: NextResponse) => {
    if (request.nextUrl.search) {
      if (queryNeedsNoindex(request.nextUrl.search)) {
        response.headers.set("X-Robots-Tag", "noindex, follow");
      }
      response.headers.append("Link", `<${absoluteUrl(pathname)}>; rel="canonical"`);
    }
    return response;
  };

  // Analytics collection is an API endpoint, not a published page.
  if (pathname === "/vitals/api/send") {
    return withQueryIndexing(NextResponse.next());
  }

  if (!pathname.startsWith("/api/") && pathname !== "/sitemap.xml" && pathname !== "/robots.txt" && pathname !== "/publication-not-found" &&
    !(process.env.NODE_ENV === "development" && (pathname === "/components-ui" || pathname.startsWith("/components-ui/")))) {
    const published = await getExactPublishedPage(slugFromPathname(pathname));
    // The fallback route renders tool catalogs. Other published records still
    // need a compiled page; a registry row alone cannot create that route.
    const contentAvailable = published && sitePageAvailable(pathname, {
      is_published: true, page_family: published.page_family,
      has_page_content: published.page_family === "tool" ? Boolean(await getPublishedToolPage(published.slug))
        : published.page_family === "directory" ? Boolean(await getPublishedDirectoryPage(published.slug))
        : published.page_family === "catalog" ? Boolean(await getPublishedToolCatalog(published.slug)) : true,
    });
    if (!contentAvailable) {
      const target = request.nextUrl.clone();
      target.pathname = "/publication-not-found";
      const missing = NextResponse.rewrite(target, { status: 404 });
      missing.headers.set("Cache-Control", "no-store");
      return withQueryIndexing(missing);
    }
  }

  headers.set("x-stack127-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers,
    },
  });
  const slug = pathname.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "-").replaceAll("/", ":") || "home";
  const tags = ["stack127-public", `page:${slug}`];
  if (pathname === "/") tags.push("home");
  if (pathname === "/sitemap.xml") tags.push("sitemap");
  if (pathname.startsWith("/self-host-apps/categories/") || pathname === "/self-host-apps" || pathname === "/self-hosted-app-resource-planner" || pathname === "/api/resource-planner-index" || pathname === "/api/self-host-apps/search") tags.push("self-host-catalog");
  if ((pathname.startsWith("/api/self-host-apps/") && pathname !== "/api/self-host-apps/search") || pathname.startsWith("/api/resource-planner-app/")) tags.push("self-host-detail");
  if (pathname.startsWith("/cli-apps/categories/") || pathname === "/cli-apps" || pathname === "/api/cli-apps/index") tags.push("cli-apps-catalog");
  if (pathname === "/platform-fees" || pathname.startsWith("/platform-fees/")) tags.push("platform-fees-catalog");
  if (pathname === "/ad-networks" || pathname.startsWith("/ad-networks/") || pathname.startsWith("/api/ad-networks/") || pathname === "/ad-network-checker") tags.push("ad-networks-catalog");
  if (pathname === "/keyboard-shortcuts" || pathname.startsWith("/keyboard-shortcuts/")) tags.push("keyboard-shortcuts-catalog");
  response.headers.set("Cache-Tag", tags.join(","));
  const filterQuery = new URLSearchParams(userQuery);
  filterQuery.delete("page");
  const directory = new Set(["self-host-apps", "cli-apps", "launch-directories"]);
  response.headers.set("X-Stack127-Cache-Class", pathname === "/sitemap.xml" ? "sitemap" : filterQuery.size ? "filters" : pathname === "/" || directory.has(pathname.slice(1)) ? "directory" : "content");
  return withQueryIndexing(response);
}

export const config = {
  matcher: [
    "/api/mcp/:path*",
    "/api/v1/:path*",
    "/sitemap.xml",
    "/robots.txt",
    "/((?!_next/static|_next/image|favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|logos|app-icons|.*\\..*).*)",
  ],
};

import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  const userQuery = new URLSearchParams(request.nextUrl.search);
  userQuery.delete("_rsc");

  headers.set("x-stack127-pathname", pathname);
  headers.set("x-stack127-has-query", userQuery.size ? "1" : "0");

  const response = NextResponse.next({
    request: {
      headers,
    },
  });
  const slug = pathname.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "-").replaceAll("/", ":") || "home";
  const tags = ["stack127-public", `page:${slug}`];
  if (pathname === "/") tags.push("home");
  if (pathname === "/sitemap.xml") tags.push("sitemap");
  if (pathname === "/self-host-apps" || pathname === "/self-hosted-app-resource-planner" || pathname === "/api/resource-planner-index") tags.push("self-host-catalog");
  if (pathname.startsWith("/api/self-host-apps/") || pathname.startsWith("/api/resource-planner-app/")) tags.push("self-host-detail");
  response.headers.set("Cache-Tag", tags.join(","));
  const filterQuery = new URLSearchParams(userQuery);
  filterQuery.delete("page");
  const directory = new Set(["self-host-apps", "cli-apps", "zigbee-devices", "zigbee-coordinators", "matter-devices", "z-wave-devices", "nut-compatible-ups", "local-security-cameras"]);
  response.headers.set("X-Stack127-Cache-Class", pathname === "/sitemap.xml" ? "sitemap" : filterQuery.size ? "filters" : pathname === "/" || directory.has(pathname.slice(1)) ? "directory" : "content");
  if (userQuery.size && !pathname.startsWith("/api/")) response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

export const config = {
  matcher: [
    "/sitemap.xml",
    "/robots.txt",
    "/((?!_next/static|_next/image|favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|logos|app-icons|.*\\..*).*)",
  ],
};

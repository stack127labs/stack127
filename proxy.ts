import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;

  headers.set("x-stack127-pathname", pathname);
  headers.set("x-stack127-has-query", request.nextUrl.search ? "1" : "0");

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
  return response;
}

export const config = {
  matcher: [
    "/sitemap.xml",
    "/((?!_next/static|_next/image|favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|logos|app-icons|.*\\..*).*)",
  ],
};

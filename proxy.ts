import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  headers.set("x-version127-pathname", request.nextUrl.pathname);
  headers.set("x-version127-has-query", request.nextUrl.search ? "1" : "0");

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|logos|app-icons|.*\\..*).*)",
  ],
};

import { getUmamiUpstreamUrls } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = getUmamiUpstreamUrls();

  if (!upstream) {
    return new Response("Analytics is not configured.", { status: 503 });
  }

  try {
    const response = await fetch(upstream.scriptUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/javascript",
      },
    });

    if (!response.ok) {
      return new Response("Analytics client is unavailable.", { status: 502 });
    }

    return new Response(response.body, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": response.headers.get("content-type") ?? "application/javascript; charset=utf-8",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
      status: 200,
    });
  } catch {
    return new Response("Analytics client is unavailable.", { status: 502 });
  }
}

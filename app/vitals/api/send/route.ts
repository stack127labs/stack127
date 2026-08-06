import {
  getUmamiUpstreamUrls,
  prepareUmamiEventBody,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

const forwardedHeaders = [
  "accept-language",
  "cf-connecting-ip",
  "referer",
  "user-agent",
  "x-forwarded-for",
  "x-real-ip",
] as const;

export async function POST(request: Request) {
  const upstream = getUmamiUpstreamUrls();

  if (!upstream) {
    return new Response(null, { status: 503 });
  }

  const headers = new Headers({
    "content-type": request.headers.get("content-type") ?? "application/json",
  });

  for (const name of forwardedHeaders) {
    const value = request.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  }

  try {
    const body = prepareUmamiEventBody(await request.text(), request.headers);
    const response = await fetch(upstream.eventUrl, {
      body,
      headers,
      method: "POST",
    });

    return new Response(response.body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
      status: response.status,
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}

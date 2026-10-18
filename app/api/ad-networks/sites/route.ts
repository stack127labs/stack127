import { NextResponse } from "next/server";
import { getAdNetworkSites } from "@/lib/ad-networks";
import { getPublishedPage } from "@/lib/page-registry";
import { AdNetworkInputError, parseAdNetworkSitesParams } from "../input";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const noStore = { "Cache-Control": "no-store" };
  try {
    const query = parseAdNetworkSitesParams(new URL(request.url).searchParams);
    if (!await getPublishedPage("ad-networks") || (query.network && !await getPublishedPage(`ad-networks/${query.network}`))
      || (query.niche && !await getPublishedPage(`ad-networks/niches/${query.niche}`))) {
      return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: noStore });
    }
    const result = await getAdNetworkSites(query);
    return NextResponse.json(result, { headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=604800",
      "Cache-Tag": "stack127-public,ad-networks-catalog", "X-Robots-Tag": "noindex, follow",
    } });
  } catch (error) {
    if (error instanceof AdNetworkInputError) return NextResponse.json({ error: error.message }, { status: 400, headers: noStore });
    console.error("Ad-network sites failed", error);
    return NextResponse.json({ error: "Could not load sites." }, { status: 503, headers: noStore });
  }
}

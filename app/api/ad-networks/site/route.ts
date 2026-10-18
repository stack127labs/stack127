import { NextResponse } from "next/server";
import { getAdNetworkCheckerSite } from "@/lib/ad-networks";
import { getPublishedPage } from "@/lib/page-registry";
import { AdNetworkInputError, parseAdNetworkSiteParams } from "../input";
import type { AdNetworkSiteResponse } from "@/lib/ad-networks-types";

export const dynamic = "force-dynamic";
/** Lookup only: unknown domains never trigger a network request or a database write. */
export async function GET(request: Request) {
  const noStore = { "Cache-Control": "no-store" };
  try {
    const domain = parseAdNetworkSiteParams(new URL(request.url).searchParams);
    if (!await getPublishedPage("ad-network-checker")) {
      return NextResponse.json({ error: "Tool not found." }, { status: 404, headers: noStore });
    }
    const site = await getAdNetworkCheckerSite(domain);
    const result: AdNetworkSiteResponse = { domain, found: site !== null, site };
    return NextResponse.json(result, { headers: site ? {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=604800",
      "Cache-Tag": "stack127-public,ad-networks-catalog", "X-Robots-Tag": "noindex, follow",
    } : noStore });
  } catch (error) {
    if (error instanceof AdNetworkInputError) return NextResponse.json({ error: error.message }, { status: 400, headers: noStore });
    console.error("Ad-network checker failed", error);
    return NextResponse.json({ error: "Could not load this site." }, { status: 503, headers: noStore });
  }
}

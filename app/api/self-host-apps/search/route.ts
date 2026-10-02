import { NextResponse } from "next/server";
import { getSelfHostAppsSearch } from "@/lib/self-host-apps-search-data";
import { getPublishedPage } from "@/lib/page-registry";
import {
  parseSelfHostAppsSearchParams, SelfHostAppsSearchInputError,
} from "@/lib/self-host-apps-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const noStore = { "Cache-Control": "no-store" };
  try {
    const params = parseSelfHostAppsSearchParams(new URL(request.url).searchParams);
    if (!await getPublishedPage("self-host-apps")) {
      return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: noStore });
    }
    const response = await getSelfHostAppsSearch(params);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=604800", "Cache-Tag": "stack127-public,page:api:self-host-apps:search,self-host-catalog" },
    });
  } catch (error) {
    if (error instanceof SelfHostAppsSearchInputError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: noStore });
    }
    console.error("Self-host apps search failed", error);
    return NextResponse.json({ error: "Could not load apps." }, { status: 503, headers: noStore });
  }
}

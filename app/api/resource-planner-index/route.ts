import { NextResponse } from "next/server";
import { getSelfHostedAppResourcePlannerIndex } from "@/lib/self-hosted-app-resource-planner/data";
import { getPublishedPage } from "@/lib/page-registry";

export async function GET(request: Request) {
  const page = await getPublishedPage("self-hosted-app-resource-planner");
  if (!page) return NextResponse.json({ error: "Tool not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (query.length < 2 || query.length > 80) {
    return NextResponse.json({ error: "Search needs 2 to 80 characters." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(await getSelfHostedAppResourcePlannerIndex(query), {
    headers: { "Cache-Control": "public, max-age=600, s-maxage=86400" },
  });
}

import { NextResponse } from "next/server";
import { getSelfHostedAppResourcePlannerIndex } from "@/lib/self-hosted-app-resource-planner/data";
import { getPublishedPage } from "@/lib/page-registry";

export async function GET() {
  const page = await getPublishedPage("self-hosted-app-resource-planner");
  if (!page) return NextResponse.json({ error: "Tool not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(await getSelfHostedAppResourcePlannerIndex(), {
    headers: { "Cache-Control": "public, max-age=600, s-maxage=86400" },
  });
}

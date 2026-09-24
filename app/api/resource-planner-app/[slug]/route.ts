import { NextResponse } from "next/server";
import { getSelfHostedAppResourcePlannerEntry } from "@/lib/self-hosted-app-resource-planner/data";
import { getPublishedPage } from "@/lib/page-registry";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!await getPublishedPage("self-hosted-app-resource-planner")) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const { slug } = await params;
  const app = await getSelfHostedAppResourcePlannerEntry(slug);
  if (!app) return NextResponse.json({ error: "App not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(app, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}

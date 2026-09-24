import { NextResponse } from "next/server";
import { getDirectoryAppsBySlugs } from "@/lib/apps";
import { getPublishedPage } from "@/lib/page-registry";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!await getPublishedPage("self-host-apps")) {
    return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const { slug } = await params;
  const [app] = await getDirectoryAppsBySlugs([slug]);
  if (!app) return NextResponse.json({ error: "App not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(app, { headers: { "Cache-Control": "public, max-age=600, s-maxage=86400" } });
}

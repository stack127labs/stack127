import { NextResponse } from "next/server";
import { loadShortcutApp } from "@/lib/shortcuts";
import { getPublishedPage } from "@/lib/page-registry";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!await getPublishedPage("shortcuts-cheatsheet-generator")) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const { slug } = await params;
  const app = await loadShortcutApp(slug);

  if (!app) {
    return NextResponse.json({ error: "Shortcut app not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(app, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}

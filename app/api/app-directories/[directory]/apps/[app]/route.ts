import { NextResponse } from "next/server";
import { appDirectorySlugs, getAppDirectory, getAppDirectoryApp, listAppDirectoryAppSlugs } from "@/lib/indie-hacker-apps";
import { appDirectoryCacheTags } from "@/lib/indie-hacker-apps/api";
import { getPublishedPage } from "@/lib/page-registry";

export const dynamic = "force-static";
export const revalidate = false;

// Build every app of every published directory. dynamicParams stays on so an app added
// by a later import is served (and cached) without a release.
export async function generateStaticParams() {
  const params: Array<{ directory: string; app: string }> = [];
  for (const directory of appDirectorySlugs) {
    if (!await getPublishedPage(directory)) continue;
    for (const app of await listAppDirectoryAppSlugs(directory)) params.push({ directory, app });
  }
  return params;
}

const notFound = (error: string) => NextResponse.json({ error }, { status: 404, headers: { "Cache-Control": "no-store" } });

// One app's side panel: every fact with its source and checked date, plus its main flag here.
export async function GET(_request: Request, { params }: { params: Promise<{ directory: string; app: string }> }) {
  const { directory, app: appSlug } = await params;
  if (!getAppDirectory(directory) || !await getPublishedPage(directory)) return notFound("Directory not found.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(appSlug)) return notFound("App not found.");
  const app = await getAppDirectoryApp(directory, appSlug);
  if (!app) return notFound("App not found.");
  return NextResponse.json(app, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=31536000",
      "Cache-Tag": appDirectoryCacheTags(directory),
    },
  });
}

import { NextResponse } from "next/server";
import { appDirectorySlugs, getAppDirectory, getAppDirectoryData } from "@/lib/indie-hacker-apps";
import { appDirectoryCacheTags } from "@/lib/indie-hacker-apps/api";
import { getPublishedPage } from "@/lib/page-registry";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return appDirectorySlugs.map((directory) => ({ directory }));
}

// Every card in one directory, with its main flag. The page loads it when a filter, size, or page is set.
export async function GET(_request: Request, { params }: { params: Promise<{ directory: string }> }) {
  const { directory } = await params;
  if (!getAppDirectory(directory) || !await getPublishedPage(directory)) {
    return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const { apps } = await getAppDirectoryData(directory);
  return NextResponse.json(apps, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=31536000",
      "Cache-Tag": appDirectoryCacheTags(directory),
    },
  });
}

import { NextResponse } from "next/server";
import { getPublishedPage } from "@/lib/page-registry";
import { getTerminalApps } from "@/lib/terminal-apps";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  if (!await getPublishedPage("cli-apps")) {
    return NextResponse.json({ error: "Directory not found." }, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json(await getTerminalApps(), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=31536000",
      "Cache-Tag": "stack127-public,page:cli-apps,page:api:cli-apps:index,cli-apps-catalog",
    },
  });
}

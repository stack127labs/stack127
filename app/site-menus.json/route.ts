import { getSiteMenus } from "@/app/ui/site/site-menu-data";

// One prerendered response, shared by every page in both hosting targets.
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return Response.json(await getSiteMenus(), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex",
    },
  });
}

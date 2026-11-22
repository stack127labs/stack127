import { getSiteSearchIndex } from "@/lib/site-search-index";

// Built with the site in both targets: a static file in the Cloudflare
// export, a prerendered response on OVH. Page events refresh it on demand.
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return Response.json(await getSiteSearchIndex(), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex",
    },
  });
}

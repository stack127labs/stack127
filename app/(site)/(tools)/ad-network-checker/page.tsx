import { readdirSync } from "node:fs";
import path from "node:path";
import { ScanSearch } from "lucide-react";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import type { SectionNav } from "@/app/ui/site/section-bar";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AdNetworkCheckerFromUrl } from "./ad-network-checker-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

const SLUG = "ad-network-checker";

/** Every network logo by slug, read once at build time so the browser-side result can show them. */
function networkLogos() {
  const folder = path.join(process.cwd(), "public", "ad-networks", "logos");
  return Object.fromEntries(readdirSync(folder)
    .filter((file) => file.endsWith(".png"))
    .map((file) => [file.slice(0, -4), `/ad-networks/logos/${file}`]));
}

const sectionNav: SectionNav = {
  label: "Ad networks",
  href: "/ad-networks",
  current: `/${SLUG}`,
  items: [
    { label: "Directory", href: "/ad-networks" },
    { label: "Niches", href: "/ad-networks/niches" },
    { label: "Stats", href: "/ad-networks/stats" },
    { label: "Checker", href: `/${SLUG}` },
  ],
};

export default async function AdNetworkCheckerPage() {
  const toolPage = await getRequiredToolPage(SLUG);

  return (
    <ToolPageShell sectionNav={sectionNav} toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<ScanSearch strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <AdNetworkCheckerFromUrl logos={networkLogos()} />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

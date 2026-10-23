import { ClipboardList } from "lucide-react";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { loadRequirementsPageData } from "@/lib/ad-network-requirements/page-data";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AdNetworkRequirementsCheckerFromUrl } from "./ad-network-requirements-checker-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function AdNetworkRequirementsCheckerPage() {
  const toolPage = await getRequiredToolPage("ad-network-requirements-checker");
  const data = await loadRequirementsPageData();
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<ClipboardList strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <AdNetworkRequirementsCheckerFromUrl data={data} />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

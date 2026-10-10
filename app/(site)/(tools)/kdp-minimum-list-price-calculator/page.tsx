import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Tag } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpMinimumListPriceCalculator } from "./kdp-minimum-list-price-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpMinimumListPriceCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-minimum-list-price-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Tag strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpMinimumListPriceCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

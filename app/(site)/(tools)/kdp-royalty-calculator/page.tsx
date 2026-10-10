import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { CircleDollarSign } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpRoyaltyCalculator } from "./kdp-royalty-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpRoyaltyCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-royalty-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CircleDollarSign strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpRoyaltyCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

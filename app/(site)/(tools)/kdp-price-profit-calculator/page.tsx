import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { BookOpenCheck } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPriceProfitCalculator } from "./kdp-price-profit-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpPriceProfitCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-price-profit-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookOpenCheck strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpPriceProfitCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

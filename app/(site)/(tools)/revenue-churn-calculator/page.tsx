import { TrendingDown } from "lucide-react";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { RevenueChurnCalculator } from "./revenue-churn-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function RevenueChurnCalculatorPage() {
  const toolPage = await getRequiredToolPage("revenue-churn-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<TrendingDown strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <RevenueChurnCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

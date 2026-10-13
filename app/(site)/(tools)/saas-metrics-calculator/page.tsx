
import { CircleDollarSign } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { SaaSMetricsCalculator } from "./saas-metrics-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function SaaSMetricsCalculatorPage() {
  const toolPage = await getRequiredToolPage("saas-metrics-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CircleDollarSign strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <SaaSMetricsCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

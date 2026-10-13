import { ChartColumn } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { LtvCacCalculator } from "./ltv-cac-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function LtvCacCalculatorPage() {
  const toolPage = await getRequiredToolPage("ltv-cac-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<ChartColumn strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <LtvCacCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

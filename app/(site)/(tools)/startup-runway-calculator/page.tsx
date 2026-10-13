import { PlaneTakeoff } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { StartupRunwayCalculator } from "./startup-runway-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function StartupRunwayCalculatorPage() {
  const toolPage = await getRequiredToolPage("startup-runway-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<PlaneTakeoff strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <StartupRunwayCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

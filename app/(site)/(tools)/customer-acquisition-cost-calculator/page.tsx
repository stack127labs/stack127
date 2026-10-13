import { UserPlus } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CustomerAcquisitionCostCalculator } from "./customer-acquisition-cost-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function CustomerAcquisitionCostCalculatorPage() {
  const toolPage = await getRequiredToolPage("customer-acquisition-cost-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<UserPlus strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <CustomerAcquisitionCostCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

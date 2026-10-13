import { UsersRound } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { CustomerChurnCalculator } from "./customer-churn-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function CustomerChurnCalculatorPage() {
  const toolPage = await getRequiredToolPage("customer-churn-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<UsersRound strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <CustomerChurnCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

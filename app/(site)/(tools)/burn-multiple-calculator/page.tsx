import { Coins } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { BurnMultipleCalculator } from "./burn-multiple-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function BurnMultipleCalculatorPage() {
  const toolPage = await getRequiredToolPage("burn-multiple-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Coins aria-hidden="true" strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <BurnMultipleCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

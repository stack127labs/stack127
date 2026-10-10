import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { BookOpenText } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KindleUnlimitedKenpEarningsCalculator } from "./kindle-unlimited-kenp-earnings-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KindleUnlimitedKenpEarningsCalculatorPage() {
  const toolPage = await getRequiredToolPage("kindle-unlimited-kenp-earnings-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<BookOpenText strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KindleUnlimitedKenpEarningsCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Terminal } from "lucide-react";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { ChmodCalculator } from "./chmod-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function ChmodCalculatorPage() {
  const toolPage = await getRequiredToolPage("chmod-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Terminal strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <ChmodCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

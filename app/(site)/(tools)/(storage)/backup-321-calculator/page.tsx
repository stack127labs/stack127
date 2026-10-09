import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ShieldCheck } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { Backup321CalculatorFromUrl } from "./backup-321-calculator-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function Backup321CalculatorPage() {
  const toolPage = await getRequiredToolPage("backup-321-calculator");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ShieldCheck strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <Backup321CalculatorFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

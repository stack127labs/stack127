import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Gauge } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpBreakEvenAcosCalculator } from "./kdp-break-even-acos-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpBreakEvenAcosCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-break-even-acos-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Gauge strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpBreakEvenAcosCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

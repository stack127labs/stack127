import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { Ruler } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { PixelsToPrintSizeCalculator } from "./pixels-to-print-size-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function PixelsToPrintSizeCalculatorPage() {
  const toolPage = await getRequiredToolPage("pixels-to-print-size-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Ruler strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <PixelsToPrintSizeCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

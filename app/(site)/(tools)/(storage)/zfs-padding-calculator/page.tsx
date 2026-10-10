import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Columns3 } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { ZfsPaddingCalculatorFromUrl } from "./zfs-padding-calculator-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function ZfsPaddingCalculatorPage() {
  const toolPage = await getRequiredToolPage("zfs-padding-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Columns3 strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <ZfsPaddingCalculatorFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Database } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { ZfsCapacityCalculatorFromUrl } from "./zfs-capacity-calculator-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function ZfsCapacityCalculatorPage() {
  const toolPage = await getRequiredToolPage("zfs-capacity-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Database strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <ZfsCapacityCalculatorFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

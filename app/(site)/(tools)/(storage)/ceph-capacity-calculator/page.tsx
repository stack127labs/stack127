import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ServerCog } from "lucide-react";
import { PageCanvas } from "../../../../ui/site/page-canvas";
import { CephCapacityCalculatorFromUrl } from "./ceph-capacity-calculator-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function CephCapacityCalculatorPage() {
  const toolPage = await getRequiredToolPage("ceph-capacity-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<ServerCog strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <CephCapacityCalculatorFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

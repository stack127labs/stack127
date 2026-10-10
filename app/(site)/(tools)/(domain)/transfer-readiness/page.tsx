import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { ArrowLeftRight } from "lucide-react";
import { TransferReadinessFromUrl } from "./transfer-readiness-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function TransferReadinessPage() {
  const toolPage = await getRequiredToolPage("transfer-readiness");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className="domain-tool-main">
        <ToolPageHeader
          icon={<ArrowLeftRight strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <TransferReadinessFromUrl />

        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

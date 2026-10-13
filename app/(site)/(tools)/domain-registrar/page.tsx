import "@/app/ui/tools/domain/domain-tools.css";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { Building2 } from "lucide-react";
import { DomainRegistrarFromUrl } from "./domain-registrar-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function DomainRegistrarPage() {
  const toolPage = await getRequiredToolPage("domain-registrar");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas className="domain-tool-main">
        <ToolPageHeader
          icon={<Building2 strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />

        <DomainRegistrarFromUrl />

        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

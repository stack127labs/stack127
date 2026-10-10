import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { FileSearch } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPdfPreflightChecker } from "./kdp-pdf-preflight-checker";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpPdfPreflightCheckerPage() {
  const toolPage = await getRequiredToolPage("kdp-pdf-preflight-checker");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<FileSearch strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpPdfPreflightChecker />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

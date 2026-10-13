import { Barcode } from "lucide-react";
import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { IsbnBarcodeGeneratorFromUrl } from "./isbn-barcode-generator-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function IsbnBarcodeGeneratorPage() {
  const toolPage = await getRequiredToolPage("isbn-barcode-generator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<Barcode strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <IsbnBarcodeGeneratorFromUrl />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

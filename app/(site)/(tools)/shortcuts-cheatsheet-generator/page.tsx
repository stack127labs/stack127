import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { Keyboard } from "lucide-react";
import { shortcutAppCatalog } from "@/lib/shortcuts";
import { ShortcutsCheatSheetGeneratorFromUrl } from "./shortcuts-cheatsheet-generator-from-url";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function ShortcutsCheatSheetGeneratorPage() {
  const toolPage = await getRequiredToolPage("shortcuts-cheatsheet-generator");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Keyboard strokeWidth={2.2} />}
          intro={<Intro />}
          toolPage={toolPage}
        />
        <ShortcutsCheatSheetGeneratorFromUrl catalog={shortcutAppCatalog} />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}

import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { Keyboard } from "lucide-react";
import { shortcutAppCatalog } from "@/lib/shortcuts";
import { ShortcutsCheatSheetGeneratorFromUrl } from "./shortcuts-cheatsheet-generator-from-url";

export default async function ShortcutsCheatSheetGeneratorPage() {
  const toolPage = await getRequiredToolPage("shortcuts-cheatsheet-generator");

  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader
          icon={<Keyboard strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ShortcutsCheatSheetGeneratorFromUrl catalog={shortcutAppCatalog} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}

import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { Keyboard } from "lucide-react";
import { loadShortcutApp, shortcutAppCatalog } from "@/lib/shortcuts";
import { KeyboardShortcutsSidebar } from "../../../ui/references/keyboard-shortcuts-sidebar";
import { ShortcutsCheatSheetGenerator } from "./shortcuts-cheatsheet-generator";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initialSlugs(value: string) {
  return value.split(",").map((slug) => slug.trim()).filter(Boolean);
}

export default async function ShortcutsCheatSheetGeneratorPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const toolPage = await getRequiredToolPage("shortcuts-cheatsheet-generator");
  const params = await searchParams;
  const knownSlugs = new Set<string>(shortcutAppCatalog.map((app) => app.slug));
  const selectedSlugs = [...new Set(initialSlugs(firstValue(params.apps)))].filter((slug) => knownSlugs.has(slug));
  const initialApps = (await Promise.all(selectedSlugs.map(loadShortcutApp))).filter((app) => app !== undefined);

  return (
    <AppShell
      mainLabel="Shortcut cheat sheet generator"
      menuLabel="Shortcuts"
      sidebar={<KeyboardShortcutsSidebar activePage="generator" />}
      sidebarLabel="Shortcut pages"
    >
      <PageCanvas>
        <ToolPageHeader
          icon={<Keyboard strokeWidth={2.2} />}
          toolPage={toolPage}
        />
        <ShortcutsCheatSheetGenerator catalog={shortcutAppCatalog} initialApps={initialApps} />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}

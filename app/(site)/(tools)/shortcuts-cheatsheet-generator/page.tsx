import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { Keyboard } from "lucide-react";
import { shortcutApps } from "@/lib/shortcuts";
import { ShortcutsSidebar } from "../../shortcuts/shortcuts-sidebar";
import { ShortcutsCheatSheetGenerator } from "./shortcuts-cheatsheet-generator";
import { ShortcutsCheatSheetGuide } from "./shortcuts-cheatsheet-guide";
import styles from "./shortcuts-cheatsheet-generator.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initialSlugs(value: string) {
  return value.split(",").map((slug) => slug.trim()).filter(Boolean);
}

export default async function ShortcutsCheatSheetGeneratorPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Shortcut cheat sheet generator"
      menuLabel="Shortcuts"
      sidebar={<ShortcutsSidebar activeSlug="generator" />}
      sidebarLabel="Shortcut pages"
    >
      <main className={styles.page}>
        <header className={styles.header}>
          <h1><PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon> <mark>Keyboard shortcuts</mark> cheat sheet generator for your daily tools</h1>
          <p>Build one printable page from the shortcuts you actually use. Choose your apps, keep the platform you work on, and trim the groups until the sheet fits the work in front of you.</p>
          <p>The preview is the thing you will print. Each app keeps its name and each group keeps its task heading, so a key such as Ctrl+P still makes sense when several apps share the same paper.</p>
        </header>
        <ShortcutsCheatSheetGenerator apps={shortcutApps} initialSlugs={initialSlugs(firstValue(params.apps))} />
        <ShortcutsCheatSheetGuide />
      </main>
    </AppShell>
  );
}

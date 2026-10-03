import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { AppShell } from "@/app/ui/site/app-shell";
import type { AppShortcuts } from "@/lib/shortcuts/types";
import { KeyboardShortcutsSidebar } from "@/app/ui/directories/keyboard-shortcuts-sidebar";
import { KeyboardShortcutsReference } from "./keyboard-shortcuts-reference";

export async function KeyboardShortcutsAppPage({ app }: { app: AppShortcuts }) {
  const directoryPage = await getRequiredDirectoryPage(`keyboard-shortcuts/${app.slug}`);
  return (
    <AppShell
      mainLabel={app.name + " keyboard shortcuts"}
      menuLabel="Shortcuts"
      sidebar={<KeyboardShortcutsSidebar activeSlug={app.slug} groups={app.groups} />}
      sidebarLabel="Shortcut pages"
    >
      <KeyboardShortcutsReference app={app} directoryPage={directoryPage} />
    </AppShell>
  );
}

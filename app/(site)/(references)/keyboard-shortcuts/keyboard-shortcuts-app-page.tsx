import { AppShell } from "@/app/ui/site/app-shell";
import type { AppShortcuts } from "@/lib/shortcuts/types";
import { KeyboardShortcutsSidebar } from "../../../ui/references/keyboard-shortcuts-sidebar";
import { KeyboardShortcutsReference } from "./keyboard-shortcuts-reference";

export function KeyboardShortcutsAppPage({ app }: { app: AppShortcuts }) {
  return (
    <AppShell
      mainLabel={app.name + " keyboard shortcuts"}
      menuLabel="Shortcuts"
      sidebar={<KeyboardShortcutsSidebar activeSlug={app.slug} groups={app.groups} />}
      sidebarLabel="Shortcut pages"
    >
      <KeyboardShortcutsReference app={app} />
    </AppShell>
  );
}

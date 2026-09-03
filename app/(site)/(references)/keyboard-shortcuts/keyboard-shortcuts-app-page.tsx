import { AppShell } from "@/app/app-shell";
import type { AppShortcuts } from "@/lib/shortcuts/types";
import { KeyboardShortcutsSidebar } from "../_components/keyboard-shortcuts-sidebar";
import { KeyboardShortcutsReference } from "./keyboard-shortcuts-reference";

export function KeyboardShortcutsAppPage({ app }: { app: AppShortcuts }) {
  return (
    <AppShell
      mainLabel={app.name + " keyboard shortcuts"}
      menuLabel="Shortcuts"
      sidebar={<KeyboardShortcutsSidebar activeSlug={app.slug} />}
      sidebarLabel="Shortcut pages"
    >
      <KeyboardShortcutsReference app={app} />
    </AppShell>
  );
}

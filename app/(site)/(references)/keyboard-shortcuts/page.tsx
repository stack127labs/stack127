import { AppShell } from "@/app/app-shell";
import { KeyboardShortcutsSidebar } from "../_components/keyboard-shortcuts-sidebar";
import { KeyboardShortcutsDirectory } from "./keyboard-shortcuts-directory";

export default function KeyboardShortcutsDirectoryPage() {
  return (
    <AppShell
      mainLabel="Keyboard shortcuts directory"
      menuLabel="Shortcuts"
      sidebar={<KeyboardShortcutsSidebar activePage="directory" />}
      sidebarLabel="Shortcut pages"
    >
      <KeyboardShortcutsDirectory />
    </AppShell>
  );
}

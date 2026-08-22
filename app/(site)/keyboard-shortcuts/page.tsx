import { AppShell } from "../../app-shell";
import { ShortcutsDirectory } from "../shortcuts/shortcuts-reference";
import { ShortcutsSidebar } from "../shortcuts/shortcuts-sidebar";

export default function KeyboardShortcutsDirectoryPage() {
  return (
    <AppShell
      mainLabel="Keyboard shortcuts directory"
      menuLabel="Shortcuts"
      sidebar={<ShortcutsSidebar activeSlug="directory" />}
      sidebarLabel="Shortcut pages"
    >
      <ShortcutsDirectory />
    </AppShell>
  );
}

import { AppShell } from "../../app-shell";
import { ShortcutsDirectory } from "./shortcuts-reference";
import { ShortcutsSidebar } from "./shortcuts-sidebar";

export default function ShortcutsDirectoryPage() {
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

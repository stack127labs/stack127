import { AppShell } from "@/app/ui/site/app-shell";
import { KeyboardShortcutsDirectory } from "../keyboard-shortcuts-directory";

export default function KeyboardShortcutsDirectoryPage() {
  return (
    <AppShell mainLabel="Keyboard shortcuts directory" sidebarPosition="none">
      <KeyboardShortcutsDirectory />
    </AppShell>
  );
}

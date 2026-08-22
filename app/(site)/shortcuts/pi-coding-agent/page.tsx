import { notFound } from "next/navigation";
import { AppShell } from "../../../app-shell";
import { getShortcutApp } from "@/lib/shortcuts";
import { ShortcutsReference } from "../shortcuts-reference";
import { ShortcutsSidebar } from "../shortcuts-sidebar";

export default function ShortcutAppPage() {
  const app = getShortcutApp("pi-coding-agent");
  if (!app) notFound();

  return (
    <AppShell
      mainLabel={app.name + " keyboard shortcuts"}
      menuLabel="Shortcuts"
      sidebar={<ShortcutsSidebar activeSlug={app.slug} />}
      sidebarLabel="Shortcut pages"
    >
      <ShortcutsReference app={app} />
    </AppShell>
  );
}

import { notFound } from "next/navigation";
import { AppShell } from "@/app/app-shell";
import { getShortcutApp } from "@/lib/shortcuts";
import { KeyboardShortcutsSidebar } from "../_components/keyboard-shortcuts-sidebar";
import { KeyboardShortcutsReference } from "./keyboard-shortcuts-reference";

export function KeyboardShortcutsAppPage({ slug }: { slug: string }) {
  const app = getShortcutApp(slug);
  if (!app) notFound();

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

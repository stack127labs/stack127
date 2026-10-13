import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getPublishedDirectoryPage, getRequiredDirectoryPage } from "@/lib/directory-pages";
import { AppShell } from "@/app/ui/site/app-shell";
import type { ReactNode } from "react";
import type { AppShortcuts } from "@/lib/shortcuts/types";
import { KeyboardShortcutsReference } from "./keyboard-shortcuts-reference";

export async function KeyboardShortcutsAppPage({ app, intro }: { app: AppShortcuts; intro: ReactNode }) {
  const [directoryPage, parentPage, breadcrumbs] = await Promise.all([
    getRequiredDirectoryPage(`keyboard-shortcuts/${app.slug}`),
    getPublishedDirectoryPage("keyboard-shortcuts"),
    getBreadcrumbs(`keyboard-shortcuts/${app.slug}`, app.name),
  ]);
  const iconKey = directoryPage.card_icon_key ?? parentPage?.card_icon_key ?? null;
  return (
    <AppShell mainLabel={app.name + " keyboard shortcuts"} sidebarPosition="none">
      <KeyboardShortcutsReference app={app} breadcrumbs={breadcrumbs} directoryPage={directoryPage} iconKey={iconKey} intro={intro} />
    </AppShell>
  );
}

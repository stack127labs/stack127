import { mkdirSync, writeFileSync } from "node:fs";
import { shortcutApps } from "../../../lib/shortcuts/index.ts";

const template = (slug) => `import { notFound } from "next/navigation";
import { AppShell } from "../../../app-shell";
import { getShortcutApp } from "@/lib/shortcuts";
import { AppShortcutReference } from "../app-shortcut-reference";
import "../shortcuts.css";
import { ShortcutsSidebar } from "../shortcuts-sidebar";

export default function Page() {
  const app = getShortcutApp("${slug}");
  if (!app) notFound();

  return (
    <AppShell
      mainLabel={\`\${app.name} keyboard shortcuts\`}
      menuLabel="Apps"
      sidebar={<ShortcutsSidebar activeSlug={app.slug} />}
      sidebarLabel="App shortcuts sidebar"
    >
      <AppShortcutReference app={app} />
    </AppShell>
  );
}
`;

for (const app of shortcutApps) {
  const dir = `app/(site)/shortcuts/${app.slug}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/page.tsx`, template(app.slug));
}
console.log(`wrote ${shortcutApps.length} pages`);

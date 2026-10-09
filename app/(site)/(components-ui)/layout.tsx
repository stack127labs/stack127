import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { PathnameSidebarList } from "@/app/ui/site/pathname-sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { gallerySections } from "./components-ui/sections";
import "@/app/ui/directories/directory.css";

const sidebarItems = [
  { href: "/components-ui", label: "All components", icon: <LayoutGrid size={15} strokeWidth={2.2} /> },
  ...gallerySections.map((section) => ({
    href: `/components-ui/${section.slug}`,
    label: section.label,
    icon: <section.icon size={15} strokeWidth={2.2} />,
  })),
];

// The shell stays mounted while you move between sections, so only the examples change.
export default function ComponentsUiLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") return children;

  return (
    <AppShell
      mainLabel="Components UI"
      menuLabel="Sections"
      sidebar={(
        <div className={sidebarPanelClassName}>
          <div className={sidebarPanelHeadingClassName}><SidebarLabel>Components</SidebarLabel></div>
          <nav aria-label="Component sections"><PathnameSidebarList items={sidebarItems} /></nav>
        </div>
      )}
      sidebarLabel="Component sections sidebar"
    >
      {children}
    </AppShell>
  );
}

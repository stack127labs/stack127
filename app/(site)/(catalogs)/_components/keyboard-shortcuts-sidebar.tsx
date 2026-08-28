import { Keyboard, Printer } from "lucide-react";
import { SidebarLabel } from "@/app/app-shell";
import { SidebarList } from "@/app/sidebar-list";
import { appsInCategory, shortcutCategories } from "@/lib/shortcuts";
import { shortcutCount } from "@/lib/shortcuts/types";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/sidebar-panel";
import styles from "./keyboard-shortcuts-sidebar.module.css";

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

const sidebarGroups = [
  {
    title: "Editors and agents",
    categories: ["Code editor", "AI code editor", "AI coding agent", "Text editor"],
  },
  {
    title: "Browsers and desktop",
    categories: ["Web browser", "Operating system", "Desktop environment"],
  },
  {
    title: "Terminals and work",
    categories: shortcutCategories.filter(
      (category) =>
        ![
          "Code editor",
          "AI code editor",
          "AI coding agent",
          "Text editor",
          "Web browser",
          "Operating system",
          "Desktop environment",
        ].includes(category),
    ),
  },
] as const;

export function KeyboardShortcutsSidebar({
  activePage,
  activeSlug,
}: {
  activePage?: "directory" | "generator";
  activeSlug?: string;
}) {
  return (
    <div className={`${sidebarPanelClassName} ${styles.panel}`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>Keyboard shortcuts</SidebarLabel>
      </div>

      <nav className={styles.nav} aria-label="Shortcut pages">
        <div className={styles.group}>
          <p className={styles.groupTitle}>Start here</p>
          <SidebarList
            items={[
              {
                href: "/keyboard-shortcuts",
                label: "All apps",
                icon: <Keyboard {...iconProps} />,
                active: activePage === "directory",
              },
              {
                href: "/shortcuts-cheatsheet-generator",
                label: "Cheat sheet",
                icon: <Printer {...iconProps} />,
                active: activePage === "generator",
              },
            ]}
          />
        </div>

        {sidebarGroups.map((group) => {
          const apps = group.categories.flatMap((category) => appsInCategory(category));
          return (
            <div className={styles.group} key={group.title}>
              <p className={styles.groupTitle}>{group.title}</p>
              <SidebarList
                items={apps.map((app) => ({
                  href: "/keyboard-shortcuts/" + app.slug,
                  label: app.name,
                  count: String(shortcutCount(app)),
                  active: activeSlug === app.slug,
                }))}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
}

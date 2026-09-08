import { Keyboard, Printer } from "lucide-react";
import { SidebarLabel } from "@/app/app-shell";
import { SidebarList } from "@/app/sidebar-list";
import { appsInCategory, shortcutAppCatalog, shortcutCategories } from "@/lib/shortcuts";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/sidebar-panel";
import styles from "./keyboard-shortcuts-sidebar.module.css";

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

function categorySlug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function KeyboardShortcutsSidebar({
  activePage,
  activeSlug,
  groups,
}: {
  activePage?: "directory" | "generator";
  activeSlug?: string;
  groups?: { id: string; title: string }[];
}) {
  const activeApp = activeSlug
    ? shortcutAppCatalog.find((app) => app.slug === activeSlug)
    : undefined;

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

        {activeApp ? (
          <div className={styles.group}>
            <p className={styles.groupTitle}>Current app</p>
            <SidebarList
              items={[
                {
                  href: "/keyboard-shortcuts/" + activeApp.slug,
                  label: activeApp.name,
                  count: String(activeApp.shortcutCount),
                  active: true,
                },
              ]}
            />
          </div>
        ) : null}

        {groups ? <div className={styles.group}>
          <p className={styles.groupTitle}>On this page</p>
          <SidebarList items={groups.map((group) => ({ href: "#" + group.id, label: group.title }))} />
        </div> : null}

        {!groups ? <div className={styles.group}>
          <p className={styles.groupTitle}>Browse by category</p>
          <SidebarList
            items={shortcutCategories.map((category) => ({
              href: "/keyboard-shortcuts#category-" + categorySlug(category),
              label: category,
              count: String(appsInCategory(category).length),
            }))}
          />
        </div> : null}
      </nav>
    </div>
  );
}

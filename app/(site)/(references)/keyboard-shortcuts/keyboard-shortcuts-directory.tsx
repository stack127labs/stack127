import Link from "next/link";
import { Keyboard } from "lucide-react";
import { appsInCategory, shortcutAppCatalog, shortcutCategories } from "@/lib/shortcuts";
import { platformLabels } from "@/lib/shortcuts/types";
import { PageTitleIcon } from "@/app/page-title-icon";
import { PageHeader } from "@/app/page-header";
import styles from "./keyboard-shortcuts.module.css";

function categoryId(category: string) {
  return "category-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function KeyboardShortcutsDirectory() {
  const totalShortcuts = shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0);

  return (
    <div className={styles.page}>
      <PageHeader>
        <h1>
          <PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon> <mark>Keyboard shortcuts</mark> for your daily tools
        </h1>
        <p>
          Choose an app, check its platforms, and open a printable sheet with the shortcuts already selected.
        </p>
        <small>{shortcutAppCatalog.length} apps · {totalShortcuts} shortcuts · Windows, macOS, and Linux</small>
      </PageHeader>

      <nav className={styles.categoryNav} aria-label="Shortcut categories">
        {shortcutCategories.filter((category) => appsInCategory(category).length > 0).map((category) => (
          <a key={category} href={"#"+categoryId(category)}>
            {category}
          </a>
        ))}
      </nav>

      {shortcutCategories.filter((category) => appsInCategory(category).length > 0).map((category) => {
        const apps = appsInCategory(category);
        return (
          <section className={styles.section} aria-labelledby={categoryId(category) + "-title"} id={categoryId(category)} key={category}>
            <h2 id={categoryId(category) + "-title"}>{category}</h2>
            <p className={styles.sectionIntro}>{directoryCategoryIntro(category)}</p>
            <div className={styles.tableFrame}>
              <table className={styles.table + " " + styles.directoryTable}>
                <thead>
                  <tr>
                    <th scope="col">App</th>
                    <th scope="col">Platforms</th>
                    <th scope="col">Shortcuts</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.slug}>
                      <td data-label="App">
                        <Link href={"/keyboard-shortcuts/" + app.slug}>{app.name}</Link>
                      </td>
                      <td data-label="Platforms">
                        <ul className={styles.platforms}>
                          {app.platforms.map((platform) => <li key={platform}>{platformLabels[platform]}</li>)}
                        </ul>
                      </td>
                      <td className={styles.count} data-label="Shortcuts">{app.shortcutCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <section className={styles.nextStep} aria-labelledby="generator-title">
        <h2 id="generator-title">Print the shortcuts you need</h2>
        <p><Link href="/shortcuts-cheatsheet-generator">Build a printable sheet from the reference</Link></p>
      </section>
    </div>
  );
}

function directoryCategoryIntro(category: string) {
  const descriptions: Record<string, string> = {
    "Code editor": "Editors for moving through a project, changing code, and keeping the workspace in reach.",
    "AI code editor": "Editors that add chat, inline edits, and agent actions to the normal coding loop.",
    "AI coding agent": "Terminal agents where a few keys control the session, queue work, or switch modes.",
    "AI assistant": "General-purpose assistants where keyboard navigation and message controls keep a conversation moving.",
    "Developer tools": "Editors, IDEs, API clients, and other tools for building and inspecting software.",
    "Text editor": "Modal editors built around movement, operators, and command-driven changes.",
    "Web browser": "The tab, navigation, page, and address-bar keys that remove repeated mouse work.",
    "Operating system": "System-level keys for windows, desktops, screenshots, text, and common controls.",
    "Desktop environment": "Desktop shell keys for launching, switching, arranging, and managing workspaces.",
    "Terminal emulator": "Terminal keys for tabs, panes, search, clipboard work, and command entry.",
    "Shell": "Line editing and history controls that work at the prompt before a command runs.",
    "Code hosting platform": "Browser shortcuts for moving through repositories, issues, pull requests, and comments.",
    Spreadsheet: "Selection, editing, formatting, and data actions for work inside a grid.",
    Email: "Inbox triage, message reading, navigation, and composing without leaving the keyboard.",
    "Team chat": "Channel navigation, message actions, huddles, and workspace controls.",
    "Notes and docs": "Block editing, markdown-style input, search, and movement through long pages.",
    "Design tool": "Tool selection, shape editing, layer movement, and view controls for a design canvas.",
    "3D and CAD": "Modeling, drawing, rendering, and object controls for technical and 3D workspaces.",
    "Audio and video": "Timeline, canvas, playback, recording, and editing controls for media work.",
    Analytics: "Navigation, filtering, visuals, and report controls for data and analytics tools.",
    Documentation: "Writing, editing, search, formatting, and page organization for document tools.",
    "File management": "File, folder, archive, storage, and window controls for managing data.",
    Forms: "Build, navigate, and edit form content with fewer pointer steps.",
    "Game development": "Editor navigation, scene work, and project controls for game development.",
    "Git client": "Repository, branch, commit, and diff actions in desktop Git clients.",
    Launcher: "Search, open, and run tools from a keyboard-first launcher.",
    Music: "Playback, queue, library, and navigation keys for music apps.",
    PDF: "Document navigation, selection, annotation, and view controls for PDF tools.",
    "Password manager": "Search, open, and manage saved items from a keyboard-first password manager.",
    Presentation: "Slide navigation, editing, presentation, and object controls.",
    "Project management": "Tasks, projects, views, planning, and team work controls.",
    Productivity: "General workspace and collaboration commands for organizing work.",
    "Remote access": "Connection, session, and remote-control commands.",
    Social: "Navigation, publishing, messaging, and timeline controls for social tools.",
    "Work management": "Inbox, assignment, support, and workflow controls for team operations.",
    Writing: "Editing, writing assistance, and language tools for focused text work.",
  };
  return descriptions[category] ?? "Keyboard shortcuts grouped by the work this tool handles.";
}

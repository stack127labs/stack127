import Link from "next/link";
import { Keyboard } from "lucide-react";
import { appsInCategory, shortcutApps, shortcutCategories } from "@/lib/shortcuts";
import { shortcutPageClosing, shortcutPageGuidance } from "@/lib/shortcuts/copy";
import { platformLabels, shortcutCount, type AppShortcuts, type Shortcut } from "@/lib/shortcuts/types";
import { PageTitleIcon } from "../../page-title-icon";
import styles from "./shortcuts.module.css";

function categoryId(category: string) {
  return "category-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function KeyChips({ keys, alternatives = [] }: { keys: string[]; alternatives?: string[][] }) {
  const bindings = [keys, ...alternatives];

  return (
    <span className={styles.keyBindings}>
      {bindings.map((binding, bindingIndex) => (
        <span className={styles.keyBinding} key={binding.join("-") + "-" + bindingIndex}>
          <span className={styles.keyChips}>
            {binding.map((key, index) => (
              <kbd key={key + "-" + index}>{key}</kbd>
            ))}
          </span>
          {bindingIndex < bindings.length - 1 ? <span className={styles.keyOr}>or</span> : null}
        </span>
      ))}
    </span>
  );
}

function ShortcutRow({ shortcut, platforms }: { shortcut: Shortcut; platforms: AppShortcuts["platforms"] }) {
  return (
    <tr id={shortcut.id}>
      <td className={styles.action} data-label="Action">
        <span className={styles.actionText}>{shortcut.action}</span>
        {shortcut.note ? <span className={styles.note}>{shortcut.note}</span> : null}
      </td>
      {platforms.map((platform) => {
        const entry = shortcut.keys.find((key) => key.platform === platform);
        return (
          <td key={platform} data-label={platformLabels[platform]}>
            {entry ? <KeyChips keys={entry.keys} alternatives={entry.alternatives} /> : <span className={styles.noBinding}>Not documented</span>}
          </td>
        );
      })}
    </tr>
  );
}

export function ShortcutsDirectory() {
  const totalShortcuts = shortcutApps.reduce((total, app) => total + shortcutCount(app), 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>
          <PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon> <mark>Keyboard shortcuts</mark> for your daily tools
        </h1>
        <p className={styles.intro}>
          Find the keys for the tools you use every day, grouped by app and platform instead of buried in a poster or settings menu.
        </p>
        <p className={styles.scope}>{shortcutApps.length} apps · {totalShortcuts} shortcuts · Windows, macOS, and Linux</p>
      </header>

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
                      <td data-label="App"><Link href={"/shortcuts/" + app.slug}>{app.name}</Link></td>
                      <td data-label="Platforms">
                        <ul className={styles.platforms}>
                          {app.platforms.map((platform) => <li key={platform}>{platformLabels[platform]}</li>)}
                        </ul>
                      </td>
                      <td className={styles.count} data-label="Shortcuts">{shortcutCount(app)}</td>
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
  };
  return descriptions[category] ?? "Keyboard shortcuts grouped by the work this tool handles.";
}

export function ShortcutsReference({ app }: { app: AppShortcuts }) {
  const related = shortcutApps.filter((candidate) => candidate.category === app.category && candidate.slug !== app.slug).slice(0, 4);

  return (
    <div className={styles.page}>
      <header className={styles.header + " " + styles.referenceHeader}>
        <h1>
          <PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon> <mark>{app.name}</mark> keyboard shortcuts
        </h1>
        <p className={styles.intro}>{app.intro}</p>
        <p className={styles.pageGuide}>{shortcutPageGuidance[app.slug]}</p>
      </header>

      {app.groups.length > 2 ? (
        <nav className={styles.groupNav} aria-label="Shortcut groups">
          {app.groups.map((group) => <a key={group.id} href={"#"+group.id}>{group.title}</a>)}
        </nav>
      ) : null}

      {app.groups.map((group) => (
        <section className={styles.section + " " + styles.referenceSection} id={group.id} key={group.id} aria-labelledby={group.id + "-title"}>
          <h2 id={group.id + "-title"}>{group.title}</h2>
          {group.intro ? <p className={styles.sectionIntro}>{group.intro}</p> : null}
          <div className={styles.tableFrame}>
            <table className={styles.table + " " + styles.referenceTable}>
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  {app.platforms.map((platform) => <th key={platform} scope="col">{platformLabels[platform]}</th>)}
                </tr>
              </thead>
              <tbody>
                {group.shortcuts.map((shortcut) => <ShortcutRow key={shortcut.id} shortcut={shortcut} platforms={app.platforms} />)}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className={styles.closing} aria-labelledby="closing-title">
        <h2 id="closing-title">Make the useful keys stick</h2>
        <p>{shortcutPageClosing[app.slug]}</p>
        <p>You do not need this whole page in your head. Pick two shortcuts that remove a repeated hand movement, use them until they feel ordinary, and come back for the next pair.</p>
        <p><Link href={"/shortcuts-cheatsheet-generator?apps=" + app.slug}>Make a printable sheet for this app</Link></p>
      </section>

      {related.length > 0 ? (
        <section className={styles.nextStep} aria-labelledby="related-title">
          <h2 id="related-title">More {app.category.toLowerCase()} shortcuts</h2>
          <div className={styles.related}>
            {related.map((other) => <Link key={other.slug} href={"/shortcuts/" + other.slug}>{other.name}</Link>)}
            <Link href="/keyboard-shortcuts">All apps</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

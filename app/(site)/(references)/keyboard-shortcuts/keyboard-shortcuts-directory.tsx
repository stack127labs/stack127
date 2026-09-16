import { PageCanvas } from "@/app/page-canvas";
import Link from "next/link";
import { Keyboard } from "lucide-react";
import { appsInCategory, shortcutAppCatalog, shortcutCategories } from "@/lib/shortcuts";
import { platformLabels } from "@/lib/shortcuts/types";
import { PageTitleIcon } from "@/app/page-title-icon";
import { PageHeader } from "@/app/page-header";
import { EntryHero } from "@/app/entry-hero";
import { siteSpotKeyboardShortcutsArt } from "../../art/site--spot-keyboard-shortcuts";
import styles from "./keyboard-shortcuts.module.css";

function categoryId(category: string) {
  return "category-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function KeyboardShortcutsDirectory() {
  const totalShortcuts = shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0);

  return (
    <>
      <EntryHero art={siteSpotKeyboardShortcutsArt}>
      <PageHeader>
        <h1>
          <PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon> <mark>Keyboard shortcuts</mark> for your daily tools
        </h1>
        <p>
          Choose an app, check its platforms, and open a printable sheet with the shortcuts already selected.
        </p>
        <small>{shortcutAppCatalog.length} apps · {totalShortcuts} shortcuts · Windows, macOS, and Linux</small>
      </PageHeader>

      </EntryHero>
      <PageCanvas className={styles.page} flow>
      {shortcutCategories.filter((category) => appsInCategory(category).length > 0).map((category) => {
        const apps = appsInCategory(category);
        return (
          <section className={styles.section} aria-labelledby={categoryId(category) + "-title"} id={categoryId(category)} key={category}>
            <h2 id={categoryId(category) + "-title"}>{category}</h2>
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
      </PageCanvas>
    </>
  );
}

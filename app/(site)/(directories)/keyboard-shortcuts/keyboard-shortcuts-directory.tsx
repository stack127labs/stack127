import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import Link from "next/link";
import { appsInCategory, shortcutAppCatalog, shortcutCategories } from "@/lib/shortcuts";
import { platformLabels } from "@/lib/shortcuts/types";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteSpotKeyboardShortcutsArt } from "../../art/site--spot-keyboard-shortcuts";
import styles from "./keyboard-shortcuts.module.css";

function categoryId(category: string) {
  return "category-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export async function KeyboardShortcutsDirectory() {
  const directoryPage = await getRequiredDirectoryPage("keyboard-shortcuts");
  const totalShortcuts = shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0);

  return (
    <>
      <EntryHero art={siteSpotKeyboardShortcutsArt}>
      <PageHeader>
        <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
        <PageMeta updatedAt={directoryPage.updated_at} />
        <ContentMarkdown markdown={directoryPage.intro_markdown} />
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
        <DirectoryPageContent page={directoryPage} section="copy-1" />
      </section>
      </PageCanvas>
    </>
  );
}

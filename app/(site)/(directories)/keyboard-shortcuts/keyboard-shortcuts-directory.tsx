import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import Link from "next/link";
import { appsInCategory, shortcutAppCatalog, shortcutCategories } from "@/lib/shortcuts";
import type { PlatformId } from "@/lib/shortcuts/types";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteSpotKeyboardShortcutsArt } from "../../art/site--spot-keyboard-shortcuts";
import { proseClassName, proseSectionFlowClassName } from "@/app/ui/site/prose";
import styles from "./keyboard-shortcuts.module.css";
import Intro from "./(index)/content/intro.mdx";
import ShortcutNotWorking from "./(index)/content/shortcut-not-working.mdx";
import WhereShortcutsComeFrom from "./(index)/content/where-shortcuts-come-from.mdx";

const platformOrder: PlatformId[] = ["windows", "macos", "linux"];
const platformShortLabels: Record<PlatformId, string> = { windows: "Win", macos: "Mac", linux: "Linux" };

function categoryId(category: string) {
  return "category-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export async function KeyboardShortcutsDirectory() {
  const directoryPage = await getRequiredDirectoryPage("keyboard-shortcuts");
  const totalShortcuts = shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0);

  return (
    <>
      <EntryHero art={siteSpotKeyboardShortcutsArt}>
      <PageHeader breadcrumbs={await getBreadcrumbs("keyboard-shortcuts")}>
        <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
        <PageMeta updatedAt={directoryPage.updated_at} />
        <Intro />
        <small>{shortcutAppCatalog.length} apps · {totalShortcuts} shortcuts · Windows, macOS, and Linux</small>
      </PageHeader>

      </EntryHero>
      <PageCanvas className={styles.page} flow>
      {shortcutCategories.filter((category) => appsInCategory(category).length > 0).map((category) => {
        const apps = appsInCategory(category);
        return (
          <section className={styles.section} aria-labelledby={categoryId(category) + "-title"} id={categoryId(category)} key={category}>
            <h2 id={categoryId(category) + "-title"}>{category}</h2>
            <ul className={styles.appGrid}>
              {apps.map((app) => (
                <li key={app.slug}>
                  <Link className={styles.appCard} href={"/keyboard-shortcuts/" + app.slug}>
                    <span className={styles.appName}>{app.name}</span>
                    <span className={styles.appCount}>{app.shortcutCount}<small> shortcuts</small></span>
                    <span className={styles.appPlatforms}>
                      {platformOrder.map((platform) => (
                        <span
                          aria-hidden={app.platforms.includes(platform) ? undefined : true}
                          className={app.platforms.includes(platform) ? styles.platform : `${styles.platform} ${styles.platformMissing}`}
                          key={platform}
                        >
                          {platformShortLabels[platform]}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
        <section>
          <WhereShortcutsComeFrom />
        </section>
        <section>
          <ShortcutNotWorking />
        </section>
      </article>

      <section className={styles.nextStep} aria-labelledby="print-title">
        <h2 id="print-title">Print the shortcuts you use</h2>
        <p><Link href="/shortcuts-cheatsheet-generator">Make a printable sheet from one or more apps</Link></p>
      </section>
      </PageCanvas>
    </>
  );
}

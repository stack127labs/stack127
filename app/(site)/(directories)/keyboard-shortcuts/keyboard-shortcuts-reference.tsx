import type { Stack127DirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { Fragment } from "react";
import { groupedBindings, keycapParts } from "@/lib/shortcuts/presentation";
import Link from "next/link";
import { Keyboard } from "lucide-react";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { platformLabels, shortcutCount, type AppShortcuts, type Shortcut } from "@/lib/shortcuts/types";
import styles from "./keyboard-shortcuts.module.css";

function KeyChips({ keys, alternatives = [] }: { keys: string[]; alternatives?: string[][] }) {
  const bindings = [keys, ...alternatives];

  return (
    <span className={styles.keyBindings}>
      {bindings.map((binding, bindingIndex) => (
        <span className={styles.keyBinding} key={binding.join("-") + "-" + bindingIndex}>
          <span className={styles.keyChips}>
            {keycapParts(binding).map((part, index) => (
              <Fragment key={index}>
                {part.separator ? <span className={styles.keySeparator}>{part.separator}</span> : null}
                {part.connector ? <span className={styles.keySeparator}>{" " + part.key + " "}</span> : <kbd>{part.key}</kbd>}
              </Fragment>
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
      <td data-label="Shortcuts">
        <div className={styles.platformBindings}>
          {groupedBindings(shortcut, platforms).map(({ platforms: sharedPlatforms, entry }) => (
            <div className={styles.platformBinding} key={sharedPlatforms.join("-")}>
              {platforms.length > 1 ? <span className={styles.platformLabel}>{sharedPlatforms.map((platform) => platformLabels[platform]).join(" / ")}</span> : null}
              {entry ? <KeyChips alternatives={entry.alternatives} keys={entry.keys} /> : <span className={styles.noBinding}>Not documented</span>}
              {entry?.note ? <span className={styles.note}>{entry.note}</span> : null}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}

export function KeyboardShortcutsReference({ app, directoryPage }: { app: AppShortcuts; directoryPage: Stack127DirectoryPage }) {
  return (
    <PageCanvas className={styles.page} flow>
      <PageHeader>
        <h1>
          <PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon>{" "}
          <DirectoryPageTitle title={directoryPage.title} />
        </h1>
        <ContentMarkdown markdown={directoryPage.intro_markdown} />
        <small>
          {app.platforms.map((platform) => platformLabels[platform]).join(", ")} · {shortcutCount(app)} shortcuts
        </small>
      </PageHeader>

      {app.groups.map((group) => (
        <section
          aria-labelledby={group.id + "-title"}
          className={styles.section}
          id={group.id}
          key={group.id}
        >
          <h2 id={group.id + "-title"}>{group.title}</h2>
          {group.intro ? <p className={styles.sectionIntro}>{group.intro}</p> : null}
          <div className={styles.tableFrame}>
            <table aria-labelledby={group.id + "-title"} className={`${styles.table} ${styles.referenceTable}`}>
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">Shortcuts</th>
                </tr>
              </thead>
              <tbody>
                {group.shortcuts.map((shortcut) => (
                  <ShortcutRow key={shortcut.id} platforms={app.platforms} shortcut={shortcut} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className={styles.nextStep} aria-labelledby="print-title">
        <DirectoryPageContent page={directoryPage} section="print" components={{ h2: ({ children }) => <h2 id="print-title">{children}</h2> }} />
      </section>
    </PageCanvas>
  );
}

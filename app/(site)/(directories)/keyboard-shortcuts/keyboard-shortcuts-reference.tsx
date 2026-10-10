import type { Breadcrumb } from "@/lib/breadcrumbs";
import type { Stack127DirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { Fragment, type ReactNode } from "react";
import { groupedBindings, keycapParts } from "@/lib/shortcuts/presentation";
import Link from "next/link";
import { PageHeader } from "@/app/ui/site/page-header";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { platformLabels, shortcutCount, type AppShortcuts, type Shortcut } from "@/lib/shortcuts/types";
import styles from "./keyboard-shortcuts.module.css";

const checkedDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function SourceNote({ app }: { app: AppShortcuts }) {
  const checked = new Date(app.lastVerified);
  const hasChecked = !Number.isNaN(checked.getTime());
  return (
    <section className={styles.source} aria-labelledby="source-title">
      <h2 id="source-title">Source</h2>
      <p>
        <a href={app.sourceUrl} rel="noreferrer" target="_blank">{app.sourceLabel}</a>
        {hasChecked ? <> · Checked <time dateTime={app.lastVerified}>{checkedDateFormatter.format(checked)}</time></> : null}
      </p>
      {app.versionContext ? <p>{app.versionContext}</p> : null}
    </section>
  );
}

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

/**
 * `intro` is the app page's own `content/intro.mdx`. `iconKey` is the page's own card icon key,
 * or the keyboard shortcuts directory's when it has none.
 */
export function KeyboardShortcutsReference({ app, breadcrumbs, directoryPage, iconKey, intro }: { app: AppShortcuts; breadcrumbs: Breadcrumb[]; directoryPage: Stack127DirectoryPage; iconKey: string | null; intro: ReactNode }) {
  return (
    <PageCanvas className={styles.page} flow>
      <PageHeader breadcrumbs={breadcrumbs}>
        <h1>
          <DirectoryTitleIcon iconKey={iconKey} />{" "}
          <DirectoryPageTitle title={directoryPage.title} />
        </h1>
        <PageMeta updatedAt={directoryPage.updated_at} />
        {intro}
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

      <SourceNote app={app} />

      <section className={styles.nextStep} aria-labelledby="print-title">
        <h2 id="print-title">Print the shortcuts you use</h2>
        <p><Link href={`/shortcuts-cheatsheet-generator?apps=${app.slug}`}>Make a printable {app.name} sheet</Link></p>
      </section>
    </PageCanvas>
  );
}

import Link from "next/link";
import { Keyboard } from "lucide-react";
import { PageHeader } from "@/app/page-header";
import { PageTitleIcon } from "@/app/page-title-icon";
import { platformLabels, shortcutCount, type AppShortcuts, type Shortcut } from "@/lib/shortcuts/types";
import styles from "./keyboard-shortcuts.module.css";

function KeyChips({ keys, alternatives = [] }: { keys: string[]; alternatives?: string[][] }) {
  const bindings = [keys, ...alternatives];

  return (
    <span className={styles.keyBindings}>
      {bindings.map((binding, bindingIndex) => (
        <span className={styles.keyBinding} key={binding.join("-") + "-" + bindingIndex}>
          <span className={styles.keyChips}>
            {binding.map((key, index) => <kbd key={key + "-" + index}>{key}</kbd>)}
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
          <td data-label={platformLabels[platform]} key={platform}>
            {entry ? (
              <KeyChips alternatives={entry.alternatives} keys={entry.keys} />
            ) : (
              <span className={styles.noBinding}>Not documented</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export function KeyboardShortcutsReference({ app }: { app: AppShortcuts }) {
  return (
    <div className={styles.page}>
      <PageHeader>
        <h1>
          <PageTitleIcon><Keyboard strokeWidth={2.2} /></PageTitleIcon>{" "}
          <mark>{app.name}</mark> keyboard shortcuts
        </h1>
        <p>{app.intro}</p>
        <small>
          {app.platforms.map((platform) => platformLabels[platform]).join(", ")} · {shortcutCount(app)} shortcuts
        </small>
      </PageHeader>

      {app.groups.length > 2 ? (
        <nav className={styles.groupNav} aria-label="Shortcut groups">
          {app.groups.map((group) => <a href={"#" + group.id} key={group.id}>{group.title}</a>)}
        </nav>
      ) : null}

      {app.groups.map((group) => (
        <section
          aria-labelledby={group.id + "-title"}
          className={`${styles.section} ${styles.referenceSection}`}
          id={group.id}
          key={group.id}
        >
          <h2 id={group.id + "-title"}>{group.title}</h2>
          {group.intro ? <p className={styles.sectionIntro}>{group.intro}</p> : null}
          <div className={styles.tableFrame}>
            <table className={`${styles.table} ${styles.referenceTable}`}>
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  {app.platforms.map((platform) => <th key={platform} scope="col">{platformLabels[platform]}</th>)}
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
        <h2 id="print-title">Print the shortcuts you use</h2>
        <p>
          <Link href={"/shortcuts-cheatsheet-generator?apps=" + app.slug}>
            Make a printable {app.name} sheet
          </Link>
        </p>
      </section>
    </div>
  );
}

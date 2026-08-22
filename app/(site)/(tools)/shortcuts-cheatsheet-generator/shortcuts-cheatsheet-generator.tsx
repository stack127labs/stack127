"use client";

import { useState } from "react";
import { buildCheatSheet, type CheatSheetAppSelection, type CheatSheetAppSection } from "@/lib/shortcuts/cheatsheet";
import { platformLabels, type AppShortcuts, type PlatformId } from "@/lib/shortcuts/types";
import styles from "./shortcuts-cheatsheet-generator.module.css";

type Props = {
  apps: AppShortcuts[];
  initialSlugs: string[];
};

function SheetTable({ entry }: { entry: CheatSheetAppSection }) {
  return (
    <table className={styles.sheetTable}>
      <thead>
        <tr>
          <th scope="col">Action</th>
          {entry.platforms.map((platform) => <th key={platform} scope="col">{platformLabels[platform]}</th>)}
        </tr>
      </thead>
      <tbody>
        {entry.sections.flatMap((section) => [
          <tr key={section.group.id + "-heading"}>
            <th className={styles.sheetGroup} colSpan={entry.platforms.length + 1} scope="colgroup">{section.group.title}</th>
          </tr>,
          ...section.shortcuts.map((shortcut) => (
            <tr key={shortcut.id}>
              <td>{shortcut.action}</td>
              {entry.platforms.map((platform) => {
                const keys = shortcut.keys.find((key) => key.platform === platform);
                return <td key={platform}>{keys ? keys.keys.join(" ") : "Not documented"}</td>;
              })}
            </tr>
          )),
        ])}
      </tbody>
    </table>
  );
}

export function ShortcutsCheatSheetGenerator({ apps, initialSlugs }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSlugs));
  const [platformChoice, setPlatformChoice] = useState<Record<string, "all" | PlatformId>>({});
  const [excludedGroups, setExcludedGroups] = useState<Record<string, Set<string>>>({});
  const selectedApps = apps.filter((app) => selected.has(app.slug));

  const selections: CheatSheetAppSelection[] = selectedApps.map((app) => {
    const choice = platformChoice[app.slug] ?? "all";
    const platforms = choice === "all" ? app.platforms : [choice];
    const excluded = excludedGroups[app.slug];
    const groupIds = excluded ? app.groups.filter((group) => !excluded.has(group.id)).map((group) => group.id) : null;
    return { slug: app.slug, platforms, groupIds };
  });

  const result = buildCheatSheet(apps, selections);

  function toggleApp(slug: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleGroup(slug: string, groupId: string) {
    setExcludedGroups((current) => {
      const next = { ...current };
      const groups = new Set(next[slug] ?? []);
      if (groups.has(groupId)) groups.delete(groupId);
      else groups.add(groupId);
      next[slug] = groups;
      return next;
    });
  }

  return (
    <section className={styles.tool} aria-label="Cheat sheet options">
      <div className={styles.controls}>
        <div className={styles.controlHeading}>
          <h2>Choose apps</h2>
          <span>{selectedApps.length} selected</span>
        </div>
        <div className={styles.appChoices}>
          {apps.map((app) => (
            <label className={styles.checkRow} key={app.slug}>
              <input type="checkbox" checked={selected.has(app.slug)} onChange={() => toggleApp(app.slug)} />
              <span>{app.name}</span>
            </label>
          ))}
        </div>

        {selectedApps.map((app) => (
          <details className={styles.appOptions} key={app.slug} open>
            <summary>{app.name}</summary>
            {app.platforms.length > 1 ? (
              <fieldset className={styles.optionGroup}>
                <legend>Platform</legend>
                <div className={styles.radioRow}>
                  {(["all", ...app.platforms] as const).map((choice) => (
                    <label className={styles.radioLabel} key={choice}>
                      <input
                        type="radio"
                        name={"platform-" + app.slug}
                        value={choice}
                        checked={(platformChoice[app.slug] ?? "all") === choice}
                        onChange={() => setPlatformChoice((current) => ({ ...current, [app.slug]: choice }))}
                      />
                      <span>{choice === "all" ? "All platforms" : platformLabels[choice]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <fieldset className={styles.optionGroup}>
              <legend>Groups</legend>
              <div className={styles.groupChoices}>
                {app.groups.map((group) => (
                  <label className={styles.checkRow} key={group.id}>
                    <input
                      type="checkbox"
                      checked={!(excludedGroups[app.slug] ?? new Set()).has(group.id)}
                      onChange={() => toggleGroup(app.slug, group.id)}
                    />
                    <span>{group.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </details>
        ))}
      </div>

      <div className={styles.preview}>
        <div className={styles.previewHeading}>
          <p role="status">{result.ok ? result.doc.apps.length + " apps, " + result.doc.shortcutCount + " shortcuts" : result.reason}</p>
          <button className={styles.printButton} type="button" disabled={!result.ok} onClick={() => window.print()}>Print sheet</button>
        </div>
        <div className={styles.sheetFrame}>
          {result.ok ? (
            <div className={styles.sheet} data-print-root>
              <h2>{result.doc.apps.length === 1 ? result.doc.apps[0].app.name + " keyboard shortcuts" : "Keyboard shortcuts cheat sheet"}</h2>
              <p className={styles.sheetContext}>
                {result.doc.apps.map((entry) => entry.app.name + " · " + entry.platforms.map((platform) => platformLabels[platform]).join(", ")).join("  |  ")}
              </p>
              {result.doc.apps.map((entry) => (
                <section className={styles.sheetApp} key={entry.app.slug}>
                  {result.doc.apps.length > 1 ? <h3>{entry.app.name} keyboard shortcuts</h3> : null}
                  <SheetTable entry={entry} />
                </section>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Choose an app to see the sheet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

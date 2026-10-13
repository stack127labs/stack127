"use client";

import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiSearchField, uiOption } from "@/app/ui/controls";
import { UiStatus } from "@/app/ui/display";
import { buildCheatSheet, type CheatSheetAppSelection, type CheatSheetAppSection } from "@/lib/shortcuts/cheatsheet";
import { platformLabels, type AppShortcuts, type PlatformId } from "@/lib/shortcuts/types";
import type { ShortcutAppSummary } from "@/lib/shortcuts";
import styles from "./shortcuts-cheatsheet-generator.module.css";

type Props = { catalog: readonly ShortcutAppSummary[]; initialSlugs: readonly string[] };

async function loadApp(slug: string): Promise<AppShortcuts> {
  const response = await fetch(`/api/shortcuts/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error("App shortcuts could not be loaded.");
  const app = await response.json() as AppShortcuts;
  if (app.slug !== slug) throw new Error("App shortcuts could not be loaded.");
  return app;
}

function SheetTable({ entry }: { entry: CheatSheetAppSection }) {
  return <table className={styles.sheetTable}>
    <thead><tr><th scope="col">Action</th>{entry.platforms.map((platform) => <th key={platform} scope="col">{platformLabels[platform]}</th>)}</tr></thead>
    {entry.sections.map((section) => <tbody key={section.group.id}>
      <tr><th className={styles.sheetGroup} colSpan={entry.platforms.length + 1} scope="rowgroup">{section.group.title}</th></tr>
      {section.shortcuts.map((shortcut) => <tr key={shortcut.id}>
        <th scope="row">{shortcut.action}</th>
        {entry.platforms.map((platform) => { const binding = shortcut.keys.find((key) => key.platform === platform); const bindings = binding ? [binding.keys, ...(binding.alternatives ?? [])] : []; return <td key={platform}>{bindings.length ? bindings.map((keys) => keys.join(" ")).join(" or ") : "Not documented"}</td>; })}
      </tr>)}
    </tbody>)}
  </table>;
}

function SheetSource({ app }: { app: AppShortcuts }) {
  return <p className={styles.sheetSource}>Source: <a href={app.sourceUrl}>{app.sourceLabel}</a> · <span>{app.sourceUrl}</span> · Verified <time dateTime={app.lastVerified}>{app.lastVerified}</time></p>;
}

export function ShortcutsCheatSheetGenerator({ catalog, initialSlugs }: Props) {
  const [loadedApps, setLoadedApps] = useState<Record<string, AppShortcuts>>({});
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSlugs));
  const [loadingSlugs, setLoadingSlugs] = useState<Set<string>>(() => new Set(initialSlugs));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [platformChoice, setPlatformChoice] = useState<Record<string, "all" | PlatformId>>({});
  const [excludedGroups, setExcludedGroups] = useState<Record<string, Set<string>>>({});

  // Loading a shared selection adds records without replacing choices made meanwhile.
  // Results that arrive after a remount are ignored rather than aborted mid-request.
  useEffect(() => {
    let cancelled = false;
    for (const slug of initialSlugs) {
      void loadApp(slug)
        .then((app) => {
          if (!cancelled) setLoadedApps((current) => ({ ...current, [slug]: app }));
        })
        .catch(() => {
          if (cancelled) return;
          setSelected((current) => { const next = new Set(current); next.delete(slug); return next; });
          setLoadError("The app shortcuts could not be loaded. Try selecting the app again.");
        })
        .finally(() => {
          if (!cancelled) setLoadingSlugs((current) => { const next = new Set(current); next.delete(slug); return next; });
        });
    }
    return () => { cancelled = true; };
  }, [initialSlugs]);
  const selectedApps = catalog.flatMap((summary) => {
    const app = loadedApps[summary.slug];
    return selected.has(summary.slug) && app ? [app] : [];
  });
  const visibleApps = catalog.filter((app) => app.name.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()));
  const selections: CheatSheetAppSelection[] = selectedApps.map((app) => {
    const choice = platformChoice[app.slug] ?? "all";
    const platforms = choice === "all" ? app.platforms : [choice];
    const excluded = excludedGroups[app.slug];
    const groupIds = excluded ? app.groups.filter((group) => !excluded.has(group.id)).map((group) => group.id) : null;
    return { slug: app.slug, platforms, groupIds };
  });
  let result;
  let failed = false;
  try { result = buildCheatSheet(selectedApps, selections); } catch { failed = true; result = { ok: false as const, reason: "The sheet could not be built. Your choices are still here." }; }

  async function toggleApp(slug: string, isSelected: boolean) {
    setLoadError(null);
    if (!isSelected || loadedApps[slug]) {
      setSelected((current) => { const next = new Set(current); if (isSelected) next.add(slug); else next.delete(slug); return next; });
      return;
    }

    setLoadingSlugs((current) => new Set(current).add(slug));
    try {
      const app = await loadApp(slug);
      setLoadedApps((current) => ({ ...current, [slug]: app }));
      setSelected((current) => new Set(current).add(slug));
    } catch {
      setLoadError("The app shortcuts could not be loaded. Try selecting the app again.");
    } finally {
      setLoadingSlugs((current) => { const next = new Set(current); next.delete(slug); return next; });
    }
  }
  function toggleGroup(slug: string, groupId: string, isSelected: boolean) {
    setExcludedGroups((current) => { const next = { ...current }; const groups = new Set(next[slug] ?? []); if (isSelected) groups.delete(groupId); else groups.add(groupId); next[slug] = groups; return next; });
  }

  return <section className={styles.tool} data-tool-workbench aria-label="Cheat sheet options and preview">
    <div className={styles.controls}>
      <h2>Choose apps</h2>
      <UiSearchField label="Filter apps" onChange={setFilter} placeholder="Search apps" value={filter} />
      <div className={styles.appChoices} aria-label="Apps" role="group">
        {visibleApps.map((app) => <UiCheckbox isDisabled={loadingSlugs.has(app.slug)} isSelected={selected.has(app.slug)} key={app.slug} onChange={(checked) => { void toggleApp(app.slug, checked); }}>{app.name}</UiCheckbox>)}
        {!visibleApps.length ? <p>No apps match this filter.</p> : null}
      </div>
      {loadingSlugs.size > 0 ? <p role="status">Loading selected app shortcuts…</p> : null}
      {loadError ? <p role="alert">{loadError}</p> : null}
      <div className={styles.selectedOptions}>
        {selectedApps.map((app) => { const hasNoGroups = app.groups.every((group) => (excludedGroups[app.slug] ?? new Set()).has(group.id)); const groupErrorId = `groups-${app.slug}-error`; return <section className={styles.appOptions} key={app.slug} aria-labelledby={`options-${app.slug}`}>
          <h3 id={`options-${app.slug}`}>{app.name}</h3>
          {app.platforms.length > 1 ? <UiChoiceGroup label="Platform" onChange={(choice) => setPlatformChoice((current) => ({ ...current, [app.slug]: choice as "all" | PlatformId }))} options={[uiOption("all", "All platforms"), ...app.platforms.map((platform) => uiOption(platform, platformLabels[platform]))]} value={platformChoice[app.slug] ?? "all"} /> : null}
          <fieldset aria-describedby={hasNoGroups ? groupErrorId : undefined} aria-invalid={hasNoGroups || undefined} className={styles.groups}><legend>Groups</legend>{app.groups.map((group) => <UiCheckbox isSelected={!(excludedGroups[app.slug] ?? new Set()).has(group.id)} key={group.id} onChange={(checked) => toggleGroup(app.slug, group.id, checked)}>{group.title}</UiCheckbox>)}{hasNoGroups ? <p className={styles.groupError} id={groupErrorId}>Select at least one group for {app.name}.</p> : null}</fieldset>
        </section>; })}
      </div>
    </div>

    <div className={styles.preview}>
      <div className={styles.previewHeading}>
        {result.ok ? <UiStatus>{result.doc.apps.length} {result.doc.apps.length === 1 ? "app" : "apps"}, {result.doc.shortcutCount} shortcuts</UiStatus> : <UiStatus tone={failed ? "danger" : "neutral"}>{selectedApps.length ? result.reason : "Choose an app to see the sheet."}</UiStatus>}
        <UiButton isDisabled={!result.ok} onPress={() => window.print()} variant="primary"><Printer aria-hidden="true" size={18} /> Print sheet</UiButton>
      </div>
      {result.ok ? <div className={styles.sheetFrame} aria-label="Printable sheet preview" role="region" tabIndex={0}>
        <article className={styles.sheet} data-print-root>
          <h2>{result.doc.apps.length === 1 ? `${result.doc.apps[0].app.name} keyboard shortcuts` : "Keyboard shortcuts cheat sheet"}</h2>
          <p className={styles.sheetContext}>{result.doc.apps.map((entry) => `${entry.app.name} · ${entry.platforms.map((platform) => platformLabels[platform]).join(", ")}`).join("  |  ")}</p>
          {result.doc.apps.map((entry) => <section className={styles.sheetApp} key={entry.app.slug}>
            {result.doc.apps.length > 1 ? <h3>{entry.app.name} keyboard shortcuts</h3> : null}
            <SheetTable entry={entry} />
            <SheetSource app={entry.app} />
          </section>)}
        </article>
      </div> : null}
    </div>
  </section>;
}

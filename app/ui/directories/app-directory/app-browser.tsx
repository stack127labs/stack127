"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CircleDollarSign, Info, Tag } from "@/app/ui/icons";
import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { StatePanel } from "@/app/ui/state-panel";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { hiddenDetailsHtml } from "@/app/ui/directories/hidden-details";
import { DirectoryList, DirectoryListUnknown, type DirectoryListColumn, type DirectoryView } from "@/app/ui/directories/directory-view";
import {
  appDirectoryApiAppPath,
  cardCost,
  formatIndieDate,
  freeKindLabels,
  type DirectoryApp,
  type DirectoryAppCard,
  type IndieCategory,
} from "@/lib/indie-hacker-apps/model";
import { AppDetailsBody } from "./app-details";
import { AppIcon } from "./app-icon";
import { appDirectoryContext, costText, hiddenDetailsPrefix, mainJobNote } from "./shared";
import styles from "./app-directory.module.css";

type Props = {
  apps: DirectoryAppCard[];
  directorySlug: string;
  /** The chosen job filter, which picks the cost set on a multi-set directory. */
  job: string;
  levels: Record<string, number>;
  view: DirectoryView;
};

function StatusPill({ app }: { app: DirectoryAppCard }) {
  const status = app.status[0];
  if (!status) return null;
  return <span className={`status-pill${status.tone === "warning" ? " stale" : ""}`}>{status.label.toLowerCase()}</span>;
}

function MainJobNote({ app }: { app: DirectoryAppCard }) {
  const note = mainJobNote(app);
  return note ? <span className={styles.mainJob}>{note}</span> : null;
}

function Cell({ value, title = value }: { value: string | undefined; title?: string }) {
  if (!value || value === "—") return <DirectoryListUnknown>—</DirectoryListUnknown>;
  return <span className={styles.cell} title={title}>{value}</span>;
}

function AppCard({ app, category, jobLabels, job, levels, onSelect }: {
  app: DirectoryAppCard;
  category: IndieCategory;
  jobLabels: Map<string, string>;
  job: string;
  levels: Record<string, number>;
  onSelect: () => void;
}) {
  const { set, level, row } = cardCost(category, app, levels, job);
  return (
    <button
      aria-haspopup="dialog"
      aria-label={`View details for ${app.name}`}
      className={`directory-card ${appFactCardClassName}`}
      onClick={onSelect}
      type="button"
    >
      <AppFactCardContent
        categories={app.jobs.map((id) => ({ name: jobLabels.get(id) ?? id }))}
        facts={[
          { label: category.sets[set].short[level], value: costText(row), icon: CircleDollarSign },
          ...(category.show_free ? [{ label: "Free start", value: app.free.text, icon: Tag }] : []),
          ...category.cells.map(([key, label]) => ({ label, value: app.cells[key] || "—", icon: Info })),
          { label: "Checked", value: formatIndieDate(app.checked), icon: CalendarClock },
        ]}
        image={<AppIcon app={app} />}
        name={app.name}
        status={<><StatusPill app={app} /><MainJobNote app={app} /></>}
        summary={app.line}
      />
    </button>
  );
}

/** The full panel from the app's JSON route. Until it loads, the server-rendered short panel shows, if this app has one. */
function DetailBody({ app, directorySlug, view, jobLabels }: { app: DirectoryAppCard; directorySlug: string; view: IndieCategory; jobLabels: Map<string, string> }) {
  const [state, setState] = useState<{ slug: string; app?: DirectoryApp; failed?: boolean } | null>(null);
  const [initialHtml] = useState(() => hiddenDetailsHtml(hiddenDetailsPrefix(directorySlug), app.slug));
  useEffect(() => {
    let active = true;
    fetch(appDirectoryApiAppPath(directorySlug, app.slug))
      .then((response) => {
        if (!response.ok) throw new Error(`App details failed with ${response.status}.`);
        return response.json() as Promise<DirectoryApp>;
      })
      .then((loaded) => { if (active) setState({ slug: app.slug, app: loaded }); })
      .catch(() => { if (active) setState({ slug: app.slug, failed: true }); });
    return () => { active = false; };
  }, [directorySlug, app.slug]);

  if (state?.slug === app.slug && state.app) return <AppDetailsBody app={state.app} jobLabels={jobLabels} view={view} />;
  if (state?.slug === app.slug && state.failed && !initialHtml) return <p role="alert">App details could not be loaded. Close this panel and try again.</p>;
  if (initialHtml) return <div dangerouslySetInnerHTML={{ __html: initialHtml }} style={{ display: "contents" }} />;
  return <StatePanel state="loading" title="Loading details" />;
}

// Lists the apps as rows (the default) or cards. A click opens the side panel.
export function AppBrowser({ apps, directorySlug, job, levels, view }: Props) {
  const { category, view: directoryView, jobLabels } = appDirectoryContext(directorySlug);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = apps.find((app) => app.slug === selectedSlug);
  const close = () => setSelectedSlug(null);
  const set = Object.keys(directoryView.sets)[0];
  const columns: DirectoryListColumn[] = [
    { label: "cost", header: <>cost · {directoryView.sets[set].short[levels[set]].toLowerCase()}</>, mono: true },
    ...(category.show_free ? [{ label: "free start" }] : []),
    ...category.cells.map(([, label]) => ({ label: label.toLowerCase(), hideOnPhone: true })),
    { label: "checked", mono: true, hideOnPhone: true },
  ];

  return (
    <>
      {view === "cards" ? (
        <div className="directory-card-grid">
          {apps.map((app) => (
            <AppCard
              app={app}
              category={directoryView}
              job={job}
              jobLabels={jobLabels}
              key={app.slug}
              levels={levels}
              onSelect={() => setSelectedSlug(app.slug)}
            />
          ))}
        </div>
      ) : (
        <DirectoryList
          columns={columns}
          firstLabel="app"
          label={`${category.name} apps`}
          rows={apps.map((app) => {
            const { row } = cardCost(directoryView, app, levels, job);
            return {
              key: app.slug,
              icon: <AppIcon app={app} />,
              name: (
                <button aria-haspopup="dialog" aria-label={`View details for ${app.name}`} onClick={() => setSelectedSlug(app.slug)} type="button">
                  {app.name}
                </button>
              ),
              badge: <StatusPill app={app} />,
              summary: app.line,
              note: <MainJobNote app={app} />,
              cells: [
                <Cell key="cost" title={costText(row)} value={row && row.state !== "not_applicable" ? row.v : undefined} />,
                ...(category.show_free ? [<span key="free" title={app.free.text}>{freeKindLabels[app.free.kind].toLowerCase()}</span>] : []),
                ...category.cells.map(([key]) => <Cell key={key} value={app.cells[key]} />),
                <span key="checked">{app.checked ? formatIndieDate(app.checked) : <DirectoryListUnknown>unknown</DirectoryListUnknown>}</span>,
              ],
              selected: app.slug === selectedSlug,
              onSelect: () => setSelectedSlug(app.slug),
            };
          })}
        />
      )}
      {selected ? (
        <DetailDialog ariaLabel={`${selected.name} details`} onClose={close}>
          <div className="app-detail-heading">
            <AppIcon app={selected} detail />
            <div><h2>{selected.name}</h2></div>
            <DetailDialogClose ariaLabel="Close app details" onClose={close} />
          </div>
          <DetailBody app={selected} directorySlug={directorySlug} jobLabels={jobLabels} key={selected.slug} view={directoryView} />
        </DetailDialog>
      ) : null}
    </>
  );
}

"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { useState } from "react";
import type { DirectoryApp } from "@/lib/apps";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import {
  DirectoryAppCard,
  DirectoryAppIcon,
  formatCardDate,
  formatRamEstimate,
  formatStorageEstimate,
  maintenanceLabel,
  priceLabel,
  sourceModelLabel,
} from "@/app/ui/directories/directory-app-card";
import { DirectoryList, DirectoryListUnknown, type DirectoryListColumn, type DirectoryView } from "@/app/ui/directories/directory-view";
import { CategoryIcon } from "@/app/ui/site/category-icon";
import { hiddenDetailsHtml } from "@/app/ui/directories/hidden-details";
import { AppDetailsBody } from "./app-details";

const listColumns: DirectoryListColumn[] = [
  { label: "category", hideOnPhone: true },
  { label: "source", mono: true },
  { label: "pricing", mono: true },
  { label: "est. ram", mono: true },
  { label: "est. storage", mono: true, hideOnPhone: true },
  { label: "last update", mono: true },
];

function Category({ app }: { app: DirectoryAppCardData }) {
  const [primary, ...more] = app.categories;
  if (!primary) return <DirectoryListUnknown>uncategorized</DirectoryListUnknown>;
  return <>
    <CategoryIcon iconKey={primary.icon_key} />{" "}{primary.name.toLowerCase()}
    {more.length > 0 ? <DirectoryListUnknown> +{more.length}</DirectoryListUnknown> : null}
  </>;
}

function Fact({ value }: { value: string }) {
  return value === "unknown" || value.includes("unavailable") || value.includes("not verified") || value.includes("under review")
    ? <DirectoryListUnknown>{value}</DirectoryListUnknown>
    : <>{value}</>;
}

// On the static page, each app's panel body is server-rendered into hidden HTML,
// so search engines can read it, and opening a card shows that same HTML. Results
// loaded from the search API bring their detail data and render the same body here.
export function DirectoryAppBrowser({ apps, details, view }: { apps: DirectoryAppCardData[]; details?: DirectoryApp[]; view: DirectoryView }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedApp = apps.find((app) => app.slug === selectedSlug);
  const close = () => setSelectedSlug(null);

  return (
    <>
      {view === "cards" ? (
        <div className="directory-card-grid">
          {apps.map((app) => (
            <DirectoryAppCard
              app={app}
              key={app.slug}
              onSelect={setSelectedSlug}
              selected={app.slug === selectedSlug}
            />
          ))}
        </div>
      ) : (
        <DirectoryList
          columns={listColumns}
          firstLabel="app"
          label="Self-hosted apps"
          rows={apps.map((app) => ({
            key: app.slug,
            icon: <DirectoryAppIcon app={app} className="directory-card-icon" />,
            name: (
              <button
                aria-haspopup="dialog"
                aria-label={`View details for ${app.name}`}
                aria-pressed={app.slug === selectedSlug}
                onClick={() => setSelectedSlug(app.slug)}
                type="button"
              >
                {app.name}
              </button>
            ),
            badge: app.maintenance_status !== "active" ? (
              <span className={`status-pill ${maintenanceLabel(app).replace(/\s+/g, "-")}`}>{maintenanceLabel(app)}</span>
            ) : null,
            summary: app.summary,
            cells: [
              <Category app={app} key="category" />,
              <Fact key="source" value={sourceModelLabel(app)} />,
              <Fact key="pricing" value={priceLabel(app)} />,
              <Fact key="ram" value={formatRamEstimate(app)} />,
              <Fact key="storage" value={formatStorageEstimate(app)} />,
              <Fact key="date" value={formatCardDate(app.release_published_at ?? app.github_last_commit_at)} />,
            ],
            selected: app.slug === selectedSlug,
            onSelect: () => setSelectedSlug(app.slug),
          }))}
        />
      )}
      {selectedApp ? (
        <DetailDialog ariaLabel={`${selectedApp.name} details`} onClose={close}>
          <div className="app-detail-heading">
            <DirectoryAppIcon app={selectedApp} className="app-detail-icon" />
            <div>
              <h2>{selectedApp.name}</h2>
            </div>
            <DetailDialogClose ariaLabel="Close app details" onClose={close} />
          </div>
          {details ? <LoadedDetailBody app={details.find((app) => app.slug === selectedApp.slug)} /> : <DetailBody slug={selectedApp.slug} />}
        </DetailDialog>
      ) : null}
    </>
  );
}

function LoadedDetailBody({ app }: { app: DirectoryApp | undefined }) {
  if (!app) return <p role="alert">App details could not be loaded. Close this panel and try again.</p>;
  return <AppDetailsBody app={app} />;
}

function DetailBody({ slug }: { slug: string }) {
  const html = hiddenDetailsHtml("self-host-app", slug);
  if (html === null) return <p role="alert">App details could not be loaded. Close this panel and try again.</p>;
  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ display: "contents" }} />;
}

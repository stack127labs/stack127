"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { useState } from "react";
import type { DirectoryApp } from "@/lib/apps";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import { DirectoryAppCard, DirectoryAppIcon } from "@/app/ui/directories/directory-app-card";
import { hiddenDetailsHtml } from "@/app/ui/directories/hidden-details";
import { AppDetailsBody } from "./app-details";

// On the static page, each app's panel body is server-rendered into hidden HTML,
// so search engines can read it, and opening a card shows that same HTML. Results
// loaded from the search API bring their detail data and render the same body here.
export function DirectoryAppBrowser({ apps, details }: { apps: DirectoryAppCardData[]; details?: DirectoryApp[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedApp = apps.find((app) => app.slug === selectedSlug);
  const close = () => setSelectedSlug(null);

  return (
    <>
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

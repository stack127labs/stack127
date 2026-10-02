"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { useState } from "react";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import { DirectoryAppCard, DirectoryAppIcon } from "@/app/ui/directories/directory-app-card";
import { hiddenDetailsHtml } from "@/app/ui/directories/hidden-details";

// Each app's panel body is server-rendered into hidden HTML by the page, so search
// engines can read it. Opening a card shows that same HTML in the side panel.
export function DirectoryAppBrowser({ apps }: { apps: DirectoryAppCardData[] }) {
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
          <DetailBody slug={selectedApp.slug} />
        </DetailDialog>
      ) : null}
    </>
  );
}

function DetailBody({ slug }: { slug: string }) {
  const html = hiddenDetailsHtml("self-host-app", slug);
  if (html === null) return <p role="alert">App details could not be loaded. Close this panel and try again.</p>;
  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ display: "contents" }} />;
}

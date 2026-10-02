"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import {
  GitCommitHorizontal,
  Monitor,
  Package,
  Scale,
  Star,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TerminalApp } from "@/lib/terminal-apps";
import { terminalAppCategoryBySlug } from "@/lib/terminal-app-taxonomy";
import { AppFactCardContent, appFactCardClassName } from "../../../ui/directories/app-fact-card";
import { formatDate, formatList, formatStars, labelForPricing } from "./cli-app-format";
import { hiddenDetailsHtml } from "@/app/ui/directories/hidden-details";
import { CliAppDetailsBody } from "./cli-app-details";

const generatedIconColors = [
  "#2563eb",
  "#059669",
  "#dc2626",
  "#7c3aed",
  "#ca8a04",
  "#0891b2",
  "#be123c",
  "#4b5563",
];

function hashText(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function iconLabel(name: string) {
  const words = name.match(/[A-Za-z0-9]+/g) ?? [name];
  return (words.length > 1
    ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
    : (words[0] ?? name).slice(0, 2)
  ).toUpperCase();
}

function generatedIconUrl(name: string, slug: string) {
  const color = generatedIconColors[hashText(slug) % generatedIconColors.length];
  const label = iconLabel(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="2" fill="${color}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="23" font-weight="700">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function AppIcon({ app, detail = false }: { app: TerminalApp; detail?: boolean }) {
  const fallback = generatedIconUrl(app.name, app.slug);
  const imageUrl = app.icon_url ?? fallback;
  const [src, setSrc] = useState(imageUrl);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;

    if (image.naturalWidth > 0) {
      setLoaded(true);
      return;
    }

    if (src !== fallback) setSrc(fallback);
  }, [fallback, src]);

  return (
    <span
      aria-hidden="true"
      className={detail ? "app-detail-icon" : "directory-card-icon"}
      data-app-icon
      data-image-failed={failed ? "true" : undefined}
      data-image-loaded={loaded ? "true" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        loading={detail ? undefined : "lazy"}
        onError={() => {
          if (src !== fallback) {
            setLoaded(false);
            setSrc(fallback);
            return;
          }
          setFailed(true);
        }}
        onLoad={() => setLoaded(true)}
        ref={imageRef}
        src={src}
      />
      <span className="app-icon-letter">{iconLabel(app.name)}</span>
    </span>
  );
}

function TerminalAppCard({ app, onSelect }: { app: TerminalApp; onSelect: () => void }) {
  return (
    <button
      aria-label={`View details for ${app.name}`}
      aria-haspopup="dialog"
      className={`directory-card cli-card ${appFactCardClassName}`}
      onClick={onSelect}
      type="button"
    >
      <AppFactCardContent
        name={app.name}
        image={<AppIcon app={app} />}
        categories={app.categories.map((slug) => {
          const category = terminalAppCategoryBySlug.get(slug);
          return { name: category?.name ?? slug, icon_key: category?.icon_key };
        })}
        summary={app.summary}
        status={app.maintenance_status !== "unknown" && app.maintenance_status !== "active" ? (
          <span className={`status-pill ${app.maintenance_status}`}>{app.maintenance_status}</span>
        ) : null}
        facts={[
          { label: "Stars", value: formatStars(app.stars), icon: Star },
          { label: "Pricing", value: labelForPricing(app.pricing_model), icon: WalletCards },
          { label: "License", value: app.license ?? "unknown", icon: Scale },
          { label: "Platforms", value: formatList(app.platforms), icon: Monitor },
          { label: "Version", value: app.latest_version ?? "unknown", icon: Package },
          { label: "Last commit", value: formatDate(app.last_commit_at), icon: GitCommitHorizontal },
        ]}
      />
    </button>
  );
}

// The default page's panel bodies are server-rendered into hidden HTML, so search
// engines can read them. Opening a card shows that HTML in the side panel. Apps
// that only appear after filtering render the same panel in the browser.
export function CliAppBrowser({ apps }: { apps: TerminalApp[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedApp = apps.find((app) => app.slug === selectedSlug);
  const close = () => setSelectedSlug(null);

  return (
    <>
      <div className="directory-card-grid cli-card-grid">
        {apps.map((app) => (
          <TerminalAppCard app={app} key={app.slug} onSelect={() => setSelectedSlug(app.slug)} />
        ))}
      </div>
      {selectedApp ? (
        <DetailDialog ariaLabel={`${selectedApp.name} details`} onClose={close}>
          <div className="app-detail-heading">
            <AppIcon app={selectedApp} detail />
            <div>
              <h2>{selectedApp.name}</h2>
            </div>
            <DetailDialogClose ariaLabel="Close app details" onClose={close} />
          </div>
          <DetailBody app={selectedApp} />
        </DetailDialog>
      ) : null}
    </>
  );
}

function DetailBody({ app }: { app: TerminalApp }) {
  const html = hiddenDetailsHtml("cli-app", app.slug);
  if (html === null) return <CliAppDetailsBody app={app} />;
  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ display: "contents" }} />;
}

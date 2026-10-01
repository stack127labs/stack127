"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";


import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Box,
  Building2,
  CalendarClock,
  Code2,
  Database,
  Globe,
  HardDrive,
  Layers,
  MonitorSmartphone,
  Rocket,
  Scale,
  Server,
  type LucideIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { DirectoryApp } from "@/lib/apps";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import { CategoryIcon } from "@/app/ui/site/category-icon";
import {
  DirectoryAppCard,
  DirectoryAppIcon,
  formatDatabaseRequirement,
  sourceModelLabel,
} from "@/app/ui/directories/directory-app-card";

type AppFact = [label: string, value: string, Icon: LucideIcon];

function formatDate(value: Date | string | null) {
  if (!value) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatLatestRelease(app: DirectoryApp) {
  const version = app.release_version ?? app.github_latest_release;
  const publishedAt = app.release_published_at ?? app.github_latest_release_at;

  if (!version) {
    return app.github_last_commit_at ? `No tagged release · commit ${formatDate(app.github_last_commit_at)}` : "unknown";
  }

  if (!publishedAt) {
    return version;
  }

  return `${version} · ${formatDate(publishedAt)}`;
}

export function formatComposeSupport(app: DirectoryApp) {
  if (app.compose_support === null) return "unknown";
  return app.compose_support ? "yes" : "no";
}

function formatRamRequirement(app: DirectoryApp) {
  const estimate = app.resource_estimates?.ram;
  if (estimate) return formatEstimateRange(estimate);
  return "estimate unavailable";
}

function formatStorageRequirement(app: DirectoryApp) {
  const estimate = app.resource_estimates?.storage;
  if (estimate) return formatEstimateRange(estimate);
  return "estimate unavailable";
}

function documentationLinkLabel(url: string, isInstallLink: boolean, sourceCodeUrl: string | null) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "forums.unraid.net" || host === "forums.lime-technology.com") return "Community support";
    if (host === "hub.docker.com") return "Docker image page";
    if (host === "apps.yunohost.org") return "YunoHost app page";
    if (host === "apps.truenas.com") return "TrueNAS app page";
    if (host === "github.com" && /\/(issues|discussions)(\/|$)/i.test(parsed.pathname)) return "Project discussion";
    const clean = (value: string) => value.replace(/#.*$/, "").replace(/\/+$/, "");
    if (sourceCodeUrl && clean(url) === clean(sourceCodeUrl)) return "Project page";
    if (/\/README(?:\.(?:md|rst|txt))?$/i.test(parsed.pathname) || /installation-development-setup/i.test(parsed.pathname)) {
      return "Project docs";
    }
  } catch {
    // A malformed URL should not prevent the rest of the app details from rendering.
  }
  return isInstallLink ? "Install guide" : "Project docs";
}

function formatEstimateNumber(value: number, unit: "mb" | "gb") {
  if (unit === "mb" && value >= 1024) {
    const gigabytes = value / 1024;
    return `${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(gigabytes)} GB`;
  }

  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value)} ${unit.toUpperCase()}`;
}

function formatEstimateRange(estimate: DirectoryApp["resource_estimates"][string]) {
  const minimum = formatEstimateNumber(estimate.estimate_min, estimate.unit);
  const maximum = formatEstimateNumber(estimate.estimate_max, estimate.unit);
  return minimum === maximum ? minimum : `${minimum} to ${maximum}`;
}

function formatDockerSupport(app: DirectoryApp) {
  if (app.docker_support !== "unknown") return app.docker_support;
  return "unknown";
}

function formatContainerImage(app: DirectoryApp) {
  if (app.docker_image) return app.docker_image;
  return "unknown";
}

function formatPlatforms(surfaces: string[]) {
  if (surfaces.length === 0) {
    return "unknown";
  }

  const labels: Record<string, string> = {
    android: "Android",
    cli: "CLI",
    desktop: "desktop",
    ios: "iOS",
    web: "web",
  };

  return surfaces.map((platform) => labels[platform] ?? platform).join(", ");
}

function SourceCodeIcon({ host }: { host: string }) {
  return host === "github" ? <FaGithub aria-hidden="true" /> : <Code2 aria-hidden="true" />;
}

function formatPublisher(app: DirectoryApp) {
  if (!app.publisher_name) {
    return app.publisher_type === "unknown" ? "not verified" : app.publisher_type;
  }

  return app.publisher_type === "unknown"
    ? app.publisher_name
    : `${app.publisher_name} · ${app.publisher_type}`;
}

function formatMaintenanceStatus(app: DirectoryApp) {
  return app.maintenance_status === "unknown"
    ? "not verified"
    : app.maintenance_status.replaceAll("_", " ");
}

function installSupportLabel(level: DirectoryApp["install_options"][number]["support_level"]) {
  if (level === "official") return "official";
  if (level === "community") return "community";
  return "third party";
}

function AppDetailsOverlay({
  app,
  onClose,
}: {
  app: DirectoryApp | undefined;
  onClose: () => void;
}) {
  if (!app) {
    return null;
  }

  const factSections: Array<{ heading: string; facts: AppFact[] }> = [
    { heading: "Project and license", facts: [
      ["publisher", formatPublisher(app), Building2],
      ["maintenance", formatMaintenanceStatus(app), Activity],
      ["latest release", formatLatestRelease(app), Rocket],
      ["license", app.license ?? "not verified", Scale],
      ["source model", sourceModelLabel(app), Code2],
      ["self-host cost", app.pricing_model === "free" ? "free to self-host" : app.pricing_model === "unknown" ? "pricing under review" : app.pricing_model.replaceAll("_", " "), Scale],
    ] },
    { heading: "Installation", facts: [
      ["docker", formatDockerSupport(app), Box],
      ["compose", formatComposeSupport(app), Layers],
      ["container image", formatContainerImage(app), Box],
      ["database", formatDatabaseRequirement(app), Database],
    ] },
    { heading: "Resources and access", facts: [
      ["Est. RAM", formatRamRequirement(app), Server],
      ["Est. Storage", formatStorageRequirement(app), HardDrive],
      ["surfaces", formatPlatforms(app.surfaces), MonitorSmartphone],
      ["repository checked", formatDate(app.github_checked_at), CalendarClock],
    ] },
  ];
  const installOptions = app.install_options ?? [];



  return (
    <DetailDialog ariaLabel={`${app.name} details`} onClose={onClose}>
        <div className="app-detail-heading">
          <DirectoryAppIcon app={app} className="app-detail-icon" />
          <div>
            <h2>{app.name}</h2>
          </div>
          <DetailDialogClose ariaLabel="Close app details" onClose={onClose} />
        </div>

        <div className="app-detail-categories">
          {app.categories.map((category) => (
            <span className="category-badge" key={category.slug}>
              <CategoryIcon iconKey={category.icon_key} />
              {category.name}
            </span>
          ))}
        </div>

        <p className="app-detail-summary">{app.summary}</p>

        <div className="app-detail-primary-links">
          {app.website_url ? (
            <a className={app.source_code_url ? "secondary" : "primary"} href={app.website_url} rel="noreferrer" target="_blank">
              <span>
                <Globe aria-hidden="true" />
                website
              </span>
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          ) : null}
          {app.source_code_url ? (
            <a className="primary" href={app.source_code_url} rel="noreferrer" target="_blank">
              <span>
                <SourceCodeIcon host={app.source_code_host} />
                {app.source_code_host === "github" ? "github" : "source code"}
              </span>
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          ) : null}
        </div>

        {installOptions.length > 0 ? (
          <section className="app-detail-install-options">
            <h3>Install options</h3>
            <div>
              {installOptions.map((option) => (
                <a
                  className="app-detail-install-option"
                  href={option.url}
                  key={`${option.method}-${option.url}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>
                    <strong>{option.label}</strong>
                    <small>{installSupportLabel(option.support_level)}</small>
                  </span>
                  <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {factSections.map((section) => (
          <section className="app-detail-fact-section" key={section.heading}>
            <h3>{section.heading}</h3>
            <div className="app-detail-facts">
              {section.facts.map(([label, value, Icon]) => (
                <div key={label}>
                  <span><Icon aria-hidden="true" size={15} strokeWidth={2.2} />{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        ))}

        {app.install_docs_url || app.docs_url ? (
          <div className="app-detail-docs-link">
            <a href={app.install_docs_url ?? app.docs_url ?? ""} rel="noreferrer" target="_blank">
              {documentationLinkLabel(
                app.install_docs_url ?? app.docs_url ?? "",
                Boolean(app.install_docs_url),
                app.source_code_url,
              )}
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          </div>
        ) : null}
      </DetailDialog>
  );
}

export function DirectoryAppBrowser({ apps }: { apps: DirectoryAppCardData[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detailsBySlug, setDetailsBySlug] = useState<Record<string, DirectoryApp>>({});
  const [loadError, setLoadError] = useState(false);
  const selectedApp = selectedSlug ? detailsBySlug[selectedSlug] : undefined;

  useEffect(() => {
    if (!selectedSlug || detailsBySlug[selectedSlug]) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch(`/api/self-host-apps/${encodeURIComponent(selectedSlug)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("App details could not be loaded.");
        return response.json() as Promise<DirectoryApp>;
      })
      .then((app) => setDetailsBySlug((current) => ({ ...current, [app.slug]: app })))
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [detailsBySlug, selectedSlug]);

  const close = () => { setSelectedSlug(null); setLoadError(false); };



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
      <AppDetailsOverlay app={selectedApp} onClose={close} />
      {selectedSlug && !selectedApp ? <DetailDialog ariaLabel="App details" onClose={close}>
        <div className="app-detail-heading"><h2>App details</h2><DetailDialogClose ariaLabel="Close app details" onClose={close} /></div>
        <p role={loadError ? "alert" : "status"}>{loadError ? "App details could not be loaded. Close this panel and try again." : "Loading app details…"}</p>
      </DetailDialog> : null}
    </>
  );
}

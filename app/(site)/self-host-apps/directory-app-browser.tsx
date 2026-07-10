"use client";

import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
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
  Star,
  type LucideIcon,
} from "lucide-react";
import { FaDocker, FaGithub } from "react-icons/fa6";
import type { DirectoryApp } from "@/lib/apps";
import { CategoryIcon } from "../../category-icon";
import {
  DirectoryAppCard,
  DirectoryAppIcon,
  formatDatabaseRequirement,
  formatStars,
  getRamTier,
  getStorageTier,
} from "./directory-app-card";

type AppFact = [label: string, value: string, Icon: LucideIcon];

function formatDate(value: Date | string | null) {
  if (!value) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatLatestRelease(app: DirectoryApp) {
  if (!app.github_latest_release) {
    return "unknown";
  }

  if (!app.github_latest_release_at) {
    return app.github_latest_release;
  }

  return `${app.github_latest_release} · ${formatDate(app.github_latest_release_at)}`;
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
    return app.publisher_type === "unknown" ? "unknown" : app.publisher_type;
  }

  return app.publisher_type === "unknown"
    ? app.publisher_name
    : `${app.publisher_name} · ${app.publisher_type}`;
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

  const facts: AppFact[] = [
    ["publisher", formatPublisher(app), Building2],
    ["health", app.maintenance_status, Activity],
    ["latest release", formatLatestRelease(app), Rocket],
    ["stars", formatStars(app.github_stars), Star],
    ["license", app.license ?? "unknown", Scale],
    ["docker", app.docker_support, Box],
    ["compose", app.compose_support ? "yes" : "unknown", Layers],
    ["database", formatDatabaseRequirement(app), Database],
    ["ram", getRamTier(app), Server],
    ["storage", getStorageTier(app), HardDrive],
    ["surfaces", formatPlatforms(app.surfaces), MonitorSmartphone],
    ["last commit", formatDate(app.github_last_commit_at), CalendarClock],
  ];

  const handleClose = (event: MouseEvent | ReactPointerEvent) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <div className="app-detail-overlay" onClick={onClose} onPointerDown={onClose}>
      <aside
        aria-label={`${app.name} details`}
        aria-modal="true"
        className="app-detail-panel app-detail-panel-overlay"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="app-detail-heading">
          <DirectoryAppIcon app={app} className="app-detail-icon" />
          <div>
            <h2>{app.name}</h2>
          </div>
          <button
            aria-label="Close app details"
            className="app-detail-close"
            onClick={handleClose}
            onPointerDown={handleClose}
            type="button"
          >
            ×
          </button>
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
            <a className="secondary" href={app.website_url} rel="noreferrer" target="_blank">
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
          {app.docker_url ? (
            <a className="secondary" href={app.docker_url} rel="noreferrer" target="_blank">
              <span>
                <FaDocker aria-hidden="true" />
                docker
              </span>
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          ) : null}
        </div>

        <div className="app-detail-facts">
          {facts.map(([label, value, Icon]) => (
            <div key={label}>
              <span>
                <Icon aria-hidden="true" size={15} strokeWidth={2.2} />
                {label}
              </span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        {app.install_docs_url || app.docs_url ? (
          <div className="app-detail-docs-link">
            <a href={app.install_docs_url ?? app.docs_url ?? ""} rel="noreferrer" target="_blank">
              Install and usage docs
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function DirectoryAppBrowser({ apps }: { apps: DirectoryApp[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedApp = useMemo(
    () => apps.find((app) => app.slug === selectedSlug),
    [apps, selectedSlug],
  );

  useEffect(() => {
    if (!selectedApp) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedSlug(null);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".app-detail-close") || target.classList.contains("app-detail-overlay")) {
        setSelectedSlug(null);
      }
    };

    document.body.classList.add("app-detail-open");
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.body.classList.remove("app-detail-open");
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [selectedApp]);

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
      <AppDetailsOverlay app={selectedApp} onClose={() => setSelectedSlug(null)} />
    </>
  );
}

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
  type LucideIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { DirectoryApp } from "@/lib/apps";
import { CategoryIcon } from "@/app/category-icon";
import {
  DirectoryAppCard,
  DirectoryAppIcon,
  formatDatabaseRequirement,
  sourceModelLabel,
} from "./directory-app-card";

type AppFact = [label: string, value: string, Icon: LucideIcon];

function formatDate(value: Date | string | null) {
  if (!value) {
    return "not published";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatLatestRelease(app: DirectoryApp) {
  const version = app.release_version ?? app.github_latest_release;
  const publishedAt = app.release_published_at ?? app.github_latest_release_at;

  if (!version) {
    return app.github_last_commit_at ? `No tagged release · commit ${formatDate(app.github_last_commit_at)}` : "No tagged release published";
  }

  if (!publishedAt) {
    return version;
  }

  return `${version} · ${formatDate(publishedAt)}`;
}

export function formatComposeSupport(app: DirectoryApp) {
  if (app.compose_support === null) return app.compose_researched ? "not published" : "not checked";
  return app.compose_support ? "yes" : "no";
}

function formatRamRequirement(app: DirectoryApp) {
  if (app.ram_min_mb !== null && app.ram_recommended_mb !== null) {
    return `${app.ram_min_mb} MB min · ${app.ram_recommended_mb} MB recommended`;
  }
  if (app.ram_min_mb !== null) return `${app.ram_min_mb} MB minimum`;
  if (app.ram_recommended_mb !== null) return `${app.ram_recommended_mb} MB recommended`;
  if (app.ram_default_limit_mb !== null) return `${app.ram_default_limit_mb} MB package cap`;
  const estimate = app.resource_estimates?.ram;
  if (estimate) return formatEstimateRange(estimate);
  return app.ram_researched ? "not published" : "not checked";
}

function formatStorageRequirement(app: DirectoryApp) {
  if (app.storage_min_gb !== null) return `${app.storage_min_gb} GB minimum`;
  const estimate = app.resource_estimates?.storage;
  if (estimate) return formatEstimateRange(estimate);
  if (app.storage_profile === "depends") return "depends on retained data";
  if (app.storage_profile !== "unknown") return `${app.storage_profile} workload profile`;
  if (app.persistent_storage) return "persistent storage, size not published";
  return app.storage_researched ? "not published" : "not checked";
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
  return minimum === maximum ? `${minimum} (estimated)` : `${minimum}–${maximum} (estimated)`;
}

function formatDockerSupport(app: DirectoryApp) {
  if (app.docker_support !== "unknown") return app.docker_support;
  return app.docker_researched ? "not published" : "not checked";
}

function formatContainerImage(app: DirectoryApp) {
  if (app.docker_image) return app.docker_image;
  return app.docker_image_researched ? "not published" : "not checked";
}

function formatPlatforms(surfaces: string[]) {
  if (surfaces.length === 0) {
    return "not published";
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
      ["ram", formatRamRequirement(app), Server],
      ["storage", formatStorageRequirement(app), HardDrive],
      ["surfaces", formatPlatforms(app.surfaces), MonitorSmartphone],
      ["repository checked", formatDate(app.github_checked_at), CalendarClock],
    ] },
  ];
  const installOptions = app.install_options ?? [];

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

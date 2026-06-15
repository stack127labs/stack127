import Link from "next/link";
import type { DirectoryApp } from "@/lib/apps";

export function getRamTier(app: DirectoryApp) {
  const ram = app.ram_recommended_mb;

  if (ram === null) {
    return "unknown";
  }

  if (ram < 1024) {
    return "under 1gb";
  }

  if (ram <= 2048) {
    return "1-2gb";
  }

  if (ram <= 4096) {
    return "2-4gb";
  }

  return "4gb+";
}

export function getStorageTier(app: DirectoryApp) {
  const slug = app.category_slug;

  if (slug === "dns") {
    return "tiny";
  }

  if (slug === "monitoring" || slug === "password-managers" || slug === "home-automation") {
    return "low";
  }

  if (slug === "documents" || slug === "development-tools") {
    return "medium";
  }

  if (slug === "photos" || slug === "cloud-workspace") {
    return "high";
  }

  if (slug === "media") {
    return "very high";
  }

  return "depends";
}

export function hasMobileApp(app: DirectoryApp) {
  return app.supported_platforms.includes("ios") || app.supported_platforms.includes("android");
}

function formatStars(value: number | null) {
  if (value === null) {
    return "unknown";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value > 9999 ? "compact" : "standard",
  }).format(value);
}

function maintenanceLabel(app: DirectoryApp) {
  if (app.actively_maintained) {
    return "active";
  }

  return app.maintenance_status?.replaceAll("_", " ") ?? "unknown";
}

export function DirectoryAppCard({ app }: { app: DirectoryApp }) {
  const dockerLabel = app.docker_support === "official" ? "docker" : app.docker_support ?? "docker unknown";
  const goodFit = app.good_fit[0];
  const dependency = app.requires_database
    ? app.database_types[0] ?? "database"
    : app.compose_support
      ? "compose"
      : app.deployment_methods[0];

  return (
    <Link className="directory-card" href={`/apps/${app.slug}`}>
      <div className="directory-card-top">
        <span className="directory-card-icon" aria-hidden="true">
          {app.icon_url ? <img alt="" src={app.icon_url} /> : app.name.slice(0, 1)}
        </span>
        <div>
          <div className="directory-card-title-row">
            <h2>{app.name}</h2>
            <span className={`status-pill ${maintenanceLabel(app).replace(/\s+/g, "-")}`}>
              {maintenanceLabel(app)}
            </span>
          </div>
          <p>{app.description}</p>
        </div>
      </div>

      <div className="directory-badges" aria-label="App signals">
        <span>{app.category_name ?? "uncategorized"}</span>
        <span>{dockerLabel}</span>
        {dependency ? <span>{dependency}</span> : null}
        {hasMobileApp(app) ? <span>mobile</span> : null}
      </div>

      <div className="directory-card-stats">
        <span>
          <strong>{getRamTier(app)}</strong>
          RAM
        </span>
        <span>
          <strong>{getStorageTier(app)}</strong>
          storage
        </span>
        <span>
          <strong>{app.backup_difficulty?.replaceAll("_", " ") ?? "unknown"}</strong>
          setup care
        </span>
        <span>
          <strong>{formatStars(app.github_stars)}</strong>
          stars
        </span>
      </div>

      {goodFit ? <p className="directory-card-fit">{goodFit}</p> : null}
    </Link>
  );
}

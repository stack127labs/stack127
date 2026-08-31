import Link from "next/link";
import { Code2, Scale } from "lucide-react";
import type { DirectoryApp } from "@/lib/apps";
import { findDirectoryLicenseId } from "@/lib/software-licenses";
import { CategoryIcon } from "@/app/category-icon";

export function getRamTier(app: DirectoryApp) {
  const estimate = app.resource_estimates?.ram;
  const estimatedRam = estimate
    ? estimate.unit === "gb" ? estimate.estimate_min * 1024 : estimate.estimate_min
    : null;
  const ram = app.ram_min_mb ?? app.ram_recommended_mb ?? app.ram_default_limit_mb ?? estimatedRam;

  if (ram === null) {
    return app.ram_researched ? "not published" : "not checked";
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
  const storage = app.storage_min_gb ?? app.resource_estimates?.storage?.estimate_min ?? null;
  if (storage === null) {
    if (app.storage_profile !== "unknown") return app.storage_profile;
    return app.storage_researched ? "not published" : "not checked";
  }
  if (storage < 1) return "tiny";
  if (storage < 10) return "low";
  if (storage < 100) return "medium";
  return "high";
}

export function hasRamEstimate(app: DirectoryApp) {
  return app.ram_min_mb === null &&
    app.ram_recommended_mb === null &&
    app.ram_default_limit_mb === null &&
    Boolean(app.resource_estimates?.ram);
}

export function hasStorageEstimate(app: DirectoryApp) {
  return app.storage_min_gb === null && Boolean(app.resource_estimates?.storage);
}

export function hasMobileApp(app: DirectoryApp) {
  return app.surfaces.includes("ios") || app.surfaces.includes("android");
}

export function formatStars(value: number | null) {
  if (value === null) {
    return "not recorded";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value > 9999 ? "compact" : "standard",
  }).format(value);
}

export function sourceModelLabel(app: DirectoryApp) {
  const labels: Record<DirectoryApp["source_model"], string> = {
    closed_source: "closed source",
    open_source: "open source",
    source_available: "source available",
    unknown: "source not verified",
  };

  return labels[app.source_model];
}

function priceLabel(app: DirectoryApp) {
  if (app.pricing_model === "free") return "free to self-host";
  if (app.pricing_model === "unknown") return "pricing under review";
  return app.pricing_model.replaceAll("_", " ");
}

export function formatCardDate(value: Date | string | null) {
  if (!value) {
    return "not published";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDatabaseRequirement(app: DirectoryApp) {
  if (app.requires_database === null) {
    return app.database_researched ? "not published" : "not checked";
  }

  if (app.database_types.length > 0) {
    return app.database_types.join(", ");
  }

  return app.requires_database ? "yes" : "no";
}

function maintenanceLabel(app: DirectoryApp) {
  if (app.maintenance_status === "unknown") return "not verified";
  return app.maintenance_status.replaceAll("_", " ");
}

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
  const label = words.length > 1
    ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
    : (words[0] ?? name).slice(0, 2);

  return label.toUpperCase();
}

function generatedIconUrl(app: DirectoryApp) {
  const color = generatedIconColors[hashText(app.slug) % generatedIconColors.length];
  const label = iconLabel(app.name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="${color}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="23" font-weight="700">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getDirectoryAppIconUrl(app: DirectoryApp) {
  return app.icon_url ?? generatedIconUrl(app);
}

export function DirectoryAppIcon({
  app,
  className,
}: {
  app: DirectoryApp;
  className: string;
}) {
  const iconUrl = getDirectoryAppIconUrl(app);
  const initial = iconLabel(app.name);

  if (!iconUrl) {
    return (
      <span className={className} aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true" data-app-icon>
      <img
        alt=""
        loading="lazy"
        onLoad={(event) => {
          event.currentTarget.closest("[data-app-icon]")?.setAttribute("data-image-loaded", "true");
        }}
        onError={(event) => {
          const image = event.currentTarget;
          const fallback = generatedIconUrl(app);

          if (fallback && image.src !== fallback) {
            image.src = fallback;
            return;
          }

          image.closest("[data-app-icon]")?.setAttribute("data-image-failed", "true");
        }}
        src={iconUrl}
      />
      <span className="app-icon-letter">{initial}</span>
    </span>
  );
}

export function DirectoryAppCard({
  app,
  href,
  onSelect,
  selected = false,
}: {
  app: DirectoryApp;
  href?: string;
  onSelect?: (slug: string) => void;
  selected?: boolean;
}) {
  const visibleCategories = app.categories.slice(0, 1);
  const extraCategoryCount = Math.max(app.categories.length - visibleCategories.length, 0);
  const licenseId = findDirectoryLicenseId(app.license_spdx_id, app.license) ?? "unknown";

  const content = (
    <>
      <div className="directory-card-top">
        <DirectoryAppIcon app={app} className="directory-card-icon" />
        <div className="directory-card-identity">
          <div className="directory-card-title-row">
            <h2>{app.name}</h2>
            {app.maintenance_status !== "active" ? (
              <span className={`status-pill ${maintenanceLabel(app).replace(/\s+/g, "-")}`}>
                {maintenanceLabel(app)}
              </span>
            ) : null}
          </div>
          <div className="directory-card-categories">
            {visibleCategories.length > 0 ? (
              <>
                {visibleCategories.map((category) => (
                  <span className="category-badge" key={category.slug}>
                    <CategoryIcon iconKey={category.icon_key} />
                    {category.name}
                  </span>
                ))}
                {extraCategoryCount > 0 ? (
                  <span className="category-more">+{extraCategoryCount}</span>
                ) : null}
              </>
            ) : (
              <span className="category-badge">uncategorized</span>
            )}
          </div>
        </div>
      </div>

      <p className="directory-card-summary">{app.summary}</p>

      <div className="directory-meta-list" aria-label="App metadata">
        <span>
          <Code2 aria-hidden="true" className="meta-icon" size={16} strokeWidth={2.2} />
          {sourceModelLabel(app)}
        </span>
        <span>
          <Scale aria-hidden="true" className="meta-icon license" size={16} strokeWidth={2.2} />
          {priceLabel(app)}
        </span>
      </div>

      <div className="directory-card-stats">
        <span>
          <strong>{getRamTier(app)}</strong>
          {hasRamEstimate(app) ? <em className="directory-card-estimate">estimated</em> : null}
          ram
        </span>
        <span>
          <strong>{getStorageTier(app)}</strong>
          {hasStorageEstimate(app) ? <em className="directory-card-estimate">estimated</em> : null}
          storage
        </span>
        <span className="directory-card-stat-last-commit">
          <strong>{formatCardDate(app.release_published_at ?? app.github_last_commit_at)}</strong>
          last update
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        aria-current={selected ? "true" : undefined}
        className="directory-card"
        data-license-id={licenseId}
        href={href}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      aria-pressed={selected}
      className="directory-card"
      data-license-id={licenseId}
      onClick={() => onSelect?.(app.slug)}
      type="button"
    >
      {content}
    </button>
  );
}

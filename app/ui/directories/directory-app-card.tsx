import Link from "next/link";
import { CalendarDays, Code2, HardDrive, MemoryStick, WalletCards } from "lucide-react";
import type { DirectoryApp, DirectoryAppIndex } from "@/lib/apps";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import { findDirectoryLicenseId } from "@/lib/software-licenses";
import { AppFactCardContent, appFactCardClassName } from "./app-fact-card";

export function getRamTier(app: DirectoryApp | DirectoryAppIndex | DirectoryAppCardData) {
  const estimate = "ram_estimate_min_mb" in app ? app.ram_estimate_min_mb : app.resource_estimates?.ram;
  const estimatedRam = typeof estimate === "number" ? estimate : estimate
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

export function getStorageTier(app: DirectoryApp | DirectoryAppIndex | DirectoryAppCardData) {
  const estimate = "storage_estimate_min_gb" in app ? app.storage_estimate_min_gb : app.resource_estimates?.storage?.estimate_min;
  const storage = app.storage_min_gb ?? estimate ?? null;
  if (storage === null) {
    if (app.storage_profile !== "unknown") return app.storage_profile;
    return app.storage_researched ? "not published" : "not checked";
  }
  if (storage < 1) return "tiny";
  if (storage < 10) return "low";
  if (storage < 100) return "medium";
  return "high";
}

export function hasRamEstimate(app: DirectoryApp | DirectoryAppCardData) {
  if ("ram_estimated" in app) return app.ram_estimated;
  return app.ram_min_mb === null &&
    app.ram_recommended_mb === null &&
    app.ram_default_limit_mb === null &&
    Boolean(app.resource_estimates?.ram);
}

export function hasStorageEstimate(app: DirectoryApp | DirectoryAppCardData) {
  if ("storage_estimated" in app) return app.storage_estimated;
  return app.storage_min_gb === null && Boolean(app.resource_estimates?.storage);
}

export function hasMobileApp(app: Pick<DirectoryApp, "surfaces">) {
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

export function sourceModelLabel(app: Pick<DirectoryApp, "source_model">) {
  const labels: Record<DirectoryApp["source_model"], string> = {
    closed_source: "closed source",
    open_source: "open source",
    source_available: "source available",
    unknown: "source not verified",
  };

  return labels[app.source_model];
}

function priceLabel(app: Pick<DirectoryApp, "pricing_model">) {
  if (app.pricing_model === "free") return "free to self-host";
  if (app.pricing_model === "unknown") return "pricing under review";
  return app.pricing_model.replaceAll("_", " ");
}

export function formatCardDate(value: Date | string | null) {
  if (!value) {
    return "not published";
  }

  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
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

function maintenanceLabel(app: Pick<DirectoryApp, "maintenance_status">) {
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

function generatedIconUrl(app: Pick<DirectoryApp, "slug" | "name">) {
  const color = generatedIconColors[hashText(app.slug) % generatedIconColors.length];
  const label = iconLabel(app.name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="2" fill="${color}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="23" font-weight="700">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getDirectoryAppIconUrl(app: Pick<DirectoryApp, "slug" | "name" | "icon_url">) {
  return app.icon_url ?? generatedIconUrl(app);
}

export function DirectoryAppIcon({
  app,
  className,
}: {
  app: Pick<DirectoryApp, "slug" | "name" | "icon_url">;
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
        ref={(image) => {
          if (image?.complete && image.naturalWidth > 0) {
            image.closest("[data-app-icon]")?.setAttribute("data-image-loaded", "true");
          }
        }}
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
  app: DirectoryAppCardData;
  href?: string;
  onSelect?: (slug: string) => void;
  selected?: boolean;
}) {
  const licenseId = findDirectoryLicenseId(app.license_spdx_id, app.license) ?? "unknown";
  const content = (
    <AppFactCardContent
      name={app.name}
      image={<DirectoryAppIcon app={app} className="directory-card-icon" />}
      categories={app.categories}
      summary={app.summary}
      status={app.maintenance_status !== "active" ? (
        <span className={`status-pill ${maintenanceLabel(app).replace(/\s+/g, "-")}`}>{maintenanceLabel(app)}</span>
      ) : null}
      facts={[
        { label: "Source", value: sourceModelLabel(app), icon: Code2 },
        { label: "Pricing", value: priceLabel(app), icon: WalletCards },
        { label: "RAM", value: getRamTier(app), icon: MemoryStick, estimated: hasRamEstimate(app) },
        { label: "Storage", value: getStorageTier(app), icon: HardDrive, estimated: hasStorageEstimate(app) },
        { label: "Last update", value: formatCardDate(app.release_published_at ?? app.github_last_commit_at), icon: CalendarDays },
      ]}
    />
  );

  if (href) {
    return (
      <Link aria-current={selected ? "true" : undefined} className={`directory-card ${appFactCardClassName}`} data-license-id={licenseId} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      aria-label={`View details for ${app.name}`}
      aria-pressed={selected}
      aria-haspopup="dialog"
      className={`directory-card ${appFactCardClassName}`}
      data-license-id={licenseId}
      onClick={() => onSelect?.(app.slug)}
      type="button"
    >
      {content}
    </button>
  );
}

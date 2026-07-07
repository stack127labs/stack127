import Link from "next/link";
import { Box, Database, Scale, Star } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { DirectoryApp } from "@/lib/apps";
import { CategoryIcon } from "../../category-icon";

export function getRamTier(app: DirectoryApp) {
  const ram = app.ram_mb;

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
  return app.storage_profile;
}

export function hasMobileApp(app: DirectoryApp) {
  return app.platforms.includes("ios") || app.platforms.includes("android");
}

export function formatStars(value: number | null) {
  if (value === null) {
    return "unknown";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value > 9999 ? "compact" : "standard",
  }).format(value);
}

export function formatDatabaseRequirement(app: DirectoryApp) {
  if (app.requires_database === null) {
    return "unknown";
  }

  if (app.database_types.length > 0) {
    return app.database_types.join(", ");
  }

  return app.requires_database ? "yes" : "no";
}

function maintenanceLabel(app: DirectoryApp) {
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
  const initial = app.name.slice(0, 1);

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
  const visibleCategories = app.categories.slice(0, 2);
  const extraCategoryCount = Math.max(app.categories.length - visibleCategories.length, 0);

  const content = (
    <>
      <div className="directory-card-top">
        <DirectoryAppIcon app={app} className="directory-card-icon" />
        <div>
          <div className="directory-card-title-row">
            <h2>{app.name}</h2>
            <span className={`status-pill ${maintenanceLabel(app).replace(/\s+/g, "-")}`}>
              {maintenanceLabel(app)}
            </span>
          </div>
          <p>{app.summary}</p>
        </div>
      </div>

      <div className="directory-meta-list" aria-label="App metadata">
        <div className="meta-category-row">
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
        <span>
          <FaGithub aria-hidden="true" className="meta-icon github" size={16} />
          {formatStars(app.github_stars)}
          <Star aria-hidden="true" className="meta-icon stars" size={14} strokeWidth={2.2} />
        </span>
        <span>
          <Scale aria-hidden="true" className="meta-icon license" size={16} strokeWidth={2.2} />
          {app.license ?? "unknown"}
        </span>
      </div>

      <div className="directory-card-stats">
        <span>
          <strong>{getRamTier(app)}</strong>
          ram
        </span>
        <span>
          <strong>{getStorageTier(app)}</strong>
          storage
        </span>
        <span>
          <strong>{app.compose_support ? "compose" : app.docker_support}</strong>
          deploy
        </span>
      </div>

      <div className="directory-card-flags" aria-hidden="true">
        {app.requires_database ? (
          <span>
            <Database size={14} />
            db
          </span>
        ) : null}
        {app.docker_support !== "none" ? (
          <span>
            <Box size={14} />
            docker
          </span>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        aria-current={selected ? "true" : undefined}
        className="directory-card"
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
      onClick={() => onSelect?.(app.slug)}
      type="button"
    >
      {content}
    </button>
  );
}

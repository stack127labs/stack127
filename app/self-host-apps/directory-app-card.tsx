import Link from "next/link";
import { RefreshCw, Scale, Star } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { DirectoryApp } from "@/lib/apps";
import { CategoryIcon } from "../category-icon";

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
  const categorySlugs = new Set(app.categories.map((category) => category.slug));

  if (categorySlugs.has("media")) {
    return "very high";
  }

  if (categorySlugs.has("photos") || categorySlugs.has("cloud-workspace")) {
    return "high";
  }

  if (categorySlugs.has("documents") || categorySlugs.has("development-tools")) {
    return "medium";
  }

  if (
    categorySlugs.has("monitoring") ||
    categorySlugs.has("password-managers") ||
    categorySlugs.has("home-automation")
  ) {
    return "low";
  }

  if (categorySlugs.has("dns")) {
    return "tiny";
  }

  return "depends";
}

export function hasMobileApp(app: DirectoryApp) {
  return app.supported_platforms.includes("ios") || app.supported_platforms.includes("android");
}

function formatStars(value: number | null) {
  if (value === null) {
    return "unknown stars";
  }

  const formatted = new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value > 9999 ? "compact" : "standard",
  }).format(value);

  return `${formatted} stars`;
}

function formatUpdatedDate(value: Date | null) {
  if (!value) {
    return "not checked";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function maintenanceLabel(app: DirectoryApp) {
  if (app.actively_maintained) {
    return "active";
  }

  return app.maintenance_status?.replaceAll("_", " ") ?? "unknown";
}

export function DirectoryAppCard({ app }: { app: DirectoryApp }) {
  const updatedAt = app.github_last_commit_at ?? app.github_latest_release_at;
  const visibleCategories = app.categories.slice(0, 2);
  const extraCategoryCount = Math.max(app.categories.length - visibleCategories.length, 0);

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

      <div className="directory-meta-list" aria-label="App metadata">
        <div className="meta-category-row">
          <span className="meta-label">category:</span>
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
          {app.license ?? "license unknown"}
        </span>
        <span>
          <RefreshCw aria-hidden="true" className="meta-icon updated" size={16} strokeWidth={2.2} />
          updated: {formatUpdatedDate(updatedAt)}
        </span>
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
      </div>
    </Link>
  );
}

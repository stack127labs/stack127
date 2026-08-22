"use client";

import {
  Activity,
  ArrowRight,
  CalendarClock,
  Code2,
  Download,
  Globe,
  Languages,
  Monitor,
  Package,
  Scale,
  Star,
  Tag,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent, type PointerEvent } from "react";
import { FaGithub } from "react-icons/fa6";
import type { TerminalApp } from "@/lib/terminal-apps";
import {
  terminalAppCategories,
  terminalAppCategoryBySlug,
  terminalAppTypeLabels,
} from "@/lib/terminal-app-taxonomy";
import { CategoryIcon } from "../../category-icon";

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

function generatedIconUrl(name: string, slug: string) {
  const color = generatedIconColors[hashText(slug) % generatedIconColors.length];
  const words = name.match(/[A-Za-z0-9]+/g) ?? [name];
  const label = (words.length > 1
    ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
    : (words[0] ?? name).slice(0, 2)
  ).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="${color}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="23" font-weight="700">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function faviconUrl(app: TerminalApp) {
  const source = app.website_url ?? app.docs_url ?? app.repository_url;

  if (!source) {
    return generatedIconUrl(app.name, app.slug);
  }

  try {
    const host = new URL(source).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return generatedIconUrl(app.name, app.slug);
  }
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

function labelForType(value: string) {
  return terminalAppTypeLabels.get(value) ?? value.replaceAll("_", " ");
}

function labelForPricing(value: TerminalApp["pricing_model"]) {
  return value.replaceAll("_", " ");
}

function labelForSource(value: TerminalApp["source_model"]) {
  return value.replaceAll("_", " ");
}

function formatList(values: string[], labels?: Map<string, string>) {
  if (values.length === 0) {
    return "unknown";
  }

  return values.map((value) => labels?.get(value) ?? value.replaceAll("_", " ")).join(", ");
}

function AppIcon({ app, detail = false }: { app: TerminalApp; detail?: boolean }) {
  const fallback = generatedIconUrl(app.name, app.slug);
  const imageUrl = app.icon_url ?? faviconUrl(app);
  const [src, setSrc] = useState(imageUrl);

  return (
    <span aria-hidden="true" className={detail ? "app-detail-icon" : "directory-card-icon"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        loading={detail ? undefined : "lazy"}
        onError={() => setSrc((current) => (current === fallback ? current : fallback))}
        src={src}
      />
    </span>
  );
}

type Fact = [label: string, value: string, Icon: LucideIcon];

function AppDetailsPanel({ app, onClose }: { app: TerminalApp; onClose: () => void }) {
  const categoryLabels = new Map(
    terminalAppCategories.map((category) => [category.slug, category.name]),
  );
  const facts: Fact[] = [
    ["type", labelForType(app.primary_type), Terminal],
    ["categories", formatList(app.categories, categoryLabels), Tag],
    ["platforms", formatList(app.platforms), Monitor],
    ["install", formatList(app.install_methods), Download],
    ["language", app.language ?? "unknown", Languages],
    ["pricing", labelForPricing(app.pricing_model), Package],
    ["source model", labelForSource(app.source_model), Code2],
    ["license", app.license ?? "unknown", Scale],
    ["latest version", app.latest_version ?? "unknown", Activity],
    ["latest release", formatDate(app.latest_release_at), CalendarClock],
    ["stars", formatStars(app.stars), Star],
    ["last commit", formatDate(app.last_commit_at), CalendarClock],
    ["verified", formatDate(app.last_verified_at), Scale],
  ];

  const handleClose = (event: MouseEvent | PointerEvent) => {
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
          <AppIcon app={app} detail />
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
          <span className="category-badge">{labelForType(app.primary_type)}</span>
          {app.categories.map((category) => {
            const metadata = terminalAppCategoryBySlug.get(category);

            return (
              <span className="category-badge" key={category}>
                <CategoryIcon iconKey={metadata?.icon_key} />
                {metadata?.name ?? category}
              </span>
            );
          })}
        </div>

        <p className="app-detail-summary">{app.summary}</p>

        <div className="app-detail-primary-links">
          {app.website_url ? (
            <a className="secondary" href={app.website_url} rel="noreferrer" target="_blank">
              <span><Globe aria-hidden="true" /> website</span>
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          ) : null}
          {app.repository_url ? (
            <a className="primary" href={app.repository_url} rel="noreferrer" target="_blank">
              <span><FaGithub aria-hidden="true" /> source</span>
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          ) : null}
        </div>

        <div className="app-detail-facts">
          {facts.map(([label, value, Icon]) => (
            <div key={label}>
              <span><Icon aria-hidden="true" size={15} strokeWidth={2.2} /> {label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        {app.docs_url ? (
          <div className="app-detail-docs-link">
            <a href={app.docs_url} rel="noreferrer" target="_blank">
              Read docs and usage
              <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
            </a>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function TerminalAppCard({ app, onSelect }: { app: TerminalApp; onSelect: () => void }) {
  const visibleCategories = app.categories.slice(0, 1);
  const extraCategoryCount = Math.max(app.categories.length - visibleCategories.length, 0);

  return (
    <button
      aria-label={`View details for ${app.name}`}
      className="directory-card cli-card"
      onClick={onSelect}
      type="button"
    >
      <div className="directory-card-top">
        <AppIcon app={app} />
        <div className="directory-card-identity">
          <div className="directory-card-title-row">
            <h2>{app.name}</h2>
            {app.maintenance_status !== "unknown" && app.maintenance_status !== "active" ? (
              <span className={`status-pill ${app.maintenance_status}`}>{app.maintenance_status}</span>
            ) : null}
          </div>
          <div className="directory-card-categories">
            <span className="category-badge cli-card-type">{labelForType(app.primary_type)}</span>
            {visibleCategories.map((category) => (
              <span className="category-badge" key={category}>
                <CategoryIcon iconKey={terminalAppCategoryBySlug.get(category)?.icon_key} />
                {terminalAppCategoryBySlug.get(category)?.name ?? category}
              </span>
            ))}
            {extraCategoryCount > 0 ? <span className="category-more">+{extraCategoryCount}</span> : null}
          </div>
        </div>
      </div>

      <p className="directory-card-summary">{app.summary}</p>

      <div aria-label="App metadata" className="directory-meta-list">
        <span title={`GitHub stars: ${formatStars(app.stars)}`}>
          <FaGithub aria-hidden="true" className="meta-icon" size={15} />
          {formatStars(app.stars)}
          <span className="meta-label">stars</span>
        </span>
        <span title={`Pricing: ${labelForPricing(app.pricing_model)}`}>
          <Package aria-hidden="true" className="meta-icon" size={15} strokeWidth={2.2} />
          {labelForPricing(app.pricing_model)}
          <span className="meta-label">pricing</span>
        </span>
        <span title={`License: ${app.license ?? "unknown"}`}>
          <Scale aria-hidden="true" className="meta-icon" size={15} strokeWidth={2.2} />
          {app.license ?? "unknown"}
          <span className="meta-label">license</span>
        </span>
      </div>

      <div className="directory-card-stats">
        <span className="directory-card-stat-platforms">
          <strong>{app.platforms.length > 0 ? formatList(app.platforms.slice(0, 2)) : "unknown"}</strong>
          platforms
        </span>
        <span className="directory-card-stat-version">
          <strong>{app.latest_version ?? "unknown"}</strong>
          latest version
        </span>
        <span className="directory-card-stat-last-commit">
          <strong>{formatDate(app.last_commit_at)}</strong>
          last commit
        </span>
      </div>
    </button>
  );
}

export function CliAppBrowser({ apps }: { apps: TerminalApp[] }) {
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

    document.body.classList.add("app-detail-open");
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("app-detail-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedApp]);

  return (
    <>
      <div className="directory-card-grid cli-card-grid">
        {apps.map((app) => (
          <TerminalAppCard app={app} key={app.slug} onSelect={() => setSelectedSlug(app.slug)} />
        ))}
      </div>
      {selectedApp ? <AppDetailsPanel app={selectedApp} onClose={() => setSelectedSlug(null)} /> : null}
    </>
  );
}

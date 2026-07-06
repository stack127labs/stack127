#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { validateRecord } from "./lib/schema.mjs";
import { rewriteSummaryFromInputs, slugify } from "./lib/summary-rules.mjs";

const softwareUrl = "https://selfhst.github.io/cdn/directory/software.json";
const tagsUrl = "https://selfhst.github.io/cdn/directory/tags.json";
const sourceName = "selfhst";

const tagCategoryMap = new Map(
  Object.entries({
    "3D Printing": "system-admin-hosting",
    "2FA": "identity-access",
    Accessibility: "developer-tools",
    Accounting: "finance-budgeting",
    "ActivityPub / Fediverse": "communities-social",
    "*arr": "media-servers",
    "Ad Block": "networking-dns",
    "Ambient Sounds": "music-audio",
    Analytics: "monitoring-status",
    Antivirus: "security-privacy",
    Archive: "storage-backup",
    "Artificial Intelligence": "ai-ml",
    Audiobooks: "music-audio",
    Authentication: "identity-access",
    Automation: "automation",
    Backend: "developer-tools",
    Backups: "storage-backup",
    Blog: "content-publishing",
    Bookmarks: "bookmarks-read-it-later",
    Books: "ebooks-libraries",
    Budgeting: "finance-budgeting",
    Calendar: "calendars-contacts",
    "CalDAV/CarDAV": "calendars-contacts",
    Clipboard: "developer-tools",
    "Cloud Storage": "storage-backup",
    "Code Snippets": "developer-tools",
    Comics: "ebooks-libraries",
    Comments: "communities-social",
    Contacts: "calendars-contacts",
    "Container Registry": "developer-tools",
    "Content Management": "content-publishing",
    "Control Panel": "system-admin-hosting",
    CRM: "business-commerce",
    "Customer Engagement": "business-commerce",
    Dashboard: "dashboards",
    "Data Cloud": "storage-backup",
    Database: "databases",
    Deployment: "system-admin-hosting",
    Design: "developer-tools",
    Development: "developer-tools",
    "Development Environment": "developer-tools",
    "Development Infrastructure": "developer-tools",
    Diagrams: "documents-pdfs",
    "Digital Signage": "dashboards",
    DNS: "networking-dns",
    Docker: "system-admin-hosting",
    "Document Management": "documents-pdfs",
    "Document Signing": "documents-pdfs",
    Downloads: "file-sharing-sync",
    "E-commerce": "business-commerce",
    ERP: "business-commerce",
    Email: "email-newsletters",
    "Event Polls": "forms-polls-events",
    Events: "forms-polls-events",
    "Facial Recognition": "photos-galleries",
    "Feed Reader": "bookmarks-read-it-later",
    Feedback: "forms-polls-events",
    "File Conversion": "file-sharing-sync",
    "File Management": "file-sharing-sync",
    "File Sharing": "file-sharing-sync",
    "File Transfer and Sync": "file-sharing-sync",
    Firewall: "networking-dns",
    Fitness: "health-fitness",
    Flights: "maps-travel",
    Forums: "communities-social",
    "Front End": "developer-tools",
    Gaming: "games",
    Gardening: "home-automation-iot",
    "Genealogy / Family Trees": "health-fitness",
    Git: "developer-tools",
    "Grocery Lists": "recipes-food",
    "Habit Tracking": "health-fitness",
    "Health and Wellness": "health-fitness",
    "Home Automation": "home-automation-iot",
    "Human Resources": "business-commerce",
    IDE: "developer-tools",
    Icons: "developer-tools",
    "Identity Management": "identity-access",
    "Image Sharing": "photos-galleries",
    "In-Memory Cache": "databases",
    Interface: "developer-tools",
    "Internet of Things": "home-automation-iot",
    "Inventory Management": "business-commerce",
    Kanban: "project-task-management",
    Language: "developer-tools",
    "Landing Page": "content-publishing",
    Learning: "learning-courses",
    "Live Streaming": "media-servers",
    "Local File Sharing": "file-sharing-sync",
    Location: "maps-travel",
    Logs: "monitoring-status",
    Maintenance: "system-admin-hosting",
    Manga: "ebooks-libraries",
    Marketing: "business-commerce",
    "Media Assets": "media-servers",
    Maps: "maps-travel",
    "Markdown Editor": "knowledge-notes",
    "Media Streaming": "media-servers",
    Messaging: "communication",
    Monitoring: "monitoring-status",
    Movies: "media-servers",
    Music: "music-audio",
    "Music Streaming": "music-audio",
    Networking: "networking-dns",
    "No-Code / Low-Code": "developer-tools",
    Notes: "knowledge-notes",
    "Note-Taking": "knowledge-notes",
    Notifications: "monitoring-status",
    NVR: "security-privacy",
    Observability: "monitoring-status",
    "Object Storage": "storage-backup",
    "Office Suite": "documents-pdfs",
    "Password Manager": "password-managers",
    Paywalls: "search",
    Payments: "finance-budgeting",
    Platform: "system-admin-hosting",
    Photos: "photos-galleries",
    "Photo Management": "photos-galleries",
    Podcast: "music-audio",
    Privacy: "security-privacy",
    "Project Management": "project-task-management",
    Proxy: "networking-dns",
    "QR Codes": "developer-tools",
    "Recipe Management": "recipes-food",
    Recipes: "recipes-food",
    "Relational Database": "databases",
    Relationships: "project-task-management",
    "Remote Access": "remote-access",
    "Requests": "media-servers",
    "Reverse Proxy": "networking-dns",
    RSS: "bookmarks-read-it-later",
    Runners: "developer-tools",
    Scheduling: "forms-polls-events",
    Search: "search",
    "Search Engines": "search",
    Screenshots: "documents-pdfs",
    Security: "security-privacy",
    "Server Management": "system-admin-hosting",
    "Smart Home": "home-automation-iot",
    "Social Media": "communities-social",
    "Speed Test": "networking-dns",
    Spreadsheet: "documents-pdfs",
    SSH: "remote-access",
    Statistics: "dashboards",
    Storage: "storage-backup",
    Subtitles: "media-servers",
    "Support / Ticketing": "project-task-management",
    "Surveys and Forms": "forms-polls-events",
    "Static Site": "content-publishing",
    Subscriptions: "finance-budgeting",
    Television: "media-servers",
    "Text Sync": "file-sharing-sync",
    Tools: "developer-tools",
    Transcription: "music-audio",
    Tracking: "monitoring-status",
    Travel: "maps-travel",
    "Task Scheduling": "automation",
    "Tasks and To-Do Lists": "project-task-management",
    Theme: "developer-tools",
    Torrents: "file-sharing-sync",
    Uptime: "monitoring-status",
    "URL Shortener": "developer-tools",
    VPN: "remote-access",
    Videos: "media-servers",
    "Video Editing": "media-servers",
    "Video Conferencing": "video-conferencing",
    "Video Surveillance": "security-privacy",
    Visualization: "dashboards",
    "Wake-on-LAN": "networking-dns",
    "Web Analytics": "monitoring-status",
    "Web Desktop": "remote-access",
    "Web Server": "networking-dns",
    Webhooks: "developer-tools",
    "Wealth Management": "finance-budgeting",
    Wiki: "wikis",
    "Wish Lists": "project-task-management",
    Workspace: "knowledge-notes",
    "Workflow Automation": "automation",
    "Year-in-Review": "media-servers",
  }),
);

function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function canonicalUrl(value) {
  if (!value) return null;
  let raw = String(value).trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => part.replace(/\.git$/i, "").toLowerCase());

    if (["github.com", "gitlab.com", "codeberg.org"].includes(host) && parts.length >= 2) {
      return `${host}/${parts[0]}/${parts[1]}`;
    }

    return `${host}/${parts.join("/")}`.replace(/\/$/, "");
  } catch {
    return String(value)
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
  }
}

function absoluteUrl(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function isoDate(value) {
  const raw = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : null;
}

function sourceRow(row) {
  return {
    selfhst_id: String(row[0] ?? ""),
    name: row[1] ?? "",
    slug: slugify(row[2] ?? row[1]),
    website_url: absoluteUrl(row[3]),
    repository_url: absoluteUrl(row[4]),
    summary: row[5] ?? "",
    source_type: row[6] ?? "",
    license_id: row[7] ?? "",
    language_id: row[8] ?? "",
    icon_state: row[9] ?? "",
    theme: row[11] ?? "",
    github_stars: Number(row[13] || 0) || null,
    github_forks: Number(row[14] || 0) || null,
    github_checked_at: isoDate(row[15]),
    repository_kind: row[16] ?? "",
    tag_ids: Array.isArray(row[17]) ? row[17].map(Number) : [],
    alternative_ids: Array.isArray(row[18]) ? row[18].map(Number) : [],
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

function categoriesFromTags(tags) {
  const categories = [];
  for (const tag of tags) {
    const category = tagCategoryMap.get(tag);
    if (category && !categories.includes(category)) categories.push(category);
  }
  return categories.slice(0, 3);
}

function categoriesFromText(row) {
  const text = `${row.name} ${row.summary}`.toLowerCase();
  const rules = [
    ["communities-social", /\bsocial|fediverse|activitypub\b/],
    ["music-audio", /\bbird|audio|sound|podcast\b/],
    ["forms-polls-events", /\bform|survey|poll\b/],
    ["media-servers", /\bplex|jellyfin|media|movie|trailer|poster\b/],
    ["search", /\bsearch|serp\b/],
    ["networking-dns", /\bproxy|nginx|cloudflare|tunnel|wake-on-lan|wol\b/],
    ["monitoring-status", /\buptime|observability|status|monitor\b/],
    ["developer-tools", /\bwebhook|runner|cron|qr\b/],
  ];

  return rules.filter(([, pattern]) => pattern.test(text)).map(([category]) => category).slice(0, 3);
}

function categoriesFor(row, tags) {
  const categories = categoriesFromTags(tags);
  if (categories.length > 0) return categories;
  return categoriesFromText(row);
}

function publisherFromRepo(repositoryUrl) {
  const canonical = canonicalUrl(repositoryUrl);
  if (!canonical) return { publisher_name: null, publisher_url: null, publisher_type: "unknown" };
  const [host, owner] = canonical.split("/");
  if (!host || !owner) return { publisher_name: null, publisher_url: null, publisher_type: "unknown" };
  return {
    publisher_name: owner,
    publisher_url: `https://${host}/${owner}`,
    publisher_type: "unknown",
  };
}

function githubParts(repositoryUrl) {
  const canonical = canonicalUrl(repositoryUrl);
  if (!canonical?.startsWith("github.com/")) return { github_owner: null, github_repo: null };
  const [, owner, repo] = canonical.split("/");
  return { github_owner: owner ?? null, github_repo: repo ?? null };
}

function recordFromSelfhst(row, tags, fetchedAt) {
  const categories = categoriesFor(row, tags);
  const publisher = publisherFromRepo(row.repository_url);
  const github = githubParts(row.repository_url);
  const summary = rewriteSummaryFromInputs({
    name: row.name,
    description: row.summary,
    topics: tags,
  });

  return {
    slug: row.slug,
    name: row.name,
    summary,
    icon_url: null,
    website_url: row.website_url,
    repository_url: row.repository_url,
    docs_url: null,
    install_docs_url: null,
    docker_url: null,
    license: null,
    ...publisher,
    published: false,
    maintenance_status: "unknown",
    ...github,
    github_stars: row.github_stars,
    github_latest_release: null,
    github_latest_release_at: null,
    github_last_commit_at: null,
    github_checked_at: row.github_checked_at,
    docker_support: tags.includes("Docker") ? "unknown" : "unknown",
    compose_support: null,
    requires_database: null,
    database_types: [],
    ram_mb: null,
    storage_profile: "unknown",
    platforms: ["web"],
    categories,
    summary_source: "selfhst_rewrite",
    summary_confidence: "medium",
    field_sources: [
      { field_name: "website_url", source: sourceName, source_url: softwareUrl, confidence: "medium" },
      { field_name: "repository_url", source: sourceName, source_url: softwareUrl, confidence: row.repository_url ? "medium" : "unknown" },
      { field_name: "summary", source: "selfhst_rewrite", source_url: softwareUrl, confidence: "medium" },
      { field_name: "categories", source: "selfhst_tags", source_url: tagsUrl, confidence: categories.length > 0 ? "medium" : "unknown" },
      { field_name: "github_stars", source: sourceName, source_url: softwareUrl, confidence: row.github_stars === null ? "unknown" : "medium" },
    ],
    source_payload: {
      source: sourceName,
      source_key: `software:${row.selfhst_id}`,
      source_url: softwareUrl,
      payload: {
        fetched_at: fetchedAt,
        directory: "software",
        ...row,
        tags,
      },
    },
  };
}

async function existingIndexes(client) {
  const result = await client.query(
    "select slug, name, website_url, repository_url from public.self_host_apps order by slug",
  );
  const bySlug = new Map();
  const byRepo = new Map();
  const byWebsite = new Map();
  const byName = new Map();

  for (const row of result.rows) {
    bySlug.set(row.slug, row);

    const repo = canonicalUrl(row.repository_url);
    if (repo && !byRepo.has(repo)) byRepo.set(repo, row);

    const website = canonicalUrl(row.website_url);
    if (website && !byWebsite.has(website)) byWebsite.set(website, row);

    const name = normalizeName(row.name);
    if (name && !byName.has(name)) byName.set(name, row);
  }

  return { bySlug, byRepo, byWebsite, byName, count: result.rows.length };
}

function duplicateFor(row, indexes) {
  const repo = canonicalUrl(row.repository_url);
  const website = canonicalUrl(row.website_url);
  const name = normalizeName(row.name);

  if (indexes.bySlug.has(row.slug)) return { reason: "slug", match: indexes.bySlug.get(row.slug) };
  if (repo && indexes.byRepo.has(repo)) return { reason: "repository_url", match: indexes.byRepo.get(repo) };
  if (website && indexes.byWebsite.has(website)) return { reason: "website_url", match: indexes.byWebsite.get(website) };
  if (name && indexes.byName.has(name)) return { reason: "name", match: indexes.byName.get(name) };
  return null;
}

async function main() {
  const args = parseArgs();
  const fetchedAt = new Date().toISOString();
  const outPath = args.out ?? `scripts/self-host-apps/batches/${fetchedAt.slice(0, 10)}-selfhst-software.json`;
  const limit = numberArg(args, "limit", Number.POSITIVE_INFINITY);

  const [softwareRows, tagsRows] = await Promise.all([fetchJson(softwareUrl), fetchJson(tagsUrl)]);
  const tagNames = new Map(tagsRows.map((tag) => [Number(tag[0]), tag[1]]));
  const sourceRows = softwareRows.map(sourceRow);

  await withClient(async (client) => {
    const indexes = await existingIndexes(client);
    const apps = [];
    const duplicates = [];
    const unmapped = [];
    const invalid = [];

    for (const row of sourceRows) {
      const tags = row.tag_ids.map((id) => tagNames.get(id)).filter(Boolean);
      const duplicate = duplicateFor(row, indexes);
      if (duplicate) {
        duplicates.push({
          selfhst_id: row.selfhst_id,
          slug: row.slug,
          name: row.name,
          reason: duplicate.reason,
          matched_slug: duplicate.match.slug,
          matched_name: duplicate.match.name,
        });
        continue;
      }

      const record = recordFromSelfhst(row, tags, fetchedAt);
      if (record.categories.length === 0) {
        unmapped.push({ selfhst_id: row.selfhst_id, slug: row.slug, name: row.name, tags });
        continue;
      }

      const validation = validateRecord(record);
      if (validation.errors.length > 0) {
        invalid.push({ slug: record.slug, name: record.name, errors: validation.errors, warnings: validation.warnings });
        continue;
      }

      apps.push(record);
      if (apps.length >= limit) break;
    }

    const output = {
      source: sourceName,
      source_url: softwareUrl,
      fetched_at: fetchedAt,
      existing_count: indexes.count,
      discovered_count: sourceRows.length,
      app_count: apps.length,
      duplicate_count: duplicates.length,
      unmapped_count: unmapped.length,
      invalid_count: invalid.length,
      duplicate_samples: duplicates.slice(0, 50),
      unmapped_samples: unmapped.slice(0, 50),
      invalid_samples: invalid.slice(0, 50),
      apps,
    };

    if (args["dry-run"]) {
      console.log(JSON.stringify({ ...output, apps: apps.slice(0, 5) }, null, 2));
      return;
    }

    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`);
    console.log(`Wrote ${apps.length} app(s) to ${outPath}`);
    console.log(`Discovered ${sourceRows.length}; existing ${indexes.count}; duplicates ${duplicates.length}; unmapped ${unmapped.length}; invalid ${invalid.length}.`);
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

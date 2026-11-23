// The 12 app directories built from the indie hacker apps research.
// Each one lists the apps of one research category (categories.json) that do at least
// one of its jobs. An app's main job is its first job; an app is the directory's
// "main" pick when that first job is one of the directory's jobs.
//
// Import only import-free modules here: the cache worker and the import command read it too.
// The import command copies these rows into public.indie_hacker_app_directories so the
// database triggers know which directory pages a changed app belongs to.

import { INDIE_HACKER_APPS_TAG } from "../cache-tags.ts";

export type AppDirectory = {
  /** Flat public URL slug and registry slug, e.g. "payment-providers". */
  slug: string;
  /** Short name for logs and fallbacks. Visible titles come from the registry. */
  name: string;
  /** Research category slug from categories.json. */
  category: string;
  /** Category job ids this directory lists, in filter order. */
  jobs: string[];
  /** Category cost set keys this directory shows, in order. */
  sets: string[];
};

export const appDirectories: AppDirectory[] = [
  { slug: "payment-providers", name: "Payment providers", category: "payments", jobs: ["mor", "gateway", "billing", "links", "crypto"], sets: ["fee"] },
  { slug: "hosting", name: "Hosting", category: "hosting", jobs: ["paas", "vps", "panel", "static"], sets: ["work"] },
  { slug: "databases", name: "Databases", category: "databases", jobs: ["sql", "nosql", "kv", "backend", "vector"], sets: ["sql"] },
  { slug: "file-storage", name: "File storage", category: "databases", jobs: ["files"], sets: ["files"] },
  { slug: "background-jobs", name: "Queues and background jobs", category: "databases", jobs: ["jobs"], sets: ["jobs"] },
  { slug: "uptime-monitoring", name: "Uptime monitoring and status pages", category: "error-monitoring", jobs: ["uptime", "status"], sets: ["uptime"] },
  { slug: "error-tracking", name: "Error tracking and logs", category: "error-monitoring", jobs: ["errors", "logs", "performance", "cron"], sets: ["errors"] },
  { slug: "newsletter-tools", name: "Newsletter and email marketing", category: "email", jobs: ["newsletter", "marketing", "multichannel"], sets: ["subs"] },
  { slug: "transactional-email", name: "Transactional email", category: "email", jobs: ["transactional"], sets: ["appmail"] },
  { slug: "analytics", name: "Analytics", category: "analytics", jobs: ["web", "product", "replay", "revenue"], sets: ["pv"] },
  { slug: "customer-support", name: "Customer support", category: "customer-support", jobs: ["helpdesk", "chat", "ai", "inbox", "kb"], sets: ["agents"] },
  { slug: "auth-providers", name: "Auth", category: "auth", jobs: ["hosted", "library", "server"], sets: ["mau"] },
];

export const appDirectorySlugs = appDirectories.map((directory) => directory.slug);

export function getAppDirectory(slug: string): AppDirectory | undefined {
  return appDirectories.find((directory) => directory.slug === slug);
}

/** Cloudflare purge tag shared by a directory page and its JSON routes. */
export const appDirectoryEdgeTag = (slug: string) => `app-directory:${slug}`;

/** Next.js data tag for one research category's app rows. */
export const indieAppsCategoryTag = (category: string) => `${INDIE_HACKER_APPS_TAG}:${category}`;

export const appDirectoryApiIndexPath = (slug: string) => `/api/app-directories/${slug}/index`;
export const appDirectoryApiAppPath = (slug: string, app: string) => `/api/app-directories/${slug}/apps/${app}`;

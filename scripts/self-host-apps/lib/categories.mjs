export const selfHostAppCategories = [
  { slug: "ai-ml", name: "ai & ml", icon_key: "bot", sort_order: 10 },
  { slug: "automation", name: "automation", icon_key: "bot", sort_order: 20 },
  { slug: "bookmarks-read-it-later", name: "bookmarks & read-it-later", icon_key: "bookmark", sort_order: 30 },
  { slug: "business-commerce", name: "business & commerce", icon_key: "briefcase", sort_order: 40 },
  { slug: "calendars-contacts", name: "calendars & contacts", icon_key: "calendar", sort_order: 50 },
  { slug: "communication", name: "communication", icon_key: "message", sort_order: 60 },
  { slug: "communities-social", name: "communities & social", icon_key: "users", sort_order: 70 },
  { slug: "content-publishing", name: "content & publishing", icon_key: "newspaper", sort_order: 80 },
  { slug: "dashboards", name: "dashboards", icon_key: "layout-dashboard", sort_order: 90 },
  { slug: "databases", name: "databases", icon_key: "database", sort_order: 100 },
  { slug: "developer-tools", name: "developer tools", icon_key: "code-2", sort_order: 110 },
  { slug: "documents-pdfs", name: "documents & pdfs", icon_key: "file-text", sort_order: 120 },
  { slug: "ebooks-libraries", name: "e-books & libraries", icon_key: "book-open", sort_order: 130 },
  { slug: "email-newsletters", name: "email & newsletters", icon_key: "mail", sort_order: 140 },
  { slug: "file-sharing-sync", name: "file sharing & sync", icon_key: "folder-sync", sort_order: 150 },
  { slug: "finance-budgeting", name: "finance & budgeting", icon_key: "wallet", sort_order: 160 },
  { slug: "forms-polls-events", name: "forms, polls & events", icon_key: "pencil-ruler", sort_order: 170 },
  { slug: "games", name: "games", icon_key: "gamepad", sort_order: 180 },
  { slug: "health-fitness", name: "health & fitness", icon_key: "heart-pulse", sort_order: 190 },
  { slug: "home-automation-iot", name: "home automation & iot", icon_key: "house-plug", sort_order: 200 },
  { slug: "identity-access", name: "identity & access", icon_key: "key-round", sort_order: 210 },
  { slug: "knowledge-notes", name: "knowledge & notes", icon_key: "pen-tool", sort_order: 220 },
  { slug: "learning-courses", name: "learning & courses", icon_key: "book-open", sort_order: 230 },
  { slug: "maps-travel", name: "maps & travel", icon_key: "map", sort_order: 240 },
  { slug: "media-servers", name: "media servers", icon_key: "tv", sort_order: 250 },
  { slug: "monitoring-status", name: "monitoring & status", icon_key: "activity", sort_order: 260 },
  { slug: "music-audio", name: "music & audio", icon_key: "music", sort_order: 270 },
  { slug: "networking-dns", name: "networking & dns", icon_key: "network", sort_order: 280 },
  { slug: "password-managers", name: "password managers", icon_key: "key-round", sort_order: 290 },
  { slug: "photos-galleries", name: "photos & galleries", icon_key: "images", sort_order: 300 },
  { slug: "project-task-management", name: "project & task management", icon_key: "layout-dashboard", sort_order: 310 },
  { slug: "recipes-food", name: "recipes & food", icon_key: "utensils", sort_order: 320 },
  { slug: "remote-access", name: "remote access", icon_key: "screen-share", sort_order: 330 },
  { slug: "search", name: "search", icon_key: "search", sort_order: 340 },
  { slug: "security-privacy", name: "security & privacy", icon_key: "shield", sort_order: 350 },
  { slug: "storage-backup", name: "storage & backup", icon_key: "hard-drive", sort_order: 360 },
  { slug: "system-admin-hosting", name: "system admin & hosting", icon_key: "server-cog", sort_order: 370 },
  { slug: "video-conferencing", name: "video & conferencing", icon_key: "video", sort_order: 380 },
  { slug: "wikis", name: "wikis", icon_key: "file-text", sort_order: 390 },
];

export const selfHostAppCategorySlugs = new Set(
  selfHostAppCategories.map((category) => category.slug),
);

export function getSelfHostAppCategory(slug) {
  return selfHostAppCategories.find((category) => category.slug === slug) ?? null;
}

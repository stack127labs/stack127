#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import {
  selfHostAppCategories,
  selfHostAppCategorySlugs,
} from "./lib/categories.mjs";

const categoryMap = new Map(
  Object.entries({
    admin: ["system-admin-hosting"],
    analytics: ["dashboards"],
    automation: ["automation"],
    "archiving-and-digital-preservation": ["storage-backup"],
    "blogging-platforms": ["content-publishing"],
    "booking-and-scheduling": ["forms-polls-events"],
    bookmarks: ["bookmarks-read-it-later"],
    "bookmarks-and-link-sharing": ["bookmarks-read-it-later"],
    books: ["ebooks-libraries"],
    "calendar-contacts": ["calendars-contacts"],
    collaboration: ["communication"],
    "communication-custom-communication-systems": ["communication"],
    "communication-email-complete-solutions": ["email-newsletters"],
    "communication-email-mail-delivery-agents": ["email-newsletters"],
    "communication-email-mail-transfer-agents": ["email-newsletters"],
    "communication-email-mailing-lists-and-newsletters": ["email-newsletters"],
    "communication-email-webmail-clients": ["email-newsletters"],
    "communication-irc": ["communication"],
    "communication-sip": ["communication"],
    "communication-social-networks-and-forums": ["communities-social"],
    "communication-video-conferencing": ["video-conferencing"],
    "communication-xmpp-servers": ["communication"],
    "communication-xmpp-web-clients": ["communication"],
    "community-supported-agriculture": ["business-commerce"],
    "conference-management": ["forms-polls-events"],
    containers: ["system-admin-hosting"],
    "content-management-systems": ["content-publishing"],
    "customer-relationship-management": ["business-commerce"],
    dashboards: ["dashboards"],
    "database-management": ["databases"],
    "developer-tools": ["developer-tools"],
    dns: ["networking-dns"],
    "document-management": ["documents-pdfs"],
    "document-management-e-books": ["ebooks-libraries"],
    "document-management-institutional-repository-and-digital-library-software": ["ebooks-libraries"],
    "document-management-integrated-library-systems": ["ebooks-libraries"],
    documents: ["documents-pdfs"],
    downloads: ["file-sharing-sync"],
    "e-commerce": ["business-commerce"],
    ebooks: ["ebooks-libraries"],
    "feed-readers": ["bookmarks-read-it-later"],
    "file-transfer-object-storage-file-servers": ["storage-backup"],
    "file-transfer-peer-to-peer-filesharing": ["file-sharing-sync"],
    "file-transfer-single-click-drag-n-drop-upload": ["file-sharing-sync"],
    "file-transfer-synchronization": ["file-sharing-sync"],
    "file-transfer-web-based-file-managers": ["file-sharing-sync"],
    files: ["file-sharing-sync"],
    finance: ["finance-budgeting"],
    games: ["games"],
    "games-administrative-utilities-control-panels": ["games"],
    genealogy: ["knowledge-notes"],
    "generative-artificial-intelligence": ["ai-ml"],
    git: ["developer-tools"],
    groupware: ["calendars-contacts", "communication"],
    "health-and-fitness": ["health-fitness"],
    "home-automation": ["home-automation-iot"],
    "human-resources-management": ["business-commerce"],
    identity: ["identity-access"],
    "internet-of-things": ["home-automation-iot"],
    "inventory-management": ["business-commerce"],
    "knowledge-management-tools": ["knowledge-notes"],
    "learning-and-courses": ["learning-courses"],
    manufacturing: ["business-commerce"],
    "maps-and-global-positioning-system": ["maps-travel"],
    media: ["media-servers"],
    "media-management": ["media-servers"],
    "media-streaming-audio-streaming": ["music-audio"],
    "media-streaming-multimedia-streaming": ["media-servers"],
    "media-streaming-video-streaming": ["media-servers"],
    "money-budgeting-management": ["finance-budgeting"],
    monitoring: ["monitoring-status"],
    music: ["music-audio"],
    "network-utilities": ["networking-dns"],
    networking: ["networking-dns"],
    "note-taking-editors": ["knowledge-notes"],
    notes: ["knowledge-notes"],
    notifications: ["communication"],
    "office-suites": ["documents-pdfs"],
    "password-managers": ["password-managers"],
    passwords: ["password-managers"],
    pastebins: ["developer-tools"],
    "personal-dashboards": ["dashboards"],
    "photo-galleries": ["photos-galleries"],
    photos: ["photos-galleries"],
    "polls-and-events": ["forms-polls-events"],
    proxy: ["networking-dns"],
    "read-it-later": ["bookmarks-read-it-later"],
    "recipe-management": ["recipes-food"],
    recipes: ["recipes-food"],
    "remote-access": ["remote-access"],
    requests: ["file-sharing-sync"],
    "resource-planning": ["business-commerce"],
    "reverse-proxy": ["networking-dns"],
    rss: ["bookmarks-read-it-later"],
    "search-engines": ["search"],
    security: ["security-privacy"],
    "self-hosting-solutions": ["system-admin-hosting"],
    "software-development-api-management": ["developer-tools"],
    "software-development-feature-toggle": ["developer-tools"],
    "software-development-ide-tools": ["developer-tools"],
    "software-development-localization": ["developer-tools"],
    "software-development-low-code": ["developer-tools"],
    "software-development-project-management": ["project-task-management"],
    "software-development-testing": ["developer-tools"],
    sync: ["file-sharing-sync"],
    "task-management-to-do-lists": ["project-task-management"],
    ticketing: ["business-commerce"],
    "time-tracking": ["project-task-management"],
    "url-shorteners": ["developer-tools"],
    "video-surveillance": ["security-privacy", "video-conferencing"],
    vpn: ["networking-dns", "security-privacy"],
    "web-servers": ["system-admin-hosting"],
    whiteboards: ["knowledge-notes"],
    whiteboards: ["knowledge-notes"],
    wikis: ["wikis"],
  }),
);

const keywordRules = [
  { slug: "ai-ml", pattern: /\b(ai|llm|machine learning|prompt|embedding|model|neural)\b/i },
  { slug: "photos-galleries", pattern: /\b(photo|photos|image|gallery|album|camera)\b/i },
  { slug: "music-audio", pattern: /\b(audio|music|podcast|radio|mp3|streaming audio)\b/i },
  { slug: "media-servers", pattern: /\b(video|movie|tv show|media server|multimedia|streaming)\b/i },
  { slug: "networking-dns", pattern: /\b(dns|proxy|vpn|network|firewall|tunnel|http|web server)\b/i },
  { slug: "monitoring-status", pattern: /\b(status|monitor|uptime|observability|alert|metrics)\b/i },
  { slug: "home-automation-iot", pattern: /\b(home automation|iot|smart home|mqtt|zigbee|zwave|device)\b/i },
  { slug: "password-managers", pattern: /\b(password|2fa|totp|credential|secret manager)\b/i },
  { slug: "finance-budgeting", pattern: /\b(finance|budget|money|invoice|accounting|payment)\b/i },
  { slug: "recipes-food", pattern: /\b(recipe|meal|food|cooking|shopping list)\b/i },
  { slug: "project-task-management", pattern: /\b(project|task|kanban|todo|issue|ticket|time tracking)\b/i },
  { slug: "bookmarks-read-it-later", pattern: /\b(bookmark|read.?it.?later|rss|feed|link saving)\b/i },
  { slug: "file-sharing-sync", pattern: /\b(file sharing|upload|sync|transfer|send files|file manager)\b/i },
  { slug: "storage-backup", pattern: /\b(backup|archive|object storage|nas|storage)\b/i },
  { slug: "documents-pdfs", pattern: /\b(document|pdf|office|spreadsheet|word processor)\b/i },
  { slug: "ebooks-libraries", pattern: /\b(ebook|e-book|library|book|digital collection)\b/i },
  { slug: "developer-tools", pattern: /\b(api|git|code|developer|testing|ide|localization|pastebin)\b/i },
  { slug: "search", pattern: /\b(search|indexing|search engine)\b/i },
  { slug: "security-privacy", pattern: /\b(security|privacy|auth|identity|access|surveillance)\b/i },
  { slug: "business-commerce", pattern: /\b(crm|e-commerce|shop|inventory|erp|business|customer|commerce)\b/i },
  { slug: "communication", pattern: /\b(chat|message|irc|xmpp|sip|mail|communication)\b/i },
  { slug: "communities-social", pattern: /\b(forum|social|federated|activitypub|community)\b/i },
  { slug: "content-publishing", pattern: /\b(cms|blog|publishing|website|static site)\b/i },
  { slug: "wikis", pattern: /\b(wiki)\b/i },
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function inferCategories(app) {
  const oldSlugs = app.old_category_slugs ?? [];
  const mapped = oldSlugs.flatMap((slug) => {
    if (categoryMap.has(slug)) return categoryMap.get(slug);
    if (selfHostAppCategorySlugs.has(slug)) return [slug];
    return [];
  });
  const text = `${app.name ?? ""} ${app.summary ?? ""} ${oldSlugs.join(" ")}`;
  const keywordMatches = keywordRules
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => rule.slug);

  const categories = unique([...mapped, ...keywordMatches]);

  if (categories.length === 0 && oldSlugs.includes("miscellaneous")) {
    return ["system-admin-hosting"];
  }

  if (categories.length === 0) {
    return ["system-admin-hosting"];
  }

  return categories.slice(0, 3);
}

async function fetchApps(client) {
  const result = await client.query(
    `
      select
        app.id,
        app.slug,
        app.name,
        app.summary,
        coalesce(
          array_agg(category.slug order by category.slug)
            filter (where category.slug is not null),
          array[]::text[]
        ) as old_category_slugs
      from public.self_host_apps app
      left join public.self_host_apps_categories_join_table app_category
        on app_category.app_id = app.id
      left join public.self_host_apps_categories category
        on category.id = app_category.category_id
      group by app.id
      order by app.name
    `,
  );

  return result.rows;
}

async function upsertTaxonomy(client) {
  for (const category of selfHostAppCategories) {
    await client.query(
      `
        insert into public.self_host_apps_categories (slug, name, icon_key, sort_order)
        values ($1, $2, $3, $4)
        on conflict (slug) do update set
          name = excluded.name,
          icon_key = excluded.icon_key,
          sort_order = excluded.sort_order
      `,
      [category.slug, category.name, category.icon_key, category.sort_order],
    );
  }
}

async function replaceLinks(client, appsWithCategories) {
  const categoryResult = await client.query(
    "select id, slug from public.self_host_apps_categories where slug = any($1::text[])",
    [selfHostAppCategories.map((category) => category.slug)],
  );
  const categoryIds = new Map(categoryResult.rows.map((row) => [row.slug, row.id]));

  await client.query("delete from public.self_host_apps_categories_join_table");

  for (const app of appsWithCategories) {
    for (const categorySlug of app.new_category_slugs) {
      await client.query(
        `
          insert into public.self_host_apps_categories_join_table (app_id, category_id)
          values ($1, $2)
          on conflict (app_id, category_id) do nothing
        `,
        [app.id, categoryIds.get(categorySlug)],
      );
    }

    await client.query(
      `
        insert into public.self_host_apps_field_sources (
          app_id,
          field_name,
          source,
          source_url,
          confidence,
          checked_at,
          note
        )
        values ($1, 'categories', 'version127_taxonomy', null, 'medium', now(), $2)
        on conflict (app_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [app.id, `Mapped from: ${app.old_category_slugs.join(", ") || "none"}`],
    );
  }
}

function buildUsage(appsWithCategories) {
  const usage = new Map(selfHostAppCategories.map((category) => [category.slug, 0]));
  for (const app of appsWithCategories) {
    for (const slug of app.new_category_slugs) {
      usage.set(slug, (usage.get(slug) ?? 0) + 1);
    }
  }
  return [...usage.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

async function main() {
  const args = parseArgs();

  await withClient(async (client) => {
    await client.query("begin");

    const apps = await fetchApps(client);
    const appsWithCategories = apps.map((app) => ({
      ...app,
      new_category_slugs: inferCategories(app),
    }));

    await upsertTaxonomy(client);
    await replaceLinks(client, appsWithCategories);

    await client.query(
      "delete from public.self_host_apps_categories where slug <> all($1::text[])",
      [selfHostAppCategories.map((category) => category.slug)],
    );

    const usage = buildUsage(appsWithCategories);
    const uncategorized = appsWithCategories.filter((app) => app.new_category_slugs.length === 0);

    if (args["dry-run"]) {
      await client.query("rollback");
    } else {
      await client.query("commit");
    }

    console.log(
      JSON.stringify(
        {
          mode: args["dry-run"] ? "dry-run" : "write",
          apps: apps.length,
          categories: selfHostAppCategories.length,
          uncategorized: uncategorized.length,
          usage,
        },
        null,
        2,
      ),
    );
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

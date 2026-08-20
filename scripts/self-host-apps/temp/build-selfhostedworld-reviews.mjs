#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [worksheetPath, resolvedPath, outputPath] = process.argv.slice(2);
if (!worksheetPath || !resolvedPath || !outputPath) {
  throw new Error("Usage: build-selfhostedworld-reviews.mjs <worksheet> <resolved-batch> <output>");
}

const worksheet = JSON.parse(await readFile(worksheetPath, "utf8"));
const resolved = JSON.parse(await readFile(resolvedPath, "utf8"));
const bySlug = new Map(resolved.candidates.map((candidate) => [candidate.slug, candidate]));
const checkedAt = new Date().toISOString();

const edits = [
  ["app", "TinyCld", "Workspace for mail, calendars, contacts, files, and documents through separately installable packages.", ["communication", "calendars-contacts", "file-sharing-sync"], "self_hostable", { docker: true, compose: true, database: ["PocketBase"], surfaces: ["web", "mobile", "desktop"] }],
  ["schoco", "Schoco", "Browser-based Java classroom for assigning, testing, and reviewing programming exercises.", ["learning-courses", "developer-tools"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["e-label", "Open E-Label", "Creates QR-linked wine labels with ingredients, nutrition details, allergens, and recycling information.", ["business-commerce", "content-publishing"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["lottie-tools", "Lottie Tools", "Edits Lottie animations and SVG files in a browser with timeline and export controls.", ["content-publishing", "developer-tools"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["re-director", "re:Director", "Manages HTTP redirects through a small web interface and REST API.", ["networking-dns", "system-admin-hosting"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["eventschedule", "Event Schedule", "Publishes event schedules, speaker details, tickets, and attendee updates.", ["forms-polls-events", "business-commerce"], "self_hostable", { sourceAvailable: true, license: ["Attribution Assurance License (custom)", "custom", null], docker: true, database: ["MySQL"], surfaces: ["web"] }],
  ["tuxseo", "TuxSEO", "Researches search topics and helps plan and draft articles from a private deployment.", ["content-publishing", "automation"], "self_hostable", { docker: true, compose: true, database: ["PostgreSQL", "Redis"], maintenance: "archived", surfaces: ["web"] }],
  ["github-ntfy", "ntfy alerts", "Sends GitHub and Docker Hub release alerts to ntfy, Gotify, Discord, or Slack.", ["automation", "monitoring-status"], "self_hostable", { docker: true }],
  ["pixlstash", "PixlStash", "Organizes photos with searchable metadata, tags, and optional local image analysis.", ["photos-galleries"], "self_hostable", { docker: true, surfaces: ["web", "desktop"] }],
  ["replaya", "RePlaya", "Records and replays browser sessions live or after they finish using S2 streams.", ["monitoring-status", "developer-tools"], "self_hostable", { databaseRequired: false, surfaces: ["web"] }],
  ["honeywire", "HoneyWire", "Deploys network canaries and reports high-signal activity through a central dashboard.", ["security-privacy", "monitoring-status"], "self_hostable", { docker: true, compose: true, database: ["SQLite"], surfaces: ["web"] }],
  ["fungible", "Fungible", "Tracks personal finances from a terminal or desktop app with a shared local data store.", ["finance-budgeting"], "not_self_hostable", { surfaces: ["desktop", "cli"] }],
  ["will-be-done", "Will Be Done", "Plans tasks on an offline-first weekly timeline that syncs across devices.", ["project-task-management"], "self_hostable", { docker: true, database: ["SQLite"], surfaces: ["web", "mobile", "desktop"] }],
  ["uploady", "Uploady", "Shares uploaded files through a PHP web interface with user and administration controls.", ["file-sharing-sync"], "self_hostable", { database: ["MySQL"], surfaces: ["web"] }],
  ["machtiani", "Machtiani", "Lets coding agents discuss and navigate large repositories through a terminal client and local service.", ["ai-ml", "developer-tools"], "self_hostable", { compose: true, surfaces: ["cli", "web"] }],
  ["pikoci", "PikoCI", "Runs portable CI and CD pipelines from one binary with pluggable SQL storage and runners.", ["automation", "developer-tools"], "self_hostable", { docker: true, database: ["SQLite", "MySQL", "PostgreSQL"], surfaces: ["web", "cli"] }],
  ["homebutler", "HomeButler", "Checks servers, containers, backups, ports, and service health from one binary.", ["system-admin-hosting", "monitoring-status"], "self_hostable", { databaseRequired: false, surfaces: ["web", "cli"] }],
  ["youtube-dl-nas", "youtube-dl-nas", "Queues video and audio downloads from shared links and stores the results on a NAS.", ["media-servers"], "self_hostable", { docker: true, surfaces: ["web", "mobile"] }],
  ["assets", "Assets", "Tracks physical assets, assignments, maintenance, and related records.", ["business-commerce"], "unknown", { decision: "needs_review", reason: "No project license was found in the official repository; the README's open-source claim is not a license grant." }],
  ["materia", "Materia", "Applies Git-managed Podman Quadlet configurations across one or more Linux hosts.", ["system-admin-hosting", "automation"], "self_hostable", { surfaces: ["cli"] }],
  ["mejiro", "Pellicola", "Publishes a lightweight photo gallery from files and metadata on a web server.", ["photos-galleries"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["ikuyo", "Ikuyo", "Plans trips with day-by-day itineraries, places, notes, and shareable views.", ["maps-travel"], "self_hostable", { surfaces: ["web"] }],
  ["jauth", "Jauth", "Adds authentication and single sign-on in front of services through a reverse proxy.", ["identity-access", "security-privacy"], "self_hostable", { surfaces: ["web"] }],
  ["webarchive", "Own Webarchive", "Saves web pages and browses captured copies from a small Go service.", ["bookmarks-read-it-later", "storage-backup"], "self_hostable", { docker: true, databaseRequired: false, surfaces: ["web"] }],
  ["cloud-seeder", "Cloud Seeder", "Guides users through provisioning and configuring a server from a web interface.", ["system-admin-hosting"], "self_hostable", { sourceAvailable: true, license: ["COOLER 1.0", "custom", null], surfaces: ["web"] }],
  ["rgit", "rgit", "Serves browsable web pages for repositories stored as bare Git directories.", ["developer-tools"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["txtdot", "txtdot", "Returns a readable text view of web pages through a lightweight HTTP proxy.", ["networking-dns", "content-publishing"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["bigtree-cms", "BigTree CMS", "Builds and manages custom websites through a PHP content management interface.", ["content-publishing"], "self_hostable", { license: ["GNU Lesser General Public License", "copyleft", null], surfaces: ["web"] }],
  ["ptah-sh", "Ptah.sh", "Deploys applications and supporting services to Docker Swarm from a web control plane.", ["system-admin-hosting", "automation"], "self_hostable", { sourceAvailable: true, license: ["FSL-1.1-Apache-2.0", "custom", null], maintenance: "archived", docker: true, surfaces: ["web"] }],
  ["oxid-eshop", "OXID eShop Community Edition", "Runs an online shop with catalog, checkout, order, and extension management.", ["business-commerce"], "self_hostable", { sourceAvailable: true, license: ["OXID eShop Community Edition License 2022", "custom", null], database: ["MySQL"], surfaces: ["web"] }],
  ["rejourney", "Rejourney", "Captures product analytics and session replays for privately operated applications.", ["monitoring-status", "developer-tools"], "self_hostable", { sourceAvailable: true, license: ["SSPL-1.0 and Apache-2.0", "mixed", null], docker: true, compose: true, surfaces: ["web"] }],
  ["word-mastermind", "Word Mastermind", "Runs an endless Wordle-style guessing game in a browser.", ["games"], "self_hostable", { docker: true, surfaces: ["web"] }],
  ["tinyclaw", "TinyClaw", "Runs a local AI companion with memory, tools, and multiple model providers.", ["ai-ml"], "not_self_hostable", { maintenance: "active", surfaces: ["desktop", "cli"] }],
  ["runtm", "Runtm", "Provides isolated execution environments for AI agents and developer tools.", ["ai-ml", "developer-tools"], "self_hostable", { license: ["AGPL-3.0, Apache-2.0, and MIT", "mixed", null], docker: true, surfaces: ["web", "cli"] }],
  ["ui-bakery", "UI Bakery", "", [], "unknown", { decision: "reject", reason: "The public repository contains on-premise deployment configuration, not the application's public source code, and requires a commercial license key." }],
  ["quizmaster", "Quizmaster", "Hosts live multiplayer quizzes that participants join from their browsers.", ["forms-polls-events", "games"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["bitmappery", "BitMappery", "Edits bitmap images in a browser with layers, filters, and drawing tools.", ["photos-galleries"], "self_hostable", { docker: true, surfaces: ["web"] }],
  ["collabst", "Collabst", "Provides a shared browser canvas for notes, sketches, and lightweight collaboration.", ["communication", "project-task-management"], "not_self_hostable", { maintenance: "stale", surfaces: ["web"] }],
  ["litecart", "myCart", "Runs a small online store with products, orders, customers, and an administration area.", ["business-commerce"], "self_hostable", { database: ["SQLite"], surfaces: ["web"] }],
  ["feedpushr", "Feedpushr", "Collects feeds, applies filters and transformations, and sends entries to configured outputs.", ["content-publishing", "automation"], "self_hostable", { docker: true, surfaces: ["web"] }],
  ["larasend", "Larasend", "Routes and monitors transactional email through Amazon SES or Cloudflare Email Routing.", ["email-newsletters", "monitoring-status"], "self_hostable", { docker: true, compose: true, database: ["PostgreSQL", "Redis"], surfaces: ["web"] }],
  ["voltius", "Voltius", "Connects to SSH, SFTP, and serial sessions from a desktop app for macOS, Windows, and Linux.", ["remote-access", "developer-tools"], "not_self_hostable", { surfaces: ["desktop"] }],
  ["fablecut", "FableCut", "Edits video in a browser and exposes editing operations through REST and MCP interfaces.", ["content-publishing", "ai-ml"], "self_hostable", { surfaces: ["web"] }],
  ["openmanus", "OpenManus", "Runs a general-purpose AI agent that can use tools, browsers, and configured language models.", ["ai-ml", "automation"], "not_self_hostable", { sourceUrl: "https://github.com/FoundationAgents/OpenManus", license: ["MIT", "permissive", "MIT"], surfaces: ["cli"] }],
  ["booklore", "BookLore", "Organizes ebooks and comics for browsing, reading, metadata editing, and device delivery.", ["ebooks-libraries"], "self_hostable", { docker: true, compose: true, database: ["MariaDB"], surfaces: ["web"] }],
  ["rconcli", "rcon-cli", "Sends RCON commands to game servers from a terminal or automation script.", ["games", "developer-tools"], "not_self_hostable", { surfaces: ["cli"] }],
  ["bin", "bin", "Shares text snippets from a small service with no external database.", ["content-publishing"], "self_hostable", { license: ["WTFPL OR 0BSD", "mixed", "WTFPL OR 0BSD"], databaseRequired: false, surfaces: ["web", "cli"] }],
  ["meilisearch-ui", "Meilisearch UI", "Browses indexes, documents, settings, and tasks in a Meilisearch server.", ["search", "databases"], "self_hostable", { docker: true, surfaces: ["web"] }],
  ["ourboard", "OurBoard", "Provides a shared whiteboard for drawing and arranging ideas with other participants.", ["communication", "project-task-management"], "self_hostable", { docker: true, database: ["PostgreSQL"], surfaces: ["web"] }],
  ["weddingshare", "WeddingShare", "", [], "unknown", { decision: "duplicate", projectId: "5d6d9ce3-b10d-4c9d-8c4b-ca7faf056156", reason: "WeddingShare was renamed and moved to the existing Memtly project." }],
  ["centaur", "Centaur", "Runs shared AI agents for teams and connects them to Slack and internal tools.", ["ai-ml", "communication"], "self_hostable", { license: ["MIT OR Apache-2.0", "mixed", "MIT OR Apache-2.0"], docker: true, surfaces: ["web"] }],
  ["rahoot", "Razzia", "Hosts real-time quiz rooms that participants join from their browsers.", ["forms-polls-events", "games"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["gomodel", "GoModel", "Routes requests across language-model providers through one OpenAI-compatible API.", ["ai-ml", "developer-tools"], "self_hostable", { docker: true, database: ["Redis", "PostgreSQL", "MongoDB"], surfaces: ["web", "cli"] }],
  ["revert", "Revert", "Connects applications to third-party APIs through a unified integration service.", ["automation", "developer-tools"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["traceway", "Traceway", "Collects OpenTelemetry traces, metrics, and logs for application debugging.", ["monitoring-status", "developer-tools"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["codiff", "Codiff", "Shows code changes in a focused desktop diff viewer.", ["developer-tools"], "not_self_hostable", { surfaces: ["desktop"] }],
  ["briefkasten", "Briefkasten", "Saves bookmarks for later reading with tags, search, and a browser interface.", ["bookmarks-read-it-later"], "self_hostable", { surfaces: ["web"] }],
  ["drawpile", "Drawpile", "Lets multiple artists draw on the same canvas through a shared drawing server.", ["communication", "photos-galleries"], "self_hostable", { surfaces: ["desktop"] }],
  ["pico", "pico", "Publishes text, feeds, and simple web services through SSH-driven command-line tools.", ["content-publishing", "developer-tools"], "self_hostable", { surfaces: ["web", "cli"] }],
  ["openship", "Openship", "Builds and deploys applications to a Linux server from a dashboard, desktop app, or CLI.", ["system-admin-hosting", "automation"], "self_hostable", { docker: true, compose: true, surfaces: ["web", "desktop", "cli"] }],
  ["dirac", "Dirac", "Refactors code with an AI coding agent designed to conserve context and model tokens.", ["ai-ml", "developer-tools"], "not_self_hostable", { surfaces: ["cli"] }],
  ["omniclip", "Omniclip", "Edits video locally in a browser without uploading source media to a server.", ["content-publishing"], "not_self_hostable", { surfaces: ["web"] }],
  ["zerostack", "zerostack", "Runs a terminal coding agent with multiple model providers, tools, permissions, and MCP support.", ["ai-ml", "developer-tools"], "not_self_hostable", { surfaces: ["cli"] }],
  ["kirby", "Kirby", "Builds custom content-managed websites around a file-based PHP core and configurable editor.", ["content-publishing"], "self_hostable", { sourceAvailable: true, license: ["Kirby License Agreement", "custom", null], surfaces: ["web"] }],
  ["keygen", "Keygen", "Issues and validates software licenses, entitlements, activations, and signed artifacts.", ["developer-tools", "identity-access"], "self_hostable", { sourceAvailable: true, license: ["FCL-1.0-ALv2", "custom", null], surfaces: ["web"] }],
  ["classroomio", "ClassroomIO", "Runs employee training, customer education, courses, cohorts, and certifications.", ["learning-courses"], "self_hostable", { docker: true, database: ["PostgreSQL", "Redis"], surfaces: ["web"] }],
  ["forward-email", "Forward Email", "Runs encrypted email forwarding, mailboxes, calendars, contacts, and outbound delivery.", ["email-newsletters", "calendars-contacts"], "self_hostable", { sourceAvailable: true, license: ["MPL-2.0 and BUSL-1.1", "mixed", null], database: ["MongoDB", "Redis"], surfaces: ["web"] }],
  ["deltachat-android", "Delta Chat for Android", "Provides encrypted chat over email from an Android application.", ["communication", "email-newsletters"], "not_self_hostable", { surfaces: ["mobile"] }],
  ["monosketch", "MonoSketch", "Creates ASCII diagrams, flowcharts, and text art entirely in a browser.", ["developer-tools", "content-publishing"], "not_self_hostable", { surfaces: ["web"] }],
  ["once", "ONCE", "Installs, updates, backs up, and monitors Docker applications on a Linux or macOS host.", ["system-admin-hosting", "automation"], "self_hostable", { license: ["MIT", "permissive", "MIT"], docker: true, surfaces: ["cli"] }],
  ["agent-vault", "Agent Vault", "Brokers API credentials for AI agents without exposing the underlying secrets to them.", ["security-privacy", "ai-ml"], "self_hostable", { license: ["MIT with enterprise-directory exception", "mixed", null], surfaces: ["web", "cli"] }],
  ["yaade", "Yaade", "Stores and shares API requests, collections, scripts, and documentation within a team.", ["developer-tools"], "self_hostable", { license: ["MIT", "permissive", "MIT"], docker: true, databaseRequired: false, surfaces: ["web"] }],
  ["chatto", "Chatto", "Hosts group and team conversations with a browser-based chat interface.", ["communication", "communities-social"], "self_hostable", { license: ["AGPL-3.0-or-later with Apache-2.0 exceptions", "mixed", null], surfaces: ["web"] }],
  ["emailwiz", "emailwiz", "Configures Postfix, Dovecot, SpamAssassin, OpenDKIM, TLS, and fail2ban on Debian or Ubuntu.", ["email-newsletters", "system-admin-hosting"], "self_hostable", { databaseRequired: false, surfaces: ["cli"] }],
  ["netwatch", "NetWatch", "Inspects live network traffic, associates connections with processes, and flags suspicious patterns.", ["networking-dns", "security-privacy"], "not_self_hostable", { surfaces: ["cli"] }],
  ["bionicgpt", "BionicGPT", "Provides team chat, assistants, and retrieval workflows for language models on private infrastructure.", ["ai-ml", "knowledge-notes"], "self_hostable", { sourceAvailable: true, license: ["BUSL-1.1 with MIT future license", "custom", null], docker: true, compose: true, database: ["PostgreSQL"], surfaces: ["web"] }],
  ["linuxcnc", "LinuxCNC", "Controls mills, lathes, 3D printers, cutters, robot arms, and other CNC machinery.", ["home-automation-iot"], "not_self_hostable", { license: ["LGPL-3.0 and GPL-2.0", "mixed", null], surfaces: ["desktop"] }],
  ["rmux", "RMUX", "Multiplexes terminal sessions and exposes typed Rust, Python, and TypeScript control interfaces.", ["developer-tools", "remote-access"], "not_self_hostable", { license: ["MIT OR Apache-2.0", "mixed", "MIT OR Apache-2.0"], surfaces: ["cli"] }],
  ["sharetribe", "Sharetribe Go", "Runs a configurable marketplace with listings, transactions, payments, and user accounts.", ["business-commerce"], "self_hostable", { sourceAvailable: true, license: ["Sharetribe Community Public License 1.0", "custom", null], maintenance: "archived", database: ["MySQL"], surfaces: ["web"] }],
  ["homelable", "Homelable", "Maps homelab devices and services with network discovery, imports, and live health checks.", ["system-admin-hosting", "monitoring-status", "networking-dns"], "self_hostable", { docker: true, compose: true, surfaces: ["web"] }],
  ["firecamp", "Firecamp", "Designs, tests, and documents REST, GraphQL, WebSocket, and Socket.IO APIs.", ["developer-tools"], "not_self_hostable", { surfaces: ["web", "desktop"] }],
  ["audiomass", "AudioMass", "Edits and mixes audio tracks directly in a browser.", ["music-audio", "content-publishing"], "self_hostable", { databaseRequired: false, surfaces: ["web"] }],
  ["open-terminal", "Open Terminal", "Gives AI agents a remote shell, files, search, and code execution through an HTTP API.", ["ai-ml", "developer-tools"], "self_hostable", { docker: true, databaseRequired: false, surfaces: ["web", "cli"] }],
  ["cstate", "cState", "Generates a static status page with incidents, an API, and optional content editing.", ["monitoring-status"], "self_hostable", { docker: true, databaseRequired: false, surfaces: ["web"] }],
];

const specialLicenseBySlug = new Map(edits.filter((edit) => edit[5]?.license).map((edit) => [edit[0], edit[5].license]));

function detectLicense(record) {
  const special = specialLicenseBySlug.get(record.slug);
  if (special) return special;
  const text = record.license_excerpt ?? "";
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/.test(text)) return ["AGPL-3.0", "copyleft", "AGPL-3.0-only"];
  if (/GNU GENERAL PUBLIC LICENSE\s+Version 3/.test(text) || /^Version 3, 29 June 2007/.test(text)) return ["GPL-3.0", "copyleft", "GPL-3.0-only"];
  if (/GNU GENERAL PUBLIC LICENSE\s+Version 2/.test(text)) return ["GPL-2.0", "copyleft", "GPL-2.0-only"];
  if (/Apache License\s+Version 2/.test(text) || /licensed under the Apache 2 license/i.test(text)) return ["Apache-2.0", "permissive", "Apache-2.0"];
  if (/MIT License|The MIT License|licensed under the MIT license/i.test(text)) return ["MIT", "permissive", "MIT"];
  if (/Redistribution and use in source and binary forms/.test(text)) return ["BSD-3-Clause", "permissive", "BSD-3-Clause"];
  if (/DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE/.test(text)) return ["WTFPL", "public_domain", "WTFPL"];
  throw new Error(`${record.slug}: unclassified license`);
}

function source(fieldName, sourceName, url, note = null, confidence = "high") {
  return { field_name: fieldName, source: sourceName, source_url: url, confidence, checked_at: checkedAt, ...(note ? { note } : {}) };
}

function hasValue(value) {
  if (value === null || value === undefined || value === "unknown") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function hostFor(url) {
  const host = new URL(url).hostname;
  if (host === "github.com") return "github";
  if (host === "codeberg.org") return "codeberg";
  if (host === "gitlab.com") return "gitlab";
  return "other";
}

const reviews = worksheet.records.map((record, index) => {
  const edit = edits[index];
  if (!edit || edit[0] !== record.slug) throw new Error(`Editorial record mismatch at ${index + 1}: ${record.slug}`);
  const [slug, name, summary, categories, selfHostingStatus, options = {}] = edit;
  if (options.decision) {
    return {
      candidate_id: record.candidate_id,
      decision: options.decision,
      ...(options.projectId ? { project_id: options.projectId } : {}),
      reason: options.reason,
    };
  }

  const sourceCodeUrl = options.sourceUrl ?? record.repository_url;
  const sourceCodeHost = hostFor(sourceCodeUrl);
  const repositoryUrl = sourceCodeUrl;
  const license = detectLicense(record);
  const licenseUrl = options.sourceUrl === "https://github.com/FoundationAgents/OpenManus"
    ? "https://github.com/FoundationAgents/OpenManus/blob/main/LICENSE"
    : slug === "once"
      ? "https://github.com/orgs/basecamp/repositories"
      : record.license_url ?? `${repositoryUrl}#license`;
  const owner = new URL(repositoryUrl).pathname.split("/").filter(Boolean)[0];
  const iconUrl = options.sourceUrl
    ? `https://opengraph.githubassets.com/stack127/${new URL(repositoryUrl).pathname.slice(1)}`
    : record.repository_image_url;
  const websiteUrl = record.repository_homepage_url ?? null;
  const installDocsUrl = selfHostingStatus === "self_hostable" ? repositoryUrl : null;
  const project = {
    slug,
    name,
    summary,
    icon_url: iconUrl,
    website_url: websiteUrl,
    source_code_url: sourceCodeUrl,
    source_code_host: sourceCodeHost,
    docs_url: null,
    install_docs_url: installDocsUrl,
    docker_url: options.docker ? repositoryUrl : null,
    license: license[0],
    license_type: license[1],
    license_spdx_id: license[2],
    source_model: options.sourceAvailable ? "source_available" : "open_source",
    publisher_name: owner,
    publisher_type: "unknown",
    publisher_url: `${new URL(repositoryUrl).origin}/${owner}`,
    published: true,
    self_hosting_status: selfHostingStatus,
    maintenance_status: options.maintenance ?? "active",
    docker_support: options.docker ? "official" : "unknown",
    compose_support: options.compose ?? null,
    requires_database: options.database ? true : options.databaseRequired ?? null,
    database_types: options.database ?? [],
    ram_mb: null,
    storage_profile: "unknown",
    surfaces: options.surfaces ?? [],
    categories,
    summary_source: "curated",
    summary_confidence: "high",
  };
  const editorialUrl = record.readme_url ?? repositoryUrl;
  const fieldSources = [
    source("summary", "stack127_curated", editorialUrl, "Written from the verified upstream project documentation."),
    source("categories", "stack127_curated", editorialUrl, "Assigned by project purpose after editorial review."),
    source("icon_url", "official_repository", iconUrl, "Official repository social image.", "medium"),
    source("source_code_url", "official_repository", repositoryUrl),
    source("source_code_host", "official_repository", repositoryUrl),
    source("license", "repository_license", licenseUrl),
    source("license_type", "repository_license", licenseUrl),
    ...(project.license_spdx_id ? [source("license_spdx_id", "repository_license", licenseUrl)] : []),
    source("source_model", "repository_license", licenseUrl),
    source("publisher_name", "official_repository", repositoryUrl),
    source("publisher_url", "official_repository", repositoryUrl),
    source("self_hosting_status", "official_repository", installDocsUrl ?? editorialUrl),
    source("summary_source", "stack127_curated", editorialUrl),
    source("summary_confidence", "stack127_curated", editorialUrl),
  ];
  if (websiteUrl) fieldSources.push(source("website_url", "official_repository", repositoryUrl));
  if (installDocsUrl) fieldSources.push(source("install_docs_url", "official_documentation", editorialUrl));
  if (options.docker) {
    fieldSources.push(source("docker_url", "official_documentation", editorialUrl));
    fieldSources.push(source("docker_support", "official_documentation", editorialUrl));
  }
  for (const field of ["compose_support", "requires_database", "database_types", "surfaces"]) {
    if (hasValue(project[field])) fieldSources.push(source(field, "official_documentation", editorialUrl));
  }
  return { candidate_id: record.candidate_id, decision: "publish", project, field_sources: fieldSources };
});

const nonGithub = [
  ["phice", "Phice", "Browses public Facebook pages through a lightweight frontend without ads, trackers, JavaScript, or an account.", ["communities-social", "security-privacy"], "AGPL-3.0", "copyleft", "AGPL-3.0-only", "https://codeberg.org/c4ffe14e/phice", "https://codeberg.org/c4ffe14e/phice/src/branch/main/README.md", "https://codeberg.org/c4ffe14e/phice/src/branch/main/LICENSE", "https://codeberg.org/repo-avatars/f553011634a6f04759c2739b9363783a1078fb33b7b8a3a770295c5db49e8e3e", ["web"], true, true, null],
  ["vixipy", "Vixipy", "Browses Pixiv artwork through a privacy-focused frontend with no Pixiv account required.", ["photos-galleries", "security-privacy"], "AGPL-3.0", "copyleft", "AGPL-3.0-only", "https://codeberg.org/vixipy/Vixipy", "https://codeberg.org/vixipy/Vixipy/src/branch/main/doc/INSTALL.md", "https://codeberg.org/vixipy/Vixipy/src/branch/main/LICENSE", "https://codeberg.org/avatars/ef3530a7ca206c4e1f632173207e6ce9827b56adf7e9e6f519d87032f66b38fe", ["web"], true, true, null],
  ["epicyon", "Epicyon", "Runs a lightweight ActivityPub community with calendars, news, sharing, and file-based storage.", ["communities-social", "communication"], "AGPL-3.0", "copyleft", "AGPL-3.0-only", "https://codeberg.org/bashrc/epicyon", "https://codeberg.org/bashrc/epicyon/src/branch/main/INSTALL.md", "https://codeberg.org/bashrc/epicyon/src/branch/main/LICENSE", "https://codeberg.org/repo-avatars/21501-09dbae5f4ed833828f4d20e7fc0e48ab", ["web"], false, null, false],
  ["tiddlypwa", "TiddlyPWA", "Adds encrypted offline storage and cross-device synchronization to TiddlyWiki.", ["knowledge-notes", "wikis"], "0BSD", "permissive", "0BSD", "https://codeberg.org/valpackett/tiddlypwa", "https://tiddly.packett.cool", "https://codeberg.org/valpackett/tiddlypwa/src/branch/trunk/LICENSE", "https://codeberg.org/avatars/7a133ae1fdf6d14b8c1da35b848be070", ["web"], false, null, true],
  ["seppo", "Seppo", "Publishes a personal social feed that federates with ActivityPub services.", ["communities-social", "content-publishing"], "GPL-3.0", "copyleft", "GPL-3.0-only", "https://codeberg.org/seppo/seppo", "https://seppo.mro.name/downloads", "https://codeberg.org/seppo/seppo/src/branch/ma/LICENSE", "https://codeberg.org/repo-avatars/77385-b2fdd682b4bf00106bae0162fb66fc2c", ["web"], false, null, false],
  ["mistborn", "Mistborn", "Builds a private network around WireGuard, DNS filtering, firewall rules, and managed service containers.", ["networking-dns", "security-privacy", "system-admin-hosting"], "MIT", "permissive", "MIT", "https://gitlab.com/cyber5k/mistborn", "https://gitlab.com/cyber5k/mistborn/-/blob/master/README.md#quickstart", "https://gitlab.com/cyber5k/mistborn/-/blob/master/LICENSE", "https://gitlab.com/uploads/-/system/project/avatar/17334238/green_shield.png", ["web"], true, true, true],
];

for (const item of nonGithub) {
  const [slug, name, summary, categories, license, licenseType, spdx, repositoryUrl, installUrl, licenseUrl, iconUrl, surfaces, docker, compose, databaseRequired] = item;
  const candidate = bySlug.get(slug);
  if (!candidate) throw new Error(`Missing candidate ${slug}`);
  const host = hostFor(repositoryUrl);
  const owner = new URL(repositoryUrl).pathname.split("/").filter(Boolean)[0];
  const project = {
    slug, name, summary, icon_url: iconUrl, website_url: null, source_code_url: repositoryUrl, source_code_host: host,
    docs_url: null, install_docs_url: installUrl, docker_url: docker ? installUrl : null,
    license, license_type: licenseType, license_spdx_id: spdx, source_model: "open_source",
    publisher_name: owner, publisher_type: "unknown", publisher_url: `${new URL(repositoryUrl).origin}/${owner}`,
    published: true, self_hosting_status: "self_hostable", maintenance_status: "active",
    docker_support: docker ? "official" : "unknown", compose_support: compose,
    requires_database: databaseRequired, database_types: [], ram_mb: null, storage_profile: "unknown", surfaces,
    categories, summary_source: "curated", summary_confidence: "high",
  };
  const fieldSources = [
    source("summary", "stack127_curated", installUrl, "Written from verified upstream documentation."),
    source("categories", "stack127_curated", installUrl, "Assigned by project purpose after editorial review."),
    source("icon_url", "official_repository", iconUrl, "Official repository or publisher avatar.", "medium"),
    source("source_code_url", "official_repository", repositoryUrl), source("source_code_host", "official_repository", repositoryUrl),
    source("license", "repository_license", licenseUrl), source("license_type", "repository_license", licenseUrl),
    source("license_spdx_id", "repository_license", licenseUrl), source("source_model", "repository_license", licenseUrl),
    source("publisher_name", "official_repository", repositoryUrl), source("publisher_url", "official_repository", repositoryUrl),
    source("self_hosting_status", "official_documentation", installUrl), source("install_docs_url", "official_documentation", installUrl),
    source("summary_source", "stack127_curated", installUrl), source("summary_confidence", "stack127_curated", installUrl),
    source("surfaces", "official_documentation", installUrl),
  ];
  if (docker) {
    fieldSources.push(source("docker_url", "official_documentation", installUrl));
    fieldSources.push(source("docker_support", "official_documentation", installUrl));
  }
  if (compose !== null) fieldSources.push(source("compose_support", "official_documentation", installUrl));
  if (databaseRequired !== null) fieldSources.push(source("requires_database", "official_documentation", installUrl));
  reviews.push({ candidate_id: candidate.id, decision: "publish", project, field_sources: fieldSources });
}

const spooty = bySlug.get("spooty");
if (!spooty) throw new Error("Missing Spooty candidate");
reviews.push({
  candidate_id: spooty.id,
  decision: "needs_review",
  reason: "The upstream repository was removed in May 2026 and no verified successor or maintainer-approved fork was found.",
});

await writeFile(outputPath, `${JSON.stringify({ reviewed_at: checkedAt, records: reviews }, null, 2)}\n`);
console.log(JSON.stringify({
  records: reviews.length,
  publish: reviews.filter((review) => review.decision === "publish").length,
  duplicate: reviews.filter((review) => review.decision === "duplicate").length,
  reject: reviews.filter((review) => review.decision === "reject").length,
  needs_review: reviews.filter((review) => review.decision === "needs_review").length,
  source_available: reviews.filter((review) => review.project?.source_model === "source_available").length,
  output: outputPath,
}, null, 2));

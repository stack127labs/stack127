# Directory record pages: plan

**On hold, November 1, 2026.** The owner decided not to add new pages for now: no category pages and no app pages. The current work fixes existing pages only. Keep this plan for reference. The one part going ahead is adding the missing apps (Forgejo, GitLab, OneDev, GlitchTip) to the self-host apps data.

Planning date: November 1, 2026. This plan answers audit item T2 in [the search traffic audit](../../dev-space/2026-10-25-search-traffic-audit.md). It changes no code, data, or settings. Counts below come from read-only queries on the development database on November 1. Development copies production self-host records, so the counts should match production closely, but check them again before publishing.

## The short version

- Pilot the **self-host apps** directory first.
- Build **category pages** at `/self-host-apps/categories/<slug>`, such as "self-hosted password managers". Each one compares 5 to 12 reviewed apps in normal, server-rendered HTML.
- **Don't build one page per app yet.** The data can't support "Vaultwarden requirements" pages: only 24 of 4,975 published apps have a publisher RAM minimum, and 4,285 of the RAM estimates are low confidence.
- The pilot is **20 category pages**. 17 can start now. 3 need missing apps added first.
- Bing is the main judge, as the audit says. We decide at week 6 and week 10 whether to scale up or stop.

## 1. Which directory to pilot first

**Self-host apps.** It has the only real search signal of the large directories, the best data, and a search market that rewards category pages.

| Factor | Self-host apps | CLI apps | Others |
| --- | --- | --- | --- |
| Search signal | 601 Google impressions at average position 62, July 26 to October 23. That's the second-highest main-site page. | No row in the audit's top pages. | Ad networks already have 40+ child pages. Launch directory children are noindex on purpose (audit T5). TLDs are code records and need different work. |
| Records | 4,975 published apps, 42 categories | 309 published apps | |
| Data per record | License for 4,121 apps, Docker image for 3,197, Compose link for 1,673, a release in the last 12 months for 1,580, every row has a check date | Smaller set with fewer facts per row | |
| How competitors win | Category pages. awesome-selfhosted.net has about 100 `tags/<slug>.html` pages. openalternative.co and selfhostyourself.com rank with category and tag pages. selfh.st/apps is one filtered app with no per-app or per-category URLs. | | |

Searches like "self-hosted password manager" or "self-hosted Google Photos alternative" return list pages, guides, and vendor pages. Nobody ranks a single page that holds 5,000 apps. A focused, checked comparison per category is the format that already wins these results.

CLI apps can reuse the same template later, for searches like "terminal file managers". Wait until the self-host pilot has results.

### Why not app pages first

The audit's example of an entity page was "Vaultwarden: self-hosting requirements". The data can't keep that promise for most apps.

| Fact | Apps with it |
| --- | ---: |
| Publisher RAM minimum (`ram_min_mb`) | 24 |
| Publisher recommended RAM | 15 |
| Publisher storage minimum | 10 |
| RAM estimate, high confidence | 48 |
| RAM estimate, medium confidence | 576 |
| RAM estimate, low confidence | 4,285 |

An app page made mostly of rough estimates, a license, and a Docker link repeats the project's own README. It's thin next to the official docs that already rank for "<app> requirements".

There's also a hard limit. The static export holds 574 pages in 7,172 files today, so 12,828 files are left under Cloudflare Free's 20,000. At today's ratio of about 12 files per page, that's room for roughly 1,000 more pages. One page per app, nearly 5,000 pages, won't fit.

## 2. Page types

### Category page (the pilot)

| Part | Rule |
| --- | --- |
| URL | `/self-host-apps/categories/<slug>`, such as `/self-host-apps/categories/password-managers`. This is the path `caching.md` and `seo.md` already name for indexable categories. It leaves `/self-host-apps/<app-slug>` free for app pages later, and the database triggers already expect that pattern. |
| Who it's for | Someone searching "self-hosted <thing>" or "self-hosted <product> alternative". |
| Members | A reviewed list of apps, not the raw category link. The raw links are noisy. "Photos & galleries" includes watchtower, Plex, and TeamCity. "Password managers" includes YOURLS and Sinusbot. |

What the page shows, top to bottom:

1. Breadcrumbs: Self-host apps, then the category name.
2. The H1 and a short intro (MDX).
3. A comparison table, one row per app: name, license or source model, install methods (Docker, Compose, package, installer), whether it needs a separate database, estimated RAM with its confidence label, latest release and date, rounded GitHub stars, and the date we checked it.
4. One short section per app, visible, with an anchor such as `#vaultwarden`: its summary, install links, the resource estimate with its basis and source link, and source and docs links. These are the same facts the hidden dialog shows today, now in plain HTML.
5. "How to choose" (MDX): which app fits which situation, in a short table. This is what makes each page more than a list.
6. A note on method and estimates. It's one shared MDX file that links to the `/self-host-apps` sections that explain estimates.
7. Links to related categories and tools, such as `/self-hosted-app-resource-planner`, `/restic-retention-simulator`, and `/software-licenses-for-self-hosting`.

The page has no filters, search, or query state. It's one static view.

### Which apps can be on a page

An app is listed only when all of these hold:

- It's published, self-hostable, and a real application. Helper containers, image variants, runners, and duplicate rows don't count.
- It has a verified install path: a Docker image, a Compose link, or an official package or install guide.
- Its license or source model is known.
- It had a release or commit in the last 24 months.
- It has a RAM estimate. The page shows the confidence label next to it.
- Its record was checked in the last 12 months.

### When a category page can be published

- At least 5 apps meet the rules above.
- **It's complete.** Every app that shows up in at least 2 of the top 5 search results for the page's main phrase is listed, or the brief says why it's left out. A "self-hosted Git server" page without Forgejo and GitLab would lose the reader's trust on the first look.
- It has its own intro and "How to choose" section.
- Its HTML is under 300 KB. Today each hidden detail panel adds about 5 KB of HTML: 24 panels take 128 KB of the 883 KB `/self-host-apps` page, plus a second copy in the page's script data. A 12-app page fits easily.

### Records that don't qualify

- They stay in the main `/self-host-apps` listing and its dialog, the same as today. They get no page of their own and stay out of the sitemap.
- A category that fails the publish rules gets no published registry row. When a live page falls below 5 qualifying apps, set it to `is_indexable = false` until it's fixed. Don't delete it.

### App pages (later, not in this pilot)

If the category pilot works, test about 10 app pages at `/self-host-apps/<app-slug>`. Only apps with publisher-documented requirements, verified install options, and at least one category page linking to them qualify. Decide this after the week-10 review.

## 3. Pilot size and candidates

**20 category pages.** That's enough to see a pattern in Bing and Google, and small enough to write well and check by hand. It adds about 250 files to the export, well inside the 12,828 left.

The tables below show what development holds for each candidate today. "Strong" means the app has a license, a Docker or Compose link, and a release in the last 12 months. These are starting lists. Luna confirms them against real search results and the source pages.

### Ready now (17)

| # | Slug | Main search phrase | Strong apps in the data |
| ---: | --- | --- | --- |
| 1 | `password-managers` | self-hosted password manager | Vaultwarden, Bitwarden, Passbolt, AliasVault, Teampass |
| 2 | `photo-apps` | self-hosted Google Photos alternative | Immich, PhotoPrism, Ente, LibrePhotos, Lychee, Piwigo |
| 3 | `file-sync` | self-hosted Dropbox / Google Drive alternative | Syncthing, Nextcloud, copyparty, filebrowser, Cloudreve, OpenCloud, Seafile |
| 4 | `note-taking` | self-hosted Notion alternative, self-hosted notes app | Memos, Joplin Server, Outline, TriliumNext, Docs, HedgeDoc, plus AFFiNE (stored as `affine-community-edition`) |
| 5 | `web-analytics` | self-hosted Google Analytics alternative | Umami, Plausible, Matomo, PostHog, Rybbit, GoatCounter, Ackee |
| 6 | `uptime-monitoring` | self-hosted uptime monitor, status page | Uptime Kuma, Gatus, Checkmate, Healthchecks, OneUptime, Kener |
| 7 | `workflow-automation` | self-hosted Zapier alternative | n8n, Activepieces, Windmill, Kestra, Node-RED, Trigger.dev |
| 8 | `deployment-platforms` | self-hosted Heroku / Vercel alternative | Coolify, Dokploy, Dokku, CapRover, Nixopus |
| 9 | `newsletters` | self-hosted newsletter, Mailchimp alternative | Listmonk, Ghost, Mautic, Keila, Dittofeed |
| 10 | `bookmark-managers` | self-hosted bookmark manager, Pocket alternative | Karakeep, Linkwarden, linkding, Wallabag, Shiori, ArchiveBox |
| 11 | `project-management` | self-hosted Trello / Jira alternative | Plane, Huly, Wekan, OpenProject, Planka, Leantime, Kanboard, Vikunja |
| 12 | `backup` | self-hosted backup software | restic, Duplicati, Kopia, Backrest, Zerobyte |
| 13 | `single-sign-on` | self-hosted SSO, Auth0 alternative | Keycloak, Authentik, Authelia, Zitadel, Logto, Casdoor, Pocket ID, LLDAP, Kanidm |
| 14 | `ai-chat` | self-hosted ChatGPT alternative | Open WebUI, LibreChat, AnythingLLM, LocalAI, Ollama |
| 15 | `invoicing` | self-hosted invoicing software | Invoice Ninja, Akaunting, Kimai, InvoiceShelf, SolidInvoice |
| 16 | `feature-flags` | self-hosted feature flags, LaunchDarkly alternative | Unleash, GrowthBook, Flagsmith, Flipt, FeatBit |
| 17 | `url-shorteners` | self-hosted URL shortener | Shlink, Kutt, YOURLS, Dub, Sink, Chhoto URL |

### After missing apps are added (3)

| # | Slug | Main search phrase | What's missing |
| ---: | --- | --- | --- |
| 18 | `git-hosting` | self-hosted GitHub alternative, Git server | Forgejo, GitLab, and OneDev exist only as unpublished rows. Their runners are published. Only Gitea and Gogs are live. |
| 19 | `error-tracking` | self-hosted Sentry alternative | GlitchTip is unpublished. Sentry, SigNoz, Highlight, and Bugsink are live. |
| 20 | `team-chat` | self-hosted Slack alternative | Mattermost and Element are fine. Rocket.Chat and Zulip show no Docker or Compose link, and Synapse has no release data. These look like data gaps, not facts. |

### Reserves

Use these if a pilot page fails its gate:

- RSS readers: FreshRSS, Miniflux, CommaFeed, Yarr. Several install facts look wrong.
- Homelab dashboards: Homepage, Homarr, Dashy, Glance, Homer. The data is ready, but it's a homelab topic.
- Wikis: BookStack and MediaWiki are unpublished.
- Media servers: Jellyfin, Plex, Emby. Demand is high, but these are consumer apps.

### Data problems this check found

These need fixing before or during the pilot:

- Big, well-known apps are unpublished: Forgejo, GitLab, OneDev, GlitchTip, BookStack, MediaWiki, Psono, and Readeck.
- Category links mix in helper containers and unrelated apps. The audit's cleanup item Q2 covers this.
- Some install facts look wrong. Examples: Dokploy, Dokku, and CapRover show no Docker or Compose link, though they use installer scripts. Rocket.Chat and Zulip show none either.
- Analytics apps such as Umami and Plausible sit under "dashboards". The reviewed lists fix this for the pilot pages. Fixing the category itself is Q2 work.

## 4. Technical shape

| Area | Plan |
| --- | --- |
| Route | `app/(site)/(directories)/self-host-apps/categories/[slug]/page.tsx` with `layout.tsx` using `registryLayout("/self-host-apps/categories/[slug]")`, `revalidate = false`, and `generateStaticParams` returning every published category slug. The export already swaps in exact registry slugs with `dynamicParams = false`. |
| Parent layout | Change `/self-host-apps/layout.tsx` to `registryLayout("/self-host-apps", { structuredData: "page" })`, so the parent's JSON-LD stays out of the child HTML. This follows the rule in `seo.md`. Ad networks already work this way. |
| Membership | A new table, such as `self_host_app_collection_members` (page id, app id, display order). It changes through a reviewed sync command with preview and apply, like the platform fee records. The list itself lives in a reviewed JSON file in the repo. Page words never go in the database. |
| Data loading | One `unstable_cache` reader with `revalidate: false` and a new tag, such as `stack127-self-host-collections`. It loads the members and their facts. A failed load throws. |
| Registry | One `stack127_pages` row per page: `page_family = 'directory'`, `page_type = 'CollectionPage'`, plus a `stack127_directory_pages` row with the title and card fields. Card icon and art keys stay null, so the page shows the parent icon. |
| Publication | Use the directories publisher (`stack127:directories:publish`). Each page's manifest lists its route, a records check (a SQL count showing at least 5 qualifying members), and a smoke check. In development, publish first with `is_indexable = false`. Set `is_indexable = true` in the production batch after review. |
| Sitemap | Published, indexable rows enter `/sitemap.xml` on their own. Nothing new is needed. |
| Canonicals | Each page is its own canonical, from the registry. `/self-host-apps?category=…` stays `noindex` with its canonical pointing to `/self-host-apps`. The filtered list shows the raw, noisy category, so it isn't the same page. |
| Breadcrumbs | Home, then self-host apps, then the category. Use the shared breadcrumb helper so the visible trail and the `BreadcrumbList` JSON-LD match. Check that it handles three levels. |
| Links from the listing | Add a server-rendered "Browse by category" block on `/self-host-apps`, made of plain `<a href>` links to every published category page, near the top of the results. In the sidebar, a category filter with a published page also gets a normal link to it. |
| Hidden panels | They stay for the listing's dialog in the pilot. For an app that's on a category page, the dialog adds a normal link, such as "Compare self-hosted password managers". Category pages never use hidden panels: every fact is visible. If app pages come later, that app's panel is replaced by a link and dropped from the listing HTML. |
| Page dates | Extend the self-host date trigger so a meaningful member change touches its category pages. That covers membership, name, summary, license, install options, estimates, release version, and maintenance status. Compare displayed values only. Show stars rounded, such as "66k", so daily star refreshes don't move dates. Today's trigger already touches `self-host-apps/<app>` children. Category pages need their own rule. |
| Cache tags | Touches queue `page` events. Those already map to `page:self-host-apps:categories:<slug>` and the sitemap. In `proxy.ts`, add `/self-host-apps/categories/*` to the `self-host-catalog` family tag, so a catalog event purges them in OVH mode. In `targets.mjs`, a `self_host_catalog` event refreshes the category paths. |
| Cloudflare export | +20 pages and about +250 files, leaving about 12,500 of the 20,000. Each data edit already rebuilds the whole export, so build count doesn't change. Each build gets a little longer. The byte-for-byte public check covers the new pages. |
| Checks | `npm run check:static -- --strict` in CI. Load each page twice; the second load must not query page data. Check real pages at desktop and mobile width. Use `scripts/stack127/publishing/verify.mjs` for canonical, robots, and sitemap. |
| IndexNow | The audit found no IndexNow setup. If Sol adds one, send the 20 new URLs once at launch. Don't send them again. |

Docs to update in the same change: `caching.md` (the new tag and entity mapping), `seo.md` (the category path pattern), `directory-pages.md` (the child page and date rules for self-host categories), `self-host-apps-data.md` (the membership table and sync command), and `page-families.md` (the "own path" example).

## 5. Content

Only 20 pages are planned, and each one needs its own judgment, so each page gets its own words. The shared route uses a content map, the same way platform fee categories do.

| File | Holds | Written |
| --- | --- | --- |
| `categories/[slug]/content/<slug>/intro.mdx` | 2 or 3 sentences: the reader's situation, how many options are compared, and what to look at first | Per page |
| `categories/[slug]/content/<slug>/choose.mdx` | "How to choose": a short table pairing situations with apps, such as "One person, low RAM: Vaultwarden. A team that needs shared vaults and audit logs: Passbolt", plus 1 or 2 short paragraphs | Per page |
| `categories/[slug]/content/<slug>/questions.mdx` | Optional. Only questions that searchers really ask, such as "Is Vaultwarden safe to use instead of Bitwarden?" | Per page, only when needed |
| `categories/[slug]/content/shared/method.mdx` | How we check apps, what an estimate means, what each confidence label means | Once |
| Table column labels and empty values | Plain labels, with "unknown" for a missing value | In the TSX template |

- The title, SEO title, description, and card text go in the database through the publisher. Write them with the directory writing skill.
- Put the search words for each page in `content_docs/self-host-apps-categories/brief.md`, as `writing-style.md` asks.
- Most pages list fewer than 10 apps, so there's no count in the title. Use the names people search instead, such as "Self-hosted password managers compared: Vaultwarden, Bitwarden, Passbolt". Don't use "best" unless the "How to choose" table backs it up.
- Every claim in "How to choose" must match the records or a linked source. Mark rough estimates as rough.

## 6. Measurement

Bing comes first and Google second, following the audit. Record a baseline before launch: `/self-host-apps` had 601 Google impressions at position 62 from July 26 to October 23. Pull its Bing numbers and any query rows that name categories, too.

| Weekly check | Source |
| --- | --- |
| Indexed state of each of the 20 pages | Bing URL Inspection; Google URL Inspection for all 20, since the set is small |
| Impressions, clicks, and position for `/self-host-apps/categories/*` | Bing and Google page reports, main site only, comparing equal 28-day windows |
| Queries for each page | Leave out brand and `site:` queries. Check that queries match the page's main phrase. |
| `/self-host-apps` itself | Make sure the category pages aren't taking its impressions without adding any. |
| Visits by referrer | Umami, filtered to `stack127.com`: Bing, DuckDuckGo, Google, ChatGPT |
| Use | Clicks from a category page to an app's install or source link, through a minimal Umami event, if Sol adds one. Skip it if it needs new consent work. |

Decision rules:

- **Week 6, wave check.** If at least 5 of the first 10 pages are indexed in Bing or Google, launch the second 10. If not, look into crawl and discovery first.
- **Week 10, scale up.** If at least 10 of 20 are indexed, and at least 5 pages show non-brand impressions for their main phrase in 2 or more separate weeks, plan the next 20 categories and the 10-page app-page test.
- **Week 10, fix.** Pages that are indexed but get no relevant impressions need their topic and title checked against what ranks. Don't add pages.
- **Week 10, stop.** If fewer than 5 pages are indexed in any engine, stop adding pages. Keep accurate pages published. Reopen the sitewide crawl and indexing investigation (audit section 9), because the problem isn't these pages.
- Any page whose data drops below the publish rules goes to `is_indexable = false` until it's fixed.

These are internal checkpoints, not traffic promises.

## 7. Work split and order

| Step | Lane | Work |
| --- | --- | --- |
| 0 | Coordinator or Sol | Pull Bing and Google query rows for `/self-host-apps`. Reorder the 20 if some categories already show impressions. About an hour. |
| 1 | Luna | For each of the 20 and the reserves: read the top 5 results for the main phrase, list the expected apps, and confirm or fix membership against the rules in section 2. Enrich the missing apps (Forgejo, GitLab, OneDev, GlitchTip, Psono, Readeck) and fix wrong install facts through the enrichment skill. Run the Q2 artifact cleanup for apps in these categories. Deliver the reviewed membership JSON with evidence, plus the search words for each page. |
| 2 | Sol | Migration for the membership table, the sync command with preview and apply, the date trigger rule, cache tag and `targets.mjs` mapping, the `proxy.ts` family tag, the parent layout's structured-data change, publisher records checks, and the doc updates. Runs alongside step 1. |
| 3 | Opus | The category route and template (table and app sections), the "Browse by category" block, the dialog link, breadcrumbs, and the shared method MDX. Start with 3 ready pages (password managers, web analytics, photo apps) on development data. |
| 4 | Opus | Intro, "How to choose", and titles for each page, using the directory writing skill and Luna's search words. Write `brief.md`. |
| 5 | Sol | Review all code before it goes up. Opus fixes small findings. |
| 6 | Coordinator | Publish to development with `is_indexable = false`. Check real pages at desktop and mobile width. The owner reviews 3 sample pages. |
| 7 | Coordinator | After the owner says yes: release PR, CI, merge, then the production publisher batch for wave 1 with `is_indexable = true`. Verify the sitemap and public HTML. |
| 8 | Coordinator | Weekly measurement. Wave 2 at week 6 if the rule passes. |

Steps 1 and 2 run in parallel. Step 3 can start on development data before step 1 finishes. Pages 18 to 20 wait for Luna's enrichment.

## 8. Decisions for the owner

| # | Decision | Recommendation |
| ---: | --- | --- |
| 1 | Pilot directory | **Self-host apps.** It's the only large directory with a search signal and enough data. CLI apps follow if the pilot works. |
| 2 | Page type for the pilot | **Category pages only.** Hold app pages until week 10. The requirement data is too thin, and one page per app won't fit the Cloudflare Free file limit. |
| 3 | URL pattern | **`/self-host-apps/categories/<slug>`.** Our docs already use it. It keeps `/self-host-apps/<app>` free for app pages, and the parent stays clear. The other choices are `/self-host-apps/<slug>`, which can clash with app slugs such as `docs` and `homepage`, and root URLs like `/self-hosted-password-managers`, which break the child-page rule in product direction. |
| 4 | Where membership lives | **A database table with a reviewed sync command.** Page dates and cache refreshes then stay automatic, and scaling later needs no redesign. A code file would ship faster, but every real fact change would need a manual date touch. |
| 5 | Launch shape | **Two waves of 10, six weeks apart.** If the first 10 don't get indexed, we learn that before writing the second 10. |
| 6 | Consumer and homelab topics (media servers, homelab dashboards) | **Leave them out of the pilot.** They have demand, but they're off the indie hacker focus. They stay as reserves. |
| 7 | Add the missing big apps first (Forgejo, GitLab, GlitchTip, and others) | **Yes, but only the 3 pages that need them wait.** The other 17 go ahead. |
| 8 | The full Q2 cleanup of the main listing | **Clean only the pilot categories now.** The full cleanup continues as its own task, so it doesn't block the pilot. |

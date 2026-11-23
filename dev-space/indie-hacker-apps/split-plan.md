# Split into 12 directories: plan

Owner decisions (2026-11-22):

- The `/indie-hacker-apps` hub and its 8 category pages are replaced by **12 separate directories**, each with its own flat URL, built like `/self-host-apps` and `/cli-apps`. No hub page.
- An app is listed in **every** directory whose job it does. Each card says whether that job is the app's **main job** or something it **also does**.
- App data moves from repo JSON (`lib/indie-hacker-apps/data/*.json`, about 30 MB) into **database tables**, as `stack127_docs/directory-pages.md` requires for large script-updated records.
- App details stay in the **side panel**. No page per app.
- **Nothing is published to the live site.** Development registry rows only, until the owner says otherwise.
- In the directories menu and on the home page, the 12 are **grouped under one heading** (working name: "For your app's stack") instead of 12 loose cards.

## The 12 directories

Each directory takes the apps of one research category (`lib/indie-hacker-apps/categories.json`) that have at least one of its jobs. "Main job" means the app's first job (`jobs[0]`) is one of the directory's jobs. Cost sets are the category's `sets` keys shown on that directory.

| # | Directory | URL | Research category | Jobs | Cost sets |
| --- | --- | --- | --- | --- | --- |
| 1 | Payment providers | `/payment-providers` | payments | all 5 | fee |
| 2 | Hosting | `/hosting` | hosting | all 4 | work |
| 3 | Databases | `/databases` | databases | sql, kv, backend, vector | sql |
| 4 | File storage | `/file-storage` | databases | files | files |
| 5 | Queues and background jobs | `/background-jobs` | databases | jobs | jobs |
| 6 | Uptime monitoring and status pages | `/uptime-monitoring` | error-monitoring | uptime, status | uptime |
| 7 | Error tracking and logs | `/error-tracking` | error-monitoring | errors, logs, performance, cron | errors |
| 8 | Newsletter and email marketing | `/newsletter-tools` | email | newsletter, marketing, multichannel | subs |
| 9 | Transactional email | `/transactional-email` | email | transactional | appmail |
| 10 | Analytics | `/analytics` | analytics | all 4 | pv |
| 11 | Customer support | `/customer-support` | customer-support | all 4 | agents |
| 12 | Auth | `/auth-providers` | auth | all 3 | mau |

Inside a directory, the job filter offers only that directory's jobs. Cells (the small facts on a card) stay the category's cells.

## Where things live after the split

| What | Where |
| --- | --- |
| Research files, cards, icon records | `dev-space/indie-hacker-apps/<research_dir>/` (unchanged; the source the import reads) |
| Research categories and card rules | `lib/indie-hacker-apps/categories.json` (unchanged) |
| The 12 directory definitions | Code config beside it (small, hand-edited) |
| App records (card fields, panel facts, status history, icon path) | Database table(s), loaded by an import command |
| Icons | `public/indie-hacker-apps/icons/<category>/<slug>.png` (unchanged unless moved with a reason) |
| Page words (intro, article) | `content/*.mdx` beside each directory route |
| Titles, search text, card text | `stack127_directory_pages` via the directory publisher |

## Order of work

1. Job check pass on all cards (researchers, running).
2. Database tables, import, data layer, API routes, cache wiring (coder).
3. Page words for the 12 (writer), into `dev-space/indie-hacker-apps/copy/<directory>/`.
4. The 12 routes, cards with the main job / also does it label, list view, menu and home grouping (designer).
5. Development registry rows for the 12, unpublished-in-production; remove the 9 old development rows.
6. Reviewer pass, pull request. Production stays untouched until the owner says to publish.

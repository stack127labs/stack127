# Brand growth status

Last updated: 2026-11-13. Rules and decisions are in [AGENTS.md](AGENTS.md).

## Numbers

| Measure | Value | Date | Source |
| --- | --- | --- | --- |
| Indexable pages in the sitemap | 248 | 2026-11-13 | `https://stack127.com/sitemap.xml` |
| Indexed by Google | 30 of 248 | 2026-11-13 | URL Inspection API, every sitemap URL |
| Known to Google, not indexed | 167 | 2026-11-13 | "Discovered - currently not indexed" |
| Unknown to Google | 51 | 2026-11-13 | "URL is unknown to Google" |
| X followers | 40 | 2026-11-13 | Owner; not the target audience |
| LinkedIn followers | About 500 | 2026-11-13 | Owner; not the target audience |
| Referring domains | Not measured yet | | |

Target: 150 indexed pages by 2027-01-08.

The 30 indexed pages are the home page, `/about`, `/privacy`, `/terms`, `/self-host-apps`, the 14 beginner course pages, `/dns-tools`, `/domain-tools`, `/software-licenses-for-self-hosting`, `/drive-reliability`, six tools, and one ad network page. None of the 42 self-host category pages or 12 CLI category pages was indexed on 2026-11-13; they were published on 2026-11-12 and 2026-11-10.

## Done

- 2026-11-10: six hardware directories removed; 218 keyboard shortcut pages set to noindex; 12 CLI category pages published.
- 2026-11-12: self-host app categories reviewed app by app; 42 self-host category pages published.
- 2026-11-13: sitemap resubmitted to Google (248 URLs read, 0 errors).
- 2026-11-13: 100 URLs submitted to Bing: the hubs, catalogs, all 42 self-host category pages, the CLI and platform fee category pages.
- 2026-11-13: `stack127labs/awesome-self-hosted-apps` made public with the owner's yes; description, topics, and homepage set.
- 2026-11-13: all 54 published category pages (42 self-host, 12 CLI) rebuilt with the main page's cards, filters, search, sort, and pagination, plus a "how to choose" section below the cards. Released in pull request #120, commit `070a5c79`.
- 2026-11-13: 98 duplicate directory entries retired in production (4,913 to 4,815 published self-hostable apps). The decisions are in `scripts/self-host-apps/batches/2026-11-13-published-duplicates-reviewed.json`. The public list was refreshed by hand: 4,803 apps in 42 categories.
- 2026-11-13: owner did the "Request indexing" clicks for the 10 hub URLs.
- 2026-11-13: retiring the 98 apps broke live search for about 20 minutes: `/api/self-host-apps/search` returned 503 for any result that included a retired app, until the frontend refresh run finished. Fixed the same day: the API now leaves out an app whose details are gone and does not cache that response. The public list now shows every published app, not one per repository.
- 2026-11-13: weekly list refresh installed on OVH (`self-host-awesome-list`, Monday 14:02 UTC). First run passed as a no-op: 4,815 apps, 42 categories. The first real push has not happened yet. `PUBLIC_REPOS_GITHUB_TOKEN` is in Infisical `stack127 /vps/self-host-apps`; the owner limited the token to `awesome-self-hosted-apps`. Add each new public list repository to that same token on GitHub.

## Next

| Step | Who | State |
| --- | --- | --- |
| Request indexing for the 10 largest self-host category pages | Owner | Open |
| Submit the remaining 148 sitemap URLs to Bing, 100 a day | Agent | Open |
| Pull the numbers and write the first data story | Agent | Open. Use 4,815 apps |
| Post the story on r/selfhosted | Owner | After review |
| Measure referring domains as a baseline | Agent | Open |
| CLI apps list, then ad networks list | Agent | After the first list |

## Known data gaps

- 11 possible duplicate groups were left untouched as unsure, for example "Borg" and "borgserver", and "ONLYOFFICE" and "ONLYOFFICE Docs". They are marked `unsure` in the batch file.
- The "Has mobile app" filter matches 0 to 4 apps per category in development, and "Needs database" is empty for most apps. Both need data work.
- Two CLI categories, `communication` and `games-fun`, are below 15 apps and unpublished. Their intros are placeholder text.
- The main repository `stack127labs/stack127` is public on GitHub for build-minute reasons. The owner plans to make it private later.
- Use 4,815 in the story. Do not use 4,978, which counted entries that are not self-hostable.

## Waiting on the owner

- Nothing right now.

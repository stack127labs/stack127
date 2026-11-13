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

The 30 indexed pages are the home page, `/about`, `/privacy`, `/terms`, `/self-host-apps`, the 14 beginner course pages, `/dns-tools`, `/domain-tools`, `/software-licenses-for-self-hosting`, `/drive-reliability`, six tools, and one ad network page. None of the 42 self-host category pages or 12 CLI category pages is indexed yet; they were published on 2026-11-12 and 2026-11-10.

## Done

- 2026-11-10: six hardware directories removed; 218 keyboard shortcut pages set to noindex; 12 CLI category pages published.
- 2026-11-12: self-host app categories reviewed app by app; 42 self-host category pages published.
- 2026-11-13: sitemap resubmitted to Google (248 URLs read, 0 errors).
- 2026-11-13: 100 URLs submitted to Bing: the hubs, catalogs, all 42 self-host category pages, the CLI and platform fee category pages.

## Next

| Step | Who | State |
| --- | --- | --- |
| Request indexing for the 10 hub URLs, then the 10 largest self-host category pages the day after | Owner | Open |
| Submit the remaining 148 sitemap URLs to Bing, 100 a day | Agent | Open |
| Make `stack127labs/awesome-self-hosted-apps` public | Owner approves, agent flips | The repository is private with the first export: 4,814 apps in 42 categories |
| Merge the export script, pull request #120 | Agent, after the owner's go | Reviewed twice; waiting on the owner |
| Refresh the list on a schedule | Agent | Not set up. Read Cockpit `workflow/runners.md` first |
| Pull the numbers and write the first data story | Agent | After the list is public |
| Post the story on r/selfhosted | Owner | After review |
| Measure referring domains as a baseline | Agent | Open |
| CLI apps list, then ad networks list | Agent | After the first list |

## Known data gaps

- 95 source repositories are listed twice or more in the directory, 194 entries in all, for example "Jellyfin" and "binhex-jellyfin". The public list shows each repository once. The directory still shows all of them, so its count is 4,913 and the list's is 4,814. Cleaning the directory changes category counts and needs its own data task.
- The directory has 4,913 published self-hostable apps. The category review covered 4,978 published apps, which includes entries that are not self-hostable. Use 4,913 or the list's 4,814 in the story, not 4,978.

## Waiting on the owner

- The "Request indexing" clicks in Search Console.
- A look at the private list repository, then a yes to make it public.
- A yes to merge pull request #120.

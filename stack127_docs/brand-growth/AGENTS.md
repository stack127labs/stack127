# Brand growth guide

Read this before any work on stack127's reach: indexing, links, off-site posts, social accounts, or public repositories. Then read [status.md](status.md) for the current numbers and the next step.

## Goal

Google indexes few stack127 pages because almost no other site links to it. The work here earns that trust. More pages do not fix it, so add no new page family until the indexed count moves.

## Measures

Judge progress by these four, checked every Monday. Raw visitor counts are not a measure.

| Measure | How to read it |
| --- | --- |
| Indexed pages | Google URL Inspection for every sitemap URL. Count "Submitted and indexed". |
| Links from other sites | Referring domains in Ahrefs (free data only) and Search Console's Links report. |
| Off-site content | Stories and posts published elsewhere that point to stack127. |
| Social presence | Replies and profile visits from self-hosters, indie developers, and publishers. Follower counts come second. |

## Decisions

The owner made these on 2026-11-13. Change them only when the owner says so.

- **Social accounts:** X and LinkedIn only, under the owner's own name, not a brand account. Both start from zero: the existing followers are not the audience.
- **Daily posts:** written day by day, not in batches.
- **Public lists:** awesome-list style repositories under `stack127labs`, built from the database by a script and refreshed on a schedule. Each category heading links to its stack127 category page. Order: self-hosted apps, then CLI apps, then ad networks.
- **Tools get no repositories.** A basic calculator earns no stars or links. Open-source one tool later only if its logic is worth reusing.
- **First story:** the self-hosted apps data story. r/selfhosted first, as a text post with the numbers in the post and one link to the list. Then dev.to, then short versions on X and LinkedIn.
- **Every number in a story comes from a query run for that story.** Write the story only after the numbers are pulled.

## Parked

| Work | Until |
| --- | --- |
| Remaining launch directory submissions | The social accounts are set up. Track them in [../directory-submission-status.md](../directory-submission-status.md). |
| Emails to listed ad networks and app makers | The site has about 1,000 visitors a day. Before that it reads as spam. |
| Monthly email, launch-directory place pages, per-platform fee pages | The owner brings them back. |

## Who does what

- **Agents:** pull the numbers, write stories and post drafts, build and refresh the public lists, submit URLs to Bing, and read index status from Google.
- **Owner:** posts from his own accounts, clicks "Request indexing" in Search Console, and approves anything public before it goes out. Reddit and Hacker News punish automated posting, so agents never post there.

## Search services

Credentials are in `.env.search`. `scripts/stack127/search-services/check.mjs` verifies them.

- **Google:** the sitemap can be resubmitted and index status read through the API. "Request indexing" has no API and stays a manual click, about 10 URLs a day.
- **Bing:** `SubmitUrlBatch` accepts 100 URLs a day and 1,800 a month.

## Keeping status current

Update [status.md](status.md) in the same change as the work: new numbers with their date, what was done, and the next step. Replace old values; the file is the current state, not a diary. Docs-only changes go straight to `main`.

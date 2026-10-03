# Launch directories

The directory has 165 public cards in nine categories. Six more rows describe community-post destinations (Show HN, Indie Hackers, DEV, and three subreddits). They stay unpublished because they take posts, not listings. `/launch-directories` goes live in production when the reviewed release publishes its registry row. Until then, the route returns 404 in production.

## Reader and task

The reader is a solo maker with a product that's ready, or nearly ready, to show. They want a short list of places to submit it. For each place they want to know:

- whether they qualify,
- what it costs,
- how long review or scheduling takes,
- what kind of link the listing gives their site,
- where to start the submission.

They should leave with a few submission pages open in new tabs. The page doesn't teach launch strategy, and it doesn't rank sites by traffic or SEO value.

## Route and behavior

- Route: `/launch-directories`. It's a static page. The first page of the default view is server-rendered and indexable.
- It follows the self-host apps card and sidebar pattern. There's no details drawer and no page per site.
- Sidebar filters: search, category, submission page, cost, and link type. Search matches the name, domain, description, best-for, eligibility, and category text. Filters run in the browser through `DirectoryQueryProvider`. The URL keeps them, so links can be shared. Query URLs stay `noindex`.
- Default order ("Ready to submit first"): sites with a checked submission page come first. Within each of those two groups, sites with a known price come before sites with an unknown price, and each of those is A to Z. Sites with an unknown price or no checked submission page stay in the list, lower down. A sort control also offers plain name order. There's no popularity or traffic ranking.
- A submission page filter shows all sites, only sites with a checked submission page, or only those without one. Unknown entries stay in the default view.
- 24 cards per page with the shared `Pagination`. A filter change returns to page one. An out-of-range page shows the last page.
- The results header shows the range and total, active filter chips, and a polite live announcement when the count changes. No results shows a `StatePanel` with a reset link.

## Card

| Part | What it does |
| --- | --- |
| Logo | The site's own icon from `icon_url`, at a fixed size, lazy-loaded below the first row. A missing or failed image shows the first letter. |
| Name and domain | The whole card opens the official website in a new tab. The domain shows under the name, so the destination is visible. |
| Category badge | One primary category. |
| Summary | One sentence on what the site is. |
| Five fact rows | Best for, cost, review time, link type, and eligibility. Full values stay visible. Nothing is clipped. |
| Submit action | **Submit** opens the checked submission page. Its accessible name is "Submit to {name}". Without a checked page, the footer says **Submission page unavailable** or **Submission page not found**, with no guessed link. |
| Sources | A closed disclosure. Its summary shows the record check date, the last time anything on the card was checked. Inside: the official pages behind each fact, each with its own check date when one exists, the sample listing when there is one, and a link to report a correction. An undated source shows no date. It never borrows the record date. |

The footer sits above the card's website link, so its links and disclosure never nest inside another link.

## Help text on the page

Keep it short. The cards come first. One section under the results answers the questions a reader has while scanning:

- **How we check a listing.** We look for the site's official submission page, pricing, and rules, and use the ones that load. When a published listing opens, we check the link it gives the maker's site. Some sites blocked access, needed a login, or had no listing we could open, so 32 public cards have no sample listing. Those details stay marked Couldn't verify or Not stated on their site. The record date can be newer than some sources, for example when only the submission page was rechecked, so each source shows its own date.
- **Link types.** One table defines results from a sampled listing or the site's terms: Dofollow, Nofollow (with a link to Google's definition), UGC, Sponsored, More than one type, Varies by plan or listing, and No maker website link. A separate table covers labels with no confirmed result: Likely nofollow, which is an estimate and not a checked result, and Couldn't verify.
- **Missing details.** Not stated on their site, Couldn't verify, and Conflicting info each mean something different.
- **App stores and integrations.** Publishing there means building for the platform, accepting its developer terms, and passing its review. It isn't a form for an ordinary website.
- **Corrections.** Email `stack127@proton.me` with the site name and the page that shows the right answer.

Terms to keep stable:

- **Dofollow** means the sampled link had no `nofollow`, `ugc`, or `sponsored` value. There's no dofollow HTML attribute. It doesn't promise indexing, ranking, or traffic.
- A link observation applies only to the named sample or the tier the site's terms describe. Free and paid listings can differ.
- **Not stated on their site**: the official pages don't publish this detail.
- **Couldn't verify**: a source was blocked, needed a login, or didn't load. It isn't proof the site is closed.
- **Conflicting info**: two official pages disagree. The sources disclosure links both.

## Visual choices

- `EntryHero` with the Rocket identity icon. No hero art. The cards are the content.
- Homepage card: Rocket icon, a marker spot of a product box on a rising launch path, and metrics for places and categories.
- Social cover: `public/launch-directories/launch-directories-cover.jpg`, 1200 x 675. It's the same marker spot beside the page title in site type, on the dark background. It shows no third-party logos and no counts that could go stale. The page uses `page_type` `CollectionPage`.

## Categories

1. Launch boards
2. Prelaunch and beta
3. Startup and software listings
4. Reviews and alternatives
5. AI tools
6. Developer and open source
7. App stores and integrations
8. Design, no-code, and creator
9. Specialist and regional

Each site has one primary category. Community posts are outside this directory's scope.

## Research and data

One `public.launch_directories` row stores each site's card, official submission URL, category, sample listing, sources, and research notes. `submit_url` may be null. `submission_status` separates a verified start page, an unavailable page, and a page we couldn't find. Only a verified page gets a **Submit** link. The `evidence` JSON records the source, check date, method, and observed link details for cost, review time, eligibility, link type, and submission. A link observation records the sample page, destination, `rel` values, and plan or listing tier when known.

Research the official submission path and current terms, then inspect one real published listing. A sample only proves what it shows. A missing `rel` value isn't a promise about every tier, and `noopener` or `noreferrer` alone don't make a link nofollow. A site policy can support a plan-level claim when one page can't show every tier. Don't claim indexing, ranking value, traffic, acceptance, or review time without evidence.

Keep known prices, timing, conditions, and links next to the missing-detail labels. Missing details alone don't exclude a site. Excluded services stay excluded. An unavailable site isn't proof that it closed, or that it still accepts submissions.

## Sources and refresh

Use the site's own form, policy, pricing, and published listing as the main sources. Keep the check date with each source. Recheck prices, form paths, availability, and a sample listing before each data release. Never use a dead submission URL, and never call a listing free because a form shows no price.

The `public.stack127_pages` row controls publication. Data changes refresh the page through the `launch_directories` revalidation trigger.

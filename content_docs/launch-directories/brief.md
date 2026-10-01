# Launch directories

The current draft contains 171 entries. Development keeps `/launch-directories` available for review. Its production registry row remains unpublished; shipping the draft code, records, and docs does not launch it.

## Purpose

Help solo makers find places to submit a product, learn what submission costs and requires, and understand the kind of product link a published listing provides. The page is one searchable directory with category and other filters.

## Route and behavior

- Route: `/launch-directories`.
- The route follows the self-host apps directory card and sidebar pattern.
- The card's main area opens the directory's official website in a new tab.
- The card footer has a separate **Submit here** link when a working official form or starting page is known. Otherwise it says **Submission page unavailable** or **Submission page not found** and has no guessed destination.
- Cards do not open a details drawer.
- Categories appear as card badges and as a sidebar filter. Other sidebar filters are search, cost, and link type.
- Results are rendered on the server. Cards reflow for narrow screens.

## Card fields

Each public card has a short description and five fact rows:

| Field | What it tells the reader |
| --- | --- |
| Best for | The kind of maker or product likely to fit. |
| Cost | Whether submission is free, paid, or has both paths, with the starting price and billing period when published. State if an exact price is not public. |
| Review time | The site's stated review or scheduling time. Say clearly when the site publishes no fixed time. |
| Link type | What was found on a real published product page, or what the official terms promise. Name the sample when useful. Distinguish follow, nofollow, sponsored, UGC, no maker-site link, and plan-dependent behavior. |
| Eligibility | The requirements that help a maker decide whether to submit. |

The category badge is separate from the five fact rows. Brand logos are optional; a letter mark is used when no image is configured. The row icons come from the shared app-fact card.

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

Use one primary category per site. Community posts are outside this directory's scope; entries should be listing directories, launch boards, registries, or app catalogs.

## Research and data

One `public.launch_directories` row stores each site's public card, official submission URL, category, public example, sources, and research notes. `submit_url` may be null; `submission_status` distinguishes a verified start page, an unavailable page, and a page that was not found. Only a verified destination gets a **Submit here** link. The `evidence` JSON records the source, check date, method, and observed anchor details for cost, review time, eligibility, link type, and submission. For a link observation, record the exact sample page, destination, `rel` tokens, and plan or listing tier when known.

Research an official submission path and current terms, then inspect one real published example. A sample only proves what that sample shows. A missing HTML `rel` token is not a promise about every tier; `noopener` and `noreferrer` alone do not make a link nofollow. A site policy may support a plan-level claim when the page cannot show every tier. Do not claim indexing, ranking value, traffic, acceptance, or review timing without evidence.

Include the previously held directory leads with their known facts and clear labels for remaining gaps. Use **Not stated on their site** when official pages do not publish a detail, **Couldn't verify** when the source is blocked or unavailable, and **Conflicting info** when official pages disagree. Use **Varies by plan** or a precise sample observation when link treatment differs. Keep known prices, timing, conditions, and links instead of replacing a partly known field with a blanket unknown label. Missing details must not cause exclusion by themselves. The earlier hold decisions remain as historical research notes; excluded services remain excluded. An unavailable site is not proof of closure or proof that it currently accepts submissions.

## Sources and refresh

Use the site's own form, policy, pricing, and published listing as the main sources. Link each claim to its source in the research report and retain the date checked. Recheck current prices, form paths, availability, and a public sample before publishing the directory. Never use a dead submission URL or infer a free listing from a form that shows no price.

The route registry controls whether the page is published. The development database is the review environment; production publication requires the owner to check the completed page and data. Draft records may ship while the route remains unpublished and direct public API reads are denied.

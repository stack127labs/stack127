# Launch directory facts — 2026-10-21

## Method and sources

- Read 155 published rows from the development public.launch_directories table with a read-only query. No database data was changed.
- Domain Rating: found the checker JSON endpoint at [launchdirectories.com](https://launchdirectories.com/domain-rating-checker). I made sequential requests about three seconds apart. It returned seven numeric ratings, then HTTP 429 on the eighth attempt. I stopped. The source_url on each returned value is the API request with its target.
- Tranco: matched each website's registrable domain against the latest top-1M CSV, [list 262W9](https://tranco-list.eu/list/262W9/1000000), generated 2026-10-20 and downloaded on 2026-10-21. Rank is null when the domain is below the top million.
- Listing indexing: for every existing example_listing_url, ran its saved site:host/path query through the search tool. A true value means the result included the example or another listing page from that directory; false means no matching page appeared; null means the results were inconclusive. This is a best-effort search check, not Search Console data.
- Robots: inspected the robots meta tag on five example pages in a browser. All five lacked a noindex directive: three explicitly allowed indexing, and two had no robots meta tag. The requested JSON shape has no field for this fact, so I recorded this check here.
- Review wait: preferred the free path, using the public review/queue evidence and its source page. I normalized only stated times. min_days and max_days stay null where the source gives no number.
- Price: recorded public USD listing prices. I did not convert other currencies. Tier summaries include only source-stated plan details; link type is filled only when the source states it for that tier. Optional advertising products are omitted when they are separate from a directory listing.

## Coverage

- Published records: 155/155.
- Domain Rating: 7/155 numeric; 1/155 attempted but rate-limited; 147/155 not checked after the stop.
- Tranco bucket: 155/155 — top_1k: 1, top_10k: 6, top_100k: 17, top_1m: 50, below_1m: 81.
- Listing indexing: 104 true, 16 false, 4 inconclusive from 124 queries. The other 31 records have no example listing URL; total unknown values: 35.
- Robots noindex: 5/124 sample URLs checked; no noindex directive found. The other 119 sample URLs were not checked.
- Review wait: 39/155 have a stated wait label; 116 are null because no numeric or usable wait was stated.
- Lowest paid USD price: 53/155 have a numeric value; 102 are null.
- Price tiers: 52/155 have one or more source-backed tiers; 103 are null.

## Blocked or unclear

- The launchdirectories.com checker stopped at its rate limit. The [Ahrefs Website Authority Checker](https://ahrefs.com/website-authority-checker) did not return a score in the browser attempt. Ahrefs' free API documentation requires an account API key, which was not available.
- Five pricing sources in the initial batch returned no usable page text: Capterra and Software Advice pages returned unsupported content types, Futurepedia's enhanced page returned 404, OpenAlternative timed out, and the SaaS Landing Page URL was inaccessible. I left prices or tiers null where the saved number could not be confirmed.
- The current AIXploria page served a cookie-consent shell without its saved prices. The current Promote Project homepage also did not show its saved $0.99 feature price. Both are null in the new price field.
- The current AlternativeTo FAQ says the exact priority fee is shown before payment; it does not confirm the saved $5 amount. The new price field is null.
- OMR Reviews lists its entry price in euros (€575/month billed annually); no USD amount was stated, so the new USD price is null.
- Robots checks covered these pages: [AI Agents Directory](https://aiagentsdirectory.com/agent/nano-pro), [AiHubs](https://aihubs.ai/item/photo-to-video), [AIHuntList](https://aihuntlist.com/tool/kane-cli-by-testmu-ai), [AI Parabellum](https://aiparabellum.com/10web-ai/), and [AI Tools Directory](https://aitoolsdirectory.com/tool/videogen).

## Differences from current records

- **DevHunt:** changed the record from a $49 queue skip to the current official prices: free listing, Launch $19, and Boosted launch $49. The FAQ and About page agree.
- **Launching Next:** recorded the current official conflict. Advertise says $49 for express approval, while Submit says $99. The facts file keeps the $49 listed price from Advertise.
- **AIToolsBoard:** changed the old $99 Fast Track record to free standard review and optional promotion slots at $5, $6, and $8. The facts file already had these prices.
- **IndieNeed:** recorded the $3 dofollow link as an add-on to the free listing, not a paid launch tier. Paid launches start at $15, so the facts file now uses $15 as the lowest paid listing price and removes the add-on from `price_tiers`.
- **Aura++:** replaced the old temporarily-free wording with the listed Premium price of $29 and Premium Plus at $69. The page offers 40% off with LAUNCHOFF40, but the facts file keeps the listed $29 base price.
- **SaaSGrow:** kept the current conflict in the record: the Basic table says $9, while the FAQ says new listings cost $5 after Pro is cancelled. The facts file already has both $9 tiers and the conditional $5 lowest price.
- **StartupBase:** added the missing Growth tier at $299 to the record. The facts file already included it.

All seven cost checks used the official pages linked in each record and were dated 2026-10-21.


# Indie hacker apps: page plan (draft for owner review)

Draft, 2026-11-09. Built from the research data and the eight competitor reviews (`<sub-directory>/competitors.md`, 55 competitor pages). Nothing here is approved yet.

## What competitors do

- Almost every page shows a name, a short description, a "best for" label or rating, and one headline price.
- General directories (G2, Capterra, AlternativeTo) rank by reviews or votes. Editorial lists (Zapier, TechRadar, vendor blogs) pick a winner. A few specialist sites go deep on one thing: EmailToolTester (side-by-side email table), VPSBenchmarks (VPS filters), DB-Engines and DBDB.io (database records), TierDiff (free tiers), Toolradar (merchant-of-record fees), Uptime Compare.
- Weak spots everywhere: "free" often means "no monthly fee" but still has costs; prices are not compared at the same usage; facts have no source or date; hosted and self-hosted are mixed; nobody keeps a dated record of sales, shutdowns, breaches, or regulator action.

## What only we can show

1. **Cost at the same usage for every app** (for example 10,000 subscribers, 10,000 users, 3 support agents), with the math one click away.
2. **A dated status for every app**: new owner, closing, security incident, regulator action, licence change.
3. **A source and checked date on every fact**, including "the vendor doesn't say".
4. **Who can actually sign up** (seller countries for payments), and hosted versus self-hosted kept apart with exact licences.

## Rules for all eight pages

1. **Pick the job first.** Each page opens with 3–5 types, for example newsletter / transactional, or merchant of record / gateway.
2. **One headline number:** the cost at a usage level the reader chooses from a small set. Show the free plan next to it, and say "trial" or "credits" when it isn't a lasting free plan.
3. **Short list, deep detail.** The list shows 5–6 facts per app. Everything else opens in a detail view with sources.
4. **Quiet status badges:** New owner, Closing, Security incident, Regulator action, Licence change, Low activity, each with a date. Only Closing and sanctions-level risk get a warning colour.
5. **No "best" winner.** Offer use-case shortcuts (for example "solo SaaS", "self-hosted", "EU data") that preset filters, and show trade-offs.
6. **Compare 2–4 apps side by side.**
7. **"Vendor doesn't say" stays in the detail view**, not in the list.
8. **A "What changed" strip** on each page and on the hub, fed by the dated status events.
9. **Follow the directory family rules**: filters in a left sidebar (drawer on mobile), shared directory controls, `DetailDialog`, `Pagination`, and `StatePanel`. Data goes in a database table per directory because it is large.

## Page skeleton (same for all eight)

1. Title and one-line intro, plus 3 stats (apps tracked, apps with a free plan, changes this quarter).
2. Job picker (the types) and use-case shortcuts.
3. Usage picker for the headline cost.
4. Left filters, results table on desktop and cards on mobile.
5. Detail view: price at every usage level, limits, who can sign up, hosted or self-hosted, export and leaving, status history, all facts with sources.
6. "What changed" strip.
7. Short method note: how we price, what "checked" means, when we recheck.

## Each page

| Page | Job types (first choice) | Headline cost at | List columns | Key filters | Stand-out angle |
| --- | --- | --- | --- | --- | --- |
| Payments | Merchant of record, gateway, billing software, payment links, crypto | Domestic card fee (% + fixed) in the seller's country, with currency | Type, fee, seller countries, payout time, status | Seller country, type, payment methods, subscriptions, digital goods | "Can I sign up from my country?" up front |
| Hosting | Platform (PaaS), server (VPS), self-hosted panel, static sites | Small app API per month (1M requests, 100 GB out; scenario B in the research) | Type, free tier, small-app cost, regions, status | Type, region, free tier, self-host, licence | Same small app priced everywhere, with the math |
| Databases | SQL, key-value and cache, object storage, queues and workflows, vector | Small SQL app per month (1 GB stored, 100k reads, 20k writes) | Job, free tier, metered price, regions, self-host | Job, hosted or self-hosted, region, free tier | Lasting free tier versus trial, plus export and lock-in |
| Error monitoring | Error tracking, uptime, status pages, logs | Small workload per job: 5 uptime endpoints at 60-second checks, or 5,000 error reports a month | Job, free tier, check interval or event limit, entry price, maintained? | Job, self-host, licence, check interval | "Maintained?" with last release date |
| Support | Help desk, live chat, AI agent, shared inbox | 1 or 3 agents, 100 conversations a month (AI off; AI cost shown separately) | Channels, free option, cost for 3 agents, AI billing, self-host | Channels, free plan vs trial, AI billing model, branding removal | Use cases with trade-offs, AI cost made clear |
| Email | Newsletter, marketing automation, transactional, multi-channel | 10,000 subscribers at 4 campaigns a month, or 10,000 app emails a month (also other sizes) | Type, free plan, cost at chosen size, newsletters allowed?, status | Type, audience size, self-host, API, platform | Same-audience prices and "newsletters allowed" |
| Analytics | Web, product, session replay, mobile, revenue | 100,000 pageviews a month (also 10k and 1M) | Job, cookieless?, data location, cost, self-host | Job, privacy (cookieless, EU data), self-host, licence | Privacy facts as filters, not marketing claims |
| Auth | Hosted service, library, self-hosted server | 10,000 monthly users (also 1k, 50k, 100k) | Type, free users, cost at 10k, SSO and orgs cost, frameworks | Type, framework, SSO, passkeys, licence | True cost including SSO and organization add-ons |

## Hub page

One line, eight category cards (count, cheapest lasting free start, number of recent changes), and the combined "What changed" strip. No table on the hub.

## Decisions for the owner

1. **Name and URL** for the directory (working name: Indie hacker apps).
2. **Detail view:** a dialog only, or also indexable child pages per app (`/<directory>/<app>`) like `/ad-networks/<slug>`. The research files are deep enough not to be thin pages.
3. **Pilot page:** build one sub-directory first to set the shared template. Suggested: Email (clear usage levels, strong data, one strong competitor to beat in EmailToolTester).
4. **Usage levels:** the headline levels in the table are the ones the research already priced. Confirm which one each page shows first.

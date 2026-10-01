# Tool roadmap feasibility review

Reviewed 24 September 2026. This review covers the KDP, YouTube, SaaS / Indie Hacker, and SEO Notion tables. The inventory below contains all 331 rows.

Applied in Notion on 25 September 2026: the four tables now have Rollout options **Narrow claim**, **Park for now**, and **Remove**, plus a **Review** column. The 53 Scope rows below were assigned Narrow claim, the 22 Park rows were assigned Park for now, and the 27 Remove rows were assigned Remove. Each changed row has a specific Review note. The other 229 rows kept their previous rollout values. No site code was changed by this review or Notion update.

## Decision

Keep most ideas. **Remove** means remove a standalone roadmap row, not delete an existing published tool. **Scope** means the idea is viable with a narrower claim or defined user inputs. **Park** means the idea needs a shared data source, licensed provider, or ongoing collection before it belongs in the near-term build pipeline. **Keep** means a distinct, buildable task remains, subject to the usual research and testing.

## Remove as standalone rows

### KDP

| # | Tool | Reason |
| ---: | --- | --- |
| 2 | KDP Cover Size & Spine Calculator | The published KDP Book Setup Calculator already provides the cover and spine result. |
| 3 | KDP Margin, Gutter & Bleed Calculator | The published setup calculator already provides the margin and bleed result. |
| 4 | KDP Trim Size & Page Count Checker | The published setup calculator already checks this combination. |
| 14 | KDP Paperback Royalty Calculator | The published KDP Royalty Calculator covers paperback. |
| 15 | KDP Hardcover Royalty Calculator | The published KDP Royalty Calculator covers hardcover. |
| 16 | KDP eBook Royalty Calculator | The published KDP Royalty Calculator covers Kindle eBook. |
| 22 | KENP Pages Needed to Earn Calculator | This reverses the formula in #21. Add an income-target mode there. |
| 35 | Amazon KDP BSR Sales Calculator | BSR is a relative, time-weighted rank, not a sales count. An output in daily or monthly sales would be an unverified estimate dressed as a measurement. |
| 37 | Category Bestseller Threshold Estimator | Category rank cannot yield a defensible sales threshold. Activity varies by category, format, competitors, and time. |
| 41 | Reverse ASIN Keyword Tool | A competing ASIN does not reveal the search terms that brought its traffic. A reverse report would need a licensed ranking dataset and remain inferred. |
| 62 | Book Trademark Checker | A yes/no checker implies legal clearance that an automated search cannot establish. Single-work titles and series titles have different trademark treatment. A research guide is a possible replacement. |

### YouTube

| # | Tool | Reason |
| ---: | --- | --- |
| 9 | YouTube Views to Money Calculator | Same views × assumed RPM task as #3 YouTube Earnings Calculator. |
| 24 | YouTube Monetization Date Calculator | A projected date from growth trends would imply reliable timing despite rolling watch-hour and Shorts windows, changing activity, and YouTube's review. Add scenario pace to #7 instead. |
| 25 | YouTube Watch Hours to Views Calculator | The inverse of #6 YouTube Watch Time Calculator. Add a target mode to #6. |
| 28 | YouTube Thumbnail A/B Test Calculator | Aggregated CTRs cannot establish a randomized winner. YouTube's native experiment uses watch-time share and viewer-level test data unavailable to this calculator. |

### SaaS / Indie Hacker

| # | Tool | Reason |
| ---: | --- | --- |
| 49 | SaaS Pricing Benchmark Tool | A credible benchmark needs a current, comparable dataset split by market, model, and segment. No source or maintenance plan is specified. Generic averages would create false authority. |

### SEO

| # | Tool | Reason |
| ---: | --- | --- |
| 31 | Crawl Budget Estimator | A public crawl cannot measure Google's crawl allocation. Keep crawl-trap diagnostics in the site crawler. Crawl-budget optimization is mainly for very large, frequently updated sites. |
| 52 | Keyword Difficulty Estimator | A universal difficulty score needs a maintained SERP and link dataset, and the number would still be a subjective model. Keep transparent competition observations in SERP research. |
| 85 | Organic Traffic Estimator | Public rankings cannot measure a competitor's traffic. Volume × position × generic CTR misses long-tail queries and changing SERP features. |
| 94 | Disavow File Validator & Generator | Most sites do not need disavow files, and Google warns that incorrect use can harm performance. A standalone generator promotes a rare advanced workflow. |
| 97 | Article Schema Generator | Article and NewsArticle forms fit inside #95 Schema Markup Generator. |
| 100 | Breadcrumb Schema Generator | BreadcrumbList is a small template inside #95. |
| 102 | SoftwareApplication Schema Generator | Another template inside #95, with no separate user workflow stated. |
| 103 | Event Schema Generator | Another template inside #95, with no separate user workflow stated. |
| 104 | Recipe Schema Generator | Another template inside #95; recipe publishing is outside the current Stack127 subjects. |
| 127 | Google AI Overview / AI Mode Citation Tracker | Google's Search Console AI reports provide visibility data, not a complete per-URL citation history. A visibility report is a possible replacement. |
| 132 | AI Citation Gap Analyzer | Cross-engine citation coverage cannot be established without a defined query sample and repeatable access to changing AI answers. The name implies completeness. |

## Keep with a narrower promise

These are the most consequential changes to the claim. Other **Scope** rows appear in the inventory.

- **KDP #38, #42, #43:** Use documented keyword rules and visible or user-supplied competitor facts. Do not claim exact Amazon search volume, hidden traffic, or proof that a niche will sell.
- **KDP #51:** The pre-order deadline tool applies to Kindle eBooks. Print books use scheduled release, not KDP pre-orders.
- **YouTube #1, #4, #5:** CPM, sponsor prices, and Shorts earnings need creator inputs or stated scenario assumptions. Country and niche alone do not produce a trustworthy rate.
- **YouTube #7:** Separate fan-funding and ad thresholds, apply current rules, and explain that threshold progress is not approval.
- **SaaS #18, #22, #43, #102:** LTV and tenure need explicit assumptions; a price floor needs fixed costs and expected sales; valuation is a sensitivity model with user-selected multiples.
- **SEO #21, #29, #67, #121-123, #129-130:** Actual indexing and search performance require authorized Search Console data. Its query rows are incomplete, so outputs must say what was observed.
- **SEO #33, #46, #76, #96:** A SERP snippet is a mockup, an SEO score is a judgment, internal PageRank is a local graph model, and valid schema does not guarantee rich results.
- **SEO #105-108:** Separate Lighthouse lab diagnostics from CrUX field data and show when field data is unavailable.
- **SEO #126:** Define a fixed query sample and supported engines; report sampled AI visibility, not universal visibility.

## Park until the data source exists

These are buildable in principle, but would be misleading or expensive as isolated free calculators today. Keep the ideas as a possible shared product pipeline.

- **KDP #44:** Historical BSR tracking needs reliable scheduled collection and a licensed or otherwise permissible source.
- **SEO #58, #79-84, #86:** Competitor keyword gaps, localized SERPs, rank history, and share of voice need a consistent SERP dataset.
- **SEO #87-93:** Backlink discovery and comparisons need a substantial link index or provider. Any quality judgment still needs human review.
- **SEO #115-119:** Local-grid rankings, citation coverage, and profile audits need localized results, maintained listing data, or business-owner access.
- **SEO #126:** Repeated AI sampling needs a defined query protocol and supported provider access before a meaningful measurement product is possible.

## Evidence used

- [Amazon says BSR is relative activity and is not an accurate activity tracker](https://kdp.amazon.com/en_US/help/topic/G201648140).
- [Amazon documents up to seven keywords and prohibited metadata patterns](https://kdp.amazon.com/en_US/help/topic/G201298500); [categories vary by marketplace and format](https://kdp.amazon.com/en_US/help/topic/G200652170).
- [KDP pre-orders apply to eBooks only](https://kdp.amazon.com/en_US/help/topic/G201499380).
- [YouTube lists monetization thresholds and review requirements](https://support.google.com/youtube/answer/72857); [its Analytics API requires owner authorization for channel and monetary metrics](https://developers.google.com/youtube/analytics/reference).
- [YouTube's native thumbnail experiment uses watch-time share](https://support.google.com/youtube/answer/13861714).
- [Search Console exposes a limited set of query rows](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data); [Google's 2026 AI reports describe visibility](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).
- [Google frames crawl-budget work around large sites](https://developers.google.com/crawling/docs/crawl-budget); [warns against routine disavow use](https://support.google.com/webmasters/answer/2648487); [and does not guarantee rich results for valid structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
- [Google distinguishes PageSpeed lab and field data](https://developers.google.com/speed/docs/insights/v5/about); [search appearance varies by query, device, and location](https://developers.google.com/search/docs/appearance/visual-elements-gallery).
- [USPTO distinguishes a single creative-work title from a series title](https://www.uspto.gov/trademarks/laws/title-single-work-refusal-and-how-overcome-refusal).

## Complete inventory

Each row links to its Notion item. **Done** and **In Process** are Notion statuses, not recommendations to remove existing work.

### KDP (63)

| # | Tool | Decision | Notion status |
| ---: | --- | --- | --- |
| 1 | [KDP Book Setup Calculator](https://app.notion.com/p/3e37bc97c443817c8564d41bd4a0f486) | Keep | Done |
| 2 | [KDP Cover Size & Spine Calculator](https://app.notion.com/p/3e37bc97c44381ff9ca7d35033d12aed) | Remove | — |
| 3 | [KDP Margin, Gutter & Bleed Calculator](https://app.notion.com/p/3e37bc97c443815faedad5d51fb25cad) | Remove | — |
| 4 | [KDP Trim Size & Page Count Checker](https://app.notion.com/p/3e37bc97c44381c7bd94ce062ce7f659) | Remove | — |
| 5 | [KDP Cover Template Generator](https://app.notion.com/p/3e37bc97c44381bd9028d51b6ed3a1d0) | Keep | — |
| 6 | [KDP Interior Template Generator](https://app.notion.com/p/3e37bc97c4438119a881f8ec393b87bb) | Keep | — |
| 7 | [KDP Interior PDF Preflight Checker](https://app.notion.com/p/3e37bc97c4438114a270d78e362d0a45) | Keep | Done |
| 8 | [KDP Cover PDF Preflight Checker](https://app.notion.com/p/3e37bc97c44381b3838fc72a08c6b884) | Keep | — |
| 9 | [KDP Image DPI Checker](https://app.notion.com/p/3e37bc97c4438174a0a6fee375b88ca1) | Keep | Done |
| 10 | [Pixels to Print Size Calculator](https://app.notion.com/p/3e37bc97c443812eab44c2c807f7d614) | Keep | In Process |
| 11 | [Word Count to KDP Page Count Estimator](https://app.notion.com/p/3e37bc97c4438179ac7ad8cf9577bc88) | Keep | Done |
| 12 | [Paperback vs Hardcover vs Color Calculator](https://app.notion.com/p/3e37bc97c443813fb0f5d31b7d2c5172) | Keep | — |
| 13 | [KDP Printing Cost Calculator](https://app.notion.com/p/3e37bc97c44381dca7b0eb5da9a0c20e) | Scope | — |
| 14 | [KDP Paperback Royalty Calculator](https://app.notion.com/p/3e37bc97c443817b8c01c27db8add926) | Remove | — |
| 15 | [KDP Hardcover Royalty Calculator](https://app.notion.com/p/3e37bc97c443814ba527d02ee91501f4) | Remove | — |
| 16 | [KDP eBook Royalty Calculator](https://app.notion.com/p/3e37bc97c443814b8753e25e104e367a) | Remove | — |
| 17 | [KDP Minimum List Price Calculator](https://app.notion.com/p/3e37bc97c44381599bf6c2c52fd3519c) | Keep | — |
| 18 | [KDP Price & Profit Calculator](https://app.notion.com/p/3e37bc97c44381b5b6a7e43767357223) | Keep | — |
| 19 | [KDP Expanded Distribution Calculator](https://app.notion.com/p/3e37bc97c44381e7a93edc713859923d) | Keep | — |
| 20 | [Kindle eBook Delivery Cost Calculator](https://app.notion.com/p/3e37bc97c44381dab77cea4c8d8581a7) | Keep | — |
| 21 | [Kindle Unlimited KENP Earnings Calculator](https://app.notion.com/p/3e37bc97c44381e994d5d34b54137c3d) | Keep | — |
| 22 | [KENP Pages Needed to Earn Calculator](https://app.notion.com/p/3e37bc97c4438130a283e4a4fb707b0a) | Remove | — |
| 23 | [KDP Multi-Format Profit Calculator](https://app.notion.com/p/3e37bc97c443815b9de8e1bc64219fb1) | Keep | — |
| 24 | [KDP Income Goal Calculator](https://app.notion.com/p/3e37bc97c44381649a14cfaddcf3bd35) | Keep | — |
| 25 | [Book Series Read-Through Calculator](https://app.notion.com/p/3e37bc97c443816a9a09e863b39fa13f) | Keep | — |
| 26 | [KDP Payment Date Calculator](https://app.notion.com/p/3e37bc97c443810a8c8de50cabe74197) | Keep | Done |
| 27 | [KDP Ads Profit Calculator](https://app.notion.com/p/3e37bc97c44381d782c0d45e54e9eb71) | Scope | — |
| 28 | [KDP Break-Even ACoS Calculator](https://app.notion.com/p/3e37bc97c443811ab3e8f1bc36b0bdec) | Keep | — |
| 29 | [KDP Break-Even CPC Calculator](https://app.notion.com/p/3e37bc97c44381b2b499c9f1526d5395) | Keep | — |
| 30 | [Amazon Ads ACoS & ROAS Calculator](https://app.notion.com/p/3e37bc97c44381a49874d40c29a65c66) | Keep | — |
| 31 | [KU-Adjusted Ads Profit Calculator](https://app.notion.com/p/3e37bc97c4438180aa41d21811afd3f7) | Scope | — |
| 32 | [Kindle Countdown Deal Calculator](https://app.notion.com/p/3e37bc97c44381b28c64ec1d85ef1fde) | Keep | — |
| 33 | [Free Book Promotion ROI Calculator](https://app.notion.com/p/3e37bc97c443817c9d19d518319e0c32) | Keep | — |
| 34 | [KDP Launch Budget Calculator](https://app.notion.com/p/3e37bc97c443817ebf2fef62b2a111fe) | Keep | — |
| 35 | [Amazon KDP BSR Sales Calculator](https://app.notion.com/p/3e37bc97c44381babc79fdde4544aca6) | Remove | — |
| 36 | [KDP Category Finder](https://app.notion.com/p/3e37bc97c44381de8dbdecf2064b6bd2) | Scope | — |
| 37 | [Category Bestseller Threshold Estimator](https://app.notion.com/p/3e37bc97c4438147b8c1f210b159e80f) | Remove | — |
| 38 | [Amazon KDP Keyword Research Tool](https://app.notion.com/p/3e37bc97c4438171af67f446588def4f) | Scope | — |
| 39 | [7 Backend Keywords Builder](https://app.notion.com/p/3e37bc97c4438182b96ae65c63eed1cf) | Keep | — |
| 40 | [KDP Keyword Compliance Checker](https://app.notion.com/p/3e37bc97c4438100a57de9abd85c5017) | Scope | — |
| 41 | [Reverse ASIN Keyword Tool](https://app.notion.com/p/3e37bc97c44381e19ad0d6d2df38469a) | Remove | — |
| 42 | [KDP Competitor Analyzer](https://app.notion.com/p/3e37bc97c44381fbb115deb311dd1617) | Scope | — |
| 43 | [KDP Niche Validator](https://app.notion.com/p/3e37bc97c443810992badebae66ff084) | Scope | — |
| 44 | [Amazon Book BSR Tracker](https://app.notion.com/p/3e37bc97c443815994ccf78c6241761f) | Park | — |
| 45 | [KDP Book Title Analyzer](https://app.notion.com/p/3e37bc97c44381b6b3b5e0aedba6a992) | Keep | — |
| 46 | [KDP Book Description Formatter & Preview](https://app.notion.com/p/3e37bc97c44381538e37c4755811f63d) | Keep | — |
| 47 | [KDP Book Description Analyzer](https://app.notion.com/p/3e37bc97c44381a09571c8d0c904ce9e) | Keep | — |
| 48 | [KDP Metadata Preflight Checker](https://app.notion.com/p/3e37bc97c443811692c2ca3109a9f4a4) | Keep | Done |
| 49 | [Book Reading Age & Readability Checker](https://app.notion.com/p/3e37bc97c443811382acd21d3455f2e3) | Scope | — |
| 50 | [KDP A+ Content Image Checker & Preview](https://app.notion.com/p/3e37bc97c44381d1ba6bc90f2d3b4a87) | Keep | — |
| 51 | [KDP Pre-Order Deadline Calculator](https://app.notion.com/p/3e37bc97c44381b08bc3e41fbb95746a) | Scope | — |
| 52 | [KDP Select 90-Day Calendar](https://app.notion.com/p/3e37bc97c44381b1b68cfb6a1386ee51) | Keep | — |
| 53 | [Kindle Promotion Scheduler](https://app.notion.com/p/3e37bc97c4438118b5c6f629dea93b56) | Scope | — |
| 54 | [KDP Publishing Checklist Generator](https://app.notion.com/p/3e37bc97c443811f8222faa476a551f3) | Keep | — |
| 55 | [KDP Interior PDF Assembler](https://app.notion.com/p/3e37bc97c44381459b12c269d3ec94d4) | Keep | — |
| 56 | [Images to KDP Book PDF Generator](https://app.notion.com/p/3e37bc97c4438191849cdfc11a62c6f8) | Keep | — |
| 57 | [Low-Content Interior Generator](https://app.notion.com/p/3e37bc97c443818daed5ca3189df2901) | Keep | — |
| 58 | [Puzzle & Activity Book Generator](https://app.notion.com/p/3e37bc97c4438177abd9ef849631d610) | Keep | — |
| 59 | [Children's Book Page Planner](https://app.notion.com/p/3e37bc97c44381ec831ed4877443261f) | Keep | — |
| 60 | [Coloring Book Interior Builder](https://app.notion.com/p/3e37bc97c443818ebbd1c0ce3dc16845) | Keep | — |
| 61 | [ISBN & Bookland Barcode Toolkit](https://app.notion.com/p/3e37bc97c443818b8528dc1a692b3ab8) | Keep | — |
| 62 | [Book Trademark Checker](https://app.notion.com/p/3e37bc97c44381bd8c49ca517933e284) | Remove | — |
| — | [KDP Royalty Calculator](https://app.notion.com/p/3e57bc97c44381f5a16dc1abd6ccdfe7) | Keep | Done |

### YouTube (32)

| # | Tool | Decision | Notion status |
| ---: | --- | --- | --- |
| 1 | [YouTube CPM Calculator](https://app.notion.com/p/3e37bc97c4438100b963fe242fbbada6) | Scope | — |
| 2 | [YouTube RPM Calculator](https://app.notion.com/p/3e37bc97c44381b29d78d98ce5ee082d) | Keep | — |
| 3 | [YouTube Earnings Calculator](https://app.notion.com/p/3e37bc97c4438128be12ded5ea5c30b5) | Keep | — |
| 4 | [YouTube Sponsorship Rate Calculator](https://app.notion.com/p/3e37bc97c443815e81bed1c7ee5f3dc2) | Scope | — |
| 5 | [YouTube Shorts Earnings Calculator](https://app.notion.com/p/3e37bc97c443810e8159c69e3e222bb6) | Scope | — |
| 6 | [YouTube Watch Time Calculator](https://app.notion.com/p/3e37bc97c4438142b0adc7bc98a080d9) | Keep | — |
| 7 | [YouTube Monetization Eligibility Calculator](https://app.notion.com/p/3e37bc97c4438119815dfa6cd20ecee7) | Scope | — |
| 8 | [YouTube Engagement Rate Calculator](https://app.notion.com/p/3e37bc97c443818388bfc17cfc4d772d) | Keep | — |
| 9 | [YouTube Views to Money Calculator](https://app.notion.com/p/3e37bc97c44381bab10ce81db48a0cce) | Remove | — |
| 10 | [YouTube Views Needed to Earn Calculator](https://app.notion.com/p/3e37bc97c4438121b24de9ee99bcfeaa) | Keep | — |
| 11 | [YouTube Audience Retention Calculator](https://app.notion.com/p/3e37bc97c44381cc82c3ca601cb2569f) | Scope | — |
| 12 | [YouTube CTR Calculator](https://app.notion.com/p/3e37bc97c44381319e3dd6179457286f) | Scope | — |
| 13 | [YouTube Video ROI Calculator](https://app.notion.com/p/3e37bc97c44381b9a6f7e345d3f19042) | Keep | — |
| 14 | [YouTube Break-Even Views Calculator](https://app.notion.com/p/3e37bc97c44381458ba6c0849ef157f0) | Keep | — |
| 15 | [YouTube Sponsorship CPM Calculator](https://app.notion.com/p/3e37bc97c443816aab15d56584f2f69b) | Keep | — |
| 16 | [YouTube Brand Deal Profit Calculator](https://app.notion.com/p/3e37bc97c44381768363c8bfc9ccbc90) | Keep | — |
| 17 | [YouTube Affiliate Earnings Calculator](https://app.notion.com/p/3e37bc97c443817c8ca3d3f20582b231) | Keep | — |
| 18 | [YouTube Total Creator Revenue Calculator](https://app.notion.com/p/3e37bc97c44381a5b725ffbb2135fd4f) | Keep | — |
| 19 | [YouTube Effective RPM Calculator](https://app.notion.com/p/3e37bc97c44381a7bb05fbaf2fffe7e2) | Scope | — |
| 20 | [YouTube Channel Membership Revenue Calculator](https://app.notion.com/p/3e37bc97c44381bcb071cf26a3b65f93) | Keep | — |
| 21 | [YouTube Super Chat / Super Thanks Calculator](https://app.notion.com/p/3e37bc97c4438157a75ae140c6a44b3f) | Keep | — |
| 22 | [YouTube Subscriber Growth Calculator](https://app.notion.com/p/3e37bc97c4438197a65cef15b827c74c) | Keep | — |
| 23 | [YouTube Views Growth Calculator](https://app.notion.com/p/3e37bc97c4438135b7f9ccfff85ee81c) | Keep | — |
| 24 | [YouTube Monetization Date Calculator](https://app.notion.com/p/3e37bc97c44381ceac63f806f33d986a) | Remove | — |
| 25 | [YouTube Watch Hours to Views Calculator](https://app.notion.com/p/3e37bc97c443812b890ccab6555e933d) | Remove | — |
| 26 | [YouTube Shorts Monetization Progress Calculator](https://app.notion.com/p/3e37bc97c4438134bad3e68e8c6fddeb) | Keep | — |
| 27 | [YouTube Shorts Stayed-to-Watch Calculator](https://app.notion.com/p/3e37bc97c4438141add9fba4a5a4c276) | Keep | — |
| 28 | [YouTube Thumbnail A/B Test Calculator](https://app.notion.com/p/3e37bc97c44381b49946eae1dfb91827) | Remove | — |
| 29 | [YouTube Script Length Calculator](https://app.notion.com/p/3e37bc97c44381d7ad78d915557b4ab5) | Keep | — |
| 30 | [YouTube Video File Size Calculator](https://app.notion.com/p/3e37bc97c44381c788add51ed991af9d) | Keep | — |
| 31 | [YouTube Upload Time Calculator](https://app.notion.com/p/3e37bc97c443813aa11ce6b8f1645e60) | Keep | — |
| 32 | [YouTube Playlist Duration Calculator](https://app.notion.com/p/3e37bc97c443814e97a5d93ef1203055) | Keep | — |

### SaaS / Indie Hacker (104)

| # | Tool | Decision | Notion status |
| ---: | --- | --- | --- |
| 1 | [SaaS Metrics Calculator](https://app.notion.com/p/3e37bc97c44381bf8a6fdbff322ce32a) | Keep | — |
| 2 | [MRR Calculator](https://app.notion.com/p/3e37bc97c44381b6973dd4b3a8ffbc59) | Keep | — |
| 3 | [ARR Calculator](https://app.notion.com/p/3e37bc97c4438105a98be6e773bc78bc) | Keep | — |
| 4 | [MRR Waterfall Calculator](https://app.notion.com/p/3e37bc97c44381a19aeadc589e3053c6) | Keep | — |
| 5 | [MRR Growth Calculator](https://app.notion.com/p/3e37bc97c443819db557eaf0c88eb03e) | Keep | — |
| 6 | [ARPU / ARPA Calculator](https://app.notion.com/p/3e37bc97c4438138b7dbfea9c2682f27) | Keep | — |
| 7 | [ACV Calculator](https://app.notion.com/p/3e37bc97c4438104b54ac51a7d6fdc3a) | Keep | — |
| 8 | [SaaS Gross Margin Calculator](https://app.notion.com/p/3e37bc97c443813784b8e5f3ac71a115) | Keep | — |
| 9 | [Net Revenue Retention Calculator](https://app.notion.com/p/3e37bc97c4438159a09aca744acac475) | Keep | — |
| 10 | [Gross Revenue Retention Calculator](https://app.notion.com/p/3e37bc97c44381bb9ddff12062635cec) | Keep | — |
| 11 | [Customer Churn Calculator](https://app.notion.com/p/3e37bc97c4438192b4c6da0cc8463a77) | Keep | — |
| 12 | [Revenue Churn Calculator](https://app.notion.com/p/3e37bc97c443817a9bbbec6c68eae064) | Keep | — |
| 13 | [SaaS Quick Ratio Calculator](https://app.notion.com/p/3e37bc97c4438183ac45fc460cd4be16) | Keep | — |
| 14 | [Rule of 40 Calculator](https://app.notion.com/p/3e37bc97c44381efb8f2d2f06e598c46) | Keep | — |
| 15 | [SaaS Magic Number Calculator](https://app.notion.com/p/3e37bc97c44381b59e39e8b498157617) | Keep | — |
| 16 | [Burn Multiple Calculator](https://app.notion.com/p/3e37bc97c44381959d3cd9075d11f903) | Keep | — |
| 17 | [Customer Acquisition Cost Calculator](https://app.notion.com/p/3e37bc97c443814c9c69e3dcdb10dfbb) | Keep | — |
| 18 | [Customer Lifetime Value Calculator](https://app.notion.com/p/3e37bc97c44381cf8610f156d74b0bda) | Scope | — |
| 19 | [LTV:CAC Calculator](https://app.notion.com/p/3e37bc97c443816f972bed3656f092c8) | Keep | — |
| 20 | [CAC Payback Calculator](https://app.notion.com/p/3e37bc97c443814988c8cb730299ce77) | Keep | — |
| 21 | [SaaS Unit Economics Calculator](https://app.notion.com/p/3e37bc97c44381f69507f823e1aad157) | Keep | — |
| 22 | [Customer Tenure Calculator](https://app.notion.com/p/3e37bc97c44381f6a530c4efe4baebd8) | Scope | — |
| 23 | [Cost to Serve per Customer Calculator](https://app.notion.com/p/3e37bc97c44381dabd4ff7704fd08b21) | Keep | — |
| 24 | [Contribution Margin per Customer Calculator](https://app.notion.com/p/3e37bc97c44381a1bba7f60d272017bf) | Keep | — |
| 25 | [Customer Profitability Calculator](https://app.notion.com/p/3e37bc97c443817fb83bd1271698b6ed) | Keep | — |
| 26 | [Break-Even MRR Calculator](https://app.notion.com/p/3e37bc97c4438149a08dfdf43f51c91d) | Keep | — |
| 27 | [Break-Even Customers Calculator](https://app.notion.com/p/3e37bc97c44381bd9357c2fcb87db6fd) | Keep | — |
| 28 | [Ramen Profitability Calculator](https://app.notion.com/p/3e37bc97c44381a6b2c9da36967df55b) | Keep | — |
| 29 | [Profitability Timeline Calculator](https://app.notion.com/p/3e37bc97c44381949f13c318f47dfd97) | Keep | — |
| 30 | [SaaS Cost Structure Calculator](https://app.notion.com/p/3e37bc97c44381d1a4d7c1035af36779) | Keep | — |
| 31 | [SaaS Pricing Calculator](https://app.notion.com/p/3e37bc97c44381b19d7cfb495cefd1fe) | Keep | — |
| 32 | [SaaS Pricing Tier Builder](https://app.notion.com/p/3e37bc97c44381aa8273f30f2d0f8a91) | Keep | — |
| 33 | [Plan Mix Revenue Calculator](https://app.notion.com/p/3e37bc97c44381f2825fe3c4c696fe0e) | Keep | — |
| 34 | [Monthly vs Annual Pricing Calculator](https://app.notion.com/p/3e37bc97c443817c8bfeea34ab4537fd) | Keep | — |
| 35 | [Discount Impact Calculator](https://app.notion.com/p/3e37bc97c4438109aa39c77599745129) | Keep | — |
| 36 | [Price Increase Calculator](https://app.notion.com/p/3e37bc97c44381feaa26eecf2ae7fd16) | Keep | — |
| 37 | [Price Migration Calculator](https://app.notion.com/p/3e37bc97c44381c3b494f781298f4ffe) | Keep | — |
| 38 | [Usage-Based Pricing Calculator](https://app.notion.com/p/3e37bc97c443817a88bcfd6008ada1fe) | Keep | — |
| 39 | [Volume vs Graduated Pricing Calculator](https://app.notion.com/p/3e37bc97c44381a880e2e0989aa7fe77) | Keep | — |
| 40 | [Seat-Based Pricing Calculator](https://app.notion.com/p/3e37bc97c443814bb6eff8e010d9cd30) | Keep | — |
| 41 | [Hybrid Pricing Calculator](https://app.notion.com/p/3e37bc97c44381418f6fc4759a43d532) | Keep | — |
| 42 | [Credit-Based Pricing Calculator](https://app.notion.com/p/3e37bc97c4438192af82d68a75e643e4) | Keep | — |
| 43 | [Minimum Viable SaaS Price Calculator](https://app.notion.com/p/3e37bc97c44381818e17f1f47cff6333) | Scope | — |
| 44 | [Freemium vs Free Trial Calculator](https://app.notion.com/p/3e37bc97c44381bdb0b5fce9eb6dcba5) | Keep | — |
| 45 | [Free Trial Conversion Calculator](https://app.notion.com/p/3e37bc97c44381b39b0cf5c01bc36ff2) | Keep | — |
| 46 | [Free-to-Paid Conversion Calculator](https://app.notion.com/p/3e37bc97c44381588db4db23c522a627) | Keep | — |
| 47 | [Pricing A/B Test Calculator](https://app.notion.com/p/3e37bc97c44381b2873eef7ffc20723a) | Scope | — |
| 48 | [Price Sensitivity Calculator](https://app.notion.com/p/3e37bc97c443815bba4ec3c34f459bc8) | Keep | — |
| 49 | [SaaS Pricing Benchmark Tool](https://app.notion.com/p/3e37bc97c44381a98159f152773c9afb) | Remove | — |
| 50 | [AI SaaS Pricing Calculator](https://app.notion.com/p/3e37bc97c443818195a3c372a9b9f69d) | Keep | — |
| 51 | [AI SaaS Gross Margin Calculator](https://app.notion.com/p/3e37bc97c44381eaa4f2fe54518f99d7) | Keep | — |
| 52 | [SaaS Sales Funnel Calculator](https://app.notion.com/p/3e37bc97c443816e9bfad7ef0ac0cb82) | Keep | — |
| 53 | [Revenue per Visitor Calculator](https://app.notion.com/p/3e37bc97c44381c49f44f647af240d25) | Keep | — |
| 54 | [Visitor-to-Signup Calculator](https://app.notion.com/p/3e37bc97c44381a6a562fb113ac020d6) | Keep | — |
| 55 | [Signup-to-Activation Calculator](https://app.notion.com/p/3e37bc97c4438147b043e9db788fb967) | Keep | — |
| 56 | [Cost per Lead Calculator](https://app.notion.com/p/3e37bc97c443819aab73dee48139fddc) | Keep | — |
| 57 | [CAC by Acquisition Channel Calculator](https://app.notion.com/p/3e37bc97c44381508605fed3cb121456) | Keep | — |
| 58 | [Organic vs Paid Acquisition Calculator](https://app.notion.com/p/3e37bc97c4438167945cc005da0e38a4) | Keep | — |
| 59 | [Sales Win Rate Calculator](https://app.notion.com/p/3e37bc97c44381eb8222ef4fd330195d) | Keep | — |
| 60 | [Weighted Sales Pipeline Calculator](https://app.notion.com/p/3e37bc97c4438187854ee2a4f80bd5a7) | Keep | — |
| 61 | [Sales Velocity Calculator](https://app.notion.com/p/3e37bc97c44381568ac5f06c624d1207) | Keep | — |
| 62 | [Lead Velocity Rate Calculator](https://app.notion.com/p/3e37bc97c44381f89acbf2843bcafb3f) | Keep | — |
| 63 | [Customer Growth Calculator](https://app.notion.com/p/3e37bc97c44381b7ae0fde36f6a35ac0) | Keep | — |
| 64 | [MRR Growth Projection Calculator](https://app.notion.com/p/3e37bc97c4438180a069f90b8f96216f) | Keep | — |
| 65 | [SaaS Revenue Forecast Calculator](https://app.notion.com/p/3e37bc97c44381e8abdad2e7db6cbc81) | Keep | — |
| 66 | [Time to MRR Goal Calculator](https://app.notion.com/p/3e37bc97c443812c95aaf74b16ffc6c3) | Keep | — |
| 67 | [Customers Needed for MRR Goal Calculator](https://app.notion.com/p/3e37bc97c4438114aabbf1528b3c3685) | Keep | — |
| 68 | [Traffic Needed for MRR Goal Calculator](https://app.notion.com/p/3e37bc97c443812480cfd684f8a83e63) | Keep | — |
| 69 | [Customer Retention Calculator](https://app.notion.com/p/3e37bc97c443819f8c60d38ba99728f4) | Keep | — |
| 70 | [Churn Impact Calculator](https://app.notion.com/p/3e37bc97c44381d5b5d9de45b031e096) | Keep | — |
| 71 | [Retention Improvement Calculator](https://app.notion.com/p/3e37bc97c4438171a7dbcbe7f7aae614) | Keep | — |
| 72 | [NRR Improvement Simulator](https://app.notion.com/p/3e37bc97c4438136a3d6e54256e5c095) | Keep | — |
| 73 | [Expansion MRR Calculator](https://app.notion.com/p/3e37bc97c4438151aa70c501c8794548) | Keep | — |
| 74 | [Contraction MRR Calculator](https://app.notion.com/p/3e37bc97c4438194bfc0f2595d904f66) | Keep | — |
| 75 | [Failed Payment Revenue Loss Calculator](https://app.notion.com/p/3e37bc97c44381fa856eee79a964a12b) | Keep | — |
| 76 | [Dunning Revenue Recovery Calculator](https://app.notion.com/p/3e37bc97c44381e8be61d98ec4aba027) | Keep | — |
| 77 | [Customer Win-Back Calculator](https://app.notion.com/p/3e37bc97c4438130ae8dfabaf291d2d6) | Keep | — |
| 78 | [Renewal Rate Calculator](https://app.notion.com/p/3e37bc97c44381c4b6ddeb72be110940) | Keep | — |
| 79 | [Monthly ↔ Annual Churn Converter](https://app.notion.com/p/3e37bc97c44381e9a0e3d9d7c21140e0) | Keep | — |
| 80 | [Cohort Retention Calculator](https://app.notion.com/p/3e37bc97c44381979b08e775ab03cfb6) | Keep | — |
| 81 | [SaaS Activation Rate Calculator](https://app.notion.com/p/3e37bc97c443817cb5d2c673c5b0bdb3) | Keep | — |
| 82 | [Time to Value Calculator](https://app.notion.com/p/3e37bc97c44381619832ea50a61d0bdf) | Keep | — |
| 83 | [Onboarding Completion Calculator](https://app.notion.com/p/3e37bc97c4438198a7b7c476822ee355) | Keep | — |
| 84 | [Product Stickiness Calculator](https://app.notion.com/p/3e37bc97c44381e1818bf032d3bd1052) | Keep | — |
| 85 | [Feature Adoption Calculator](https://app.notion.com/p/3e37bc97c44381f69524c4856177f92e) | Keep | — |
| 86 | [Product Qualified Lead Calculator](https://app.notion.com/p/3e37bc97c443818bb03bddfe14b9ea24) | Scope | — |
| 87 | [Product-Market Fit Survey Calculator](https://app.notion.com/p/3e37bc97c44381da9e76c30f96dd2297) | Keep | — |
| 88 | [A/B Test Significance Calculator](https://app.notion.com/p/3e37bc97c44381d9b479fbedeffe2df1) | Keep | — |
| 89 | [A/B Test Sample Size Calculator](https://app.notion.com/p/3e37bc97c44381cab3b8c2b12bfdd36b) | Keep | — |
| 90 | [Startup Burn Rate Calculator](https://app.notion.com/p/3e37bc97c44381898f5adc487cc8582d) | Keep | — |
| 91 | [Startup Runway Calculator](https://app.notion.com/p/3e37bc97c4438166a654e087ce4d65f0) | Keep | — |
| 92 | [Dynamic Runway Calculator](https://app.notion.com/p/3e37bc97c44381d192b9e273755cea77) | Keep | — |
| 93 | [Startup Budget Calculator](https://app.notion.com/p/3e37bc97c443813a88c3d86f09bb3b31) | Keep | — |
| 94 | [Founder Salary Calculator](https://app.notion.com/p/3e37bc97c44381c39f5aea11aa7e0c67) | Keep | — |
| 95 | [Hiring Affordability Calculator](https://app.notion.com/p/3e37bc97c44381c29045f44315689650) | Keep | — |
| 96 | [Cash Flow Forecast Calculator](https://app.notion.com/p/3e37bc97c44381b19025f00773276fb4) | Keep | — |
| 97 | [Fundraising Amount Calculator](https://app.notion.com/p/3e37bc97c44381eb8a4cc9d3ad0f0346) | Keep | — |
| 98 | [Startup Dilution Calculator](https://app.notion.com/p/3e37bc97c44381f3a7e2df9747ba06e3) | Keep | — |
| 99 | [SAFE Conversion Calculator](https://app.notion.com/p/3e37bc97c443810680d2d064f3182624) | Scope | — |
| 100 | [Pre-Money / Post-Money Calculator](https://app.notion.com/p/3e37bc97c44381f8b731eb1f539245e5) | Keep | — |
| 101 | [Startup Cap Table Calculator](https://app.notion.com/p/3e37bc97c443814393bdd3aaff143e36) | Keep | — |
| 102 | [SaaS Valuation Calculator](https://app.notion.com/p/3e37bc97c4438148b590dfc0d416b686) | Scope | — |
| 103 | [Exit Value & Founder Payout Calculator](https://app.notion.com/p/3e37bc97c4438153b8d3e33f7c84194b) | Scope | — |
| 104 | [TAM / SAM / SOM Calculator](https://app.notion.com/p/3e37bc97c44381f6b0c2c2fc0ffda30b) | Scope | — |

### SEO (132)

| # | Tool | Decision | Notion status |
| ---: | --- | --- | --- |
| 1 | [SEO Site Audit](https://app.notion.com/p/3e37bc97c443818481e0df3ef2e10059) | Scope | — |
| 2 | [Single Page SEO Checker](https://app.notion.com/p/3e37bc97c44381db8a61f2bde99a15b3) | Keep | — |
| 3 | [Website Crawler](https://app.notion.com/p/3e37bc97c4438189a9add272b5f47540) | Keep | — |
| 4 | [Broken Link Checker](https://app.notion.com/p/3e37bc97c443819d9a48c116f0cd78cc) | Keep | — |
| 5 | [Bulk HTTP Status Code Checker](https://app.notion.com/p/3e37bc97c4438124968cf4bfc5dcf0af) | Keep | — |
| 6 | [Redirect Checker](https://app.notion.com/p/3e37bc97c4438155850df99b7dcda098) | Keep | — |
| 7 | [Redirect Chain & Loop Checker](https://app.notion.com/p/3e37bc97c44381799245edb5e538f692) | Keep | — |
| 8 | [JavaScript Fetch & Render Tool](https://app.notion.com/p/3e37bc97c443818bb144d85ea7f3e171) | Keep | — |
| 9 | [Raw vs Rendered HTML Diff](https://app.notion.com/p/3e37bc97c44381838db8d02181583aa7) | Keep | — |
| 10 | [Desktop vs Mobile SEO Difference Checker](https://app.notion.com/p/3e37bc97c443814a9980ed2317dcd5b2) | Keep | — |
| 11 | [Duplicate Content Finder](https://app.notion.com/p/3e37bc97c4438174a392d623ac22522e) | Keep | — |
| 12 | [Near-Duplicate Content Finder](https://app.notion.com/p/3e37bc97c44381a99f2cf5873edc4842) | Keep | — |
| 13 | [Thin Content Finder](https://app.notion.com/p/3e37bc97c443816bb3eadaafa9436cbb) | Keep | — |
| 14 | [Website Change Monitor](https://app.notion.com/p/3e37bc97c4438118a3e4cb2c3199100c) | Keep | — |
| 15 | [SEO HTTP Header Checker](https://app.notion.com/p/3e37bc97c4438130aec4cca725cd3428) | Keep | — |
| 16 | [Resource Crawlability Checker](https://app.notion.com/p/3e37bc97c44381c99861caf397ca634e) | Keep | — |
| 17 | [Robots.txt Generator](https://app.notion.com/p/3e37bc97c44381bd93a2c7c70ec0b990) | Keep | — |
| 18 | [Robots.txt Tester](https://app.notion.com/p/3e37bc97c44381bc9768dff931a1c524) | Scope | — |
| 19 | [Bulk Robots.txt URL Tester](https://app.notion.com/p/3e37bc97c44381a9b361f901c77b218f) | Keep | — |
| 20 | [Meta Robots / X-Robots Checker](https://app.notion.com/p/3e37bc97c4438149b344d5f05c1e42ab) | Keep | — |
| 21 | [Indexability Checker](https://app.notion.com/p/3e37bc97c44381c5a544d12672e58ccd) | Scope | — |
| 22 | [Canonical Tag Checker](https://app.notion.com/p/3e37bc97c44381fca60ef521c9ba8695) | Keep | — |
| 23 | [Canonical Conflict Checker](https://app.notion.com/p/3e37bc97c443816ca349faba9ea23767) | Keep | — |
| 24 | [URL Normalization Checker](https://app.notion.com/p/3e37bc97c44381ee97cec3baf554cd51) | Keep | — |
| 25 | [XML Sitemap Generator](https://app.notion.com/p/3e37bc97c44381259baed75d585bf5a2) | Keep | — |
| 26 | [Sitemap Index Generator](https://app.notion.com/p/3e37bc97c443811a8bb9d9607ea03331) | Keep | — |
| 27 | [XML Sitemap Validator](https://app.notion.com/p/3e37bc97c443814ab146fa63a9f8ad6c) | Keep | — |
| 28 | [Sitemap vs Crawl Comparator](https://app.notion.com/p/3e37bc97c44381019ccadb585a2bc2c5) | Keep | — |
| 29 | [Index Bloat Checker](https://app.notion.com/p/3e37bc97c44381bf83bedff315378e7e) | Scope | — |
| 30 | [Faceted Navigation Analyzer](https://app.notion.com/p/3e37bc97c443818a87cbea636259ba81) | Keep | — |
| 31 | [Crawl Budget Estimator](https://app.notion.com/p/3e37bc97c443810ca411c3824c5208e1) | Remove | — |
| 32 | [URL Parameter Analyzer](https://app.notion.com/p/3e37bc97c44381a383b9ebf1cf596748) | Keep | — |
| 33 | [Google SERP Snippet Preview](https://app.notion.com/p/3e37bc97c44381fbaa01eb657b1c8860) | Scope | — |
| 34 | [Title Tag Analyzer](https://app.notion.com/p/3e37bc97c44381ef96dee026abec4a03) | Keep | — |
| 35 | [Meta Description Analyzer](https://app.notion.com/p/3e37bc97c4438101a626cb2e5409695b) | Keep | — |
| 36 | [Heading Structure Checker](https://app.notion.com/p/3e37bc97c44381f28bfdf56ae74fcd4b) | Keep | — |
| 37 | [Title vs H1 Alignment Checker](https://app.notion.com/p/3e37bc97c44381eda51cffa8eec090e9) | Keep | — |
| 38 | [URL Slug Analyzer](https://app.notion.com/p/3e37bc97c443812098aeda4ced6ccc70) | Keep | — |
| 39 | [Image Alt Text Checker](https://app.notion.com/p/3e37bc97c4438122a55ae7676bee1c07) | Keep | — |
| 40 | [Image SEO Audit](https://app.notion.com/p/3e37bc97c4438140a246db48b989356f) | Keep | — |
| 41 | [Keyword Placement Checker](https://app.notion.com/p/3e37bc97c443817db757edbad4ca1bfd) | Keep | — |
| 42 | [Search Intent Match Checker](https://app.notion.com/p/3e37bc97c44381ea86edc813529969e3) | Keep | — |
| 43 | [Page Link Analyzer](https://app.notion.com/p/3e37bc97c44381f7b101ca062e784276) | Keep | — |
| 44 | [Favicon Checker](https://app.notion.com/p/3e37bc97c4438163a2d2f74e4b62c9df) | Keep | — |
| 45 | [Site Name / Organization Checker](https://app.notion.com/p/3e37bc97c44381a7bedfffdf4ec19ff9) | Keep | — |
| 46 | [On-Page SEO Scorecard](https://app.notion.com/p/3e37bc97c44381a094cacd10858622f0) | Scope | — |
| 47 | [Keyword Generator](https://app.notion.com/p/3e37bc97c4438157a094ebf7b25d44c8) | Keep | — |
| 48 | [Long-Tail Keyword Generator](https://app.notion.com/p/3e37bc97c44381bc9718efc98d374f66) | Keep | — |
| 49 | [Question Keyword Finder](https://app.notion.com/p/3e37bc97c443818cab47cdd0e06d513b) | Keep | — |
| 50 | [Google Autocomplete Expander](https://app.notion.com/p/3e37bc97c44381038e48f2677b9206a4) | Scope | — |
| 51 | [Related Search Finder](https://app.notion.com/p/3e37bc97c44381e0bcd6f0d277e4f506) | Keep | — |
| 52 | [Keyword Difficulty Estimator](https://app.notion.com/p/3e37bc97c4438187a4f7c93f6fdcb36c) | Remove | — |
| 53 | [Search Intent Classifier](https://app.notion.com/p/3e37bc97c44381948a9ec4872897edb3) | Keep | — |
| 54 | [Keyword Clusterer](https://app.notion.com/p/3e37bc97c44381cea7f6cebeb2e61a95) | Keep | — |
| 55 | [Parent Topic Grouper](https://app.notion.com/p/3e37bc97c4438185bdfdc3a2b28e8ae4) | Keep | — |
| 56 | [Keyword Opportunity Score Calculator](https://app.notion.com/p/3e37bc97c4438117a492fc2bed942dc3) | Scope | — |
| 57 | [Keyword Cannibalization Checker](https://app.notion.com/p/3e37bc97c44381058db5f28d3eb26b67) | Keep | — |
| 58 | [Competitor Keyword Gap Tool](https://app.notion.com/p/3e37bc97c44381b6b940ea7117bcb751) | Park | — |
| 59 | [Keyword Trend Comparator](https://app.notion.com/p/3e37bc97c4438116a785ffaefb373d5c) | Keep | — |
| 60 | [Keyword List Cleaner & Deduplicator](https://app.notion.com/p/3e37bc97c44381d99e50d0c008436ee4) | Keep | — |
| 61 | [SEO Content Brief Generator](https://app.notion.com/p/3e37bc97c44381778ab8c7156e3b3446) | Scope | — |
| 62 | [SEO Content Optimizer](https://app.notion.com/p/3e37bc97c443817185e9f835b5f581db) | Scope | — |
| 63 | [Topical Coverage Analyzer](https://app.notion.com/p/3e37bc97c44381a3a113e1f020f3871e) | Keep | — |
| 64 | [Entity Gap Analyzer](https://app.notion.com/p/3e37bc97c443814f8f9adf64d3cf5e0a) | Keep | — |
| 65 | [Content Gap Analyzer](https://app.notion.com/p/3e37bc97c4438177b4d9d4d119dbf4e9) | Keep | — |
| 66 | [Content Refresh Opportunity Finder](https://app.notion.com/p/3e37bc97c4438158ba77df80a308b398) | Keep | — |
| 67 | [Content Decay Detector](https://app.notion.com/p/3e37bc97c4438120a8e4e7cc2b958638) | Scope | — |
| 68 | [Content Similarity Checker](https://app.notion.com/p/3e37bc97c44381a3ab26dab529f9c36f) | Keep | — |
| 69 | [Content Update Impact Tracker](https://app.notion.com/p/3e37bc97c4438196973dc6de484de1af) | Keep | — |
| 70 | [Readability & Content Structure Analyzer](https://app.notion.com/p/3e37bc97c44381c88f9acd3a04956b13) | Keep | — |
| 71 | [Internal Link Analyzer](https://app.notion.com/p/3e37bc97c4438193993ec64101b6ce19) | Keep | — |
| 72 | [Internal Link Opportunity Finder](https://app.notion.com/p/3e37bc97c4438163b927f28e97dc7661) | Keep | — |
| 73 | [Internal Anchor Text Analyzer](https://app.notion.com/p/3e37bc97c44381e6896fd13549d5b02d) | Keep | — |
| 74 | [Orphan Page Finder](https://app.notion.com/p/3e37bc97c44381b1a06be54adf515ad1) | Scope | — |
| 75 | [Site Architecture Visualizer](https://app.notion.com/p/3e37bc97c4438125b0f3df58e31365eb) | Keep | — |
| 76 | [Internal PageRank Calculator](https://app.notion.com/p/3e37bc97c4438193adabd1f0b5d664fe) | Scope | — |
| 77 | [Redirecting Internal Links Finder](https://app.notion.com/p/3e37bc97c44381a7a2e8e6cfbb064dff) | Keep | — |
| 78 | [Topic Cluster / Hub Coverage Analyzer](https://app.notion.com/p/3e37bc97c4438115a753e7daced922e2) | Keep | — |
| 79 | [SERP Checker](https://app.notion.com/p/3e37bc97c443813795aafbc089bcbe7f) | Park | — |
| 80 | [Keyword Rank Checker](https://app.notion.com/p/3e37bc97c443816daeaafb6fa79c5e34) | Park | — |
| 81 | [Bulk Rank Tracker](https://app.notion.com/p/3e37bc97c44381cb832bed0848b3d44e) | Park | — |
| 82 | [SERP Feature Analyzer](https://app.notion.com/p/3e37bc97c44381d2a755f3350f510562) | Park | — |
| 83 | [SERP Overlap Checker](https://app.notion.com/p/3e37bc97c44381339175fea4568e76e1) | Park | — |
| 84 | [Competitor SEO Snapshot](https://app.notion.com/p/3e37bc97c4438191b3e1c10781ca0cab) | Park | — |
| 85 | [Organic Traffic Estimator](https://app.notion.com/p/3e37bc97c44381f0b416cb62450c5cba) | Remove | — |
| 86 | [Organic Share of Voice Calculator](https://app.notion.com/p/3e37bc97c443812d8836e1b223fffe13) | Park | — |
| 87 | [Backlink Checker](https://app.notion.com/p/3e37bc97c44381b7b324eccc3f4f0ded) | Park | — |
| 88 | [Referring Domains Analyzer](https://app.notion.com/p/3e37bc97c44381a48469c9fc72e0b903) | Park | — |
| 89 | [Broken Backlink Finder](https://app.notion.com/p/3e37bc97c44381f8aa63d69bc0c7c3db) | Park | — |
| 90 | [Link Intersect / Backlink Gap Tool](https://app.notion.com/p/3e37bc97c44381e0b819d8cc4d5bb7a7) | Park | — |
| 91 | [Backlink Anchor Text Analyzer](https://app.notion.com/p/3e37bc97c443810eb1cdf19ce656195c) | Park | — |
| 92 | [Backlink Quality / Risk Reviewer](https://app.notion.com/p/3e37bc97c44381dc8004cb68043eed15) | Park | — |
| 93 | [Link Prospect Evaluator](https://app.notion.com/p/3e37bc97c44381998b4eeeff951ad252) | Park | — |
| 94 | [Disavow File Validator & Generator](https://app.notion.com/p/3e37bc97c4438177997de03d80d85027) | Remove | — |
| 95 | [Schema Markup Generator](https://app.notion.com/p/3e37bc97c44381edbda3ec20004c3fdc) | Keep | — |
| 96 | [Schema Markup Validator](https://app.notion.com/p/3e37bc97c44381b48a6fd4547697a565) | Scope | — |
| 97 | [Article Schema Generator](https://app.notion.com/p/3e37bc97c44381b3b15acb1f6b805249) | Remove | — |
| 98 | [Product & Merchant Schema Generator](https://app.notion.com/p/3e37bc97c44381629f6be81b0b9f454c) | Keep | — |
| 99 | [LocalBusiness Schema Generator](https://app.notion.com/p/3e37bc97c44381cc98aff7bfa2cd6e46) | Keep | — |
| 100 | [Breadcrumb Schema Generator](https://app.notion.com/p/3e37bc97c443818e9257e2095bfe3dce) | Remove | — |
| 101 | [Video Schema Generator](https://app.notion.com/p/3e37bc97c443814b8c66dfa88bbf4b93) | Keep | — |
| 102 | [SoftwareApplication Schema Generator](https://app.notion.com/p/3e37bc97c44381e48081c7616d0122db) | Remove | — |
| 103 | [Event Schema Generator](https://app.notion.com/p/3e37bc97c4438181bf73c18604b2d50e) | Remove | — |
| 104 | [Recipe Schema Generator](https://app.notion.com/p/3e37bc97c44381308a16cf1bb34b7ebb) | Remove | — |
| 105 | [Core Web Vitals Checker](https://app.notion.com/p/3e37bc97c44381a6b10fc347a0a7c27b) | Scope | — |
| 106 | [LCP Analyzer](https://app.notion.com/p/3e37bc97c44381f59547d7d35bf626b7) | Scope | — |
| 107 | [INP Analyzer](https://app.notion.com/p/3e37bc97c44381c79032fc3a207b1f52) | Scope | — |
| 108 | [CLS Analyzer](https://app.notion.com/p/3e37bc97c4438159b399e5481ea31d02) | Scope | — |
| 109 | [Page Weight & Request Analyzer](https://app.notion.com/p/3e37bc97c44381d18cbaf8699df31d86) | Keep | — |
| 110 | [TTFB / Server Response Analyzer](https://app.notion.com/p/3e37bc97c44381f3b8cfe515d3a2e80d) | Keep | — |
| 111 | [Image Optimization Savings Calculator](https://app.notion.com/p/3e37bc97c443816ab59eff5c3168f7d9) | Scope | — |
| 112 | [Hreflang Generator](https://app.notion.com/p/3e37bc97c443814799b4ccd853cdcff5) | Keep | — |
| 113 | [Hreflang Validator](https://app.notion.com/p/3e37bc97c44381159d29c0af39ae9d00) | Keep | — |
| 114 | [Locale-Adaptive Page Checker](https://app.notion.com/p/3e37bc97c4438138bc28f9d107462458) | Keep | — |
| 115 | [Local Search Rank Checker](https://app.notion.com/p/3e37bc97c443814eb68cf5e21b87feda) | Park | — |
| 116 | [Local Grid Rank Tracker](https://app.notion.com/p/3e37bc97c44381cd9b23cb02ad784fd4) | Park | — |
| 117 | [NAP Consistency Checker](https://app.notion.com/p/3e37bc97c44381d1ba55d7ff224f05ff) | Park | — |
| 118 | [Local Citation Finder & Gap Tool](https://app.notion.com/p/3e37bc97c443818ba741c84620917fbe) | Park | — |
| 119 | [Google Business Profile Audit](https://app.notion.com/p/3e37bc97c443812390accefb6b03a903) | Park | — |
| 120 | [Google Review Link Generator](https://app.notion.com/p/3e37bc97c44381bb915ce9054bf7d9af) | Keep | — |
| 121 | [Search Console Opportunity Finder](https://app.notion.com/p/3e37bc97c44381818a38c698755638e0) | Scope | — |
| 122 | [Low CTR Opportunity Finder](https://app.notion.com/p/3e37bc97c44381cb84b8de4513dd1fbf) | Scope | — |
| 123 | [GSC Query Cannibalization Finder](https://app.notion.com/p/3e37bc97c44381d1bba8f6938ffb9288) | Scope | — |
| 124 | [SEO Traffic Forecast Calculator](https://app.notion.com/p/3e37bc97c44381a4a1a3fb60f4eeb746) | Scope | — |
| 125 | [SEO ROI Calculator](https://app.notion.com/p/3e37bc97c44381089166d920cb77c4c1) | Keep | — |
| 126 | [AI Visibility Checker](https://app.notion.com/p/3e37bc97c4438131b499de8f9fdcde8a) | Park | — |
| 127 | [Google AI Overview / AI Mode Citation Tracker](https://app.notion.com/p/3e37bc97c44381d88a4eef424396dbab) | Remove | — |
| 128 | [AI Bot Access Tester](https://app.notion.com/p/3e37bc97c44381c0a663cdc0b55f1e33) | Scope | — |
| 129 | [Search Performance Anomaly Detector](https://app.notion.com/p/3e37bc97c44381c082acc0065ad181a7) | Scope | — |
| 130 | [Branded vs Non-Branded Search Analyzer](https://app.notion.com/p/3e37bc97c443814db3d8fa8eae645e30) | Scope | — |
| 131 | [Rank Improvement Traffic Calculator](https://app.notion.com/p/3e37bc97c4438151abcefe72b52d4092) | Keep | — |
| 132 | [AI Citation Gap Analyzer](https://app.notion.com/p/3e37bc97c44381ccba42c564ea2d335e) | Remove | — |

**Totals:** 229 Keep, 53 Scope, 22 Park, 27 Remove. All 331 rows reviewed.

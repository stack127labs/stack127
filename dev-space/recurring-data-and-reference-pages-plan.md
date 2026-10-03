# Recurring data and reference pages plan

Start with software maintenance data, package download trends, and AI API costs. These fit stack127's audience, support useful charts, and can build historical data over time.

This document records the supplied research plan. Its source checks and live-response verification are from that research, not a new verification during this documentation task. Fetch frequencies are recommendations.

## Priority and scope

The research checked the site's scope, official source documentation, reuse terms, and several live API responses. These are the six strongest options.

| Priority | Page idea | Data sources | Useful visuals and reports | Fetch frequency |
| --- | --- | --- | --- | --- |
| 1 | Software maintenance and support timelines | GitHub API, endoflife.date | Release timelines, support calendars, recent activity charts | Daily |
| 2 | Developer package download trends | npm API, PyPI public datasets | Download trends, growth comparisons, Python version breakdowns | Daily |
| 3 | AI API pricing and cost comparisons | Models.dev, provider pricing pages | Cost comparisons, price history, estimated monthly bills | Daily |
| 4 | Cloud hosting and storage costs | AWS, Azure, Google Cloud pricing APIs | Cost curves, regional comparisons, storage and transfer breakdowns | Daily |
| 5 | Website performance history | Google CrUX, HTTP Archive | Core Web Vitals trends, page weight, mobile comparisons | Weekly or monthly |
| 6 | Domain registration trends | ICANN registry reports | Registration growth, renewals, transfers, registrar shares | Monthly |

## 1. Add maintenance charts to the existing software directories

This is the easiest way to improve `/self-host-apps` and `/cli-apps` with recurring data.

The [GitHub release API](https://docs.github.com/en/rest/releases) supplies release dates, versions, prerelease flags, and download assets. Its [statistics API](https://docs.github.com/en/rest/metrics/statistics) also supplies weekly commit activity.

[endoflife.date](https://github.com/endoflife-date/endoflife.date) supplies version release dates, support dates, and end-of-life dates through a public API. Its repository uses the MIT license, though some descriptions have separate attribution requirements.

Start with 30 to 50 existing directory entries. Show release history and support dates on each entry. These help answer searches such as "Node.js support dates" or "is this self-hosted app still maintained?"

Keep the facts separate. Frequent commits do not prove software is reliable, and a quiet repository does not prove abandonment. GitHub permits 60 unauthenticated requests per hour and generally 5,000 authenticated requests per hour. See its [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## 2. Build package download comparisons for specific developer choices

The [npm download API](https://github.com/npm/registry/blob/main/docs/download-counts.md) provides daily counts and historical date ranges. Its documented history starts in January 2015. Individual requests can cover up to 18 months.

[PyPI's public BigQuery datasets](https://docs.pypi.org/api/bigquery/) contain download records with package, version, timestamp, and environment details. The linked data license is CC BY 4.0. BigQuery requires a Google Cloud project, and query costs depend on how much data you scan.

A useful first reference would be `/javascript-package-trends`, covering selected frameworks, validation libraries, authentication libraries, and database clients.

Show weekly downloads, annual change, and release dates beside the chart. A maintained monthly report could compare selected packages within each category.

Downloads include automated builds and repeated installations. Label them as downloads, never users or market share. Existing services such as [npm-stat](https://npm-stat.com/) already cover basic charts, so stack127 needs useful comparisons and context.

## 3. Build an AI cost reference with price history

[Models.dev](https://github.com/anomalyco/models.dev) publishes a structured dataset containing provider-specific prices, context limits, supported inputs, and capabilities. Its repository has an [MIT license](https://github.com/anomalyco/models.dev/blob/dev/LICENSE).

Suggested page: `/ai-api-pricing`.

Start with 20 to 30 models and show:

- Estimated cost for a fixed workload.
- Input, output, and cached-token costs separately.
- Price changes since collection began.
- Monthly cost at different request volumes.

The strongest reader task is "What will this AI feature cost to run?" A workload comparison answers that better than a model ranking.

Models.dev is community-maintained, so check important prices against provider sources. Some entries represent subscription plans rather than ordinary usage pricing. A zero value needs investigation before displaying "free."

OpenRouter also returned useful structured data, but the research did not establish permission to republish its catalog. Resolve that before using it as a publication source. See [OpenRouter terms](https://openrouter.ai/terms).

## 4. Build a focused cloud cost comparison

There are official structured sources:

| Source | Access | Useful data |
| --- | --- | --- |
| [AWS Price List](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html) | Public price files; API operations use IAM | Service, region, product, price tiers |
| [Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices) | No authentication required | Region, SKU, unit, retail price, effective date |
| [Google Cloud Catalog API](https://docs.cloud.google.com/billing/v1/how-tos/catalog-api) | API key and enabled Cloud Billing API | Public SKUs, regions, units, pricing |

Start with `/cloud-storage-costs`, covering storage, requests, and data transfer for a defined workload. Use cost curves to show where providers become more expensive.

A later `/small-saas-hosting-costs` page could combine compute, database, storage, and transfer assumptions.

This needs careful modeling. Published rates alone do not capture every charge, discount, or free allowance. AWS's catalog also excludes EC2 Spot prices. Existing tools such as [Vantage Instances](https://instances.vantage.sh/) and [EgressCost](https://egresscost.com/calculator/) already offer detailed comparisons, so a small SaaS focus matters.

## 5. Publish performance references with clearly defined comparisons

The [CrUX History API](https://developer.chrome.com/docs/crux/history-api) provides real-user Chrome performance data for eligible websites. It offers up to 40 weekly periods. Each point covers an overlapping 28-day window.

It requires an API key and offers 150 queries per minute per Cloud project without charge.

[HTTP Archive](https://httparchive.org/faq) supplies monthly measurements of page weight, scripts, images, and other website characteristics through public BigQuery datasets.

Possible page: `/website-performance-benchmarks`, initially covering a defined set of public SaaS marketing sites.

Show loading performance, interaction responsiveness, and layout stability separately. Do not use missing data as a poor-performance score or claim that a framework caused a result. Google's [CrUX Vis](https://cruxvis.withgoogle.com/) already handles basic history charts, so a generic duplicate would have little value.

## 6. Add registration history to the TLD directory

[ICANN monthly registry reports](https://www.icann.org/resources/pages/registry-reports) provide downloadable reports containing domain totals and registration transactions.

Use them to improve `/tld-directory`, with a possible child reference at `/tld-directory/registration-trends`.

Start with 10 relevant generic top-level domains. Show registrations, renewals, transfers, and changes over time.

The reports have a three-month publication delay. They do not cover every country-code domain, and registration counts do not measure active websites or brand suitability. The research found public downloads but did not establish the current republication terms.

## Other useful sources and their limits

| Source | Suitable use | Main condition |
| --- | --- | --- |
| [ECB exchange rates](https://data.ecb.europa.eu/help/api/data-examples) | Currency history and payout estimates alongside platform fees | Business-day reference rates, not actual payout rates. Reuse requires attribution and compliance with the [reuse policy](https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html). |
| [OSV vulnerability data](https://google.github.io/osv.dev/data/) | Version-specific advisory information beside software entries | Preserve source-specific licenses and advisory IDs. Raw advisory counts are poor quality rankings. |
| [Amazon KDP announcements](https://kdp.amazon.com/en_US/help/topic/G201541130) | A monthly KDP Select Global Fund history | Amazon announces the fund monthly. This is a reviewed collection task, and fund size alone cannot establish per-page earnings. |
| [Cloudflare Radar](https://developers.cloudflare.com/radar/) | Internet traffic, protocol, and technology charts | Its API data has a noncommercial license. Hold commercial use until permission is resolved. |
| [Artificial Analysis](https://artificialanalysis.ai/data-api/docs) | AI price, speed, and benchmark comparisons | API access and public redistribution rights differ. Publication needs the appropriate terms. |

## Shared collection process

Use the same process for each source:

1. Fetch the data.
2. Retain the source response.
3. Validate the data.
4. Store observations.
5. Refresh the page.

Every observation should retain its source date, fetch date, unit, currency, and source URL.

Keep missing values separate from zero. Preserve the last valid dataset when a fetch fails, and display its date. Only promise historical coverage that the source provides or that stack127 has actually collected.

## Build order

1. Directory maintenance charts.
2. Selected package comparisons.
3. AI cost comparisons.

Begin storing price snapshots early so later reports have real history.

## Research verification and limits

The supplied research reports verified live responses for GitHub, npm, endoflife.date, Models.dev, AWS, Azure, and ECB. Luna checked developer and web datasets; the coordinator reviewed pricing sources and the shortlist.

Credential-dependent sources remain documentation-checked. These rankings reflect audience fit and feasibility rather than measured search demand.

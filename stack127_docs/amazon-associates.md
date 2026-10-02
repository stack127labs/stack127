# Amazon Associates account

Checked: 4 September 2026

## US account

| Setting | Value |
| --- | --- |
| Primary marketplace | United States |
| US Store ID | `ravitejaknt00-20` |
| stack127 tracking ID | `stack127-20` |
| Selected tracking ID at check time | `stack127-20` |
| Partner Tag used for stack127 links | `stack127-20` |

We asked for the tracking ID `stack127`. Amazon created `stack127-20` instead.

Amazon uses `stack127-20` as the selected tracking ID for this account. The 24-hour enablement window Amazon showed during setup has passed.

## OneLink

| Item | Status |
| --- | --- |
| Status | Active for the primary US store. |
| Configured countries | United States, Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and United Kingdom. |
| Countries available to add | None. Amazon showed `No countries are available for selection`. |
| Countries needing separate signup | None shown in the OneLink screens. |
| Regional account not linked | India, Store ID `ravitejaknt02-21`. |
| OneLink default tracking IDs | None. The Tracking ID Preferences page showed `You have no default tracking IDs configured`. |
| Tracking ID propagation | The stated 24-hour window has passed. The homelab can't inspect the remote Mac browser session, so nobody has rechecked `stack127-20` as a OneLink default. |

The India Store ID stays unlinked because stack127's audience is US-focused.

No new regional account, agreement, tax form, or payment method was created or submitted.

## Product API

| Item | Value |
| --- | --- |
| Product name shown | Product Advertising API (PA API). |
| New API route shown | Creators API. Amazon says PA API is now available through Creators API. |
| API status | Not eligible. No access request was available, and no credentials were generated. |
| Exact Creators API eligibility message | `❌ Have an Approved Associates Account.` |
| PA API checks shown as not met | Approved Associates account, compliance with the Associates Program Operating Agreement, and 10 qualifying sales in the trailing 30 days. |
| API host | `https://creatorsapi.amazon` |
| US token endpoint | `https://api.amazon.com/auth/o2/token` |
| US credential version and region | `3.1`, North America |
| API marketplace | `www.amazon.com` |

Amazon's Creators API FAQ adds two requirements:

- You need an approved creators account and Full access to create applications and generate credentials.
- PA API access through Creators API needs at least 10 qualifying sales in the past 30 days.

## Creators API environment schema

The tracked `.env.affiliate.example` uses Amazon's Creators API credential names:

- `AMAZON_CREATORS_API_CREDENTIAL_ID`
- `AMAZON_CREATORS_API_SECRET`
- `AMAZON_CREATORS_API_VERSION`

It also has separate host, region, and marketplace settings. Amazon's official docs now supply those non-secret request values.

No Creators API credentials were available to store.

## Required disclosure

Amazon's Operating Agreement requires this disclosure on the site, or another approved place where Program Content appears:

`As an Amazon Associate I earn from qualifying purchases.`

The exact statement is in the About page's "How we earn money" section at `/about#how-we-earn-money`. The shared footer has no Amazon text.

Hardware directory pages show a readable disclosure right after the cards and before pagination, when any record on the page has an Amazon link. It says:

- We earn a commission.
- The buyer pays nothing extra.
- Commissions don't affect rankings or placement.

It links to the About section. Filtered results, pagination pages, and empty results without affiliate links don't show the notice.

Amazon purchase buttons say "Check price on Amazon". The user asked to remove the "Paid link" suffix on 7 September 2026. The About statement and the disclosures below the cards stay.

The product drawer shows no disclosure right now. A visitor can use the purchase link without seeing the notice below the grid. Don't treat this placement as verified compliance with Amazon's rule for a conspicuous disclosure near affiliate links.

The `rel="sponsored noreferrer"` attribute stays, but readers can't see it, so it isn't a disclosure.

Source: [Amazon's disclosure requirements](https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE).

## Remaining blockers

- Nobody has verified `stack127-20` as the OneLink default. This doesn't block tagged US links.
- Amazon marked the account ineligible for Product Advertising API and Creators API access. The account also showed an incomplete tax information alert. No tax or financial information was entered.
- No API credentials were available to download or store.

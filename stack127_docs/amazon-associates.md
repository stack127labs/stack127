# Amazon Associates account

Checked: 4 September 2026

## US account

- Primary marketplace: United States
- US Store ID: `ravitejaknt00-20`
- stack127 tracking ID: `stack127-20`
- Tracking ID result: Amazon created `stack127-20` successfully after the requested name `stack127` was submitted.
- Selected tracking ID at check time: `stack127-20`
- Partner Tag used for stack127 links: `stack127-20`

Amazon uses `stack127-20` as the selected tracking ID for this account. The 24-hour enablement window Amazon showed during setup has elapsed.

## OneLink

- Status: Active for the primary US store.
- Configured countries: United States, Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and United Kingdom.
- Countries available to add: None. Amazon displayed `No countries are available for selection`.
- Countries requiring separate signup: None was shown in the OneLink screens.
- Existing regional account not linked: India, Store ID `ravitejaknt02-21`.
- OneLink default tracking IDs: None. The Tracking ID Preferences page displayed `You have no default tracking IDs configured`.
- Tracking ID propagation: The stated 24-hour window has elapsed. The homelab cannot inspect the remote Mac browser session, so `stack127-20` has not been rechecked as a OneLink default.

The India Store ID was left unlinked because stack127's audience is US-focused.
No new regional account, agreement, tax form, or payment method was created or
submitted.

## Product API

- Product name shown: Product Advertising API (PA API).
- New API route shown by Amazon: Creators API. Amazon stated that PA API is now available through Creators API.
- API status: Not eligible. No access request was available and no credentials were generated.
- Exact Creators API eligibility message: `❌ Have an Approved Associates Account.`
- PA API eligibility checks shown as unavailable: approved Associates account, compliance with the Associates Program Operating Agreement, and 10 qualifying sales in the trailing 30 days.
- API host: `https://creatorsapi.amazon`
- US token endpoint: `https://api.amazon.com/auth/o2/token`
- US credential version and region: `3.1`, North America
- API marketplace: `www.amazon.com`

Amazon's Creators API FAQ also says an approved creators account and Full access
are needed to create applications and generate credentials. PA API access through
Creators API requires at least 10 qualifying sales in the past 30 days.


## Creators API environment schema

The tracked `.env.affiliate.example` now follows Amazon's Creators API
credential names:

- `AMAZON_CREATORS_API_CREDENTIAL_ID`
- `AMAZON_CREATORS_API_SECRET`
- `AMAZON_CREATORS_API_VERSION`

It also reserves separate host, region, and marketplace settings. Amazon's
official documentation now supplies those non-secret request values. No
Creators API credentials were available to store.
## Required disclosure

Amazon's Operating Agreement requires this disclosure on the site or other
approved location where Program Content is displayed:

`As an Amazon Associate I earn from qualifying purchases.`

The exact disclosure is now rendered in the shared footer used by stack127 pages.

## Remaining blockers

- OneLink default selection for `stack127-20` remains unverified. This does not block tagged US links.
- Amazon marked the account ineligible for Product Advertising API and Creators API access. The account also displayed an incomplete tax-information alert. No tax or financial information was entered.
- No API credentials were available to download or store.

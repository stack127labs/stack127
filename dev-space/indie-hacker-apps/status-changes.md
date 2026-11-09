# Indie hacker apps: status changes and open checks

Checked 2026-11-04 to 2026-11-09. Every app file has its sources and dates. This page lists only the big events that a directory page should show, plus what is still unverified.

## Status in the lists

Rows marked `closing` (shutting down, closed to new users, or pivoted away):

| App | List | Why |
| --- | --- | --- |
| InstantDB | auth | Cloud signups closed; cloud apps shut down 2027-08-31 |
| LeanCloud | databases-and-backend | Signups closed 2026-01-12; shutdown 2027-01-12 |
| Deno KV | databases-and-backend | Deno Deploy shutting down about six months after 2026-10-09 |
| MDirector | email-and-newsletters | Owned by emBlue; service suspended |
| Azure Communication Services Email | email-and-newsletters | Microsoft retirement 2028-09-30 |
| Dittofeed | email-and-newsletters | Hosted cloud closed 2026-10-31; self-hosted core remains |
| Simple Observability | error-monitoring | Pivoted from monitoring to AI compute (2026-09-02) |
| Zeabur | hosting-and-deploy | Wind-down from 2026-12-01; all servers stop by 2026-12-31; two 2026 breaches |
| Biznet GIO cloud compute | hosting-and-deploy | NVC product retires 2027-01-31 |
| Ngan Luong | payment-providers | Announced shutdown 2027-02-09 |

Rows marked `risk` (sanctions, regulator action, or trust problems):

| App | List | Why |
| --- | --- | --- |
| Paymee | payment-providers | 2024 official statement on paralyzed operations and frozen funds; no resumption notice |

Removed on 2026-11-09 (owner decision): Cryptomus and Heleket. Their operator, Xeltox Enterprises Ltd, is on the UK sanctions list (designated 2026-10-08; Heleket and Cryptomus are listed name variations) and was given a CAD 176,960,190 FINTRAC penalty (under appeal). Their research files were deleted; they remain in git history.

## Owner changes

| App | List | Change |
| --- | --- | --- |
| Better Auth | auth | Vercel acquiring (announced 2026-07-07) |
| Stytch | auth | Twilio completed acquisition 2025-11-14 |
| Neon / Neon Auth | auth, databases-and-backend | Joined Databricks 2025-05-14 |
| Intercom / Fin | customer-support | Company renamed Fin (2026-05-12); Salesforce completed acquisition 2026-09-10 |
| Callbell | customer-support | Joined holding company Synacti (2025-01-20) |
| Desku | customer-support | Joined Hosted.com (2025-09) |
| Contentsquare / Hotjar | analytics | Hotjar merged into Contentsquare (2025-07-01) |
| etracker | analytics | Acquired by JustRelate (2025-12-11) |
| Statsig | analytics | Amplitude completed acquisition (2026-05-05) |
| Cabin | analytics | Became independently owned (2025-02-26) |
| Turso | databases-and-backend | Being acquired by Supabase (announced 2026-10-02) |
| Tigris | databases-and-backend | Dropbox agreed to buy (announced 2026-11-05; close expected Q4 2026) |
| Koyeb | databases-and-backend, hosting-and-deploy (list row) | Acquired by Mistral AI; moving into Mistral Compute (2026-02-17) |
| Couchbase Capella | databases-and-backend | Haveli Investments completed acquisition (2025-09-24) |
| Crunchy Bridge | databases-and-backend | Snowflake acquired Crunchy Data (2025-06-06) |
| Base44 | databases-and-backend | Wix acquired (2025-06-18) |
| Uploadcare | databases-and-backend | Acquired by Tiugo Technologies (2024) |
| Storj | databases-and-backend | Owned by Inveniam; Storj Labs filed Chapter 11 on 2026-07-26; service says it runs normally |
| Drip | email-and-newsletters | Acquired by Awesome Motive (2026-11-05) |
| Moosend | email-and-newsletters | Constant Contact bought it from Sitecore (2025-06-06) |
| Pingdom | error-monitoring | Parent SolarWinds bought by Turn/River (2025-04-15); accounts moving to SolarWinds Observability |
| PingPing | error-monitoring | Acquired by Newmatter (2025-02-06) |
| RealUptime | error-monitoring | Now owned by Treepai (2026-10-06) |
| Hostwinds | hosting-and-deploy | Acquired by HostPapa (2026-04-29) |
| BuyVM | hosting-and-deploy | Acquired by Cloudzy AI (effective 2025-01-06 per its terms) |
| GoCardless | payment-providers | Mollie completed acquisition (2026-09-01) |
| Moneris | payment-providers | Francisco Partners agreed to buy from BMO and RBC (2026-08-10; closing pending) |
| Khalti by IME | payment-providers | Merged with IME Pay as IME Khalti Limited (2025-07-17) |
| MultiSafepay | payment-providers | Wholly owned by Ant International (2024) |

## Security incidents (customer data or secrets exposed)

| App | List | Incident |
| --- | --- | --- |
| Appwrite (Auth, Sites, backend) | auth, hosting-and-deploy, databases-and-backend | 2026-11-01 runtime incident; one customer's code and logs accessed; wider secret access unconfirmed |
| Trigger.dev | databases-and-backend | 2026-11-01; root API keys for 0.66% of customers; env vars read; keys revoked |
| Railway | hosting-and-deploy, databases-and-backend | 2026-10-21; customer env vars exposed, some decrypted; up to 1.85% of workspaces |
| Northflank | hosting-and-deploy | 2026-10-30; customer secrets decrypted, some AI keys misused |
| Zeabur | hosting-and-deploy | 2026-08-27 and 2026-10-14; env vars and some customer database data exposed |
| Vercel (and Web Analytics, Blob) | hosting-and-deploy | April 2026; some customer env vars compromised; closed 2026-10-16 |
| TiDB | databases-and-backend | PingCAP customer records copied (disclosed 2026-10-19) |
| Brevo | email-and-newsletters | 2026-09-10 SSO flaw; 138 accounts accessed, 43 contact exports, 6 sent phishing |
| HubSpot Marketing Hub | email-and-newsletters | 2025-09-09 data access via Salesloft Drift integration |
| Mixpanel | analytics | 2025-11-09 intrusion; limited customer data exported |
| Plerdy | analytics | 2026-08-27 to 09-03; client contact data accessed, tracking script altered |
| Burst Statistics | analytics | 2026-10-17 to 18; parent TeamUpdraft believes customer database accessed |
| Kinde | auth | 2025-09-03 bug showed under 150 profiles to other users for 68 minutes |
| Toss Payments | payment-providers | 2026-09-09; 4,131 payment records viewed via an exposed merchant key (news reports) |
| Zammad (self-hosted) | customer-support | Vulnerabilities used to breach DIVD's self-hosted system (2026-09-21); update advised |
| aaPanel, CyberPanel | hosting-and-deploy | Past security reports (aaPanel 2025-2026; CyberPanel 2024 ransomware) |

## Regulator actions

| App | List | Action |
| --- | --- | --- |
| Cryptomus, Heleket (removed) | payment-providers | UK sanctions; FINTRAC penalty (see above) |
| Paddle | payment-providers | FTC order, USD 5 million judgment (2025-06-20) |
| PayPal | payment-providers | NYDFS USD 2 million penalty (2025-01-23) |
| Paytm Payment Gateway | payment-providers | RBI cancelled Paytm Payments Bank's licence (2026-04-24) |
| Airwallex | payment-providers | AUSTRAC ordered an external AML audit (2026-01-22) |
| Cashfree Payments | payment-providers | RBI penalty ₹3.10 lakh (2026-03-09) |
| CoinGate | payment-providers | EUR 16,530 AML fine upheld (2025-11-19) |
| Kochava | analytics | FTC stipulated injunction on sensitive location data (2026-06-26) |
| Supabase | databases-and-backend | India access block 2026-02-24 to 2026-03-03 over one misused project |
| GoDaddy | email-and-newsletters | FTC order over hosting security failures (2025-05-21) |

## Licence changes

| App | Change |
| --- | --- |
| ZITADEL | Apache 2.0 to AGPL-3.0 (2025-05-02) |
| Bugsink | Polyform Shield (2025-01-15) |
| Dokploy | Apache-2.0 plus DSAL 1.0 for `/proprietary/` (2026-01-21) |
| Convoy | Elastic License 2.0 for self-hosted code |
| CapRover | Apache 2.0 with added conditions (2024) |
| Vemetric | Open source under AGPLv3 (2025-06-17) |
| liwan | Relicensed Apache-2.0 (2025-05-19) |
| Jitbit Helpdesk | New source-code licences no longer sold (2026-10-05) |
| Docsie | Self-hosted licence allows commercial use within user limits (2026-09-08) |

## Big product, plan, and free-tier changes

- AWS: legacy 12-month Free Tier ended for new accounts on 2025-07-15 (credits plus a Free plan up to six months). Every AWS file notes it where it applies.
- Heroku (and Heroku Postgres): sustaining engineering only from 2026-02-06; no new Enterprise contracts.
- Cloudflare Pages: new projects directed to Workers.
- Netlify: new accounts on credit-based plans from 2025-09-04.
- Fly.io: free Postgres allowance ended (2026-09); Managed Postgres v1 being replaced.
- Firebase: Dynamic Links shut down 2025-08-25; Studio signups closed, shutdown 2027-03-22; Test Lab shutdown 2027-09-30.
- Google Pub/Sub Lite: shuts down 2027-01-31.
- MongoDB Atlas: Serverless and M2/M5 ended 2026-01-22; App Services features ended 2025-09-30.
- Prisma Postgres: Accelerate connections retire 2026-12-01.
- OVHcloud MongoDB Discovery: deletion 2026-11-30.
- Laravel Cloud: Upstash Redis caches deleted after 2027-08-31.
- Replit: Teams plan ended 2026-03-03.
- Scalingo: free Sandbox databases ended 2026-03-02.
- Cabin: free plan capped at 10,000 pageviews (2026-07-03).
- Maileroo: newsletters moved to CampaignLark (2026-01-30); Maileroo is transactional-only.
- Front: Front Chat closed to new customers (2026-10-26).
- HelpDesk, LiveChat, ChatBot: new signups lead to Text, a separate product.
- PayPhone: Express Checkout ends 2027-01-01.
- PayMongo and Campayn: new signups paused or disabled.
- Renames: TraceItX to Everframe, EdgeOne Pages to EdgeOne Makers, Platform.sh to Upsun, Shopify Email to Shopify Messaging, Opn to Omise, DOKU to DOKU by Antom.

## Low activity or weak files

Consider a "low activity" label or dropping: Lunni, Zeplo, UptimeToolbox, Cachet, MarionetteOps, Drumbeats, Pure Chat, MRR.io.

## Still unverified (needs a real browser or a login)

- Tencent Cloud COS prices (no public price feed).
- Vultr Object Storage tier prices and Vultr Managed Databases plans (API needs a login).
- PayKickstart plan prices (loaded inside its signup app).
- Campaign Monitor live prices.
- Plesk 2027 prices (announced, amounts not public yet).
- Drip acquisition post (blocked by a bot check for the coordinator; the agent read it).

## New apps added on 2026-11-09 (owner decision)

- Text (Text S.A., the LiveChat company): customer-support; `customer-support/apps/text.md`. New LiveChat, HelpDesk, and ChatBot signups now go to Text.
- CampaignLark (Maileroo Group Pty Ltd): email-and-newsletters; `email-and-newsletters/apps/campaignlark.md`. Maileroo's newsletter product, billed separately.
- Polar Analytics (ecommerce): analytics; `analytics/apps/polar-analytics-ecommerce.md`. The older row for Polar.sh's built-in analytics is now named "Polar.sh analytics".

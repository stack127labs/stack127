# Platform fee research notes

Historical research for the retired 15-platform reference. The current directory has 542 entries across 49 sections. Use [brief.md](brief.md) for its design and [directory.json](../../scripts/platform-fees/data/directory.json) for its editable draft. Recheck these historical claims before reuse.

Gathered: 2026-09-25, during phase 1. These notes shape the fields, page structure, and data model. They are not publication data. Every figure must be rechecked against the official source in phase 3 before it enters the database.

Confidence labels used below:

- **Official**: read from the platform's own page on 2026-09-25.
- **Secondary**: taken from a third-party summary. It needs an official source in phase 3.
- **Open**: not found yet.

## Locked platform list

| Group | Platforms |
| --- | --- |
| App stores | Apple App Store, Google Play |
| Extensions and plugins | Shopify App Store, Chrome Web Store, Figma Community, JetBrains Marketplace |
| Digital products | Gumroad, Payhip, Etsy (digital downloads), Envato Market |
| Courses and creator income | Udemy, Patreon, Substack, YouTube Partner Program |
| Publishing | Amazon KDP |

## Platform findings

### Apple App Store

- 30% standard commission. 15% through the App Store Small Business Program for developers with no more than $1M in proceeds in the prior calendar year, counted across associated developer accounts. Enrollment is required. Exceeding $1M during the year moves future sales to the standard rate. Official.
- Auto-renewing subscriptions drop to 15% after the subscriber's first year. Official.
- EU terms change on 2026-10-01. With Apple In-App Purchase, the commission is 26%, or 15% for the Small Business Program, partner programs, and subscriptions after year one. With alternative payment processing, it is 20% or 10%. With web link-outs, it is 15% or 10%. Apps distributed outside the App Store pay a 5% Core Technology Commission, which replaces the per-install Core Technology Fee. Official (Apple newsroom, August 2026).
- US link-outs: a 2025 court order stopped Apple charging commission on external purchase links. Apple is appealing, and reports say the Supreme Court agreed on 2026-07-02 to hear the case. Secondary, and legally unsettled.
- Payout timing, minimum payment, and banking rules: open. The developer payments page returned 404. Look in App Store Connect Help and the Paid Apps Agreement.

### Google Play

- Outside the US, UK, and EEA: 15% on the first $1M of earnings each year, 30% above that, and 15% on auto-renewing subscriptions. Official.
- In the US, UK, and EEA from 2026-06-30, the service fee and a 5% Google Play Billing fee are separate. Rates depend on whether the buyer is a new install (the user's first install or update on or after 2026-06-30) or an existing install. Subscriptions are 10% plus the billing fee. Official and secondary sources disagree on the non-recurring rates (10%, 20%, or 25% by tier). This must be settled from the official help page line by line. Official, partly unclear.
- Alternative billing in South Korea and India reduces the service fee by 4 percentage points. Official.
- A global rollout of the new structure is announced but not dated. Program rate cards arrive on 2026-09-30. Secondary.
- Payout facts: open.

### Shopify App Store

- Developers keep 100% of their first $1M in gross app revenue earned from 2025-01-01, and 85% above that. This is a lifetime threshold, not an annual one. Official.
- Developers with $20M or more in the prior calendar year, or company revenue of $100M or more, pay 15% on all app revenue. Official.
- 2.9% processing fee on all billing, plus applicable sales tax. There is a one-time $19 registration fee per Partner account. Some countries add regulatory operating fees. Official.
- Payout schedule and minimum: open.

### Chrome Web Store

- One-time $5 developer registration fee, covering all future items. Official (developer.chrome.com).
- The store has no payment system. Paid extensions charge through the developer's own payment provider. The page should say this plainly rather than show a revenue share. Needs an official citation for the payments deprecation.

### Figma Community

- Flat 15% fee covering payment processing, support, refunds, sales tax collection, delivery, and fraud monitoring. Official.
- Payouts go through Stripe. The balance can be cashed out 30 US business days after a sale, at most once per week. Payouts are available in 70+ countries. The minimum price is $2, in whole USD. Official.
- Figma is not approving new creators to sell paid files. Plugins and widgets can still be sold. Official. This needs a seller status field.

### JetBrains Marketplace

- 15% commission. JetBrains can change it with one month's notice, and it can never exceed 25%. No listing fees. Official.
- Paid up to 30 days after month end once the balance reaches $200 or €200, and on December 31 regardless of balance. Bank transfer via a self-billing invoice, in USD or EUR. Official.

### Gumroad

- 10% + $0.50 per direct sale. 30% on sales through the Discover marketplace. Official.
- Gumroad has acted as merchant of record for sales tax worldwide since 2025-01-01. Official.
- Whether processing is included, the payout schedule, the minimum, and methods by country: open.

### Payhip

- Free plan: 5% fee. Plus ($29 per month): 2%. Pro ($99 per month): 0%. Stripe or PayPal processing fees are charged separately, through the seller's own connected account. Secondary. The official pricing page blocks automated fetching.

### Etsy (digital downloads)

- $0.20 listing fee, 6.5% transaction fee, and payment processing (US: 3% + $0.25, varies by country). Offsite Ads fee of 15%, or 12% for sellers above $10,000 in trailing 12-month sales. Secondary. The official fees page blocks automated fetching.
- Regulatory operating fees, currency conversion, and deposit schedule: open.

### Envato Market

- From 2026-07-01 all authors pay a 50% author fee, and the exclusive and non-exclusive distinction is removed. Official (Envato Author Hub).
- Earnings are the purchase price, minus the buyer fee, minus withholding tax, minus the author fee. The payout minimum is $50. Official help center. Recheck the worked example.

### Udemy

- The instructor receives 37% of organic marketplace sales and 97% when the student uses the instructor's coupon or referral link. Official help page, secondary confirmation.
- Subscription and Udemy Business revenue comes from an instructor pool, reduced in steps to 15% from January 2026. Secondary.
- Payout schedule and minimum: open.

### Patreon

- Creators who launched after 2025-08-04 pay a 10% platform fee. Earlier creators keep legacy plans at 5%, 8%, or 11%. Official.
- Payment processing is 2.9% + $0.30. Pledges of $3 or less use 5% + $0.10. There is a 2.5% currency conversion fee. Secondary.
- Payout fees by method: open.

### Substack

- 10% of paid subscription revenue, plus Stripe fees (2.9% + $0.30 per charge and a 0.7% billing fee for recurring payments). The official help page exists. Recheck the Stripe billing fee.
- How subscriptions bought through app stores are handled: open.

### YouTube Partner Program

- 55% of net ad revenue on long-form videos. 45% of the Shorts creator pool, allocated by share of views. 70% of net revenue from memberships, Super Chat, Super Stickers, and Super Thanks. All shares apply to net revenue after taxes. Official.
- From 2027-02-01, new channels need 8,000 watch hours or 20M Shorts views to join. Shorts ad revenue needs 10M qualified Shorts views over 90 days. Official (YouTube blog, 2026-08-10).
- AdSense payout threshold and US tax withholding for non-US creators: open. Commonly cited as $100, which needs an official source.

### Amazon KDP

- eBook royalty options of 35% or 70%. The 70% rate depends on a price band and has delivery costs deducted. Paperback royalty is 60% of list price minus printing cost, with lower rates through expanded distribution.
- These rules already live in `lib/kdp/royalty.ts` (version 2026-09-16), and the payment schedule is in the KDP payment date calculator. The reference must not create a second copy that can drift. See the data model note in `plan.md`.

## What makes fees hard to show

Nearly every platform has at least one of these patterns. The page design and data model must handle all of them.

| Pattern | Examples | What it means for us |
| --- | --- | --- |
| Revenue tiers | Apple (prior calendar year), Google Play (each calendar year), Shopify (lifetime since 2025-01-01), Etsy Offsite Ads (trailing 12 months) | A tier needs its amount and its counting window. "Under $1M" alone is misleading. |
| Product type | Apple and Google subscriptions, Etsy listing fee per item | Rules filter by one-time sale, first-year subscription, and later subscription. |
| Sales channel | Gumroad direct vs Discover, Udemy organic vs coupon, Apple in-app vs link-out | The same product can have very different rates. Show channel as a condition. |
| Buyer region | Apple EU terms, Google Play US, UK, and EEA, Korea and India alternative billing | Rules carry region scopes. The reader chooses a region. |
| Seller cohort | Patreon launch date, Google Play new vs existing installs, Figma closed to new file sellers | Some rules depend on when the seller or buyer joined. Show dates in the condition. |
| Plan | Payhip, Patreon legacy plans | Plan fees include a monthly price as well as a percentage. |
| Program enrollment | Apple Small Business Program, Google Play programs | A lower rate can require opting in. Say so in the condition. |
| Stacked fees | Etsy, Patreon, Substack, Envato | The headline percentage is not what the seller loses. Worked examples show every line. |
| Pool shares | YouTube Shorts, Udemy subscriptions | No per-sale answer exists. Say so instead of inventing one. |
| Who processes payment | Figma and Gumroad include it; Payhip and Substack use the seller's Stripe | Show whether processing is included for every platform. |
| Tax handling | Gumroad as merchant of record, Envato withholding, YouTube net revenue | Show who collects sales tax and whether income tax is withheld. |
| Scheduled changes | Apple EU on 2026-10-01, YouTube on 2027-02-01, Google global rollout | Rules have effective dates. Show upcoming rules before they start. |
| Disputed rules | Apple US link-outs | Show the current practice and link the dispute. Do not predict the outcome. |
| No marketplace payments | Chrome Web Store | Show the registration fee and say the store takes no sale fee. |
| Blocked sources | Etsy, Payhip, Envato returned 403 to automated fetches | Rechecks for these need a browser or manual review. Record the method per source. |

## Sources

- [Apple App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- [Apple: changes for apps in the European Union, August 2026](https://www.apple.com/newsroom/2026/08/apple-announces-changes-for-apps-in-the-european-union/)
- [MacRumors: Apple wins ability to charge fees on external payment links](https://www.macrumors.com/2025/12/11/apple-app-store-fees-external-payment-links/)
- [Google Play service fees](https://support.google.com/googleplay/android-developer/answer/112622?hl=en)
- [Android Developers Blog: expanded billing choice and lower fees](https://android-developers.googleblog.com/2026/06/play-expanded-billing.html)
- [PPC Land: Google Play fee structure](https://ppc.land/google-play-developers-face-25-percent-fee-under-new-structure/)
- [Shopify App Store revenue share](https://shopify.dev/docs/apps/launch/distribution/revenue-share)
- [Chrome Web Store registration](https://developer.chrome.com/docs/webstore/register)
- [Figma: sell Community resources](https://help.figma.com/hc/en-us/articles/12067637274519-Sell-Community-resources)
- [JetBrains Marketplace revenue sharing and fees](https://plugins.jetbrains.com/docs/marketplace/revenue-sharing-and-fees.html)
- [Gumroad pricing](https://gumroad.com/pricing)
- [Payhip pricing](https://payhip.com/pricing)
- [Etsy fees and payments policy](https://www.etsy.com/legal/fees/)
- [Envato: changes to Market revenue share and exclusivity](https://author.envato.com/hub/changes-to-envato-market-revenue-share-and-exclusivity-what-you-need-to-know/)
- [Envato: introduction to earnings](https://help.author.envato.com/hc/en-us/articles/360000472943-Introduction-to-Earnings)
- [Udemy instructor revenue share](https://support.udemy.com/hc/en-us/articles/229605008-Instructor-revenue-share)
- [Patreon: standard platform fee for new creators](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025)
- [Patreon creator fees overview](https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview)
- [Substack: how much does Substack cost](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost)
- [YouTube Partner Program revenue share](https://support.google.com/youtube/answer/72902?hl=en)
- [YouTube blog: Partner Program changes for 2027](https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/)

# Site direction and topic gaps

Date: 2026-09-25

Status: strategy notes and ideas only. Nothing here is approved for build. Apply `stack127_docs/product-direction.md` and the surface decision rule in `skills/stack127/stack127-topic-research/SKILL.md` before starting any idea.

## Where the site stands

stack127 has 75 published top-level pages and 309 sitemap URLs. They cover about eight subjects: DNS and domains, storage, homelab and smart home, KDP, keyboard shortcuts, CLI apps, self-host apps, and the ad network directory in progress. To a first-time visitor, that reads as a collection of utilities rather than a destination.

Umami data for the 30 days before 2026-09-25:

| Measure | Value |
| --- | --- |
| Visitors | 172 |
| Visits | 256 |
| Pageviews | 852 |
| Top pages after home | `/domain-age` (27), `/self-host-apps` (26), `/domain-tools` (23), `/dns-lookup` (15), `/keyboard-shortcuts` (15) |
| Top referrers | chatgpt.com (10), google.com (6), duckduckgo.com (3), t.co (3) |
| Top countries | US (69), India (58), China (18) |

The sample is too small for firm conclusions. Two signals are still worth noting. Data-heavy pages get the most visits, and ChatGPT already sends more visitors than Google. AI assistants appear to cite factual, structured pages.

## The main risk

The roadmap review in `stack127_docs/tool-roadmap-feasibility-review-2026-09-24.md` lists 331 tool ideas, including 104 SaaS and indie hacker calculators and 132 SEO tools. MRR, churn, LTV, and similar calculators are among the most crowded searches on the web, and many large sites already answer them. Building them in bulk is the fastest way to become the kind of site we want to avoid.

Keep a small number of calculators that support a chosen subject. Pause the bulk calculator rollout.

## How stack127 can stand out

In almost every indie hacker money and distribution topic checked, the top results are vendor blogs. A payments company writes the merchant of record comparison and the VAT threshold guide. Launch directory lists come from people selling launch services and rarely show when they were last checked.

stack127 can be the neutral, sourced, dated fact base for people who build and sell online. Every number has a source and a checked date. Unknown values are shown as unknown. The existing docs already work this way, so this is mostly a matter of making it the visible identity of the site.

The ad network directory plan in `content_docs/ad-networks/plan.md` is the clearest example of this model. It verifies each publisher from its own `ads.txt`, labels the strength of the evidence, and records when it was checked. Nobody else publishes that data neutrally. Future subjects should follow the same pattern.

## Topic ideas

Ranked by value, how open the gap is, and how well stack127 can do it with quality.

### 1. Getting paid from your country

This is the strongest opportunity.

Surface: a directory of payment processors and merchants of record by seller country, plus a merchant of record true cost calculator.

What each record needs:

- Whether sellers from a given country are accepted.
- The full fee, including international card, subscription, and currency conversion surcharges.
- Payout methods and payout currencies.
- Verification requirements for the seller.
- Source links and a checked date.

Why it is a gap: headline rates hide the real cost. Paddle and Creem price as all-inclusive, while Dodo and Polar advertise a lower base rate and add surcharges. Most comparisons are written by one of the providers. Stripe does not support sellers in Pakistan, Bangladesh, Nepal, or Sri Lanka, and Indian founders have their own export and documentation rules. Founders in those countries have no neutral place to check their options.

Why it fits: India is the second largest audience in current traffic. The topic has strong commercial intent and affiliate potential. The calculator works from user inputs (sales mix, countries, subscription share), so it passes the tool test.

### 2. Platform fee and payout reference

Surface: a reference of the marketplaces where builders sell, with one row per platform.

Platforms to start with: Apple App Store, Google Play, Shopify App Store, Chrome Web Store, Figma Community, JetBrains Marketplace, Envato, Gumroad, KDP, Udemy, and YouTube.

Facts per platform: revenue share, payment processing fee, payout threshold, payout schedule, supported seller countries, tax forms, and recent changes.

Why it is a gap: the facts exist only on each platform's own pages and in scattered blog posts. Fees change often. Envato moved all authors to a flat 50% revenue share on 2026-07-01. Shopify keeps 0% on the first $1,000,000 of lifetime app revenue and charges 15% above that. Apple charges 15% under its small business program. No single neutral table keeps these current.

Why it fits: it connects with the KDP payment date calculator and the KDP royalty calculator.

### 3. Ad networks for small publishers

Surface: finish the ad network directory already in progress, then add a requirements layer.

Facts per network: minimum traffic, revenue share where published, payout threshold, payment methods, accepted countries, and content rules.

Why it fits: it builds on data we are already collecting and answers a common question for new site owners looking for AdSense alternatives.

### 4. Launch directories, checked by machine

Surface: a directory of launch and submission sites where the facts are checked automatically.

Facts per site: whether it is still live, whether the listing link is really dofollow (read from the listing page's HTML), whether submission is free or paid, review time where stated, and the last checked date.

Why it is a gap: current lists run from 12 to over 200 sites, are mostly written by people selling launch services, and go stale quickly. None show verified link attributes.

Why it fits: it uses crawling and parsing work similar to the existing DNS and domain tools. Keep the claims to what can be observed. Do not claim traffic or ranking value.

### 5. Digital tax registration reference

Surface: a reference of VAT and GST registration thresholds for non-resident sellers of digital products, linked to government sources.

Why it is a gap: the most visible guides are written by payment and tax vendors. Many countries have a zero threshold for non-resident sellers, including the EU for non-EU sellers, the UK, India, and South Korea, which surprises many founders.

Care needed: present it as reference with sources and dates, never as tax advice. Keep the legal meaning exact.

### 6. Later ideas

- Affiliate programs for common indie tools: commission, cookie length, recurring or one-time, payout minimum, and network.
- A change log of free-tier limits for the builder stack: hosting, databases, email, auth, and AI APIs. Some trackers already exist, so this would need a narrower angle.

### Ideas to skip

- Usage limit and pricing trackers for AI coding tools. They change too fast and the space is crowded.
- BSR sales, traffic, and keyword difficulty estimators. The roadmap review already explains why these would be fake precision.
- Bulk SaaS metric calculators. Build about five that support the payments subject instead.

## Formats beyond tools and directories

| Format | Recommendation | Reason |
| --- | --- | --- |
| Data reports | Yes, quarterly | Reports built from our own datasets, for example which ad networks gained publishers this quarter, or where founders can get paid in 2026. They earn links, get cited by AI assistants, and suit Hacker News and Reddit. |
| Fact change log | Yes | Use this instead of a news section. Our freshness checks already notice when a provider changes a fee or a network loses publishers. Publishing those changes is news only we can report, at no extra reporting cost. |
| Newsletter | Yes, highest priority | A monthly email of what changed, built from the change log. It is the only channel we own and the base any community grows from. |
| Case studies | Later, with verified numbers only | Unverified founder stories are common and easy to fake. Consider teardowns backed by verified revenue data once there is an audience. |
| News section | No | It needs constant publishing, has no advantage over Hacker News or X, and the product direction already rejects content written to fill a feed. |
| General blog | No | Explanations belong inside tools and reference pages, as they do now. |
| Forum | Not yet | An empty forum hurts trust more than having none. |

## How to build a community

Community comes from people contributing to something useful, not from adding a forum.

- Add a way to report a correction on every fact row, and credit people who help.
- Let people submit a claim with evidence, such as "my site uses this network" or "this provider now supports my country". Our checks confirm it before it appears.
- Publish open datasets on the stack127labs GitHub organization so builders can reuse them and link back.
- Later, add accounts with alerts, such as "tell me when a provider changes its fees or country support". This is also a natural paid product and fits the subject better than ads alone.

## Suggested order

### Next 30 days

- Finish and publish the ad network directory.
- Choose getting paid as the flagship subject and start the country and payment provider directory.
- Add a newsletter signup and a public change log.
- Pause the bulk calculator roadmap.

### Months 2 to 3

- Build the platform fee and payout reference.
- Build the merchant of record true cost calculator.
- Publish the first data report.
- Add checked dates and correction links to every directory.

### Months 4 to 12

- Automate freshness checks for each dataset.
- Publish a quarterly report and a monthly newsletter.
- Add evidence-backed submissions, then paid alerts or a data API.
- Add a `/get-paid` topic landing page once there are four or five resources to link.
- Keep KDP as the creator subject. Leave homelab pages as they are; they still bring visitors.

## How to judge progress at 90 days

Pageviews will lag. Track these first:

- Referring domains.
- Visits from AI assistants.
- Newsletter subscribers.
- Corrections and submissions received.
- Returning visitors.

## Main risk

Every directory has to be kept current. Launch fewer subjects and keep each one fresh. A stale directory is worse than none, and it undermines the trust this direction depends on.

## Sources

- [Dodo Payments: cheapest merchant of record for SaaS in 2026](https://dodopayments.com/blogs/cheapest-merchant-of-record)
- [Lemon Squeezy vs Polar vs Paddle: merchant of record comparison 2026](https://www.buildmvpfast.com/blog/lemon-squeezy-vs-polar-paddle-merchant-of-record-2026)
- [Payment gateways for SaaS startups in South Asia](https://editorialge.com/payment-gateways-for-saas-startups-in-south-asia/)
- [Cashfree: how Indian SaaS founders can accept global payments](https://www.cashfree.com/blog/indian-saas-global-payments-guide/)
- [Dodo Payments: VAT and GST registration thresholds by country](https://dodopayments.com/blogs/vat-gst-registration-thresholds)
- [TrustMRR verified open revenue feed](https://trustmrr.com/open)
- [Developer tool pricing changes tracker](https://agentdeals.dev/pricing-changes)
- [217 SaaS directories to submit your product](https://thestacc.com/blog/saas-directories-list/)
- [Shopify App Store revenue share](https://shopify.dev/docs/apps/launch/distribution/revenue-share)
- [Envato moves all sellers to a flat 50% revenue share](https://www.therepository.email/envato-ends-exclusive-author-model-moves-all-marketplace-sellers-to-flat-50-revenue-share)
- [RevenueCat: the 15% App Store fee](https://www.revenuecat.com/blog/engineering/small-business-program)
- [Figma plugin monetization fees](https://www.kelviq.com/blog/figma-plugin-monetization/)

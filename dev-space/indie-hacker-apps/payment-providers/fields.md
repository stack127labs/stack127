# Proposed payment-provider fields

Proposal checked on 2026-11-04. Approve the fields before full per-app research begins.

Collect facts that help someone answer four questions: Can I join? Can my customers pay? What will it cost? When will I receive the money?

There are 50 comparison fields below: 40 core, five optional, and five required only for crypto offers. Some fields contain a short set of related values. Give each separate value its own evidence when different sources apply.

“Required” means research and record the answer or an explicit unknown. It never means inventing an answer to fill a cell. Eligibility, legal seller role, current operation, and enough pricing context to support a comparison must be verified before calling a listing researched.

## How every fact must be recorded

| Evidence item | Rule |
| --- | --- |
| Value | Keep the original units, currency and conditions. Use a structured value plus a short plain-English note where needed. |
| Source URL | Required for each factual value, including each fee component and each country rule. Link the exact official page, not a homepage used for an unrelated fact. Multiple URLs are allowed. |
| Checked date | Required for each value, in YYYY-MM-DD format. A changed source gets a new date; checking one field does not refresh every field. |
| Evidence state | Use confirmed, not published, unclear, conflicting, not applicable, or check failed. “No” requires evidence that something is not offered. A blank page or failed search is not “no.” |
| Scope | Record provider product, contract/legal entity, seller country, seller legal form, plan, buyer/card country, payment method, charge currency and payout currency wherever relevant. |
| Effective date | Save a published start/end date, promotion deadline or policy-update date when available. This is separate from the checked date. |
| Source note | Briefly say what supports the value and any exceptions. If an official page contradicts another, retain both URLs and leave the claim unresolved. |
| Derived value | Store the formula and source-backed inputs, assumptions, amount and date. Label a calculated effective fee as our calculation. |
| Unknown | Save the official pages searched and the checked date. Do not attach a source as if it proves an unpublished fee is zero. |
| Quote / private terms | This phase uses public sources only. Later, owner-supplied contract facts must be labelled account-specific and never presented as universal prices. |

Country lists must distinguish seller signup, owner residency, bank-account location, buyer payment access, and tax coverage. Do not turn “customers in 200 countries” into “sellers in 200 countries.”

Fees need their calculation base: amount before or after tax, whether the fixed amount is per payment or payout, tax on the provider's fee, minimums, caps, and whether card/billing costs stack. Keep the published fee currency. Do not silently convert it into USD.

## Fields to collect

| Field name | What it means | Why a reader needs it | Value format | Normal source | Required or optional |
| --- | --- | --- | --- | --- | --- |
| F01. Current name, product, owner and old names | Which exact service we mean, including redirects or acquisition. | Avoids dead links and duplicate choices. | Name, product URL, parent, aliases, dated status note. | Official product, company news, redirects. | Required |
| F02. Provider type and legal seller | Gateway, merchant of record, billing, payment link, crypto or other; who sells to the buyer. | Defines responsibility and what the fee includes. | Primary type, secondary tags, seller role by offer. | Seller agreement and official product docs. | Required |
| F03. Seller signup countries | Where the business can be based to open an account. | A provider is useless if the seller cannot join. | Country list with allowed, restricted, invite-only or unknown; exceptions. | Official availability and onboarding docs. | Required |
| F04. Seller legal forms | Whether individuals, sole traders and companies can join. | A solo builder may not have a company. | Allowed forms by country; explicit unknowns. | Onboarding and verification help. | Required |
| F05. Local presence and bank requirements | Required business registration, owner residency and bank location. | A foreign bank account alone may not qualify a seller. | Country/form rules; account ownership and bank-country requirements. | Account eligibility and payout docs. | Required |
| F06. Business verification | Documents and website policies needed for review. Verification means checking the seller's identity and business. | Shows the work needed before taking real payments. | Document categories and website requirements by country/form. | Official activation and identity-review help. | Required |
| F07. Signup route and minimum business size | Open signup, invitation, sales approval, revenue or volume conditions. | Separates realistic entry routes from large-business offers. | Route enum; published minimum with unit and period; unknown if absent. | Signup, pricing, eligibility pages. | Required |
| F08. Supported product types | Software, SaaS, ebooks, downloads, courses, memberships, services and physical goods. | Payment providers allow different kinds of sales. | Per-product allowed, conditional, prohibited or unknown. | Acceptable-use policy and seller docs. | Required |
| F09. Important restrictions | Relevant limits on AI, adult content, marketplaces, crowdfunding or other businesses. | Prevents wasted integrations and later rejection. | Short restriction list with country/offer exceptions. | Official acceptable-use policy and agreement. | Required |
| F10. Buyer-country restrictions | Where customers cannot pay, or need a different method. | International signup does not imply every buyer is supported. | Countries/regions and method-specific restrictions. | Payment-method and sanctions docs. | Required |
| F11. Charge currencies | Currencies customers can actually be charged in. | A displayed local price may still charge in another currency. | Currency codes with method/market conditions. | Currency and payment-method docs. | Required |
| F12. Payment methods | Cards, bank payments, mobile money, wallets, cash vouchers and local methods. | Customers need a way they can use. | Method list by seller country, buyer market, currency and integration. | Official method support tables. | Required |
| F13. One-time payments | Whether the offer supports a single sale. | Basic requirement for ebooks and downloads. | Yes/no/conditional/unknown with method limits. | Product and developer docs. | Required |
| F14. Recurring payments and method limits | Automatic subscription collection; distinguish reminders from automatic charges. | A payment-link claim may not support SaaS renewals. | Yes/no/conditional; recurring methods, countries and currencies. | Subscription and payment-method docs. | Required |
| F15. Billing features | Seats, usage, credits, trials, discounts, plan changes, partial-period adjustments and failed-payment recovery. | Shows whether subscriptions fit without extra software. | Feature matrix; included, paid add-on, external or unknown. | Billing docs and plan comparison. | Required |
| F16. Checkout options | Hosted checkout, embedded checkout, payment links and payment forms. | Shows whether a seller can start without coding. | Options, custom-domain support and plan limits. | Checkout and no-code docs. | Required |
| F17. Integration and testing | Developer interface, site connections, event notifications and test mode. An event notification tells the app a payment changed. | A builder needs reliable fulfillment and a safe way to test. | API/docs URL, webhooks, official plugins/SDKs, sandbox; per feature state. | Developer docs and official integration listings. | Required |
| F18. Other required accounts | A separate gateway, commerce platform or bank product needed to use this offer. | A billing wrapper does not replace its underlying processor. | Dependency list and who charges each fee. | Setup docs and pricing notes. | Required |
| F19. Fixed costs and free plan | Setup, monthly/annual fees, minimum charges, inactivity fees and plan thresholds. | Shows the cost before the first sale. | Currency/period/amount, commitment, free-plan limits; explicit unknowns. | Official pricing, fee schedule and contract. | Required |
| F20. Domestic card cost | Card processing for a defined local seller and card. | Starting point for a useful fee comparison. | Percent plus fixed amount, fee base, tax, card classes, caps/minimums. | Country-specific official pricing. | Required |
| F21. International card cost | Extra charges or a replacement rate for cards issued abroad. | Headline domestic rates hide international costs. | Add-on or full rate, country definition, fixed fees, exceptions. | Country-specific fee schedule. | Required |
| F22. Currency conversion cost | Charges and rate basis for converting charge, balance or payout currency. | Avoids counting the same conversion twice or missing it. | Percent/fixed cost by conversion stage; exchange-rate basis or unpublished. | Pricing and currency/payout docs. | Required |
| F23. Local-method cost | Fees for bank payments, mobile money and other useful non-card methods. | These may be the normal way to pay in a market. | Per-method percent/fixed cost, caps, tax, country and currency. | Method-specific official pricing. | Required |
| F24. Subscription and billing surcharge | Extra cost for recurring payments, metering or invoices. | Processing and billing often have separate charges. | Percent/fixed/monthly cost, thresholds, included features, stacking rule. | Billing pricing and method docs. | Required |
| F25. Tax-service and other checkout add-ons | Tax calculation, filing, fraud or other relevant charges beyond base processing. | “Tax included” and “tax available” have different costs. | Named add-on, cost, required/optional and stacking rule. | Pricing, tax and fraud-product docs. | Required |
| F26. Refund costs | Whether there is a refund fee and whether original fees are returned. | A refund may cost money even after returning the sale price. | Refund fee, retained fees, timing and method exceptions. | Refund help, pricing and agreement. | Required |
| F27. Dispute cost and responsibility | Who handles a buyer's bank dispute and who pays the losses and fees. | Merchant-of-record handling does not promise the seller bears no cost. | Handling party, sale loss, fees, returned-on-win rules and conditions. | Dispute policy, pricing and seller agreement. | Required |
| F28. Payout cost | Fees for sending collected money to the seller. | A low checkout fee can be offset by withdrawals. | Standard/instant/international fee, currency and third-party bank caveat. | Payout help and pricing. | Required |
| F29. Tax responsibilities and coverage | Who calculates, collects, registers, files and sends sales taxes to authorities. | Tax calculation alone does not transfer legal responsibility. | Responsibility matrix for seller/provider/partner by tax and jurisdiction; limits. | Seller agreement, tax product docs and coverage lists. | Required |
| F30. Receipts and business invoices | Buyer receipts, tax invoices, business tax IDs and tax-exempt purchases. | Course and SaaS customers may need business invoices. | Feature states and market/product restrictions. | Invoicing and tax docs. | Required |
| F31. Payout methods | Bank transfers, wallets, PayPal, Payoneer or other ways the seller receives money. | Buyer methods and seller payout methods are different. | Methods by seller/bank country; account requirements. | Payout docs. | Required |
| F32. Payout and balance currencies | Currencies the provider holds and sends to the seller. | Determines whether conversion is unavoidable. | Currency codes by country, method and bank account. | Currency and payout docs. | Required |
| F33. Payout timing | Initial delay, balance availability, payout schedule and expected bank arrival. | A monthly payout and a two-day bank transfer are separate waits. | Each stage in calendar/business days; schedule, cutoffs and conditions. | Payout and settlement help. | Required |
| F34. Minimum payout | Minimum balance needed before money is sent. | Small projects may wait several months to reach it. | Amount/currency by payout method and country. | Payout docs and fee schedule. | Required |
| F35. Payment and account limits | Published minimum/maximum charge and unverified/starter account collection limits. | Small prices and large orders can both be blocked. | Amount, currency, time period, account tier, method and exception. | Currency limits, activation and method docs. | Required |
| F36. Reserve and hold policy | When funds can be withheld to cover refunds, disputes or review. | Needed for cash planning. A reserve is money kept back temporarily. | Public policy summary and triggers; account-specific values separated. | Seller agreement and reserve help. | Required |
| F37. Exports and moving providers | Available transaction/customer exports and stated payment-data migration routes. | Avoids getting trapped when the business grows. | Export types; import/export direction; conditions; unknown portability limits. | Reporting and migration docs. | Required |
| F38. Support access | Public support channels, hours, languages and plan restrictions. | A blocked payout may need help from a real person. | Channel/hour/language lists and paid support limits. No invented response speed. | Official support and plan pages. | Required |
| F39. Operating status and recent changes | Current offer, shutdown/rebrand notices and material service restrictions. | An old comparison can point to a dead product. | Active/limited/retired/unclear, notice dates, status-page URL if available. | Official product, news, status and migration notices. | Required |
| F40. Closing an account | Public cancellation, data-retention and remaining-fund release terms. | A seller should understand how to leave. | Contract clauses, fees/notice period, hold conditions and unknowns. | Seller agreement and closure help. | Required |
| F41. Legal entity, licence and security scope | The contracting company and relevant official licence/security statements. | Helps distinguish a regulated processor from a software wrapper. | Entity/jurisdiction; regulator or registry URL; certification scope and date. | Legal docs, regulator registers, security pages. | Optional; never infer from a logo |
| F42. Product delivery and access | File delivery, software licences, memberships and app-access connections. | May save building delivery separately. | Feature list and plan/integration conditions. | Official fulfillment and developer docs. | Optional |
| F43. Multi-seller and split payments | Collecting on behalf of other sellers and splitting proceeds. | Relevant to a solo builder running a marketplace. | Yes/no/conditional; required product/account and fees. | Platform and split-payment docs. | Optional |
| F44. Exact reserve percentage and duration | The specific amount kept back from a particular seller. | Can materially change cash flow. | Published standard or seller-specific percent/days; otherwise not published. | Public contract, or later owner-supplied private offer. | Optional; do not expect a universal number |
| F45. Approval time estimate | Public estimates for identity, website, product and payout reviews. | Helps plan launch timing. | Stage, stated range and explicit non-guarantee; otherwise not published. | Verification help. | Optional; no universal approval promise |
| C01. Crypto assets and networks | Accepted coins and stablecoins, on the correct blockchain networks. | The same token name can use incompatible networks. | Asset + network + checkout/settlement role. | Official asset/network matrix. | Required for crypto offers |
| C02. Who controls crypto funds | Whether the provider holds funds or they go to the seller's own wallet. | Changes custody risk and operating work. | Provider-held, seller wallet, optional custody; flow and withdrawal conditions. | Wallet, custody and checkout docs; terms. | Required for crypto offers |
| C03. Crypto conversion and payout path | Keep crypto, convert to stablecoins, or receive normal bank currency. | Accepting crypto does not guarantee cash in a bank. | Supported routes, countries, assets, network/withdrawal/conversion costs; link F22/F28. | Settlement docs and fees. | Required for crypto offers |
| C04. Crypto payment completion and refunds | Confirmation requirements, expired invoices, under/overpayment and refunds. | Tells the app when to deliver and what happens when buyers send the wrong amount. | Rules by asset/network and integration; fees and exchange-rate risk. | Checkout/API/refund docs. | Required for crypto offers |
| C05. Hosting and maintenance | Hosted service versus software the seller must run. | Free software can still require servers and upkeep. | Hosted/self-hosted, licence, published hardware needs; infrastructure cost unknown unless sourced. | Official deployment and pricing docs. | Required for crypto offers |

## Feasibility test

This is a test of findability, not completed provider research. No finished price records or eligibility lists for these providers are saved here.

Tested on 2026-11-04:

- **Stripe Payments:** global gateway. The pricing URL redirected to Belgium in the research tool, so this tests the Belgian public page. It does not establish US pricing.
- **Paddle Billing:** merchant of record for software and digital products. Pricing, help, agreement and developer pages were sampled.
- **Paystack:** regional gateway. The price page showed Nigeria. Other seller markets need their own research.

**Easy** means a direct public page exposed the main answer. **Hard** means the answer was scattered, conditional, partly hidden by a failed page, or needed more country/product detail. **Not published** means the sampled public pages did not supply a general answer; this is not proof no answer exists anywhere. **N/A** means the crypto-only field does not apply to this three-provider sample.

Source codes below point to exact pages in the source table. Each cell gives the findability result, not a researched product value. Grouped field results cover the main answer only; “Easy” does not mean every exception was checked.

| Field | Stripe | Paddle | Paystack |
| --- | --- | --- | --- |
| F01 Name, product, owner/aliases | Easy S0 | Easy P0 | Easy A0 |
| F02 Type and legal seller | Hard S0/S6 | Easy P0/P8 | Hard A0/A7 |
| F03 Seller countries | Easy S2 | Easy P2 | Hard A0/A4 |
| F04 Seller legal forms | Hard S7 | Hard P3 | Easy A4 |
| F05 Local presence/bank requirements | Hard S3/S7 | Hard P3/P4 | Hard A4/A5/A6 |
| F06 Verification | Hard S7: direct support open failed | Easy P3 for website; identity details need follow-up | Easy A4 |
| F07 Signup and size conditions | Hard S0/S2 | Hard P0/P3 | Hard A0/A4 |
| F08 Supported products | Hard S5 | Easy P7 | Hard A7 |
| F09 Restrictions | Easy S5 | Easy P7 | Easy A7 |
| F10 Buyer restrictions | Hard S4/S5 | Easy P2 | Hard A2/A6/A7 |
| F11 Charge currencies | Easy S4 | Easy P5 | Hard A2/A6 |
| F12 Methods | Easy S8 | Easy P6 | Easy A2 |
| F13 One-time payments | Easy S0 | Easy P0 | Easy A0 |
| F14 Recurring and limits | Easy S9 | Hard P0/P6: attempted overview URLs failed | Easy A3 |
| F15 Billing features | Hard S9/S10 | Hard P0/P11: follow feature docs | Hard A3 |
| F16 Checkout options | Easy S0 | Easy P0 | Easy A0 |
| F17 Integration/testing | Easy S9 | Easy P0/P3 | Easy A3/A4 |
| F18 Required accounts | Hard S0/S3 | Easy P6 | Hard A4/A5 |
| F19 Fixed costs/free plan | Easy S1/S10 | Easy P1 | Easy A1 |
| F20 Domestic card fee | Easy S1, Belgium context | Easy P1; check fee base later | Easy A1, Nigeria context |
| F21 International cards | Easy S1 | Hard P1: bundled-price wording needs agreement context | Easy A1/A6 |
| F22 Currency conversion | Easy S1/S4 | Hard P4/P5 | Hard A6; exact rate basis not resolved |
| F23 Local methods | Hard S8/S1 | Hard P1/P6 | Easy A1/A2 |
| F24 Subscription surcharge | Easy S10 | Easy P1 | Hard A1/A3: do not infer zero from omission |
| F25 Add-on fees | Easy S1/S6 | Hard P1: confirm inclusion boundaries | Hard A1: no separate tax feature established |
| F26 Refund costs | Easy S1/S11 | Hard P8/P11 | Easy A8 |
| F27 Disputes and liability | Hard S1/S11 | Easy P10/P8 | Hard A7 |
| F28 Payout fees | Easy S1/S3 | Easy P4 | Easy A5 |
| F29 Tax responsibility/coverage | Hard S6; distinguish calculation, filing and seller role | Easy P0/P8; country detail still needs research | Hard A7; tax on provider fees is not buyer sales-tax filing |
| F30 Invoices/tax IDs | Hard S6/S9 | Hard P0/P6 | Hard A3/A7 |
| F31 Payout methods | Easy S3 | Easy P4 | Easy A5 |
| F32 Payout currencies | Easy S3/S4 | Easy P5 | Easy A6 |
| F33 Timing | Easy S3 | Easy P4/P11 | Hard A1/A5; separate schedule from bank arrival |
| F34 Payout minimum | Easy S3 | Easy P4 | Hard A5; further country help needed |
| F35 Payment/account limits | Easy S4 | Hard P5 | Hard A4/A5 |
| F36 Public reserve/hold policy | Hard S12: official search result; page fetch failed | Hard P8 | Easy A7 |
| F37 Export/migration | Hard S13; import docs do not settle export portability | Hard P11; reporting found, migration direction unresolved | Hard A5/A8; report export found, payment portability unresolved |
| F38 Support access | Hard S0 | Hard P0 | Hard A0/A4 |
| F39 Current operation/changes | Easy S0 | Easy P0 | Easy A0 |
| F40 Closure/fund release | Hard S5/S12; full closure terms not resolved | Hard P8 | Easy A7 for clauses; timing remains conditional |
| F41 Legal/licence/security scope | Hard S0/S5 | Hard P8 | Hard A7 |
| F42 Delivery/access extras | Hard S0/S9 | Hard P0 | Not published in A0/A3 sample |
| F43 Splits/multi-seller | Hard S0: separate Connect product | Hard P7: marketplace restriction matters | Easy A2: separate split-payment docs linked |
| F44 Universal reserve percent/days | Not published S12 | Not published P8 | Not published A7 |
| F45 Approval estimate | Not published S7 sample | Easy P3 for domain review only | Not published A4 sample |
| C01 Assets/networks | N/A: separate crypto offer | N/A | N/A |
| C02 Crypto custody | N/A | N/A | N/A |
| C03 Crypto conversion/payout | N/A | N/A | N/A |
| C04 Crypto completion/refunds | N/A | N/A | N/A |
| C05 Crypto hosting | N/A | N/A | N/A |

The evidence rules themselves were easy to apply to all three: URLs, dates and scope can be recorded even when a value is unknown. The crypto fields remain provisional because this sample did not test a crypto provider.

### Public sources sampled

All opened or searched on 2026-11-04. Failed attempts are labelled.

| Code | Official source |
| --- | --- |
| S0 | [Stripe Payments](https://stripe.com/payments) |
| S1 | [Stripe pricing, resolved Belgian page](https://stripe.com/en-be/pricing) |
| S2 | [Stripe global availability](https://stripe.com/global) |
| S3 | [Stripe payouts, including country minimums](https://docs.stripe.com/payouts) |
| S4 | [Stripe currencies](https://docs.stripe.com/currencies) |
| S5 | [Stripe restricted businesses](https://stripe.com/legal/restricted-businesses); the tool resolved an Australian legal page, so local contract details remain hard |
| S6 | [Stripe Tax](https://docs.stripe.com/tax) |
| S7 | [Stripe account verification help](https://support.stripe.com/questions/what-do-i-need-to-do-to-verify-my-stripe-account/), official search result found but direct open failed |
| S8 | [Stripe payment-method overview](https://docs.stripe.com/payments/payment-methods/overview) |
| S9 | [Stripe subscriptions](https://docs.stripe.com/billing/subscriptions/overview) |
| S10 | [Stripe Billing pricing](https://stripe.com/en-be/billing/pricing) |
| S11 | [Stripe refunds](https://docs.stripe.com/refunds) |
| S12 | [Stripe reserve FAQ](https://support.stripe.com/questions/reserved-funds), official search result found but direct open failed |
| S13 | [Stripe data migration overview](https://docs.stripe.com/get-started/data-migrations/overview) |
| P0 | [Paddle product](https://www.paddle.com/) |
| P1 | [Paddle pricing](https://www.paddle.com/pricing) |
| P2 | [Paddle country restrictions](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle) |
| P3 | [Paddle domain review](https://www.paddle.com/help/start/account-verification/what-is-domain-verification) |
| P4 | [Paddle payout schedule/minimum](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid) and [payout fees](https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts) |
| P5 | [Paddle currencies](https://developer.paddle.com/concepts/sell/supported-currencies/) |
| P6 | [Paddle payment methods](https://developer.paddle.com/concepts/payment-methods/) |
| P7 | [Paddle supported and restricted products](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle) |
| P8 | [Paddle seller agreement](https://www.paddle.com/legal/terms) |
| P10 | [Paddle chargebacks](https://www.paddle.com/help/manage/risk-prevention/understanding-chargebacks-with-paddle) |
| P11 | [Paddle payout reports](https://developer.paddle.com/build/reports/payout-reconciliation/) |
| A0 | [Paystack product](https://paystack.com/) |
| A1 | [Paystack pricing, Nigeria content shown](https://paystack.com/pricing) |
| A2 | [Paystack payment channels](https://paystack.com/docs/payments/payment-channels/) |
| A3 | [Paystack subscriptions](https://paystack.com/docs/payments/subscriptions/) |
| A4 | [Paystack activation](https://support.paystack.com/en/articles/2125506) |
| A5 | [Paystack receiving payouts](https://support.paystack.com/en/articles/2125314) |
| A6 | [Paystack international payments and currencies](https://support.paystack.com/en/articles/2130690) |
| A7 | [Paystack terms and policies](https://paystack.com/terms) |
| A8 | [Paystack refunds](https://support.paystack.com/en/articles/2127106) |

### Changes made after this test

- Keep core fees, eligibility, methods and payouts. Their main answers are publicly researchable, but country-by-country work is needed.
- Keep the public reserve policy as core. Make the exact reserve amount and duration optional. There is no dependable universal value in this sample.
- Keep approval estimates optional and tied to a review stage. Paddle publishes a domain-review estimate; that is not a promise for complete account approval.
- Treat export capability and payment-data portability separately inside F37. A CSV report does not prove customers can move without entering card details again.
- Keep legal, licensing and certification facts optional unless independently sourced with the correct entity and scope. A provider's marketing claim alone should not become a trust score.
- Do not require transaction volume, market share, approval rate, conversion uplift, “best” ranking, support speed, or a predicted account-freeze risk. Comparable public evidence was not established.
- Do not require negotiated discounts or an exact exchange rate on a future payout. Record published pricing rules; actual rates depend on time and account terms.
- The five crypto fields need a later test against a hosted provider and self-hosted software before the final field design is fixed.

## Stats and insights these fields could support later

These are proposed outputs, not findings from today's candidate counts.

| Reader question / chart | Inputs | Rule for an honest comparison |
| --- | --- | --- |
| Which providers can I join from my country? Country-by-provider grid. | F03–F07, F39 | Separate confirmed open signup, invitation, sales review and unknown. Count seller countries, not buyer reach. |
| Which providers let individuals start? Stacked bars by seller country. | F03–F07 | Include legal form and local bank requirements; do not assume “startup” means unregistered individual. |
| Who handles sales tax? Responsibility comparison. | F02, F25, F29 | Show calculation, collection, registration, filing and remittance separately. |
| What do I keep on small digital sales? Fee curves at low and higher prices. | F19–F28 | Same seller market, currency, buyer/card origin, plan and tax treatment. Show an unknown total when a required fee is missing. |
| Domestic versus international and converted payments. Scenario bars. | F20–F25, F28, F32 | Show whether fees add or replace each other; do not combine two conversion fees for one conversion. |
| What does a subscription cost beyond processing? Comparison table. | F14, F15, F19, F24, F25 | Include the underlying processor cost for billing wrappers. |
| How long until my first usable payout? Timeline and minimum-balance comparison. | F31–F36 | Show initial hold, balance availability, schedule, bank arrival and threshold separately. |
| Which local methods work for a SaaS renewal? Country/method grid. | F11–F15 | Separate one-time acceptance from automatic recurring collection. |
| Can I sell software, ebooks, courses or physical goods? Product grid. | F08, F09, F42 | Show conditional and unknown; do not turn a broad homepage slogan into approval. |
| How many options have public pricing? Transparency bars by provider type/region. | F19–F28 and evidence states | Denominator is researched active offers; exclude unresolved candidates and do not treat missing fees as zero. |
| Which products depend on another provider? Dependency diagram/table. | F02, F18 | Count provider offers and parent companies separately; avoid duplicate totals. |
| What happens on refunds, disputes or closure? Risk-cost scenarios. | F26, F27, F36, F40 | Use public terms, not predictions from community complaints. |
| What changes for crypto? Custody and payout comparison. | C01–C05, F22, F28–F36 | Separate hosted versus self-hosted, bank settlement versus crypto, network fees and provider fees. |
| How fresh is the directory? Coverage/freshness summary. | Field checked dates, F39 | Report how much of each field is confirmed; a homepage recheck does not refresh pricing. |

No charts should be published from the discovery market labels as if they measured market share, seller availability or provider popularity.


# Research notes

Research date: 2026-11-04. Work stayed in this checkout. Only the four requested Markdown files were written inside this folder.

No code, database, migration, page, route, account, signup, login, form submission, commit, push or branch change was made. The platform-fees JSON was read for candidate names only. No environment files were read.

## What this pass contains

- 240 main-list candidates: 177 active official-site checks, 43 gray cases and 20 check-again leads.
- 82 held-out rows: 12 storefront/marketplace boundary cases, 34 failed or incomplete verification/old-brand/wallet checks, 14 other gray cases, three products outside scope, four stopped/retired/domain-changed rows, and 15 aliases or duplicate features.
- These 322 rows are assessed product leads and old names, not 322 distinct companies.
- Every main-list official URL was opened. “Active” is a public product/documentation check, not a test transaction or a promise of seller approval.
- A site can be operating while a particular country, account type or product is closed to new sellers.
- The region totals use one broad market grouping per row. Origin and example markets are discovery notes, not a completed headquarters or seller-eligibility audit.
- The 50 proposed comparison fields and the three-provider findability test are in [fields.md](fields.md).

This is a broad first discovery pass, not a defensible claim that every payment service worldwide has been found. Regional bank gateways, direct wallets, new small providers and payment resellers make the boundary very large. Unverified leads are visible instead of being silently dropped.

## Discovery sources and labels

All sources below were searched, opened, or used from their search result on 2026-11-04. Third-party pages supplied names and research questions only. Provider facts in the candidate tables come from official page checks, or are marked unresolved.

| Label in apps.md | Source used | How it was used / limitation |
| --- | --- | --- |
| Seed | Local `scripts/platform-fees/data/directory.json`, sections Payment links and processing and Software and SaaS checkout services | Starting names and official URLs only. Existing prices, country lists and checked dates were not reused as current facts. |
| GH | [CourseMaker awesome-saas-payments](https://github.com/CourseMaker/awesome-saas-payments) | Independent public list of payment and billing names. It is not a current feature checklist. |
| PP | [PremiumPress country gateway list](https://www.premiumpress.com/wordpress-payment-gateways/) | Broad global names, especially regional gateways and crypto. It still contains old names, so official redirects matter. |
| Wix | [Wix country provider list](https://support.wix.com/en/article/available-payment-providers-in-your-country) | Regional discovery and platform-specific payment leads. Wix integration availability is not universal direct seller availability. |
| Official regional guide | [BigCommerce regional gateway directory](https://www.bigcommerce.com/payments/gateways/), [KOMOJU regional methods help](https://help.komoju.com/hc/en-us/articles/5726449680670-Cross-Border-E-commerce-and-Payments-for-Overseas-Customers-South-Korea-China-Taiwan-and-More), [Paytrail methods help](https://support.paytrail.com/hc/en-us/articles/36238094120977-Payment-methods-available-in-the-online-payment-service) | Names and links from commerce/payment integration documentation. |
| Payhip gateway list | [Payhip supported processors](https://help.payhip.com/article/173-how-do-i-get-paid) | Named direct gateway connections; useful evidence of regional leads, not proof of every gateway's own eligibility. |
| Regional guide / regional search, Africa | [Kolonell West Africa guide](https://kolonell.com/en/blog/choose-payment-gateway-west-africa-2026), [Elimboo regional list](https://elimboo.com/meilleurs-agregateurs-paiement-afrique/), [Sinedev African aggregator comparison](https://sinedev.com/comparatif-agregateurs-paiement-afrique/) | Francophone and anglophone discovery. No competitor fees, speed or country claims were copied. |
| Regional guide / regional search, Southeast Asia | [GPayHub Southeast Asia directory](https://www.gpayhub.com/region/southeast-asia/) | Names for local gateways and wallets; official checks determined whether there was a merchant offer. |
| Regional guide / regional search, South Asia | [Pakistan gateway guide](https://checkprice.pk/payment-gateway-in-pakistan/), [Storelala Pakistan guide](https://www.storelala.com/payment-gateway-pakistan), [South Asia methods overview](https://p2pprocessing.com/south-asia-payments/) | Candidate names, especially Pakistan, Bangladesh, Sri Lanka and Nepal. No competitor pricing used. |
| Regional guide / regional search, Latin America | [Rebill regional comparison](https://www.rebill.com/blog/payment-gateway-latin-america), [OrsunPay Latin America terminology guide](https://orsunpay.com/es/guides/payment-gateway-latin-america/), [BigCommerce Latin America guide](https://support.bigcommerce.com/s/article/Payment-Solutions-for-Latin-America?language=en_US) | Cross-border versus local leads. Rebill is a provider with an interest in the comparison. |
| Regional guide / regional search, Middle East | [Middle East gateway comparison](https://marwan-portfolio.com/blog/payment-gateways-middle-east-ecommerce-2026), [PaymentsWiz regional list](https://www.paymentswiz.com/compare), [Amazon Payment Services local methods](https://paymentservices.amazon.com/local-payments?language=en-US) | Discovery of Gulf and Egypt payment brands; official pages were checked separately. |
| Regional guide / regional search, Morocco | [Offi Morocco guide](https://offi.ma/fr/blog/passerelles-paiement-maroc-alternative-stripe/), [Nooralto Morocco guide](https://www.nooralto.com/blog/paiement-en-ligne-maroc.html) | CMI, NAPS and Payzone names. Community questions about onboarding were retained as questions, not facts. |
| Regional guide / regional search, Caribbean | [Ezy Web Pro country guide](https://ezywebpro.com/blog/payment-gateways-caribbean/) | WiPay and First Atlantic Commerce leads; the latter redirected to Powertranz. |
| Vendor comparison | [Creem alternatives](https://www.creem.io/blog/payhip-alternatives), [Payhip Dodo alternatives](https://payhip.com/blog/dodo-payments-alternatives/), [PayNow comparison index](https://paynow.gg/compare) | New merchant-of-record and checkout names. These pages favor their own vendors; competitor claims were not used as proof. |
| Review guide | [TechRadar payment gateways](https://www.techradar.com/best/best-payment-gateways), [small-business processors](https://www.techradar.com/best/best-credit-card-processing-service) | North American and UK merchant-service names. Some text uses old product names. |
| Review-directory lead | [Revmrr payment provider directory](https://revmrr.com/payment-providers) | Names for small-business, account-linked and specialist payment offers. Its grades, rankings and prices were not adopted. |
| G2 | [G2 small-business subscription billing](https://www.g2.com/categories/subscription-billing/small-business), [merchant-of-record category theme](https://www.g2.com/categories/payment/themes/merchant-of-record) | Review-site discovery via public search results. No ratings or ranking claims collected. |
| Crypto comparison | [OrsunPay crypto comparison](https://orsunpay.com/compare/crypto-payment-gateways/), [PipeFlare crypto guide](https://www.pipeflare.io/learn/crypto-payment-gateway), [Paymento comparison](https://paymento.io/compare/), [Crypto Merchant alternatives](https://cryptomerchant.online/alternatives) | Crypto provider names. Legal status, custody, supported assets and fees still require provider-specific research. |
| Community | [SaaS Stripe alternatives thread](https://www.reddit.com/r/SaaS/comments/1uxugkd/stripe_alternatives/), [SaaS processor thread](https://www.reddit.com/r/SaaS/comments/1vgjnaf/stripe_and_paypal_alternatives_for_saas/), [Ghana payments thread](https://www.reddit.com/r/TechGhana/comments/1rsj34w/which_online_payment_systemplatform_to_use/), [Kenya gateway thread](https://www.reddit.com/r/Kenya/comments/195k51h), [Nepal gateway thread](https://www.reddit.com/r/technepal/comments/1uu6kqj/seeking_payment_gateway_alternatives_in_nepal/), [Pakistan subscriptions thread](https://www.reddit.com/r/PakStartups/comments/1sevtpz/payment_gateways_in_pakistan_that_support/), [Morocco gateway thread](https://www.reddit.com/r/Morocco/comments/1hh0jgx) | Names and pain points only. Anonymous reports, recommendations and allegations are not eligibility, risk or closure evidence. |
| Exact-problem search | Queries below; [PayRequest links](https://payrequest.io/features/payment-links) | Finds tools sold as payment links rather than storefronts. |
| Known-name lead | Researcher's prior knowledge, followed by the official URL in the row | Honest attribution where a candidate was checked directly rather than discovered in a retrieved list. This is not an independent fact source. |
| Official link / transition / redirect | Official URLs linked from the current provider or notices linked in [excluded.md](excluded.md) | Identifies a related product or successor. A redirect alone proves destination, not all historic contracts. |

## Search log

All queries below were run on 2026-11-04. Searches were public web searches. Some query batches returned stronger results for one phrase than another; the log records the query, not a claim that each produced useful evidence.

### General discovery and the seller's problem

- `payment gateway alternatives Stripe unsupported countries SaaS indie hacker merchant of record`
- `payment gateways by country Africa Asia Latin America list`
- `github awesome payment gateways payment providers`
- `site.reddit.com SaaS payment provider country Stripe alternatives merchant of record`
- `site.g2.com categories payment gateways alternatives billing merchant of record`
- `merchant of record alternatives Payhip SellApp PayNow Autumn dodopayments`
- `subscription billing software small SaaS Chargebee Recurly Chargify Billsby PayKickstart`
- `payment links software alternatives Stripe payment links PayRequest Checkout Page`
- `site.g2.com best subscription billing software Chargebee Recurly Billsby`

### Regional discovery

- `best payment gateways Africa Senegal Ghana Kenya Tunisia Morocco Paystack PayDunya CinetPay`
- `payment gateways South Asia Pakistan Bangladesh Sri Lanka Nepal eSewa Khalti`
- `payment gateway Southeast Asia Vietnam Thailand Malaysia Philippines Indonesia list`
- `payment gateways Latin America Brazil Mexico Argentina Chile Colombia Peru list`
- `best payment gateway Middle East Saudi UAE Egypt Jordan Bahrain Kuwait list`
- `payment gateway Europe small business Mollie Payplug Viva myPOS Montonio`
- `payment gateway Japan Korea Taiwan Hong Kong digital products merchant`
- `payment gateways Pakistan Safepay PayFast PayPro bSecure Bangladesh aamarPay Nepal Khalti`
- `Japan payment gateways KOMOJU PAY.JP UnivaPay Taiwan ECPay NewebPay Korea Toss PortOne`
- `payment gateway small business Morocco Tunisia CMI NAPS Payzone`
- `payment gateways China Hong Kong Alipay WeChat Oceanpayment UseePay`
- `payment gateways Nordics small business Quickpay Pensopay Paytrail Vipps MobilePay`
- `payment gateway Caribbean WiPay First Atlantic Commerce small business`

### Crypto and status checks

- `crypto payment gateway merchant BitPay CoinGate NOWPayments BTCPay Server alternatives`
- `payment processor shutdown 2026 Sellix Paymill Payrexx LemonWay Digital River MyCommerce`
- `site.digitalriver.com MyCommerce shutdown 2025 2026`
- `site.coinbase.com commerce March 31 2026 transition business`
- `site.sellix.io shutdown 2025 2026`

### Field feasibility searches

- `site.support.paystack.com settlements payout schedule supported countries starter business`
- `site.paystack.com supported countries registered starter business documents`
- `site.paddle.com help payout currency fees refund chargeback reserve`
- `site.docs.stripe.com account verification restricted businesses tax subscriptions billing migration`
- `site.paddle.com acceptable use policy approved products seller identity verification reserve chargeback refunds`
- `site.support.paystack.com refunds transaction fees payout schedule minimum payout supported countries`
- `site.docs.stripe.com reserves refunds dispute fees export data account verification`

Official websites were opened in batches by region, followed by targeted checks of blocked sites and redirects. Per-app official URLs and check dates are in apps.md; held-out products and failure reasons are in excluded.md. The feasibility source URLs and failures are in fields.md.

## What the official checks established

- Some old names redirect to current offers: Opn to Omise, iPay88 Malaysia to ADAPTIS, MOLPay to Fiuu, PayMaya to Maya, Payfort to Amazon Payment Services, Opayo to Elavon, Chargify to Maxio, and First Atlantic Commerce to Powertranz.
- SecurePay Australia still has a page, but its public new-merchant route goes to Fat Zebra.
- Dragonpay's official site identifies it as a Xendit company. It still has a merchant offer, so it remains a product lead.
- Lemon Squeezy still presents its own signup and product offer after Stripe's acquisition. Stripe Managed Payments has a separate legal-seller model from Stripe Payments.
- Coinbase's official transition notice gives a retirement deadline for Commerce and directs eligible sellers to Business.
- Sellix's official statement acknowledges seizure. A working statement page is not proof of a resumed merchant service.
- Digital River/MyCommerce closure evidence came from a former merchant's official support notice, not a readable current provider announcement. The old MyCommerce domain now serves an unrelated site.
- KOMOJU's official site is readable, but it carries an [October 26 incident update](https://en.komoju.com/news/1026-notice/). Keep its service status on the recheck list. The date is a real site check, not an assertion the service is closed.
- Payoneer's Checkout page contains apparently different eligibility descriptions. It needs product-specific clarification before recording one universal entry rule.

These are examples caught during discovery, not a full ownership-history audit of all 240 candidates. Parent-company facts outside these checks remain provisional until per-app research.

## Remaining gaps and unknowns

1. **Sixty-three main-list entries need judgment or renewed operating checks:** 43 gray and 20 check-again entries. Keep these separate from the 177 active public-site checks.
2. **Another 34 held-out entries have failed or incomplete official checks.** Retry current product/docs/local domains. HTTP 403, 404, timeout and unreadable pages are not evidence of closure by themselves.
3. **Seller-country coverage is not collected yet.** Today's grouping is not a list of 240 services available to every indie hacker.
4. **Mainland China and direct-wallet onboarding need native-language follow-up.** An international integration document does not prove a local individual or foreign sole trader can join directly.
5. **Central Asia, the Caucasus, Russia and neighboring markets are under-covered.** Local gateways, cross-border restrictions and sanctions need separate official-source discovery.
6. **Smaller African markets and the Pacific islands need country-by-country passes.** Today's African list is stronger in Nigeria, South Africa, Kenya and francophone West Africa than elsewhere.
7. **Bank-owned gateways and local acquiring brands remain incomplete.** Merchant access may be through a bank or reseller rather than a standalone app signup.
8. **The Middle East still needs more country-level depth outside the Gulf, Egypt and the Maghreb.** Israel, the Levant and smaller national markets need dedicated searches.
9. **New merchant-of-record products and small checkout wrappers appear frequently.** Recent small providers with little public history may be missing. Listing a site is not an endorsement of its financial stability.
10. **Crypto coverage is a separate research problem.** Official operation, legal entity, custody, asset/network support and geographic restrictions need checking individually. Five proposed crypto fields have not had a dedicated feasibility test yet.
11. **Corporate relationships and contract boundaries need later checking.** A group's acquisition does not mean every brand has merged, stopped accepting new merchants, or shares one price.
12. **No price, approval rate, transaction-volume, market-share or popularity dataset was collected.** The only fee details saved are a small number needed to explain exclusions and field feasibility.

A reasonable next discovery pass should use official commerce-platform integration catalogs and native-language searches country by country. Deduplicate by product contract and seller account, not just by logo or parent company.

## Decisions for the owner

- Approve the 40 core fields, five optional fields and five crypto fields, or choose a smaller first research set.
- Decide whether direct wallet acceptance should remain alongside full gateways. The main list labels these as “other.”
- Decide how far to include billing and payment-routing software. Lago, Autumn and Rebilly are gray on the main list; broader infrastructure is held out.
- Decide the storefront boundary. Twelve held-out products overlap with platform-fees. Checkout Page, Instamojo and Zbooni remain visible gray cases because a payment-link offer is central.
- Decide whether established solo sellers with higher budgets count. Maxio and several sales-led providers are held out pending this decision. Do not describe every sales-led service as enterprise-only without evidence.
- Decide how to group regional products and companies in public counts. Today's rows count offers, so PayU India and PayU Latin America are separate; parent-company totals would differ.
- Approve a later crypto feasibility sample before those five conditional fields become final.

No full per-app research should begin until the owner approves the field list.


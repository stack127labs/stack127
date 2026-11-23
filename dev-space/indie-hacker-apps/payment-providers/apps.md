# Payment provider candidates

Checked on 2026-11-04. This is discovery for later research, not a finished comparison or a recommendation.

238 candidates: 173 active, 43 gray, 20 check again, 1 closing, 1 risk. Cryptomus and Heleket were removed on 2026-11-09 because their operator is under UK sanctions. “Active” means an official product page or official documentation was readable and offered the service. It does not mean we signed up, tested a payment, or proved approval for every seller.

“Gray” means the site is operating but the product boundary, current contract, or practical fit for one seller needs a decision. “Check again” means the official check was blocked, empty, or raised an unresolved service question. These rows are leads, not verified operating choices. A dated attempt is not a confirmation. KOMOJU has a confirmed readable site, but its recent incident notice still needs a service-status recheck.

The market column gives a broad discovery grouping, sometimes with origin or example markets. It is **not** a list of countries where sellers can sign up. Those lists need full research. Global does not mean every country. Region totals use the first label in that column, once per row.

A gateway connects or processes payments. A merchant of record is the legal seller to the buyer. Billing products manage charges through their own or connected payment providers. Payment-link products focus on hosted requests or checkout forms. “Other” covers direct wallets and routing tools. One primary type per row; features can overlap.

Each official URL was opened. Where the homepage failed but official documentation worked, the row explains it. The date column says when the check succeeded, or explicitly says it did not.

Discovery labels link to the search and source log in [notes.md](notes.md). “Known-name lead” means a name supplied from prior knowledge and checked on its official site, rather than a claim that a third-party list found it. Seed means the local platform-fees file; it supplied names only.

## Main table

| Name | Official URL opened | Type | Home region or main markets | Why it belongs / limit | How found | Status | Site confirmed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Paddle | [Official site](https://www.paddle.com/) | merchant of record | Global; UK origin | Software checkout with tax responsibility. Note: FTC order filed 2025-06-20 imposed a USD 5m judgment and targeted tech-support restrictions. | Seed, GH | active | 2026-11-04 |
| Lemon Squeezy | [Official site](https://www.lemonsqueezy.com/) | merchant of record | Global; US origin | Software and downloads; Stripe-owned, still separately offered. | Seed, community | active | 2026-11-04 |
| Polar | [Official site](https://polar.sh/) | merchant of record | Global; 119 seller countries | Developer billing and digital-product MoR; payout bank country and currency must match, and seller eligibility is country-limited. | Seed, community | active | 2026-11-04 |
| Creem | [Official site](https://www.creem.io/) | merchant of record | Global; published seller-country allowlist | Software and digital-product MoR; seller eligibility and payout-bank options are limited to published countries. | Seed, vendor comparison | active | 2026-11-04 |
| Dodo Payments | [Official site](https://docs.dodopayments.com/introduction) | merchant of record | Global; country-limited eligibility | Digital-product MoR; new-seller and grandfathered-country rules differ, and listed exclusions and owner checks apply. | Seed, vendor comparison | active | 2026-11-04 |
| FastSpring | [Official site](https://fastspring.com/) | merchant of record | Global; US origin | Software, ebooks and course checkout. | Seed, GH | active | 2026-11-04 |
| PayPro Global | [Official site](https://payproglobal.com/) | merchant of record | Global; Canada origin | Software checkout; explicitly serves startups and small businesses. | Seed, vendor comparison | active | 2026-11-04 |
| 2Checkout (Verifone) | [Official site](https://www.2checkout.com/) | merchant of record | Global; US origin | Digital commerce; legal seller role depends on package. | Seed, PP | active | 2026-11-04 |
| Freemius | [Official site](https://freemius.com/) | merchant of record | Global | Software checkout, licensing and subscriptions. | Seed, community | active | 2026-11-04 |
| Fungies | [Official site](https://fungies.io/) | merchant of record | Global | Digital-product checkout and payment acceptance are part of the same MoR offer; Fungies is the legal seller for processed sales. | Seed | active | 2026-11-04 |
| Stripe Managed Payments | [Official site](https://stripe.com/managed-payments) | merchant of record | Global; US origin | Stripe is the MoR for eligible transactions, while its agreement also describes the user as seller of record; separate from standard Stripe Payments. | Seed, vendor comparison | active | 2026-11-04 |
| Xsolla | [Official site](https://xsolla.com/) | merchant of record | Global; Russian predecessor, US headquarters | Game payment acceptance for developers; predecessor 2pay was Russian, and current headquarters are in Los Angeles. | Review-directory lead | active | 2026-11-04 |
| PayNow (paynow.gg) | [Official site](https://paynow.gg/) | merchant of record | Global | SaaS and game-server checkout; distinct from Singapore PayNow and Zimbabwe Paynow. | Vendor comparison | active | 2026-11-04 |
| Tebex | [Official site](https://www.tebex.io/) | merchant of record | Global; UK origin | Game checkout; standalone checkout offer as well as stores. | Vendor comparison | active | 2026-11-04 |
| Stripe | [Official site](https://stripe.com/payments) | gateway | Global; US origin | Online processing, hosted checkout and payment links in one provider row. | Seed, GH | active | 2026-11-04 |
| PayPal | [Official site](https://www.paypal.com/us/business) | gateway | Global; US origin | Direct online merchant checkout and payment requests. | Seed, GH | active | 2026-11-04 |
| Square | [Official site](https://squareup.com/us/en/payments/online-payments) | gateway | North America, Europe and Asia-Pacific; 8 seller countries | Online payments for sellers in Australia, Canada, France, Ireland, Japan, Spain, the UK and the US; other global access does not establish seller processing eligibility. | Seed, review guide | active | 2026-11-04 |
| Authorize.net | [Official site](https://www.authorize.net/) | gateway | North America; US | Online merchant gateway with small-business plans. | Review guide, PP | active | 2026-11-04 |
| Helcim | [Official site](https://www.helcim.com/) | gateway | North America; Canada and US | Small-business checkout and recurring payment tools. | Review guide | active | 2026-11-04 |
| Airwallex Payments | [Official site](https://www.airwallex.com/global/payments) | gateway | Global; Asia-Pacific origin | Online checkout, links and currency handling. | Review-directory lead | active | 2026-11-04 |
| Worldpay | [Official site](https://www.worldpay.com/en) | gateway | Global; UK and US | Online merchant acceptance; check country-specific small-business contract. | PP, review guide | gray | 2026-11-04 |
| Global Payments | [Official site](https://www.globalpayments.com/) | gateway | Global; US origin | Offers merchant solutions for small businesses; local offer needs checking. | PP | gray | 2026-11-04 |
| BlueSnap | [Official site](https://www.bluesnap.com/) | gateway | Global; US origin | Online payment routing and processing; minimum costs need checking. | PP | gray | 2026-11-04 |
| Nuvei | [Official site](https://www.nuvei.com/) | gateway | Global; Canada origin | Online merchant processing; small-seller access needs confirmation. | PP | gray | 2026-11-04 |
| Paysafe | [Official site](https://www.paysafe.com/en/) | gateway | Global; Europe origin | Explicit small-business offer; identify the exact online contract later. | PP | gray | 2026-11-04 |
| Paymentwall | [Official site](https://www.paymentwall.com/) | gateway | Global | Online payment methods and subscriptions. | Wix, PP | active | 2026-11-04 |
| FasterPay | [Official site](https://www.fasterpay.com/business) | gateway | Global; Europe origin | Merchant payment widget and subscription tools. | Wix | active | 2026-11-04 |
| GoCardless | [Official site](https://gocardless.com/) | gateway | Europe; UK origin, also other regions | Bank-account payments for recurring or one-off sales. | GH | active | 2026-11-04 |
| Mollie | [Official site](https://www.mollie.com/) | gateway | Europe; Netherlands origin | Small-business online payments and subscriptions. | Seed, Wix | active | 2026-11-04 |
| Payline | [Official site](https://paylinedata.com/) | gateway | North America; US | Online gateway, links and recurring collections. | Review guide | active | 2026-11-04 |
| PayJunction | [Official site](https://www.payjunction.com/payments/) | gateway | North America; US | Online merchant acceptance and developer connections. | Known-name lead | gray | 2026-11-04 |
| Stax Payments | [Official site](https://staxpayments.com/) | gateway | North America; US | Small-business online payments; monthly cost may affect fit. | Review-directory lead | active | 2026-11-04 |
| Moneris | [Official site](https://www.moneris.com/) | gateway | North America; Canada | Canadian merchant checkout and online processing. Note: Francisco Partners agreed to acquire it on 2026-08-10; close is pending. | Review-directory lead | active | 2026-11-04 |
| Zoho Payments | [Official site](https://www.zoho.com/payments/) | gateway | South Asia; India, also US offer | Distinct payment acceptance product, separate from Zoho Billing. | Review-directory lead | active | 2026-11-04 |
| Wave Payments | [Official site](https://www.waveapps.com/payments) | gateway | North America; US and Canada | Invoice-based online collection for solo businesses. | Review-directory lead | active | 2026-11-04 |
| QuickBooks Payments | [Official site](https://quickbooks.intuit.com/payments/) | gateway | North America and UK; US, Canada and UK | Payment acceptance within accounting software; offers are documented for the US, Canada and UK. | Review guide | active | 2026-11-04 |
| GoDaddy Payments | [Official site](https://www.godaddy.com/payments) | gateway | North America; US and Canada | Dedicated payment offer alongside website tools. | Review-directory lead | active | 2026-11-04 |
| Pin Payments | [Official site](https://www.pinpayments.com/) | gateway | Oceania; Australia and New Zealand | Explicit small-business online payment offer. | Review-directory lead | active | 2026-11-04 |
| Eway | [Official site](https://www.eway.com.au/) | gateway | Oceania; Australia and New Zealand | Online payments and merchant gateway. | PP | active | 2026-11-04 |
| Windcave | [Official site](https://windcave.com/) | gateway | Global; merchant services in New Zealand, Australia, UK, US, Canada and Europe | Online merchant gateway alongside physical payments; this footprint does not establish seller signup in every country. | PP | active | 2026-11-04 |
| Fat Zebra | [Official site](https://www.fatzebra.com/) | gateway | Oceania; Australia and New Zealand | Online merchant gateway; current destination for SecurePay leads. | Known-name lead | active | 2026-11-04 |
| Tyro | [Official site](https://www.tyro.com/) | gateway | Oceania; Australia | Has online payments and links, beyond card machines. | Review-directory lead | active | 2026-11-04 |
| Razorpay | [Official site](https://razorpay.com/payment-gateway/) | gateway | South Asia; India and overseas Import Stack route | India gateway; overseas businesses can apply separately through Import Stack to collect from Indian buyers; eligible countries are not fully listed. | Seed | active | 2026-11-04 |
| Cashfree Payments | [Official site](https://www.cashfree.com/payment-links/) | gateway | South Asia; India | Online collections; links and documentation opened successfully. | Seed | active | 2026-11-04 |
| PayU India | [Official site](https://payu.in/) | gateway | South Asia; India | India-specific payment contract and subscription offer. | Seed | active | 2026-11-04 |
| Paytm Payment Gateway | [Official site](https://business.paytm.com/) | gateway | South Asia; India | Online gateway and subscriptions; use payment business, not consumer bank. Note: RBI cancelled the separate Paytm Payments Bank licence effective 2026-04-24; Paytm says Payment Gateway services were unaffected. | Known-name lead | active | 2026-11-09 |
| PhonePe Payment Gateway | [Official site](https://business.phonepe.com/payment-gateway) | gateway | South Asia; India | Online merchant checkout for small businesses. | Known-name lead | active | 2026-11-04 |
| Instamojo Payments | [Official site](https://www.instamojo.com/) | payment link | South Asia; India | Standalone payment links; storefront overlap needs owner decision. | Seed | gray | 2026-11-04 |
| Easebuzz | [Official site](https://easebuzz.in/) | gateway | South Asia; India | Gateway, links and recurring collections. | Known-name lead | active | 2026-11-04 |
| CCAvenue | [Official site](https://www.ccavenue.com/) | gateway | South Asia; India, also Gulf offers | Online gateway with merchant signup and subscriptions. | Known-name lead | active | 2026-11-04 |
| PayHere | [Official site](https://www.payhere.lk/) | gateway | South Asia; Sri Lanka | Online merchant acceptance for Sri Lankan businesses. | Seed | active | 2026-11-04 |
| WEBXPAY | [Official site](https://webxpay.com/) | gateway | South Asia; Sri Lanka | Local online collections and developer tools. | Known-name lead | active | 2026-11-04 |
| OnePay Sri Lanka | [Official site](https://www.onepay.lk/) | gateway | South Asia; Sri Lanka | Local gateway and recurring billing; distinct from OnePay Vietnam. | Known-name lead | active | 2026-11-04 |
| SSLCOMMERZ | [Official site](https://sslcommerz.com/) | gateway | South Asia; Bangladesh | Local online gateway and merchant signup. | Regional search | active | 2026-11-04 |
| shurjoPay | [Official site](https://shurjopay.com.bd/) | gateway | South Asia; Bangladesh | Local online gateway with merchant activation. | Known-name lead | active | 2026-11-04 |
| bKash for Business | [Official site](https://www.bkash.com/en/business) | other | South Asia; Bangladesh | Direct wallet acceptance; keep distinct from gateways carrying bKash. | Regional search | gray | 2026-11-04 |
| Safepay | [Official site](https://getsafepay.pk/) | gateway | South Asia; Pakistan | Website payments, subscriptions and no-code links. | Regional search, community | active | 2026-11-04 |
| PayFast Pakistan | [Official site](https://gopayfast.com/) | gateway | South Asia; Pakistan | Local gateway candidate; official site returned 403. | Regional search, community | check again | Not confirmed; attempted 2026-11-04 |
| PayPro Pakistan | [Official site](https://paypro.com.pk/) | gateway | South Asia; Pakistan | Local collection candidate; official site timed out. | Regional search, community | check again | Not confirmed; attempted 2026-11-04 |
| Khalti by IME | [Official site](https://khalti.com/) | gateway | South Asia; Nepal | Online payment gateway; current site uses Khalti by IME branding. | Community, regional search | active | 2026-11-04 |
| eSewa | [Official site](https://esewa.com.np/) | other | South Asia; Nepal | Direct wallet checkout candidate; homepage only showed offline shell. | Community | check again | Not confirmed; attempted 2026-11-04 |
| JazzCash Business | [Official site](https://www.jazzcash.com.pk/business/) | other | South Asia; Pakistan | Merchant wallet candidate; confirm online checkout access later. | Regional search | gray | 2026-11-04 |
| Xendit | [Official site](https://www.xendit.co/en/) | gateway | Southeast Asia; Indonesia, Philippines, Hong Kong; Mexico preview | Regional checkout, links and subscriptions; Hong Kong has an onboarding route and Mexico was listed in preview, not as standard signup. | Seed, regional guide | active | 2026-11-04 |
| Midtrans | [Official site](https://midtrans.com/) | gateway | Southeast Asia; Indonesia | Online payment gateway with explicit solo/startup offer. | Regional guide, Payhip gateway list | active | 2026-11-04 |
| DOKU | [Official site](https://www.doku.com/) | gateway | Southeast Asia; Indonesia | Local online payments with small-business offer. Note: DOKU uses the “DOKU by Antom” branding in 2026; DOKU acquired senangPay in 2022, listed separately (checked 2026-11-05). | Regional guide | active | 2026-11-04 |
| Faspay | [Official site](https://faspay.co.id/id/) | gateway | Southeast Asia; Indonesia | Gateway, links and small-business services. | Known-name lead | active | 2026-11-04 |
| Duitku | [Official site](https://www.duitku.com/) | gateway | Southeast Asia; Indonesia | Online checkout across local payment methods. | Known-name lead | active | 2026-11-04 |
| HitPay | [Official site](https://hitpayapp.com/) | gateway | Southeast Asia; Singapore origin | Small-business online payments and recurring billing. | Seed | active | 2026-11-04 |
| Omise | [Official site](https://www.omise.co/en) | gateway | Southeast Asia; Thailand origin, also Japan | Online gateway; returned from Opn/Opn Payments to Omise on 2025-03-18, with service continuing. | Seed, PP | active | 2026-11-04 |
| 2C2P by Antom | [Official site](https://2c2p.com/) | gateway | Southeast Asia; Singapore and Thailand | Online gateway and links; verify solo seller's online plan. | PP, regional guide | gray | 2026-11-04 |
| NTT DATA ADAPTIS e-Commerce (formerly iPay88) | [Official site](https://my.nttdatapay.com/en/payment-services/adaptis-e-commerce) | gateway | Southeast Asia; Malaysia | Current destination of iPay88 website; local online gateway. | PP | active | 2026-11-04 |
| Fiuu | [Official site](https://fiuu.com/) | gateway | Southeast Asia; Malaysia origin | Online gateway; check old Razer Merchant Services/MOLPay names as aliases. | PP | active | 2026-11-04 |
| Billplz | [Official site](https://main.billplz.com/) | gateway | Southeast Asia; Malaysia | Local online collections with merchant signup. | Known-name lead | active | 2026-11-04 |
| senangPay-DOKU | [Official site](https://senangpay.com/) | gateway | Southeast Asia; Malaysia | Small-business gateway; migration notice is public. | Known-name lead | active | 2026-11-04 |
| ToyyibPay | [Official site](https://www.toyyibpay.com/) | gateway | Southeast Asia; Malaysia | Online collections, public pricing and plugins. Note: Official notices described delayed settlements and a staged resolution; no later resolution notice was found (checked 2026-11-05). | PP | active | 2026-11-04 |
| Razorpay Curlec | [Official site](https://curlec.com/) | gateway | Southeast Asia; Malaysia | Separate Malaysian merchant gateway under Razorpay. Note: Digital-goods restrictions, fee/tax conflicts and an expired linked PCI certificate remain review points (checked 2026-11-05). | Official Razorpay link | active | 2026-11-04 |
| PayMongo | [Official site](https://www.paymongo.com/en) | gateway | Southeast Asia; Philippines | Checkout and payment links for local sellers. Note: New merchant sign-ups remained paused on 2026-11-09; start and reopening dates are unpublished. | Regional search | active | 2026-11-04 |
| Maya Business | [Official site](https://www.maya.ph/business) | gateway | Southeast Asia; Philippines | Current business checkout and links; PayMaya is an old name. | Regional guide | active | 2026-11-04 |
| Dragonpay | [Official site](https://www.dragonpay.ph/) | gateway | Southeast Asia; Philippines | Local online payment methods; new merchant onboarding now goes through Xendit (checked 2026-11-05). | Known-name lead | active | 2026-11-04 |
| Paynamics | [Official site](https://paynamics.com/) | gateway | Southeast Asia; Philippines | Online checkout offer; minimum scale needs checking. | Known-name lead | gray | 2026-11-04 |
| VNPAY | [Official site](https://vnpay.vn/) | gateway | Southeast Asia; Vietnam | Local merchant payment services; confirm exact online signup path. | Known-name lead | gray | 2026-11-04 |
| Ngan Luong | [Official site](https://www.nganluong.vn/vn/home.html) | gateway | Southeast Asia; Vietnam | Local online merchant payments. Note: The provider announced that it will shut down on 2027-02-09 (checked 2026-11-05). | Known-name lead | closing | 2026-11-04 |
| OnePay Vietnam | [Official site](https://www.onepay.vn/) | gateway | Southeast Asia; Vietnam | Local website checkout; distinct from Sri Lankan OnePay. | Known-name lead | active | 2026-11-04 |
| Bao Kim | [Official site](https://www.baokim.vn/) | gateway | Southeast Asia; Vietnam | Electronic payment gateway and digital-goods offer. Note: Organizational and household-business e-wallets stopped on 2025-01-01; the gateway remains advertised (checked 2026-11-05). | Known-name lead | active | 2026-11-04 |
| AsiaPay | [Official site](https://www.asiapay.com/) | gateway | East Asia; Hong Kong origin, wider Asia | Online merchant gateway; group local brands under one lead. | Known-name lead | active | 2026-11-04 |
| ECPay | [Official site](https://www.ecpay.com.tw/) | gateway | East Asia; Taiwan | Online collections with creator and small-store routes. | Known-name lead | active | 2026-11-04 |
| NewebPay | [Official site](https://www.newebpay.com/) | gateway | East Asia; Taiwan | Online payments explicitly serving micro merchants. | Known-name lead | active | 2026-11-04 |
| TapPay | [Official site](https://www.tappaysdk.com/taiwan-zhtw) | gateway | East Asia; Taiwan | Website and app payments with Link Pay. | Known-name lead | active | 2026-11-04 |
| KOMOJU | [Official site](https://en.komoju.com/) | gateway | East Asia; Japan, wider markets | Online integrations; public October service-impact notice needs recheck. | Official regional guide | check again | 2026-11-04; service notice needs recheck |
| PAY.JP | [Official site](https://pay.jp/) | gateway | East Asia; Japan | Developer payment gateway and subscription candidate. | Known-name lead | active | 2026-11-04 |
| UnivaPay | [Official site](https://univapay.com/) | gateway | East Asia; Japan | Online payments, recurring charges and payment forms. | Known-name lead | active | 2026-11-04 |
| SB Payment Service | [Official site](https://www.sbpayment.jp/) | gateway | East Asia; Japan | Online checkout and email-link options; check small-seller terms. | Known-name lead | gray | 2026-11-04 |
| Toss Payments | [Official site](https://www.tosspayments.com/) | gateway | East Asia; South Korea | Local online merchant payment acceptance. | Known-name lead | active | 2026-11-04 |
| KG Inicis | [Official site](https://www.inicis.com/) | gateway | East Asia; South Korea | Local online gateway; local registration needs later research. | Known-name lead | active | 2026-11-04 |
| PortOne | [Official site](https://www.portone.io/) | other | East Asia; South Korea, also Asian offers | Routes to payment providers; separate provider contracts may be needed. | Official integration guide | gray | 2026-11-04 |
| Antom | [Official site](https://www.antom.com/) | gateway | East Asia; China/Singapore origin, wider Asia | Cross-border acceptance; direct solo-seller access remains unclear. | Regional guide | gray | 2026-11-04 |
| Paystack | [Official site](https://paystack.com/) | gateway | Africa; Nigeria origin, multiple markets | Online collections for entrepreneurs and startups. | Seed, community | active | 2026-11-04 |
| Flutterwave | [Official site](https://flutterwave.com/ng/) | gateway | Africa; Nigeria origin, multiple markets | Small-business online checkout and links. | Seed, regional guide | active | 2026-11-04 |
| Payfast South Africa | [Official site](https://payfast.io/) | gateway | Africa; South Africa | Small-business online payments and subscriptions; Network branding. | PP | active | 2026-11-04 |
| PayGate | [Official site](https://www.paygate.co.za/) | gateway | Africa; South Africa | Gateway still linked from Payfast; own site timed out. | Official Payfast link | check again | Not confirmed; attempted 2026-11-04 |
| Peach Payments | [Official site](https://www.peachpayments.com/) | gateway | Africa; South Africa origin | Online checkout, links and recurring payments. Note: The public PCI certificate link had expired and some fee values differed across official pages (checked 2026-11-05). | Regional search | active | 2026-11-04 |
| Yoco | [Official site](https://www.yoco.com/za/) | gateway | Africa; South Africa | Has online payments as well as card machines. | PP | active | 2026-11-04 |
| Ozow | [Official site](https://ozow.com/) | gateway | Africa; South Africa | Direct bank-payment collections for small businesses. | Regional guide | active | 2026-11-04 |
| Pesapal | [Official site](https://www.pesapal.com/) | gateway | Africa; East Africa, Kenya origin | Online merchant acceptance and local payment methods. Note: Only 30% of research rows were confirmed; country rates were not published and Rwanda pages showed Tanzania content (checked 2026-11-06). | Community | active | 2026-11-04 |
| DPO Pay by Network | [Official site](https://dpogroup.com/) | gateway | Africa; multiple markets | Current regional merchant payment brand; avoid a second DPO Group row. | Known-name lead | active | 2026-11-04 |
| PayDunya | [Official site](https://paydunya.com/) | gateway | Africa; Senegal, francophone West Africa | Website and mobile money collections. Note: Peach Payments confirmed the acquisition in 2025; the fee-schedule image remained unreadable, leaving 8 check_failed rows (checked 2026-11-06). | Regional guide, community | active | 2026-11-04 |
| CinetPay | [Official site](https://cinetpay.com/) | gateway | Africa; Côte d’Ivoire, francophone Africa | Regional gateway candidate; homepage 403 and docs 502. | Regional guide, community | check again | Not confirmed; attempted 2026-11-04 |
| FedaPay | [Official site](https://www.fedapay.com/) | gateway | Africa; Benin, francophone West Africa | Online card and mobile money collections. | Regional guide | active | 2026-11-04 |
| KKiaPay | [Official site](https://kkiapay.me/) | gateway | Africa; Benin, francophone West Africa | Online payments and startup offer. | Regional guide | active | 2026-11-04 |
| Hubtel | [Official site](https://hubtel.com/) | gateway | Africa; Ghana | Current site targets broader business operations; simple gateway fit unclear. | Community | gray | 2026-11-04 |
| Chapa | [Official site](https://chapa.co/) | gateway | Africa; Ethiopia | Online card, bank and mobile money collections. | Regional guide | active | 2026-11-04 |
| IntaSend | [Official site](https://intasend.com/) | gateway | Africa; Kenya, East Africa | Online mobile money collections, checkout and links. | Known-name lead | active | 2026-11-04 |
| SeerBit | [Official site](https://www.seerbit.com/) | gateway | Africa; Nigeria origin, multiple markets | Online collections with merchant signup. | Known-name lead | active | 2026-11-04 |
| Monnify | [Official site](https://monnify.com/) | gateway | Africa; Nigeria | Online payment collection for local businesses. | Known-name lead | active | 2026-11-04 |
| Tingg (Cellulant) | [Official site](https://tingg.africa/) | gateway | Africa; multiple markets | Checkout and payment links; verify minimum revenue requirements. | Known-name lead, community | gray | 2026-11-04 |
| PawaPay | [Official site](https://www.pawapay.io/) | gateway | Africa; multiple markets | Mobile money collections; solo-seller minimums unclear. | Known-name lead | gray | 2026-11-04 |
| Safaricom M-PESA / Daraja | [Official site](https://developer.safaricom.co.ke/) | other | Africa; Kenya | Direct online wallet integration, rather than an all-method gateway. | Community | gray | 2026-11-04 |
| Paynow Zimbabwe | [Official site](https://www.paynow.co.zw/) | gateway | Africa; Zimbabwe | Local online gateway candidate; official site timed out. | Known-name lead | check again | Not confirmed; attempted 2026-11-04 |
| Konnect | [Official site](https://konnect.network/) | gateway | Middle East and North Africa; Tunisia | Online links, plugins and developer interface for local sellers. | Known-name lead | active | 2026-11-04 |
| Paymee | [Official site](https://www.paymee.tn/) | gateway | Middle East and North Africa; Tunisia | Local online card checkout and payment links. Note: A 2024-02-14 statement reported paralyzed operations and frozen funds; no resumption notice was found (checked 2026-11-06). | Known-name lead | risk | 2026-11-04 |
| Chargily Pay | [Official site](https://chargily.com/) | gateway | Middle East and North Africa; Algeria | Online gateway explicitly serving startups. | Known-name lead | active | 2026-11-04 |
| Paymob | [Official site](https://paymob.com/) | gateway | Middle East and North Africa; Egypt origin | Regional online gateway candidate; official page returned 403. | Regional guide | check again | Not confirmed; attempted 2026-11-04 |
| PayTabs | [Official site](https://paytabs.com/) | gateway | Middle East and North Africa; Saudi Arabia origin | Regional checkout and links; official technical portal verified. | Regional guide, Payhip list | active | 2026-11-04 |
| Tap Payments | [Official site](https://developers.tap.company/) | gateway | Middle East and North Africa; Kuwait/Gulf | Regional online acceptance; official developer portal verified. | Regional guide | active | 2026-11-04 |
| Moyasar | [Official site](https://docs.moyasar.com/) | gateway | Middle East and North Africa; Saudi Arabia | Local online payment integration and test environment. | Regional guide | active | 2026-11-04 |
| MyFatoorah | [Official site](https://www.myfatoorah.com/) | gateway | Middle East and North Africa; Kuwait/Gulf | Online payment links, invoicing and integration. | Regional guide | active | 2026-11-04 |
| HyperPay | [Official site](https://www.hyperpay.com/) | gateway | Middle East and North Africa; Saudi Arabia and Jordan | Online gateway and recurring payments; exact small-seller terms need checking. | Regional guide | gray | 2026-11-04 |
| Amazon Payment Services | [Official site](https://paymentservices.amazon.com/) | gateway | Middle East and North Africa | Regional online acceptance; formerly Payfort. | Regional guide | active | 2026-11-04 |
| Telr | [Official site](https://telr.com/) | gateway | Middle East and North Africa; UAE and Saudi Arabia | Regional online merchant gateway. | Regional guide | active | 2026-11-04 |
| Ziina | [Official site](https://ziina.com/) | payment link | Middle East and North Africa; UAE | Business payment links and online gateway for small sellers. | Known-name lead | active | 2026-11-04 |
| Zbooni | [Official site](https://www.zbooni.com/) | payment link | Middle East and North Africa; UAE origin | Chat-based checkout; social-store overlap needs owner decision. | Known-name lead | gray | 2026-11-04 |
| Geidea | [Official site](https://geidea.net/ksa/ar) | gateway | Middle East and North Africa; Saudi Arabia, UAE, Egypt | Online gateway and payment links beyond physical terminals. | Regional guide | active | 2026-11-04 |
| Paymes | [Official site](https://www.paymes.com/) | payment link | Middle East and North Africa; Turkey/Gulf offers | Social payment links; check exact country contract and owner relationship. | Known-name lead | gray | 2026-11-04 |
| Fawry | [Official site](https://www.fawry.com/) | gateway | Middle East and North Africa; Egypt | Small-business payment services; exact online package needs checking. | Regional guide | gray | 2026-11-04 |
| Kashier | [Official site](https://www.kashier.io/) | gateway | Middle East and North Africa; Egypt | Local online merchant checkout. | Known-name lead | active | 2026-11-04 |
| Mercado Pago | [Official site](https://www.mercadopago.com.mx/) | gateway | Latin America; Argentina origin, multiple markets | Independent checkout beyond Mercado Libre; official page blocked. | Seed, Wix | check again | Not confirmed; attempted 2026-11-04 |
| PayU Latin America | [Official site](https://www.payu.com/) | gateway | Latin America | Separate regional offering from PayU India; official corporate site blocked. | PP, regional guide | check again | Not confirmed; attempted 2026-11-04 |
| Openpay | [Official site](https://www.openpay.mx/) | gateway | Latin America; Mexico origin | Local online gateway candidate; official page had no product text. | PP | check again | Not confirmed; attempted 2026-11-04 |
| Conekta | [Official site](https://www.conekta.com/) | gateway | Latin America; Mexico | Local online payment acceptance with merchant signup. | Known-name lead | active | 2026-11-04 |
| Clip | [Official site](https://www.clip.mx/) | gateway | Latin America; Mexico | Online checkout and links beyond card machines. | Known-name lead | active | 2026-11-04 |
| PagBank (PagSeguro) | [Official site](https://pagbank.com.br/) | gateway | Latin America; Brazil seller signup | Online checkout, links and recurring-payment offer; the researched seller signup route is Brazil-only. | PP, Wix | active | 2026-11-04 |
| Pagar.me / Stone online payments | [Official site](https://www.pagar.me/) | gateway | Latin America; Brazil seller signup | Pagar.me is now a Stone online-payments product; the researched seller signup route is Brazil-only. | Wix | active | 2026-11-04 |
| Asaas | [Official site](https://www.asaas.com/) | gateway | Latin America; Brazil seller eligibility | Online collections, links and developer interface; seller signup is limited to Brazil. | Known-name lead | active | 2026-11-04 |
| iugu | [Official site](https://www.iugu.com/) | billing | Latin America; Brazil seller signup | Recurring billing and online collections for Brazilian companies with CNPJ registration. | Known-name lead | active | 2026-11-04 |
| Vindi | [Official site](https://www.vindi.com.br/) | billing | Latin America; Brazil | Recurring payment candidate; official site could not be fetched. | Known-name lead | check again | Not confirmed; attempted 2026-11-04 |
| dLocal Go | [Official site](https://dlocalgo.com/) | gateway | Latin America; Uruguay origin, wider markets | Small-business-facing checkout and subscriptions; separate from dLocal enterprise. | Known-name lead | active | 2026-11-04 |
| Kushki | [Official site](https://www.kushkipagos.com/) | gateway | Latin America; multiple markets | Online payment links and plugins; solo-seller terms need checking. | PP | gray | 2026-11-04 |
| Bold | [Official site](https://bold.co/) | gateway | Latin America; Colombia | Online gateway, payment button and links. | Known-name lead | active | 2026-11-04 |
| Wompi | [Official site](https://wompi.com/) | gateway | Latin America; Colombia, Panama and El Salvador offers | Country-specific online payment products; choose contract later. | PP | gray | 2026-11-04 |
| ePayco | [Official site](https://www.epayco.com/) | gateway | Latin America; Colombia | Local gateway candidate; official site fetch failed. | PP | check again | Not confirmed; attempted 2026-11-04 |
| Flow | [Official site](https://web.flow.cl/) | gateway | Latin America; Chile, Mexico and Peru offers | Regional online payment collection. | PP | active | 2026-11-04 |
| Transbank Webpay | [Official site](https://www.transbank.cl/) | gateway | Latin America; Chile | Local online merchant payments candidate; official page blocked. | Wix | check again | Not confirmed; attempted 2026-11-04 |
| Getnet Chile | [Official site](https://www.getnet.cl/) | gateway | Latin America; Chile | Online checkout, links and recurring products; other Getnet markets need separate terms. | Known-name lead | active | 2026-11-04 |
| Rebill | [Official site](https://www.rebill.com/) | billing | Latin America; Argentina origin, Americas | Regional collections with recurring billing and local methods. | Vendor regional guide | active | 2026-11-04 |
| Mobbex | [Official site](https://www.mobbex.com/) | gateway | Latin America; Argentina | Online checkout, links and subscriptions. | Known-name lead | active | 2026-11-04 |
| Payway Argentina | [Official site](https://www.payway.com.ar/) | gateway | Latin America; Argentina | Local merchant payment candidate; official page timed out. | Known-name lead | check again | Not confirmed; attempted 2026-11-04 |
| Culqi | [Official site](https://culqi.com/) | gateway | Latin America; Peru | Online checkout and payment links. | Known-name lead | active | 2026-11-04 |
| Izipay | [Official site](https://www.izipay.pe/) | gateway | Latin America; Peru | Online merchant candidate; official page blocked. | Wix | check again | Not confirmed; attempted 2026-11-04 |
| Niubiz | [Official site](https://www.niubiz.com.pe/) | gateway | Latin America; Peru | Online merchant candidate; official page returned no readable text. | Known-name lead | check again | Not confirmed; attempted 2026-11-04 |
| Placetopay (Evertec) | [Official site](https://www.placetopay.com/) | gateway | Latin America; Colombia/Ecuador origin | Regional checkout candidate; official page timed out. | Known-name lead | check again | Not confirmed; attempted 2026-11-04 |
| PayPhone | [Official site](https://payphone.app/) | payment link | Latin America; Ecuador | Small-seller online and link-based payment collection. Note: Express Checkout sunsets on 2027-01-01; the company and replacement Cajita service remain active (checked 2026-11-06). | Known-name lead | active | 2026-11-04 |
| Tilopay | [Official site](https://tilopay.com/) | gateway | Latin America; Central America and Caribbean | Payment links, platform connections and subscriptions. | Wix | active | 2026-11-04 |
| PagueloFacil | [Official site](https://www.paguelofacil.com/) | gateway | Latin America; Panama | Local online merchant collections. | Known-name lead | active | 2026-11-04 |
| Pagopar by upay | [Official site](https://upay.com.py/pagopar/) | gateway | Latin America; Paraguay | Current Pagopar destination; online and recurring collections. | Wix | active | 2026-11-04 |
| AZUL | [Official site](https://www.azul.com.do/) | gateway | Latin America; Dominican Republic | Online links, hosted page and recurring payments. | Known-name lead | active | 2026-11-04 |
| SumUp | [Official site](https://www.sumup.com/) | gateway | Europe; also Americas | Small-business payment provider; online product must be checked by market. | Wix | gray | 2026-11-04 |
| myPOS | [Official site](https://www.mypos.com/) | gateway | Europe; UK and European markets | Small-business payment service with online products. | Review-directory lead | active | 2026-11-04 |
| Revolut Business merchant payments | [Official site](https://www.revolut.com/business/accept-payments/) | gateway | Europe; UK origin, other markets | Dedicated merchant acceptance attached to business banking. | Review-directory lead | active | 2026-11-04 |
| Payplug | [Official site](https://www.payplug.com/) | gateway | Europe; France origin | Online merchant payments and public signup. | Official pricing search | active | 2026-11-04 |
| MultiSafepay | [Official site](https://www.multisafepay.com/) | gateway | Europe; Netherlands origin | Online checkout and ecommerce connections. | Known-name lead | active | 2026-11-04 |
| Buckaroo | [Official site](https://www.buckaroo.eu/) | gateway | Europe; Netherlands origin | Online merchant methods and direct debit. | Known-name lead | active | 2026-11-04 |
| Pay. (pay.nl) | [Official site](https://www.pay.nl/) | gateway | Europe; Netherlands origin | Online merchant checkout and local methods. | Known-name lead | active | 2026-11-04 |
| Montonio | [Official site](https://www.montonio.com/) | gateway | Europe; Baltics, Poland and Finland | Online checkout with local bank and card options. | Known-name lead | active | 2026-11-04 |
| Przelewy24 | [Official site](https://www.przelewy24.pl/) | gateway | Europe; Poland | Local online merchant payment gateway. | PP | active | 2026-11-04 |
| Tpay | [Official site](https://tpay.com/) | gateway | Europe; Poland | Online cards, bank methods and recurring collections. | Known-name lead | active | 2026-11-04 |
| GoPay | [Official site](https://www.gopay.com/en/) | gateway | Europe; Czech Republic and Slovakia | Local online merchant gateway; distinct from Indonesian GoPay wallet. | Known-name lead | active | 2026-11-04 |
| Comgate | [Official site](https://www.comgate.eu/cs) | gateway | Europe; Czech Republic and Slovakia | Local online gateway with public plans. | Known-name lead | active | 2026-11-04 |
| Barion | [Official site](https://www.barion.com/en/) | gateway | Europe; Hungary and Central Europe | Online merchant acceptance candidate; exact regional contract needs checking. | Known-name lead | gray | 2026-11-04 |
| NETOPIA Payments | [Official site](https://netopia-payments.com/) | gateway | Europe; Romania | Online card checkout, links and recurring payments. | Known-name lead | active | 2026-11-04 |
| iyzico | [Official site](https://www.iyzico.com/) | gateway | Europe; Turkey | Local checkout, payment links and subscriptions. | Payhip gateway list | active | 2026-11-04 |
| PayTR | [Official site](https://www.paytr.com/) | gateway | Europe; Turkey | Local online merchant checkout and recurring payments. | Known-name lead | active | 2026-11-04 |
| WayForPay | [Official site](https://wayforpay.com/uk) | gateway | Europe; Ukraine | Online collections, payment buttons and subscriptions. | Known-name lead | active | 2026-11-04 |
| LiqPay | [Official site](https://www.liqpay.ua/) | gateway | Europe; Ukraine | Online merchant collection tools. | Known-name lead | active | 2026-11-04 |
| Fondy | [Official site](https://fondy.eu/en-pl/) | gateway | Europe; country-specific offers | Online checkout, links and recurring collections; inspect legal entities separately. | Known-name lead | gray | 2026-11-04 |
| Novalnet | [Official site](https://www.novalnet.com/) | gateway | Europe; Germany origin | Online checkout and ecommerce integrations. | Community | active | 2026-11-04 |
| Nexi | [Official site](https://www.nexi.it/it) | gateway | Europe; Italy origin | Small-merchant online payments; country-specific offer needed. | Known-name lead | gray | 2026-11-04 |
| Elavon online payments | [Official site](https://www.elavon.co.uk/) | gateway | Europe; UK, Ireland and other markets | Current destination for Opayo leads; online merchant contract needed. | Review guide | active | 2026-11-04 |
| takepayments | [Official site](https://www.takepayments.com/) | gateway | Europe; UK | Online gateway and payment links for small businesses. | Known-name lead | active | 2026-11-04 |
| PAYCOMET | [Official site](https://www.paycomet.com/) | gateway | Europe; Spain | Online gateway and pay-by-link tools. | Known-name lead | active | 2026-11-04 |
| MONEI | [Official site](https://monei.com/) | gateway | Europe; Spain and Andorra focus | Online checkout, local methods and recurring payments. | Wix | active | 2026-11-04 |
| Payrexx | [Official site](https://www.payrexx.com/en/) | gateway | Europe; Switzerland, other European offers | Dedicated small-business payment acceptance. | Known-name lead | active | 2026-11-04 |
| Chargebee | [Official site](https://www.chargebee.com/) | billing | Global; India/US origin | Billing that routes collections through payment gateways. | GH, G2 | active | 2026-11-04 |
| Recurly | [Official site](https://recurly.com/) | billing | Global; US origin | Subscription collections; current minimum billing requirements need checking. | GH, G2 | gray | 2026-11-04 |
| Zoho Billing | [Official site](https://www.zoho.com/billing/) | billing | Global; India origin | Subscription billing and connected payment collection. | G2 | active | 2026-11-04 |
| Pabbly Subscription Billing | [Official site](https://www.pabbly.com/subscriptions/) | billing | Global; India origin | One-time and recurring payments through connected gateways. | Known-name lead | active | 2026-11-04 |
| Frisbii | [Official site](https://frisbii.com/) | billing | Europe | Billing and gateway offer; current successor to Billwerk+ family. | Community | active | 2026-11-04 |
| ChargeOver | [Official site](https://chargeover.com/) | billing | North America; US origin | Recurring billing with payment collection connections. | Known-name lead | active | 2026-11-04 |
| PayKickstart | [Official site](https://paykickstart.com/) | billing | Global; US origin | Subscription checkout and payment-provider connections. Note: The signup translation still lists Launch at 6% of revenue; other plan cards load in-app, so prices and revenue caps need browser review (checked 2026-11-07). | Known-name lead | active | 2026-11-04 |
| PayWhirl | [Official site](https://paywhirl.com/) | billing | Global; US origin | Recurring checkout across websites and commerce platforms. | Official Subbly comparison links | active | 2026-11-04 |
| MoonClerk | [Official site](https://www.moonclerk.com/) | payment link | Global; US origin | One-time and recurring payment forms powered by Stripe. | Official Subbly comparison links | active | 2026-11-04 |
| Checkout Page | [Official site](https://checkoutpage.com/) | payment link | Global | Hosted and embedded checkout links; digital-store overlap needs decision. | Known-name lead | gray | 2026-11-04 |
| PayRequest | [Official site](https://payrequest.io/) | payment link | Global; Netherlands origin | Payment requests and hosted payment pages. | Exact-problem search | active | 2026-11-04 |
| BitPay | [Official site](https://www.bitpay.com/business) | crypto | Global; US origin | Merchant crypto acceptance with bank settlement offer. | Crypto comparison | active | 2026-11-04 |
| CoinGate | [Official site](https://coingate.com/) | crypto | Global; Lithuania origin | Crypto checkout, invoices and ecommerce plugins. | Crypto comparison | active | 2026-11-04 |
| NOWPayments | [Official site](https://nowpayments.io/) | crypto | Global | Crypto checkout and integrations, including SaaS use cases. | Crypto comparison, community | active | 2026-11-04 |
| CoinPayments | [Official site](https://www.coinpayments.net/) | crypto | Global | Crypto merchant acceptance; separate new and legacy platform terms. | Crypto comparison | active | 2026-11-04 |
| BTCPay Server | [Official site](https://btcpayserver.org/) | crypto | Global; self-hosted software | Run your own Bitcoin checkout; hosting and maintenance remain yours. | Crypto comparison | active | 2026-11-04 |
| OpenNode | [Official site](https://opennode.com/) | crypto | Global; US origin | Bitcoin online checkout and settlement tools. | Crypto comparison | active | 2026-11-04 |
| Triple-A | [Official site](https://www.triple-a.io/) | crypto | Global; Singapore origin | Merchant crypto acceptance; current enterprise focus makes solo fit unclear. | Crypto comparison, Wix | gray | 2026-11-04 |
| Plisio | [Official site](https://plisio.net/) | crypto | Global | Crypto gateway with invoices and website integrations. Note: The legal operator, custody and KYC claims remain unresolved; the linked UK PLISIO Ltd. was dissolved on 2021-06-29 (checked 2026-11-07). | Crypto comparison | active | 2026-11-04 |
| Confirmo | [Official site](https://confirmo.com/) | crypto | Global; Europe origin | Crypto checkout and recurring stablecoin offer; solo access needs checking. | PP, crypto comparison | gray | 2026-11-04 |
| DePay | [Official site](https://www.depay.com/) | crypto | Global; Europe origin | Wallet-based online crypto payment integration. | PP | active | 2026-11-04 |
| Coinbase Business | [Official site](https://www.coinbase.com/business) | crypto | Global; US and Singapore entity focus | Successor for eligible Coinbase Commerce merchants; check current expansion. | Official transition notice | active | 2026-11-04 |
| Crypto.com Pay | [Official site](https://crypto.com/pay-merchant) | crypto | Global | Dedicated crypto merchant checkout signup. | Known-name lead | active | 2026-11-04 |
| Coinremitter | [Official site](https://coinremitter.com/) | crypto | Global | Crypto merchant invoices, payment pages and plugins. | Crypto comparison | active | 2026-11-04 |
| CryptAPI | [Official site](https://cryptapi.io/) | crypto | Global | Crypto acceptance forwarded to seller wallets. | Crypto comparison | active | 2026-11-04 |
| Lago | [Official site](https://getlago.com/) | billing | Global; Europe origin | Billing with connected collections; self-hosted option may suit technical solo founders. | Known-name lead | gray | 2026-11-04 |
| Autumn | [Official site](https://useautumn.com/) | billing | Global | Usage billing for startups; confirm connected payment providers in later research. | Known-name lead | gray | 2026-11-04 |
| Rebilly | [Official site](https://www.rebilly.com/) | billing | Global | Subscription billing and payment routing; confirm minimum costs. | Known-name lead | gray | 2026-11-04 |
| CCBill | [Official site](https://ccbill.com/) | gateway | Global; US origin | Online subscription and digital-content payments; exact seller role needs contract check. | PP | gray | 2026-11-04 |
| Verotel | [Official site](https://www.verotel.com/en/index.html) | gateway | Europe; Netherlands origin, international customers | Digital-content payment acceptance; specialist industries and seller role need checking. | Review-directory lead | gray | 2026-11-04 |
| Amazon Pay | [Official site](https://pay.amazon.com/) | gateway | Global; US origin | Checkout on independent shops, with a small-business merchant offer. | PP | active | 2026-11-04 |
| Shopify Payments | [Official site](https://www.shopify.com/payments) | gateway | Global; Canada origin | Built-in payment service for Shopify shops; requires Shopify. | Known-name lead | active | 2026-11-04 |
| Wix Payments | [Official site](https://www.wix.com/payments) | gateway | Global | Built-in payment service for Wix sellers; requires Wix. | Wix | active | 2026-11-04 |
| WooPayments | [Official site](https://woocommerce.com/payments/) | gateway | Global | Payment service for WooCommerce shops; requires WooCommerce. | Known-name lead | active | 2026-11-04 |
| Oceanpayment | [Official site](https://www.oceanpayment.com/) | gateway | East Asia; China/Hong Kong, cross-border sales | Online acquiring offer; direct solo-seller contract and minimums need checking. | Known-name lead, regional search | gray | 2026-11-04 |
| UseePay | [Official site](https://www.useepay.com/) | gateway | East Asia; China/Hong Kong, cross-border sales | Online merchant acceptance; direct solo-seller terms need checking. | Known-name lead, regional search | gray | 2026-11-04 |
| Quickpay | [Official site](https://quickpay.net/) | gateway | Europe; Denmark and Nordic markets | Online merchant gateway with public signup and pricing. | Known-name lead, regional search | active | 2026-11-04 |
| pensopay | [Official site](https://pensopay.com/da/) | gateway | Europe; Denmark | Online merchant gateway for webshops. | Known-name lead, regional search | active | 2026-11-04 |
| Paytrail | [Official site](https://www.paytrail.com/) | gateway | Europe; Finland | Online merchant payments with local bank and card methods. | Official regional guide | active | 2026-11-04 |
| Vipps MobilePay | [Official site](https://developer.vippsmobilepay.com/) | other | Europe; Nordic markets | Direct online wallet payments and recurring collection; official developer docs verified. | Regional search | active | 2026-11-04 |
| CMI | [Official site](https://www.cmi.co.ma/) | gateway | Middle East and North Africa; Morocco | Official site has ecommerce offer; current new-merchant access needs checking amid community questions. | Regional guide, community | gray | 2026-11-04 |
| NAPS | [Official site](https://naps.ma/) | gateway | Middle East and North Africa; Morocco | Dedicated online merchant acceptance offer. | Regional guide | active | 2026-11-04 |
| Payzone Morocco | [Official site](https://payzone.ma/) | gateway | Middle East and North Africa; Morocco | Local ecommerce payment gateway; distinct from same-name products elsewhere. | Regional guide | active | 2026-11-04 |
| WiPay | [Official site](https://wipaycaribbean.com/solutions) | gateway | Latin America; Caribbean markets | Small-merchant checkout lead; official search result found but opened page had no readable text. | Regional guide | check again | Not confirmed; attempted 2026-11-04 |
| Powertranz | [Official site](https://powertranz.com/) | gateway | Latin America; Caribbean and Central America | Hosted checkout and recurring merchant payments; bank contract and small-seller path need checking. | Regional guide; First Atlantic Commerce redirect | gray | 2026-11-04 |
| Alipay direct merchant acceptance | [Official site](https://global.alipay.com/developer/helpcenter/detail?_route=sg&categoryId=67618&knowId=201602452344&sceneCode=AC_DEV) | other | East Asia; China, cross-border merchant offers | Official production gateway documentation exists; current direct signup versus partner access needs checking. | Regional search, official docs | gray | 2026-11-04 |
| Weixin Pay / WeChat Pay merchant acceptance | [Official site](https://pay.weixin.qq.com/) | other | East Asia; China, cross-border merchant offers | Direct merchant wallet candidate; official portal could not be opened. | Regional search | check again | Not confirmed; attempted 2026-11-04 |

## Counts for this discovery pass

These include gray and check-again leads. They are not a count of launch-ready listings.

| Type | Candidates |
| --- | ---: |
| merchant of record | 14 |
| gateway | 180 |
| payment link | 8 |
| other | 8 |
| billing | 14 |
| crypto | 14 |

| Market grouping | Candidates |
| --- | ---: |
| Global | 58 |
| North America | 10 |
| Europe | 34 |
| South Asia | 21 |
| Oceania | 5 |
| Southeast Asia | 22 |
| East Asia | 16 |
| Africa | 22 |
| Middle East and North Africa | 20 |
| Latin America | 32 |

Built-in Stripe Payment Links and Stripe Billing are features under Stripe, not extra provider rows. Stripe Managed Payments has a separate row because its legal seller model differs. Parent ownership alone does not remove a product with its own merchant offer. PayU India and PayU Latin America stay separate because their regional offers need separate research.

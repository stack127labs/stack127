# Launch directories research: app stores and integration catalogs

Checked: 2026-09-29
Scope: all 16 candidates in category 7 of `plan.md`.

## Method

Include a card only when the official submission path, cost, review information, eligibility, and a live public example can be described accurately. The link type below is from the example listing named in that row. A link with only `noopener` or `noreferrer` is still a follow link; those tokens do not prevent search engines from following it. “No maker website link in sample” means the inspected product page did not show an external link to the maker’s website. A sample is not a promise about every listing.

## Card-ready records

### Chrome Web Store

| Card field | Value |
| --- | --- |
| Best for | Browser extensions made for Chrome. |
| Cost | $5 one-time developer registration fee. |
| Review time | Usually a few days; it can take a few weeks. Google reported longer queues in August 2026. |
| Link type | UGC + nofollow in the Bitwarden sample (`rel="ugc nofollow"`). |
| Eligibility | A Chrome extension that follows Chrome Web Store policies; a registered developer account is required. |
| Submit here | [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole) |
| Example | [Bitwarden Password Manager](https://chromewebstore.google.com/detail/bitwarden-password-manager/nngceckbapebfimnlniiiahkandclblb) |

Evidence: [developer registration](https://developer.chrome.com/docs/webstore/register), [review process](https://developer.chrome.com/docs/webstore/review-process), [August 2026 queue update](https://developer.chrome.com/blog/cws-review-updates-2026), and the sampled [Bitwarden listing](https://chromewebstore.google.com/detail/bitwarden-password-manager/nngceckbapebfimnlniiiahkandclblb). The example’s Website link points to `https://bitwarden.com/` and its rel tokens were read from the listing HTML.

### Firefox Add-ons

| Card field | Value |
| --- | --- |
| Best for | Browser add-ons made for Firefox. |
| Cost | Free to register and submit. |
| Review time | Automated checks can take seconds; Mozilla can also run a manual review after publication. |
| Link type | Nofollow in the uBlock Origin sample (`rel="nofollow"` on the homepage link). |
| Eligibility | A Firefox add-on that passes AMO signing and review requirements. |
| Submit here | [Firefox Add-ons developer hub](https://addons.mozilla.org/developers/) |
| Example | [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/) |

Evidence: Mozilla’s [publishing comparison](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension), [review overview](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/What_next), and the sampled [uBlock Origin listing](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/). Its Homepage link routes through Mozilla’s GitHub redirect and carries `nofollow`.

### Apple App Store

| Card field | Value |
| --- | --- |
| Best for | Apps for iPhone, iPad, Mac, Apple Watch, Apple TV, or Apple Vision Pro. |
| Cost | Apple Developer Program membership is $99 per year; eligible nonprofits, schools, and government groups can request a waiver. |
| Review time | Apple says 90% of submissions are reviewed within 24 hours on average. |
| Link type | Nofollow in the Notion sample (`rel="nofollow noopener noreferrer"`). |
| Eligibility | An Apple-platform app and an enrolled Apple Developer Program account; organizations need a D-U-N-S number. |
| Submit here | [Enroll in the Apple Developer Program](https://developer.apple.com/programs/enroll/) |
| Example | [Notion](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281) |

Evidence: [membership and enrollment rules](https://developer.apple.com/programs/enroll/), [App Review timing](https://developer.apple.com/app-store/review/), and the sampled [Notion App Store page](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281). The Developer Website link points to Notion’s site and carries the listed rel tokens.

### Google Play

| Card field | Value |
| --- | --- |
| Best for | Android apps. |
| Cost | $25 one-time Play Console registration fee. |
| Review time | Often faster, but allow up to 7 days; some reviews take longer. |
| Link type | Follow link in the Notion sample (the Website link has no `nofollow`, `ugc`, or `sponsored` rel token). |
| Eligibility | An Android app and a verified Play Console developer account. New personal accounts created after November 13, 2023 must first complete a 14-day closed test with at least 12 testers before requesting production access. |
| Submit here | [Create a Play Console developer account](https://play.google.com/console/signup) |
| Example | [Notion](https://play.google.com/store/apps/details?id=notion.id) |

Evidence: Google’s [developer account requirements and fee](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en), [review timing](https://support.google.com/googleplay/android-developer/answer/9859751?hl=en), [new personal-account testing rule](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en), and the sampled [Notion Play listing](https://play.google.com/store/apps/details?id=notion.id). The Website link points to `notion.so/mobile`; its anchor has no qualified rel token.

### Shopify App Store

| Card field | Value |
| --- | --- |
| Best for | Public apps that work with Shopify stores. |
| Cost | $19 one-time App Store registration per Partner account. Eligible developers keep the first $1 million in lifetime app revenue and pay a 15% share above that; Shopify also charges 2.9% processing and applicable tax. |
| Review time | No fixed review time is published. |
| Link type | Follow link in the Klaviyo sample (the Website link has no `nofollow`, `ugc`, or `sponsored` rel token). |
| Eligibility | A working Shopify app that meets Shopify’s public-app, security, and review requirements. New public apps use Shopify’s billing system. |
| Submit here | [Shopify App Store review guide](https://shopify.dev/docs/apps/launch/app-store-review) |
| Example | [Klaviyo](https://apps.shopify.com/klaviyo-email-marketing) |

Evidence: Shopify’s [registration and revenue share](https://shopify.dev/docs/apps/launch/distribution/revenue-share), [app review process](https://shopify.dev/docs/apps/launch/app-store-review/review-process), and sampled [Klaviyo listing](https://apps.shopify.com/klaviyo-email-marketing). The sample Website link points to Klaviyo developer documentation and has only `noopener noreferrer` rel tokens.

### WordPress Plugin Directory

| Card field | Value |
| --- | --- |
| Best for | Free, WordPress-compatible plugins. |
| Cost | Free. |
| Review time | The review team aims to review the code within 14 days of the initial review; fixes can add time. |
| Link type | UGC + nofollow in the WooCommerce sample (`rel="nofollow ugc"`). |
| Eligibility | A complete plugin ZIP that follows WordPress.org rules, including its licensing requirements; a WordPress.org account is required. |
| Submit here | [Add a plugin](https://wordpress.org/plugins/developers/add/) |
| Example | [WooCommerce](https://wordpress.org/plugins/woocommerce/) |

Evidence: the official [submission guide](https://developer.wordpress.org/plugins/wordpress-org/planning-submitting-and-maintaining-plugins/), [plugin review FAQ updated September 1, 2026](https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/), and sampled [WooCommerce plugin page](https://wordpress.org/plugins/woocommerce/). The WooCommerce website link points to `woocommerce.com` and has `nofollow ugc` rel tokens.

### Zapier App Directory

| Card field | Value |
| --- | --- |
| Best for | Products that need to connect with Zapier workflows. |
| Cost | Zapier’s developer platform is free to use. |
| Review time | No public review estimate. |
| Link type | No maker website link on the sampled Slack integration page. |
| Eligibility | The product needs a REST or XML-RPC API. To appear in the public directory, its developer must officially support the integration. |
| Submit here | [Zapier Developer Platform](https://developer.zapier.com/) |
| Example | [Slack on Zapier](https://zapier.com/apps/slack/integrations) |

Evidence: Zapier’s [official guide to requesting an app](https://help.zapier.com/hc/en-us/articles/8496275663501-Request-to-add-a-new-app-to-Zapier), its [developer platform](https://zapier.com/developer-platform/integrations), and sampled [Slack integration page](https://zapier.com/apps/slack/integrations). No external maker website anchor appears on the sampled page; this is recorded as no maker link, not as nofollow.

### Slack Marketplace

| Card field | Value |
| --- | --- |
| Best for | Apps that add a useful, supported service to Slack. |
| Cost | Free to submit. |
| Review time | Up to 1 week for the preliminary review, then up to 7 weeks for the functional review; fixes and resubmission can add time. |
| Link type | No maker website link on the sampled GitHub app listing. |
| Eligibility | A complete, tested app installed on at least 10 active workspaces; workflow automation products are not currently eligible for the Marketplace. |
| Submit here | [Slack app dashboard](https://api.slack.com/apps) |
| Example | [GitHub on Slack](https://slack.com/marketplace/A0F81R7U7-github) |

Evidence: Slack’s [Marketplace review guide](https://api.slack.com/slack-marketplace/review-guide) and [current 10-workspace requirement](https://docs.slack.dev/changelog/2026/09/01/slack-marketplace-install-requirement/), plus sampled [GitHub app listing](https://slack.com/marketplace/A0F81R7U7-github). No maker website link is shown on that sample.

### Atlassian Marketplace

| Card field | Value |
| --- | --- |
| Best for | Apps and integrations for Jira, Confluence, Bitbucket, and other Atlassian products. |
| Cost | Free apps can be listed; developers set a price for paid apps. |
| Review time | Atlassian usually starts review within 5–10 business days; security issues can extend the process. |
| Link type | No vendor website link on the sampled Jira Cloud for Slack listing. |
| Eligibility | An app compatible with an Atlassian product. New apps go through partner verification and security review. |
| Submit here | [Create an Atlassian Marketplace listing](https://developer.atlassian.com/platform/marketplace/creating-a-marketplace-listing/) |
| Example | [Jira Cloud for Slack](https://marketplace.atlassian.com/apps/1216863/jira-cloud-for-slack-official?tab=overview) |

Evidence: Atlassian’s [listing and review steps](https://developer.atlassian.com/platform/marketplace/creating-a-marketplace-listing/), [app payment models](https://developer.atlassian.com/platform/marketplace/pricing-payment-and-billing/), [current app approval security workflow](https://developer.atlassian.com/platform/marketplace/app-approval-security-workflow/), and sampled [Jira Cloud for Slack listing](https://marketplace.atlassian.com/apps/1216863/jira-cloud-for-slack-official?tab=overview). The sampled listing is Atlassian’s own app and shows no vendor website link.

### Notion Integrations

| Card field | Value |
| --- | --- |
| Best for | Public integrations that connect other products with Notion. |
| Cost | No separate Marketplace listing fee is shown in Notion’s developer listing steps; the maker sets any price for its own product. |
| Review time | Notion says to expect a reply within 5–10 business days. |
| Link type | Follow link in the Panorama sample (the Website link has no `nofollow`, `ugc`, or `sponsored` rel token). |
| Eligibility | A public Notion connection available to any workspace, with a completed Marketplace listing. Selected-workspace and internal connections cannot be listed. |
| Submit here | [Notion Marketplace listing guide](https://developers.notion.com/guides/get-started/marketplace-listing) |
| Example | [Panorama](https://www.notion.com/connections/panorama) |

Evidence: Notion’s [Marketplace listing instructions and timeline](https://developers.notion.com/guides/get-started/marketplace-listing) and sampled [Panorama listing](https://www.notion.com/connections/panorama). The Website link points to `https://withpanorama.com/` and has no qualified rel token. The free-listing wording reflects that Notion’s submission steps provide no Marketplace fee; it does not mean the listed integration itself must be free.

### Webflow Apps

| Card field | Value |
| --- | --- |
| Best for | Apps that extend Webflow sites or the Webflow Designer. |
| Cost | No submission fee is listed. Webflow offers a free Developer Workspace; app creation also requires a supported Team or Enterprise Workspace plan. |
| Review time | Webflow aims to decide within 10–15 business days. |
| Link type | Follow link in the Finsweet sample (the Website link has no `nofollow`, `ugc`, or `sponsored` rel token). |
| Eligibility | A production-ready app, a Workspace admin with two-factor authentication, review assets, and any required test access. App creation requires a Team or Enterprise plan. |
| Submit here | [Submit a Webflow app](https://developers.webflow.com/submit) |
| Example | [Finsweet Extension](https://webflow.com/apps/detail/finsweet-extension) |

Evidence: Webflow’s [Marketplace guidelines](https://developers.webflow.com/apps/docs/marketplace-guidelines), [submission form](https://developers.webflow.com/submit), [Developer Workspace](https://developers.webflow.com/apps/data/docs/register-an-app), and sampled [Finsweet Extension listing](https://webflow.com/apps/detail/finsweet-extension). Its View Website link points to `https://finsweet.com/extension` and has only `noopener noreferrer` rel tokens.

## Candidates held from the public directory

| Candidate | Findings | Decision |
| --- | --- | --- |
| Microsoft Edge Add-ons | Microsoft says registration is free. Its certification timeline is not given in the current official policy. The sampled uBlock Origin Lite page loaded, but its public HTML did not expose a verifiable maker website link or link policy. | **Hold** until the example’s product link can be inspected. |
| Microsoft AppSource (now Microsoft Marketplace) | Microsoft Marketplace is active and has a developer center. The sampled marketplace page was blocked by Microsoft’s Azure web application firewall in this check, so the outbound product link could not be verified. | **Hold** until a sample listing and its outbound link can be inspected. |
| Make Integrations | Make’s official docs require a public custom app to pass a review and meet distinct-service, API, and test requirements. The sampled Slack integration page returned a bot challenge, so its public listing link could not be inspected. | **Hold** until a live sample and its link can be verified. |
| Figma Community | Official docs cover plugin publishing and review, but the sampled Unsplash plugin page was client-rendered and the research reader did not expose its listing body or maker link. | **Hold** until the sample link can be verified. |
| JetBrains Marketplace | Official docs confirm Marketplace distribution and paid-plugin revenue sharing. The sampled GitToolBox listing did not expose its rendered product details or external link to the research reader. | **Hold** until the sample link can be inspected. |

Sources for held candidates: [Edge developer registration](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/create-dev-account), [Edge developer policies](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies), [Microsoft Marketplace publisher guide](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/marketplace-faq-publisher-guide), [Make review prerequisites](https://developers.make.com/custom-apps-documentation/app-review/prerequisites) and [review request](https://developers.make.com/custom-apps-documentation/app-review/request-app-review), [Figma plugin publishing](https://help.figma.com/hc/en-us/articles/360042293394-Publish-classic-plugins-to-the-Figma-Community), and [JetBrains plugin fees](https://plugins.jetbrains.com/docs/marketplace/revenue-sharing-and-fees.html). Webflow account plan requirements are in the official [app registration guide](https://developers.webflow.com/apps/data/docs/register-an-app).

## Coverage audit

At the initial review, 11 of 16 candidates were card-ready and 5 were held. The same-day follow-up moved Microsoft Edge Add-ons, Microsoft Marketplace, and JetBrains Marketplace to Include; Make Integrations and Figma Community plugins remain held. The final category totals are 14 includes and 2 holds. The candidate roster uses the current names **Microsoft Marketplace (formerly AppSource)** and **Slack Marketplace** (originally listed as Slack App Directory). No candidate is silently omitted.

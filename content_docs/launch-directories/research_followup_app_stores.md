# Launch directories research follow-up: app stores and integration catalogs

Checked: 2026-09-29 05:31 UTC

Scope: Recheck the five held candidates in [app stores and integration catalogs](research_app_stores.md). I used current first-party policies, help pages, submission forms, and sample listings.

## Link-check limits

The web reader showed visible page text and some link destinations, but not raw anchor HTML or `rel` tokens. Direct shell requests could not resolve external hosts in this environment. I do not label a link dofollow, nofollow, sponsored, or UGC without evidence. A visible maker URL or a redirect does not reveal its `rel` value.

## Decisions

| Candidate | Decision | Card-ready result |
| --- | --- | --- |
| Microsoft Edge Add-ons | Hold | Free developer registration and a review window of up to seven business days are now verified. The current uBlock Origin Lite listing could not be rendered beyond its footer, so its maker link and `rel` remain unverified. |
| Microsoft Marketplace (formerly AppSource) | Hold | No publish fee; Microsoft charges 3% on transact offers. Microsoft 365 app review guidance differs between official pages (four to six weeks versus up to four weeks). The Adobe sample page is live, but its details tab could not be fetched to inspect its maker link. Scope the eventual card to Microsoft 365 and Copilot apps if using that review estimate. |
| Make Integrations | Hold | The current Community App form accepts only official Make Partners with a signed agreement. It states there is no technical review and partners keep 100% of sales. A current Read community-app sample links to its maker’s site, but the HTML `rel` is unavailable; current review timing and any listing fee are not stated on the form. |
| Figma Community | Hold | For classic plugins, publishing works on any plan and requires a desktop app, two-factor authentication, and review. Figma takes 15% of sales through its payment platform; plugin approval time varies. The sample page is blocked by the reader’s robots rule, so its live status and link could not be rechecked. |
| JetBrains Marketplace | Hold | No listing or development fee; JetBrains takes 15% of Marketplace plugin sales. New plugins are reviewed, but JetBrains gives no guaranteed review time. GitToolBox remains in the official search result, but its listing body could not be rendered to inspect an external link. |

No candidate is excluded. Each is an active, relevant channel; the remaining hold is for the sample link evidence or fee/review detail described below. No priced advertising or sponsored-placement offer was found in the official pages reviewed. Do not treat sales commissions as advertising prices.

## Microsoft Edge Add-ons - Hold

- **What it is:** A store for extensions made for Microsoft Edge.
- **How to submit:** Register for the Microsoft Edge program in Partner Center, upload a working extension package, complete the store listing and privacy details, and submit it for certification. The registration guide says both individual and company accounts are supported.
- **Submission cost vs. ads:** Developer registration is free. I found no separate paid listing or advertising price in the current official publishing pages.
- **Review time:** Microsoft's current publishing guide says certification can take up to seven business days. Remote code may require extra review and can take longer.
- **Eligibility:** A developer account with a Microsoft account as its primary owner, a working extension, and compliance with the store's developer policies. The submission asks developers to explain permissions and disclose data practices.
- **Representative sample:** [uBlock Origin Lite](https://microsoftedge.microsoft.com/addons/detail/ublock-origin-lite/cimighlppcgcoapaliogpjjdehbnofhn) is still returned as an official Edge Add-ons listing.
- **Link treatment:** The web reader returned only Microsoft site navigation and footer text for this listing, not the listing details or any maker link. Raw HTML and `rel` could not be inspected. Do not label the link as follow or nofollow.
- **Decision reason:** Hold until the sample listing or another current Edge listing exposes the maker link and its HTML `rel`, or verifies that no maker website link is present.
- **Sources:** [Developer registration and fee](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account), [publishing and certification](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension), [developer policies](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies), [uBlock Origin Lite listing](https://microsoftedge.microsoft.com/addons/detail/ublock-origin-lite/cimighlppcgcoapaliogpjjdehbnofhn).

## Microsoft Marketplace (formerly AppSource) - Hold

- **What it is:** Microsoft's marketplace for cloud offers, apps, and agents. AppSource is now part of Microsoft Marketplace. Its offer types have different technical and review rules, so a general card should not promise one review time for every kind of offer.
- **Recommended scope:** For this catalogue, use the Microsoft 365 and Copilot apps and agents program as the card's focus. It has a defined Partner Center submission guide and review estimate. Keep Azure SaaS and other marketplace offer types out of that card unless they are researched separately.
- **How to submit:** Create or enroll a publisher account in Partner Center, accept the Microsoft Partner and Publisher agreements, enroll in the Microsoft 365 and Copilot program, then create and submit the appropriate offer for review.
- **Submission cost vs. ads:** Microsoft says there is no fee to publish. It charges a 3% store service fee when customers buy a transact offer through Microsoft Marketplace. I found no priced ad or sponsored-placement offer in the publisher pages checked.
- **Review time:** The [step-by-step guide](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/add-in-submission-guide) says a submission typically takes four to six weeks and often needs multiple submissions. The [Microsoft 365 checklist](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/checklist) says review can take up to four weeks from first submission to approval. Keep the difference visible; do not turn either statement into a guarantee.
- **Eligibility:** A Microsoft publisher account and accepted agreements are required. Microsoft 365 apps also require enrollment in the Microsoft 365 and Copilot program and must meet the relevant app policies and certification checks. Requirements vary by offer type.
- **Representative sample:** [Adobe Acrobat for Microsoft Teams, Outlook, and Copilot](https://marketplace.microsoft.com/en-us/product/office/WA200002564?embedHost=dynamics-365&tab=DetailsAndSupport) is a current public listing. The reader showed its title, publisher, ratings, and listing tabs. Opening the details tab returned a cache miss, so its maker website destination and link treatment could not be checked.
- **Link treatment:** Unknown for the sample. The listing's details and support content did not load, and no raw sample HTML was available.
- **Decision reason:** Hold until a current sample's maker link and `rel` can be inspected. Narrow the eventual card to Microsoft 365 and Copilot apps to keep eligibility, cost, and timing useful.
- **Sources:** [Marketplace publisher FAQ and fees](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/marketplace-faq-publisher-guide), [Partner Center enrollment](https://learn.microsoft.com/en-us/partner-center/account-settings/create-account), [Microsoft 365 submission guide](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/add-in-submission-guide), [Microsoft 365 checklist](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/checklist), [Adobe sample listing](https://marketplace.microsoft.com/en-us/product/office/WA200002564?embedHost=dynamics-365&tab=DetailsAndSupport).

## Make Integrations - Hold

- **What it is:** A catalogue with both Make-verified integrations and partner-created Community Apps. The submission path depends on which type is being launched. The page currently shows more than 3,600 app listings and separate Verified Apps and Community Apps categories.
- **How to submit:** For a Community App, use Make's [submission form](https://f.make.com/submit-your-app). The form currently accepts only official Make Partners with a signed Partnership Agreement. Make's separate verified-app review process requires the app to connect to a service API, add value not already available in Make, follow code standards, and include working test scenarios.
- **Submission cost vs. ads:** The current Community App form does not state a listing fee. It says partners may monetize as they wish and keep 100% of revenue. Make does not handle billing for Community Apps, so makers charge customers directly. No paid advertising or placement price was found.
- **Review time:** The current Community App form says Make does not conduct a technical review before listing. It gives no current time estimate for the partner or business decision. An official partner FAQ marked as reflecting Make's thinking in July 2023 says business review generally took two to three business days, but that older estimate is not safe to present as current. Verified apps follow a separate review process.
- **Eligibility:** For Community Apps, the current form requires official Make Partner status and a signed agreement. Make's current help page says Community Apps are developed by partners and power users, do not go through its app review process, and are supported and monetized by the app developer. The older partner FAQ says an app should connect to a real third-party service not already included by default; confirm that criterion with Make before presenting it as current policy.
- **Representative sample:** [Read on Make](https://www.make.com/en/integrations/read) is marked Community and identifies Synergetic GmbH as its maker. The listing shows a partner link to [Synergetic's Read page](https://www.go-synergetic.com/apps/read), labels the app “3rd Party Payment,” and leaves billing to the partner. The web reader opened the same destination URL; it did not expose HTTP redirect headers.
- **Link treatment:** The maker website link is visible, but raw HTML `rel` tokens could not be obtained. Card-ready wording: **“Partner website link shown; `rel` not published or verifiable from the sample.”** Do not call it follow.
- **Decision reason:** This is a strong candidate, and the old Slack sample should be replaced because Make says Slack is maintained by Make. Keep the card held only until the Read sample's HTML `rel` can be checked and the current Community App review/fee terms are confirmed.
- **Sources:** [Current Make integrations catalogue](https://www.make.com/en/integrations), [Community App submission form](https://f.make.com/submit-your-app), [current Make app types](https://help.make.com/introduction-to-make-apps), [verified-app review prerequisites](https://developers.make.com/custom-apps-documentation/app-review/prerequisites), [older partner FAQ](https://developers.make.com/custom-apps-documentation/community-apps/how-does-it-work), [Read listing](https://www.make.com/en/integrations/read), [sample maker page](https://www.go-synergetic.com/apps/read).

## Figma Community plugins - Hold

- **What it is:** Figma Community includes several kinds of resources. This research covers classic plugins only, because the old sample was an Unsplash plugin. A card called simply “Figma Community” would imply that files, widgets, and other resources have the same submission and payment terms; they do not.
- **How to submit:** Build the plugin in the Figma desktop app, enable two-factor authentication, and submit it to Community from the desktop app. Figma reviews public plugins before listing them. Private organization plugins are not reviewed for public Community listing.
- **Submission cost vs. ads:** The publishing guide supports any Figma plan and does not list a separate submission fee; it does not explicitly confirm that every submission is free. Paid plugins have a minimum price of $2 USD. For sales through Figma's payment platform, Figma collects a flat 15% fee for transaction and operating costs. I found no paid placement price in the official publishing pages.
- **Review time:** Figma says approval times vary with review volume and team availability. The guide also says an optional security disclosure review may take up to two weeks; that is not a general plugin review estimate.
- **Eligibility:** A working classic plugin, the Figma desktop app, two-factor authentication, and approval after review. To sell a plugin, the creator also needs approval to sell and an activated Stripe account. Paid resources must be published from an approved individual account. Figma's current restriction on new paid creators applies to paid files, not plugins.
- **Representative sample:** The previous [Unsplash plugin listing](https://www.figma.com/community/plugin/738454987945972471/unsplash) is still the intended example. The web reader denied access under Figma's robots rule, so the current listing status, any external maker link, and raw `rel` could not be rechecked.
- **Link treatment:** Unknown. The blocked sample did not expose listing text or its outbound link.
- **Decision reason:** Keep this on hold until a current plugin sample can be opened and its link destination and `rel` checked. The eventual card should say **“Figma Community plugins”** unless research is expanded to the other resource types.
- **Sources:** [Plugin publishing and review](https://help.figma.com/hc/en-us/articles/360042293394-Publish-classic-plugins-to-the-Figma-Community), [selling Community resources and 15% fee](https://help.figma.com/hc/en-us/articles/12067637274519-About-selling-Community-resources), [plugin licensing](https://help.figma.com/hc/en-us/articles/360042296374-Figma-Community-copyright-and-licensing), [Unsplash sample](https://www.figma.com/community/plugin/738454987945972471/unsplash).

## JetBrains Marketplace - Hold

- **What it is:** A store for plugins that extend JetBrains IDEs and compatible products.
- **How to submit:** Sign in with a JetBrains account and upload a signed plugin package to the Marketplace. The first upload is manual; developers can also publish later versions through the Marketplace tools or Gradle.
- **Submission cost vs. ads:** JetBrains says there is no fee to develop or list a plugin. For plugins sold and licensed through Marketplace, it takes a 15% commission from each sale. No paid advertising or placement price was found. The fee is a sales commission, not an ad price.
- **Review time:** Every new plugin and version is reviewed. JetBrains does not guarantee a review time; its March 2026 guideline says to contact the team if there is no update after three to four working days. A separate two-business-day estimate in the release guide applies to its paid-plugin sales setup and should not be generalized to all plugin reviews.
- **Eligibility:** The plugin must work with at least one JetBrains product and meet Marketplace approval rules for security, privacy, compatibility, performance, naming, and listing content. Paid vendors also need a vendor profile and trader and banking details.
- **Representative sample:** [GitToolBox](https://plugins.jetbrains.com/plugin/7499-gittoolbox/versions) remains in JetBrains Marketplace search results; its indexed listing reports a 600.3 release dated July 5, 2026, and a freemium model. Opening the page returned only an iframe, so the rendered maker link and raw `rel` could not be checked.
- **Link treatment:** Unknown for the sample. Do not infer a follow or nofollow link from its presence in the Marketplace.
- **Decision reason:** Hold until a current listing page can be rendered to inspect whether it links to the maker and, if it does, to inspect the `rel` value.
- **Sources:** [Publishing a plugin](https://plugins.jetbrains.com/docs/intellij/publishing-plugin.html), [2026 approval guidelines](https://plugins.jetbrains.com/docs/marketplace/jetbrains-marketplace-approval-guidelines.html), [revenue share and listing fees](https://plugins.jetbrains.com/docs/marketplace/revenue-sharing-and-fees.html), [paid-plugin release instructions](https://plugins.jetbrains.com/docs/marketplace/release-plugin.html), [GitToolBox sample](https://plugins.jetbrains.com/plugin/7499-gittoolbox/versions).

## Follow-up summary

- **Include:** None yet.
- **Hold:** Microsoft Edge Add-ons, Microsoft Marketplace, Make Integrations, Figma Community plugins, and JetBrains Marketplace. Make is closest to ready: its current sample exposes a partner website destination and its submission route is live, but the sample `rel`, current review timing, and any listing fee remain unverified.
- **Exclude:** None. The evidence does not show that any of these services has closed or falls outside the launch-directory catalogue.
- The direct requests to the five sample sites failed DNS resolution in this environment. Where the web reader could access a listing, it showed rendered content or link destinations but never the raw external anchor attributes. No link type is inferred from a destination or a non-observed redirect.

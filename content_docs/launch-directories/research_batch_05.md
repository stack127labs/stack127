# Launch directories research batch 05

**Current decisions:** The [category 9 follow-up](research_followup_batch_05_category09.md) updates decisions for the six held specialist and regional candidates. The [app-store follow-up](research_followup_app_stores.md) records current findings for the five held app-store and integration candidates.

Checked: 2026-09-29
Scope: all 12 candidates in Category 9, “Regional and specialist leads,” and all 6 candidates in Category 10, “Adjacent launch communities, not directory cards,” from [the candidate inventory](plan.md). No app, database, or publishing changes were made.

## Results

| Category | Candidates | Include | Hold | Exclude |
| --- | ---: | ---: | ---: | ---: |
| 9. Regional and specialist leads | 12 | 0 | 6 | 6 |
| 10. Adjacent launch communities | 6 | 6 community-only | 0 | 0 |
| Total | 18 | 6 community-only | 6 | 6 |

None of the 12 Category 9 candidates has enough verified information for a public directory card. Six are relevant but lack a usable official submission path or at least one required fact; six are editorial, recruiting, event, inactive, or redirected destinations outside the page's primary listing scope.

All six Category 10 sites are useful places to publish a community post, but they do not give a maker a persistent product-directory page. Keep them clearly labeled as community posts. Indie Hackers also has a separate Products Database; that persistent-listing workflow is held until its terms and outbound link treatment can be verified.

### Follow-up: sample link markup

The [Show HN: Lofi Cities post](https://news.ycombinator.com/item?id=49886131) loaded successfully. Its product link points to GitHub and has `rel="nofollow"`; the card can report “Nofollow in the Lofi Cities sample.” This is one post, not a promise for all outbound links on Hacker News.

For the Indie Hackers and DEV Community samples, direct browser navigation timed out before their public post bodies could be inspected. Reddit's public pages loaded, but the maker-post body did not expose its product anchor in this browser; the legacy Reddit pages returned 403. Their sample link markup therefore remains unverified. The cards should state that product links are user-added, vary by post, and have no platform-wide rel guarantee. Do not substitute `UGC` as an HTML rel value unless it is directly observed on the sample.

## Category 9: regional and specialist leads

### NextBigWhat — Hold

- **Official site and submission route:** NextBigWhat has a current paid product-submission page at [submit.nextbigwhat.com](https://submit.nextbigwhat.com/), linked from its [main site](https://nextbigwhat.com/). After checkout, the maker gets a form for the product name, tagline, description, link, and image.
- **Cost:** Lite is $39 one time. Pro is $79 one time. The site says there is no subscription. Both plans include a permanent product page; Pro adds a longer promotional period. The site also states the discounted prices and crossed-out comparison prices shown are current page content, not recurring billing.
- **Review time:** It says a complete submission is published within 24 hours. It does not promise acceptance; the editorial team may edit unsupported promotional claims.
- **Eligibility:** The site positions this for makers, founders, startups, SaaS, AI, and emerging technology products. I found no detailed public acceptance checklist or product exclusions.
- **Published example:** The [official homepage](https://nextbigwhat.com/) currently shows product entries including AI Chatbot by Elfsight, dated September 27, 2026. Its detail URL, [AI Chatbot by Elfsight](https://nextbigwhat.com/ai-chatbot-by-elfsight/), was linked from the homepage but returned a cache miss to this reader.
- **Link type:** The submission page promises a direct link to the maker's product, but does not specify rel treatment. The sample page's HTML rel value could not be inspected.
- **Decision:** Hold. Price and expected timing are clear, but product eligibility and the link type are not. Do not convert “direct link” into a dofollow claim.
- **Evidence:** [Submission page](https://submit.nextbigwhat.com/), [main site and current sample titles](https://nextbigwhat.com/), [sample detail URL](https://nextbigwhat.com/ai-chatbot-by-elfsight/).

### StartupTalky — Exclude

- **Official site and route:** StartupTalky currently publishes startup news, founder stories, and business articles. Its official [contact page](https://startuptalky.com/contact/) directs PR agencies and freelancers to email story pitches. The [advertising page](https://startuptalky.com/advertise-with-us/) offers branded articles, banner ads, and lead-generation forms by contacting the publisher.
- **Cost and review time:** The pages do not publish a standard product-submission fee or editorial decision time. Advertising opportunities are quoted by contact; these are not product-directory listing plans.
- **Eligibility:** Story pitches go to the editorial team. The public pages checked do not offer an open product profile submission or define eligibility for one.
- **Published example:** Current startup news and stories appear on [StartupTalky's site](https://startuptalky.com/); they are editorial items, not persistent product-submission cards.
- **Link type:** There is no verified maker-submitted product listing to sample. A story or ad link is not a standard product-directory backlink.
- **Decision:** Exclude from the launch-directory catalog. It is an editorial and advertising outlet, not a product-submission directory. It could fit a future press or media resource list.
- **Evidence:** [Home](https://startuptalky.com/), [contact and story pitch instructions](https://startuptalky.com/contact/), [advertising options](https://startuptalky.com/advertise-with-us/).

### YourStory — Hold

- **Official site and submission route:** YourStory has a [Company Listing](https://yourstory.com/companies) described as a list of companies curated by YourStory Media, with a “List Your Company” link to a [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSetnejE9KBrZoqrnqR3Ts4Pd3e3N3MjB-honhmImL59HPu14Eg/viewform).
- **Cost:** The directory page does not show a company-listing price. The form returned an authorization error to this reader, so I could not verify any terms behind it.
- **Review time:** No public review estimate was visible on the directory page or the accessible form response.
- **Eligibility:** The directory says listings are curated, but does not provide a public checklist on the accessible page.
- **Published example:** [Niyo Solutions](https://yourstory.com/companies/niyo-solutions) is a public company profile with company details, categories, and a website link.
- **Link type:** The profile displays an external company website link, but neither an official rel policy nor the sample anchor's HTML rel value was available.
- **Decision:** Hold. This is a real persistent company database, so it may fit, but price, review time, submission criteria, and link treatment are not established. The form's failure is not evidence that the listing route is closed.
- **Evidence:** [Company listing and submit link](https://yourstory.com/companies), [sample company profile](https://yourstory.com/companies/niyo-solutions), [submission form](https://docs.google.com/forms/d/e/1FAIpQLSetnejE9KBrZoqrnqR3Ts4Pd3e3N3MjB-honhmImL59HPu14Eg/viewform).

### The Hub — Exclude

- **Official site and submission route:** The Hub offers Nordic startups a free employer profile and hiring tools through [For Startups](https://thehub.io/startups/join). The public [startup catalogue](https://thehub.io/startups/) is designed for candidates looking for startup jobs. Company profile guidance asks teams to describe their workplace, mission, culture, and benefits.
- **Cost:** The startup join page says profile setup is free and requires no credit card. Paid recruitment products and job posts are separate; the current [pricing route](https://thehub.io/pricing) did not expose usable prices in this check.
- **Review time:** The Hub says its Customer Success team reviews registered businesses, but gives no fixed turnaround on the join page.
- **Eligibility:** The Hub says it serves growth companies in Denmark, Sweden, Norway, Finland, and Iceland. A company needs a legally registered Nordic entity and a working website, and typically must meet at least three of its four startup criteria. Corporates, recruitment agencies, and external headhunters are excluded.
- **Published example:** The public startup catalogue includes [Too Good To Go](https://thehub.io/startups/too-good-to-go); the catalogue describes its product and shows job openings. The detail page timed out in this reader, so the browse page is the accessible sample.
- **Link type:** Employer profiles are not product listings. No standard product-link rel type applies, and no product backlink claim should be made.
- **Decision:** Exclude from this catalog. The Hub has persistent employer profiles, but their purpose is hiring and workplace discovery, not launching or finding products. The profile review and Nordic eligibility facts come from the official join page and [employer-profile guide](https://insights.thehub.io/how-to-nail-the-startup-employer-profile/).
- **Evidence:** [Join and eligibility](https://thehub.io/startups/join), [current startup catalogue](https://thehub.io/startups/), [pricing route](https://thehub.io/pricing), [employer profile guide](https://insights.thehub.io/how-to-nail-the-startup-employer-profile/).

### IndieExtensions — Hold

- **Official site and submission route:** The inventory points to [indieextensions.com](https://indieextensions.com/), but the official domain could not be opened through the available research reader. Searches for current first-party submission instructions and public listing examples did not establish a working official path.
- **Cost, review time, and eligibility:** No current first-party source could be checked to establish these terms.
- **Published example:** I could not verify a current official listing page.
- **Link type:** No sample page or official link policy was available, so the product-link rel treatment is unknown.
- **Decision:** Hold, not exclude. The site may be temporarily inaccessible; the failure does not establish that it is closed. Revisit when an official page or owner-confirmed route is accessible.
- **Evidence checked:** [Official domain](https://indieextensions.com/).

### ExtensionBoss — Hold

- **Official site and submission route:** The inventory points to [extensionboss.com](https://extensionboss.com/), but the official domain could not be opened through the available research reader. Searches for current first-party submission instructions and public listing examples did not establish a working official path.
- **Cost, review time, and eligibility:** No current first-party source could be checked to establish these terms.
- **Published example:** I could not verify a current official listing page.
- **Link type:** No sample page or official link policy was available, so the product-link rel treatment is unknown.
- **Decision:** Hold, not exclude. The access failure does not establish that the site is closed. Revisit when the official site or a first-party submission route can be verified.
- **Evidence checked:** [Official domain](https://extensionboss.com/).

### AEO Tools Space — Hold

- **Official site and identity:** The inventoried [aeotools.space](https://www.aeotools.space/) host does not yield a usable current directory page. The maker's [official homepage](https://www.mihirnaik.com/) still identifies AEOTools.Space as a curated directory and links its “Browse the directory” action to [aeotools.mihirnaik.com](https://aeotools.mihirnaik.com/). The new host returned a cache miss in this check. An older [privacy page](https://www.aeotools.space/privacy) describes tool submissions and directory processing, but it is not enough to prove the current host's terms.
- **Submission route, cost, review time, and eligibility:** The old privacy policy mentions tool submission and review for relevance to AI search visibility, but it gives no price or review duration. The current linked host could not be inspected for a live submission path or current policy.
- **Published example:** Older indexed sample URLs exist on the `.space` domain, but because the owner currently links to a different host, I did not treat a legacy entry as a verified current sample.
- **Link type:** No current listing page or official outbound rel policy was verified.
- **Decision:** Hold. The owner confirms the directory brand but points to a replacement host whose current terms and examples could not be checked. Do not silently treat the legacy `.space` pages as current.
- **Evidence:** [Owner's official homepage and directory link](https://www.mihirnaik.com/), [new linked host](https://aeotools.mihirnaik.com/), [legacy privacy and submission description](https://www.aeotools.space/privacy).

### Marketing Tools List — Exclude

- **Current official URL:** The inventoried [marketingtoolslist.com](https://marketingtoolslist.com/) currently redirects to [heroesforstudents.org](https://heroesforstudents.org/), whose page title and visible content promote unrelated online gambling and poker services.
- **Submission route, cost, timing, and eligibility:** No current marketing-tool submission route or terms were available at the redirected site.
- **Published example and link type:** No current marketing-tool listing sample exists at the current destination, so there is no product-listing link to inspect.
- **Decision:** Exclude from the current catalog. The inventoried domain no longer resolves to a marketing-tool directory. This records the current redirect and does not assert who changed it or why.
- **Evidence:** [Inventoried domain and redirect](https://marketingtoolslist.com/), [current redirect destination](https://heroesforstudents.org/).

### Sales Tools AI — Exclude

- **Current official URL:** [salestoolsai.top](https://salestoolsai.top/) currently displays the default “Welcome to nginx!” page rather than a product catalogue.
- **Submission route, cost, review time, and eligibility:** There is no usable product submission flow or current listing policy on the live page.
- **Published example and link type:** No current product listing was found, so no outbound product link can be checked.
- **Decision:** Exclude from the current catalog while the official domain is an unconfigured server page. Revisit if the directory is restored; this finding does not establish its past or future status.
- **Evidence:** [Current official page](https://salestoolsai.top/).

### Selljam — Hold

- **Official site and scope:** [Selljam](https://selljam.ai/) runs an AI tools catalogue for ecommerce sellers and other online business owners. The [tools index](https://selljam.ai/tools) and product detail pages are live.
- **Submission route:** I did not find a public tool-submission form or instructions on the homepage, tools index, or [terms page](https://selljam.ai/conditions). The official site gives no verified route to submit a listing.
- **Cost, review time, and eligibility:** Those pages do not publish maker submission prices, review timing, or criteria for accepting a new tool.
- **Published example:** [Anchor Browser](https://selljam.ai/tools/anchor-browser) is a live tool page with categories, a description, and a “View Website” link to the product.
- **Link type:** The public page exposes the product destination, but the HTML rel value was not available and there is no official link policy in the pages checked.
- **Decision:** Hold. The catalogue is relevant, but a Submit here action, listing terms, and product-link type cannot be stated accurately yet.
- **Evidence:** [Home](https://selljam.ai/), [tools index](https://selljam.ai/tools), [sample listing](https://selljam.ai/tools/anchor-browser), [terms](https://selljam.ai/conditions).

### EdTech Digest — Exclude

- **Official site and submission route:** [EdTech Digest](https://www.edtechdigest.com/) is an active education-technology publication with editorial categories such as Cool Tools, interviews, trends, and guest columns. Its [editorial calendar](https://www.edtechdigest.com/edcal-2019/) asks people to email a story idea; the page is an older editorial calendar, not a current self-serve product-directory form. The current [contact page](https://www.edtechdigest.com/contact/) lists the editor-in-chief's email.
- **Cost:** The editorial calendar does not publish a pitch fee. A separate [advertising page](https://www.edtechdigest.com/more/advertising/) sells sponsored content, white papers, case studies, reports, and ads; those are media services, not an ordinary product listing.
- **Review time:** The editorial calendar says to pitch by email and says the team will respond, but gives no fixed editorial decision or publication time.
- **Eligibility:** The editorial page asks for an education-technology story; it describes a Cool Tools item as a short piece about a useful education technology tool. This is editorial selection, not guaranteed catalogue placement.
- **Published example:** The current homepage lists [EduverseSTEM](https://www.edtechdigest.com/2026/09/21/eduversestem/) as a Cool Tools feature dated September 21, 2026. Its detail page timed out in the reader, but the current homepage sample is visible.
- **Link type:** An editorial article is not a standard directory listing. No product-directory outbound rel policy applies.
- **Decision:** Exclude from the launch-directory catalog. It could belong in a future edtech press or award resource list, but the current workflow is editorial pitching or paid media, not a persistent maker-submitted product profile.
- **Evidence:** [Current site and recent features](https://www.edtechdigest.com/), [editorial pitch guidance](https://www.edtechdigest.com/edcal-2019/), [contact](https://www.edtechdigest.com/contact/), [advertising options](https://www.edtechdigest.com/more/advertising/).

### PropTech Connect — Exclude

- **Official site and submission route:** [PropTech Connect](https://proptechconnect.com/) is a real-estate technology conference. Its [companies-that-attend page](https://proptechconnect.com/event-europe/companies-that-attend/) is an event participant roster, while the [sponsorship page](https://proptechconnect.com/sponsorship-opportunities/) asks companies to book a call about sponsorship and exhibitor options.
- **Cost:** No public sponsor price was shown on the sponsorship page. There is no ordinary product-listing fee because no ordinary listing submission route was found.
- **Review time and eligibility:** The site describes conference participation and sponsorship, not a product directory review process. No public universal product-listing criteria or review window was found.
- **Published sample:** The official [sponsors page](https://proptechconnect.com/event-europe/sponsors/) shows event sponsors; the company roster is not a set of product-detail pages.
- **Link type:** No user-submitted product page exists to inspect. Sponsorship logo or event pages are not product-directory backlinks.
- **Decision:** Exclude from the product-launch catalog. It may fit a future proptech event or networking resource list.
- **Evidence:** [Conference home](https://proptechconnect.com/), [companies attending](https://proptechconnect.com/event-europe/companies-that-attend/), [sponsors](https://proptechconnect.com/event-europe/sponsors/), [sponsorship options](https://proptechconnect.com/sponsorship-opportunities/).

## Category 10: adjacent launch communities

These six candidates are community-post destinations, not persistent directory entries. For each one, the relevant outcome is a public discussion or article authored by the maker. A post may link to the maker's own product, but the platform does not promise a product profile or a search-engine link type.

### Show HN — Include as community post only

- **Official submission route:** Submit a story through [Hacker News Submit](https://news.ycombinator.com/submit); the title must begin “Show HN”. Submitting requires a Hacker News account.
- **Cost and timing:** The official flow shows no per-post fee. A submitted post appears in the [new Show HN feed](https://news.ycombinator.com/shownew); it appears on the [Show page](https://news.ycombinator.com/show) after it clears a small points threshold. There is no fixed editorial review or time-to-feature promise.
- **Eligibility:** [Show HN guidelines](https://news.ycombinator.com/showhn.html) require something the poster personally made, that is non-trivial and usable, and that the maker is available to discuss. Landing pages, sign-up pages, newsletters, and lists are off topic. The current [Show HN restriction notice](https://news.ycombinator.com/showlim) says the site is temporarily restricting posts and asks users to first become good contributors, then post only occasionally.
- **Current example:** [Show HN: Lofi Cities](https://news.ycombinator.com/item?id=49886131) appears in the current [Show feed](https://news.ycombinator.com/show). The sample post links to a usable product, not a permanent directory page.
- **Link treatment:** HN does not offer a standard listing link or state a product-link rel policy. The Lofi Cities sample's GitHub product link has `rel="nofollow"`; this observation applies to that post only. Do not call every Show HN product link nofollow.
- **Recommendation:** Include only in a separately labeled Community posts category. Add the current account-history restriction beside the submit route so makers do not mistake this for a simple open launch form.
- **Evidence:** [Guidelines](https://news.ycombinator.com/showhn.html), [current restriction](https://news.ycombinator.com/showlim), [submit page](https://news.ycombinator.com/submit), [current Show feed](https://news.ycombinator.com/show), [sample post](https://news.ycombinator.com/item?id=49886131).

### Indie Hackers — Include as community post only; hold Products Database separately

- **Community route:** The [Indie Hackers community](https://www.indiehackers.com/) lets members publish posts; starting a post at [/new-post](https://www.indiehackers.com/new-post) sends unsigned visitors to sign in. The official [About page](https://www.indiehackers.com/about) describes it as a community for founders to share stories, experience, and feedback.
- **Cost and timing:** No separate fee for a standard community post is shown. A post is member-published; the official pages do not promise a review queue or fixed time to appear.
- **Eligibility:** An account is required to post. Indie Hackers says an indie hacker is someone who sets out to make money independently, with no further requirements. A useful launch post should give a story or lesson and invite feedback; it is not a guaranteed promotional placement.
- **Current example:** [A launch retrospective](https://www.indiehackers.com/post/show-ih-i-launched-a-saas-with-no-audience-heres-what-happened-in-the-first-week-7d911dae8e) is a public member post about launching a SaaS and what happened in its first week.
- **Link treatment:** Community posts can contain a maker's product link, but no standard outbound rel policy was found. The sample post has a product link; its HTML rel value was not inspected. Do not label it dofollow or treat a post as a directory listing.
- **Separate Products Database:** Indie Hackers also has a persistent [Products Database](https://www.indiehackers.com/products), with an [Add Your Product](https://www.indiehackers.com/products/new) route that requires sign-in. A public [Snapkin profile](https://www.indiehackers.com/product/snapkin) has a Visit Website link, but I found no public product-submission fee, review time, eligibility terms, or rel policy. The page says a free account is needed to access the full directory. Hold this separate directory workflow until its listing terms and link treatment are verified.
- **Recommendation:** Include the community as a post destination. Do not publish the Products Database as a launch-directory card yet.
- **Evidence:** [About](https://www.indiehackers.com/about), [post route](https://www.indiehackers.com/new-post), [sample community post](https://www.indiehackers.com/post/show-ih-i-launched-a-saas-with-no-audience-heres-what-happened-in-the-first-week-7d911dae8e), [Products Database](https://www.indiehackers.com/products), [product submit route](https://www.indiehackers.com/products/new), [sample product profile](https://www.indiehackers.com/product/snapkin).

### DEV Community — Include as community post only

- **Official submission route:** Authors submit through [DEV's new post page](https://dev.to/new), which requires signing in or creating an account. The [Show DEV tag page](https://dev.to/t/showdev/latest) specifically invites project showcases and product launches.
- **Cost and timing:** The standard post route does not display a submission price; this is separate from DEV's paid advertising and membership products. Authors publish their own posts, but DEV does not promise a fixed time free from moderation or removal.
- **Eligibility:** Posts should be on-topic, useful, and substantial. DEV's [terms](https://dev.to/terms) prohibit writing mainly for promotion or backlinks and require affiliate disclosures. The official [Show DEV guidance](https://dev.to/t/showdev/latest) says showcases should be community-driven and not overly corporate or salesy.
- **Published example:** [A builder's SaaS launch write-up](https://dev.to/melvinprince/i-built-a-full-saas-product-in-10-days-while-working-a-full-time-job-heres-exactly-how-fe7) describes a launched product and links to the product site. Another official example is [a Product Hunt launch retrospective](https://dev.to/bananafestdestiny/we-launched-on-product-hunt-nobody-came-and-the-dashboard-said-otherwise-five-times-5018); that detail page returned a cache miss in this check.
- **Link treatment:** An author can include an external product link in a substantive post, but there is no persistent directory listing or platform promise about outbound rel. The sample anchor's HTML rel value was not inspected. The rules explicitly reject backlink-first posts.
- **Recommendation:** Include as a writing and discussion venue for builders who can share a useful development or launch story; do not describe it as a place to submit a product listing or get a backlink.
- **Evidence:** [New post and sign-in](https://dev.to/new), [Show DEV guidance](https://dev.to/t/showdev/latest), [terms](https://dev.to/terms), [quality guide](https://dev.to/devteam/how-to-write-a-high-quality-post-on-dev-3me0), [launch article sample](https://dev.to/melvinprince/i-built-a-full-saas-product-in-10-days-while-working-a-full-time-job-heres-exactly-how-fe7).

### Reddit r/SideProject — Include as community post only

- **Official submission route:** Use Reddit's [Create Post workflow](https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit) from [r/SideProject](https://www.reddit.com/r/SideProject/). Reddit Help says to choose a relevant community and check its current rules before posting.
- **Cost and timing:** Reddit's standard post workflow shows no per-post fee. A post may be filtered or moderated; Reddit Help warns that new or low-karma accounts can hit the spam filter. No fixed review time is published.
- **Eligibility:** The subreddit About page says it is public and anyone can view, post, and comment. The subreddit rules page redirected to a moderator page whose rule text was not accessible in this check, so self-promotion limits must be checked in Reddit before posting. Do not imply every project promotion is allowed.
- **Current example:** [A maker's Daily Code iPhone app post](https://www.reddit.com/r/SideProject/comments/1we7cg9/i_built_a_simple_free_daily_logic_game_for_iphone/) describes the side project and links to its App Store page. The current [new feed](https://www.reddit.com/r/SideProject/new/) contains similar project showcases.
- **Link treatment:** These are user-authored community posts, not persistent directory entries. The sample contains an App Store link, but its HTML rel value is not specified in the community rules and was not inspected.
- **Recommendation:** Include as a community destination with “check rules before posting” as a visible caveat. Do not promise acceptance, a permanent profile, or a backlink.
- **Evidence:** [Subreddit About page](https://www.reddit.com/r/SideProject/about/), [current rules route](https://www.reddit.com/r/SideProject/about/rules/), [current feed](https://www.reddit.com/r/SideProject/new/), [Reddit posting instructions](https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit), [sample project post](https://www.reddit.com/r/SideProject/comments/1we7cg9/i_built_a_simple_free_daily_logic_game_for_iphone/).

### Reddit r/SaaS — Include as community post only

- **Official submission route:** Use Reddit's [Create Post workflow](https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit) from [r/SaaS](https://www.reddit.com/r/SaaS/), after checking the rules in its About page.
- **Cost and timing:** Reddit's standard post workflow lists no per-post fee. Posts can be filtered or moderated; there is no fixed review time. Moderator approval is required for surveys, polls, and other research posts.
- **Eligibility:** The subreddit is public. Current [r/SaaS rules](https://www.reddit.com/r/SaaS/about/) require SaaS relevance and original context. Promotion is limited to one mention or three links every 60 days, with affiliation disclosed; naked links and product descriptions are spam. Sales, lead generation, fundraising, and some promotional SaaS categories are prohibited.
- **Current example:** [An open-source invoicing tool post](https://www.reddit.com/r/SaaS/comments/1wjwekl/i_built_a_minimalist_opensource_invoicing_tool/) explains the maker's motivation and tech stack and links to the GitHub repository.
- **Link treatment:** The link appears inside a community post. This is not a persistent directory listing, and the sample link's HTML rel value was not inspected. No backlink type should be claimed.
- **Recommendation:** Include as a community-post destination, but describe it as a place for a useful SaaS discussion with limited, disclosed promotion, not a launch-ad board.
- **Evidence:** [Subreddit rules and eligibility](https://www.reddit.com/r/SaaS/about/), [current feed](https://www.reddit.com/r/SaaS/new/), [Reddit posting instructions](https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit), [sample post](https://www.reddit.com/r/SaaS/comments/1wjwekl/i_built_a_minimalist_opensource_invoicing_tool/).

### Reddit r/microsaas — Include as community post only

- **Official submission route:** Use Reddit's [Create Post workflow](https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit) from [r/microsaas](https://www.reddit.com/r/microsaas/), after checking its current rules.
- **Cost and timing:** Reddit's standard post workflow lists no per-post fee. Posts may be removed or filtered; Reddit publishes no fixed review time.
- **Eligibility:** The subreddit is public. Its current [About page rules](https://www.reddit.com/r/microsaas/about/) allow a maker to mention a micro SaaS only with useful context such as backstory, tech stack, revenue if comfortable, or a specific lesson. The moderator's [self-promotion announcement](https://www.reddit.com/r/microsaas/comments/1tucu8a/addressing_selfpromotion_in_this_sub/) is stricter: it says self-promotion is not generally allowed, but may be tolerated when the post provides useful learning or when it shares a fully free product with a thoughtful explanation. Follow the stricter guidance and check for later changes.
- **Current example:** [A maker's Story Boost Up discussion](https://www.reddit.com/r/microsaas/comments/1wa2s9k/im_bootstrapping_a_fandom_kingdom_saas_what_would/) gives product context, asks for feedback, and links to the product.
- **Link treatment:** The product link is part of a user-authored post, not a persistent directory entry. The post's outbound anchor rel value was not inspected; there is no link-type promise.
- **Recommendation:** Include as a community channel with the self-promotion limits stated plainly. A bare product link or ad is not eligible under the current rules.
- **Evidence:** [Subreddit rules](https://www.reddit.com/r/microsaas/about/), [moderator policy post](https://www.reddit.com/r/microsaas/comments/1tucu8a/addressing_selfpromotion_in_this_sub/), [current feed](https://www.reddit.com/r/microsaas/new/), [Reddit posting instructions](https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit), [sample post](https://www.reddit.com/r/microsaas/comments/1wa2s9k/im_bootstrapping_a_fandom_kingdom_saas_what_would/).

## Coverage audit

- Category 9 has 12 candidates; all 12 have a disposition: 6 holds and 6 excludes.
- Category 10 has 6 candidates; all 6 are included as community-post destinations, with links labeled as post-specific rather than standard directory links.
- Total assigned coverage: 18 candidates, with 6 community-only includes, 6 holds, and 6 excludes.
- No Category 9 candidate is ready for a complete public directory card. Indie Hackers' separate Products Database also remains on hold pending its listing terms and link treatment.

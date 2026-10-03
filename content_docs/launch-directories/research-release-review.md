# Launch directories research release review

Checked on 2026-10-03 (Asia/Kolkata). The read-only development snapshot contains 171 rows: 165 visible and six hidden community rows. The patch set has 165 entries, one per visible row, and each entry carries the snapshot row's `updated_at` as `expected_updated_at`. No database changes were applied.

## Current facts and routes

- [AI Tools (aitools.inc)](https://aitools.inc/submit) lists a free request with a 30 to 90 day queue and no guaranteed placement. Fast Lane is $129 once, with 24 to 48 hour placement and a full refund if the tool does not meet listing standards. The page links to Typeform. The form was not filled and no purchase was made.
- [Betabound](https://betabound.com/announce/) has an active, free beta-announcement request form. It asks for the product type, tester audience, access method, and timeframe. The page says not all submissions will be posted or answered and gives no ETA or further eligibility rules. Historical listing samples do not establish current link policy.
- Three recovered submission URLs lead to sign-in pages. [AI Hubs](https://aihubs.ai/submit) redirects to `/auth/login`; [ComingUp](https://www.comingup.io/submit) redirects to `/auth/login`; and [LaunchDB](https://bigideasdb.com/launchdb/submit) redirects to `/signin`. No sign-in or submission was completed.
- On 2026-10-02, SaaS AI Tools' `/submit` path redirected to `/signup/` and returned 404. No current official submission route was verified. This does not establish that the directory has closed.
- Four GitHub contribution links were kept after the rendered GitHub pages returned 503. The matching official raw files returned HTTP 200 and confirm usable workflows: [Awesome Selfhosted](https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted-data/master/CONTRIBUTING.md), [Docker MCP Registry](https://raw.githubusercontent.com/docker/mcp-registry/main/CONTRIBUTING.md), [Free for Dev](https://raw.githubusercontent.com/ripienaar/free-for-dev/master/CONTRIBUTING.md), and the [MCP Registry CLI reference](https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/reference/cli/commands.md). The patch retains each canonical GitHub guide link and records the raw-file check.
- [AI Finder](https://ai-finder.net/) currently redirects to a [HugeDomains sale page](https://www.hugedomains.com/domain_profile.cfm?d=ai-finder.net). This does not establish the former directory's history or permanent closure. [ExtensionBoss](https://extensionboss.com/) redirected to a HugeDomains page in an earlier check, but a later check did not reproduce the redirect. Its current site status remains unverified.

## Conflicts and unknowns

The current checks resolved the Launching Next review timing, the Startuups link conditions, and SuperLaunch's current Launch Plus price. Launching Next's paid price still conflicts across official pages.

Nine conflicting evidence fields remain across eight rows. The conflicts cover KillerStartups review time; LaunchDB cost and eligibility; Launching Next cost; Make review time; Microsoft Marketplace review time; Startups.fyi cost; SuperLaunch visibility duration; and TinyStartups cost. The patch retains their conflicting labels and source notes.

The patch leaves 77 costs unknown, 55 link types unknown, and 32 sample URLs missing. It adds no site-wide link or search-ranking claims. A single sampled listing only describes that sample.

## Submission verification limits

The refreshed visible-row statuses are 126 verified, 16 unavailable, and 23 not found. All 165 visible rows have a submission evidence entry with its source URL, method, timestamp, status, and note. Browser GET was used where HEAD responses could mislead. Login gates were not passed; forms, accounts, and purchases were not used. A blocked or missing route is not labeled as a closed service.

## Logo assets

The manifest maps 141 visible rows to official WebP assets. All mapped files are 96 pixels or smaller, total 198,692 bytes, and have source records. The FindMyAITool favicon's transparent white robot has a dark backing for contrast; the artwork is unchanged. The Official MCP Registry uses the verified Model Context Protocol organization avatar because no registry-specific icon was found. GitHub's organization page verifies control of `modelcontextprotocol.io` and displays the avatar: [official profile](https://github.com/modelcontextprotocol).

Open Source Software Directory's official favicon was recovered at 15 by 16 pixels and was not enlarged. The Product Hunt icon was reduced from its 240-pixel source to the 96-pixel asset.

The following 24 visible entries still have no verified official image. For non-parked domains, the asset pass checked page metadata and manifest icons plus same-origin favicon, touch-icon, icon, and logo paths. Each attempted URL and response is recorded in [icon-sources.json](icon-sources.json). AI Finder's parked-page icon was not used. NextBigWhat's fetched official favicon was a blank, opaque white 16 by 16 image, so it was removed.

- [AEO Tools Space](https://aeotools.mihirnaik.com/), [AI Finder](https://ai-finder.net/), [AI Scout](https://aiscout.net/), [AI Tools Corner](https://aitoolscorner.com/), [AI Tools Love](https://aitools.love/), [AI Valley](https://aivalley.ai/)
- [CogList AI](https://coglist.com/), [Cool Startups](https://coolstartups.io/), [ExtensionBoss](https://extensionboss.com/), [FinancesOnline](https://www.financesonline.com/), [Hype Desk](https://hypedesk.com/), [IndieExtensions](https://indieextensions.com/)
- [LibHunt](https://www.libhunt.com/), [MarketingTools.com](https://marketingtools.com/), [NextBigWhat](https://nextbigwhat.com/), [Product Fifty One](https://productfiftyone.com/), [SaaS Browser](https://saasbrowser.com/), [SiteInspire](https://www.siteinspire.com/), [SoftwareWorld](https://softwareworld.co/)
- [StartHQ](https://starthq.com/), [Startup Buffer](https://startupbuffer.com/), [StartupLift](https://startuplift.com/), [Startuplist.in](https://startuplist.in/), [ToolsForCreators](https://toolsforcreators.com/)

## Handoff

The coordinator can review and apply [launch-updates.json](launch-updates.json) through the guarded development workflow. The icon manifest is [launch-directory-icons.json](/home/teja/projects/stack127/lib/launch-directory-icons.json). Production remains unpublished; no release or database apply was run.

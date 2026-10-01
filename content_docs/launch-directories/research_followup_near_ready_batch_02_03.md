# Near-ready launch directories: final checks

Checked: 2026-09-29
Scope: Toolify, TopAI.tools, AI Tools Board, FindMyAITool, RapidAPI Hub, Docker MCP Catalog, Easy With AI, mcpservers.org, LobeHub MCP Marketplace, and Cline MCP Marketplace.

This file gives suggested card fields and include/hold decisions. “No fee listed” does not mean free. A raw link check describes only the named sample; a site promise is labeled separately. AI Tools Board and FindMyAITool raw observations are from the original same-day check in [research batch 03](research_batch_03.md). Docker, LobeHub, and Cline raw sample checks were supplied by the parent agent. This environment's browser reader does not expose raw `rel` attributes for the other samples. LobeHub's official guide currently redirects to a Market page the reader cannot fetch; its CLI and timing details are also present in a current response in the official LobeHub issue linked below.

## Candidate facts

### Toolify — Include

- `website_url`: https://www.toolify.ai/; `submit_url`: https://www.toolify.ai/submit
- `cost_kind`: `paid`; `cost_label`: `$99 once`
- `review_time_label`: `No queue; listed within 48 hours`
- `eligibility_label`: `AI tools; detailed acceptance rules not published`
- `link_type_kind`: `dofollow`; `link_type_label`: `Toolify promises at least 6 dofollow links with its paid listing`
- `example_listing_url`: https://www.toolify.ai/tool/faceframer-io — public profile; raw sample `rel` not inspected. The dofollow fact is the paid submit page's promise, not a sample observation.
- Sources: [submit page](https://www.toolify.ai/submit), [payment terms](https://www.toolify.ai/fulfillment-policy), [sample](https://www.toolify.ai/tool/faceframer-io).

### TopAI.tools — Hold

- `website_url`: https://topai.tools/; `submit_url`: https://topai.tools/submit
- `cost_kind`: `paid`; `cost_label`: `Fast Track $47 once; Featured $229 once for 7 days`
- `review_time_label`: `Fast Track live within 24–48 hours; editorial review for all submissions; rejected tools refunded`
- `eligibility_label`: `AI-powered, functional, accessible tools with clear user value`
- `link_type_kind`: `unknown`; `link_type_label`: `No official link-type promise found; sample HTML not inspected`
- `example_listing_url`: https://topai.tools/t/topai-tools — a public profile with a Try Now link, but no raw `rel` observation. Hold until a current sample link type or an official promise is verified.
- Sources: [submit page](https://topai.tools/submit), [sample profile](https://topai.tools/t/topai-tools).

### AI Tools Board — Include with cost uncertainty shown

- `website_url`: https://aitoolsboard.com/; `submit_url`: https://aitoolsboard.com/submit
- `cost_kind`: `unknown`; `cost_label`: `Standard price not published; Fast Track Review $99`
- `review_time_label`: `Standard: 5–7 business days; Fast Track: within 24 hours`
- `eligibility_label`: `AI tools; detailed acceptance rules not published`
- `link_type_kind`: `nofollow`; `link_type_label`: `Nofollow on the v0 sample link (raw observation; not a site-wide promise)`
- `example_listing_url`: https://aitoolsboard.com/categories/developer-tools — the original same-day check found the v0 website anchor with `rel="nofollow"`. This sample page returned 403 in the follow-up, so the raw observation was not repeated.
- Sources: [submit form](https://aitoolsboard.com/submit), [sample category](https://aitoolsboard.com/categories/developer-tools), [original same-day observation](research_batch_03.md).

### FindMyAITool — Include with billing uncertainty shown

- `website_url`: https://findmyaitool.com/; `submit_url`: https://findmyaitool.com/submit-tool
- `cost_kind`: `paid`; `cost_label`: `From $79.99; billing intervals for listing plans are not stated. Premium Exposure is a separate $499.99/month offer.` The listing page also names Featured ($99.99), Standard ($149.99), and Premium ($499.99) tiers.
- `review_time_label`: `Manual review; no ETA published`
- `eligibility_label`: `AI tools; detailed listing criteria not published`
- `link_type_kind`: `nofollow`; `link_type_label`: `Nofollow on the ResearchGPT GitHub link (raw observation; not a site-wide promise)`
- `example_listing_url`: https://findmyaitool.com/tool/researchgpt — same-day raw observation is recorded in the original report; it was not repeated in this follow-up.
- Sources: [submission and pricing](https://findmyaitool.com/submit-tool), [sample](https://findmyaitool.com/tool/researchgpt), [original same-day observation](research_batch_03.md).

### RapidAPI Hub — Hold

- `website_url`: https://rapidapi.com/hub; `submit_url`: https://docs.rapidapi.com/docs/add-api-getting-started
- `cost_kind`: `unknown`; `cost_label`: `Listing fee not published in the checked docs; Rapid takes 25% of payments through the Hub`
- `review_time_label`: `No review time published`
- `eligibility_label`: `Working API; make it public in RapidAPI Studio. A team-owned API needs an admin to approve public visibility.`
- `link_type_kind`: `unknown`; `link_type_label`: `No link-type promise found; current sample exposed no inspectable external anchor`
- `example_listing_url`: https://rapidapi.com/open-trade-commerce-open-trade-commerce-default/api/aliexpress-open-api — parent confirmed the current sample returns 200 but exposes no anchors or buttons in raw DOM. Hold until an anchor or official policy resolves link type.
- Sources: [Studio setup](https://docs.rapidapi.com/docs/add-api-getting-started), [public visibility and optional website field](https://docs.rapidapi.com/docs/hub-listing-general-tab), [API listing fields](https://docs.rapidapi.com/v2.0/docs/api-listing-overview), [payout terms](https://docs.rapidapi.com/docs/payouts-and-finance), [sample](https://rapidapi.com/open-trade-commerce-open-trade-commerce-default/api/aliexpress-open-api).

### Docker MCP Catalog — Include

- `website_url`: https://hub.docker.com/mcp; `submit_url`: https://github.com/docker/mcp-registry/blob/main/CONTRIBUTING.md
- `cost_kind`: `unknown`; `cost_label`: `No fee listed in the contribution instructions`
- `review_time_label`: `Docker team review; no review ETA; approved entries appear within 24 hours`
- `eligibility_label`: `MCP server; local: working container, Dockerfile, and suitable license; remote: public Streamable HTTP or SSE endpoint and docs (OAuth details if needed)`
- `link_type_kind`: `dofollow`; `link_type_label`: `Follow in the Docker Hub sample (GitHub link has raw rel="noopener noreferrer")`
- `example_listing_url`: https://hub.docker.com/mcp/server/dockerhub/overview — parent checked the GitHub repository anchor, which has no `nofollow`, `sponsored`, or `ugc` token. This is one sample, not a link promise.
- Sources: [contribution guide](https://github.com/docker/mcp-registry/blob/main/CONTRIBUTING.md), [sample](https://hub.docker.com/mcp/server/dockerhub/overview), [sample repository](https://github.com/docker/hub-mcp).

### Easy With AI — Include

- `website_url`: https://easywithai.com/; `submit_url`: https://easywithai.com/submit-tool/
- `cost_kind`: `free_and_paid`; `cost_label`: `$125 once; qualifying free/open-source education or academic research tools are free; paid ones may get 50% off`
- `review_time_label`: `Manual review; usually listed within 24 hours; rejected tools receive a full refund`
- `eligibility_label`: `AI tools; non-AI tools and duplicates are rejected; strict NSFW limits; education and research tools may qualify for discounts`
- `link_type_kind`: `dofollow`; `link_type_label`: `Site promises a dofollow link for every listed tool, including eligible free listings`
- `example_listing_url`: https://easywithai.com/ai-lifestyle-tools/dressx-me/ — sample raw `rel` not inspected; the dofollow fact is the general submission-page promise and is not limited to a paid plan.
- Sources: [submit page](https://easywithai.com/submit-tool/), [sample](https://easywithai.com/ai-lifestyle-tools/dressx-me/).

### mcpservers.org — Include

- `website_url`: https://mcpservers.org/; `submit_url`: https://mcpservers.org/submit
- `cost_kind`: `free_and_paid`; `cost_label`: `Free; Premium Submit $39 one-time`
- `review_time_label`: `Free: within 2 weeks; Premium: within 24 hours`
- `eligibility_label`: `MCP servers; form requests server details and a repository, website, or docs URL`
- `link_type_kind`: `varies`; `link_type_label`: `Premium promises dofollow; free plan link type not stated`
- `example_listing_url`: https://mcpservers.org/servers/camden-tools-mcp — public sample with a tool-site link and a separate sponsored Composio link; raw `rel` values were not inspected. The Premium dofollow fact is an official plan promise, not a sample observation.
- Sources: [submit form](https://mcpservers.org/submit), [sample](https://mcpservers.org/servers/camden-tools-mcp).

### LobeHub MCP Marketplace — Include with cost and ownership caveats

- `website_url`: https://lobehub.com/mcp; `submit_url`: https://lobehub.com/publish-mcp/skill.md (official publishing guide; redirects to the Market site)
- `cost_kind`: `unknown`; `cost_label`: `No fee listed in the publishing instructions`
- `review_time_label`: `Import is asynchronous and takes about a few minutes; no review SLA stated`
- `eligibility_label`: `GitHub repository you own or can push to; Node.js 22+ and a connected GitHub account; organization-owned repositories may currently fail the ownership check`
- `link_type_kind`: `dofollow`; `link_type_label`: `Follow in the LobeHub MCP Hello World sample (raw repository anchor has no restrictive rel tokens)`
- `example_listing_url`: https://lobehub.com/mcp/lobehub-mcp-hello-world — parent checked the current GitHub repository anchor. This sample observation is not a site-wide link promise.
- Sources: [publishing guide](https://lobehub.com/publish-mcp/skill.md), [official LobeHub submission thread with current CLI instructions](https://github.com/lobehub/lobehub/issues/16226), [official organization-repository issue](https://github.com/lobehub/lobehub/issues/17416), [sample](https://lobehub.com/mcp/lobehub-mcp-hello-world).

### Cline MCP Marketplace — Include

- `website_url`: https://cline.bot/mcp-marketplace; `submit_url`: https://github.com/cline/mcp-marketplace/issues/new?template=mcp-server-submission.yml
- `cost_kind`: `unknown`; `cost_label`: `No fee listed in the contribution guide`
- `review_time_label`: `Team aims to review within a couple of days; approved servers go live shortly afterward`
- `eligibility_label`: `MCP server; submit its repository, a 400×400 PNG logo, reason for inclusion, and setup tested with Cline. No minimum star count; review checks adoption, maintainers, maturity, documentation, maintenance, and security.`
- `link_type_kind`: `dofollow`; `link_type_label`: `Follow in the File System sample (GitHub link has raw rel="noopener noreferrer")`
- `example_listing_url`: https://cline.bot/mcp-marketplace — the File System card's repository link is https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem. Parent checked the raw anchor. It is sample-specific, not a site-wide link promise.
- Sources: [official contribution guide](https://github.com/cline/mcp-marketplace), [submission issue form](https://github.com/cline/mcp-marketplace/issues/new?template=mcp-server-submission.yml), [sample marketplace](https://cline.bot/mcp-marketplace), [sample repository](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem).

## Decisions

**Include:** Toolify, AI Tools Board, FindMyAITool, Docker MCP Catalog, Easy With AI, mcpservers.org, LobeHub MCP Marketplace, and Cline MCP Marketplace.
**Hold:** TopAI.tools until a current sample link type or official link policy is verified; RapidAPI Hub until an external anchor or link policy is verified.

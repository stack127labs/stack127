# Competitive report: KDP metadata checker

Status: ready
Tool: KDP metadata checker
Route: /kdp-metadata-checker
Researched: 2026-09-16
Direct competitors reviewed: 8
Saturation exception: no

## Research scope

### Current stack127 state

The supplied planning attachment proposes a browser-based '/kdp-metadata-checker' that accepts a title, subtitle, description, and seven keyword fields. It should flag field length, unsupported HTML, malformed tags, URLs, email addresses, promotional language, review requests, duplicate keyword phrases, title and keyword repetition, and HTML in title or keyword fields. It should preview the description and should not write copy with AI.

No route, engine, tests, scripts, ownership manifest, or existing 'content_docs/kdp-metadata-checker/' report exists in this repository. The route is a new standalone tool, not a directory facet or a database-backed listing. The tool can be useful with partial coverage because it checks text supplied by the visitor. It does not depend on a curated catalog. That passes the topic-research search shape, coverage, task, and trust tests.

The main trust boundary is narrow. KDP publishes field rules and formatting restrictions, but it does not publish the complete decision procedure used for every metadata review. The tool can identify documented rule matches and obvious patterns. It must not call a listing accepted, compliant, safe, or guaranteed to pass review.

### Method and coverage

I searched four distinct query shapes and opened eight direct or near-direct tools. The search backend was the available web connector. Search engine identity was not exposed, so this report does not claim Bing or DuckDuckGo coverage. The in-app Browser runtime was unavailable. I used the documented standalone Playwright CLI fallback to load and operate public pages without signing in, creating accounts, sending text, fetching an ASIN, or triggering an external side effect.

- Search backend: web connector
- Search engines: not individually available
- Visual backend: standalone Playwright CLI
- Browser viewports: 1440 x 1000 desktop and 390 x 844 mobile
- Accessed: 2026-09-16, Asia/Kolkata
- Browser limits: public pages only; one SmartKDP formatter URL first returned a DNS error before its 'www' URL loaded, and the KDPage adjacent tool was not used in the eight-page set

### Search saturation evidence

- Queries tried: "KDP metadata checker"; "KDP book details checker title subtitle keywords description"; "Amazon KDP book description HTML tags checker"; "KDP metadata errors duplicate keywords description rejected"
- Repeated domains: kdp.amazon.com appeared for the authoritative rules; smartkdp.com and kdpeasy.com appeared repeatedly for formatter and listing tools; Reddit appeared for recurring troubleshooting questions
- Exclusions: keyword research tools, title generators, trademark screens, cover calculators, AI listing writers, and generic Amazon seller tools were excluded from the exact description-only competitor count unless their visible job overlapped the proposed fields. The eight reviewed pages cover six description/listing formatters or analyzers, one full-listing suite, and one broader listing auditor.

The category is established but fragmented. Six pages focus on description formatting. The only reviewed page that presents title, description, seven keywords, and other listing fields together is SmartKDP's Listing Studio, and its anonymous page is a product explanation rather than an open checker. This leaves room for a small, source-linked checker that joins the fields without making generation or ranking claims.

## Search intent

| Intent | Example query | What the user needs now | Current result shape |
| --- | --- | --- | --- |
| Preflight the whole listing | KDP metadata checker | Find obvious title, description, and keyword problems before entering KDP | Official KDP help, description formatters, and listing-suite pages. No dominant free all-fields checker appeared. |
| Check the book-details fields | KDP book details checker title subtitle keywords description | Know which fields are checked together and what to fix first | KDP's documentation and product pages. Competitors split the job between description tools and keyword or title tools. |
| Repair description HTML | Amazon KDP book description HTML tags checker | Identify unsupported tags, count the markup, and see the rendered result | Many description-only formatters with previews and copy buttons. Their tag lists disagree. |
| Explain a rejected or broken description | KDP metadata errors duplicate keywords description rejected | Connect an error to a field and a recovery step | KDP troubleshooting pages and community threads. Few tools show an issue list tied to the pasted source. |
| Check title and subtitle length | KDP title subtitle character count | Confirm that the combined title and subtitle stays within the documented limit | Title generators and general counters. The description-first tools do not accept title fields. |

The strongest intent is a preflight pass immediately before copying metadata into KDP. A second useful moment is after a formatter or word processor has inserted markup that the author did not intend.

## User pain evidence

| Repeated problem or question | Evidence | Frequency signal | Product implication |
| --- | --- | --- | --- |
| Copying from a document can create invisible or unsupported characters | [KDP troubleshooting](https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L) describes invisible-character errors after copy and paste; the [KDP unsupported HTML thread](https://www.reddit.com/r/KDP/comments/njq9t7/stuck_on_description_contains_an_unsupported_html/) has repeated replies describing the same error and different fixes | Repeated across official guidance and a long-running community thread. No measured query volume. | Inspect raw input for unsupported tags and suspicious characters, then identify the field and the exact pattern. |
| Paragraph gaps and line breaks do not survive the path from editor to listing | The [Blurb Issues thread](https://www.reddit.com/r/selfpublish/comments/c6imfy) reports spacing disappearing after save; the [book description formatting thread](https://www.reddit.com/r/selfpublish/comments/f476mx) shows authors comparing p and br behavior across formats | Repeated across separate community discussions. | Show a render preview and distinguish source HTML from the text a reader sees. Do not promise an exact Amazon render. |
| Authors cannot tell which description tags are current | The [new free Amazon blurb tool discussion](https://www.reddit.com/r/selfpublish/comments/boxmjg) says authors struggled to find the supported list; the [KDP HTML error thread](https://www.reddit.com/r/selfpublish/comments/xvhcu1) reports tags appearing as literal text or disappearing | Repeated confusion, with community answers often based on old or inconsistent lists. | Link each rule to the current official allowlist and expose removed or unsupported tags instead of silently rewriting them. |
| Repetitive keyword and title rules feel opaque after a flag | The [repetitive keyword flagging thread](https://www.reddit.com/r/KDP/comments/1prblvh) describes uncertainty about repeated words and a later title correction; the [metadata change thread](https://www.reddit.com/r/KDP/comments/1smki9y) describes concern that metadata edits can trigger another review | Recent discussions show recurring fear and uncertainty, but the platform's exact matcher is not public. | Mark overlap and duplication as local checks or review prompts, not as confirmed KDP violations. Keep the rule explanation next to the finding. |

Community pages establish confusion and repeated jobs, not the technical truth of a rule. Official KDP documentation remains the source for the checker contract.

## Technical truth to verify

| Claim or formula | Source of truth | Status | Notes |
| --- | --- | --- | --- |
| The title field should contain the actual book title, and title plus subtitle together must be fewer than 200 characters | [KDP Metadata Guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560), especially the Book Title and Subtitle sections | Documented | The tool can count the combined fields and flag HTML or obvious promotional terms. It cannot confirm that the text matches the cover. |
| KDP does not accept HTML tags in the title, subtitle, author, contributor, or keyword fields | [Create a Book](https://kdp.amazon.com/en_US/help/topic/G202172740) | Documented | A literal tag-like pattern in title or keyword input is a clear finding. The tool should not infer that every angle bracket is HTML. |
| A book description has a 4,000-character limit, and KDP counts HTML tags in that total | [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630) | Documented | Count the raw description field, including tags, and show the visible-text count separately if useful. |
| The current KDP description allowlist is br, p, b, em, i, u, h4 through h6, ol, ul, and li | [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630) | Documented | This is twelve tags. KDP says h1, h2, and h3 are not supported. The list should be versioned by source date because KDP can change it. |
| Description restrictions include phone numbers, addresses, email addresses, website URLs, reviews, testimonials, review requests, promotions, time-sensitive information, price or ordering information, spoilers, keyword or tag phrases, and Unicode emoji | [KDP Metadata Guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560) and [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630) | Documented | Regex checks can catch obvious instances. Semantic claims such as whether a phrase is promotional or a spoiler remain review prompts. |
| KDP recommends up to seven keywords or short phrases and says to avoid metadata already covered elsewhere, promotions, unrelated words, unauthorized brands, program names, quotation marks, and HTML | [Make Your Book More Discoverable with Keywords](https://kdp.amazon.com/en_US/help/topic/G201298500) | Documented | KDP's public page says to keep an eye on the character limit but does not state a universal numeric per-field limit. |
| A keyword field has a universal 50-byte limit | No numeric limit appears in the cited [official keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201298500) | Unknown | SmartKDP and other tools display or claim a 50-byte rule. Treat it as an unverified competitor convention until an official source or controlled KDP form check establishes the scope and marketplace. |
| Duplicate keywords or title-word overlap are definite KDP violations | KDP says to avoid information covered elsewhere, but does not publish the matching algorithm | Inferred | The checker can report normalized duplicates and title overlap as review findings. It should not call partial overlap a rejection. |
| A description that passes the HTML and length checks will be accepted by KDP | KDP's [metadata guidance](https://kdp.amazon.com/en_US/help/topic/G201097560) says it uses automated systems and human reviewers | Unknown | The checker can only report the rules it implements. It must use possible-issue language and keep content review outside its claim. |

## Competitor reviews

### Competitor 1: MyBookPage

- URL: https://mybookpage.com/tools/amazon-book-description-html-formatter
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page calls itself a free, no-signup Amazon Book Description HTML Formatter and says it runs in the browser.
- Inputs and defaults: [Observed] One textarea accepts plain text or HTML. Load sample inserts an example and Clear appears after content is present. It has no title, subtitle, or keyword inputs.
- Action and state behavior: [Observed] Typing updates the output and preview. Load sample creates a result. Copy HTML is the main export action. There is no separate whole-listing check action.
- Results and visuals: [Observed] The page shows KDP-ready HTML, a character count such as 379 / 4,000, remaining characters, a reading preview, and a list of changed tags. The result is text-led rather than a score.
- Formula or data source: [Documented] The page says its count includes the 4,000-character limit and presents a tag table. Its displayed list includes strong and hr alongside the current official set, so the source list is not fully aligned with KDP's current page.
- Errors and edge behavior: [Observed] A controlled h3 and a input produced visible notices that both tag types were removed, including the reason for each. The probe did not test an over-4,000-character description.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. It exposes a skip link, a labelled textarea placeholder, and named load and copy buttons. A full keyboard audit was not performed.
- Privacy: [Documented] The page says the blurb never leaves the device and describes the tool as browser-based.
- Performance: [Observed] The page loaded and produced the sample result within the short probe window. This is not a benchmark.
- Search-content structure: [Observed] The h1 names the formatter. Headings cover the workflow, the tag list, rejected tags, questions, and related tools.
- What works: [Inferred] The changed-tag explanation is a useful recovery path because it connects an input to a specific rule.
- What fails: [Inferred] The tool solves only the description portion of the proposed job, and the extra tag claims create a source-trust problem.
- Do not copy: [Inferred] Do not copy a mixed allowlist or silently treat competitor documentation as current KDP policy.

```text
[site nav]
[h1 + short promise]
[description textarea] [Load sample]
[KDP-ready HTML] [Copy HTML]
[character count + changed tags]
[reading preview]
[workflow and tag reference]
```

### Competitor 2: KDPEasy

- URL: https://www.kdpeasy.com/tools/amazon-book-description-formatter
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page presents a free KDP description formatter with live preview, genre templates, and one-click copy.
- Inputs and defaults: [Observed] One textarea has the accessible name Book description editor. Four template buttons are visible: Fiction, Non-Fiction, Children's Book, and Self-Help. A toolbar exposes formatting actions through compact buttons.
- Action and state behavior: [Observed] Choosing Fiction replaces the empty editor with an 875-character template. The preview updates, and Copy HTML changes to HTML Copied! after a copy probe. Preview and HTML tabs are visible.
- Results and visuals: [Observed] The workbench pairs the editor with a live preview and one total count, such as 875 / 4,000. The lower page includes a tag list, instructions, and genre guidance.
- Formula or data source: [Documented] The page advertises h3 and hr as Amazon-compatible tags. KDP's current [official tag table](https://kdp.amazon.com/en_US/help/topic/G201189630) does not list either one, so the competitor's claim is not a safe source for the implementation.
- Errors and edge behavior: [Unknown] No visible error list or unsupported-tag report appeared during the empty-state and template probes. The tool may rely on the editor to constrain output, but that was not independently verified.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. The editor has an accessible name, but many compact toolbar buttons were not self-explanatory in the text-only inspection.
- Privacy: [Unknown] The public tool page did not make a local-processing claim during the probe.
- Performance: [Observed] Selecting a template updated the editor and preview within the probe window. This is not a benchmark.
- Search-content structure: [Observed] The h1 leads with the KDP description job. Headings cover the editor, preview, usage steps, tag list, benefits, genre tips, and questions.
- What works: [Inferred] Templates reduce the blank-page problem and the visible copy confirmation makes the export action clear.
- What fails: [Inferred] A template includes review-quote and Buy Now placeholders even though KDP's description rules restrict reviews, promotional material, and price or ordering information.
- Do not copy: [Inferred] Do not copy the unqualified Amazon Compatible label or the unsupported h3 and hr examples.

```text
[site nav]
[h1 + promise]
[genre template buttons]
[editor + formatting toolbar] [live preview]
[count] [Copy HTML] [Copy Plain Text]
[tag examples]
[how-to, benefits, FAQs]
```

### Competitor 3: SmartKDP description formatter

- URL: https://www.smartkdp.com/tools/book-description-formatter
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page promises KDP-rendered HTML, a source and rendered view, a 4,000-character count, and no login or upload.
- Inputs and defaults: [Observed] A contenteditable field labelled Book description opens with a sample. The toolbar has Write and HTML modes plus bold, italic, underline, h4, h5, paragraph, bulleted-list, numbered-list, and clear controls. The sample shows separate text and HTML counts.
- Action and state behavior: [Observed] Editing updates the counts and preview immediately. Clear removes the sample and Restore the example returns it. Copy HTML for KDP is the main export action. A cookie choice appears before the editor, with Decline, Accept all, and Analytics only.
- Results and visuals: [Observed] The page shows 459 / 4,000, a text-versus-HTML split such as 391 of text and 68 of HTML tags, a rendered preview, a tag-change message, and a source-date statement. The default sample says Nothing to fix.
- Formula or data source: [Documented] The page states that its twelve-tag list comes from Amazon's published KDP help pages and shows the current official set. It also claims that the description is minified so editor line breaks do not add unintended characters.
- Errors and edge behavior: [Inferred] A Playwright fill into the contenteditable inserted literal h3 and a text rather than simulating a rich paste, so the probe cannot establish how a real clipboard paste is sanitized. The page's visible default sample did not expose a failing state.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. The description field has an accessible name and the copy and clear controls are named. The rich toolbar needs a keyboard and screen-reader pass before adoption.
- Privacy: [Documented] The page says no login is needed and that nothing is sent anywhere. The cookie panel separately describes optional analytics and advertising cookies.
- Performance: [Observed] The sample and counts were visible immediately after load, and editing updated the displayed counts within the probe window. This is not a benchmark.
- Search-content structure: [Observed] The h1 names the formatter. Headings explain the Amazon render, tag set, blank lines, the character budget, word-processor paste, prohibited content, and the tool's limits.
- What works: [Inferred] Splitting text characters from HTML characters answers a real source of confusion and makes the 4,000-character rule easier to act on.
- What fails: [Inferred] It still checks only descriptions. The cookie choice is also an extra first interaction for a tool that otherwise promises a no-login workflow.
- Do not copy: [Inferred] Do not present a rich editor as proof that a pasted result will match every Amazon marketplace. Keep the source date and the acceptance limitation beside the result.

```text
[optional cookie choice]
[h1 + local-processing promise]
[Write | HTML toolbar]
[contenteditable description]
[text count + HTML count] [Copy HTML] [Clear]
[rendered Amazon preview]
[tag source and limitations]
[FAQs]
```

### Competitor 4: Bookwiz

- URL: https://bookwiz.io/tools/kdp-book-description-formatter
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page calls itself a free KDP Book Description Formatter and promises clean HTML that can be copied into KDP.
- Inputs and defaults: [Observed] One textarea is prefilled with a sample description containing an h4, paragraphs, bold, italic, and a list. The page has no title, subtitle, or keyword fields.
- Action and state behavior: [Observed] The preview and count update as the textarea changes. A Copy KDP-ready HTML button is visible. Draft my Amazon listing is a separate AI upsell.
- Results and visuals: [Observed] The page shows a KDP preview, a count such as 387 / 4,000 characters, a removed-tags message when invalid tags are entered, an allowed-tag table, a stripped-tag table, and FAQs.
- Formula or data source: [Documented] Its twelve-tag list matches the current official [KDP description page](https://kdp.amazon.com/en_US/help/topic/G201189630), including h4 through h6 and excluding h1 through h3.
- Errors and edge behavior: [Observed] A controlled h3 and a input produced Removed tags: h3 a and a short explanation. The probe did not test malformed nesting, an over-limit description, or invisible characters.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. A textarea and a named copy button were visible. The page's wide reference tables rely on normal responsive wrapping or scrolling, which should be checked in implementation.
- Privacy: [Unknown] No clear local-only or no-upload statement appeared in the first-screen probe.
- Performance: [Observed] The prefilled preview loaded and the invalid-tag message appeared within the probe window. This is not a benchmark.
- Search-content structure: [Observed] The h1 leads with the KDP job. Headings cover allowed and stripped tags, the 4,000-character rule, use instructions, and questions.
- What works: [Inferred] Showing the exact removed tags provides a direct fix path and is more useful than a generic red status.
- What fails: [Inferred] The page pairs a policy checker with an AI listing upsell, which can blur a check-only job with copy generation.
- Do not copy: [Inferred] Do not reuse the phrase Amazon-safe as an acceptance claim. State exactly which checks ran and which KDP decisions remain unknown.

```text
[site nav]
[h1 + twelve-tag promise]
[description textarea with sample]
[KDP preview]
[count + removed tags] [Copy KDP-ready HTML]
[allowed-tag table]
[stripped-tag table]
[how-to and FAQs]
```

### Competitor 5: BookWriter

- URL: https://www.bookwriter.vip/amazon-book-description-formatter
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page asks whether an Amazon description is formatted to sell and combines KDP HTML output with a readability verdict.
- Inputs and defaults: [Observed] One textarea accepts plain text. The instructions say to use line breaks for paragraphs, start bullets with a hyphen and space, and treat the first line as a bold hook. No title, subtitle, or keyword fields are present.
- Action and state behavior: [Observed] The initial tool state showed Loading... while server-rendered worked examples were already visible. A programmatic fill did not produce a clear replacement result in the captured window, so live-update behavior was not fully accessible through this probe.
- Results and visuals: [Observed] Worked examples show word count, sentence count, average sentence length, character count, remaining characters, readability score, HTML length, fixes, and a table describing how description length changes the visible fold.
- Formula or data source: [Unknown] The page exposes a numeric readability score and labels such as Good and Excellent, but the first screen does not identify the reading formula or its source. Its KDP HTML list is a deliberately smaller subset than the official twelve tags.
- Errors and edge behavior: [Unknown] No explicit invalid, over-limit, or unsupported-tag result was observed. The stuck loading label makes the empty state ambiguous during the probe.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. The textarea had a useful placeholder. The loading state and dynamic result region need a keyboard and assistive-technology review.
- Privacy: [Documented] The page says calculations happen in the browser, nothing is uploaded, and no signup is required.
- Performance: [Observed] Server-rendered examples were available on load, but the interactive state still displayed Loading... during the probe. This is an observation, not a performance benchmark or confirmed defect.
- Search-content structure: [Observed] The h1 is a sales-oriented question. Headings cover worked examples, the visible fold, allowed tags, and fixes that can be pasted.
- What works: [Inferred] The tool connects description structure to the reader's first visible block, which is a useful writing concern after policy checks pass.
- What fails: [Inferred] The readability score is not an official KDP signal and may invite users to treat a writing heuristic as a listing verdict.
- Do not copy: [Inferred] Do not add an unexplained quality score to the primary result. If a readability check is included later, keep it secondary and name its method.

```text
[site nav]
[h1 + conversion promise]
[plain-text description textarea]
[interactive result, observed as Loading...]
[worked examples with scores and counts]
[fixes + HTML sample]
[fold-length table]
```

### Competitor 6: AuthorClimb

- URL: https://www.authorclimb.com/tools/description-formatter
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page promises a WYSIWYG description formatter, a live Amazon listing preview, KDP-safe HTML export, and cleanup of word-processor formatting.
- Inputs and defaults: [Observed] The page presents a rich editing area with desktop and mobile preview toggles. Three templates are visible: Hook to Synopsis to Author Bio, Bullet-driven non-fiction, and Series book. The public text probe did not expose a standard textarea element, but a controlled edit changed the visible preview.
- Action and state behavior: [Observed] The preview changes as text is entered. Copy KDP HTML and Copy plain text are visible. Loading a template warns that it will replace the current draft.
- Results and visuals: [Observed] The page displays an Amazon preview, an HTML count such as 81 / 4,000 characters, a plain-text count, color thresholds named Green, Amber, and Red, and template-driven output.
- Formula or data source: [Documented] The page says it uses only ten supported tags. The current official KDP page lists twelve, so the competitor either uses a conservative subset or has stale documentation. It does not explain the difference on the first screen.
- Errors and edge behavior: [Unknown] No separate unsupported-tag list, malformed-tag message, or prohibited-content finding was visible during the controlled edit.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. Desktop and Mobile preview controls are a useful direct comparison. The rich editor and toggle semantics require a full keyboard and screen-reader audit.
- Privacy: [Unknown] The first-screen text did not make a local-only processing or no-upload claim.
- Performance: [Observed] A controlled edit updated the preview and counts within the probe window. This is not a benchmark.
- Search-content structure: [Observed] The h1 names the preview job. Headings cover the reason for the tool, how to use it, cleanup, and FAQs.
- What works: [Inferred] The mobile preview toggle matches the way many shoppers view a product page and gives the user a concrete layout check.
- What fails: [Inferred] The ten-tag claim is unexplained, and the Listing Optimizer upsell turns a format check toward marketing optimization.
- Do not copy: [Inferred] Do not use a traffic-light score or a KDP-safe label without showing the exact rule set behind it.

```text
[site nav]
[h1 + preview promise]
[Desktop | Mobile]
[rich editor]
[Amazon preview]
[HTML count + plain-text count] [Copy KDP HTML] [Copy plain text]
[templates]
[guide and FAQs]
```

### Competitor 7: SmartKDP Listing Studio

- URL: https://smartkdp.com/tools/listing-studio
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] The page presents a paid, book-aware studio that writes or prepares a full KDP listing and produces an upload package.
- Inputs and defaults: [Observed] The anonymous page shows a static example with title and subtitle, description, seven backend keywords, and categories. The full workflow is tied to a book in the product, but no editable listing form was available without the account flow.
- Action and state behavior: [Observed] The page has no anonymous check or submit action. It shows product navigation, a login path, and a Notify me at launch email control. I did not enter an email or sign in.
- Results and visuals: [Observed] The example shows 89 of 199 characters combined, a description count of 756 of 4,000 characters, seven keyword rows with byte counts, category paths, a listing analyzer, translation, and a ZIP upload package as product capabilities.
- Formula or data source: [Documented] The page says its analyzer uses an internal KDP rule set and that keyword boxes are measured under a 50-byte limit. KDP's public [keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201298500) confirms seven keyword boxes but does not state that numeric byte limit.
- Errors and edge behavior: [Unknown] No editable field or invalid-state behavior was available in the anonymous view. The page does explicitly say the studio does not guarantee KDP acceptance, which is a useful limitation.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. The static example and capability sections remain readable at that width. The authenticated workflow was not reviewed.
- Privacy: [Observed] A cookie choice appears and describes optional analytics and advertising. The full product workflow requires an account and was not tested, so input retention and processing remain unknown.
- Performance: [Observed] The public product page loaded with a complete server-rendered example. This is not a benchmark of the authenticated tool.
- Search-content structure: [Observed] The h1 names the listing studio. Headings separate title and subtitle, description, seven keywords, categories, capabilities, limitations, FAQs, and pricing.
- What works: [Inferred] The example makes the relationship between the fields visible and shows the user what a complete listing package looks like.
- What fails: [Inferred] A paid AI studio is not a substitute for a small no-login checker. Its book-file dependency and generation workflow add scope that the planned tool does not need.
- Do not copy: [Inferred] Do not import AI generation, category selection, translation, or an unverified 50-byte pass or fail rule into the first checker.

```text
[cookie choice]
[h1 + full-listing promise]
[static title + subtitle example]
[static description example]
[seven keyword rows + byte counts]
[categories + analyzer + upload package]
[capabilities, limits, FAQs, pricing]
```

### Competitor 8: Amazon Assistance Listing Auditor

- URL: https://amazonassistance.com/tools/listing-auditor.html
- Accessed: 2026-09-16, 1440 x 1000 and 390 x 844
- Audience and promise: [Observed] This is a generic Amazon listing auditor. It says users can paste listing fields or fetch public listing data and receive a scored checklist.
- Inputs and defaults: [Observed] The visible form has an ASIN or product URL field, a target keyword, a title textarea, an Item Highlights textarea, five bullet-point textareas, one backend-search-terms textarea, and a product-description textarea.
- Action and state behavior: [Observed] Fetch is the main reference action. The page is designed for an explicit audit result, but I did not enter an ASIN, call the remote fetch, or submit a listing. No account was used.
- Results and visuals: [Observed] The form leads to an Audit results section. It explains title, Item Highlights, bullet points, backend search terms, and optional description as separate numbered sections.
- Formula or data source: [Documented] The page states a 75-character title rule and a 125-character Item Highlights field for its July 2026 Amazon seller policy. Those are not KDP book metadata rules and should not be carried into the KDP tool.
- Errors and edge behavior: [Unknown] The empty form did not expose the invalid ASIN or failed-fetch states. The tool's remote-fetch path creates a separate data and privacy state from a local paste checker.
- Mobile and accessibility: [Observed] The page had no horizontal overflow at 390px. Per-field labels and separate bullet textareas are a useful form pattern. The long form needs focus-order and error-summary testing.
- Privacy: [Documented] The page says no login is required and that nothing is sent anywhere, while also offering an ASIN fetch. The exact handling of a fetched request was not verified.
- Performance: [Observed] The public form loaded with its instructions and controls in the probe window. No remote fetch was performed.
- Search-content structure: [Observed] The h1 names the auditor. Numbered headings map directly to the fields and finish with an audit-result section.
- What works: [Inferred] The explicit one-field-per-row model and audit section show how a broad checker can keep repeated inputs understandable.
- What fails: [Inferred] Its product-field contract is the wrong one for KDP. It has one generic backend term field rather than seven book-keyword slots and leads with seller-specific fields.
- Do not copy: [Inferred] Do not copy generic Amazon title policy or ASIN fetching into a privacy-first KDP text checker.

```text
[site nav]
[h1 + auditor promise]
[ASIN or product URL] [Fetch]
[target keyword]
[title]
[Item Highlights]
[five bullet fields]
[backend search terms]
[description]
[Audit results]
```

## Comparison matrix

| Capability | MyBookPage | KDPEasy | SmartKDP formatter | Bookwiz | BookWriter | AuthorClimb | SmartKDP Studio | Amazon Assistance | User value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Title and subtitle fields | No | No | No | No | No | No | Yes in example | Generic title field | High |
| Seven separate keyword fields | No | No | No | No | No | No | Yes in example | One backend field | High |
| Description editor | Textarea | Textarea and toolbar | Rich editor | Textarea | Textarea | Rich editor | Static example | Textarea | High |
| Live rendered preview | Yes | Yes | Yes | Yes | Example and intended live result | Yes, desktop/mobile toggle | Static example | Not visible in empty state | High |
| Counts HTML in description budget | Yes, one total | Yes, one total | Yes, text and HTML split | Yes, one total | Yes, with HTML length | Yes, HTML and plain text | Yes in example | Generic character fields | High |
| Unsupported-tag feedback | Yes, names removed tags | Not visible in probe | Source-date and tag explanation; paste behavior not proven | Yes, names removed tags | Unknown | Unknown | Rule-set claim only | Unknown | High |
| Obvious restricted-content patterns | Limited description checks | Not visible | Description guidance, not a full field audit | Tag checks, not a full field audit | Writing heuristics | Cleanup and formatting | Claims a larger analyzer | Generic listing audit | High |
| Duplicate and title-keyword overlap | No | No | No | No | No | No | Claims it | Target-keyword match, not KDP overlap | High |
| Seven slots and cross-field findings | No | No | No | No | No | No | Yes in product claim | No | High |
| Copy or export | Copy HTML | Copy HTML and plain text | Copy HTML | Copy KDP HTML | HTML example | Copy HTML and plain text | Upload package claim | Not visible | Medium |
| Local/no-login promise | Documented | Unknown | Documented | Unknown | Documented | Unknown | Account for full flow | Documented, fetch path unknown | High |
| Source-linked KDP rule date | No visible source date | No visible source date | Yes | No visible source date | No visible source date | No visible source date | Internal corpus claim | Seller policy date | High |
| Mobile width observed without overflow | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | High |

The table stakes are spread across the market, but no single free page joins them. The clearest opening is field coverage plus honest rule scope, not another description formatter with a different template.

## Formula and data disagreements

| Question | Different behaviors | Best evidence | Decision still needed |
| --- | --- | --- | --- |
| Which HTML tags should the checker accept? | MyBookPage presents thirteen tags including strong and hr. KDPEasy presents h3 and hr. AuthorClimb says ten. BookWriter uses a smaller seven-tag subset. SmartKDP and Bookwiz show twelve. | The current [official KDP description page](https://kdp.amazon.com/en_US/help/topic/G201189630) lists twelve tags and explicitly excludes h1 through h3. | No. Use the twelve official tags as the launch allowlist and show the source URL and review date. |
| Does the 4,000 count include markup? | Most formatter pages show one combined count. SmartKDP shows text and HTML portions separately. | KDP says the editor counts all characters, including HTML tags, in [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630). | No. Make the raw field count primary and show a visible-text count as context. |
| Is the keyword limit 50 bytes per field? | SmartKDP's example and keyword page use 50 bytes. The other reviewed pages do not expose seven keyword inputs. | The official [keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201298500) says up to seven keywords and says to watch the character limit, but gives no universal numeric byte limit on the page reviewed. | Yes. Do not mark a keyword as over a KDP byte limit until an official numeric source or controlled KDP form check is recorded. A local length advisory must say it is local. |
| Is a repeated title word a violation? | SmartKDP treats boxes made entirely from title words as wasteful. KDP says to avoid information covered elsewhere, but competitors and community replies treat partial repetition differently. | KDP keyword guidance and metadata guidelines, especially the avoid list, are the authority. | Yes. Report exact duplicate phrases and title-word overlap as separate review findings. Do not label partial overlap a rejection. |
| Can a tool classify promotions, reviews, spoilers, or misleading copy? | Competitors use regex warnings, readability scores, internal rule sets, or no warning at all. KDP's list includes both obvious patterns and content judgments. | KDP's [metadata guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560) and [description restrictions](https://kdp.amazon.com/en_US/help/topic/G201189630) document the categories, not a public classifier. | Yes. Implement obvious patterns such as URLs, emails, phone numbers, prices, review-request phrases, and known markup. Use possible issue for pattern matches and state that semantic review remains manual. |
| Should the checker sanitize invalid HTML or only report it? | MyBookPage and Bookwiz show removed tags or cleaned output. KDPEasy and the rich editors constrain the editing flow. KDP advises checking source and matching opening and closing tags. | [KDP troubleshooting](https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L) and the official supported-tag table. | Yes. Preserve the original input, show exact findings, and offer a separately labeled cleaned copy only if the cleanup is deterministic and visible. Never silently rewrite a description. |

## Evidence-backed opportunities

| Rank | Opportunity | Evidence | User value | Trust | Clarity | Feasibility |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Join title, subtitle, description, and seven keyword checks in one local workbench | The six formatter pages omit title and keywords. SmartKDP's full-listing view is not an open checker. | High | High | High | High |
| 2 | Use the current official twelve-tag allowlist with a source date | Competitors show ten, twelve, thirteen, and seven-tag sets. KDP publishes the current list. | High | High | High | High |
| 3 | Show a field-specific issue list with exact excerpts and recovery text | KDP documents invisible characters and unsupported tags. MyBookPage and Bookwiz show the value of naming removed tags. | High | High | High | High |
| 4 | Treat duplicate phrases and title overlap as heuristics, not verdicts | KDP advises avoiding redundant metadata but does not publish the matcher. Community questions show the risk of overclaiming. | High | High | High | High |
| 5 | Count the raw description field and separate markup from visible text | KDP counts HTML tags. SmartKDP makes markup cost visible while other tools hide it. | High | High | High | High |
| 6 | Keep all processing local and exclude AI writing | Several competitors make local/no-login claims, while listing suites add accounts and generation. The planning explicitly rejects AI writing. | Medium | High | High | High |

1. **One cross-field preflight.** Ask for the five planned field groups and answer the question "what should I fix before I paste this into KDP?" in one ordered result. Group findings by title, subtitle, description, and keyword slot instead of returning one score.
2. **A conservative parser.** Use the official twelve-tag list. Detect unsupported tags, missing closing tags, malformed nesting, attributes, and suspicious invisible characters. Show what the tool saw and what a cleaned copy would change.
3. **A bounded metadata lint pass.** Normalize case, spacing, and punctuation for duplicate comparisons. Distinguish exact duplicates across keyword slots, full title coverage, partial title overlap, and empty slots. Each is a different review prompt.
4. **A preview that explains its limits.** Render the supported description tags from a safe parsed representation. State that the preview is an approximation and that KDP can change its renderer or review content beyond these rules.
5. **Source and freshness visible in the rule set.** Link to the official metadata, description, and keyword pages. Store the review date in the implementation so a future rule change is visible rather than silently changing the result.

## Table stakes

- One title field and one optional subtitle field with a combined character count.
- One description editor with raw character count, HTML-tag count, and rendered preview.
- Seven separately labelled keyword fields.
- Explicit check action or a clearly visible live result state.
- Findings tied to a field and a recognizable input pattern.
- Current twelve-tag allowlist, including h4 through h6 and excluding h1 through h3.
- Checks for HTML in title, subtitle, and keyword fields.
- Checks for obvious URLs, email addresses, phone numbers, prices, promotional terms, review requests, and empty keyword slots.
- Normalized duplicate comparison across keyword slots.
- Title and subtitle overlap shown as a heuristic, not a violation verdict.
- Copyable description output only after the original and changed tags remain visible.
- No account, no upload, and no AI generation for the first release.
- Mobile layout that keeps the seven keyword fields and issue text readable at 390px.
- A limitation that says the result is a preflight check, not KDP approval.

## Ideas to reject

- AI description or title generation. It changes the task from checking supplied metadata to producing copy, adds cost and privacy risk, and was excluded by the planning.
- Amazon scraping, search-volume scores, or competitor keyword extraction. Those jobs need freshness, create a separate data pipeline, and are not required to verify the supplied listing.
- A universal 50-byte keyword pass or fail without an official source. It would turn a competitor convention into a KDP fact.
- A single 0-to-100 approval score. It compresses different rule types into a number and encourages false certainty about KDP review.
- Trademark or legal clearance. A text pattern can point to a possible concern, but a trademark result is a separate search and legal question.
- Silent HTML rewriting. It hides the exact change that may alter the user's intended layout.
- Categories, author fields, ISBNs, or cover matching in the first version. They are real KDP metadata, but they are outside the supplied input contract and would make the first result harder to understand.

## Open questions and blockers

- Confirm whether a numeric keyword length limit is documented for the target marketplace and book format. Until then, the tool should not show a KDP-specific byte pass or fail.
- Decide whether description cleanup is an optional secondary output or a check-only report. If cleanup ships, preserve the original and show every changed tag.
- Define the exact pattern list for promotional language, review requests, prices, URLs, and emails. Keep semantic findings advisory and name false-positive recovery.
- Choose whether live updates are enough or whether a single Check metadata action better preserves a stable result for long descriptions. The answer should follow the final interface contract.
- Record the official source review date in the implementation and schedule a manual review when KDP changes the linked help pages.

There is no research blocker. The implementation can start with documented KDP limits and a clearly labelled set of local heuristics, provided it does not present unknown rules as official.

## Sources

- [KDP Metadata Guidelines for Books](https://kdp.amazon.com/en_US/help/topic/G201097560), accessed 2026-09-16. Official title, subtitle, description, keyword, and restriction guidance.
- [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630), accessed 2026-09-16. Official 4,000-character rule, HTML counting behavior, twelve-tag allowlist, and description restrictions.
- [Make Your Book More Discoverable with Keywords](https://kdp.amazon.com/en_US/help/topic/G201298500), accessed 2026-09-16. Official seven-keyword guidance and keyword avoid list.
- [Fixing errors or formatting with book descriptions](https://kdp.amazon.com/en_US/help/topic/GC4VASCGNQP6LQ7L), accessed 2026-09-16. Official troubleshooting for invisible characters, copied markup, and missing opening or closing tags.
- [Book Detail Resources](https://kdp.amazon.com/en_US/help/topic/G202105800), accessed 2026-09-16. Official explanation that book details are metadata and should be checked before submission.
- [Create a Book](https://kdp.amazon.com/en_US/help/topic/G202172740), accessed 2026-09-16. Official statement that HTML is not accepted in title, subtitle, author, contributor, or keyword fields.
- [MyBookPage Amazon Book Description HTML Formatter](https://mybookpage.com/tools/amazon-book-description-html-formatter), accessed 2026-09-16. Live competitor observation and description-only workflow.
- [KDPEasy Amazon Book Description Formatter](https://www.kdpeasy.com/tools/amazon-book-description-formatter), accessed 2026-09-16. Live competitor observation, templates, toolbar, preview, and copy behavior.
- [SmartKDP Amazon Book Description HTML Formatter](https://www.smartkdp.com/tools/book-description-formatter), accessed 2026-09-16. Live competitor observation, local-processing claim, split counts, source-date message, and preview.
- [Bookwiz KDP Book Description Formatter](https://bookwiz.io/tools/kdp-book-description-formatter), accessed 2026-09-16. Live competitor observation, removed-tag feedback, preview, and allowed-tag table.
- [BookWriter Amazon Book Description Formatter](https://www.bookwriter.vip/amazon-book-description-formatter), accessed 2026-09-16. Live competitor observation, readability result, HTML length, worked examples, and loading state.
- [AuthorClimb Description Formatter](https://www.authorclimb.com/tools/description-formatter), accessed 2026-09-16. Live competitor observation, WYSIWYG preview, templates, mobile toggle, and tag-count claim.
- [SmartKDP AI Listing Studio](https://smartkdp.com/tools/listing-studio), accessed 2026-09-16. Live public product-page observation of a full-listing example and account boundary.
- [Amazon Assistance Listing Auditor](https://amazonassistance.com/tools/listing-auditor.html), accessed 2026-09-16. Live competitor observation of a generic Amazon field-by-field auditor.
- [Amazon KDP: how to format the "about the book" text?](https://www.reddit.com/r/selfpublish/comments/f476mx), accessed 2026-09-16. Community evidence about format differences and delayed description updates.
- [KDP book description - HTML error](https://www.reddit.com/r/selfpublish/comments/xvhcu1), accessed 2026-09-16. Community evidence about unsupported tags appearing literally or disappearing.
- [Stuck on "Description contains an unsupported HTML tag."](https://www.reddit.com/r/KDP/comments/njq9t7), accessed 2026-09-16. Community evidence about unsupported-tag and invisible-character confusion.
- [New free Amazon Blurb Tool for you to check out](https://www.reddit.com/r/selfpublish/comments/boxmjg), accessed 2026-09-16. Community evidence about the need for a supported-tag formatter and above-the-fold preview.
- [Blurb Issues](https://www.reddit.com/r/selfpublish/comments/c6imfy), accessed 2026-09-16. Community evidence about spacing disappearing after save.
- [KDP Repetitive Keyword Flagging](https://www.reddit.com/r/KDP/comments/1prblvh), accessed 2026-09-16. Community evidence about unclear duplicate and title metadata flags.
- [Make Changes to Meta Data](https://www.reddit.com/r/KDP/comments/1smki9y), accessed 2026-09-16. Community evidence about the uncertainty around metadata edits and review triggers.

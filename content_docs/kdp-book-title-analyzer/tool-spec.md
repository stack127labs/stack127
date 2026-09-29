# KDP Book Title Analyzer

Route: `/kdp-book-title-analyzer`

## Research

### User job

The internal [KDP Tools roadmap record](https://app.notion.com/p/3e37bc97c44381b6b3b5e0aedba6a992) describes the job as checking title clarity, length, keyword use, and possible metadata issues. The useful decision is whether a drafted title and optional subtitle need a closer look before the author finalizes KDP book details.

There is already substantial overlap with stack127's [KDP Metadata Checker](/kdp-metadata-checker). Its current engine counts the combined title and subtitle, checks HTML and obvious URL, contact, price, review, and promotional patterns, and reports repeated keyword phrases or keyword phrases made entirely from title/subtitle words. It does not compare a title with the author's description of the book or intended reader. A new analyzer needs a title-context job to add value; repeating the existing preflight checks alone would be redundant.

The roadmap entry is a product-planning statement, not measured user demand. No user interviews, query-volume data, or usage data were available for this research.

### Competitor patterns

**Method and coverage.** On 2026-09-28 I searched for “book title analyzer,” “KDP book title checker analyzer,” “Amazon book title score,” and “KDP title analyzer.” I opened and operated public pages with headless Chrome at 1440 × 1000, using fictional sample text only. No account was created. Search results were used to find candidates, not to establish demand; search-volume coverage is unknown.

- **[Evaluate My Title — Book Title Analyzer](https://evaluatemytitle.com/book-title-analyzer)** is the closest open analyzer found. Its form asks for a title (up to 200 characters) and a book summary/topic (up to 800), with a format selector that includes “Book title.” The page says the title is judged in cover, search-listing, and recommendation contexts. It describes an overall rating, three subscores, word-level feedback, and two rewritten versions; it also says each run consumes a token, with five runs available without an account. I submitted a fictional title and summary. After eight seconds the page still showed “Scoring…” and a partial loading message, so I did not observe a completed result. The advertised analysis is AI-based and general-purpose rather than a transparent KDP rule check. Its 200-character input cap is a competitor limit, not evidence of KDP's exact boundary.
- **[Clever Fox Publishing — Book Title Checker](https://cleverfoxpublishing.com/book-title-checker/)** advertises 12+ AI/NLP checks: memorability, negative words, spoken appeal, readability, sentiment, spelling, trends, uniqueness, similar titles, and audience fit. The public page does not explain the scoring method or show a result. “Try It Now” led to an author sign-in page, so the analyzer could not be operated without an account. Its promises show the common appeal of broad market-fit scores, but provide no evidence for their accuracy.
- **[SmartKDP — Book Title Generator](https://smartkdp.com/tools/book-title-generator)** is an adjacent generator, not a title analyzer. Its public form takes a short book description and optional genre and audience, then generates candidates. The page says it applies selected KDP rules, filters empty or duplicate suggestions, and offers five sets a month without an account. It provides a brainstorming workflow, not evidence that an existing title is clear, relevant, or likely to sell.

The observed split is between broad AI scores or title generation and narrow metadata checks. Public marketing claims commonly combine “readability,” “discoverability,” and “market appeal,” but the reviewed analyzers do not expose a validated measure for those outcomes. The closest transparent opportunity is to show concrete text evidence tied to the author's own book context and keep policy checks separate from interpretation.

### Technical facts and sources

| Topic | Verified fact | Safe interpretation |
| --- | --- | --- |
| Title meaning | KDP says the title field should contain the actual book title as it appears on the cover; it calls titles the most frequently used search attribute. A subtitle is optional and provides additional information about the book. | A text-only tool cannot verify cover or manuscript matching without those materials. Do not turn KDP's statement about search attributes into a ranking weight or outcome forecast. |
| Combined title length | [Metadata Guidelines for Books](https://kdp.amazon.com/en_US/help/topic/G201097560) says title and subtitle together must be **fewer than 200 characters**. KDP's [Books Titles & Editions](https://kdp.amazon.com/en_US/help/topic/GW7J4WEKBVU25YEC) says they must be **200 characters or less**. Both are official pages, so exactly 200 is ambiguous in the published guidance; values above 200 exceed both statements. Neither page defines how characters such as emoji or combining marks are counted. | Keep the two sources visible. Do not describe the 200 boundary or a local Unicode counting method as a verified match for KDP's input validator. The existing checker uses a strict under-200 interpretation. |
| Title and subtitle rules | KDP prohibits HTML in title and subtitle fields. Its title guidance also lists repeated generic keywords, unauthorized references to other titles/authors or trademarks, false claims of involvement, sales-rank and promotional references, punctuation-only titles, and certain placeholder-only values. Title and subtitle must follow the same guidelines. | HTML, punctuation-only values, exact placeholder strings, and obvious promotional terms can support bounded local checks. Authorization, trademark status, cover matching, whether a word is promotional in context, and whether metadata misrepresents the book need human review. KDP says review uses machine learning, automation, and human reviewers; it does not publish the full decision procedure. |
| Keyword guidance | KDP permits up to seven keywords. It recommends accurate, reader-oriented terms, suggests 2–3-word phrases, and warns against vague or unrelated terms. Its example contrasts specific place names with a broad word already in the title. | A local tool can show literal overlap between author-supplied topic/reader terms, target phrases, and title text. That is text coverage only; it cannot decide semantic relevance or demand. The reviewed official guidance states no numeric per-keyword character limit. |
| Clarity and performance | KDP publishes no formula, score, or ideal word count for title clarity. KDP's [Search Results guidance](https://kdp.amazon.com/en_US/help/topic/GATLM5TG2NFRXQ89) says top placement is not guaranteed and results can change based on multiple factors, including past sales, availability, listing age, and popularity. | Click-through rate, search position, ranking, sales, conversion, uniqueness, and trend predictions are unsupported without independent data and validation. Do not imply a local title score predicts them. |

Primary sources, checked 2026-09-28:

- [Metadata Guidelines for Books](https://kdp.amazon.com/en_US/help/topic/G201097560) — title/subtitle meaning and length, title restrictions, and keyword guidance.
- [Books Titles & Editions](https://kdp.amazon.com/en_US/help/topic/GW7J4WEKBVU25YEC) — title-cover matching, the conflicting length boundary, format matching, and subtitle behavior.
- [Create a Book](https://kdp.amazon.com/en_US/help/topic/G202172740) — book details matching and the no-HTML rule for title and subtitle fields.
- [How do I add/change my keywords?](https://kdp.amazon.com/en_US/help/topic/G201743260) — up to seven keyword fields and an example of specific versus vague terms.
- [Search Results](https://kdp.amazon.com/en_US/help/topic/GATLM5TG2NFRXQ89) — no top-placement guarantee and factors that can affect search ordering.
- [Guide to Kindle Content Quality](https://kdp.amazon.com/en_US/help/topic/G200952510) — metadata mismatch, keyword/genre/promotion, and spelling examples.

### Opportunity and blockers

Make the output a transparent local review rather than an approval or marketability score. The documented KDP rule checks can cover the published title rules and combined length, while a separate heuristic view can expose word counts, repeated wording, title/subtitle overlap, and literal term matches against context supplied by the author. Label each heuristic as a prompt. If the author supplies no topic, reader, or target phrases, semantic clarity and keyword relevance remain unknown; report that limit instead of inventing a result.

Keep the distinction from the existing metadata checker clear: do not rebuild its seven-keyword duplicate and title-overlap audit as the main feature. The opportunity is title-focused context and explainable evidence, while the existing checker remains the whole-listing metadata preflight. No title score, AI rewrite, Amazon autocomplete, ASIN lookup, marketplace corpus, uniqueness/trademark verdict, or traffic forecast is supported by the available sources.

There is no backend blocker for local counts and exact text comparisons. The exact 200-character boundary is unresolved because KDP's official pages conflict, and its character-counting method is unpublished. No official title-clarity formula or numeric title optimum was found. Market/trend/uniqueness analysis would require maintained external data or a service and still would not justify predicting clicks, rank, or sales; it is outside the defensible local scope. User demand beyond the internal roadmap statement is also unknown.

## Product

### Promise and scope

Primary user: an independent author refining a draft KDP title before entering book details. The job is to see which words and chosen phrases in the draft match the author's own short description of the book and intended reader, then spot wording that deserves a human reread. The answer is literal, inspectable text evidence with a small title-only KDP guidance check. It does not rate whether a title is clear, marketable, or likely to rank.

This is a title-context review, distinct from the existing [KDP metadata checker](/kdp-metadata-checker). It asks for no book description HTML or seven keyword slots, does not audit a whole listing, and does not repeat the metadata checker's keyword-duplication work. The author can take a revised title to that checker for the full preflight. Launch is English-language wording assistance for one title and optional subtitle, using only text the author enters. It excludes AI rewrites, title scores, ideal word-count claims, search-volume or keyword-demand claims, autocomplete, title uniqueness or trademark decisions, cover or manuscript matching, KDP approval, and click, rank, or sales predictions.

### Technical contract

**Inputs.** Required title; optional subtitle; optional book topic (a short description of what the book covers); optional intended reader; and optional target phrases, one phrase per line, at most three nonempty lines. Keep all text exactly as entered for display and editing. A title or subtitle may be up to 500 Unicode code points, topic up to 500, reader up to 200, and each target phrase up to 80; these are local input guards, not KDP field limits. A phrase must contain at least one letter or number. Empty lines are ignored; duplicate phrases after matching normalization are invalid and stay visible for correction. Blank topic, reader, or phrases are allowed. A title made only of whitespace is invalid. Trim fields only to decide whether they are present; do not silently rewrite them. Reject wrong input shapes and any field over its guard before analysis. No source text is sent to a service.

**Deterministic text method.** Normalize CRLF and CR to LF for analysis, but preserve the original form value. Count Unicode code points with `Array.from`, including spaces and punctuation; the combined local count is title count plus subtitle count plus one separator if both fields contain non-whitespace text, matching the existing checker convention. KDP has not published its counting method. For literal matching only, normalize each string to Unicode NFKC, lowercase it, and split into runs of Unicode letters or numbers. Do not stem, translate, remove accents, or claim synonyms match. Exclude this fixed English function-word list from topic and reader term comparisons: `a, an, and, are, as, at, be, by, for, from, in, into, is, it, of, on, or, that, the, this, to, was, were, with`. Deduplicate context terms in their first-seen order. Compare each topic and reader term separately with the union of title and subtitle terms; report exact terms found in the draft and terms present only in the supplied context. An absent context term is a review prompt, never a requirement to put every word on the cover.

Normalize target phrases with the same tokenizer but retain all words, including function words. A phrase matches only a contiguous token sequence inside the title or inside the subtitle; do not manufacture a match across the two fields. Report each phrase as in title, in subtitle, in both, or not found, in entered order. This is literal coverage, not keyword relevance or search demand. For wording prompts, report an immediately repeated normalized word within either field and any identical two-word sequence shared by title and subtitle that includes at least one non-function word. Quote the exact repeated word or phrase and identify the field; these are prompts, not errors, since repetition can be intentional. Show title and subtitle word counts as descriptive local facts, with no ideal range or score.

**KDP guidance checks.** Show the local combined character count. Under 200 is below both published numerical boundaries, exactly 200 is an ambiguous boundary because two official KDP pages disagree, and above 200 exceeds both published boundaries by this local counting method. Never call any of those states KDP acceptance; make the unresolved boundary and unpublished counting method visible beside the count. At exactly 200, note that the existing metadata checker follows the stricter under-200 guidance; suggest shortening to 199 or fewer local characters without claiming KDP necessarily rejects 200. Flag complete HTML-like tags using the existing metadata checker's title-tag pattern, without rendering them. A nonblank title made entirely of Unicode punctuation and whitespace receives a documented title-guidance issue. Leave promotional wording, trademark authorization, cover matching, and semantic accuracy to human review and the whole-listing metadata checker rather than making a local approval verdict. Keep the official KDP links and the 2026-09-28 source review date with the check.

**Result and states.** `Review title` is the one primary action. With topic or reader text, lead with the exact context words found in the draft, or clearly state that none match literally; then show source-specific found/only-in-context lists, target-phrase matches, local counts, wording prompts, and documented guidance issues. If only target phrases were supplied, lead with their literal match outcome. If all three context inputs are blank, produce a partial title-only result and say that subject, reader fit, and phrase use remain unknown. Omit unavailable context regions rather than show zeros. A result with no prompts or guidance issues says only that no local issues were found, never that the title is good or approved. Invalid submission shows field errors and no previous result. Editing any input clears the previous result until resubmission; reset returns all fields to blank. Calculation is local and synchronous, so there is no normal loading or network retry. Unexpected calculation failure preserves input, removes stale output, and offers the same action again. Never render input as HTML, store it, put it in a URL, or send it in analytics.

### Known examples

| Inputs | Expected answer |
| --- | --- |
| Title `Balcony Herbs`; subtitle `Growing Food in Small Spaces`; topic `Grow herbs on apartment balconies and small patios`; reader `Apartment gardeners`; phrases `balcony herbs` and `urban gardening` on separate lines | Local title count is 13, subtitle count is 28, combined count is 42. Topic content terms are `grow, herbs, apartment, balconies, small, patios`; exact draft matches are `herbs, small`, while `grow, apartment, balconies, patios` appear only in the topic. Neither `apartment` nor `gardeners` from the reader matches. `balcony herbs` appears in the title; `urban gardening` does not. `balcony` does not match `balconies`, and `grow` does not match `growing`. No score or search claim follows. |
| Title `Quiet Garden`; subtitle `Quiet Garden for Beginners`; all context blank | Return a partial title-only result. The exact two-word sequence `quiet garden` appears in both fields as a review prompt. Subject and reader fit remain unknown; no invented context match or quality verdict appears. |
| ASCII title of 199, 200, then 201 `A` characters; empty subtitle | Local counts are 199, 200, and 201. At 199, show no numerical boundary notice; at 200, show the official-guidance conflict; at 201, show a local over-boundary issue. No result claims to reproduce KDP's unpublished character validator. |
| Title `A📘` with empty subtitle; then title `<b>Herbs</b>` | `A📘` is two local Unicode code points even though its UTF-16 length is three. The second input is flagged for HTML-like markup and is shown as text, never executed or rendered as bold. |
| Blank title; four nonempty target-phrase lines; or two phrase lines that normalize to the same words | Each is invalid with the specific field error and no result. Blank optional context is valid and yields a partial result. |

### Ownership

Flat route `/kdp-book-title-analyzer` under `app/(site)/(tools)/kdp-book-title-analyzer/`. Its server page uses the shared shell, `PageCanvas`, `ToolPageHeader`, and `ToolPageMarkdown`; a route-owned client workbench owns input, submission, and result layout with scoped module CSS. Pure guards, local counts, matching, and typed valid/partial/invalid/unavailable results belong in `lib/kdp/book-title.ts`. Reuse `KDP_TITLE_SUBTITLE_LIMIT` from `lib/kdp/metadata.ts`; extract a shared pure title rule helper if necessary, keeping the existing metadata checker's behavior unchanged. Focused logic tests belong under `tests/pages/kdp-book-title-analyzer/` for Unicode counts, the 199/200/201 boundary, literal matching, phrase order, repetition, absent context, guards, and markup-as-text. No runtime script or external dataset is needed; an integration-only script, if required, belongs under `scripts/kdp-book-title-analyzer/`.

This `tool-spec.md` owns the plan. Final page and card copy and tool version belong to `public.stack127_tool_pages`; the flat slug, publication flag, public dates, SEO metadata, and canonical behavior belong to `public.stack127_pages`, not route files. Catalog membership belongs to `public.stack127_tool_catalog_memberships`.

### Catalog placement

Primary catalog, rank 1: existing `/kdp-tools`, where an author choosing KDP details can move from a title draft to the full metadata check. No secondary catalog fits this title-specific job, and no new catalog is needed.

Catalog-card `toolSpot` brief: a closed book cover under a small magnifying glass, conveying a close review of title wording. The book cover is the recognizable focal subject, and the glass is the only supporting object. Use a curious, careful tone, with blank cover marks instead of visible words; make both silhouettes legible at card size in dark and light themes. Art key: `kdp-book-title-analyzer`.

## Interface

### Flow

User question: "Which parts of my draft title match the book and reader I described, and what wording deserves another look?" One control mode, `single`, keeps all active assumptions visible. Put required Title first, optional Subtitle second, then `Book topic`, `Intended reader`, and `Target phrases` (one per line, up to three). The optional context fields remain visible because they create the distinct answer. Keep brief field guidance beside topic and phrases; placeholders are examples, not labels. `Review title` is the only primary action, followed by a quiet `Reset`. A link to the full KDP metadata checker belongs after the review or in supporting content, not beside the primary action.

The result begins with one `UiResultLead` sentence about literal context matches. If topic or reader text is present, give the distinct match counts by supplied source, or say that none matched; the exact terms appear only in the lists below. These counts are observations, not a grade or a failed clarity test. If only target phrases were entered, lead with how many phrases appear literally; the phrase list carries their exact text. If no context was entered, lead with `Title wording checked; book-context fit is unknown.` Below it, keep each region's job separate: (1) topic and reader terms found in the title/subtitle versus terms only in the supplied context, grouped by source; (2) entered target phrases with `Title`, `Subtitle`, `Both`, or `Not found`; (3) local title, subtitle, word, and combined character counts with the 200-character guidance state; (4) title wording prompts and documented KDP guidance issues, each labeled by type and source field; (5) a concise source and limits disclosure with the two conflicting official length pages. Omit blank-source regions. Do not turn exact-match counts into a grade, progress bar, percentage, or color-coded title score. Long term lists are text lists, not a chart.

### Components and states

Reuse `UiTextField` for title, subtitle, and intended reader; `UiTextArea` for book topic and the three-line target-phrase input; `UiActionRow` and `UiButton` for actions; `UiStatus` for concise live feedback; `UiResultLead` for the single result headline; and `UiKeyValueList` for counts and phrase status where a label-value pair reads cleanly. Use route-specific semantic lists for matched and unmatched terms and for prompts, since their exact text and source-field grouping are specific to this analyzer. `UiDisclosure` may hold source details after the answer, but no input, finding, or recovery step is hidden there. No new shared control or result component is required. Mark Title required visibly and programmatically. Preserve the author's capitalization and punctuation in the fields; result quotations are escaped text nodes, never HTML.

Initial state is a blank form with no result and an enabled primary action. Blank optional context is valid and produces the partial title-only result described above. A context match result shows literal found and only-in-context terms without a success or danger grade. A target phrase not found is a neutral fact and prompt to review, not an error. A 200-character local count gets a specific ambiguity notice; above 200 gets a local over-boundary issue; HTML-like tags get a documented issue. An empty title, oversized field, too many phrase lines, duplicate phrase, or invalid phrase gets one field-level error; focus the first invalid input and show no result or duplicate error panel. Editing after a result removes stale findings and announces once that another review is needed. Reset clears source, errors, and results and returns focus to Title.

Analysis is synchronous and local, so no loading, remote empty-state search, or ordinary retry is needed. Unexpected calculation failure keeps source values, clears stale output, announces one unavailable message, and leaves `Review title` available to retry. The clean canonical URL has no query state; reload and back/forward start at the blank form, with no saved or restored draft. A long unbroken title, emoji, combining marks, long phrase, or large term list wraps or stays in a contained region without clipping, silent truncation, or page-level horizontal scroll.

### Responsive and accessible behavior

Use the shared full-width workbench band with one inner measure and one divider between form and result; do not nest separate cards around the form or finding groups. On desktop, keep Title and Subtitle as readable full-width rows; Topic and Intended reader can share two columns if each retains a useful text width, followed by full-width Target phrases and actions. At mobile width, stack all inputs, `Review title`, `Reset`, the lead, and the result regions in the same reading order. Use site spacing, `--radius`, `--focus-ring`, base text, mono for local counts, and semantic text tones only for real guidance issues. Lists wrap naturally; there is no table or chart to scroll.

Tab order follows the visible fields, primary action, Reset, then any result disclosure or related link. Enter submits the form except in a multiline context field, where it inserts a line break. On valid submission, focus the `UiResultLead` so the exact-match or partial-state sentence is announced. Use `UiStatus` to announce `Title reviewed` once without repeating the lead's terms. On invalid submission, focus the first field error and associate its message with that input. On first edit after a result, keep focus in the field and announce that the old result was cleared; do not announce on every keystroke. Reset returns focus to Title; an unexpected failure is announced as an alert without losing source text. Check 390px and desktop in both themes: labels, long quotations, status words, and focus rings must remain legible without relying on color alone.

## Content

Follow `stack127_docs/writing-style.md` for writing, visual choices, and SEO wording.

Use the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md` to prepare the writing directions below.

### Search intent and metadata direction

Target an author who has a draft title and wants a transparent KDP title review before entering the listing. The visible title should name the title analyzer and ask which wording matches the book and intended reader. The SEO title should use “KDP book title analyzer” and signal literal context checks, not scoring or optimization. The description should mention optional topic, reader, and target phrases plus the boundary between local checks and KDP guidance.

### Page promise

The reader can see exact words shared with their own book context, identify target phrases that appear literally, and find wording or documented length issues that deserve review—without being given a quality score.

### Content completeness map

- “Does the title include my topic and reader terms?” The UI separates exact matches from terms found only in each supplied context; explain that absent words are prompts, not requirements.
- “Does a target phrase appear?” The result reports title, subtitle, both, or not found. Explain that matching is contiguous and does not infer synonyms or search relevance.
- “How long is this draft?” The UI shows local code-point counts and a boundary state. Explain KDP's conflicting 200-character pages and unpublished counting method.
- “Is this title good or likely to rank?” The UI has no such verdict; explain that clarity, cover fit, authorization, uniqueness, and performance remain for human review.

### Recommended outline and formats

The introduction should meet an author refining a title and explain that the tool compares exact words from the title and subtitle with context supplied by that author. There is no supported title score or formula; do not invent one.

After the workbench, use “How to read a title review” for literal topic and reader matches, target-phrase boundaries, repetition prompts, counts, and invalid-input recovery. Include one `[!EXAMPLE]` based on the `Balcony Herbs` case in Product. Use a `[!NOTE]` for the conflicting official 200-character guidance and unknown KDP count method. No chart, table, or article marker art is useful. End with a link to the full metadata checker.

### Concepts and result interpretation

“Found” and “only in context” are exact normalized terms, not semantic judgments. For example, `herbs` and `small` appear literally in the Product example while `grow` does not match `growing`; the tool does not stem words. A missing term may be appropriate for a title. A repeated phrase prompt may be intentional. At exactly 200 characters, KDP sources conflict, and local Unicode code-point counts may differ from KDP's unpublished validator. A clear result does not establish marketability, uniqueness, title-cover fit, or approval.

### Usage, limits, and next step

Explain how to add a draft title, optional subtitle, a short topic and intended-reader description, and up to three phrases. Show where to correct blank titles, oversized fields, duplicate phrases, and too many phrase lines. Explain a partial title-only result when no context is supplied. Do not claim an ideal word count, title score, keyword demand, top placement, trademark clearance, cover match, or sales outcome. The next step is the whole-listing KDP metadata checker.

### Source roles and links

Use [KDP metadata guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560), [Books Titles & Editions](https://kdp.amazon.com/en_US/help/topic/GW7J4WEKBVU25YEC), and [Create a Book](https://kdp.amazon.com/en_US/help/topic/G202172740) for title, subtitle, and field guidance. Use [KDP keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201743260) only for its seven-field and phrase advice, and [KDP search results guidance](https://kdp.amazon.com/en_US/help/topic/GATLM5TG2NFRXQ89) to avoid performance promises. Sources were checked 2026-09-28. Link internally to the [KDP metadata checker](/kdp-metadata-checker).

# 7 Backend Keywords Builder

Route: `/kdp-backend-keywords-builder`

## Research

### User job

Inferred job: a self-publishing author has a rough list of relevant search phrases and wants to clean it up and prepare up to seven KDP keyword entries. The public route is `/kdp-backend-keywords-builder`.

The existing [KDP metadata checker](/kdp-metadata-checker) already accepts a title, subtitle, description, and exactly seven keyword fields. It reports exact duplicate phrases, keyword phrases fully covered by title or subtitle words, and bounded policy-like patterns. Its over-50-Unicode-character warning is explicitly a local review prompt, not an official KDP limit. The report labels duplicate and overlap findings as review heuristics. It does not take a separate pool of candidate phrases and organize that pool. A builder that only repeats the checker's seven-field validation would duplicate an existing stack127 tool.

### Competitor patterns

Checked 2026-09-28. I operated three public tools with generic sample book text. The commercial research pages below were reviewed publicly; their signed-in research results were not available to test.

- [Observed: Hidden Gems Amazon Keyword Organizer](https://www.hiddengemsbooks.com/amazon-keyword-tool/). Accepts a comma- or line-separated list, removes repeated words, packs the remaining terms into seven fields, shows unused character counts, and provides a copy action for each field. On a sample containing repeated phrases, it combined several entries into two fields and reported the removed words. It does not take book metadata or show demand data. This is a direct match for basic candidate-list organization.
- [Observed: Publishing.co.uk KDP Keyword Checker](https://publishing.co.uk/tools/kdp-keyword-checker/). Shows title, subtitle/series, author, and seven keyword fields, then explains field-specific findings against KDP's published avoid list. It separates KDP guidance from its own recommendation to avoid repeating words across slots, says it runs in the browser, and explicitly says it could not verify the numeric field limit or search volume. This is the closest competitor to stack127's existing metadata checker.
- [Observed: ManuscriptReport KDP Keyword Generator](https://manuscriptreport.com/tools/kdp-keyword-generator). Takes an optional title and a synopsis, then returns seven generated phrases with relevance scores and short reader-intent notes. My generic sample returned “coastal mystery with family secrets,” “small island disappearance mystery,” and five related phrases. The free generator says it has no Amazon search-volume data, though it also labels competition as low or medium without explaining the basis. Treat those labels as unverified editorial output, not measured market demand.
- [Documented: BookBeam Keyword Filler](https://bookbeam.io/keyword-filler/) arranges user-supplied terms into seven KDP fields. Its separate [Keyword Research Tool](https://bookbeam.io/keyword-research-tool/) markets demand and competition metrics plus a reverse-keyword tool. [Publisher Rocket](https://publisherrocket.com/) similarly markets search estimates, competition analysis, and reverse-ASIN research. These are wider, paid research products; I did not test their signed-in data.

Common results are seven copy-ready entries, some form of duplicate or title-overlap cleanup, and either manual phrase entry or generation from book text. The gap is a clearly explained boundary between source-backed KDP advice, local cleanup heuristics, and market claims. Competitor character counters often repeat a 50-character figure, but one current checker declines to claim that number because KDP's public help does not state it.

### Technical facts and sources

KDP's current public guidance, checked 2026-09-28, says to use up to seven keywords or short phrases, combine them in a logical order, think like a reader, and inspect Amazon search suggestions. Its metadata guidelines recommend phrases of two to three words. These are recommendations, not a promise that a phrase will rank or a complete description of Amazon's indexing algorithm. [Make Your Book More Discoverable with Keywords](https://kdp.amazon.com/en_US/help/topic/G201298500) and [Metadata Guidelines for Books](https://kdp.amazon.com/en_US/help/topic/G201097560).

KDP's keyword page says to avoid information already covered by other metadata or categories, subjective quality claims, time-sensitive wording, generic category terms, spelling errors, spacing/punctuation/capitalization/plural variants, misleading or unauthorized names/brands, Amazon program names, quotation marks, and HTML tags. The metadata guidelines give prohibited examples including other authors or their books, sales-rank claims, promotions, unrelated terms, and HTML. Keep “KDP says to avoid” distinct from a proven rejection: the rules describe examples and say the list is not exhaustive, and KDP retains review authority.

The public keyword page confirms “up to seven” and tells authors to watch the character limit shown in the text field. It does not state a numeric per-field limit. The exact current limit is therefore unknown from public official sources; values such as 50 characters are competitor claims, not verified KDP rules. KDP also does not explicitly prohibit repeated words across the seven fields as a standalone rule. Avoiding exact duplicates or cross-field word reuse can be a local organization heuristic. Avoiding metadata/category repeats and near-duplicate spelling or formatting variants is in KDP's published avoid list.

### Opportunity and blockers

The opportunity is narrow because free tools already organize candidate phrases, and stack127 already has a metadata checker. Any later product scope needs to center on a distinct author task, such as organizing the author's own candidate pool, while keeping KDP guidance separate from local heuristics. It should not imply KDP approval, search demand, ranking, or sales results.

A local organizer that only processes user-provided phrases and book metadata needs no search dataset or account. Search-volume estimates, competition scores, sales estimates, and reverse-ASIN results are a separate research product: KDP's public keyword guidance supplies no such measures, while competitors market their own researched datasets. Those features require a selected, maintained, appropriately licensed data provider or API and a separate approval for its cost, terms, and upkeep. No such provider is selected for this spec. Live Amazon autocomplete collection would also need its own source-access and terms review; do not assume scraping is an approved substitute.

## Product

### Promise and scope

The primary user is a self-publishing author who has researched relevant reader phrases and needs to turn a rough candidate list into up to seven KDP keyword entries. They paste one candidate phrase per line, in their preferred priority order. The builder groups those phrases into seven copyable field drafts, removes repeated candidate phrases, and shows what needs review or did not fit. This is the phrase-organizing step before the separate [KDP metadata checker](/kdp-metadata-checker), which checks a completed listing and its seven entered fields. The builder does not ask for a description or repeat the checker's whole-listing preflight.

Launch is a free, local text organizer. It does not invent keywords, rewrite phrase wording, choose categories, consult Amazon search suggestions, check actual KDP entry acceptance, or estimate search volume, competition, ranking, or sales. Relevance, authorization to use names or brands, and the final choice of keywords remain with the author. KDP's current public help gives no numeric universal per-field character limit, so the builder's visible, editable planning cap is a local packing choice, not a KDP rule or approval result.

### Technical contract

**Inputs.** A required multiline candidate list has one phrase per line. Blank lines are ignored; commas stay inside a phrase and never split it. Optional title, subtitle, and chosen category labels (one category per line) support literal overlap review only. A visible planning cap defaults to 50 Unicode characters per field and accepts whole numbers from 10 to 200; the author can enter the limit shown in their current KDP interface. The raw candidate list is limited to 64 KiB UTF-8, 100 nonblank lines, and 200 Unicode characters per normalized line. Title and subtitle are each limited to 500 characters; category input is limited to 10 nonblank lines of 200 characters each. Bounds protect responsive rendering and local processing, not KDP eligibility. Exceeding a bound or giving a noninteger/out-of-range cap is a field error; no new draft is produced and no input is silently cut off.

**Preparation and placement.** Normalize line endings, Unicode to NFC, leading/trailing whitespace, and internal whitespace runs to one ASCII space. Preserve all other visible phrase wording. For duplicate detection only, lowercase and turn runs of characters other than Unicode letters or numbers into one space. Keep the first candidate with each nonempty normalized key; list later capitalization, punctuation, and spacing variants as omitted duplicates with their source line. A line whose normalized key is empty needs editing and is not placed. Do not stem, singularize, translate, remove words, or recombine fragments. A candidate longer than the selected cap remains unplaced with its measured length; it is not shortened. For each remaining unique candidate in source order, try fields 1 through 7 and append it to the first field where it fits, using exactly one space between whole phrases. Empty field length is zero; count Unicode code points after NFC normalization, including spaces and punctuation. Exact cap equality fits. Once no field fits, report the candidate as unplaced and continue trying later, shorter candidates. This stable first-fit method processes the author's priority order and preserves order within each field, although a shorter later candidate may fill space in an earlier field. It avoids an unexplained quality score and does not claim that the combinations are optimal or best for search.

**Review rules.** Label source-backed KDP advice separately from local organization prompts. KDP says to avoid wording already covered by other metadata or categories, quotation marks, HTML, promotion or rank claims, time-sensitive language, misleading or unauthorized names, and superficial spelling or formatting variants. The builder automatically omits only normalized duplicate candidate phrases. For a candidate whose meaningful words (Unicode letter/number runs longer than two characters) are all present in the combined set of supplied title, subtitle, and category words, show a literal overlap prompt without automatically dropping it. Show bounded prompts for HTML-like tags beginning with `<` and an ASCII letter or `</` and ending with `>`, straight or curly double quotation marks, and case-insensitive whole terms such as `free`, `sale`, `#1`, `bestseller`, `latest`, `KDP`, and `Kindle Unlimited`; these are possible review signals, not proof of a violation. Also identify content words longer than two characters repeated in separate placed candidates as a **local reuse prompt**: KDP does not separately ban a repeated word across fields. A phrase of one word or more than three words gets a recommendation prompt because KDP suggests short phrases of about two to three words. Prompts never change the draft. Do not claim to detect all prohibited terms, spelling errors, irrelevant phrases, unauthorized uses, or semantic overlap. If optional metadata is absent, say overlap with that metadata was not checked. The official [keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201298500) and [metadata guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560), reviewed 2026-09-28, govern the public claims; the default cap, literal matching, duplicate key, and placement order are disclosed stack127 choices. No rounding or market data is involved.

**Output and states.** One primary action, `Build keyword fields`, produces exactly seven numbered draft strings, including empty slots, each with its local character count. Populated slots have a per-field copy action. Lead with how many distinct candidates were placed; then show omitted duplicates, needs-edit lines, unplaced phrases with reasons, and review prompts tied to source lines or resulting fields. A draft with any unplaced or needs-edit phrase is explicitly partial. A draft with prompts remains copyable but asks for review before pasting into KDP. An empty or whitespace-only list, or a list with no usable phrase, produces no draft and gives a direct edit path. Changing any input marks the last draft stale and prevents stale copy actions until rebuilding; reset clears inputs and output. Clipboard failure leaves each value selectable and reports that copying failed. Local synchronous processing has no service loading or network retry state; an unexpected processing failure preserves inputs and gives a rebuild action.

Phrase text and optional metadata are processed in browser memory only. They are not put in URLs, browser storage, server requests, analytics events, or logs. Render every phrase and finding as escaped text, never as HTML; copying emits only the displayed draft string. Site shell and source links may still make ordinary site requests. No account, search dataset, API key, or remote autocomplete collection is part of launch.

### Known examples

- With the default 50-character cap, lines `cozy cat mystery` (16), `small town secrets` (18), and `amateur sleuth` (14) produce field 1 as `cozy cat mystery small town secrets amateur sleuth`, exactly 50 characters. Fields 2 through 7 are empty. A fourth line `Cozy, cat mystery` has the same duplicate key as line 1 and is omitted; it does not consume space.
- With cap 12 and eight lines `oak woods`, `pine trail`, `sea cave`, `river map`, `hill path`, `quiet bay`, `moon lake`, `stone gate`, the first seven fill fields 1 through 7 one apiece. `stone gate` is unplaced because all seven fields are occupied and no existing field has room for a space plus ten characters. The result is partial.
- With title `Harbor Secrets` and one candidate `harbor secrets`, field 1 contains `harbor secrets` and the candidate gets a literal title-overlap prompt. It is not silently deleted. With no title, the same output has no title-overlap check.
- A blank candidate list produces an input error and no draft. A candidate line containing only `...` appears as needs edit and cannot become a field value. Cap `50.5` is invalid and cannot produce a new draft.

### Ownership

- Flat route: `app/(site)/(tools)/kdp-backend-keywords-builder/page.tsx`, using the shared tool-page shell and publication registry.
- Pure local parser and placement engine: `lib/kdp/backend-keywords.ts`. Reuse the metadata checker's normalization ideas where appropriate, but do not call its seven-field checker as the builder engine.
- Interactive component: `app/(site)/(tools)/kdp-backend-keywords-builder/kdp-backend-keywords-builder.tsx`; use shared input, result, and copy controls. Reuse `app/ui/tools/kdp-tool.module.css` for existing KDP workbench styling and add a route-owned CSS module only if the phrase-list layout needs it.
- Focused correctness coverage belongs in `tests/pages/kdp-backend-keywords-builder/backend-keywords.test.mjs`. No data import, recurring refresh, or external-service script is needed at launch; any future page-specific script belongs under `scripts/kdp-backend-keywords-builder/`.
- The route's publication and SEO row belongs to `public.stack127_pages`; title, introduction, usage, supporting copy, version, and card fields belong to `public.stack127_tool_pages`. Catalog membership belongs to `public.stack127_tool_catalog_memberships`. Keep live article copy out of the route and this spec.

### Catalog placement

Primary catalog: `/kdp-tools` (`kdp-tools`, rank 1). An author browsing KDP preparation tools can find the phrase-building step beside the final metadata checker. No secondary catalog matches this specific publishing task; no new catalog is needed.

`toolSpot` brief, art key `kdp-backend-keywords-builder`: show seven empty horizontal keyword slots as the recognizable focal subject, with one loose phrase slip moving into an open slot as the single supporting relationship. The visual takeaway is arranging supplied phrases into seven fields. Keep the tone orderly and practical, with no search graph, ranking badge, visible words, or implied performance claim. It must read at catalog-card size in dark and light themes.

## Interface

### Flow

The user's question is: "How can I arrange my own search phrases into seven KDP keyword fields, and which phrases need another look?" The minimum input is a line-separated candidate list. The visible 50-character planning cap is an editable local assumption. Title, subtitle, and chosen category labels are optional comparison context; they do not affect packing. Use one primary action, `Build keyword fields`.

The lead answer is `X of Y distinct phrases placed`, where Y is the number of usable unique candidates after duplicate removal and X is the number placed. The result follows this order: lead and a short `Draft for review` or `Partial draft` state; seven numbered fields with their selectable text, `used / planning cap` count, and copy action on populated fields; omitted duplicates, needs-edit lines, and unplaced phrases with reasons; source-line review prompts separated into KDP-guidance signals and stack127's local reuse or word-count prompts; then a compact source and limitation disclosure. This keeps the copyable output ahead of diagnostics. Counts appear only in the lead or their owning field row, not in extra metric cards. No quality score, traffic estimate, chart, gauge, or repeated seven-field input form belongs in the result.

After reviewing and copying the field drafts, the next useful step is to check the finished listing in the existing `/kdp-metadata-checker`. The link belongs after the result or in supporting content, not as a competing action in the form.

### Components and states

Control mode is **single**. Keep the active cap and all optional comparison inputs visible. A quiet `Compare with book details (optional)` heading separates title, subtitle, and categories from the required phrase list; no Basic/Advanced switch or hidden active assumptions are needed.

| Order | Control | Shared component and purpose |
| --- | --- | --- |
| 1 | `Candidate phrases *` | `UiTextArea`, about eight rows, with `One phrase per line` beside the label or as short field help. A realistic two-line placeholder is an example only. Keep pasted line breaks, permit spellcheck, and do not auto-rewrite text. This is the only required text input. |
| 2 | `Planning cap (characters per field) *` | `UiTextField` with numeric keyboard input and raw string state so `50.5`, empty, and out-of-range values can receive exact errors. Show the default `50` and one short note: `Local planning cap. Check the limit in your KDP field.` Use the field's error slot; no slider or score bar. |
| 3 | `Book title`, `Subtitle` | Two optional `UiTextField` controls for literal overlap review, in that order. Blank values contribute no words. They never change placement. |
| 4 | `Chosen category labels` | Optional `UiTextArea`, about three rows, with `One category per line`. It supplies comparison words only; the builder does not suggest categories. |
| 5 | `Build keyword fields`, `Reset` | `UiActionRow` with one primary `UiButton` submit followed by a quiet secondary reset. Submission checks all bounds and produces a stable snapshot. Reset clears source and result and restores cap 50. |

Use `UiPrimaryResult` for the one lead answer and `UiStatus` for stale, reset, or unexpected failure feedback. The seven output slots are a route-specific ordered list, not a new shared component: each row needs its fixed slot number, selectable read-only phrase text, local count, and action. Reuse `UiCopyAction` with manual fallback for nonempty rows, with labels such as `Copy keyword 1`. Its shared success and failure feedback needs a live announcement because changing the button label alone is not reliably spoken. Use semantic lists for omitted or flagged source lines, and `UiDisclosure` only for the KDP source links, review date, local cap explanation, and unknowns after the actionable result. No result table or chart is needed; the seven fixed rows are easier to scan and copy in order. Place findings in one region by source line and kind, without repeating them as badges on every output row.

| State | Behavior and recovery |
| --- | --- |
| Initial | Blank candidates and book details, cap 50, no result. The clean URL stays unchanged. The candidate list and primary action are immediately visible. |
| Valid draft | Submit freezes the normalized snapshot, produces seven rows, and moves focus to the lead. An all-placed draft may still carry review prompts, so avoid `approved` or `safe` language and success colors that imply KDP acceptance. |
| Invalid input | Empty candidates, invalid cap, or an exceeded size or line bound shows one error under the owning control. Focus the first invalid control in form order. No new result appears and nothing is truncated. If a prior draft exists, mark it stale and disable its copy actions. |
| Empty after parsing | A list made only of blank or punctuation-only lines has no usable phrase. Show the candidate-list recovery message and no seven-field draft. A punctuation-only line beside valid lines appears under `Needs edit` in a partial draft. |
| Partial draft | Keep all seven rows, including empty ones, and lead with `X of Y distinct phrases placed`. Show each unplaced phrase's source line and reason, such as over the selected cap or no slot with enough room. Copy remains available for placed fields after the author sees the partial label. |
| Changed after submit | Keep the last result only as a clearly marked old snapshot and remove its copy actions. The same primary action builds again; no automatic recomputation or URL update occurs on typing. |
| Processing or copy failure | Local processing is synchronous, so there is no spinner or service loading/retry state. An unexpected error leaves inputs intact, clears or marks the old result stale, and offers the same build action again. A failed clipboard action keeps the phrase selectable and exposes `UiCopyAction`'s manual-copy fallback near that row. |
| Reset and return | Reset focuses the candidate list and announces the cleared state. No app-managed draft survives reload, a fresh route visit, or a copied URL. A browser back-forward cache may retain an in-memory draft; if it does, keep it only when it still matches the displayed inputs, otherwise mark it stale. |
| Long values | Respect the input bounds; keep all line-level findings readable. Wrap long phrase text and source labels within the workbench, keep copy controls attached to their own row, and never let a long token create page-level horizontal overflow. |

### Responsive and accessible behavior

Use the shared full-width tool workbench with one divider between the form and result. On desktop, the candidate list takes the readable inner width, the cap stays visibly nearby, and title and subtitle may share a row. Categories span the row below. Result slots remain in one vertical numbered list so their KDP paste order is unambiguous. On mobile, all inputs and output rows stack in the same reading order; each row puts the number and count above or beside wrapping text, then its full-width copy action. Keep text selection possible, target sizes comfortable, and all content inside the viewport. The source disclosure follows diagnostics; no horizontal table scrolling is needed.

The keyboard path is candidates, cap, optional book details, primary action, reset, result, then populated copy actions in slot order. Labels stay visible, required markers are visual and programmatic, and each copy button names its slot. On invalid submit, focus the first field with an error; on valid submit, focus the result lead. Announce stale, reset, unexpected failure, and copy outcomes through a nearby live status without repeating the entire result. Return focus to candidates after reset. Review findings identify a source line and issue in text, not color alone. Check the same order, focus, wrapping, and contrast in dark and light themes at desktop and narrow widths.

## Content

Follow `stack127_docs/writing-style.md` for writing, visual choices, and SEO wording.

Use the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md` to prepare the writing directions below.

### Search intent and metadata direction

Target authors who already have relevant phrases and want to arrange them into seven KDP fields. The title should name the KDP keyword builder and the organizing outcome. The SEO title should include “KDP keyword builder” or “KDP backend keywords” without implying keyword generation. The description should say the author supplies the phrases, can edit the per-field planning cap, and gets local duplicate and review prompts.

### Page promise

The reader can turn a priority-ordered phrase list into seven editable field drafts, see what was omitted or needs review, and understand the limits of this local organizer.

### Content completeness map

- “How are phrases combined?” The result shows first-fit placement and each field's character count; explain that phrases stay intact and a one-space separator counts toward the selected cap.
- “Is the default cap an Amazon rule?” The UI labels it as local. Explain that KDP's public help does not publish a universal numeric field limit and tell readers to use the limit shown in their own KDP field.
- “What do the prompts mean?” The result separates bounded KDP guidance signals from local overlap, repeated-word, and phrase-length prompts. Explain that prompts do not approve or reject a field.
- “What should I do next?” The UI links to the metadata checker; explain that it checks the finished listing rather than researching phrase demand.

### Recommended outline and formats

The introduction should meet an author with a rough list and explain the simple packing rule: field length is phrase characters plus one space between phrases. Make clear the phrases are supplied by the author; this tool does not generate them.

After the workbench, use “How to organize phrases” for the priority order, first-fit behavior, editable cap, duplicate handling, and partial drafts. Add one `[!EXAMPLE]` using the 50-character three-phrase example in Product. Add a `[!NOTE]` that 50 is only a planning cap and that KDP recommends short reader-focused phrases but does not promise placement or sales. No table, chart, or article marker art is needed. Close with the metadata-checker link.

### Concepts and result interpretation

Explain that “distinct” means unique after local case, punctuation, and spacing normalization, not a judgment that phrases mean the same thing. “Placed” means the phrase fit under the chosen cap using stable first-fit order. A duplicate, overlap, phrase-length, or repeated-word prompt is not a KDP decision. Cite official KDP wording for its up-to-seven guidance and its short-phrase recommendation; identify the default cap and matching rules as stack127 choices.

### Usage, limits, and next step

Explain one phrase per line, commas remaining inside a phrase, the editable 10–200 cap, and optional title, subtitle, and category context. Show how to handle duplicates, punctuation-only lines, long phrases, and a partial result. State that the tool never shortens wording or silently drops an over-cap phrase. Do not claim demand, relevance, ranking, KDP acceptance, or a universal 50-character rule. Next, check the completed listing with the KDP metadata checker.

### Source roles and links

Link to [KDP keyword guidance](https://kdp.amazon.com/en_US/help/topic/G201298500) for up-to-seven fields, reader-focused wording, and short phrases; link to [KDP metadata guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560) for metadata avoid-list examples. Both were checked 2026-09-28; the numeric universal field cap remains unpublished in those sources. Link internally to the [KDP metadata checker](/kdp-metadata-checker). Do not repeat the competitor research in public copy.

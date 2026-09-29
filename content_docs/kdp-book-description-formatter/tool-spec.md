# KDP Book Description Formatter & Preview

Route: `/kdp-book-description-formatter`

## Research

### User job

An author has description text and wants to format it for KDP, preview the basic structure, and produce markup they can paste into KDP. Common inputs include plain text and copied HTML from a word processor or another formatter. The main job is formatting and output, not deciding whether the whole book listing follows KDP policy.

This complements `/kdp-metadata-checker`. That existing tool checks a title, subtitle, description, and seven keyword fields for documented limits, markup problems, and bounded review prompts. Its description preview safely renders parsed supported tags as a read-only approximation; it copies the original description source and does not generate or clean formatted output. The formatter should own the authoring and paste-ready-output job. A local formatter check must not be presented as KDP approval or a full compliance preflight.

### Competitor patterns

Operated these public formatters on 2026-09-28. The probes used a short sample containing an unsupported `<h3>`, supported `<p>` and `<b>`, and a link. No account was needed for the formatter workflows.

- [MyBookPage Amazon Book Description HTML Formatter](https://mybookpage.com/tools/amazon-book-description-html-formatter): accepts pasted text or HTML, formats continuously, counts output characters, previews the reading shape, explains removed tags, and offers `Copy HTML`. The probe removed the `<h3>` and `<a>` tags while retaining their text. Its public tag reference currently claims 13 supported tags, includes `<strong>` and `<hr>`, and says `<u>` is banned; those claims conflict with KDP's current published list, which includes `<u>` and does not list `<strong>` or `<hr>`.
- [Bookwiz KDP Book Description Formatter](https://bookwiz.io/tools/kdp-book-description-formatter): opens with a sample, live preview, count, and `Copy KDP-ready HTML`. The probe removed `<h3>` and `<a>`, retained their text, and showed a removed-tags message. It presents the formatter as a way to clean and copy markup, then separately promotes AI listing generation. Its sample includes sales claims and a call to action, which remain prose in the formatted output; this shows why a formatter result cannot stand in for a semantic policy review.
- [SmartKDP Amazon Book Description HTML Formatter](https://smartkdp.com/tools/book-description-formatter): opens with a cookie choice, then offers Write and HTML modes, a formatting toolbar, a rendered example, separate text and markup counts, `Copy HTML for KDP`, and a rule-source date. It states that no login is needed and nothing is sent anywhere. The workflow makes the markup cost visible, but still formats descriptions only.

Across these tools, the repeated pattern is a single description source, a live or sample preview, a character count, and a copyable HTML result. Some add templates or rich-text controls; some report which tags they remove. Competitor claims of KDP compatibility or exact Amazon rendering can overstate what a browser preview establishes. MyBookPage's current allowlist mismatch also shows why KDP itself must control the rule list.

### Technical facts and sources

- [KDP: Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630), checked 2026-09-28, is the source of truth for this formatter's KDP-specific markup and description limits. KDP permits basic HTML and documents these 12 tags: `br`, `p`, `b`, `em`, `i`, `u`, `h4`, `h5`, `h6`, `ol`, `ul`, and `li`. It explicitly says `h1` through `h3` are unsupported. Do not add competitor-only tags such as `strong` or `hr` to the KDP-supported set.
- The description limit is 4,000 characters, including HTML tags, in either text or source view. The public rule does not specify how Unicode characters are counted internally, so a local count can be useful without claiming exact parity for every non-ASCII string.
- KDP's examples say `<p>` creates a line break, `<br>` creates a line break, and two `<br>` tags create a blank line. Lists use `<ol>` or `<ul>` with `<li>` items. The help page advises pairing opening and closing tags, using enough line breaks, and removing empty or repeated angle-bracket sequences when troubleshooting invisible-character problems. It says double or multiple spaces are not reflected on the detail page. The documented behavior is a practical formatting guide, not a complete HTML parser specification.
- The KDP help page does not specify whether attributes on supported tags are accepted, how unsupported tags are handled at every save/render stage, or how all text entities and malformed markup are normalized. Mark those behaviors unknown unless verified against official KDP behavior; competitor sanitizer choices are not KDP rules.
- [KDP Metadata Guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560) and the description restrictions in [Write a Book Description](https://kdp.amazon.com/en_US/help/topic/G201189630) prohibit description content such as contact details and URLs, reviews or testimonials, review requests, advertising or promotional material, time-sensitive information, availability, price or alternative ordering information, BMVD spoilers, Unicode emojis, and keyword or book-tag phrases. The metadata guidelines say KDP uses automated systems and human reviewers. A formatter can transform markup, but cannot establish that prose complies or predict KDP's decision.
- A preview built outside KDP can only approximate the Amazon detail-page rendering. KDP's public help provides examples of source and rendered output but does not document a reusable renderer or guarantee that an off-site preview matches a saved listing. By inference, label an independent preview approximate and direct authors to inspect the saved description in KDP. Saving or publishing through KDP requires the author's KDP account; formatting itself does not.

### Opportunity and blockers

The stack127 opportunity is to turn source text into a clearly understood, paste-ready KDP description while keeping the output, markup cost, and approximate preview grounded in the official 12-tag list. This is a standalone formatting and output workflow. It may report formatting transformations and the local character count, but should leave whole-listing checks and semantic policy warnings to the KDP metadata preflight; neither tool should claim to approve a listing.

No paid API, maintained dataset, backend, account, or background job is needed for deterministic local formatting. A KDP account is needed only when the author later saves or publishes the description. The allowlist and restrictions can change, so retain the official KDP source links and review them before release. Unknowns to preserve are exact Unicode counting parity, supported-tag attribute behavior, and exact Amazon rendering across saved listings.

## Product

### Promise and scope

Primary user: a KDP author with draft description text or copied HTML who needs clean markup to paste into KDP. The job is to turn one description source into an inspectable, copyable HTML result using KDP's documented basic tags, see what the formatter changed, and preview the reading structure approximately. The author retains control of the prose and checks the saved result in KDP.

This route owns description *authoring and output*. The existing [KDP metadata checker](/kdp-metadata-checker) owns whole-listing preflight across title, subtitle, description, and seven keyword fields; it copies the original description, while this tool copies newly generated HTML. Do not duplicate its promotional, URL, contact, review, or keyword-content audit here. Launch covers one locally pasted description in either plain-text or HTML-source mode. Exclude AI writing, templates, rich-text editing, Amazon account connection, publishing, guarantees of KDP acceptance or exact Amazon rendering, and semantic policy approval.

### Technical contract

**Inputs and modes.** One required source text area, maximum 64 KiB of UTF-8 bytes as a local processing guard. A visible two-choice control selects `Plain text` (default) or `HTML source`; switching modes retains the source but clears any prior result. Never auto-detect a mode from angle brackets. In plain-text mode, angle brackets are ordinary text and must be escaped in output. In HTML-source mode, they are markup. The mode is an active assumption shown with the result. All content stays in the browser; no file upload, account, URL state, local storage, server calculation, or input-bearing analytics is needed.

**Plain-text formatting.** Normalize CRLF and CR to LF. Trim leading and trailing whitespace on each line, turn runs of internal horizontal spaces or tabs into one ordinary space, and discard leading, trailing, or repeated empty lines. Each remaining group of nonempty lines separated by a blank line becomes one `<p>...</p>`; single line breaks within a group become `<br>`. Escape text-node `&`, `<`, and `>` as `&amp;`, `&lt;`, and `&gt;` before adding tags. Serialize paragraphs consecutively without indentation or a trailing newline. Never interpret pasted text as active markup in this mode. Report that whitespace was normalized when the output differs for that reason.

**HTML-source cleanup.** Use a non-executing, non-fetching parser that builds an inert tree from the input, never an inserted DOM fragment. Accept only KDP's published `br`, `p`, `b`, `em`, `i`, `u`, `h4`, `h5`, `h6`, `ol`, `ul`, and `li` tags. Lowercase tag names, serialize paired tags with closing tags, and serialize line breaks as `<br>`. Strip all attributes from supported tags as a conservative local formatting choice; KDP's attribute acceptance is unpublished. Unwrap other harmless elements while retaining their text, including `h1` to `h3`, `a`, and `strong`. Drop comments, declarations, and the entire content of `script`, `style`, `iframe`, `object`, `embed`, `svg`, `math`, and `template`; drop void media elements such as `img`. Decode recognized text entities into text, convert nonbreaking spaces to ordinary spaces, then escape `&`, `<`, and `>` when serializing text nodes. Preserve other ordinary text spacing in HTML mode. If supported paired tags are unbalanced or cross-nested, or markup cannot be parsed safely, keep the source and return an input error with no generated HTML rather than guessing the intended structure. Unsupported-tag removal, stripped attributes, dropped content, and entity/space changes must each be reported by type when they occur; do not present these as KDP rejection rules. Never emit an event handler, URL attribute, script, style, or unsupported tag.

**Output, count, and preview.** `Format description` is the one primary action. On valid input with visible text remaining, return the exact generated HTML string, a structured change summary, and a preview built from the sanitized allowlisted tree as React text/elements. Do not use `dangerouslySetInnerHTML`; do not load images or links. The preview is labeled `Approximate preview` beside the rendered result because KDP's exact rendering is unknown. Calculate local Unicode code-point counts of the generated HTML source and of its decoded visible text; `source overhead = source count − visible-text count` includes both tags and entity escapes. The published KDP limit is 4,000 description characters including tags. At a local output count of 4,000 or fewer, allow `Copy formatted HTML` but still say KDP's Unicode counting may differ. Above 4,000, show the generated source and over-limit amount for editing, but withhold the copy action and do not call the result paste-ready. No rounding applies. If cleanup leaves no visible text, show a no-output state and no copy action. If the clipboard call fails, keep the source selectable and offer manual selection; report success only after verified copy.

Invalid blank or whitespace-only plain text, oversized source, malformed HTML, and empty visible HTML return field-level recovery without stale output. Editing the source or mode clears prior generated HTML, preview, count, and copy action until resubmission; reset restores blank plain-text mode. Unexpected parser or formatting failure preserves source and shows a recoverable unavailable state. The output is formatting, not a content-policy check: URLs, prices, reviews, spoilers, and promotional text can remain in prose. Keep a useful link to the full metadata checker and the official KDP description guidance, reviewed 2026-09-28; recheck the allowlist before release.

### Known examples

| Input and mode | Expected answer |
| --- | --- |
| Plain text `First line\nSecond line\n\nThird line` | Output `<p>First line<br>Second line</p><p>Third line</p>`. The local generated-source count is 49 code points, visible text count is 31, and source overhead is 18. The preview shows the first two lines in one paragraph and the third in a second paragraph. |
| Plain text `A & B < C` | Output `<p>A &amp; B &lt; C</p>`, 23 source code points and 9 visible code points. The preview displays the literal `A & B < C`; no markup is run. |
| HTML source `<h3>Start</h3><p class="x">Use <b>bold</b> and <a href="https://example.test">this</a>.</p>` | Output `Start<p>Use <b>bold</b> and this.</p>`. Report the removed `h3` and `a` wrappers and stripped `class` attribute. Retain their visible text. The link is not clickable in the preview or output. |
| Plain text containing 3,993 `A` characters, then 3,994 | A single `<p>` wrapper adds seven code points, so the outputs count exactly 4,000 and 4,001. The first exposes Copy with the local-count caveat; the second shows `1 over the local 4,000-character limit` and no Copy action. |
| HTML source `<p>Safe</p><script>alert(1)</script>` | Output `<p>Safe</p>` and report dropped script content. The script never executes or appears in preview. |
| Blank source, source above 64 KiB, HTML source `<p><b>text</p></b>`, or HTML source containing only `<img src="https://example.test/a.png">` | Blank, oversized, and cross-nested sources have a field error and no output. The image-only source has a no-visible-text result, no copy action, and no network request. |

### Ownership

Flat route `/kdp-book-description-formatter` under `app/(site)/(tools)/kdp-book-description-formatter/`. The server page uses the shared shell, `PageCanvas`, `ToolPageHeader`, and `ToolPageMarkdown`. A route-owned client workbench owns mode, source, generated output, change report, and preview with scoped module CSS. Pure parsing, guards, sanitization, serialization, counts, and typed valid/invalid/no-output/unavailable results belong in `lib/kdp/description-formatter.ts`. Move the canonical 12-tag allowlist into a shared pure KDP description-rules module and let `lib/kdp/metadata.ts` and the formatter import it, preserving the metadata checker's existing behavior. The formatter must not rely on the metadata checker's regex tokenizer as a safe HTML sanitizer. Focused tests belong under `tests/pages/kdp-book-description-formatter/` for both modes, allowed and removed tags, attribute and script removal, malformed markup, entity escaping, 4,000-count boundary, source byte guard, no network-capable preview, and copy eligibility. No runtime script or background job is needed; an integration-only script, if required, belongs under `scripts/kdp-book-description-formatter/`.

This `tool-spec.md` owns the plan. Final title, page and card copy, and tool version belong to `public.stack127_tool_pages`. The flat slug, publication flag, public dates, SEO metadata, and canonical behavior belong to `public.stack127_pages`, not route files. Catalog membership belongs to `public.stack127_tool_catalog_memberships`.

### Catalog placement

Primary catalog, rank 1: existing `/kdp-tools`. Its authors can format a description and then run the related metadata check before entering it in KDP. No secondary catalog fits this KDP-specific authoring task, and no new catalog is needed.

Catalog-card `toolSpot` brief: a description page with two blank paragraphs becoming neatly separated text blocks, conveying source cleanup into readable structure. The page is the focal subject; the paragraph separation is its only supporting relationship. Use a calm, practical tone and no visible words, code symbols, or numbers. Keep the silhouette and spacing clear at card size in both themes. Art key: `kdp-book-description-formatter`.

## Interface

### Flow

User question: "Can I turn this draft into clean KDP description HTML, see what changed, and copy the result?" Use one `single` control mode with a visible `Plain text` / `HTML source` choice and one large, labeled `Description source` field. No sample text, toolbar, hidden style settings, or automatic mode detection. Brief guidance below the choice says that plain mode treats angle brackets as text and HTML mode cleans tags. `Format description` is the one primary action; `Reset` follows as a quiet secondary action. The input is an editor source, never the generated output.

After one divider, the lead sentence says whether formatted HTML is ready to copy, exceeds the local 4,000-character count, or has no visible text after cleanup. Then show (1) generated HTML in `UiCodeOutput`, with `UiCopyAction` in its header only when eligible; (2) one compact `UiKeyValueList` with generated-source count against 4,000, visible-text count, and source overhead; (3) a concise change list naming the types of whitespace, tag, attribute, entity, or content transformations that actually happened; (4) a rendered section visibly titled `Approximate preview`, with a one-line reminder to inspect the saved result in KDP; and (5) a quiet source and limits disclosure with KDP's 12-tag rule and source-review date. Do not repeat the generated HTML in another panel or show a second copy action. Keep the full metadata checker as the next useful check in supporting content, separate from the formatting result. No exact-rendering or policy-approval language appears in the lead.

### Components and states

Reuse `UiChoiceGroup` for the two visible modes, `UiTextArea` for source, `UiActionRow` and `UiButton` for actions, `UiStatus` for live feedback, `UiResultLead` for the answer, `UiCodeOutput` for selectable generated HTML, `UiCopyAction` with manual fallback for verified copy, `UiKeyValueList` for counts, and `UiDisclosure` for evidence. If `UiCopyAction` does not already announce success and failure, add a small shared live status to it; changing the focused button's label alone is not reliable feedback. The route owns its sanitized, allowlisted React preview renderer and the exact change-list wording. Use the same shared workbench band and safe-preview visual pattern seen in the metadata checker; its preview is read-only and never treats source HTML as trusted. No new shared preview control is required.

Initial: blank source, Plain text selected, no result, and enabled primary action. Invalid or incomplete: a blank source, byte guard, or malformed HTML shows one field-level error under source and focuses it; no old output, preview, or copy action remains. Valid under the local count: generated source, count, changes if any, approximate preview, and Copy appear. Valid but over 4,000: keep generated source and preview visible, show the exact overage, withhold Copy, and keep the source editable. Cleanup with removed tags or content is a usable partial result: name each kind of change in the list so lost material is not silent. Cleanup with no visible text is an empty-result state with no generated output or Copy; explain what was removed and preserve the source. A copy failure leaves the generated source selectable and announces how to copy it manually. Editing source or changing mode clears the old result and announces once that formatting should be rerun; reset clears everything and returns focus to mode or source.

Formatting is synchronous and local, so there is no loading or remote retry state. An unexpected parser failure shows one recoverable error, preserves source and selected mode, and reuses `Format description` for retry. No URL, storage, or server restoration applies; reload and back/forward to the clean route start blank without changing the canonical URL. Long HTML lines scroll within `UiCodeOutput` and remain keyboard-selectable; the preview wraps long text, while the change list and counts never cause page-level horizontal overflow.

### Responsive and accessible behavior

The workbench spans the main column, with its source editor and results aligned to a calm inner width and a single divider between them. On desktop, keep the source full width; do not squeeze source and preview into competing narrow columns. On mobile, stack mode, source, `Format description`, Reset, lead, generated HTML, counts, changes, and preview in that order. The source editor has enough height to inspect several paragraphs, and the output scrolls within its own region. Avoid nested cards, decorative gauges, or a table for three counts. Use shared spacing, border, `--radius`, `--focus-ring`, base text, and mono for HTML and counts. The approximate-preview label stays visible in both themes and at 390px.

Tab reaches the mode radios, source, primary action, Reset, and then the result's copy control and source viewport. Enter/Space operate the choice and buttons; Enter inserts a line break in the source text area. On valid formatting, focus the lead result and announce `Description formatted`; on over-limit or no-output, focus the corresponding lead sentence. On invalid submission, focus the source field and read its associated error. On the first edit after a result, keep focus in the editor and announce that generated HTML was cleared, without announcing every keystroke. Reset returns focus to the mode choice. `UiCopyAction` announces verified success or failure, and its manual fallback remains keyboard reachable. Render preview text through React text nodes and allowlisted elements only; no pasted links, images, scripts, or event handlers can run or fetch. Keep source and output selectable and fully named for screen readers, with visible focus and no horizontal page scroll at desktop or mobile width.

## Content

Follow `stack127_docs/writing-style.md` for writing, visual choices, and SEO wording.

Use the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md` to prepare the writing directions below.

### Search intent and metadata direction

Target authors who need to turn pasted description text or existing HTML into cleaner KDP description markup. The visible title should name the KDP description formatter and ask how to format a description for copying. The SEO title should include “KDP book description formatter” and signal HTML cleanup or preview. The description should name Plain text and HTML source modes, generated markup, change reporting, and an approximate—not exact—preview.

### Page promise

The reader can produce inspectable HTML from their own description, see which markup or spacing changes occurred, review a safe approximation of the structure, and know when the local character count prevents copying.

### Content completeness map

- “Which mode should I choose?” The UI explains that plain text treats angle brackets literally while HTML source cleans markup; usage copy should make the choice explicit.
- “What changed?” The result lists unsupported wrappers, stripped attributes, dropped content, whitespace, and entity changes. Explain that cleanup choices are local and do not predict KDP rejection.
- “Can I copy it?” The UI counts generated HTML including tags and withholds copy above the local 4,000-code-point limit. Explain KDP's published 4,000-character limit and unknown Unicode counting parity.
- “Will it look the same on Amazon?” The UI labels a safe preview approximate; direct readers to inspect the saved description in KDP.
- “Does formatting check policy?” Supporting copy must say it does not review prose restrictions; link to the full metadata checker.

### Recommended outline and formats

The introduction should meet an author with draft description text or copied HTML and explain that the formatter creates safer, simpler output locally. State that the result count includes tags; do not imply exact parity with KDP's count.

After the workbench, use “Choose a source mode” to explain plain text versus HTML source and “Read the formatted result” for allowlisted tags, change summaries, character counts, and the approximate preview. Include one `[!EXAMPLE]` showing how a blank line and a single line break become paragraph and `<br>` structure. Add a `[!NOTE]` that KDP's preview and Unicode count can differ and that the formatter is not a policy check. No table, chart, or article marker art is needed. Link to the metadata checker and the official description guidance.

### Concepts and result interpretation

Define generated-source count as code points in the output string, including tags and entity escapes; visible-text count excludes markup and line-break tags; overhead is source count minus visible-text count. At exactly 4,000 local characters, copy remains available; above that it is withheld. This is a local count of the documented 12-tag output, not the KDP editor's Unicode validator. Unsupported wrappers may be unwrapped, while script, style, embedded, and media content are dropped. The approximate preview uses only the resulting allowlisted tree and does not fetch links or media.

### Usage, limits, and next step

Describe selecting Plain text for prose or HTML source for pasted markup. Explain that modes are explicit and not inferred, source remains available after malformed markup or size errors, and unsupported HTML can create a partial cleanup result. Explain the local byte guard, the 4,000 output limit, and manual editing/reformatting recovery. Do not promise Amazon rendering, policy acceptance, semantic review, or preservation of links, image content, scripts, and attributes. The next step is to inspect the saved description in KDP and use the metadata checker for listing-level checks.

### Source roles and links

Link to [KDP's book description guidance](https://kdp.amazon.com/en_US/help/topic/G201189630) for the 12 documented tags, 4,000-character rule, examples, and markup restrictions; link to [KDP metadata guidelines](https://kdp.amazon.com/en_US/help/topic/G201097560) for listing-level content rules. Sources were checked 2026-09-28 and the tag list should be revisited before release. Link internally to the [KDP metadata checker](/kdp-metadata-checker). Label the outside preview and Unicode count caveats as implementation limits, not additional Amazon rules.

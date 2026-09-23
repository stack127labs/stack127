# KDP Image DPI Checker

Route: /kdp-image-dpi-checker

## Research

### User job

A KDP author or formatter has a raster image intended for a print book and needs to know whether its pixels provide enough resolution at the size it will occupy. They may also see a DPI value in file properties and need to know whether changing that value would improve print quality. The existing KDP PDF preflight checker covers raster images after they are placed in a PDF; this tool's distinct research opportunity is checking a source image against a known or intended print size.

### Competitor patterns

Reviewed on 23 September 2026. Page content and exposed form fields were inspected; interactive file selection and result behavior were not operated because no connected browser was available.

- [DPIChecker image DPI checker](https://dpichecker.net/image-dpi-checker/) describes local processing for JPG, PNG, WebP, TIFF, BMP, GIF, and SVG. Its page pairs stored DPI metadata and pixel dimensions with a print-size table and an effective-DPI result for the intended size. It says missing DPI metadata does not itself make an image unprintable and distinguishes vector SVG from fixed-pixel images. Its related tools include a PDF DPI checker and a pixels/inches/DPI calculator.
- [ConvertImageDPI image checker](https://convertimagedpi.com/check-image-dpi) describes local JPG and PNG checks, multiple-file selection, pixel dimensions, the stored DPI tag, and a user-entered print width, height, and unit. It separates checking from DPI conversion and calculation. Its page uses a broad 300-DPI pass label and says KDP requires 300 DPI; that label does not preserve KDP's separate wording for the 300-DPI target and its below-200-DPI low-resolution definition.
- [SmartKDP's 300-DPI image tool](https://smartkdp.com/tools/convert-image-to-300-dpi) describes writing a 300-DPI tag into a PNG or JPEG while checking whether the pixels support the intended trim size. Its stated distinction between sufficient pixels and merely changing the label addresses a common metadata-versus-quality confusion.

The repeated pattern is to show pixels and stored density, then relate them to a print size or a maximum size at a target resolution. A KDP-specific checker can improve on generic 300/not-300 labels by distinguishing print interiors, print covers, and eBook covers, and by accurately presenting KDP's different 300-DPI and 200-DPI statements. Competitor pages describe local processing, but their actual runtime behavior and privacy claims were not independently exercised in this session.

### Technical facts and sources

- For paperback and hardcover print images, KDP recommends at least 300 DPI at the size the image is placed. Its paperback submission guidelines say cover and manuscript images should be at least 300 DPI and call 300 DPI the minimum. KDP also defines an image below 200 DPI as low resolution. These statements should not be collapsed: 200 to 299 DPI is below the 300-DPI target, even though it is not below KDP's stated low-resolution threshold. KDP says there is no set maximum in its image-formatting help, while the paperback guidelines recommend a maximum of 600 DPI to help keep files within the 650 MB upload limit. A value above 600 should therefore be described as a file-size or processing advisory, not as a stated hard DPI rejection rule. [Format Images in Your Book](https://kdp.amazon.com/en_US/help/topic/G202169030); [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950).
- KDP's example calculates image resolution from pixel count divided by the image's physical placement size: 1,200 × 1,800 pixels placed at 4 × 6 inches gives 300 DPI. It warns that manually changing the DPI reading does not add pixels or improve image quality; reducing the placed size can raise effective resolution. A stored DPI tag alone therefore cannot establish the resolution at a user's final print size. [Format Images in Your Book](https://kdp.amazon.com/en_US/help/topic/G202169030); [Fix Paperback and Hardcover Formatting Issues](https://kdp.amazon.com/en_US/help/topic/G201834260).
- KDP's image requirement concerns images in the manuscript and cover. Inference: a PDF does not have one useful global DPI value when its pages contain a mix of raster images, text, and vector artwork. Each placed raster image has its own effective resolution based on its pixel dimensions and placement scale; text and vector artwork do not have a fixed raster DPI until rasterized. A source-image check can calculate against a user-supplied print size or report possible sizes, but cannot know the final placement or detect image compression applied later by a layout or export step. The existing [KDP PDF preflight checker](/kdp-pdf-preflight-checker) already measures effective resolution for raster images embedded in a PDF, so its document-level job should remain distinct.
- Print interiors and print covers both use the 300-DPI guidance. A paperback cover upload is one PDF containing the back, spine, and front; its full-wrap size depends on the book's trim size, page count, and print specifications. KDP's cover guide says images should be placed at 100% and at a minimum of 300 DPI. A check of a full-wrap raster therefore needs the full cover dimensions, while a check of a cover photo or illustration placed into a layout needs that asset's actual placement size. [Create a Paperback Cover](https://kdp.amazon.com/en_US/help/topic/G201953020); [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950).
- Kindle eBook covers have a separate digital-image specification. KDP lists 72 DPI, minimum dimensions of 1,000 × 625 pixels, an ideal size of 2,560 × 1,600 pixels, and an ideal height-to-width ratio of 1.6:1. The same page also recommends a minimum resolution of 300 PPI for best quality. This wording combines a 72-DPI field with a 300-PPI quality note; preserve that ambiguity and use the explicit pixel dimensions for eBook-cover checks rather than applying the print-placement rule as an eBook pass/fail test. [What criteria does my eBook's cover image need to meet?](https://kdp.amazon.com/en_US/help/topic/G200645690).
- KDP's print previewer and proof copy remain the way to review the actual formatted and printed result. A resolution calculation cannot detect blur, focus, compression artifacts, contrast, or whether the final document retained the source image unchanged. [Format Images in Your Book](https://kdp.amazon.com/en_US/help/topic/G202169030); [Fix Paperback and Hardcover Formatting Issues](https://kdp.amazon.com/en_US/help/topic/G201834260).

### Opportunity and blockers

Give authors an image-level answer that keeps three facts separate: the file's pixel dimensions, any stored DPI value, and effective resolution at the physical size they plan to print. Apply KDP's print guidance without making 200 to 299 DPI look equivalent to the 300-DPI target, without treating more than 600 DPI as a hard failure, and without applying print rules to eBook covers. If final placement size is unknown, the result can only describe potential print sizes, not the resolution in the finished manuscript or cover.

No paid API, maintained dataset, account, or background job is needed for the basic check. Image parsing and calculations can be performed locally. The competitor interaction step remains unverified because the available browser connection list was empty; findings above use the competitors' published page content and exposed controls, not a file-upload run.

## Product

### User, job, and scope

Help a KDP author or formatter check whether one source image has enough pixels for its intended print placement. The answer is effective resolution at that size and the largest size supported at 300 DPI. Explain how this differs from a stored density tag.

Launch covers raster images for paperback and hardcover interiors or covers. Both use the same calculation, so there is no book-type selector. For a full-wrap cover, the user must enter its complete physical size; for an illustration, enter that illustration's placement size. No trim-size inference or cover dimension generator.

Do not launch an eBook mode. Its pixel-size rules are a separate job, and the researched density wording does not support a simple DPI verdict. Exclude PDFs, vectors, batch checks, URLs, image editing, resizing, metadata rewriting, downloads, accounts, and final KDP acceptance claims. Link to the PDF preflight checker for checking images after layout and export. Resolution alone does not measure sharpness, compression artifacts, color, or proof quality.

### Files and interpretation

- Accept one JPEG (.jpg/.jpeg) or PNG (.png). These are the launch browser-decoded formats; do not imply that every browser-readable format is supported. Check file signatures, not extension or MIME alone. Reject other signatures, including PDF, SVG, TIFF, GIF, WebP, HEIC, and AVIF, with supported-format guidance. Reject animated PNG when an acTL chunk is present.
- Set tool limits of 25 MiB per file, 40 million encoded pixels, and 20,000 pixels on either encoded axis. These are local resource limits, not KDP limits. Check byte size and bounded JPEG/PNG headers before decoding; reject zero dimensions, truncation, impossible segment/chunk lengths, and unsupported dimensions. A signature or dimensions alone never establishes a successful image check: require browser decode as well.
- Read native encoded dimensions from JPEG SOF or PNG IHDR. Read EXIF orientation in JPEG APP1 and PNG eXIf, using a bounded TIFF directory reader with byte-order and offset checks. Orientations 5 to 8 swap display width and height; 1 to 4 do not. The dimensions used for calculation must match the oriented preview. Do not use CSS size or a browser-downsampled naturalWidth as the source pixel count. Decode with orientation applied exactly once. Mirror transforms do not change pixel counts.
- Missing orientation means ordinary orientation. Invalid or conflicting orientation tags yield a clear warning and suppress placement calculations until the user supplies a clean re-export, because width and height cannot be trusted. An unrelated unreadable density tag does not block a usable image.
- Report stored density as secondary information. Support JPEG JFIF density and EXIF XResolution/YResolution/ResolutionUnit, and PNG pHYs plus eXIf density. Convert pixels/cm to pixels/inch by multiplying by 2.54 and pixels/metre by 0.0254. Unitless density, zero, missing denominators, unsupported units, and missing tags mean density is unknown. Do not invent a 72- or 96-DPI default. Show horizontal and vertical density if unequal. When tags disagree, show their source values with a conflict note rather than silently choosing one. Swap density axes with oriented dimensions when applicable. Unreadable metadata is reported as unreadable, not absent.
- Stored density never determines the entered physical size, effective resolution, verdict, or maximum 300-DPI size. Changing the density label adds no pixels. Do not expose unrelated EXIF details such as GPS or camera identifiers.

### Inputs, calculation, and outputs

The primary action is `Check image`. A file picker or drop target selects the file; selection provides a local thumbnail and dimensions once inspected. Width and height describe the actual printed image in its displayed orientation. Both start blank. Units are inches (default), centimetres, or millimetres. Keep proportions on by default: editing either dimension derives the other from the oriented pixel ratio, preserving full internal precision. Allow unlocking proportions for a placement that stretches the image, and show a distortion note when its ratio differs from the source by more than 0.1%. There is no implicit crop or fit behavior. A crop requires a separately exported cropped image for an accurate source check.

Trim whitespace; accept positive plain decimal numbers with a dot decimal separator, including .5. Reject exponents, commas, fractions, unit suffixes, nonfinite values, zero, and negative values with field-specific guidance. Each physical dimension must be between 0.01 and 200 inches inclusive, or its exact equivalent in the selected unit (0.0254 to 508 cm; 0.254 to 5,080 mm). These are tool bounds, not supported KDP trim sizes. Convert using exactly 2.54 cm or 25.4 mm per inch. Unit changes preserve the underlying physical size; never round repeatedly through displayed values.

For oriented pixels W × H and placement w × h inches:

- Horizontal effective DPI = W / w. Vertical effective DPI = H / h. The controlling resolution is the smaller of the two.
- At least 300 on both axes: meets the 300-DPI resolution target at this size.
- At least 200 but below 300 on either axis: below the 300-DPI target. Do not call this a pass.
- Below 200 on either axis: low resolution by KDP's stated threshold.
- Above 600 on either axis: an additional file-size advisory, never a hard failure. Retain the underlying 300-DPI assessment.
- Maximum size at 300 DPI is W / 300 × H / 300 inches, preserving the complete image and its ratio. Show it in the selected unit. It is a resolution-based size, not a supported KDP trim size or proof of print quality.

Classify unrounded values. Display effective values with up to two decimals, with a boundary qualifier if rounding would display 200 or 300 while the value is below it. Display physical dimensions with up to three decimals and mark rounded maximum sizes as approximate. Give horizontal and vertical results when they differ; do not hide a weak axis behind an average. Results show placement size, oriented pixel dimensions, assessment, maximum size at 300 DPI, and stored-density information in that order of importance.

If both dimensions are blank, `Check image` produces an inspection-only result with pixels, stored density, and maximum 300-DPI size. Say that intended size is needed for an effective-DPI assessment; do not show a pass. If one dimension is missing while proportions are unlocked, request the missing dimension. With proportions locked, one valid entered dimension is sufficient to derive the other.

### States, recovery, and privacy

Start with file and size instructions. Distinguish inspecting, ready, checked, inspection-only, field error, unsupported file, oversized file, and decode failure. Preserve editable valid inputs after an error. Replacing a file clears its earlier result immediately; changing size or unit invalidates any stale assessment until the next check, while retaining the current thumbnail. Unit conversion may retain the result only if its physical meaning is unchanged. Async work from an earlier selection must never replace a newer file's result. Cancel or time out a stalled decode after 15 seconds and allow another selection. Reset removes the file, result, preview URL, sizes, and returns units/proportion lock to defaults.

Process file bytes and calculations in the browser. No image upload, remote fetch, database storage, localStorage persistence, or image/filename/input contents in analytics or logs. Release bitmap resources and revoke preview URLs on replacement, reset, and unmount. Render filenames as text. Decode failure explains that the browser could not read the image and suggests exporting a fresh JPEG or PNG. A density-read failure can produce a partial result with verified pixels and calculations plus an unknown-density message. Resource or orientation failures must not yield a numeric placement verdict.

### Independent examples

| Input | Expected answer |
| --- | --- |
| 1,200 × 1,800 pixels at 4 × 6 in | 300 on both axes; meets target; maximum 300-DPI size 4 × 6 in. |
| Same image at 10.16 × 15.24 cm | Same 300-DPI result, regardless of missing density or a stored 72-DPI tag. |
| 1,200 × 1,800 pixels at 6 × 9 in | 200 on both axes; below target, not below the 200 threshold. |
| 1,200 × 1,800 pixels at 8 × 12 in | 150 on both axes; low resolution. |
| 1,200 × 1,800 pixels at 4 × 8 in, proportions unlocked | Horizontal 300, vertical 225; controlling value 225; below target plus distortion note. |
| 3,000 × 2,000 encoded JPEG with EXIF orientation 6 at 4 × 6 in | Displayed pixels 2,000 × 3,000; 500 on both axes. |
| 2,400 × 3,600 pixels at 3 × 4.5 in | 800 on both axes; meets resolution target plus above-600 advisory. |
| 2,999 × 3,000 pixels at 10 × 10 in | 299.9 and 300; below target. |
| PNG pHYs of 11,811 pixels/metre | Stored density approximately 300 DPI (299.9994); no change to placement assessment. |
| Valid image, no size | Inspection-only, no effective-DPI verdict. |
| Width 0, `1e2`, or 201 in | Validation error; no fresh numerical assessment. |

Builder verification should cover these calculation boundaries and representative malformed metadata, orientation, file replacement, and decode recovery. Do not test exact copy or spec structure.

### Ownership

Public route: `/kdp-image-dpi-checker`. Route shell, client component, pure calculation/header/metadata engine, and any scoped module CSS live under `app/(site)/(tools)/kdp-image-dpi-checker/`. Keep file inspection separate from pure placement math so focused tests can exercise both without rendering the page. Use the existing shared tool shell and controls. Focused tests and any necessary page scripts belong under `scripts/kdp-image-dpi-checker/`, following repository conventions. Planning lives in this spec. Final title, introduction, body copy, and versions belong in `public.stack127_tool_pages`; publication and central metadata belong to `public.stack127_pages`. The route must not own metadata, robots, canonicals, sitemap dates, or JSON-LD.

## Interface

### Task and layout

User question: "Does this image have enough pixels at the size I plan to print it?" The lead answer is the effective DPI and its relationship to the 300-DPI target. With no intended size, the lead answer is the largest print size supported at 300 DPI, explicitly without a placement verdict. `Check image` is the only primary action in either flow.

Use control mode `single`. No Basic/Advanced switch, book-type tabs, charts, gauges, or decorative image mockups. Follow the shared page header, full-width workbench band, and supporting-content order. Use one calm content measure, no nested cards. The form and results remain stacked on desktop as well as mobile. Width and height can share a row on desktop; stack them on narrow screens. A single divider separates inputs from submitted results.

Reviewed the shared component implementations, the development gallery's source examples for file upload, quantity input, and primary results, and the PDF preflight and payment date sibling layouts. A live gallery visit was unavailable because this planning session has no browser-control tool. The builder must check the rendered gallery and actual page as part of its browser verification.

### Form and shared components

1. Reuse `UiFileDropzone` with visible label `Image file *`, secondary browse action `Choose image`, one-file behavior, accepted JPEG/PNG MIME types and extensions, and the Product byte limit. Its compact description says `JPEG or PNG, up to 25 MiB. Checked in your browser.` The visible required marker is paired with an accessible required description on the enclosing group. Missing-file submission focuses the browse action. The shared MIME/extension filter is only a picker convenience; the route-owned inspector verifies signatures and contents.
2. Reuse `UiFileList` in list layout for the selected file, filename, local thumbnail, size, status, and remove action. Selection starts inspection immediately, but does not create the submitted result. Once inspection succeeds, the file message shows the oriented pixel dimensions. The ready check mark means the file was read, never that it meets print requirements. Do not add a second preview or a filename heading elsewhere. Image metadata failure is shown in results after submission; an orientation or decode failure belongs beside the file. The route owns inspection and preview normalization, including orientation, rather than creating a new shared upload component.
3. Show a small `Print size` group containing `Width` and `Height`, both initially blank, and the sentence `Enter the image's printed size, or leave both blank to inspect its pixels.` Reuse two `UiQuantityInput` controls because they preserve raw decimal text. Both adjoining unit selectors use the same unit state and options `in`, `cm`, and `mm`; changing either converts both dimensions. Accessible unit names are `Print size unit, width` and `Print size unit, height`. Do not add a separate third unit selector. The size fields are optional because inspection-only is a complete supported flow.
4. Reuse `UiCheckbox` labeled `Keep proportions`, selected by default and always visible beneath the size fields. It is a submitted choice, not a switch. Width and height remain editable: the most recently edited valid dimension is authoritative and derives the other. Clearing the authoritative field while locked clears both, making inspection-only easy to reach. Invalid or incomplete text clears the derived field and never produces NaN or a stale derived size. Unlocking retains both values. Relocking uses the last edited valid axis, otherwise width, to recalculate the other. A changed file retains the entered authoritative dimension and rederives the companion for its new ratio; unlocked dimensions remain as entered. Clearing or replacing the file clears old assessment immediately.
5. Reuse `UiActionRow` and `UiButton`: primary `Check image`, then quiet `Reset`. The form handles Enter. Keep submission enabled when inputs need validation; disable only while inspection is running, with `Reading image...` at stable button width. Keep file replacement, removal, and reset available during reading so stalled work has an escape. A generation token prevents old inspection work from changing new state.

No new shared components are needed. Route-specific code owns synchronized physical dimensions, local image inspection, metadata formatting, and result selection. Route CSS only owns layout, grouping, containment, and token-based spacing; shared controls keep their existing focus rings, 2px radius, colors, and typography.

### Submitted results

Use a named `Image check result` region. Do not render an empty result card or placeholder metrics before submission.

For a valid placement, use `UiPrimaryResult` with label `Effective resolution`, value equal to the controlling DPI, unit `DPI`, and detail containing the entered width × height and the text assessment. Its tone follows the Product thresholds: success at or above 300, warning from 200 to below 300, danger below 200. Always include the text assessment; color alone is insufficient. If the axes differ, a compact `UiKeyValueList` immediately below shows horizontal and vertical DPI so the limiting direction is visible. The source pixel dimensions already appear by the selected file and are not repeated here.

Below the lead, show one key-value row for `Maximum size at 300 DPI`. Where either axis exceeds 600, place a short file-size advisory after the main assessment; do not replace it with a failure. Where stretching exceeds the Product tolerance, add the distortion note in the same result context. A short limitation below the result says the check measures resolution at the entered size and that the exported book still needs review.

For inspection-only, use `UiPrimaryResult` with neutral tone, label `Maximum size at 300 DPI`, and width × height in the selected unit as its value. Its detail says `Enter a print size to check effective resolution.` No effective DPI, success icon, pass label, or traffic-light tone appears. Do not repeat the maximum-size row below this lead. The user can enter a dimension above and press the same `Check image` action to receive a placement result. There is no second mode, duplicated form, or additional "calculate" action.

Both result types end with a quiet `Stored density` group using `UiKeyValueList`. Show one source-labeled row per density source; equal axes can use one value, unequal axes show horizontal and vertical values. Missing/unitless metadata says `Unknown`; unreadable metadata says `Could not read stored density`. Conflicts keep both sources visible with one explanatory note. Always include a short explanation that the stored tag does not add pixels or establish resolution at the entered size. Keep this group visually smaller than the lead answer and do not label it simply `Image DPI`.

### State and recovery behavior

- Initial: file picker, blank size controls, checked proportion control, and actions; no result. There is no preloaded image or invented example result.
- Inspecting: file row says `Checking`; the live status says `Reading image locally.` Do not show an upload percentage or claim data is uploading. Completion announces `Image ready` without moving focus.
- Ready: thumbnail and oriented dimensions are visible. Both blank sizes are valid. Only explicit submission opens inspection-only or placement results.
- File validation failure: one local message identifies unsupported type, file-count rejection, resource limit, corrupt data, or orientation issue, with an appropriate replacement instruction. A rejected replacement must clear the old result so it cannot be mistaken for the newly attempted file. Do not show errors again in a result panel. With multiple dropped files, process the first accepted file and state that additional files were ignored; this matches the existing dropzone callback behavior.
- Size validation failure: errors appear directly under the affected size control; focus the first invalid input. Preserve the file and editable values. If only one unlocked dimension is supplied, the missing field gets the error. Both blank is valid; malformed text must never be treated as blank.
- Density partial result: render the verified resolution or maximum size normally, with the metadata warning confined to Stored density. Orientation, decoding, and resource failures cannot render a numeric placement result.
- Decode failure or timeout: keep the selected file with error status and recovery guidance. Offer the shared file-row retry only for a decode failure or timeout; it reruns inspection. Unsupported type, invalid orientation, and over-limit files require replacement, not retry. Successful retry returns to ready; the user still presses `Check image` for results.
- Changed size, proportion choice, or unit: remove the submitted result and announce once `Size changed. Check the image again.` Retain thumbnail and file facts. Unit changes deliberately use this same rule, even when they preserve physical meaning, to keep submission behavior consistent.
- Reset: cancel pending work, release resources, clear all fields/results/errors, restore inches and locked proportions, announce `Checker reset`, and focus `Choose image`. Removing only the file keeps the physical-size inputs and returns focus to the browse action.
- Reload and history: no URL state, query writing, storage, or automatic restoration. A clean URL remains unchanged through use. Reload starts at the initial state. No copy, download, or share control.

### Accessibility, containment, and observable acceptance

Use the page's existing heading hierarchy and semantic form groups. Persistent labels identify every field. All buttons, the file chooser, selectors, and checkbox work by keyboard with visible shared focus styling. Error descriptions connect programmatically to their inputs. The result lead is focusable with `tabIndex=-1`; a successful explicit submission moves focus to it. Use one polite live status for asynchronous inspection and state changes, avoiding duplicate narration of focused results. File errors may use an alert at their single visible location. Do not shift focus when background inspection finishes or when a unit derives another value.

Long filenames wrap within the file row, and long numeric/source values wrap inside their own result cells. Do not force the form wider than the viewport. The existing file thumbnail is sufficient; preserve its aspect ratio without stretching. Values remain selectable text. On mobile, input order stays file, width, height, proportions, check/reset, answer, details, stored density. The primary button is full width when its action row stacks. Themes use existing surface, text, border, success/warning/danger, and focus tokens.

The builder and auditor should be able to observe all of the following on the real page:

- At desktop and 375px mobile width in both themes, one primary action is obvious, labels are visible, and controls/results do not overflow or overlap.
- Choosing a 1,200 × 1,800 image shows that portrait ratio and pixels before submission, but no assessment. Submitting blank sizes yields only the neutral maximum-size answer of 4 × 6 in and stored-density details.
- Entering width 4 with proportions locked derives height 6; submitting gives 300 DPI and the target assessment. Entering width 6 derives height 9 and gives 200 DPI below target. Stored density never changes either result.
- Unlocking and entering 4 × 8 shows the limiting 225 DPI, horizontal 300 and vertical 225, plus a distortion note. No average substitutes for the weakest axis.
- Switching either unit selector converts both fields and removes the previous result. Rechecking 10.16 × 15.24 cm for the sample image gives the same 300-DPI answer without round-trip drift.
- Invalid width, one missing unlocked dimension, an unsupported file, and an oversized file each give one specific repair path without a stale numerical result.
- Replacing, removing, or resetting during inspection prevents the old file from returning. A decode failure offers retry; a rejected format offers replacement.
- A rotated EXIF image has matching visible orientation, dimensions, and calculation. Conflicting orientation cannot show a placement verdict; missing stored density can.
- Tab and Enter complete selection, size entry, check, and reset. Successful submission focuses its answer, field validation focuses its input, and reset focuses file selection.
- The inspected file and its contents are not sent over the network, persisted, or included in telemetry; the canonical URL stays unchanged.

## Content

### Search intent and metadata direction

Target authors checking an image before placing it in a paperback or hardcover: KDP image DPI checker, image resolution for KDP, 300 DPI print size, and whether a 72-DPI image has enough pixels. Use the title pattern `Tool name: question or outcome`, with KDP image DPI checker followed by the question of sufficient resolution at the intended print size. SEO title should identify the checker and print use; description should cover local JPEG/PNG inspection, effective resolution at an entered size, and maximum size at 300 DPI. Avoid conversion, upscaling, eBook compliance, and KDP approval promises. No search-volume claims or keyword quota.

### Page promise

Help the reader decide whether to use an image at its planned print size, use it smaller, or find a better source. They should understand why stored density can differ from effective resolution and know to check the exported book next.

Planning basis: reviewed the implemented client and calculation engine. Running its calculation for the Product's 1,200 × 1,800 pixels at 4 × 6 inches returned 300 DPI on both axes and a 4 × 6-inch maximum at 300 DPI. A connected browser was unavailable, so no interactive file-selection run is claimed for this stage.

### Content completeness map

| Reader question | Home and writer direction | Already answered by the UI |
| --- | --- | --- |
| Does my image have enough resolution for print? | Introduction: establish intended placement and pixel count as the inputs; scope to print. | Effective resolution and target assessment after checking. |
| Which size should I enter? | Usage: actual image placement, not automatically the book's trim size; full wrap needs full cover dimensions. | Width, height, units, and Keep proportions. |
| What if I do not know the size? | Usage: blank sizes yield a potential maximum size, without a placement assessment. | Neutral maximum-size result and prompt for print size. |
| Is 200 DPI enough, and can DPI be too high? | Supporting threshold explanation: preserve the Research distinction between the target, low-resolution threshold, and advisory. | Three assessment bands and above-600 advisory. |
| Why does a 72-DPI tag disagree with this answer? | Supporting metadata explanation: distinguish pixels, stored density, and placed resolution. | Source-labeled stored density, unknown or unreadable states, and conflicts. |
| How can I improve the result? | Supporting next steps: smaller placement or a better source, then final export checks. | Maximum size and distortion note; no editing functionality. |
| Does this guarantee KDP acceptance? | Final scope paragraph beside next step: source resolution cannot establish final layout or visual quality. | Result limitation; prose explains final-PDF review and links to official KDP guidance. |

### Recommended outline and formats

- Introduction: describe an author checking a print illustration or cover asset. Include the simple per-axis formula, pixels divided by printed inches, with enough context to apply it to width and height; explain that the lower axis controls. Connect directly to the checker reading the source dimensions and applying the entered size. Keep the full worked comparison below the tool.
- Usage: brief numbered steps centered on selecting the source JPEG/PNG, choosing actual placement dimensions and units, and interpreting the answer. Explain the blank-size path and proportion lock where they affect the task; do not narrate every button.
- Proposed section, understanding the resolution result: a compact Markdown table for the three Product assessment bands, followed by the above-600 file-size advisory. Explain that meeting the target is a resolution result, not an acceptance certificate.
- Proposed section, how print size changes DPI: one `[!EXAMPLE]` using the Product's 1,200 × 1,800 image, with a small table comparing 4 × 6, 6 × 9, and 8 × 12 inches. Relate the maximum-size result to the same image; do not repeat a second full effective-DPI formula. Explain maximum size as each pixel dimension divided by 300.
- Proposed section, pixels and stored DPI: short paragraphs answering the 72-DPI question and missing/conflicting tags. Define PPI as image pixels per inch and explain the tool uses KDP's familiar DPI wording for this density. Avoid a glossary or technical metadata field catalogue.
- Proposed section, choosing the right placement size: explain illustration versus whole page versus full cover wrap, proportional scaling, and exporting a separate cropped image when cropping. Keep this section brief because the tool does not calculate book dimensions.
- Proposed section, what to do next: practical fixes for insufficient resolution, then final-PDF review, KDP previewer, and proof review. Include the print-only boundary and link to official eBook cover guidance only for readers checking that different task.

Use supported Markdown tables and the example callout through `ContentMarkdown`. No chart, marker art, screenshot, repeated FAQ, or separate visual is needed: the worked size table communicates the quantitative relationship directly.

### Concepts and result interpretation

Use the Product's independent examples and exact thresholds rather than inventing new rules. The three-size comparison illustrates the target, its exact 200 boundary, and a below-200 case. Explain that both axes matter; the unlocked 4 × 8-inch example demonstrates the 225-DPI limiting axis and stretching if an additional example is needed, without adding it to the main table.

A stored 72-DPI tag on the same 1,200 × 1,800 image does not change its 300-DPI result at 4 × 6 inches. Research's image-formatting and troubleshooting sources control this explanation. An unknown tag is unknown metadata, not zero resolution; unreadable and conflicting metadata remain separate UI states. No default density is assumed. The implemented Product contract controls these tool-specific states.

Maximum size assumes the complete source image and its proportions. It is not a KDP trim recommendation or a guarantee of sharpness. A rounded size is approximate. The Research sources control the resolution guidance; the Product calculation controls the exact maximum-size result.

### Usage, limits, and next step

Use checking a source illustration for a 4 × 6-inch placement as the main task. Mention inches, centimetres, and millimetres; keep proportions selected for normal scaling. Unlocking models stretching, not cropping. Leave both fields empty when only inspecting pixels and possible print size. Changing size requires checking again.

State one JPEG or PNG at a time and the 25 MiB file limit near usage. Resource limits in Product are checker limits, not KDP upload rules. Give short recovery guidance: use positive decimals in the selected unit, supply both dimensions when unlocked, and re-export unreadable or unsupported files as JPEG/PNG. Let field errors explain exact bounds. Images are processed in the browser; avoid broader claims about sitewide analytics or guaranteed privacy that the checker does not establish.

For insufficient resolution, use a smaller placement within the shown maximum or obtain a source with more genuine detail. Changing a density tag adds no pixels; increasing pixel dimensions alone cannot guarantee restored detail. This tool does not edit, convert, crop, resample, or export images. Avoid describing it as a PDF checker, full-cover dimension calculator, eBook cover validator, or test of color, sharpness, bleed, fonts, or complete KDP acceptance.

After layout and export, explain that readers should review images in the actual PDF at their final placement sizes, where placement or export compression may differ. Finish with KDP previewer and proof review as the next quality checks. Do not link to `/kdp-pdf-preflight-checker` while its registry entry is unpublished and the route returns 404; restore the link only after the sibling is published and reachable.

### Source roles and links

Use the verified Research sources, reviewed 23 September 2026, with links beside the claims they support. KDP can change its guidance; do not imply permanent thresholds or claim a fresh review date unless actually rechecked.

- Research's **Format Images in Your Book** controls the placement calculation, 300-DPI guidance, and below-200 definition. **Paperback Submission Guidelines** supplies the minimum wording and above-600 file-size context. Cite both around the threshold explanation so their different roles remain clear.
- **Fix Paperback and Hardcover Formatting Issues** supports practical recovery and final review; pair it with the image-formatting source for the density-tag explanation.
- **Create a Paperback Cover** controls full-wrap cover context. Link only where discussing the complete cover's dimensions; do not imply the checker calculates them.
- **What criteria does my eBook's cover image need to meet?** is an optional out-of-scope next step, not a source for this tool's print verdict. Do not repeat its mixed DPI/PPI wording as a print rule.
- Final-PDF review is the main continuation after export. The sibling **KDP PDF preflight checker** at `/kdp-pdf-preflight-checker` is unpublished in the development registry, so public copy must omit its link until publication makes the route reachable. Keep official KDP guidance links. Do not add unrelated KDP links merely for SEO.
- Competitor pages inform the coverage gap only. They do not control KDP requirements, the tool's privacy claims, or its implemented behavior, and need not appear in public copy.

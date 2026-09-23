---
name: stack127-cover-image-intake
description: Use when the user provides a generated cover image for Stack127 and wants it prepared for the site: exact 1200 x 675 JPG, small file size target, SEO-friendly filename, clean useful embedded metadata, alt text, and final placement guidance.
---

# Stack127 Cover Image Intake

Use this skill after the user provides a generated cover image.

Use `stack127_docs/writing-style.md` for alt text, descriptions, and other public wording.

## Required Output Asset

Prepare a site-ready image:
- Exact dimensions: `1200 x 675 px`.
- Format: `.jpg`.
- File size target: under `100 KB` when possible.
- Prioritize quality over forcing a bad-looking file under 100 KB. If the best acceptable result is larger, say so.
- Remove useless generator metadata, prompts, software cruft, thumbnails, GPS, device data, and unrelated EXIF/IPTC/XMP fields.
- Add clean SEO-friendly metadata to the file itself when tooling supports it.
- Produce a concise SEO-friendly filename.
- Produce alt text for the page and report it in the final response.

## Metadata Policy

Do not strip all metadata and stop there. The final JPG should keep useful metadata.

Preferred embedded metadata:
- Title/ObjectName: SEO-friendly image title.
- Description/ImageDescription/Caption-Abstract: natural description of the image and page context.
- Keywords/Subject: 3-8 relevant terms, no stuffing.
- Creator/Artist: `Stack127`.
- Copyright/rights: `Stack127`.

Alt text is primarily for HTML/page data, but also use it as the image description when writing metadata.

If `exiftool` or another metadata writer is not available, do not pretend metadata was embedded. Prepare the image as far as possible, then clearly report the missing metadata step and the exact metadata values to write later.

## Processing Workflow

1. Identify the target page title/slug. If missing, infer from the user's message or ask.
2. Inspect the source image dimensions and format.
3. Crop/pad/resize to exact `1200 x 675`.
4. Export JPG.
5. Compress toward `<100 KB` while checking visible quality.
6. Remove junk metadata.
7. Add clean SEO metadata to the file.
8. Verify final dimensions, format, file size, and metadata.
9. Return the final image path plus filename/title/alt text/metadata summary.

## Tool Guidance

Use the best available local toolchain.

Preferred:
- Image resize/compression: ImageMagick, Sharp, Pillow, or `sips`.
- Metadata write/read: `exiftool`.

If only macOS `sips` is available, use it for resizing/JPG export, but do not claim full SEO metadata embedding unless verified. `sips` can edit some image properties, but `exiftool` is more reliable for JPEG EXIF/IPTC/XMP metadata.

## Naming

Use a short lowercase filename:

```text
<page-slug>-cover.jpg
```

If multiple images exist for a page, use:

```text
<page-slug>-cover-<short-concept>.jpg
```

Avoid dates, random IDs, and vague names like `image.jpg`.

## Final Response

Keep the final concise:
- Final file path.
- Dimensions.
- File size.
- Metadata written, or metadata blocked with the missing tool named.
- Suggested title.
- Suggested alt text.
- Any quality tradeoff if the file could not stay under `100 KB`.

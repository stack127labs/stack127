# stack127 brand assets

The approved wordmark uses a clear double-storey a, geometric 127 numerals, and a chartreuse dot. The header and footer share `app/brand-wordmark.tsx`.

## Sources

`public/brand/originals/stack127-wordmark-approved.png` is the owner-selected September 2026 design. It is the current source for the wordmark and the cropped 127 mark.

The earlier `stack127-wordmark-original.png` and `stack127-mark-original.png` remain untouched in the same folder as historical sources. Their checksums remain protected by the brand tests.

## Website assets

`public/logos/stack127-wordmark-on-dark.png` and `stack127-wordmark-on-light.png` use transparent backgrounds. The text is off-white or black, respectively. Both keep the exact `#bafc3c` dot.

The transparent mark variants and solid square mark variants under `public/logos/` use the 127 portion of the approved design. The favicon, Apple touch icon, Android icons, organization logo, and default social image all use the matching dark square mark.

## Regeneration

Run `npm run stack127:brand:build`. The builder extracts the foreground from the approved dark source, normalizes the ink and accent colors, trims the margins, and produces the theme variants and icon sizes. The mark crop starts at the empty column between k and 1, at x=1207 in the 1983-pixel-wide approved source. Update this crop if the source changes.

The wordmark files are 1451 by 282 pixels. Keep the intrinsic dimensions in `app/brand-wordmark.tsx` aligned when replacing the source.

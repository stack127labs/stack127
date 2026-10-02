# stack127 brand assets

The approved wordmark has a clear double-storey a, geometric 127 numerals, and a chartreuse dot. The header and footer share `app/ui/site/brand-wordmark.tsx`.

## Sources

`public/brand/originals/stack127-wordmark-approved.png` is the September 2026 design the owner picked. It's the current source for the wordmark and the cropped 127 mark.

The earlier `stack127-wordmark-original.png` and `stack127-mark-original.png` stay untouched in the same folder as historical sources. The brand tests still protect their checksums.

## Website assets

| File | What it is |
| --- | --- |
| `public/logos/stack127-wordmark-on-dark.png` | Off-white text on a transparent background, with the exact `#bafc3c` dot. |
| `public/logos/stack127-wordmark-on-light.png` | Black text on a transparent background, with the exact `#bafc3c` dot. |
| Transparent and solid square mark variants in `public/logos/` | The 127 part of the approved design. |

The favicon, Apple touch icon, Android icons, organization logo, and default social image all use the matching dark square mark.

## Regeneration

Run `npm run stack127:brand:build`. The builder:

1. Pulls the foreground from the approved dark source.
2. Normalizes the ink and accent colors.
3. Trims the margins.
4. Writes the theme variants and icon sizes.

The mark crop starts at the empty column between k and 1. That's x=1207 in the 1983-pixel-wide approved source. Update this crop if the source changes.

The wordmark files are 1451 by 282 pixels. When you replace the source, keep the intrinsic dimensions in `app/ui/site/brand-wordmark.tsx` in sync.

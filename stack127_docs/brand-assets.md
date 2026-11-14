# stack127 brand assets

The wordmark has a lighter geometric "stack" (single-storey a, tall t and k, chosen November 2026), the original geometric 127 numerals, and a chartreuse dot. The header and footer share `app/ui/site/brand-wordmark.tsx`.

## Sources

`public/brand/originals/stack127-wordmark-hybrid-on-dark.svg` and `-on-light.svg` are the November 2026 wordmark the owner picked: a new "stack" with the unchanged 127. They are the source for the wordmark. The light original has a darker dot; the site keeps `#bafc3c` in both themes.

`public/brand/originals/stack127-wordmark-approved.png` is the September 2026 design. It's still the source for the cropped 127 mark and the icons.

The earlier `stack127-wordmark-original.png` and `stack127-mark-original.png` stay untouched in the same folder as historical sources. The brand tests still protect their checksums.

## Website assets

| File | What it is |
| --- | --- |
| `public/logos/stack127-wordmark-on-dark.svg` | `#f2f2ee` text on a transparent background, with the exact `#bafc3c` dot. |
| `public/logos/stack127-wordmark-on-light.svg` | Black text on a transparent background, with the exact `#bafc3c` dot. |
| Transparent and solid square mark variants in `public/logos/` | The 127 part of the approved design. |

The favicon, Apple touch icon, Android icons, organization logo, and default social image all use the matching dark square mark.

## Regeneration

The wordmark SVGs are the hybrid originals with path numbers rounded to whole units, the text color set per theme, and the dot set to `#bafc3c`. Edit them by hand from the originals; the builder doesn't touch them.

Run `npm run stack127:brand:build` for the 127 mark and icons. The builder:

1. Pulls the foreground from the approved dark source.
2. Normalizes the ink and accent colors.
3. Trims the margins.
4. Writes the theme variants and icon sizes.

The mark crop starts at the empty column between k and 1. That's x=1207 in the 1983-pixel-wide approved source. Update this crop if the source changes.

The wordmark SVG view box is 3438 by 790. When you replace it, keep the intrinsic dimensions in `app/ui/site/brand-wordmark.tsx` in sync.

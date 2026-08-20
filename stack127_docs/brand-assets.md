# Stack127 brand assets

The supplied raster artwork is the source of truth for the Stack127 wordmark and square mark. Untouched originals live in `public/brand/originals/` so later vectorization or other brand work can start from the exact files supplied by the owner.

## Originals

- `public/brand/originals/stack127-wordmark-original.png` is the original black `stack127.` wordmark on white.
- `public/brand/originals/stack127-mark-original.png` is the original black `127.` square mark on white.

Do not optimize, resize, overwrite, or remove metadata from these two files. Their SHA-256 checksums are protected by `tests/stack127/brand-assets.test.mjs`.

## Website variants

- `public/logos/stack127-wordmark-on-dark.png` is the off-white transparent wordmark shown in dark mode.
- `public/logos/stack127-wordmark-on-light.png` is the black transparent wordmark shown in light mode.
- `public/logos/stack127-mark-on-dark.png` and `public/logos/stack127-mark-on-light.png` are transparent square-mark derivatives for future layouts.
- `public/logos/stack127-mark-dark-square.png` and `public/logos/stack127-mark-light-square.png` are solid-background avatar/app-icon derivatives.

The site uses the dark square mark for its favicon, Apple touch icon, Android icons, and organization-logo structured data. The dark square was selected because the off-white mark stays clear against both light and dark browser chrome while matching the site's dark-first visual identity.

## Regeneration

Run `npm run stack127:brand:build` after an intentional original-asset replacement. The build removes the light background with a deterministic alpha mask, creates theme variants without redrawing the supplied artwork, and regenerates the complete favicon family.

The image-generation editor was attempted for the initial background extraction, but its safety system rejected the plain wordmark twice. The checked-in derivatives therefore use the deterministic local processor, which preserves the supplied letterforms exactly.

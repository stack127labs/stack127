# HomeLabHQ Design Direction

This file captures the current visual baseline from the first HomeLabHQ homepage prototype. Treat this as the design-system seed. Details can evolve, but future UI should preserve the same core personality unless intentionally redesigned.

## Identity

HomeLabHQ should feel playful, soft, app-like, and friendly. It should not feel like a cold developer dashboard or a generic SaaS marketing page.

The current mood:

- Cozy self-hosting directory.
- Consumer-friendly open-source tool.
- Big rounded shapes.
- Soft white cards.
- Blue infrastructure/trust brand energy.
- Small yellow dot and doodle accents.
- Compact but playful app cards.
- Green is reserved for status signals such as open source, active, healthy, or verified.

## Typography

Current font stack:

```css
Arial Rounded MT Bold,
Avenir Next,
Inter,
ui-rounded,
system-ui,
-apple-system,
BlinkMacSystemFont,
"Segoe UI",
sans-serif
```

The visual feel mostly comes from `Arial Rounded MT Bold` where available. It gives the chunky, friendly, rounded headline style.

Usage:

- Logo, nav, and headlines use the heavy rounded style.
- Body and secondary text lean on `Avenir Next`, `Inter`, or system UI.
- Global letter spacing stays normal.
- Logo and hero headline use tighter spacing.
- Lowercase labels and headlines are preferred for friendliness.

## Core Colors

Current CSS variables:

```css
--background: #f7f7f5;
--surface: rgba(255, 255, 255, 0.82);
--surface-strong: #ffffff;
--text: #191919;
--muted: #6a6a6a;
--soft: #efefec;
--line: rgba(26, 26, 26, 0.1);

--brand: #1d63e9;
--brand-dark: #0f45b7;
--brand-soft: #eaf3ff;
--green: #03bf18;
--green-dark: #018d14;
--green-soft: #e9f9e9;
--yellow: #f6c400;

--blue-soft: #e8f1ff;
--purple-soft: #f1e7ff;
--orange-soft: #fff0ce;
```

Brand anchor:

```css
#1d63e9
```

Playful accent yellow:

```css
#f6c400
```

The palette should remain simple: warm off-white background, deep text, bright blue brand surfaces, sparing yellow dots/doodles, green status pills, and soft pastel supporting pills.

Hard rule: no gradients anywhere in the design. Use flat colors, borders, shadows, and illustration shapes instead.

## Dark Mode

Dark mode should preserve the same playful identity rather than becoming flat black.

Current dark-mode direction:

- Root selector: `data-theme="dark"` on the `html` element.
- Main background: near-black with a slight blue bias, currently `#0d0f14`.
- Main text: soft off-white, currently `#f8faff`.
- Muted text: cool grey-blue, currently `#c0c9dd`.
- Card surface: translucent dark neutral-blue, currently `rgba(20, 23, 31, 0.9)`.
- Strong surface: `#151923`.
- Nav surface: `rgba(17, 20, 28, 0.94)`.
- Icon button surface: `#202532`.
- Brand blue brightens slightly to `#4b8cff`.
- Pastel badges become muted translucent color fields rather than bright light pills.
- Shadows become deeper but still soft, not harsh.

Theme behavior:

- The theme toggle lives in the top nav.
- The button switches between a CSS-drawn sun icon and moon icon.
- The selected mode is persisted in `localStorage` as `homelabhq-theme`.
- A small pre-hydration script applies the saved/system theme before React renders to avoid a light-mode flash.

## Radius

Current radius tokens:

```css
--radius-xl: 22px;
--radius-lg: 14px;
--radius-md: 10px;
```

Actual usage:

- Top nav: `14px`.
- Hero visual/stat panel: `22px`.
- App cards: `12px`.
- Collection/sidebar card: `14px`.
- Search input: `12px`.
- Confidence strip: `14px`.
- Pills and primary buttons: `999px`.
- Small icon buttons: circular.

Use a modern low-radius system: colorful and friendly through palette, typography, icons, and illustrations, but structurally closer to a practical productivity/infrastructure app. Pills should stay fully rounded.

## Shadows

Current shadow tokens:

```css
--shadow: 0 24px 80px rgba(20, 20, 20, 0.09);
--card-shadow: 0 14px 38px rgba(20, 20, 20, 0.06);
```

Shadows should feel soft and airy, not dark or heavy.

## Layout Direction

The initial homepage structure:

1. Floating rounded top nav.
2. Big left headline.
3. Soft blue visual/stat card on the right.
4. Search row plus category pills.
5. Content grid with a left featured collection card and app cards.
6. Bottom confidence strip.

The first screen should still be the product surface. Personality is welcome, but users should quickly reach browsing, search, categories, and app cards.

## Buttons

Primary buttons:

```css
background: #1d63e9;
color: white;
border-radius: 999px;
font-weight: 900;
box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.12);
```

Secondary buttons:

- White background.
- Black text.
- Fully rounded.
- Soft shadow or subtle border.

## Cards

App cards:

- White translucent surface.
- `24px` radius.
- `1px` subtle border.
- Soft shadow.
- Compact icon plus text layout.
- Save/bookmark icon at top-right.
- Tag pills at the bottom.

Current card surface:

```css
background: rgba(255, 255, 255, 0.82);
border: 1px solid rgba(26, 26, 26, 0.1);
box-shadow: 0 14px 38px rgba(20, 20, 20, 0.06);
```

## Icons

The current prototype uses mostly CSS-drawn placeholders rather than an icon library:

- CSS-drawn search icon.
- CSS-drawn bookmark icon.
- CSS-drawn sun/moon theme icon.
- CSS-drawn check badges.
- CSS-drawn app logo placeholders.
- CSS-drawn server shelf, app tiles, and lock illustration.

Future direction:

- Use `lucide-react` for functional UI icons.
- Use real app logos or carefully designed colorful marks for apps.
- Keep homelab/server/tool illustrations custom for brand moments.
- Do not overuse decorative icons where data density matters.

## Badges And Pills

Badge direction:

- Lowercase text.
- Rounded pill.
- Soft pastel background.
- High-contrast label.
- Small and compact.

Current examples:

```css
/* open source */
background: #e9f9e9;
color: #018d14;

/* docker */
background: #e8f1ff;
color: #0661c8;

/* mobile / iot */
background: #f1e7ff;
color: #8740cf;

/* monitoring */
background: #fff0ce;
color: #b97700;
```

## Illustration Language

Current style:

- Bright blue panels.
- Simple server, storage, tool, and app-tile shapes.
- Yellow doodle strokes.
- White lock illustration.
- Slightly toy-like geometry.
- No stock images.
- No gradients.

Illustrations should make self-hosting feel approachable without making the app childish.

## Spacing

Current spacing direction:

- Page shell: `min(1500px, 100% - 64px)`.
- Nav height: `78px`.
- Hero padding: `36px 48px 26px`.
- Card grid gap: `18px`.
- Major section gap: roughly `28px` to `48px`.

Use larger breathing room in hero areas and tighter density in app grids and operational surfaces.

## Design Rules To Keep

- Use dark text on warm off-white for light mode.
- Let blue be the brand anchor.
- Keep green for health/status signals.
- Use yellow doodles sparingly as playful accents.
- Round almost everything, but do not make it childish.
- Keep labels and headlines friendly and often lowercase.
- Keep cards compact and practical.
- Make directory/product content visible on the first screen.
- Avoid fake enterprise seriousness.
- Do not use gradients anywhere.
- Avoid stock images.
- Prefer visual personality, but keep app data scannable.

## Future Systemization

When the UI grows, extract this into proper design primitives:

- Color tokens.
- Radius tokens.
- Shadow tokens.
- Type scale.
- Button variants.
- Badge variants.
- Card variants.
- Layout primitives.
- Dark mode tokens.

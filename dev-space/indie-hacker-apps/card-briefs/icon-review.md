# Icon review: brief for reviewer agents

You are a sub-agent in the `writer` role, working for the lead agent (not the main agent). Your job is to check the researchers' icon work. Review only: do not edit, move or delete any file, and do not commit, push, or browse the web. Checkout: `/Users/ravitejaknts/.t3/worktrees/stack127/t3-64138b8e`.

## What you're checking

Every app in the directory has (or should have) an official icon at `public/indie-hacker-apps/icons/<category>/<slug>.png`, with a source record at `dev-space/indie-hacker-apps/<research_dir>/icons/<slug>.json` (fields: `name`, `official_url`, `image_url`, `source_page`, `kind`, `note`). The owner wants 100% accuracy: each icon must be the product's own, current, official mark.

Contact sheets are in `tmp/icon-review/<category>-<n>.png` (open them with your Read tool to see them). Each tile shows the icon on a light and a dark background, the app name, its official domain, the icon's source host and kind, and the slug. "no icon" in red means the app has none yet (that's known; just count them).

## Part 1: look at every tile on your sheets

For each tile, flag it if any of these is true:

1. **Wrong brand.** The icon belongs to a different company or product than the name (for example a look-alike App Store app, a customer's logo, a payment-method logo like Visa).
2. **Framework or platform default.** The icon is a website builder's or framework's default favicon instead of the product's own: Astro (a black "A" with a flame), Vite, React atom, Next.js, Nuxt, Svelte, Vue, Laravel, WordPress "W", Webflow "W", Framer, Wix, Squarespace, Shopify bag (unless the app is Shopify's own), Ghost (unless the app is Ghost's), GitHub Octocat, a generic globe, cloud or padlock, or a GitHub identicon (a blocky geometric pattern).
3. **Outdated mark.** You know the brand changed its logo and this is the old one (for example ConvertKit instead of Kit, Sendinblue instead of Brevo).
4. **Parent brand where a product icon clearly exists.** For example a whole-company logo on a product that has its own well-known icon. A parent icon is fine when the note says the product has none.
5. **Unreadable.** A wordmark squeezed so small it can't be read, a blank or nearly invisible icon (check both backgrounds), a heavily blurred image, or a person's photo.

Only flag what you can see or know. Don't guess about brands you don't recognise. For unknown brands, check instead that the image is a plausible logo (not a stock photo, screenshot or placeholder).

## Part 2: spot-check 15 source records per category

Pick 15 apps per category, about half well-known and half random (`ls dev-space/indie-hacker-apps/<research_dir>/icons/`). For each, open the record and check:

- `source_page` and `image_url` are on the app's own official domain, its official CDN, the official App Store listing (`apps.apple.com`, image on `mzstatic.com`, and the `note` names the same developer company), the official GitHub organization, or an official cloud icon pack. Not a third-party site.
- `kind` and `note` fit what the image is.
- The image file in `tmp/icon-candidates/<category>/<slug>/` that matches the record looks like the saved PNG.

## Report

Report back (under 400 words):
- For each flagged tile: `category/slug`, the problem type (1–5), and one line on what you see and what it should be.
- For each source-record problem: `category/slug` and what's wrong.
- One line per category: tiles checked, tiles flagged, records checked, records with problems, "no icon" count.

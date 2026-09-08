# Brief: app card lab

## Who is here

Teja is choosing a simpler card layout for the self-host and CLI app directories.

## The job

Compare ten numbered designs using the same two published directory samples, Home Assistant and Gemini CLI. Each design gets one desktop row with one self-host card and one CLI card. Choose a number before changing either directory. This is a development-only, noindex preview, not a published directory.

Fact rows is the selected direction for the next preview. Its row now adds Deno and uses three columns when the main column is wider than 900px, two down to 650px, then one. Keep the sidebar, original images, and all fields. Other design options stay unchanged until the three-card layout is approved.

In Fact rows, put the primary category directly below the app name instead of the repeated app-type label. Show +N beside it for additional categories, with the names in its hover title and accessible text. Remove the duplicate category list below the description. Add a small meaningful icon beside the category and every fact label, while retaining the written labels and full values.

The category-and-icon revision passes the focused browser tests in both themes from 320 to 1600px. Tests verify the +1 label and its category name, no duplicate category list, an icon on every fact, unchanged values, and three cards per desktop row. Original app images remain unchanged. Desktop and mobile screenshots were reviewed.

The three-column revision passes the focused browser checks, including three cards sharing one row at 1255px, 1280px, and 1600px, original image loading, full field preservation, keyboard navigation, and narrow-screen wrapping in both themes. Desktop screenshots at 1255px and 1600px were visually reviewed. Deno's read-only published snapshot was captured on 2026-09-06; its 108273 stars format as 108.3K, and its unpublished version remains unknown.

## Show vs say

Only a page title, design names, and cards in the real AppShell main column. Its normal left sidebar contains links to the ten options and both directories. Preserve the directory summaries, categories, conditional maintenance notices, and actual card facts. Self-host cards keep source model, price, RAM, storage, and last update, including estimate qualifiers. CLI cards keep app type, stars, price, license, platforms, version, and last commit. App identity uses the record's actual image URL without recoloring or replacing it with a vector or monogram. Cards link to official sites in a new tab. Numbers identify options for feedback, not steps.

## Design contract

Reuse the site's Space Grotesk headings, Inter descriptions, IBM Plex Mono metadata, and 2px corners. Dark tokens are background #101010, surface #191919, text #f2f2ee, muted #9d9c95, and chartreuse #bafc3c for focus. Borders use the shared neutral alpha token. Actual colors come from shared tokens, including light mode.

Compare balanced, compact-fact, fact-row, split, side-icon, header-band, footer-grid, key-stat, label-column, and open-card structures. Keep the same complete facts in every design. Desktop grids show two apps per row; narrow main columns stack the cards. Use the directories' main-column gutters, not a wider standalone canvas. No gradients, decorative shadows, motion, truncation, hidden facts, fake controls, or nested links.

The variations intentionally override the existing card structure only inside this lab. The user's requested comparison takes precedence over a single-direction design workflow. Do not add screenshots or marker art: app identity and text hierarchy are what is being compared.

## Sample sources

The development self-host records lack most requirement and pricing fields. The preview therefore uses a stable, read-only snapshot of published Home Assistant and Gemini CLI card data, captured on 2026-09-06 in `app/(site)/app-card-lab/card-data.ts`. The production query used the same release-date and GitHub-field precedence as the directory loaders. RAM is the existing card's 2-4gb tier derived from its stored 4096MB deployment limit, not a new claim about a universal minimum. Storage retains the existing high profile. Gemini CLI's version is unknown in the record and remains unknown. Its 106595 stars format as 106.6K. No database rows or existing directory cards are changed; the preview never connects to production at runtime.

## Verification

The first preview passed layout tests but omitted the directory facts and used monochrome symbols. That was not an acceptable comparison. The revised standalone Playwright checks pass for field parity, loaded original images, the shared sidebar, one desktop row per design, keyboard focus, mobile navigation, responsive wrapping from 320 to 1600px, both themes, noindex, and sitemap exclusion. The revised desktop page and mobile card screenshots were visually reviewed. The in-app browser had no connected instance, so this was standalone Playwright QA.

Static policy passes. The complete quality command remains blocked by unrelated directory tests; the isolated full unit rerun reports 846 passed and 14 failed. This preview has not been published, and the original directory UI and database records remain unchanged.

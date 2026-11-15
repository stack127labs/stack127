# App icons: brief for researcher agents

You are a sub-agent in the `researcher` role, working for the lead agent (not the main agent). Work in the shared checkout `/Users/ravitejaknts/.t3/worktrees/stack127/t3-64138b8e`. Do not commit, push, create branches, sign up, or log in. You may fetch public web pages and images (curl or your web tools).

## Goal

Every app in your category needs its correct, current, official icon, saved as a 128×128 PNG. The icons show on the directory cards next to each app name, so a wrong or outdated icon is a visible error. The owner wants 100% accuracy and no app left without an icon.

Apps are the card files `dev-space/indie-hacker-apps/<research_dir>/cards/<slug>.json`. Each card has `name` and `url` (the official site).

## How to save an icon (offline candidates)

Your network access is unreliable, so the lead has already downloaded every icon the official sites publish. For each app there is a folder `tmp/icon-candidates/<category>/<slug>/` with:

- `index.json`: the official page (`page_url`; `page_error` if the page itself blocked scripts), and every candidate with its source `url`, `kind`, declared `sizes`, real `format`, `width`, `height`, the original `file`, an optional `converted` PNG (for old .ico files), a 128 px `preview`, or an `error`.
- The files themselves.

Pick the right candidate (see the rules below), **open its preview image and look at it** to confirm it shows this product's brand mark, then save it:

```bash
node scripts/indie-hacker-apps/save-icon.mjs <category> <slug> --file tmp/icon-candidates/<category>/<slug>/<file or converted> --image-url "<candidate url>" --page "<page_url>" --kind <kind> [--note "<anything a checker should know>"]
```

Use the original `file` for SVG and PNG candidates, and the `converted` PNG for .ico candidates. `<kind>`: apple-touch-icon, manifest-icon, favicon, svg-icon, press-kit, logo-mark, app-store, github-avatar, other.

The script rejects tiny images (under 32 px), blank or single-colour images and HTML pages. It writes `public/indie-hacker-apps/icons/<category>/<slug>.png` and a source record `dev-space/indie-hacker-apps/<research_dir>/icons/<slug>.json`. Check with `node scripts/indie-hacker-apps/check-icons.mjs <category> <slug> --warnings`.

**No good candidate?** (none downloaded, only a tiny favicon, only a wordmark, or the candidates show a different brand.) If your network works, you may fetch an official source yourself (rule 6) and save it with an image URL instead of `--file`. Otherwise don't save anything; list the app in your report with what the candidates showed. The lead will fetch more sources.

**Already saved icons:** a few apps already have an icon from an earlier run. Check those too, and save again if a better or more correct candidate exists.

## Accuracy rules

1. **Official sources only.** Use the app's official site (its `<link rel="icon">`, `apple-touch-icon`, `manifest.json` icons, `/favicon.svg`), its official brand or press kit page, its official App Store or Google Play listing, or its official GitHub organization avatar. Never use third-party icon sites or services (Google's favicon service, Clearbit, icon libraries, Wikipedia, logo download sites, directories).
2. **The product's own, current mark.** After a rebrand, use the new mark (for example Kit, not ConvertKit). If a product has its own icon, use it rather than the parent company's (for example a product inside a larger suite). If the product has no icon of its own, use the parent brand's icon and say so in `--note "parent brand: <name>"`.
3. **A square icon, not a wordmark.** Prefer the square brand mark or app icon. A full wordmark squeezed into a square is unreadable; use it only if nothing else exists, and say so in `--note`.
4. **Best quality available.** Prefer SVG, then PNG at 180 px or larger (apple-touch-icon, manifest icons of 192 or 512), then a favicon PNG of 64 px or more. Use a 32–48 px favicon only when nothing larger exists, and note it.
5. **Right page.** Check the icon belongs to this exact product, not a similarly named one. Match it against the card's `url`. For self-hosted or open-source projects, the project's official site or official GitHub organization avatar is right.
6. **Blocked sites.** If the site blocks scripts, try the common paths directly (`/apple-touch-icon.png`, `/favicon.svg`, `/favicon.png`, `/manifest.json`, `/site.webmanifest`), the official GitHub org avatar (`https://github.com/<org>.png?size=256`), or the official App Store listing. Record the page you actually used.
7. **Never leave an app without an icon.** If you truly can't find any official icon, don't save one; list the app in your report with what you tried.

## How to work

One app at a time, in alphabetical order. Find the source, save it, run the check, then move on. Don't pick icons with a loop or script: each icon needs you to look at the candidates and judge which mark is right. You may use a script only to list which apps still lack an icon: `node scripts/indie-hacker-apps/check-icons.mjs <category> --missing`.

Keep going as long as you can in your turn. Report (under 150 words): icons saved, the last slug reached, the checker's final line, apps you couldn't find an official icon for (with what you tried), and any icon you're unsure about.

## When a download fails

If one app's download fails (DNS error, timeout, `fetch failed`), don't stop. Try the other official sources from rule 6 once. If they also fail, write the app down, move on to the next app, and list all such apps in your report with the URLs you tried. The lead can fetch those files from another machine and hand them to you. Stop early only if every download fails for several apps in a row, which means your network is down; say so in the report.

## Weak or missing candidates (this run)

If an app has no usable candidate, or its best candidate is under 64 px, skip it for now and list it in your report. The lead is fetching better sources for those apps with a real browser and will send them in a later run. Don't save a tiny favicon just to fill the gap.

## Big-cloud services (AWS, Azure, Google Cloud)

Each AWS, Azure and Google Cloud service has its own official icon, so don't use the company favicon for every service. The lead downloaded the official icon packs into `tmp/icon-packs/`:

| Cloud | Folder | Pick | `--image-url` | `--page` |
| --- | --- | --- | --- | --- |
| AWS | `tmp/icon-packs/aws/Architecture-Service-Icons_*/Arch_*/64/Arch_<Service>_64.svg` | the service's own SVG, e.g. `Arch_Amazon-Simple-Email-Service_64.svg` | https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Icon-package_07312026.5846e92413caa21490223536cc97f1269e44fa92.zip | https://aws.amazon.com/architecture/icons/ |
| Azure | `tmp/icon-packs/azure/` | the service's SVG | https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V25.zip | https://learn.microsoft.com/en-us/azure/architecture/icons/ |
| Google Cloud | `tmp/icon-packs/gcp-core/`, then `tmp/icon-packs/gcp-legacy/` | the product's SVG | https://services.google.com/fh/files/misc/core-products-icons.zip (or the legacy zip) | https://cloud.google.com/icons |

Use `--kind press-kit`. If a service has no icon in its pack, use the parent brand's icon with `--note "parent brand: AWS"` (or Azure / Google Cloud). The checker warns when two apps share the same image; for cloud services that warning means the service icon is still missing.

## Hard cases (extra sources)

For apps still missing an icon, the lead added more candidates to each `index.json` (marked `"via": "browser"` or `"via": "extra"`):

- **Browser candidates**: the same official page loaded in real Chrome, which gets past most script blocks. Includes header logo images.
- **GitHub organization avatars** (`kind: github-avatar`, with a `note` naming the org and how often the research file mentions it). Use one only when the org is the product's official organization. A personal account avatar (a person's photo or a generic identicon) is not an icon. For code libraries with no logo of their own, the official organization's avatar is acceptable: add `--note "official GitHub organization avatar"`.
- **App Store icons** (`kind: app-store`, `note` gives the app name and developer). Use one only when the developer is the same company as the product. The search returns look-alikes from other companies; reject them. Pass the App Store URL from `page` as `--page`.

Rules that changed:

- The saver no longer rejects one-colour logos on a transparent background (it only rejects solid squares), so marks that failed as "flat colour" before will save now.
- For hard cases, an official 48 px favicon is acceptable when nothing larger exists anywhere, rather than leaving the app without an icon. Add `--note "largest official icon is 48 px"`. Still never use a third-party source.
- **Parent-brand duplicates**: when a product has its own icon (in the browser candidates, App Store, or the cloud icon packs), replace the shared parent icon. Products that truly have no icon of their own keep the parent icon with its note.
- **Light on white**: if the checker says a mark is mostly white on transparent, pick a candidate with its own background (apple-touch-icon or App Store icons usually have one).

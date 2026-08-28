# Brief: keyboard shortcuts

## Who is here

A developer or power user wants the useful keys for one of the tools they already use. They may be
checking platform support before opening a sheet, or choosing several apps for one printable page.

## The job

The catalog lets the reader compare available apps, platforms, and shortcut counts. Choosing an app
opens its full shortcut reference. The reader can then build a printable sheet with that app selected.
The catalog lives at `/keyboard-shortcuts`, and each app lives at `/keyboard-shortcuts/<app>`.
The removed `/shortcuts/*` pages do not redirect.

## Show vs say

One section per category keeps the catalog easy to scan. Each section uses a table for the repeated
app, platform, and count fields. Each app reference uses grouped tables for actions and platform keys,
with short notes only where a mode or sequence needs explanation. The printable sheet remains a
separate tool. Charts, screenshots, provenance labels, and decorative copy do not belong here.

## Data rules

The structured records in `lib/shortcuts` feed both pages. Unknown keys remain unknown. Every app
keeps its official source URL and last-verified date in the data, not in the public catalog.

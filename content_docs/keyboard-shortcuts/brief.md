# Brief: keyboard shortcuts

## Who is here

A developer or power user wants the useful keys for one of the tools they already use. They may be
checking platform support before opening a sheet, or choosing several apps for one printable page.

## The job

The catalog lets the reader compare available apps, platforms, and shortcut counts. Choosing an app
opens the cheatsheet generator with that app selected. There is one catalog URL and one generator
URL. The removed `/shortcuts/*` pages do not redirect.

## Show vs say

One section per category keeps the catalog easy to scan. Each section uses a table for the repeated
app, platform, and count fields. App links open a configured sheet where the actual key bindings are
grouped by task and platform. No app landing pages, charts, screenshots, provenance labels, or
decorative copy belong here.

## Data rules

The structured records in `lib/shortcuts` feed both pages. Unknown keys remain unknown. Every app
keeps its official source URL and last-verified date in the data, not in the public catalog.

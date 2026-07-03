# Self-Host Apps Pipeline

This folder owns data collection and validation for `/self-host-apps`.

The public page stays minimal, but the pipeline keeps enough source metadata to audit every imported fact.

## Flow

1. Discover candidates from Awesome-style lists, GitHub topics, and other directories.
2. Store raw source payloads in `self_host_apps_sources`.
3. Normalize into the active `self_host_apps` schema.
4. Rewrite summaries using version127 rules.
5. Validate links, enums, categories, and summary quality.
6. Upsert rows, category links, and field source metadata.
7. Audit links and summaries before larger imports.

## Summary Rule

`summary` replaces the old `description` field.

It must be one short original sentence that explains what the app actually does. Do not copy README, docs, marketing copy, or directory text.

Good:

```text
Photo and video backup app for building a private Google Photos-style library.
```

Bad:

```text
Open-source self-hosted photo management solution.
```

Avoid generic filler such as `open source`, `self-hosted`, `solution`, `powerful`, `ultimate`, and `all-in-one` unless it is truly essential to the app.

## Commands

See `scripts.json` in this folder for the command index.

Durable package scripts use the page slug prefix, for example `self-host-apps:refresh-github`.

Temporary one-off scripts belong in `scripts/self-host-apps/temp/` and should be deleted after use.

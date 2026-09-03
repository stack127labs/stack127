# Supabase directory media migration

On 3 September 2026, stack127 moved the production CLI and self-host app icons
from tracked files into one public Supabase Storage bucket named
`stack127-media`.

The bucket accepts image files up to 10 MB and does not grant anonymous upload,
update, move, copy, or delete access. Editorial scripts authenticate with
`SUPABASE_SECRET_KEY`. Public reads use the conventional Supabase Storage URL.

Objects use content-hashed paths:

```text
directories/<directory-slug>/<kind>/<record-slug>-<sha256-prefix>.<extension>
```

Changing an image creates a new object URL. This prevents a browser from
holding an old image after its database row changes. Directory records store
the complete public URL, so app additions and content corrections become live
from database changes without a Next.js release.

The initial production migration uploaded 309 CLI icons and 5,190 self-host
app icons. All 309 terminal app rows and all 4,996 visible self-host app rows
had managed URLs after the switch. The tracked `public/cli-app-icons` and
`public/app-icons` directories were then removed; Git history remains the
rollback source for those files.

The unfinished hardware directory routes were not included in this production
release. Their existing media was still moved into the bucket: 6,337 Zigbee
device images, 3,034 Z-Wave device images, 2,136 local security camera images,
146 UPS images, 78 Zigbee coordinator images, and 651 Matter device images.
The five snapshots that already referenced images were rewritten to managed
URLs. The Matter snapshot had no image fields, so its object map was retained
with the local backup instead of inventing record associations.

The original hardware snapshots and image folders were moved to a temporary
backup before local copies were removed. `migrate-json-images.mjs` provides the
same upload-and-atomic-rewrite path for future file-backed snapshot imports.

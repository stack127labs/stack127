# DNS Tools

The `/dns-tools` surface groups compact, evidence-first DNS troubleshooting tools. The first release contains the hub and `/dns-tools/dns-lookup`.

## Rules

- Keep the useful input and result above the explanatory content.
- Use the shared Version127 shell and DNS tools sidebar.
- Keep public explanations server-rendered.
- Keep user-requested DNS results client-rendered and out of search indexing.
- Query only fixed, reviewed public resolver endpoints from the server.
- Never describe one resolver lookup as global propagation.
- Never replace technical findings with a health score.
- Do not create thin pages that only change the record type.
- Do not use `ANY` as a substitute for the Common records bundle.
- Unknown, absent, and invalid provider values remain unknown rather than becoming false or empty.

## Publication

The hub and exact tool slug are published only through `public.version127_pages`. Query-param lookup states are `noindex, follow` and keep the clean tool canonical.

See `dns-lookup.md` for the first tool contract.

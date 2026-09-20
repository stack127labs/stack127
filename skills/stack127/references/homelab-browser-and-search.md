# Homelab browser and search

Use the Codex in-app Browser for local page inspection and competitor operation when available. If it is unavailable, use another available read-only browser tool. Static source inspection can support a code review but does not prove that an interaction works.

For local work:

1. Start `npm run dev` as a background service on the homelab.
2. Wait for port 3333 to respond.
3. Reuse that server for the complete task.
4. Check the real database-backed route at desktop and mobile width.
5. Stop the server when the task ends.

Do not launch a long-running server as a blocking test command. Give the user the current Tailscale URL, not localhost.

For search, prefer the configured local SearXNG endpoint. If it is unavailable, use the web-search connector. Search results discover candidates. Operated pages and primary documentation support claims.

Record direct URLs and any access limitation in the tool spec. Screenshots, traces, bounding-box dumps, and browser evidence files are optional debugging aids, not required deliverables.

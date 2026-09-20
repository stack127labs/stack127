# Homelab development

The main stack127 workspace is `/home/teja/projects/stack127` on `teja-homelab`. Work here unless the user names another checkout.

## Environment

- `.env.local`: managed development Supabase
- `.env.database`: production database checks and approved production work
- `.env.deploy`: OVH, Cloudflare, and Dokploy
- `.env.analytics`: analytics
- `.env.homelab`: homelab administration
- `.env.repos`: repository automation

Do not start a local Supabase Docker stack. Do not print, copy, or commit secrets.

## Development server

`npm run dev` and `npm run start` bind to `0.0.0.0:3333`.

Treat the server as a background service:

1. Start it once.
2. Wait until `http://127.0.0.1:3333` responds.
3. Reuse it for the task.
4. Stop it when the task ends unless the user wants the preview left running.

Do not run a development server as a blocking test and wait for it to exit.

## Remote link

The user's Mac reaches the homelab through Tailscale. Run `tailscale status`, find the current IPv4 address for `teja-homelab`, and return:

```text
http://<tailscale-ip>:3333/<route>
```

Do not give the user `localhost` or `127.0.0.1`. Do not expose port 3333 to the public internet.

## Minimum local check

Run a focused calculation or parser test when relevant. Check the real changed page at desktop and mobile width. For route, shared runtime, SEO, or production configuration changes, run `npm run test:core` and `npm run build` once; the build already checks TypeScript. Use `npm run quality` only when TypeScript changed and no build is needed.

Build output such as `.next`, `.next-*`, `test-results`, and temporary logs is disposable and must not be committed.

## Other repositories

Independent stack127 repositories live in separate checkouts under `/home/teja/projects/`. They are not nested dependencies of this repository. Read `stack127_docs/stack127-repos.md` before editing one.

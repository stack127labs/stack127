# Homelab development

The main stack127 workspace is `/srv/data/projects/stack127` on `teja-homelab`. Work here unless the user names another checkout.

## Environment

- `.env.local`: managed development Supabase
- `.env.database`: production database checks and approved production work
- `.env.deploy`: OVH, Cloudflare, and Dokploy
- `.env.analytics`: analytics
- `.env.homelab`: homelab administration
- `.env.repos`: repository automation

Do not start a local Supabase Docker stack. Do not print or commit secrets. Store real private `.env.*` files in the main checkout `/srv/data/projects/stack127`. Worktrees link directly to those files; the files stay at mode `0600` and ignored by Git.

For a replacement development project, follow [development database recovery](development-database.md).
Production supplies the published website records. Both databases hold private drafts for platform fees, launch directories, and ad networks. These drafts stay unpublished in production. Keep development previews when refreshing records.

## Development server

`npm run dev` and `npm run start` bind to `0.0.0.0:3333`.

Treat the server as a background service:

1. Start it once.
2. Wait until `http://127.0.0.1:3333` responds.
3. Reuse it for the task.
4. Stop it when the task ends unless the user wants the preview left running.

Do not run a development server as a blocking test and wait for it to exit.

### T3 Code actions

Import the actions from the root `t3.json` in T3 Code's project settings. **Setup worktree** runs automatically when a new worktree is created. Its `async: false` setting makes T3 wait for setup to finish before the first agent turn. It discovers and links all active private `.env.*` files from the main checkout, installs dependencies with `npm ci`, creates an empty `tmp/` folder, and generates Next.js types. `.env.local` is required. Setup errors appear in T3. Fix them and rerun setup before working in that checkout.

Identical checkout-specific environment files become links to the main checkout. Conflicting private copies are rejected without overwriting their values. The homelab env-sync timer also covers worktrees from older branches every 30 seconds. Environment files must stay private at mode `0600`. The setup action can also be rerun manually. Outside T3, run `node scripts/stack127/setup-worktree.mjs` from the checkout; it finds the main checkout through Git.

On Macs, main checkout env files are mirrored from homelab at mode `0400`. Setup only links existing mirrored files. Create new env files on homelab and wait for the mirror; never create, edit, or chmod a Mac copy.

Sync and setup share a lock at `~/.config/stack127/shared-env-sync-lock`. If another sync holds it, retry when it finishes. Dead-process locks are recovered automatically. A lock without a valid PID is recovered after 30 seconds. Lock acquisition, recovery, and release use a short exclusive guard at `shared-env-sync-lock.takeover` beside the lock. If a crash leaves that guard behind, verify no sync is running before removing only the guard directory. The lock path and PID format remain compatible with the installed homelab timer; update its `~/.local/lib/stack127/shared-env.mjs` copy to use guarded recovery.

The preview and quality actions are:

- **Build and run** builds and serves the current chat's checkout.
- **Rebuild and run** removes that checkout's `.next` output before building and serving it.
- **Dev and run** starts Next.js with automatic refresh as files change.
- **Stop preview** stops only the preview managed by these actions for that checkout.
- **Check quality** runs `npm run quality` in that checkout.

Starting a preview stops the previous preview managed by these actions in the same checkout. Other checkouts and servers stay running. The main checkout prefers port 3333. Worktrees choose separate ports and skip occupied ports. Once the site responds, each preview prints its checkout, branch, and current Tailscale link. Leave the action's terminal running while using the preview.

For a worktree preview, point the local cache watcher at its port with `npm run stack127:cache:watch:local -- --site http://127.0.0.1:<port>`. Without `--site`, the watcher uses port 3333.

The actions install dependencies with `npm ci` if Next.js is missing. They use the checkout's `.env.local`. Worktrees without that file use the main checkout's development environment. Environment values are never printed or copied. Production deployment is separate.

Each worktree owns its `node_modules`, `.next`, temporary files, and preview state. Setup does not copy old build output, backups, logs, discovery progress, or preview PID records. Shared planning files, agent configuration, hooks, and skills come from Git. Machine-level provider logins stay on the homelab. The linked environment files share the same managed development database; worktrees do not create separate databases.

## Remote link

The user's Mac reaches the homelab through Tailscale. Run `tailscale status` and find the current IPv4 address for `teja-homelab`. Return:

```text
http://<tailscale-ip>:3333/<route>
```

For a T3 action, use the port printed by the action instead of assuming 3333.

Do not give the user `localhost` or `127.0.0.1`. Do not expose port 3333 to the public internet.

## Browser checks over SSH

Codex CLI runs on the homelab. The Codex app may run on the user's Mac. The app's in-app browser may be unavailable to the CLI. Use a local headless browser to check the page without waiting for browser access. Google Chrome is at `/usr/bin/google-chrome`. Follow `skills/stack127/references/homelab-browser-and-search.md`. Open `http://127.0.0.1:3333/<route>` in the homelab browser. Give the user the Tailscale link above.

## Minimum local check

Run a focused calculation or parser test when relevant. Check the real changed page at desktop and mobile width. Run `npm run quality` when code changed. Don't run `npm run build` here. Pull request CI on GitHub runs the full build at release, to keep load off the homelab.

Build output such as `.next`, `.next-*`, `test-results`, and temporary logs is disposable. Do not commit it.

## Other repositories

Independent stack127 repositories have separate checkouts under `/srv/data/projects/`. They are not nested dependencies of this repository. Read `stack127_docs/stack127-repos.md` before editing one.

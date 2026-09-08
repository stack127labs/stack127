# stack127 local development links

Last updated: 26 August 2026

## Remote localhost convention

The normal Stack127 development checkout is on the homelab at
`/home/teja/projects/stack127`. When Codex is running there and the user asks
for a localhost link from a Mac, “localhost” means the homelab's local app
served through Tailscale. A Mac cannot use the homelab's `localhost` or
`127.0.0.1` address directly.

The user-facing URL must use the homelab's current Tailscale IPv4:

```text
http://<homelab-tailscale-ip>:3333/<route>
```

For example, the current keyboard-shortcuts hub link is:

```text
http://100.86.117.125:3333/keyboard-shortcuts
```

The IP is a runtime value, not a permanent project constant. Check it before
returning a link:

```bash
tailscale status
```

Use the address on the row for `teja-homelab`, not the address of the Mac or
another peer. The remote Mac must also be connected to the same tailnet.

## Start the server

The Stack127 scripts explicitly bind Next.js to `0.0.0.0`, which includes the
Tailscale interface while keeping the app off the public internet unless the
host firewall says otherwise.

`next.config.ts` automatically adds the host's current Tailscale IPv4 address
to Next.js `allowedDevOrigins`. This lets client-side JavaScript, hot reload,
drawers, filters, and interactive tools work when the site is opened from
another device. Restart the development server after the Tailscale interface
or address changes.

```bash
npm run dev
```

The development server uses port `3333`. A built server uses the same port:

```bash
npm run build
npm run start
```

Use `http://localhost:3333/<route>` or `http://127.0.0.1:3333/<route>` only
for a check performed on the homelab itself. When replying to a remote Mac,
always return the Tailscale URL as a Markdown link.

## Troubleshooting

- If the link fails, run `tailscale status` and refresh the host address.
- Confirm the Mac is online in the same Tailscale network.
- Confirm the server is listening on port `3333` and that the homelab firewall
  permits port `3333` on the Tailscale interface only.
- If pages render but controls do not respond, restart the development server
  and check that its startup config includes the current Tailscale address.
- Do not substitute a public IP, port-forward, or production hostname for this
  development link.

# Local development usability fixes

Date: 4 September 2026

## What failed

Pages opened through the homelab's Tailscale IPv4 address rendered their
server HTML, but Next.js rejected development-only client resources from that
origin. The visible page looked ready while filters, drawers, theme controls,
and interactive tools had no working JavaScript.

The shared compact sidebar also kept `body` scroll locked if its drawer was
open while the viewport changed to the desktop layout.

## What changed

- `next.config.ts` now discovers IPv4 addresses in Tailscale's `100.64.0.0/10`
  range and adds them to `allowedDevOrigins` at server startup.
- The compact sidebar closes when the viewport crosses into the desktop
  layout, which restores page scrolling.
- `stack127_docs/local-development.md` now explains the origin requirement and
  the need to restart after a Tailscale address change.
- Regression tests cover Tailscale address detection and compact-to-desktop
  sidebar behavior.

## Verification

- The current Tailscale origin was accepted by the running Next.js server.
- Eight representative routes returned HTTP 200 through the Tailscale address.
- Desktop interaction checks passed for the shared shell, directory filters,
  details panels, keyboard shortcuts, and representative tools.
- Twelve of thirteen focused mobile checks passed. The remaining check expects
  the old local CLI icon path while the current page loads the reviewed image
  from Supabase; the image itself loads.
- Nine apparent tool failures from the full sequential browser run all passed
  when rerun in isolation. They were load-related timing failures, not broken
  calculations or controls.

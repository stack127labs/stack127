# Self-host app catalog completion

## Result

The self-host app review queue was closed on 2 September 2026. Every candidate now has a final decision:

- 3,245 published
- 6,912 duplicate
- 992 rejected
- 0 queued, needs review, or enriching

The public directory contains 4,995 published self-hostable apps. A further 65 published rows are marked not self-hostable and stay out of the directory.

## Coverage

- RAM and storage planning coverage: 4,995 of 4,995 apps, using publisher facts where available and reviewed ranges labelled `(estimated)` elsewhere.
- Install coverage: 4,995 of 4,995 apps. Options include Docker, Compose, TrueNAS SCALE, Unraid, Umbrel, YunoHost, CasaOS, native, binary, and package links where supported.
- Local icons: 4,995 of 4,995 apps. The icon-integrity check found no missing, invalid, or unreadable files.
- Technical fact checks: 0 pending. A publisher value that could not be found is stored as `not_published`, not guessed.
- QA gate: 0 blocking rows.

## Sources reviewed

The final review covered the existing queue and new catalog evidence from Awesome Selfhosted, Selfhst, SelfHostedWorld, OpenAlternative, GitHub topics, Docker Hub, TrueNAS SCALE, Umbrel, Unraid Community Applications, CasaOS, and YunoHost. Duplicate and rejected candidates remain in the candidate table for audit; they are never public app rows.

## Current operating rule

Production remains the canonical database. Discovery writes candidates, review writes final app records, and refresh jobs update mutable provider facts and install/resource rows. The page does not require a public repository: open-source, source-available, and closed-source apps are allowed when self-hosted deployment is verified.

The current rules live in `content_docs/self-host-apps/data-workflow.md`, `content_docs/self-host-apps/content-rules.md`, and `stack127_docs/self-host-apps-data.md`.

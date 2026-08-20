# Stack127 Sitewide Scripts

Put only sitewide durable scripts in this folder.

Page-specific scripts belong in `scripts/<page-slug>/`.

Temporary sitewide scripts belong in `scripts/stack127/temp/` and should be deleted after use.

Production deployment guardrails live in `scripts/stack127/deployment/`. Run
`npm run stack127:deploy:preflight` before using Dokploy or changing any
production target.

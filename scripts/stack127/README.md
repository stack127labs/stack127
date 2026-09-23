# Stack127 Sitewide Scripts

Put only sitewide durable scripts in this folder.

Page-specific scripts belong in `scripts/<page-slug>/`.

Put temporary scripts and generated review files under `/tmp/stack127/` and delete them after use.

Production deployment guardrails live in `scripts/stack127/deployment/`. Run
`npm run stack127:deploy:preflight` before using Dokploy or changing any
production target.

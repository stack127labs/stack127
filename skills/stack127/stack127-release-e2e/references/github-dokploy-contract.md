# GitHub to Dokploy release contract

The release workflow intentionally separates build authority from runtime
authority:

| Stage | Authority | Required evidence |
| --- | --- | --- |
| Source | `RaviTejaKNTS/stack127@main` | Checked-out SHA equals `origin/main` |
| Quality | GitHub Actions production Environment | `npm run quality` and target preflight pass |
| Artifact | GHCR | Image is tagged with the exact SHA |
| Runtime | OVH Dokploy application `_oKhy4YdVBc513i_qjVHC` | `application.saveDockerProvider`, `application.deploy`, and a non-failed deployment record |
| Live | `https://stack127.com` | `/api/health?scope=deploy` reports the same SHA; public smoke paths pass |

Dokploy's REST API uses the `x-api-key` header. The workflow calls:

- `POST /api/application.saveDockerProvider`
- `POST /api/application.deploy`
- `GET /api/deployment.all?applicationId=...`

When `dokploy.stack127.com` is protected by Cloudflare Access, the workflow
adds `CF-Access-Client-Id` and `CF-Access-Client-Secret`. A redirect to Access
login means service authentication is not configured for the API path; the
client fails rather than attempting interactive authentication.

The workflow updates Dokploy to an immutable image before triggering the
deployment. This prevents a moving `main` branch or a second push from making
the running container ambiguous. The image's build argument is copied to
`/app/build-sha`, and the health route reports it as `build.sha`.

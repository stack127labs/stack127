# GitHub to Dokploy release contract

| Stage | Authority | Required evidence |
| --- | --- | --- |
| Source | `stack127labs/stack127@main` | Release SHA equals current `origin/main` |
| CI | `Stack127 CI` | Fast checks and change-aware browser coverage pass for the release SHA |
| Artifact | GHCR | One image is built, smoke-tested, and tagged with the exact SHA |
| Runtime | OVH Dokploy application `_oKhy4YdVBc513i_qjVHC` | Dokploy accepts and deploys the SHA-tagged image |
| Live | `https://stack127.com` | Deploy health reports the same SHA and public smoke paths pass |

The release does not rebuild the image after smoke testing. Dokploy receives the same SHA-tagged image that passed the local container smoke test.

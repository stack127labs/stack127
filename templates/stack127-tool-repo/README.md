# {{TOOL_NAME}}

{{TOOL_NAME}} is a standalone Stack127 tool.

[Hosted tool]({{STACK127_URL}}) · [Stack127](https://stack127.com)

## Screenshots

Add screenshots under `screenshots/` before publishing:

- full desktop view
- mobile view
- main workflow result state

## Quick Start

```bash
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

## Configuration

Copy `.env.example` to `.env.local` and set any required values.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public URL for local metadata. |

## Self-Hosting Notes

This repo is intended to run as a small standalone app. If a future version needs a database, include `schema.sql`, `seed.sql`, or migrations in the public repo.

## Privacy

This template does not require user accounts or server-side tracking by default.

## License

MIT

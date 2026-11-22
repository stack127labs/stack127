# Job check: brief for researcher agents

You are a sub-agent in the `researcher` role, working for the lead agent (not the main agent). Work in the shared checkout `/Users/ravitejaknts/.t3/worktrees/stack127/t3-64138b8e`. Do not commit, push, create branches, sign up, log in, or browse the web. Everything you need is in the research files.

## Why this matters

Each app card has a `jobs` list, such as `["gateway", "links"]`. We are splitting the apps into separate directories by job, for example "File storage" and "Transactional email". An app will be listed in **every** directory whose job it does, and the page tells readers whether that job is the app's **main job** or something it **also does**. So every job tag will be shown to readers. A wrong tag puts an app in the wrong directory.

The current tags were set quickly and are too loose. Do not trust them. Check every job from scratch.

## Files

- Cards: `dev-space/indie-hacker-apps/<research_dir>/cards/<slug>.json`. Edit only these, and only in your category.
- Research files (read only): `dev-space/indie-hacker-apps/<research_dir>/apps/<slug>.md`. The `## Facts` table has one row per fact, with a field ID (`F01`, `C01` or `01`), a value, a state and a source.
- Field list (read only): `dev-space/indie-hacker-apps/<research_dir>/fields.md`.
- The jobs for your category, with one-line meanings: `lib/indie-hacker-apps/categories.json`, the `jobs` list of your category. Read it first.

## What to do for each app

1. Read the research file's scope lines at the top and its Facts rows about product type, features, products and limits. Use `grep -n` to find rows; you don't need to read every price row.
2. For **every** job in your category's list (not only the ones already on the card), decide yes or no:
   - **Yes** only when a Facts row shows the researched product offers this job as a feature a customer can use today, inside the product the card covers (the card's `url` and the file's scope line).
   - **No** when it only works through a third-party tool, a partner, a marketplace plugin, or code you would write yourself on top of a generic API; when it is announced, on a roadmap, or waitlist only; when the file only says "integrates with" a product that does the job; or when the file says nothing about it.
   - A rule for each category is below.
3. Pick the **main job**: the one thing the product is mainly sold as (its product type row, its homepage pitch in the file). Put it first in `jobs`. The rest follow in the category's list order.
4. Write the result into the card, changing nothing else:

```json
"jobs": ["sql", "files", "vector"],
"job_check": {
  "checked": "2026-11-22",
  "evidence": {
    "sql": "C02: managed Postgres is the main product",
    "files": "C14: S3-compatible storage buckets, sold separately",
    "vector": "C11: pgvector is supported on every plan"
  }
}
```

   Put `job_check` right after `jobs`. Each evidence line starts with the field ID of the row that shows it, then a short reason (max 200 characters). Every job in `jobs` needs one line, and no other job may have one.
5. Run `node scripts/indie-hacker-apps/check-cards.mjs <category> <slug>` and fix any error before moving on.

## Rules per category

- **payments.** `mor`: the provider is the legal seller (merchant of record) and handles sales tax. `gateway`: you are the seller and it processes card payments. Don't tag `gateway` on a merchant of record unless it also sells a separate gateway product. `billing`: the provider itself runs recurring plans and subscriptions (not just "works with Chargebee"). `links`: you can make a hosted payment link or hosted checkout page in the dashboard, without code. `crypto`: you can accept cryptocurrency payments.
- **hosting.** `paas`: push code or a container and they run it. `vps`: a virtual or dedicated server you manage. `panel`: free self-hosted software that turns your own server into an app platform. `static`: static sites or frontends hosted as a feature.
- **databases.** `sql`: a managed or self-hosted SQL database. `kv`: Redis-style key-value or cache as a product. `files`: S3-style object storage as a product. `jobs`: queues, background jobs, or scheduled workflows as a product (a database extension you set up yourself does not count). `backend`: database, auth, files and functions offered together as one backend. `vector`: vector search offered and documented as a feature (for example pgvector enabled on the managed database).
- **error-monitoring.** `errors`: catches exceptions from your code with an SDK. `uptime`: checks from outside that a URL or service answers. `status`: hosted public status pages. `logs`: collects and searches log lines. `performance`: traces, APM or app metrics. `cron`: heartbeat or cron job monitoring.
- **customer-support.** `helpdesk`: email tickets, often with a help center. `chat`: a live chat widget on your site. `ai`: an AI agent that answers customers by itself. `inbox`: one shared email inbox for a team.
- **email.** `newsletter`: write and send broadcasts to a list. `marketing`: automated sequences or flows (not just one-off broadcasts). `transactional`: send emails from your app's code through an API or SMTP, such as password resets and receipts, as a documented feature of the researched product. A contacts API or a "trigger an automation" endpoint is not transactional email. A sister product sold separately (for example a separate transactional brand) counts only if the research file covers it in scope. `multichannel`: messages across more than email (SMS, push, in-app) triggered by user actions.
- **analytics.** `web`: website visitors, pages and sources. `product`: user-level analysis inside an app: identified users, retention cohorts, or user paths. Funnels or event counts alone are not enough. `replay`: session recordings. `revenue`: sales and subscription metrics (MRR, churn) as a feature.
- **auth.** `hosted`: they run login for you as a service. `library`: code you add to your own app. `server`: a login server you run yourself. A product with both an open-source server and a cloud service gets both `hosted` and `server`.

## How to work

- One app at a time, in alphabetical order. Skip apps that already have `job_check`. List what is left with `node scripts/indie-hacker-apps/check-cards.mjs <category> --unchecked`.
- Don't write a script or loop to set jobs. Each app needs you to read its facts. You may use a script only to list apps.
- Keep going as long as you can in your turn. Stopping early is fine; the lead will start another run for the rest.

## Report (under 200 words)

- Apps checked in this run, the last slug reached, and the checker's final line with `--unchecked`.
- Every app whose jobs changed: `slug: old → new` (for example `stripe: gateway,links → gateway,billing,links`).
- Any app where you were unsure, with the reason.

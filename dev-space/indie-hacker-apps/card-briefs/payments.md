You are a sub-agent in the `researcher` role, working for the lead agent (not the main agent). Work in the shared checkout at /Users/ravitejaknts/.t3/worktrees/stack127/t3-64138b8e.

## Goal

Write one short "card" JSON file for every researched app in the **Payments** category (category slug `payments`, research folder `dev-space/indie-hacker-apps/payment-providers/`). The cards feed a new directory page: each app shows as a card with a one-line description, its jobs, its free start, 2–3 short facts, and its cost at fixed usage levels. Everything you write must come from the app's research file.

There are 175 apps (`apps/*.md`). 9 already have a seeded card in `cards/`; check each seeded card against its research file, fix anything wrong, and fix the ones the checker fails.

## Files

- Read: `dev-space/indie-hacker-apps/payment-providers/apps/<slug>.md` (one research file per app: a `## Facts` table with columns id | field | value | state | source URL | checked date | note, plus a cost examples section), `dev-space/indie-hacker-apps/payment-providers/fields.md` (the cost scenario definitions, see "the domestic card cost field (F20) and the cost sections"), `dev-space/indie-hacker-apps/payment-providers/apps.md` (the list, with each app's Type), and your category entry in `lib/indie-hacker-apps/categories.json` (allowed jobs, the cells with a hint for each, cost sets and their levels).
- Write only: `dev-space/indie-hacker-apps/payment-providers/cards/<slug>.json`, where `<slug>` is the research file name without `.md`.
- Do not edit any other file, including `categories.json` and the checker. Do not browse the web, sign up, log in, commit, push, or create branches.

Research files are 40–80 KB. Don't read them whole; pull rows with grep/awk, for example:
`awk -F'|' '/^\| *[A-Z]?[0-9][0-9] *\|/{print $2"|"$3"|"substr($4,1,260)"|"$5}' <file>` and the cost section with `sed -n '/^## Cost/,/^## Conflicts/p' <file> | cut -c1-700`.

## Card shape

```json
{
  "slug": "kit",
  "name": "Kit",
  "url": "https://kit.com/",
  "jobs": ["newsletter", "marketing"],
  "line": "Creator newsletters with automations and paid subscriptions.",
  "free": { "kind": "free", "text": "Free up to 10,000 subscribers" },
  "cells": { "<cell key>": "<short value>" },
  "costs": { "<set key>": [ { "v": "$0", "plan": "Free", "state": "confirmed", "math": "1,000 × 4 = 4,000 emails. Free plan covers up to 10,000 subscribers." } ] }
}
```

- `name`: the product name readers know. `url`: the official site from the file.
- `jobs`: one or more job ids from your category in `categories.json`. First job = the main one.
- `line`: under 90 characters, plain English, what the product does. No marketing words, no "best", no private people's names.
- `free.kind`: `free` (a lasting free plan), `trial` (time-limited), `credits` (one-off credits), `selfhost` (free only if you run it yourself), `none`. `free.text`: under 80 characters, with the real limit, e.g. "Free up to 2,500 subscribers", "14-day trial, no card".
- `cells`: exactly the cell keys for your category, each under 60 characters. Follow each cell's hint in `categories.json`. Yes/No cells must start with the exact word given in the hint.
- `costs`: exactly the sets for your category, one row per level, in the level order from `categories.json`.
  - `v`: the monthly total in the file's currency, short, e.g. "$39", "€9", "2.9% + $0.30". `plan`: the plan used ("" if none). `math`: one sentence, the formula or reason from the file (under 220 characters).
  - `state`: confirmed, not_published, unclear, conflicting, not_applicable or check_failed. Copy the state the file gives that number.
  - If the app doesn't do the job for that set: `{"v": "—", "plan": "", "state": "not_applicable", "math": "Does not do this job"}` (or a short reason).
  - If the file says unknown, quote-only, or not published: `v` is "Unknown" or "Quote", with the matching state. Never guess.
  - Copy every number exactly from the file. You may add up parts only when every part is in the file; then the state must be `unclear` and `math` must show the sum (e.g. "$24 host + $1.60 SES = $25.60"). The checker rejects a number that isn't in the file unless you do this.

## Notes for payments

- `costs.fee` has one row per seller country: United States, United Kingdom, Germany, India. Each `v` is the provider's standard fee for one domestic online card payment for a seller based in that country (e.g. "2.9% + $0.30"), from the domestic card cost rows (F20). If the provider only publishes one global rate, use it for every country with state `unclear` and say so in `math`. If sellers in that country can't sign up, use `{"v": "Not available", "state": "confirmed"}` when the file says so.
- Providers without card payments (bank debit, crypto): put their main per-payment fee and say what it is in `plan` (e.g. "Bank debit"). Billing software with no processing fee of its own: use "—" with not_applicable and explain in `math`.
- `free` is still required: usually `{"kind": "none", "text": "No monthly fee on pay-as-you-go"}` or the real monthly fee.

## How to work

One app at a time, in alphabetical order:

1. Read that app's facts and cost section.
2. Write its card.
3. Run `node scripts/indie-hacker-apps/check-cards.mjs payments <slug>` and fix every error before moving on.

Do not write cards with a script or a loop, and do not copy one card into others. Each card must come from reading that app's own file. You may use a script only to list which apps still lack a card: `node scripts/indie-hacker-apps/check-cards.mjs payments --missing`.

## Done means

`node scripts/indie-hacker-apps/check-cards.mjs payments` prints `failing 0, missing 0`.

## Report back (under 200 words)

- Cards written and cards fixed.
- How many apps have "Unknown", "Quote" or check_failed at the default level (fee: United States), with their names if under 15.
- Any research file that was too thin to fill a card, and anything in the shape or rules that didn't fit this category.

## Mistakes a review found (avoid these)

A check of finished cards found these errors. The checker can't catch them, so check each card for them yourself:

1. **`not_applicable` when the file has a price.** Use `not_applicable` only when the app truly doesn't do that job. If the file prices the job, copy the price. If the file says the price can't be worked out or isn't published, use `"Unknown"` with state `not_published` or `check_failed` and say why in `math`.
2. **Free start without its limit.** `free.text` must name the real limit from the file: users, seats, emails, events, months. "Free plan available" is not enough.
3. **Wrong state.** Copy the state the file gives that number. Don't mark a confirmed price `unclear`. Use `unclear` only for your own sums, or where the file itself says unclear.
4. **Totals vs unit prices.** Say whether a figure is a monthly total or a per-unit price, the way the file says it. "$75/month for 100 conversations" is not "$75 per 100 conversations". In `math`, "3 × $19 = $57/month total" is not "$57 per agent-month".
5. **Vendor estimates written as rates.** If the file calls a number a vendor estimate, say "vendor estimate" in the cell.
6. **Plan limits left out of cells.** If the priced plan limits a cell (for example, one channel on the cheapest plan), add that limit to the cell.
7. **Made-up assumptions.** Don't invent usage assumptions (such as "users are active 2 days a month"). If the vendor's unit doesn't map to the level without an assumption the file doesn't state, use "Unknown" or `not_applicable` and explain the unit in `math`.
8. **Hidden conditions.** If a cost depends on a condition or sub-scenario in the file (a number of active days, tenants, machines, sign-ins, resource limits), name it in `math`. Don't write "under stated assumptions" without saying which.
9. **Tiered prices as one flat price.** If a price applies only to a range (for example connections 1–15), say the range.
10. **State of the file's own totals.** When the research file itself states a derived total and gives it a state, copy that state. `unclear` is required only for sums you add up yourself.
11. **"No" when the file only says "not established".** A missing mention is not a "No". Write "No" only when the file says the feature isn't offered. Otherwise write "No (none found)" or "Unknown", whichever the cell allows.
12. **Internal notes in reader text.** Never copy research notes such as "source conflict says…" into `line`, `free.text` or a cell. Readers see these.
13. **Conflicts hidden.** If the file marks a fact unclear or conflicting, the cell must not state it as plain fact. Add "(unclear)" or use "Unknown".
14. **Research wording or marketing words in reader text.** Write cells, `line` and `free.text` for readers. No "established", "not established", "per F12". No "fast", "low-cost", "indie-friendly", "best", "powerful".
15. **Jobs that disagree with the card.** If the card prices a job or a cell says the app does it, the job belongs in `jobs`. If the file says the app doesn't do a job, remove it from `jobs`.
16. **Plan gates left out of cells.** If a feature in a cell needs a paid plan, say so (e.g. "Yes, paid plans").

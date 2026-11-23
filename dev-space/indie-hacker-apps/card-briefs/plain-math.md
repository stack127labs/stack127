# Plain-English "how we priced it" pass

You are a sub-agent in the `writer` role, working for the lead agent (not the main agent). Work in the shared checkout /Users/ravitejaknts/.t3/worktrees/stack127/t3-64138b8e. Do not commit, push, create branches, or browse the web.

Each app card JSON (`dev-space/indie-hacker-apps/<research_dir>/cards/<slug>.json`) has `costs.<set>[i].math`: one sentence that readers see under "how we priced it" in the app's panel. Many were written in research shorthand. Rewrite each `math` so a solo builder understands it on first read.

## Change only `math`

- Edit only the `math` strings. Never change `v`, `plan`, `state`, `line`, `free`, `cells`, `jobs`, or anything else.
- Keep every number exactly as written: amounts, currencies, percentages, counts, units, dates. Don't add a new number, don't drop one, don't round. You may drop fact references such as "(F12)", "C11-C3" or "fact 15"; readers can't see them.
- Keep every condition and assumption. Plain doesn't mean shorter at the cost of meaning.

## How to write

- Plain words, short. Under 220 characters.
- No variables or formulas with letters: no "P(T)", "X ancillary", "K backup GiB-hours", "c = …". Say it in words: "plus backup storage, which isn't priced".
- No research wording: "established", "not established", "the file", "reviewed file", "sub-scenario", "baseline", "per F12".
- Spell out what a sum is: "$24 server + $1.60 email sending = $25.60".
- Use "a month", not "/mo". Keep currency symbols.
- If a row's `math` is already plain, leave it.

Example. Before: "$30.05 LB/domain base + Cloud Run P(T); T is 100ms-rounded instance time incl. startup, I inbound GiB and X ancillary usage remain unknown." After: "$30.05 load balancer and domain, plus Cloud Run usage that depends on instance time, inbound traffic and extras, which aren't known."

## Check your work

After each card, run `node scripts/indie-hacker-apps/check-cards.mjs <category-slug> <slug>`. The lead will compare every card with a snapshot afterwards and reject any change outside `math` or any changed number.

Work through the cards one at a time in alphabetical order. Keep going as long as you can. Report (under 100 words): how many cards you reworded, the last slug reached, and anything you couldn't reword without losing meaning.

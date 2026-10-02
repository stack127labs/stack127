# Amazon product linking

Checked: 5 September 2026

## Scope

The Amazon US review covers every current record in these physical product directories:

- `/zigbee-devices`
- `/zigbee-coordinators`
- `/z-wave-devices`
- `/matter-devices`
- `/nut-compatible-ups`
- `/local-security-cameras`

These smart home and hardware directories are still published, but they're off the homepage and get no new work. See [product-direction.md](product-direction.md).

The review ledger lives in `lib/amazon-affiliate/data/reviews.json`. It's kept apart from each directory snapshot. That way a source refresh can't turn an unreviewed retail URL into a published affiliate link.

## Publication rule

A device gets an Amazon link only when all of these checks pass:

1. The listing is on the US marketplace.
2. The ASIN comes from a direct Amazon product URL, not a search URL.
3. The Amazon title and the directory record agree on the exact model and vendor.
4. For Z-Wave records, a US-frequency variant is documented.
5. The review has dated source evidence.

The public URL looks like this:

`https://www.amazon.com/dp/ASIN/ref=nosim?tag=stack127-20`

This is Amazon's direct link format, documented at `https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC`. For manual checks, use Amazon's Link Checker at `https://affiliate-program.amazon.com/help/node/topic/G6253GFSARDQENZR`.

How the link and disclosures appear:

- The device drawer labels the link `Check price on Amazon` and marks it `rel="sponsored noreferrer"`.
- Directory results with affiliate links show a disclosure below the cards.
- The About page has the required Amazon Associate statement in its "How we earn money" section.
- The shared footer has no Amazon statement.

See [the disclosure placement rules and the open visibility concern](amazon-associates.md#required-disclosure).

stack127 doesn't copy Amazon prices, ratings, availability, or images into the directory. Those values change often, and keeping them correct needs approved API access. Directory images still come from the cited device, certification, or manufacturer sources.

## Review states

| State | Meaning | Public Amazon link |
| --- | --- | --- |
| `confirmed` | Exact US listing, vendor, and model were verified. | Yes |
| `no-confirmed-match` | A complete supported search ran, but no exact listing passed. | No |
| `regional-mismatch` | The record doesn't document a US-compatible variant. | No |
| `not-retail` | The record is software, a component, a family, or otherwise has no distinct retail model. | No |
| `needs-review` | Exact Amazon discovery or verification is still incomplete. | No |

Unknown is safer than a guessed link. A search engine miss isn't enough to set `no-confirmed-match`, because search indexes are incomplete.

## Commands

1. After refreshing the six directories, prepare the ledger:

   ```bash
   node scripts/stack127/amazon-affiliate/prepare.mjs --blakadder-root=/path/to/pinned/blakadder
   ```

2. Verify source-supplied ASINs against current Amazon US titles:

   ```bash
   node scripts/stack127/amazon-affiliate/verify-source.mjs --concurrency=1 --delay=1500
   ```

3. Once Amazon grants Creators API access, search every remaining retail identity:

   ```bash
   node --env-file=.env.affiliate scripts/stack127/amazon-affiliate/discover-creators-api.mjs
   ```

4. Generate the reviewed ledger and the compact server-side match file:

   ```bash
   node scripts/stack127/amazon-affiliate/compact-cache.mjs
   node scripts/stack127/amazon-affiliate/finalize.mjs
   node scripts/stack127/amazon-affiliate/report.mjs
   node scripts/stack127/amazon-affiliate/audit.mjs
   ```

5. Open the affected directory on the homelab at desktop and mobile width. Confirm that Amazon links render only for exact confirmed matches, and that the disclosure text is still visible.

The scripts pick up where they left off from their JSONL caches. Failed requests can be retried.

Use `--allow-pending` while exact Amazon review is incomplete. A directory can publish with pending reviews, because only `confirmed` records render an Amazon link. Full affiliate coverage needs the audit to pass without that flag.

## Creators API boundary

The account isn't eligible for Amazon's Creators API. Amazon requires an approved Associates account and 10 qualifying sales in the trailing 30 days before it grants Full access and credentials. The current API docs are at `https://affiliate-program.amazon.com/creatorsapi/docs/`.

You can review source-supplied ASINs now. Full Amazon catalog discovery should use Creators API once the account qualifies.

Until then, records without an exact verified listing stay `needs-review`. Never turn them into guessed product or search links.

When credentials arrive, the refresh job should:

1. Request products by exact model and vendor.
2. Keep the returned ASIN and title as evidence.
3. Apply the same US region rules.
4. Replace only reviews whose identity hash still matches the directory record.

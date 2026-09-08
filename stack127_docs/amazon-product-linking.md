# Amazon product linking

Checked: 5 September 2026

## Scope

The Amazon US review covers every current record in these physical-product directories:

- `/zigbee-devices`
- `/zigbee-coordinators`
- `/z-wave-devices`
- `/matter-devices`
- `/nut-compatible-ups`
- `/local-security-cameras`

The review ledger lives in `lib/amazon-affiliate/data/reviews.json`. It is separate from each directory snapshot so a source refresh cannot turn an unreviewed retail URL into a published affiliate link.

## Publication rule

A device receives an Amazon link only when all of these checks pass:

1. The listing is on the US marketplace.
2. The ASIN is taken from a direct Amazon product URL, not a search URL.
3. The Amazon title and the directory record agree on the exact model and vendor.
4. Z-Wave records document a US-frequency variant.
5. The review has dated source evidence.

The public URL uses this form:

`https://www.amazon.com/dp/ASIN/ref=nosim?tag=stack127-20`

This follows Amazon's direct-link format documented at `https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC`. Amazon's Link Checker is available at `https://affiliate-program.amazon.com/help/node/topic/G6253GFSARDQENZR` for manual checks.

The device drawer labels it `Check price on Amazon` and marks it `rel="sponsored noreferrer"`. Directory results containing affiliate links show a disclosure below the cards. The About page carries the required Amazon Associate statement in its "How we earn money" section. The shared footer has no Amazon statement. See [the disclosure placement rules and remaining visibility concern](amazon-associates.md#required-disclosure).

stack127 does not copy Amazon prices, ratings, availability, or images into the directory. Those values change often and require approved API access to maintain correctly. Directory images continue to come from the cited device, certification, or manufacturer sources.

## Review states

| State | Meaning | Public Amazon link |
| --- | --- | --- |
| `confirmed` | Exact US listing, vendor, and model were verified. | Yes |
| `no-confirmed-match` | A complete supported search ran, but no exact listing passed. | No |
| `regional-mismatch` | The record does not document a US-compatible variant. | No |
| `not-retail` | The record is software, a component, a family, or otherwise lacks a distinct retail model. | No |
| `needs-review` | Exact Amazon discovery or verification is still incomplete. | No |

Unknown is safer than a guessed link. A search-engine miss is not enough to assign `no-confirmed-match` because search indexes are incomplete.

## Commands

Prepare the ledger after refreshing the six directories:

```bash
node scripts/stack127/amazon-affiliate/prepare.mjs --blakadder-root=/path/to/pinned/blakadder
```

Verify source-supplied ASINs against current Amazon US titles:

```bash
node scripts/stack127/amazon-affiliate/verify-source.mjs --concurrency=1 --delay=1500
```

After Amazon grants Creators API access, search every remaining retail identity:

```bash
node --env-file=.env.affiliate scripts/stack127/amazon-affiliate/discover-creators-api.mjs
```

Generate the reviewed ledger and the compact server-side match file:

```bash
node scripts/stack127/amazon-affiliate/compact-cache.mjs
node scripts/stack127/amazon-affiliate/finalize.mjs
node scripts/stack127/amazon-affiliate/report.mjs
node scripts/stack127/amazon-affiliate/audit.mjs
node scripts/stack127/amazon-affiliate/qa-rendered.mjs --base-url=http://127.0.0.1:3333
```

The scripts resume from their JSONL caches. Failed requests remain retryable.
Use `--allow-pending` while exact Amazon review is incomplete. A directory may
publish with pending reviews because only `confirmed` records render an Amazon
link. Full affiliate coverage requires the audit without that flag.

## Creators API boundary

The account is not eligible for Amazon's Creators API. Amazon requires an approved Associates account and 10 qualifying sales in the trailing 30 days before Full access and credentials are available. The current API documentation is at `https://affiliate-program.amazon.com/creatorsapi/docs/`.

Source-supplied ASINs can be reviewed now. Exhaustive Amazon catalog discovery should use Creators API once the account becomes eligible. Until then, records without an exact verified listing remain `needs-review`; they must not be converted into guessed product or search links.

When credentials become available, the refresh job should request products by exact model and vendor, retain the returned ASIN and title as evidence, apply the same US-region rules, and replace only reviews whose identity hash still matches the directory record.

# Shared storage calculation engine

Status: foundation version 1 complete
Engine entry point: `lib/storage/index.ts`
Tests: `tests/pages/storage-tools/shared/storage-engine.test.mjs`

The shared engine is a dependency-free TypeScript library for every planned storage calculator. It has no UI, database, analytics, network, or publication dependency. It can run on the server or in a modern browser.

## Contract

Every calculator is a versioned adapter. It accepts validated input and returns a `StorageCalculationResult` containing:

- the engine version and calculator ID/version;
- a valid or invalid status derived from structured issues;
- values or `null` for an invalid calculation;
- assumptions and ordered derivation steps;
- dated sources and optional source versions;
- one explicit uncertainty statement;
- value-level classifications of theoretical, filesystem-adjusted, observed, or estimated.

An error-level issue and non-null values cannot coexist. This prevents a page from accidentally displaying a plausible-looking answer for a configuration the calculator already rejected.

## Exact byte arithmetic

All capacity values use native `bigint` bytes. The engine never uses floating-point values for capacity math.

Supported display and input units are:

| Decimal | Binary |
| --- | --- |
| B | B |
| KB | KiB |
| MB | MiB |
| GB | GiB |
| TB | TiB |

`bytesFromUnit` accepts a plain non-negative decimal string and rejects exponent notation, negative values, and fractions smaller than one byte. `formatBytes` rounds half up with integer arithmetic and never changes the source byte value.

The TypeScript target is ES2020 because that is the first ECMAScript target with native `BigInt` support.

## Drive inventory

The common drive model contains:

- stable ID;
- exact byte capacity;
- role;
- optional label, path, group ID, and model;
- optional cost in a selected currency’s minor units;
- optional power in watts.

Supported shared roles are data, parity, spare, SLOG, L2ARC, special, cache, metadata, journal, and other. A calculator may accept only the subset that belongs to its technology.

Inventory creation trims textual identifiers, rejects duplicates and invalid values, and deeply freezes the normalized result. Canonical ordering is deterministic and independent of input order. Summary helpers expose exact total, smallest and largest drive, equal-size status, and totals by role.

Version 1 limits one inventory to 1,024 drives and one drive to 10²⁴ bytes. These limits are deliberately above realistic hardware while bounding accidental or hostile input.

## Versioned calculator adapters

Each adapter declares three identifiers:

- `calculatorId`, such as `raid-capacity`;
- `calculationVersion`, which changes when formula behavior changes;
- `inputVersion`, which changes when the adapter’s serialized input shape changes.

The registry stores every registered formula version. A new adapter version becomes the default for new state, while an old shared URL continues to select the formula version recorded in its envelope. Never replace an already-registered formula version with changed behavior.

```ts
const registry = createStorageCalculatorRegistry();

registry.register({
  calculatorId: "raid-capacity",
  calculationVersion: 1,
  inputVersion: 1,
  validateInput,
  calculate,
});

const result = registry.run("raid-capacity", 1, input);
const urlState = registry.encode("raid-capacity", input);
const restoredResult = registry.runEncoded(urlState);
```

An adapter result is rejected if its engine version, calculator ID, or calculation version does not match the registered adapter that ran it.

## URL state

The URL-state codec uses a base64url envelope containing:

- schema and schema version;
- engine version;
- calculator ID;
- calculation version;
- input version;
- calculator input payload.

`bigint` values use a private tagged JSON representation and round-trip without loss. The codec rejects corrupt base64url, invalid JSON, future unsupported engine or schema versions, unsafe prototype keys, reserved tag collisions, cyclic values, and decoded JSON larger than 65,536 bytes.

The codec stores calculator inputs, not formatted results. A result should always be recalculated by the exact versioned adapter recorded in the state.

## Errors and invalid configurations

Use `StorageValidationError` for invalid inventories, adapter inputs, formula contracts, and result metadata. It can carry structured issues when a caller needs to render more than one problem.

Use `StorageStateError` for serialized-state failures. Its stable code lets a page distinguish an expired or unsupported link from an invalid calculator configuration without inspecting message text.

A calculator should return an invalid `StorageCalculationResult` for a well-formed input that describes an impossible topology. It should throw only when the input cannot satisfy the adapter contract or the adapter itself violates the engine contract.

## Shared fixtures

Version 1 includes two immutable manufacturer-capacity inventories:

- four equal 4 TB data drives;
- mixed 2 TB, 3 TB, 4 TB, and 4 TB data drives.

Add fixtures only when at least two calculators or a cross-tool invariant will consume them. Page-specific examples stay with the page’s tests.

## Adding a calculator

1. Write the calculator’s page brief and formula contract.
2. Add failing adapter tests, including invalid topology and boundary cases.
3. Define a typed input guard. Do not use a type assertion as validation.
4. Calculate exclusively in bytes with `bigint`.
5. Wrap public values with their evidence classification and unit.
6. Return assumptions, derivation, sources, uncertainty, and structured issues.
7. Register formula version 1 and verify URL-state round trips.
8. Add cross-tool fixtures for any topology shared with another calculator.
9. Preserve prior adapters when a later formula or input shape changes.

## Foundation verification

The foundation test suite covers:

- decimal and binary unit conversion;
- whole-byte rejection and exact rounding;
- very large values without `Number` conversion;
- zero, negative, duplicate, empty, maximum, and excessive inventory inputs;
- immutable normalization, deterministic order, totals, bounds, and role summaries;
- structured valid and invalid results;
- evidence metadata validation;
- lossless `bigint` URL-state round trips;
- corrupt, unsafe, cyclic, reserved, oversized, and unsupported state;
- adapter duplication, input rejection, result identity, latest-version selection, and old-version replay.

Run the focused suite with:

```sh
node --experimental-strip-types --test tests/pages/storage-tools/shared/storage-engine.test.mjs
```

The engine must also pass the repository typecheck, complete unit suite, static policy, and production build before a foundation change is accepted.

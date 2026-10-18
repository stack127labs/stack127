#!/usr/bin/env node
// Read-only release guard; does not create the bucket, service or database rows.
import { parseArgs } from 'node:util';
import { assertUnpublished } from './runtime.mjs';
import { safeError } from './alerts.mjs';
const { values } = parseArgs({ options: { environment: { type: 'string', default: 'development' } } });
try { console.log(JSON.stringify(await assertUnpublished(values))); }
catch (error) { console.error(safeError(error)); process.exitCode = 1; }

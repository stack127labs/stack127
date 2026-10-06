#!/usr/bin/env node

// Course and lesson copy use the shared frozen-plan publisher.
import { publishingMain } from '../stack127/publishing/cli.mjs';
await publishingMain('courses').catch(error => { console.error(error.message); process.exitCode = 1; });

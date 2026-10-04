import { publishingMain } from '../publishing/cli.mjs';
await publishingMain('directories').catch(error => { console.error(error.message); process.exitCode = 1; });

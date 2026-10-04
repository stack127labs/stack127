import { publishingMain } from '../publishing/cli.mjs';
await publishingMain('tools').catch(error => { console.error(error.message); process.exitCode = 1; });

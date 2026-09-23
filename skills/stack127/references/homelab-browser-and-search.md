# Homelab browser and search

Codex CLI runs on the homelab, while the Codex app may run on the user's Mac. The in-app Browser may not be callable from the CLI. When it is absent, use a local headless browser instead of asking the user for browser access. This homelab has `/usr/bin/google-chrome`. Use Playwright with that executable for clicks, typing, keyboard checks, and screenshots when available; otherwise drive headless Chrome through its DevTools Protocol. A browser check must exercise the rendered page. HTTP requests and source inspection alone do not prove that an interaction works.

Playwright is currently bundled in the Codex runtime at `/home/teja/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. That cache path can change; locate the installed module again if needed. Launch `chromium` with `executablePath: "/usr/bin/google-chrome"`, `headless: true`, and args `--no-sandbox` and `--disable-dev-shm-usage`. Use a fresh browser context and the viewport needed for the page. For a quick rendered screenshot without Playwright, use `google-chrome --headless=new` with a temporary `--user-data-dir` and `--window-size`. If the command sandbox blocks Chrome, run the local browser command with the available execution escalation. Do not turn that into a request for an in-app browser.

For example, from the repository root, replace `<route>` with the real path and use Playwright locators to run the page's valid and invalid examples:

```bash
node --input-type=module <<'JS'
import { chromium } from '/home/teja/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://127.0.0.1:3333/<route>');
console.log(await page.title());
// Use page.getByRole(...).fill(), .click(), and locator assertions for the real task.
await browser.close();
JS
```

For local work:

1. Start `npm run dev` as a background service on the homelab.
2. Wait for port 3333 to respond.
3. Reuse that server for the complete task.
4. Check the real database-backed route at desktop and mobile width. For tools, enter one valid and one invalid example in the browser.
5. Stop the server when the task ends.

Do not launch a long-running server as a blocking test command. Give the user the current Tailscale URL, not localhost.

For search, prefer the configured local SearXNG endpoint. If it is unavailable, use the web-search connector. Search results discover candidates. Operated pages and primary documentation support claims.

Record direct URLs and any access limitation in the tool spec. Screenshots, traces, bounding-box dumps, and browser evidence files are optional debugging aids, not required deliverables.

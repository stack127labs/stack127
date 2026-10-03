import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Playwright resolves from the installed package by default. Set
// STACK127_PLAYWRIGHT_MODULE to a module name or file path when it lives elsewhere.
// Set STACK127_BROWSER_EXECUTABLE only when the browser is not on Playwright's path.
export async function launchChromium(options = {}) {
  const configuredModule = process.env.STACK127_PLAYWRIGHT_MODULE;
  const moduleSpecifier = configuredModule
    ? configuredModule.startsWith(".") || configuredModule.startsWith("/")
      ? pathToFileURL(resolve(configuredModule)).href
      : configuredModule
    : "playwright";

  let playwright;
  try {
    playwright = await import(moduleSpecifier);
  } catch (error) {
    throw new Error(
      `Could not load Playwright from ${moduleSpecifier}. Install playwright or set STACK127_PLAYWRIGHT_MODULE.`,
      { cause: error },
    );
  }

  const executable = process.env.STACK127_BROWSER_EXECUTABLE;
  return playwright.chromium.launch({
    headless: true,
    ...(executable ? { executablePath: resolve(executable) } : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    ...options,
  });
}

export function parseOptions(argv, { valueOptions, booleanOptions = [] }) {
  const values = new Map();
  const booleans = new Set(booleanOptions);
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--help" || key === "-h") return { help: true, values, flags: new Set() };
    if (booleans.has(key)) {
      values.set(key, true);
      continue;
    }
    if (!valueOptions.includes(key) || !argv[index + 1] || argv[index + 1].startsWith("--")) {
      throw new Error(`Unknown option or missing value: ${key}`);
    }
    values.set(key, argv[++index]);
  }
  return { help: false, values, flags: new Set([...values].filter(([, value]) => value === true).map(([key]) => key)) };
}

export function requiredOption(parsed, name) {
  const value = parsed.values.get(name);
  if (typeof value !== "string" || value.length === 0) throw new Error(`Required option: ${name} <path>`);
  return value;
}

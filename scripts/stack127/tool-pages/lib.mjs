import { existsSync, readFileSync } from "node:fs";
import pg from "pg";

const { Pool } = pg;

export function parseArgs(argv = process.argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const [key, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function requireArg(args, key) {
  const value = args[key];
  if (!value || value === true) throw new Error(`Missing required --${key}`);
  return value;
}

export function readRequiredText(filePath, label) {
  if (!existsSync(filePath)) throw new Error(`${label} file does not exist: ${filePath}`);
  const value = readFileSync(filePath, "utf8").trim();
  if (!value) throw new Error(`${label} must not be empty`);
  return value;
}

function envFileValue(filePath, requestedKey) {
  if (!existsSync(filePath)) return null;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key === requestedKey) return value;
  }

  return null;
}

function resolveDatabaseUrl(args) {
  const environment = args.environment ?? "development";
  if (!["development", "production"].includes(environment)) {
    throw new Error("--environment must be development or production");
  }

  if (args["database-url"]) {
    throw new Error("--database-url is not supported; use .env.local or .env.database");
  }

  if (environment === "production" && args.apply && args.confirm !== "stack127-production") {
    throw new Error("Production writes require --confirm stack127-production");
  }

  const envFile = environment === "production" ? ".env.database" : ".env.local";
  const databaseUrl = envFileValue(envFile, "DATABASE_URL");
  if (!databaseUrl) {
    throw new Error(`DATABASE_URL is required in ${envFile}`);
  }

  if (environment === "development") {
    const productionUrl = envFileValue(".env.database", "DATABASE_URL");
    if (productionUrl && databaseUrl === productionUrl) {
      throw new Error("Refusing development mode because .env.local points to production");
    }
  }

  return databaseUrl;
}

export async function runMutation(args, callback) {
  const pool = new Pool({
    connectionString: resolveDatabaseUrl(args),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 1,
    query_timeout: 60000,
  });
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query(args.apply ? "commit" : "rollback");
    return { ...result, applied: Boolean(args.apply) };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function lockToolPage(client, slug) {
  const result = await client.query(
    `
      select
        page.id,
        page.slug,
        page.is_published,
        page.updated_at,
        tool.title,
        tool.intro_markdown,
        tool.content_markdown,
        tool.content_revision,
        tool.tool_version,
        tool.stack127_repo_url,
        tool.stack127_repo_version,
        tool.stack127_repo_commit_sha
      from public.stack127_pages page
      join public.stack127_tool_pages tool on tool.page_id = page.id
      where page.slug = $1 and page.page_family = 'tool'
      for update of page, tool
    `,
    [slug],
  );

  if (!result.rows[0]) throw new Error(`Tool page not found: ${slug}`);
  return result.rows[0];
}

export function printResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

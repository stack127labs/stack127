#!/usr/bin/env node

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { resolveDatabaseUrl } from "../tool-pages/lib.mjs";

const { Pool } = pg;

export function summarizeUsageRows(rows, environment) {
  const routes = rows.map((row) => ({
    route: `/${row.slug}`,
    status: row.usage_markdown?.trim() ? "authored" : "not-reviewed",
    contentRevision: row.content_revision,
    toolVersion: row.tool_version,
  }));
  return {
    environment,
    total: routes.length,
    authored: routes.filter((row) => row.status === "authored").length,
    notReviewed: routes.filter((row) => row.status === "not-reviewed").length,
    routes,
  };
}

export async function auditUsage(environment = "development") {
  const pool = new Pool({
    connectionString: resolveDatabaseUrl({ environment }),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 1,
    query_timeout: 60000,
  });
  try {
    const result = await pool.query(
      `select page.slug, tool.usage_markdown, tool.content_revision, tool.tool_version
         from public.stack127_pages page
         join public.stack127_tool_pages tool on tool.page_id = page.id
        where page.page_family = 'tool'
        order by page.slug`,
    );
    return summarizeUsageRows(result.rows, environment);
  } finally {
    await pool.end();
  }
}

const direct = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (direct) {
  const environmentArgument = process.argv.find((argument) => argument.startsWith("--environment="));
  const environment = environmentArgument?.split("=")[1] ?? "development";
  if (!["development", "production"].includes(environment)) {
    console.error("--environment must be development or production");
    process.exitCode = 2;
  } else {
    console.log(JSON.stringify(await auditUsage(environment), null, 2));
  }
}

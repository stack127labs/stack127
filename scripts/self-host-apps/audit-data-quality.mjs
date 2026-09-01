#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const riskyDockerPattern = [
  "devcontainer",
  "dev-container",
  "compose\\.dev",
  "docker-compose\\.dev",
  "/test",
  "testing",
  "example",
  "examples",
  "ci",
  "e2e",
  "vendor",
  "\\.github",
].join("|");

const checks = [
  {
    key: "database_unknown",
    where: "published and requires_database is null",
  },
  {
    key: "database_false_non_sqlite",
    where: "published and requires_database = false and cardinality(database_types) > 0 and database_types <> array['sqlite']",
  },
  {
    key: "summary_short",
    where: "published and (array_length(regexp_split_to_array(trim(summary), '\\s+'), 1) < 8 or length(summary) < 50)",
  },
  {
    key: "summary_name_colon",
    where: "published and summary ~ '^[^:]{2,48}:\\\\s+\\\\S'",
  },
  {
    key: "docs_readme_fallback",
    where: "published and docs_url ~* 'github.com/.+#readme'",
  },
  {
    key: "install_docs_readme_fallback",
    where: "published and install_docs_url ~* 'github.com/.+#readme'",
  },
  {
    key: "docker_risky_context",
    where: `published and docker_url ~* '${riskyDockerPattern}'`,
  },
  {
    key: "docker_readme_fallback",
    where: "published and docker_url ~* 'github.com/.+#readme'",
  },
  {
    key: "license_missing",
    where: "published and license is null",
  },
  {
    key: "release_missing",
    where: "published and github_project.latest_release is null",
  },
];

const githubJoin = "left join public.github_projects github_project on github_project.id = self_host_apps.github_project_id";

function exampleSelect(where) {
  return `
    select
      slug,
      name,
      summary,
      requires_database,
      database_types,
      docs_url,
      install_docs_url,
      docker_url,
      license,
      coalesce(github_project.latest_release, self_host_apps.source_latest_release, self_host_apps.github_latest_release) as github_latest_release
    from public.self_host_apps
    ${githubJoin}
    where self_hosting_status = 'self_hostable'
      and (${where})
    order by slug
    limit $1
  `;
}

function printText(result) {
  console.log(`Published apps: ${result.published}`);
  console.log("");
  console.log("High-risk checks:");

  for (const check of result.checks) {
    console.log(`- ${check.key}: ${check.count}`);
  }

  console.log("");
  console.log("Example queue:");

  for (const check of result.checks) {
    if (check.examples.length === 0) continue;

    console.log(`\n${check.key}`);
    for (const example of check.examples) {
      console.log(`- ${example.slug}: ${example.summary}`);
    }
  }
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 10);

  const result = await withClient(async (client) => {
    const published = await client.query(
      "select count(*)::int as count from public.self_host_apps where published and self_hosting_status = 'self_hostable'",
    );

    const rows = [];

    for (const check of checks) {
      const count = await client.query(
        `select count(*)::int as count from public.self_host_apps ${githubJoin} where self_hosting_status = 'self_hostable' and (${check.where})`,
      );
      const examples = await client.query(exampleSelect(check.where), [limit]);

      rows.push({
        key: check.key,
        count: count.rows[0].count,
        examples: examples.rows,
      });
    }

    return {
      published: published.rows[0].count,
      checks: rows,
    };
  }, args["database-url"]);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printText(result);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

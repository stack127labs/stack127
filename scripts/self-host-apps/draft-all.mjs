#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

async function main() {
  const args = parseArgs();

  await withClient(async (client) => {
    await client.query("begin");

    const before = await client.query(
      "select count(*)::int total, count(*) filter (where published)::int published from public.self_host_apps",
    );

    await client.query("update public.self_host_apps set published = false, updated_at = now()");

    const after = await client.query(
      "select count(*)::int total, count(*) filter (where published)::int published from public.self_host_apps",
    );

    if (args["dry-run"]) {
      await client.query("rollback");
    } else {
      await client.query("commit");
    }

    console.log(
      JSON.stringify(
        {
          mode: args["dry-run"] ? "dry-run" : "write",
          before: before.rows[0],
          after: after.rows[0],
        },
        null,
        2,
      ),
    );
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

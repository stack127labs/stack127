import {
  lockToolPage,
  parseArgs,
  printResult,
  requireArg,
  runMutation,
} from "./lib.mjs";

const args = parseArgs();
const slug = requireArg(args, "slug");
const version = requireArg(args, "version");

if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error("--version must be a semantic version without a leading v");
}

const result = await runMutation(args, async (client) => {
  const page = await lockToolPage(client, slug);
  if (page.tool_version === version) {
    return { slug, changed: false, tool_version: version };
  }

  await client.query(
    `
      update public.stack127_tool_pages
      set
        tool_version = $2,
        tool_version_updated_at = now()
      where page_id = $1
    `,
    [page.id, version],
  );

  return {
    slug,
    changed: true,
    tool_version_before: page.tool_version,
    tool_version_after: version,
  };
});

printResult(result);

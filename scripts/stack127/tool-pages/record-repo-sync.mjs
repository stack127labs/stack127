import {
  lockToolPage,
  parseArgs,
  printResult,
  requireArg,
  runMutation,
} from "./lib.mjs";

const args = parseArgs();
const slug = requireArg(args, "slug");
const repoUrl = requireArg(args, "repo-url").replace(/\/$/, "");
const repoVersion = requireArg(args, "repo-version");
const commitSha = requireArg(args, "commit-sha").toLowerCase();

if (!/^https:\/\/github\.com\/stack127labs\/[A-Za-z0-9._-]+$/.test(repoUrl)) {
  throw new Error("--repo-url must identify a repository in the stack127labs GitHub organization");
}
if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(commitSha)) {
  throw new Error("--commit-sha must be a full 40- or 64-character hexadecimal commit SHA");
}

const result = await runMutation(args, async (client) => {
  const page = await lockToolPage(client, slug);

  await client.query(
    `
      update public.stack127_tool_pages
      set
        stack127_repo_url = $2,
        stack127_repo_version = $3,
        stack127_repo_commit_sha = $4,
        stack127_repo_synced_at = now()
      where page_id = $1
    `,
    [page.id, repoUrl, repoVersion, commitSha],
  );

  return {
    slug,
    changed: true,
    stack127_repo_url: repoUrl,
    stack127_repo_version: repoVersion,
    stack127_repo_commit_sha: commitSha,
  };
});

printResult(result);

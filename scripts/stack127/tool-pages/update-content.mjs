import {
  lockToolPage,
  parseArgs,
  printResult,
  readRequiredText,
  requireArg,
  runMutation,
} from "./lib.mjs";

const args = parseArgs();
const slug = requireArg(args, "slug");
const introMarkdown = readRequiredText(requireArg(args, "intro-file"), "Introduction Markdown");
const contentMarkdown = readRequiredText(requireArg(args, "content-file"), "Content Markdown");
const requestedTitle = args.title === true ? null : args.title;

const result = await runMutation(args, async (client) => {
  const page = await lockToolPage(client, slug);
  const title = requestedTitle?.trim() || page.title;
  const changed = title !== page.title
    || introMarkdown !== page.intro_markdown
    || contentMarkdown !== page.content_markdown;

  if (!changed) {
    return {
      slug,
      changed: false,
      content_revision: page.content_revision,
      tool_version: page.tool_version,
    };
  }

  const updated = await client.query(
    `
      update public.stack127_tool_pages
      set
        title = $2,
        intro_markdown = $3,
        content_markdown = $4,
        content_revision = content_revision + 1
      where page_id = $1
      returning content_revision, tool_version
    `,
    [page.id, title, introMarkdown, contentMarkdown],
  );

  return {
    slug,
    changed: true,
    content_revision_before: page.content_revision,
    content_revision_after: updated.rows[0].content_revision,
    tool_version: updated.rows[0].tool_version,
  };
});

printResult(result);

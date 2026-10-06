import {
  lockToolPage,
  parseArgs,
  printResult,
  readRequiredText,
  requireArg,
  runMutation,
} from "./lib.mjs";
import { validateToolMarkdown } from "./validate-markdown.mjs";

const args = parseArgs();
const slug = requireArg(args, "slug");
const introMarkdown = readRequiredText(requireArg(args, "intro-file"), "Introduction Markdown");
const contentMarkdown = readRequiredText(requireArg(args, "content-file"), "Content Markdown");
const usageFile = args["usage-file"] === true ? requireArg(args, "usage-file") : args["usage-file"];
const usageMarkdown = usageFile
  ? readRequiredText(usageFile, "Usage Markdown")
  : null;
const metaTitle = args["meta-title"] === undefined ? null : requireArg(args, "meta-title").trim();
const metaDescription = args["meta-description"] === undefined ? null : requireArg(args, "meta-description").trim();
if ((metaTitle === null) !== (metaDescription === null)) {
  throw new Error("Pass --meta-title and --meta-description together");
}
if (metaTitle !== null && (!metaTitle || !metaDescription)) {
  throw new Error("SEO title and description must not be empty");
}
const requestedTitle = args.title === true ? null : args.title;

validateToolMarkdown({
  intro_markdown: introMarkdown,
  usage_markdown: usageMarkdown ?? "",
  content_markdown: contentMarkdown,
});

const result = await runMutation(args, async (client) => {
  const page = await lockToolPage(client, slug);
  const title = requestedTitle?.trim() || page.title;
  const contentChanged = title !== page.title
    || introMarkdown !== page.intro_markdown
    || (usageMarkdown !== null && usageMarkdown !== page.usage_markdown)
    || contentMarkdown !== page.content_markdown;
  const metadataChanged = metaTitle !== null && (metaTitle !== page.meta_title || metaDescription !== page.meta_description);
  const changed = contentChanged || metadataChanged;

  if (!changed) {
    return {
      slug,
      changed: false,
      tool_version: page.tool_version,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
    };
  }

  if (contentChanged) {
    await client.query(
      usageMarkdown === null
        ? `update public.stack127_tool_pages set title = $2, intro_markdown = $3, content_markdown = $4 where page_id = $1`
        : `update public.stack127_tool_pages set title = $2, intro_markdown = $3, usage_markdown = $4, content_markdown = $5 where page_id = $1`,
      usageMarkdown === null
        ? [page.id, title, introMarkdown, contentMarkdown]
        : [page.id, title, introMarkdown, usageMarkdown, contentMarkdown],
    );
  }
  if (metadataChanged) {
    await client.query(`
      update public.stack127_pages
      set meta_title = $2,
          meta_description = $3,
          updated_at = case when is_published then now() else null end
      where id = $1
    `, [page.id, metaTitle, metaDescription]);
  }

  return {
    slug,
    changed: true,
    content_changed: contentChanged,
    metadata_changed: metadataChanged,
    tool_version: page.tool_version,
    meta_title: metaTitle ?? page.meta_title,
    meta_description: metaDescription ?? page.meta_description,
  };
});

printResult(result);

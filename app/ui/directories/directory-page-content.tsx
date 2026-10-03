import { Fragment } from "react";
import type { Components } from "react-markdown";
import { ContentMarkdown } from "../content-markdown";
import { directoryContentSection, directoryTitleParts } from "@/lib/directory-page-content";
import type { Stack127DirectoryPage } from "@/lib/directory-pages";

export function DirectoryPageTitle({ title }: { title: string }) {
  return directoryTitleParts(title).map((part, index) => part.marked
    ? <mark key={index}>{part.text}</mark>
    : <Fragment key={index}>{part.text}</Fragment>);
}

export function DirectoryPageContent({ page, section, components }: { page: Stack127DirectoryPage; section?: string; components?: Components }) {
  const markdown = section ? directoryContentSection(page.content_markdown, section) : page.content_markdown;
  return markdown ? <ContentMarkdown markdown={markdown} components={components} /> : null;
}

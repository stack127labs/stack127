/** Named Markdown sections keep prose beside the records it explains. */
export function directoryContentSection(markdown: string | null, section: string) {
  if (!markdown) return "";
  const sections = markdown.split(/^<!-- section:([a-z0-9-]+) -->\s*$/m);
  for (let index = 1; index < sections.length; index += 2) {
    if (sections[index] === section) return sections[index + 1].trim();
  }
  throw new Error(`Directory content section is missing: ${section}`);
}

export function directoryTitleParts(title: string) {
  return title.split(/(<mark>[\s\S]*?<\/mark>)/g).filter(Boolean).map(text => ({
    text: text.replace(/^<mark>|<\/mark>$/g, ""),
    marked: text.startsWith("<mark>"),
  }));
}

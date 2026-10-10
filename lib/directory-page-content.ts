export function directoryTitleParts(title: string) {
  return title.split(/(<mark>[\s\S]*?<\/mark>)/g).filter(Boolean).map(text => ({
    text: text.replace(/^<mark>|<\/mark>$/g, ""),
    marked: text.startsWith("<mark>"),
  }));
}

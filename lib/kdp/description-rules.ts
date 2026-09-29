export const KDP_DESCRIPTION_LIMIT = 4_000;
export const KDP_DESCRIPTION_TAGS = ["br", "p", "b", "em", "i", "u", "h4", "h5", "h6", "ol", "ul", "li"] as const;

const supportedTags = new Set<string>(KDP_DESCRIPTION_TAGS);
const voidTags = new Set(["br"]);

export function isKdpDescriptionTag(name: string): boolean {
  return supportedTags.has(name);
}

export function isKdpDescriptionVoidTag(name: string): boolean {
  return voidTags.has(name);
}
